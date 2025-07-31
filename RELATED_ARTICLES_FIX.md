# Related Articles Fix

This document explains the fix for the "No related articles found" issue on single article pages.

## Problem

The related articles section was always showing "No related articles found" even when there were many articles in the same category.

## Root Cause

The issue was caused by a mismatch between how the frontend was requesting related articles and how the backend was expecting the category parameter:

### Frontend Issue
**File**: `frontend/src/app/article/[slug]/page.tsx`

The frontend was passing a category ID to the API, but the backend expected a category slug:

```typescript
// Before (incorrect - passing category ID)
const categoryId = typeof article.category === 'string' ? article.category : article.category?._id;
const relatedArticles = categoryId ? await getRelatedArticles(categoryId, article._id || article.id || '') : [];
```

### Backend Issue
**File**: `backend/routes/articles.js`

The backend API route was expecting a category slug and then looking up the category to get the ID:

```javascript
// Backend expects category slug, not ID
if (category) {
  // First find the category by slug
  const categoryDoc = await Category.findOne({ slug: category });
  if (categoryDoc) {
    query.category = categoryDoc._id;
  }
}
```

### Missing Category Slug
**File**: `backend/routes/articles.js`

The article routes were not populating the category slug field:

```javascript
// Before (missing slug)
.populate('category', 'name color')
```

## Solution

### 1. Fixed Frontend Category Extraction

**File**: `frontend/src/app/article/[slug]/page.tsx`

Updated to use category slug instead of ID:

```typescript
// After (correct - using category slug)
const categorySlug = typeof article.category === 'string' ? article.category : article.category?.slug;
const relatedArticles = categorySlug ? await getRelatedArticles(categorySlug, article._id || article.id || '') : [];
```

### 2. Fixed Backend Category Population

**File**: `backend/routes/articles.js`

Updated all article routes to include the category slug in the populate:

```javascript
// Updated populate to include slug
.populate('category', 'name color slug')
```

This was applied to:
- `/api/articles/slug/:slug` route
- `/api/articles/:id` route  
- `/api/articles` (main articles list) route

### 3. Updated TypeScript Interface

**File**: `frontend/src/types/news.ts`

Added slug field to the category interface:

```typescript
category: {
  _id: string;
  name: string;
  color: string;
  slug: string;  // ✅ Added this field
};
```

### 4. Added Debugging

Added console logging to help troubleshoot related articles fetching:

```typescript
// Frontend debugging
console.log('Article category info:', article.category);
console.log('Category slug for related articles:', categorySlug);

// API debugging
console.log('Fetching related articles for category:', categorySlug, 'excluding:', excludeId);
console.log('Related articles response:', data);
console.log('Found related articles:', articles.length);
```

## How It Works Now

### 1. **Article Fetching**
1. Frontend fetches article by slug
2. Backend populates category with `name`, `color`, and `slug`
3. Article object includes complete category information

### 2. **Related Articles Fetching**
1. Frontend extracts category slug from article
2. Frontend calls API with category slug: `/api/articles?category=politics&limit=3&exclude=articleId`
3. Backend finds category by slug, then queries articles by category ID
4. Backend returns related articles in the same category

### 3. **Display Logic**
1. RelatedArticles component receives the articles array
2. If articles.length === 0, shows "No related articles found"
3. If articles.length > 0, displays the related articles

## Testing

To test the fix:

1. **Create Multiple Articles**: Create several articles in the same category
2. **Visit Article Page**: Go to any article page
3. **Check Related Articles**: Scroll down to see if related articles appear
4. **Verify Category**: Ensure related articles are from the same category
5. **Test Different Categories**: Try articles from different categories

## Expected Behavior

### ✅ **Working Correctly**
- Articles in the same category show as related articles
- Related articles exclude the current article
- Maximum 3 related articles are shown
- "No related articles found" only shows when truly no related articles exist

### ❌ **Previously Broken**
- Always showed "No related articles found"
- Category slug was not available in article data
- API calls were using wrong parameter type

## Debugging

If related articles still don't appear:

1. **Check Browser Console**: Look for debugging logs
2. **Verify Category Slug**: Ensure category has a valid slug
3. **Check API Response**: Verify the articles API returns data
4. **Test API Directly**: Try the API endpoint directly in browser

## Future Enhancements

1. **Better Related Articles Algorithm**: Consider content similarity, tags, etc.
2. **Caching**: Implement better caching for related articles
3. **Fallback Logic**: Show articles from other categories if no same-category articles
4. **Analytics**: Track which related articles get clicked most 