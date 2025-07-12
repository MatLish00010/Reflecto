import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUserContext } from '@/contexts/user-context';
import type { Tables } from '@/types/supabase';

type Note = Tables<'notes'>;

const noteKeys = {
  all: (userId: number) => ['notes', userId] as const,
  lists: (userId: number) => [...noteKeys.all(userId), 'list'] as const,
  list: (userId: number, filters: { from?: string; to?: string }) =>
    [...noteKeys.lists(userId), filters] as const,
  details: (userId: number) => [...noteKeys.all(userId), 'detail'] as const,
  detail: (userId: number, noteId: number) =>
    [...noteKeys.details(userId), noteId] as const,
};

export function useNotesByDate(from?: string, to?: string) {
  const { user } = useUserContext();

  return useQuery({
    queryKey: noteKeys.list(user?.id || 0, { from, to }),
    queryFn: async () => {
      if (!user) throw new Error('User not found');

      const params = new URLSearchParams();
      params.append('userId', user.id.toString());
      if (from) params.append('from', from);
      if (to) params.append('to', to);

      const response = await fetch(`/api/notes?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch notes');
      }
      const { notes } = await response.json();
      return notes as Note[];
    },
    enabled: !!user,
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();
  const { user } = useUserContext();

  return useMutation({
    mutationFn: async (note: string) => {
      if (!user) throw new Error('User not found');

      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          note,
          userId: user.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create note');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: noteKeys.lists(user?.id || 0),
      });
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();
  const { user } = useUserContext();

  return useMutation({
    mutationFn: async ({ noteId, note }: { noteId: number; note: string }) => {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
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
        queryKey: noteKeys.lists(user?.id || 0),
      });
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();
  const { user } = useUserContext();

  return useMutation({
    mutationFn: async (noteId: number) => {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete note');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: noteKeys.lists(user?.id || 0),
      });
    },
  });
}
