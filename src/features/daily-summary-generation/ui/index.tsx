'use client';

import { useCallback, useMemo, useState, useEffect } from 'react';
import { useCreateSummary } from '@/features/daily-summary-generation';
import { useDailySummaryByDateRange } from '@/entities/daily-summary';
import { useNotesByDate } from '@/entities/note';
import { useAuthModalContext } from '@/shared/contexts/auth-modal-context';
import { useAlertContext } from '@/shared/providers/alert-provider';
import { AuthRequiredMessage } from '@/shared/components';
import { getDateRangeForDay } from '@/shared/lib/date-utils';
import { AISummaryLoadingSkeleton } from './loading-skeleton';
import { GeneratePrompt } from './generate-prompt';
import { SummaryHeader, SummaryContent } from '@/shared/ui';
import { useUser } from '@/entities';

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
  const { openModal } = useAuthModalContext();

  const selectedDate = externalSelectedDate || internalSelectedDate;

  const internalSelectedDateStart = useMemo(() => {
    const range = getDateRangeForDay(selectedDate);
    return new Date(range.from);
  }, [selectedDate]);

  const internalSelectedDateEnd = useMemo(() => {
    const range = getDateRangeForDay(selectedDate);
    return new Date(range.to);
  }, [selectedDate]);

  const selectedDateStart =
    externalSelectedDateStart || internalSelectedDateStart;
  const selectedDateEnd = externalSelectedDateEnd || internalSelectedDateEnd;

  const { isAuthenticated, isLoading: isUserLoading } = useUser();

  const { data: notes, isLoading: notesLoading } = useNotesByDate(
    selectedDateStart.toISOString(),
    selectedDateEnd.toISOString()
  );

  const {
    data: summary,
    isLoading: summaryLoading,
    error: summaryError,
  } = useDailySummaryByDateRange(
    selectedDateStart.toISOString(),
    selectedDateEnd.toISOString()
  );

  const createSummaryMutation = useCreateSummary();

  const notesTexts = useMemo(
    () => notes.map(n => n.note).filter((n): n is string => !!n),
    [notes]
  );

  const handleGenerateSummary = useCallback(() => {
    if (!isAuthenticated) {
      openModal();
      return;
    }
    createSummaryMutation.mutate({
      notes: notesTexts,
      from: selectedDateStart.toISOString(),
      to: selectedDateEnd.toISOString(),
    });
  }, [
    isAuthenticated,
    openModal,
    createSummaryMutation,
    notesTexts,
    selectedDateStart,
    selectedDateEnd,
  ]);

  const handleRefresh = useCallback(() => {
    if (!isAuthenticated) {
      openModal();
      return;
    }
    createSummaryMutation.mutate({
      notes: notesTexts,
      from: selectedDateStart.toISOString(),
      to: selectedDateEnd.toISOString(),
    });
  }, [
    isAuthenticated,
    openModal,
    createSummaryMutation,
    notesTexts,
    selectedDateStart,
    selectedDateEnd,
  ]);

  const isLoading = useMemo(
    () =>
      summaryLoading ||
      notesLoading ||
      createSummaryMutation.isPending ||
      isUserLoading,
    [
      summaryLoading,
      notesLoading,
      createSummaryMutation.isPending,
      isUserLoading,
    ]
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

  if (!isAuthenticated) {
    return <AuthRequiredMessage messageKey="auth.signInToViewAnalysis" />;
  }

  if (hasData) {
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

  return (
    <GeneratePrompt
      selectedDate={selectedDate}
      onGenerate={handleGenerateSummary}
      isGenerating={createSummaryMutation.isPending}
      hasNotes={notes.length > 0}
    />
  );
}
