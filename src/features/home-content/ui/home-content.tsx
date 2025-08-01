'use client';

import { Suspense } from 'react';
import { RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/shared/ui/card';
import {
  TabsWithURL,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/ui/tabs';
import { NewEntryForm } from '@/widgets/new-entry-form';
import { HistoryAndSummary } from '@/widgets/history-and-summary';
import { WeeklySummaryWidget } from '@/widgets/weekly-summary';
import { useTranslation } from '@/shared/contexts/translation-context';

export function HomeContent() {
  const { t } = useTranslation();

  return (
    <>
      <Card>
        <CardContent className="pt-6">
          <NewEntryForm />
        </CardContent>
      </Card>

      <Suspense
        fallback={
          <div className="flex justify-center items-center p-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        }
      >
        <TabsWithURL
          defaultValue="daily"
          urlParam="tab"
          className="w-full mt-8"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="daily">
              {t('aiAnalysis.tabs.daily')}
            </TabsTrigger>
            <TabsTrigger value="weekly">
              {t('aiAnalysis.tabs.weekly')}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="daily" className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <HistoryAndSummary />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="weekly" className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <WeeklySummaryWidget />
              </CardContent>
            </Card>
          </TabsContent>
        </TabsWithURL>
      </Suspense>
    </>
  );
}
