'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface SmoothPageTransitionProps {
  children: React.ReactNode;
}

export default function SmoothPageTransition({ children }: SmoothPageTransitionProps) {
  const [currentPath, setCurrentPath] = useState('');
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== currentPath) {
      setCurrentPath(pathname);
    }
  }, [pathname, currentPath]);

  return (
    <div className="relative">
      {/* Content with minimal transition */}
      <div className="transition-opacity duration-150">
        {children}
      </div>
    </div>
  );
} 