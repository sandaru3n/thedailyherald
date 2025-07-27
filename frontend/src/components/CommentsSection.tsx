'use client';

import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, Reply, ThumbsUp, ThumbsDown, Clock, User, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Comment {
  _id: string;
  content: string;
  authorName: string;
  authorEmail: string;
  createdAt: string;
  likes: number;
  dislikes: number;
  replies: Comment[];
  replyCount: number;
}

interface CommentsSectionProps {
  articleId: string;
}

export default function CommentsSection({ articleId }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    content: '',
    authorName: '',
    authorEmail: ''
  });

  useEffect(() => {
    fetchComments();
  }, [articleId]);

  const fetchComments = async (pageNum = 1) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/comments/article/${articleId}?page=${pageNum}&limit=10`);
      const data = await response.json();

      if (data.success) {
        if (pageNum === 1) {
          setComments(data.comments);
        } else {
          setComments(prev => [...prev, ...data.comments]);
        }
        setHasMore(data.pagination.hasMore);
        setPage(pageNum);
      } else {
        setError('Failed to load comments');
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.content.trim() || !formData.authorName.trim() || !formData.authorEmail.trim()) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          articleId,
          parentCommentId: replyTo
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(data.message);
        setFormData({ content: '', authorName: '', authorEmail: '' });
        setShowForm(false);
        setReplyTo(null);
        // Refresh comments after a short delay
        setTimeout(() => {
          fetchComments(1);
        }, 1000);
      } else {
        setError(data.message || 'Failed to submit comment');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      setError('Failed to submit comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = (commentId: string) => {
    setReplyTo(commentId);
    setShowForm(true);
    setFormData({ content: '', authorName: '', authorEmail: '' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
  };

  const loadMoreComments = () => {
    fetchComments(page + 1);
  };

  return (
    <div className="mt-8 space-y-6">
      <div className="flex items-center gap-2">
        <MessageCircle className="h-5 w-5 text-gray-600" />
        <h2 className="text-xl font-semibold text-gray-900">
          Comments ({comments.length})
        </h2>
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

      {/* Comment Form */}
      {!showForm && (
        <Button
          onClick={() => setShowForm(true)}
          variant="outline"
          className="w-full"
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          Write a comment
        </Button>
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {replyTo ? 'Reply to comment' : 'Write a comment'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="content">Comment</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Share your thoughts..."
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="authorName">Name</Label>
                  <Input
                    id="authorName"
                    type="text"
                    value={formData.authorName}
                    onChange={(e) => setFormData(prev => ({ ...prev, authorName: e.target.value }))}
                    placeholder="Your name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="authorEmail">Email</Label>
                  <Input
                    id="authorEmail"
                    type="email"
                    value={formData.authorEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, authorEmail: e.target.value }))}
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Comment
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setReplyTo(null);
                    setFormData({ content: '', authorName: '', authorEmail: '' });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {loading && page === 1 ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading comments...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          <>
            {comments.map((comment) => (
              <Card key={comment._id} className="border-l-4 border-l-blue-500">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{comment.authorName}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="h-3 w-3" />
                          {formatDate(comment.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4 whitespace-pre-wrap">{comment.content}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReply(comment._id)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <Reply className="h-4 w-4 mr-1" />
                        Reply
                      </Button>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <ThumbsUp className="h-4 w-4" />
                        <span>{comment.likes}</span>
                        <ThumbsDown className="h-4 w-4" />
                        <span>{comment.dislikes}</span>
                      </div>
                    </div>

                    {comment.replyCount > 0 && (
                      <Badge variant="secondary">
                        {comment.replyCount} repl{comment.replyCount === 1 ? 'y' : 'ies'}
                      </Badge>
                    )}
                  </div>

                  {/* Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-4 ml-8 space-y-3">
                      {comment.replies.map((reply) => (
                        <div key={reply._id} className="border-l-2 border-gray-200 pl-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                              <User className="h-3 w-3 text-gray-600" />
                            </div>
                            <div>
                              <p className="font-medium text-sm text-gray-900">{reply.authorName}</p>
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Clock className="h-3 w-3" />
                                {formatDate(reply.createdAt)}
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700">{reply.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {hasMore && (
              <div className="text-center">
                <Button
                  onClick={loadMoreComments}
                  variant="outline"
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Load More Comments'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 