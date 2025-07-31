'use client';

import Link from 'next/link';
import { Article } from '@/types/news';
import OptimizedImage from './OptimizedImage';
import { Calendar, User } from 'lucide-react';

interface CategoryCardProps {
  article: Article;
}

export default function CategoryCard({ article }: CategoryCardProps) {
  // Helper function to get author name
  const getAuthorName = (article: Article) => {
    if (typeof article.author === 'string') {
      return article.author;
    }
    return article.author?.name || 'Unknown Author';
  };

  // Helper function to get category name
  const getCategoryName = (article: Article) => {
    if (typeof article.category === 'string') {
      return article.category;
    }
    return article.category?.name || 'Uncategorized';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden group">
      <Link href={`/article/${article.slug}`} className="block">
        {/* Image Container */}
        <div className="relative h-48 overflow-hidden">
          <OptimizedImage
            src={article.featuredImage || article.imageUrl || '/placeholder.svg'}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            priority={false}
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          {/* Category Badge */}
          <div className="absolute top-3 left-3">
            <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full font-medium">
              {getCategoryName(article)}
            </span>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4">
          {/* Title */}
          <h3 className="font-bold text-lg leading-tight mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {article.title}
          </h3>
          
          {/* Excerpt */}
          {article.excerpt && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {article.excerpt}
            </p>
          )}
          
          {/* Meta Information */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>{getAuthorName(article)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
} 