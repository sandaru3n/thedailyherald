import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Article } from '@/types/news';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ArticleContent from '@/components/ArticleContent';
import ArticleSkeleton from '@/components/ArticleSkeleton';
import PerformanceMonitor from '@/components/PerformanceMonitor';

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  try {
    const { slug } = await params;
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/articles/slug/${slug}`, {
      next: { revalidate: 60 }, // Cache for 1 minute
    });
    
    if (!res.ok) {
      return {
        title: 'Article Not Found - The Daily Herald',
        description: 'The article you are looking for does not exist.',
        robots: {
          index: false,
          follow: false,
        },
      };
    }

    const data = await res.json();
    const article = data.article;

    if (!article) {
      return {
        title: 'Article Not Found - The Daily Herald',
        description: 'The article you are looking for does not exist.',
        robots: {
          index: false,
          follow: false,
        },
      };
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const canonicalUrl = `${siteUrl}/article/${slug}`;

    return {
      title: article.seoTitle || `${article.title} - The Daily Herald`,
      description: article.seoDescription || article.excerpt || `Read ${article.title} on The Daily Herald`,
      keywords: article.metaKeywords?.join(', ') || article.tags?.join(', ') || '',
      alternates: {
        canonical: canonicalUrl,
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
      openGraph: {
        title: article.seoTitle || article.title,
        description: article.seoDescription || article.excerpt,
        type: 'article',
        url: canonicalUrl,
        publishedTime: article.publishedAt,
        authors: [typeof article.author === 'string' ? article.author : article.author?.name || 'Unknown'],
        images: article.featuredImage || article.imageUrl ? [article.featuredImage || article.imageUrl] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: article.seoTitle || article.title,
        description: article.seoDescription || article.excerpt,
        images: article.featuredImage || article.imageUrl ? [article.featuredImage || article.imageUrl] : [],
      },
    };
  } catch (error) {
    return {
      title: 'Article - The Daily Herald',
      description: 'Loading article...',
      robots: {
        index: false,
        follow: false,
      },
    };
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
async function getRelatedArticles(categoryId: string, excludeId: string): Promise<Article[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/articles?category=${categoryId}&limit=3&exclude=${excludeId}`,
      { next: { revalidate: 300 } } // Cache for 5 minutes
    );
    
    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    return data.docs || data.articles || [];
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
  const categoryId = typeof article.category === 'string' ? article.category : article.category?._id;
  const relatedArticles = categoryId ? await getRelatedArticles(categoryId, article._id || article.id || '') : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <PerformanceMonitor pageName="Article" />
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-4 py-4">
        <Suspense fallback={<ArticleSkeleton />}>
          <ArticleContent 
            article={article} 
            relatedArticles={relatedArticles}
            slug={slug}
          />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
} 