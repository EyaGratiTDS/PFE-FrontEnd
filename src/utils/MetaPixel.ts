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

export const initMetaPixel = (pixelId: string) => {
  if (!pixelId) return;

  // Ne pas injecter deux fois
  if (!window.fbq) {
    (function (f: any, b: Document, e: string, v: string) {
      if (f.fbq) return;
      
      const n: FbqFunction = function (...args: any[]) {
        if (n.callMethod) {
          n.callMethod.apply(n, args);
        } else {
          n.queue.push(args);
        }
      } as FbqFunction;
      
      f.fbq = n;
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = '2.0';
      n.queue = [];
      
      const t = b.createElement(e) as HTMLScriptElement;
      t.async = true;
      t.src = v;
      
      const s = b.getElementsByTagName(e)[0];
      if (s && s.parentNode) {
        s.parentNode.insertBefore(t, s);
      }
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
  }

  // Init Pixel et PageView
  window.fbq('init', pixelId);
  window.fbq('track', 'PageView');

  // Ajouter <noscript> fallback
  if (!document.getElementById('meta-pixel-noscript')) {
    const noscript = document.createElement('noscript');
    noscript.id = 'meta-pixel-noscript';
    const img = document.createElement('img');
    img.height = 1;
    img.width = 1;
    img.style.display = 'none';
    img.src = `https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`;
    noscript.appendChild(img);
    document.body.appendChild(noscript);
  }
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
    'engagement': 'Lead'
  };
  
  return eventMap[eventType] || 'CustomEvent';
};

// Track Meta Pixel events
export const trackMetaEvent = (eventName: string, eventData?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.fbq) {
    try {
      if (eventData) {
        window.fbq('track', eventName, eventData);
      } else {
        window.fbq('track', eventName);
      }
      console.log(`Meta Pixel event tracked: ${eventName}`, eventData);
    } catch (error) {
      console.error('Error tracking Meta Pixel event:', error);
    }
  }
};

// Track custom Meta Pixel events
export const trackCustomMetaEvent = (eventName: string, eventData?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.fbq) {
    try {
      if (eventData) {
        window.fbq('trackCustom', eventName, eventData);
      } else {
        window.fbq('trackCustom', eventName);
      }
      console.log(`Custom Meta Pixel event tracked: ${eventName}`, eventData);
    } catch (error) {
      console.error('Error tracking custom Meta Pixel event:', error);
    }
  }
};
