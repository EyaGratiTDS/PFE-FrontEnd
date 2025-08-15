import { useEffect, useRef } from 'react';

export const useOptimizedAnimations = () => {
  const animationsRef = useRef<Set<() => void>>(new Set());

  useEffect(() => {
    // Utiliser requestIdleCallback pour reporter les animations non-critiques
    const scheduleAnimations = () => {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          animationsRef.current.forEach(animation => animation());
        });
      } else {
        // Fallback pour les navigateurs qui ne supportent pas requestIdleCallback
        setTimeout(() => {
          animationsRef.current.forEach(animation => animation());
        }, 100);
      }
    };

    // Attendre que le DOM soit complètement chargé
    if (document.readyState === 'complete') {
      scheduleAnimations();
    } else {
      window.addEventListener('load', scheduleAnimations);
      return () => window.removeEventListener('load', scheduleAnimations);
    }
  }, []);

  const addAnimation = (animation: () => void) => {
    animationsRef.current.add(animation);
  };

  const removeAnimation = (animation: () => void) => {
    animationsRef.current.delete(animation);
  };

  return { addAnimation, removeAnimation };
};

// Hook pour les animations avec Intersection Observer
export const useInViewAnimation = (callback: () => void, options?: IntersectionObserverInit) => {
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Utiliser requestAnimationFrame pour optimiser l'animation
          requestAnimationFrame(callback);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '20px',
        ...options
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [callback, options]);

  return elementRef;
};
