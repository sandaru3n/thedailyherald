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
    // Preload critical images
    criticalImages.forEach((src) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });

    // Preload critical fonts
    criticalFonts.forEach((font) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.href = font;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });

    // Preload critical scripts
    criticalScripts.forEach((script) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'script';
      link.href = script;
      document.head.appendChild(link);
    });

    // DNS prefetch for external domains
    const externalDomains = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://images.unsplash.com',
      'https://source.unsplash.com',
    ];

    externalDomains.forEach((domain) => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = domain;
      document.head.appendChild(link);
    });

    // Preconnect to critical domains
    const criticalDomains = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
    ];

    criticalDomains.forEach((domain) => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = domain;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });

    // Cleanup function
    return () => {
      // Remove preload links on unmount
      const preloadLinks = document.querySelectorAll('link[rel="preload"]');
      preloadLinks.forEach((link) => link.remove());
    };
  }, [criticalImages, criticalFonts, criticalScripts]);

  return null;
} 