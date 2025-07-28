'use client';

import { useEffect } from 'react';

interface PerformanceMonitorProps {
  pageName: string;
}

export default function PerformanceMonitor({ pageName }: PerformanceMonitorProps) {
  useEffect(() => {
    // Only run in production or when explicitly enabled
    if (process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING === 'true') {
      // Simple performance monitoring
      const startTime = performance.now();
      
      // Monitor page load time
      window.addEventListener('load', () => {
        const loadTime = performance.now() - startTime;
        console.log(`🚀 ${pageName} Load Time:`, Math.round(loadTime), 'ms');
      });
      
      // Monitor Core Web Vitals if available
      if ('PerformanceObserver' in window) {
        try {
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (entry.entryType === 'largest-contentful-paint') {
                console.log(`🎯 LCP (${pageName}):`, Math.round(entry.startTime), 'ms');
              }
            }
          });
          
          observer.observe({ entryTypes: ['largest-contentful-paint'] });
          
          return () => observer.disconnect();
        } catch (error) {
          console.warn('Performance monitoring not supported:', error);
        }
      }
    }
  }, [pageName]);

  return null; // This component doesn't render anything
} 