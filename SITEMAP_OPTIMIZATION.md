# Sitemap Optimization for Vercel Deployment

## Problem
The original sitemap generation was timing out on Vercel builds because it was trying to fetch all articles during the build process, which could take more than 60 seconds.

## Solution
We've implemented a multi-layered approach to optimize sitemap generation:

### 1. Optimized Main Sitemap (`/sitemap.xml`)
- **Location**: `frontend/src/app/sitemap.ts`
- **Purpose**: Generates static pages, RSS feeds, and category pages
- **Articles**: Only includes articles if `ENABLE_SITEMAP_ARTICLES=true` (disabled by default)
- **Timeout**: 30-second timeout for API calls
- **Limit**: Reduced from 100 to 50 articles for faster generation

### 2. Dynamic Article Sitemap API (`/api/sitemap/articles`)
- **Location**: `frontend/src/app/api/sitemap/articles/route.ts`
- **Purpose**: Generates article sitemaps on-demand
- **Features**: 
  - Pagination support
  - 30-second timeout
  - Optimized backend endpoint
  - Caching headers

### 3. Optimized Backend Endpoint (`/api/articles/sitemap`)
- **Location**: `backend/routes/articles.js`
- **Purpose**: Fast article fetching for sitemap generation
- **Optimizations**:
  - Only fetches required fields (slug, publishedAt, updatedAt)
  - No population of related data
  - Efficient pagination

### 4. Vercel Configuration (`vercel.json`)
- **Purpose**: Optimize build process and caching
- **Features**:
  - 60-second max duration for sitemap generation
  - Proper caching headers
  - Content-Type headers

## Environment Variables

```bash
# Required
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_API_URL=https://your-api-domain.com

# Optional (for including articles in main sitemap)
ENABLE_SITEMAP_ARTICLES=false
```

## Usage

### For Production (Recommended)
1. Set `ENABLE_SITEMAP_ARTICLES=false` (default)
2. Main sitemap will only include static pages, RSS feeds, and categories
3. Article sitemaps are generated dynamically via `/api/sitemap/articles`

### For Development
1. Set `ENABLE_SITEMAP_ARTICLES=true` to include articles in main sitemap
2. Useful for testing with smaller datasets

## Testing

Run the test script to verify sitemap generation:

```bash
cd frontend
node test-sitemap.js
```

## Performance Improvements

1. **Reduced API calls during build**: Main sitemap no longer fetches articles by default
2. **Optimized database queries**: Backend sitemap endpoint only selects required fields
3. **Timeout protection**: All API calls have 30-second timeouts
4. **Caching**: Proper cache headers for sitemap endpoints
5. **Pagination**: Article sitemaps support pagination for large datasets

## Monitoring

- Check Vercel build logs for sitemap generation times
- Monitor API response times for `/api/articles/sitemap`
- Use the test script to verify performance locally

## Troubleshooting

### Build Still Timing Out
1. Ensure `ENABLE_SITEMAP_ARTICLES=false`
2. Check that your API is responding quickly
3. Verify database indexes are optimized
4. Consider reducing the article limit further

### Articles Not Appearing in Sitemap
1. Check that articles have `status: 'published'`
2. Verify the API endpoint is accessible
3. Check network connectivity between frontend and backend
4. Review API response format

### Performance Issues
1. Add database indexes for `status` and `publishedAt` fields
2. Consider implementing Redis caching for article data
3. Optimize database queries further
4. Use CDN caching for sitemap files 