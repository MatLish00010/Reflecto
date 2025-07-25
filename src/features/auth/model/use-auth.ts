'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createBrowserClient } from '@/shared/lib/client';
import type { User } from '@supabase/supabase-js';
import { userKeys } from '@/entities/user';
import { noteKeys } from '@/entities/note';
import { useAlertContext } from '@/shared/providers/alert-provider';
import { safeSentry } from '@/shared/lib/sentry';

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
        safeSentry.captureException(error, {
          tags: { operation: 'sign_in' },
          extra: { email: data.email },
        });
        throw new Error(error.message);
      }

      if (!authData.user) {
        const error = new Error('Sign in failed');
        safeSentry.captureException(error, {
          tags: { operation: 'sign_in' },
          extra: { email: data.email },
        });
        throw error;
      }

      return { user: authData.user };
    },
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      queryClient.setQueryData(userKeys.all, data.user);
    },
    onError: error => {
      safeSentry.captureException(error as Error, {
        tags: { operation: 'sign_in' },
      });
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
        safeSentry.captureException(error, {
          tags: { operation: 'sign_up' },
          extra: { email: data.email, name: data.name },
        });
        throw new Error(error.message);
      }

      if (!authData.user) {
        const error = new Error('Sign up failed');
        safeSentry.captureException(error, {
          tags: { operation: 'sign_up' },
          extra: { email: data.email, name: data.name },
        });
        throw error;
      }

      return { user: authData.user };
    },
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      queryClient.setQueryData(userKeys.all, data.user);
    },
    onError: error => {
      safeSentry.captureException(error as Error, {
        tags: { operation: 'sign_up' },
      });
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
        safeSentry.captureException(error, {
          tags: { operation: 'sign_out' },
        });
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
      safeSentry.captureException(error as Error, {
        tags: { operation: 'sign_out' },
      });
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
        safeSentry.captureException(error, {
          tags: { operation: 'reset_password' },
          extra: { email },
        });
        throw new Error(error.message);
      }

      return { success: true };
    },
    onError: error => {
      safeSentry.captureException(error as Error, {
        tags: { operation: 'reset_password' },
      });
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
        safeSentry.captureException(error, {
          tags: { operation: 'update_password' },
        });
        throw new Error(error.message);
      }

      return { success: true };
    },
    onError: error => {
      safeSentry.captureException(error as Error, {
        tags: { operation: 'update_password' },
      });
      showError(error.message);
    },
  });
}

export function useSignInWithGoogle() {
  const { showError } = useAlertContext();

  return useMutation({
    mutationFn: async () => {
      const supabase = createBrowserClient();

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        safeSentry.captureException(error, {
          tags: { operation: 'sign_in_google' },
        });
        throw new Error(error.message);
      }

      // OAuth flow redirects to Google, so we don't get user data immediately
      // The user will be redirected back to our callback URL
      return { success: true, url: data.url };
    },
    onError: error => {
      safeSentry.captureException(error as Error, {
        tags: { operation: 'sign_in_google' },
      });
      showError(error.message);
    },
  });
}
