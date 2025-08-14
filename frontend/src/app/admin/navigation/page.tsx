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
  CheckCircle,
  Menu,
  ChevronDown,
  ChevronUp,
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
  { value: 'trending-up', label: 'Trending', icon: TrendingUp },
  { value: 'briefcase', label: 'Business', icon: Briefcase },
  { value: 'gamepad-2', label: 'Gaming', icon: Gamepad2 },
  { value: 'music', label: 'Music', icon: Music },
  { value: 'heart', label: 'Heart', icon: Heart },
  { value: 'zap', label: 'Lightning', icon: Zap },
  { value: 'palette', label: 'Art', icon: Palette },
  { value: 'camera', label: 'Camera', icon: Camera },
  { value: 'car', label: 'Transport', icon: Car },
  { value: 'book-open', label: 'Education', icon: BookOpen },
  { value: 'users', label: 'People', icon: Users },
  { value: 'newspaper', label: 'News', icon: Newspaper },
  { value: 'briefcase-business', label: 'Corporate', icon: BriefcaseBusiness },
  { value: 'clapperboard', label: 'Entertainment', icon: Clapperboard },
  { value: 'heart-pulse', label: 'Health', icon: HeartPulse },
  { value: 'vote', label: 'Politics', icon: Vote },
  { value: 'trophy', label: 'Sports', icon: Trophy },
  { value: 'cpu', label: 'Technology', icon: Cpu },
  { value: 'cloud-rain-wind', label: 'Weather', icon: CloudRainWind },
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
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

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

  const toggleItemExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  if (loading) {
    return (
      <div className="space-y-6 p-4">
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
    <div className="space-y-6 p-4 max-w-7xl mx-auto">
      {/* Page Header - Mobile Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Navigation Management</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Customize your site navigation menu</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button 
            onClick={handleSaveNavigation} 
            disabled={saving}
            className="w-full sm:w-auto"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Message Alert */}
      {message && (
        <Alert className={`${message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'} mx-4 sm:mx-0 admin-alert`}>
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

      {/* Navigation Items - Mobile Optimized */}
      <Card className="mx-4 sm:mx-0 admin-card">
        <CardHeader className="pb-4 admin-card-header">
          <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <span className="text-xl sm:text-2xl">Navigation Items</span>
            <Button 
              onClick={() => setShowAddForm(true)}
              className="w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </CardTitle>
          <CardDescription className="text-sm">
            Manage your navigation menu items. Tap to expand, edit, or toggle active status.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 admin-card-content">
          <div className="space-y-3">
            {navigationItems
              .filter(item => item && item.label)
              .map((item, index) => {
                const isEditing = editingItem && editingItem._id === item._id;
                if (isEditing && !editingItem) return null;
                const IconComponent = getIconComponent(item.icon);
                const isExpanded = expandedItems.has(item._id || `item-${index}`);
                
                return (
                  <div
                    key={item._id || `item-${index}`}
                    className={`border rounded-lg overflow-hidden admin-navigation-item ${
                      item.isActive ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    {/* Mobile Header - Always Visible */}
                    <div 
                      className="flex items-center justify-between p-4 cursor-pointer admin-navigation-expandable"
                      onClick={() => toggleItemExpanded(item._id || `item-${index}`)}
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <GripVertical className="h-5 w-5 text-gray-400 flex-shrink-0" />
                        <IconComponent className="h-5 w-5 text-gray-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                                                     <div className="flex items-center space-x-2">
                             <span className="font-medium truncate">{item.label}</span>
                             <Badge variant={item.type === 'category' ? 'default' : 'secondary'} className="text-xs admin-badge">
                               {item.type}
                             </Badge>
                             {!item.isActive && (
                               <Badge variant="outline" className="text-xs admin-badge">Inactive</Badge>
                             )}
                             {item.isExternal && (
                               <Badge variant="outline" className="text-xs admin-badge">External</Badge>
                             )}
                           </div>
                          <div className="flex items-center space-x-1 text-sm text-gray-500 mt-1">
                            <ExternalLink className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{item.url}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-2">
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-gray-500" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        )}
                      </div>
                    </div>

                    {/* Expandable Content */}
                    {isExpanded && (
                      <div className="border-t bg-gray-50 p-4">
                        {isEditing && editingItem ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor={`label-${item._id}`} className="text-sm font-medium">Label</Label>
                                <Input
                                  id={`label-${item._id}`}
                                  value={editingItem.label || ''}
                                  onChange={(e) => setEditingItem({ ...editingItem, label: e.target.value })}
                                  placeholder="Label"
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label htmlFor={`url-${item._id}`} className="text-sm font-medium">URL</Label>
                                <Input
                                  id={`url-${item._id}`}
                                  value={editingItem.url || ''}
                                  onChange={(e) => setEditingItem({ ...editingItem, url: e.target.value })}
                                  placeholder="URL"
                                  className="mt-1"
                                />
                              </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2">
                              <div className="w-full">
                                <Label className="text-sm font-medium">Icon</Label>
                                <div className="grid grid-cols-6 gap-2 mt-1 max-h-32 overflow-y-auto border rounded-md p-2">
                                  {defaultIcons.map((iconOption) => {
                                    const IconComponent = iconOption.icon;
                                    const isSelected = editingItem.icon === iconOption.value;
                                    return (
                                      <button
                                        key={iconOption.value}
                                        type="button"
                                        onClick={() => setEditingItem({ ...editingItem, icon: iconOption.value })}
                                        className={`p-2 rounded-lg border-2 transition-all hover:scale-105 flex flex-col items-center gap-1 ${
                                          isSelected 
                                            ? 'border-blue-500 bg-blue-50' 
                                            : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                        aria-label={`Select icon ${iconOption.label}`}
                                      >
                                        <IconComponent className="w-3 h-3" />
                                        <span className="text-xs text-center">{iconOption.label}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" onClick={saveEditing} className="flex-1 sm:flex-none">
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={cancelEditing} className="flex-1 sm:flex-none">
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                                                 ) : (
                           <div className="flex flex-col sm:flex-row gap-2 admin-button-group">
                             <Button
                               variant="outline"
                               size="sm"
                               onClick={() => startEditing(item)}
                               className="flex-1 sm:flex-none"
                             >
                               <Edit className="h-4 w-4 mr-2" />
                               Edit
                             </Button>
                             <Button
                               variant="outline"
                               size="sm"
                               onClick={() => toggleItemActive(item._id!)}
                               className="flex-1 sm:flex-none"
                             >
                               {item.isActive ? 'Deactivate' : 'Activate'}
                             </Button>
                             <Button
                               variant="outline"
                               size="sm"
                               onClick={() => removeNavigationItem(item._id!)}
                               className="text-red-600 hover:text-red-700 flex-1 sm:flex-none"
                             >
                               <Trash2 className="h-4 w-4 mr-2" />
                               Delete
                             </Button>
                           </div>
                         )}
                      </div>
                    )}
                  </div>
                );
              })}
            
            {navigationItems.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Globe className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">No navigation items yet</p>
                <p className="text-sm mb-4">Get started by adding your first navigation item</p>
                <Button onClick={() => setShowAddForm(true)} className="w-full sm:w-auto">
                  Add your first navigation item
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add New Item Form - Mobile Optimized */}
      {showAddForm && (
        <Card className="mx-4 sm:mx-0 admin-card">
          <CardHeader className="admin-card-header">
            <CardTitle className="text-xl sm:text-2xl">Add Navigation Item</CardTitle>
            <CardDescription className="text-sm">
              Create a new navigation item for your menu
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 admin-card-content admin-navigation-form">
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 admin-form-grid">
                <div>
                  <Label htmlFor="label" className="text-sm font-medium">Label *</Label>
                  <Input
                    id="label"
                    value={safeNewItem.label || ''}
                    onChange={(e) => setNewItem({ ...newItem, label: e.target.value })}
                    placeholder="e.g., About Us"
                    maxLength={50}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="url" className="text-sm font-medium">URL *</Label>
                  <Input
                    id="url"
                    value={safeNewItem.url || ''}
                    onChange={(e) => setNewItem({ ...newItem, url: e.target.value })}
                    placeholder="e.g., /about"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 admin-form-grid">
                <div>
                  <Label htmlFor="type" className="text-sm font-medium">Type</Label>
                  <Select
                    value={safeNewItem.type || 'link'}
                    onValueChange={(value: 'link' | 'category') => setNewItem({ ...newItem, type: value })}
                  >
                    <SelectTrigger className="mt-1 admin-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="link">Custom Link</SelectItem>
                      <SelectItem value="category">Category</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="target" className="text-sm font-medium">Target</Label>
                  <Select
                    value={safeNewItem.target || '_self'}
                    onValueChange={(value: '_self' | '_blank') => setNewItem({ ...newItem, target: value })}
                  >
                    <SelectTrigger className="mt-1 admin-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_self">Same Window</SelectItem>
                      <SelectItem value="_blank">New Window</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="icon" className="text-sm font-medium">Icon</Label>
                <div className="grid grid-cols-6 gap-2 mt-1 max-h-48 overflow-y-auto border rounded-md p-2">
                  {defaultIcons.map((iconOption) => {
                    const IconComponent = iconOption.icon;
                    const isSelected = safeNewItem.icon === iconOption.value;
                    return (
                      <button
                        key={iconOption.value}
                        type="button"
                        onClick={() => setNewItem({ ...newItem, icon: iconOption.value })}
                        className={`p-2 rounded-lg border-2 transition-all hover:scale-105 flex flex-col items-center gap-1 ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        aria-label={`Select icon ${iconOption.label}`}
                      >
                        <IconComponent className="w-4 h-4" />
                        <span className="text-xs text-center">{iconOption.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {safeNewItem.type === 'category' && (
                <div>
                  <Label htmlFor="category" className="text-sm font-medium">Select Category</Label>
                  <Select
                    value={safeNewItem.categorySlug || ''}
                    onValueChange={(value) => setNewItem({ ...newItem, categorySlug: value })}
                  >
                    <SelectTrigger className="mt-1 admin-select">
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

              <div className="flex flex-col sm:flex-row gap-3 pt-4 admin-button-group">
                <Button onClick={addNavigationItem} className="flex-1 sm:flex-none">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 sm:flex-none"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview - Mobile Optimized */}
      <Card className="mx-4 sm:mx-0 admin-card">
        <CardHeader className="admin-card-header">
          <CardTitle className="text-xl sm:text-2xl">Navigation Preview</CardTitle>
          <CardDescription className="text-sm">
            Preview of how your navigation will look on the site
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 admin-card-content">
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
                      <IconComponent className="h-5 w-5 flex-shrink-0" />
                      <span className="text-sm truncate">{item.label}</span>
                      {item.isExternal && (
                        <ExternalLink className="h-3 w-3 ml-auto flex-shrink-0" />
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