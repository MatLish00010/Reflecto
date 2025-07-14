'use client';

import { useTranslation } from '@/contexts/translation-context';
import { NoteItem } from './note-item';
import { ShowMoreButton } from './show-more-button';

interface NotesListProps {
  notes: Array<{
    id: number;
    note: string | null;
    created_at: string;
  }>;
  showAll: boolean;
  onToggleShowAll: () => void;
  lang: string;
}

export function NotesList({
  notes,
  showAll,
  onToggleShowAll,
  lang,
}: NotesListProps) {
  const { t } = useTranslation();

  const displayedNotes = showAll ? notes : notes.slice(0, 3);
  const hasMoreNotes = notes.length > 3;

  if (notes.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500 dark:text-gray-400">
        <p>{t('history.emptyState')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {displayedNotes.map(note => (
        <NoteItem key={note.id} note={note} lang={lang} />
      ))}

      {hasMoreNotes && (
        <ShowMoreButton
          showAll={showAll}
          onToggle={onToggleShowAll}
          totalCount={notes.length}
          displayedCount={3}
        />
      )}
    </div>
  );
}
