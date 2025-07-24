'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, X } from 'lucide-react';
import SocialShare from './SocialShare';

interface FloatingShareProps {
  url: string;
  title: string;
}

export default function FloatingShare({ url, title }: FloatingShareProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-40 lg:hidden">
      {/* Share Panel */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-xl border p-4 min-w-[200px]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Share Article</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <SocialShare url={url} title={title} variant="vertical" size="sm" />
        </div>
      )}

      {/* Float Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700"
      >
        <Share2 className="h-5 w-5" />
      </Button>
    </div>
  );
}
