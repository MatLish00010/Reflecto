import { Note, DailySummary, WeeklySummary } from '../types/analytics';
import type { AISummaryData } from '@/shared/types';

export function calculateAverageNoteLength(notes: Note[]): number {
  if (!notes || notes.length === 0) return 0;

  const totalLength = notes.reduce(
    (acc, note) => acc + (note.note?.length || 0),
    0
  );

  return Math.round(totalLength / notes.length);
}

export function calculateTotalCharacters(notes: Note[]): number {
  return notes.reduce((acc, note) => acc + (note.note?.length || 0), 0);
}

export function getSummariesCount(
  summaries: DailySummary[] | WeeklySummary[] | AISummaryData[]
): number {
  return Array.isArray(summaries) ? summaries.length : 0;
}

export function formatNumber(value: number): string {
  return value.toLocaleString();
}

export function calculateCompletionRate(notes: Note[]): number {
  if (!notes || notes.length === 0) return 0;

  const daysWithEntries = new Set();
  notes.forEach(note => {
    const date = new Date(note.created_at).toISOString().split('T')[0];
    daysWithEntries.add(date);
  });

  return Math.round((daysWithEntries.size / 30) * 100);
}
