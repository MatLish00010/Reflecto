'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { getTimeLocale } from '@/lib/locale-utils';
import { useTranslation } from '@/contexts/translation-context';
import { useState } from 'react';

interface NoteItemProps {
  note: {
    id: number;
    note: string | null;
    created_at: string;
  };
}

export function NoteItem({ note }: NoteItemProps) {
  const { t, lang } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString(getTimeLocale(lang), {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const noteText = note.note || '';
  const shouldShowExpandButton = noteText.length > 100;
  const displayText = isExpanded
    ? noteText
    : noteText.slice(0, 100) + (shouldShowExpandButton ? '...' : '');

  return (
    <Card className="relative py-4 px-4 gap-1">
      <CardHeader className="px-0">
        <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
          <Clock className="h-3 w-3" />
          <span>{formatTime(note.created_at)}</span>
        </div>
      </CardHeader>
      <CardContent className="px-0">
        <div className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          {displayText}
        </div>
        {shouldShowExpandButton && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 h-6 px-2 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-3 w-3 mr-1" />
                {t('history.collapse')}
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3 mr-1" />
                {t('history.expand')}
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
