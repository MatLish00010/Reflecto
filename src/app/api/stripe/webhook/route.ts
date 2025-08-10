import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { safeSentry } from '@/shared/lib/sentry';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  return safeSentry.startSpanAsync(
    {
      op: 'http.server',
      name: 'POST /api/stripe/webhook',
    },
    async span => {
      try {
        const body = await request.text();
        const signature = request.headers.get('stripe-signature');

        if (!signature) {
          span.setAttribute('error', true);
          span.setAttribute('error.type', 'missing_signature');
          return new Response('Missing stripe-signature header', {
            status: 400,
          });
        }

        let event: Stripe.Event;
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

        if (!webhookSecret) {
          span.setAttribute('error', true);
          span.setAttribute('error.type', 'missing_webhook_secret');
          return new Response('Missing webhook secret', {
            status: 500,
          });
        }

        try {
          event = stripe.webhooks.constructEvent(
            body,
            signature,
            webhookSecret
          );
        } catch (err) {
          span.setAttribute('error', true);
          span.setAttribute('error.type', 'signature_verification_failed');
          safeSentry.captureException(err as Error, {
            tags: { operation: 'stripe_webhook_signature_verification' },
          });
          return new Response('Webhook signature verification failed', {
            status: 400,
          });
        }

        span.setAttribute('stripe.event.type', event.type);
        span.setAttribute('stripe.event.id', event.id);

        switch (event.type) {
          case 'checkout.session.completed':
            const session = event.data.object as Stripe.Checkout.Session;

            span.setAttribute('stripe.session.id', session.id);
            span.setAttribute(
              'stripe.session.customer_id',
              session.customer as string
            );

            if (session.customer && session.subscription) {
              try {
                const userId = session.metadata?.user_id;

                if (!userId) {
                  span.setAttribute('user.not_found', true);
                  safeSentry.captureMessage(
                    'User ID not found in session metadata',
                    'warning'
                  );
                  break;
                }

                const response = await fetch(
                  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-subscription`,
                  {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
                    },
                    body: JSON.stringify({
                      userId,
                      stripeCustomerId: session.customer as string,
                      stripeSubscriptionId: session.subscription as string,
                    }),
                  }
                );

                if (!response.ok) {
                  const errorData = await response.json();
                  throw new Error(`Edge Function error: ${errorData.error}`);
                }

                const { subscription } = await response.json();

                span.setAttribute('subscription.saved', true);
                span.setAttribute('subscription.id', subscription.id);
                safeSentry.captureMessage(
                  'Subscription saved to database via Edge Function',
                  'info'
                );
              } catch (error) {
                safeSentry.captureException(error as Error, {
                  tags: { operation: 'save_subscription_to_database' },
                  extra: {
                    sessionId: session.id,
                    customerId: session.customer,
                    subscriptionId: session.subscription,
                  },
                });
              }
            }

            safeSentry.captureMessage('Checkout session completed', 'info');
            break;

          case 'customer.subscription.deleted':
            const deletedSubscription = event.data
              .object as Stripe.Subscription;
            span.setAttribute('stripe.subscription.id', deletedSubscription.id);
            span.setAttribute(
              'stripe.subscription.customer_id',
              deletedSubscription.customer as string
            );

            try {
              const getResponse = await fetch(
                `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/get-subscription-by-customer`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
                  },
                  body: JSON.stringify({
                    stripeCustomerId: deletedSubscription.customer as string,
                  }),
                }
              );

              if (!getResponse.ok) {
                const errorData = await getResponse.json();
                throw new Error(`Get subscription error: ${errorData.error}`);
              }

              const { subscription: existingSubscription } =
                await getResponse.json();

              if (existingSubscription) {
                const deleteResponse = await fetch(
                  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/delete-subscription`,
                  {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
                    },
                    body: JSON.stringify({
                      subscriptionId: existingSubscription.id,
                    }),
                  }
                );

                if (!deleteResponse.ok) {
                  const errorData = await deleteResponse.json();
                  throw new Error(
                    `Delete subscription error: ${errorData.error}`
                  );
                }

                span.setAttribute('subscription.deleted', true);
                safeSentry.captureMessage(
                  `Subscription ${deletedSubscription.id} deleted from database via Edge Function`,
                  'info'
                );
              } else {
                span.setAttribute('subscription.not_found', true);
                safeSentry.captureMessage(
                  `Subscription ${deletedSubscription.id} not found in database`,
                  'warning'
                );
              }
            } catch (error) {
              safeSentry.captureException(error as Error, {
                tags: { operation: 'delete_subscription_from_webhook' },
                extra: {
                  subscriptionId: deletedSubscription.id,
                  customerId: deletedSubscription.customer,
                },
              });
            }
            break;

          case 'customer.subscription.updated':
            const updatedSubscription = event.data
              .object as Stripe.Subscription;
            span.setAttribute('stripe.subscription.id', updatedSubscription.id);
            span.setAttribute(
              'stripe.subscription.customer_id',
              updatedSubscription.customer as string
            );
            span.setAttribute(
              'stripe.subscription.status',
              updatedSubscription.status
            );

            if (
              ['canceled', 'unpaid', 'past_due'].includes(
                updatedSubscription.status
              )
            ) {
              try {
                const getResponse = await fetch(
                  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/get-subscription-by-customer`,
                  {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
                    },
                    body: JSON.stringify({
                      stripeCustomerId: updatedSubscription.customer as string,
                    }),
                  }
                );

                if (!getResponse.ok) {
                  const errorData = await getResponse.json();
                  throw new Error(`Get subscription error: ${errorData.error}`);
                }

                const { subscription: existingSubscription } =
                  await getResponse.json();

                if (existingSubscription) {
                  const deleteResponse = await fetch(
                    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/delete-subscription`,
                    {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
                      },
                      body: JSON.stringify({
                        subscriptionId: existingSubscription.id,
                      }),
                    }
                  );

                  if (!deleteResponse.ok) {
                    const errorData = await deleteResponse.json();
                    throw new Error(
                      `Delete subscription error: ${errorData.error}`
                    );
                  }

                  span.setAttribute('subscription.expired_deleted', true);
                  safeSentry.captureMessage(
                    `Expired subscription ${updatedSubscription.id} deleted from database via Edge Function`,
                    'info'
                  );
                }
              } catch (error) {
                safeSentry.captureException(error as Error, {
                  tags: { operation: 'update_subscription_from_webhook' },
                  extra: {
                    subscriptionId: updatedSubscription.id,
                    customerId: updatedSubscription.customer,
                    status: updatedSubscription.status,
                  },
                });
              }
            }
            break;

          case 'invoice.paid':
            console.log('invoice.paid');
            const invoice = event.data.object as Stripe.Invoice;
            span.setAttribute('stripe.invoice.id', invoice.id);
            span.setAttribute(
              'stripe.invoice.customer_id',
              invoice.customer as string
            );

            // Continue to provision the subscription as payments continue to be made.
            // Store the status in your database and check when a user accesses your service.
            // This approach helps you avoid hitting rate limits.
            safeSentry.captureMessage('Invoice paid', 'info');
            break;

          case 'invoice.payment_failed':
            console.log('invoice.payment_failed');
            const failedInvoice = event.data.object as Stripe.Invoice;
            span.setAttribute('stripe.invoice.id', failedInvoice.id);
            span.setAttribute(
              'stripe.invoice.customer_id',
              failedInvoice.customer as string
            );

            const subscriptionId = (
              failedInvoice as Stripe.Invoice & { subscription?: string | null }
            ).subscription;
            if (subscriptionId) {
              try {
                const getResponse = await fetch(
                  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/get-subscription-by-customer`,
                  {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
                    },
                    body: JSON.stringify({
                      stripeCustomerId: failedInvoice.customer as string,
                    }),
                  }
                );

                if (!getResponse.ok) {
                  const errorData = await getResponse.json();
                  throw new Error(`Get subscription error: ${errorData.error}`);
                }

                const { subscription: existingSubscription } =
                  await getResponse.json();

                if (existingSubscription) {
                  const subscription =
                    await stripe.subscriptions.retrieve(subscriptionId);

                  if (
                    ['canceled', 'unpaid', 'past_due'].includes(
                      subscription.status
                    )
                  ) {
                    const deleteResponse = await fetch(
                      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/delete-subscription`,
                      {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
                        },
                        body: JSON.stringify({
                          subscriptionId: existingSubscription.id,
                        }),
                      }
                    );

                    if (!deleteResponse.ok) {
                      const errorData = await deleteResponse.json();
                      throw new Error(
                        `Delete subscription error: ${errorData.error}`
                      );
                    }

                    span.setAttribute(
                      'subscription.deleted_after_failed_payment',
                      true
                    );
                    safeSentry.captureMessage(
                      `Subscription ${subscription.id} deleted after failed payment via Edge Function`,
                      'warning'
                    );
                  }
                }
              } catch (error) {
                safeSentry.captureException(error as Error, {
                  tags: { operation: 'handle_failed_payment' },
                  extra: {
                    invoiceId: failedInvoice.id,
                    subscriptionId: subscriptionId,
                    customerId: failedInvoice.customer,
                  },
                });
              }
            }

            // The payment failed or the customer does not have a valid payment method.
            // The subscription becomes past_due. Notify your customer and send them to the
            // customer portal to update their payment information.
            safeSentry.captureMessage('Invoice payment failed', 'warning');
            break;

          default:
            console.log('unhandled event type:', event.type);
            // Unhandled event type
            span.setAttribute('stripe.event.unhandled', true);
            safeSentry.captureMessage(
              `Unhandled event type: ${event.type}`,
              'info'
            );
        }

        span.setAttribute('success', true);
        return new Response('Webhook processed successfully', { status: 200 });
      } catch (error) {
        span.setAttribute('error', true);
        safeSentry.captureException(error as Error, {
          tags: { operation: 'stripe_webhook_processing' },
        });
        return new Response('Internal server error', { status: 500 });
      }
    }
  );
}
