'use client';

import { useState, useEffect } from 'react';

interface SiteSettings {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  publisherName: string;
  publisherUrl: string;
  publisherLogo?: string;
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    youtube?: string;
    instagram?: string;
  };
  contactInfo?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  seoSettings?: {
    defaultTitle: string;
    defaultDescription: string;
    googleAnalyticsId?: string;
    googleSearchConsole?: string;
  };
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const response = await fetch(`${API_BASE_URL}/api/settings/public`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch site settings');
        }
        
        const data = await response.json();
        
        if (data.success) {
          setSettings(data.settings);
        } else {
          throw new Error(data.error || 'Failed to fetch site settings');
        }
      } catch (err) {
        console.error('Error fetching site settings:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch site settings');
        
        // Set default settings as fallback
        setSettings({
          siteName: 'The Daily Herald',
          siteDescription: 'Your trusted source for the latest news and updates',
          siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
          publisherName: 'The Daily Herald',
          publisherUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
          seoSettings: {
            defaultTitle: 'The Daily Herald - Latest News',
            defaultDescription: 'Stay informed with the latest news, breaking stories, and in-depth coverage from The Daily Herald.'
          }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return { settings, loading, error };
} 