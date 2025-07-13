import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { notes } = await req.json(); // notes: string[]
    if (!Array.isArray(notes) || notes.length === 0) {
      return NextResponse.json({ error: 'No notes provided' }, { status: 400 });
    }

    // Формируем промпт для ChatGPT
    const prompt = `Вот записи пользователя за день:\n${notes.map((n, i) => `${i + 1}. ${n}`).join('\n')}\n\nКак профессиональный психолог, проанализируйте эти записи и создайте персонализированное саммари. 

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

    return NextResponse.json({ summary });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
