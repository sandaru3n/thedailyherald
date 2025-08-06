import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Article } from '@/types/news';
import ArticleContent from '@/components/ArticleContent';
import ArticleSkeleton from '@/components/ArticleSkeleton';
import PerformanceMonitor from '@/components/PerformanceMonitor';
import MobileLCPOptimizer from '@/components/MobileLCPOptimizer';
import { generatePageMetadata } from '@/lib/metadata';
import { getSiteSettings } from '@/lib/settings';

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  try {
    const { slug } = await params;
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/articles/slug/${slug}`, {
      next: { revalidate: 60 }, // Cache for 1 minute
    });
    
    if (!res.ok) {
      return generatePageMetadata(
        'Article Not Found',
        'The article you are looking for does not exist.',
        `/article/${slug}`
      );
    }

    const data = await res.json();
    const article = data.article;

    if (!article) {
      return generatePageMetadata(
        'Article Not Found',
        'The article you are looking for does not exist.',
        `/article/${slug}`
      );
    }

    // Get site settings for metadata
    const settings = await getSiteSettings();
    const siteName = settings.siteName;
    const articleTitle = article.seoTitle || article.title;
    const articleDescription = article.seoDescription || article.excerpt || `Read ${article.title}`;
    
    // Create custom metadata without site name in title for single article pages
    return {
      title: articleTitle, // No site name appended
      description: articleDescription.replace(/The Daily Herald/g, siteName),
      keywords: "news, breaking news, current events, latest news",
      authors: [{ name: siteName }],
      creator: siteName,
      publisher: siteName,
      formatDetection: {
        email: false,
        address: false,
        telephone: false,
      },
      metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
      alternates: {
        canonical: `/article/${slug}`,
        languages: {
          'en-US': `/article/${slug}`,
        },
      },
      openGraph: {
        title: articleTitle, // No site name appended
        description: articleDescription.replace(/The Daily Herald/g, siteName),
        url: `/article/${slug}`,
        siteName: siteName,
        locale: 'en_US',
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title: articleTitle, // No site name appended
        description: articleDescription.replace(/The Daily Herald/g, siteName),
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
    };
  } catch (error) {
    const { slug } = await params;
    return generatePageMetadata(
      'Article',
      'Loading article...',
      `/article/${slug}`
    );
  }
}

// Pre-fetch article data
async function getArticle(slug: string): Promise<Article | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/articles/slug/${slug}`, {
      next: { revalidate: 60 }, // Cache for 1 minute
    });
    
    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return data.article || null;
  } catch (error) {
    console.error('Error fetching article:', error);
    return null;
  }
}

// Pre-fetch related articles
async function getRelatedArticles(categorySlug: string, excludeId: string): Promise<Article[]> {
  try {
    console.log('Fetching related articles for category:', categorySlug, 'excluding:', excludeId);
    
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/articles?category=${categorySlug}&limit=3&exclude=${excludeId}`,
      { next: { revalidate: 300 } } // Cache for 5 minutes
    );
    
    if (!res.ok) {
      console.error('Related articles API error:', res.status, res.statusText);
      return [];
    }

    const data = await res.json();
    console.log('Related articles response:', data);
    
    const articles = data.docs || data.articles || [];
    console.log('Found related articles:', articles.length);
    
    return articles;
  } catch (error) {
    console.error('Error fetching related articles:', error);
    return [];
  }
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    notFound();
  }

  // Pre-fetch related articles
  const categorySlug = typeof article.category === 'string' ? article.category : article.category?.slug;
  console.log('Article category info:', article.category);
  console.log('Category slug for related articles:', categorySlug);
  const relatedArticles = categorySlug ? await getRelatedArticles(categorySlug, article._id || article.id || '') : [];

  // Extract featured image for mobile LCP optimization
  const featuredImage = article.featuredImage || article.imageUrl || '';

  return (
    <>
      <MobileLCPOptimizer featuredImages={[featuredImage]} />
      <PerformanceMonitor pageName="Article" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-4 py-4">
        <Suspense fallback={<ArticleSkeleton />}>
          <ArticleContent 
            article={article} 
            relatedArticles={relatedArticles}
            slug={slug}
          />
        </Suspense>
      </div>
    </>
  );
} 