'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SAMPLE_NEWS } from '@/data/sampleNews';
import { NewsArticle } from '@/types/news';
import {
  FileText,
  Users,
  Eye,
  TrendingUp,
  Plus,
  Edit,
  Calendar,
  Clock
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Load articles from localStorage or use sample data
    const savedArticles = localStorage.getItem('newsArticles');
    if (savedArticles) {
      setArticles(JSON.parse(savedArticles));
    } else {
      setArticles(SAMPLE_NEWS);
      localStorage.setItem('newsArticles', JSON.stringify(SAMPLE_NEWS));
    }
  }, []);

  const stats = {
    totalArticles: articles.length,
    publishedToday: articles.filter(article => {
      const today = new Date();
      const articleDate = new Date(article.publishedAt);
      return articleDate.toDateString() === today.toDateString();
    }).length,
    featuredArticles: articles.filter(article => article.isFeatured).length,
    totalViews: 12543, // Mock data
  };

  const recentArticles = articles
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 5);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
          </div>
          <Button onClick={() => router.push('/admin/articles/new')}>
            <Plus className="h-4 w-4 mr-2" />
            New Article
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalArticles}</div>
              <p className="text-xs text-muted-foreground">
                +2 from last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Published Today</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.publishedToday}</div>
              <p className="text-xs text-muted-foreground">
                Articles published today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Featured</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.featuredArticles}</div>
              <p className="text-xs text-muted-foreground">
                Featured articles
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Articles */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Recent Articles
                <Button variant="outline" size="sm" onClick={() => router.push('/admin/articles')}>
                  View All
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentArticles.map((article) => (
                  <div key={article.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-gray-900 truncate">
                        {article.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {typeof article.category === 'string' ? article.category : article.category.name}
                        </Badge>
                        {article.isFeatured && (
                          <Badge className="text-xs bg-yellow-100 text-yellow-800">
                            Featured
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{typeof article.author === 'string' ? article.author : article.author.name}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="ml-4">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button
                  className="w-full justify-start"
                  onClick={() => router.push('/admin/articles/new')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Article
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push('/admin/articles')}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Manage Articles
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push('/admin/analytics')}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push('/')}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview Website
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
