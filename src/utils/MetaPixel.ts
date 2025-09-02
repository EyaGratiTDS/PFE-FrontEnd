// MetaPixel.ts - Version corrigée

declare global {
  interface Window {
    fbq: any;
    _fbq?: any;
  }
}

interface FbqFunction {
  (...args: any[]): void;
  callMethod?: (...args: any[]) => void;
  queue: any[];
  push: any;
  loaded: boolean;
  version: string;
}

// Variable pour éviter les initialisations multiples
let isMetaPixelInitialized = false;
let currentPixelId: string | null = null;

export const initMetaPixel = (pixelId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!pixelId) {
      reject(new Error('Pixel ID is required'));
      return;
    }

    // Si le même pixel est déjà initialisé, ne pas réinitialiser
    if (isMetaPixelInitialized && currentPixelId === pixelId) {
      console.log('Meta Pixel already initialized for this ID:', pixelId);
      resolve();
      return;
    }

    try {
      // Injection du script Meta Pixel
      if (!window.fbq) {
        // Création de la fonction fbq
        const fbq: FbqFunction = function (...args: any[]) {
          if (fbq.callMethod) {
            fbq.callMethod.apply(fbq, args);
          } else {
            fbq.queue.push(args);
          }
        } as FbqFunction;

        // Configuration de fbq
        window.fbq = fbq;
        if (!window._fbq) window._fbq = fbq;
        fbq.push = fbq;
        fbq.loaded = true;
        fbq.version = '2.0';
        fbq.queue = [];

        // Création et injection du script
        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://connect.facebook.net/en_US/fbevents.js';
        
        // Gestionnaires d'événements pour le script
        script.onload = () => {
          console.log('Meta Pixel script loaded successfully');
          initializePixel();
        };
        
        script.onerror = () => {
          console.error('Failed to load Meta Pixel script');
          reject(new Error('Failed to load Meta Pixel script'));
        };

        // Injection dans le head
        const firstScript = document.getElementsByTagName('script')[0];
        if (firstScript && firstScript.parentNode) {
          firstScript.parentNode.insertBefore(script, firstScript);
        } else {
          document.head.appendChild(script);
        }
      } else {
        // fbq existe déjà, initialiser directement
        initializePixel();
      }

      function initializePixel() {
        try {
          // Initialisation du pixel
          window.fbq('init', pixelId);
          
          // Track PageView
          window.fbq('track', 'PageView');
          
          // Ajouter le fallback noscript
          addNoscriptFallback(pixelId);
          
          // Marquer comme initialisé
          isMetaPixelInitialized = true;
          currentPixelId = pixelId;
          
          console.log('Meta Pixel initialized successfully:', pixelId);
          
          // Vérifier que le pixel fonctionne
          setTimeout(() => {
            if (window.fbq && typeof window.fbq === 'function') {
              console.log('Meta Pixel verification: OK');
              resolve();
            } else {
              reject(new Error('Meta Pixel verification failed'));
            }
          }, 100);
          
        } catch (error) {
          console.error('Error initializing Meta Pixel:', error);
          reject(error);
        }
      }

    } catch (error) {
      console.error('Error in Meta Pixel setup:', error);
      reject(error);
    }
  });
};

// Fonction pour ajouter le fallback noscript
const addNoscriptFallback = (pixelId: string) => {
  // Supprimer l'ancien noscript s'il existe
  const existingNoscript = document.getElementById('meta-pixel-noscript');
  if (existingNoscript) {
    existingNoscript.remove();
  }

  // Créer le nouveau noscript
  const noscript = document.createElement('noscript');
  noscript.id = 'meta-pixel-noscript';
  
  const img = document.createElement('img');
  img.height = 1;
  img.width = 1;
  img.style.display = 'none';
  img.src = `https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`;
  
  noscript.appendChild(img);
  document.body.appendChild(noscript);
};

