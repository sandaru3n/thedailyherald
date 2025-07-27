import { useState, useEffect } from 'react';

export interface NavigationItem {
  id: string;
  label: string;
  url: string;
  icon: string;
  type: 'link' | 'category';
  order: number;
  isActive: boolean;
}

export function useNavigation() {
  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNavigation = () => {
      try {
        const savedNavigation = localStorage.getItem('customNavigation');
        if (savedNavigation) {
          const items = JSON.parse(savedNavigation) as NavigationItem[];
          // Sort by order
          const sortedItems = items.sort((a, b) => a.order - b.order);
          setNavigationItems(sortedItems);
        } else {
          // Default navigation items
          const defaultItems: NavigationItem[] = [
            {
              id: 'home',
              label: 'Home',
              url: '/',
              icon: 'home',
              type: 'link',
              order: 1,
              isActive: true
            },
            {
              id: 'about',
              label: 'About',
              url: '/about',
              icon: 'info',
              type: 'link',
              order: 2,
              isActive: true
            },
            {
              id: 'contact',
              label: 'Contact',
              url: '/contact',
              icon: 'contact',
              type: 'link',
              order: 3,
              isActive: true
            }
          ];
          setNavigationItems(defaultItems);
        }
      } catch (error) {
        console.error('Error loading navigation:', error);
        setNavigationItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadNavigation();

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'customNavigation') {
        loadNavigation();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const getActiveItems = () => {
    return navigationItems.filter(item => item.isActive);
  };

  return {
    navigationItems,
    activeItems: getActiveItems(),
    loading
  };
} 