export interface NewsArticle {
  _id: string;
  id?: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author: {
    _id: string;
    name: string;
    profilePicture?: string;
    description?: string;
  };
  category: {
    _id: string;
    name: string;
    color: string;
    slug: string;
  };
  imageUrl?: string;
  featuredImage?: string;
  publishedAt: Date | string;
  isFeatured?: boolean;
  isBreaking?: boolean;
  tags?: string[];
  readTime?: number;
  status?: string;
  views?: number;
  seoTitle?: string;
  seoDescription?: string;
  metaKeywords?: string[];
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

// Alias for compatibility with ArticleCard component
export type Article = NewsArticle;

export interface NewsCategory {
  _id: string;
  id?: string;
  name: string;
  slug: string;
  color: string;
  articleCount?: number;
}

export const NEWS_CATEGORIES: NewsCategory[] = [
  { _id: '1', name: 'Politics', slug: 'politics', color: 'bg-red-500' },
  { _id: '2', name: 'Business', slug: 'business', color: 'bg-blue-500' },
  { _id: '3', name: 'Technology', slug: 'technology', color: 'bg-green-500' },
  { _id: '4', name: 'Sports', slug: 'sports', color: 'bg-orange-500' },
  { _id: '5', name: 'Entertainment', slug: 'entertainment', color: 'bg-purple-500' },
  { _id: '6', name: 'Health', slug: 'health', color: 'bg-pink-500' },
  { _id: '7', name: 'World', slug: 'world', color: 'bg-indigo-500' },
];
