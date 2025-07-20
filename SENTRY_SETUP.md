# Sentry Configuration

This project uses Sentry for error tracking and performance monitoring. The configuration is set up to only send data to Sentry in production mode, while providing development-friendly logging in local development.

## Configuration Files

### 1. Server Configuration (`sentry.server.config.ts`)

- Handles server-side error tracking
- Only initializes in production mode
- Includes console logging integration
- Enables structured logging

### 2. Edge Configuration (`sentry.edge.config.ts`)

- Handles edge runtime error tracking (middleware, edge routes)
- Only initializes in production mode
- Includes console logging integration
- Enables structured logging

### 3. Client Configuration (`src/instrumentation-client.ts`)

- Handles client-side error tracking
- Only initializes in production mode
- Includes session replay and console logging
- Enables structured logging

## Safe Sentry Utility

The project includes a safe Sentry utility (`src/shared/lib/sentry.ts`) that provides:

### Features

- **Environment-aware**: Only sends data to Sentry in production
- **Development logging**: Provides console logging in development
- **Type-safe**: Proper TypeScript support
- **Comprehensive**: Covers all Sentry functionality

### Usage Examples

#### Exception Catching

```typescript
import { safeSentry } from '@/shared/lib/sentry';

try {
  // Your code here
} catch (error) {
  safeSentry.captureException(error as Error, {
    tags: { operation: 'user_action' },
    extra: { userId: '123' },
  });
}
```

#### Performance Tracing

```typescript
import { safeSentry } from '@/shared/lib/sentry';

// Synchronous operations
const result = safeSentry.startSpan(
  {
    op: 'ui.click',
    name: 'Button Click',
  },
  span => {
    span.setAttribute('button.id', 'save-button');
    // Your operation here
    return someOperation();
  }
);

// Asynchronous operations
const result = await safeSentry.startSpanAsync(
  {
    op: 'http.client',
    name: 'API Call',
  },
  async span => {
    span.setAttribute('endpoint', '/api/data');
    // Your async operation here
    return await fetchData();
  }
);
```

#### Structured Logging

```typescript
import { safeSentry } from '@/shared/lib/sentry';

const { logger } = safeSentry;

logger.info('User logged in', { userId: '123', method: 'email' });
logger.warn('Rate limit approaching', { endpoint: '/api/data', remaining: 5 });
logger.error('Database connection failed', {
  database: 'users',
  retryCount: 3,
});
logger.fmt`Processing user ${userId} with ${method} method`;
```

#### User Context

```typescript
import { safeSentry } from '@/shared/lib/sentry';

safeSentry.setUser({
  id: '123',
  email: 'user@example.com',
  username: 'john_doe',
});
```

#### Tags and Context

```typescript
import { safeSentry } from '@/shared/lib/sentry';

safeSentry.setTag('environment', 'production');
safeSentry.setTag('version', '1.0.0');

safeSentry.setContext('request', {
  method: 'POST',
  url: '/api/notes',
  userAgent: 'Mozilla/5.0...',
});
```

## Development vs Production

### Development Mode

- Sentry is disabled
- All Sentry calls are logged to console with `Sentry (dev):` prefix
- No data is sent to Sentry servers
- Performance spans are logged but not tracked
- Useful for debugging and development

### Production Mode

- Sentry is fully enabled
- All data is sent to Sentry servers
- Performance monitoring is active
- Error tracking is active
- Session replay is enabled (10% sample rate)

## Best Practices

### 1. Use Safe Sentry Utility

Always use the `safeSentry` utility instead of direct Sentry imports:

```typescript
// ✅ Good
import { safeSentry } from '@/shared/lib/sentry';
safeSentry.captureException(error);

// ❌ Avoid
import * as Sentry from '@sentry/nextjs';
Sentry.captureException(error);
```

### 2. Add Context to Errors

Provide meaningful context when capturing exceptions:

```typescript
safeSentry.captureException(error, {
  tags: { operation: 'create_note', component: 'NewEntryForm' },
  extra: { userId: user.id, noteLength: note.length },
});
```

### 3. Use Performance Spans

Wrap important operations in spans for performance monitoring:

```typescript
const result = await safeSentry.startSpanAsync(
  {
    op: 'http.client',
    name: 'Fetch User Data',
  },
  async span => {
    span.setAttribute('user.id', userId);
    return await fetchUserData(userId);
  }
);
```

### 4. Structured Logging

Use the logger for structured logging instead of console.log:

```typescript
const { logger } = safeSentry;
logger.info('User action completed', { action: 'save_note', userId: user.id });
```

## Environment Variables

The following environment variables control Sentry behavior:

- `NODE_ENV`: Controls whether Sentry is enabled (only 'production' enables it)
- `SENTRY_DSN`: The Sentry DSN (configured in the config files)

## Monitoring

In production, you can monitor:

- Error rates and trends
- Performance metrics
- User sessions and replays
- Console logs and structured data
- Custom metrics and attributes

## Troubleshooting

### Sentry Not Working in Production

1. Check that `NODE_ENV` is set to 'production'
2. Verify the DSN is correct in config files
3. Check browser console for any Sentry initialization errors

### Development Logs Not Appearing

1. Ensure you're using the `safeSentry` utility
2. Check that you're not in production mode
3. Look for `Sentry (dev):` prefixed logs in console

### Performance Issues

1. Use spans to identify slow operations
2. Check Sentry performance dashboard
3. Monitor span attributes for bottlenecks
