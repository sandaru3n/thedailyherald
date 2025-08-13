'use client';

import { useEffect, useRef } from 'react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export default function FaviconProvider() {
  const { settings } = useSiteSettings();
  const isInitialized = useRef(false);
  const addedLinks = useRef<HTMLLinkElement[]>([]);

  useEffect(() => {
    // Prevent running during SSR or multiple times
    if (typeof window === 'undefined' || typeof document === 'undefined' || isInitialized.current) {
      return;
    }

    // Add a small delay to ensure hydration is complete
    const timer = setTimeout(() => {
      try {
        // Get backend URL from environment variable
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const envFaviconUrl = process.env.NEXT_PUBLIC_FAVICON_URL;
        
        // Determine favicon URL with proper backend URL handling
        let faviconUrl = envFaviconUrl || settings?.siteFavicon || '/favicon.ico';
        
        // If favicon URL is relative and we have a backend URL, make it absolute
        if (faviconUrl && faviconUrl.startsWith('/') && backendUrl) {
          faviconUrl = `${backendUrl}${faviconUrl}`;
        }
        
        // For local development, use relative paths to avoid CSP issues
        const isLocalhost = typeof window !== 'undefined' && 
          (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
        
        if (isLocalhost && faviconUrl.includes('localhost:5000')) {
          // Use relative paths for local development to avoid CSP issues
          faviconUrl = faviconUrl.replace('http://localhost:5000', '');
        }
        
        if (faviconUrl && document.head) {
          // Only add favicon links if they don't already exist
          const existingFavicons = document.querySelectorAll('link[rel*="icon"], link[rel*="apple-touch-icon"]');
          const existingHrefs = Array.from(existingFavicons).map(link => link.getAttribute('href'));

          // Add comprehensive favicon support only if not already present
          const faviconLinks = [
            { rel: 'icon', href: faviconUrl, sizes: 'any' },
            { rel: 'icon', href: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
            { rel: 'icon', href: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
            { rel: 'apple-touch-icon', href: faviconUrl, sizes: '180x180' },
            { rel: 'icon', href: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
            { rel: 'icon', href: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
            { rel: 'mask-icon', href: '/safari-pinned-tab.svg', color: '#000000' },
            { rel: 'manifest', href: '/site.webmanifest' }
          ];

          // Add only new favicon links
          faviconLinks.forEach(linkData => {
            try {
              const href = linkData.href;
              if (!existingHrefs.includes(href)) {
                const link = document.createElement('link');
                Object.entries(linkData).forEach(([key, value]) => {
                  if (value !== undefined) {
                    link.setAttribute(key, value);
                  }
                });
                if (document.head) {
                  document.head.appendChild(link);
                  addedLinks.current.push(link);
                }
              }
            } catch (error) {
              console.warn('Error adding favicon link:', error);
            }
          });
        }
        
        isInitialized.current = true;
      } catch (error) {
        console.warn('Error in FaviconProvider:', error);
      }
    }, 200); // Increased delay for better hydration safety

    return () => {
      clearTimeout(timer);
    };
  }, [settings?.siteFavicon]);

  // Cleanup function - only remove links we added
  useEffect(() => {
    return () => {
      try {
        if (typeof document !== 'undefined' && addedLinks.current.length > 0) {
          addedLinks.current.forEach(link => {
            try {
              if (link && link.parentNode && link.parentNode.contains(link)) {
                link.parentNode.removeChild(link);
              }
            } catch (error) {
              console.warn('Error removing favicon link:', error);
            }
          });
          addedLinks.current = [];
        }
      } catch (error) {
        console.warn('Error in FaviconProvider cleanup:', error);
      }
    };
  }, []);

  return null; // This component doesn't render anything
} 