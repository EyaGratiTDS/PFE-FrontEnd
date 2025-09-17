declare global {
  interface Window {
    // Meta Pixel (Facebook)
    fbq: any;
    _fbq?: any;
    
    // Google Analytics 4
    gtag: any;
    dataLayer: any;
    
    // Google Tag Manager
    google_tag_manager?: any;
    
    // LinkedIn Insight Tag
    _linkedin_partner_id?: string;
    _linkedin_data_partner_ids?: string[];
    
    // Pinterest Tag
    pintrk: any;
    
    // Twitter Pixel
    twq: any;
    
    // Quora Pixel
    qp: any;
    
    // Universal pixel managers
    __pixelInstances?: Map<string, Set<string>>;
  }
}

export interface PixelConfig {
  id: string;
  type: 'meta' | 'ga' | 'linkedin' | 'gtm' | 'pinterest' | 'twitter' | 'quora';
  pixelCode: string;
  isActive: boolean;
}

// Gestionnaire centralisé pour tous les types de pixels
class UniversalPixelManager {
  private static instance: UniversalPixelManager;
  private pixelInstances: Map<string, Set<string>> = new Map(); // type -> Set<pixelCode>
  private scriptsLoaded: Set<string> = new Set(); // types de scripts chargés

  static getInstance(): UniversalPixelManager {
    if (!UniversalPixelManager.instance) {
      UniversalPixelManager.instance = new UniversalPixelManager();
    }
    return UniversalPixelManager.instance;
  }

  // Meta Pixel (Facebook) implementation
  private async initMetaPixel(pixelCode: string): Promise<void> {
    if (!this.scriptsLoaded.has('meta')) {
      const fbq = function (...args: any[]) {
        if (fbq.callMethod) {
          fbq.callMethod.apply(fbq, args);
        } else {
          fbq.queue.push(args);
        }
      } as any;

      window.fbq = fbq;
      if (!window._fbq) window._fbq = fbq;
      fbq.push = fbq;
      fbq.loaded = true;
      fbq.version = '2.0';
      fbq.queue = [];

      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://connect.facebook.net/en_US/fbevents.js';
      document.head.appendChild(script);
      
      this.scriptsLoaded.add('meta');
    }

    window.fbq('init', pixelCode, { autoConfig: true, debug: false });
    window.fbq('track', 'PageView');
    
    // Ajouter noscript fallback
    this.addNoscriptFallback('meta', pixelCode);
  }

