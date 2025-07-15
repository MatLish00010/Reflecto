import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'edge';

function getDateRange(date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return {
    from: start.toISOString(),
    to: end.toISOString(),
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fromParam = searchParams.get('from');
  const toParam = searchParams.get('to');

  let from: string, to: string;

  if (fromParam && toParam) {
    from = fromParam;
    to = toParam;
  } else {
    const dateParam = searchParams.get('date');
    let targetDate: Date;
    if (dateParam) {
      targetDate = new Date(dateParam);
      if (isNaN(targetDate.getTime())) {
        return NextResponse.json({ error: 'Invalid date' }, { status: 400 });
      }
    } else {
      targetDate = new Date();
    }
    const range = getDateRange(targetDate);
    from = range.from;
    to = range.to;
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ summary: null });
  }
  return NextResponse.json({ summary: data.summary });
}

export async function POST(req: NextRequest) {
  try {
    const { notes } = await req.json();
    if (!Array.isArray(notes) || notes.length === 0) {
      return NextResponse.json({ error: 'No notes provided' }, { status: 400 });
    }
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const prompt = `Вот записи пользователя за день:
${notes.map((n, i) => `${i + 1}. ${n}`).join('\n')}

Как профессиональный психолог, проанализируйте эти записи и создайте персонализированное саммари. 

ВАЖНО: Определите язык записей пользователя и отвечайте на том же языке. Обращайтесь к пользователю на "вы" (например: "Вы сегодня ели...", "В ваших записях видно...") или "you" для английского.

Выделите:
- Основной сюжет дня и ключевые события
- Важные эмоциональные моменты и переживания
- Ключевые темы, которые повторяются в записях
- Ваши профессиональные наблюдения и выводы
- Конкретные рекомендации или советы, основанные на вашем анализе

Ответ верните в формате JSON с полями:
- mainStory (строка) - основной сюжет дня
- keyEvents (массив строк) - важные события
- emotionalMoments (массив строк) - эмоциональные моменты
- keyThemes (массив строк) - ключевые темы
- observations (массив строк) - ваши профессиональные наблюдения
- recommendations (массив строк) - рекомендации и советы`;

    const openaiRes = await fetch(
      'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content:
                'Вы профессиональный психолог с многолетним опытом. Анализируйте записи клиента с эмпатией и профессионализмом. Давайте персонализированные, полезные выводы и рекомендации. Определяйте язык записей клиента и отвечайте на том же языке. Обращайтесь к клиенту на "вы" (русский) или "you" (английский).',
            },
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 800,
        }),
      }
    );

    if (!openaiRes.ok) {
      return NextResponse.json({ error: 'OpenAI error' }, { status: 500 });
    }

    const data = await openaiRes.json();
    const content = data.choices?.[0]?.message?.content;
    let summary;
    try {
      summary = JSON.parse(content);
    } catch {
      return NextResponse.json(
        { error: 'Failed to parse summary' },
        { status: 500 }
      );
    }
    const { from, to } = getDateRange(new Date());

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
      return NextResponse.json({ error: selectError.message }, { status: 500 });
    }
    if (existing) {
      const { error: updateError } = await supabase
        .from('ai_summaries')
        .update({ summary })
        .eq('id', existing.id);
      if (updateError) {
        return NextResponse.json(
          { error: updateError.message },
          { status: 500 }
        );
      }
    } else {
      const { error: insertError } = await supabase
        .from('ai_summaries')
        .insert({ user_id: user.id, summary });
      if (insertError) {
        return NextResponse.json(
          { error: insertError.message },
          { status: 500 }
        );
      }
    }
    return NextResponse.json({ summary });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
