import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { NEWS_CATEGORIES } from '@/types/news';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-white mt-12 sm:mt-16">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">THE DAILY HERALD</h3>
            <p className="text-gray-300 text-xs sm:text-sm mb-3 sm:mb-4">
              Your trusted source for breaking news, in-depth analysis, and comprehensive coverage
              of local and global events. Committed to delivering truth with integrity.
            </p>
            <div className="flex space-x-2 sm:space-x-3">
              <Button size="sm" variant="ghost" className="p-1.5 sm:p-2 hover:bg-gray-700">
                <Facebook className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Button size="sm" variant="ghost" className="p-1.5 sm:p-2 hover:bg-gray-700">
                <Twitter className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Button size="sm" variant="ghost" className="p-1.5 sm:p-2 hover:bg-gray-700">
                <Instagram className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Button size="sm" variant="ghost" className="p-1.5 sm:p-2 hover:bg-gray-700">
                <Youtube className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Quick Links</h4>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Advertise With Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  RSS Feed
                </a>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Categories</h4>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
              {NEWS_CATEGORIES.slice(0, 6).map((category) => (
                <li key={category.id}>
                  <a
                    href={`#${category.slug}`}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {category.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Contact Info</h4>
            <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
              <div className="flex items-start gap-2 sm:gap-3">
                <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-300">
                  123 News Street, Media City, NY 10001
                </span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                <span className="text-gray-300">
                  +1 (555) 123-4567
                </span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                <span className="text-gray-300">
                  news@dailyherald.com
                </span>
              </div>
            </div>

            {/* Newsletter */}
            <div className="mt-4 sm:mt-6">
              <h5 className="font-medium mb-2 text-xs sm:text-sm">Daily Newsletter</h5>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-gray-800 border border-gray-600 rounded text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-6 sm:my-8 bg-gray-700" />

        {/* Bottom Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-center text-xs sm:text-sm text-gray-400">
          <div className="text-center sm:text-left mb-3 sm:mb-0">
            © {currentYear} The Daily Herald. All rights reserved.
          </div>
          <div className="flex space-x-4 sm:space-x-6">
            <a href="#" className="hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
