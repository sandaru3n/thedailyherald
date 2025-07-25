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
  avgViewsPerArticle: number;
  topArticles: Array<{
    _id: string;
    title: string;
    views: number;
    slug: string;
    category?: string;
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
      const response = await apiCall('/admin/analytics') as { success: boolean; analytics?: AnalyticsData };
      
      if (response.success && response.analytics) {
        // Ensure all properties have default values to prevent undefined errors
        const safeAnalytics: AnalyticsData = {
          totalArticles: response.analytics.totalArticles || 0,
          publishedArticles: response.analytics.publishedArticles || 0,
          draftArticles: response.analytics.draftArticles || 0,
          totalViews: response.analytics.totalViews || 0,
          totalUsers: response.analytics.totalUsers || 0,
          totalCategories: response.analytics.totalCategories || 0,
          recentViews: response.analytics.recentViews || 0,
          monthlyViews: response.analytics.monthlyViews || 0,
          avgViewsPerArticle: response.analytics.avgViewsPerArticle || 0,
          topArticles: response.analytics.topArticles || [],
          viewsByCategory: response.analytics.viewsByCategory || [],
          systemInfo: {
            uptime: response.analytics.systemInfo?.uptime || '0 days, 0 hours',
            memory: response.analytics.systemInfo?.memory || '0 MB / 0 MB',
            database: response.analytics.systemInfo?.database || 'MongoDB',
            version: response.analytics.systemInfo?.version || '1.0.0'
          }
        };
        setAnalytics(safeAnalytics);
      } else {
        throw new Error('Failed to fetch analytics data');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Fallback to empty analytics if API fails
      setAnalytics({
        totalArticles: 0,
        publishedArticles: 0,
        draftArticles: 0,
        totalViews: 0,
        totalUsers: 0,
        totalCategories: 0,
        recentViews: 0,
        monthlyViews: 0,
        avgViewsPerArticle: 0,
        topArticles: [],
        viewsByCategory: [],
        systemInfo: {
          uptime: '0 days, 0 hours',
          memory: '0 MB / 0 MB',
          database: 'MongoDB',
          version: '1.0.0'
        }
      });
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
            <div className="text-2xl font-bold">{(analytics.totalViews || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{(analytics.recentViews || 0)} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published Articles</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.publishedArticles || 0}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.draftArticles || 0} drafts pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Views</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(analytics.monthlyViews || 0).toLocaleString()}</div>
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
            <div className="text-2xl font-bold">{analytics.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Admin accounts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Articles - Show message if no articles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Top Articles
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.topArticles && analytics.topArticles.length > 0 ? (
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
                        <p className="text-xs text-gray-500">{article.category || 'Uncategorized'}</p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {(article.views || 0).toLocaleString()} views
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <TrendingUp className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No articles with views yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Views by Category - Show message if no data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Views by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.viewsByCategory && analytics.viewsByCategory.length > 0 ? (
              <div className="space-y-4">
                {analytics.viewsByCategory.map((category) => (
                  <div key={category.category} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color || '#3B82F6' }}
                      />
                      <span className="text-sm font-medium text-gray-900">
                        {category.category}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {(category.views || 0).toLocaleString()} views
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No category views data yet</p>
              </div>
            )}
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
    </div>
  );
} 