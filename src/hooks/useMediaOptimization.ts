import { useEffect } from 'react';

// Hook pour optimiser le chargement des images
export const useImageOptimization = () => {
  useEffect(() => {
    // Convertir les images en WebP si le navigateur le supporte
    const supportsWebP = (() => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    })();

    // Optimiser toutes les images de la page
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.dataset.src;
          
          if (src) {
            // Utiliser WebP si supporté
            let optimizedSrc = src;
            if (supportsWebP && !src.includes('.svg')) {
              optimizedSrc = src.replace(/\.(jpg|jpeg|png)$/, '.webp');
            }
            
            // Précharger l'image
            const tempImg = new Image();
            tempImg.onload = () => {
              img.src = optimizedSrc;
              img.classList.add('loaded');
              img.removeAttribute('data-src');
            };
            tempImg.src = optimizedSrc;
          }
          
          imageObserver.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px 0px', // Charger les images 50px avant qu'elles soient visibles
    });

    images.forEach(img => {
      imageObserver.observe(img);
    });

    return () => {
      imageObserver.disconnect();
    };
  }, []);
};

// Hook pour optimiser les vidéos
export const useVideoOptimization = () => {
  useEffect(() => {
    const videos = document.querySelectorAll('video[data-src]');
    
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const video = entry.target as HTMLVideoElement;
          const src = video.dataset.src;
          
          if (src) {
            video.src = src;
            video.load();
            video.removeAttribute('data-src');
          }
          
          videoObserver.unobserve(video);
        }
      });
    }, {
      rootMargin: '100px 0px',
    });

    videos.forEach(video => {
      videoObserver.observe(video);
    });

    return () => {
      videoObserver.disconnect();
    };
  }, []);
};
