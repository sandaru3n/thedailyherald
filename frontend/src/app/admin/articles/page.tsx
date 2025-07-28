'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2,
  CheckCircle,
  Clock,
  Archive,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { apiCall } from '@/lib/auth';

interface Article {
  _id: string;
  title: string;
  slug: string;
  status: 'draft' | 'published' | 'archived';
  isFeatured: boolean;
  isBreaking: boolean;
  views: number;
  readTime: number;
  publishedAt?: string;
  createdAt: string;
  category: {
    _id: string;
    name: string;
    color: string;
  };
  author: {
    _id: string;
    name: string;
  };
}

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        sort: '-createdAt'
      });

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await apiCall(`/articles?${params.toString()}`) as { success: boolean; docs?: Article[]; totalPages?: number };
      if (response.success) {
        setArticles(response.docs || []);
        setTotalPages(response.totalPages || 1);
      } else {
        throw new Error('Failed to fetch articles');
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
      setError('Failed to load articles');
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, searchTerm]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchArticles();
  };

  const handleStatusChange = async (articleId: string, newStatus: string) => {
    try {
      setError('');
      const response = await apiCall(`/articles/${articleId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      }) as { success: boolean; error?: string };
      if (response.success) {
        setSuccess(`Article ${newStatus} successfully!`);
        fetchArticles(); // Refresh the list
      } else {
        throw new Error(response.error || 'Failed to update article status');
      }
    } catch (error) {
      console.error('Error updating article status:', error);
      setError(error instanceof Error ? error.message : 'Failed to update article status');
    }
  };

  const handleDelete = async (articleId: string) => {
    if (!confirm('Are you sure you want to delete this article? This action cannot be undone.')) return;
    
    try {
      setError('');
      const response = await apiCall(`/articles/${articleId}`, {
        method: 'DELETE'
      }) as { success: boolean; error?: string };
      if (response.success) {
        setSuccess('Article deleted successfully!');
        fetchArticles(); // Refresh the list
      } else {
        throw new Error(response.error || 'Failed to delete article');
      }
    } catch (error) {
      console.error('Error deleting article:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete article');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-100 text-green-800">Published</Badge>;
      case 'draft':
        return <Badge className="bg-yellow-100 text-yellow-800">Draft</Badge>;
      case 'archived':
        return <Badge className="bg-gray-100 text-gray-800">Archived</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Articles</h1>
          <p className="text-gray-600 mt-1">Manage your news articles</p>
        </div>
        <Button asChild>
          <Link href="/admin/articles/new">
            <Plus className="h-4 w-4 mr-2" />
            New Article
          </Link>
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </form>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Articles Table */}
      <Card>
        <CardHeader>
          <CardTitle>Articles ({articles.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="h-4 bg-gray-200 rounded animate-pulse flex-1"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                </div>
              ))}
            </div>
          ) : articles.length > 0 ? (
            <div className="space-y-4">
              {articles.map((article) => (
                <div key={article._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {article.title}
                      </h3>
                      {article.isFeatured && (
                        <TrendingUp className="h-4 w-4 text-yellow-500" />
                      )}
                      {article.isBreaking && (
                        <Badge className="bg-red-100 text-red-800 text-xs">Breaking</Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                      <span 
                        className="inline-flex items-center space-x-1"
                        style={{ color: article.category?.color }}
                      >
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: article.category?.color }}></span>
                        <span>{article.category?.name}</span>
                      </span>
                      <span>by {article.author?.name}</span>
                      <span>{article.views || 0} views</span>
                      <span>{article.readTime || 5} min read</span>
                      {article.publishedAt && (
                        <span>{formatDate(article.publishedAt)}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(article.status)}
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/article/${article.slug}`} className="flex items-center">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/articles/${article._id}/edit`} className="flex items-center">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        {article.status === 'draft' && (
                          <DropdownMenuItem 
                            onClick={() => handleStatusChange(article._id, 'published')}
                            className="flex items-center"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Publish
                          </DropdownMenuItem>
                        )}
                        {article.status === 'published' && (
                          <DropdownMenuItem 
                            onClick={() => handleStatusChange(article._id, 'archived')}
                            className="flex items-center"
                          >
                            <Archive className="h-4 w-4 mr-2" />
                            Archive
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          onClick={() => handleDelete(article._id)}
                          className="flex items-center text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Get started by creating your first article'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button asChild>
                  <Link href="/admin/articles/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Article
                  </Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
