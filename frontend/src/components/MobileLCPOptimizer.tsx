'use client';

import { useEffect } from 'react';

interface MobileLCPOptimizerProps {
  featuredImages: string[];
}

export default function MobileLCPOptimizer({ featuredImages }: MobileLCPOptimizerProps) {
  useEffect(() => {
    // Preload critical images for mobile LCP optimization
    const preloadImages = () => {
      featuredImages.forEach((imageUrl) => {
        if (imageUrl && !imageUrl.includes('placeholder')) {
          const link = document.createElement('link');
          link.rel = 'preload';
          link.as = 'image';
          link.href = imageUrl;
          link.type = 'image/webp';
          document.head.appendChild(link);
        }
      });
    };

    // Preload critical fonts
    const preloadFonts = () => {
      const fontLinks = [
        'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
        'https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&display=swap'
      ];

      fontLinks.forEach((fontUrl) => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'style';
        link.href = fontUrl;
        document.head.appendChild(link);
      });
    };

    // Optimize for mobile viewport
    const optimizeViewport = () => {
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=5');
      }
    };

    // Execute optimizations
    preloadImages();
    preloadFonts();
    optimizeViewport();

    // Add resource hints for faster loading
    const addResourceHints = () => {
      const hints = [
        { rel: 'dns-prefetch', href: 'https://fonts.googleapis.com' },
        { rel: 'dns-prefetch', href: 'https://fonts.gstatic.com' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' }
      ];

      hints.forEach((hint) => {
        const link = document.createElement('link');
        Object.assign(link, hint);
        document.head.appendChild(link);
      });
    };

    addResourceHints();
  }, [featuredImages]);

  return null; // This component doesn't render anything
} 