import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Twitter, Linkedin, Mail, Globe } from 'lucide-react';
import Image from 'next/image';

interface AuthorBioProps {
  author: string;
  bio?: string;
  avatar?: string;
  expertise?: string[];
  social?: {
    twitter?: string;
    linkedin?: string;
    email?: string;
    website?: string;
  };
  articleCount?: number;
}

export default function AuthorBio({
  author,
  bio,
  avatar,
  expertise = [],
  social = {},
  articleCount = 0
}: AuthorBioProps) {
  const defaultBio = `${author} is a senior reporter at The Daily Herald with extensive experience covering breaking news and in-depth analysis. Known for delivering accurate and timely reporting on complex issues.`;

  const defaultExpertise = ['Politics', 'Breaking News', 'Investigative Journalism'];

  return (
    <Card className="border-2 border-gray-100">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Author Avatar */}
          <div className="flex-shrink-0">
            {avatar ? (
              <div className="relative w-16 h-16 rounded-full overflow-hidden">
                <Image
                  src={avatar}
                  alt={author}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
            )}
          </div>

          {/* Author Info */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-bold text-gray-900">{author}</h3>
              <div className="text-sm text-gray-500">
                {articleCount > 0 && `${articleCount} articles`}
              </div>
            </div>

            <p className="text-gray-600 text-sm leading-relaxed mb-3">
              {bio || defaultBio}
            </p>

            {/* Expertise */}
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-700 mb-2">Expertise:</p>
              <div className="flex flex-wrap gap-1">
                {(expertise.length > 0 ? expertise : defaultExpertise).map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Social Links */}
            {(social.twitter || social.linkedin || social.email || social.website) && (
              <div className="flex items-center gap-2">
                {social.twitter && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`https://twitter.com/${social.twitter}`, '_blank')}
                  >
                    <Twitter className="h-3 w-3" />
                  </Button>
                )}
                {social.linkedin && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(social.linkedin, '_blank')}
                  >
                    <Linkedin className="h-3 w-3" />
                  </Button>
                )}
                {social.email && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`mailto:${social.email}`, '_blank')}
                  >
                    <Mail className="h-3 w-3" />
                  </Button>
                )}
                {social.website && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(social.website, '_blank')}
                  >
                    <Globe className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
