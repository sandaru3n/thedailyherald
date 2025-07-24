'use client';

import { NewsArticle, NEWS_CATEGORIES } from '@/types/news';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface NewsCardProps {
  article: NewsArticle;
  variant?: 'default' | 'featured' | 'compact';
}

export default function NewsCard({ article, variant = 'default' }: NewsCardProps) {
  const router = useRouter();
  const category = NEWS_CATEGORIES.find(cat => cat.name === article.category);
  const publishedDate = new Date(article.publishedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const handleClick = () => {
    router.push(`/article/${article.id}`);
  };

  if (variant === 'featured') {
    return (
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group" onClick={handleClick}>
        <div className="relative h-80">
          <Image
            src={article.imageUrl}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <Badge
              className={`${category?.color} text-white mb-3`}
            >
              {article.category}
            </Badge>
            <h2 className="text-white text-2xl font-bold leading-tight mb-2">
              {article.title}
            </h2>
            <p className="text-gray-200 text-sm mb-3 line-clamp-2">
              {article.excerpt}
            </p>
            <div className="flex items-center gap-4 text-gray-300 text-xs">
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>{article.author}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{article.readTime} min read</span>
              </div>
              <span>{publishedDate}</span>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  if (variant === 'compact') {
    return (
      <Card className="hover:shadow-md transition-shadow cursor-pointer group" onClick={handleClick}>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative w-20 h-20 flex-shrink-0">
              <Image
                src={article.imageUrl}
                alt={article.title}
                fill
                className="object-cover rounded"
              />
            </div>
            <div className="flex-1 min-w-0">
              <Badge
                variant="secondary"
                className={`${category?.color} text-white text-xs mb-2`}
              >
                {article.category}
              </Badge>
              <h3 className="font-semibold text-sm leading-tight mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                {article.title}
              </h3>
              <div className="flex items-center gap-2 text-gray-500 text-xs">
                <span>{publishedDate}</span>
                <span>•</span>
                <span>{article.readTime} min</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group" onClick={handleClick}>
      <div className="relative h-48">
        <Image
          src={article.imageUrl}
          alt={article.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <CardHeader className="pb-2">
        <Badge
          variant="secondary"
          className={`${category?.color} text-white w-fit`}
        >
          {article.category}
        </Badge>
      </CardHeader>
      <CardContent className="pt-0">
        <h3 className="font-bold text-lg leading-tight mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
          {article.title}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {article.excerpt}
        </p>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span>{article.author}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{article.readTime} min</span>
            </div>
            <span>{publishedDate}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
