'use client';

import { useEffect, useState } from 'react';

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Ensure we're in a browser environment
    if (typeof window === 'undefined') {
      return;
    }

    const updateProgress = () => {
      try {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrollTop / docHeight) * 100;
        setProgress(Math.min(progress, 100));
      } catch (error) {
        console.warn('Error updating reading progress:', error);
      }
    };

    // Add event listener
    window.addEventListener('scroll', updateProgress);
    
    // Cleanup function with proper null checks
    return () => {
      try {
        if (typeof window !== 'undefined' && window.removeEventListener) {
          window.removeEventListener('scroll', updateProgress);
        }
      } catch (error) {
        console.warn('Error removing scroll event listener:', error);
      }
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
      <div
        className="h-full bg-blue-600 transition-all duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
