import { Button } from '@/components/ui/button';
import { Brain, Sparkles } from 'lucide-react';
import { useTranslation } from '@/contexts/translation-context';
import { DateSelector } from './date-selector';

interface GeneratePromptProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export function GeneratePrompt({
  selectedDate,
  onDateChange,
  onGenerate,
  isGenerating,
}: GeneratePromptProps) {
  const { t } = useTranslation();

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
        <DateSelector selectedDate={selectedDate} onDateChange={onDateChange} />
        <Button
          onClick={onGenerate}
          className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 dark:from-blue-500 dark:via-purple-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:via-purple-600 dark:hover:to-indigo-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          disabled={isGenerating}
        >
          <Sparkles className="h-4 w-4 mr-2" />
          {isGenerating
            ? t('newEntry.savingButton')
            : t('aiAnalysis.generateButton')}
        </Button>
      </div>
    </div>
  );
}
