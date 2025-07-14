'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from '../../contexts/translation-context';
import { useNotesByDate } from '../../hooks/use-notes';
import { DatePicker } from './date-picker';
import { NotesList } from './notes-list';
import { NotesSkeleton } from './notes-skeleton';

export function History() {
  const { t, lang } = useTranslation();
  const [showAll, setShowAll] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const { selectedDateStart, selectedDateEnd } = useMemo(() => {
    const start = new Date(selectedDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(selectedDate);
    end.setHours(23, 59, 59, 999);
    return { selectedDateStart: start, selectedDateEnd: end };
  }, [selectedDate]);

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
        <div className="flex items-center justify-between">
          <DatePicker
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
          />
        </div>
        <NotesSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <DatePicker
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
        />
      </div>
      {error ? (
        <div className="text-center py-4 text-red-500 dark:text-red-400">
          <p>{t('history.fetchError')}</p>
        </div>
      ) : (
        <NotesList
          notes={notes}
          showAll={showAll}
          onToggleShowAll={handleToggleShowAll}
          lang={lang}
        />
      )}
    </div>
  );
}
