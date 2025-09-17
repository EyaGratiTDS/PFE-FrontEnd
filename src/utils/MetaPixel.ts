

declare global {
  interface Window {
    fbq: any;
    _fbq?: any;
    __metaPixelInstances?: Set<string>; // Tracker les instances actives
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

// Gestionnaire d'instances pour usage multi-pages
class MetaPixelManager {
  private static instance: MetaPixelManager;
  private pixelInstances: Map<string, boolean> = new Map();
  private scriptLoaded: boolean = false;

  static getInstance(): MetaPixelManager {
    if (!MetaPixelManager.instance) {
      MetaPixelManager.instance = new MetaPixelManager();
    }
    return MetaPixelManager.instance;
  }

  isPixelInitialized(pixelId: string): boolean {
    return this.pixelInstances.get(pixelId) || false;
  }

  setPixelInitialized(pixelId: string, status: boolean): void {
    this.pixelInstances.set(pixelId, status);
  }

  removePixel(pixelId: string): void {
    this.pixelInstances.delete(pixelId);
  }

  isScriptLoaded(): boolean {
    return this.scriptLoaded;
  }

  setScriptLoaded(status: boolean): void {
    this.scriptLoaded = status;
  }

  getActivePixels(): string[] {
    return Array.from(this.pixelInstances.keys()).filter(pixelId => 
      this.pixelInstances.get(pixelId)
    );
  }
}

const pixelManager = MetaPixelManager.getInstance();

// Fonction pour charger le script Meta Pixel (une seule fois)
const loadMetaPixelScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Si le script est déjà chargé
    if (pixelManager.isScriptLoaded() && window.fbq) {
      resolve();
      return;
    }

    // Si fbq existe déjà (script déjà injecté par autre moyen)
    if (window.fbq) {
      pixelManager.setScriptLoaded(true);
      resolve();
      return;
    }

    try {
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
      script.id = 'meta-pixel-script';
      
      script.onload = () => {
        pixelManager.setScriptLoaded(true);
        resolve();
      };
      
      script.onerror = () => {
        reject(new Error('Failed to load Meta Pixel script'));
      };

      // Injection dans le head
      document.head.appendChild(script);

    } catch (error) {
      console.error('Error loading Meta Pixel script:', error);
      reject(error);
    }
  });
};

// Fonction principale pour initialiser un pixel sur une page spécifique
export const initMetaPixel = async (pixelId: string): Promise<void> => {
  if (!pixelId) {
    throw new Error('Pixel ID is required');
  }

  try {
    // Charger le script si nécessaire
    await loadMetaPixelScript();

    // Initialiser le pixel spécifique
    window.fbq('init', pixelId, {
      autoConfig: true,
      debug: false
    });

    // Marquer ce pixel comme initialisé
    pixelManager.setPixelInitialized(pixelId, true);

    // Track PageView pour ce pixel
    window.fbq('track', 'PageView');

    // Ajouter le fallback noscript
    addNoscriptFallback(pixelId);

  } catch (error) {
    console.error('Error initializing Meta Pixel:', error);
    throw error;
  }
};

// Fonction pour nettoyer un pixel spécifique (à appeler lors du démontage du composant)
export const cleanupMetaPixel = (pixelId: string): void => {
  if (!pixelId) return;

  // Retirer ce pixel de la liste des pixels actifs
  pixelManager.removePixel(pixelId);

  // Supprimer le noscript spécifique à ce pixel
  const noscriptId = `meta-pixel-noscript-${pixelId}`;
  const existingNoscript = document.getElementById(noscriptId);
  if (existingNoscript) {
    existingNoscript.remove();
  }
};

