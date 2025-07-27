const cron = require('node-cron');
const rssService = require('./rssService');
const RssFeed = require('../models/RssFeed');

class CronService {
  constructor() {
    this.jobs = new Map();
    this.isInitialized = false;
  }

  // Initialize cron jobs
  async initialize() {
    if (this.isInitialized) return;

    try {
      console.log('🕐 Initializing RSS feed cron jobs...');
      
      // Process all active feeds every 30 minutes
      this.scheduleRssProcessing();
      
      // Reset daily counts at midnight
      this.scheduleDailyReset();
      
      this.isInitialized = true;
      console.log('✅ RSS feed cron jobs initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing cron jobs:', error);
    }
  }

  // Schedule RSS feed processing
  scheduleRssProcessing() {
    // Process RSS feeds every 30 minutes
    const job = cron.schedule('*/30 * * * *', async () => {
      try {
        console.log('🔄 Processing RSS feeds...');
        const results = await rssService.processAllActiveFeeds();
        
        const totalProcessed = results.reduce((sum, result) => sum + (result.processed || 0), 0);
        const totalPublished = results.reduce((sum, result) => sum + (result.published || 0), 0);
        
        console.log(`✅ RSS processing completed: ${totalProcessed} processed, ${totalPublished} published`);
        
        // Log any errors
        const errors = results.filter(result => result.error);
        if (errors.length > 0) {
          console.error('❌ RSS processing errors:', errors);
        }
      } catch (error) {
        console.error('❌ Error in RSS processing cron job:', error);
      }
    }, {
      scheduled: true,
      timezone: "UTC"
    });

    this.jobs.set('rssProcessing', job);
    console.log('📅 Scheduled RSS feed processing every 30 minutes');
  }

  // Schedule daily reset of post counts
  scheduleDailyReset() {
    // Reset daily counts at midnight UTC
    const job = cron.schedule('0 0 * * *', async () => {
      try {
        console.log('🔄 Resetting daily RSS feed counts...');
        
        const feeds = await RssFeed.find({ isActive: true });
        let resetCount = 0;
        
        for (const feed of feeds) {
          await feed.resetDailyCount();
          resetCount++;
        }
        
        console.log(`✅ Reset daily counts for ${resetCount} RSS feeds`);
      } catch (error) {
        console.error('❌ Error in daily reset cron job:', error);
      }
    }, {
      scheduled: true,
      timezone: "UTC"
    });

    this.jobs.set('dailyReset', job);
    console.log('📅 Scheduled daily reset at midnight UTC');
  }

  // Manually trigger RSS processing
  async triggerRssProcessing() {
    try {
      console.log('🔄 Manually triggering RSS feed processing...');
      const results = await rssService.processAllActiveFeeds();
      
      const totalProcessed = results.reduce((sum, result) => sum + (result.processed || 0), 0);
      const totalPublished = results.reduce((sum, result) => sum + (result.published || 0), 0);
      
      console.log(`✅ Manual RSS processing completed: ${totalProcessed} processed, ${totalPublished} published`);
      
      return {
        success: true,
        results,
        summary: {
          totalProcessed,
          totalPublished,
          errors: results.filter(result => result.error).length
        }
      };
    } catch (error) {
      console.error('❌ Error in manual RSS processing:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get cron job status
  getJobStatus() {
    const status = {};
    
    for (const [name, job] of this.jobs) {
      status[name] = {
        running: job.running,
        nextDate: job.nextDate(),
        lastDate: job.lastDate()
      };
    }
    
    return status;
  }

  // Stop all cron jobs
  stopAllJobs() {
    console.log('🛑 Stopping all cron jobs...');
    
    for (const [name, job] of this.jobs) {
      job.stop();
      console.log(`⏹️ Stopped job: ${name}`);
    }
    
    this.jobs.clear();
    this.isInitialized = false;
  }

  // Restart all cron jobs
  async restart() {
    console.log('🔄 Restarting cron jobs...');
    this.stopAllJobs();
    await this.initialize();
  }
}

module.exports = new CronService(); 