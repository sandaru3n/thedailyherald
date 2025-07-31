'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FileText, 
  FolderOpen, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu,
  X,
  User,
  MessageCircle,
  Mail,
  Rss
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAdminData, logout } from '@/lib/auth';
import { useSiteSettings } from '@/hooks/useSiteSettings';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Articles', href: '/admin/articles', icon: FileText },
  { name: 'Categories', href: '/admin/categories', icon: FolderOpen },
  { name: 'RSS Feeds', href: '/admin/rss-feeds', icon: Rss },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Navigation', href: '/admin/navigation', icon: Menu },
  { name: 'Comments', href: '/admin/comments', icon: MessageCircle },
  { name: 'Contact', href: '/admin/contact', icon: Mail },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
  { name: 'Site Settings', href: '/admin/settings/site', icon: Settings },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const adminData = getAdminData();
  const { settings } = useSiteSettings();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="admin-layout-container" data-admin-page="true">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              {settings?.siteLogo ? (
                <img 
                  src={settings.siteLogo} 
                  alt="Admin Panel Logo" 
                  className="w-8 h-8 object-contain"
                />
              ) : (
                <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                  <FileText className="h-5 w-5 text-white" />
                </div>
              )}
              <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${isActive 
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User info and logout */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {adminData?.name || 'Admin'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {adminData?.email || 'admin@example.com'}
                </p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 z-30">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex-1 lg:hidden" />
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome back, {adminData?.name || 'Admin'}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
