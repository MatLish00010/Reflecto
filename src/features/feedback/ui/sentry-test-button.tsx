'use client';

import { Button } from '@/shared/ui/button';
import { safeSentry } from '@/shared/lib/sentry';

export function SentryTestButton() {
  const testSentryException = () => {
    safeSentry.captureException(
      new Error('Test exception from Sentry test button'),
      {
        tags: { component: 'SentryTestButton', action: 'test_exception' },
        extra: { timestamp: new Date().toISOString() },
      }
    );
  };

  const testSentryMessage = () => {
    safeSentry.captureMessage('Test message from Sentry test button', 'info');
  };

  const testSentrySpan = () => {
    safeSentry.startSpan(
      {
        op: 'ui.click',
        name: 'Sentry Test Button Click',
      },
      span => {
        span.setAttribute('button.id', 'sentry-test');
        span.setAttribute('test.type', 'span');

        // Simulate some work
        const result = 'Test span completed';
        console.log('Sentry span test completed:', result);

        return result;
      }
    );
  };

  const testSentryLogger = () => {
    const { logger } = safeSentry;

    logger.info('Test info log from Sentry test button', {
      component: 'SentryTestButton',
      action: 'test_logger',
    });

    logger.warn('Test warning log from Sentry test button', {
      component: 'SentryTestButton',
      action: 'test_logger',
    });

    logger.error('Test error log from Sentry test button', {
      component: 'SentryTestButton',
      action: 'test_logger',
    });
  };

  const testServerSentry = async (testType: string) => {
    try {
      const response = await fetch('/api/sentry-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ testType }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Server Sentry test completed:', data);
        alert(`Server test '${testType}' completed successfully!`);
      } else {
        console.error('Server Sentry test failed:', data);
        alert(`Server test failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Server Sentry test error:', error);
      alert('Server test error occurred');
    }
  };

  // Only show in production
  if (process.env.NODE_ENV !== 'production') {
    return null;
  }

  return (
    <div className="space-y-2 p-4 border rounded-lg bg-muted/50">
      <h3 className="text-sm font-medium">Sentry Test Controls</h3>
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={testSentryException}>
            Test Exception
          </Button>
          <Button variant="outline" size="sm" onClick={testSentryMessage}>
            Test Message
          </Button>
          <Button variant="outline" size="sm" onClick={testSentrySpan}>
            Test Span
          </Button>
          <Button variant="outline" size="sm" onClick={testSentryLogger}>
            Test Logger
          </Button>
        </div>

        <div className="border-t pt-2">
          <p className="text-xs text-muted-foreground mb-2">Server Tests:</p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => testServerSentry('exception')}
            >
              Server Exception
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => testServerSentry('message')}
            >
              Server Message
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => testServerSentry('span')}
            >
              Server Span
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => testServerSentry('logger')}
            >
              Server Logger
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
