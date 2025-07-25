import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return visible ? (
    <button
      aria-label="Scroll to top"
      onClick={scrollToTop}
      className="fixed bottom-20 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg w-12 h-12 flex items-center justify-center transition-all duration-300 animate-fade-in"
    >
      <ArrowUp className="w-6 h-6" />
    </button>
  ) : null;
} 