import { Settings } from 'lucide-react';
import type React from 'react';
import { useTranslation } from '@/shared/contexts/translation-context';
import { Button } from '@/shared/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/shared/ui/card';

interface ManageSubscriptionProps {
  stripeCustomerId: string;
  isLoading: boolean;
  onManageBilling: (stripeCustomerId: string) => void;
}

export const ManageSubscription: React.FC<ManageSubscriptionProps> = ({
  stripeCustomerId,
  isLoading,
  onManageBilling,
}) => {
  const { t } = useTranslation();

  return (
    <section className="flex items-center justify-center">
      <div className="max-w-md w-full">
        <Card>
          <CardContent className="text-center py-8">
            <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
              <Settings className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t('subscriptions.manage_subscription')}
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              {t('subscriptions.manage_description')}
            </CardDescription>

            <Button
              onClick={() => onManageBilling(stripeCustomerId)}
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
