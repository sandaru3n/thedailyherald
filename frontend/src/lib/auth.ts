// Authentication utilities for admin panel

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor';
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

// Get stored token
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('adminToken');
};

// Get stored admin data
export const getAdminData = (): AdminUser | null => {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem('adminData');
  return data ? JSON.parse(data) : null;
};

// Set auth data
export const setAuthData = (token: string, admin: AdminUser): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('adminToken', token);
  localStorage.setItem('adminData', JSON.stringify(admin));
};

// Clear auth data
export const clearAuthData = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminData');
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

// API call with authentication
export const apiCall = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<unknown> => {
  const token = getAuthToken();
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const response = await fetch(`${apiBaseUrl}/api${endpoint}`, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  
  return response.json();
};

// Logout function
export const logout = (): void => {
  clearAuthData();
  if (typeof window !== 'undefined') {
    window.location.href = '/admin/login';
  }
}; 