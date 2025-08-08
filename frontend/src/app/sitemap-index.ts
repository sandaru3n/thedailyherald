import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  
  return [
    {
      url: `${baseUrl}/sitemap.xml`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/api/sitemap/articles`,
      lastModified: new Date(),
    },
    // Additional article sitemap pages for better organization
    {
      url: `${baseUrl}/api/sitemap/articles?page=1&limit=500`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/api/sitemap/articles?page=2&limit=500`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/api/sitemap/articles?page=3&limit=500`,
      lastModified: new Date(),
    },
  ];
} 