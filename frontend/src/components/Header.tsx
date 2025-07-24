'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { NEWS_CATEGORIES } from '@/types/news';
import { Menu, Calendar, User } from 'lucide-react';

export default function Header() {

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
        <div className="container mx-auto px-4 flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{currentDate}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:text-gray-300"
              onClick={() => window.location.href = '/admin'}
            >
              <User className="h-4 w-4 mr-2" />
              Admin Login
            </Button>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-center items-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
              THE DAILY HERALD
            </h1>
            <p className="text-sm text-slate-600 mt-1">Truth. Integrity. Excellence.</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-t bg-slate-50">
        <div className="container mx-auto px-4">
          <nav className="flex items-center justify-between py-3">
            <div className="flex items-center space-x-8">
              <Button variant="ghost" className="font-medium">
                Home
              </Button>

              {NEWS_CATEGORIES.slice(0, 6).map((category) => (
                <Button key={category.id} variant="ghost" className="font-medium">
                  {category.name}
                </Button>
              ))}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="font-medium">
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

            {/* Removed breaking news section */}
          </nav>
        </div>
      </div>
    </header>
  );
}
