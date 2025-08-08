// Google Analytics utility functions

// Default GA ID as fallback
export const DEFAULT_GA_TRACKING_ID = 'G-N8EX5P7YXH';

// Get GA ID from settings or use default
export async function getGaTrackingId(): Promise<string> {
  try {
    const { getSiteSettings } = await import('./settings');
    const settings = await getSiteSettings();
    return settings.seoSettings?.googleAnalyticsId || DEFAULT_GA_TRACKING_ID;
  } catch (error) {
    console.warn('Failed to fetch GA ID from settings, using default:', error);
    return DEFAULT_GA_TRACKING_ID;
  }
}

// Track page views
export const trackPageView = async (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    const gaId = await getGaTrackingId();
    window.gtag('config', gaId, {
      page_path: url,
      page_title: document.title,
      page_location: window.location.origin + url,
    });
  }
};

// Track custom events
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Track article views
export const trackArticleView = (articleTitle: string, category: string) => {
  trackEvent('article_view', 'engagement', articleTitle);
};

// Track category views
export const trackCategoryView = (categoryName: string) => {
  trackEvent('category_view', 'navigation', categoryName);
};

// Track search events
export const trackSearch = (searchTerm: string, resultsCount: number) => {
  trackEvent('search', 'engagement', searchTerm, resultsCount);
};

// Track social media clicks
export const trackSocialClick = (platform: string, url: string) => {
  trackEvent('social_click', 'social', platform);
};

// Track newsletter signup
export const trackNewsletterSignup = (source: string) => {
  trackEvent('newsletter_signup', 'conversion', source);
};

// Track ad clicks
export const trackAdClick = (adPosition: string, adType: string) => {
  trackEvent('ad_click', 'monetization', `${adPosition}_${adType}`);
};

// Track user engagement
export const trackEngagement = (action: string, element: string) => {
  trackEvent(action, 'engagement', element);
};
