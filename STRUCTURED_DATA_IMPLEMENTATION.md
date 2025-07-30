# Structured Data Implementation for Articles

## Overview

This implementation adds comprehensive structured data markup to articles following the NewsArticle schema, optimized for Google Discover and search engine visibility.

## Features Implemented

### 1. NewsArticle Schema Markup
- **Type**: NewsArticle
- **Publisher Information**: Complete organization details
- **Author Information**: Person schema with proper linking
- **Article Metadata**: Headline, datePublished, dateModified
- **Content Information**: Description, keywords, articleSection
- **Interaction Data**: View counts, read time
- **Image Optimization**: Multiple image sizes for different contexts

### 2. Publisher Schema
- **Organization Type**: Complete publisher details
- **Logo**: Publisher logo with dimensions
- **Social Media**: Facebook, Twitter, YouTube links
- **Contact Information**: Email, phone, address

### 3. Site Settings Management
- **Admin Panel**: Complete site settings management
- **Dynamic Configuration**: Real-time settings updates
- **SEO Optimization**: Google Analytics, Search Console integration

## Implementation Details

### Backend Components

#### Settings Model (`backend/models/Settings.js`)
```javascript
const settingsSchema = new mongoose.Schema({
  siteName: { type: String, required: true, default: 'The Daily Herald' },
  siteDescription: { type: String, maxlength: 500 },
  siteUrl: { type: String, required: true },
  publisherName: { type: String, required: true },
  publisherUrl: { type: String, required: true },
  publisherLogo: { type: String },
  socialMedia: {
    facebook: String,
    twitter: String,
    youtube: String,
    instagram: String
  },
  contactInfo: {
    email: String,
    phone: String,
    address: String
  },
  seoSettings: {
    defaultTitle: String,
    defaultDescription: String,
    googleAnalyticsId: String,
    googleSearchConsole: String
  }
});
```

#### Settings API (`backend/routes/settings.js`)
- `GET /api/settings` - Get site settings
- `PUT /api/settings` - Update site settings (Admin only)
- `GET /api/settings/public` - Get public settings for structured data

### Frontend Components

#### StructuredData Component (`frontend/src/components/StructuredData.tsx`)
```typescript
interface StructuredDataProps {
  article: Article;
  settings?: {
    siteName: string;
    siteUrl: string;
    publisherName: string;
    publisherUrl: string;
    publisherLogo?: string;
    socialMedia?: {
      facebook?: string;
      twitter?: string;
      youtube?: string;
    };
  } | null;
}
```

#### Site Settings Hook (`frontend/src/hooks/useSiteSettings.ts`)
```typescript
export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetches settings from API with fallback defaults
}
```

#### Admin Site Settings Page (`frontend/src/app/admin/settings/site/page.tsx`)
- Complete form for managing site settings
- Real-time validation and error handling
- Organized sections for different setting types

## Structured Data Schema

### NewsArticle Schema
```json
{
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  "id": "https://yourdomain.com/article/article-slug",
  "publisher": {
    "@type": "Organization",
    "id": "https://yourdomain.com#publisher",
    "name": "The Daily Herald",
    "url": "https://yourdomain.com",
    "logo": {
      "@type": "ImageObject",
      "url": "https://yourdomain.com/logo.png",
      "width": 190,
      "height": 60
    },
    "sameAs": [
      "https://facebook.com/yourpage",
      "https://twitter.com/yourhandle",
      "https://youtube.com/yourchannel"
    ]
  },
  "isAccessibleForFree": "http://schema.org/True",
  "isPartOf": {
    "@type": "Product",
    "name": "The Daily Herald",
    "productID": "https://yourdomain.com:basic"
  },
  "image": [
    "https://yourdomain.com/image.jpg",
    "https://yourdomain.com/image.jpg?width=1200&height=630&quality=85&auto=format&fit=crop",
    "https://yourdomain.com/image.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop",
    "https://yourdomain.com/image.jpg?width=1200&height=900&quality=85&auto=format&fit=crop",
    "https://yourdomain.com/image.jpg?width=1200&quality=85&auto=format&fit=max"
  ],
  "author": {
    "@type": "Person",
    "name": "Author Name",
    "sameAs": "https://yourdomain.com/profile/author-id"
  },
  "datePublished": "2025-01-29T02:53:00Z",
  "headline": "Article Headline",
  "dateModified": "2025-01-29T06:36:04Z",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "id": "https://yourdomain.com/article/article-slug",
    "potentialAction": {
      "@type": "ViewAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://yourdomain.com/article/article-slug"
      }
    }
  },
  "description": "Article description or excerpt",
  "keywords": "keyword1, keyword2, keyword3",
  "articleSection": "Category Name",
  "timeRequired": "PT5M",
  "interactionStatistic": {
    "@type": "InteractionCounter",
    "interactionType": "https://schema.org/ReadAction",
    "userInteractionCount": 1234
  }
}
```

