'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Article } from '@/types/news';
import { 
  Clock, 
  Eye, 
  Calendar,
  ArrowRight,
  TrendingUp
} from 'lucide-react';

interface RelatedArticlesProps {
  articles: Article[];
  title?: string;
  maxArticles?: number;
}

export default function RelatedArticles({ 
  articles, 
  title = "Related Articles",
  maxArticles = 3 
}: RelatedArticlesProps) {
  const router = useRouter();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const calculateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.split(' ').length;
    return Math.ceil(words / wordsPerMinute);
  };

  const getCategoryName = (article: Article) => {
    if (typeof article.category === 'string') {
      return article.category;
    }
    return article.category?.name || 'Uncategorized';
  };

  const getArticleId = (article: Article) => {
    return article._id || article.id;
  };

  if (articles.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8 text-gray-500">
            <TrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No related articles found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayArticles = articles.slice(0, maxArticles);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <Badge variant="outline" className="text-xs">
            {displayArticles.length} articles
          </Badge>
        </div>
        
        <div className="space-y-4">
          {displayArticles.map((article) => (
            <div
              key={getArticleId(article)}
              className="group cursor-pointer"
              onMouseEnter={() => setHoveredId(getArticleId(article) || null)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => router.push(`/article/${getArticleId(article)}`)}
            >
              <div className="flex gap-3 p-3 rounded-lg transition-all duration-200 hover:bg-gray-50">
                {/* Article Image */}
                <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden rounded-lg">
                  <img
                    src={article.featuredImage || article.imageUrl || '/placeholder.jpg'}
                    alt={article.title}
                    className={`w-full h-full object-cover transition-transform duration-300 ${
                      hoveredId === getArticleId(article) ? 'scale-110' : 'scale-100'
                    }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  
                  {/* Category Badge */}
                  <div className="absolute top-1 left-1">
                    <Badge variant="secondary" className="text-xs bg-white/90 text-gray-900">
                      {getCategoryName(article)}
                    </Badge>
                  </div>
                </div>

                {/* Article Content */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm leading-tight mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {article.title}
                  </h4>
                  
                  <p className="text-gray-600 text-xs line-clamp-2 mb-2">
                    {article.excerpt}
                  </p>

                  {/* Article Meta */}
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(article.publishedAt)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{calculateReadTime(article.content)} min</span>
                    </div>
                    {article.views && (
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>{article.views.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Arrow Icon */}
                <div className={`flex items-center transition-transform duration-200 ${
                  hoveredId === getArticleId(article) ? 'translate-x-1' : 'translate-x-0'
                }`}>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        {articles.length > maxArticles && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => router.push('/')}
            >
              View All Articles
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 