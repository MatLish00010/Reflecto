'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { getTimeLocale } from '@/lib/locale-utils';

interface NoteItemProps {
  note: {
    id: number;
    note: string | null;
    created_at: string;
  };
  lang: string;
}

export function NoteItem({ note, lang }: NoteItemProps) {
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString(getTimeLocale(lang), {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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
          {note.note || ''}
        </div>
      </CardContent>
    </Card>
  );
}
