'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface PublicLayoutProps {
  children: React.ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  const pathname = usePathname();
  const [isAdminPage, setIsAdminPage] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Check if current path is an admin page
    const adminCheck = pathname?.startsWith('/admin');
    setIsAdminPage(adminCheck || false);
  }, [pathname]);

  // Don't render anything until we're on the client
  if (!isClient) {
    return <>{children}</>;
  }

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