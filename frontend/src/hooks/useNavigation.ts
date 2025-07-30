import { useState, useEffect } from 'react';
import { apiCall } from '@/lib/auth';

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

interface Navigation {
  _id?: string;
  name: string;
  items: NavigationItem[];
  isActive: boolean;
}

export function useNavigation() {
  const [navigation, setNavigation] = useState<Navigation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNavigation();
  }, []);

  const fetchNavigation = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiCall('/navigation');
      
      if (response.success && response.navigation) {
        setNavigation(response.navigation);
      } else {
        // Set default navigation if none exists
        setNavigation({
          name: 'main',
          items: [
            {
              _id: 'default-home',
              label: 'Home',
              url: '/',
              icon: 'home',
              type: 'link',
              order: 1,
              isActive: true,
              isExternal: false,
              target: '_self'
            }
          ],
          isActive: true
        });
      }
    } catch (err) {
      console.error('Error fetching navigation:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch navigation');
      
      // Set default navigation on error
      setNavigation({
        name: 'main',
        items: [
          {
            _id: 'default-home',
            label: 'Home',
            url: '/',
            icon: 'home',
            type: 'link',
            order: 1,
            isActive: true,
            isExternal: false,
            target: '_self'
          }
        ],
        isActive: true
      });
    } finally {
      setLoading(false);
    }
  };

  const getActiveItems = (): NavigationItem[] => {
    if (!navigation || !navigation.items) return [];
    
    return navigation.items
      .filter(item => item && item.isActive && item.label && item.url)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  };

  return {
    navigation,
    activeItems: getActiveItems(),
    loading,
    error,
    refetch: fetchNavigation
  };
} 