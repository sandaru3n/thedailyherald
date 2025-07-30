'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Twitter, 
  Linkedin, 
  Globe, 
  Mail,
  Calendar,
  MapPin
} from 'lucide-react';

interface AuthorBioProps {
  author: {
    name: string;
    bio?: string;
    avatar?: string;
    twitter?: string;
    linkedin?: string;
    website?: string;
    email?: string;
    location?: string;
    joinedDate?: string;
    articlesCount?: number;
  };
  category?: string;
}

export default function AuthorBio({ author, category }: AuthorBioProps) {
  const {
    name,
    bio = `Experienced journalist covering ${category?.toLowerCase() || 'news'} and trends.`,
    avatar,
    twitter,
    linkedin,
    website,
    email,
    location,
    joinedDate,
    articlesCount
  } = author;

  return (
    <Card className="bg-gradient-to-br from-gray-50 to-white border-0 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900">{name}</h2>
            <p className="text-gray-600 text-sm">{bio}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
