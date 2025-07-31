'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Save,
  CheckCircle,
  AlertCircle,
  TestTube,
  BarChart3,
  Upload,
  Copy,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { apiCall } from '@/lib/auth';

interface GoogleIndexingSettings {
  enabled: boolean;
  serviceAccountJson: string;
  projectId: string;
  lastIndexedAt?: string;
  totalIndexed: number;
}

interface ApiResponse {
  success: boolean;
  settings?: {
    googleInstantIndexing?: GoogleIndexingSettings;
  };
}

interface GoogleIndexingStats {
  enabled: boolean;
  lastIndexedAt: string | null;
  totalIndexed: number;
  projectId: string | null;
}

export default function GoogleIndexingPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showJson, setShowJson] = useState(false);
  const [stats, setStats] = useState<GoogleIndexingStats | null>(null);

  const [settings, setSettings] = useState<GoogleIndexingSettings>({
    enabled: false,
    serviceAccountJson: '',
    projectId: '',
    totalIndexed: 0
  });

  useEffect(() => {
    fetchSettings();
    fetchStats();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await apiCall('/settings') as ApiResponse;
      if (data?.success && data?.settings?.googleInstantIndexing) {
        setSettings({
          enabled: data.settings.googleInstantIndexing.enabled || false,
          serviceAccountJson: data.settings.googleInstantIndexing.serviceAccountJson || '',
          projectId: data.settings.googleInstantIndexing.projectId || '',
          lastIndexedAt: data.settings.googleInstantIndexing.lastIndexedAt,
          totalIndexed: data.settings.googleInstantIndexing.totalIndexed || 0
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      setError('Failed to load Google Instant Indexing settings');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await apiCall('/settings/google-indexing/stats') as { success: boolean; stats?: GoogleIndexingStats };
      if (data?.success) {
        setStats(data.stats || null);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      await apiCall('/settings', {
        method: 'PUT',
        body: JSON.stringify({
          googleInstantIndexing: settings
        })
      });

      setSuccess('Google Instant Indexing settings updated successfully!');
      await fetchStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    try {
      setTesting(true);
      setError('');
      setSuccess('');

      const data = await apiCall('/settings/google-indexing/test', {
        method: 'POST'
      }) as { success: boolean; message?: string };

      if (data?.success) {
        setSuccess(data.message || 'Configuration test successful!');
      } else {
        setError(data?.message || 'Configuration test failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to test configuration');
    } finally {
      setTesting(false);
    }
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(settings.serviceAccountJson);
    setSuccess('Service account JSON copied to clipboard!');
  };

  const validateJson = (json: string) => {
    try {
      const parsed = JSON.parse(json);
      return parsed.project_id && parsed.private_key && parsed.client_email;
    } catch {
      return false;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Google Instant Indexing</h1>
        <p className="text-gray-600 mt-1">Configure automatic instant indexing for newly published articles</p>
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

      <form onSubmit={handleSave}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enabled">Enable Google Instant Indexing</Label>
                  <p className="text-sm text-gray-600 mt-1">
                    Automatically submit new articles for instant indexing
                  </p>
                </div>
                <Switch
                  id="enabled"
                  checked={settings.enabled}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enabled: checked }))}
                />
              </div>

              <Separator />

              <div>
                <Label htmlFor="projectId">Google Cloud Project ID</Label>
                <Input
                  id="projectId"
                  value={settings.projectId}
                  onChange={(e) => setSettings(prev => ({ ...prev, projectId: e.target.value }))}
                  placeholder="your-project-id"
                  className="mt-1"
                />
                <p className="text-sm text-gray-600 mt-1">
                  The project ID from your Google Cloud Console
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="serviceAccountJson">Service Account JSON</Label>
                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowJson(!showJson)}
                    >
                      {showJson ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      {showJson ? 'Hide' : 'Show'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleCopyJson}
                      disabled={!settings.serviceAccountJson}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Textarea
                  id="serviceAccountJson"
                  value={settings.serviceAccountJson}
                  onChange={(e) => setSettings(prev => ({ ...prev, serviceAccountJson: e.target.value }))}
                  placeholder="Paste your service account JSON key here..."
                  className="mt-1 font-mono text-sm"
                  rows={8}
                  style={{ fontFamily: showJson ? 'monospace' : 'inherit' }}
                />
                <p className="text-sm text-gray-600 mt-1">
                  Upload the Service Account JSON key file you obtained from Google API Console
                </p>
                {settings.serviceAccountJson && (
                  <div className="mt-2">
                    {validateJson(settings.serviceAccountJson) ? (
                      <div className="flex items-center text-green-600 text-sm">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Valid JSON format
                      </div>
                    ) : (
                      <div className="flex items-center text-red-600 text-sm">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Invalid JSON format
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {stats?.totalIndexed || 0}
                  </div>
                  <div className="text-sm text-blue-800">Total Indexed</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {stats?.enabled ? 'Active' : 'Inactive'}
                  </div>
                  <div className="text-sm text-green-800">Status</div>
                </div>
              </div>

              {stats?.lastIndexedAt && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-700">Last Indexed</div>
                  <div className="text-sm text-gray-600">
                    {new Date(stats.lastIndexedAt).toLocaleString()}
                  </div>
                </div>
              )}

              <div className="p-4 bg-yellow-50 rounded-lg">
                <h3 className="text-sm font-semibold text-yellow-900 mb-2">Setup Instructions</h3>
                <div className="space-y-2 text-sm text-yellow-800">
                  <p>1. Create a Google Cloud Project</p>
                  <p>2. Enable the Indexing API</p>
                  <p>3. Create a Service Account</p>
                  <p>4. Download the JSON key file</p>
                  <p>5. Paste the JSON content above</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={handleTest}
            disabled={testing || !settings.enabled || !settings.serviceAccountJson}
          >
            <TestTube className="h-4 w-4 mr-2" />
            {testing ? 'Testing...' : 'Test Configuration'}
          </Button>

          <Button type="submit" disabled={saving} size="lg">
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </form>
    </div>
  );
} 