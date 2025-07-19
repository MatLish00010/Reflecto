import { getDictionary } from '@/shared/dictionaries';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import { NewEntryForm } from '@/widgets/new-entry-form';
import { HistoryAndSummary } from '@/widgets/history-and-summary';

export default async function Home({
  params,
}: {
  params: Promise<{ lang: 'en' | 'ru' }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  const t = (key: string) => {
    const keys = key.split('.');
    let value: unknown = dict;
    for (const k of keys) {
      value = (value as Record<string, unknown>)?.[k];
    }
    return (value as string) || key;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{t('newEntry.title')}</CardTitle>
          <CardDescription>{t('newEntry.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <NewEntryForm />
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>{t('history.title')}</CardTitle>
          <CardDescription>{t('history.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <HistoryAndSummary />
        </CardContent>
      </Card>
    </>
  );
}
