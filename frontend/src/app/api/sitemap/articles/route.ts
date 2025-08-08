import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    
    // Get query parameters for pagination
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '500'; // Increased limit for better coverage
    
    // Fetch articles with timeout using optimized sitemap endpoint
    const response = await fetch(
      `${API_BASE_URL}/api/articles/sitemap?page=${page}&limit=${limit}`,
      {
        signal: AbortSignal.timeout(30000), // 30 second timeout
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch articles');
    }

    const data = await response.json();
    
    if (!data.success || !data.docs) {
      // Return empty XML sitemap
      const emptySitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`;
      
      return new NextResponse(emptySitemap, {
        headers: {
          'Content-Type': 'application/xml',
          'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        }
      });
    }

    // Generate XML sitemap
    const xmlSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${data.docs.map((article: { slug: string; updatedAt?: string; publishedAt: string }) => {
  const lastModified = new Date(article.updatedAt || article.publishedAt).toISOString();
  return `  <url>
    <loc>${baseUrl}/article/${article.slug}</loc>
    <lastmod>${lastModified}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
}).join('\n')}
</urlset>`;

    return new NextResponse(xmlSitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Cache for 1 hour
      }
    });
  } catch (error) {
    console.error('Error generating article sitemap:', error);
    
    // Return error XML sitemap
    const errorSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`;
    
    return new NextResponse(errorSitemap, {
      status: 500,
      headers: {
        'Content-Type': 'application/xml',
      }
    });
  }
} 