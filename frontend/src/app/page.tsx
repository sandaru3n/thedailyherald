import { Suspense } from 'react';
import Link from 'next/link';
import { NewsArticle, NEWS_CATEGORIES } from '@/types/news';
import { ArticleCard } from '@/components/NewsCard';
import Sidebar from '@/components/Sidebar';
import { Separator } from '@/components/ui/separator';
import { getSiteSettings } from '@/lib/settings';

// Server-side data fetching for all articles
async function getArticles(): Promise<NewsArticle[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/articles?status=published&limit=100`, {
      next: { revalidate: 60 }, // Cache for 1 minute
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch articles');
    }
    
    const data = await res.json();
    
    if (data.success && data.docs) {
      return data.docs;
    } else {
      throw new Error('Invalid response format');
    }
  } catch (error) {
    console.error('Error fetching articles:', error);
    return [];
  }
}

// Server component for home content
async function HomeContent() {
  const articles = await getArticles();
  const settings = await getSiteSettings();

  // Get featured and latest news
  const featuredNews = articles.filter(article => article.isFeatured).slice(0, 2);
  const latestNews = articles.slice(0, 6);

  // Group articles by category and get latest 3 from each
  const categoryArticles = NEWS_CATEGORIES.map(category => {
    const categoryNews = articles.filter(article => {
      if (typeof article.category === 'string') {
        return article.category === category.name;
      }
      return article.category?.name === category.name;
    });

    // Sort by published date (newest first) and take latest 3
    const sortedArticles = categoryNews
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, 3);

    return {
      category,
      articles: sortedArticles
    };
  }).filter(cat => cat.articles.length > 0); // Only show categories with articles

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8">
      {/* Main H1 for SEO and Accessibility */}
      <header className="mb-6 sm:mb-8 text-center px-2 sm:px-0">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-2">
          {settings.siteName || 'The Daily Herald'}
        </h1>
        <p className="text-base sm:text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto px-4 sm:px-6 lg:px-0 leading-relaxed break-words">
          { 'Your trusted source for the latest news and breaking stories from around the world'}
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Hero Section */}
          {featuredNews.length > 0 && (
            <section className="mb-8 sm:mb-12">
              <div className="flex items-center mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Featured News</h2>
                <Separator className="ml-3 sm:ml-4 flex-1" />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {featuredNews.map((article) => (
                  <div key={article._id} className="h-full">
                    <ArticleCard article={article} variant="featured" />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Latest News Section */}
          <section className="mb-8 sm:mb-12">
            <div className="flex items-center mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Latest News</h2>
              <Separator className="ml-3 sm:ml-4 flex-1" />
              <Link 
                href="/articles"
                prefetch={true}
                className="inline-flex items-center px-3 py-1.5 text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors duration-200 shadow-sm hover:shadow-md"
              >
                View All
                <svg className="ml-1 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {latestNews.map((article) => (
                <div key={article._id} className="h-full">
                  <ArticleCard article={article} />
                </div>
              ))}
            </div>
          </section>

          {/* Categories Section - Latest 3 posts from each category */}
          {categoryArticles.map(({ category, articles }) => (
            <section key={category.name} className="mb-8 sm:mb-12">
              <div className="flex items-center mb-4 sm:mb-6">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{category.name}</h2>
                </div>
                <Separator className="ml-3 sm:ml-4 flex-1" />
                <Link 
                  href={`/category/${category.slug}`}
                  prefetch={true}
                  className="inline-flex items-center px-3 py-1.5 text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors duration-200 shadow-sm hover:shadow-md"
                >
                  View All
                  <svg className="ml-1 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {articles.map((article) => (
                  <div key={article._id} className="h-full">
                    <ArticleCard article={article} />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Sidebar trendingNews={articles} />
        </div>
      </div>
    </div>
  );
}

// Loading component for Suspense fallback
function HomeLoading() {
  return (
    <div className="container mx-auto px-4 py-4 sm:py-8">
      <div className="animate-pulse">
        {/* H1 Loading State */}
        <div className="mb-6 sm:mb-8 text-center">
          <div className="h-10 sm:h-12 lg:h-14 bg-gray-200 rounded mx-auto mb-2 max-w-md"></div>
          <div className="h-6 bg-gray-200 rounded mx-auto max-w-lg"></div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-8">
          <div className="lg:col-span-3">
            {/* Featured News Loading */}
            <div className="mb-8 sm:mb-12">
              <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-gray-200 h-64 sm:h-80 rounded-lg"></div>
                ))}
              </div>
            </div>

            {/* Latest News Loading */}
            <div className="mb-8 sm:mb-12">
              <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-gray-200 h-48 rounded-lg"></div>
                ))}
              </div>
            </div>

            {/* Categories Loading */}
            {[1, 2, 3, 4].map((categoryIndex) => (
              <div key={categoryIndex} className="mb-8 sm:mb-12">
                <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                  {[1, 2, 3].map((articleIndex) => (
                    <div key={articleIndex} className="bg-gray-200 h-48 rounded-lg"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="lg:col-span-1">
            <div className="space-y-4 sm:space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<HomeLoading />}>
      <HomeContent />
    </Suspense>
  );
}
