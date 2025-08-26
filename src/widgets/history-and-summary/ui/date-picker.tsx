'use client';

import { useCallback } from 'react';
import { useUser } from '@/entities/user';
import { useAuthModalContext } from '@/shared/client/contexts/auth-modal-context';
import { useTranslation } from '@/shared/client/contexts/translation-context';
import { useFormatters } from '@/shared/client/hooks';
import { CalendarIcon } from '@/shared/client/icons';
import { Button } from '@/shared/client/ui/button';
import { Calendar } from '@/shared/client/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/client/ui/popover';
import { getLocaleByLang } from '@/shared/common/lib/date-utils';
import { cn } from '@/shared/common/lib/utils';

interface DatePickerProps {
  selectedDate: Date | null;
  onDateChange: (date: Date) => void;
}

export function DatePicker({ selectedDate, onDateChange }: DatePickerProps) {
  const { t, lang } = useTranslation();
  const { formatDate } = useFormatters();
  const { isAuthenticated } = useUser();
  const { openModal } = useAuthModalContext();

  const handleDateChange = useCallback(
    (date: Date) => {
      if (!isAuthenticated) {
        openModal();
        return;
      }
      onDateChange(date);
    },
    [isAuthenticated, openModal, onDateChange]
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full sm:w-[240px] justify-start text-left font-normal text-sm sm:text-base',
            !selectedDate && 'text-muted-foreground'
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDate ? (
            formatDate(selectedDate, 'FULL')
          ) : (
            <span>{t('history.selectDate')}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 sm:align-start" align="center">
        <Calendar
          mode="single"
          selected={selectedDate || undefined}
          onSelect={date => date && handleDateChange(date)}
          initialFocus
          locale={getLocaleByLang(lang)}
          disabled={date => date > new Date()}
          weekStartsOn={1}
        />
      </PopoverContent>
    </Popover>
  );
}
