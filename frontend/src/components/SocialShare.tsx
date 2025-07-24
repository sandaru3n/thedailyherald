'use client';

import { Button } from '@/components/ui/button';
import {
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  Share2,
  Copy,
  MessageCircle
} from 'lucide-react';
import { useState } from 'react';

interface SocialShareProps {
  url: string;
  title: string;
  variant?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
}

export default function SocialShare({
  url,
  title,
  variant = 'horizontal',
  size = 'md'
}: SocialShareProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);

    const shareUrls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      email: `mailto:?subject=${encodedTitle}&body=Check out this article: ${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${encodedTitle} ${encodedUrl}`
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const buttonSize = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'default';
  const iconSize = size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4';

  const containerClass = variant === 'vertical'
    ? 'flex flex-col gap-2'
    : 'flex items-center gap-2';

  return (
    <div className={containerClass}>
      <Button
        variant="outline"
        size={buttonSize}
        onClick={() => handleShare('facebook')}
        className="text-blue-600 hover:bg-blue-50"
      >
        <Facebook className={iconSize} />
        {variant === 'vertical' && <span className="ml-2">Facebook</span>}
      </Button>

      <Button
        variant="outline"
        size={buttonSize}
        onClick={() => handleShare('twitter')}
        className="text-sky-500 hover:bg-sky-50"
      >
        <Twitter className={iconSize} />
        {variant === 'vertical' && <span className="ml-2">Twitter</span>}
      </Button>

      <Button
        variant="outline"
        size={buttonSize}
        onClick={() => handleShare('linkedin')}
        className="text-blue-700 hover:bg-blue-50"
      >
        <Linkedin className={iconSize} />
        {variant === 'vertical' && <span className="ml-2">LinkedIn</span>}
      </Button>

      <Button
        variant="outline"
        size={buttonSize}
        onClick={() => handleShare('whatsapp')}
        className="text-green-600 hover:bg-green-50"
      >
        <MessageCircle className={iconSize} />
        {variant === 'vertical' && <span className="ml-2">WhatsApp</span>}
      </Button>

      <Button
        variant="outline"
        size={buttonSize}
        onClick={() => handleShare('email')}
        className="text-gray-600 hover:bg-gray-50"
      >
        <Mail className={iconSize} />
        {variant === 'vertical' && <span className="ml-2">Email</span>}
      </Button>

      <Button
        variant="outline"
        size={buttonSize}
        onClick={handleCopyLink}
        className={`${copied ? 'text-green-600 bg-green-50' : 'text-gray-600 hover:bg-gray-50'}`}
      >
        <Copy className={iconSize} />
        {variant === 'vertical' && (
          <span className="ml-2">{copied ? 'Copied!' : 'Copy Link'}</span>
        )}
      </Button>
    </div>
  );
}
