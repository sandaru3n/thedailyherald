import { NextRequest, NextResponse } from 'next/server';

interface Article {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author: {
    _id: string;
    name: string;
  };
  category: {
    _id: string;
    name: string;
    slug: string;
  };
  featuredImage?: string;
  imageUrl?: string;
  publishedAt: string;
  isFeatured?: boolean;
  tags?: string[];
  views?: number;
  status: string;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
}

interface SiteConfig {
  title: string;
  description: string;
  url: string;
  language: string;
  image: {
    url: string;
    title: string;
    width: number;
    height: number;
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ category: string }> }
) {
  const { category: categorySlug } = await params;
  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    
    // Fetch category details
    const categoriesResponse = await fetch(`${API_BASE_URL}/api/categories`);
    const categoriesData = await categoriesResponse.json();
    const categories: Category[] = Array.isArray(categoriesData) ? categoriesData : (categoriesData.categories || []);
    
    const category = categories.find(cat => cat.slug === categorySlug);
    if (!category) {
      return new NextResponse('Category not found', { status: 404 });
    }
    
    // Fetch published articles for this category
    const articlesResponse = await fetch(`${API_BASE_URL}/api/articles?status=published&category=${categorySlug}&limit=50&sort=-publishedAt`);
    const articlesData = await articlesResponse.json();
    
    if (!articlesData.success) {
      throw new Error('Failed to fetch articles');
    }
    
    const articles: Article[] = articlesData.docs || [];
    
    // Site configuration
    const siteConfig: SiteConfig = {
      title: `${category.name} - The Daily Herald`,
      description: category.description || `Latest ${category.name} news and updates from The Daily Herald`,
      url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      language: 'en-US',
      image: {
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/logo.png`,
        title: 'The Daily Herald',
        width: 32,
        height: 32
      }
    };
    
    // Generate RSS XML
    const rssXml = generateCategoryRSSFeed(articles, category, categories, siteConfig);
    
    return new NextResponse(rssXml, {
      status: 200,
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=300, s-maxage=600'
      }
    });
  } catch (error) {
    console.error('Error generating category RSS feed:', error);
    return new NextResponse('Error generating RSS feed', { status: 500 });
  }
}

function generateCategoryRSSFeed(articles: Article[], category: Category, allCategories: Category[], siteConfig: SiteConfig): string {
  const now = new Date();
  const lastBuildDate = now.toUTCString();
  
  // Helper function to escape XML content
  const escapeXml = (text: string): string => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };
  
  // Helper function to format date for RSS
  const formatRSSDate = (date: string): string => {
    return new Date(date).toUTCString();
  };
  
  // Helper function to generate category tags
  const generateCategoryTags = (article: Article, categories: Category[]): string => {
    const tags: string[] = [];
    
    // Add main category
    if (article.category?.name) {
      tags.push(`<category><![CDATA[${article.category.name}]]></category>`);
    }
    
    // Add article tags if available
    if (article.tags && article.tags.length > 0) {
      article.tags.forEach(tag => {
        tags.push(`<category><![CDATA[${tag}]]></category>`);
      });
    }
    
    // Add related categories based on content keywords
    const contentLower = article.content.toLowerCase();
    const titleLower = article.title.toLowerCase();
    
    categories.forEach(cat => {
      if (cat.name.toLowerCase() !== article.category?.name?.toLowerCase()) {
        const categoryNameLower = cat.name.toLowerCase();
        if (contentLower.includes(categoryNameLower) || titleLower.includes(categoryNameLower)) {
          tags.push(`<category><![CDATA[${cat.name}]]></category>`);
        }
      }
    });
    
    return tags.join('\n\t\t');
  };
  
  // Generate RSS items
  const rssItems = articles.map(article => {
    const authorName = typeof article.author === 'string' ? article.author : article.author?.name || 'Unknown Author';
    const categoryTags = generateCategoryTags(article, allCategories);
    const articleUrl = `${siteConfig.url}/article/${article.slug}`;
    const commentsUrl = `${articleUrl}#comments`;
    const commentRssUrl = `${articleUrl}/feed/`;
    
    // Clean content for RSS (remove HTML tags from excerpt)
    const cleanExcerpt = article.excerpt.replace(/<[^>]*>/g, '');
    const cleanContent = article.content.replace(/<[^>]*>/g, '');
    
    return `	<item>
		<title>${escapeXml(article.title)}</title>
		<link>${articleUrl}</link>
		<comments>${commentsUrl}</comments>
		
		<dc:creator><![CDATA[${authorName}]]></dc:creator>
		<pubDate>${formatRSSDate(article.publishedAt)}</pubDate>
		${categoryTags}
		<guid isPermaLink="false">${articleUrl}</guid>

		<description><![CDATA[${cleanExcerpt} <p class="read-more-container"><a title="${escapeXml(article.title)}" class="read-more button" href="${articleUrl}" aria-label="Read more about ${escapeXml(article.title)}">Read more</a></p>]]></description>
		<content:encoded><![CDATA[${cleanContent}]]></content:encoded>
		
		<wfw:commentRss>${commentRssUrl}</wfw:commentRss>
		<slash:comments>0</slash:comments>
		
		
		</item>`;
  }).join('\n');
  
  // Generate the complete RSS feed
  const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
	xmlns:content="http://purl.org/rss/1.0/modules/content/"
	xmlns:wfw="http://wellformedweb.org/CommentAPI/"
	xmlns:dc="http://purl.org/dc/elements/1.1/"
	xmlns:atom="http://www.w3.org/2005/Atom"
	xmlns:sy="http://purl.org/rss/1.0/modules/syndication/"
	xmlns:slash="http://purl.org/rss/1.0/modules/slash/"
	>

<channel>
	<title>${siteConfig.title}</title>
	<atom:link href="${siteConfig.url}/feed/category/${category.slug}/" rel="self" type="application/rss+xml" />
	<link>${siteConfig.url}/category/${category.slug}</link>
	<description>${siteConfig.description}</description>
	<lastBuildDate>${lastBuildDate}</lastBuildDate>
	<language>${siteConfig.language}</language>
	<sy:updatePeriod>
hourly	</sy:updatePeriod>
	<sy:updateFrequency>
1	</sy:updateFrequency>
	<generator>https://thedailyherald.com/?v=1.0.0</generator>

<image>
	<url>${siteConfig.image.url}</url>
	<title>${siteConfig.image.title}</title>
	<link>${siteConfig.url}/category/${category.slug}</link>
	<width>${siteConfig.image.width}</width>
	<height>${siteConfig.image.height}</height>
</image> 
${rssItems}
</channel>
</rss>`;

  return rssFeed;
} 