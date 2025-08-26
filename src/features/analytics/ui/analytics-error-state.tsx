import { useTranslation } from '@/shared/client/contexts/translation-context';
import { AlertCircle } from '@/shared/client/icons';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/client/ui/card';

interface AnalyticsErrorStateProps {
  message?: string;
}

export function AnalyticsErrorState({ message }: AnalyticsErrorStateProps) {
  const { t } = useTranslation();

  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-5 w-5" />
          {t('analytics.errorTitle')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          {message || t('analytics.errorMessage')}
        </p>
      </CardContent>
    </Card>
  );
}
