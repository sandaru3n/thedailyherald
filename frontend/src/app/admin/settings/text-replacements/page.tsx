'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, TestTube, Save, X } from 'lucide-react';
import { apiCall } from '@/lib/auth';

interface TextReplacementRule {
  find: string;
  replace: string;
  description: string;
  isActive: boolean;
}

interface TextReplacements {
  enabled: boolean;
  rules: TextReplacementRule[];
}

export default function TextReplacementsPage() {
  const [textReplacements, setTextReplacements] = useState<TextReplacements>({
    enabled: false,
    rules: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form states
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    find: '',
    replace: '',
    description: ''
  });
  
  // Test states
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [testText, setTestText] = useState('');
  const [testResult, setTestResult] = useState<{
    original: string;
    result: string;
    changed: boolean;
  } | null>(null);

  // Existing articles states
  const [testingExisting, setTestingExisting] = useState(false);
  const [applyingExisting, setApplyingExisting] = useState(false);
  const [existingResults, setExistingResults] = useState<{
    processed: number;
    updated: number;
    errors: string[];
  } | null>(null);

  useEffect(() => {
    fetchTextReplacements();
  }, []);

  const fetchTextReplacements = async () => {
    try {
      setLoading(true);
      const response = await apiCall('/settings/text-replacements');
      if (response.success) {
        setTextReplacements(response.textReplacements);
      }
    } catch (error) {
      setError('Failed to load text replacements');
      console.error('Error fetching text replacements:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveTextReplacements = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      const response = await apiCall('/settings/text-replacements', {
        method: 'PUT',
        body: JSON.stringify(textReplacements)
      });
      
      if (response.success) {
        setSuccess('Text replacements saved successfully');
      } else {
        setError(response.message || 'Failed to save text replacements');
      }
    } catch (error) {
      setError('Failed to save text replacements');
      console.error('Error saving text replacements:', error);
    } finally {
      setSaving(false);
    }
  };

  const addRule = async () => {
    try {
      if (!formData.find || !formData.replace) {
        setError('Find and replace text are required');
        return;
      }

      const response = await apiCall('/settings/text-replacements/rules', {
        method: 'POST',
        body: JSON.stringify(formData)
      });

      if (response.success) {
        setTextReplacements(prev => ({
          ...prev,
          rules: [...prev.rules, response.rule]
        }));
        setShowAddDialog(false);
        setFormData({ find: '', replace: '', description: '' });
        setSuccess('Rule added successfully');
      } else {
        setError(response.message || 'Failed to add rule');
      }
    } catch (error) {
      setError('Failed to add rule');
      console.error('Error adding rule:', error);
    }
  };

  const updateRule = async (index: number) => {
    try {
      const rule = textReplacements.rules[index];
      const response = await apiCall(`/settings/text-replacements/rules/${index}`, {
        method: 'PUT',
        body: JSON.stringify(rule)
      });

      if (response.success) {
        setTextReplacements(prev => ({
          ...prev,
          rules: prev.rules.map((r, i) => i === index ? response.rule : r)
        }));
        setEditingIndex(null);
        setSuccess('Rule updated successfully');
      } else {
        setError(response.message || 'Failed to update rule');
      }
    } catch (error) {
      setError('Failed to update rule');
      console.error('Error updating rule:', error);
    }
  };

  const deleteRule = async (index: number) => {
    if (!confirm('Are you sure you want to delete this rule?')) return;

    try {
      const response = await apiCall(`/settings/text-replacements/rules/${index}`, {
        method: 'DELETE'
      });

      if (response.success) {
        setTextReplacements(prev => ({
          ...prev,
          rules: prev.rules.filter((_, i) => i !== index)
        }));
        setSuccess('Rule deleted successfully');
      } else {
        setError(response.message || 'Failed to delete rule');
      }
    } catch (error) {
      setError('Failed to delete rule');
      console.error('Error deleting rule:', error);
    }
  };

  const toggleRuleActive = (index: number) => {
    setTextReplacements(prev => ({
      ...prev,
      rules: prev.rules.map((rule, i) => 
        i === index ? { ...rule, isActive: !rule.isActive } : rule
      )
    }));
  };

  const testReplacements = async () => {
    try {
      if (!testText.trim()) {
        setError('Please enter text to test');
        return;
      }

      const response = await apiCall('/settings/text-replacements/test', {
        method: 'POST',
        body: JSON.stringify({
          text: testText,
          rules: textReplacements.rules
        })
      });

      if (response.success) {
        setTestResult(response);
      } else {
        setError(response.message || 'Failed to test replacements');
      }
    } catch (error) {
      setError('Failed to test replacements');
      console.error('Error testing replacements:', error);
    }
  };

  const testExistingArticles = async () => {
    try {
      setTestingExisting(true);
      setError('');
      setSuccess('');
      
      const response = await apiCall('/settings/text-replacements/test-existing', {
        method: 'POST'
      });
      
      if (response.success) {
        setExistingResults({
          processed: response.processed,
          updated: response.updated,
          errors: response.errors
        });
        setSuccess(`Test completed: ${response.processed} articles processed, ${response.updated} would be updated`);
      } else {
        setError(response.message || 'Failed to test existing articles');
      }
    } catch (error) {
      setError('Failed to test existing articles');
      console.error('Error testing existing articles:', error);
    } finally {
      setTestingExisting(false);
    }
  };

  const applyToExistingArticles = async () => {
    if (!confirm('This will apply text replacements to ALL existing articles. Are you sure you want to continue?')) {
      return;
    }

    try {
      setApplyingExisting(true);
      setError('');
      setSuccess('');
      
      const response = await apiCall('/settings/text-replacements/apply-existing', {
        method: 'POST'
      });
      
      if (response.success) {
        setExistingResults({
          processed: response.processed,
          updated: response.updated,
          errors: response.errors
        });
        setSuccess(`Update completed: ${response.processed} articles processed, ${response.updated} articles updated`);
      } else {
        setError(response.message || 'Failed to update existing articles');
      }
    } catch (error) {
      setError('Failed to update existing articles');
      console.error('Error updating existing articles:', error);
    } finally {
      setApplyingExisting(false);
    }
  };

  const startEdit = (index: number) => {
    const rule = textReplacements.rules[index];
    setFormData({
      find: rule.find,
      replace: rule.replace,
      description: rule.description
    });
    setEditingIndex(index);
    setShowAddDialog(true);
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null) {
      updateRule(editingIndex);
    } else {
      addRule();
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Text Replacements</h1>
        <p className="text-gray-600 mt-2">
          Configure automatic text replacements for RSS feed titles and content. 
          Useful for converting HTML entities like &#8217; to proper characters like '.
        </p>
      </div>

      {/* Alerts */}
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

      {/* Main Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Text Replacement Settings</CardTitle>
          <CardDescription>
            Enable or disable text replacements and manage replacement rules
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable/Disable */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="enabled">Enable Text Replacements</Label>
              <p className="text-sm text-gray-500">
                When enabled, text replacement rules will be applied to RSS feed titles and content
              </p>
            </div>
            <Switch
              id="enabled"
              checked={textReplacements.enabled}
              onCheckedChange={(checked) => 
                setTextReplacements(prev => ({ ...prev, enabled: checked }))
              }
            />
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={saveTextReplacements} disabled={saving}>
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Existing Articles Management */}
      <Card>
        <CardHeader>
          <CardTitle>Existing Articles</CardTitle>
          <CardDescription>
            Apply text replacement rules to all existing articles in the database
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-4">
            <Button 
              onClick={testExistingArticles} 
              disabled={testingExisting || !textReplacements.enabled}
              variant="outline"
            >
              {testingExisting ? 'Testing...' : 'Test Existing Articles'}
            </Button>
            <Button 
              onClick={applyToExistingArticles} 
              disabled={applyingExisting || !textReplacements.enabled}
              variant="destructive"
            >
              {applyingExisting ? 'Applying...' : 'Apply to All Existing Articles'}
            </Button>
          </div>
          
          {existingResults && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Results:</h4>
              <div className="space-y-1 text-sm">
                <p>Processed: {existingResults.processed} articles</p>
                <p>Updated: {existingResults.updated} articles</p>
                {existingResults.errors.length > 0 && (
                  <div>
                    <p className="text-red-600">Errors: {existingResults.errors.length}</p>
                    <ul className="list-disc list-inside text-red-600">
                      {existingResults.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="text-sm text-gray-600">
            <p><strong>Test Existing Articles:</strong> Shows what would be changed without saving</p>
            <p><strong>Apply to All Existing Articles:</strong> Actually updates all existing articles with text replacements</p>
            <p className="text-red-600 mt-2"><strong>Warning:</strong> The apply function will modify all existing articles. Make sure to test first!</p>
          </div>
        </CardContent>
      </Card>

      {/* Rules Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Replacement Rules</CardTitle>
              <CardDescription>
                Define text patterns to find and replace in RSS feed content
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <TestTube className="h-4 w-4 mr-2" />
                    Test
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Test Text Replacements</DialogTitle>
                    <DialogDescription>
                      Enter text to test your replacement rules
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="test-text">Text to Test</Label>
                      <Textarea
                        id="test-text"
                        value={testText}
                        onChange={(e) => setTestText(e.target.value)}
                        placeholder="Enter text with HTML entities like &#8217; to test..."
                        rows={4}
                      />
                    </div>
                    <Button onClick={testReplacements} className="w-full">
                      Test Replacements
                    </Button>
                    {testResult && (
                      <div className="space-y-2">
                        <div className="p-3 bg-gray-50 rounded">
                          <p className="text-sm font-medium">Original:</p>
                          <p className="text-sm text-gray-600">{testResult.original}</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded">
                          <p className="text-sm font-medium">Result:</p>
                          <p className="text-sm text-gray-600">{testResult.result}</p>
                        </div>
                        {testResult.changed && (
                          <Badge variant="secondary">Text was modified</Badge>
                        )}
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
              
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Rule
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingIndex !== null ? 'Edit Rule' : 'Add New Rule'}
                    </DialogTitle>
                    <DialogDescription>
                      Define a text pattern to find and replace
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="find">Find Text</Label>
                      <Input
                        id="find"
                        value={formData.find}
                        onChange={(e) => setFormData(prev => ({ ...prev, find: e.target.value }))}
                        placeholder="e.g., &#8217;"
                      />
                    </div>
                    <div>
                      <Label htmlFor="replace">Replace With</Label>
                      <Input
                        id="replace"
                        value={formData.replace}
                        onChange={(e) => setFormData(prev => ({ ...prev, replace: e.target.value }))}
                        placeholder="e.g., '"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description (Optional)</Label>
                      <Input
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="e.g., Convert HTML apostrophe to regular apostrophe"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSaveEdit} className="flex-1">
                        {editingIndex !== null ? 'Update Rule' : 'Add Rule'}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setShowAddDialog(false);
                          setEditingIndex(null);
                          setFormData({ find: '', replace: '', description: '' });
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {textReplacements.rules.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No replacement rules defined yet.</p>
              <p className="text-sm">Click "Add Rule" to create your first rule.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {textReplacements.rules.map((rule, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={rule.isActive}
                        onCheckedChange={() => toggleRuleActive(index)}
                      />
                      <Badge variant={rule.isActive ? "default" : "secondary"}>
                        {rule.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(index)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteRule(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Find:</Label>
                      <p className="text-sm bg-gray-50 p-2 rounded">{rule.find}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Replace with:</Label>
                      <p className="text-sm bg-gray-50 p-2 rounded">{rule.replace}</p>
                    </div>
                  </div>
                  {rule.description && (
                    <div className="mt-2">
                      <Label className="text-sm font-medium">Description:</Label>
                      <p className="text-sm text-gray-600">{rule.description}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 