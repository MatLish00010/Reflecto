'use client';

import { useCallback, useMemo, useState, useEffect } from 'react';
import {
  useAISummaryByDateRange,
  useCreateSummary,
} from '@/entities/ai-summary';
import { useNotesByDate } from '@/entities/note';
import { useAuthModalContext } from '@/shared/contexts/auth-modal-context';
import { useAlertContext } from '@/shared/providers/alert-provider';
import { AuthRequiredMessage } from '@/shared/components';
import { getDateRangeUTC } from '@/shared/lib/date-utils';
import { AISummaryLoadingSkeleton } from './loading-skeleton';
import { GeneratePrompt } from './generate-prompt';
import { SummaryHeader } from './summary-header';
import { SummaryContent } from './summary-content';

interface AISummaryProps {
  selectedDate?: Date;
  selectedDateStart?: Date;
  selectedDateEnd?: Date;
  isAuthenticated?: boolean;
}

export function AISummary({
  selectedDate: externalSelectedDate,
  selectedDateStart: externalSelectedDateStart,
  selectedDateEnd: externalSelectedDateEnd,
  isAuthenticated,
}: AISummaryProps = {}) {
  const [internalSelectedDate] = useState(new Date());
  const { showError } = useAlertContext();
  const { openModal } = useAuthModalContext();

  const selectedDate = externalSelectedDate || internalSelectedDate;

  const internalSelectedDateStart = useMemo(() => {
    const range = getDateRangeUTC(selectedDate);
    return new Date(range.from);
  }, [selectedDate]);

  const internalSelectedDateEnd = useMemo(() => {
    const range = getDateRangeUTC(selectedDate);
    return new Date(range.to);
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
    () => summaryLoading || notesLoading || createSummaryMutation.isPending,
    [summaryLoading, notesLoading, createSummaryMutation.isPending]
  );

  const hasData = useMemo(() => !!summary, [summary]);

  const shouldShowLoading = useMemo(
    () => isLoading || (createSummaryMutation.isSuccess && !summary),
    [isLoading, createSummaryMutation.isSuccess, summary]
  );

  const error = useMemo(
    () => summaryError || createSummaryMutation.error,
    [summaryError, createSummaryMutation.error]
  );

  useEffect(() => {
    if (error) {
      showError(error.message);
    }
  }, [error, showError]);

  if (!isAuthenticated) {
    return <AuthRequiredMessage messageKey="auth.signInToViewAnalysis" />;
  }

  if (shouldShowLoading) {
    return <AISummaryLoadingSkeleton />;
  }

  if (!hasData && !createSummaryMutation.isSuccess) {
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
