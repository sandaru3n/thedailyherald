'use client';

import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <div className="mb-6">
      <nav className="w-full" aria-label="Breadcrumb">
        <div className="flex items-center w-full overflow-hidden">
          <div className="flex items-center flex-nowrap text-xs sm:text-sm min-w-0 w-full">
            <ol className="flex items-center flex-nowrap min-w-0 w-full">
              {/* Home Link */}
              <li className="flex-shrink-0">
                <div className="flex items-center">
                  <Link 
                    href="/" 
                    className="text-gray-500 hover:text-blue-600 transition-colors font-medium"
                    aria-label="Go to homepage"
                  >
                    Home
                  </Link>
                </div>
              </li>
              
              {/* Breadcrumb Items - Support for multiple layers */}
              {items.map((item, index) => (
                <li key={index} className="flex items-center flex-shrink-0 min-w-0">
                  {/* Separator Container */}
                  <div className="flex items-center mx-1 sm:mx-2 flex-shrink-0">
                    <span className="text-gray-400">/</span>
                  </div>
                  
                  {/* Item Container */}
                  <div className="flex items-center min-w-0 flex-1">
                    <div className="min-w-0 flex-1">
                      {item.href ? (
                        <Link 
                          href={item.href}
                          className="text-gray-500 hover:text-blue-600 transition-colors font-medium block truncate"
                          title={item.label}
                        >
                          {item.label}
                        </Link>
                      ) : (
                        <span 
                          className="text-gray-900 font-semibold block truncate" 
                          title={item.label}
                        >
                          {item.label}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </nav>
    </div>
  );
} 