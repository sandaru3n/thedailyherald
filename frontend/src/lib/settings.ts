interface SiteSettings {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  publisherName: string;
  publisherUrl: string;
  seoSettings?: {
    defaultTitle: string;
    defaultDescription: string;
    googleAnalyticsId?: string;
  };
}

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const response = await fetch(`${API_BASE_URL}/api/settings/public`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch site settings');
    }
    
    const data = await response.json();
    
    if (data.success) {
      return data.settings;
    } else {
      throw new Error(data.error || 'Failed to fetch site settings');
    }
  } catch (error) {
    console.error('Error fetching site settings:', error);
    
    // Return empty settings instead of defaults
    return {
      siteName: '',
      siteDescription: '',
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      publisherName: '',
      publisherUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      seoSettings: {
        defaultTitle: '',
        defaultDescription: ''
      }
    };
  }
} 