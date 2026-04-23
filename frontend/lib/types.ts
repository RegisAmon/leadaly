export interface Workspace {
  id: string;
  name: string;
  slug: string;
  plan: string;
  credits_remaining: number;
  credits_total: number;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
}
