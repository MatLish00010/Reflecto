'use client';

import { useCallback } from 'react';
import { Button } from '@/shared/ui/button';
import { Calendar } from '@/shared/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addWeeks, subWeeks } from 'date-fns';
import { cn } from '@/shared/lib/utils';
import { getLocaleByLang, getWeekRange } from '@/shared/lib/date-utils';
import { useTranslation } from '@/shared/contexts/translation-context';
import { useUser } from '@/entities/user';
import { useAuthModalContext } from '@/shared/contexts/auth-modal-context';

interface WeekPickerProps {
  selectedDate: Date;
  onWeekChange: (date: Date) => void;
}

export function WeekPicker({ selectedDate, onWeekChange }: WeekPickerProps) {
  const { t, lang } = useTranslation();
  const { isAuthenticated } = useUser();
  const { openModal } = useAuthModalContext();

  const weekRange = getWeekRange(selectedDate);
  const weekStart = new Date(weekRange.from);
  const weekEnd = new Date(weekRange.to);

  const handleDateSelect = useCallback(
    (date: Date | undefined) => {
      if (!isAuthenticated) {
        openModal();
        return;
      }
      if (date) {
        onWeekChange(date);
      }
    },
    [isAuthenticated, openModal, onWeekChange]
  );

  const handlePreviousWeek = useCallback(() => {
    if (!isAuthenticated) {
      openModal();
      return;
    }
    const previousWeek = subWeeks(selectedDate, 1);
    onWeekChange(previousWeek);
  }, [isAuthenticated, openModal, onWeekChange, selectedDate]);

  const handleNextWeek = useCallback(() => {
    if (!isAuthenticated) {
      openModal();
      return;
    }
    const nextWeek = addWeeks(selectedDate, 1);
    if (nextWeek <= new Date()) {
      onWeekChange(nextWeek);
    }
  }, [isAuthenticated, openModal, onWeekChange, selectedDate]);

  const isNextWeekDisabled = addWeeks(selectedDate, 1) > new Date();

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={handlePreviousWeek}
        disabled={!isAuthenticated}
        className="h-9 w-9 sm:h-10 sm:w-10"
      >
        <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
      </Button>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-[200px] sm:w-[280px] justify-start text-left font-normal text-xs sm:text-sm',
              !selectedDate && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            {selectedDate ? (
              <span className="truncate">
                {format(weekStart, 'MMM d', { locale: getLocaleByLang(lang) })}{' '}
                -{' '}
                {format(weekEnd, 'MMM d, yyyy', {
                  locale: getLocaleByLang(lang),
                })}
              </span>
            ) : (
              <span>{t('aiAnalysis.selectWeek')}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            initialFocus
            locale={getLocaleByLang(lang)}
            disabled={date => date > new Date()}
            showOutsideDays={false}
            className="rounded-md border"
          />
        </PopoverContent>
      </Popover>

      <Button
        variant="outline"
        size="icon"
        onClick={handleNextWeek}
        disabled={!isAuthenticated || isNextWeekDisabled}
        className="h-9 w-9 sm:h-10 sm:w-10"
      >
        <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
      </Button>
    </div>
  );
}
