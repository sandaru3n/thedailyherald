const { XMLParser } = require('fast-xml-parser');
const RssFeed = require('../models/RssFeed');
const Article = require('../models/Article');
const Category = require('../models/Category');
const Admin = require('../models/Admin');
const categoryIdentificationService = require('./categoryIdentificationService');

class RssService {
  constructor() {
    this.parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_"
    });
    this.fetch = null;
  }

  // Initialize fetch dynamically
  async initFetch() {
    if (!this.fetch) {
      const fetchModule = await import('node-fetch');
      this.fetch = fetchModule.default;
    }
    return this.fetch;
  }

  // Fetch and parse RSS feed
  async fetchRssFeed(feedUrl) {
    try {
      const fetch = await this.initFetch();
      const response = await fetch(feedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; RSSBot/1.0)'
        },
        timeout: 10000
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const xmlData = await response.text();
      const parsedData = this.parser.parse(xmlData);
      
      return this.extractRssItems(parsedData);
    } catch (error) {
      console.error('Error fetching RSS feed:', error);
      throw error;
    }
  }

  // Extract items from parsed RSS data
  extractRssItems(parsedData) {
    const items = [];
    
    // Handle different RSS formats
    if (parsedData.rss && parsedData.rss.channel && parsedData.rss.channel.item) {
      items.push(...parsedData.rss.channel.item);
    } else if (parsedData.feed && parsedData.feed.entry) {
      // Atom format
      items.push(...parsedData.feed.entry);
    } else if (parsedData.channel && parsedData.channel.item) {
      items.push(...parsedData.channel.item);
    }

    return items;
  }

  // Clean and extract content from RSS item
  async extractContent(item, feedUrl) {
    let content = '';
    let title = '';
    let link = '';
    let publishedDate = null;
    let image = null;

    // Extract title
    if (item.title) {
      title = typeof item.title === 'string' ? item.title : item.title['#text'] || '';
    }

    // Extract link
    if (item.link) {
      if (typeof item.link === 'string') {
        link = item.link;
      } else if (item.link.href) {
        link = item.link.href;
      } else if (Array.isArray(item.link)) {
        link = item.link[0]?.href || item.link[0] || '';
      }
    }

    // Extract published date
    if (item.pubDate) {
      publishedDate = new Date(item.pubDate);
    } else if (item.published) {
      publishedDate = new Date(item.published);
    } else if (item.updated) {
      publishedDate = new Date(item.updated);
    }

    // Extract content
    if (item['content:encoded']) {
      content = item['content:encoded'];
    } else if (item.content) {
      if (typeof item.content === 'string') {
        content = item.content;
      } else if (item.content['#text']) {
        content = item.content['#text'];
      }
    } else if (item.description) {
      content = item.description;
    } else if (item.summary) {
      content = item.summary;
    }

    // Extract image
    if (item['media:content'] && item['media:content']['@_url']) {
      image = item['media:content']['@_url'];
    } else if (item.enclosure && item.enclosure['@_url']) {
      image = item.enclosure['@_url'];
    }

    // If no image found, try to extract from content
    if (!image && content) {
      const imgMatch = content.match(/<img[^>]+src="([^"]+)"/i);
      if (imgMatch) {
        image = imgMatch[1];
      }
    }

    return {
      title: this.cleanText(title),
      content: this.cleanText(content),
      link,
      publishedDate,
      image
    };
  }

  // Clean text content
  cleanText(text) {
    if (!text) return '';
    
    return text
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove scripts
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // Remove styles
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ') // Replace &nbsp;
      .replace(/&amp;/g, '&') // Replace &amp;
      .replace(/&lt;/g, '<') // Replace &lt;
      .replace(/&gt;/g, '>') // Replace &gt;
      .replace(/&quot;/g, '"') // Replace &quot;
      .replace(/\s+/g, ' ') // Replace multiple spaces
      .trim();
  }

  // AI content rewriting using Google Gemini
  async rewriteContentWithAI(originalContent, style = 'professional') {
    try {
      const geminiApiKey = process.env.GEMINI_API_KEY;
      if (!geminiApiKey) {
        console.warn('GEMINI_API_KEY not configured, skipping AI rewrite');
        return originalContent;
      }

      const prompt = this.generateRewritePrompt(originalContent, style);
      
      const fetch = await this.initFetch();
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API response:', errorText);
        
        // Handle rate limiting specifically
        if (response.status === 429) {
          console.warn('Gemini API rate limit exceeded, using original content');
          return originalContent;
        }
        
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        return data.candidates[0].content.parts[0].text.trim();
      } else {
        console.error('Invalid Gemini API response:', data);
        throw new Error('Invalid response from Gemini API');
      }
    } catch (error) {
      console.error('Error rewriting content with AI:', error);
      // Return original content if AI rewriting fails
      return originalContent;
    }
  }

  // Generate AI rewrite prompt
  generateRewritePrompt(content, style) {
    const styleInstructions = {
      professional: 'Rewrite this content in a professional, journalistic style suitable for a news website. Maintain factual accuracy while improving readability and engagement.',
      casual: 'Rewrite this content in a casual, conversational style that feels friendly and approachable while maintaining the key information.',
      formal: 'Rewrite this content in a formal, academic style with precise language and structured presentation.',
      creative: 'Rewrite this content in a creative, engaging style that captures attention and tells a compelling story.'
    };

    return `
You are a professional content writer. Please rewrite the following content in a ${style} style.

Requirements:
- Maintain all factual information and key details
- Improve readability and flow
- Use ${styleInstructions[style]}
- Keep the same language as the original
- Make it engaging for readers
- Ensure it's suitable for a news website
- Length should be similar to original (within 10% difference)

Original content:
${content}

Please provide only the rewritten content without any additional commentary or formatting.
`;
  }

  // Process RSS feed and create articles
  async processRssFeed(feedId) {
    try {
      const feed = await RssFeed.findById(feedId)
        .populate('defaultAuthor');

      if (!feed || !feed.isActive) {
        throw new Error('Feed not found or inactive');
      }

      // Reset daily count if needed
      await feed.resetDailyCount();

      // Check if can publish more today
      if (!feed.canPublishToday()) {
        console.log(`Feed ${feed.name} has reached daily limit (${feed.maxPostsPerDay})`);
        return { processed: 0, published: 0 };
      }

      // Fetch RSS feed
      const rssItems = await this.fetchRssFeed(feed.feedUrl);
      
      let processed = 0;
      let published = 0;

      for (const item of rssItems) {
        try {
          // Check if we've reached daily limit
          if (!feed.canPublishToday()) {
            break;
          }

          const extractedData = await this.extractContent(item, feed.feedUrl);
          
          // Check minimum content length
          if (extractedData.content.length < feed.minContentLength) {
            continue;
          }

          // Check if article already exists (by title)
          const existingArticle = await Article.findOne({
            title: extractedData.title
          });

          if (existingArticle) {
            console.log(`Skipping duplicate article: ${extractedData.title}`);
            continue;
          }

          // Identify category automatically
          let identifiedCategory;
          if (feed.settings.enableAutoCategory) {
            try {
              identifiedCategory = await categoryIdentificationService.identifyCategory(
                extractedData.title, 
                extractedData.content
              );
              console.log(`Auto-identified category for "${extractedData.title}": ${identifiedCategory.name}`);
            } catch (categoryError) {
              console.error('Error identifying category:', categoryError);
              // Use first available category as fallback
              identifiedCategory = await Category.findOne({ isActive: true }).sort({ order: 1 });
              if (!identifiedCategory) {
                throw new Error('No active categories available');
              }
            }
          } else {
            // Use first available category if auto-category is disabled
            identifiedCategory = await Category.findOne({ isActive: true }).sort({ order: 1 });
            if (!identifiedCategory) {
              throw new Error('No active categories available');
            }
          }

          // Rewrite content with AI if enabled
          let finalContent = extractedData.content;
          if (feed.settings.enableAiRewrite) {
            finalContent = await this.rewriteContentWithAI(
              extractedData.content, 
              feed.settings.aiRewriteStyle
            );
            
            // Add delay between AI requests to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
          }

          // Add source attribution if enabled
          if (feed.settings.includeOriginalSource && extractedData.link) {
            finalContent += `\n\nSource: [${extractedData.link}](${extractedData.link})`;
          }

          // Generate SEO title and description with proper length limits
          const seoTitle = extractedData.title.length > 60 ? 
            extractedData.title.substring(0, 57) + '...' : 
            extractedData.title;
          
          const seoDescription = this.generateSeoDescription(finalContent);

          // Generate slug manually to ensure it's created
          const slug = await Article.generateUniqueSlug(extractedData.title);

          // Create article
          const article = new Article({
            title: extractedData.title,
            slug: slug,
            content: finalContent,
            category: identifiedCategory._id,
            author: feed.defaultAuthor._id,
            featuredImage: extractedData.image,
            status: feed.settings.autoPublish ? 'published' : 'draft',
            tags: this.extractTags(extractedData.title, extractedData.content),
            seoTitle: seoTitle,
            seoDescription: seoDescription
          });

          await article.save();

          // Increment feed counters
          await feed.incrementPublishedCount();

          processed++;
          if (feed.settings.autoPublish) {
            published++;
          }

          // Add delay if configured
          if (feed.settings.publishDelay > 0) {
            await new Promise(resolve => setTimeout(resolve, feed.settings.publishDelay * 60 * 1000));
          }

        } catch (itemError) {
          console.error('Error processing RSS item:', itemError);
          let errorMessage = itemError.message;
          
          // Handle validation errors more gracefully
          if (itemError.name === 'ValidationError') {
            const validationErrors = Object.values(itemError.errors).map(err => err.message).join(', ');
            errorMessage = `Validation error: ${validationErrors}`;
          }
          
          await feed.addErrorLog(`Error processing item: ${errorMessage}`, 'error');
        }
      }

      // Update last fetched timestamp
      feed.lastFetched = new Date();
      await feed.save();

      return { processed, published };

    } catch (error) {
      console.error('Error processing RSS feed:', error);
      throw error;
    }
  }

  // Extract tags from title and content
  extractTags(title, content) {
    const text = `${title} ${content}`.toLowerCase();
    const commonTags = [
      'news', 'breaking', 'update', 'latest', 'technology', 'politics', 
      'business', 'sports', 'entertainment', 'health', 'science', 'world'
    ];

    return commonTags.filter(tag => text.includes(tag)).slice(0, 5);
  }

  // Generate SEO description
  generateSeoDescription(content) {
    const cleanContent = this.cleanText(content);
    // Remove source attribution if present to avoid going over limit
    const contentWithoutSource = cleanContent.replace(/\n\nSource:.*$/, '');
    return contentWithoutSource.substring(0, 157) + (contentWithoutSource.length > 157 ? '...' : '');
  }

  // Process all active feeds
  async processAllActiveFeeds() {
    try {
      const activeFeeds = await RssFeed.find({ isActive: true });
      const results = [];

      for (const feed of activeFeeds) {
        try {
          const result = await this.processRssFeed(feed._id);
          results.push({
            feedId: feed._id,
            feedName: feed.name,
            ...result
          });
        } catch (error) {
          console.error(`Error processing feed ${feed.name}:`, error);
          await feed.addErrorLog(`Processing error: ${error.message}`, 'error');
          results.push({
            feedId: feed._id,
            feedName: feed.name,
            error: error.message
          });
        }
      }

      return results;
    } catch (error) {
      console.error('Error processing all feeds:', error);
      throw error;
    }
  }
}

module.exports = new RssService(); 