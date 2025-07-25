// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// API Endpoints - Using local Next.js API routes
export const API_ENDPOINTS = {
  categories: '/api/categories',
  articles: '/api/articles',
  auth: `${API_BASE_URL}/api/auth`,
} as const; 