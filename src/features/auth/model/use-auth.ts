'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createBrowserClient } from '@/shared/lib/client';
import type { User } from '@supabase/supabase-js';
import { userKeys } from '@/entities/user';
import { noteKeys } from '@/entities/note';
import { useAlertContext } from '@/shared/providers/alert-provider';
import * as Sentry from '@sentry/nextjs';

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
  const { showError } = useAlertContext();

  return useMutation({
    mutationFn: async (data: SignInRequest): Promise<{ user: User }> => {
      const supabase = createBrowserClient();

      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        Sentry.captureException(error);
        throw new Error(error.message);
      }

      if (!authData.user) {
        const error = new Error('Sign in failed');
        Sentry.captureException(error);
        throw error;
      }

      return { user: authData.user };
    },
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      queryClient.setQueryData(userKeys.all, data.user);
    },
    onError: error => {
      Sentry.captureException(error);
      showError(error.message);
    },
  });
}

export function useSignUp() {
  const queryClient = useQueryClient();
  const { showError } = useAlertContext();

  return useMutation({
    mutationFn: async (data: SignUpRequest): Promise<{ user: User }> => {
      const supabase = createBrowserClient();

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
        Sentry.captureException(error);
        throw new Error(error.message);
      }

      if (!authData.user) {
        const error = new Error('Sign up failed');
        Sentry.captureException(error);
        throw error;
      }

      return { user: authData.user };
    },
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      queryClient.setQueryData(userKeys.all, data.user);
    },
    onError: error => {
      Sentry.captureException(error);
      showError(error.message);
    },
  });
}

export function useSignOut() {
  const queryClient = useQueryClient();
  const { showError } = useAlertContext();

  return useMutation({
    mutationFn: async () => {
      const supabase = createBrowserClient();

      const { error } = await supabase.auth.signOut();

      if (error) {
        Sentry.captureException(error);
        throw new Error(error.message);
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.setQueryData(userKeys.all, null);
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      queryClient.invalidateQueries({ queryKey: noteKeys.all('') });
    },
    onError: error => {
      Sentry.captureException(error);
      showError(error.message);
    },
  });
}

export function useResetPassword() {
  const { showError } = useAlertContext();

  return useMutation({
    mutationFn: async (email: string) => {
      const supabase = createBrowserClient();

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        Sentry.captureException(error);
        throw new Error(error.message);
      }

      return { success: true };
    },
    onError: error => {
      Sentry.captureException(error);
      showError(error.message);
    },
  });
}

export function useUpdatePassword() {
  const { showError } = useAlertContext();

  return useMutation({
    mutationFn: async (password: string) => {
      const supabase = createBrowserClient();

      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        Sentry.captureException(error);
        throw new Error(error.message);
      }

      return { success: true };
    },
    onError: error => {
      Sentry.captureException(error);
      showError(error.message);
    },
  });
}
