'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { NewsArticle, NEWS_CATEGORIES } from '@/types/news';
import { SAMPLE_NEWS } from '@/data/sampleNews';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import NewsCard from '@/components/NewsCard';
import SocialShare from '@/components/SocialShare';
import AuthorBio from '@/components/AuthorBio';
import FloatingShare from '@/components/FloatingShare';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import {
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  Printer,
  Clock,
  Calendar,
  User,
  ArrowLeft,
  ArrowRight,
  Home,
  ChevronRight,
  BookOpen,
  Heart,
  MessageCircle,
  Eye
} from 'lucide-react';
import Image from 'next/image';

export default function ArticlePage() {
  const params = useParams();
  const router = useRouter();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [relatedArticles, setRelatedArticles] = useState<NewsArticle[]>([]);
  const [readingProgress, setReadingProgress] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    // Load articles from localStorage
    const savedArticles = localStorage.getItem('newsArticles');
    const allArticles = savedArticles ? JSON.parse(savedArticles) : SAMPLE_NEWS;
    setArticles(allArticles);

    // Find the current article
    const currentArticle = allArticles.find((a: NewsArticle) => a.id === params.id);
    setArticle(currentArticle);

    if (currentArticle) {
      // Find related articles (same category, excluding current)
      const related = allArticles
        .filter((a: NewsArticle) =>
          a.category === currentArticle.category && a.id !== currentArticle.id
        )
        .slice(0, 3);
      setRelatedArticles(related);
    }
  }, [params.id]);

  useEffect(() => {
    // Track reading progress
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setReadingProgress(Math.min(progress, 100));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8 sm:py-16 text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Article Not Found</h1>
          <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">The article you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/')}>
            <Home className="h-4 w-4 mr-2" />
            Back to Homepage
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const category = NEWS_CATEGORIES.find(cat => cat.name === article.category);
  const publishedDate = new Date(article.publishedAt);
  const currentIndex = articles.findIndex(a => a.id === article.id);
  const previousArticle = currentIndex > 0 ? articles[currentIndex - 1] : null;
  const nextArticle = currentIndex < articles.length - 1 ? articles[currentIndex + 1] : null;

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = article.title;

  const handleShare = (platform: string) => {
    const url = encodeURIComponent(shareUrl);
    const title = encodeURIComponent(shareTitle);

    const shareUrls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      email: `mailto:?subject=${title}&body=Check out this article: ${url}`
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-40">
        <div
          className="h-full bg-blue-600 transition-all duration-150"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      <main className="container mx-auto px-4 py-4 sm:py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">
          <button onClick={() => router.push('/')} className="hover:text-blue-600">
            Home
          </button>
          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
          <button
            onClick={() => router.push(`/?category=${article.category}`)}
            className="hover:text-blue-600"
          >
            {article.category}
          </button>
          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="text-gray-900 truncate">{article.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-8">
          {/* Main Article Content */}
          <div className="lg:col-span-3">
            <article className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Article Header */}
              <div className="p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <Badge className={`${category?.color} text-white text-xs`}>
                    {article.category}
                  </Badge>
                  <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">{publishedDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</span>
                      <span className="sm:hidden">{publishedDate.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>{article.readTime} min read</span>
                    </div>
                  </div>
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 leading-tight mb-3 sm:mb-4">
                  {article.title}
                </h1>

                <p className="text-lg sm:text-xl text-gray-600 leading-relaxed mb-4 sm:mb-6">
                  {article.excerpt}
                </p>

                {/* Author Info */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-b py-3 sm:py-4 mb-4 sm:mb-6">
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm sm:text-base">{article.author}</p>
                      <p className="text-xs sm:text-sm text-gray-500">Senior Reporter</p>
                    </div>
                  </div>

                  {/* Social Sharing */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm text-gray-500 mr-1 sm:mr-2">Share:</span>
                    <SocialShare url={shareUrl} title={shareTitle} size="sm" />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrint}
                      className="p-1 sm:p-2"
                    >
                      <Printer className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Featured Image */}
              <div className="relative h-64 sm:h-80 lg:h-96 xl:h-[500px]">
                <Image
                  src={article.imageUrl}
                  alt={article.title}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Article Content */}
              <div className="p-4 sm:p-6 lg:p-8">
                <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none">
                  <div className="text-gray-800 leading-relaxed space-y-4 sm:space-y-6">
                    {article.content.split('\n\n').map((paragraph, index) => (
                      <p key={index} className="text-base sm:text-lg leading-7 sm:leading-8">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                {article.tags.length > 0 && (
                  <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t">
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3">Tags:</h3>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {article.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="hover:bg-gray-100 cursor-pointer text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Article Actions */}
                <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                  <div className="flex items-center gap-2 sm:gap-4">
                    <Button
                      variant={isLiked ? "default" : "outline"}
                      size="sm"
                      onClick={() => setIsLiked(!isLiked)}
                      className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                    >
                      <Heart className={`h-3 w-3 sm:h-4 sm:w-4 ${isLiked ? 'fill-current' : ''}`} />
                      {isLiked ? 'Liked' : 'Like'}
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                      <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      Comment
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                      <Share2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      Share
                    </Button>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-500">
                    <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>1,234 views</span>
                  </div>
                </div>
              </div>
            </article>

            {/* Author Bio */}
            <div className="mt-6 sm:mt-8">
              <AuthorBio
                author={article.author}
                articleCount={articles.filter(a => a.author === article.author).length}
              />
            </div>

            {/* Article Navigation */}
            <div className="mt-6 sm:mt-8 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {previousArticle && (
                <Card className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => router.push(`/article/${previousArticle.id}`)}>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2">
                      <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                      Previous Article
                    </div>
                    <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm sm:text-base">
                      {previousArticle.title}
                    </h3>
                  </CardContent>
                </Card>
              )}

              {nextArticle && (
                <Card className="hover:shadow-md transition-shadow cursor-pointer md:text-right"
                      onClick={() => router.push(`/article/${nextArticle.id}`)}>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-end gap-1 sm:gap-2 text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2">
                      Next Article
                      <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                    </div>
                    <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm sm:text-base">
                      {nextArticle.title}
                    </h3>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-4 sm:space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">Quick Actions</h3>
                  <div className="space-y-2 sm:space-y-3">
                    <Button variant="outline" className="w-full justify-start text-xs sm:text-sm" onClick={handlePrint}>
                      <Printer className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                      Print Article
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-xs sm:text-sm">
                      <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                      Save to Read Later
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-xs sm:text-sm">
                      <Share2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                      Share Article
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Related Articles */}
              {relatedArticles.length > 0 && (
                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">Related Articles</h3>
                    <div className="space-y-3 sm:space-y-4">
                      {relatedArticles.map((relatedArticle) => (
                        <div
                          key={relatedArticle.id}
                          className="cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                          onClick={() => router.push(`/article/${relatedArticle.id}`)}
                        >
                          <NewsCard article={relatedArticle} variant="compact" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Advertisement */}
              <Card className="bg-gray-100">
                <CardContent className="p-6 sm:p-8 text-center">
                  <div className="text-gray-400 text-xs sm:text-sm">Advertisement</div>
                  <div className="mt-1 sm:mt-2 text-xs text-gray-500">300 x 250</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Share for Mobile */}
      <FloatingShare url={shareUrl} title={shareTitle} />

      <Footer />
    </div>
  );
}
