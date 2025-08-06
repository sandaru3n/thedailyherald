import Link from 'next/link';

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

interface SearchResultsProps {
  results: SearchResult[];
  isLoading: boolean;
  error: string | null;
  onResultClick: () => void;
}

export function SearchResults({ results, isLoading, error, onResultClick }: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Searching...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
        <div className="p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return null;
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
      <div className="p-2">
        {results.map((result) => (
          <Link
            key={result._id}
            href={`/article/${result.slug}`}
            onClick={onResultClick}
            className="block p-3 hover:bg-gray-50 rounded-md transition-colors duration-200"
          >
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
                {result.title}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