// Fonction pour ajouter le fallback noscript spécifique à un pixel
const addNoscriptFallback = (pixelId: string): void => {
  const noscriptId = `meta-pixel-noscript-${pixelId}`;
  
  // Supprimer l'ancien noscript s'il existe
  const existingNoscript = document.getElementById(noscriptId);
  if (existingNoscript) {
    existingNoscript.remove();
  }

  // Créer le nouveau noscript
  const noscript = document.createElement('noscript');
  noscript.id = noscriptId;
  
  const img = document.createElement('img');
  img.height = 1;
  img.width = 1;
  img.style.display = 'none';
  img.src = `https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`;
  
  // Gestion d'erreur pour l'image
  img.onerror = () => {
    // Ignorer silencieusement les erreurs d'image (normal en dev)
    img.style.display = 'none';
  };
  
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
export const trackMetaEvent = (eventName: string, eventData?: Record<string, any>): void => {
  if (typeof window === 'undefined') {
    console.warn('Meta Pixel: Window object not available');
    return;
  }

  if (!window.fbq || typeof window.fbq !== 'function') {
    console.warn('Meta Pixel: fbq function not available');
    return;
  }

  if (!pixelManager.isScriptLoaded()) {
    console.warn('Meta Pixel: Script not loaded yet');
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

    // Ajouter un petit délai pour éviter les erreurs de timing
    setTimeout(() => {
      try {
        if (cleanedEventData && Object.keys(cleanedEventData).length > 0) {
          window.fbq('track', eventName, cleanedEventData);
        } else {
          window.fbq('track', eventName);
        }
      } catch (error) {
        // Ignorer silencieusement les erreurs de tracking
        if (process.env.NODE_ENV !== 'production') {
          console.warn('Meta Pixel tracking error:', error);
        }
      }
    }, 50);

  } catch (error) {
    console.error('Error tracking Meta Pixel event:', error);
  }
};

// Track custom Meta Pixel events
export const trackCustomMetaEvent = (eventName: string, eventData?: Record<string, any>): void => {
  if (typeof window === 'undefined') {
    console.warn('Meta Pixel: Window object not available');
    return;
  }

  if (!window.fbq || typeof window.fbq !== 'function') {
    console.warn('Meta Pixel: fbq function not available');
    return;
  }

  if (!pixelManager.isScriptLoaded()) {
    console.warn('Meta Pixel: Script not loaded yet');
    return;
  }

  try {
    const cleanedEventData = eventData ? {
      ...eventData,
      ...Object.fromEntries(
        Object.entries(eventData).filter(([_, value]) => value !== undefined && value !== null)
      )
    } : undefined;

    setTimeout(() => {
      try {
        if (cleanedEventData && Object.keys(cleanedEventData).length > 0) {
          window.fbq('trackCustom', eventName, cleanedEventData);
          console.log(`Custom Meta Pixel event tracked: ${eventName}`, cleanedEventData);
        } else {
          window.fbq('trackCustom', eventName);
          console.log(`Custom Meta Pixel event tracked: ${eventName}`);
        }
      } catch (error) {
        // Ignorer silencieusement les erreurs de tracking
        if (process.env.NODE_ENV !== 'production') {
          console.warn('Custom Meta Pixel tracking error:', error);
        }
      }
    }, 50);

  } catch (error) {
    console.error('Error tracking custom Meta Pixel event:', error);
  }
};

// Fonction pour vérifier si un pixel spécifique est correctement chargé
export const isPixelLoaded = (pixelId?: string): boolean => {
  const scriptLoaded = pixelManager.isScriptLoaded() && window.fbq && typeof window.fbq === 'function';
  
  if (pixelId) {
    return scriptLoaded && pixelManager.isPixelInitialized(pixelId);
  }
  
  return scriptLoaded;
};

// Fonction pour obtenir les IDs des pixels actifs
export const getActivePixelIds = (): string[] => {
  return pixelManager.getActivePixels();
};

// Fonction de diagnostic pour déboguer les problèmes Meta Pixel
export const diagnoseMetaPixel = (): Record<string, any> => {
  const isDev = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.includes('localhost') ||
    window.location.port === '3000' ||
    window.location.port === '5173'
  );

  const diagnosis = {
    timestamp: new Date().toISOString(),
    environment: {
      isDevelopment: isDev,
      hostname: typeof window !== 'undefined' ? window.location.hostname : 'N/A',
      port: typeof window !== 'undefined' ? window.location.port : 'N/A',
      protocol: typeof window !== 'undefined' ? window.location.protocol : 'N/A',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A'
    },
    pixel: {
      scriptLoaded: pixelManager.isScriptLoaded(),
      activePixels: pixelManager.getActivePixels(),
      fbqAvailable: typeof window !== 'undefined' && !!window.fbq,
      fbqType: typeof window !== 'undefined' && window.fbq ? typeof window.fbq : 'undefined'
    },
    dom: {
      scriptExists: !!document.querySelector('#meta-pixel-script'),
      bodyExists: !!document.body,
      headExists: !!document.head,
      noscriptCount: document.querySelectorAll('[id^="meta-pixel-noscript-"]').length
    },
    networkErrors: {
      expectedInDevelopment: isDev,
      commonErrors: [
        'ERR_CONNECTION_RESET: Normal en développement et avec bloqueurs de pub',
        '404 Not Found: Facebook bloque les requêtes localhost',
        'CORS errors: Attendu sans domaine vérifié sur Facebook Business',
        'capig.datah04.com: Serveur Meta Pixel, erreurs normales en dev'
      ]
    }
  };

  console.group('Meta Pixel Diagnosis');
  console.log('Environment:', diagnosis.environment);
  console.log('Pixel Status:', diagnosis.pixel);
  console.log('DOM Status:', diagnosis.dom);
  console.log('Network Errors Info:', diagnosis.networkErrors);
  
  if (diagnosis.environment.isDevelopment) {
    console.warn('En développement: Les erreurs réseau Meta Pixel sont NORMALES');
    console.info('Le pixel fonctionne correctement - les erreurs 404/CORS sont attendues');
  }
  
  console.groupEnd();

  return diagnosis;
};