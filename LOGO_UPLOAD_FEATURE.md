# Logo Upload Feature

This document explains the logo upload functionality for The Daily Herald application.

## Overview

The application now supports image uploads for three types of logos:
- **Site Logo**: Main logo for the website
- **Publisher Logo**: Logo for the publisher/organization
- **Site Favicon**: Small icon for browser tabs

## Backend Implementation

### Upload Routes

Three new upload endpoints have been added to `backend/routes/upload.js`:

1. **POST /api/upload/favicon** - Upload site favicon
2. **POST /api/upload/site-logo** - Upload site logo
3. **POST /api/upload/publisher-logo** - Upload publisher logo

### Upload Middleware

The upload middleware (`backend/middleware/upload.js`) has been extended to support:

- **File Types**: `.ico`, `.png`, `.svg`, `.jpg`, `.jpeg`, `.webp`
- **File Size Limits**: 
  - Favicon: 2MB
  - Logos: 5MB
- **Authentication**: Admin-only access
- **File Management**: Automatic cleanup of old files

### Environment Variables

The upload system uses the `API_BASE_URL` environment variable to generate file URLs:

```env
API_BASE_URL=http://localhost:5000
```

This ensures URLs work correctly across different environments.

## Frontend Implementation

### File Upload Component

The `FileUpload` component (`frontend/src/components/ui/file-upload.tsx`) has been updated to support:

- **Multiple Upload Types**: `favicon`, `site-logo`, `publisher-logo`
- **Drag & Drop**: Users can drag files directly onto the upload area
- **File Validation**: Client-side validation of file types and sizes
- **Progress Indication**: Upload progress feedback
- **Error Handling**: Clear error messages for failed uploads

### Site Settings Page

The site settings page (`frontend/src/app/admin/settings/site/page.tsx`) now includes:

- **Site Logo Upload**: Replace text input with file upload component
- **Publisher Logo Upload**: Replace text input with file upload component
- **Favicon Upload**: Enhanced with new upload type parameter

## Usage

### For Administrators

1. Navigate to Admin → Settings → Site
2. Find the logo upload sections
3. Drag and drop image files or click "browse" to select files
4. Supported formats: PNG, SVG, JPG, JPEG, WebP (and ICO for favicon)
5. Files are automatically uploaded and URLs are saved to the database

### File Requirements

#### Site Logo
- **Formats**: PNG, SVG, JPG, JPEG, WebP
- **Max Size**: 5MB
- **Recommended**: 200x200px or larger, transparent background

#### Publisher Logo
- **Formats**: PNG, SVG, JPG, JPEG, WebP
- **Max Size**: 5MB
- **Recommended**: 200x200px or larger, transparent background

#### Site Favicon
- **Formats**: ICO, PNG, SVG, JPG, JPEG
- **Max Size**: 2MB
- **Recommended**: 16x16px, 32x32px, or 64x64px

## Technical Details

### File Storage

- Files are stored in `backend/uploads/` directory
- Unique filenames are generated using timestamps and random numbers
- Old files are automatically deleted when new ones are uploaded

### URL Generation

File URLs follow this pattern:
```
{API_BASE_URL}/api/upload/uploads/{filename}
```

Example:
```
http://localhost:5000/api/upload/uploads/siteLogo-1703123456789-123456789.png
```

### Database Storage

Logo URLs are stored in the Settings model:
- `siteLogo`: Site logo URL
- `publisherLogo`: Publisher logo URL  
- `siteFavicon`: Site favicon URL

## Security Features

- **Authentication Required**: Only authenticated admins can upload files
- **File Type Validation**: Only allowed image types are accepted
- **File Size Limits**: Prevents large file uploads
- **Unique Filenames**: Prevents filename conflicts
- **Automatic Cleanup**: Old files are deleted when replaced

## Error Handling

The system provides clear error messages for:
- Invalid file types
- File size exceeded
- Upload failures
- Authentication errors
- Network errors

## Benefits

1. **User-Friendly**: Drag & drop interface with visual feedback
2. **Secure**: Proper authentication and file validation
3. **Flexible**: Supports multiple image formats
4. **Efficient**: Automatic file management and cleanup
5. **Environment-Agnostic**: Works across development, staging, and production 