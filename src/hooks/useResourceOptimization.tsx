import { useEffect } from 'react';

// Précharger les polices critiques
export const useFontOptimization = () => {
  useEffect(() => {
    // Précharger les polices critiques
    const preloadFonts = [
      '/fonts/main-font.woff2',
      '/fonts/main-font-bold.woff2'
    ];

    preloadFonts.forEach(fontUrl => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
      link.href = fontUrl;
      document.head.appendChild(link);
    });

    // Utiliser Font Loading API si disponible
    if ('fonts' in document) {
      document.fonts.ready.then(() => {
        document.body.classList.add('fonts-loaded');
      });
    }
  }, []);
};

// Composant pour optimiser le chargement des ressources
export const ResourcePreloader = () => {
  useEffect(() => {
    // Précharger les ressources critiques
    const criticalResources = [
      '/images/hero-bg.webp',
      '/images/logo.webp'
    ];

    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      
      if (resource.includes('.webp') || resource.includes('.jpg') || resource.includes('.png')) {
        link.as = 'image';
      } else if (resource.includes('.css')) {
        link.as = 'style';
      }
      
      link.href = resource;
      document.head.appendChild(link);
    });
  }, []);

  return null;
};
