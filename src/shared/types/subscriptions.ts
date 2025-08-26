import type { Tables } from './supabase';

export type Subscription = Tables<'subscriptions'>;
export type SubscriptionInsert = Tables<'subscriptions'>;
export type SubscriptionUpdate = Tables<'subscriptions'>;

export type UserSubscription = {
  isActive: boolean;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
};
