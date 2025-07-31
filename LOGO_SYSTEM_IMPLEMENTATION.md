# Logo System Implementation

This document explains how the logo system works in The Daily Herald application.

## Overview

The application uses a centralized logo system where the **Site Logo** from site settings is used across multiple components:

- **Admin Panel Header**: Uses Site Logo
- **Main Website Header**: Uses Site Logo  
- **Publisher Logo**: Separate logo for publisher branding
- **Site Favicon**: Browser tab icon

## Implementation Details

### Backend (Database)

The Settings model includes these logo fields:

```javascript
{
  siteLogo: String,        // Main logo used across the site
  publisherLogo: String,   // Publisher-specific logo
  siteFavicon: String      // Browser favicon
}
```

### Frontend Components

#### 1. AdminLayout Component (`frontend/src/components/AdminLayout.tsx`)

```javascript
// Uses site logo from settings
{settings?.siteLogo ? (
  <img 
    src={settings.siteLogo} 
    alt="Admin Panel Logo" 
    className="w-8 h-8 object-contain"
  />
) : (
  // Fallback icon
  <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
    <FileText className="h-5 w-5 text-white" />
  </div>
)}
```

#### 2. Header Component (`frontend/src/components/Header.tsx`)

```javascript
// Uses site logo from settings
{settings?.siteLogo ? (
  <img 
    src={settings.siteLogo} 
    alt="Site Logo" 
    className="w-8 h-8 object-contain"
  />
) : (
  // Fallback icon
  <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
    <FileText className="h-5 w-5 text-white" />
  </div>
)}
```

### Site Settings Management

#### Upload Functionality

The site settings page (`frontend/src/app/admin/settings/site/page.tsx`) provides:

1. **Site Logo Upload**: Main logo used across the site
2. **Publisher Logo Upload**: Publisher-specific branding
3. **Favicon Upload**: Browser tab icon

#### Logo Usage Information

The settings page includes a helpful information section explaining where each logo is used:

- **Site Logo**: Used in Admin Panel header and main website header
- **Publisher Logo**: Used for publisher branding and structured data
- **Site Favicon**: Used as browser tab icon

## Benefits of This Approach

### 1. **Centralized Management**
- Single Site Logo serves multiple purposes
- Easy to maintain brand consistency
- One upload updates all locations

### 2. **Fallback System**
- Graceful degradation when logo is not set
- Default icons provide visual consistency
- No broken images

### 3. **Flexible Implementation**
- Components automatically use the latest logo
- No need for separate admin/header logo uploads
- Easy to extend to other components

### 4. **Environment Agnostic**
- Uses environment variables for URLs
- Works across development, staging, and production
- Proper error handling

## Technical Implementation

### TypeScript Interfaces

```typescript
interface SiteSettings {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  siteLogo?: string;        // Main logo
  siteFavicon?: string;     // Browser icon
  publisherName: string;
  publisherUrl: string;
  publisherLogo?: string;   // Publisher logo
  // ... other fields
}
```

### API Endpoints

- `GET /api/settings/public` - Returns public settings including logos
- `POST /api/upload/site-logo` - Upload site logo
- `POST /api/upload/publisher-logo` - Upload publisher logo
- `POST /api/upload/favicon` - Upload favicon

### File Storage

- Files stored in `backend/uploads/` directory
- Unique filenames with timestamps
- Automatic cleanup of old files
- Environment-based URL generation

## Usage Instructions

### For Administrators

1. **Navigate to Settings**: Admin → Settings → Site
2. **Upload Site Logo**: This logo will be used in both admin panel and main website headers
3. **Upload Publisher Logo**: For publisher-specific branding
4. **Upload Favicon**: For browser tab icon

### For Developers

1. **Use useSiteSettings Hook**: 
   ```javascript
   const { settings } = useSiteSettings();
   ```

2. **Access Logo URLs**:
   ```javascript
   const siteLogo = settings?.siteLogo;
   const publisherLogo = settings?.publisherLogo;
   const favicon = settings?.siteFavicon;
   ```

3. **Implement Fallback**:
   ```javascript
   {settings?.siteLogo ? (
     <img src={settings.siteLogo} alt="Logo" />
   ) : (
     <DefaultIcon />
   )}
   ```

## Future Enhancements

1. **Logo Variants**: Different sizes for different contexts
2. **Logo Optimization**: Automatic resizing and compression
3. **Logo Analytics**: Track logo usage and performance
4. **Logo Templates**: Pre-designed logo templates for quick setup

## Troubleshooting

### Logo Not Displaying
1. Check if logo URL is set in site settings
2. Verify the uploaded file exists in backend/uploads/
3. Check browser console for image loading errors
4. Ensure environment variables are set correctly

### Logo Upload Issues
1. Verify file type is supported (.png, .svg, .jpg, .jpeg, .webp)
2. Check file size limits (5MB for logos, 2MB for favicon)
3. Ensure admin authentication is working
4. Check backend logs for upload errors 