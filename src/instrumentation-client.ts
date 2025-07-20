// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

// Only initialize Sentry in production and if DSN is provided
if (
  process.env.NODE_ENV === 'production' &&
  process.env.NEXT_PUBLIC_SENTRY_DSN
) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

    // Add optional integrations for additional features
    integrations: [
      Sentry.replayIntegration(),
      // Add console logging integration to capture console.error, console.warn, and console.log
      Sentry.consoleLoggingIntegration({ levels: ['error', 'warn', 'log'] }),
    ],

    // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
    tracesSampleRate: 1,

    // Define how likely Replay events are sampled.
    // This sets the sample rate to be 10%. You may want this to be 100% while
    // in development and sample at a lower rate in production
    replaysSessionSampleRate: 0.1,

    // Define how likely Replay events are sampled when an error occurs.
    replaysOnErrorSampleRate: 1.0,

    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false,

    // Enable logs in production
    _experiments: {
      enableLogs: true,
    },
  });
} else {
  // In development or when DSN is not provided, create a mock Sentry object to prevent errors
  if (process.env.NODE_ENV !== 'production') {
    console.log('Sentry disabled in development mode');
  } else if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
    console.warn('Sentry DSN not provided. Sentry will be disabled.');
  }
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
