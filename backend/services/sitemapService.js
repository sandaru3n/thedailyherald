const https = require('https');
const http = require('http');

class SitemapService {
  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    this.apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  }

  /**
   * Make HTTP request using built-in modules
   */
  async makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const isHttps = urlObj.protocol === 'https:';
      const client = isHttps ? https : http;
      
      const requestOptions = {
        hostname: urlObj.hostname,
        port: urlObj.port || (isHttps ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: options.method || 'GET',
        headers: {
          'User-Agent': 'SitemapService/1.0',
          'Cache-Control': 'no-cache',
          ...options.headers
        }
      };

      const req = client.request(requestOptions, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            text: () => Promise.resolve(data),
            json: () => Promise.resolve(JSON.parse(data))
          });
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.setTimeout(30000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.end();
    });
  }

  /**
   * Trigger sitemap update for a specific article
   * @param {Object} article - The article object
   * @param {string} action - The action performed (create, publish, update, delete)
   */
  async triggerSitemapUpdate(article, action = 'update') {
    try {
      console.log(`🔄 Triggering sitemap update for article: "${article.title}" (${action})`);
      
      // Call the refresh endpoint for immediate update
      await this.refreshSitemap();
      
      console.log(`✅ Sitemap updated successfully for article: "${article.title}"`);
      
    } catch (error) {
      console.error(`❌ Error updating sitemap for article "${article.title}":`, error.message);
      // Don't throw error to avoid breaking the main flow
    }
  }

  /**
   * Refresh sitemap using the refresh endpoint
   */
  async refreshSitemap() {
    try {
      console.log('🔄 Calling sitemap refresh endpoint...');
      
      const response = await this.makeRequest(`${this.baseUrl}/api/sitemap/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Sitemap refresh endpoint called successfully:', result.message);
      } else {
        console.warn('⚠️  Sitemap refresh endpoint failed:', response.status);
        // Fallback to direct sitemap access
        await this.updateMainSitemap();
      }
    } catch (error) {
      console.error('❌ Error calling sitemap refresh endpoint:', error.message);
      // Fallback to direct sitemap access
      await this.updateMainSitemap();
    }
  }

  /**
   * Update the main sitemap (fallback method)
   */
  async updateMainSitemap() {
    try {
      const response = await this.makeRequest(`${this.baseUrl}/sitemap.xml`);

      if (response.ok) {
        console.log('✅ Main sitemap updated successfully');
      } else {
        console.warn('⚠️  Main sitemap update failed:', response.status);
      }
    } catch (error) {
      console.error('❌ Error updating main sitemap:', error.message);
    }
  }

  /**
   * Update the article sitemap
   */
  async updateArticleSitemap() {
    try {
      const response = await this.makeRequest(`${this.baseUrl}/api/sitemap/articles`);

      if (response.ok) {
        console.log('✅ Article sitemap updated successfully');
      } else {
        console.warn('⚠️  Article sitemap update failed:', response.status);
      }
    } catch (error) {
      console.error('❌ Error updating article sitemap:', error.message);
    }
  }

  /**
   * Get all published articles for sitemap
   */
  async getAllPublishedArticles() {
    try {
      const response = await this.makeRequest(`${this.apiUrl}/api/articles/sitemap?limit=1000`);

      if (response.ok) {
        const data = await response.json();
        return data.docs || [];
      } else {
        console.warn('⚠️  Failed to fetch published articles for sitemap');
        return [];
      }
    } catch (error) {
      console.error('❌ Error fetching published articles:', error.message);
      return [];
    }
  }

  /**
   * Validate sitemap structure
   */
  async validateSitemap() {
    try {
      console.log('🔍 Validating sitemap structure...');
      
      // Check main sitemap
      const mainSitemapResponse = await this.makeRequest(`${this.baseUrl}/sitemap.xml`);
      if (!mainSitemapResponse.ok) {
        console.error('❌ Main sitemap not accessible');
        return false;
      }
      
      const mainSitemapText = await mainSitemapResponse.text();
      const hasArticles = mainSitemapText.includes('/article/');
      
      if (!hasArticles) {
        console.warn('⚠️  No articles found in main sitemap');
      } else {
        const articleMatches = mainSitemapText.match(/\/article\/[^<]+/g);
        const articleCount = articleMatches ? articleMatches.length : 0;
        console.log(`📊 Found ${articleCount} articles in main sitemap`);
      }
      
      // Check article sitemap
      const articleSitemapResponse = await this.makeRequest(`${this.baseUrl}/api/sitemap/articles`);
      if (!articleSitemapResponse.ok) {
        console.error('❌ Article sitemap not accessible');
        return false;
      }
      
      const articleSitemapText = await articleSitemapResponse.text();
      if (!articleSitemapText.includes('<?xml version="1.0"')) {
        console.error('❌ Article sitemap not in proper XML format');
        return false;
      }
      
      console.log('✅ Sitemap validation completed successfully');
      return true;
      
    } catch (error) {
      console.error('❌ Error validating sitemap:', error.message);
      return false;
    }
  }

  /**
   * Force refresh all sitemaps
   */
  async forceRefreshSitemaps() {
    try {
      console.log('🔄 Force refreshing all sitemaps...');
      
      await this.refreshSitemap();
      await this.updateArticleSitemap();
      
      // Validate after refresh
      await this.validateSitemap();
      
      console.log('✅ All sitemaps refreshed successfully');
      
    } catch (error) {
      console.error('❌ Error force refreshing sitemaps:', error.message);
    }
  }
}

// Create singleton instance
const sitemapService = new SitemapService();

module.exports = sitemapService;
