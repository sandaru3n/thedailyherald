# Admin Profile Picture and Description Features

## Overview
This implementation adds profile picture upload and description functionality to the admin settings page at `/admin/settings`.

## Features Implemented

### 1. Profile Picture Upload
- **File Types**: JPEG, JPG, PNG, WebP
- **File Size Limit**: 3MB
- **Storage**: Files stored in `backend/uploads/` directory
- **URL Generation**: Automatic URL generation for uploaded files
- **Old File Cleanup**: Automatic deletion of previous profile pictures

### 2. Description Field
- **Character Limit**: 500 characters
- **Validation**: Server-side validation for length
- **Real-time Counter**: Shows character count in the UI

## Backend Changes

### 1. Admin Model (`backend/models/Admin.js`)
```javascript
// Added new fields
profilePicture: {
  type: String,
  default: null
},
description: {
  type: String,
  trim: true,
  maxlength: 500
}
```

### 2. Upload Middleware (`backend/middleware/upload.js`)
```javascript
// Added profile picture upload handler
const uploadProfilePicture = multer({
  storage: storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 3 * 1024 * 1024 // 3MB limit
  }
}).single('profilePicture');
```

### 3. Auth Routes (`backend/routes/auth.js`)
- **Updated Profile Update Route**: Now handles description field
- **New Profile Picture Upload Route**: `POST /api/auth/profile-picture`

## Frontend Changes

### 1. Settings Page (`frontend/src/app/admin/settings/page.tsx`)
- **Profile Picture Display**: Circular avatar with fallback icon
- **Upload Interface**: Drag-and-drop style file input
- **Description Textarea**: With character counter
- **Loading States**: Upload progress indicator
- **Error Handling**: Comprehensive error messages

### 2. Admin Sidebar (`frontend/src/components/AdminLayout.tsx`)
- **Profile Picture Display**: Shows uploaded profile picture in sidebar
- **Real-time Updates**: Profile picture updates immediately when changed
- **Fallback Icon**: Shows User icon when no profile picture is set
- **Responsive Design**: Works on both desktop and mobile layouts

### 3. Auth Library (`frontend/src/lib/auth.ts`)
- **Updated Interface**: Added profilePicture and description fields
- **New Function**: updateAdminData() for real-time updates
- **Event System**: Custom events for component synchronization

### 4. TypeScript Interface
```typescript
interface AdminUser {
  _id: string;
  name: string;
  email: string;
  profilePicture?: string;
  description?: string;
  role: 'admin' | 'editor';
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}
```

## API Endpoints

### 1. Update Profile
```
PUT /api/auth/profile
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Admin Name",
  "email": "admin@example.com",
  "description": "Admin description"
}
```

### 2. Upload Profile Picture
```
POST /api/auth/profile-picture
Content-Type: multipart/form-data
Authorization: Bearer <token>

Form Data:
- profilePicture: <file>
```

## Setup Instructions

### 1. Start Backend Server
```bash
cd backend
npm install
npm run dev
```

### 2. Start Frontend Server
```bash
cd frontend
npm install
npm run dev
```

### 3. Access Admin Settings
- Navigate to `http://localhost:3000/admin/settings`
- Login with admin credentials
- Use the profile picture upload and description features

## Testing

### 1. Profile Picture Upload
1. Click on the camera icon or "Upload Profile Picture" text
2. Select an image file (JPG, PNG, or WebP)
3. File should upload and display in the circular avatar
4. Check browser console for upload logs
5. **Profile picture should also appear in the admin sidebar immediately**

### 2. Description Field
1. Type in the description textarea
2. Character counter should update in real-time
3. Save the profile to persist changes
4. Description should be limited to 500 characters

### 3. Error Handling
- Try uploading files larger than 3MB
- Try uploading non-image files
- Try uploading without authentication
- All should show appropriate error messages

## Troubleshooting

### Common Issues

#### 1. 404 Error on Profile Picture Upload
**Problem**: Getting 404 error when uploading profile picture
**Solution**: 
- Ensure backend server is running on port 5000
- Check that the API endpoint is correctly configured
- Verify the request is going to `http://localhost:5000/api/auth/profile-picture`

#### 2. CORS Issues
**Problem**: Cross-origin request blocked
**Solution**:
- Backend has CORS configured in `server.js`
- Frontend is configured to make requests to the correct backend URL

#### 3. File Upload Fails
**Problem**: File upload returns error
**Solution**:
- Check file size (must be < 3MB)
- Check file type (must be JPG, PNG, or WebP)
- Ensure authentication token is present
- Check backend logs for detailed error messages

#### 4. Profile Picture Not Displaying
**Problem**: Uploaded image doesn't show
**Solution**:
- Check if the image URL is correctly generated
- Verify the file exists in `backend/uploads/` directory
- Check browser network tab for image loading errors

## File Structure

```
backend/
├── models/
│   └── Admin.js (updated with new fields)
├── middleware/
│   └── upload.js (added profile picture upload)
├── routes/
│   └── auth.js (added profile picture endpoint)
└── uploads/ (profile pictures stored here)

frontend/
├── src/app/admin/settings/
│   └── page.tsx (updated with new UI components)
├── src/components/
│   └── AdminLayout.tsx (updated with profile picture display)
└── src/lib/
    └── auth.ts (updated interface and functions)
```

## Security Considerations

1. **File Validation**: Server-side validation of file types and sizes
2. **Authentication**: All endpoints require valid JWT token
3. **File Storage**: Files stored securely in uploads directory
4. **Old File Cleanup**: Previous profile pictures are automatically deleted
5. **Input Sanitization**: Description field is trimmed and length-limited

## Future Enhancements

1. **Image Resizing**: Automatic resizing of uploaded images
2. **Multiple Formats**: Support for more image formats
3. **Cloud Storage**: Integration with cloud storage services
4. **Profile Picture Cropping**: Client-side image cropping before upload
5. **Bulk Operations**: Ability to manage multiple admin profiles

## Conclusion

The admin profile picture and description features are now fully implemented and ready for use. The implementation includes proper error handling, validation, and a user-friendly interface. Both frontend and backend are properly configured to work together seamlessly.
