"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NewEntryForm } from "@/components/new-entry-form";
import { useTranslation } from "@/contexts/translation-context";

export function TranslatedCards() {
  const { t } = useTranslation();

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
            <CardTitle>{t('aiAnalysis.title')}</CardTitle>
            <CardDescription>{t('aiAnalysis.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>{t('aiAnalysis.emptyState')}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>{t('history.title')}</CardTitle>
          <CardDescription>{t('history.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>{t('history.emptyState')}</p>
          </div>
        </CardContent>
      </Card>
    </>
  );
} 