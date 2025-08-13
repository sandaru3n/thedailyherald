'use client';

import { useEffect } from 'react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export default function FaviconProvider() {
  const { settings } = useSiteSettings();

  useEffect(() => {
    // Ensure we're in a browser environment
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    try {
      // Priority: Environment variable > Database settings > Default
      // Use environment variable for base URL if available
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const envFaviconUrl = process.env.NEXT_PUBLIC_FAVICON_URL;
      
      let faviconUrl = envFaviconUrl || settings?.siteFavicon || '/favicon.ico';
      
      // If favicon URL is relative and we have a base URL, make it absolute
      if (faviconUrl && faviconUrl.startsWith('/') && baseUrl) {
        faviconUrl = `${baseUrl}${faviconUrl}`;
      }
      
      if (faviconUrl && document.head) {
        // Remove existing favicon links with proper null checks
        try {
          const existingFavicons = document.querySelectorAll('link[rel*="icon"], link[rel*="apple-touch-icon"]');
          existingFavicons.forEach(link => {
            try {
              if (link && link.parentNode) {
                link.parentNode.removeChild(link);
              }
            } catch (error) {
              console.warn('Error removing existing favicon link:', error);
            }
          });
        } catch (error) {
          console.warn('Error removing existing favicons:', error);
        }

        // Add comprehensive favicon support
        const faviconLinks = [
          // Standard favicon
          { rel: 'icon', href: faviconUrl, sizes: 'any' },
          // PNG versions for better compatibility
          { rel: 'icon', href: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
          { rel: 'icon', href: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
          // Apple touch icon (use uploaded favicon if available)
          { rel: 'apple-touch-icon', href: faviconUrl, sizes: '180x180' },
          // Android Chrome icons
          { rel: 'icon', href: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
          { rel: 'icon', href: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
          // Safari pinned tab
          { rel: 'mask-icon', href: '/safari-pinned-tab.svg', color: '#000000' },
          // Web app manifest
          { rel: 'manifest', href: '/site.webmanifest' }
        ];

        // Add all favicon links to the document head with proper error handling
        faviconLinks.forEach(linkData => {
          try {
            const link = document.createElement('link');
            Object.entries(linkData).forEach(([key, value]) => {
              if (value !== undefined) {
                link.setAttribute(key, value);
              }
            });
            if (document.head) {
              document.head.appendChild(link);
            }
          } catch (error) {
            console.warn('Error adding favicon link:', error);
          }
        });
      }
    } catch (error) {
      console.warn('Error in FaviconProvider:', error);
    }
  }, [settings?.siteFavicon]);

  return null; // This component doesn't render anything
} 