'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  GripVertical,
  FolderOpen,
  Eye,
  EyeOff,
  Globe, 
  TrendingUp, 
  Briefcase, 
  Gamepad2, 
  Music, 
  Heart, 
  Zap,
  Palette,
  Camera,
  Car,
  BookOpen,
  Users,
  Newspaper,
  BriefcaseBusiness,
  Clapperboard,
  HeartPulse,
  Vote,
  Trophy,
  Cpu,
  CloudRainWind
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { apiCall } from '@/lib/auth';

interface Category {
  _id: string;
  name: string;
  description: string;
  slug: string;
  color: string;
  icon: string;
  isActive: boolean;
  order: number;
  articleCount: number;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    icon: 'newspaper',
    isActive: true
  });

  // Filter categories based on status
  const filteredCategories = categories.filter(category => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'active') return category.isActive;
    if (statusFilter === 'inactive') return !category.isActive;
    return true;
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await apiCall('/categories/admin') as Category[] | { success: boolean; categories?: Category[] };
      
      // Handle both old and new API response formats
      if (Array.isArray(data)) {
        setCategories(data);
      } else if (data.success && data.categories) {
        setCategories(data.categories);
      } else {
        setCategories([]);
        console.error('Invalid categories data format:', data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to load categories');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Category name is required');
      return;
    }

    try {
      setError('');
      setSuccess('');

      if (editingCategory) {
        await apiCall(`/categories/${editingCategory._id}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });
        setSuccess('Category updated successfully!');
      } else {
        await apiCall('/categories', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
        setSuccess('Category created successfully!');
      }

      resetForm();
      fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      color: category.color,
      icon: category.icon,
      isActive: category.isActive
    });
    setShowForm(true);
  };

  const handleDelete = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }

    try {
      await apiCall(`/categories/${categoryId}`, {
        method: 'DELETE'
      });
      setSuccess('Category deleted successfully!');
      fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete category');
    }
  };

  const handleToggleActive = async (categoryId: string, currentStatus: boolean) => {
    try {
      await apiCall(`/categories/${categoryId}`, {
        method: 'PUT',
        body: JSON.stringify({ isActive: !currentStatus })
      });
      fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update category');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      color: '#3B82F6',
      icon: 'newspaper',
      isActive: true
    });
    setEditingCategory(null);
    setShowForm(false);
  };

  const colorOptions = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
  ];

  const iconOptions = [
    { name: 'Globe', component: Globe },
    { name: 'TrendingUp', component: TrendingUp },
    { name: 'Briefcase', component: Briefcase },
    { name: 'Gamepad2', component: Gamepad2 },
    { name: 'Music', component: Music },
    { name: 'Heart', component: Heart },
    { name: 'Zap', component: Zap },
    { name: 'Palette', component: Palette },
    { name: 'Camera', component: Camera },
    { name: 'Car', component: Car },
    { name: 'BookOpen', component: BookOpen },
    { name: 'Users', component: Users },
    { name: 'Newspaper', component: Newspaper },
    { name: 'BriefcaseBusiness', component: BriefcaseBusiness },
    { name: 'Clapperboard', component: Clapperboard },
    { name: 'HeartPulse', component: HeartPulse },
    { name: 'Vote', component: Vote },
    { name: 'Trophy', component: Trophy },
    { name: 'Cpu', component: Cpu },
    { name: 'CloudRainWind', component: CloudRainWind }
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600 mt-1">Manage news categories</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          New Category
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

      {/* Category Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {editingCategory ? 'Edit Category' : 'New Category'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter category name"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="color">Color</Label>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-1">
                    <Input
                      id="color"
                      name="color"
                      type="color"
                      value={formData.color}
                      onChange={handleInputChange}
                      className="w-full sm:w-16 h-10 p-1"
                    />
                    <div className="flex flex-wrap gap-2">
                      {colorOptions.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, color }))}
                          className="w-8 h-8 rounded border-2 border-gray-300 hover:border-gray-400 transition-colors"
                          style={{ backgroundColor: color }}
                          aria-label={`Select color ${color}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="icon">Icon</Label>
                  <div className="grid grid-cols-5 gap-2 mt-1">
                    {iconOptions.map((iconOption) => {
                      const IconComponent = iconOption.component;
                      const isSelected = formData.icon === iconOption.name;
                      return (
                        <button
                          key={iconOption.name}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, icon: iconOption.name }))}
                          className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                            isSelected 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          aria-label={`Select icon ${iconOption.name}`}
                        >
                          <IconComponent className="w-5 h-5 mx-auto" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Brief description of the category"
                  className="mt-1"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="rounded"
                />
                <Label htmlFor="isActive">Active</Label>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button type="submit" className="w-full sm:w-auto">
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm} className="w-full sm:w-auto">
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Categories List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-lg">Categories ({filteredCategories.length})</CardTitle>
            <div className="flex items-center gap-2">
              <Label htmlFor="statusFilter" className="text-sm font-medium">Filter:</Label>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 p-4 border rounded-lg">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-6"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse flex-1"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                </div>
              ))}
            </div>
          ) : filteredCategories.length > 0 ? (
            <div className="space-y-4">
              {filteredCategories.map((category) => (
                <div key={category._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 gap-4">
                  <div className="flex items-center space-x-4">
                    <GripVertical className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: category.color }}
                      />
                      {(() => {
                        const iconOption = iconOptions.find(opt => opt.name === category.icon);
                        const IconComponent = iconOption?.component || Newspaper;
                        return (
                          <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: category.color + '20' }}>
                            <IconComponent className="w-3 h-3" style={{ color: category.color }} />
                          </div>
                        );
                      })()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 break-words">
                        {category.name}
                      </h3>
                      {category.description && (
                        <p className="text-sm text-gray-500 break-words">
                          {category.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="text-left sm:text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {category.articleCount} articles
                      </div>
                      <div className="text-xs text-gray-500">
                        Order: {category.order}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end space-x-2">
                      {category.isActive ? (
                        <Badge className="bg-green-100 text-green-800 text-xs">Active</Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800 text-xs">Inactive</Badge>
                      )}

                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(category._id, category.isActive)}
                          className="h-8 w-8 p-0"
                        >
                          {category.isActive ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                          <span className="sr-only">
                            {category.isActive ? 'Deactivate' : 'Activate'} category
                          </span>
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(category)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit category</span>
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(category._id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete category</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FolderOpen className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {statusFilter === 'all' ? 'No categories yet' : `No ${statusFilter} categories`}
              </h3>
              <p className="text-gray-500 mb-4 px-4">
                {statusFilter === 'all' 
                  ? 'Create your first category to organize your articles'
                  : `No ${statusFilter} categories found. Try changing the filter or create a new category.`
                }
              </p>
              {statusFilter === 'all' && (
                <Button onClick={() => setShowForm(true)} className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Category
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 