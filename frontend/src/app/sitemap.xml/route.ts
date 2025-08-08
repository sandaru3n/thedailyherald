import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  
  console.log('🔄 Generating dynamic sitemap...');
  
  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
  ];

  // RSS feeds
  const rssFeeds = [
    {
      url: `${baseUrl}/feed/`,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/feed/category/politics/`,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/feed/category/technology/`,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/feed/category/sports/`,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/feed/category/business/`,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/feed/category/health/`,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/feed/category/world/`,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/feed/category/entertainment/`,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 0.8,
    },
  ];

  // Category pages
  const categories = [
    'politics',
    'technology', 
    'sports',
    'business',
    'health',
    'world',
    'entertainment'
  ];

  const categoryPages = categories.map(category => ({
    url: `${baseUrl}/category/${category}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }));

  // Fetch ALL published articles for sitemap (no limit)
  let articlePages: Array<{
    url: string;
    lastModified: Date;
    changeFrequency: 'weekly';
    priority: number;
  }> = [];
  
  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    
    console.log(`🔍 Fetching articles from: ${API_BASE_URL}/api/articles/sitemap?limit=10000`);
    
    // Fetch all published articles with a high limit to get all articles
    const response = await fetch(`${API_BASE_URL}/api/articles/sitemap?limit=10000`, {
      signal: AbortSignal.timeout(60000), // 60 second timeout for large datasets
      next: { revalidate: 300 }, // Cache for 5 minutes
    });
    
    if (response.ok) {
      const data = await response.json();
      
      if (data.success && data.docs) {
        console.log(`📊 Including ${data.docs.length} articles in main sitemap`);
        
        articlePages = data.docs.map((article: { slug: string; updatedAt?: string; publishedAt: string }) => ({
          url: `${baseUrl}/article/${article.slug}`,
          lastModified: new Date(article.updatedAt || article.publishedAt),
          changeFrequency: 'weekly' as const,
          priority: 0.6,
        }));
        
        console.log(`✅ Successfully processed ${articlePages.length} articles for sitemap`);
      } else {
        console.warn('⚠️  No articles data found in response');
      }
    } else {
      console.error(`❌ Failed to fetch articles: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error('❌ Error fetching articles for sitemap:', error);
    // Don't fail the build if articles can't be fetched
    // The sitemap will still work with static pages, categories, and RSS feeds
  }

  const allPages = [...staticPages, ...rssFeeds, ...categoryPages, ...articlePages];
  const totalUrls = allPages.length;
  console.log(`🎉 Sitemap generated with ${totalUrls} total URLs (${articlePages.length} articles)`);

  // Generate XML sitemap
  const xmlSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastModified.toISOString()}</lastmod>
    <changefreq>${page.changeFrequency}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new NextResponse(xmlSitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=300, s-maxage=300', // 5 minutes cache
    },
  });
}
