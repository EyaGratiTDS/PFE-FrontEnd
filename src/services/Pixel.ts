export interface Pixel {
  id: string; // UUID
  name: string;
  type?: 'meta' | 'ga' | 'linkedin' | 'gtm' | 'pinterest' | 'twitter' | 'quora' | null;
  vcardId: number;
  pixelCode?: string | null; // Stocker l'ID ou le code du pixel (ex: G-XXXX, fbq id, GTM-XXXX)
  is_active: boolean;
  is_blocked: boolean;
  created_at: string;
  
  // Champs optionnels pour compatibilité avec l'ancien code
  trackingUrl?: string;
  metaPixelId?: string | null; // Déprecié, utiliser pixelCode à la place
  isDisabled?: boolean;
  
  // Relation avec vCard
  vcard?: {
    id: number;
    name: string;
    url?: string;
    user?: {
      id: number;
      name: string;
      email: string;
    };
  };
}

export interface EventTracking {
  id: string; 
  eventType: 'view' | 'click' | 'download' | 'share' | 'heartbeat' | 
            'mouse_move' | 'scroll' | 'hover' | 'suspicious_activity' | 
            'preference_updated' | 'attention_event';
  metadata: Record<string, unknown> | null;
  userAgent: string | null;
  ipAddress: string | null;
  country: string | null;
  region: string | null;
  blockId: number | null;
  city: string | null;
  deviceType: string | null;
  os: string | null;
  browser: string | null;
  language: string | null;
  pixelId: string;
  created_at: string;
  updated_at: string;
  source?: 'meta_pixel' | 'internal_tracking' | 'google_analytics';
}

export interface PixelEventParams {
  eventType?: string;
  blockId?: string;
  duration?: number;
  metadata?: object;
  value?: number;
  currency?: string;
}