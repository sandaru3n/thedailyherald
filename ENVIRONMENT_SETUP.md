# Environment Variables Setup

This document explains how to configure environment variables for the The Daily Herald application.

## Backend Environment Variables

The backend already has environment variables configured in `backend/config.env`:

```env
# API Base URL for file uploads and favicon
API_BASE_URL=http://localhost:5000
```

## Frontend Environment Variables

Create a `.env.local` file in the `frontend` directory with the following content:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000

# Optional: Custom favicon URL (if you want to override the database setting)
# NEXT_PUBLIC_FAVICON_URL=http://localhost:5000/api/upload/uploads/your-favicon.ico
```

## How It Works

### Backend (Node.js)
- The backend uses `API_BASE_URL` from `config.env` to generate file URLs
- When a favicon is uploaded, it creates URLs like: `http://localhost:5000/api/upload/uploads/favicon-1234567890.ico`
- This environment variable is used in `backend/routes/upload.js`

### Frontend (Next.js)
- The frontend uses `NEXT_PUBLIC_API_URL` to make API calls
- The `FaviconProvider` component uses this to construct absolute URLs for favicons
- This ensures the favicon works correctly in different environments

## Environment-Specific Configuration

### Development
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Production
```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

### Staging
```env
NEXT_PUBLIC_API_URL=https://staging-api.yourdomain.com
```

## Benefits

1. **Environment Flexibility**: Easy to switch between development, staging, and production
2. **No Hardcoded URLs**: All URLs are configurable via environment variables
3. **Consistent Configuration**: Both frontend and backend use the same base URL pattern
4. **Easy Deployment**: Different environments can have different configurations

## Troubleshooting

If the favicon is not loading:
1. Check that `NEXT_PUBLIC_API_URL` is set correctly in your frontend `.env.local`
2. Verify that `API_BASE_URL` is set correctly in your backend `config.env`
3. Ensure the uploaded favicon file exists in the backend uploads directory
4. Check browser console for any CORS or network errors 