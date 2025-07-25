'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { List, X } from 'lucide-react';

interface TableOfContentsProps {
  content: string;
}

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export default function TableOfContents({ content }: TableOfContentsProps) {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Parse content to find headings
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    const items: TocItem[] = [];
    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1));
      const text = heading.textContent || '';
      const id = `heading-${index}`;
      
      // Add ID to the heading if it doesn't have one
      if (!heading.id) {
        heading.id = id;
      }
      
      items.push({
        id: heading.id || id,
        text,
        level
      });
    });
    
    setTocItems(items);
  }, [content]);

  useEffect(() => {
    const handleScroll = () => {
      const headings = tocItems.map(item => document.getElementById(item.id)).filter(Boolean);
      
      if (headings.length === 0) return;
      
      const scrollTop = window.scrollY + 100;
      
      for (let i = headings.length - 1; i >= 0; i--) {
        const heading = headings[i];
        if (heading && heading.offsetTop <= scrollTop) {
          setActiveId(heading.id);
          break;
        }
      }
    };

    if (tocItems.length > 0) {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [tocItems]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (tocItems.length === 0) return null;

  return (
    <>
      {/* Mobile TOC Toggle */}
      <div className="lg:hidden fixed bottom-20 right-6 z-40">
        <Button
          size="lg"
          onClick={() => setIsVisible(!isVisible)}
          className="bg-gray-800 hover:bg-gray-900 text-white rounded-full w-12 h-12 p-0 shadow-lg"
        >
          {isVisible ? <X className="w-5 h-5" /> : <List className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile TOC Panel */}
      {isVisible && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/50" onClick={() => setIsVisible(false)}>
          <div className="absolute right-6 top-20 bottom-20 w-80 bg-white rounded-lg shadow-xl p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Table of Contents</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {tocItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    scrollToHeading(item.id);
                    setIsVisible(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    activeId === item.id
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                  style={{ paddingLeft: `${(item.level - 1) * 16 + 12}px` }}
                >
                  {item.text}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Desktop TOC */}
      <Card className="hidden lg:block sticky top-6">
        <CardContent className="p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Table of Contents</h3>
          <div className="space-y-1">
            {tocItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToHeading(item.id)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  activeId === item.id
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
                style={{ paddingLeft: `${(item.level - 1) * 16 + 12}px` }}
              >
                {item.text}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
} 