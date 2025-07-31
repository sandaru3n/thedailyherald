'use client';

import { useEffect } from 'react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export default function FaviconProvider() {
  const { settings } = useSiteSettings();

  useEffect(() => {
    // Priority: Environment variable > Database settings > Default
    // Use environment variable for base URL if available
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const envFaviconUrl = process.env.NEXT_PUBLIC_FAVICON_URL;
    
    let faviconUrl = envFaviconUrl || settings?.siteFavicon || '/favicon.ico';
    
    // If favicon URL is relative and we have a base URL, make it absolute
    if (faviconUrl && faviconUrl.startsWith('/') && baseUrl) {
      faviconUrl = `${baseUrl}${faviconUrl}`;
    }
    
    if (faviconUrl) {
      // Remove existing favicon links
      const existingFavicons = document.querySelectorAll('link[rel*="icon"]');
      existingFavicons.forEach(link => link.remove());

      // Add new favicon
      const faviconLink = document.createElement('link');
      faviconLink.rel = 'icon';
      faviconLink.href = faviconUrl;
      document.head.appendChild(faviconLink);
    }
  }, [settings?.siteFavicon]);

  return null; // This component doesn't render anything
} 