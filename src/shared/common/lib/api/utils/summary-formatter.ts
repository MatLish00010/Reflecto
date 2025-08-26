import type { AISummaryData } from '@/shared/common/types';

export interface SummaryLabels {
  day: string;
  mainStory: string;
  keyEvents: string;
  emotionalMoments: string;
  ideas: string;
  triggers: string;
  resources: string;
  progress: string;
  observations: string;
  recommendations: string;
}

export interface SummaryField {
  key: keyof AISummaryData;
  label: string;
  isArray: boolean;
}

const SUMMARY_FIELDS: SummaryField[] = [
  { key: 'mainStory', label: 'mainStory', isArray: false },
  { key: 'keyEvents', label: 'keyEvents', isArray: true },
  { key: 'emotionalMoments', label: 'emotionalMoments', isArray: true },
  { key: 'ideas', label: 'ideas', isArray: true },
  { key: 'triggers', label: 'triggers', isArray: true },
  { key: 'resources', label: 'resources', isArray: true },
  { key: 'progress', label: 'progress', isArray: true },
  { key: 'observations', label: 'observations', isArray: true },
  { key: 'recommendations', label: 'recommendations', isArray: true },
];

export function formatNotesForPrompt(notes: string[]): string {
  return notes
    .reverse()
    .map((n, i) => `${i + 1}. ${n}`)
    .join('\n');
}

export function formatSummaryForPrompt(
  summary: AISummaryData,
  labels: SummaryLabels,
  dayNumber: number
): string {
  const parts: string[] = [];

  for (const field of SUMMARY_FIELDS) {
    const value = summary[field.key];
    const labelKey = field.label as keyof SummaryLabels;
    const label = labels[labelKey];

    if (!value) {
      continue;
    }

    if (field.isArray && Array.isArray(value) && value.length > 0) {
      parts.push(`${label}: ${value.join(', ')}`);
    } else if (!field.isArray && typeof value === 'string' && value.trim()) {
      parts.push(`${label}: ${value}`);
    }
  }

  return `${labels.day} ${dayNumber}:\n${parts.join('\n')}`;
}

export function formatDailySummariesForPrompt(
  summaries: AISummaryData[],
  labels: SummaryLabels
): string[] {
  return summaries.map((summary, index) =>
    formatSummaryForPrompt(summary, labels, index + 1)
  );
}
