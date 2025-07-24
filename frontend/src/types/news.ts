export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  category: string;
  imageUrl: string;
  publishedAt: Date;
  isFeatured: boolean;
  tags: string[];
  readTime: number;
}

export interface NewsCategory {
  id: string;
  name: string;
  slug: string;
  color: string;
}

export const NEWS_CATEGORIES: NewsCategory[] = [
  { id: '1', name: 'Politics', slug: 'politics', color: 'bg-red-500' },
  { id: '2', name: 'Business', slug: 'business', color: 'bg-blue-500' },
  { id: '3', name: 'Technology', slug: 'technology', color: 'bg-green-500' },
  { id: '4', name: 'Sports', slug: 'sports', color: 'bg-orange-500' },
  { id: '5', name: 'Entertainment', slug: 'entertainment', color: 'bg-purple-500' },
  { id: '6', name: 'Health', slug: 'health', color: 'bg-pink-500' },
  { id: '7', name: 'World', slug: 'world', color: 'bg-indigo-500' },
];
