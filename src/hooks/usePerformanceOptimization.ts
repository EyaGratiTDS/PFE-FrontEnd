import { useEffect, useCallback } from 'react';

export const usePerformanceOptimization = () => {
  // Optimiser les images après le chargement initial
  const optimizeImages = useCallback(() => {
    // Lazy loading des images non-critiques
    const images = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              img.classList.add('fade-in');
            }
            imageObserver.unobserve(img);
          }
        });
      }, {
        rootMargin: '50px'
      });

      images.forEach(img => imageObserver.observe(img));
    }
  }, []);

  // Différer les scripts non-critiques
  const deferNonCriticalScripts = useCallback(() => {
    const deferredScripts = document.querySelectorAll('script[data-defer]');
    
    const loadScript = (script: HTMLScriptElement) => {
      const newScript = document.createElement('script');
      newScript.src = script.dataset.src || script.src;
      newScript.async = true;
      document.head.appendChild(newScript);
    };

    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        deferredScripts.forEach(script => loadScript(script as HTMLScriptElement));
      });
    } else {
      setTimeout(() => {
        deferredScripts.forEach(script => loadScript(script as HTMLScriptElement));
      }, 1000);
    }
  }, []);

  // Optimiser les animations avec Intersection Observer
  const optimizeAnimations = useCallback(() => {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    if ('IntersectionObserver' in window) {
      const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLElement;
            
            requestAnimationFrame(() => {
              element.classList.add('animate');
              element.style.transform = 'translateY(0)';
              element.style.opacity = '1';
            });
            
            animationObserver.unobserve(element);
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      });

      animatedElements.forEach(el => {
        const element = el as HTMLElement;
        element.style.transform = 'translateY(30px)';
        element.style.opacity = '0';
        element.style.transition = 'transform 0.6s ease, opacity 0.6s ease';
        animationObserver.observe(element);
      });
    }
  }, []);

  // Précharger les ressources critiques
  const preloadCriticalResources = useCallback(() => {
    const criticalImages = [
      '/images/hero-bg.webp',
      '/images/logo.webp'
    ];

    criticalImages.forEach(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    });
  }, []);

  // Optimiser le DOM
  const optimizeDOM = useCallback(() => {
    // Supprimer les éléments cachés du DOM temporairement
    const hiddenElements = document.querySelectorAll('[style*="display: none"]');
    hiddenElements.forEach(el => {
      const element = el as HTMLElement;
      element.style.display = 'none';
      element.style.visibility = 'hidden';
    });

    // Optimiser les conteneurs avec beaucoup d'éléments
    const largeContainers = document.querySelectorAll('.large-container');
    largeContainers.forEach(container => {
      (container as HTMLElement).style.contain = 'layout style paint';
    });
  }, []);

  useEffect(() => {
    // Attendre que la page soit chargée
    const initOptimizations = () => {
      // Optimisations immédiates
      preloadCriticalResources();
      
      // Optimisations différées
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          optimizeImages();
          optimizeAnimations();
          optimizeDOM();
          deferNonCriticalScripts();
        });
      } else {
        setTimeout(() => {
          optimizeImages();
          optimizeAnimations();
          optimizeDOM();
          deferNonCriticalScripts();
        }, 100);
      }
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initOptimizations);
    } else {
      initOptimizations();
    }

    return () => {
      document.removeEventListener('DOMContentLoaded', initOptimizations);
    };
  }, [optimizeImages, optimizeAnimations, optimizeDOM, deferNonCriticalScripts, preloadCriticalResources]);
};

// Hook pour optimiser spécifiquement les Core Web Vitals
export const useCoreWebVitals = () => {
  useEffect(() => {
    // Réduire le Cumulative Layout Shift (CLS)
    const reduceLayoutShift = () => {
      // Définir des dimensions pour tous les éléments média
      const mediaElements = document.querySelectorAll('img, video, iframe');
      
      mediaElements.forEach(element => {
        const mediaEl = element as HTMLElement;
        if (!mediaEl.style.width && !mediaEl.style.height) {
          // Dimensions par défaut pour éviter le layout shift
          mediaEl.style.minHeight = '200px';
          mediaEl.style.backgroundColor = '#f3f4f6';
        }
      });
    };

    // Améliorer le Largest Contentful Paint (LCP)
    const improveLCP = () => {
      // Identifier et optimiser l'élément LCP principal
      const heroElements = document.querySelectorAll('.hero, .carousel, .main-banner');
      
      heroElements.forEach(element => {
        const heroEl = element as HTMLElement;
        heroEl.style.contentVisibility = 'auto';
        heroEl.style.containIntrinsicSize = '1200px 400px';
      });
    };

    // Réduire le First Input Delay (FID)
    const reduceFID = () => {
      // Décomposer les tâches longues
      const heavyTasks = () => {
        // Simuler la décomposition de tâches lourdes
        if ('scheduler' in window && 'postTask' in (window as any).scheduler) {
          (window as any).scheduler.postTask(() => {
            // Tâches lourdes ici
          }, { priority: 'background' });
        }
      };

      if ('requestIdleCallback' in window) {
        requestIdleCallback(heavyTasks);
      } else {
        setTimeout(heavyTasks, 1000);
      }
    };

    reduceLayoutShift();
    improveLCP();
    reduceFID();
  }, []);
};
