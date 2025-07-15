import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { useTranslation } from '@/contexts/translation-context';
import { format } from 'date-fns';
import { ru, enUS } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface DateSelectorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export function DateSelector({
  selectedDate,
  onDateChange,
}: DateSelectorProps) {
  const { t, lang } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const locale = lang === 'ru' ? ru : enUS;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
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
            format(selectedDate, 'PPP', { locale })
          ) : (
            <span>{t('aiAnalysis.selectDate')}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={date => {
            if (date) {
              onDateChange(date);
              setIsOpen(false);
            }
          }}
          disabled={date => date > new Date()}
          initialFocus
          locale={locale}
        />
      </PopoverContent>
    </Popover>
  );
}
