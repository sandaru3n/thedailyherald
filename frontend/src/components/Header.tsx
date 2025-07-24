'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { NEWS_CATEGORIES } from '@/types/news';
import { Menu, Calendar, User, X, Search } from 'lucide-react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-slate-900 text-white py-2">
        <div className="container mx-auto px-4 flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1 sm:gap-2">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">{currentDate}</span>
              <span className="sm:hidden">
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:text-gray-300 text-xs sm:text-sm p-1 sm:p-2"
              onClick={() => window.location.href = '/admin'}
            >
              <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Admin Login</span>
              <span className="sm:hidden">Admin</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-4 sm:py-6">
        <div className="flex justify-center items-center">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              THE DAILY HERALD
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">Truth. Integrity. Excellence.</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-t bg-slate-50">
        <div className="container mx-auto px-4">
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center justify-between py-3">
            <div className="flex items-center space-x-6 lg:space-x-8">
              <Button variant="ghost" className="font-medium text-sm">
                Home
              </Button>

              {NEWS_CATEGORIES.slice(0, 6).map((category) => (
                <Button key={category.id} variant="ghost" className="font-medium text-sm">
                  {category.name}
                </Button>
              ))}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="font-medium text-sm">
                    More
                    <Menu className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {NEWS_CATEGORIES.slice(6).map((category) => (
                    <DropdownMenuItem key={category.id}>
                      {category.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Search Button */}
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
              <Search className="h-4 w-4" />
            </Button>
          </nav>

          {/* Mobile Navigation */}
          <div className="lg:hidden">
            <div className="flex items-center justify-between py-3">
              <Button variant="ghost" className="font-medium text-sm">
                Home
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-600 hover:text-gray-900"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
              <div className="border-t bg-white py-4 space-y-2">
                {NEWS_CATEGORIES.map((category) => (
                  <Button
                    key={category.id}
                    variant="ghost"
                    className="w-full justify-start font-medium text-sm py-3"
                  >
                    {category.name}
                  </Button>
                ))}
                
                <div className="pt-2 border-t">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-600 hover:text-gray-900"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