  // Google Analytics 4 implementation
  private async initGoogleAnalytics(pixelCode: string): Promise<void> {
    if (!this.scriptsLoaded.has('ga')) {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function() {
        window.dataLayer.push(arguments);
      };
      window.gtag('js', new Date());

      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${pixelCode}`;
      document.head.appendChild(script);
      
      this.scriptsLoaded.add('ga');
    }

    window.gtag('config', pixelCode, {
      page_title: document.title,
      page_location: window.location.href
    });
  }

  // Google Tag Manager implementation
  private async initGoogleTagManager(pixelCode: string): Promise<void> {
    if (!this.scriptsLoaded.has('gtm')) {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        'gtm.start': new Date().getTime(),
        event: 'gtm.js'
      });

      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtm.js?id=${pixelCode}`;
      document.head.appendChild(script);

      // Ajouter noscript GTM
      const noscript = document.createElement('noscript');
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.googletagmanager.com/ns.html?id=${pixelCode}`;
      iframe.height = '0';
      iframe.width = '0';
      iframe.style.display = 'none';
      iframe.style.visibility = 'hidden';
      noscript.appendChild(iframe);
      document.body.appendChild(noscript);
      
      this.scriptsLoaded.add('gtm');
    }

    // GTM est automatiquement configuré une fois le script chargé
  }

  // LinkedIn Insight Tag implementation
  private async initLinkedInPixel(pixelCode: string): Promise<void> {
    if (!this.scriptsLoaded.has('linkedin')) {
      window._linkedin_partner_id = pixelCode;
      window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
      window._linkedin_data_partner_ids.push(pixelCode);

      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.src = 'https://snap.licdn.com/li.lms-analytics/insight.min.js';
      document.head.appendChild(script);

      this.addNoscriptFallback('linkedin', pixelCode);
      this.scriptsLoaded.add('linkedin');
    }
  }

  // Pinterest Tag implementation
  private async initPinterestPixel(pixelCode: string): Promise<void> {
    if (!this.scriptsLoaded.has('pinterest')) {
      const pintrk = function() {
        pintrk.queue.push(Array.prototype.slice.call(arguments));
      } as any;
      pintrk.queue = [];
      pintrk.version = '3.0';
      window.pintrk = pintrk;

      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://s.pinimg.com/ct/core.js';
      document.head.appendChild(script);

      this.scriptsLoaded.add('pinterest');
    }

    window.pintrk('load', pixelCode, { em: '' });
    window.pintrk('page');
    
    this.addNoscriptFallback('pinterest', pixelCode);
  }

  // Twitter Pixel implementation
  private async initTwitterPixel(pixelCode: string): Promise<void> {
    if (!this.scriptsLoaded.has('twitter')) {
      const twq = function() {
        twq.exe ? twq.exe.apply(twq, arguments) : twq.queue.push(arguments);
      } as any;
      twq.version = '1.1';
      twq.queue = [];
      window.twq = twq;

      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://static.ads-twitter.com/uwt.js';
      document.head.appendChild(script);

      this.scriptsLoaded.add('twitter');
    }

    window.twq('init', pixelCode);
    window.twq('track', 'PageView');
  }

  // Quora Pixel implementation
  private async initQuoraPixel(pixelCode: string): Promise<void> {
    if (!this.scriptsLoaded.has('quora')) {
      const qp = function() {
        qp.qp ? qp.qp.apply(qp, arguments) : qp.queue.push(arguments);
      } as any;
      qp.queue = [];
      window.qp = qp;

      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://a.quora.com/qevents.js';
      document.head.appendChild(script);

      this.scriptsLoaded.add('quora');
    }

    window.qp('init', pixelCode);
    window.qp('track', 'ViewContent');
  }

  // Ajouter fallback noscript pour certains pixels
  private addNoscriptFallback(type: string, pixelCode: string): void {
    const noscriptId = `${type}-pixel-noscript-${pixelCode}`;
    
    // Supprimer l'ancien s'il existe
    const existing = document.getElementById(noscriptId);
    if (existing) existing.remove();

    const noscript = document.createElement('noscript');
    noscript.id = noscriptId;
    
    const img = document.createElement('img');
    img.height = 1;
    img.width = 1;
    img.style.display = 'none';
    
    switch (type) {
      case 'meta':
        img.src = `https://www.facebook.com/tr?id=${pixelCode}&ev=PageView&noscript=1`;
        break;
      case 'linkedin':
        img.src = `https://px.ads.linkedin.com/collect/?pid=${pixelCode}&fmt=gif`;
        break;
      case 'pinterest':
        img.src = `https://ct.pinterest.com/v3/?event=init&tid=${pixelCode}&noscript=1`;
        break;
    }
    
    if (img.src) {
      img.onerror = () => img.style.display = 'none';
      noscript.appendChild(img);
      document.body.appendChild(noscript);
    }
  }

  // Initialiser un pixel selon son type
  async initializePixel(config: PixelConfig): Promise<void> {
    if (!config.isActive || !config.pixelCode) return;

    try {
      // Enregistrer l'instance
      if (!this.pixelInstances.has(config.type)) {
        this.pixelInstances.set(config.type, new Set());
      }
      this.pixelInstances.get(config.type)!.add(config.pixelCode);

      // Initialiser selon le type
      switch (config.type) {
        case 'meta':
          await this.initMetaPixel(config.pixelCode);
          break;
        case 'ga':
          await this.initGoogleAnalytics(config.pixelCode);
          break;
        case 'gtm':
          await this.initGoogleTagManager(config.pixelCode);
          break;
        case 'linkedin':
          await this.initLinkedInPixel(config.pixelCode);
          break;
        case 'pinterest':
          await this.initPinterestPixel(config.pixelCode);
          break;
        case 'twitter':
          await this.initTwitterPixel(config.pixelCode);
          break;
        case 'quora':
          await this.initQuoraPixel(config.pixelCode);
          break;
        default:
          console.warn(`Unsupported pixel type: ${config.type}`);
      }

      console.log(`✅ ${config.type.toUpperCase()} Pixel initialized:`, config.pixelCode);
    } catch (error) {
      console.error(`❌ Error initializing ${config.type} pixel:`, error);
    }
  }

