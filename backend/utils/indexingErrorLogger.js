/**
 * Google Instant Indexing Error Logger Utility
 * Provides comprehensive error logging and analysis for indexing issues
 */

class IndexingErrorLogger {
  constructor() {
    this.errorCounts = {
      authentication: 0,
      authorization: 0,
      rateLimit: 0,
      invalidUrl: 0,
      privateKey: 0,
      unknown: 0
    };
  }

  /**
   * Log a Google Instant Indexing error with detailed analysis
   * @param {Object} error - The error object
   * @param {string} url - The URL that failed
   * @param {Object} context - Additional context
   */
  logError(error, url, context = {}) {
    const timestamp = new Date().toISOString();
    const errorType = this.categorizeError(error);
    
    console.error(`\n🔍 GOOGLE INSTANT INDEXING ERROR ANALYSIS`);
    console.error(`   Timestamp: ${timestamp}`);
    console.error(`   URL: ${url}`);
    console.error(`   Error Type: ${errorType}`);
    console.error(`   Error Message: ${error.message || 'No message'}`);
    
    if (error.code) {
      console.error(`   Error Code: ${error.code}`);
    }
    
    if (context.articleTitle) {
      console.error(`   Article: "${context.articleTitle}"`);
    }
    
    if (context.articleId) {
      console.error(`   Article ID: ${context.articleId}`);
    }

    // Log specific error details
    this.logErrorDetails(error, errorType);
    
    // Log troubleshooting steps
    this.logTroubleshootingSteps(errorType);
    
    // Update error counts
    this.errorCounts[errorType]++;
    
    console.error(`\n📊 ERROR STATISTICS`);
    Object.entries(this.errorCounts).forEach(([type, count]) => {
      if (count > 0) {
        console.error(`   ${type}: ${count}`);
      }
    });
  }

  /**
   * Categorize the error type
   * @param {Object} error - The error object
   * @returns {string} - Error category
   */
  categorizeError(error) {
    if (error.message && error.message.includes('DECODER routines::unsupported')) {
      return 'privateKey';
    }
    
    if (error.code === 401) {
      return 'authentication';
    }
    
    if (error.code === 403) {
      return 'authorization';
    }
    
    if (error.code === 429) {
      return 'rateLimit';
    }
    
    if (error.code === 400) {
      return 'invalidUrl';
    }
    
    return 'unknown';
  }

  /**
   * Log specific error details
   * @param {Object} error - The error object
   * @param {string} errorType - The categorized error type
   */
  logErrorDetails(error, errorType) {
    console.error(`\n🔧 ERROR DETAILS:`);
    
    switch (errorType) {
      case 'privateKey':
        console.error(`   🔑 PRIVATE KEY ERROR`);
        console.error(`   - The service account private key is invalid or corrupted`);
        console.error(`   - This is usually caused by using test credentials`);
        console.error(`   - Solution: Generate a new service account key from Google Cloud Console`);
        break;
        
      case 'authentication':
        console.error(`   🔐 AUTHENTICATION ERROR`);
        console.error(`   - Service account credentials are invalid`);
        console.error(`   - Check if the JSON key file is correct`);
        console.error(`   - Solution: Verify service account configuration in admin panel`);
        break;
        
      case 'authorization':
        console.error(`   🔒 AUTHORIZATION ERROR`);
        console.error(`   - Service account lacks required permissions`);
        console.error(`   - Indexing API might not be enabled`);
        console.error(`   - Solution: Enable Indexing API and grant proper roles`);
        break;
        
      case 'rateLimit':
        console.error(`   ⏰ RATE LIMIT ERROR`);
        console.error(`   - Too many requests to Google API`);
        console.error(`   - Solution: Implement rate limiting or wait before retrying`);
        break;
        
      case 'invalidUrl':
        console.error(`   🔗 INVALID URL ERROR`);
        console.error(`   - URL format is incorrect or inaccessible`);
        console.error(`   - Solution: Verify URL is publicly accessible and properly formatted`);
        break;
        
      default:
        console.error(`   ❓ UNKNOWN ERROR`);
        console.error(`   - Unexpected error occurred`);
        console.error(`   - Full error: ${JSON.stringify(error, null, 2)}`);
        break;
    }
  }

  /**
   * Log troubleshooting steps based on error type
   * @param {string} errorType - The categorized error type
   */
  logTroubleshootingSteps(errorType) {
    console.error(`\n🛠️  TROUBLESHOOTING STEPS:`);
    
    switch (errorType) {
      case 'privateKey':
        console.error(`   1. Go to Google Cloud Console`);
        console.error(`   2. Navigate to IAM & Admin > Service Accounts`);
        console.error(`   3. Find your service account and create a new key`);
        console.error(`   4. Download the JSON file and update admin panel`);
        console.error(`   5. Test the configuration`);
        break;
        
      case 'authentication':
        console.error(`   1. Check service account JSON in admin panel`);
        console.error(`   2. Verify all required fields are present`);
        console.error(`   3. Ensure the JSON is not corrupted`);
        console.error(`   4. Test configuration in admin panel`);
        break;
        
      case 'authorization':
        console.error(`   1. Enable Indexing API in Google Cloud Console`);
        console.error(`   2. Grant 'Indexing API User' role to service account`);
        console.error(`   3. Verify project ID is correct`);
        console.error(`   4. Check service account permissions`);
        break;
        
      case 'rateLimit':
        console.error(`   1. Wait 1-2 minutes before retrying`);
        console.error(`   2. Implement exponential backoff`);
        console.error(`   3. Check Google API quotas`);
        console.error(`   4. Consider reducing request frequency`);
        break;
        
      case 'invalidUrl':
        console.error(`   1. Verify URL is publicly accessible`);
        console.error(`   2. Check URL format (should be https://)`);
        console.error(`   3. Ensure URL doesn't redirect to login`);
        console.error(`   4. Test URL in browser`);
        break;
        
      default:
        console.error(`   1. Check Google Cloud Console for API status`);
        console.error(`   2. Verify service account is active`);
        console.error(`   3. Check network connectivity`);
        console.error(`   4. Review error logs for more details`);
        break;
    }
  }

  /**
   * Get error statistics
   * @returns {Object} - Error count statistics
   */
  getErrorStats() {
    return { ...this.errorCounts };
  }

  /**
   * Reset error counts
   */
  resetErrorCounts() {
    this.errorCounts = {
      authentication: 0,
      authorization: 0,
      rateLimit: 0,
      invalidUrl: 0,
      privateKey: 0,
      unknown: 0
    };
  }

  /**
   * Generate a summary report
   * @returns {string} - Summary report
   */
  generateSummaryReport() {
    const totalErrors = Object.values(this.errorCounts).reduce((sum, count) => sum + count, 0);
    
    if (totalErrors === 0) {
      return "✅ No indexing errors recorded";
    }
    
    let report = `\n📊 INDEXING ERROR SUMMARY (${totalErrors} total errors):\n`;
    
    Object.entries(this.errorCounts).forEach(([type, count]) => {
      if (count > 0) {
        report += `   ${type}: ${count}\n`;
      }
    });
    
    // Add recommendations
    const mostCommonError = Object.entries(this.errorCounts)
      .filter(([_, count]) => count > 0)
      .sort(([_, a], [__, b]) => b - a)[0];
    
    if (mostCommonError) {
      report += `\n🎯 Most common error: ${mostCommonError[0]} (${mostCommonError[1]} occurrences)\n`;
      report += `💡 Focus on fixing this error type first\n`;
    }
    
    return report;
  }
}

module.exports = new IndexingErrorLogger(); 