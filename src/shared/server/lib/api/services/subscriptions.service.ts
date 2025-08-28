import type { SupabaseClient } from '@supabase/supabase-js';
import { API_CONFIG } from '@/shared/common/config';
import { safeSentry } from '@/shared/common/lib/sentry';
import type { Database } from '@/shared/common/types/supabase';

type Subscription = Database['public']['Tables']['subscriptions']['Row'];
type SubscriptionUpdate =
  Database['public']['Tables']['subscriptions']['Update'];

import type { SubscriptionsServiceOptions } from '@/shared/common/types';

export class SubscriptionsService {
  constructor(private supabase: SupabaseClient<Database>) {}

  async createSubscription(
    data: {
      userId: string;
      stripeCustomerId: string;
      stripeSubscriptionId: string;
    },
    options: SubscriptionsServiceOptions = {}
  ): Promise<Subscription> {
    const { span, operation = 'create_subscription' } = options;

    span?.setAttribute('subscription.user_id', data.userId);
    span?.setAttribute(
      'subscription.stripe_customer_id',
      data.stripeCustomerId
    );
    span?.setAttribute(
      'subscription.stripe_subscription_id',
      data.stripeSubscriptionId
    );

    const { data: subscription, error } = await this.supabase
      .from('subscriptions')
      .insert({
        user_id: data.userId,
        stripe_customer_id: data.stripeCustomerId,
        stripe_subscription_id: data.stripeSubscriptionId,
      })
      .select()
      .single();

    if (error) {
      safeSentry.captureException(error, {
        tags: { operation },
        extra: {
          userId: data.userId,
          stripeCustomerId: data.stripeCustomerId,
          stripeSubscriptionId: data.stripeSubscriptionId,
        },
      });
      throw error;
    }

    span?.setAttribute('subscription.id', subscription.id);
    return subscription;
  }

  async getSubscriptionByCustomerId(
    stripeCustomerId: string,
    options: SubscriptionsServiceOptions = {}
  ): Promise<Subscription | null> {
    const { span, operation = 'get_subscription_by_customer_id' } = options;

    span?.setAttribute('subscription.stripe_customer_id', stripeCustomerId);

    const { data: subscription, error } = await this.supabase
      .from('subscriptions')
      .select('*')
      .eq('stripe_customer_id', stripeCustomerId)
      .single();

    if (error && error.code !== 'PGRST116') {
      safeSentry.captureException(error, {
        tags: { operation },
        extra: { stripeCustomerId },
      });
      throw error;
    }

    return subscription;
  }

  async getSubscriptionBySubscriptionId(
    stripeSubscriptionId: string,
    options: SubscriptionsServiceOptions = {}
  ): Promise<Subscription | null> {
    const { span, operation = 'get_subscription_by_subscription_id' } = options;

    span?.setAttribute(
      'subscription.stripe_subscription_id',
      stripeSubscriptionId
    );

    const { data: subscription, error } = await this.supabase
      .from('subscriptions')
      .select('*')
      .eq('stripe_subscription_id', stripeSubscriptionId)
      .single();

    if (error && error.code !== 'PGRST116') {
      safeSentry.captureException(error, {
        tags: { operation },
        extra: { stripeSubscriptionId },
      });
      throw error;
    }

    return subscription;
  }

  async getUserSubscriptions(
    userId: string,
    options: SubscriptionsServiceOptions = {}
  ): Promise<Subscription[]> {
    const { span, operation = 'get_user_subscriptions' } = options;

    span?.setAttribute('subscription.user_id', userId);

    const { data: subscriptions, error } = await this.supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      safeSentry.captureException(error, {
        tags: { operation },
        extra: { userId },
      });
      throw error;
    }

    span?.setAttribute('subscriptions.count', subscriptions.length);
    return subscriptions;
  }

  async updateSubscription(
    id: string,
    data: Partial<SubscriptionUpdate>,
    options: SubscriptionsServiceOptions = {}
  ): Promise<Subscription> {
    const { span, operation = 'update_subscription' } = options;

    span?.setAttribute('subscription.id', id);

    const { data: subscription, error } = await this.supabase
      .from('subscriptions')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      safeSentry.captureException(error, {
        tags: { operation },
        extra: { id, updateData: data },
      });
      throw error;
    }

    return subscription;
  }

  async deleteSubscription(
    id: string,
    options: SubscriptionsServiceOptions = {}
  ): Promise<void> {
    const { span, operation = 'delete_subscription' } = options;

    span?.setAttribute('subscription.id', id);

    const { error } = await this.supabase
      .from('subscriptions')
      .delete()
      .eq('id', id);

    if (error) {
      safeSentry.captureException(error, {
        tags: { operation },
        extra: { id },
      });
      throw error;
    }
  }
}
