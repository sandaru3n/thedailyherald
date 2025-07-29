# Automatic Category Identification for RSS Feeds

## Overview

The RSS feed system now includes automatic category identification using AI-powered analysis. This feature eliminates the need for manual category selection when setting up RSS feeds and ensures articles are properly categorized based on their content.

## Features

### 1. AI-Powered Category Identification
- Uses Google Gemini AI to analyze article title and content
- Automatically identifies the most appropriate category from available options
- Provides intelligent categorization based on topic, tone, and subject matter

### 2. Fallback Keyword Matching
- Robust fallback system using keyword matching when AI is unavailable
- Predefined keyword mappings for common categories
- Ensures categorization works even without AI API access

### 3. Configurable Settings
- Enable/disable automatic category identification per feed
- Works alongside existing AI content rewriting features
- Maintains backward compatibility with existing feeds

## How It Works

### AI Analysis Process
1. **Content Analysis**: Analyzes article title and content (first 1000 characters)
2. **Category Matching**: Compares against available categories in the database
3. **Intelligent Selection**: Uses AI to determine the best category match
4. **Fallback Handling**: Falls back to keyword matching if AI fails

### Category Keywords
The system includes predefined keyword mappings for common categories:

- **Technology**: tech, software, hardware, AI, programming, startup, innovation
- **Politics**: politics, government, election, congress, president, policy
- **Business**: business, economy, market, finance, company, investment
- **Sports**: sports, football, basketball, baseball, soccer, olympics
- **Entertainment**: entertainment, movie, music, celebrity, hollywood, tv
- **Health**: health, medical, doctor, hospital, disease, treatment
- **Science**: science, research, study, discovery, laboratory, scientist
- **World**: world, international, global, foreign, country, diplomacy
- **Education**: education, school, university, student, teacher, academic
- **Environment**: environment, climate, weather, pollution, renewable, nature

## Configuration

### RSS Feed Settings
```javascript
settings: {
  enableAutoCategory: true,        // Enable/disable automatic categorization
  enableAiRewrite: true,          // AI content rewriting
  aiRewriteStyle: 'professional', // Writing style
  includeOriginalSource: true,    // Include source attribution
  autoPublish: true,              // Auto-publish articles
  publishDelay: 0                 // Publish delay in minutes
}
```

### Environment Variables
```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

## API Endpoints

### Test Category Identification
```http
POST /api/rss-feeds/test-category
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "Article Title",
  "content": "Article content..."
}
```

Response:
```json
{
  "message": "Category identified successfully",
  "category": {
    "_id": "category_id",
    "name": "Technology",
    "description": "Technology news and updates"
  }
}
```

## Migration

### Running the Migration
To update existing RSS feeds to use automatic category identification:

```bash
cd backend
node migrations/remove-rss-category.js
```

This migration:
- Removes the `category` field from all RSS feeds
- Adds `enableAutoCategory: true` to feed settings
- Preserves all other feed configurations

### Before Migration
```javascript
{
  name: "Tech News Feed",
  feedUrl: "https://example.com/feed.xml",
  category: "category_id",  // Manual category
  // ... other fields
}
```

### After Migration
```javascript
{
  name: "Tech News Feed",
  feedUrl: "https://example.com/feed.xml",
  settings: {
    enableAutoCategory: true,  // Automatic categorization
    // ... other settings
  }
  // ... other fields
}
```

## Frontend Integration

### RSS Feed Management
- Category selection removed from feed creation/editing forms
- New "Auto-Category" badge shows when automatic categorization is enabled
- Test category identification feature available in feed settings

### Testing Interface
- Test category identification with sample titles and content
- Real-time feedback on identified categories
- Helps verify AI categorization accuracy

## Error Handling

### AI Service Failures
- Automatic fallback to keyword matching
- Graceful degradation when API is unavailable
- Error logging for debugging and monitoring

### Rate Limiting
- Handles Gemini API rate limits gracefully
- Continues processing with fallback methods
- Maintains feed processing reliability

## Benefits

1. **Simplified Setup**: No need to manually assign categories to RSS feeds
2. **Improved Accuracy**: AI-powered analysis provides better categorization
3. **Scalability**: Works with any number of categories without configuration
4. **Reliability**: Fallback systems ensure categorization always works
5. **Flexibility**: Can be enabled/disabled per feed as needed

## Troubleshooting

### Common Issues

1. **AI Not Working**
   - Check `GEMINI_API_KEY` environment variable
   - Verify API key has proper permissions
   - Check network connectivity

2. **Poor Categorization**
   - Review category descriptions in database
   - Test with sample content using the test interface
   - Consider adding more specific keywords to fallback system

3. **Migration Issues**
   - Backup database before running migration
   - Check MongoDB connection and permissions
   - Verify migration script completed successfully

### Debugging
- Check server logs for AI service errors
- Use test category identification endpoint
- Monitor RSS feed error logs for categorization issues

## Future Enhancements

- Machine learning model training on categorized articles
- Category confidence scoring
- Custom category keyword mappings
- Bulk category identification for existing articles
- Category suggestion improvements based on user feedback