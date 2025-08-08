'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { getSiteSettings } from '@/lib/settings';

// Default GA ID as fallback
const DEFAULT_GA_TRACKING_ID = 'G-N8EX5P7YXH';

// Track page views when route changes
function usePageTracking(gaTrackingId: string) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname && window.gtag && gaTrackingId) {
      const url = searchParams?.size 
        ? `${pathname}?${searchParams.toString()}`
        : pathname;
      
      window.gtag('config', gaTrackingId, {
        page_path: url,
        page_title: document.title,
        page_location: window.location.origin + url,
      });
    }
  }, [pathname, searchParams, gaTrackingId]);
}

// Component that uses useSearchParams - needs to be wrapped in Suspense
function GoogleAnalyticsTracker({ gaTrackingId }: { gaTrackingId: string }) {
  usePageTracking(gaTrackingId);
  return null; // This component only handles tracking, no UI
}

// Main GoogleAnalytics component
export default function GoogleAnalytics() {
  const [gaTrackingId, setGaTrackingId] = useState<string>(DEFAULT_GA_TRACKING_ID);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch settings to get GA ID
  useEffect(() => {
    async function fetchSettings() {
      try {
        const settings = await getSiteSettings();
        const gaId = settings.seoSettings?.googleAnalyticsId;
        if (gaId && gaId.trim()) {
          setGaTrackingId(gaId);
        }
      } catch (error) {
        console.warn('Failed to fetch GA ID from settings, using default:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSettings();
  }, []);

  // Don't render if still loading or no GA ID
  if (isLoading || !gaTrackingId) {
    return null;
  }

  return (
    <>
      {/* Google Analytics Script */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaTrackingId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaTrackingId}', {
            page_title: document.title,
            page_location: window.location.href,
            anonymize_ip: true,
            cookie_flags: 'SameSite=None;Secure',
          });
        `}
      </Script>
      
      {/* Page tracking wrapped in Suspense */}
      <Suspense fallback={null}>
        <GoogleAnalyticsTracker gaTrackingId={gaTrackingId} />
      </Suspense>
    </>
  );
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'js' | 'event',
      targetId: string,
      config?: {
        page_path?: string;
        page_title?: string;
        page_location?: string;
        anonymize_ip?: boolean;
        cookie_flags?: string;
        [key: string]: string | boolean | number | undefined;
      }
    ) => void;
  }
}
