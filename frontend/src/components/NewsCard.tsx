'use client';

import Link from 'next/link';
import { Article } from '@/types/news';
import OptimizedImage from './OptimizedImage';

interface ArticleCardProps {
  article: Article;
  variant?: 'default' | 'compact' | 'featured';
}

export function ArticleCard({ article, variant = 'default' }: ArticleCardProps) {
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

  // Helper function to get article slug
  const getArticleSlug = (article: Article) => {
    return article.slug;
  };

  if (variant === 'compact') {
    return (
      <Link href={`/article/${getArticleSlug(article)}`} className="block" prefetch={true}>
        <div className="flex gap-3">
          <div className="relative w-16 h-16 flex-shrink-0">
            <OptimizedImage
              src={article.featuredImage || article.imageUrl || '/placeholder.svg'}
              alt={article.title}
              width={64}
              height={64}
              className="w-full h-full object-cover rounded"
              priority={false}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm leading-tight mb-1 line-clamp-2 hover:text-blue-600 transition-colors">
              {article.title}
            </h3>
            <p className="text-gray-500 text-xs">
              {new Date(article.publishedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'featured') {
    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
        <Link href={`/article/${getArticleSlug(article)}`} prefetch={true}>
          <div className="relative h-64 overflow-hidden">
            <OptimizedImage
              src={article.featuredImage || article.imageUrl || '/placeholder.svg'}
              alt={article.title}
              fill
              className="hover:scale-105 transition-transform duration-300"
              priority={true}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <h2 className="text-white text-xl font-bold leading-tight mb-2 line-clamp-2">
                {article.title}
              </h2>
              <p className="text-gray-200 text-sm line-clamp-2">
                {article.excerpt}
              </p>
            </div>
          </div>
        </Link>
      </div>
    );
  }

  // Default variant
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/article/${getArticleSlug(article)}`} prefetch={true}>
        <div className="relative h-48 overflow-hidden">
          <OptimizedImage
            src={article.featuredImage || article.imageUrl || '/placeholder.svg'}
            alt={article.title}
            fill
            className="hover:scale-105 transition-transform duration-300"
            priority={false}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
            {article.title}
          </h2>
          <p className="text-gray-600 text-sm mb-2">
            By {getAuthorName(article)} • {new Date(article.publishedAt).toLocaleDateString()}
          </p>
          <p className="text-gray-700 line-clamp-3">{article.excerpt}</p>
        </div>
      </Link>
    </div>
  );
}
