import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    
    // Get query parameters for pagination
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '100';
    
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
      return NextResponse.json({ articles: [] });
    }

    // Convert articles to sitemap format
    const articles = data.docs.map((article: { slug: string; updatedAt?: string; publishedAt: string }) => ({
      url: `${baseUrl}/article/${article.slug}`,
      lastModified: new Date(article.updatedAt || article.publishedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

    return NextResponse.json({ articles });
  } catch (error) {
    console.error('Error generating article sitemap:', error);
    return NextResponse.json(
      { error: 'Failed to generate article sitemap' },
      { status: 500 }
    );
  }
} 