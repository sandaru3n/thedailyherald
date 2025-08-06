'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Article } from '@/types/news';
import ReadingProgress from '@/components/ReadingProgress';
import FloatingShare from '@/components/FloatingShare';
import TableOfContents from '@/components/TableOfContents';
import AuthorBio from '@/components/AuthorBio';
import NewsletterSignup from '@/components/NewsletterSignup';
import RelatedArticles from '@/components/RelatedArticles';
import CommentsSection from '@/components/CommentsSection';
import CategoriesList from '@/components/CategoriesList';
import StructuredData from '@/components/StructuredData';
import OptimizedImage from '@/components/OptimizedImage';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, 
  Eye, 
  Calendar,
  User,
  Bookmark,
  ArrowLeft,
  ExternalLink
} from 'lucide-react';
import ScrollToTop from '@/components/ScrollToTop';

interface ArticleContentProps {
  article: Article;
  relatedArticles: Article[];
  slug: string;
}

export default function ArticleContent({ article, relatedArticles, slug }: ArticleContentProps) {
  const router = useRouter();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { settings } = useSiteSettings();

  // Hydration safety
  useEffect(() => {
    setIsClient(true);
  }, []);

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

  const readTime = calculateReadTime(article.content);
  const authorName = typeof article.author === 'string' ? article.author : article.author?.name || 'Unknown Author';
  const categoryName = typeof article.category === 'string' ? article.category : article.category?.name || 'Uncategorized';

  if (!isClient) {
    return null; // Prevent hydration mismatch
  }

  return (
    <>
      <StructuredData article={article} settings={settings} />
      <ScrollToTop />
      <ReadingProgress />
      <FloatingShare 
        title={article.title}
        url={typeof window !== 'undefined' ? window.location.href : ''}
        excerpt={article.excerpt}
      />
      
      {/* Breadcrumb - Optimized for mobile */}
      <nav className="mb-3 sm:mb-4" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-gray-600">
          <li>
            <button 
              onClick={() => router.push('/')}
              className="hover:text-blue-600 transition-colors"
              aria-label="Go to homepage"
            >
              Home
            </button>
          </li>
          <li>/</li>
          <li>
            <button 
              onClick={() => router.push(`/category/${categoryName.toLowerCase()}`)}
              className="hover:text-blue-600 transition-colors"
              aria-label={`Go to ${categoryName} category`}
            >
              {categoryName}
            </button>
          </li>
          <li>/</li>
          <li className="text-gray-900 font-medium truncate max-w-[120px] sm:max-w-none">{article.title}</li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
        {/* Main Article Content - Optimized for mobile LCP */}
        <article className="lg:col-span-8">
          <Card className="overflow-hidden shadow-lg rounded-xl lg:rounded-2xl">
            <div className="p-4 sm:p-6 lg:p-10">
              {/* Article Title - Critical for LCP */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 leading-tight">{article.title}</h1>
              
              {/* Meta Information - Optimized for mobile */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                <div className="flex items-center gap-1 sm:gap-2">
                  <User className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="truncate">{authorName}</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{formatDate(article.publishedAt)}</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{readTime} min read</span>
                </div>
                {article.views && (
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{article.views.toLocaleString()} views</span>
                  </div>
                )}
              </div>

              {/* Tags - Optimized for mobile */}
              {article.tags && article.tags.length > 0 && (
                <div className="mb-4 sm:mb-6">
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {article.tags.slice(0, 3).map((tag, index) => ( // Limit tags on mobile
                      <Badge key={`${article._id || article.id}-tag-${index}-${tag}`} variant="outline" className="hover:bg-gray-100 text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-b border-gray-200 mb-4 sm:mb-6"></div>
              
              {/* Featured Image - Critical for LCP, optimized for mobile */}
              <div className="flex justify-center mb-6 sm:mb-8">
                <div className="relative w-full max-w-2xl aspect-[16/9] rounded-lg sm:rounded-xl overflow-hidden shadow-md">
                  <OptimizedImage
                    src={article.featuredImage || article.imageUrl || '/placeholder.svg'}
                    alt={article.title}
                    fill
                    className="rounded-lg sm:rounded-xl"
                    priority={true}
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
                    quality={85} // Higher quality for LCP
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-lg sm:rounded-xl" />
                  
                  {/* Category Badge - Optimized for mobile */}
                  <div className="absolute top-2 sm:top-4 left-2 sm:left-4">
                    <Badge variant="secondary" className="bg-white/90 text-gray-900 hover:bg-white text-xs sm:text-sm">
                      {categoryName}
                    </Badge>
                  </div>
                  
                  {/* Bookmark Button - Optimized for mobile */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-white/90 hover:bg-white"
                    onClick={() => setIsBookmarked(!isBookmarked)}
                    aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark article'}
                  >
                    <Bookmark className={`w-3 h-3 sm:w-4 sm:h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                  </Button>
                </div>
              </div>

              <Separator className="my-6 sm:my-8" />
              
              {/* Article Content - Optimized for mobile reading */}
              <div className="article-content prose prose-sm sm:prose-base lg:prose-lg max-w-none">
                <div 
                  dangerouslySetInnerHTML={{ __html: article.content }}
                  className="text-gray-800 leading-relaxed text-sm sm:text-base"
                />
              </div>

              <Separator className="my-6 sm:my-8" />
              
              {/* Author Bio - Optimized for mobile */}
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

          {/* Comments Section - Optimized for mobile */}
          <div className="mt-6 sm:mt-10">
            <CommentsSection articleId={article._id || article.id || ''} />
          </div>
        </article>

        {/* Sidebar - Hidden on mobile for better LCP, shown on desktop */}
        <aside className="hidden lg:block lg:col-span-4 space-y-6">
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
                  <div className="text-center text-gray-700">
                    <ExternalLink className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm font-medium">Advertisement Space</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="w-full">
            <CategoriesList />
          </div>
        </aside>

        {/* Mobile-specific related articles - Shown below content on mobile for better LCP */}
        <div className="lg:hidden mt-6">
          <RelatedArticles articles={relatedArticles} />
        </div>
      </div>
    </>
  );
} 