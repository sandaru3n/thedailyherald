'use client';

import { useEffect } from 'react';
import { Article } from '@/types/news';

interface StructuredDataProps {
  article: Article;
  settings?: {
    siteName: string;
    siteUrl: string;
    publisherName: string;
    publisherUrl: string;
    publisherLogo?: string;
    socialMedia?: {
      facebook?: string;
      twitter?: string;
      youtube?: string;
    };
  } | null;
}

export default function StructuredData({ article, settings }: StructuredDataProps) {
  useEffect(() => {
    if (!article || !settings) return;

    // Create the main NewsArticle structured data
    const newsArticleData = {
      "@type": "NewsArticle",
      "@context": "https://schema.org",
      "@id": `${settings.siteUrl}/article/${article.slug}`,
      "publisher": {
        "@type": "Organization",
        "@context": "https://schema.org",
        "@id": `${settings.publisherUrl}#publisher`,
        "name": settings.publisherName,
        "url": settings.publisherUrl,
        ...(settings.publisherLogo && {
          "logo": {
            "@type": "ImageObject",
            "url": settings.publisherLogo,
            "width": 190,
            "height": 60
          }
        }),
        ...(settings.socialMedia && {
          "sameAs": [
            ...(settings.socialMedia.facebook ? [settings.socialMedia.facebook] : []),
            ...(settings.socialMedia.twitter ? [settings.socialMedia.twitter] : []),
            ...(settings.socialMedia.youtube ? [settings.socialMedia.youtube] : [])
          ].filter(Boolean)
        })
      },
      "isAccessibleForFree": true,
      "isPartOf": {
        "@type": ["CreativeWork", "Product"],
        "name": settings.siteName,
        "productID": `${settings.siteUrl}:basic`
      },
      "image": article.featuredImage ? [
        article.featuredImage,
        // Add different image sizes for better SEO
        `${article.featuredImage}?width=1200&height=630&quality=85&auto=format&fit=crop`,
        `${article.featuredImage}?width=1200&height=1200&quality=85&auto=format&fit=crop`,
        `${article.featuredImage}?width=1200&height=900&quality=85&auto=format&fit=crop`,
        `${article.featuredImage}?width=1200&quality=85&auto=format&fit=max`
      ] : [],
      "author": [{
        "@type": "Person",
        "name": typeof article.author === 'string' ? article.author : article.author?.name || 'Unknown Author',
        ...(typeof article.author === 'object' && article.author?._id && {
          "sameAs": `https://${settings.siteUrl}/profile/${article.author._id}`
        })
      }],
      "datePublished": article.publishedAt,
      "headline": article.title,
      "dateModified": article.updatedAt || article.publishedAt,
      "mainEntityOfPage": `${settings.siteUrl}/article/${article.slug}`,
      ...(article.content && {
        "articleBody": article.content
      }),
      ...(article.excerpt && {
        "description": article.excerpt
      }),
      ...(article.seoDescription && {
        "description": article.seoDescription
      }),
      ...(article.metaKeywords && {
        "keywords": article.metaKeywords.join(', ')
      }),
      ...(article.tags && {
        "keywords": article.tags.join(', ')
      }),
      ...(article.category && {
        "articleSection": typeof article.category === 'string' ? article.category : article.category.name
      }),
      ...(article.readTime && {
        "timeRequired": `PT${article.readTime}M`
      }),
      ...(article.views && {
        "interactionStatistic": {
          "@type": "InteractionCounter",
          "interactionType": "https://schema.org/ReadAction",
          "userInteractionCount": article.views
        }
      })
    };

    // Create the WebPage structured data
    const webPageData = {
      "@type": "WebPage",
      "@context": "https://schema.org",
      "@id": `${settings.siteUrl}/article/${article.slug}`,
      "potentialAction": {
        "@type": "ViewAction",
        "target": `android-app://com.${settings.siteUrl.replace(/^https?:\/\//, '').replace(/\./g, '')}/https/${settings.siteUrl}/article/${article.slug}`
      }
    };

    // Combine both structured data objects
    const structuredData = [newsArticleData, webPageData];

    // Remove the existing structured data script if it exists
    const existingScript = document.querySelector('script[data-structured-data="article"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Create new script element
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-structured-data', 'article');
    script.textContent = JSON.stringify(structuredData, null, 2);

    // Add to head
    document.head.appendChild(script);

    // Cleanup function
    return () => {
      const scriptToRemove = document.querySelector('script[data-structured-data="article"]');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [article, settings]);

  return null; // This component doesn't render anything
} 