'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from '@/shared/contexts/translation-context';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/ui/tabs';
import { getDateRangeForDay } from '@/shared/lib/date-utils';
import { History } from '@/features/history';
import { AISummary } from '@/features/daily-summary-generation';
import { DatePicker } from './date-picker';

export function HistoryAndSummary() {
  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('daily-summary');

  const { selectedDateStart, selectedDateEnd } = useMemo(() => {
    const range = getDateRangeForDay(selectedDate);
    return {
      selectedDateStart: new Date(range.from),
      selectedDateEnd: new Date(range.to),
    };
  }, [selectedDate]);

  const handleDateChange = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <DatePicker
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="daily-summary">
            {t('aiAnalysis.title')}
          </TabsTrigger>
          <TabsTrigger value="history">{t('history.title')}</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-4">
          <History
            selectedDate={selectedDate}
            selectedDateStart={selectedDateStart}
            selectedDateEnd={selectedDateEnd}
          />
        </TabsContent>

        <TabsContent value="daily-summary" className="space-y-4">
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
