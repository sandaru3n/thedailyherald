# RSS Feed Automation Feature

## Overview

The RSS Feed Automation feature allows you to automatically fetch news from RSS feeds, rewrite content using Google Gemini AI, and publish articles to your website. This feature provides a complete automated news publishing system with customizable settings.

## Features

- **RSS Feed Management**: Add, edit, and manage multiple RSS feeds
- **AI Content Rewriting**: Automatically rewrite content using Google Gemini AI
- **Category Assignment**: Assign feeds to existing website categories
- **Author Management**: Set default authors for each feed
- **Content Filtering**: Set minimum content length requirements
- **Rate Limiting**: Control maximum posts per day per feed
- **Auto Publishing**: Automatically publish articles or save as drafts
- **Error Logging**: Track and monitor feed processing errors
- **Scheduled Processing**: Automatic processing every 30 minutes
- **Manual Processing**: Trigger processing on demand

## Setup Instructions

### 1. Backend Dependencies

Install the required dependencies in the backend:

```bash
cd backend
npm install fast-xml-parser node-cron
```

### 2. Environment Variables

Add the following environment variables to your backend `.env` file:

```env
# Google Gemini API Key (required for AI content rewriting)
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Customize processing schedule (default: every 30 minutes)
RSS_PROCESSING_SCHEDULE="*/30 * * * *"

# Optional: Customize daily reset time (default: midnight UTC)
RSS_DAILY_RESET_SCHEDULE="0 0 * * *"
```

### 3. Google Gemini API Setup

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add the API key to your environment variables

### 4. Database Migration

The RSS feed model will be automatically created when you start the server. No manual migration is required.

## Usage

### 1. Access RSS Feeds Management

1. Log in to your admin panel
2. Navigate to "RSS Feeds" in the sidebar
3. You'll see the RSS feeds management interface

### 2. Adding a New RSS Feed

1. Click "Add RSS Feed" button
2. Fill in the required information:
   - **Feed Name**: A descriptive name for the feed
   - **Feed URL**: The RSS feed URL (e.g., `https://example.com/feed.xml`)
   - **Category**: Select an existing category for the articles
   - **Default Author**: Choose the author for published articles
   - **Minimum Content Length**: Minimum characters required (default: 100)
   - **Max Posts Per Day**: Maximum articles to publish per day (default: 5)

3. Configure AI Settings:
   - **Enable AI Rewriting**: Toggle AI content rewriting on/off
   - **AI Rewrite Style**: Choose from Professional, Casual, Formal, or Creative
   - **Include Original Source**: Add source attribution to articles
   - **Auto Publish**: Automatically publish articles or save as drafts
   - **Publish Delay**: Delay in minutes before publishing (optional)

4. Click "Create Feed"

### 3. Managing RSS Feeds

#### View Feed Status
- **Active/Inactive**: Toggle feed processing on/off
- **Published Today**: Shows current day's published count vs limit
- **Total Published**: Total articles published from this feed
- **Last Fetched**: When the feed was last processed
- **Error Log**: Recent processing errors

#### Process Feeds
- **Process Individual Feed**: Click the play button on any feed
- **Process All Feeds**: Use the "Process All" button to process all active feeds

#### Edit Feed Settings
- Click the edit button to modify feed configuration
- All settings can be updated except the feed ID

#### Delete Feed
- Click the delete button to remove a feed
- This action cannot be undone

### 4. Automatic Processing

The system automatically processes RSS feeds every 30 minutes. You can:

- Monitor processing in the server logs
- Check feed status in the admin panel
- View error logs for troubleshooting

## AI Content Rewriting

### How It Works

1. **Content Extraction**: The system extracts content from RSS feed items
2. **AI Processing**: Content is sent to Google Gemini AI for rewriting
3. **Style Application**: Content is rewritten according to the selected style
4. **Quality Check**: System ensures content meets minimum length requirements
5. **Publication**: Articles are published or saved as drafts

### AI Rewrite Styles

- **Professional**: Journalistic style suitable for news websites
- **Casual**: Friendly, conversational tone
- **Formal**: Academic, precise language
- **Creative**: Engaging, story-telling approach

