# Favicon Upload Feature

## Overview
The favicon upload feature allows administrators to upload favicon files directly through the admin panel instead of manually entering URLs.

## Features

### ✅ **File Upload System**
- **Drag & Drop**: Users can drag and drop favicon files directly onto the upload area
- **Browse Button**: Traditional file browser option for selecting files
- **File Validation**: Automatic validation of file type and size
- **Visual Preview**: Shows current favicon with option to change or remove

### ✅ **Supported Formats**
- `.ico` (recommended for favicons)
- `.png` 
- `.svg`
- `.jpg` / `.jpeg`

### ✅ **File Size Limits**
- Maximum file size: 2MB
- Optimized for web performance

### ✅ **Backend Infrastructure**
- **Multer Integration**: Handles file uploads securely
- **File Storage**: Files stored in `/backend/uploads/` directory
- **Automatic Cleanup**: Old favicon files are automatically deleted when new ones are uploaded
- **Public Access**: Uploaded files are served via `/api/upload/uploads/:filename`

### ✅ **Security Features**
- **Authentication Required**: Only authenticated admins can upload files
- **File Type Validation**: Server-side validation of file types
- **Size Limits**: Prevents oversized file uploads
- **Unique Filenames**: Prevents filename conflicts

## Technical Implementation

### Backend Files
- `backend/middleware/upload.js` - Multer configuration and file handling
- `backend/routes/upload.js` - Upload API endpoints
- `backend/server.js` - Route registration

### Frontend Files
- `frontend/src/components/ui/file-upload.tsx` - Reusable file upload component
- `frontend/src/app/admin/settings/site/page.tsx` - Integration in site settings

### Database
- `siteFavicon` field in Settings model stores the file URL

## Usage

### For Administrators
1. Go to **Admin Panel** → **Settings** → **Site Settings**
2. Find the **Basic Information** section
3. Use the favicon upload area to:
   - Drag and drop a favicon file
   - Click "browse" to select a file
   - View current favicon
   - Change or remove existing favicon

### For Developers
The file upload component can be reused for other file upload needs:

```tsx
import FileUpload from '@/components/ui/file-upload';

<FileUpload
  label="Upload File"
  accept=".pdf,.doc,.docx"
  maxSize={5}
  currentFileUrl={currentFile}
  onUploadSuccess={(url) => setFileUrl(url)}
  onUploadError={(error) => setError(error)}
/>
```

## API Endpoints

### Upload Favicon
- **POST** `/api/upload/favicon`
- **Auth**: Required (Admin only)
- **Body**: FormData with 'favicon' field
- **Response**: `{ success: true, fileUrl: string, filename: string }`

### Serve Uploaded Files
- **GET** `/api/upload/uploads/:filename`
- **Auth**: Public
- **Response**: File content

## File Storage

### Directory Structure
```
backend/
├── uploads/           # Uploaded files directory
│   ├── favicon-1234567890-123456789.ico
│   └── favicon-1234567890-987654321.png
```

### File Naming
- Format: `{fieldname}-{timestamp}-{random}.{extension}`
- Example: `favicon-1703123456789-123456789.ico`

## Error Handling

### Client-Side Validation
- File type validation
- File size validation
- Network error handling

### Server-Side Validation
- File type verification
- File size limits
- Authentication checks
- Storage error handling

## Security Considerations

### File Upload Security
- ✅ File type validation (both client and server)
- ✅ File size limits
- ✅ Authentication required
- ✅ Unique filename generation
- ✅ Automatic old file cleanup

### Access Control
- ✅ Admin-only upload access
- ✅ Public file serving (for favicons)
- ✅ Proper error handling

## Performance

### Optimizations
- ✅ File size limits (2MB max)
- ✅ Automatic cleanup of old files
- ✅ Efficient file serving
- ✅ Client-side validation to reduce server load

## Future Enhancements

### Potential Improvements
- Image compression for large files
- Multiple favicon sizes (16x16, 32x32, etc.)
- CDN integration for file serving
- File optimization (SVG minification, PNG optimization)
- Backup and restore functionality 