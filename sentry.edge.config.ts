// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

// Only initialize Sentry in production
if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: 'https://0d83c017a9e682f199afda2546c8e402@o4509699604480000.ingest.de.sentry.io/4509699605528656',

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
  // In development, create a mock Sentry object to prevent errors
  console.log('Sentry disabled in development mode');
}
