import { NextRequest } from 'next/server';
import {
  handleApiRequest,
  type ApiContext,
  withRateLimit,
  RATE_LIMIT_CONFIGS,
  withValidation,
} from '@/shared/lib/api';
import { z } from 'zod';
import { ServiceFactory } from '@/shared/lib/api/utils/service-factory';

const createSubscriptionSchema = z.object({
  stripeCustomerId: z.string().min(1, 'Stripe customer ID is required'),
  stripeSubscriptionId: z.string().min(1, 'Stripe subscription ID is required'),
});

export async function POST(request: NextRequest) {
  return withRateLimit(RATE_LIMIT_CONFIGS.standard)(handleApiRequest)(
    request,
    { operation: 'create_subscription' },
    withValidation(createSubscriptionSchema, { validateBody: true })(
      async (context: ApiContext, request: NextRequest, validatedData) => {
        context.span.setAttribute(
          'stripe.customer_id',
          validatedData.stripeCustomerId
        );
        context.span.setAttribute(
          'stripe.subscription_id',
          validatedData.stripeSubscriptionId
        );

        const subscriptionsService = ServiceFactory.createSubscriptionsService(
          context.supabase
        );

        // Check if subscription already exists
        const existingSubscription =
          await subscriptionsService.getSubscriptionByCustomerId(
            validatedData.stripeCustomerId,
            { span: context.span, operation: 'check_existing_subscription' }
          );

        if (existingSubscription) {
          context.span.setAttribute('subscription.exists', true);
          return {
            success: true,
            subscription: existingSubscription,
            message: 'Subscription already exists',
          };
        }

        // Create new subscription
        const subscription = await subscriptionsService.createSubscription(
          {
            userId: context.user.id,
            stripeCustomerId: validatedData.stripeCustomerId,
            stripeSubscriptionId: validatedData.stripeSubscriptionId,
          },
          { span: context.span, operation: 'create_subscription' }
        );

        context.span.setAttribute('subscription.created', true);
        context.span.setAttribute('subscription.id', subscription.id);

        return {
          success: true,
          subscription,
          message: 'Subscription created successfully',
        };
      }
    )
  );
}

export async function GET(request: NextRequest) {
  return withRateLimit(RATE_LIMIT_CONFIGS.standard)(handleApiRequest)(
    request,
    { operation: 'get_user_subscriptions' },
    async (context: ApiContext) => {
      const subscriptionsService = ServiceFactory.createSubscriptionsService(
        context.supabase
      );

      const subscriptions = await subscriptionsService.getUserSubscriptions(
        context.user.id,
        { span: context.span, operation: 'get_user_subscriptions' }
      );

      context.span.setAttribute('subscriptions.count', subscriptions.length);

      return {
        success: true,
        subscriptions,
      };
    }
  );
}