  // Nettoyer un pixel spécifique
  cleanupPixel(config: PixelConfig): void {
    const instances = this.pixelInstances.get(config.type);
    if (instances) {
      instances.delete(config.pixelCode);
    }

    // Supprimer les noscripts
    const noscriptId = `${config.type}-pixel-noscript-${config.pixelCode}`;
    const noscript = document.getElementById(noscriptId);
    if (noscript) noscript.remove();
  }

  // Nettoyer tous les pixels d'un type
  cleanupPixelType(type: string): void {
    this.pixelInstances.delete(type);
    
    // Supprimer tous les noscripts de ce type
    const noscripts = document.querySelectorAll(`[id^="${type}-pixel-noscript-"]`);
    noscripts.forEach(noscript => noscript.remove());
  }

  // Tracker un événement sur tous les pixels actifs
  trackEvent(eventName: string, eventData?: Record<string, any>): void {
    this.pixelInstances.forEach((codes, type) => {
      if (codes.size > 0) {
        try {
          switch (type) {
            case 'meta':
              if (window.fbq) {
                window.fbq('track', eventName, eventData);
              }
              break;
            case 'ga':
              if (window.gtag) {
                window.gtag('event', eventName, eventData);
              }
              break;
            case 'pinterest':
              if (window.pintrk) {
                window.pintrk('track', eventName, eventData);
              }
              break;
            case 'twitter':
              if (window.twq) {
                window.twq('track', eventName, eventData);
              }
              break;
            case 'quora':
              if (window.qp) {
                window.qp('track', eventName, eventData);
              }
              break;
          }
        } catch (error) {
          // Ignorer silencieusement les erreurs de tracking
          if (process.env.NODE_ENV !== 'production') {
            console.warn(`Error tracking ${type} pixel event:`, error);
          }
        }
      }
    });
  }

  // Obtenir les pixels actifs
  getActivePixels(): Record<string, string[]> {
    const result: Record<string, string[]> = {};
    this.pixelInstances.forEach((codes, type) => {
      result[type] = Array.from(codes);
    });
    return result;
  }

  // Diagnostic pour le débogage
  diagnose(): Record<string, any> {
    return {
      timestamp: new Date().toISOString(),
      environment: {
        isDevelopment: process.env.NODE_ENV !== 'production',
        hostname: window.location.hostname,
        port: window.location.port
      },
      scriptsLoaded: Array.from(this.scriptsLoaded),
      activePixels: this.getActivePixels(),
      globalObjects: {
        fbq: !!window.fbq,
        gtag: !!window.gtag,
        pintrk: !!window.pintrk,
        twq: !!window.twq,
        qp: !!window.qp
      }
    };
  }
}

// Exports pour utilisation dans les composants
export const pixelManager = UniversalPixelManager.getInstance();

export const initializeVCardPixels = async (pixels: PixelConfig[]): Promise<void> => {
  const activePixels = pixels.filter(p => p.isActive && p.pixelCode);
  
  console.log('🚀 Initializing VCard pixels:', activePixels.length);
  
  for (const pixel of activePixels) {
    await pixelManager.initializePixel(pixel);
  }
};

export const cleanupVCardPixels = (pixels: PixelConfig[]): void => {
  pixels.forEach(pixel => {
    pixelManager.cleanupPixel(pixel);
  });
};

export const trackVCardEvent = (eventName: string, eventData?: Record<string, any>): void => {
  pixelManager.trackEvent(eventName, eventData);
};

export const getActivePixelDiagnosis = (): Record<string, any> => {
  return pixelManager.diagnose();
};