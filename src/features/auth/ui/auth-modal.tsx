'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { useAlertContext } from '@/shared/providers/alert-provider';
import { useTranslation } from '@/shared/contexts/translation-context';
import { useSignIn, useSignUp, useSignInWithGoogle } from '@/features/auth';
import { GoogleIcon } from '@/shared/icons/google-icon';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const { showError, showSuccess } = useAlertContext();
  const { t } = useTranslation();

  const signInMutation = useSignIn();
  const signUpMutation = useSignUp();
  const googleSignInMutation = useSignInWithGoogle();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isSignUp) {
        await signUpMutation.mutateAsync({
          email,
          password,
          name,
        });
        showSuccess(t('auth.signUpSuccess'));
      } else {
        await signInMutation.mutateAsync({
          email,
          password,
        });
        showSuccess(t('auth.signInSuccess'));
      }
      onClose();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t('auth.error');
      showError(errorMessage);
    }
  };

  const handleClose = () => {
    setEmail('');
    setPassword('');
    setName('');
    setIsSignUp(false);
    onClose();
  };

  const handleGoogleSignIn = async () => {
    try {
      await googleSignInMutation.mutateAsync();
      // The OAuth flow will redirect to Google, so we don't need to close the modal here
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t('auth.error');
      showError(errorMessage);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isSignUp ? t('auth.signUp') : t('auth.signIn')}
          </DialogTitle>
          <DialogDescription>
            {isSignUp
              ? t('auth.signUpDescription')
              : t('auth.signInDescription')}
          </DialogDescription>
        </DialogHeader>

        {/* Google Sign In Button */}
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleGoogleSignIn}
          disabled={
            signInMutation.isPending ||
            signUpMutation.isPending ||
            googleSignInMutation.isPending
          }
        >
          <GoogleIcon className="size-5 mr-2" />
          {googleSignInMutation.isPending
            ? t('auth.loading')
            : isSignUp
              ? t('auth.signUpWithGoogle')
              : t('auth.signInWithGoogle')}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              {t('auth.or')}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                {t('auth.name')}
              </label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder={t('auth.namePlaceholder')}
                required={isSignUp}
                disabled={signInMutation.isPending || signUpMutation.isPending}
              />
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              {t('auth.email')}
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={t('auth.emailPlaceholder')}
              required
              disabled={signInMutation.isPending || signUpMutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              {t('auth.password')}
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={t('auth.passwordPlaceholder')}
              required
              disabled={signInMutation.isPending || signUpMutation.isPending}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={signInMutation.isPending || signUpMutation.isPending}
          >
            {signInMutation.isPending || signUpMutation.isPending
              ? t('auth.loading')
              : isSignUp
                ? t('auth.signUp')
                : t('auth.signIn')}
          </Button>
        </form>

        <div className="text-center">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-blue-600 hover:underline dark:text-blue-400 cursor-pointer"
            disabled={signInMutation.isPending || signUpMutation.isPending}
          >
            {isSignUp ? t('auth.alreadyHaveAccount') : t('auth.needAccount')}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
