import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientBody from "./ClientBody";
import Script from "next/script";
import ResourcePreloader from "@/components/ResourcePreloader";
import FaviconProvider from "@/components/FaviconProvider";
import SmoothPageTransition from "@/components/SmoothPageTransition";
import ProgressBar from "@/components/ProgressBar";
import PublicLayout from "@/components/PublicLayout";
import { generateMetadata as generateSiteMetadata } from "@/lib/metadata";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { getSiteSettings } from "@/lib/settings";

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
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <Script
          crossOrigin="anonymous"
          src="//unpkg.com/same-runtime/dist/index.global.js"
        />
        <link rel="alternate" type="application/rss+xml" title="RSS Feed" href="/feed/" />
        <link rel="alternate" type="application/rss+xml" title="Politics RSS Feed" href="/feed/category/politics/" />
        <link rel="alternate" type="application/rss+xml" title="Technology RSS Feed" href="/feed/category/technology/" />
        <link rel="alternate" type="application/rss+xml" title="Sports RSS Feed" href="/feed/category/sports/" />
        <link rel="alternate" type="application/rss+xml" title="Business RSS Feed" href="/feed/category/business/" />
        <link rel="alternate" type="application/rss+xml" title="Health RSS Feed" href="/feed/category/health/" />
        <link rel="alternate" type="application/rss+xml" title="World RSS Feed" href="/feed/category/world/" />
        <link rel="alternate" type="application/rss+xml" title="Entertainment RSS Feed" href="/feed/category/entertainment/" />
        <GoogleAnalytics />
      </head>
      <body suppressHydrationWarning className="antialiased">
        <ResourcePreloader 
          criticalFonts={[
            'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
          ]}
        />
        <FaviconProvider />
        <SmoothPageTransition>
          <ClientBody>
            <PublicLayout>
              {children}
            </PublicLayout>
          </ClientBody>
        </SmoothPageTransition>
      </body>
    </html>
  );
}
