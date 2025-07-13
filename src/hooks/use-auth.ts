import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import { userKeys } from './use-user';
import { noteKeys } from './use-notes';
import { useAlertContext } from '@/components/alert-provider';

interface SignInRequest {
  email: string;
  password: string;
}

interface SignUpRequest {
  email: string;
  password: string;
  name: string;
}

export function useSignIn() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { showError } = useAlertContext();

  return useMutation({
    mutationFn: async (data: SignInRequest): Promise<{ user: User }> => {
      const supabase = createClient();

      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!authData.user) {
        throw new Error('Sign in failed');
      }

      return { user: authData.user };
    },
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      queryClient.setQueryData(userKeys.all, data.user);
      router.push('/');
    },
    onError: error => {
      showError(error.message);
    },
  });
}

export function useSignUp() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { showError } = useAlertContext();

  return useMutation({
    mutationFn: async (data: SignUpRequest): Promise<{ user: User }> => {
      const supabase = createClient();

      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!authData.user) {
        throw new Error('Sign up failed');
      }

      return { user: authData.user };
    },
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      queryClient.setQueryData(userKeys.all, data.user);
      router.push('/');
    },
    onError: error => {
      showError(error.message);
    },
  });
}

export function useSignOut() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { showError } = useAlertContext();

  return useMutation({
    mutationFn: async () => {
      const supabase = createClient();

      const { error } = await supabase.auth.signOut();

      if (error) {
        throw new Error(error.message);
      }

      return { success: true };
    },
    onSuccess: () => {
      router.push('/login');
      queryClient.setQueryData(userKeys.all, null);
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      queryClient.invalidateQueries({ queryKey: noteKeys.all('') });
    },
    onError: error => {
      showError(error.message);
    },
  });
}

export function useResetPassword() {
  const { showError } = useAlertContext();

  return useMutation({
    mutationFn: async (email: string) => {
      const supabase = createClient();

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw new Error(error.message);
      }

      return { success: true };
    },
    onError: error => {
      showError(error.message);
    },
  });
}

export function useUpdatePassword() {
  const { showError } = useAlertContext();

  return useMutation({
    mutationFn: async (password: string) => {
      const supabase = createClient();

      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        throw new Error(error.message);
      }

      return { success: true };
    },
    onError: error => {
      showError(error.message);
    },
  });
}
