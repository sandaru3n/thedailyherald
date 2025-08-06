'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface PublicLayoutProps {
  children: React.ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  const pathname = usePathname();
  
  // Check if current path is an admin page
  const isAdminPage = pathname?.startsWith('/admin');
  
  // If it's an admin page, don't render Header and Footer
  if (isAdminPage) {
    return <>{children}</>;
  }
  
  // For public pages, render Header and Footer
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        {children}
      </main>
      <Footer />
    </>
  );
} 