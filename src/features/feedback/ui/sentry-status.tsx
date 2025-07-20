'use client';

import { useEffect, useState } from 'react';
import { SENTRY_ENABLED } from '@/shared/lib/sentry';

interface SentryStatus {
  environment: string;
  sentryEnabled: boolean;
  dsnConfigured: boolean;
  timestamp: string;
}

export function SentryStatus() {
  const [status, setStatus] = useState<SentryStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch('/api/sentry-test');
        const data = await response.json();
        setStatus(data);
      } catch (error) {
        console.error('Failed to check Sentry status:', error);
        setStatus({
          environment: process.env.NODE_ENV || 'unknown',
          sentryEnabled: SENTRY_ENABLED,
          dsnConfigured: !!process.env.SENTRY_DSN,
          timestamp: new Date().toISOString(),
        });
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, []);

  if (loading) {
    return (
      <div className="p-2 text-xs text-muted-foreground">
        Checking Sentry status...
      </div>
    );
  }

  if (!status) {
    return (
      <div className="p-2 text-xs text-red-500">
        Failed to check Sentry status
      </div>
    );
  }

  return (
    <div className="p-2 text-xs space-y-1">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">Environment:</span>
        <span
          className={`px-1 rounded ${
            status.environment === 'production'
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
          }`}
        >
          {status.environment}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">Sentry Enabled:</span>
        <span
          className={`px-1 rounded ${
            status.sentryEnabled
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}
        >
          {status.sentryEnabled ? 'Yes' : 'No'}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">DSN Configured:</span>
        <span
          className={`px-1 rounded ${
            status.dsnConfigured
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}
        >
          {status.dsnConfigured ? 'Yes' : 'No'}
        </span>
      </div>

      <div className="text-muted-foreground">
        Last checked: {new Date(status.timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
}
