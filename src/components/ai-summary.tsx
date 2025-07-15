'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from '@/contexts/translation-context';
import {
  Brain,
  Sparkles,
  Clock,
  RefreshCw,
  Heart,
  Lightbulb,
  Target,
} from 'lucide-react';
import { useTodayAISummary, useSaveAISummary } from '@/hooks/use-ai-summary';
import { useNotesByDate } from '@/hooks/use-notes';

export function AISummary() {
  const { t } = useTranslation();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);
  const { data: notes, isPending: notesLoading } = useNotesByDate(
    todayStart.toISOString(),
    todayEnd.toISOString()
  );
  const {
    data: summary,
    isPending: summaryLoading,
    error: summaryError,
  } = useTodayAISummary();
  const saveSummaryMutation = useSaveAISummary();

  const handleGenerateSummary = () => {
    saveSummaryMutation.mutate(
      notes.map(n => n.note).filter((n): n is string => !!n)
    );
  };

  const handleRefresh = () => {
    saveSummaryMutation.mutate(
      notes.map(n => n.note).filter((n): n is string => !!n)
    );
  };

  const isLoading =
    summaryLoading || notesLoading || saveSummaryMutation.isPending;
  const hasData = !!summary;
  const error = summaryError || saveSummaryMutation.error;

  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-6 w-6" />
            <Skeleton className="h-5 w-32" />
          </div>
          <Skeleton className="h-8 w-24" />
        </div>

        <Card>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-20" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <Card>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent className="space-y-1">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-20" />
            </CardHeader>
            <CardContent className="space-y-1">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-16" />
          </CardHeader>
          <CardContent className="space-y-1">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-20" />
          </CardHeader>
          <CardContent className="space-y-1">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="text-center py-8">
        <div className="flex flex-col items-center space-y-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
            <Brain className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              {t('aiAnalysis.generateTitle')}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
              {t('aiAnalysis.generateDescription')}
            </p>
          </div>
          <Button
            onClick={handleGenerateSummary}
            className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 dark:from-blue-500 dark:via-purple-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:via-purple-600 dark:hover:to-indigo-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            disabled={saveSummaryMutation.isPending}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {saveSummaryMutation.isPending
              ? t('newEntry.savingButton')
              : t('aiAnalysis.generateButton')}
          </Button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500 dark:text-red-400">
        <p>{t('aiAnalysis.fetchError')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Brain className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {t('aiAnalysis.summaryTitle')}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          className="text-xs"
          disabled={saveSummaryMutation.isPending}
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          {saveSummaryMutation.isPending
            ? t('newEntry.savingButton')
            : t('aiAnalysis.refresh')}
        </Button>
      </div>

      <Card className="gap-1">
        <CardHeader className="pb-2">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('aiAnalysis.mainStory')}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            {summary.mainStory}
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <Card className="gap-1">
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('aiAnalysis.keyEvents')}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {summary.keyEvents?.map((event: string, index: number) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {event}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="gap-1">
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2">
              <Heart className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('aiAnalysis.emotionalMoments')}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {summary.emotionalMoments?.map(
                (moment: string, index: number) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-pink-500 rounded-full mt-2 flex-shrink-0" />
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {moment}
                    </p>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="gap-1">
        <CardHeader className="pb-2">
          <div className="flex items-center space-x-2">
            <Lightbulb className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('aiAnalysis.observations')}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {summary.observations?.map((observation: string, index: number) => (
              <div key={index} className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {observation}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="gap-1">
        <CardHeader className="pb-2">
          <div className="flex items-center space-x-2">
            <Target className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('aiAnalysis.recommendations')}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {summary.recommendations?.map(
              (recommendation: string, index: number) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {recommendation}
                  </p>
                </div>
              )
            )}
          </div>
        </CardContent>
      </Card>

      {summary.keyThemes && summary.keyThemes.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {summary.keyThemes.map((theme: string, index: number) => (
            <span
              key={index}
              className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded-full"
            >
              #{theme}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
