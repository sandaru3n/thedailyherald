import { Metadata } from 'next';
import Link from 'next/link';
import { Article } from '@/types/news';
import { API_ENDPOINTS } from '@/lib/config';
import OptimizedImage from '@/components/OptimizedImage';
import CategoryCard from '@/components/CategoryCard';
import Pagination from '@/components/Pagination';
import { generatePageMetadata } from '@/lib/metadata';

interface CategoryData {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  articleCount?: number;
}

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
export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  try {
    const { category } = await params;
    
    // Fetch category details
    const categoryRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/categories`, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    });
    
    const categoryData = await categoryRes.json();
    let categories;
    if (Array.isArray(categoryData)) {
      categories = categoryData;
    } else if (categoryData.success && categoryData.categories) {
      categories = categoryData.categories;
    } else {
      categories = [];
    }
    
    const currentCategory = categories.find((cat: CategoryData) => cat.slug === category);
    
    if (!currentCategory) {
      return generatePageMetadata(
        'Category Not Found',
        'The category you are looking for does not exist.',
        `/category/${category}`
      );
    }

    return generatePageMetadata(
      `${currentCategory.name} News`,
      currentCategory.description || `Latest ${currentCategory.name} news and articles. Stay updated with breaking news and in-depth coverage.`,
      `/category/${category}`
    );
  } catch (error) {
    const { category } = await params;
    return generatePageMetadata(
      'Category',
      'Loading category...',
      `/category/${category}`
    );
  }
}

// Fetch category data with pagination
async function getCategoryData(categorySlug: string, page: number = 1) {
  try {
    // Fetch category details
    const categoryRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/categories`, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    });
    
    const categoryData = await categoryRes.json();
    let categories;
    if (Array.isArray(categoryData)) {
      categories = categoryData;
    } else if (categoryData.success && categoryData.categories) {
      categories = categoryData.categories;
    } else {
      categories = [];
    }
    
    const currentCategory = categories.find((cat: CategoryData) => cat.slug === categorySlug);
    
    if (!currentCategory) {
      return { category: null, articles: [], latestArticles: [], pagination: null };
    }

    // Fetch articles for this category with pagination
    const articlesRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/articles?category=${categorySlug}&page=${page}&limit=16`, {
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

    // Fetch latest articles (all categories)
    const latestRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/articles?page=1&limit=4&sort=-publishedAt`, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    });
    const latestData = await latestRes.json();
    const latestArticles = latestData.docs || [];

    return { category: currentCategory, articles, latestArticles, pagination };
  } catch (error) {
    console.error('Error fetching category data:', error);
    return { category: null, articles: [], latestArticles: [], pagination: null };
  }
}

export default async function CategoryPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ category: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { category } = await params;
  const { page } = await searchParams;
  const currentPage = page ? parseInt(page) : 1;
  
  const { category: categoryData, articles, latestArticles, pagination } = await getCategoryData(category, currentPage);

  if (!categoryData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Category Not Found</h1>
            <p className="text-gray-600 mb-6">The category you're looking for doesn't exist.</p>
            <Link href="/" className="inline-block px-6 py-2 bg-blue-600 text-white rounded font-semibold">Go Back Home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Category Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold mb-4 text-gray-900">{categoryData.name}</h1>
        {categoryData.description && (
          <p className="text-lg text-gray-600 mb-4">{categoryData.description}</p>
        )}
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>{pagination?.totalDocs || articles.length} articles</span>
          {categoryData.articleCount && (
            <span>• {categoryData.articleCount} total in category</span>
          )}
          {pagination && pagination.totalPages > 1 && (
            <span>• Page {currentPage} of {pagination.totalPages}</span>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content: Small Image Cards Grid */}
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
                  baseUrl={`/category/${category}`}
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
              <p className="text-gray-500">There are no articles in this category yet.</p>
            </div>
          )}
        </div>
        
        {/* Sidebar */}
        <aside className="w-full lg:w-80 flex-shrink-0 space-y-6">
          {/* Advertisement Box */}
          <div className="bg-gray-100 rounded-lg flex items-center justify-center h-56 text-gray-500 text-lg font-semibold border border-gray-200">
            ---Advertisement---
          </div>
          
          {/* Latest Post Section */}
          <div className="bg-white rounded-lg shadow p-0 overflow-hidden">
            <div className="bg-red-600 text-white text-lg font-bold px-6 py-3">Latest Post</div>
            <ul className="divide-y divide-gray-200">
              {latestArticles.map((article: Article) => (
                <li key={article._id} className="flex items-center gap-3 px-6 py-4 hover:bg-gray-50 transition-colors">
                  <Link href={`/article/${article.slug}`} className="flex items-center gap-3 w-full">
                    <div className="relative w-16 h-16 flex-shrink-0">
                      <OptimizedImage
                        src={article.featuredImage || article.imageUrl || '/placeholder.svg'}
                        alt={article.title}
                        width={64}
                        height={64}
                        className="object-cover rounded"
                        priority={false}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1">{article.title}</div>
                      <div className="text-xs text-gray-500">Published On: {new Date(article.publishedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
} 