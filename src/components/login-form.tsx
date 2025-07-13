'use client';

import { useState } from 'react';
import { useTranslation } from '@/contexts/translation-context';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { useLogin } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';

export function LoginForm() {
  const [code, setCode] = useState('');
  const { t } = useTranslation();
  const loginMutation = useLogin();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim()) {
      return;
    }

    try {
      await loginMutation.mutateAsync({ code: code.trim() });
      router.push('/');
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>{t('login.title')}</CardTitle>
          <CardDescription>{t('login.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col items-center space-y-2 mb-8">
              <div className="flex justify-center w-full">
                <InputOTP
                  value={code}
                  onChange={setCode}
                  maxLength={6}
                  disabled={loginMutation.isPending}
                  className="w-full"
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>

            {loginMutation.error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">
                  {loginMutation.error.message}
                </p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending
                ? t('login.loggingInButton')
                : t('login.loginButton')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
