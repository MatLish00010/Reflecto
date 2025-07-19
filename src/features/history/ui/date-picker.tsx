'use client';

import { Button } from '@/shared/ui/button';
import { Calendar } from '@/shared/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { useTranslation } from '@/shared/contexts/translation-context';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/shared/lib/utils';
import { getDateFnsLocale } from '@/shared/lib/locale-utils';

interface DatePickerProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export function DatePicker({ selectedDate, onDateSelect }: DatePickerProps) {
  const { t, lang } = useTranslation();

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
          onSelect={date => date && onDateSelect(date)}
          initialFocus
          locale={getDateFnsLocale(lang)}
          disabled={date => date > new Date()}
        />
      </PopoverContent>
    </Popover>
  );
}
