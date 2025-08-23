'use client';

import { useMemo } from 'react';
import { AISummary } from '@/features/daily-summary-generation';
import { History } from '@/features/history';
import { useTranslation } from '@/shared/contexts/translation-context';
import { getDateRangeForDay, useDateFromUrl } from '@/shared/lib/date-utils';
import {
  TabsContent,
  TabsList,
  TabsTrigger,
  TabsWithURL,
} from '@/shared/ui/tabs';
import { DatePicker } from './date-picker';

export function HistoryAndSummary() {
  const { t } = useTranslation();
  const { selectedDate, updateDate } = useDateFromUrl();

  const { selectedDateStart, selectedDateEnd } = useMemo(() => {
    if (!selectedDate) {
      return { selectedDateStart: new Date(), selectedDateEnd: new Date() };
    }

    const range = getDateRangeForDay(selectedDate);
    return {
      selectedDateStart: new Date(range.from),
      selectedDateEnd: new Date(range.to),
    };
  }, [selectedDate]);

  if (!selectedDate) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <DatePicker selectedDate={selectedDate} onDateChange={updateDate} />
      </div>

      <TabsWithURL
        defaultValue="daily-summary"
        urlParam="view"
        className="w-full"
      >
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
      </TabsWithURL>
    </div>
  );
}
