import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/shared/lib/supabase/server';
import { safeSentry } from '@/shared/lib/sentry';

export async function POST(request: NextRequest) {
  return safeSentry.startSpanAsync(
    {
      op: 'http.server',
      name: 'POST /api/feedback',
    },
    async span => {
      try {
        const supabase = await createClient();

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();
        if (authError || !user) {
          safeSentry.captureException(
            authError || new Error('User not found'),
            {
              tags: { operation: 'create_feedback' },
            }
          );
          span.setAttribute('error', true);
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        span.setAttribute('user.id', user.id);

        const body = await request.json();

        span.setAttribute('feedback.type', body.type || '');
        span.setAttribute('feedback.hasTitle', !!body.title);
        span.setAttribute('feedback.hasDescription', !!body.description);

        if (!body.type || !body.title || !body.description) {
          const error = new Error('Missing required fields');
          safeSentry.captureException(error, {
            tags: { operation: 'create_feedback' },
            extra: { userId: user.id, body },
          });
          span.setAttribute('error', true);
          return NextResponse.json(
            { error: 'Missing required fields' },
            { status: 400 }
          );
        }

        if (!['bug', 'feature', 'improvement'].includes(body.type)) {
          const error = new Error('Invalid feedback type');
          safeSentry.captureException(error, {
            tags: { operation: 'create_feedback' },
            extra: { userId: user.id, feedbackType: body.type },
          });
          span.setAttribute('error', true);
          return NextResponse.json(
            { error: 'Invalid feedback type' },
            { status: 400 }
          );
        }

        const { data, error } = await supabase
          .from('feedback')
          .insert({
            user_id: user.id,
            type: body.type,
            title: body.title,
            description: body.description,
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating feedback:', error);
          safeSentry.captureException(error, {
            tags: { operation: 'create_feedback' },
            extra: { userId: user.id, feedbackType: body.type },
          });
          span.setAttribute('error', true);
          return NextResponse.json(
            { error: 'Failed to create feedback' },
            { status: 500 }
          );
        }

        span.setAttribute('success', true);
        return NextResponse.json({ success: true, data });
      } catch (error) {
        console.error('Error in feedback POST:', error);
        safeSentry.captureException(error as Error, {
          tags: { operation: 'create_feedback' },
        });
        span.setAttribute('error', true);
        return NextResponse.json(
          { error: 'Internal server error' },
          { status: 500 }
        );
      }
    }
  );
}

export async function GET() {
  return safeSentry.startSpanAsync(
    {
      op: 'http.server',
      name: 'GET /api/feedback',
    },
    async span => {
      try {
        const supabase = await createClient();

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();
        if (authError || !user) {
          safeSentry.captureException(
            authError || new Error('User not found'),
            {
              tags: { operation: 'get_feedback' },
            }
          );
          span.setAttribute('error', true);
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        span.setAttribute('user.id', user.id);

        const { data, error } = await supabase
          .from('feedback')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching feedback:', error);
          safeSentry.captureException(error, {
            tags: { operation: 'get_feedback' },
            extra: { userId: user.id },
          });
          span.setAttribute('error', true);
          return NextResponse.json(
            { error: 'Failed to fetch feedback' },
            { status: 500 }
          );
        }

        span.setAttribute('feedback.count', data?.length || 0);
        span.setAttribute('success', true);
        return NextResponse.json(data || []);
      } catch (error) {
        console.error('Error in feedback GET:', error);
        safeSentry.captureException(error as Error, {
          tags: { operation: 'get_feedback' },
        });
        span.setAttribute('error', true);
        return NextResponse.json(
          { error: 'Internal server error' },
          { status: 500 }
        );
      }
    }
  );
}
