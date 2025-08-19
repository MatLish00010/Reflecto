'use client';

import { Suspense } from 'react';
import { Calendar, Brain, Loader2 } from '@/shared/icons';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { NewEntryForm } from '@/widgets/new-entry-form';
import { AISummary } from '@/features/daily-summary-generation';
import { NoteItem } from '@/features/history/ui/note-item';
import { useTranslation } from '@/shared/contexts/translation-context';
import { useLocale } from '@/shared/contexts/locale-context';
import { useNotesByDate } from '@/entities/note';
import { getDateRangeForDay } from '@/shared/lib/date-utils';
import { useMemo } from 'react';
import Link from 'next/link';

export function HomeContent() {
  const { t } = useTranslation();
  const { currentLocale } = useLocale();

  const { selectedDateStart, selectedDateEnd } = useMemo(() => {
    const today = new Date();
    const range = getDateRangeForDay(today);
    return {
      selectedDateStart: new Date(range.from),
      selectedDateEnd: new Date(range.to),
    };
  }, []);

  // Fetch recent notes for today
  const { data: todayNotes = [] } = useNotesByDate(
    selectedDateStart.toISOString(),
    selectedDateEnd.toISOString()
  );

  // Get last 3 notes for quick overview
  const recentNotes = todayNotes.slice(0, 3);

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm md:text-base font-normal">
            {t('newEntry.title')}
            <p className="text-xs text-muted-foreground">
              {t('newEntry.contentLabel')}
            </p>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <NewEntryForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm md:text-base font-normal flex items-center gap-2">
            <Brain className="text-purple-600 h-6 w-6" />
            {t('aiAnalysis.dailySummaryTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense
            fallback={
              <div className="flex justify-center items-center p-8">
                <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
              </div>
            }
          >
            <AISummary
              selectedDate={new Date()}
              selectedDateStart={selectedDateStart}
              selectedDateEnd={selectedDateEnd}
            />
          </Suspense>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm md:text-base font-normal">
              {t('home.recentNotes')}
            </CardTitle>
            <Link href={`/${currentLocale}/history`}>
              <Button variant="outline" size="sm">
                {t('home.viewAll')}
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentNotes.length > 0 ? (
            <div className="space-y-2">
              {recentNotes.map(note => (
                <NoteItem key={note.id} note={note} />
              ))}
            </div>
          ) : (
            <div className="relative text-center py-10 text-muted-foreground overflow-hidden">
              <div className="relative z-10">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm md:text-base">{t('home.noNotesToday')}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
