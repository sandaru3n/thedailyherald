import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientBody from "./ClientBody";
import Script from "next/script";
import FaviconProvider from "@/components/FaviconProvider";
import SmoothPageTransition from "@/components/SmoothPageTransition";
import PublicLayout from "@/components/PublicLayout";
import { generateMetadata as generateSiteMetadata } from "@/lib/metadata";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { getSiteSettings } from "@/lib/settings";
import ErrorBoundary from "@/components/ErrorBoundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const baseMetadata = await generateSiteMetadata(
    "Home",
    "",
    "/"
  );

  // Get site settings to access the uploaded favicon
  const settings = await getSiteSettings();
  const faviconUrl = settings?.siteFavicon;

  return {
    ...baseMetadata,
    icons: {
      icon: [
        // Use uploaded favicon if available, otherwise fallback to default
        ...(faviconUrl ? [{ url: faviconUrl, sizes: 'any' }] : [{ url: '/favicon.ico', sizes: 'any' }]),
        { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
        { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      ],
      apple: [
        // Use uploaded favicon for Apple devices if available
        ...(faviconUrl ? [{ url: faviconUrl, sizes: '180x180', type: 'image/png' }] : [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }]),
      ],
      other: [
        { rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#000000' },
      ],
    },
    manifest: '/site.webmanifest',
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon-16x16.png" type="image/png" sizes="16x16" />
        <link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#000000" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className="antialiased">
        <ErrorBoundary>
          <ClientBody>
            <FaviconProvider />
            <GoogleAnalytics />
            <SmoothPageTransition>
              <PublicLayout>
                {children}
              </PublicLayout>
            </SmoothPageTransition>
          </ClientBody>
        </ErrorBoundary>
        
        {/* Safe performance monitoring script */}
        <Script
          id="performance-monitor"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (typeof window !== 'undefined') {
                  window.addEventListener('load', function() {
                    setTimeout(function() {
                      try {
                        if ('performance' in window) {
                          const perfData = performance.getEntriesByType('navigation')[0];
                          if (perfData) {
                            console.log('Page Load Time:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
                          }
                        }
                      } catch (e) {
                        console.warn('Performance monitoring error:', e);
                      }
                    }, 0);
                  });
                }
              } catch (e) {
                console.warn('Performance script error:', e);
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
