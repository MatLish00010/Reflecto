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
