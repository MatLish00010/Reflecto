'use client';

import { useCallback } from 'react';
import { Button } from '@/shared/ui/button';
import { Calendar } from '@/shared/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/shared/lib/utils';
import { getLocaleByLang } from '@/shared/lib/date-utils';
import { useTranslation } from '@/shared/contexts/translation-context';
import { useUser } from '@/entities/user';
import { useAuthModalContext } from '@/shared/contexts/auth-modal-context';

interface DatePickerProps {
  selectedDate: Date | null;
  onDateChange: (date: Date) => void;
}

export function DatePicker({ selectedDate, onDateChange }: DatePickerProps) {
  const { t, lang } = useTranslation();
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
            'w-[240px] justify-start text-left font-normal',
            !selectedDate && 'text-muted-foreground'
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDate ? (
            format(selectedDate, 'PPP', { locale: getLocaleByLang(lang) })
          ) : (
            <span>{t('history.selectDate')}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate || undefined}
          onSelect={date => date && handleDateChange(date)}
          initialFocus
          locale={getLocaleByLang(lang)}
          disabled={date => date > new Date()}
        />
      </PopoverContent>
    </Popover>
  );
}
