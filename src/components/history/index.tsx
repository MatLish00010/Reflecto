'use client';

import React, { useState } from 'react';
import { useTranslation } from '../../contexts/translation-context';
import { useNotesByDate } from '../../hooks/use-notes';
import { DatePicker } from './date-picker';
import { NotesList } from './notes-list';
import { NotesSkeleton } from './notes-skeleton';

export function History() {
  const { t, lang } = useTranslation();
  const [showAll, setShowAll] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const selectedDateStart = new Date(selectedDate);
  selectedDateStart.setHours(0, 0, 0, 0);
  const selectedDateEnd = new Date(selectedDate);
  selectedDateEnd.setHours(23, 59, 59, 999);

  const {
    data: notes = [],
    isPending,
    error,
  } = useNotesByDate(
    selectedDateStart.toISOString(),
    selectedDateEnd.toISOString()
  );

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

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <DatePicker
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
          />
        </div>
        <div className="text-center py-4 text-red-500 dark:text-red-400">
          <p>{t('history.fetchError')}</p>
        </div>
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

      <NotesList
        notes={notes}
        showAll={showAll}
        onToggleShowAll={() => setShowAll(!showAll)}
        lang={lang}
      />
    </div>
  );
}
