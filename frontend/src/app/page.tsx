'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import NewsCard from '@/components/NewsCard';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import { SAMPLE_NEWS } from '@/data/sampleNews';
import { NewsArticle } from '@/types/news';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function Home() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);

  useEffect(() => {
    // Load articles from localStorage or use sample data
    const savedArticles = localStorage.getItem('newsArticles');
    if (savedArticles) {
      setArticles(JSON.parse(savedArticles));
    } else {
      setArticles(SAMPLE_NEWS);
      localStorage.setItem('newsArticles', JSON.stringify(SAMPLE_NEWS));
    }
  }, []);

  const featuredNews = articles.filter(article => article.isFeatured);
  const latestNews = articles.filter(article => !article.isFeatured);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Hero Section */}
            <section className="mb-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {featuredNews.slice(0, 2).map((article) => (
                  <NewsCard key={article.id} article={article} variant="featured" />
                ))}
              </div>
            </section>

            {/* Latest News Section */}
            <section className="mb-12">
              <div className="flex items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Latest News</h2>
                <Separator className="ml-4 flex-1" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
                <section key={categoryName} className="mb-12">
                  <div className="flex items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-900">{categoryName}</h2>
                    <Separator className="ml-4 flex-1" />
                    <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                      View All
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