// Map custom events to Meta Pixel standard events
export const mapToMetaEvent = (eventType: string): string => {
  const eventMap: Record<string, string> = {
    'view': 'ViewContent',
    'click': 'Lead',
    'contact': 'Contact',
    'download': 'Download',
    'phone': 'Contact',
    'email': 'Contact',
    'social': 'Share',
    'visit': 'ViewContent',
    'engagement': 'Lead',
    'share': 'Share',
    'hover': 'Lead'
  };

  return eventMap[eventType] || 'Lead';
};

// Track Meta Pixel events avec vérification renforcée
export const trackMetaEvent = (eventName: string, eventData?: Record<string, any>) => {
  if (typeof window === 'undefined') {
    console.warn('Meta Pixel: Window object not available');
    return;
  }

  if (!window.fbq || typeof window.fbq !== 'function') {
    console.warn('Meta Pixel: fbq function not available');
    return;
  }

  if (!isMetaPixelInitialized) {
    console.warn('Meta Pixel: Pixel not initialized yet');
    return;
  }

  try {
    // Nettoyer les données d'événement
    const cleanedEventData = eventData ? {
      ...eventData,
      // Supprimer les propriétés undefined ou null
      ...Object.fromEntries(
        Object.entries(eventData).filter(([_, value]) => value !== undefined && value !== null)
      )
    } : undefined;

    if (cleanedEventData && Object.keys(cleanedEventData).length > 0) {
      window.fbq('track', eventName, cleanedEventData);
      console.log(`Meta Pixel event tracked: ${eventName}`, cleanedEventData);
    } else {
      window.fbq('track', eventName);
      console.log(`Meta Pixel event tracked: ${eventName}`);
    }
  } catch (error) {
    console.error('Error tracking Meta Pixel event:', error);
  }
};

// Track custom Meta Pixel events
export const trackCustomMetaEvent = (eventName: string, eventData?: Record<string, any>) => {
  if (typeof window === 'undefined') {
    console.warn('Meta Pixel: Window object not available');
    return;
  }

  if (!window.fbq || typeof window.fbq !== 'function') {
    console.warn('Meta Pixel: fbq function not available');
    return;
  }

  if (!isMetaPixelInitialized) {
    console.warn('Meta Pixel: Pixel not initialized yet');
    return;
  }

  try {
    const cleanedEventData = eventData ? {
      ...eventData,
      ...Object.fromEntries(
        Object.entries(eventData).filter(([_, value]) => value !== undefined && value !== null)
      )
    } : undefined;

    if (cleanedEventData && Object.keys(cleanedEventData).length > 0) {
      window.fbq('trackCustom', eventName, cleanedEventData);
      console.log(`Custom Meta Pixel event tracked: ${eventName}`, cleanedEventData);
    } else {
      window.fbq('trackCustom', eventName);
      console.log(`Custom Meta Pixel event tracked: ${eventName}`);
    }
  } catch (error) {
    console.error('Error tracking custom Meta Pixel event:', error);
  }
};

// Fonction pour vérifier si le pixel est correctement chargé
export const isPixelLoaded = (): boolean => {
  return !!(window.fbq && typeof window.fbq === 'function' && isMetaPixelInitialized);
};

// Fonction pour obtenir l'ID du pixel actuel
export const getCurrentPixelId = (): string | null => {
  return currentPixelId;
};

// Fonction pour réinitialiser le pixel (utile pour les tests)
export const resetPixel = () => {
  isMetaPixelInitialized = false;
  currentPixelId = null;
  
  // Supprimer le script existant
  const existingScript = document.querySelector('script[src*="fbevents.js"]');
  if (existingScript) {
    existingScript.remove();
  }
  
  // Supprimer le noscript
  const existingNoscript = document.getElementById('meta-pixel-noscript');
  if (existingNoscript) {
    existingNoscript.remove();
  }
  
  // Supprimer fbq de window
  if (window.fbq) {
    delete window.fbq;
  }
  if (window._fbq) {
    delete window._fbq;
  }
};