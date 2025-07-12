"use client";

import { useTranslation } from "@/contexts/translation-context";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";

export function PageHeader() {
  const { t } = useTranslation();

  return (
    <header className="text-center py-8 relative">
      <div className="absolute top-0 right-0 flex items-center gap-2">
        <LanguageToggle />
        <ThemeToggle />
      </div>
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
        {t('app.title')}
      </h1>
      <p className="text-gray-600 dark:text-gray-300">
        {t('app.description')}
      </p>
    </header>
  );
} 