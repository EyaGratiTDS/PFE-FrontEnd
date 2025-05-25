export interface Pixel {
  id: string; 
  name: string;
  is_active: boolean;
  created_at: string;
  isDisabled?: boolean; 
  vcard?: {
    id: string;
    name: string;
  };
}

export interface EventTracking {
  id: string; 
  eventType: 'view' | 'click' | 'download' | 'share' | 'heartbeat' | 
            'mouse_move' | 'scroll' | 'hover' | 'suspicious_activity' | 
            'preference_updated' | 'attention_event';
  metadata: Record<string, unknown> | null;
  duration: number | null;
  userAgent: string | null;
  ipAddress: string | null;
  country: string | null;
  region: string | null;
  blockId: number | null;
  city: string | null;
  pixelId: string;
  created_at: string;
  updated_at: string;
}