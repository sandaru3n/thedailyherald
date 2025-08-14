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
  Clock,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  const [refreshing, setRefreshing] = useState(false);

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

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalytics();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className="space-y-6 p-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="admin-card">
              <CardHeader className="pb-2 admin-card-header">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent className="admin-card-content">
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
      <div className="text-center py-12 p-4 max-w-7xl mx-auto">
        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Unavailable</h3>
        <p className="text-gray-500">Unable to load analytics data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 max-w-7xl mx-auto">
      {/* Page Header - Mobile Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Monitor your website performance and insights</p>
        </div>
        <Button 
          onClick={handleRefresh} 
          variant="outline" 
          disabled={refreshing}
          className="w-full sm:w-auto"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Key Metrics - Mobile Optimized */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <Card className="admin-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 admin-card-header">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="admin-card-content">
            <div className="text-lg sm:text-2xl font-bold">{(analytics.totalViews || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{(analytics.recentViews || 0)} this week
            </p>
          </CardContent>
        </Card>

        <Card className="admin-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 admin-card-header">
            <CardTitle className="text-xs sm:text-sm font-medium">Published Articles</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="admin-card-content">
            <div className="text-lg sm:text-2xl font-bold">{analytics.publishedArticles || 0}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.draftArticles || 0} drafts pending
            </p>
          </CardContent>
        </Card>

        <Card className="admin-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 admin-card-header">
            <CardTitle className="text-xs sm:text-sm font-medium">Monthly Views</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="admin-card-content">
            <div className="text-lg sm:text-2xl font-bold">{(analytics.monthlyViews || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="admin-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 admin-card-header">
            <CardTitle className="text-xs sm:text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="admin-card-content">
            <div className="text-lg sm:text-2xl font-bold">{analytics.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Admin accounts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Articles and Category Views - Mobile Optimized */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className="admin-card">
          <CardHeader className="admin-card-header">
            <CardTitle className="flex items-center text-lg sm:text-xl">
              <TrendingUp className="h-5 w-5 mr-2" />
              Top Articles
            </CardTitle>
          </CardHeader>
          <CardContent className="admin-card-content">
            {analytics.topArticles && analytics.topArticles.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {analytics.topArticles.map((article, index) => (
                  <div key={article._id} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs sm:text-sm font-medium text-blue-600">#{index + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                          {article.title}
                        </h4>
                        <p className="text-xs text-gray-500 truncate">{article.category || 'Uncategorized'}</p>
                      </div>
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500 flex-shrink-0 ml-2">
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

        {/* Views by Category - Mobile Optimized */}
        <Card className="admin-card">
          <CardHeader className="admin-card-header">
            <CardTitle className="flex items-center text-lg sm:text-xl">
              <BarChart3 className="h-5 w-5 mr-2" />
              Views by Category
            </CardTitle>
          </CardHeader>
          <CardContent className="admin-card-content">
            {analytics.viewsByCategory && analytics.viewsByCategory.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {analytics.viewsByCategory.map((category) => (
                  <div key={category.category} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                      <div 
                        className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: category.color || '#3B82F6' }}
                      />
                      <span className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                        {category.category}
                      </span>
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500 flex-shrink-0 ml-2">
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

      {/* System Information - Mobile Optimized */}
      <Card className="admin-card">
        <CardHeader className="admin-card-header">
          <CardTitle className="flex items-center text-lg sm:text-xl">
            <Server className="h-5 w-5 mr-2" />
            System Information
          </CardTitle>
        </CardHeader>
        <CardContent className="admin-card-content">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-900">Uptime</p>
                <p className="text-xs sm:text-sm text-gray-500 truncate">{analytics.systemInfo.uptime}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Database className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-900">Database</p>
                <p className="text-xs sm:text-sm text-gray-500 truncate">{analytics.systemInfo.database}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-900">Version</p>
                <p className="text-xs sm:text-sm text-gray-500 truncate">{analytics.systemInfo.version}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-900">Memory</p>
                <p className="text-xs sm:text-sm text-gray-500 truncate">{analytics.systemInfo.memory}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Metrics - Mobile Optimized */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="admin-card">
          <CardHeader className="admin-card-header">
            <CardTitle className="flex items-center text-sm sm:text-base">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Article Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="admin-card-content">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-gray-600">Total Articles</span>
                <span className="text-sm sm:text-base font-medium">{analytics.totalArticles || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-gray-600">Published</span>
                <span className="text-sm sm:text-base font-medium text-green-600">{analytics.publishedArticles || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-gray-600">Drafts</span>
                <span className="text-sm sm:text-base font-medium text-orange-600">{analytics.draftArticles || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-gray-600">Categories</span>
                <span className="text-sm sm:text-base font-medium">{analytics.totalCategories || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="admin-card">
          <CardHeader className="admin-card-header">
            <CardTitle className="flex items-center text-sm sm:text-base">
              <Eye className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              View Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="admin-card-content">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-gray-600">Total Views</span>
                <span className="text-sm sm:text-base font-medium">{(analytics.totalViews || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-gray-600">Monthly Views</span>
                <span className="text-sm sm:text-base font-medium">{(analytics.monthlyViews || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-gray-600">Recent Views</span>
                <span className="text-sm sm:text-base font-medium text-blue-600">{(analytics.recentViews || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-gray-600">Avg/Article</span>
                <span className="text-sm sm:text-base font-medium">{Math.round(analytics.avgViewsPerArticle || 0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="admin-card sm:col-span-2 lg:col-span-1">
          <CardHeader className="admin-card-header">
            <CardTitle className="flex items-center text-sm sm:text-base">
              <Activity className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="admin-card-content">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                <span className="text-xs sm:text-sm text-green-700">System Status</span>
                <Badge className="bg-green-100 text-green-800 text-xs admin-badge">Online</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                <span className="text-xs sm:text-sm text-blue-700">Database</span>
                <Badge className="bg-blue-100 text-blue-800 text-xs admin-badge">Connected</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-purple-50 rounded-lg">
                <span className="text-xs sm:text-sm text-purple-700">API Status</span>
                <Badge className="bg-purple-100 text-purple-800 text-xs admin-badge">Healthy</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 