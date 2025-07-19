'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from '@/contexts/translation-context';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { getDateFnsLocale } from '@/lib/locale-utils';
import { getDateRangeUTC } from '@/lib/date-utils';
import { History } from '@/components/history';
import { AISummary } from '@/components/ai-summary';

export function HistoryAndSummary() {
  const { t, lang } = useTranslation();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('ai-summary');

  const { selectedDateStart, selectedDateEnd } = useMemo(() => {
    const range = getDateRangeUTC(selectedDate);
    return {
      selectedDateStart: new Date(range.from),
      selectedDateEnd: new Date(range.to),
    };
  }, [selectedDate]);

  const handleDateChange = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  const DatePicker = () => (
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
          onSelect={date => date && handleDateChange(date)}
          initialFocus
          locale={getDateFnsLocale(lang)}
          disabled={date => date > new Date()}
        />
      </PopoverContent>
    </Popover>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <DatePicker />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="ai-summary">{t('aiAnalysis.title')}</TabsTrigger>
          <TabsTrigger value="history">{t('history.title')}</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-4">
          <History
            selectedDate={selectedDate}
            selectedDateStart={selectedDateStart}
            selectedDateEnd={selectedDateEnd}
            onDateChange={handleDateChange}
            showDatePicker={false}
          />
        </TabsContent>

        <TabsContent value="ai-summary" className="space-y-4">
          <AISummary
            selectedDate={selectedDate}
            selectedDateStart={selectedDateStart}
            selectedDateEnd={selectedDateEnd}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
