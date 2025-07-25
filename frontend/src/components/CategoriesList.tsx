'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Globe, 
  TrendingUp, 
  Briefcase, 
  Gamepad2, 
  Music, 
  Heart, 
  Zap,
  Palette,
  Camera,
  Car,
  BookOpen,
  Users,
  Newspaper
} from 'lucide-react';
import { API_ENDPOINTS } from '@/lib/config';

interface Category {
  _id: string;
  name: string;
  slug: string;
  color: string;
  icon: string;
  articleCount: number;
  description?: string;
  isFeatured?: boolean; // Added for new API
}

interface CategoriesListProps {
  title?: string;
  showCounts?: boolean;
  maxCategories?: number;
}

export default function CategoriesList({ 
  title = "Categories",
  showCounts = true,
  maxCategories = 8
}: CategoriesListProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.categories);
        const data = await res.json() as Category[] | { success: boolean; categories?: Category[] };
        // Handle both old and new API response formats
        if (Array.isArray(data)) {
          setCategories(data);
        } else if (data.success && data.categories) {
          setCategories(data.categories);
        } else {
          setCategories([]);
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: React.ElementType } = {
      Globe,
      TrendingUp,
      Briefcase,
      Gamepad2,
      Music,
      Heart,
      Zap,
      Palette,
      Camera,
      Car,
      BookOpen,
      Users,
      Newspaper
    };
    return iconMap[iconName] || Newspaper;
  };

  const displayCategories = categories.slice(0, maxCategories);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                  <div className="h-4 bg-gray-200 rounded flex-1"></div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (categories.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">{title}</h3>
          <p className="text-gray-500 text-sm">No categories available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="space-y-2">
          {displayCategories.map((category) => {
            const IconComponent = getIconComponent(category.icon);
            return (
              <div
                key={category._id}
                onClick={() => router.push(`/category/${category.slug}`)}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: category.color + '20' }}
                >
                  <IconComponent 
                    className="w-4 h-4" 
                    style={{ color: category.color }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {category.name}
                  </div>
                  {showCounts && (
                    <div className="text-sm text-gray-500">
                      {category.articleCount || 0} articles
                    </div>
                  )}
                </div>
                {category.isFeatured && (
                  <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                    Featured
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
        
        {categories.length > maxCategories && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => router.push('/categories')}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              View all categories ({categories.length})
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 