'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Save, 
  ExternalLink,
  Home,
  Info,
  FileText,
  Settings,
  Contact,
  Globe
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { apiCall } from '@/lib/auth';

interface NavigationItem {
  id: string;
  label: string;
  url: string;
  icon: string;
  type: 'link' | 'category';
  order: number;
  isActive: boolean;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  color?: string;
}

const defaultIcons = [
  { value: 'home', label: 'Home', icon: Home },
  { value: 'info', label: 'Info', icon: Info },
  { value: 'file-text', label: 'Articles', icon: FileText },
  { value: 'settings', label: 'Settings', icon: Settings },
  { value: 'contact', label: 'Contact', icon: Contact },
  { value: 'globe', label: 'External', icon: Globe },
];

export default function NavigationManagementPage() {
  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState<Partial<NavigationItem>>({
    label: '',
    url: '',
    icon: 'home',
    type: 'link',
    isActive: true
  });

  useEffect(() => {
    fetchNavigationData();
  }, []);

  const fetchNavigationData = async () => {
    try {
      setLoading(true);
      
      // Fetch current navigation items from localStorage or API
      const savedNavigation = localStorage.getItem('customNavigation');
      if (savedNavigation) {
        setNavigationItems(JSON.parse(savedNavigation));
      } else {
        // Set default navigation items
        const defaultItems: NavigationItem[] = [
          {
            id: 'home',
            label: 'Home',
            url: '/',
            icon: 'home',
            type: 'link',
            order: 1,
            isActive: true
          },
          {
            id: 'about',
            label: 'About',
            url: '/about',
            icon: 'info',
            type: 'link',
            order: 2,
            isActive: true
          },
          {
            id: 'contact',
            label: 'Contact',
            url: '/contact',
            icon: 'contact',
            type: 'link',
            order: 3,
            isActive: true
          }
        ];
        setNavigationItems(defaultItems);
      }

      // Fetch categories for category type items
      try {
        const categoriesResponse = await apiCall('/categories') as Category[] | { success: boolean; categories?: Category[] };
        if (Array.isArray(categoriesResponse)) {
          setCategories(categoriesResponse);
        } else if (categoriesResponse.success && categoriesResponse.categories) {
          setCategories(categoriesResponse.categories);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    } catch (error) {
      console.error('Error fetching navigation data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNavigation = async () => {
    try {
      setSaving(true);
      
      // Save to localStorage (in a real app, you'd save to your backend)
      localStorage.setItem('customNavigation', JSON.stringify(navigationItems));
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Navigation settings saved successfully!');
    } catch (error) {
      console.error('Error saving navigation:', error);
      alert('Failed to save navigation settings');
    } finally {
      setSaving(false);
    }
  };

  const addNavigationItem = () => {
    if (!newItem.label || !newItem.url) {
      alert('Please fill in all required fields');
      return;
    }

    const item: NavigationItem = {
      id: Date.now().toString(),
      label: newItem.label!,
      url: newItem.url!,
      icon: newItem.icon!,
      type: newItem.type!,
      order: navigationItems.length + 1,
      isActive: newItem.isActive!
    };

    setNavigationItems([...navigationItems, item]);
    setNewItem({
      label: '',
      url: '',
      icon: 'home',
      type: 'link',
      isActive: true
    });
    setShowAddForm(false);
  };

  const removeNavigationItem = (id: string) => {
    setNavigationItems(navigationItems.filter(item => item.id !== id));
  };

  const toggleItemActive = (id: string) => {
    setNavigationItems(navigationItems.map(item => 
      item.id === id ? { ...item, isActive: !item.isActive } : item
    ));
  };

  const moveItem = (id: string, direction: 'up' | 'down') => {
    const currentIndex = navigationItems.findIndex(item => item.id === id);
    if (currentIndex === -1) return;

    const newItems = [...navigationItems];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex >= 0 && targetIndex < newItems.length) {
      [newItems[currentIndex], newItems[targetIndex]] = [newItems[targetIndex], newItems[currentIndex]];
      setNavigationItems(newItems);
    }
  };

  const getIconComponent = (iconName: string) => {
    const iconData = defaultIcons.find(icon => icon.value === iconName);
    return iconData ? iconData.icon : Home;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Navigation Management</h1>
          <p className="text-gray-600 mt-1">Customize your mobile navigation menu</p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={handleSaveNavigation} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Navigation Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Navigation Items</span>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </CardTitle>
          <CardDescription>
            Manage the items that appear in your mobile navigation menu. Drag to reorder or click to edit.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {navigationItems.map((item, index) => {
              const IconComponent = getIconComponent(item.icon);
              return (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-4 border rounded-lg ${
                    item.isActive ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <GripVertical className="h-5 w-5 text-gray-400 cursor-move" />
                    <IconComponent className="h-5 w-5 text-gray-600" />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{item.label}</span>
                        <Badge variant={item.type === 'category' ? 'default' : 'secondary'}>
                          {item.type}
                        </Badge>
                        {!item.isActive && (
                          <Badge variant="outline">Inactive</Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <ExternalLink className="h-3 w-3" />
                        <span>{item.url}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleItemActive(item.id)}
                    >
                      {item.isActive ? 'Active' : 'Inactive'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveItem(item.id, 'up')}
                      disabled={index === 0}
                    >
                      ↑
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveItem(item.id, 'down')}
                      disabled={index === navigationItems.length - 1}
                    >
                      ↓
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeNavigationItem(item.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
            
            {navigationItems.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Globe className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No navigation items yet</p>
                <Button onClick={() => setShowAddForm(true)} className="mt-4">
                  Add your first navigation item
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add New Item Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add Navigation Item</CardTitle>
            <CardDescription>
              Create a new navigation item for your mobile menu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="label">Label</Label>
                  <Input
                    id="label"
                    value={newItem.label}
                    onChange={(e) => setNewItem({ ...newItem, label: e.target.value })}
                    placeholder="e.g., About Us"
                  />
                </div>
                
                <div>
                  <Label htmlFor="url">URL</Label>
                  <Input
                    id="url"
                    value={newItem.url}
                    onChange={(e) => setNewItem({ ...newItem, url: e.target.value })}
                    placeholder="e.g., /about"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={newItem.type}
                    onValueChange={(value: 'link' | 'category') => setNewItem({ ...newItem, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="link">Custom Link</SelectItem>
                      <SelectItem value="category">Category</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="icon">Icon</Label>
                  <Select
                    value={newItem.icon}
                    onValueChange={(value) => setNewItem({ ...newItem, icon: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {defaultIcons.map((icon) => (
                        <SelectItem key={icon.value} value={icon.value}>
                          <div className="flex items-center space-x-2">
                            <icon.icon className="h-4 w-4" />
                            <span>{icon.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {newItem.type === 'category' && (
                <div>
                  <Label htmlFor="category">Select Category</Label>
                  <Select
                    value={newItem.url}
                    onValueChange={(value) => setNewItem({ ...newItem, url: `/category/${value}` })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category._id} value={category.slug}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex items-center space-x-4">
                <Button onClick={addNavigationItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Mobile Navigation Preview</CardTitle>
          <CardDescription>
            Preview of how your navigation will look on mobile devices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-900 rounded-lg p-4 max-w-sm mx-auto">
            <div className="space-y-2">
              {navigationItems
                .filter(item => item.isActive)
                .map((item) => {
                  const IconComponent = getIconComponent(item.icon);
                  return (
                    <div
                      key={item.id}
                      className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg text-white"
                    >
                      <IconComponent className="h-5 w-5" />
                      <span className="text-sm">{item.label}</span>
                    </div>
                  );
                })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 