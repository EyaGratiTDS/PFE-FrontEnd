import { Plan } from "./Plan";

export interface ActiveSubscription {
  id: number;
  start_date: string;
  end_date: string;
  status: string;
  plan: Plan;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: 'user' | 'admin' | 'superAdmin';
  isVerified?: boolean;
  isActive?: boolean;
  createdAt: string;
  updated_at: string;
  activeSubscription?: ActiveSubscription | null;
}