'use client';

import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Play,
  Pause,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { apiCall } from '@/lib/auth';

interface QueueStatus {
  totalItems: number;
  isProcessing: boolean;
  pendingItems: number;
  processingItems: number;
  completedItems: number;
  failedItems: number;
}

interface QueueItem {
  id: string;
  url: string;
  type: string;
  status: string;
  retries: number;
  addedAt: string;
}

export default function QueueMonitor() {
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchQueueStatus();
    // Poll every 5 seconds
    const interval = setInterval(fetchQueueStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchQueueStatus = async () => {
    try {
      setLoading(true);
      const data = await apiCall('/articles/indexing-queue/status') as {
        success: boolean;
        queueStatus?: QueueStatus;
        queueItems?: QueueItem[];
        error?: string;
      };

      if (data?.success) {
        setQueueStatus(data.queueStatus || null);
        setQueueItems(data.queueItems || []);
      } else {
        setError(data?.error || 'Failed to fetch queue status');
      }
    } catch (error) {
      console.error('Error fetching queue status:', error);
      setError('Failed to fetch queue status');
    } finally {
      setLoading(false);
    }
  };

  const clearQueue = async () => {
    try {
      setLoading(true);
      const data = await apiCall('/articles/indexing-queue/clear', {
        method: 'POST'
      }) as { success: boolean; message?: string; error?: string };

      if (data?.success) {
        await fetchQueueStatus();
      } else {
        setError(data?.error || 'Failed to clear queue');
      }
    } catch (error) {
      console.error('Error clearing queue:', error);
      setError('Failed to clear queue');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'processing':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'processing':
        return <Badge variant="default">Processing</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-green-500">Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (!queueStatus) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Indexing Queue Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 text-gray-400 mx-auto mb-4 animate-spin" />
            <p className="text-gray-500">Loading queue status...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Indexing Queue Monitor
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchQueueStatus}
              disabled={loading}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
            {queueStatus.totalItems > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={clearQueue}
                disabled={loading}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Clear Queue
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Queue Status Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {queueStatus.totalItems}
            </div>
            <div className="text-sm text-blue-800">Total Items</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {queueStatus.pendingItems}
            </div>
            <div className="text-sm text-yellow-800">Pending</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {queueStatus.completedItems}
            </div>
            <div className="text-sm text-green-800">Completed</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {queueStatus.failedItems}
            </div>
            <div className="text-sm text-red-800">Failed</div>
          </div>
        </div>

        {/* Processing Status */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            {queueStatus.isProcessing ? (
              <Play className="h-4 w-4 text-green-500 mr-2" />
            ) : (
              <Pause className="h-4 w-4 text-gray-500 mr-2" />
            )}
            <span className="font-medium">
              {queueStatus.isProcessing ? 'Processing' : 'Idle'}
            </span>
          </div>
          {queueStatus.processingItems > 0 && (
            <Badge variant="default">
              {queueStatus.processingItems} processing
            </Badge>
          )}
        </div>

        {/* Queue Items */}
        {queueItems.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Queue Items</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {queueItems.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(item.status)}
                    <div>
                      <div className="font-medium text-sm truncate max-w-xs">
                        {item.url}
                      </div>
                      <div className="text-xs text-gray-500">
                        Added: {new Date(item.addedAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(item.status)}
                    {item.retries > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {item.retries} retries
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {queueItems.length === 0 && (
          <div className="text-center py-8">
            <Clock className="h-8 w-8 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No items in queue</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 