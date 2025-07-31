# Favicon Environment Variables Configuration

This document explains how to configure favicon URLs using environment variables for both localhost and live server environments.

## Environment Variables

### Frontend (Next.js)

Add these environment variables to your `.env.local` file:

```env
# API Base URL for backend communication
NEXT_PUBLIC_API_URL=http://localhost:5000

# Optional: Direct favicon URL override
NEXT_PUBLIC_FAVICON_URL=https://yourdomain.com/favicon.ico
```

### Backend (Node.js)

Add these environment variables to your `.env` file:

```env
# API Base URL for serving files
API_BASE_URL=http://localhost:5000

# Optional: Default favicon URL
DEFAULT_FAVICON_URL=https://yourdomain.com/uploads/favicon.ico

# Site URL for general site configuration
SITE_URL=http://localhost:3000
```

## Configuration Examples

### Local Development

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

**Backend (.env):**
```env
API_BASE_URL=http://localhost:5000
SITE_URL=http://localhost:3000
```

### Production Server

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_FAVICON_URL=https://yourdomain.com/favicon.ico
```

**Backend (.env):**
```env
API_BASE_URL=https://api.yourdomain.com
DEFAULT_FAVICON_URL=https://yourdomain.com/uploads/favicon.ico
SITE_URL=https://yourdomain.com
```

## How It Works

### Priority Order

1. **Environment Variable Override**: `NEXT_PUBLIC_FAVICON_URL` (frontend) or `DEFAULT_FAVICON_URL` (backend)
2. **Database Settings**: Favicon URL stored in the database
3. **Default Fallback**: `/favicon.ico` (frontend) or `/uploads/favicon.ico` (backend)

### URL Resolution

- **Relative URLs**: Automatically converted to absolute URLs using the base URL
- **Absolute URLs**: Used as-is
- **Environment Variables**: Take precedence over database settings

### Examples

```javascript
// Frontend FaviconProvider.tsx
const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const envFaviconUrl = process.env.NEXT_PUBLIC_FAVICON_URL;
let faviconUrl = envFaviconUrl || settings?.siteFavicon || '/favicon.ico';

// If favicon URL is relative, make it absolute
if (faviconUrl && faviconUrl.startsWith('/') && baseUrl) {
  faviconUrl = `${baseUrl}${faviconUrl}`;
}
```

## Benefits

1. **Environment Flexibility**: Works in both development and production
2. **Easy Configuration**: Simple environment variable setup
3. **Fallback Support**: Multiple fallback options ensure favicon always loads
4. **URL Resolution**: Automatic handling of relative vs absolute URLs
5. **Database Integration**: Still supports database-stored favicon URLs

## Troubleshooting

### Favicon Not Loading

1. Check environment variables are set correctly
2. Verify API base URL is accessible
3. Ensure favicon file exists at the specified path
4. Check browser console for any errors

### Environment Variable Not Working

1. Restart development server after changing environment variables
2. Ensure variable names match exactly (case-sensitive)
3. Check that `.env` files are in the correct directories
4. Verify environment variables are prefixed with `NEXT_PUBLIC_` for frontend

### Production Deployment

1. Set environment variables in your hosting platform
2. Ensure API base URL is publicly accessible
3. Configure CORS if frontend and backend are on different domains
4. Test favicon loading in production environment 