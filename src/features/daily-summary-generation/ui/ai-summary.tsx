'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useUser } from '@/entities';
import { useDailySummaryByDateRange } from '@/entities/daily-summary';
import { useNotesByDate } from '@/entities/note';
import { useCreateSummary } from '@/features/daily-summary-generation';
import { AuthRequiredMessage } from '@/shared/client/components';
import { useAuthModalContext } from '@/shared/client/contexts/auth-modal-context';
import { Loader2 } from '@/shared/client/icons';
import { useAlertContext } from '@/shared/client/providers/alert-provider';
import {
  AISummaryLoadingSkeleton,
  GeneratePrompt,
  Summary,
} from '@/shared/client/ui';
import { getDateRangeForDay } from '@/shared/common/lib/date-utils';

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
    () => summaryLoading || notesLoading || isUserLoading,
    [summaryLoading, notesLoading, isUserLoading]
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

  if (createSummaryMutation.isPending) {
    return <AISummaryLoadingSkeleton />;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthRequiredMessage messageKey="auth.signInToViewAnalysis" />;
  }

  if (hasData) {
    return (
      <Summary
        summary={summary}
        onRefresh={handleRefresh}
        isRefreshing={createSummaryMutation.isPending}
      />
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
