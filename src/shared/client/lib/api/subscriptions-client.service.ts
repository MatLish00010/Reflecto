import { API_CONFIG } from '@/shared/common/config';
import { safeSentry } from '@/shared/common/lib/sentry';
import type { Database } from '@/shared/common/types/supabase';

export const subscriptionsClientService = {
  async getUserSubscriptions(): Promise<{
    success: boolean;
    subscriptions: Database['public']['Tables']['subscriptions']['Row'][];
  }> {
    return safeSentry.startSpan(
      {
        op: 'http.client',
        name: `GET ${API_CONFIG.ENDPOINTS.SUBSCRIPTIONS}`,
      },
      async span => {
        const response = await fetch(API_CONFIG.ENDPOINTS.SUBSCRIPTIONS);
        const data = await response.json();

        span.setAttribute('http.status_code', response.status);
        span.setAttribute('http.url', API_CONFIG.ENDPOINTS.SUBSCRIPTIONS);

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
