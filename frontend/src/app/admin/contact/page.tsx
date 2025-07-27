'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Check, X, Trash2, Eye, Filter, RefreshCw, AlertCircle, Reply, Clock, User, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Contact {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  readAt?: string;
  readBy?: {
    _id: string;
    name: string;
  };
  repliedAt?: string;
  repliedBy?: {
    _id: string;
    name: string;
  };
  replyMessage?: string;
  ipAddress: string;
  userAgent: string;
}

interface ContactStats {
  total: number;
  unread: number;
  read: number;
  replied: number;
  archived: number;
  priority: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
}

export default function ContactManagementPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [stats, setStats] = useState<ContactStats>({
    total: 0,
    unread: 0,
    read: 0,
    replied: 0,
    archived: 0,
    priority: { low: 0, medium: 0, high: 0, urgent: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Reply dialog
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [replyMessage, setReplyMessage] = useState('');

  useEffect(() => {
    fetchContacts();
    fetchStats();
  }, [statusFilter, priorityFilter, page]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });
      
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);
      if (priorityFilter && priorityFilter !== 'all') params.append('priority', priorityFilter);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/contact/admin?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      const data = await response.json();

      if (data.success) {
        if (page === 1) {
          setContacts(data.contacts);
        } else {
          setContacts(prev => [...prev, ...data.contacts]);
        }
        setHasMore(data.pagination.hasMore);
      } else {
        setError('Failed to fetch contact messages');
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
      setError('Failed to fetch contact messages');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/contact/admin/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleStatusUpdate = async (contactId: string, status: string) => {
    try {
      setUpdating(contactId);
      setError(null);

      const response = await fetch(`/api/contact/admin/${contactId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ status })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(`Contact message ${status} successfully`);
        setContacts(prev => 
          prev.map(contact => 
            contact._id === contactId 
              ? { ...contact, status: status as any, readBy: data.contact.readBy, readAt: data.contact.readAt }
              : contact
          )
        );
        fetchStats(); // Refresh stats
      } else {
        setError(data.message || 'Failed to update contact status');
      }
    } catch (error) {
      console.error('Error updating contact status:', error);
      setError('Failed to update contact status');
    } finally {
      setUpdating(null);
    }
  };

  const handleReply = async () => {
    if (!selectedContact || !replyMessage.trim()) {
      setError('Please enter a reply message');
      return;
    }

    try {
      setUpdating(selectedContact._id);
      setError(null);

      const response = await fetch(`/api/contact/admin/${selectedContact._id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ replyMessage })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Reply sent successfully');
        setContacts(prev => 
          prev.map(contact => 
            contact._id === selectedContact._id 
              ? { 
                  ...contact, 
                  status: 'replied',
                  replyMessage,
                  repliedBy: data.contact.repliedBy,
                  repliedAt: data.contact.repliedAt
                }
              : contact
          )
        );
        setReplyDialogOpen(false);
        setSelectedContact(null);
        setReplyMessage('');
        fetchStats(); // Refresh stats
      } else {
        setError(data.message || 'Failed to send reply');
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      setError('Failed to send reply');
    } finally {
      setUpdating(null);
    }
  };

  const handleDelete = async (contactId: string) => {
    if (!confirm('Are you sure you want to delete this contact message? This action cannot be undone.')) {
      return;
    }

    try {
      setUpdating(contactId);
      setError(null);

      const response = await fetch(`/api/contact/admin/${contactId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Contact message deleted successfully');
        setContacts(prev => prev.filter(contact => contact._id !== contactId));
        fetchStats(); // Refresh stats
      } else {
        setError(data.message || 'Failed to delete contact message');
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
      setError('Failed to delete contact message');
    } finally {
      setUpdating(null);
    }
  };

  const openReplyDialog = (contact: Contact) => {
    setSelectedContact(contact);
    setReplyMessage('');
    setReplyDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      unread: 'bg-red-100 text-red-800',
      read: 'bg-blue-100 text-blue-800',
      replied: 'bg-green-100 text-green-800',
      archived: 'bg-gray-100 text-gray-800'
    };
    return variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return variants[priority as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  const loadMore = () => {
    setPage(prev => prev + 1);
  };

  const resetFilters = () => {
    setStatusFilter('all');
    setPriorityFilter('all');
    setSearchTerm('');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contact Messages</h1>
          <p className="text-gray-600">Manage and respond to contact form submissions</p>
        </div>
        <Button onClick={() => { fetchContacts(); fetchStats(); }} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <AlertCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {success}
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Messages</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Mail className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unread</p>
                <p className="text-2xl font-bold text-red-600">{stats.unread}</p>
              </div>
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                New
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Read</p>
                <p className="text-2xl font-bold text-blue-600">{stats.read}</p>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Viewed
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Replied</p>
                <p className="text-2xl font-bold text-green-600">{stats.replied}</p>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Done
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Urgent</p>
                <p className="text-2xl font-bold text-orange-600">{stats.priority.urgent}</p>
              </div>
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                Priority
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                  <SelectItem value="replied">Replied</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority-filter">Priority</Label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search by name, email, or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-end">
              <Button onClick={resetFilters} variant="outline" className="w-full">
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Messages List */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Messages</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && page === 1 ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading messages...</p>
            </div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No contact messages found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {contacts.map((contact) => (
                <div key={contact._id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium text-gray-900">{contact.name}</h3>
                        <Badge className={getStatusBadge(contact.status)}>
                          {contact.status}
                        </Badge>
                        <Badge className={getPriorityBadge(contact.priority)}>
                          {contact.priority}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-1">{contact.email}</p>
                      <p className="text-sm text-gray-500 mb-2">
                        {formatDate(contact.createdAt)} • IP: {contact.ipAddress}
                      </p>
                      
                      <h4 className="font-medium text-gray-900 mb-2">{contact.subject}</h4>
                      <p className="text-gray-700 mb-3 line-clamp-2">{contact.message}</p>

                      {contact.replyMessage && (
                        <div className="bg-gray-50 p-3 rounded-lg mb-3">
                          <p className="text-sm font-medium text-gray-900 mb-1">Reply:</p>
                          <p className="text-sm text-gray-700">{contact.replyMessage}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Replied by {contact.repliedBy?.name} on {contact.repliedAt && formatDate(contact.repliedAt)}
                          </p>
                        </div>
                      )}

                      {contact.readBy && (
                        <p className="text-xs text-gray-500">
                          Read by {contact.readBy.name} on {contact.readAt && formatDate(contact.readAt)}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      {contact.status === 'unread' && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(contact._id, 'read')}
                          disabled={updating === contact._id}
                          variant="outline"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}

                      {contact.status !== 'replied' && (
                        <Button
                          size="sm"
                          onClick={() => openReplyDialog(contact)}
                          disabled={updating === contact._id}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Reply className="h-4 w-4" />
                        </Button>
                      )}

                      {contact.status === 'read' && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(contact._id, 'archived')}
                          disabled={updating === contact._id}
                          variant="outline"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Contact Message Details</DialogTitle>
                            <DialogDescription>
                              Full details of this contact message
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>From</Label>
                              <p className="text-sm text-gray-700 mt-1">{contact.name} ({contact.email})</p>
                            </div>
                            <div>
                              <Label>Subject</Label>
                              <p className="text-sm text-gray-700 mt-1">{contact.subject}</p>
                            </div>
                            <div>
                              <Label>Message</Label>
                              <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{contact.message}</p>
                            </div>
                            <div>
                              <Label>User Agent</Label>
                              <p className="text-sm text-gray-700 mt-1 break-all">{contact.userAgent}</p>
                            </div>
                            <div>
                              <Label>IP Address</Label>
                              <p className="text-sm text-gray-700 mt-1">{contact.ipAddress}</p>
                            </div>
                            {contact.replyMessage && (
                              <div>
                                <Label>Reply</Label>
                                <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{contact.replyMessage}</p>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(contact._id)}
                        disabled={updating === contact._id}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {hasMore && (
                <div className="text-center pt-4">
                  <Button onClick={loadMore} variant="outline" disabled={loading}>
                    {loading ? 'Loading...' : 'Load More Messages'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reply Dialog */}
      <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reply to {selectedContact?.name}</DialogTitle>
            <DialogDescription>
              Send a reply to this contact message
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Original Message</Label>
              <div className="bg-gray-50 p-3 rounded-lg mt-1">
                <p className="text-sm text-gray-700">{selectedContact?.message}</p>
              </div>
            </div>
            <div>
              <Label htmlFor="reply-message">Your Reply</Label>
              <Textarea
                id="reply-message"
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Type your reply here..."
                rows={6}
                className="mt-1"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setReplyDialogOpen(false);
                  setSelectedContact(null);
                  setReplyMessage('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleReply}
                disabled={!replyMessage.trim() || updating === selectedContact?._id}
              >
                {updating === selectedContact?._id ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Reply className="h-4 w-4 mr-2" />
                    Send Reply
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 