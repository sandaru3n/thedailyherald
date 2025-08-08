import { Metadata } from 'next';
import Link from 'next/link';
import { Article } from '@/types/news';
import { API_ENDPOINTS } from '@/lib/config';
import OptimizedImage from '@/components/OptimizedImage';
import CategoryCard from '@/components/CategoryCard';
import Pagination from '@/components/Pagination';
import CategoriesList from '@/components/CategoriesList';
import { generatePageMetadata } from '@/lib/metadata';

interface PaginatedResponse {
  docs: Article[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: number | null;
  prevPage: number | null;
}

// Generate metadata for SEO
export async function generateMetadata({ searchParams }: { searchParams: Promise<{ page?: string }> }): Promise<Metadata> {
  const { page } = await searchParams;
  const currentPage = page ? parseInt(page) : 1;
  
  return generatePageMetadata(
    'All Articles',
    'Browse all articles and news. Stay updated with the latest breaking news, in-depth coverage, and comprehensive reporting.',
    `/articles${currentPage > 1 ? `?page=${currentPage}` : ''}`
  );
}

// Fetch all articles with pagination
async function getAllArticles(page: number = 1) {
  try {
    const articlesRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/articles?status=published&page=${page}&limit=16&sort=-publishedAt`, {
      next: { revalidate: 60 }, // Cache for 1 minute
    });
    const articlesData = await articlesRes.json();
    
    let articles: Article[] = [];
    let pagination: PaginatedResponse | null = null;
    
    if (articlesData.success) {
      articles = articlesData.docs || [];
      pagination = {
        docs: articlesData.docs || [],
        totalDocs: articlesData.totalDocs || 0,
        limit: articlesData.limit || 16,
        page: articlesData.page || 1,
        totalPages: articlesData.totalPages || 1,
        hasNextPage: articlesData.hasNextPage || false,
        hasPrevPage: articlesData.hasPrevPage || false,
        nextPage: articlesData.nextPage || null,
        prevPage: articlesData.prevPage || null,
      };
    }

    return { articles, pagination };
  } catch (error) {
    console.error('Error fetching articles:', error);
    return { articles: [], pagination: null };
  }
}

export default async function ArticlesPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const currentPage = page ? parseInt(page) : 1;
  
  const { articles, pagination } = await getAllArticles(currentPage);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold mb-4 text-gray-900">All Articles</h1>
        <p className="text-lg text-gray-600 mb-4">Browse all articles and stay updated with the latest news and comprehensive coverage.</p>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>{pagination?.totalDocs || articles.length} articles</span>
          {pagination && pagination.totalPages > 1 && (
            <span>• Page {currentPage} of {pagination.totalPages}</span>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content: Articles Grid */}
        <div className="flex-1">
          {articles.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {articles.map((article: Article) => (
                  <CategoryCard key={article._id} article={article} />
                ))}
              </div>
              
              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  baseUrl="/articles"
                  hasNextPage={pagination.hasNextPage}
                  hasPrevPage={pagination.hasPrevPage}
                />
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
              <p className="text-gray-500">There are no articles available at the moment.</p>
            </div>
          )}
        </div>
        
        {/* Sidebar */}
        <aside className="w-full lg:w-80 flex-shrink-0 space-y-6">
          {/* Advertisement Box */}
          <div className="bg-gray-100 rounded-lg flex items-center justify-center h-56 text-gray-500 text-lg font-semibold border border-gray-200">
            ---Advertisement---
          </div>
          
          {/* Categories Section */}
          <CategoriesList 
            title="Categories" 
            showCounts={true} 
            maxCategories={10}
          />
        </aside>
      </div>
    </div>
  );
}
