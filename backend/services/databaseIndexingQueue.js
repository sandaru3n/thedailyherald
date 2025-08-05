const mongoose = require('mongoose');
const googleInstantIndexingService = require('./googleInstantIndexingService');
const Settings = require('../models/Settings');
const IndexingQueue = require('../models/IndexingQueue');
const Article = require('../models/Article');

class DatabaseIndexingQueue {
  constructor() {
    this.isProcessing = false;
    this.rateLimitDelay = 1000; // 1 second between submissions
    this.maxRetries = 3;
  }

  /**
   * Get the correct site URL for article indexing
   * @returns {string} - The correct site URL
   */
  async getCorrectSiteUrl() {
    try {
      const settings = await Settings.getSettings();
      
      // Priority order: settings.siteUrl > NEXT_PUBLIC_SITE_URL > SITE_URL > localhost
      let siteUrl = settings.siteUrl;
      
      if (!siteUrl || siteUrl.includes('localhost')) {
        siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
      }
      
      if (!siteUrl || siteUrl.includes('localhost')) {
        siteUrl = process.env.SITE_URL;
      }
      
      if (!siteUrl || siteUrl.includes('localhost')) {
        // If still no valid URL, try to construct from settings
        if (settings.publisherUrl) {
          siteUrl = settings.publisherUrl;
        } else {
          siteUrl = 'http://localhost:3000';
        }
      }
      
      // Ensure the URL doesn't end with a slash
      if (siteUrl && siteUrl.endsWith('/')) {
        siteUrl = siteUrl.slice(0, -1);
      }
      
      console.log(`Using site URL for indexing: ${siteUrl}`);
      return siteUrl;
    } catch (error) {
      console.error('Error getting site URL:', error);
      return 'http://localhost:3000';
    }
  }

  /**
   * Add an article to the indexing queue
   * @param {Object} article - The article object
   * @param {string} type - URL_UPDATED or URL_DELETED
   */
  async addToQueue(article, type = 'URL_UPDATED') {
    try {
      const settings = await Settings.getSettings();
      
      if (!settings.googleInstantIndexing?.enabled) {
        console.log('Google Instant Indexing is not enabled, skipping queue addition');
        return;
      }

      // Get the correct site URL
      const siteUrl = await this.getCorrectSiteUrl();
      const articleUrl = `${siteUrl}/article/${article.slug}`;

      console.log(`Constructing article URL: ${articleUrl}`);

      // Check if already in queue
      const existingItem = await IndexingQueue.findOne({
        articleId: article._id,
        status: { $in: ['pending', 'processing'] }
      });

      if (existingItem) {
        console.log(`Article already in queue: ${articleUrl}`);
        return;
      }

      // Create new queue item
      const queueItem = new IndexingQueue({
        articleId: article._id,
        url: articleUrl,
        type: type,
        status: 'pending',
        retries: 0,
        maxRetries: this.maxRetries
      });

      await queueItem.save();
      console.log(`Article added to indexing queue: ${articleUrl}`);

      // Start processing immediately
      this.processQueue();
    } catch (error) {
      console.error('Error adding article to indexing queue:', error);
    }
  }

