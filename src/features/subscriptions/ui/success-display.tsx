import type React from 'react';
import { useTranslation } from '@/shared/contexts/translation-context';
import { Button } from '@/shared/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/shared/ui/card';

interface SuccessDisplayProps {
  sessionId: string;
  isLoading: boolean;
  onManageBilling: (sessionId: string) => void;
}

export const SuccessDisplay: React.FC<SuccessDisplayProps> = ({
  sessionId,
  isLoading,
  onManageBilling,
}) => {
  const { t } = useTranslation();

  return (
    <section className="flex items-center justify-center">
      <div className="max-w-md w-full">
        <Card>
          <CardContent className="text-center py-8">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-label="Success icon"
                role="img"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t('subscriptions.success')}
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              {t('subscriptions.welcome')}
            </CardDescription>

            <Button
              onClick={() => onManageBilling(sessionId)}
              disabled={isLoading}
              variant="gradient"
              size="lg"
              className="w-full mt-6"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {t('subscriptions.loading')}
                </>
              ) : (
                t('subscriptions.manage_billing')
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
