'use client';

import { useState } from 'react';
import { useSearch } from '@/hooks/useSearch';
import { SearchResults } from '@/components/SearchResults';

export default function TestSearchPage() {
  const [showResults, setShowResults] = useState(false);
  const { searchTerm, searchResults, isLoading, error, setSearchTerm, clearSearch } = useSearch();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Search Test Page</h1>
      
      <div className="max-w-md">
        <div className="relative">
          <input
            type="text"
            placeholder="Search news..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowResults(true);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          {showResults && (
            <SearchResults
              results={searchResults}
              isLoading={isLoading}
              error={error}
              onResultClick={() => {
                setShowResults(false);
                clearSearch();
              }}
            />
          )}
        </div>
        
        <div className="mt-4 text-sm text-gray-600">
          <p>Search term: "{searchTerm}"</p>
          <p>Results: {searchResults.length}</p>
          <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
          {error && <p className="text-red-600">Error: {error}</p>}
        </div>
      </div>
    </div>
  );
}
