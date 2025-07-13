import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { notes } = await req.json(); // notes: string[]
    if (!Array.isArray(notes) || notes.length === 0) {
      return NextResponse.json({ error: 'No notes provided' }, { status: 400 });
    }

    // Формируем промпт для ChatGPT
    const prompt = `Вот список заметок пользователя за день:\n${notes.map((n, i) => `${i + 1}. ${n}`).join('\n')}\n\nСделай краткое саммари по этим заметкам: \n- Определи настроение (позитивное/нейтральное/негативное)\n- Оцени продуктивность (высокая/средняя/низкая)\n- Выдели ключевые темы\n- Сформулируй 2-3 ключевых вывода и рекомендации.\nОтвет верни в формате JSON с полями: mood, productivity, keyThemes (массив), insights (массив), recommendations (массив)`;

    // Запрос к OpenAI
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
                'Ты — ассистент, который делает психологические саммари по дневнику пользователя.',
            },
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 600,
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

    return NextResponse.json({ summary });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
