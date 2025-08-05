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

      // Start processing if not already running
      if (!this.isProcessing) {
        this.processQueue();
      }
    } catch (error) {
      console.error('Error adding article to indexing queue:', error);
    }
  }

  /**
   * Process the indexing queue
   */
  async processQueue() {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;
    console.log('Starting to process indexing queue...');

    try {
      while (true) {
        // Get next pending item
        const item = await IndexingQueue.findOne({
          status: 'pending'
        }).sort({ addedAt: 1 });

        if (!item) {
          console.log('No pending items in queue');
          break;
        }

        try {
          console.log(`Processing article: ${item.url}`);
          
          // Update status to processing
          item.status = 'processing';
          await item.save();

          const result = await this.submitArticleForIndexing(item);
          
          if (result.success) {
            item.status = 'completed';
            item.processedAt = new Date();
            console.log(`✅ Successfully indexed: ${item.url}`);
          } else {
            // Handle retry logic
            if (item.retries < item.maxRetries) {
              item.retries++;
              item.status = 'pending';
              item.error = result.error;
              console.log(`🔄 Retrying article (${item.retries}/${item.maxRetries}): ${item.url}`);
            } else {
              item.status = 'failed';
              item.error = result.error;
              console.error(`💀 Max retries exceeded for: ${item.url}`);
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
      const result = await googleInstantIndexingService.submitUrl(item.url, item.type);
      
      if (result.success) {
        // Update article with indexing information
        await this.updateArticleIndexingStatus(item.articleId, {
          indexedAt: new Date(),
          indexingStatus: 'success',
          indexingUrl: item.url
        });
      } else {
        // Update article with error information
        await this.updateArticleIndexingStatus(item.articleId, {
          indexingStatus: 'failed',
          indexingError: result.error,
          indexingUrl: item.url
        });
      }

      return result;
    } catch (error) {
      console.error('Error submitting article for indexing:', error);
      
      // Update article with error information
      await this.updateArticleIndexingStatus(item.articleId, {
        indexingStatus: 'failed',
        indexingError: error.message,
        indexingUrl: item.url
      });

      return {
        success: false,
        error: error.message
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