import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/shared/lib/server';
import {
  getAISummaryPrompt,
  getAISummarySystemPrompt,
  type Locale,
} from '../../../../prompts';
import * as Sentry from '@sentry/nextjs';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    if (!from || !to) {
      const error = new Error('from and to parameters are required');
      Sentry.captureException(error);
      return NextResponse.json(
        { error: 'from and to parameters are required' },
        { status: 400 }
      );
    }

    const supabase = await await createServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      Sentry.captureException(userError || new Error('User not found'));
      return NextResponse.json({ error: 'Not authenticated' }, { status: 400 });
    }
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
      Sentry.captureException(error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ summary: null });
    }
    return NextResponse.json({ summary: data.summary });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { notes, locale = 'ru', from, to } = await req.json();

    console.log({
      from,
      to,
    });
    if (!Array.isArray(notes) || notes.length === 0) {
      const error = new Error('No notes provided');
      Sentry.captureException(error);
      return NextResponse.json({ error: 'No notes provided' }, { status: 400 });
    }
    if (!from || !to) {
      const error = new Error('from and to dates are required');
      Sentry.captureException(error);
      return NextResponse.json(
        { error: 'from and to dates are required' },
        { status: 400 }
      );
    }

    const supabase = await await createServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      Sentry.captureException(userError || new Error('User not found'));
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

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
      Sentry.captureException(error);
      return NextResponse.json({ error: 'OpenAI error' }, { status: 500 });
    }

    const data = await openaiRes.json();
    const content = data.choices?.[0]?.message?.content;
    let summary;
    try {
      const cleanedContent = content.replace(/```json\s*|\s*```/g, '').trim();
      summary = JSON.parse(cleanedContent);
    } catch (error) {
      Sentry.captureException(error);
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
      Sentry.captureException(selectError);
      return NextResponse.json({ error: selectError.message }, { status: 500 });
    }
    if (existing) {
      const { error: updateError } = await supabase
        .from('ai_summaries')
        .update({ summary })
        .eq('id', existing.id);
      if (updateError) {
        Sentry.captureException(updateError);
        return NextResponse.json(
          { error: updateError.message },
          { status: 500 }
        );
      }
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
        Sentry.captureException(insertError);
        return NextResponse.json(
          { error: insertError.message },
          { status: 500 }
        );
      }
    }
    return NextResponse.json({ summary });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
