import { Suspense } from 'react';
import Link from 'next/link';
import { NewsArticle, NEWS_CATEGORIES } from '@/types/news';
import { ArticleCard } from '@/components/NewsCard';
import Sidebar from '@/components/Sidebar';
import { Separator } from '@/components/ui/separator';
import { getSiteSettings } from '@/lib/settings';

// Server-side data fetching
async function getArticles(): Promise<NewsArticle[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/articles?status=published&limit=20`, {
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
  const latestNews = articles.slice(0, 8);

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8">
      {/* Main H1 for SEO and Accessibility */}
      <header className="mb-6 sm:mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-2">
          {settings.siteName || 'The Daily Herald'}
        </h1>
        <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
          {settings.siteDescription || 'Your trusted source for the latest news and breaking stories from around the world'}
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Hero Section */}
          {featuredNews.length > 0 && (
            <section className="mb-8 sm:mb-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {featuredNews.map((article) => (
                  <ArticleCard key={article._id} article={article} variant="featured" />
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
                className="inline-flex items-center px-3 py-1.5 text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors duration-200 shadow-sm hover:shadow-md"
              >
                View All
                <svg className="ml-1 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {latestNews.slice(0, 6).map((article) => (
                <ArticleCard key={article._id} article={article} />
              ))}
            </div>
          </section>

          {/* Categories Section */}
          {NEWS_CATEGORIES.slice(0, 3).map((category) => {
            const categoryNews = articles.filter(article => {
              if (typeof article.category === 'string') {
                return article.category === category.name;
              }
              return article.category?.name === category.name;
            });

            if (categoryNews.length === 0) return null;

            return (
              <section key={category.name} className="mb-8 sm:mb-12">
                <div className="flex items-center mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{category.name}</h2>
                  <Separator className="ml-3 sm:ml-4 flex-1" />
                  <Link 
                    href={`/category/${category.slug}`}
                    className="inline-flex items-center px-3 py-1.5 text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors duration-200 shadow-sm hover:shadow-md"
                  >
                    View All
                    <svg className="ml-1 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                  {categoryNews.slice(0, 3).map((article) => (
                    <ArticleCard key={article._id} article={article} />
                  ))}
                </div>
              </section>
            );
          })}
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12">
              {[1, 2].map((i) => (
                <div key={i} className="bg-gray-200 h-64 sm:h-80 rounded-lg"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-gray-200 h-48 rounded-lg"></div>
              ))}
            </div>
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
