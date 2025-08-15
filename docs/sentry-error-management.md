# Sentry Error Management

Centralized error management system for Sentry in the Reflecto project.

## Overview

The system allows centralized management of which errors are sent to Sentry and which are filtered as expected or non-critical.

## Architecture

### Core Files

- `src/shared/lib/sentry-error-config.ts` - Error filter configuration
- `src/shared/lib/sentry.ts` - Updated Sentry client with filtering
- `src/shared/lib/auth-sync.ts` - Usage example (updated)
- `src/shared/lib/server-auth.ts` - Usage example (updated)

### Error Categories

#### 1. Auth Errors (`AUTH_ERRORS`)

Authentication errors that are expected for non-authenticated users:

- `Auth session missing!`
- `Auth session not found`
- `Auth.*unauthorized`
- HTTP 401/403 errors

#### 2. Network Errors (`NETWORK_ERRORS`)

Network errors that might be temporary:

- `Network.*error`
- `Failed to fetch`
- `.*timeout.*`

#### 3. Browser Errors (`BROWSER_ERRORS`)

Browser errors that don't require action:

- `Script error.`
- `ResizeObserver loop limit exceeded`

#### 4. Configuration Errors (`CONFIG_ERRORS`)

Configuration errors that are expected in development or staging:

- `*not configured`
- `*not set in environment variables`
- `Redis URL not configured`
- `OpenAI API key is not configured`

#### 5. User Errors (`USER_ERRORS`)

User-related errors that are expected in normal operation:

- `User not found`
- `Authentication required`
- `Not authenticated`
- `Unauthorized`

#### 6. API Errors (`API_ERRORS`)

API-related errors that might be temporary or expected:

- `Failed to fetch*`
- `OpenAI quota exceeded`
- `OpenAI rate limit exceeded`
- `File too large*`
- `Invalid OpenAI API key`

#### 7. Context Errors (`CONTEXT_ERRORS`)

React context errors that are expected in development:

- `*must be used within*Provider`

## Usage

### Automatic Filtering

All `safeSentry.captureException()` calls now automatically check errors through the filtering system:

```typescript
import { safeSentry } from '@/shared/lib/sentry';

// Error will be automatically filtered if it matches patterns
safeSentry.captureException(error, {
  tags: { operation: 'my_operation' },
});
```

### Filtering Check

```typescript
import {
  shouldFilterError,
  getErrorFilter,
} from '@/shared/lib/sentry-error-config';

const error = new Error('Auth session missing!');

if (shouldFilterError(error)) {
  const filter = getErrorFilter(error);
  console.log('Error filtered:', filter?.reason);
}
```

### Adding New Filters

1. Open `src/shared/lib/sentry-error-config.ts`
2. Add a new filter to the appropriate category:

```typescript
export const NEW_CATEGORY: ErrorCategory = {
  name: 'new_category',
  description: 'Description of new error category',
  filters: [
    {
      message: 'Your error message',
      reason: 'Why this error should be filtered',
      tags: { category: 'new_category', expected: 'true' },
    },
    {
      message: /regex pattern/i,
      reason: 'Regex-based filtering',
      tags: { category: 'new_category', expected: 'true' },
    },
  ],
};
```

3. Add the category to `ERROR_CATEGORIES`:

```typescript
export const ERROR_CATEGORIES: ErrorCategory[] = [
  AUTH_ERRORS,
  NETWORK_ERRORS,
  BROWSER_ERRORS,
  NEW_CATEGORY, // Add here
];
```

## Behavior in Different Environments

### Development

- Filtered errors are logged to console with `Filtered exception` label
- Includes information about filtering reason and tags

### Production

- Filtered errors are still sent to Sentry but with additional tags:
  - `filtered: 'true'`
  - `reason: 'filtering reason'`
  - Tags from filter configuration

This allows:

- Tracking frequency of expected errors
- Filtering them in Sentry UI by `filtered: true` tag
- Analyzing patterns of expected errors

## Monitoring

### Sentry Queries

```sql
-- All filtered errors
filtered:true

-- Only auth errors
filtered:true category:auth

-- Errors with specific reason
filtered:true reason:"Expected when user is not authenticated"
```

### Metrics

- `filtered:true` - total count of filtered errors
- `category:auth` - authentication errors
- `category:network` - network errors
- `category:browser` - browser errors
- `category:config` - configuration errors
- `category:user` - user-related errors
- `category:api` - API-related errors
- `category:context` - React context errors

## Best Practices

1. **Always use `safeSentry.captureException()`** instead of direct `Sentry.captureException()`
2. **Add contextual tags** for better error grouping
3. **Regularly check** filtered errors in Sentry
4. **Update filters** when new error patterns appear
5. **Document** new error categories

## Code Update Examples

### Before (old approach)

```typescript
if (error) {
  if (error.message !== 'Auth session missing!') {
    safeSentry.captureException(error);
  }
}
```

### After (new approach)

```typescript
if (error) {
  // Automatic filtering through centralized system
  safeSentry.captureException(error, {
    tags: { operation: 'my_operation' },
  });
}
```

New files should use `safeSentry.captureException()` for automatic filtering.
