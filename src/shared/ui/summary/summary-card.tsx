import { useTranslation } from '@/shared/contexts/translation-context';
import type { LucideIcon } from '@/shared/icons';
import { cn } from '@/shared/lib/utils';

interface SummaryCardProps {
  icon: LucideIcon;
  titleKey: string;
  content: string | string[];
  color: string;
  className?: string;
}

export function SummaryCard({
  icon: Icon,
  titleKey,
  content,
  color,
  className = '',
}: SummaryCardProps) {
  const { t } = useTranslation();

  const contentArray = Array.isArray(content) ? content : [content];

  return (
    <div
      className={cn(
        'relative bg-white dark:bg-gray-900 p-4',
        'border border-gray-100 dark:border-gray-800 shadow-sm',
        className
      )}
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ backgroundColor: color }}
      />

      <div className="flex items-center gap-3 mb-3">
        <Icon className="w-5 h-5" style={{ color: color }} />
        <h3 className="text-sm md:text-lg font-semibold text-gray-900 dark:text-gray-100">
          {t(titleKey)}
        </h3>
      </div>

      <ul className="space-y-1">
        {contentArray.map((item, index) => (
          <li key={`summary-item-${index}`} className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full mt-2 flex-shrink-0" />
            <span className="text-xs md:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