### Content Quality

The AI rewriting:
- Maintains factual accuracy
- Improves readability and flow
- Preserves key information
- Adapts to your chosen style
- Keeps similar length to original

## Configuration Options

### Feed Settings

```javascript
{
  enableAiRewrite: true,        // Enable/disable AI rewriting
  aiRewriteStyle: 'professional', // Style: professional, casual, formal, creative
  includeOriginalSource: true,  // Add source attribution
  autoPublish: true,           // Auto-publish or save as drafts
  publishDelay: 0              // Delay in minutes before publishing
}
```

### Processing Limits

- **Minimum Content Length**: 50-1000 characters (default: 100)
- **Maximum Posts Per Day**: 1-50 articles (default: 5)
- **Processing Frequency**: Every 30 minutes (configurable)
- **Error Log Retention**: Last 50 errors per feed

## Error Handling

### Common Errors

1. **Invalid RSS URL**: Feed URL is not accessible or invalid
2. **Content Too Short**: Articles don't meet minimum length requirement
3. **Duplicate Articles**: Articles with same title already exist
4. **AI API Errors**: Google Gemini API issues
5. **Network Errors**: Connection problems

### Error Logging

- Errors are logged with timestamps
- Error types: error, warning, info
- Last 50 errors retained per feed
- Clear error logs option available

## API Endpoints

### RSS Feeds Management

```
GET    /api/rss-feeds          # List all RSS feeds
POST   /api/rss-feeds          # Create new RSS feed
GET    /api/rss-feeds/:id      # Get specific RSS feed
PUT    /api/rss-feeds/:id      # Update RSS feed
DELETE /api/rss-feeds/:id      # Delete RSS feed
```

### RSS Processing

```
POST   /api/rss-feeds/:id/process    # Process specific feed
POST   /api/rss-feeds/process/all    # Process all active feeds
POST   /api/rss-feeds/test           # Test RSS feed URL
```

### Statistics

```
GET    /api/rss-feeds/:id/stats      # Get feed statistics
DELETE /api/rss-feeds/:id/errors     # Clear error logs
```

## Monitoring and Maintenance

### Server Logs

Monitor these log messages:
- `🔄 Processing RSS feeds...`
- `✅ RSS processing completed: X processed, Y published`
- `❌ RSS processing errors: [details]`

### Performance Considerations

- Processing runs every 30 minutes
- Each feed is processed independently
- AI API calls are rate-limited
- Error handling prevents system crashes

### Backup and Recovery

- RSS feed configurations are stored in MongoDB
- Error logs help with troubleshooting
- Manual processing available for recovery

## Troubleshooting

### Feed Not Processing

1. Check if feed is active
2. Verify RSS URL is accessible
3. Check error logs for specific issues
4. Ensure minimum content length is met
5. Verify daily post limit hasn't been reached

### AI Rewriting Issues

1. Verify GEMINI_API_KEY is set
2. Check API key permissions
3. Monitor API rate limits
4. Review error logs for API errors

### Performance Issues

1. Reduce processing frequency
2. Lower maximum posts per day
3. Increase minimum content length
4. Monitor server resources

## Best Practices

### RSS Feed Selection

- Choose reliable, well-maintained feeds
- Verify feed URLs are stable
- Test feeds before adding
- Monitor feed quality regularly

### Content Management

- Set appropriate minimum content lengths
- Use reasonable daily post limits
- Choose suitable AI rewrite styles
- Enable source attribution for transparency

### Monitoring

- Regularly check error logs
- Monitor published content quality
- Review feed performance statistics
- Update feed configurations as needed

## Security Considerations

- RSS feeds are processed server-side
- API keys are stored securely
- Error logs don't expose sensitive data
- Processing is rate-limited to prevent abuse

## Support

For issues or questions:
1. Check error logs in the admin panel
2. Review server logs for detailed information
3. Verify environment variable configuration
4. Test RSS feed URLs manually

## Future Enhancements

Potential improvements:
- Custom AI prompts for rewriting
- Advanced content filtering
- Image extraction and processing
- Social media integration
- Analytics and reporting
- Bulk feed import/export 