'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Article } from '@/types/news';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ReadingProgress from '@/components/ReadingProgress';
import FloatingShare from '@/components/FloatingShare';
import TableOfContents from '@/components/TableOfContents';
import AuthorBio from '@/components/AuthorBio';
import NewsletterSignup from '@/components/NewsletterSignup';
import RelatedArticles from '@/components/RelatedArticles';
import CommentsSection from '@/components/CommentsSection';
import CategoriesList from '@/components/CategoriesList';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Facebook, 
  Twitter, 
  Linkedin, 
  Share2, 
  Clock, 
  Eye, 
  Calendar,
  User,
  Bookmark,
  MessageCircle,
  ArrowLeft,
  ExternalLink
} from 'lucide-react';
import ScrollToTop from '@/components/ScrollToTop';

export default function ArticlePage() {
  const params = useParams();
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
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
          // Fetch related articles
          fetchRelatedArticles(data.article.category?._id || data.article.category);
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

  const fetchRelatedArticles = async (categoryId: string) => {
    try {
      const res = await fetch(`/api/articles?category=${categoryId}&limit=3&exclude=${params.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setRelatedArticles(data.articles || []);
        }
      }
    } catch (err) {
      console.error('Error fetching related articles:', err);
    }
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const title = article?.title || '';
    const text = article?.excerpt || '';

    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    };

    if (shareUrls[platform as keyof typeof shareUrls]) {
      window.open(shareUrls[platform as keyof typeof shareUrls], '_blank', 'width=600,height=400');
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const calculateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.split(' ').length;
    return Math.ceil(words / wordsPerMinute);
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

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
            <Button 
              onClick={() => router.push('/')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back Home
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const readTime = calculateReadTime(article.content);
  const authorName = typeof article.author === 'string' ? article.author : article.author?.name || 'Unknown Author';
  const categoryName = typeof article.category === 'string' ? article.category : article.category?.name || 'Uncategorized';

  return (
    <div className="min-h-screen bg-gray-50">
      <ScrollToTop />
      <ReadingProgress />
      <FloatingShare 
        title={article.title}
        url={window.location.href}
        excerpt={article.excerpt}
      />
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-4 py-12">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li>
              <button 
                onClick={() => router.push('/')}
                className="hover:text-blue-600 transition-colors"
              >
                Home
              </button>
            </li>
            <li>/</li>
            <li>
              <button 
                onClick={() => router.push(`/category/${categoryName.toLowerCase()}`)}
                className="hover:text-blue-600 transition-colors"
              >
                {categoryName}
              </button>
            </li>
            <li>/</li>
            <li className="text-gray-900 font-medium truncate">{article.title}</li>
          </ol>
        </nav>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Article Content */}
          <article className="lg:col-span-8">
            <Card className="overflow-hidden shadow-lg rounded-2xl">
              <div className="p-6 lg:p-10">
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">{article.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{authorName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(article.publishedAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{readTime} min read</span>
                  </div>
                  {article.views && (
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      <span>{article.views.toLocaleString()} views</span>
                    </div>
                  )}
                </div>
                {/* Tags */}
                {article.tags && article.tags.length > 0 && (
                  <div className="mb-6">
                    <div className="flex flex-wrap gap-2">
                      {article.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="hover:bg-gray-100">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                <div className="border-b border-gray-200 mb-6"></div>
                <p className="text-xl text-gray-600 leading-relaxed mb-6">{article.excerpt}</p>
                {/* Featured Image */}
                <div className="flex justify-center mb-8">
                  <div className="relative w-full max-w-2xl aspect-[16/9] rounded-xl overflow-hidden shadow-md">
                    <img
                      src={article.featuredImage || article.imageUrl || '/placeholder.jpg'}
                      alt={article.title}
                      className="w-full h-full object-cover rounded-xl"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-xl" />
                    {/* Category Badge */}
                    <div className="absolute top-4 left-4">
                      <Badge variant="secondary" className="bg-white/90 text-gray-900 hover:bg-white">
                        {categoryName}
                      </Badge>
                    </div>
                    {/* Bookmark Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-4 right-4 bg-white/90 hover:bg-white"
                      onClick={() => setIsBookmarked(!isBookmarked)}
                    >
                      <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                    </Button>
                  </div>
                </div>
                <Separator className="my-8" />
                {/* Article Content */}
                <div className="article-content">
                  <div 
                    dangerouslySetInnerHTML={{ __html: article.content }}
                  />
                </div>
                <Separator className="my-8" />
                {/* Author Bio */}
                <AuthorBio 
                  author={{
                    name: authorName,
                    bio: `Experienced journalist covering ${categoryName.toLowerCase()} news and trends.`,
                    articlesCount: 50,
                    location: 'New York, NY',
                    joinedDate: '2020-01-01'
                  }}
                  category={categoryName}
                />
              </div>
            </Card>
            {/* Comments Section */}
            <div className="mt-10">
              <CommentsSection articleId={article._id || article.id || ''} />
            </div>
          </article>
          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            <TableOfContents content={article.content} />
            <div className="w-full">
              <NewsletterSignup />
            </div>
            <div className="w-full">
              <RelatedArticles articles={relatedArticles} />
            </div>
            <div className="w-full">
              <Card>
                <CardContent className="p-6">
                  <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <ExternalLink className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">Advertisement Space</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="w-full">
              <CategoriesList />
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}