## Google Discover Optimization

### Key Features for Discover
1. **High-Quality Images**: Multiple image sizes for different contexts
2. **Fresh Content**: Proper datePublished and dateModified
3. **Author Information**: Complete author schema
4. **Publisher Details**: Full organization information
5. **Content Classification**: ArticleSection for categorization
6. **Engagement Metrics**: View counts and read time
7. **Social Signals**: Publisher social media links

### Best Practices Implemented
- **Schema.org Compliance**: Full NewsArticle schema implementation
- **Image Optimization**: Multiple sizes for different platforms
- **Author Attribution**: Proper author linking and information
- **Publisher Branding**: Complete organization details
- **Content Freshness**: Accurate publication and modification dates
- **Category Classification**: Proper article section tagging
- **Engagement Tracking**: View counts and reading time

## Admin Panel Features

### Site Settings Management
1. **Basic Information**
   - Site name and description
   - Site URL and logo
   - Publisher details

2. **Social Media Integration**
   - Facebook, Twitter, YouTube, Instagram URLs
   - Automatic inclusion in structured data

3. **Contact Information**
   - Email, phone, address
   - For publisher schema

4. **SEO Settings**
   - Default page titles and descriptions
   - Google Analytics integration
   - Search Console verification

### Settings Validation
- Required field validation
- URL format validation
- Real-time error feedback
- Success confirmation messages

## Usage Instructions

### For Developers
1. **Import the hook**:
   ```typescript
   import { useSiteSettings } from '@/hooks/useSiteSettings';
   ```

2. **Use in components**:
   ```typescript
   const { settings, loading, error } = useSiteSettings();
   ```

3. **Add structured data**:
   ```typescript
   <StructuredData article={article} settings={settings} />
   ```

### For Administrators
1. **Access Site Settings**: Navigate to Admin Panel > Site Settings
2. **Configure Basic Info**: Set site name, URL, and description
3. **Add Publisher Details**: Include logo and social media links
4. **Set Contact Info**: Add email, phone, and address
5. **Configure SEO**: Add Google Analytics and Search Console IDs
6. **Save Settings**: Click "Save Settings" to apply changes

## Testing and Validation

### Google Rich Results Test
- Use Google's Rich Results Test tool
- Validate structured data markup
- Check for warnings and errors

### Schema.org Validator
- Test with Schema.org validator
- Ensure proper schema compliance
- Verify all required fields

### Google Discover Requirements
- High-quality, original content
- Proper image optimization
- Accurate publication dates
- Complete author information
- Publisher credibility signals

## Performance Considerations

### Optimization Features
- **Lazy Loading**: Settings loaded on demand
- **Caching**: Settings cached for performance
- **Fallback Values**: Default settings if API fails
- **Error Handling**: Graceful degradation

### SEO Benefits
- **Rich Snippets**: Enhanced search results
- **Google Discover**: Eligibility for Discover feed
- **Social Sharing**: Better social media previews
- **Voice Search**: Improved voice search results

## Future Enhancements

### Planned Features
1. **Article Series**: Support for article series markup
2. **Video Content**: VideoObject schema for video articles
3. **Live Content**: LiveBlogPosting for live coverage
4. **Review Content**: Review schema for review articles
5. **Recipe Content**: Recipe schema for food articles

### Advanced SEO
1. **Breadcrumb Schema**: Enhanced navigation markup
2. **FAQ Schema**: FAQ markup for Q&A content
3. **How-to Schema**: Step-by-step content markup
4. **Product Schema**: Product review markup

This implementation provides a solid foundation for Google Discover optimization and enhanced search engine visibility through comprehensive structured data markup. 