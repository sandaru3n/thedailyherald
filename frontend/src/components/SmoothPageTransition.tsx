'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface SmoothPageTransitionProps {
  children: React.ReactNode;
}

export default function SmoothPageTransition({ children }: SmoothPageTransitionProps) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentPath, setCurrentPath] = useState('');
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== currentPath) {
      setIsTransitioning(true);
      
      // Simulate page transition
      const timer = setTimeout(() => {
        setCurrentPath(pathname);
        setIsTransitioning(false);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [pathname, currentPath]);

  return (
    <div className="relative">
      {/* Page transition overlay */}
      {isTransitioning && (
        <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-gray-600 font-medium">Loading...</div>
          </div>
        </div>
      )}

      {/* Content with smooth transitions */}
      <div className={`transition-all duration-300 ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        {children}
      </div>
    </div>
  );
} 