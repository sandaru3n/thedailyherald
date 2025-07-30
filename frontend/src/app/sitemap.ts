import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  
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

  // For articles, we'll use a more efficient approach
  // Instead of fetching all articles during build time,
  // we'll create a dynamic sitemap that can be generated on-demand
  // or use a smaller subset for the main sitemap
  
  let articlePages: MetadataRoute.Sitemap = [];
  
  // Only try to fetch articles if we're not in a build environment
  // or if we have a specific environment variable to enable it
  if (process.env.ENABLE_SITEMAP_ARTICLES === 'true') {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}/api/articles?status=published&limit=50&sort=-publishedAt`, {
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(30000), // 30 second timeout
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.docs) {
          articlePages = data.docs.map((article: { slug: string; updatedAt?: string; publishedAt: string }) => ({
            url: `${baseUrl}/article/${article.slug}`,
            lastModified: new Date(article.updatedAt || article.publishedAt),
            changeFrequency: 'weekly' as const,
            priority: 0.6,
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching articles for sitemap:', error);
      // Don't fail the build if articles can't be fetched
    }
  }

  return [
    ...staticPages,
    ...rssFeeds,
    ...categoryPages,
    ...articlePages,
  ];
} 