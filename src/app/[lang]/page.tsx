import { getDictionary } from '@/dictionaries';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { NewEntryForm } from '@/components/new-entry-form';
import { History } from '@/components/history';
import { AISummary } from '@/components/ai-summary';

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
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('newEntry.title')}</CardTitle>
            <CardDescription>{t('newEntry.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <NewEntryForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('history.title')}</CardTitle>
            <CardDescription>{t('history.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <History />
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>{t('aiAnalysis.title')}</CardTitle>
          <CardDescription>{t('aiAnalysis.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <AISummary />
        </CardContent>
      </Card>
    </>
  );
}
