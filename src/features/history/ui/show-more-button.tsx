'use client';

import { useTranslation } from '@/shared/client/contexts/translation-context';
import { ChevronDown, ChevronUp } from '@/shared/client/icons';
import { Button } from '@/shared/client/ui/button';

interface ShowMoreButtonProps {
  showAll: boolean;
  onToggle: () => void;
  totalCount: number;
  displayedCount: number;
}

export function ShowMoreButton({
  showAll,
  onToggle,
  totalCount,
  displayedCount,
}: ShowMoreButtonProps) {
  const { t } = useTranslation();

  return (
    <div className="flex justify-center pt-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggle}
        className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
      >
        {showAll ? (
          <>
            <ChevronUp className="h-3 w-3 mr-1" />
            {t('history.showLess')}
          </>
        ) : (
          <>
            <ChevronDown className="h-3 w-3 mr-1" />
            {t('history.showMore')} ({totalCount - displayedCount})
          </>
        )}
      </Button>
    </div>
  );
}
