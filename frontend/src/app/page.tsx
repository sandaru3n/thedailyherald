'use client';

import { useEffect, useState, Suspense } from 'react';
import { NewsArticle, NEWS_CATEGORIES } from '@/types/news';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ArticleCard } from '@/components/NewsCard';
import Sidebar from '@/components/Sidebar';
import { Separator } from '@/components/ui/separator';

// Separate component for search params functionality
function HomeContent() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/articles?status=published&limit=20');
        if (!res.ok) {
          throw new Error('Failed to fetch articles');
        }
        const data = await res.json();
        
        if (data.success && data.docs) {
          setArticles(data.docs);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        console.error('Error fetching articles:', err);
        setError(err instanceof Error ? err.message : 'Failed to load articles');
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();

    // Get category filter from URL on client side
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    setCategoryFilter(category);
  }, []);

  // Filter articles by category if specified
  const filteredArticles = categoryFilter
    ? articles.filter(article => {
        if (typeof article.category === 'string') {
          return article.category === categoryFilter;
        }
        return article.category?.name === categoryFilter;
      })
    : articles;

  // Get featured and latest news
  const featuredNews = filteredArticles.filter(article => article.isFeatured).slice(0, 2);
  const latestNews = filteredArticles.slice(0, 8);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-4 sm:py-8">
          <div className="animate-pulse">
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
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-4 sm:py-8">
          <div className="text-center py-8">
            <div className="text-red-500 text-xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Failed to Load Articles</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-4 sm:py-8">
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
                    <button className="text-blue-600 hover:text-blue-700 font-medium text-xs sm:text-sm">
                      View All
                    </button>
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
      </main>

      <Footer />
    </div>
  );
}

// Loading component for Suspense fallback
function HomeLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-4 sm:py-8">
        <div className="animate-pulse">
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
      </main>
      <Footer />
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
