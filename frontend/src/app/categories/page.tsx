import { Metadata } from 'next';
import Link from 'next/link';
import { API_ENDPOINTS } from '@/lib/config';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumb from '@/components/Breadcrumb';
import { generatePageMetadata } from '@/lib/metadata';

interface CategoryData {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  articleCount?: number;
}

// Generate metadata for SEO
export const metadata: Metadata = generatePageMetadata(
  'Categories',
  'Browse all news categories. Find the latest news and articles organized by topics.',
  '/categories'
);

// Fetch categories data
async function getCategoriesData() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/categories`, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    });
    
    const data = await res.json();
    let categories;
    if (Array.isArray(data)) {
      categories = data;
    } else if (data.success && data.categories) {
      categories = data.categories;
    } else {
      categories = [];
    }
    
    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export default async function CategoriesPage() {
  const categories = await getCategoriesData();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <Breadcrumb items={[
          { label: 'Categories' }
        ]} />
        
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold mb-4 text-gray-900">Categories</h1>
          <p className="text-lg text-gray-600">Browse all news categories and find the latest articles organized by topics.</p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.length > 0 ? (
            categories.map((category: CategoryData) => (
              <Link 
                key={category._id} 
                href={`/category/${category.slug}`}
                className="group"
              >
                <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 p-6 h-full">
                  {/* Category Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color || '#3B82F6' }}
                    />
                    <span className="text-sm text-gray-500 font-medium">
                      {category.articleCount || 0} articles
                    </span>
                  </div>
                  
                  {/* Category Name */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                    {category.name}
                  </h3>
                  
                  {/* Category Description */}
                  {category.description && (
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                      {category.description}
                    </p>
                  )}
                  
                  {/* View Articles Link */}
                  <div className="flex items-center text-blue-600 text-sm font-medium group-hover:text-blue-700 transition-colors">
                    View Articles
                    <svg className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
              <p className="text-gray-500">There are no categories available at the moment.</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
} 