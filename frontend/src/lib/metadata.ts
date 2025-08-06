import { Metadata } from 'next';
import { getSiteSettings } from './settings';

export async function generateMetadata(
  title?: string,
  description?: string,
  path: string = '/'
): Promise<Metadata> {
  const settings = await getSiteSettings();
  const siteName = settings.siteName || '';
  
  const baseTitle = title || '';
  const baseDescription = description || '';
  
  return {
    title: siteName ? `${baseTitle} - ${siteName}` : baseTitle,
    description: baseDescription,
    keywords: "news, breaking news, current events, latest news",
    authors: siteName ? [{ name: siteName }] : [],
    creator: siteName,
    publisher: siteName,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
    alternates: {
      canonical: path,
      languages: {
        'en-US': path,
      },
    },
    openGraph: {
      title: siteName ? `${baseTitle} - ${siteName}` : baseTitle,
      description: baseDescription,
      url: path,
      siteName: siteName,
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: siteName ? `${baseTitle} - ${siteName}` : baseTitle,
      description: baseDescription,
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
}

export async function generatePageMetadata(
  pageTitle: string,
  pageDescription?: string,
  path: string = '/'
): Promise<Metadata> {
  return generateMetadata(pageTitle, pageDescription, path);
} 