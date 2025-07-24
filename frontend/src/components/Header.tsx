'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { NEWS_CATEGORIES } from '@/types/news';
import { Menu, X, Search, Home, Newspaper } from 'lucide-react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      {/* Main Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="text-center w-full">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
              THE DAILY HERALD
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Truth. Integrity. Excellence.</p>
          </div>
        </div>
      </div>

      {/* Desktop Navigation Bar */}
      <div className="hidden lg:block border-t border-gray-200 bg-gray-50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            {/* Desktop Navigation Menu */}
            <nav className="flex items-center space-x-8">
              <Link href="/" className="flex items-center text-gray-700 hover:text-blue-600 font-semibold text-sm transition-all duration-200 hover:scale-105">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Link>
              {NEWS_CATEGORIES.slice(0, 5).map((category) => (
                <Link
                  key={category.id}
                  href={`/?category=${encodeURIComponent(category.name)}`}
                  className="flex items-center text-gray-700 hover:text-blue-600 font-semibold text-sm transition-all duration-200 hover:scale-105"
                >
                  <Newspaper className="h-4 w-4 mr-2" />
                  {category.name}
                </Link>
              ))}
            </nav>

            {/* Desktop Search Bar */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search news..."
                  className="w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200"
                />
                <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Button */}
      <div className="lg:hidden border-t border-gray-200 bg-gray-50 py-3">
        <div className="container mx-auto px-4 flex justify-end">
          <Button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 flex items-center space-x-2 transition-all duration-200 shadow-md"
          >
            <Menu className="h-5 w-5" />
            <span className="font-semibold">Menu</span>
          </Button>
        </div>
      </div>

      {/* Mobile Floating Menu */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Floating Menu - now slides in from the left */}
          <div className={`fixed top-0 left-0 h-full w-72 bg-white shadow-2xl z-50 lg:hidden transform transition-transform duration-300 ease-in-out ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}>
            {/* Menu Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Menu</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-white hover:bg-white/20 rounded-full p-2"
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
                />
                <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>

              {/* Navigation Links - smaller font and padding for mobile */}
              <div className="space-y-2">
                <Link 
                  href="/" 
                  className="flex items-center text-gray-700 hover:text-blue-600 font-semibold text-base transition-colors duration-200 px-3 py-2 rounded-md hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Home className="h-5 w-5 mr-2" />
                  Home
                </Link>
                {NEWS_CATEGORIES.map((category) => (
                  <Link
                    key={category.id}
                    href={`/?category=${encodeURIComponent(category.name)}`}
                    className="flex items-center text-gray-700 hover:text-blue-600 font-medium text-sm transition-colors duration-200 px-3 py-2 rounded-md hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Newspaper className="h-5 w-5 mr-2" />
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
