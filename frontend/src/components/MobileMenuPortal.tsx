'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { X, Search, Globe, Bookmark } from 'lucide-react';
import { SearchResults } from '@/components/SearchResults';

// Import existing types from hooks
interface NavigationItem {
  _id?: string;
  label: string;
  url: string;
  icon: string;
  type: 'link' | 'category';
  order: number;
  isActive: boolean;
  isExternal?: boolean;
  target?: '_self' | '_blank';
}

interface SearchResult {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  featuredImage?: string;
  category?: {
    name: string;
    color: string;
    slug: string;
  };
  publishedAt?: string;
  readTime?: number;
}

interface MobileMenuPortalProps {
  isOpen: boolean;
  onClose: () => void;
  navigationItems: NavigationItem[];
  searchTerm: string;
  searchResults: SearchResult[];
  isLoading: boolean;
  error: string | null;
  onSearchChange: (term: string) => void;
  onResultClick: () => void;
  clearSearch: () => void;
  getIconComponent: (iconName: string) => React.ComponentType<{ className?: string }>;
}

export default function MobileMenuPortal({
  isOpen,
  onClose,
  navigationItems,
  searchTerm,
  searchResults,
  isLoading,
  error,
  onSearchChange,
  onResultClick,
  clearSearch,
  getIconComponent
}: MobileMenuPortalProps) {
  const [mounted, setMounted] = useState(false);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setMounted(true);
    
    // Create a dedicated container for the portal
    try {
      if (typeof document !== 'undefined') {
        const container = document.createElement('div');
        container.id = 'mobile-menu-portal';
        document.body.appendChild(container);
        setPortalContainer(container);
      }
    } catch (error) {
      console.warn('Error creating portal container:', error);
    }

    return () => {
      try {
        if (typeof document !== 'undefined' && portalContainer) {
          if (document.body.contains(portalContainer)) {
            document.body.removeChild(portalContainer);
          }
        }
      } catch (error) {
        console.warn('Error removing portal container:', error);
      }
    };
  }, []);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (!mounted) return;

    try {
      if (isOpen && document.body) {
        document.body.style.overflow = 'hidden';
      } else if (document.body) {
        document.body.style.overflow = 'unset';
      }
    } catch (error) {
      console.warn('Error managing body scroll:', error);
    }

    return () => {
      try {
        if (document.body) {
          document.body.style.overflow = 'unset';
        }
      } catch (error) {
        console.warn('Error restoring body scroll:', error);
      }
    };
  }, [isOpen, mounted]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !mounted) return;

    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    try {
      document.addEventListener('keydown', handleEscapeKey);
    } catch (error) {
      console.warn('Error adding escape key listener:', error);
    }

    return () => {
      try {
        if (typeof document !== 'undefined' && document.removeEventListener) {
          document.removeEventListener('keydown', handleEscapeKey);
        }
      } catch (error) {
        console.warn('Error removing escape key listener:', error);
      }
    };
  }, [isOpen, mounted, onClose]);

  if (!mounted || !isOpen || !portalContainer || typeof window === 'undefined') {
    return null;
  }

  const mobileMenuContent = (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Floating Menu */}
      <div 
        className="fixed top-0 left-0 h-full w-72 bg-white shadow-2xl z-50 lg:hidden transform transition-transform duration-300 ease-in-out translate-x-0"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation menu"
      >
        {/* Menu Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Menu</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-2"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Menu Content */}
        <div className="p-4 space-y-4">
          {/* Search */}
          <div className="relative mb-2">
            <input
              type="text"
              placeholder="Search news..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm text-sm"
              aria-label="Search news"
            />
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
            {(searchResults.length > 0 || isLoading || error) && (
              <SearchResults
                results={searchResults}
                isLoading={isLoading}
                error={error}
                onResultClick={() => {
                  onResultClick();
                  onClose();
                }}
              />
            )}
          </div>

          {/* Navigation Links */}
          <nav className="space-y-2">
            {navigationItems && navigationItems.length > 0 && navigationItems.map((item) => {
              if (!item || !item.label) return null;
              const IconComponent = getIconComponent(item.icon);
              return (
                <Link
                  key={item._id || item.label}
                  href={item.url || '#'}
                  target={item.target || '_self'}
                  className="flex items-center text-gray-700 hover:text-blue-600 font-medium text-sm transition-colors duration-200 px-3 py-2 rounded-md hover:bg-gray-50"
                  onClick={onClose}
                >
                  <IconComponent className="h-5 w-5 mr-2" />
                  <span>{item.label}</span>
                  {item.isExternal && (
                    <Globe className="h-4 w-4 ml-auto" />
                  )}
                </Link>
              );
            })}
            
            {/* Bookmarks Link */}
            <Link
              href="/bookmarks"
              className="flex items-center text-gray-700 hover:text-blue-600 font-medium text-sm transition-colors duration-200 px-3 py-2 rounded-md hover:bg-gray-50"
              onClick={onClose}
            >
              <Bookmark className="h-5 w-5 mr-2" />
              <span>My Bookmarks</span>
            </Link>
          </nav>
        </div>
      </div>
    </>
  );

  return createPortal(mobileMenuContent, portalContainer);
}
