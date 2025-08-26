'use client';

import { useTranslation } from '@/shared/client/contexts/translation-context';
import type { Note } from '@/shared/common/types/notes';
import { NoteItem } from './note-item';
import { ShowMoreButton } from './show-more-button';

interface NotesListProps {
  notes: Note[];
  showAll: boolean;
  onToggleShowAll: () => void;
  searchQuery?: string;
}

export function NotesList({
  notes,
  showAll,
  onToggleShowAll,
  searchQuery,
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
        <NoteItem key={note.id} note={note} searchQuery={searchQuery} />
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
