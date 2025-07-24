import { NewsArticle } from '@/types/news';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TrendingUp, Calendar, Users, Eye } from 'lucide-react';
import NewsCard from './NewsCard';

interface SidebarProps {
  trendingNews: NewsArticle[];
}

export default function Sidebar({ trendingNews }: SidebarProps) {
  const popularTags = ['Politics', 'Technology', 'Sports', 'Business', 'Health'];

  return (
    <aside className="space-y-6">
      {/* Trending News */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-red-500" />
            Trending Now
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {trendingNews.slice(0, 5).map((article, index) => (
            <div key={article.id}>
              <div className="flex items-start gap-3">
                <div className="bg-red-500 text-white text-xs font-bold rounded px-2 py-1 mt-1">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm leading-tight mb-1 hover:text-blue-600 cursor-pointer transition-colors line-clamp-2">
                    {article.title}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{article.author}</span>
                    <span>•</span>
                    <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              {index < trendingNews.length - 1 && <Separator className="mt-4" />}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Latest News */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-blue-500" />
            Latest News
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {trendingNews.slice(0, 3).map((article) => (
            <NewsCard key={article.id} article={article} variant="compact" />
          ))}
        </CardContent>
      </Card>

      {/* Popular Tags */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Eye className="h-5 w-5 text-green-500" />
            Popular Topics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {popularTags.map((tag, index) => (
              <Badge
                key={tag}
                variant="outline"
                className="cursor-pointer hover:bg-slate-100 transition-colors"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Newsletter Signup */}
      <Card className="bg-slate-900 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5" />
            Newsletter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-300 mb-4">
            Get the latest news delivered straight to your inbox every morning.
          </p>
          <div className="space-y-3">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm font-medium transition-colors">
              Subscribe
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Advertisement Placeholder */}
      <Card className="bg-gray-100">
        <CardContent className="p-8 text-center">
          <div className="text-gray-400 text-sm">
            Advertisement
          </div>
          <div className="mt-2 text-xs text-gray-500">
            300 x 250
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
