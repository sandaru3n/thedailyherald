import { Metadata } from 'next';
import { getSiteSettings } from './settings';

export async function generateMetadata(
  title?: string,
  description?: string,
  path: string = '/'
): Promise<Metadata> {
  const settings = await getSiteSettings();
  const siteName = settings.siteName;
  
  const baseTitle = title || 'Latest News and Breaking Stories';
  const baseDescription = description || 'Get the latest news, breaking stories, and in-depth coverage of current events. Stay informed with our comprehensive news coverage.';
  
  return {
    title: `${baseTitle} - ${siteName}`,
    description: baseDescription.replace(/The Daily Herald/g, siteName),
    keywords: "news, breaking news, current events, latest news",
    authors: [{ name: siteName }],
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
      title: `${baseTitle} - ${siteName}`,
      description: baseDescription.replace(/The Daily Herald/g, siteName),
      url: path,
      siteName: siteName,
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${baseTitle} - ${siteName}`,
      description: baseDescription.replace(/The Daily Herald/g, siteName),
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