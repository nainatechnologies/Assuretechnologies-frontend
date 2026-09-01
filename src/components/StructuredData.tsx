import { useEffect } from 'react';

export interface StructuredDataProps {
  type: 'organization' | 'service' | 'product' | 'breadcrumb' | 'sitemap';
  data?: Record<string, any>;
}

export function StructuredData({ type, data }: StructuredDataProps) {
  useEffect(() => {
    let schemaJson: Record<string, any> = {};

    if (type === 'organization') {
      schemaJson = {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        'name': 'Assure Technologies',
        'image': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&auto=format&fit=crop&q=80',
        '@id': 'https://assuretechnologies.com/#organization',
        'url': 'https://assuretechnologies.com',
        'telephone': '+918639060213',
        'priceRange': '₹₹',
        'address': {
          '@type': 'PostalAddress',
          'streetAddress': 'Assure Towers, Tech Corridor',
          'addressLocality': 'Hyderabad',
          'addressRegion': 'Telangana',
          'postalCode': '500081',
          'addressCountry': 'IN'
        },
        'geo': {
          '@type': 'GeoCoordinates',
          'latitude': 17.4435,
          'longitude': 78.3772
        },
        'openingHoursSpecification': {
          '@type': 'OpeningHoursSpecification',
          'dayOfWeek': [
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday'
          ],
          'opens': '08:00',
          'closes': '20:00'
        },
        'sameAs': [
          'https://facebook.com/assuretechnologies',
          'https://twitter.com/assuretech',
          'https://linkedin.com/company/assuretechnologies'
        ],
        'hasOfferCatalog': {
          '@type': 'OfferCatalog',
          'name': 'Assure Professional Services & Hardware Store',
          'itemListElement': [
            {
              '@type': 'OfferCatalog',
              'name': 'AgriTech Drone Spraying & Survey'
            },
            {
              '@type': 'OfferCatalog',
              'name': 'Enterprise Networking & Optical Cabling'
            },
            {
              '@type': 'OfferCatalog',
              'name': 'Solar Power Rooftop Installation'
            },
            {
              '@type': 'OfferCatalog',
              'name': 'CCTV Security & Surveillance Setup'
            },
            {
              '@type': 'OfferCatalog',
              'name': 'Smart Office & Home IoT Automation'
            }
          ]
        }
      };
    } else if (type === 'service') {
      schemaJson = {
        '@context': 'https://schema.org',
        '@type': 'Service',
        'serviceType': data?.category || 'Field Technical Services & Drone Operations',
        'provider': {
          '@type': 'LocalBusiness',
          'name': 'Assure Technologies',
          'url': 'https://assuretechnologies.com'
        },
        'areaServed': {
          '@type': 'Country',
          'name': 'India'
        },
        'hasOfferCatalog': {
          '@type': 'OfferCatalog',
          'name': data?.title || 'On-Demand Engineering Services',
          'itemListElement': [
            {
              '@type': 'Offer',
              'itemOffered': {
                '@type': 'Service',
                'name': data?.name || 'Assure On-Demand Service'
              }
            }
          ]
        }
      };
    } else if (type === 'product') {
      schemaJson = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        'name': data?.name || 'Assure Certified Hardware',
        'description': data?.description || 'Commercial-grade hardware and equipment from Assure Technologies',
        'brand': {
          '@type': 'Brand',
          'name': 'Assure Technologies'
        },
        'offers': {
          '@type': 'Offer',
          'url': window.location.href,
          'priceCurrency': 'INR',
          'price': data?.price || '999.00',
          'availability': 'https://schema.org/InStock',
          'seller': {
            '@type': 'Organization',
            'name': 'Assure Technologies'
          }
        }
      };
    } else if (type === 'breadcrumb') {
      const items = data?.items || [
        { name: 'Home', url: 'https://assuretechnologies.com/' }
      ];
      schemaJson = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': items.map((it: any, idx: number) => ({
          '@type': 'ListItem',
          'position': idx + 1,
          'name': it.name,
          'item': it.url
        }))
      };
    } else if (type === 'sitemap') {
      schemaJson = {
        '@context': 'https://schema.org',
        '@type': 'SiteNavigationElement',
        'name': 'Assure Technologies Directory & Sitemap',
        'url': 'https://assuretechnologies.com/sitemap',
        'hasPart': (data?.categories || []).map((cat: any) => ({
          '@type': 'SiteNavigationElement',
          'name': cat.title,
          'hasPart': cat.links.map((link: any) => ({
            '@type': 'WebPage',
            'name': link.title,
            'url': link.path.startsWith('http') ? link.path : `https://assuretechnologies.com${link.path}`,
            'description': link.description
          }))
        }))
      };
    }

    const scriptId = `schema-${type}`;
    let scriptTag = document.getElementById(scriptId) as HTMLScriptElement;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = scriptId;
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    scriptTag.text = JSON.stringify(schemaJson);

    return () => {
      const existing = document.getElementById(scriptId);
      if (existing) {
        existing.remove();
      }
    };
  }, [type, data]);

  return null;
}
