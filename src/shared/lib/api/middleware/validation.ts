import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { type ApiContext, Errors } from '@/shared/lib/api';

export type ApiHandler<T = unknown> = (
  context: ApiContext,
  request: NextRequest,
  validatedData?: T
) => Promise<Response | Record<string, unknown>>;

export function withValidation<T extends z.ZodType>(
  schema: T,
  options: {
    validateBody?: boolean;
    validateQuery?: boolean;
  } = {}
) {
  const { validateBody = true, validateQuery = false } = options;

  return (
    handler: (
      context: ApiContext,
      request: NextRequest,
      validatedData: z.infer<T>
    ) => Promise<Response | Record<string, unknown>>
  ) => {
    return async (context: ApiContext, request: NextRequest) => {
      try {
        let validatedData: z.infer<T>;

        if (validateBody && request.method !== 'GET') {
          const body = await request.json();
          const validation = schema.safeParse(body);
          if (!validation.success) {
            throw Errors.BadRequest('Validation failed', {
              details: validation.error.issues,
            });
          }
          validatedData = validation.data;
        } else if (validateQuery) {
          const { searchParams } = new URL(request.url);
          const query = Object.fromEntries(searchParams.entries());
          const validation = schema.safeParse(query);
          if (!validation.success) {
            throw Errors.BadRequest('Query validation failed', {
              details: validation.error.issues,
            });
          }
          validatedData = validation.data;
        } else {
          throw Errors.BadRequest('No validation method specified');
        }

        return handler(context, request, validatedData);
      } catch (error) {
        if (error instanceof Error && 'status' in error) {
          throw error;
        }
        throw Errors.BadRequest('Request validation failed');
      }
    };
  };
}

// Common validation schemas
export const VALIDATION_SCHEMAS = {
  // Note schemas
  createNote: z.object({
    note: z
      .string()
      .min(1, 'Note content is required')
      .max(10000, 'Note too long'),
  }),

  updateNote: z.object({
    note: z
      .string()
      .min(1, 'Note content is required')
      .max(10000, 'Note too long'),
  }),

  // Feedback schemas
  createFeedback: z.object({
    type: z.enum(['bug', 'feature', 'improvement']),
    title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
    description: z
      .string()
      .min(1, 'Description is required')
      .max(2000, 'Description too long'),
  }),

  // Date range schemas
  dateRange: z
    .object({
      from: z.string().datetime().optional(),
      to: z.string().datetime().optional(),
    })
    .refine(
      data => {
        if (data.from && data.to) {
          return new Date(data.from) <= new Date(data.to);
        }
        return true;
      },
      { message: 'From date must be before or equal to to date' }
    ),

  // Weekly summary schemas
  weeklySummary: z
    .object({
      from: z.string().datetime('From date is required'),
      to: z.string().datetime('To date is required'),
      locale: z.string().optional().default('ru'),
    })
    .refine(data => new Date(data.from) <= new Date(data.to), {
      message: 'From date must be before or equal to to date',
    }),

  // Daily summary schemas
  dailySummary: z
    .object({
      from: z.string().datetime('From date is required'),
      to: z.string().datetime('To date is required'),
      notes: z.array(z.string()).min(1, 'At least one note is required'),
      locale: z.string().optional().default('ru'),
    })
    .refine(data => new Date(data.from) <= new Date(data.to), {
      message: 'From date must be before or equal to to date',
    }),
};
