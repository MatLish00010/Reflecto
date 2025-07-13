'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from '@/contexts/translation-context';
import {
  Brain,
  Sparkles,
  TrendingUp,
  Clock,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useAISummary } from '@/hooks/use-ai-summary';
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
  const aiSummaryMutation = useAISummary();

  const handleGenerateSummary = () => {
    aiSummaryMutation.mutate(
      notes.map(n => n.note).filter((n): n is string => !!n)
    );
  };

  const handleRefresh = () => {
    aiSummaryMutation.mutate(
      notes.map(n => n.note).filter((n): n is string => !!n)
    );
  };

  const summary = aiSummaryMutation.data;
  const isLoading = aiSummaryMutation.isPending || notesLoading;
  const hasData = !!summary;
  const error = aiSummaryMutation.error;

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case 'positive':
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'neutral':
        return <TrendingUp className="h-5 w-5 text-yellow-500" />;
      case 'negative':
        return <TrendingUp className="h-5 w-5 text-red-500" />;
      default:
        return <TrendingUp className="h-5 w-5 text-gray-500" />;
    }
  };

  const getProductivityColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'text-green-600 dark:text-green-400';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'low':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-6 w-6" />
            <Skeleton className="h-5 w-32" />
          </div>
          <Skeleton className="h-8 w-24" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20" />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-16" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-20" />
          </CardHeader>
          <CardContent className="space-y-2">
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
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {t('aiAnalysis.generateButton')}
          </Button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500 dark:text-red-400">
        <p>{t('aiAnalysis.fetchError') || 'Ошибка генерации summary'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
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
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          {t('aiAnalysis.refresh')}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('aiAnalysis.moodTitle')}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {getMoodIcon(summary.mood)}
              <span className="text-lg font-semibold capitalize">
                {t(`aiAnalysis.mood.${summary.mood}`)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('aiAnalysis.productivityTitle')}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <span
              className={`text-lg font-semibold capitalize ${getProductivityColor(summary.productivity)}`}
            >
              {t(`aiAnalysis.productivity.${summary.productivity}`)}
            </span>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('aiAnalysis.keyInsights')}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {summary.insights.map((insight: string, index: number) => (
              <div key={index} className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {insight}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('aiAnalysis.recommendations')}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {summary.recommendations.map(
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

      <div className="flex flex-wrap gap-2">
        {summary.keyThemes.map((theme: string, index: number) => (
          <span
            key={index}
            className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded-full"
          >
            #{theme}
          </span>
        ))}
      </div>
    </div>
  );
}
