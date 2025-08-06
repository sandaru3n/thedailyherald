'use client';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  lines?: number;
}

export default function Skeleton({ className = '', variant = 'text', lines = 1 }: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-gray-200 rounded';
  
  if (variant === 'circular') {
    return <div className={`${baseClasses} ${className}`} />;
  }
  
  if (variant === 'rectangular') {
    return <div className={`${baseClasses} ${className}`} />;
  }
  
  // Text variant
  return (
    <div className="space-y-2">
      {[...Array(lines)].map((_, i) => (
        <div
          key={i}
          className={`${baseClasses} h-4 ${className}`}
          style={{ width: i === lines - 1 ? '60%' : '100%' }}
        />
      ))}
    </div>
  );
}

// Specialized skeleton components
export function ArticleCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="h-48 bg-gray-200 animate-pulse"></div>
      <div className="p-4 space-y-3">
        <Skeleton className="h-4" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

export function NavigationSkeleton() {
  return (
    <div className="flex items-center space-x-6">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center space-x-2">
          <Skeleton variant="circular" className="w-4 h-4" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}

export function HeaderSkeleton() {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <Skeleton variant="circular" className="w-8 h-8" />
        <Skeleton className="h-6 w-32" />
      </div>
      <div className="flex items-center space-x-4">
        <Skeleton variant="circular" className="w-8 h-8" />
        <Skeleton variant="circular" className="w-8 h-8" />
      </div>
    </div>
  );
} 