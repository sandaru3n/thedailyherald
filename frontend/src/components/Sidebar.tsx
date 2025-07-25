import { NewsArticle } from '@/types/news';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TrendingUp, Calendar, Users, Eye } from 'lucide-react';
import { ArticleCard } from './NewsCard';

interface SidebarProps {
  trendingNews: NewsArticle[];
}

export default function Sidebar({ trendingNews }: SidebarProps) {
  const popularTags = ['Politics', 'Technology', 'Sports', 'Business', 'Health'];

  // Helper function to get author name
  const getAuthorName = (article: NewsArticle) => {
    if (typeof article.author === 'string') {
      return article.author;
    }
    return article.author?.name || 'Unknown Author';
  };

  // Helper function to get article ID
  const getArticleId = (article: NewsArticle) => {
    return article._id || article.id;
  };

  return (
    <aside className="space-y-4 sm:space-y-6">
      {/* Trending News */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
            Trending Now
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          {trendingNews.slice(0, 5).map((article, index) => (
            <div key={getArticleId(article)}>
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="bg-red-500 text-white text-xs font-bold rounded px-1.5 sm:px-2 py-0.5 sm:py-1 mt-0.5 sm:mt-1 flex-shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-xs sm:text-sm leading-tight mb-1 hover:text-blue-600 cursor-pointer transition-colors line-clamp-2">
                    {article.title}
                  </h4>
                  <div className="flex items-center gap-1 sm:gap-2 text-xs text-gray-500">
                    <span className="hidden sm:inline">{getAuthorName(article)}</span>
                    <span className="sm:hidden">{getAuthorName(article).split(' ')[0]}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>{new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
              </div>
              {index < trendingNews.length - 1 && <Separator className="mt-3 sm:mt-4" />}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Latest News */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
            Latest News
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          {trendingNews.slice(0, 3).map((article) => (
            <ArticleCard key={getArticleId(article)} article={article} variant="compact" />
          ))}
        </CardContent>
      </Card>

      {/* Popular Tags */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
            Popular Topics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {popularTags.map((tag, index) => (
              <Badge
                key={tag}
                variant="outline"
                className="cursor-pointer hover:bg-slate-100 transition-colors text-xs"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Newsletter Signup */}
      <Card className="bg-slate-900 text-white">
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Users className="h-4 w-4 sm:h-5 sm:w-5" />
            Newsletter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs sm:text-sm text-gray-300 mb-3 sm:mb-4">
            Get the latest news delivered straight to your inbox every morning.
          </p>
          <div className="space-y-2 sm:space-y-3">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-white/10 border border-white/20 rounded text-xs sm:text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-1.5 sm:py-2 rounded text-xs sm:text-sm font-medium transition-colors">
              Subscribe
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Advertisement Placeholder */}
      <Card className="bg-gray-100">
        <CardContent className="p-4 sm:p-8 text-center">
          <div className="text-gray-400 text-xs sm:text-sm">
            Advertisement
          </div>
          <div className="mt-1 sm:mt-2 text-xs text-gray-500">
            300 x 250
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
