'use client';

import { Card, CardContent, CardHeader } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from '@/shared/contexts/translation-context';
import { useFormatters } from '@/shared/hooks';
import { useState } from 'react';
import type { Note } from '@/shared/types/notes';
import { NoteActions } from './note-actions';

interface NoteItemProps {
  note: Note;
  searchQuery?: string;
}

const MAX_CHARACTERS_TO_SHOW = 300;

export function NoteItem({ note, searchQuery }: NoteItemProps) {
  const { t } = useTranslation();
  const { formatDate } = useFormatters();
  const [isExpanded, setIsExpanded] = useState(false);

  const noteText = note.note || '';
  const shouldShowExpandButton = noteText.length > MAX_CHARACTERS_TO_SHOW;
  const displayText = isExpanded
    ? noteText
    : noteText.slice(0, MAX_CHARACTERS_TO_SHOW) +
      (shouldShowExpandButton ? '...' : '');

  const highlightText = (text: string, query?: string) => {
    if (!query || query.trim() === '') return text;

    const regex = new RegExp(
      `(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`,
      'gi'
    );
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark
          key={index}
          className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded"
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <Card className="relative py-4 px-4 gap-1">
      <CardHeader className="px-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
            <Clock className="h-3 w-3" />
            <span>{formatDate(note.created_at, 'DATETIME')}</span>
          </div>

          <NoteActions note={note} />
        </div>
      </CardHeader>
      <CardContent className="px-0">
        <div className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          {highlightText(displayText, searchQuery)}
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
