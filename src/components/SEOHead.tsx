import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export interface SEOProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  noindex?: boolean;
  keywords?: string[];
}

const DEFAULT_TITLE = 'Assure Technologies | Smart Enterprise Solutions, Solar & IoT';
const DEFAULT_DESCRIPTION = 'Assure Technologies offers enterprise networking, on-demand technician bookings, AgriTech drone spraying, solar power installations, CCTV security, and smart automation hardware.';
const DEFAULT_OG_IMAGE = 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&auto=format&fit=crop&q=80';
const BASE_URL = 'https://assuretechnologies.com';

export function SEOHead({
  title,
  description = DEFAULT_DESCRIPTION,
  canonicalUrl,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = 'website',
  noindex = false,
  keywords = ['Assure Technologies', 'Enterprise Networking', 'Solar Power', 'Drone Spraying', 'CCTV Installation', 'Technician Services', 'IoT Automation']
}: SEOProps) {
  const location = useLocation();
  const currentPath = location.pathname + (location.search || '');
  const pageCanonical = canonicalUrl || `${BASE_URL}${location.pathname}`;
  const fullTitle = title ? (title.includes('Assure Technologies') ? title : `${title} | Assure Technologies`) : DEFAULT_TITLE;

  useEffect(() => {
    // 1. Update Title
    document.title = fullTitle;

    // Helper to create or update meta/link tags
    const updateOrCreateMeta = (attrName: string, attrVal: string, content: string) => {
      let element = document.querySelector(`meta[${attrName}="${attrVal}"]`) as HTMLMetaElement;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrVal);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 2. Standard Meta Tags
    updateOrCreateMeta('name', 'description', description);
    updateOrCreateMeta('name', 'keywords', keywords.join(', '));
    updateOrCreateMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');

    // 3. Canonical Link
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', pageCanonical);

    // 4. Open Graph Tags
    updateOrCreateMeta('property', 'og:site_name', 'Assure Technologies');
    updateOrCreateMeta('property', 'og:title', fullTitle);
    updateOrCreateMeta('property', 'og:description', description);
    updateOrCreateMeta('property', 'og:url', `${BASE_URL}${currentPath}`);
    updateOrCreateMeta('property', 'og:type', ogType);
    updateOrCreateMeta('property', 'og:image', ogImage);

    // 5. Twitter Card Tags
    updateOrCreateMeta('name', 'twitter:card', 'summary_large_image');
    updateOrCreateMeta('name', 'twitter:title', fullTitle);
    updateOrCreateMeta('name', 'twitter:description', description);
    updateOrCreateMeta('name', 'twitter:image', ogImage);

  }, [fullTitle, description, pageCanonical, ogImage, ogType, noindex, keywords, currentPath]);

  return null;
}
