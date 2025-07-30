import { Metadata } from 'next';
import Link from 'next/link';
import { Article } from '@/types/news';
import { API_ENDPOINTS } from '@/lib/config';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import OptimizedImage from '@/components/OptimizedImage';

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
      return {
        title: 'Category Not Found - The Daily Herald',
        description: 'The category you are looking for does not exist.',
        robots: {
          index: false,
          follow: false,
        },
      };
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const canonicalUrl = `${siteUrl}/category/${category}`;

    return {
      title: `${currentCategory.name} News - The Daily Herald`,
      description: currentCategory.description || `Latest ${currentCategory.name} news and articles from The Daily Herald. Stay updated with breaking news and in-depth coverage.`,
      keywords: `${currentCategory.name}, news, articles, ${currentCategory.name} news, latest news`,
      alternates: {
        canonical: canonicalUrl,
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
      openGraph: {
        title: `${currentCategory.name} News - The Daily Herald`,
        description: currentCategory.description || `Latest ${currentCategory.name} news and articles from The Daily Herald.`,
        type: 'website',
        url: canonicalUrl,
      },
      twitter: {
        card: 'summary_large_image',
        title: `${currentCategory.name} News - The Daily Herald`,
        description: currentCategory.description || `Latest ${currentCategory.name} news and articles from The Daily Herald.`,
      },
    };
  } catch (error) {
    return {
      title: 'Category - The Daily Herald',
      description: 'Loading category...',
      robots: {
        index: false,
        follow: false,
      },
    };
  }
}

// Fetch category data
async function getCategoryData(categorySlug: string) {
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
      return { category: null, articles: [], latestArticles: [] };
    }

    // Fetch articles for this category
    const articlesRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/articles?category=${categorySlug}&limit=20`, {
      next: { revalidate: 60 }, // Cache for 1 minute
    });
    const articlesData = await articlesRes.json();
    const articles = articlesData.success ? (articlesData.docs || []) : [];

    // Fetch latest articles (all categories)
    const latestRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/articles?page=1&limit=4&sort=-publishedAt`, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    });
    const latestData = await latestRes.json();
    const latestArticles = latestData.docs || [];

    return { category: currentCategory, articles, latestArticles };
  } catch (error) {
    console.error('Error fetching category data:', error);
    return { category: null, articles: [], latestArticles: [] };
  }
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const { category: categoryData, articles, latestArticles } = await getCategoryData(category);

  if (!categoryData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Category Not Found</h1>
            <p className="text-gray-600 mb-6">The category you're looking for doesn't exist.</p>
            <Link href="/" className="inline-block px-6 py-2 bg-blue-600 text-white rounded font-semibold">Go Back Home</Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Category Title */}
        <h1 className="text-4xl font-extrabold mb-8 mt-4 text-gray-900">{categoryData.name}</h1>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content: 2-column grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {articles.length > 0 ? (
                articles.map((article: Article) => (
                  <div key={article._id} className="bg-white rounded-xl shadow hover:shadow-lg transition-shadow">
                    <Link href={`/article/${article.slug}`} className="block">
                      <div className="overflow-hidden rounded-t-xl">
                        <OptimizedImage
                          src={article.featuredImage || article.imageUrl || '/placeholder.svg'}
                          alt={article.title}
                          fill
                          className="transition-transform duration-300 hover:scale-105"
                          priority={false}
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      </div>
                      <div className="p-5">
                        <h2 className="text-xl font-extrabold mb-2 leading-tight text-gray-900 line-clamp-2">
                          {article.title}
                        </h2>
                        <div className="flex items-center gap-2 text-sm text-gray-600 font-semibold mb-1">
                          By {typeof article.author === 'string' ? article.author : article.author?.name || 'Unknown'}
                          <span className="mx-1">•</span>
                          {new Date(article.publishedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                      </div>
                    </Link>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-12">
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
          </div>
          {/* Sidebar */}
          <aside className="w-full lg:w-96 flex-shrink-0 space-y-8">
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
      <Footer />
    </div>
  );
} 