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
      <ScrollToTop />
      <ReadingProgress />
      <FloatingShare 
        title={article.title}
        url={typeof window !== 'undefined' ? window.location.href : ''}
        excerpt={article.excerpt}
      />
      
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
              
              {/* Meta Information */}
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
              
              {/* Excerpt */}
              <p className="text-xl text-gray-600 leading-relaxed mb-6">{article.excerpt}</p>
              
              {/* Featured Image */}
              <div className="flex justify-center mb-8">
                <div className="relative w-full max-w-2xl aspect-[16/9] rounded-xl overflow-hidden shadow-md">
                  <img
                    src={article.featuredImage || article.imageUrl || '/placeholder.svg'}
                    alt={article.title}
                    className="w-full h-full object-cover rounded-xl"
                    loading="eager"
                    priority={true}
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
              <div className="article-content prose prose-lg max-w-none">
                <div 
                  dangerouslySetInnerHTML={{ __html: article.content }}
                  className="text-gray-800 leading-relaxed"
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
    </>
  );
} 