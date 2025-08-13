'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, X, Search, Home, Info, FileText, Settings, Contact, Globe } from 'lucide-react';
import { useNavigation } from '@/hooks/useNavigation';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { HeaderSkeleton, NavigationSkeleton } from '@/components/Skeleton';
import { useSearch } from '@/hooks/useSearch';
import { SearchResults } from '@/components/SearchResults';
import MobileMenuPortal from '@/components/MobileMenuPortal';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const { activeItems, loading: navigationLoading } = useNavigation();
  const { settings, loading: settingsLoading } = useSiteSettings();
  const { searchTerm, searchResults, isLoading, error, setSearchTerm, clearSearch } = useSearch();

  // Ensure component is mounted before rendering
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Close search results when clicking outside
  useEffect(() => {
    // Ensure we're in a browser environment
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    function handleClickOutside(event: MouseEvent) {
      try {
        if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
          setShowSearchResults(false);
        }
      } catch (error) {
        console.warn('Error handling click outside:', error);
      }
    }

    try {
      document.addEventListener('mousedown', handleClickOutside);
    } catch (error) {
      console.warn('Error adding mousedown event listener:', error);
    }

    return () => {
      try {
        if (typeof document !== 'undefined' && document.removeEventListener) {
          document.removeEventListener('mousedown', handleClickOutside);
        }
      } catch (error) {
        console.warn('Error removing mousedown event listener:', error);
      }
    };
  }, []);

  // Handle mobile menu body scroll and escape key
  useEffect(() => {
    if (!isMounted) return;

    if (mobileMenuOpen) {
      try {
        // Prevent body scroll when menu is open
        if (document.body) {
          document.body.style.overflow = 'hidden';
        }

        // Handle escape key
        function handleEscapeKey(event: KeyboardEvent) {
          if (event.key === 'Escape') {
            setMobileMenuOpen(false);
          }
        }

        document.addEventListener('keydown', handleEscapeKey);

        return () => {
          try {
            // Restore body scroll
            if (document.body) {
              document.body.style.overflow = 'unset';
            }
            // Remove escape key listener
            if (typeof document !== 'undefined' && document.removeEventListener) {
              document.removeEventListener('keydown', handleEscapeKey);
            }
          } catch (error) {
            console.warn('Error cleaning up mobile menu:', error);
          }
        };
      } catch (error) {
        console.warn('Error setting up mobile menu:', error);
      }
    } else {
      try {
        // Restore body scroll when menu is closed
        if (document.body) {
          document.body.style.overflow = 'unset';
        }
      } catch (error) {
        console.warn('Error restoring body scroll:', error);
      }
    }
  }, [mobileMenuOpen, isMounted]);

  // Show search results when there are results or loading
  useEffect(() => {
    setShowSearchResults(searchResults.length > 0 || isLoading || !!error);
  }, [searchResults, isLoading, error]);

  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
      'home': Home,
      'info': Info,
      'file-text': FileText,
      'settings': Settings,
      'contact': Contact,
      'globe': Globe,
    };
    return iconMap[iconName] || Home;
  };

  // Don't render until mounted to prevent hydration issues
  if (!isMounted) {
    return (
      <header className="bg-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-32 h-6 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="w-10 h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      {/* Main Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo on the left */}
          <div className="flex items-center">
            <div className="flex items-center space-x-2">
              {settingsLoading ? (
                <HeaderSkeleton />
              ) : (
                <>
                  {settings?.siteLogo && (
                    <img 
                      src={settings.siteLogo} 
                      alt="Site Logo" 
                      className="w-8 h-8 object-contain"
                    />
                  )}
                  <h1 className="text-xl font-bold text-red-600">
                    {settings?.siteName}
                  </h1>
                </>
              )}
            </div>
          </div>
          
          {/* Icons on the right */}
          <div className="flex items-center space-x-4">
            {/* Mobile Menu Icon */}
            <div className="lg:hidden">
              <Button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                variant="ghost"
                size="sm"
                className="p-2 hover:bg-gray-100"
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-menu"
              >
                {/* Custom menu icon: three horizontal black lines */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect y="5" width="24" height="2" rx="1" fill="#111" />
                  <rect y="11" width="24" height="2" rx="1" fill="#111" />
                  <rect y="17" width="24" height="2" rx="1" fill="#111" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Navigation Bar */}
      <div className="hidden lg:block border-t border-gray-200 bg-gray-50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            {/* Desktop Navigation Menu */}
            <nav className="flex items-center space-x-4 lg:space-x-6 xl:space-x-8 flex-wrap">
              {navigationLoading ? (
                <NavigationSkeleton />
              ) : (
                activeItems && activeItems.length > 0 && activeItems.map((item) => {
                  if (!item || !item.label) return null;
                  const IconComponent = getIconComponent(item.icon);
                  return (
                    <Link
                      key={item._id || item.label}
                      href={item.url || '#'}
                      target={item.target || '_self'}
                      className="flex items-center text-gray-700 hover:text-blue-600 font-semibold text-sm transition-all duration-200 hover:scale-105 whitespace-nowrap"
                    >
                      <IconComponent className="h-4 w-4 mr-2" />
                      {item.label}
                      {item.isExternal && (
                        <Globe className="h-3 w-3 ml-1" />
                      )}
                    </Link>
                  );
                })
              )}
            </nav>

            {/* Desktop Search Bar */}
            <div className="flex items-center space-x-4">
              <div className="relative" ref={searchRef}>
                <input
                  type="text"
                  placeholder="Search news..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200"
                  aria-label="Search news"
                />
                <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                {showSearchResults && (
                  <SearchResults
                    results={searchResults}
                    isLoading={isLoading}
                    error={error}
                    onResultClick={() => {
                      setShowSearchResults(false);
                      clearSearch();
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Portal */}
      <MobileMenuPortal
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        navigationItems={activeItems || []}
        searchTerm={searchTerm}
        searchResults={searchResults}
        isLoading={isLoading}
        error={error}
        onSearchChange={setSearchTerm}
        onResultClick={() => {
          setShowSearchResults(false);
          clearSearch();
        }}
        clearSearch={clearSearch}
        getIconComponent={getIconComponent}
      />
    </header>
  );
}
