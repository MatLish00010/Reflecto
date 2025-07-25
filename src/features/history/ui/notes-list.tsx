'use client';

import { useTranslation } from '@/shared/contexts/translation-context';
import { NoteItem } from './note-item';
import { ShowMoreButton } from './show-more-button';
import type { Note } from '@/shared/types/notes';

interface NotesListProps {
  notes: Note[];
  showAll: boolean;
  onToggleShowAll: () => void;
}

export function NotesList({ notes, showAll, onToggleShowAll }: NotesListProps) {
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
        <NoteItem key={note.id} note={note} />
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
