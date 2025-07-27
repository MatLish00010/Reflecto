import { LucideIcon } from 'lucide-react';
import { useTranslation } from '@/shared/contexts/translation-context';

interface HeroSummaryCardProps {
  icon: LucideIcon;
  titleKey: string;
  content: string;
}

export function HeroSummaryCard({
  icon: Icon,
  titleKey,
  content,
}: HeroSummaryCardProps) {
  const { t } = useTranslation();

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20 border border-blue-200/50 dark:border-blue-800/30 p-6 shadow-lg">
      <div className="relative">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
            <Icon className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {t(titleKey)}
          </h3>
        </div>
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base">
            {content}
          </p>
        </div>
      </div>
    </div>
  );
}
