'use client';

import { addWeeks } from 'date-fns/addWeeks';
import { subWeeks } from 'date-fns/subWeeks';
import { useCallback } from 'react';
import { useUser } from '@/entities/user';
import { useAuthModalContext } from '@/shared/client/contexts/auth-modal-context';
import { useTranslation } from '@/shared/client/contexts/translation-context';
import { useFormatters } from '@/shared/client/hooks';
import { CalendarIcon, ChevronLeft, ChevronRight } from '@/shared/client/icons';
import { Button } from '@/shared/client/ui/button';
import { Calendar } from '@/shared/client/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/client/ui/popover';
import { getWeekRange } from '@/shared/common/lib/date-utils';
import { cn } from '@/shared/common/lib/utils';

interface WeekPickerProps {
  selectedDate: Date | null;
  onWeekChange: (date: Date) => void;
}

export function WeekPicker({ selectedDate, onWeekChange }: WeekPickerProps) {
  const { t } = useTranslation();
  const { formatDate, locale } = useFormatters();
  const { isAuthenticated } = useUser();
  const { openModal } = useAuthModalContext();

  const weekRange = selectedDate ? getWeekRange(selectedDate) : null;
  const weekStart = weekRange ? new Date(weekRange.from) : null;
  const weekEnd = weekRange ? new Date(weekRange.to) : null;

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
    if (!isAuthenticated || !selectedDate) {
      openModal();
      return;
    }
    const previousWeek = subWeeks(selectedDate, 1);
    onWeekChange(previousWeek);
  }, [isAuthenticated, openModal, onWeekChange, selectedDate]);

  const handleNextWeek = useCallback(() => {
    if (!isAuthenticated || !selectedDate) {
      openModal();
      return;
    }
    const nextWeek = addWeeks(selectedDate, 1);
    if (nextWeek <= new Date()) {
      onWeekChange(nextWeek);
    }
  }, [isAuthenticated, openModal, onWeekChange, selectedDate]);

  const isNextWeekDisabled =
    !selectedDate || addWeeks(selectedDate, 1) > new Date();

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={handlePreviousWeek}
        disabled={!isAuthenticated || !selectedDate}
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
            {selectedDate && weekStart && weekEnd ? (
              <span className="truncate">
                {formatDate(weekStart, 'WEEK')} - {formatDate(weekEnd, 'LONG')}
              </span>
            ) : (
              <span>{t('aiAnalysis.selectWeek')}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 sm:align-start" align="center">
          <Calendar
            mode="single"
            selected={selectedDate || undefined}
            onSelect={handleDateSelect}
            initialFocus
            locale={locale}
            disabled={date => date > new Date()}
            showOutsideDays={false}
            className="rounded-md border"
            weekStartsOn={1}
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
