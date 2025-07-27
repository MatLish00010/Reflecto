'use client';

import { useCallback, useMemo, useState, useEffect } from 'react';
import { useCreateWeeklySummary } from '@/features/weekly-summary-generation';
import { useWeeklySummaryByDateRange } from '@/entities/weekly-summary';
import { useDailySummariesByDateRange } from '@/entities/daily-summary';
import { useAuthModalContext } from '@/shared/contexts/auth-modal-context';
import { useAlertContext } from '@/shared/providers/alert-provider';
import { AuthRequiredMessage } from '@/shared/components';
import { getWeekRange, toIsoDate } from '@/shared/lib/date-utils';
import { AISummaryLoadingSkeleton, Summary } from '@/shared/ui';
import { GeneratePrompt } from '@/shared/ui';
import { WeekPicker } from '@/shared/ui';
import { useUser } from '@/entities';
import { useTranslation } from '@/shared/contexts/translation-context';

export function WeeklySummary() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { showError } = useAlertContext();
  const { openModal } = useAuthModalContext();
  const { t } = useTranslation();

  const { selectedDateStart, selectedDateEnd } = useMemo(() => {
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
  } = useWeeklySummaryByDateRange(
    toIsoDate(selectedDateStart),
    toIsoDate(selectedDateEnd)
  );

  const {
    data: dailySummaries,
    isLoading: dailySummariesLoading,
    error: dailySummariesError,
  } = useDailySummariesByDateRange(
    toIsoDate(selectedDateStart),
    toIsoDate(selectedDateEnd)
  );

  const createWeeklySummaryMutation = useCreateWeeklySummary();

  const handleWeekChange = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  const handleGenerateSummary = useCallback(() => {
    if (!isAuthenticated) {
      openModal();
      return;
    }
    createWeeklySummaryMutation.mutate({
      from: toIsoDate(selectedDateStart),
      to: toIsoDate(selectedDateEnd),
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
      from: toIsoDate(selectedDateStart),
      to: toIsoDate(selectedDateEnd),
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center sm:justify-start">
        <WeekPicker
          selectedDate={selectedDate}
          onWeekChange={handleWeekChange}
        />
      </div>

      {isLoading ? (
        <AISummaryLoadingSkeleton />
      ) : hasData && weeklySummary ? (
        <Summary
          summary={weeklySummary}
          onRefresh={handleRefresh}
          isRefreshing={createWeeklySummaryMutation.isPending}
        />
      ) : !hasEnoughDailySummaries ? (
        <div className="text-center space-y-4 p-6">
          <div className="text-2xl font-semibold text-foreground">
            {t('aiAnalysis.insufficientDailySummariesTitle')}
          </div>
          <div className="text-muted-foreground max-w-md mx-auto">
            {t('aiAnalysis.insufficientDailySummariesDescription')}
          </div>
          <div className="text-sm text-muted-foreground">
            {`${dailySummaries?.length || 0}/4 ${t('aiAnalysis.dailySummariesCount')}`}
          </div>
        </div>
      ) : (
        <GeneratePrompt
          selectedDate={selectedDate}
          onGenerate={handleGenerateSummary}
          isGenerating={createWeeklySummaryMutation.isPending}
          hasNotes={true}
        />
      )}
    </div>
  );
}
