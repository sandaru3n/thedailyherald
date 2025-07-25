'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Facebook, 
  Twitter, 
  Linkedin, 
  Share2, 
  X,
  Copy
} from 'lucide-react';

interface FloatingShareProps {
  title: string;
  url: string;
  excerpt?: string;
}

export default function FloatingShare({ title, url, excerpt }: FloatingShareProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsVisible(scrollTop > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleShare = (platform: string) => {
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    };

    if (shareUrls[platform as keyof typeof shareUrls]) {
      window.open(shareUrls[platform as keyof typeof shareUrls], '_blank', 'width=600,height=400');
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <div className="flex flex-col items-end space-y-3">
        {/* Social Share Buttons */}
        {isExpanded && (
          <div className="flex flex-col space-y-2">
            <Button
              size="sm"
              onClick={() => handleShare('facebook')}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-10 h-10 p-0"
            >
              <Facebook className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              onClick={() => handleShare('twitter')}
              className="bg-sky-500 hover:bg-sky-600 text-white rounded-full w-10 h-10 p-0"
            >
              <Twitter className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              onClick={() => handleShare('linkedin')}
              className="bg-blue-700 hover:bg-blue-800 text-white rounded-full w-10 h-10 p-0"
            >
              <Linkedin className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              onClick={copyToClipboard}
              className="bg-gray-600 hover:bg-gray-700 text-white rounded-full w-10 h-10 p-0"
            >
              {copied ? <Copy className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            </Button>
          </div>
        )}

        {/* Toggle Button */}
        <Button
          size="lg"
          onClick={() => setIsExpanded(!isExpanded)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-12 h-12 p-0 shadow-lg"
        >
          {isExpanded ? <X className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
        </Button>
      </div>
    </div>
  );
}
