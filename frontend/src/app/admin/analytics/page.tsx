'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  FileText, 
  Eye, 
  Calendar,
  Activity,
  Server,
  Database,
  Globe,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiCall } from '@/lib/auth';

interface AnalyticsData {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  totalViews: number;
  totalUsers: number;
  totalCategories: number;
  recentViews: number;
  monthlyViews: number;
  topArticles: Array<{
    _id: string;
    title: string;
    views: number;
    slug: string;
  }>;
  viewsByCategory: Array<{
    category: string;
    views: number;
    color: string;
  }>;
  systemInfo: {
    uptime: string;
    memory: string;
    database: string;
    version: string;
  };
}

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      // In a real app, you'd have dedicated analytics endpoints
      // For now, we'll simulate the data
      const mockData: AnalyticsData = {
        totalArticles: 45,
        publishedArticles: 38,
        draftArticles: 7,
        totalViews: 12540,
        totalUsers: 3,
        totalCategories: 8,
        recentViews: 234,
        monthlyViews: 3420,
        topArticles: [
          { _id: '1', title: 'Breaking News: Major Economic Shift', views: 1240, slug: 'breaking-news-major-economic-shift' },
          { _id: '2', title: 'Technology Trends 2024', views: 890, slug: 'technology-trends-2024' },
          { _id: '3', title: 'Sports Championship Results', views: 756, slug: 'sports-championship-results' },
          { _id: '4', title: 'Health and Wellness Guide', views: 634, slug: 'health-wellness-guide' },
          { _id: '5', title: 'Environmental Policy Changes', views: 521, slug: 'environmental-policy-changes' }
        ],
        viewsByCategory: [
          { category: 'Politics', views: 3200, color: '#3B82F6' },
          { category: 'Technology', views: 2800, color: '#10B981' },
          { category: 'Sports', views: 2100, color: '#F59E0B' },
          { category: 'Health', views: 1800, color: '#EF4444' },
          { category: 'Entertainment', views: 1500, color: '#8B5CF6' },
          { category: 'Business', views: 1200, color: '#06B6D4' }
        ],
        systemInfo: {
          uptime: '15 days, 8 hours',
          memory: '2.4 GB / 8 GB',
          database: 'MongoDB 7.0.4',
          version: '1.0.0'
        }
      };
      
      setAnalytics(mockData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Unavailable</h3>
        <p className="text-gray-500">Unable to load analytics data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-1">Monitor your website performance and insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{analytics.recentViews} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published Articles</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.publishedArticles}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.draftArticles} drafts pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Views</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.monthlyViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Admin accounts
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Articles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Top Articles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topArticles.map((article, index) => (
                <div key={article._id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">#{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {article.title}
                      </h4>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {article.views.toLocaleString()} views
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Views by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Views by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.viewsByCategory.map((category) => (
                <div key={category.category} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-sm font-medium text-gray-900">
                      {category.category}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {category.views.toLocaleString()} views
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Server className="h-5 w-5 mr-2" />
            System Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Activity className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Uptime</p>
                <p className="text-sm text-gray-500">{analytics.systemInfo.uptime}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Database className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Database</p>
                <p className="text-sm text-gray-500">{analytics.systemInfo.database}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Globe className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Version</p>
                <p className="text-sm text-gray-500">{analytics.systemInfo.version}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Memory</p>
                <p className="text-sm text-gray-500">{analytics.systemInfo.memory}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {analytics.totalArticles}
              </div>
              <p className="text-sm text-gray-600">Total Articles</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {analytics.totalCategories}
              </div>
              <p className="text-sm text-gray-600">Categories</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {Math.round(analytics.totalViews / analytics.totalArticles)}
              </div>
              <p className="text-sm text-gray-600">Avg Views per Article</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 