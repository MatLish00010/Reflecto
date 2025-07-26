import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/shared/lib/server';
import {
  getWeeklySummaryPrompt,
  getWeeklySummarySystemPrompt,
  type Locale,
} from '../../../../prompts';
import { safeSentry } from '@/shared/lib/sentry';
import type { AISummaryData } from '@/shared/types';
import type { Json } from '@/shared/types/supabase';
import { getSummaryLabels } from '@/shared/config';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  return safeSentry.startSpanAsync(
    {
      op: 'http.server',
      name: 'GET /api/weekly-summary',
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
            tags: { operation: 'get_weekly_summary' },
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
              tags: { operation: 'get_weekly_summary' },
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
          .from('weekly_summaries')
          .select('*')
          .eq('user_id', user.id)
          .gte('week_start_date', from)
          .lte('week_end_date', to)
          .order('week_start_date', { ascending: false })
          .limit(1)
          .single();
        if (error && error.code !== 'PGRST116') {
          safeSentry.captureException(error, {
            tags: { operation: 'get_weekly_summary' },
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
          tags: { operation: 'get_weekly_summary' },
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
      name: 'POST /api/weekly-summary',
    },
    async span => {
      try {
        const { locale = 'ru', from, to } = await req.json();

        span.setAttribute('locale', locale);
        span.setAttribute('filters.from', from || '');
        span.setAttribute('filters.to', to || '');

        if (!from || !to) {
          const error = new Error('from and to dates are required');
          safeSentry.captureException(error, {
            tags: { operation: 'create_weekly_summary' },
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
              tags: { operation: 'create_weekly_summary' },
            }
          );
          span.setAttribute('error', true);
          return NextResponse.json(
            { error: 'Not authenticated' },
            { status: 401 }
          );
        }

        span.setAttribute('user.id', user.id);

        const { data: dailySummariesData, error: dailySummariesError } =
          await supabase
            .from('ai_summaries')
            .select('summary')
            .eq('user_id', user.id)
            .gte('created_at', from)
            .lte('created_at', to)
            .order('created_at', { ascending: true });

        if (dailySummariesError) {
          safeSentry.captureException(dailySummariesError, {
            tags: { operation: 'create_weekly_summary' },
            extra: { userId: user.id, from, to },
          });
          span.setAttribute('error', true);
          return NextResponse.json(
            { error: dailySummariesError.message },
            { status: 500 }
          );
        }

        if (!dailySummariesData || dailySummariesData.length === 0) {
          const error = new Error(
            'No daily summaries found for the specified period'
          );
          safeSentry.captureException(error, {
            tags: { operation: 'create_weekly_summary' },
            extra: { userId: user.id, from, to },
          });
          span.setAttribute('error', true);
          return NextResponse.json(
            { error: 'No daily summaries found for the specified period' },
            { status: 400 }
          );
        }

        span.setAttribute('summaries.count', dailySummariesData.length);

        // Преобразуем дневные саммари в текстовый формат для промпта
        const labels = getSummaryLabels(locale);
        const dailySummariesTexts = dailySummariesData.map((item, index) => {
          const summary = item.summary as unknown as AISummaryData;
          const parts = [];

          if (summary.mainStory)
            parts.push(`${labels.mainStory}: ${summary.mainStory}`);
          if (summary.keyEvents?.length)
            parts.push(`${labels.keyEvents}: ${summary.keyEvents.join(', ')}`);
          if (summary.emotionalMoments?.length)
            parts.push(
              `${labels.emotionalMoments}: ${summary.emotionalMoments.join(', ')}`
            );
          if (summary.ideas?.length)
            parts.push(`${labels.ideas}: ${summary.ideas.join(', ')}`);
          if (summary.cognitivePatterns?.length)
            parts.push(
              `${labels.cognitivePatterns}: ${summary.cognitivePatterns.join(', ')}`
            );
          if (summary.behavioralPatterns?.length)
            parts.push(
              `${labels.behavioralPatterns}: ${summary.behavioralPatterns.join(', ')}`
            );
          if (summary.triggers?.length)
            parts.push(`${labels.triggers}: ${summary.triggers.join(', ')}`);
          if (summary.resources?.length)
            parts.push(`${labels.resources}: ${summary.resources.join(', ')}`);
          if (summary.progress?.length)
            parts.push(`${labels.progress}: ${summary.progress.join(', ')}`);
          if (summary.observations?.length)
            parts.push(
              `${labels.observations}: ${summary.observations.join(', ')}`
            );
          if (summary.recommendations?.length)
            parts.push(
              `${labels.recommendations}: ${summary.recommendations.join(', ')}`
            );
          if (summary.copingStrategies?.length)
            parts.push(
              `${labels.copingStrategies}: ${summary.copingStrategies.join(', ')}`
            );

          return `${labels.day} ${index + 1}:\n${parts.join('\n')}`;
        });

        const prompt = getWeeklySummaryPrompt(
          locale as Locale,
          dailySummariesTexts
        );
        console.log(prompt);
        const systemPrompt = getWeeklySummarySystemPrompt(locale as Locale);

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
              max_tokens: 8000,
            }),
          }
        );

        if (!openaiRes.ok) {
          const error = new Error('OpenAI error');
          safeSentry.captureException(error, {
            tags: { operation: 'create_weekly_summary' },
            extra: { userId: user.id, openaiStatus: openaiRes.status },
          });
          span.setAttribute('error', true);
          return NextResponse.json({ error: 'OpenAI error' }, { status: 500 });
        }

        const data = await openaiRes.json();
        const content = data.choices?.[0]?.message?.content;
        let summary: Record<string, unknown>;
        let validatedSummary: AISummaryData;
        try {
          if (!content) {
            throw new Error('No content received from OpenAI');
          }
          const cleanedContent = content
            .replace(/```json\s*|\s*```/g, '')
            .trim();
          summary = JSON.parse(cleanedContent);

          const requiredFields = [
            'mainStory',
            'keyEvents',
            'emotionalMoments',
            'ideas',
            'cognitivePatterns',
            'behavioralPatterns',
            'triggers',
            'resources',
            'progress',
            'observations',
            'recommendations',
            'copingStrategies',
          ];

          const missingFields = requiredFields.filter(
            field => !(field in summary)
          );
          if (missingFields.length > 0) {
            const error = new Error(
              `Missing required fields: ${missingFields.join(', ')}`
            );
            safeSentry.captureException(error, {
              tags: { operation: 'create_weekly_summary' },
              extra: { userId: user.id, missingFields, summary },
            });
            span.setAttribute('error', true);
            return NextResponse.json(
              { error: 'Invalid summary structure' },
              { status: 500 }
            );
          }

          const arrayFields = [
            'keyEvents',
            'emotionalMoments',
            'ideas',
            'cognitivePatterns',
            'behavioralPatterns',
            'triggers',
            'resources',
            'progress',
            'observations',
            'recommendations',
            'copingStrategies',
          ];

          for (const field of arrayFields) {
            if (!Array.isArray(summary[field])) {
              summary[field] = [];
            }
          }

          if (typeof summary.mainStory !== 'string') {
            summary.mainStory = String(summary.mainStory || '');
          }

          validatedSummary = summary as unknown as AISummaryData;
        } catch (error) {
          safeSentry.captureException(error as Error, {
            tags: { operation: 'create_weekly_summary' },
            extra: { userId: user.id, content },
          });
          span.setAttribute('error', true);
          return NextResponse.json(
            { error: 'Failed to parse summary' },
            { status: 500 }
          );
        }

        const { data: existing, error: selectError } = await supabase
          .from('weekly_summaries')
          .select('*')
          .eq('user_id', user.id)
          .gte('week_start_date', from)
          .lte('week_end_date', to)
          .order('week_start_date', { ascending: false })
          .limit(1)
          .single();
        if (selectError && selectError.code !== 'PGRST116') {
          safeSentry.captureException(selectError, {
            tags: { operation: 'create_weekly_summary' },
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
            .from('weekly_summaries')
            .update({ summary: validatedSummary as unknown as Json })
            .eq('id', existing.id);
          if (updateError) {
            safeSentry.captureException(updateError, {
              tags: { operation: 'create_weekly_summary' },
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
          const weekStartDate = new Date(from);
          const { error: insertError } = await supabase
            .from('weekly_summaries')
            .insert({
              user_id: user.id,
              summary: validatedSummary as unknown as Json,
              week_start_date: weekStartDate.toISOString().split('T')[0],
              week_end_date: new Date(to).toISOString().split('T')[0],
            });
          if (insertError) {
            safeSentry.captureException(insertError, {
              tags: { operation: 'create_weekly_summary' },
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
        return NextResponse.json({ summary: validatedSummary });
      } catch (error) {
        safeSentry.captureException(error as Error, {
          tags: { operation: 'create_weekly_summary' },
        });
        span.setAttribute('error', true);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
      }
    }
  );
}
