'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, X, Search, Home, Info, FileText, Settings, Contact, Globe } from 'lucide-react';
import { useNavigation } from '@/hooks/useNavigation';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { activeItems, loading } = useNavigation();
  const { settings } = useSiteSettings();

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

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      {/* Main Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo on the left */}
          <div className="flex items-center">
            <div className="flex items-center space-x-2">
              {settings?.siteLogo ? (
                <img 
                  src={settings.siteLogo} 
                  alt="Site Logo" 
                  className="w-8 h-8 object-contain"
                />
              ) : (
                <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
                  <FileText className="h-5 w-5 text-white" />
                </div>
              )}
              <h1 className="text-xl font-bold text-red-600">
                {settings?.siteName || 'The Daily Herald'}
              </h1>
            </div>
          </div>
          
          {/* Icons on the right */}
          <div className="flex items-center space-x-4">
            {/* Search Icon */}
            <button 
              className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200"
              aria-label="Search news"
              title="Search news"
            >
              <Search className="h-5 w-5 text-gray-800" />
            </button>
            
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
              {!loading && activeItems && activeItems.length > 0 && activeItems.map((item) => {
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
              })}
            </nav>

            {/* Desktop Search Bar */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search news..."
                  className="w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200"
                  aria-label="Search news"
                />
                <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Floating Menu */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          
          {/* Floating Menu - now slides in from the left */}
          <div 
            id="mobile-menu"
            className={`fixed top-0 left-0 h-full w-72 bg-white shadow-2xl z-50 lg:hidden transform transition-transform duration-300 ease-in-out ${
              mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
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
                  onClick={() => setMobileMenuOpen(false)}
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm text-sm"
                  aria-label="Search news"
                />
                <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>

              {/* Navigation Links - smaller font and padding for mobile */}
              <nav className="space-y-2">
                {!loading && activeItems && activeItems.length > 0 && activeItems.map((item) => {
                  if (!item || !item.label) return null;
                  const IconComponent = getIconComponent(item.icon);
                  return (
                    <Link
                      key={item._id || item.label}
                      href={item.url || '#'}
                      target={item.target || '_self'}
                      className="flex items-center text-gray-700 hover:text-blue-600 font-medium text-sm transition-colors duration-200 px-3 py-2 rounded-md hover:bg-gray-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <IconComponent className="h-5 w-5 mr-2" />
                      {item.label}
                      {item.isExternal && (
                        <Globe className="h-4 w-4 ml-auto" />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
