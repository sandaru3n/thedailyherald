const { XMLParser } = require('fast-xml-parser');
const RssFeed = require('../models/RssFeed');
const Article = require('../models/Article');
const Category = require('../models/Category');
const Admin = require('../models/Admin');
const categoryIdentificationService = require('./categoryIdentificationService');
const { processRssItem } = require('../utils/textReplacement');

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
      content = typeof item.description === 'string' ? item.description : item.description['#text'] || '';
    }

    // Extract image - enhanced to handle multiple formats
    if (item['media:content'] && item['media:content']['@_url']) {
      image = item['media:content']['@_url'];
    } else if (item.enclosure && item.enclosure['@_url']) {
      image = item.enclosure['@_url'];
    } else if (item['media:thumbnail'] && item['media:thumbnail']['@_url']) {
      image = item['media:thumbnail']['@_url'];
    } else if (item['media:group'] && item['media:group']['media:content'] && item['media:group']['media:content']['@_url']) {
      image = item['media:group']['media:content']['@_url'];
    } else if (item['media:group'] && item['media:group']['media:thumbnail'] && item['media:group']['media:thumbnail']['@_url']) {
      image = item['media:group']['media:thumbnail']['@_url'];
    } else if (item['image'] && item['image']['url']) {
      image = item['image']['url'];
    } else if (item['image'] && typeof item['image'] === 'string') {
      image = item['image'];
    }
    
    // If no image found in RSS, try to extract from content
    if (!image && content) {
      const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
      if (imgMatch && imgMatch[1]) {
        image = imgMatch[1];
      }
    }
    
         // If still no image, try to find any image URL in content
     if (!image && content) {
       const urlMatch = content.match(/https?:\/\/[^\s<>"']+\.(jpg|jpeg|png|gif|webp|svg)(\?[^\s<>"']*)?/i);
       if (urlMatch) {
         image = urlMatch[0];
       }
     }
     
     // Additional image extraction attempts
     if (!image && content) {
       // Look for data-src attributes (lazy loading)
       const dataSrcMatch = content.match(/data-src=["']([^"']+)["']/i);
       if (dataSrcMatch && dataSrcMatch[1].match(/\.(jpg|jpeg|png|gif|webp|svg)/i)) {
         image = dataSrcMatch[1];
       }
     }
     
     if (!image && content) {
       // Look for background-image in style attributes
       const bgMatch = content.match(/background-image:\s*url\(["']?([^"')]+)["']?\)/i);
       if (bgMatch && bgMatch[1].match(/\.(jpg|jpeg|png|gif|webp|svg)/i)) {
         image = bgMatch[1];
       }
     }
     
     // If still no image and we have a link, try to extract from the original article
     if (!image && link) {
       try {
         console.log(`🔍 Attempting to extract image from original article: ${link}`);
         const fetch = await this.initFetch();
         const response = await fetch(link, {
           headers: {
             'User-Agent': 'Mozilla/5.0 (compatible; RSSBot/1.0)'
           },
           timeout: 10000
         });
         
         if (response.ok) {
           const htmlContent = await response.text();
           
           // Look for og:image meta tag
           const ogImageMatch = htmlContent.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
           if (ogImageMatch) {
             image = ogImageMatch[1];
             console.log(`📸 Found og:image: ${image}`);
           }
           
           // Look for twitter:image meta tag
           if (!image) {
             const twitterImageMatch = htmlContent.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);
             if (twitterImageMatch) {
               image = twitterImageMatch[1];
               console.log(`📸 Found twitter:image: ${image}`);
             }
           }
           
           // Look for first img tag
           if (!image) {
             const imgMatch = htmlContent.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
             if (imgMatch && imgMatch[1].match(/\.(jpg|jpeg|png|gif|webp|svg)/i)) {
               image = imgMatch[1];
               console.log(`📸 Found img tag: ${image}`);
             }
           }
         }
       } catch (error) {
         console.log(`⚠️ Failed to extract image from original article: ${error.message}`);
       }
     }
    
         // Debug logging for image extraction
     if (image) {
       console.log(`📸 Found image for "${title}": ${image}`);
     } else {
       console.log(`⚠️ No image found for "${title}" - RSS feed may not include images`);
       // Set a default placeholder image if none found
       image = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=400&fit=crop&auto=format';
     }
     
     // Ensure image URL is properly formatted
     if (image) {
       // Remove any whitespace
       image = image.trim();
       
       // Convert relative URLs to absolute URLs
       image = this.convertToAbsoluteUrl(image, feedUrl);
       
       // Ensure it's a valid URL
       if (!image.startsWith('http://') && !image.startsWith('https://')) {
         console.log(`⚠️ Invalid image URL format for "${title}": ${image}`);
         image = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=400&fit=crop&auto=format';
       }
     }

    // Apply text replacements to title and content
    const processedItem = await processRssItem({
      title,
      content,
      link,
      publishedDate,
      image
    });

    return {
      title: processedItem.title,
      content: this.cleanText(processedItem.content),
      link: processedItem.link,
      publishedDate: processedItem.publishedDate,
      image: processedItem.image
    };
  }

  // Convert relative URL to absolute URL
  convertToAbsoluteUrl(url, baseUrl) {
    if (!url) return null;
    
    // If already absolute, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // If relative URL, convert to absolute
    if (url.startsWith('/')) {
      // Extract domain from base URL
      const baseUrlObj = new URL(baseUrl);
      return `${baseUrlObj.protocol}//${baseUrlObj.host}${url}`;
    }
    
    // If relative path, append to base URL
    if (!url.startsWith('http')) {
      const baseUrlObj = new URL(baseUrl);
      return `${baseUrlObj.protocol}//${baseUrlObj.host}/${url}`;
    }
    
    return url;
  }

  // Validate image URL
  async validateImageUrl(imageUrl) {
    try {
      if (!imageUrl || imageUrl === 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=400&fit=crop&auto=format') {
        return false;
      }
      
      const fetch = await this.initFetch();
      const response = await fetch(imageUrl, {
        method: 'HEAD',
        timeout: 5000
      });
      
      return response.ok;
    } catch (error) {
      console.log(`❌ Image validation failed for ${imageUrl}: ${error.message}`);
      return false;
    }
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
      professional: 'Rewrite this content to sound natural, engaging, and conversational, like a human wrote it. Use varied sentence lengths, avoid robotic phrasing, and incorporate a friendly tone while maintaining professional credibility.',
      casual: 'Rewrite this content to sound natural, engaging, and conversational, like a human wrote it. Use varied sentence lengths, avoid robotic phrasing, and incorporate a friendly, approachable tone.',
      formal: 'Rewrite this content to sound natural, engaging, and conversational, like a human wrote it. Use varied sentence lengths, avoid robotic phrasing, and incorporate a respectful tone while maintaining formal structure.',
      creative: 'Rewrite this content to sound natural, engaging, and conversational, like a human wrote it. Use varied sentence lengths, avoid robotic phrasing, and incorporate a creative, storytelling tone.'
    };

    return `
Rewrite this [${content}] to sound natural, engaging, and conversational, like a human wrote it. Use varied sentence lengths, avoid robotic phrasing, and incorporate a friendly tone.

Requirements:
- Maintain all factual information and key details
- Improve readability and flow
- Use ${styleInstructions[style]}
- Keep the same language as the original
- Make it engaging for readers
- Ensure it's suitable for a news website
- Length should be similar to original (within 10% difference)

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

           // Check if image is required and available
           if (feed.settings.requireImage) {
             if (!extractedData.image || extractedData.image === 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=400&fit=crop&auto=format') {
               console.log(`⚠️ Skipping article "${extractedData.title}" - No image found (image required: ${feed.settings.requireImage})`);
               continue;
             }
             
             // Validate image URL if required
             const isValidImage = await this.validateImageUrl(extractedData.image);
             if (!isValidImage) {
               console.log(`⚠️ Skipping article "${extractedData.title}" - Invalid image URL: ${extractedData.image}`);
               continue;
             }
           }

          // Check if article already exists (by title)
          const existingArticle = await Article.findOne({
            title: extractedData.title
          });

          if (existingArticle) {
            console.log(`Skipping duplicate article: "${extractedData.title}" (found existing: ${existingArticle._id})`);
            continue;
          }

          // Also check by URL if available
          if (extractedData.link) {
            const existingByUrl = await Article.findOne({
              'indexingInfo.originalUrl': extractedData.link
            });
            
            if (existingByUrl) {
              console.log(`Skipping duplicate article by URL: "${extractedData.title}" (found existing: ${existingByUrl._id})`);
              continue;
            }
          }

          // Debug: Log what we're about to process
          console.log(`📝 Processing new article: "${extractedData.title}" from feed: ${feed.name}`);

          // Identify category automatically
          let identifiedCategory;
          let categoryConfidence = 0.0;
          let identificationMethod = 'fallback';
          
          if (feed.settings.enableAutoCategory) {
            try {
              const categoryResult = await categoryIdentificationService.identifyCategoryWithConfidence(
                extractedData.title, 
                extractedData.content
              );
              
              if (categoryResult.category) {
                identifiedCategory = categoryResult.category;
                categoryConfidence = categoryResult.confidence;
                identificationMethod = categoryResult.method;
                console.log(`Auto-identified category for "${extractedData.title}": ${identifiedCategory.name} (confidence: ${(categoryConfidence * 100).toFixed(1)}%, method: ${identificationMethod})`);
                
                // Log low confidence identifications for review
                if (categoryConfidence < 0.6) {
                  console.warn(`Low confidence category identification (${(categoryConfidence * 100).toFixed(1)}%) for article: "${extractedData.title}" -> ${identifiedCategory.name}`);
                }
              } else {
                throw new Error('No category identified');
              }
            } catch (categoryError) {
              console.error('Error identifying category:', categoryError);
              // Use first available category as fallback
              identifiedCategory = await Category.findOne({ isActive: true }).sort({ order: 1 });
              if (!identifiedCategory) {
                throw new Error('No active categories available');
              }
              identificationMethod = 'fallback';
            }
          } else {
            // Use first available category if auto-category is disabled
            identifiedCategory = await Category.findOne({ isActive: true }).sort({ order: 1 });
            if (!identifiedCategory) {
              throw new Error('No active categories available');
            }
            identificationMethod = 'disabled';
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

          // Debug: Log image information before creating article
          console.log(`🖼️ Image for article "${extractedData.title}": ${extractedData.image || 'NO IMAGE'}`);

          // Create article
          const article = new Article({
            title: extractedData.title,
            slug: slug,
            content: finalContent,
            category: identifiedCategory._id,
            author: feed.defaultAuthor._id,
            featuredImage: extractedData.image || null,
            status: feed.settings.autoPublish ? 'published' : 'draft',
            tags: this.extractTags(extractedData.title, extractedData.content),
            seoTitle: seoTitle,
            seoDescription: seoDescription
          });

          await article.save();
          
          // Debug: Log saved article image
          console.log(`✅ Article saved with image: ${article.featuredImage || 'NO IMAGE'}`);

          // Submit for Google Instant Indexing if article is published
          if (feed.settings.autoPublish && article.status === 'published') {
            try {
              console.log(`🚀 Adding RSS article to Google Instant Indexing queue: ${article.title}`);
              const queueService = require('./queueService')();
              await queueService.addToQueue(article, 'URL_UPDATED');
              console.log(`✅ RSS Article successfully added to indexing queue: ${article.title}`);
            } catch (indexingError) {
              console.error(`❌ Failed to add RSS article to indexing queue: ${article.title}`);
              console.error(`   Error Type: ${indexingError.name || 'Unknown'}`);
              console.error(`   Error Message: ${indexingError.message}`);
              console.error(`   Article ID: ${article._id}`);
              console.error(`   Article URL: ${article.slug}`);
              
              // Log additional context for debugging
              if (indexingError.code) {
                console.error(`   Error Code: ${indexingError.code}`);
              }
              if (indexingError.stack) {
                console.error(`   Stack Trace: ${indexingError.stack}`);
              }
            }
          }

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