  /**
   * Process the indexing queue
   */
  async processQueue() {
    if (this.isProcessing) {
      console.log('Queue processing already in progress, skipping...');
      return;
    }

    this.isProcessing = true;
    console.log('🚀 Starting to process indexing queue...');

    try {
      while (true) {
        // Check MongoDB connection
        if (mongoose.connection.readyState !== 1) {
          console.log('MongoDB not connected, stopping queue processing');
          break;
        }

        // Get next pending item
        const item = await IndexingQueue.findOne({
          status: 'pending'
        }).sort({ addedAt: 1 });

        if (!item) {
          console.log('No pending items in queue');
          break;
        }

        try {
          console.log(`📝 Processing article: ${item.url}`);
          
          // Update status to processing
          item.status = 'processing';
          await item.save();

          const result = await this.submitArticleForIndexing(item);
          
          if (result.success) {
            item.status = 'completed';
            item.processedAt = new Date();
            console.log(`✅ Successfully indexed: ${item.url}`);
          } else {
            // Handle retry logic with detailed error logging
            if (item.retries < item.maxRetries) {
              item.retries++;
              item.status = 'pending';
              item.error = result.error;
              console.log(`🔄 Retrying article (${item.retries}/${item.maxRetries}): ${item.url}`);
              console.log(`   Error: ${result.error}`);
              if (result.details) {
                console.log(`   Details: ${result.details}`);
              }
              if (result.code) {
                console.log(`   Error Code: ${result.code}`);
              }
            } else {
              item.status = 'failed';
              item.error = result.error;
              console.error(`💀 Max retries exceeded for: ${item.url}`);
              console.error(`   Final Error: ${result.error}`);
              console.error(`   Error Details: ${result.details || 'No additional details'}`);
              console.error(`   Error Code: ${result.code || 'Unknown'}`);
              console.error(`   Total Attempts: ${item.retries + 1}`);
              
              // Log specific error types for troubleshooting
              if (result.code === 'PRIVATE_KEY_ERROR') {
                console.error(`🔑 CRITICAL: Private key format error - check Google service account credentials`);
              } else if (result.code === 401) {
                console.error(`🔐 CRITICAL: Authentication failed - verify service account permissions`);
              } else if (result.code === 403) {
                console.error(`🔒 CRITICAL: Access denied - enable Indexing API in Google Cloud Console`);
              }
            }
          }

          await item.save();

          // Rate limiting delay
          await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay));

        } catch (error) {
          console.error(`Error processing article ${item.url}:`, error);
          
          if (item.retries < item.maxRetries) {
            item.retries++;
            item.status = 'pending';
            item.error = error.message;
          } else {
            item.status = 'failed';
            item.error = error.message;
          }
          
          await item.save();
        }
      }
    } catch (error) {
      console.error('Error in queue processing:', error);
    } finally {
      this.isProcessing = false;
      console.log('Indexing queue processing completed');
    }
  }

  /**
   * Submit a single article for indexing
   * @param {Object} item - Queue item
   * @returns {Promise<Object>} - Submission result
   */
  async submitArticleForIndexing(item) {
    try {
      console.log(`📤 Submitting article for Google Instant Indexing: ${item.url}`);
      
      const result = await googleInstantIndexingService.submitUrl(item.url, item.type);
      
      if (result.success) {
        console.log(`✅ Article successfully submitted to Google: ${item.url}`);
        
        // Update article with indexing information
        await this.updateArticleIndexingStatus(item.articleId, {
          indexedAt: new Date(),
          indexingStatus: 'success',
          indexingUrl: item.url
        });
      } else {
        console.error(`❌ Article submission failed: ${item.url}`);
        console.error(`   Error: ${result.error}`);
        console.error(`   Details: ${result.details || 'No additional details'}`);
        console.error(`   Code: ${result.code || 'Unknown'}`);
        
        // Update article with error information
        await this.updateArticleIndexingStatus(item.articleId, {
          indexingStatus: 'failed',
          indexingError: result.error,
          indexingUrl: item.url,
          indexingErrorCode: result.code,
          indexingErrorDetails: result.details
        });
      }

      return result;
    } catch (error) {
      console.error(`💥 CRITICAL ERROR submitting article for indexing: ${item.url}`);
      console.error(`   Error Type: ${error.name || 'Unknown'}`);
      console.error(`   Error Message: ${error.message}`);
      console.error(`   Stack Trace: ${error.stack}`);
      
      // Update article with error information
      await this.updateArticleIndexingStatus(item.articleId, {
        indexingStatus: 'failed',
        indexingError: error.message,
        indexingUrl: item.url,
        indexingErrorCode: 'EXCEPTION',
        indexingErrorDetails: error.stack
      });

      return {
        success: false,
        error: error.message,
        code: 'EXCEPTION',
        details: error.stack
      };
    }
  }

  /**
   * Update article with indexing status
   * @param {string} articleId - Article ID
   * @param {Object} indexingInfo - Indexing information
   */
  async updateArticleIndexingStatus(articleId, indexingInfo) {
    try {
      await Article.findByIdAndUpdate(articleId, {
        $set: {
          indexingInfo: indexingInfo
        }
      });
    } catch (error) {
      console.error('Error updating article indexing status:', error);
    }
  }

  /**
   * Get queue status
   * @returns {Promise<Object>} - Queue status information
   */
  async getQueueStatus() {
    try {
      const [totalItems, pendingItems, processingItems, completedItems, failedItems] = await Promise.all([
        IndexingQueue.countDocuments(),
        IndexingQueue.countDocuments({ status: 'pending' }),
        IndexingQueue.countDocuments({ status: 'processing' }),
        IndexingQueue.countDocuments({ status: 'completed' }),
        IndexingQueue.countDocuments({ status: 'failed' })
      ]);

      return {
        totalItems,
        isProcessing: this.isProcessing,
        pendingItems,
        processingItems,
        completedItems,
        failedItems
      };
    } catch (error) {
      console.error('Error getting queue status:', error);
      return {
        totalItems: 0,
        isProcessing: false,
        pendingItems: 0,
        processingItems: 0,
        completedItems: 0,
        failedItems: 0
      };
    }
  }

  /**
   * Get queue items
   * @returns {Promise<Array>} - Queue items
   */
  async getQueueItems() {
    try {
      const items = await IndexingQueue.find()
        .sort({ addedAt: -1 })
        .limit(50)
        .populate('articleId', 'title slug');

      return items.map(item => ({
        id: item._id.toString(),
        url: item.url,
        type: item.type,
        status: item.status,
        retries: item.retries,
        addedAt: item.addedAt,
        articleTitle: item.articleId?.title || 'Unknown Article'
      }));
    } catch (error) {
      console.error('Error getting queue items:', error);
      return [];
    }
  }

  /**
   * Clear the queue
   */
  async clearQueue() {
    try {
      await IndexingQueue.deleteMany({});
      console.log('Indexing queue cleared');
    } catch (error) {
      console.error('Error clearing queue:', error);
    }
  }

  /**
   * Retry failed items
   */
  async retryFailedItems() {
    try {
      const failedItems = await IndexingQueue.find({ status: 'failed' });
      
      for (const item of failedItems) {
        item.status = 'pending';
        item.retries = 0;
        item.error = null;
        await item.save();
      }

      console.log(`Retried ${failedItems.length} failed items`);
      
      // Start processing if not already running
      if (!this.isProcessing) {
        this.processQueue();
      }
    } catch (error) {
      console.error('Error retrying failed items:', error);
    }
  }
}

module.exports = new DatabaseIndexingQueue(); 