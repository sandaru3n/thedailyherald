import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us - The Daily Herald',
  description: 'Get in touch with The Daily Herald. Have a question, suggestion, or want to share a story? Contact our team for assistance.',
  keywords: 'contact us, daily herald contact, news tip, advertising, subscription, customer service',
  alternates: {
    canonical: '/contact',
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
  openGraph: {
    title: 'Contact Us - The Daily Herald',
    description: 'Get in touch with The Daily Herald. Have a question, suggestion, or want to share a story? Contact our team for assistance.',
    type: 'website',
    url: '/contact',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us - The Daily Herald',
    description: 'Get in touch with The Daily Herald. Have a question, suggestion, or want to share a story?',
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 