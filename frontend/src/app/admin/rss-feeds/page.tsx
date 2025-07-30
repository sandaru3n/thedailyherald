'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, RefreshCw, Settings, Trash2, Edit, Play, AlertCircle, CheckCircle, Brain } from 'lucide-react';
import { API_BASE_URL } from '@/lib/config';

interface RssFeed {
  _id: string;
  name: string;
  feedUrl: string;
  defaultAuthor: {
    _id: string;
    name: string;
    email: string;
  };
  minContentLength: number;
  maxPostsPerDay: number;
  isActive: boolean;
  lastFetched: string | null;
  lastPublished: string | null;
  postsPublishedToday: number;
  totalPostsPublished: number;
  settings: {
    enableAiRewrite: boolean;
    aiRewriteStyle: string;
    includeOriginalSource: boolean;
    autoPublish: boolean;
    publishDelay: number;
    enableAutoCategory: boolean;
  };
  errorLog: Array<{
    message: string;
    timestamp: string;
    type: string;
  }>;
  createdAt: string;
}

interface Admin {
  _id: string;
  name: string;
  email: string;
}

interface RssFeedFormData {
  name: string;
  feedUrl: string;
  defaultAuthorId: string;
  minContentLength: number;
  maxPostsPerDay: number;
  settings: {
    enableAiRewrite: boolean;
    aiRewriteStyle: string;
    includeOriginalSource: boolean;
    autoPublish: boolean;
    publishDelay: number;
    enableAutoCategory: boolean;
  };
}

