export const ENV = {
  // Supabase
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,

  // OpenAI
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,

  // Stripe
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,

  // Redis
  REDIS_URL: process.env.REDIS_URL,

  // Sentry
  SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // App
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Security
  NOTE_SECRET_KEY: process.env.NOTE_SECRET_KEY,
} as const;

export type Environment = typeof ENV;
export type EnvironmentKey = keyof Environment;
