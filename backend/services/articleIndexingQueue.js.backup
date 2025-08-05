const googleInstantIndexingService = require('./googleInstantIndexingService');
const Settings = require('../models/Settings');

class ArticleIndexingQueue {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
    this.rateLimitDelay = 1000; // 1 second between submissions
    this.maxRetries = 3;
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

      // Use environment variable for site URL, fallback to settings, then to localhost
      const siteUrl = process.env.SITE_URL || settings.siteUrl || 'http://localhost:3000';
      const articleUrl = `${siteUrl}/article/${article.slug}`;

      const queueItem = {
        id: article._id.toString(),
        url: articleUrl,
        type: type,
        article: article,
        retries: 0,
        addedAt: new Date(),
        status: 'pending'
      };

      this.queue.push(queueItem);
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
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;
    console.log(`Starting to process ${this.queue.length} articles in indexing queue`);

    while (this.queue.length > 0) {
      const item = this.queue.shift();
      
      try {
        console.log(`Processing article: ${item.url}`);
        item.status = 'processing';

        const result = await this.submitArticleForIndexing(item);
        
        if (result.success) {
          item.status = 'completed';
          console.log(`✅ Successfully indexed: ${item.url}`);
        } else {
          item.status = 'failed';
          console.error(`❌ Failed to index: ${item.url} - ${result.error}`);
          
          // Retry logic
          if (item.retries < this.maxRetries) {
            item.retries++;
            item.status = 'pending';
            this.queue.unshift(item); // Add back to front of queue
            console.log(`🔄 Retrying article (${item.retries}/${this.maxRetries}): ${item.url}`);
          } else {
            console.error(`💀 Max retries exceeded for: ${item.url}`);
          }
        }

        // Rate limiting delay
        if (this.queue.length > 0) {
          console.log(`Waiting ${this.rateLimitDelay}ms before next submission...`);
          await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay));
        }

      } catch (error) {
        console.error(`Error processing article ${item.url}:`, error);
        item.status = 'failed';
        
        // Retry logic for exceptions
        if (item.retries < this.maxRetries) {
          item.retries++;
          item.status = 'pending';
          this.queue.unshift(item);
        }
      }
    }

    this.isProcessing = false;
    console.log('Indexing queue processing completed');
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
        await this.updateArticleIndexingStatus(item.article._id, {
          indexedAt: new Date(),
          indexingStatus: 'success',
          indexingUrl: item.url
        });
      } else {
        // Update article with error information
        await this.updateArticleIndexingStatus(item.article._id, {
          indexingStatus: 'failed',
          indexingError: result.error,
          indexingUrl: item.url
        });
      }

      return result;
    } catch (error) {
      console.error('Error submitting article for indexing:', error);
      
      // Update article with error information
      await this.updateArticleIndexingStatus(item.article._id, {
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
      const Article = require('../models/Article');
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
   * @returns {Object} - Queue status information
   */
  getQueueStatus() {
    return {
      totalItems: this.queue.length,
      isProcessing: this.isProcessing,
      pendingItems: this.queue.filter(item => item.status === 'pending').length,
      processingItems: this.queue.filter(item => item.status === 'processing').length,
      completedItems: this.queue.filter(item => item.status === 'completed').length,
      failedItems: this.queue.filter(item => item.status === 'failed').length
    };
  }

  /**
   * Clear the queue
   */
  clearQueue() {
    this.queue = [];
    console.log('Indexing queue cleared');
  }

  /**
   * Get queue items (for debugging)
   * @returns {Array} - Queue items
   */
  getQueueItems() {
    return this.queue.map(item => ({
      id: item.id,
      url: item.url,
      type: item.type,
      status: item.status,
      retries: item.retries,
      addedAt: item.addedAt
    }));
  }
}

module.exports = new ArticleIndexingQueue(); 