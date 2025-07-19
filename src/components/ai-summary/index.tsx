'use client';

import { useCallback, useMemo, useState, useEffect } from 'react';
import {
  useAISummaryByDateRange,
  useCreateSummary,
} from '@/hooks/use-ai-summary';
import { useNotesByDate } from '@/hooks/use-notes';
import { useAlertContext } from '@/components/alert-provider';
import { AISummaryLoadingSkeleton } from './loading-skeleton';
import { GeneratePrompt } from './generate-prompt';
import { SummaryHeader } from './summary-header';
import { SummaryContent } from './summary-content';

interface AISummaryProps {
  selectedDate?: Date;
  selectedDateStart?: Date;
  selectedDateEnd?: Date;
}

export function AISummary({
  selectedDate: externalSelectedDate,
  selectedDateStart: externalSelectedDateStart,
  selectedDateEnd: externalSelectedDateEnd,
}: AISummaryProps = {}) {
  const [internalSelectedDate] = useState(new Date());
  const { showError } = useAlertContext();

  const selectedDate = externalSelectedDate || internalSelectedDate;

  const internalSelectedDateStart = useMemo(() => {
    const start = new Date(selectedDate);
    start.setHours(0, 0, 0, 0);
    return start;
  }, [selectedDate]);

  const internalSelectedDateEnd = useMemo(() => {
    const end = new Date(selectedDate);
    end.setHours(23, 59, 59, 999);
    return end;
  }, [selectedDate]);

  const selectedDateStart =
    externalSelectedDateStart || internalSelectedDateStart;
  const selectedDateEnd = externalSelectedDateEnd || internalSelectedDateEnd;

  const { data: notes, isPending: notesLoading } = useNotesByDate(
    selectedDateStart.toISOString(),
    selectedDateEnd.toISOString()
  );

  const {
    data: summary,
    isPending: summaryLoading,
    error: summaryError,
  } = useAISummaryByDateRange(
    selectedDateStart.toISOString(),
    selectedDateEnd.toISOString()
  );

  const createSummaryMutation = useCreateSummary();

  const notesTexts = useMemo(
    () => notes.map(n => n.note).filter((n): n is string => !!n),
    [notes]
  );

  const handleGenerateSummary = useCallback(() => {
    createSummaryMutation.mutate({
      notes: notesTexts,
      from: selectedDateStart.toISOString(),
      to: selectedDateEnd.toISOString(),
    });
  }, [createSummaryMutation, notesTexts, selectedDateStart, selectedDateEnd]);

  const handleRefresh = useCallback(() => {
    createSummaryMutation.mutate({
      notes: notesTexts,
      from: selectedDateStart.toISOString(),
      to: selectedDateEnd.toISOString(),
    });
  }, [createSummaryMutation, notesTexts, selectedDateStart, selectedDateEnd]);

  const isLoading = useMemo(
    () => summaryLoading || notesLoading || createSummaryMutation.isPending,
    [summaryLoading, notesLoading, createSummaryMutation.isPending]
  );

  const hasData = useMemo(() => !!summary, [summary]);

  const error = useMemo(
    () => summaryError || createSummaryMutation.error,
    [summaryError, createSummaryMutation.error]
  );

  useEffect(() => {
    if (error) {
      showError(error.message);
    }
  }, [error, showError]);

  if (isLoading) {
    return <AISummaryLoadingSkeleton />;
  }

  if (!hasData) {
    return (
      <GeneratePrompt
        selectedDate={selectedDate}
        onGenerate={handleGenerateSummary}
        isGenerating={createSummaryMutation.isPending}
        hasNotes={notes.length > 0}
      />
    );
  }

  return (
    <div className="space-y-4">
      <SummaryHeader
        onRefresh={handleRefresh}
        isRefreshing={createSummaryMutation.isPending}
      />
      <SummaryContent summary={summary} />
    </div>
  );
}
