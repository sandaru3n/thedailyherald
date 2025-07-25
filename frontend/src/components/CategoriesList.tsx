'use client';

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
  Users
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
  icon: string;
  articleCount: number;
}

const CATEGORIES: Category[] = [
  { id: '1', name: 'Technology', slug: 'technology', color: 'bg-blue-500', icon: 'Zap', articleCount: 45 },
  { id: '2', name: 'Business', slug: 'business', color: 'bg-green-500', icon: 'Briefcase', articleCount: 32 },
  { id: '3', name: 'Politics', slug: 'politics', color: 'bg-red-500', icon: 'Globe', articleCount: 28 },
  { id: '4', name: 'Sports', slug: 'sports', color: 'bg-orange-500', icon: 'Gamepad2', articleCount: 38 },
  { id: '5', name: 'Entertainment', slug: 'entertainment', color: 'bg-purple-500', icon: 'Music', articleCount: 25 },
  { id: '6', name: 'Health', slug: 'health', color: 'bg-pink-500', icon: 'Heart', articleCount: 19 },
  { id: '7', name: 'Science', slug: 'science', color: 'bg-indigo-500', icon: 'BookOpen', articleCount: 22 },
  { id: '8', name: 'Lifestyle', slug: 'lifestyle', color: 'bg-yellow-500', icon: 'Users', articleCount: 31 },
  { id: '9', name: 'Arts', slug: 'arts', color: 'bg-teal-500', icon: 'Palette', articleCount: 15 },
  { id: '10', name: 'Travel', slug: 'travel', color: 'bg-cyan-500', icon: 'Camera', articleCount: 18 },
  { id: '11', name: 'Automotive', slug: 'automotive', color: 'bg-gray-500', icon: 'Car', articleCount: 12 },
];

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

  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
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
      Users
    };
    return iconMap[iconName] || Globe;
  };

  const displayCategories = CATEGORIES.slice(0, maxCategories);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <Badge variant="outline" className="text-xs">
            {CATEGORIES.length} categories
          </Badge>
        </div>
        
        <div className="space-y-2">
          {displayCategories.map((category) => {
            const IconComponent = getIconComponent(category.icon);
            
            return (
              <button
                key={category.id}
                onClick={() => router.push(`/category/${category.slug}`)}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 ${category.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <IconComponent className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
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
        {CATEGORIES.length > maxCategories && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => router.push('/categories')}
              className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              View All Categories
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 