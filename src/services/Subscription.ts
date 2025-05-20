export interface Subscription {
    id: number;
    user_id: number;
    plan_id: number;
    start_date: string;
    end_date: string;
    status: 'active' | 'expired' | 'canceled' | 'pending';
    payment_method?: string;
    transaction_id?: string;
  }