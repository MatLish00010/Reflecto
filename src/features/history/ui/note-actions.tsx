'use client';

import { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Textarea } from '@/shared/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { MoreVertical, Edit, Trash2 } from 'lucide-react';
import { useTranslation } from '@/shared/contexts/translation-context';
import { useUpdateNote, useDeleteNote } from '@/entities/note';
import { useAlertContext } from '@/shared/providers/alert-provider';
import type { Note } from '@/shared/types/notes';

interface NoteActionsProps {
  note: Note;
}

export function NoteActions({ note }: NoteActionsProps) {
  const { t } = useTranslation();
  const { showSuccess } = useAlertContext();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editContent, setEditContent] = useState(note.note || '');

  const updateNoteMutation = useUpdateNote();
  const deleteNoteMutation = useDeleteNote();

  const handleEdit = () => {
    setEditContent(note.note || '');
    setIsEditing(true);
  };

  const handleSave = async () => {
    await updateNoteMutation.mutateAsync({
      noteId: note.id,
      note: editContent,
    });
    showSuccess(t('history.updateSuccess'));
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditContent(note.note || '');
    setIsEditing(false);
  };

  const handleDelete = async () => {
    await deleteNoteMutation.mutateAsync(note.id);
    showSuccess(t('history.deleteSuccess'));
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <MoreVertical className="h-3 w-3" />
            <span className="sr-only">{t('history.actions.menu')}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleEdit}>
            <Edit className="h-3 w-3 mr-2" />
            {t('history.actions.edit')}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setIsDeleteDialogOpen(true)}
            className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
          >
            <Trash2 className="h-3 w-3 mr-2 text-red-600 dark:text-red-400" />
            {t('history.actions.delete')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{t('history.actions.edit')}</DialogTitle>
            <DialogDescription>
              {t('history.editPlaceholder')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
              placeholder={t('history.editPlaceholder')}
              className="min-h-[200px] resize-none"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={updateNoteMutation.isPending}
            >
              {t('history.cancel')}
            </Button>
            <Button
              onClick={handleSave}
              disabled={updateNoteMutation.isPending || !editContent.trim()}
            >
              {updateNoteMutation.isPending
                ? t('history.saving')
                : t('history.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('history.actions.confirmDeleteTitle')}</DialogTitle>
            <DialogDescription>
              {t('history.actions.confirmDelete')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={deleteNoteMutation.isPending}
            >
              {t('history.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteNoteMutation.isPending}
            >
              {deleteNoteMutation.isPending
                ? t('history.saving')
                : t('history.actions.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
