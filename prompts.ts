export const aiSummaryPrompts = {
  ru: `Записи вашего дневника за день:
{notes}

АНАЛИЗИРУЙТЕ КОНКРЕТНО:
- Используйте конкретные цитаты и детали из записей
- Приводите точные примеры событий и реакций
- Указывайте временные рамки, если они упоминаются
- Используйте конкретные детали вместо общих фраз

РАЗБИВКА ПО ТОПИКАМ:
- Анализируйте каждую категорию отдельно
- Если в записях есть подходящий контент для топика - заполняйте его
- Если для топика нет подходящего контента - оставляйте пустой массив []
- НЕ создавайте искусственные наблюдения для пустых топиков
- НЕ используйте общие фразы типа "в целом день был спокойным" если нет конкретных фактов

ПРИМЕР ПРАВИЛЬНОГО АНАЛИЗА:
❌ 'Вы испытывали стресс на работе'
✅ 'Вы упомянули, что "рабочие встречи были долгими и неэффективными", что вызвало разочарование'

ПРИМЕР РАБОТЫ С ТОПИКАМИ:
- Если есть записи о работе → заполняем keyEvents, triggers, cognitivePatterns
- Если нет записей о здоровье → оставляем resources: [], progress: []
- Если нет эмоциональных моментов → оставляем emotionalMoments: []

ИЗБЕГАЙТЕ общих фраз типа:
- 'вы часто...'
- 'обычно вы...'
- 'в целом...'

Вместо этого используйте:
- 'в записи указано...'
- 'вы написали, что...'
- 'согласно вашим заметкам...'

Выполните глубокий психологический анализ записей:

1. ОСНОВНОЙ АНАЛИЗ:
- Опишите общий сюжет дня с конкретными событиями из записей
- Отметьте эмоциональные реакции с цитатами из текста
- Идентифицируйте повторяющиеся темы с примерами
- Выделите идеи и проекты с конкретными деталями
- Проанализируйте когнитивные искажения с примерами из записей
- Выявите паттерны поведения с конкретными ситуациями
- Определите триггеры с указанием событий

2. ГЛУБИННЫЙ АНАЛИЗ:
- Оцените уровень стресса с примерами из записей
- Проанализируйте физическое состояние, если упоминается
- Выявите социальные взаимодействия с конкретными деталями
- Определите ресурсы и сильные стороны с примерами
- Отметьте прогресс с конкретными изменениями
- Проанализируйте контекст с деталями окружения

3. ПРОФЕССИОНАЛЬНЫЕ ВЫВОДЫ:
- Дайте наблюдения с опорой на конкретные факты из записей
- Предложите рекомендации, основанные на выявленных паттернах
- Включите техники саморегуляции
- Предложите упражнения для работы с искажениями
- Дайте рекомендации по улучшению качества жизни

Обращайтесь на "вы", используйте эмпатичный тон.

Ответ в JSON формате:
- mainStory (строка) — обобщённый сюжет дня с конкретными деталями
- keyEvents (массив строк) — ключевые события с деталями из записей
- emotionalMoments (массив строк) — эмоциональные моменты с контекстом
- ideas (массив строк) — идеи с конкретными деталями
- cognitivePatterns (массив строк) — когнитивные искажения с примерами
- behavioralPatterns (массив строк) — паттерны поведения с ситуациями
- triggers (массив строк) — триггеры с конкретными событиями
- resources (массив строк) — ресурсы и сильные стороны с примерами
- progress (массив строк) — прогресс с конкретными изменениями
- observations (массив строк) — профессиональные наблюдения с фактами
- recommendations (массив строк) — рекомендации
- copingStrategies (массив строк) — техники совладания

ВАЖНО: 
- Все массивы должны содержать только строки, а не объекты
- Если для топика нет подходящего контента - возвращайте пустой массив []
- НЕ создавайте искусственные наблюдения для заполнения пустых топиков
- Каждое наблюдение должно содержать конкретные детали из записей дневника

Пример правильного ответа:
"keyEvents": ["Событие 1 с деталями", "Событие 2 с деталями"]
"resources": [] // if no resource records
"emotionalMoments": [] // if no emotional moments`,

  en: `Your diary entries for the day:
{notes}

ANALYZE CONCRETELY:
- Use specific quotes and details from the entries
- Provide exact examples of events and reactions
- Indicate time frames if mentioned
- Use specific details instead of general phrases

TOPIC BREAKDOWN:
- Analyze each category separately
- If there is suitable content in the entries for a topic - fill it
- If there is no suitable content for a topic - leave it as empty array []
- DO NOT create artificial observations for empty topics
- DO NOT use general phrases like "overall the day was calm" if there are no specific facts

EXAMPLE OF CORRECT ANALYSIS:
❌ 'You experienced stress at work'
✅ 'You mentioned that "work meetings were long and inefficient", which caused disappointment'

EXAMPLE OF TOPIC HANDLING:
- If there are work-related entries → fill keyEvents, triggers, cognitivePatterns
- If there are no health-related entries → leave resources: [], progress: []
- If there are no emotional moments → leave emotionalMoments: []

AVOID general phrases like:
- 'you often...'
- 'usually you...'
- 'in general...'

Instead use:
- 'the entry states...'
- 'you wrote that...'
- 'according to your notes...'

Perform a deep psychological analysis of the entries:

1. MAIN ANALYSIS:
- Describe the overall storyline of the day with specific events from entries
- Note emotional reactions with quotes from text
- Identify recurring themes with examples
- Extract ideas and projects with specific details
- Analyze cognitive distortions with examples from entries
- Identify behavioral patterns with specific situations
- Determine triggers with event specifications

2. DEEP ANALYSIS:
- Assess stress levels with examples from entries
- Analyze physical condition if mentioned
- Examine social interactions with specific details
- Identify resources and strengths with examples
- Note progress with specific changes
- Analyze context with environmental details

3. PROFESSIONAL INSIGHTS:
- Provide observations based on specific facts from entries
- Suggest recommendations based on identified patterns
- Include self-regulation techniques
- Propose exercises for working with distortions
- Give recommendations for improving life quality

Address as "you", use empathetic tone.

Answer in JSON format:
- mainStory (string) - summarized storyline of the day with specific details
- keyEvents (array of strings) - key events with details from entries
- emotionalMoments (array of strings) - emotional moments with context
- ideas (array of strings) - ideas with specific details
- cognitivePatterns (array of strings) - cognitive distortions with examples
- behavioralPatterns (array of strings) - behavioral patterns with situations
- triggers (array of strings) - triggers with specific events
- resources (array of strings) - resources and strengths with examples
- progress (array of strings) - progress with specific changes
- observations (array of strings) - professional observations with facts
- recommendations (array of strings) - recommendations
- copingStrategies (array of strings) - coping techniques

IMPORTANT: 
- All arrays must contain only strings, not objects
- If there is no suitable content for a topic - return empty array []
- DO NOT create artificial observations to fill empty topics
- Each observation must contain specific details from diary entries

Example of correct response:
"keyEvents": ["Event 1 with details", "Event 2 with details"]
"resources": [] // if there are no resource-related entries
"emotionalMoments": [] // if there are no emotional moments`,
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

export const weeklySummaryPrompts = {
  ru: `ВНИМАНИЕ: Проанализируйте ВСЕ дни недели без исключения. Каждый день содержит важную информацию.

Дневные саммари за неделю:
{dailySummaries}

ВАЖНО: Убедитесь, что вы учли информацию из ВСЕХ дней при анализе. Не пропускайте ни одного дня.

АНАЛИЗИРУЙТЕ КОНКРЕТНО:
- Указывайте день недели для каждого факта
- Приводите минимум 2-3 конкретных примера для каждого паттерна
- Показывайте, как события развивались во времени
- Используйте конкретные детали вместо общих фраз

РАЗБИВКА ПО ТОПИКАМ:
- Анализируйте каждую категорию отдельно
- Если в дневных саммари есть подходящий контент для топика - заполняйте его
- Если для топика нет подходящего контента - оставляйте пустой массив []
- НЕ создавайте искусственные наблюдения для пустых топиков
- НЕ используйте общие фразы типа "в целом неделя была продуктивной" если нет конкретных фактов

ПРИМЕР ПРАВИЛЬНОГО АНАЛИЗА:
❌ 'Вы часто беспокоитесь о работе'
✅ 'В понедельник вы беспокоились о рабочих встречах, в среду - о показателях продуктивности, в пятницу - о подготовке к важному событию'

ПРИМЕР РАБОТЫ С ТОПИКАМИ:
- Если есть записи о работе из разных дней → заполняем keyEvents, triggers, cognitivePatterns
- Если нет записей о здоровье за неделю → оставляем resources: [], progress: []
- Если нет эмоциональных моментов → оставляем emotionalMoments: []

ИЗБЕГАЙТЕ общих фраз типа:
- 'вы часто...'
- 'обычно вы...'
- 'в целом...'

Вместо этого используйте:
- 'в понедельник вы...'
- 'во вторник вы...'
- 'к среде ситуация...'

Выполните глубокий психологический анализ всех дневных саммари:

1. ОБЩИЙ АНАЛИЗ НЕДЕЛИ:
- Объедините сюжеты всех дней в единую историю недели
- Выделите ключевые события из каждого дня с указанием даты
- Отследите эмоциональную динамику по дням
- Найдите повторяющиеся темы и паттерны с конкретными примерами

2. ПАТТЕРНЫ И ТРЕНДЫ:
- Когнитивные паттерны мышления (с примерами из разных дней)
- Поведенческие реакции на стресс (конкретные ситуации)
- Эмоциональные триггеры (с указанием дней и событий)
- Социальные взаимодействия (когда и с кем)
- Физическая активность и самочувствие (дни тренировок, показатели)

3. РЕСУРСЫ И ПРОГРЕСС:
- Сильные стороны и ресурсы (конкретные примеры)
- Позитивные изменения (как развивались по дням)
- Успешные стратегии совладания (когда применялись)

4. РЕКОМЕНДАЦИИ:
- Конкретные техники саморегуляции
- Работа с когнитивными искажениями
- Улучшение качества жизни

Обращайтесь на "вы", используйте эмпатичный тон.

Ответ в JSON формате:
- mainStory (строка) — обобщённый сюжет недели с указанием ключевых дней
- keyEvents (массив строк) — ключевые события из всех дней с датами
- emotionalMoments (массив строк) — эмоциональные моменты недели с контекстом
- ideas (массив строк) — идеи и проекты с указанием дней развития
- cognitivePatterns (массив строк) — когнитивные паттерны с примерами
- behavioralPatterns (массив строк) — поведенческие паттерны с ситуациями
- triggers (массив строк) — эмоциональные триггеры с конкретными событиями
- resources (массив строк) — ресурсы и сильные стороны с примерами
- progress (массив строк) — прогресс и изменения по дням
- observations (массив строк) — профессиональные наблюдения с фактами
- recommendations (массив строк) — рекомендации
- copingStrategies (массив строк) — техники совладания

ВАЖНО: 
- Все массивы должны содержать только строки, а не объекты
- Если для топика нет подходящего контента - возвращайте пустой массив []
- НЕ создавайте искусственные наблюдения для заполнения пустых топиков
- Каждое наблюдение должно содержать конкретные детали из дневных записей

Пример правильного ответа:
"keyEvents": ["Понедельник: Событие 1 с деталями", "Среда: Событие 2 с деталями"]
"resources": [] // if no resource records for the week
"emotionalMoments": [] // if no emotional moments`,

  en: `ATTENTION: Analyze ALL days of the week without exception. Each day contains important information.

Daily summaries for the week:
{dailySummaries}

IMPORTANT: Make sure you include information from ALL days in your analysis. Do not skip any days.

ANALYZE CONCRETELY:
- Specify the day of the week for each fact
- Provide at least 2-3 specific examples for each pattern
- Show how events developed over time
- Use specific details instead of general phrases

TOPIC BREAKDOWN:
- Analyze each category separately
- If there is suitable content in daily summaries for a topic - fill it
- If there is no suitable content for a topic - leave it as empty array []
- DO NOT create artificial observations for empty topics
- DO NOT use general phrases like "overall the week was productive" if there are no specific facts

EXAMPLE OF CORRECT ANALYSIS:
❌ 'You often worry about work'
✅ 'On Monday you worried about work meetings, on Wednesday - about productivity indicators, on Friday - about preparing for an important event'

EXAMPLE OF TOPIC HANDLING:
- If there are work-related entries from different days → fill keyEvents, triggers, cognitivePatterns
- If there are no health-related entries for the week → leave resources: [], progress: []
- If there are no emotional moments → leave emotionalMoments: []

AVOID general phrases like:
- 'you often...'
- 'usually you...'
- 'in general...'

Instead use:
- 'on Monday you...'
- 'on Tuesday you...'
- 'by Wednesday the situation...'

Perform a deep psychological analysis of all daily summaries:

1. OVERALL WEEK ANALYSIS:
- Combine stories from all days into a unified weekly narrative
- Extract key events from each day with date specification
- Track emotional dynamics across days
- Find recurring themes and patterns with specific examples

2. PATTERNS AND TRENDS:
- Cognitive thinking patterns (with examples from different days)
- Behavioral stress responses (specific situations)
- Emotional triggers (with day and event specifications)
- Social interactions (when and with whom)
- Physical activity and well-being (training days, indicators)

3. RESOURCES AND PROGRESS:
- Strengths and resources (specific examples)
- Positive changes (how they developed over days)
- Successful coping strategies (when they were applied)

4. RECOMMENDATIONS:
- Specific self-regulation techniques
- Working with cognitive distortions
- Improving life quality

Address as "you", use empathetic tone.

Answer in JSON format:
- mainStory (string) - summarized weekly storyline with key days mentioned
- keyEvents (array of strings) - key events from all days with dates
- emotionalMoments (array of strings) - emotional moments of the week with context
- ideas (array of strings) - ideas and projects with development days specified
- cognitivePatterns (array of strings) - cognitive patterns with examples
- behavioralPatterns (array of strings) - behavioral patterns with situations
- triggers (array of strings) - emotional triggers with specific events
- resources (array of strings) - resources and strengths with examples
- progress (array of strings) - progress and changes by days
- observations (array of strings) - professional observations with facts
- recommendations (array of strings) - recommendations
- copingStrategies (array of strings) - coping techniques

IMPORTANT: 
- All arrays must contain only strings, not objects
- If there is no suitable content for a topic - return empty array []
- DO NOT create artificial observations to fill empty topics
- Each observation must contain specific details from daily entries

Example of correct response:
"keyEvents": ["Monday: Event 1 with details", "Wednesday: Event 2 with details"]
"resources": [] // if there are no resource-related entries for the week
"emotionalMoments": [] // if there are no emotional moments`,
};

export const weeklySummarySystemPrompts = {
  ru: 'Вы опытный психотерапевт с многолетней практикой в когнитивно-поведенческой терапии, диалектической поведенческой терапии и других современных подходах. Анализируйте недельные саммари с глубокой эмпатией, профессионализмом и клиническим опытом. Выявляйте долгосрочные паттерны мышления, поведения и эмоциональные триггеры. Давайте персонализированные, практичные выводы и рекомендации, основанные на доказательных методах психотерапии. Всегда обращайтесь к пользователю на "вы", используйте поддерживающий и эмпатичный тон.',
  en: 'You are an experienced psychotherapist with years of practice in cognitive behavioral therapy, dialectical behavior therapy, and other modern approaches. Analyze weekly summaries with deep empathy, professionalism, and clinical experience. Identify long-term thinking patterns, behaviors, and emotional triggers. Provide personalized, practical insights and recommendations based on evidence-based psychotherapy methods. Always address the user as "you", use supportive and empathetic tone.',
};

export function getWeeklySummaryPrompt(
  locale: Locale,
  dailySummaries: string[]
): string {
  const prompt = weeklySummaryPrompts[locale] || weeklySummaryPrompts.ru;
  return prompt.replace('{dailySummaries}', dailySummaries.join('\n\n'));
}

export function getWeeklySummarySystemPrompt(locale: Locale): string {
  return weeklySummarySystemPrompts[locale] || weeklySummarySystemPrompts.ru;
}

export const summaryLabels = {
  ru: {
    day: 'День',
    mainStory: 'Основная история',
    keyEvents: 'Ключевые события',
    emotionalMoments: 'Эмоциональные моменты',
    ideas: 'Идеи',
    cognitivePatterns: 'Когнитивные паттерны',
    behavioralPatterns: 'Поведенческие паттерны',
    triggers: 'Триггеры',
    resources: 'Ресурсы',
    progress: 'Прогресс',
    observations: 'Наблюдения',
    recommendations: 'Рекомендации',
    copingStrategies: 'Стратегии совладания',
  },
  en: {
    day: 'Day',
    mainStory: 'Main Story',
    keyEvents: 'Key Events',
    emotionalMoments: 'Emotional Moments',
    ideas: 'Ideas',
    cognitivePatterns: 'Cognitive Patterns',
    behavioralPatterns: 'Behavioral Patterns',
    triggers: 'Triggers',
    resources: 'Resources',
    progress: 'Progress',
    observations: 'Observations',
    recommendations: 'Recommendations',
    copingStrategies: 'Coping Strategies',
  },
} as const;

export type SupportedLocale = keyof typeof summaryLabels;

export function getSummaryLabels(
  locale: string
): (typeof summaryLabels)[SupportedLocale] {
  return summaryLabels[locale as SupportedLocale] || summaryLabels.ru;
}
