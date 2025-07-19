import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@/entities/user';
import type { Note } from '@/shared/types/notes';
import { useAlertContext } from '@/shared/providers/alert-provider';

export const noteKeys = {
  all: (userId: string) => ['notes', userId] as const,
  lists: (userId: string) => [...noteKeys.all(userId), 'list'] as const,
  list: (userId: string, filters: { from?: string; to?: string }) =>
    [...noteKeys.lists(userId), filters] as const,
  details: (userId: string) => [...noteKeys.all(userId), 'detail'] as const,
  detail: (userId: string, noteId: number) =>
    [...noteKeys.details(userId), noteId] as const,
};

export function useNotesByDate(from?: string, to?: string) {
  const { user } = useUser();

  const query = useQuery({
    queryKey: noteKeys.list(user?.id || '', { from, to }),
    queryFn: async () => {
      if (!user) throw new Error('User not found');

      const params = new URLSearchParams();
      if (from) params.append('from', from);
      if (to) params.append('to', to);

      const response = await fetch(`/api/notes?${params.toString()}`);
      if (!response.ok) {
        if (response.status === 401) {
          return [];
        }

        const errorData = await response
          .json()
          .catch(() => ({ error: 'Failed to fetch notes' }));
        throw new Error(errorData.error || 'Failed to fetch notes');
      }
      const { notes } = await response.json();
      return notes as Note[];
    },
    enabled: !!user,
    retry: false,
  });

  return {
    ...query,
    data: query.data || [],
  };
}

export function useCreateNote() {
  const queryClient = useQueryClient();
  const { user } = useUser();
  const { showError } = useAlertContext();

  return useMutation({
    mutationFn: async (note: string) => {
      if (!user) throw new Error('User not found');

      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ note }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create note');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: noteKeys.lists(user?.id || ''),
      });
    },
    onError: error => {
      showError(error.message);
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();
  const { user } = useUser();
  const { showError } = useAlertContext();

  return useMutation({
    mutationFn: async ({ noteId, note }: { noteId: number; note: string }) => {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ note }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update note');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: noteKeys.lists(user?.id || ''),
      });
    },
    onError: error => {
      showError(error.message);
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();
  const { user } = useUser();
  const { showError } = useAlertContext();

  return useMutation({
    mutationFn: async (noteId: number) => {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete note');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: noteKeys.lists(user?.id || ''),
      });
    },
    onError: error => {
      showError(error.message);
    },
  });
}
