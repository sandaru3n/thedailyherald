import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata(
    'About Us',
    'Learn about our trusted source for comprehensive news coverage. Discover our mission, values, and commitment to delivering accurate and timely journalism.',
    '/about'
  );
}

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 