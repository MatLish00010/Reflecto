'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from '../../contexts/translation-context';
import { useNotesByDate } from '../../hooks/use-notes';
import { DatePicker } from './date-picker';
import { NotesList } from './notes-list';
import { NotesSkeleton } from './notes-skeleton';

interface HistoryProps {
  selectedDate?: Date;
  selectedDateStart?: Date;
  selectedDateEnd?: Date;
  onDateChange?: (date: Date) => void;
  showDatePicker?: boolean;
}

export function History({
  selectedDate: externalSelectedDate,
  selectedDateStart: externalSelectedDateStart,
  selectedDateEnd: externalSelectedDateEnd,
  onDateChange: externalOnDateChange,
  showDatePicker = true,
}: HistoryProps = {}) {
  const { t } = useTranslation();
  const [showAll, setShowAll] = useState(false);
  const [internalSelectedDate, setInternalSelectedDate] = useState<Date>(
    new Date()
  );

  const selectedDate = externalSelectedDate || internalSelectedDate;

  const { selectedDateStart, selectedDateEnd } = useMemo(() => {
    if (externalSelectedDateStart && externalSelectedDateEnd) {
      return {
        selectedDateStart: externalSelectedDateStart,
        selectedDateEnd: externalSelectedDateEnd,
      };
    }
    const start = new Date(selectedDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(selectedDate);
    end.setHours(23, 59, 59, 999);
    return { selectedDateStart: start, selectedDateEnd: end };
  }, [selectedDate, externalSelectedDateStart, externalSelectedDateEnd]);

  const {
    data: notes = [],
    isPending,
    error,
  } = useNotesByDate(
    selectedDateStart.toISOString(),
    selectedDateEnd.toISOString()
  );

  const handleToggleShowAll = useCallback(() => {
    setShowAll(prev => !prev);
  }, []);

  if (isPending) {
    return (
      <div className="space-y-4">
        {showDatePicker && (
          <div className="flex items-center justify-between">
            <DatePicker
              selectedDate={selectedDate}
              onDateSelect={externalOnDateChange || setInternalSelectedDate}
            />
          </div>
        )}
        <NotesSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showDatePicker && (
        <div className="flex items-center justify-between">
          <DatePicker
            selectedDate={selectedDate}
            onDateSelect={externalOnDateChange || setInternalSelectedDate}
          />
        </div>
      )}
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
