export const aiSummaryPrompts = {
  ru: `Вот записи вашего дневника за день:
{notes}

Пожалуйста, выполните подробный психологический анализ этих записей в два шага:

ШАГ 1 - Основной анализ:
- Опишите общий сюжет дня, выделите ключевые события с привязкой к временным рамкам.
- Отметьте самые яркие эмоциональные реакции и чувства, которые проявились.
- Идентифицируйте повторяющиеся темы или мысли, которые проходят красной нитью.
- Дайте профессиональные наблюдения с точки зрения психолога, объясняя возможные причины и влияние этих событий и эмоций.
- Предложите конкретные, практичные рекомендации и советы, которые помогут разобраться с выявленными ситуациями и эмоциями.

ШАГ 2 - Лингвистическая проверка:
- Проследите, чтобы в ответе ко всем вашим наблюдениям и рекомендациям было обращение исключительно на "вы".
- Исключите любые обращения типа "пользователь", "клиент" или "человек".

Ответ оформите в формате JSON с полями:
- mainStory (строка) — обобщённый сюжет дня
- keyEvents (массив строк) — список ключевых событий
- emotionalMoments (массив строк) — описание эмоциональных моментов
- keyThemes (массив строк) — важные темы
- observations (массив строк) — профессиональные наблюдения
- recommendations (массив строк) — рекомендации и советы

Дополнительно, постарайтесь использовать ясный и деликатный язык, чтобы обеспечить максимально полезный и понимаемый анализ.`,

  en: `Here are your diary entries for the day:
{notes}

Please perform a detailed psychological analysis of these entries in two steps:

STEP 1 - Main Analysis:
- Describe the overall storyline of the day, highlighting key events with time references.
- Note the most vivid emotional reactions and feelings that emerged.
- Identify recurring themes or thoughts that run as a common thread.
- Provide professional observations from a psychologist's perspective, explaining possible causes and effects of these events and emotions.
- Suggest specific, practical recommendations and advice that will help address the identified situations and emotions.

STEP 2 - Linguistic Verification:
- Ensure that in your response, all observations and recommendations address exclusively as "you".
- Exclude any references like "user", "client", or "person".

Format your answer as JSON with fields:
- mainStory (string) - summarized storyline of the day
- keyEvents (array of strings) - list of key events
- emotionalMoments (array of strings) - description of emotional moments
- keyThemes (array of strings) - important themes
- observations (array of strings) - professional observations
- recommendations (array of strings) - recommendations and advice

Additionally, try to use clear and sensitive language to ensure the most useful and understandable analysis.`,
};

export const aiSummarySystemPrompts = {
  ru: 'Вы профессиональный психолог с многолетним опытом. Анализируйте записи с эмпатией и профессионализмом. Давайте персонализированные, полезные выводы и рекомендации. Всегда обращайтесь к пользователю на "вы", никогда не используйте слова "пользователь", "клиент", "человек".',
  en: 'You are a professional psychologist with years of experience. Analyze entries with empathy and professionalism. Provide personalized, helpful insights and recommendations. Always address the user as "you", never use words like "user", "client", "person".',
};

export type Locale = 'ru' | 'en';

export function getAISummaryPrompt(locale: Locale, notes: string[]): string {
  const prompt = aiSummaryPrompts[locale] || aiSummaryPrompts.ru;
  return prompt.replace(
    '{notes}',
    notes.map((n, i) => `${i + 1}. ${n}`).join('\n')
  );
}

export function getAISummarySystemPrompt(locale: Locale): string {
  return aiSummarySystemPrompts[locale] || aiSummarySystemPrompts.ru;
}
