'use client';

import { useCallback, useMemo } from 'react';
import { useTodayAISummary, useSaveAISummary } from '@/hooks/use-ai-summary';
import { useNotesByDate } from '@/hooks/use-notes';
import { AISummaryLoadingSkeleton } from './loading-skeleton';
import { GeneratePrompt } from './generate-prompt';
import { ErrorMessage } from './error-message';
import { SummaryHeader } from './summary-header';
import { SummaryContent } from './summary-content';

export function AISummary() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const { data: notes, isPending: notesLoading } = useNotesByDate(
    todayStart.toISOString(),
    todayEnd.toISOString()
  );

  const {
    data: summary,
    isPending: summaryLoading,
    error: summaryError,
  } = useTodayAISummary();

  const saveSummaryMutation = useSaveAISummary();

  const notesTexts = useMemo(
    () => notes.map(n => n.note).filter((n): n is string => !!n),
    [notes]
  );

  const handleGenerateSummary = useCallback(() => {
    saveSummaryMutation.mutate(notesTexts);
  }, [saveSummaryMutation, notesTexts]);

  const handleRefresh = useCallback(() => {
    saveSummaryMutation.mutate(notesTexts);
  }, [saveSummaryMutation, notesTexts]);

  const isLoading = useMemo(
    () => summaryLoading || notesLoading || saveSummaryMutation.isPending,
    [summaryLoading, notesLoading, saveSummaryMutation.isPending]
  );

  const hasData = useMemo(() => !!summary, [summary]);

  const error = useMemo(
    () => summaryError || saveSummaryMutation.error,
    [summaryError, saveSummaryMutation.error]
  );

  if (isLoading) {
    return <AISummaryLoadingSkeleton />;
  }

  if (!hasData) {
    return (
      <GeneratePrompt
        onGenerate={handleGenerateSummary}
        isGenerating={saveSummaryMutation.isPending}
      />
    );
  }

  if (error) {
    return <ErrorMessage />;
  }

  return (
    <div className="space-y-2">
      <SummaryHeader
        onRefresh={handleRefresh}
        isRefreshing={saveSummaryMutation.isPending}
      />
      <SummaryContent summary={summary} />
    </div>
  );
}
