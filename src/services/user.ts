export interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    password?: string;
    role?: 'user' | 'admin' | 'superAdmin';
    isVerified?: boolean;
    created_at: string;
    updated_at: string;
  }