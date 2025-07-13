'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/contexts/translation-context';
import { Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { useNotesByDate } from '@/hooks/use-notes';
import { useState } from 'react';

export function History() {
  const { t } = useTranslation();
  const [showAll, setShowAll] = useState(false);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const {
    data: notes = [],
    isLoading,
    error,
  } = useNotesByDate(todayStart.toISOString(), todayEnd.toISOString());

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const displayedNotes = showAll ? notes : notes.slice(0, 3);
  const hasMoreNotes = notes.length > 3;

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, index) => (
          <Card key={index} className="relative py-4 px-4 gap-1">
            <CardHeader className="px-0">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-3 w-3" />
                <Skeleton className="h-3 w-12" />
              </div>
            </CardHeader>
            <CardContent className="px-0">
              <div className="space-y-1">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-500 dark:text-red-400">
        <p>{t('history.fetchError')}</p>
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500 dark:text-gray-400">
        <p>{t('history.emptyState')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {displayedNotes.map(note => (
        <Card key={note.id} className="relative py-4 px-4 gap-1">
          <CardHeader className="px-0">
            <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
              <Clock className="h-3 w-3" />
              <span>{formatTime(note.created_at)}</span>
            </div>
          </CardHeader>
          <CardContent className="px-0">
            <div className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {note.note}
            </div>
          </CardContent>
        </Card>
      ))}

      {hasMoreNotes && (
        <div className="flex justify-center pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAll(!showAll)}
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            {showAll ? (
              <>
                <ChevronUp className="h-3 w-3 mr-1" />
                {t('history.showLess')}
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3 mr-1" />
                {t('history.showMore')} ({notes.length - 3})
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
