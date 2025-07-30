'use client';

import { useState, useEffect } from 'react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { NEWS_CATEGORIES } from '@/types/news';
import { Mail, Phone, MapPin } from 'lucide-react';
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import Image from 'next/image';

export default function Footer() {
  const [mounted, setMounted] = useState(false);
  const { settings } = useSiteSettings();
  const currentYear = 2025;

  // Stable defaults
  const siteName = mounted && settings?.siteName ? settings.siteName : 'The Daily Herald';
  const siteDescription = mounted && settings?.siteDescription ? settings.siteDescription : 'Your trusted source for news';
  const socialMedia = mounted && settings?.socialMedia ? settings.socialMedia : {};
  const contactInfo = mounted && settings?.contactInfo ? settings.contactInfo : {};
  const hasContactInfo = mounted && contactInfo && (contactInfo.address || contactInfo.phone || contactInfo.email);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <footer 
      role="contentinfo" 
      aria-label="Site footer"
      className="bg-gradient-to-b from-gray-900 to-gray-950 text-gray-300 pt-8 pb-6 px-4 sm:px-6"
    >
      <div className="max-w-7xl mx-auto">
        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          
          {/* About Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              {settings?.siteLogo && (
                <Image 
                  src={settings.siteLogo} 
                  alt="" 
                  width={48}
                  height={48}
                  className="rounded-lg"
                  aria-hidden="true"
                />
              )}
              <h2 className="text-xl font-bold text-white">{siteName}</h2>
            </div>
            <p className="text-sm leading-relaxed line-clamp-3 text-ellipsis overflow-hidden">
              {siteDescription}
            </p>
            
            {/* Social Media */}
            {Object.keys(socialMedia).length > 0 && (
              <div className="flex space-x-4 pt-2">
                {socialMedia.facebook && (
                  <a 
                    href={socialMedia.facebook}
                    aria-label="Facebook"
                    className="p-2 text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                  >
                    <FaFacebook className="w-5 h-5" />
                  </a>
                )}
                {socialMedia.twitter && (
                  <a 
                    href={socialMedia.twitter}
                    aria-label="Twitter"
                    className="p-2 text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                  >
                    <FaTwitter className="w-5 h-5" />
                  </a>
                )}
                {socialMedia.instagram && (
                  <a 
                    href={socialMedia.instagram}
                    aria-label="Instagram"
                    className="p-2 text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                  >
                    <FaInstagram className="w-5 h-5" />
                  </a>
                )}
                {socialMedia.youtube && (
                  <a 
                    href={socialMedia.youtube}
                    aria-label="YouTube"
                    className="p-2 text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                  >
                    <FaYoutube className="w-5 h-5" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Quick Links - Mobile Accessible */}
          <nav aria-label="Quick links">
            <h3 className="text-lg font-semibold text-white mb-4 pb-2 border-b border-gray-800">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {[
                { href: '/', text: 'Home' },
                { href: '/about', text: 'About Us' },
                { href: '/contact', text: 'Contact' },
                { href: '/privacy', text: 'Privacy Policy' },
                { href: '/terms', text: 'Terms of Service' },
                { href: '/feed', text: 'RSS Feed' }
              ].map((link) => (
                <li key={link.href}>
                  <a 
                    href={link.href}
                    className="block py-2 hover:text-white transition-colors focus:outline-none focus:underline"
                  >
                    {link.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Categories */}
          <nav aria-label="Article categories">
            <h3 className="text-lg font-semibold text-white mb-4 pb-2 border-b border-gray-800">
              Categories
            </h3>
            <ul className="space-y-3">
              {NEWS_CATEGORIES.slice(0, 6).map((category) => (
                <li key={category._id}>
                  <a 
                    href={`/category/${category.slug}`}
                    className="block py-2 hover:text-white transition-colors focus:outline-none focus:underline"
                  >
                    {category.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 pb-2 border-b border-gray-800">
              Contact Us
            </h3>
            {hasContactInfo ? (
              <address className="not-italic space-y-3">
                {contactInfo.address && (
                  <div className="flex items-start space-x-3">
                    <MapPin className="flex-shrink-0 w-5 h-5 mt-0.5 text-gray-400" aria-hidden="true" />
                    <span>{contactInfo.address}</span>
                  </div>
                )}
                {contactInfo.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="flex-shrink-0 w-5 h-5 text-gray-400" aria-hidden="true" />
                    <a 
                      href={`tel:${contactInfo.phone}`}
                      className="hover:text-white transition-colors focus:outline-none focus:underline"
                    >
                      {contactInfo.phone}
                    </a>
                  </div>
                )}
                {contactInfo.email && (
                  <div className="flex items-center space-x-3">
                    <Mail className="flex-shrink-0 w-5 h-5 text-gray-400" aria-hidden="true" />
                    <a 
                      href={`mailto:${contactInfo.email}`}
                      className="hover:text-white transition-colors focus:outline-none focus:underline"
                    >
                      {contactInfo.email}
                    </a>
                  </div>
                )}
              </address>
            ) : (
              <p className="text-sm text-gray-500">Contact information not available</p>
            )}

            {/* Newsletter - Accessible Form */}
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-3">Subscribe to Newsletter</h3>
              <form>
                <div className="flex flex-col sm:flex-row gap-2">
                  <label htmlFor="newsletter-email" className="sr-only">Email address</label>
                  <input
                    id="newsletter-email"
                    type="email"
                    placeholder="Your email"
                    className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <button 
                    type="submit"
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Subscribe
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div 
          className="pt-6 mt-6 border-t border-gray-800 text-center text-sm text-gray-400"
          aria-label="Copyright information"
        >
          <p>© {currentYear} {siteName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
