import { useMemo } from 'react';
import { Button } from '@/shared/ui/button';
import { Brain, Sparkles, Calendar } from 'lucide-react';
import { useTranslation } from '@/shared/contexts/translation-context';
import { getDateRangeForDay } from '@/shared/lib/date-utils';

interface GeneratePromptProps {
  selectedDate: Date;
  onGenerate: () => void;
  isGenerating: boolean;
  hasNotes: boolean;
}

export function GeneratePrompt({
  selectedDate,
  onGenerate,
  isGenerating,
  hasNotes,
}: GeneratePromptProps) {
  const { t } = useTranslation();

  const isToday = useMemo(() => {
    const today = new Date();
    const todayRange = getDateRangeForDay(today);
    const selectedRange = getDateRangeForDay(selectedDate);
    return todayRange.from === selectedRange.from;
  }, [selectedDate]);

  const renderContent = () => {
    if (!hasNotes) {
      if (isToday) {
        return (
          <div className="space-y-3 sm:space-y-4 text-center">
            <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100">
              {t('aiAnalysis.noNotesTodayTitle')}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 px-2 sm:px-0">
              {t('aiAnalysis.noNotesTodayDescription')}
            </p>
          </div>
        );
      } else {
        return (
          <div className="space-y-3 sm:space-y-4 text-center">
            <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100">
              {t('aiAnalysis.noNotesTitle')}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 px-2 sm:px-0">
              {t('aiAnalysis.noNotesDescription')}
            </p>
            <div className="flex items-center justify-center space-x-2 text-gray-500 dark:text-gray-400">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">
                {t('aiAnalysis.selectAnotherDate')}
              </span>
            </div>
          </div>
        );
      }
    }

    return (
      <div className="space-y-3 sm:space-y-4 text-center">
        <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100">
          {t('aiAnalysis.generateTitle')}
        </h3>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 px-2 sm:px-0">
          {t('aiAnalysis.generateDescription')}
        </p>
        <Button onClick={onGenerate} variant="gradient" disabled={isGenerating}>
          <Sparkles className="h-4 w-4 mr-2" />
          {isGenerating
            ? t('newEntry.savingButton')
            : t('aiAnalysis.generateButton')}
        </Button>
      </div>
    );
  };

  return (
    <div className="text-center py-6 sm:py-8 px-4 sm:px-0">
      <div className="flex flex-col items-center space-y-4 sm:space-y-6">
        <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
          <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="w-full max-w-sm sm:max-w-md">{renderContent()}</div>
      </div>
    </div>
  );
}
