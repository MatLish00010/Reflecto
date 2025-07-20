// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

// Only initialize Sentry in production and if DSN is provided
if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,

    // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
    tracesSampleRate: 1,

    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false,

    // Enable logs in production
    _experiments: {
      enableLogs: true,
    },

    // Add console logging integration to capture console.error, console.warn, and console.log
    integrations: [
      Sentry.consoleLoggingIntegration({ levels: ['error', 'warn', 'log'] }),
    ],
  });
} else {
  // In development or when DSN is not provided, create a mock Sentry object to prevent errors
  if (process.env.NODE_ENV !== 'production') {
    console.log('Sentry disabled in development mode');
  } else if (!process.env.SENTRY_DSN) {
    console.warn('Sentry DSN not provided. Sentry will be disabled.');
  }
}
