import * as Sentry from '@sentry/nextjs';
import { shouldFilterError, getErrorFilter } from './sentry-error-config';

// Check if Sentry is enabled (only in production)
const isSentryEnabled = process.env.NODE_ENV === 'production';

// Define a proper mock span interface
interface MockSpan {
  setAttribute: (key: string, value: unknown) => void;
  setData: (key: string, value: unknown) => void;
  end: () => void;
}

// Define logger interface
interface LoggerInterface {
  trace: (message: string, context?: Record<string, unknown>) => void;
  debug: (message: string, context?: Record<string, unknown>) => void;
  info: (message: string, context?: Record<string, unknown>) => void;
  warn: (message: string, context?: Record<string, unknown>) => void;
  error: (message: string, context?: Record<string, unknown>) => void;
  fatal: (message: string, context?: Record<string, unknown>) => void;
  fmt: (strings: TemplateStringsArray, ...values: unknown[]) => string;
}

// Define context type for Sentry
interface SentryContext {
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
  level?: Sentry.SeverityLevel;
}

// Safe Sentry wrapper functions
export const safeSentry = {
  // Exception capturing
  captureException: (error: Error, context?: SentryContext) => {
    // Check if this error should be filtered out
    if (shouldFilterError(error)) {
      const filter = getErrorFilter(error);
      if (isSentryEnabled) {
        // In production, we still want to track filtered errors but with specific tags
        const enhancedContext = {
          ...context,
          tags: {
            ...context?.tags,
            ...filter?.tags,
            filtered: 'true',
            reason: filter?.reason || 'unknown',
          },
        };
        Sentry.captureException(error, enhancedContext);
      } else {
        // In development, log filtered errors with clear indication
        console.log(
          `Sentry (dev): Filtered exception - ${filter?.reason || 'unknown'}:`,
          error.message,
          { filter: filter?.tags, context }
        );
      }
      return;
    }

    if (isSentryEnabled) {
      Sentry.captureException(error, context);
    } else {
      console.error('Sentry (dev): Exception captured:', error, context);
    }
  },

  // Message capturing
  captureMessage: (message: string, level: Sentry.SeverityLevel = 'info') => {
    if (isSentryEnabled) {
      Sentry.captureMessage(message, level);
    } else {
      console.log(`Sentry (dev): ${level.toUpperCase()} - ${message}`);
    }
  },

  // Span creation
  startSpan: <T>(
    spanContext: {
      op: string;
      name: string;
      data?: Record<string, unknown>;
    },
    callback: (span: Sentry.Span) => T
  ): T => {
    if (isSentryEnabled) {
      return Sentry.startSpan(spanContext, callback);
    } else {
      console.log(
        `Sentry (dev): Starting span - ${spanContext.op}: ${spanContext.name}`,
        spanContext.data
      );
      // Create a mock span for development
      const mockSpan: MockSpan = {
        setAttribute: (key: string, value: unknown) => {
          console.log(`Sentry (dev): Setting attribute ${key} = ${value}`);
        },
        setData: (key: string, value: unknown) => {
          console.log(`Sentry (dev): Setting data ${key} = ${value}`);
        },
        end: () => {
          console.log(
            `Sentry (dev): Ending span - ${spanContext.op}: ${spanContext.name}`
          );
        },
      };

      const result = callback(mockSpan as unknown as Sentry.Span);
      mockSpan.end();
      return result;
    }
  },

  // Async span creation
  startSpanAsync: async <T>(
    spanContext: {
      op: string;
      name: string;
      data?: Record<string, unknown>;
    },
    callback: (span: Sentry.Span) => Promise<T>
  ): Promise<T> => {
    if (isSentryEnabled) {
      return Sentry.startSpan(spanContext, callback);
    } else {
      console.log(
        `Sentry (dev): Starting async span - ${spanContext.op}: ${spanContext.name}`,
        spanContext.data
      );
      // Create a mock span for development
      const mockSpan: MockSpan = {
        setAttribute: (key: string, value: unknown) => {
          console.log(`Sentry (dev): Setting attribute ${key} = ${value}`);
        },
        setData: (key: string, value: unknown) => {
          console.log(`Sentry (dev): Setting data ${key} = ${value}`);
        },
        end: () => {
          console.log(
            `Sentry (dev): Ending async span - ${spanContext.op}: ${spanContext.name}`
          );
        },
      };

      const result = await callback(mockSpan as unknown as Sentry.Span);
      mockSpan.end();
      return result;
    }
  },

  // Logger (if Sentry logger is available)
  logger: (isSentryEnabled && Sentry.logger
    ? Sentry.logger
    : {
        trace: (message: string, context?: Record<string, unknown>) =>
          console.log(`Sentry (dev): TRACE - ${message}`, context),
        debug: (message: string, context?: Record<string, unknown>) =>
          console.log(`Sentry (dev): DEBUG - ${message}`, context),
        info: (message: string, context?: Record<string, unknown>) =>
          console.log(`Sentry (dev): INFO - ${message}`, context),
        warn: (message: string, context?: Record<string, unknown>) =>
          console.warn(`Sentry (dev): WARN - ${message}`, context),
        error: (message: string, context?: Record<string, unknown>) =>
          console.error(`Sentry (dev): ERROR - ${message}`, context),
        fatal: (message: string, context?: Record<string, unknown>) =>
          console.error(`Sentry (dev): FATAL - ${message}`, context),
        fmt: (strings: TemplateStringsArray, ...values: unknown[]) => {
          return strings.reduce(
            (result, str, i) => result + str + (values[i] || ''),
            ''
          );
        },
      }) as LoggerInterface,

  // Set user context
  setUser: (user: { id: string; email?: string; username?: string }) => {
    if (isSentryEnabled) {
      Sentry.setUser(user);
    } else {
      console.log('Sentry (dev): Setting user context:', user);
    }
  },

  // Set tag
  setTag: (key: string, value: string) => {
    if (isSentryEnabled) {
      Sentry.setTag(key, value);
    } else {
      console.log(`Sentry (dev): Setting tag ${key} = ${value}`);
    }
  },

  // Set context
  setContext: (name: string, context: Record<string, unknown>) => {
    if (isSentryEnabled) {
      Sentry.setContext(name, context);
    } else {
      console.log(`Sentry (dev): Setting context ${name}:`, context);
    }
  },
};

// Export the original Sentry for cases where we need direct access
export { Sentry };

// Export a flag to check if Sentry is enabled
export const SENTRY_ENABLED = isSentryEnabled;
