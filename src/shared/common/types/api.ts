// API Types
export interface ApiErrorInterface {
  message: string;
  status: number;
  code?: string;
  details?: Record<string, unknown>;
}

import type { Span } from '@sentry/types';

export interface ApiHandlerOptions {
  requireAuthentication?: boolean;
  operation: string;
  span?: Span;
}

export interface AuthenticatedUser {
  id: string;
  email?: string;
}

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './supabase';

export interface ApiContext {
  user: AuthenticatedUser;
  span: Span;
  supabase: SupabaseClient<Database>;
}

import type { NextRequest } from 'next/server';

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (request: NextRequest) => string; // Custom key generator
  skipSuccessfulRequests?: boolean; // Skip rate limiting for successful requests
  skipFailedRequests?: boolean; // Skip rate limiting for failed requests
}

export interface RateLimitStore {
  increment(
    key: string,
    windowMs: number
  ): Promise<{ count: number; resetTime: number }>;
  get(
    key: string,
    windowMs: number
  ): Promise<{ count: number; resetTime: number } | undefined>;
}

export interface RateLimitData {
  count: number;
  resetTime: number;
}

export interface RedisMemoryInfo {
  usedMemory: number;
  peakMemory: number;
  totalKeys: number;
  rateLimitKeys: number;
  estimatedCapacity: number;
  memoryUsagePercent: number;
}

export interface RedisStats {
  memory: RedisMemoryInfo;
  rateLimitKeys: number;
  isHealthy: boolean;
}

// Query Types
export type QueryKey = readonly unknown[];

// Handler Types
export type ApiHandler<T = unknown> = (
  context: ApiContext,
  request: NextRequest,
  validatedData?: T
) => Promise<Response | Record<string, unknown>>;
