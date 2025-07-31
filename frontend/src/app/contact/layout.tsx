import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata(
    'Contact Us',
    'Get in touch with us. Have a question, suggestion, or want to share a story? Contact our team for assistance.',
    '/contact'
  );
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 