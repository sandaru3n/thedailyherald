'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Save, 
  Eye, 
  Upload, 
  Tag, 
  Settings,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { apiCall } from '@/lib/auth';

interface Category {
  _id: string;
  name: string;
  color: string;
}

export default function NewArticlePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    tags: '',
    featuredImage: '',
    isFeatured: false,
    isBreaking: false,
    status: 'draft',
    seoTitle: '',
    seoDescription: '',
    metaKeywords: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await apiCall('/categories');
      setCategories(data as Category[]);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Auto-generate SEO title and description if empty
    if (name === 'title' && !formData.seoTitle) {
      setFormData(prev => ({
        ...prev,
        seoTitle: value
      }));
    }

    if (name === 'excerpt' && !formData.seoDescription) {
      setFormData(prev => ({
        ...prev,
        seoDescription: value
      }));
    }
  };

  const handleSave = async (publish = false) => {
    if (!formData.title || !formData.content || !formData.category) {
      setError('Please fill in all required fields');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const articleData = {
        ...formData,
        status: publish ? 'published' : formData.status,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        metaKeywords: formData.metaKeywords.split(',').map(keyword => keyword.trim()).filter(keyword => keyword)
      };

      const response = await apiCall('/articles', {
        method: 'POST',
        body: JSON.stringify(articleData)
      });

      setSuccess(publish ? 'Article published successfully!' : 'Article saved as draft!');
      
      // Redirect to articles list after a short delay
      setTimeout(() => {
        router.push('/admin/articles');
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    // Store form data in localStorage for preview
    localStorage.setItem('articlePreview', JSON.stringify(formData));
    window.open('/admin/articles/preview', '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">New Article</h1>
          <p className="text-gray-600 mt-1">Create a new news article</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handlePreview}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleSave(false)}
            disabled={saving}
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Draft'}
          </Button>
          <Button 
            onClick={() => handleSave(true)}
            disabled={saving}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            {saving ? 'Publishing...' : 'Publish'}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Article Content */}
          <Card>
            <CardHeader>
              <CardTitle>Article Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter article title..."
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  placeholder="Brief summary of the article..."
                  rows={3}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  placeholder="Write your article content here..."
                  rows={15}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="featuredImage">Featured Image URL</Label>
                <Input
                  id="featuredImage"
                  name="featuredImage"
                  value={formData.featuredImage}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publishing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Publishing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isFeatured"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleInputChange}
                  className="rounded"
                />
                <Label htmlFor="isFeatured">Featured Article</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isBreaking"
                  name="isBreaking"
                  checked={formData.isBreaking}
                  onChange={handleInputChange}
                  className="rounded"
                />
                <Label htmlFor="isBreaking">Breaking News</Label>
              </div>
            </CardContent>
          </Card>

          {/* Category & Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Tag className="h-5 w-5 mr-2" />
                Category & Tags
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="category">Category *</Label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="tag1, tag2, tag3"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
              </div>
            </CardContent>
          </Card>

          {/* SEO Settings */}
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="seoTitle">SEO Title</Label>
                <Input
                  id="seoTitle"
                  name="seoTitle"
                  value={formData.seoTitle}
                  onChange={handleInputChange}
                  placeholder="SEO optimized title..."
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.seoTitle.length}/60 characters
                </p>
              </div>

              <div>
                <Label htmlFor="seoDescription">SEO Description</Label>
                <Textarea
                  id="seoDescription"
                  name="seoDescription"
                  value={formData.seoDescription}
                  onChange={handleInputChange}
                  placeholder="SEO description for search engines..."
                  rows={3}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.seoDescription.length}/160 characters
                </p>
              </div>

              <div>
                <Label htmlFor="metaKeywords">Meta Keywords</Label>
                <Input
                  id="metaKeywords"
                  name="metaKeywords"
                  value={formData.metaKeywords}
                  onChange={handleInputChange}
                  placeholder="keyword1, keyword2, keyword3"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">Separate keywords with commas</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
