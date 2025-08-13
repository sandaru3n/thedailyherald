'use client';

import { useEffect } from 'react';

interface ResourcePreloaderProps {
  criticalImages?: string[];
  criticalFonts?: string[];
  criticalScripts?: string[];
}

export default function ResourcePreloader({ 
  criticalImages = [], 
  criticalFonts = [], 
  criticalScripts = [] 
}: ResourcePreloaderProps) {
  useEffect(() => {
    // Ensure we're in a browser environment
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    try {
      // Preload critical images
      criticalImages.forEach((src) => {
        try {
          const link = document.createElement('link');
          link.rel = 'preload';
          link.as = 'image';
          link.href = src;
          link.crossOrigin = 'anonymous';
          if (document.head) {
            document.head.appendChild(link);
          }
        } catch (error) {
          console.warn('Error preloading image:', error);
        }
      });

      // Preload critical fonts
      criticalFonts.forEach((font) => {
        try {
          const link = document.createElement('link');
          link.rel = 'preload';
          link.as = 'font';
          link.href = font;
          link.crossOrigin = 'anonymous';
          if (document.head) {
            document.head.appendChild(link);
          }
        } catch (error) {
          console.warn('Error preloading font:', error);
        }
      });

      // Preload critical scripts
      criticalScripts.forEach((script) => {
        try {
          const link = document.createElement('link');
          link.rel = 'preload';
          link.as = 'script';
          link.href = script;
          if (document.head) {
            document.head.appendChild(link);
          }
        } catch (error) {
          console.warn('Error preloading script:', error);
        }
      });

      // DNS prefetch for external domains
      const externalDomains = [
        'https://fonts.googleapis.com',
        'https://fonts.gstatic.com',
        'https://images.unsplash.com',
        'https://source.unsplash.com',
      ];

      externalDomains.forEach((domain) => {
        try {
          const link = document.createElement('link');
          link.rel = 'dns-prefetch';
          link.href = domain;
          if (document.head) {
            document.head.appendChild(link);
          }
        } catch (error) {
          console.warn('Error adding DNS prefetch:', error);
        }
      });

      // Preconnect to critical domains
      const criticalDomains = [
        'https://fonts.googleapis.com',
        'https://fonts.gstatic.com',
      ];

      criticalDomains.forEach((domain) => {
        try {
          const link = document.createElement('link');
          link.rel = 'preconnect';
          link.href = domain;
          link.crossOrigin = 'anonymous';
          if (document.head) {
            document.head.appendChild(link);
          }
        } catch (error) {
          console.warn('Error adding preconnect:', error);
        }
      });

      // Cleanup function with proper null checks
      return () => {
        try {
          if (typeof document !== 'undefined' && document.querySelectorAll) {
            // Remove preload links on unmount with proper checks
            const preloadLinks = document.querySelectorAll('link[rel="preload"]');
            preloadLinks.forEach((link) => {
              try {
                if (link && link.parentNode && link.parentNode.contains(link)) {
                  link.parentNode.removeChild(link);
                }
              } catch (error) {
                console.warn('Error removing preload link:', error);
              }
            });
          }
        } catch (error) {
          console.warn('Error in ResourcePreloader cleanup:', error);
        }
      };
    } catch (error) {
      console.warn('Error in ResourcePreloader:', error);
    }
  }, [criticalImages, criticalFonts, criticalScripts]);

  return null;
} 