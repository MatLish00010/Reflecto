import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/shared/lib/server';
import {
  getAISummaryPrompt,
  getAISummarySystemPrompt,
  type Locale,
} from '../../../../prompts';
import { safeSentry } from '@/shared/lib/sentry';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  return safeSentry.startSpanAsync(
    {
      op: 'http.server',
      name: 'GET /api/ai-summary',
    },
    async span => {
      try {
        const { searchParams } = new URL(request.url);
        const from = searchParams.get('from');
        const to = searchParams.get('to');

        span.setAttribute('filters.from', from || '');
        span.setAttribute('filters.to', to || '');

        if (!from || !to) {
          const error = new Error('from and to parameters are required');
          safeSentry.captureException(error, {
            tags: { operation: 'get_ai_summary' },
            extra: { from, to },
          });
          span.setAttribute('error', true);
          return NextResponse.json(
            { error: 'from and to parameters are required' },
            { status: 400 }
          );
        }

        const supabase = await createServerClient();
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError || !user) {
          safeSentry.captureException(
            userError || new Error('User not found'),
            {
              tags: { operation: 'get_ai_summary' },
            }
          );
          span.setAttribute('error', true);
          return NextResponse.json(
            { error: 'Not authenticated' },
            { status: 400 }
          );
        }

        span.setAttribute('user.id', user.id);

        const { data, error } = await supabase
          .from('ai_summaries')
          .select('*')
          .eq('user_id', user.id)
          .gte('created_at', from)
          .lt('created_at', to)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        if (error && error.code !== 'PGRST116') {
          safeSentry.captureException(error, {
            tags: { operation: 'get_ai_summary' },
            extra: { userId: user.id, from, to },
          });
          span.setAttribute('error', true);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
        if (!data) {
          span.setAttribute('summary.found', false);
          return NextResponse.json({ summary: null });
        }

        span.setAttribute('summary.found', true);
        span.setAttribute('success', true);
        return NextResponse.json({ summary: data.summary });
      } catch (error) {
        safeSentry.captureException(error as Error, {
          tags: { operation: 'get_ai_summary' },
        });
        span.setAttribute('error', true);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
      }
    }
  );
}

export async function POST(req: NextRequest) {
  return safeSentry.startSpanAsync(
    {
      op: 'http.server',
      name: 'POST /api/ai-summary',
    },
    async span => {
      try {
        const { notes, locale = 'ru', from, to } = await req.json();

        span.setAttribute('locale', locale);
        span.setAttribute('filters.from', from || '');
        span.setAttribute('filters.to', to || '');
        span.setAttribute('notes.count', notes?.length || 0);

        console.log({
          from,
          to,
        });
        if (!Array.isArray(notes) || notes.length === 0) {
          const error = new Error('No notes provided');
          safeSentry.captureException(error, {
            tags: { operation: 'create_ai_summary' },
            extra: { notesCount: notes?.length },
          });
          span.setAttribute('error', true);
          return NextResponse.json(
            { error: 'No notes provided' },
            { status: 400 }
          );
        }
        if (!from || !to) {
          const error = new Error('from and to dates are required');
          safeSentry.captureException(error, {
            tags: { operation: 'create_ai_summary' },
            extra: { from, to },
          });
          span.setAttribute('error', true);
          return NextResponse.json(
            { error: 'from and to dates are required' },
            { status: 400 }
          );
        }

        const supabase = await createServerClient();
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError || !user) {
          safeSentry.captureException(
            userError || new Error('User not found'),
            {
              tags: { operation: 'create_ai_summary' },
            }
          );
          span.setAttribute('error', true);
          return NextResponse.json(
            { error: 'Not authenticated' },
            { status: 401 }
          );
        }

        span.setAttribute('user.id', user.id);

        const prompt = getAISummaryPrompt(locale as Locale, notes);
        const systemPrompt = getAISummarySystemPrompt(locale as Locale);

        const openaiRes = await fetch(
          'https://api.openai.com/v1/chat/completions',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: [
                {
                  role: 'system',
                  content: systemPrompt,
                },
                { role: 'user', content: prompt },
              ],
              temperature: 0.7,
              max_tokens: 800,
            }),
          }
        );

        if (!openaiRes.ok) {
          const error = new Error('OpenAI error');
          safeSentry.captureException(error, {
            tags: { operation: 'create_ai_summary' },
            extra: { userId: user.id, openaiStatus: openaiRes.status },
          });
          span.setAttribute('error', true);
          return NextResponse.json({ error: 'OpenAI error' }, { status: 500 });
        }

        const data = await openaiRes.json();
        const content = data.choices?.[0]?.message?.content;
        let summary;
        try {
          const cleanedContent = content
            .replace(/```json\s*|\s*```/g, '')
            .trim();
          summary = JSON.parse(cleanedContent);
        } catch (error) {
          safeSentry.captureException(error as Error, {
            tags: { operation: 'create_ai_summary' },
            extra: { userId: user.id, content },
          });
          span.setAttribute('error', true);
          return NextResponse.json(
            { error: 'Failed to parse summary' },
            { status: 500 }
          );
        }

        const { data: existing, error: selectError } = await supabase
          .from('ai_summaries')
          .select('*')
          .eq('user_id', user.id)
          .gte('created_at', from)
          .lt('created_at', to)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        if (selectError && selectError.code !== 'PGRST116') {
          safeSentry.captureException(selectError, {
            tags: { operation: 'create_ai_summary' },
            extra: { userId: user.id, from, to },
          });
          span.setAttribute('error', true);
          return NextResponse.json(
            { error: selectError.message },
            { status: 500 }
          );
        }
        if (existing) {
          const { error: updateError } = await supabase
            .from('ai_summaries')
            .update({ summary })
            .eq('id', existing.id);
          if (updateError) {
            safeSentry.captureException(updateError, {
              tags: { operation: 'create_ai_summary' },
              extra: { userId: user.id, summaryId: existing.id },
            });
            span.setAttribute('error', true);
            return NextResponse.json(
              { error: updateError.message },
              { status: 500 }
            );
          }
          span.setAttribute('summary.action', 'updated');
        } else {
          const summaryDate = new Date(from);
          const { error: insertError } = await supabase
            .from('ai_summaries')
            .insert({
              user_id: user.id,
              summary,
              created_at: summaryDate.toISOString(),
            });
          if (insertError) {
            safeSentry.captureException(insertError, {
              tags: { operation: 'create_ai_summary' },
              extra: { userId: user.id, from, to },
            });
            span.setAttribute('error', true);
            return NextResponse.json(
              { error: insertError.message },
              { status: 500 }
            );
          }
          span.setAttribute('summary.action', 'created');
        }

        span.setAttribute('success', true);
        return NextResponse.json({ summary });
      } catch (error) {
        safeSentry.captureException(error as Error, {
          tags: { operation: 'create_ai_summary' },
        });
        span.setAttribute('error', true);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
      }
    }
  );
}
