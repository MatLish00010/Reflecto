'use client';

import { useMemo, useState } from 'react';
import { useNotesByDate } from '@/entities/note';
import { AISummary } from '@/features/daily-summary-generation';
import { WeeklySummaryContent } from '@/features/weekly-summary-generation';
import { useTranslation } from '@/shared/client/contexts/translation-context';
import { Search } from '@/shared/client/icons';
import { Button } from '@/shared/client/ui/button';
import { Card, CardContent } from '@/shared/client/ui/card';
import { Input } from '@/shared/client/ui/input';
import {
  TabsContent,
  TabsList,
  TabsTrigger,
  TabsWithURL,
} from '@/shared/client/ui/tabs';
import { WeekPicker } from '@/shared/client/ui/week-picker';
import {
  getDateRangeForDay,
  getWeekRange,
} from '@/shared/common/lib/date-utils';
import { DatePicker } from '@/widgets/history-and-summary/ui/date-picker';
import { History } from './history';
import { HistoryHeader } from './history-header';

interface HistoryPageProps {
  selectedDate?: Date;
}

export function HistoryPage({
  selectedDate: externalSelectedDate,
}: HistoryPageProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(
    externalSelectedDate || new Date()
  );
  const [periodType, setPeriodType] = useState<'day' | 'week'>('day');

  const { selectedDateStart, selectedDateEnd } = useMemo(() => {
    if (periodType === 'day') {
      const range = getDateRangeForDay(selectedDate);
      return {
        selectedDateStart: new Date(range.from),
        selectedDateEnd: new Date(range.to),
      };
    } else {
      const range = getWeekRange(selectedDate);
      return {
        selectedDateStart: new Date(range.from),
        selectedDateEnd: new Date(range.to),
      };
    }
  }, [selectedDate, periodType]);

  const { data: notes = [] } = useNotesByDate(
    selectedDateStart.toISOString(),
    selectedDateEnd.toISOString()
  );

  const filteredNotes = useMemo(() => {
    if (!searchQuery) {
      return notes;
    }
    return notes.filter(
      note =>
        note.note?.toLowerCase().includes(searchQuery.toLowerCase()) || false
    );
  }, [notes, searchQuery]);

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  const handlePeriodTypeChange = (type: 'day' | 'week') => {
    setPeriodType(type);
  };

  return (
    <div className="space-y-6">
      <HistoryHeader />

      <Card>
        <CardContent className="">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              <span className="text-sm font-medium">{t('history.period')}</span>
              <div className="flex border rounded-md w-fit">
                <Button
                  variant={periodType === 'day' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handlePeriodTypeChange('day')}
                  className="rounded-r-none px-3 sm:px-4"
                >
                  {t('history.day')}
                </Button>
                <Button
                  variant={periodType === 'week' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handlePeriodTypeChange('week')}
                  className="rounded-l-none px-3 sm:px-4"
                >
                  {t('history.week')}
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {periodType === 'day' ? (
                <DatePicker
                  selectedDate={selectedDate}
                  onDateChange={handleDateChange}
                />
              ) : (
                <WeekPicker
                  selectedDate={selectedDate}
                  onWeekChange={handleDateChange}
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <TabsWithURL defaultValue="notes" urlParam="view" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger
            value="notes"
            className="text-xs sm:text-sm px-2 sm:px-3"
          >
            {t('history.notes')} ({filteredNotes.length})
          </TabsTrigger>
          <TabsTrigger
            value="analysis"
            className="text-xs sm:text-sm px-2 sm:px-3"
          >
            {t('history.aiAnalysis')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notes" className="space-y-4">
          <Card>
            <CardContent className="pt-4 sm:pt-6">
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('history.searchPlaceholder')}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-10 pr-10"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-label="Clear search"
                        role="img"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </div>

                <History
                  selectedDate={selectedDate}
                  selectedDateStart={selectedDateStart}
                  selectedDateEnd={selectedDateEnd}
                  notes={filteredNotes}
                  searchQuery={searchQuery}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              {periodType === 'day' ? (
                <AISummary
                  selectedDate={selectedDate}
                  selectedDateStart={selectedDateStart}
                  selectedDateEnd={selectedDateEnd}
                />
              ) : (
                <WeeklySummaryContent externalSelectedDate={selectedDate} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </TabsWithURL>
    </div>
  );
}
