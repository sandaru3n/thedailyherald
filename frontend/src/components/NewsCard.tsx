'use client';

import Link from 'next/link';
import { Article } from '@/types/news';
import OptimizedImage from './OptimizedImage';
import { Badge } from '@/components/ui/badge';

interface ArticleCardProps {
  article: Article;
  variant?: 'default' | 'featured' | 'compact';
}

export function ArticleCard({ article, variant = 'default' }: ArticleCardProps) {
  // Helper function to get category name
  const getCategoryName = (article: Article) => {
    if (typeof article.category === 'string') {
      return article.category;
    }
    return article.category?.name || 'Uncategorized';
  };

  // Helper function to get article slug
  const getArticleSlug = (article: Article) => {
    return article.slug;
  };

  if (variant === 'compact') {
    return (
      <Link 
        href={`/article/${getArticleSlug(article)}`} 
        className="block group" 
        prefetch={true}
        onClick={(e) => {
          // Prevent any event bubbling issues
          e.stopPropagation();
        }}
      >
        <div className="flex gap-3">
          <div className="relative w-16 h-16 flex-shrink-0">
            <OptimizedImage
              src={article.featuredImage || article.imageUrl || '/placeholder.svg'}
              alt={article.title}
              fill
              className="object-cover rounded"
              priority={false}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
              {article.title}
            </h3>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'featured') {
    return (
      <Link 
        href={`/article/${getArticleSlug(article)}`} 
        className="block group h-full" 
        prefetch={true}
        onClick={(e) => {
          // Prevent any event bubbling issues
          e.stopPropagation();
        }}
      >
        <div className="relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02] h-full">
          <div className="aspect-[16/9] relative">
            <OptimizedImage
              src={article.featuredImage || article.imageUrl || '/placeholder.svg'}
              alt={article.title}
              fill
              className="object-cover"
              priority={true}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Category Badge */}
            <div className="absolute top-4 left-4">
              <Badge variant="secondary" className="bg-white/90 text-gray-900 hover:bg-white">
                {getCategoryName(article)}
              </Badge>
            </div>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h2 className="text-xl font-bold mb-2 line-clamp-2 group-hover:text-blue-200 transition-colors">
              {article.title}
            </h2>
            <p className="text-sm text-gray-200 mb-3 line-clamp-2">
              {article.excerpt}
            </p>
          </div>
        </div>
      </Link>
    );
  }

  // Default variant - Old card style with simple image
  return (
    <Link 
      href={`/article/${getArticleSlug(article)}`} 
      className="block group h-full" 
      prefetch={true}
      onClick={(e) => {
        // Prevent any event bubbling issues
        e.stopPropagation();
      }}
    >
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group-hover:scale-[1.02] h-full flex flex-col">
        <div className="aspect-[16/9] relative">
          <OptimizedImage
            src={article.featuredImage || article.imageUrl || '/placeholder.svg'}
            alt={article.title}
            fill
            className="object-cover"
            priority={false}
          />
          
          {/* Category Badge */}
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="bg-white/90 text-gray-900 hover:bg-white text-xs">
              {getCategoryName(article)}
            </Badge>
          </div>
        </div>
        
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors flex-shrink-0">
            {article.title}
          </h3>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2 flex-1">
            {article.excerpt}
          </p>
        </div>
      </div>
    </Link>
  );
}
