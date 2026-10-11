import React, { useEffect } from 'react';

interface SEOHeadProps {
  title: string;
  description: string;
  image?: string;
}

const SEOHead: React.FC<SEOHeadProps> = ({ title, description, image }) => {
  useEffect(() => {
    // Update Title
    document.title = `${title} | Cantar de la Tierra`;

    // Update Meta Description
    const updateMeta = (selector: string, attr: string, value: string) => {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        if (selector.includes('property')) {
          element.setAttribute('property', attr);
        } else {
          element.setAttribute('name', attr);
        }
        document.head.appendChild(element);
      }
      element.setAttribute('content', value);
    };

    updateMeta('meta[name="description"]', 'description', description);
    updateMeta('meta[property="og:title"]', 'og:title', `${title} | Cantar de la Tierra`);
    updateMeta('meta[property="og:description"]', 'og:description', description);

    if (image) {
      updateMeta('meta[property="og:image"]', 'og:image', image);
      updateMeta('meta[name="twitter:image"]', 'twitter:image', image);
    }

    updateMeta('meta[name="twitter:card"]', 'twitter:card', 'summary_large_image');
    updateMeta('meta[name="twitter:title"]', 'twitter:title', `${title} | Cantar de la Tierra`);
    updateMeta('meta[name="twitter:description"]', 'twitter:description', description);

  }, [title, description, image]);

  return null;
};

export default SEOHead;