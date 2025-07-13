'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useTranslation } from '@/contexts/translation-context';
import {
  Clock,
  ChevronDown,
  ChevronUp,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { useNotesByDate } from '@/hooks/use-notes';
import { useState } from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { getDateFnsLocale, getTimeLocale } from '@/lib/locale-utils';

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

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString(getTimeLocale(lang), {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const displayedNotes = showAll ? notes : notes.slice(0, 3);
  const hasMoreNotes = notes.length > 3;

  if (isPending) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-[240px] justify-start text-left font-normal',
                  !selectedDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? (
                  format(selectedDate, 'PPP', {
                    locale: getDateFnsLocale(lang),
                  })
                ) : (
                  <span>{t('history.selectDate')}</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={date => date && setSelectedDate(date)}
                initialFocus
                locale={getDateFnsLocale(lang)}
              />
            </PopoverContent>
          </Popover>
        </div>

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
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-[240px] justify-start text-left font-normal',
                  !selectedDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? (
                  format(selectedDate, 'PPP', {
                    locale: getDateFnsLocale(lang),
                  })
                ) : (
                  <span>{t('history.selectDate')}</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={date => date && setSelectedDate(date)}
                initialFocus
                locale={getDateFnsLocale(lang)}
              />
            </PopoverContent>
          </Popover>
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
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-[240px] justify-start text-left font-normal',
                !selectedDate && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? (
                format(selectedDate, 'PPP', { locale: getDateFnsLocale(lang) })
              ) : (
                <span>{t('history.selectDate')}</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={date => date && setSelectedDate(date)}
              initialFocus
              locale={getDateFnsLocale(lang)}
            />
          </PopoverContent>
        </Popover>
      </div>

      {notes.length === 0 ? (
        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
          <p>{t('history.emptyState')}</p>
        </div>
      ) : (
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
      )}
    </div>
  );
}
