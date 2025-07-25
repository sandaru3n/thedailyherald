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
        const data = await res.json();
        if (data.success) {
          setCategories(data.categories || []);
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
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

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <Badge variant="outline" className="text-xs">
            {categories.length} categories
          </Badge>
        </div>
        
        <div className="space-y-2">
          {displayCategories.map((category) => {
            const IconComponent = getIconComponent(category.icon);
            
            return (
              <button
                key={category._id}
                onClick={() => router.push(`/category/${category.slug}`)}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: category.color }}
                  >
                    <IconComponent className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors text-sm">
                    {category.name}
                  </span>
                </div>
                
                {showCounts && (
                  <Badge variant="secondary" className="text-xs">
                    {category.articleCount}
                  </Badge>
                )}
              </button>
            );
          })}
        </div>

        {/* View All Categories */}
        {categories.length > maxCategories && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => router.push('/categories')}
              className="w-full text-center text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              View All Categories
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 