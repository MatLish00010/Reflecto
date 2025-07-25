export const aiSummaryPrompts = {
  ru: `Вот записи вашего дневника за день:
{notes}

Пожалуйста, выполните глубокий психологический анализ этих записей в три этапа:

ЭТАП 1 - Основной анализ:
- Опишите общий сюжет дня, выделите ключевые события с привязкой к временным рамкам
- Отметьте самые яркие эмоциональные реакции и чувства, которые проявились
- Идентифицируйте повторяющиеся темы или мысли, которые проходят красной нитью
- Выделите идеи, которые были упомянуты в заметках (творческие идеи, планы, решения, инсайты, проекты)
- Проанализируйте когнитивные искажения (например, катастрофизация, черно-белое мышление, долженствование)
- Выявите паттерны поведения и реакции на стрессовые ситуации
- Определите триггеры, которые вызвали сильные эмоциональные реакции

ЭТАП 2 - Глубинный анализ:
- Оцените уровень стресса и тревожности в течение дня
- Проанализируйте качество сна, питания и физической активности (если упоминается)
- Выявите социальные взаимодействия и их влияние на эмоциональное состояние
- Определите ресурсы и сильные стороны, которые помогли справиться с трудностями
- Отметьте прогресс и позитивные изменения по сравнению с предыдущими периодами
- Проанализируйте контекст и окружение, влияющие на состояние

ЭТАП 3 - Профессиональные выводы:
- Дайте профессиональные наблюдения с точки зрения психолога, объясняя возможные причины и влияние событий
- Предложите конкретные, практичные рекомендации для работы с выявленными паттернами
- Включите техники саморегуляции и копинг-стратегии
- Предложите упражнения для работы с когнитивными искажениями
- Дайте рекомендации по улучшению качества жизни и эмоционального благополучия

Лингвистическая проверка:
- Обращайтесь исключительно на "вы"
- Исключите обращения типа "пользователь", "клиент" или "человек"
- Используйте эмпатичный и поддерживающий тон

Ответ оформите в формате JSON с полями:
- mainStory (строка) — обобщённый сюжет дня
- keyEvents (массив строк) — список ключевых событий
- emotionalMoments (массив строк) — описание эмоциональных моментов
- ideas (массив строк) — идеи, которые были упомянуты в заметках
- cognitivePatterns (массив строк) — выявленные когнитивные искажения и паттерны мышления
- behavioralPatterns (массив строк) — паттерны поведения и реакции
- triggers (массив строк) — триггеры эмоциональных реакций
- resources (массив строк) — ресурсы и сильные стороны
- progress (массив строк) — прогресс и позитивные изменения
- observations (массив строк) — профессиональные наблюдения
- recommendations (массив строк) — рекомендации и советы
- copingStrategies (массив строк) — техники саморегуляции и копинг-стратегии

Используйте ясный, деликатный и поддерживающий язык для максимально полезного анализа.`,

  en: `Here are your diary entries for the day:
{notes}

Please perform a deep psychological analysis of these entries in three stages:

STAGE 1 - Main Analysis:
- Describe the overall storyline of the day, highlighting key events with time references
- Note the most vivid emotional reactions and feelings that emerged
- Identify recurring themes or thoughts that run as a common thread
- Extract ideas mentioned in the notes (creative ideas, plans, solutions, insights, projects)
- Analyze cognitive distortions (e.g., catastrophizing, black-and-white thinking, should statements)
- Identify behavioral patterns and stress response mechanisms
- Determine triggers that caused strong emotional reactions

STAGE 2 - Deep Analysis:
- Assess stress and anxiety levels throughout the day
- Analyze sleep quality, nutrition, and physical activity (if mentioned)
- Examine social interactions and their impact on emotional state
- Identify resources and strengths that helped cope with difficulties
- Note progress and positive changes compared to previous periods
- Analyze context and environment affecting the state

STAGE 3 - Professional Insights:
- Provide professional observations from a psychologist's perspective, explaining possible causes and effects
- Suggest specific, practical recommendations for working with identified patterns
- Include self-regulation techniques and coping strategies
- Propose exercises for working with cognitive distortions
- Give recommendations for improving life quality and emotional well-being

Linguistic Verification:
- Address exclusively as "you"
- Exclude references like "user", "client", or "person"
- Use empathetic and supportive tone

Format your answer as JSON with fields:
- mainStory (string) - summarized storyline of the day
- keyEvents (array of strings) - list of key events
- emotionalMoments (array of strings) - description of emotional moments
- ideas (array of strings) - ideas mentioned in the notes
- cognitivePatterns (array of strings) - identified cognitive distortions and thinking patterns
- behavioralPatterns (array of strings) - behavioral patterns and responses
- triggers (array of strings) - emotional reaction triggers
- resources (array of strings) - resources and strengths
- progress (array of strings) - progress and positive changes
- observations (array of strings) - professional observations
- recommendations (array of strings) - recommendations and advice
- copingStrategies (array of strings) - self-regulation techniques and coping strategies

Use clear, sensitive, and supportive language for the most useful analysis.`,
};

export const aiSummarySystemPrompts = {
  ru: 'Вы опытный психотерапевт с многолетней практикой в когнитивно-поведенческой терапии, диалектической поведенческой терапии и других современных подходах. Анализируйте записи с глубокой эмпатией, профессионализмом и клиническим опытом. Выявляйте паттерны мышления, поведения и эмоциональные триггеры. Давайте персонализированные, практичные выводы и рекомендации, основанные на доказательных методах психотерапии. Всегда обращайтесь к пользователю на "вы", используйте поддерживающий и эмпатичный тон.',
  en: 'You are an experienced psychotherapist with years of practice in cognitive behavioral therapy, dialectical behavior therapy, and other modern approaches. Analyze entries with deep empathy, professionalism, and clinical experience. Identify thinking patterns, behaviors, and emotional triggers. Provide personalized, practical insights and recommendations based on evidence-based psychotherapy methods. Always address the user as "you", use supportive and empathetic tone.',
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
