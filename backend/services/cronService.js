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
      
      // Check if there are any active RSS feeds
      const activeFeedsCount = await RssFeed.countDocuments({ isActive: true });
      console.log(`📊 Found ${activeFeedsCount} active RSS feeds`);
      
      if (activeFeedsCount === 0) {
        console.log('⚠️ No active RSS feeds found. Cron jobs will still be scheduled but won\'t process anything.');
      }
      
      // Process all active feeds based on schedule
      this.scheduleRssProcessing();
      
      // Reset daily counts based on schedule
      this.scheduleDailyReset();
      
      this.isInitialized = true;
      console.log('✅ RSS feed cron jobs initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing cron jobs:', error);
      throw error;
    }
  }

  // Schedule RSS feed processing
  scheduleRssProcessing() {
    // Process RSS feeds based on environment variable or default to every 30 minutes
    const schedule = process.env.RSS_PROCESSING_SCHEDULE || '*/30 * * * *';
    const job = cron.schedule(schedule, async () => {
      try {
        console.log('🔄 Processing RSS feeds...');
        
        // Check if there are any active feeds before processing
        const activeFeedsCount = await RssFeed.countDocuments({ isActive: true });
        if (activeFeedsCount === 0) {
          console.log('ℹ️ No active RSS feeds to process');
          return;
        }
        
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
        // Don't throw the error to prevent the cron job from stopping
      }
    }, {
      scheduled: true,
      timezone: "UTC"
    });

    this.jobs.set('rssProcessing', job);
    console.log(`📅 Scheduled RSS feed processing with schedule: ${schedule}`);
  }

  // Schedule daily reset of post counts
  scheduleDailyReset() {
    // Reset daily counts based on environment variable or default to midnight UTC
    const schedule = process.env.RSS_DAILY_RESET_SCHEDULE || '0 0 * * *';
    const job = cron.schedule(schedule, async () => {
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
    console.log(`📅 Scheduled daily reset with schedule: ${schedule}`);
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