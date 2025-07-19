'use client';

import { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import { useAlertContext } from '@/shared/providers/alert-provider';
import { useTranslation } from '@/shared/contexts/translation-context';
import { useSignIn, useSignUp } from '@/features/auth';

export function LoginForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { showError, showSuccess } = useAlertContext();
  const { t } = useTranslation();

  const signInMutation = useSignIn();
  const signUpMutation = useSignUp();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

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
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t('auth.error');
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>
            {isSignUp ? t('auth.signUp') : t('auth.signIn')}
          </CardTitle>
          <CardDescription>
            {isSignUp
              ? t('auth.signUpDescription')
              : t('auth.signInDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                  disabled={isLoading}
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
                disabled={isLoading}
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
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={
                isLoading ||
                signInMutation.isPending ||
                signUpMutation.isPending
              }
            >
              {isLoading || signInMutation.isPending || signUpMutation.isPending
                ? t('auth.loading')
                : isSignUp
                  ? t('auth.signUp')
                  : t('auth.signIn')}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-blue-600 hover:underline dark:text-blue-400"
              disabled={isLoading}
            >
              {isSignUp ? t('auth.alreadyHaveAccount') : t('auth.needAccount')}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
