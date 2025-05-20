export interface ApiKey {
    id: number;
    name: string;
    prefix: string;
    scopes: string[];
    expiresAt: string | null;
    isActive: boolean;
    lastUsedAt: string | null;
    created_at: string;
    isDisabled: boolean; 
  }