'use client';

import Link from 'next/link';
import { Suspense, useMemo } from 'react';
import { useNotesByDate } from '@/entities/note';
import { AISummary } from '@/features/daily-summary-generation';
import { NoteItem } from '@/features/history/ui/note-item';
import { useLocale } from '@/shared/client/contexts/locale-context';
import { useTranslation } from '@/shared/client/contexts/translation-context';
import { Brain, Calendar, Loader2 } from '@/shared/client/icons';
import { Button } from '@/shared/client/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/client/ui/card';
import { getDateRangeForDay } from '@/shared/common/lib/date-utils';
import { NewEntryForm } from '@/widgets/new-entry-form';

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
            <Button asChild variant="outline" size="sm">
              <Link href={`/${currentLocale}/history`}>
                {t('home.viewAll')}
              </Link>
            </Button>
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
