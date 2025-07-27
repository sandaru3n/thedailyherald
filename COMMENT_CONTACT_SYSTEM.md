# Comment and Contact System Documentation

## Overview

This document describes the comprehensive comment and contact management system implemented for The Daily Herald news website. The system includes both user-facing features and admin management capabilities.

## Features

### Comment System

#### User Features
- **Comment Submission**: Users can submit comments on articles with name, email, and content
- **Reply System**: Users can reply to existing comments (nested comments)
- **Real-time Updates**: Comments are displayed in real-time with pagination
- **Moderation Notice**: Users are informed that comments require approval

#### Admin Features
- **Comment Moderation**: Approve, reject, or delete comments
- **Bulk Management**: View all comments with filtering and search
- **Statistics Dashboard**: View comment statistics (total, pending, approved, rejected)
- **Comment Details**: View detailed information including IP address and user agent
- **Reply Management**: Handle nested comments and replies

### Contact System

#### User Features
- **Contact Form**: Users can submit contact messages with name, email, subject, and message
- **Form Validation**: Client-side and server-side validation
- **Success Feedback**: Users receive confirmation when messages are sent

#### Admin Features
- **Message Management**: View, read, reply to, and delete contact messages
- **Status Tracking**: Track message status (unread, read, replied, archived)
- **Priority Management**: Set message priority levels (low, medium, high, urgent)
- **Reply System**: Send replies to contact messages
- **Statistics Dashboard**: View contact message statistics

## Technical Implementation

### Backend Models

#### Comment Model (`backend/models/Comment.js`)
```javascript
{
  content: String (required, max 1000 chars),
  authorName: String (required, max 100 chars),
  authorEmail: String (required, email format),
  article: ObjectId (required, ref to Article),
  parentComment: ObjectId (optional, ref to Comment for replies),
  status: String (enum: 'pending', 'approved', 'rejected'),
  isSpam: Boolean (default: false),
  approvedBy: ObjectId (ref to Admin),
  approvedAt: Date,
  ipAddress: String,
  userAgent: String,
  likes: Number (default: 0),
  dislikes: Number (default: 0),
  replies: [ObjectId] (ref to Comment)
}
```

#### Contact Model (`backend/models/Contact.js`)
```javascript
{
  name: String (required, max 100 chars),
  email: String (required, email format),
  subject: String (required, max 200 chars),
  message: String (required, max 2000 chars),
  status: String (enum: 'unread', 'read', 'replied', 'archived'),
  priority: String (enum: 'low', 'medium', 'high', 'urgent'),
  ipAddress: String,
  userAgent: String,
  readAt: Date,
  readBy: ObjectId (ref to Admin),
  repliedAt: Date,
  repliedBy: ObjectId (ref to Admin),
  replyMessage: String (max 2000 chars),
  tags: [String]
}
```

### Backend Routes

#### Comment Routes (`backend/routes/comments.js`)
- `GET /api/comments/article/:articleId` - Get approved comments for an article
- `POST /api/comments` - Create a new comment
- `GET /api/comments/admin` - Get all comments (admin only)
- `PATCH /api/comments/:commentId/status` - Approve/reject comment (admin only)
- `DELETE /api/comments/:commentId` - Delete comment (admin only)
- `GET /api/comments/admin/stats` - Get comment statistics (admin only)

#### Contact Routes (`backend/routes/contact.js`)
- `POST /api/contact` - Submit contact form
- `GET /api/contact/admin` - Get all contact messages (admin only)
- `GET /api/contact/admin/:contactId` - Get single contact message (admin only)
- `PATCH /api/contact/admin/:contactId/status` - Update contact status (admin only)
- `POST /api/contact/admin/:contactId/reply` - Reply to contact message (admin only)
- `DELETE /api/contact/admin/:contactId` - Delete contact message (admin only)
- `GET /api/contact/admin/stats` - Get contact statistics (admin only)

### Frontend Components

#### CommentsSection Component (`frontend/src/components/CommentsSection.tsx`)
- Displays comments for articles
- Handles comment submission
- Supports reply functionality
- Includes pagination and loading states
- Shows success/error messages

#### Admin Pages
- **Comments Management** (`frontend/src/app/admin/comments/page.tsx`)
  - View all comments with filtering
  - Approve/reject comments
  - Delete comments
  - View comment statistics
  - Search and filter functionality

- **Contact Management** (`frontend/src/app/admin/contact/page.tsx`)
  - View all contact messages
  - Reply to messages
  - Update message status
  - Delete messages
  - View contact statistics

### Frontend API Routes

#### Comment API Routes
- `POST /api/comments` - Create comment
- `GET /api/comments/article/[articleId]` - Get article comments
- `GET /api/comments/admin` - Get admin comments
- `GET /api/comments/admin/stats` - Get comment stats
- `PATCH /api/comments/[commentId]/status` - Update comment status
- `DELETE /api/comments/[commentId]` - Delete comment

