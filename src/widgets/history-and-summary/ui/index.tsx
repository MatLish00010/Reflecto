'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from '@/shared/contexts/translation-context';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/ui/tabs';
import { getDateRangeUTC } from '@/shared/lib/date-utils';
import { History } from '@/features/history';
import { AISummary } from '@/entities/ai-summary';
import { DatePicker } from './date-picker';
import { useUser } from '@/entities/user';

export function HistoryAndSummary() {
  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('ai-summary');
  const { isAuthenticated } = useUser();

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
          <TabsTrigger value="ai-summary" className="cursor-pointer">
            {t('aiAnalysis.title')}
          </TabsTrigger>
          <TabsTrigger value="history" className="cursor-pointer">
            {t('history.title')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-4">
          <History
            selectedDate={selectedDate}
            selectedDateStart={selectedDateStart}
            selectedDateEnd={selectedDateEnd}
            isAuthenticated={isAuthenticated}
          />
        </TabsContent>

        <TabsContent value="ai-summary" className="space-y-4">
          <AISummary
            selectedDate={selectedDate}
            selectedDateStart={selectedDateStart}
            selectedDateEnd={selectedDateEnd}
            isAuthenticated={isAuthenticated}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
