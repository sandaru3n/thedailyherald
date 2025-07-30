import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientBody from "./ClientBody";
import Script from "next/script";
import ResourcePreloader from "@/components/ResourcePreloader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Daily Herald - Latest News and Breaking Stories",
  description: "Get the latest news, breaking stories, and in-depth coverage of current events from The Daily Herald. Stay informed with our comprehensive news coverage.",
  keywords: "news, breaking news, current events, latest news, daily herald",
  authors: [{ name: "The Daily Herald" }],
  creator: "The Daily Herald",
  publisher: "The Daily Herald",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/',
    },
  },
  openGraph: {
    title: "The Daily Herald - Latest News and Breaking Stories",
    description: "Get the latest news, breaking stories, and in-depth coverage of current events from The Daily Herald.",
    url: '/',
    siteName: 'The Daily Herald',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "The Daily Herald - Latest News and Breaking Stories",
    description: "Get the latest news, breaking stories, and in-depth coverage of current events from The Daily Herald.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

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
        <link rel="alternate" type="application/rss+xml" title="The Daily Herald RSS Feed" href="/feed/" />
        <link rel="alternate" type="application/rss+xml" title="Politics RSS Feed" href="/feed/category/politics/" />
        <link rel="alternate" type="application/rss+xml" title="Technology RSS Feed" href="/feed/category/technology/" />
        <link rel="alternate" type="application/rss+xml" title="Sports RSS Feed" href="/feed/category/sports/" />
        <link rel="alternate" type="application/rss+xml" title="Business RSS Feed" href="/feed/category/business/" />
        <link rel="alternate" type="application/rss+xml" title="Health RSS Feed" href="/feed/category/health/" />
        <link rel="alternate" type="application/rss+xml" title="World RSS Feed" href="/feed/category/world/" />
        <link rel="alternate" type="application/rss+xml" title="Entertainment RSS Feed" href="/feed/category/entertainment/" />
      </head>
      <body suppressHydrationWarning className="antialiased">
        <ResourcePreloader 
          criticalFonts={[
            'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
          ]}
        />
        <ClientBody>{children}</ClientBody>
      </body>
    </html>
  );
}
