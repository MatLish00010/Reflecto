import type { Span } from '@sentry/types';
import type { SupabaseClient } from '@supabase/supabase-js';
import { safeSentry } from '@/shared/lib/sentry';
import type { Database } from '@/shared/types/supabase';

type Subscription = Database['public']['Tables']['subscriptions']['Row'];
type SubscriptionUpdate =
  Database['public']['Tables']['subscriptions']['Update'];

export interface SubscriptionsServiceOptions {
  span?: Span;
  operation?: string;
}

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

export const subscriptionsClientService = {
  async getUserSubscriptions(): Promise<{
    success: boolean;
    subscriptions: Database['public']['Tables']['subscriptions']['Row'][];
  }> {
    return safeSentry.startSpan(
      {
        op: 'http.client',
        name: 'GET /api/subscriptions',
      },
      async span => {
        const response = await fetch('/api/subscriptions');
        const data = await response.json();

        span.setAttribute('http.status_code', response.status);
        span.setAttribute('http.url', '/api/subscriptions');

        if (!response.ok) {
          span.setAttribute('error', true);
          throw new Error(data.error || 'Failed to fetch user subscriptions');
        }

        span.setAttribute(
          'subscriptions.count',
          data.subscriptions?.length || 0
        );
        return data;
      }
    );
  },

  async checkUserSubscription(): Promise<boolean> {
    return safeSentry.startSpan(
      {
        op: 'subscription.check',
        name: 'Check User Subscription',
      },
      async span => {
        try {
          const { subscriptions } = await this.getUserSubscriptions();
          const hasSubscription = subscriptions.length > 0;

          span.setAttribute('subscription.has_subscription', hasSubscription);
          span.setAttribute('subscription.count', subscriptions.length);

          return hasSubscription;
        } catch (error) {
          span.setAttribute('error', true);
          safeSentry.captureException(error as Error, {
            tags: { operation: 'check_user_subscription' },
          });
          return false;
        }
      }
    );
  },
};
