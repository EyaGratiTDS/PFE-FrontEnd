// types/metaPixel.ts
declare global {
  interface Window {
    fbq: any;
  }
}

// Initialise Meta Pixel
export const initMetaPixel = (pixelId: string) => {
  if (!pixelId) return;

  // Eviter l'injection multiple du script
  if (!document.getElementById('meta-pixel-script')) {
    const script = document.createElement('script');
    script.id = 'meta-pixel-script';
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    script.onload = () => {
      if (window.fbq) return;
      window.fbq = function () {
        (window.fbq!.callMethod
          ? window.fbq!.callMethod
          : window.fbq!.queue.push
        ).apply(window.fbq, arguments);
      };
      window.fbq.queue = [];
      window.fbq.loaded = true;
      window.fbq.version = '2.0';

      window.fbq('init', pixelId);
      window.fbq('track', 'PageView');
    };
    document.head.appendChild(script);
  }

  // Ajouter le noscript si nécessaire
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

// Tracker un événement Meta
export const trackMetaEvent = (
  eventName: string,
  eventData?: Record<string, any>
) => {
  if (typeof window !== 'undefined' && window.fbq) {
    // trackCustom pour les événements personnalisés
    window.fbq('trackCustom', eventName, eventData);
  }
};

// Mapper vos événements internes vers Meta Pixel
export const mapToMetaEvent = (eventType: string) => {
  const mapping: Record<string, string> = {
    view: 'ViewContent',
    click: 'CustomizeProduct',
    download: 'Lead',
    share: 'Share',
    heartbeat: 'Heartbeat',
    mouse_move: 'MouseMovement',
    scroll: 'Scroll',
    hover: 'Hover',
    suspicious_activity: 'SuspiciousActivity',
    preference_updated: 'PreferenceUpdated',
    attention_event: 'AttentionEvent',
  };
  return mapping[eventType] || 'CustomEvent';
};
