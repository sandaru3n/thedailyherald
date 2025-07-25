'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Article } from '@/types/news';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ArticleCard } from '@/components/NewsCard';

export default function ArticlePage() {
  const params = useParams();
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        // Use Next.js proxy to avoid CORS issues
        const res = await fetch(`/api/articles/${params.id}`);
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error('Article not found');
          }
          throw new Error('Failed to fetch article');
        }
        const data = await res.json();
        
        if (data.success && data.article) {
          setArticle(data.article);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        console.error('Error fetching article:', err);
        setError(err instanceof Error ? err.message : 'Failed to load article');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchArticle();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading article...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-8">
            <div className="text-red-500 text-xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Article Not Found</h1>
            <p className="text-gray-600 mb-4">{error || 'The article you are looking for does not exist.'}</p>
            <button 
              onClick={() => router.push('/')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go Back Home
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
      <main className="container mx-auto px-4 py-8">
        <ArticleCard article={article} />
      </main>
      <Footer />
    </div>
  );
}
