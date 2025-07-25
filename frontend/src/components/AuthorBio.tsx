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
        <div className="flex items-start gap-4">
          {/* Author Avatar */}
          <div className="relative">
            {avatar ? (
              <img
                src={avatar}
                alt={name}
                className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
              />
            ) : (
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                <User className="w-8 h-8 text-white" />
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
          </div>

          {/* Author Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
              <Badge variant="secondary" className="text-xs">
                Author
              </Badge>
            </div>
            
            <p className="text-gray-600 text-sm leading-relaxed mb-3">
              {bio}
            </p>

            {/* Author Stats */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mb-4">
              {location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>{location}</span>
                </div>
              )}
              {joinedDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>Joined {new Date(joinedDate).getFullYear()}</span>
                </div>
              )}
              {articlesCount && (
                <div className="flex items-center gap-1">
                  <span>{articlesCount} articles</span>
                </div>
              )}
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-2">
              {twitter && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(twitter, '_blank')}
                  className="w-8 h-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                >
                  <Twitter className="w-4 h-4" />
                </Button>
              )}
              {linkedin && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(linkedin, '_blank')}
                  className="w-8 h-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                >
                  <Linkedin className="w-4 h-4" />
                </Button>
              )}
              {website && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(website, '_blank')}
                  className="w-8 h-8 p-0 hover:bg-gray-50"
                >
                  <Globe className="w-4 h-4" />
                </Button>
              )}
              {email && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(`mailto:${email}`, '_blank')}
                  className="w-8 h-8 p-0 hover:bg-gray-50"
                >
                  <Mail className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
