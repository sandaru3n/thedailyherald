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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNavigation = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiCall('/navigation') as { success: boolean; navigation?: Navigation };
      
      if (response.success && response.navigation) {
        setNavigation(response.navigation);
      } else {
        // Don't set any default navigation - let it be null if no data exists
        setNavigation(null);
      }
    } catch (err) {
      console.error('Error fetching navigation:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch navigation');
      
      // Don't set any default navigation on error - let it be null
      setNavigation(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNavigation();
  }, []);

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