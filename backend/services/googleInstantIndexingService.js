const { google } = require('googleapis');
const Settings = require('../models/Settings');

class GoogleInstantIndexingService {
  constructor() {
    this.indexingApi = null;
    this.isInitialized = false;
  }

  /**
   * Initialize the Google Indexing API client
   */
  async initialize() {
    try {
      const settings = await Settings.getSettings();
      
      if (!settings.googleInstantIndexing?.enabled) {
        console.log('Google Instant Indexing is not enabled');
        return false;
      }

      if (!settings.googleInstantIndexing?.serviceAccountJson) {
        console.log('Google Instant Indexing service account JSON is not configured');
        return false;
      }

      // Parse the service account JSON
      let serviceAccount;
      try {
        serviceAccount = JSON.parse(settings.googleInstantIndexing.serviceAccountJson);
      } catch (error) {
        console.error('Invalid service account JSON format:', error);
        return false;
      }

      // Validate required fields
      if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
        console.error('Service account JSON is missing required fields');
        return false;
      }

      // Create auth client
      const auth = new google.auth.GoogleAuth({
        credentials: serviceAccount,
        scopes: ['https://www.googleapis.com/auth/indexing']
      });

      // Create the indexing API client
      this.indexingApi = google.indexing('v3');
      this.auth = auth;
      this.isInitialized = true;

      console.log('Google Instant Indexing API initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize Google Instant Indexing API:', error);
      return false;
    }
  }

  /**
   * Submit a URL for instant indexing
   * @param {string} url - The URL to submit for indexing
   * @param {string} type - The type of submission ('URL_UPDATED' or 'URL_DELETED')
   * @returns {Promise<Object>} - The API response
   */
  async submitUrl(url, type = 'URL_UPDATED') {
    try {
      if (!this.isInitialized) {
        const initialized = await this.initialize();
        if (!initialized) {
          throw new Error('Google Instant Indexing API is not properly configured');
        }
      }

      // Validate URL format
      try {
        new URL(url);
      } catch (error) {
        return {
          success: false,
          error: 'Invalid URL format',
          details: 'The provided URL is not in a valid format'
        };
      }

      const authClient = await this.auth.getClient();
      
      const response = await this.indexingApi.urlNotifications.publish({
        auth: authClient,
        requestBody: {
          url: url,
          type: type
        }
      });

      console.log(`Successfully submitted URL for indexing: ${url}`);
      
      // Update stats for successful submission
      await this.updateStats(1);
      
      return {
        success: true,
        data: response.data,
        url: url,
        type: type
      };
    } catch (error) {
      console.error('Error submitting URL for indexing:', error);
      
      // Handle specific API errors
      if (error.code === 403) {
        return {
          success: false,
          error: 'Access denied. Please check your service account permissions and ensure the Indexing API is enabled.',
          details: error.message
        };
      } else if (error.code === 400) {
        return {
          success: false,
          error: 'Invalid request. Please check the URL format and ensure it\'s accessible.',
          details: error.message
        };
      } else if (error.code === 429) {
        return {
          success: false,
          error: 'Rate limit exceeded. Please wait before submitting more URLs.',
          details: error.message
        };
      } else if (error.code === 401) {
        return {
          success: false,
          error: 'Authentication failed. Please check your service account credentials.',
          details: error.message
        };
      }

      return {
        success: false,
        error: 'Failed to submit URL for indexing',
        details: error.message
      };
    }
  }

  /**
   * Submit multiple URLs for instant indexing
   * @param {Array<string>} urls - Array of URLs to submit
   * @param {string} type - The type of submission
   * @returns {Promise<Array>} - Array of results for each URL
   */
  async submitUrls(urls, type = 'URL_UPDATED') {
    const results = [];
    
    for (const url of urls) {
      try {
        const result = await this.submitUrl(url, type);
        results.push(result);
        
        // Add a small delay between requests to avoid rate limiting
        if (urls.length > 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        results.push({
          success: false,
          error: 'Failed to submit URL',
          details: error.message,
          url: url
        });
      }
    }

    return results;
  }

  /**
   * Test the Google Instant Indexing configuration
   * @returns {Promise<Object>} - Test result
   */
  async testConfiguration() {
    try {
      const settings = await Settings.getSettings();
      
      if (!settings.googleInstantIndexing?.enabled) {
        return {
          success: false,
          error: 'Google Instant Indexing is not enabled'
        };
      }

      if (!settings.googleInstantIndexing?.serviceAccountJson) {
        return {
          success: false,
          error: 'Service account JSON is not configured'
        };
      }

      // Test parsing the JSON
      let serviceAccount;
      try {
        serviceAccount = JSON.parse(settings.googleInstantIndexing.serviceAccountJson);
      } catch (error) {
        return {
          success: false,
          error: 'Invalid service account JSON format'
        };
      }
      
      // Validate required fields
      if (!serviceAccount.project_id) {
        return {
          success: false,
          error: 'Service account JSON is missing project_id field'
        };
      }
      
      if (!serviceAccount.private_key) {
        return {
          success: false,
          error: 'Service account JSON is missing private_key field'
        };
      }
      
      if (!serviceAccount.client_email) {
        return {
          success: false,
          error: 'Service account JSON is missing client_email field'
        };
      }

      // Test API initialization
      const initialized = await this.initialize();
      if (!initialized) {
        return {
          success: false,
          error: 'Failed to initialize Google API client. Please check your credentials.'
        };
      }

      // Test with a real API call to verify authentication
      try {
        const authClient = await this.auth.getClient();
        
        // Use environment variable for site URL, fallback to settings, then to localhost
        const siteUrl = process.env.SITE_URL || settings.siteUrl || 'http://localhost:3000';
        const testUrl = `${siteUrl}/test-indexing-${Date.now()}`;
        
        // Make a test request to the Indexing API
        const testResponse = await this.indexingApi.urlNotifications.publish({
          auth: authClient,
          requestBody: {
            url: testUrl,
            type: 'URL_UPDATED'
          }
        });

        // If we get here, the API is working
        return {
          success: true,
          message: 'Configuration is valid. API connection successful.',
          details: 'Successfully authenticated with Google Indexing API'
        };
      } catch (apiError) {
        // Handle specific API errors
        if (apiError.code === 403) {
          return {
            success: false,
            error: 'Access denied. Please check your service account permissions and ensure the Indexing API is enabled.',
            details: apiError.message
          };
        } else if (apiError.code === 401) {
          return {
            success: false,
            error: 'Authentication failed. Please check your service account credentials.',
            details: apiError.message
          };
        } else if (apiError.code === 400) {
          // 400 error for invalid URL is expected, but means API is working
          return {
            success: true,
            message: 'Configuration is valid. API connection successful.',
            details: 'API responded (expected error for test URL)'
          };
        } else {
          return {
            success: false,
            error: 'API test failed',
            details: apiError.message
          };
        }
      }
    } catch (error) {
      return {
        success: false,
        error: 'Configuration test failed',
        details: error.message
      };
    }
  }

  /**
   * Update indexing statistics
   * @param {number} count - Number of URLs indexed
   */
  async updateStats(count = 1) {
    try {
      const settings = await Settings.getSettings();
      
      if (!settings.googleInstantIndexing) {
        settings.googleInstantIndexing = {
          enabled: false,
          serviceAccountJson: '',
          projectId: '',
          totalIndexed: 0
        };
      }
      
      settings.googleInstantIndexing.lastIndexedAt = new Date();
      settings.googleInstantIndexing.totalIndexed = (settings.googleInstantIndexing.totalIndexed || 0) + count;
      await settings.save();
    } catch (error) {
      console.error('Failed to update indexing stats:', error);
    }
  }

  /**
   * Get indexing statistics
   * @returns {Promise<Object>} - Statistics
   */
  async getStats() {
    try {
      const settings = await Settings.getSettings();
      
      if (!settings.googleInstantIndexing) {
        return {
          enabled: false,
          lastIndexedAt: null,
          totalIndexed: 0,
          projectId: null
        };
      }
      
      return {
        enabled: settings.googleInstantIndexing.enabled || false,
        lastIndexedAt: settings.googleInstantIndexing.lastIndexedAt,
        totalIndexed: settings.googleInstantIndexing.totalIndexed || 0,
        projectId: settings.googleInstantIndexing.projectId
      };
    } catch (error) {
      console.error('Failed to get indexing stats:', error);
      return {
        enabled: false,
        lastIndexedAt: null,
        totalIndexed: 0,
        projectId: null
      };
    }
  }
}

module.exports = new GoogleInstantIndexingService(); 