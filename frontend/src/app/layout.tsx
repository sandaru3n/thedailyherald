import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientBody from "./ClientBody";
import Script from "next/script";
import ResourcePreloader from "@/components/ResourcePreloader";
import FaviconProvider from "@/components/FaviconProvider";
import SmoothPageTransition from "@/components/SmoothPageTransition";
import ProgressBar from "@/components/ProgressBar";
import { generateMetadata as generateSiteMetadata } from "@/lib/metadata";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  return generateSiteMetadata(
    "Home",
    "",
    "/"
  );
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
      </head>
      <body suppressHydrationWarning className="antialiased">
        <ResourcePreloader 
          criticalFonts={[
            'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
          ]}
        />
        <FaviconProvider />
        <SmoothPageTransition>
          <ClientBody>{children}</ClientBody>
        </SmoothPageTransition>
      </body>
    </html>
  );
}
