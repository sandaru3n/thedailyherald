# Next.js Image Configuration Fix

This document explains the fix for the Next.js image configuration error when using external image URLs.

## Problem

The application was getting this error when trying to load images from external URLs:

```
Invalid src prop (https://thedailyherald.onrender.com/api/upload/uploads/publisherLogo-1753946319751-432946219.png) on `next/image`, hostname "thedailyherald.onrender.com" is not configured under images in your `next.config.js`
```

## Root Cause

1. **External Image URLs**: The application uses external image URLs from the environment variable `NEXT_PUBLIC_API_URL` (e.g., `https://thedailyherald.onrender.com`)
2. **Next.js Image Component**: Next.js Image component requires hostnames to be explicitly configured for security reasons
3. **Missing Configuration**: The hostname `thedailyherald.onrender.com` was not configured in `next.config.ts`

## Solution

### 1. Updated Next.js Configuration

**File**: `frontend/next.config.ts`

Added the external hostname to the image configuration:

```typescript
images: {
  // ... existing config
  domains: ['localhost', 'flashnewslk.com', 'www.flashnewslk.com', 'thedailyherald.onrender.com'],
  remotePatterns: [
    // ... existing patterns
    {
      protocol: 'https',
      hostname: 'thedailyherald.onrender.com',
      pathname: '/**',
    },
  ],
}
```

### 2. Fixed Component Usage

**File**: `frontend/src/components/Footer.tsx`

Changed from Next.js Image component to regular `<img>` tag for external images:

```typescript
// Before (causing error)
<Image 
  src={settings.publisherLogo} 
  alt="" 
  width={48}
  height={48}
  className="rounded-lg"
  aria-hidden="true"
/>

// After (working correctly)
<img 
  src={settings.publisherLogo} 
  alt="" 
  width={48}
  height={48}
  className="rounded-lg w-12 h-12 object-cover"
  aria-hidden="true"
/>
```

### 3. Verified Other Components

Checked that other components using external images are already using regular `<img>` tags:

- ✅ `AdminLayout.tsx` - Uses `<img>` for site logo
- ✅ `Header.tsx` - Uses `<img>` for site logo
- ✅ `OptimizedImage.tsx` - Handles external images with `<img>` tag

## Best Practices

### For External Images

1. **Use Regular `<img>` Tags**: For images from external URLs, use regular HTML `<img>` tags
2. **Avoid Next.js Image**: Don't use Next.js Image component for external images unless the hostname is configured
3. **Handle Loading States**: Implement proper loading and error states

### For Internal Images

1. **Use Next.js Image**: For images served from your own domain, use Next.js Image component
2. **Configure Hostnames**: Add external hostnames to `next.config.ts` if you must use Next.js Image

## Configuration Options

### Option 1: Configure Hostname (Recommended for Production)

```typescript
// next.config.ts
images: {
  domains: ['your-external-domain.com'],
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'your-external-domain.com',
      pathname: '/**',
    },
  ],
}
```

### Option 2: Use Regular `<img>` Tags (Recommended for External Images)

```typescript
// Component
<img 
  src={externalImageUrl} 
  alt="Description"
  className="w-full h-full object-cover"
/>
```

## Environment Variables

The application uses these environment variables for image URLs:

```env
# Frontend
NEXT_PUBLIC_API_URL=https://thedailyherald.onrender.com

# Backend  
API_BASE_URL=https://thedailyherald.onrender.com
```

## Testing

To test the fix:

1. **Upload a logo** in Admin → Settings → Site
2. **Check the admin panel** - logo should display correctly
3. **Check the main website header** - logo should display correctly
4. **Check the footer** - publisher logo should display correctly

## Future Considerations

1. **Image Optimization**: Consider implementing image optimization for external images
2. **CDN Integration**: Use a CDN for better image delivery
3. **Fallback Images**: Implement fallback images for failed loads
4. **Lazy Loading**: Ensure proper lazy loading for better performance

## Troubleshooting

### If Images Still Don't Load

1. **Check Console**: Look for CORS or network errors
2. **Verify URL**: Ensure the image URL is accessible
3. **Check Configuration**: Verify hostname is in `next.config.ts`
4. **Clear Cache**: Clear browser cache and restart development server

### If Using Next.js Image for External Images

1. **Add Hostname**: Add the external hostname to `next.config.ts`
2. **Restart Server**: Restart the development server after config changes
3. **Check Protocol**: Ensure the protocol (http/https) matches in configuration 