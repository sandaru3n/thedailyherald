'use client';

import { useEffect, useState } from 'react';

interface PerformanceMonitorProps {
  pageName?: string;
}

export default function PerformanceMonitor({ pageName = 'Unknown' }: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    domContentLoaded: 0,
    firstPaint: 0,
    firstContentfulPaint: 0,
  });

  useEffect(() => {
    // Only run in development
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    const measurePerformance = () => {
      if (typeof window !== 'undefined' && 'performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const paint = performance.getEntriesByType('paint');
        
        const firstPaint = paint.find(entry => entry.name === 'first-paint');
        const firstContentfulPaint = paint.find(entry => entry.name === 'first-contentful-paint');

        setMetrics({
          loadTime: navigation.loadEventEnd - navigation.loadEventStart,
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          firstPaint: firstPaint ? firstPaint.startTime : 0,
          firstContentfulPaint: firstContentfulPaint ? firstContentfulPaint.startTime : 0,
        });

        // Log performance metrics
        console.log(`🚀 Performance Metrics for ${pageName}:`, {
          'Load Time': `${(navigation.loadEventEnd - navigation.loadEventStart).toFixed(2)}ms`,
          'DOM Content Loaded': `${(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart).toFixed(2)}ms`,
          'First Paint': `${firstPaint ? firstPaint.startTime.toFixed(2) : '0'}ms`,
          'First Contentful Paint': `${firstContentfulPaint ? firstContentfulPaint.startTime.toFixed(2) : '0'}ms`,
        });
      }
    };

    // Measure after a short delay to ensure page is loaded
    const timer = setTimeout(measurePerformance, 100);

    return () => clearTimeout(timer);
  }, [pageName]);

  // Don't render anything in production
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return null;
} 