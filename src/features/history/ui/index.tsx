'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from '@/shared/contexts/translation-context';
import { useNotesByDate } from '@/entities/note';
import { AuthRequiredMessage } from '@/shared/components';
import { getDateRangeUTC } from '@/shared/lib/date-utils';
import { NotesList } from './notes-list';
import { NotesSkeleton } from './notes-skeleton';
import { useUser } from '@/entities';

interface HistoryProps {
  selectedDate: Date;
  selectedDateStart?: Date;
  selectedDateEnd?: Date;
}

export function History({
  selectedDate: externalSelectedDate,
  selectedDateStart: externalSelectedDateStart,
  selectedDateEnd: externalSelectedDateEnd,
}: HistoryProps) {
  const { t } = useTranslation();
  const [showAll, setShowAll] = useState(false);

  const selectedDate = externalSelectedDate;

  const { selectedDateStart, selectedDateEnd } = useMemo(() => {
    if (externalSelectedDateStart && externalSelectedDateEnd) {
      return {
        selectedDateStart: externalSelectedDateStart,
        selectedDateEnd: externalSelectedDateEnd,
      };
    }
    const range = getDateRangeUTC(selectedDate);
    return {
      selectedDateStart: new Date(range.from),
      selectedDateEnd: new Date(range.to),
    };
  }, [selectedDate, externalSelectedDateStart, externalSelectedDateEnd]);

  const { isAuthenticated, isLoading: isUserLoading } = useUser();

  const {
    data: notes = [],
    isLoading: isNotesLoading,
    error,
  } = useNotesByDate(
    selectedDateStart.toISOString(),
    selectedDateEnd.toISOString()
  );

  const handleToggleShowAll = useCallback(() => {
    setShowAll(prev => !prev);
  }, []);

  const isLoading = useMemo(
    () => isNotesLoading || isUserLoading,
    [isNotesLoading, isUserLoading]
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <NotesSkeleton />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthRequiredMessage messageKey="auth.signInToViewHistory" />;
  }

  return (
    <div className="space-y-4">
      {error ? (
        <div className="text-center py-4 text-red-500 dark:text-red-400">
          <p>{t('history.fetchError')}</p>
        </div>
      ) : (
        <NotesList
          notes={notes}
          showAll={showAll}
          onToggleShowAll={handleToggleShowAll}
        />
      )}
    </div>
  );
}
