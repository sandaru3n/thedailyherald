let queueItems = [];
let isProcessing = false;

module.exports = function() {
  return {
    async getQueueStatus() {
      const pending = queueItems.filter(item => item.status === 'pending').length;
      const processing = queueItems.filter(item => item.status === 'processing').length;
      const completed = queueItems.filter(item => item.status === 'completed').length;
      const failed = queueItems.filter(item => item.status === 'failed').length;
      
      return {
        totalItems: queueItems.length,
        isProcessing,
        pendingItems: pending,
        processingItems: processing,
        completedItems: completed,
        failedItems: failed,
        note: 'Using built-in queue system'
      };
    },
    
    async getQueueItems() {
      return queueItems.map(item => ({
        id: item.id,
        url: item.url,
        type: item.type,
        status: item.status,
        retries: item.retries || 0,
        addedAt: item.addedAt,
        articleTitle: item.articleTitle || 'Unknown Article'
      }));
    },
    
    async clearQueue() {
      queueItems = [];
      console.log('Built-in queue cleared');
    },
    
    async retryFailedItems() {
      const failedItems = queueItems.filter(item => item.status === 'failed');
      failedItems.forEach(item => {
        item.status = 'pending';
        item.retries = (item.retries || 0) + 1;
      });
      console.log(`Retried ${failedItems.length} failed items`);
    },
    
    async addToQueue(article, type = 'URL_UPDATED') {
      const queueItem = {
        id: Date.now().toString(),
        url: `https://yourdomain.com/article/${article.slug}`,
        type,
        status: 'pending',
        retries: 0,
        addedAt: new Date().toISOString(),
        articleTitle: article.title || 'Unknown Article'
      };
      
      queueItems.push(queueItem);
      console.log(`Added to built-in queue: ${queueItem.url}`);
    }
  };
};