// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// API Endpoints - Using backend directly
export const API_ENDPOINTS = {
  categories: `${API_BASE_URL}/api/categories`,
  articles: `${API_BASE_URL}/api/articles`,
  auth: `${API_BASE_URL}/api/auth`,
  admin: `${API_BASE_URL}/api/admin`,
  rssFeeds: `${API_BASE_URL}/api/rss-feeds`,
} as const; 