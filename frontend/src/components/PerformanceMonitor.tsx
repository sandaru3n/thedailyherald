'use client';

import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  lcp: number | null;
  fid: number | null;
  cls: number | null;
  ttfb: number | null;
  fcp: number | null;
}

interface PerformanceMonitorProps {
  pageName: string;
}

export default function PerformanceMonitor({ pageName }: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null,
    fcp: null,
  });

  useEffect(() => {
    // Only run in production
    if (process.env.NODE_ENV !== 'production') {
      return;
    }

    // Track Core Web Vitals
    const trackWebVitals = () => {
      // Track Largest Contentful Paint (LCP)
      if ('PerformanceObserver' in window) {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as PerformanceEntry;
          if (lastEntry) {
            setMetrics(prev => ({ ...prev, lcp: lastEntry.startTime }));
            
            // Log LCP for debugging
            console.log(`LCP: ${lastEntry.startTime}ms`);
            
            // Send to analytics if needed
            if (lastEntry.startTime > 2500) {
              console.warn(`Poor LCP detected: ${lastEntry.startTime}ms`);
            }
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      }

      // Track First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const fidEntry = entry as PerformanceEventTiming;
          setMetrics(prev => ({ ...prev, fid: fidEntry.processingStart - fidEntry.startTime }));
          console.log(`FID: ${fidEntry.processingStart - fidEntry.startTime}ms`);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Track Cumulative Layout Shift (CLS)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const clsEntry = entry as PerformanceEntry & { hadRecentInput: boolean; value: number };
          if (!clsEntry.hadRecentInput) {
            clsValue += clsEntry.value;
            setMetrics(prev => ({ ...prev, cls: clsValue }));
            console.log(`CLS: ${clsValue}`);
          }
        });
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });

      // Track Time to First Byte (TTFB)
      const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigationEntry) {
        const ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
        setMetrics(prev => ({ ...prev, ttfb }));
        console.log(`TTFB: ${ttfb}ms`);
      }

      // Track First Contentful Paint (FCP)
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const firstEntry = entries[0];
        if (firstEntry) {
          setMetrics(prev => ({ ...prev, fcp: firstEntry.startTime }));
          console.log(`FCP: ${firstEntry.startTime}ms`);
        }
      });
      fcpObserver.observe({ entryTypes: ['first-contentful-paint'] });
    };

    // Track resource loading performance
    const trackResourcePerformance = () => {
      const resourceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const resourceEntry = entry as PerformanceResourceTiming;
          if (resourceEntry.initiatorType === 'img' && resourceEntry.duration > 1000) {
            console.warn(`Slow image load: ${resourceEntry.name} took ${resourceEntry.duration}ms`);
          }
        });
      });
      resourceObserver.observe({ entryTypes: ['resource'] });
    };

    // Track long tasks
    const trackLongTasks = () => {
      const longTaskObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.duration > 50) {
            console.warn(`Long task detected: ${entry.duration}ms`);
          }
        });
      });
      longTaskObserver.observe({ entryTypes: ['longtask'] });
    };

    // Initialize tracking
    trackWebVitals();
    trackResourcePerformance();
    trackLongTasks();

    // Cleanup
    return () => {
      // PerformanceObserver cleanup is automatic
    };
  }, [pageName]);

  // Log performance metrics for debugging
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const logMetrics = () => {
        console.group(`Performance Metrics - ${pageName}`);
        console.log('LCP:', metrics.lcp ? `${metrics.lcp}ms` : 'Not available');
        console.log('FID:', metrics.fid ? `${metrics.fid}ms` : 'Not available');
        console.log('CLS:', metrics.cls ? metrics.cls.toFixed(3) : 'Not available');
        console.log('TTFB:', metrics.ttfb ? `${metrics.ttfb}ms` : 'Not available');
        console.log('FCP:', metrics.fcp ? `${metrics.fcp}ms` : 'Not available');
        console.groupEnd();
      };

      // Log metrics after a delay to allow them to be collected
      const timeoutId = setTimeout(logMetrics, 5000);
      return () => clearTimeout(timeoutId);
    }
  }, [metrics, pageName]);

  // Monitor for performance issues
  useEffect(() => {
    const checkPerformanceIssues = () => {
      if (metrics.lcp && metrics.lcp > 2500) {
        console.warn(`⚠️ Poor LCP detected: ${metrics.lcp}ms (should be < 2.5s)`);
      }
      
      if (metrics.fid && metrics.fid > 100) {
        console.warn(`⚠️ Poor FID detected: ${metrics.fid}ms (should be < 100ms)`);
      }
      
      if (metrics.cls && metrics.cls > 0.1) {
        console.warn(`⚠️ Poor CLS detected: ${metrics.cls} (should be < 0.1)`);
      }
      
      if (metrics.ttfb && metrics.ttfb > 600) {
        console.warn(`⚠️ Poor TTFB detected: ${metrics.ttfb}ms (should be < 600ms)`);
      }
    };

    if (Object.values(metrics).some(metric => metric !== null)) {
      checkPerformanceIssues();
    }
  }, [metrics]);

  return null; // This component doesn't render anything
} 