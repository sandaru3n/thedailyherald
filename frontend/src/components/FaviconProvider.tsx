'use client';

import { useEffect } from 'react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export default function FaviconProvider() {
  const { settings } = useSiteSettings();

  useEffect(() => {
    if (settings?.siteFavicon) {
      // Remove existing favicon links
      const existingFavicons = document.querySelectorAll('link[rel*="icon"]');
      existingFavicons.forEach(link => link.remove());

      // Add new favicon
      const faviconLink = document.createElement('link');
      faviconLink.rel = 'icon';
      faviconLink.href = settings.siteFavicon;
      document.head.appendChild(faviconLink);
    }
  }, [settings?.siteFavicon]);

  return null; // This component doesn't render anything
} 