'use client';

import { useCallback, useMemo, useState, useEffect } from 'react';
import {
  useAISummaryByDateRange,
  useSaveAISummary,
} from '@/hooks/use-ai-summary';
import { useNotesByDate } from '@/hooks/use-notes';
import { useAlertContext } from '@/components/alert-provider';
import { AISummaryLoadingSkeleton } from './loading-skeleton';
import { GeneratePrompt } from './generate-prompt';
import { SummaryHeader } from './summary-header';
import { SummaryContent } from './summary-content';

export function AISummary() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { showError } = useAlertContext();

  const selectedDateStart = useMemo(() => {
    const start = new Date(selectedDate);
    start.setHours(0, 0, 0, 0);
    return start;
  }, [selectedDate]);

  const selectedDateEnd = useMemo(() => {
    const end = new Date(selectedDate);
    end.setHours(23, 59, 59, 999);
    return end;
  }, [selectedDate]);

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

  const saveSummaryMutation = useSaveAISummary();

  const notesTexts = useMemo(
    () => notes.map(n => n.note).filter((n): n is string => !!n),
    [notes]
  );

  const handleGenerateSummary = useCallback(() => {
    saveSummaryMutation.mutate({
      notes: notesTexts,
      date: selectedDate.toISOString(),
    });
  }, [saveSummaryMutation, notesTexts, selectedDate]);

  const handleRefresh = useCallback(() => {
    saveSummaryMutation.mutate({
      notes: notesTexts,
      date: selectedDate.toISOString(),
    });
  }, [saveSummaryMutation, notesTexts, selectedDate]);

  const handleDateChange = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  const isLoading = useMemo(
    () => summaryLoading || notesLoading || saveSummaryMutation.isPending,
    [summaryLoading, notesLoading, saveSummaryMutation.isPending]
  );

  const hasData = useMemo(() => !!summary, [summary]);

  const error = useMemo(
    () => summaryError || saveSummaryMutation.error,
    [summaryError, saveSummaryMutation.error]
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
        onDateChange={handleDateChange}
        onGenerate={handleGenerateSummary}
        isGenerating={saveSummaryMutation.isPending}
        hasNotes={notes.length > 0}
      />
    );
  }

  return (
    <div className="space-y-4">
      <SummaryHeader
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
        onRefresh={handleRefresh}
        isRefreshing={saveSummaryMutation.isPending}
      />
      <SummaryContent summary={summary} />
    </div>
  );
}
