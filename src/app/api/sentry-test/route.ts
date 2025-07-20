import { NextRequest, NextResponse } from 'next/server';
import { safeSentry } from '@/shared/lib/sentry';

export async function POST(request: NextRequest) {
  try {
    const { testType } = await request.json();

    switch (testType) {
      case 'exception':
        // Test exception capture
        safeSentry.captureException(new Error('Test server exception'), {
          tags: { endpoint: '/api/sentry-test', action: 'test_exception' },
          extra: { timestamp: new Date().toISOString() },
        });
        break;

      case 'message':
        // Test message capture
        safeSentry.captureMessage('Test server message', 'info');
        break;

      case 'span':
        // Test span creation
        safeSentry.startSpan(
          {
            op: 'http.server',
            name: 'Sentry Test API Call',
          },
          span => {
            span.setAttribute('endpoint', '/api/sentry-test');
            span.setAttribute('test.type', 'span');

            // Simulate some work
            const data = {
              message: 'Test span completed',
              timestamp: new Date().toISOString(),
            };

            return data;
          }
        );
        break;

      case 'logger':
        // Test logger
        const { logger } = safeSentry;
        logger.info('Test info log from server', {
          endpoint: '/api/sentry-test',
          action: 'test_logger',
        });
        logger.warn('Test warning log from server', {
          endpoint: '/api/sentry-test',
          action: 'test_logger',
        });
        logger.error('Test error log from server', {
          endpoint: '/api/sentry-test',
          action: 'test_logger',
        });
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid test type' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `Sentry test '${testType}' completed`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    // This will also be captured by Sentry
    safeSentry.captureException(error as Error, {
      tags: { endpoint: '/api/sentry-test', action: 'error_handling' },
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Test basic Sentry functionality on GET request
  safeSentry.captureMessage('Sentry test endpoint accessed', 'info');

  return NextResponse.json({
    message: 'Sentry test endpoint is working',
    environment: process.env.NODE_ENV,
    sentryEnabled:
      process.env.NODE_ENV === 'production' && !!process.env.SENTRY_DSN,
    timestamp: new Date().toISOString(),
  });
}
