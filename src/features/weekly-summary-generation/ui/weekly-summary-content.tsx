'use client';

import { useCallback, useMemo, useEffect } from 'react';
import { useCreateWeeklySummary } from '@/features/weekly-summary-generation';
import { useWeeklySummary } from '@/entities/weekly-summary';
import { useDailySummaries } from '@/entities/daily-summary';
import { useAuthModalContext } from '@/shared/contexts/auth-modal-context';
import { useAlertContext } from '@/shared/providers/alert-provider';
import { AuthRequiredMessage } from '@/shared/components';
import { getWeekRange, useWeekFromUrl } from '@/shared/lib/date-utils';
import { AISummaryLoadingSkeleton, Summary } from '@/shared/ui';
import { GeneratePrompt } from '@/shared/ui';
import { WeekPicker } from '@/shared/ui';
import { useUser } from '@/entities';
import { AISummaryData } from '@/shared';
import { InsufficientSummariesMessage } from './insufficient-summaries-message';

interface WeeklySummaryContentProps {
  className?: string;
  externalSelectedDate?: Date;
}

export function WeeklySummaryContent({
  className,
  externalSelectedDate,
}: WeeklySummaryContentProps) {
  const { selectedDate: urlSelectedDate, updateWeek } = useWeekFromUrl();
  const selectedDate = externalSelectedDate || urlSelectedDate;
  const { showError } = useAlertContext();
  const { openModal } = useAuthModalContext();

  const { selectedDateStart, selectedDateEnd } = useMemo(() => {
    if (!selectedDate) {
      return { selectedDateStart: new Date(), selectedDateEnd: new Date() };
    }

    const range = getWeekRange(selectedDate);
    return {
      selectedDateStart: new Date(range.from),
      selectedDateEnd: new Date(range.to),
    };
  }, [selectedDate]);

  const { isAuthenticated, isLoading: isUserLoading } = useUser();

  const {
    data: weeklySummary,
    isLoading: weeklySummaryLoading,
    error: weeklySummaryError,
  } = useWeeklySummary(
    selectedDateStart.toISOString(),
    selectedDateEnd.toISOString()
  );

  const {
    data: dailySummaries,
    isLoading: dailySummariesLoading,
    error: dailySummariesError,
  } = useDailySummaries(
    selectedDateStart.toISOString(),
    selectedDateEnd.toISOString()
  );

  const createWeeklySummaryMutation = useCreateWeeklySummary();

  const handleWeekChange = useCallback(
    (date: Date) => {
      updateWeek(date);
    },
    [updateWeek]
  );

  const handleGenerateSummary = useCallback(() => {
    if (!isAuthenticated) {
      openModal();
      return;
    }
    createWeeklySummaryMutation.mutate({
      from: selectedDateStart.toISOString(),
      to: selectedDateEnd.toISOString(),
    });
  }, [
    isAuthenticated,
    openModal,
    createWeeklySummaryMutation,
    selectedDateStart,
    selectedDateEnd,
  ]);

  const handleRefresh = useCallback(() => {
    if (!isAuthenticated) {
      openModal();
      return;
    }
    createWeeklySummaryMutation.mutate({
      from: selectedDateStart.toISOString(),
      to: selectedDateEnd.toISOString(),
    });
  }, [
    isAuthenticated,
    openModal,
    createWeeklySummaryMutation,
    selectedDateStart,
    selectedDateEnd,
  ]);

  const isLoading = useMemo(
    () =>
      weeklySummaryLoading ||
      dailySummariesLoading ||
      createWeeklySummaryMutation.isPending ||
      isUserLoading,
    [
      weeklySummaryLoading,
      dailySummariesLoading,
      createWeeklySummaryMutation.isPending,
      isUserLoading,
    ]
  );

  const hasData = useMemo(() => !!weeklySummary, [weeklySummary]);

  const hasEnoughDailySummaries = useMemo(() => {
    return dailySummaries && dailySummaries.length > 3;
  }, [dailySummaries]);

  const error = useMemo(
    () =>
      weeklySummaryError ||
      dailySummariesError ||
      createWeeklySummaryMutation.error,
    [weeklySummaryError, dailySummariesError, createWeeklySummaryMutation.error]
  );

  useEffect(() => {
    if (error) {
      showError(error.message);
    }
  }, [error, showError]);

  if (!isAuthenticated) {
    return <AuthRequiredMessage messageKey="auth.signInToViewAnalysis" />;
  }

  if (!selectedDate) {
    return null;
  }

  return (
    <div className={className}>
      <div className="space-y-4">
        {!externalSelectedDate && (
          <div className="flex items-center justify-center sm:justify-start">
            <WeekPicker
              selectedDate={selectedDate}
              onWeekChange={handleWeekChange}
            />
          </div>
        )}

        {isLoading ? (
          <AISummaryLoadingSkeleton />
        ) : hasData ? (
          <Summary
            summary={weeklySummary || ({} as AISummaryData)}
            onRefresh={handleRefresh}
            isRefreshing={createWeeklySummaryMutation.isPending}
          />
        ) : !hasEnoughDailySummaries ? (
          <InsufficientSummariesMessage
            dailySummariesCount={dailySummaries?.length || 0}
          />
        ) : (
          <GeneratePrompt
            selectedDate={selectedDate}
            onGenerate={handleGenerateSummary}
            isGenerating={createWeeklySummaryMutation.isPending}
            hasNotes={true}
          />
        )}
      </div>
    </div>
  );
}
