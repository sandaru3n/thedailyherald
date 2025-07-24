'use client';

import { useEffect, useState, Suspense } from 'react';
import { NewsArticle, NEWS_CATEGORIES } from '@/types/news';
import { SAMPLE_NEWS } from '@/data/sampleNews';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import NewsCard from '@/components/NewsCard';
import Sidebar from '@/components/Sidebar';
import { Separator } from '@/components/ui/separator';

// Separate component for search params functionality
function HomeContent() {
  const [articles, setArticles] = useState<NewsArticle[]>(SAMPLE_NEWS);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  useEffect(() => {
    // Load articles from localStorage
    const savedArticles = localStorage.getItem('newsArticles');
    if (savedArticles) {
      setArticles(JSON.parse(savedArticles));
    }

    // Get category filter from URL on client side
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    setCategoryFilter(category);
  }, []);

  // Filter articles by category if specified
  const filteredArticles = categoryFilter
    ? articles.filter(article => article.category === categoryFilter)
    : articles;

  // Get featured and latest news
  const featuredNews = filteredArticles.slice(0, 2);
  const latestNews = filteredArticles.slice(2, 8);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Hero Section */}
            <section className="mb-8 sm:mb-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {featuredNews.slice(0, 2).map((article) => (
                  <NewsCard key={article.id} article={article} variant="featured" />
                ))}
              </div>
            </section>

            {/* Latest News Section */}
            <section className="mb-8 sm:mb-12">
              <div className="flex items-center mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Latest News</h2>
                <Separator className="ml-3 sm:ml-4 flex-1" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {latestNews.slice(0, 6).map((article) => (
                  <NewsCard key={article.id} article={article} />
                ))}
              </div>
            </section>

            {/* Categories Section */}
            {['Politics', 'Technology', 'Sports'].map((categoryName) => {
              const categoryNews = articles.filter(
                article => article.category === categoryName
              );

              if (categoryNews.length === 0) return null;

              return (
                <section key={categoryName} className="mb-8 sm:mb-12">
                  <div className="flex items-center mb-4 sm:mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{categoryName}</h2>
                    <Separator className="ml-3 sm:ml-4 flex-1" />
                    <button className="text-blue-600 hover:text-blue-700 font-medium text-xs sm:text-sm">
                      View All
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                    {categoryNews.slice(0, 3).map((article) => (
                      <NewsCard key={article.id} article={article} />
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
