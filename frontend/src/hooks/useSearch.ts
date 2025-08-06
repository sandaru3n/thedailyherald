import { useState, useEffect, useCallback } from 'react';

interface SearchResult {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  featuredImage?: string;
  category?: {
    name: string;
    color: string;
    slug: string;
  };
  publishedAt?: string;
  readTime?: number;
}

interface UseSearchReturn {
  searchTerm: string;
  searchResults: SearchResult[];
  isLoading: boolean;
  error: string | null;
  setSearchTerm: (term: string) => void;
  clearSearch: () => void;
}

export function useSearch(): UseSearchReturn {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchArticles = useCallback(async (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Search only in titles by using a specific query parameter
      const params = new URLSearchParams({
        titleSearch: term.trim(), // Use a specific parameter for title-only search
        status: 'published',
        limit: '10'
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/articles?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch search results');
      }

      const data = await response.json();
      
      if (data.success && data.docs) {
        setSearchResults(data.docs);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search articles');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchArticles(searchTerm);
    }, 300); // 300ms delay

    return () => clearTimeout(timeoutId);
  }, [searchTerm, searchArticles]);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setSearchResults([]);
    setError(null);
  }, []);

  return {
    searchTerm,
    searchResults,
    isLoading,
    error,
    setSearchTerm,
    clearSearch
  };
}