export default function RssFeedsPage() {
  const [feeds, setFeeds] = useState<RssFeed[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingFeed, setEditingFeed] = useState<RssFeed | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state
  const [formData, setFormData] = useState<RssFeedFormData>({
    name: '',
    feedUrl: '',
    defaultAuthorId: '',
    minContentLength: 100,
    maxPostsPerDay: 5,
    settings: {
      enableAiRewrite: true,
      aiRewriteStyle: 'professional',
      includeOriginalSource: true,
      autoPublish: true,
      publishDelay: 0,
      enableAutoCategory: true
    }
  });

  const updateFormData = (updates: Partial<RssFeedFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  useEffect(() => {
    fetchFeeds();
    fetchAdmins();
  }, []);

  const fetchFeeds = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/rss-feeds`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      const data = await response.json();
      setFeeds(data.feeds || []);
    } catch (error) {
      console.error('Error fetching RSS feeds:', error);
      setMessage({ type: 'error', text: 'Failed to fetch RSS feeds' });
    } finally {
      setLoading(false);
    }
  };

  const fetchAdmins = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      const data = await response.json();
      setAdmins(data.users || []);
    } catch (error) {
      console.error('Error fetching admins:', error);
    }
  };

  const handleCreateFeed = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/rss-feeds`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'RSS feed created successfully' });
        setShowCreateDialog(false);
        resetForm();
        fetchFeeds();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.message || 'Failed to create RSS feed' });
      }
    } catch (error) {
      console.error('Error creating RSS feed:', error);
      setMessage({ type: 'error', text: 'Failed to create RSS feed' });
    }
  };

  const handleUpdateFeed = async () => {
    if (!editingFeed) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/rss-feeds/${editingFeed._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'RSS feed updated successfully' });
        setShowEditDialog(false);
        setEditingFeed(null);
        resetForm();
        fetchFeeds();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.message || 'Failed to update RSS feed' });
      }
    } catch (error) {
      console.error('Error updating RSS feed:', error);
      setMessage({ type: 'error', text: 'Failed to update RSS feed' });
    }
  };

  const handleDeleteFeed = async (feedId: string) => {
    if (!confirm('Are you sure you want to delete this RSS feed?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/rss-feeds/${feedId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'RSS feed deleted successfully' });
        fetchFeeds();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.message || 'Failed to delete RSS feed' });
      }
    } catch (error) {
      console.error('Error deleting RSS feed:', error);
      setMessage({ type: 'error', text: 'Failed to delete RSS feed' });
    }
  };

  const handleProcessFeed = async (feedId: string) => {
    setProcessing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/rss-feeds/${feedId}/process`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setMessage({ 
          type: 'success', 
          text: `Feed processed: ${result.result.processed} processed, ${result.result.published} published` 
        });
        fetchFeeds();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.message || 'Failed to process RSS feed' });
      }
    } catch (error) {
      console.error('Error processing RSS feed:', error);
      setMessage({ type: 'error', text: 'Failed to process RSS feed' });
    } finally {
      setProcessing(false);
    }
  };

  const handleProcessAllFeeds = async () => {
    setProcessing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/rss-feeds/process/all`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setMessage({ 
          type: 'success', 
          text: `All feeds processed: ${result.results.length} feeds processed` 
        });
        fetchFeeds();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.message || 'Failed to process all RSS feeds' });
      }
    } catch (error) {
      console.error('Error processing all RSS feeds:', error);
      setMessage({ type: 'error', text: 'Failed to process all RSS feeds' });
    } finally {
      setProcessing(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      feedUrl: '',
      defaultAuthorId: '',
      minContentLength: 100,
      maxPostsPerDay: 5,
      settings: {
        enableAiRewrite: true,
        aiRewriteStyle: 'professional',
        includeOriginalSource: true,
        autoPublish: true,
        publishDelay: 0,
        enableAutoCategory: true
      }
    });
  };

  const openEditDialog = (feed: RssFeed) => {
    setEditingFeed(feed);
    setFormData({
      name: feed.name,
      feedUrl: feed.feedUrl,
      defaultAuthorId: feed.defaultAuthor._id,
      minContentLength: feed.minContentLength,
      maxPostsPerDay: feed.maxPostsPerDay,
      settings: feed.settings
    });
    setShowEditDialog(true);
  };

  const filteredFeeds = feeds.filter(feed =>
    feed.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    feed.feedUrl.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">RSS Feeds</h1>
          <p className="text-gray-600">Manage automatic news publishing from RSS feeds with AI-powered category identification</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleProcessAllFeeds}
            disabled={processing}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${processing ? 'animate-spin' : ''}`} />
            Process All
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add RSS Feed
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New RSS Feed</DialogTitle>
              </DialogHeader>
              <RssFeedForm
                formData={formData}
                setFormData={updateFormData}
                admins={admins}
                onSubmit={handleCreateFeed}
                submitText="Create Feed"
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {message && (
        <Alert className={message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          <CheckCircle className={`h-4 w-4 ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`} />
          <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search feeds..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredFeeds.map((feed) => (
          <Card key={feed._id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {feed.name}
                    <Badge variant={feed.isActive ? 'default' : 'secondary'}>
                      {feed.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    {feed.settings.enableAutoCategory && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Brain className="h-3 w-3" />
                        Auto-Category
                      </Badge>
                    )}
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{feed.feedUrl}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleProcessFeed(feed._id)}
                    disabled={processing}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditDialog(feed)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteFeed(feed._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium">Author:</span>
                  <p className="text-gray-600">{feed.defaultAuthor.name}</p>
                </div>
                <div>
                  <span className="font-medium">Published Today:</span>
                  <p className="text-gray-600">{feed.postsPublishedToday}/{feed.maxPostsPerDay}</p>
                </div>
                <div>
                  <span className="font-medium">Total Published:</span>
                  <p className="text-gray-600">{feed.totalPostsPublished}</p>
                </div>
                <div>
                  <span className="font-medium">Auto-Category:</span>
                  <p className="text-gray-600">{feed.settings.enableAutoCategory ? 'Enabled' : 'Disabled'}</p>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">AI Rewrite:</span>
                  <p className="text-gray-600">
                    {feed.settings.enableAiRewrite ? 'Enabled' : 'Disabled'}
                    {feed.settings.enableAiRewrite && ` (${feed.settings.aiRewriteStyle})`}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Auto Publish:</span>
                  <p className="text-gray-600">{feed.settings.autoPublish ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <span className="font-medium">Last Fetched:</span>
                  <p className="text-gray-600">
                    {feed.lastFetched ? new Date(feed.lastFetched).toLocaleString() : 'Never'}
                  </p>
                </div>
              </div>

              {feed.errorLog.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    Recent Errors ({feed.errorLog.length})
                  </div>
                  <div className="mt-2 space-y-1">
                    {feed.errorLog.slice(-3).map((error, index) => (
                      <p key={`${feed._id}-error-${index}-${error.timestamp}`} className="text-xs text-red-600">
                        {new Date(error.timestamp).toLocaleString()}: {error.message}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredFeeds.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-32">
            <p className="text-gray-500">No RSS feeds found</p>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(true)}
              className="mt-2"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First RSS Feed
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit RSS Feed</DialogTitle>
          </DialogHeader>
          <RssFeedForm
            formData={formData}
            setFormData={updateFormData}
            admins={admins}
            onSubmit={handleUpdateFeed}
            submitText="Update Feed"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// RSS Feed Form Component
function RssFeedForm({ 
  formData, 
  setFormData, 
  admins, 
  onSubmit, 
  submitText 
}: {
  formData: RssFeedFormData;
  setFormData: (updates: Partial<RssFeedFormData>) => void;
  admins: Admin[];
  onSubmit: () => void;
  submitText: string;
}) {
  const [testTitle, setTestTitle] = useState('');
  const [testContent, setTestContent] = useState('');
  const [testResult, setTestResult] = useState<{ 
    category: { name: string; description: string }; 
    confidence: number;
    confidencePercentage: string;
    method: string;
    analysis: {
      title: string;
      contentPreview: string;
      totalWords: number;
    };
  } | null>(null);
  const [testing, setTesting] = useState(false);

  const handleTestCategory = async () => {
    if (!testTitle || !testContent) {
      alert('Please enter both title and content to test category identification');
      return;
    }

    setTesting(true);
    try {
      const response = await fetch('/api/rss-feeds/test-category', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ title: testTitle, content: testContent })
      });

      const data = await response.json();
      if (response.ok) {
        setTestResult(data);
      } else {
        alert(data.error || 'Failed to test category identification');
      }
    } catch (error) {
      console.error('Error testing category identification:', error);
      alert('Failed to test category identification');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Feed Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ name: e.target.value })}
            placeholder="Enter feed name"
          />
        </div>
        <div>
          <Label htmlFor="feedUrl">Feed URL</Label>
          <Input
            id="feedUrl"
            value={formData.feedUrl}
            onChange={(e) => setFormData({ feedUrl: e.target.value })}
            placeholder="https://example.com/feed.xml"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="author">Default Author</Label>
        <Select
          value={formData.defaultAuthorId}
          onValueChange={(value) => setFormData({ defaultAuthorId: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select author" />
          </SelectTrigger>
          <SelectContent>
            {admins.map((admin) => (
              <SelectItem key={admin._id} value={admin._id}>
                {admin.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="minLength">Minimum Content Length</Label>
          <Input
            id="minLength"
            type="number"
            value={formData.minContentLength}
            onChange={(e) => setFormData({ minContentLength: parseInt(e.target.value) })}
            min="50"
          />
        </div>
        <div>
          <Label htmlFor="maxPosts">Max Posts Per Day</Label>
          <Input
            id="maxPosts"
            type="number"
            value={formData.maxPostsPerDay}
            onChange={(e) => setFormData({ maxPostsPerDay: parseInt(e.target.value) })}
            min="1"
            max="50"
          />
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="font-medium">AI Settings</h3>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="autoCategory">Enable Automatic Category Identification</Label>
          <Switch
            id="autoCategory"
            checked={formData.settings.enableAutoCategory}
            onCheckedChange={(checked) => 
              setFormData({ 
                settings: { ...formData.settings, enableAutoCategory: checked } 
              })
            }
          />
        </div>

        {/* Category Identification Test */}
        {formData.settings.enableAutoCategory && (
          <div className="border rounded-lg p-4 bg-gray-50">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Test Category Identification
            </h4>
            <div className="space-y-3">
              <div>
                <Label htmlFor="testTitle">Test Title</Label>
                <Input
                  id="testTitle"
                  value={testTitle}
                  onChange={(e) => setTestTitle(e.target.value)}
                  placeholder="Enter a sample article title"
                />
              </div>
              <div>
                <Label htmlFor="testContent">Test Content</Label>
                <textarea
                  id="testContent"
                  value={testContent}
                  onChange={(e) => setTestContent(e.target.value)}
                  placeholder="Enter sample article content"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleTestCategory}
                disabled={testing || !testTitle || !testContent}
                className="w-full"
              >
                {testing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                    Testing...
                  </>
                ) : (
                  'Test Category Identification'
                )}
              </Button>
              {testResult && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-green-800">
                      Identified Category: <span className="font-bold">{testResult.category.name}</span>
                    </p>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        parseFloat(testResult.confidencePercentage) >= 80 
                          ? 'bg-green-100 text-green-800' 
                          : parseFloat(testResult.confidencePercentage) >= 60 
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {testResult.confidencePercentage}% confidence
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                        {testResult.method}
                      </span>
                    </div>
                  </div>
                  {testResult.category.description && (
                    <p className="text-xs text-green-600 mb-2">{testResult.category.description}</p>
                  )}
                  <div className="text-xs text-gray-600 space-y-1">
                    <p><strong>Analysis:</strong> {testResult.analysis.totalWords} words analyzed</p>
                    <p><strong>Method:</strong> {testResult.method === 'ai' ? 'AI Analysis' : testResult.method === 'fallback' ? 'Keyword Matching' : 'Manual'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <Label htmlFor="aiRewrite">Enable AI Content Rewriting</Label>
          <Switch
            id="aiRewrite"
            checked={formData.settings.enableAiRewrite}
            onCheckedChange={(checked) => 
              setFormData({ 
                settings: { ...formData.settings, enableAiRewrite: checked } 
              })
            }
          />
        </div>

        {formData.settings.enableAiRewrite && (
          <div>
            <Label htmlFor="aiStyle">AI Rewrite Style</Label>
            <Select
              value={formData.settings.aiRewriteStyle}
              onValueChange={(value) => 
                setFormData({ 
                  settings: { ...formData.settings, aiRewriteStyle: value } 
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="formal">Formal</SelectItem>
                <SelectItem value="creative">Creative</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex items-center justify-between">
          <Label htmlFor="includeSource">Include Original Source</Label>
          <Switch
            id="includeSource"
            checked={formData.settings.includeOriginalSource}
            onCheckedChange={(checked) => 
              setFormData({ 
                settings: { ...formData.settings, includeOriginalSource: checked } 
              })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="autoPublish">Auto Publish Articles</Label>
          <Switch
            id="autoPublish"
            checked={formData.settings.autoPublish}
            onCheckedChange={(checked) => 
              setFormData({ 
                settings: { ...formData.settings, autoPublish: checked } 
              })
            }
          />
        </div>

        <div>
          <Label htmlFor="publishDelay">Publish Delay (minutes)</Label>
          <Input
            id="publishDelay"
            type="number"
            value={formData.settings.publishDelay}
            onChange={(e) => 
              setFormData({ 
                settings: { ...formData.settings, publishDelay: parseInt(e.target.value) } 
              })
            }
            min="0"
            placeholder="0"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onSubmit}>
          {submitText}
        </Button>
      </div>
    </div>
  );
} 