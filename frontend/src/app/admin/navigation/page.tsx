'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Save, 
  ExternalLink,
  Edit,
  X,
  Check,
  Home,
  Info,
  FileText,
  Settings,
  Contact,
  Globe,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { apiCall } from '@/lib/auth';

interface NavigationItem {
  _id?: string;
  label: string;
  url: string;
  icon: string;
  type: 'link' | 'category';
  order: number;
  isActive: boolean;
  isExternal?: boolean;
  target?: '_self' | '_blank';
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
  const [editingItem, setEditingItem] = useState<NavigationItem | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [newItem, setNewItem] = useState<Partial<NavigationItem> & { categorySlug?: string }>({
    label: '',
    url: '',
    icon: 'home',
    type: 'link',
    isActive: true,
    isExternal: false,
    target: '_self',
    categorySlug: ''
  });

  // Safety check to ensure newItem is never null
  const safeNewItem = newItem || {
    label: '',
    url: '',
    icon: 'home',
    type: 'link',
    isActive: true,
    isExternal: false,
    target: '_self',
    categorySlug: ''
  };

  useEffect(() => {
    fetchNavigationData();
  }, []);

  const fetchNavigationData = async () => {
    try {
      setLoading(true);
      
      // Fetch navigation items
      const navigationResponse = await apiCall('/navigation/admin') as { success: boolean; navigation?: { items: NavigationItem[] } };
      if (navigationResponse.success && navigationResponse.navigation) {
        setNavigationItems(navigationResponse.navigation.items || []);
      }

      // Fetch categories
      try {
        const categoriesResponse = await apiCall('/categories') as Category[] | { success: boolean; categories?: Category[] };
        if (Array.isArray(categoriesResponse)) {
          setCategories(categoriesResponse);
        } else if (categoriesResponse.success && categoriesResponse.categories) {
          setCategories(categoriesResponse.categories);
        } else {
          setCategories([]);
          console.error('Invalid categories data format:', categoriesResponse);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching navigation data:', error);
      setMessage({ type: 'error', text: 'Failed to load navigation data' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNavigation = async () => {
    try {
      setSaving(true);
      setMessage(null);
      
      const response = await apiCall('/navigation', {
        method: 'POST',
        body: JSON.stringify({ items: navigationItems })
      }) as { success: boolean; message?: string };
      
      if (response.success) {
        setMessage({ type: 'success', text: 'Navigation saved successfully!' });
        await fetchNavigationData(); // Refresh data
      } else {
        setMessage({ type: 'error', text: response.message || 'Failed to save navigation' });
      }
    } catch (error) {
      console.error('Error saving navigation:', error);
      setMessage({ type: 'error', text: 'Failed to save navigation settings' });
    } finally {
      setSaving(false);
    }
  };

  const addNavigationItem = async () => {
    if (!safeNewItem.label || (!safeNewItem.url && safeNewItem.type !== 'category') || (safeNewItem.type === 'category' && !safeNewItem.categorySlug)) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' });
      return;
    }

    const item: NavigationItem = {
      label: safeNewItem.label!,
      url: safeNewItem.type === 'category' ? `/category/${safeNewItem.categorySlug}` : safeNewItem.url!,
      icon: safeNewItem.icon!,
      type: safeNewItem.type!,
      order: navigationItems.length + 1,
      isActive: safeNewItem.isActive!,
      isExternal: safeNewItem.isExternal,
      target: safeNewItem.target
    };

    setNavigationItems([...navigationItems, item]);
    setNewItem({
      label: '',
      url: '',
      icon: 'home',
      type: 'link',
      isActive: true,
      isExternal: false,
      target: '_self',
      categorySlug: ''
    });
    setShowAddForm(false);
    setMessage({ type: 'success', text: 'Item added successfully!' });
  };

  const updateNavigationItem = async (itemId: string, updateData: Partial<NavigationItem>) => {
    try {
      const response = await apiCall(`/navigation/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      }) as { success: boolean; message?: string };
      
      if (response.success) {
        setNavigationItems(navigationItems.map(item => 
          item._id === itemId ? { ...item, ...updateData } : item
        ));
        setEditingItem(null);
        setMessage({ type: 'success', text: 'Item updated successfully!' });
      } else {
        setMessage({ type: 'error', text: response.message || 'Failed to update item' });
      }
    } catch (error) {
      console.error('Error updating navigation item:', error);
      setMessage({ type: 'error', text: 'Failed to update item' });
    }
  };

  const removeNavigationItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this navigation item?')) {
      return;
    }

    try {
      const response = await apiCall(`/navigation/${itemId}`, {
        method: 'DELETE'
      }) as { success: boolean; message?: string };
      
      if (response.success) {
        setNavigationItems(navigationItems.filter(item => item._id !== itemId));
        setMessage({ type: 'success', text: 'Item deleted successfully!' });
      } else {
        setMessage({ type: 'error', text: response.message || 'Failed to delete item' });
      }
    } catch (error) {
      console.error('Error deleting navigation item:', error);
      setMessage({ type: 'error', text: 'Failed to delete item' });
    }
  };

  const toggleItemActive = (itemId: string) => {
    const item = navigationItems.find(item => item._id === itemId);
    if (item) {
      updateNavigationItem(itemId, { isActive: !item.isActive });
    }
  };

  const handleDragEnd = async (result: { destination?: { index: number }; source: { index: number } }) => {
    if (!result.destination) return;

    const items = Array.from(navigationItems);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order numbers
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index + 1
    }));

    setNavigationItems(updatedItems);

    // Save the new order
    try {
      const response = await apiCall('/navigation/reorder', {
        method: 'POST',
        body: JSON.stringify({ 
          itemIds: updatedItems.map(item => item._id) 
        })
      }) as { success: boolean; message?: string };
      
      if (response.success) {
        setMessage({ type: 'success', text: 'Order updated successfully!' });
      } else {
        setMessage({ type: 'error', text: 'Failed to update order' });
      }
    } catch (error) {
      console.error('Error reordering items:', error);
      setMessage({ type: 'error', text: 'Failed to update order' });
    }
  };

  const getIconComponent = (iconName: string) => {
    const iconData = defaultIcons.find(icon => icon.value === iconName);
    return iconData ? iconData.icon : Home;
  };

  const startEditing = (item: NavigationItem) => {
    setEditingItem(item);
  };

  const cancelEditing = () => {
    setEditingItem(null);
  };

  const saveEditing = () => {
    if (editingItem && editingItem._id) {
      updateNavigationItem(editingItem._id, editingItem);
    }
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
          <p className="text-gray-600 mt-1">Customize your site navigation menu</p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={handleSaveNavigation} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Message Alert */}
      {message && (
        <Alert className={message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          {message.type === 'success' ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

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
            Manage your navigation menu items. Drag to reorder, click edit to modify, or toggle active status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {navigationItems
              .filter(item => item && item.label)
              .map((item, index) => {
                const isEditing = editingItem && editingItem._id === item._id;
                if (isEditing && !editingItem) return null;
                const IconComponent = getIconComponent(item.icon);
                return (
                  <div
                    key={item._id || `item-${index}`}
                    className={`flex items-center justify-between p-4 border rounded-lg ${
                      item.isActive ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <GripVertical className="h-5 w-5 text-gray-400 cursor-move" />
                      <IconComponent className="h-5 w-5 text-gray-600" />
                      {isEditing && editingItem ? (
                        <div className="flex-1 space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              value={editingItem.label || ''}
                              onChange={(e) => setEditingItem({ ...editingItem, label: e.target.value })}
                              placeholder="Label"
                            />
                            <Input
                              value={editingItem.url || ''}
                              onChange={(e) => setEditingItem({ ...editingItem, url: e.target.value })}
                              placeholder="URL"
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <Select
                              value={editingItem.icon || 'home'}
                              onValueChange={(value) => setEditingItem({ ...editingItem, icon: value })}
                            >
                              <SelectTrigger className="w-32">
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
                            <Button size="sm" onClick={saveEditing}>
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={cancelEditing}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{item.label}</span>
                            <Badge variant={item.type === 'category' ? 'default' : 'secondary'}>
                              {item.type}
                            </Badge>
                            {!item.isActive && (
                              <Badge variant="outline">Inactive</Badge>
                            )}
                            {item.isExternal && (
                              <Badge variant="outline">External</Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-1 text-sm text-gray-500">
                            <ExternalLink className="h-3 w-3" />
                            <span>{item.url}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    {!isEditing && (
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditing(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleItemActive(item._id!)}
                        >
                          {item.isActive ? 'Active' : 'Inactive'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeNavigationItem(item._id!)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
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
              Create a new navigation item for your menu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="label">Label *</Label>
                  <Input
                    id="label"
                    value={safeNewItem.label || ''}
                    onChange={(e) => setNewItem({ ...newItem, label: e.target.value })}
                    placeholder="e.g., About Us"
                    maxLength={50}
                  />
                </div>
                
                <div>
                  <Label htmlFor="url">URL *</Label>
                  <Input
                    id="url"
                    value={safeNewItem.url || ''}
                    onChange={(e) => setNewItem({ ...newItem, url: e.target.value })}
                    placeholder="e.g., /about"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={safeNewItem.type || 'link'}
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
                    value={safeNewItem.icon || 'home'}
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

                <div>
                  <Label htmlFor="target">Target</Label>
                  <Select
                    value={safeNewItem.target || '_self'}
                    onValueChange={(value: '_self' | '_blank') => setNewItem({ ...newItem, target: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_self">Same Window</SelectItem>
                      <SelectItem value="_blank">New Window</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {safeNewItem.type === 'category' && (
                <div>
                  <Label htmlFor="category">Select Category</Label>
                  <Select
                    value={safeNewItem.categorySlug || ''}
                    onValueChange={(value) => setNewItem({ ...newItem, categorySlug: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories && categories.length > 0 ? (
                        categories.map((category) => (
                          <SelectItem key={category._id} value={category.slug}>
                            {category.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="" disabled>
                          No categories available
                        </SelectItem>
                      )}
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
          <CardTitle>Navigation Preview</CardTitle>
          <CardDescription>
            Preview of how your navigation will look on the site
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-900 rounded-lg p-4 max-w-sm mx-auto">
            <div className="space-y-2">
              {navigationItems
                .filter(item => item && item.isActive)
                .map((item) => {
                  const IconComponent = getIconComponent(item.icon);
                  return (
                    <div
                      key={item._id}
                      className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg text-white"
                    >
                      <IconComponent className="h-5 w-5" />
                      <span className="text-sm">{item.label}</span>
                      {item.isExternal && (
                        <ExternalLink className="h-3 w-3 ml-auto" />
                      )}
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