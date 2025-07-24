'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SAMPLE_NEWS } from '@/data/sampleNews';
import { NewsArticle, NEWS_CATEGORIES } from '@/types/news';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Filter,
  Calendar
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function ArticlesPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, articleId: '' });
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

  const filteredArticles = categoryFilter === 'All'
    ? articles
    : articles.filter(article => article.category === categoryFilter);

  const handleDeleteArticle = (articleId: string) => {
    const updatedArticles = articles.filter(article => article.id !== articleId);
    setArticles(updatedArticles);
    localStorage.setItem('newsArticles', JSON.stringify(updatedArticles));
    setDeleteDialog({ open: false, articleId: '' });
  };

  const toggleFeatured = (articleId: string) => {
    const updatedArticles = articles.map(article =>
      article.id === articleId
        ? { ...article, isFeatured: !article.isFeatured }
        : article
    );
    setArticles(updatedArticles);
    localStorage.setItem('newsArticles', JSON.stringify(updatedArticles));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Articles</h1>
            <p className="text-gray-600 mt-1">Manage all your news articles</p>
          </div>
          <Button onClick={() => router.push('/admin/articles/new')}>
            <Plus className="h-4 w-4 mr-2" />
            New Article
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="All">All Categories</option>
                  {NEWS_CATEGORIES.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Articles List */}
        <Card>
          <CardHeader>
            <CardTitle>
              {filteredArticles.length} Article{filteredArticles.length !== 1 ? 's' : ''}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredArticles.map((article) => (
                <div key={article.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  {/* Article Image */}
                  <div className="relative w-16 h-16 flex-shrink-0">
                    <Image
                      src={article.imageUrl}
                      alt={article.title}
                      fill
                      className="object-cover rounded"
                    />
                  </div>

                  {/* Article Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {article.title}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                          {article.excerpt}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary">
                            {article.category}
                          </Badge>
                          {article.isFeatured && (
                            <Badge className="bg-yellow-100 text-yellow-800">
                              Featured
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                      </div>
                      <span>•</span>
                      <span>{article.author}</span>
                      <span>•</span>
                      <span>{article.readTime} min read</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleFeatured(article.id)}
                    >
                      {article.isFeatured ? 'Unfeature' : 'Feature'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/admin/articles/edit/${article.id}`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteDialog({ open: true, articleId: article.id })}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {filteredArticles.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-lg mb-2">No articles found</div>
                  <p className="text-gray-500">Try adjusting your filters</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, articleId: '' })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Article</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this article? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteDialog({ open: false, articleId: '' })}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDeleteArticle(deleteDialog.articleId)}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