#### Contact API Routes
- `POST /api/contact` - Submit contact form
- `GET /api/contact/admin` - Get admin contacts
- `GET /api/contact/admin/stats` - Get contact stats
- `GET /api/contact/admin/[contactId]` - Get single contact
- `PATCH /api/contact/admin/[contactId]/status` - Update contact status
- `POST /api/contact/admin/[contactId]/reply` - Reply to contact
- `DELETE /api/contact/admin/[contactId]` - Delete contact

## Usage

### For Users

#### Submitting Comments
1. Navigate to any article page
2. Scroll down to the comments section
3. Click "Write a comment"
4. Fill in your name, email, and comment
5. Click "Submit Comment"
6. Your comment will be reviewed and published if approved

#### Submitting Contact Messages
1. Navigate to the Contact page
2. Fill in the contact form with your details
3. Select a subject and write your message
4. Click "Send Message"
5. You'll receive a confirmation message

### For Admins

#### Managing Comments
1. Navigate to Admin Panel > Comments
2. View all comments with status indicators
3. Use filters to find specific comments
4. Click approve/reject buttons for pending comments
5. View comment details by clicking the eye icon
6. Delete inappropriate comments

#### Managing Contact Messages
1. Navigate to Admin Panel > Contact
2. View all contact messages with status indicators
3. Use filters to find specific messages
4. Mark messages as read by clicking the eye icon
5. Reply to messages using the reply button
6. Update message priority and status
7. Delete resolved messages

## Security Features

### Comment System
- **Moderation Required**: All comments require admin approval
- **Spam Detection**: Built-in spam detection capabilities
- **IP Tracking**: IP addresses are logged for security
- **Content Validation**: Server-side validation of comment content
- **Rate Limiting**: Prevents comment spam

### Contact System
- **Email Validation**: Server-side email format validation
- **Content Validation**: Message content is validated
- **IP Tracking**: IP addresses are logged
- **User Agent Logging**: Browser information is captured
- **Status Tracking**: Full audit trail of message handling

## Database Indexes

### Comment Indexes
- `{ article: 1, status: 1, createdAt: -1 }` - For article comment queries
- `{ status: 1, createdAt: -1 }` - For admin comment management
- `{ authorEmail: 1 }` - For user comment tracking

### Contact Indexes
- `{ status: 1, createdAt: -1 }` - For contact message management
- `{ priority: 1, createdAt: -1 }` - For priority-based queries
- `{ email: 1 }` - For user contact tracking

## Future Enhancements

### Planned Features
1. **Email Notifications**: Send email notifications for new comments/contacts
2. **Advanced Spam Filtering**: Implement more sophisticated spam detection
3. **Comment Moderation Queue**: Dedicated queue for comment moderation
4. **Bulk Actions**: Bulk approve/reject comments
5. **Comment Analytics**: Detailed analytics for comment engagement
6. **Auto-approval Rules**: Rules for auto-approving certain comments
7. **Comment Templates**: Pre-written responses for common situations

### Technical Improvements
1. **Real-time Updates**: WebSocket integration for real-time comment updates
2. **Comment Search**: Full-text search for comments
3. **Comment Export**: Export comments to CSV/PDF
4. **API Rate Limiting**: Implement proper rate limiting
5. **Comment Notifications**: Email notifications for comment replies
6. **Mobile Optimization**: Better mobile experience for comment management

## Configuration

### Environment Variables
```bash
# Backend URL for frontend API routes
BACKEND_URL=http://localhost:5000

# MongoDB connection string
MONGODB_URI=mongodb://localhost:27017/thedailyherald

# JWT secret for authentication
JWT_SECRET=your-secret-key
```

### Comment Settings
- Default comment status: `pending`
- Maximum comment length: 1000 characters
- Maximum reply depth: Unlimited (but can be configured)
- Auto-approval: Disabled by default

### Contact Settings
- Default contact status: `unread`
- Default priority: `medium`
- Maximum message length: 2000 characters
- Email validation: Enabled

## Troubleshooting

### Common Issues

#### Comments not appearing
1. Check if comments are approved in admin panel
2. Verify article ID is correct
3. Check browser console for API errors

#### Contact form not working
1. Verify backend server is running
2. Check form validation
3. Ensure all required fields are filled

#### Admin authentication issues
1. Verify JWT token is valid
2. Check admin login status
3. Ensure proper authorization headers

### Debug Mode
Enable debug logging by setting:
```bash
NODE_ENV=development
```

This will provide detailed error messages and API request logging.

## Support

For technical support or questions about the comment and contact system, please refer to the development team or create an issue in the project repository. 