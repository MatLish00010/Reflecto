import { useTranslation } from '@/shared/contexts/translation-context';
import { BarChart3 } from '@/shared/icons';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

export function AnalyticsEmptyState() {
  const { t } = useTranslation();

  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-muted-foreground">
          <BarChart3 className="h-5 w-5" />
          {t('analytics.emptyStateTitle')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          {t('analytics.emptyStateMessage')}
        </p>
      </CardContent>
    </Card>
  );
}
