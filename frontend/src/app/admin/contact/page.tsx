'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Mail, Check, X, Trash2, Eye, Filter, RefreshCw, AlertCircle, Reply, Clock, User, MessageSquare, ChevronDown, ChevronUp, MoreHorizontal } from 'lucide-react';
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

  // Mobile-specific states
  const [expandedContact, setExpandedContact] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const fetchContacts = useCallback(async () => {
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
  }, [page, statusFilter, priorityFilter, searchTerm]);

  useEffect(() => {
    fetchContacts();
    fetchStats();
  }, [fetchContacts]);

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

  const handleStatusUpdate = async (contactId: string, status: 'unread' | 'read' | 'replied' | 'archived') => {
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
              ? { ...contact, status, readBy: data.contact.readBy, readAt: data.contact.readAt }
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

  const toggleContactExpanded = (contactId: string) => {
    setExpandedContact(expandedContact === contactId ? null : contactId);
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
    <div className="space-y-6 p-4 max-w-7xl mx-auto">
      {/* Page Header - Mobile Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Contact Messages</h1>
          <p className="text-gray-600 text-sm sm:text-base">Manage and respond to contact form submissions</p>
        </div>
        <Button 
          onClick={() => { fetchContacts(); fetchStats(); }} 
          variant="outline"
          className="w-full sm:w-auto"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <Alert className="border-green-200 bg-green-50 mx-4 sm:mx-0 admin-alert">
          <AlertCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {success}
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className="border-red-200 bg-red-50 mx-4 sm:mx-0 admin-alert">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards - Mobile Optimized */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <Card className="admin-card">
          <CardContent className="p-3 sm:p-4 admin-card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats?.total || 0}</p>
              </div>
              <Mail className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="admin-card">
          <CardContent className="p-3 sm:p-4 admin-card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Unread</p>
                <p className="text-lg sm:text-2xl font-bold text-red-600">{stats?.unread || 0}</p>
              </div>
              <Badge variant="secondary" className="bg-red-100 text-red-800 text-xs admin-badge">
                New
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="admin-card">
          <CardContent className="p-3 sm:p-4 admin-card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Read</p>
                <p className="text-lg sm:text-2xl font-bold text-blue-600">{stats?.read || 0}</p>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs admin-badge">
                Viewed
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="admin-card">
          <CardContent className="p-3 sm:p-4 admin-card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Replied</p>
                <p className="text-lg sm:text-2xl font-bold text-green-600">{stats?.replied || 0}</p>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs admin-badge">
                Done
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="admin-card col-span-2 sm:col-span-1">
          <CardContent className="p-3 sm:p-4 admin-card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Urgent</p>
                <p className="text-lg sm:text-2xl font-bold text-orange-600">{stats?.priority?.urgent || 0}</p>
              </div>
              <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs admin-badge">
                Priority
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters - Mobile Optimized */}
      <Card className="mx-4 sm:mx-0 admin-card">
        <CardHeader className="admin-card-header">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              <span className="text-lg sm:text-xl">Filters</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="sm:hidden"
            >
              {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className={`admin-card-content ${showFilters ? 'block' : 'hidden sm:block'}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 admin-form-grid">
            <div>
              <Label htmlFor="status-filter" className="text-sm font-medium">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="mt-1 admin-select">
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
              <Label htmlFor="priority-filter" className="text-sm font-medium">Priority</Label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="mt-1 admin-select">
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
              <Label htmlFor="search" className="text-sm font-medium">Search</Label>
              <Input
                id="search"
                placeholder="Search by name, email, or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-1"
              />
            </div>

            <div className="flex items-end">
              <Button onClick={resetFilters} variant="outline" className="w-full admin-button-group">
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Messages List - Mobile Optimized */}
      <Card className="mx-4 sm:mx-0 admin-card">
        <CardHeader className="admin-card-header">
          <CardTitle className="text-lg sm:text-xl">Contact Messages</CardTitle>
        </CardHeader>
        <CardContent className="admin-card-content">
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
              {contacts.map((contact) => {
                const isExpanded = expandedContact === contact._id;
                
                return (
                  <div key={contact._id} className="border rounded-lg overflow-hidden admin-navigation-item">
                    {/* Mobile Header - Always Visible */}
                    <div 
                      className="p-4 cursor-pointer admin-navigation-expandable"
                      onClick={() => toggleContactExpanded(contact._id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <h3 className="font-medium text-gray-900 truncate">{contact.name}</h3>
                            <Badge className={`${getStatusBadge(contact.status)} text-xs admin-badge`}>
                              {contact.status}
                            </Badge>
                            <Badge className={`${getPriorityBadge(contact.priority)} text-xs admin-badge`}>
                              {contact.priority}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-1 truncate">{contact.email}</p>
                          <p className="text-xs text-gray-500 mb-2">
                            {formatDate(contact.createdAt)} • IP: {contact.ipAddress}
                          </p>
                          
                          <h4 className="font-medium text-gray-900 mb-2 line-clamp-1">{contact.subject}</h4>
                          <p className="text-gray-700 text-sm line-clamp-2">{contact.message}</p>
                        </div>
                        
                        <div className="flex items-center ml-2">
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-gray-500" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-gray-500" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expandable Content */}
                    {isExpanded && (
                      <div className="border-t bg-gray-50 p-4">
                        <div className="space-y-3">
                          {/* Full Message */}
                          <div>
                            <Label className="text-sm font-medium">Full Message</Label>
                            <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{contact.message}</p>
                          </div>

                          {/* Reply Section */}
                          {contact.replyMessage && (
                            <div className="bg-white p-3 rounded-lg border">
                              <p className="text-sm font-medium text-gray-900 mb-1">Reply:</p>
                              <p className="text-sm text-gray-700">{contact.replyMessage}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                Replied by {contact.repliedBy?.name} on {contact.repliedAt && formatDate(contact.repliedAt)}
                              </p>
                            </div>
                          )}

                          {/* Read Info */}
                          {contact.readBy && (
                            <p className="text-xs text-gray-500">
                              Read by {contact.readBy.name} on {contact.readAt && formatDate(contact.readAt)}
                            </p>
                          )}

                          {/* Action Buttons */}
                          <div className="flex flex-col sm:flex-row gap-2 admin-button-group">
                            {contact.status === 'unread' && (
                              <Button
                                size="sm"
                                onClick={() => handleStatusUpdate(contact._id, 'read')}
                                disabled={updating === contact._id}
                                variant="outline"
                                className="flex-1 sm:flex-none"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Mark as Read
                              </Button>
                            )}

                            {contact.status !== 'replied' && (
                              <Button
                                size="sm"
                                onClick={() => openReplyDialog(contact)}
                                disabled={updating === contact._id}
                                className="bg-blue-600 hover:bg-blue-700 flex-1 sm:flex-none"
                              >
                                <Reply className="h-4 w-4 mr-2" />
                                Reply
                              </Button>
                            )}

                            {contact.status === 'read' && (
                              <Button
                                size="sm"
                                onClick={() => handleStatusUpdate(contact._id, 'archived')}
                                disabled={updating === contact._id}
                                variant="outline"
                                className="flex-1 sm:flex-none"
                              >
                                <X className="h-4 w-4 mr-2" />
                                Archive
                              </Button>
                            )}

                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline" className="flex-1 sm:flex-none">
                                  <Eye className="h-4 w-4 mr-2" />
                                  Details
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Contact Message Details</DialogTitle>
                                  <DialogDescription>
                                    Full details of this contact message
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label className="text-sm font-medium">From</Label>
                                    <p className="text-sm text-gray-700 mt-1">{contact.name} ({contact.email})</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Subject</Label>
                                    <p className="text-sm text-gray-700 mt-1">{contact.subject}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Message</Label>
                                    <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{contact.message}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">User Agent</Label>
                                    <p className="text-sm text-gray-700 mt-1 break-all">{contact.userAgent}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">IP Address</Label>
                                    <p className="text-sm text-gray-700 mt-1">{contact.ipAddress}</p>
                                  </div>
                                  {contact.replyMessage && (
                                    <div>
                                      <Label className="text-sm font-medium">Reply</Label>
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
                              className="text-red-600 hover:text-red-700 flex-1 sm:flex-none"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {hasMore && (
                <div className="text-center pt-4">
                  <Button onClick={loadMore} variant="outline" disabled={loading} className="w-full sm:w-auto">
                    {loading ? 'Loading...' : 'Load More Messages'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reply Dialog - Mobile Optimized */}
      <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-0">
          <DialogHeader>
            <DialogTitle>Reply to {selectedContact?.name}</DialogTitle>
            <DialogDescription>
              Send a reply to this contact message
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Original Message</Label>
              <div className="bg-gray-50 p-3 rounded-lg mt-1">
                <p className="text-sm text-gray-700">{selectedContact?.message}</p>
              </div>
            </div>
            <div>
              <Label htmlFor="reply-message" className="text-sm font-medium">Your Reply</Label>
              <Textarea
                id="reply-message"
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Type your reply here..."
                rows={6}
                className="mt-1"
              />
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2 admin-button-group">
              <Button
                variant="outline"
                onClick={() => {
                  setReplyDialogOpen(false);
                  setSelectedContact(null);
                  setReplyMessage('');
                }}
                className="flex-1 sm:flex-none"
              >
                Cancel
              </Button>
              <Button
                onClick={handleReply}
                disabled={!replyMessage.trim() || updating === selectedContact?._id}
                className="flex-1 sm:flex-none"
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