import { useState, useEffect } from 'react';
import { isAuthenticated, getAdminData, AdminUser } from '@/lib/auth';

interface UseAuthReturn {
  isLoggedIn: boolean;
  adminData: AdminUser | null;
  loading: boolean;
}

export function useAuth(): UseAuthReturn {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminData, setAdminData] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication status
    const checkAuth = () => {
      try {
        const authenticated = isAuthenticated();
        const admin = getAdminData();
        
        setIsLoggedIn(authenticated);
        setAdminData(admin);
      } catch (error) {
        console.warn('Error checking authentication:', error);
        setIsLoggedIn(false);
        setAdminData(null);
      } finally {
        setLoading(false);
      }
    };

    // Check immediately
    checkAuth();

    // Listen for storage changes (login/logout)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'adminToken' || e.key === 'adminData') {
        checkAuth();
      }
    };

    // Listen for custom events (login/logout)
    const handleAuthChange = () => {
      checkAuth();
    };

    try {
      window.addEventListener('storage', handleStorageChange);
      window.addEventListener('authChange', handleAuthChange);
    } catch (error) {
      console.warn('Error adding auth event listeners:', error);
    }

    return () => {
      try {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('authChange', handleAuthChange);
      } catch (error) {
        console.warn('Error removing auth event listeners:', error);
      }
    };
  }, []);

  return { isLoggedIn, adminData, loading };
}
