interface SiteSettings {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  publisherName: string;
  publisherUrl: string;
  seoSettings?: {
    defaultTitle: string;
    defaultDescription: string;
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
    
    // Return default settings as fallback
    return {
      siteName: 'The Daily Herald',
      siteDescription: 'Your trusted source for the latest news and updates',
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      publisherName: 'The Daily Herald',
      publisherUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      seoSettings: {
        defaultTitle: 'The Daily Herald - Latest News',
        defaultDescription: 'Stay informed with the latest news, breaking stories, and in-depth coverage from The Daily Herald.'
      }
    };
  }
} 