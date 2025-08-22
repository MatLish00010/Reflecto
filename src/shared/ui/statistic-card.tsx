import { LucideIcon, HelpCircle } from '@/shared/icons';
import { useTranslation } from '@/shared/contexts/translation-context';
import { cn } from '@/shared/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

interface StatisticCardProps {
  icon: LucideIcon;
  title: string;
  titleKey?: string;
  content?: string | string[];
  value?: string | number;
  subtitle?: string;
  description?: string;
  color: string;

  className?: string;
  variant?: 'summary' | 'stats';
}

export function StatisticCard({
  icon: Icon,
  title,
  titleKey,
  content,
  value,
  subtitle,
  description,
  color,

  className = '',
  variant = 'summary',
}: StatisticCardProps) {
  const { t } = useTranslation();

  const renderContent = () => {
    if (variant === 'stats') {
      return (
        <div className="space-y-2">
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {value}
          </div>
          {subtitle && (
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      );
    }

    if (Array.isArray(content)) {
      return content.map((item, index) => (
        <div key={index} className="flex items-start space-x-2">
          <div
            className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
            style={{
              backgroundColor: color,
            }}
          />
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            {item}
          </p>
        </div>
      ));
    }

    if (typeof content === 'string') {
      return (
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          {content}
        </p>
      );
    }

    return null;
  };

  const displayTitle = titleKey ? t(titleKey) : title;

  const titleContent = (
    <div className="flex items-start justify-between w-full">
      <h4 className="font-medium text-gray-800 dark:text-gray-200">
        {displayTitle}
      </h4>
      {description && (
        <Popover>
          <PopoverTrigger asChild>
            <button
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0 mt-0.5 ml-2 cursor-pointer"
              aria-label="More information"
            >
              <HelpCircle className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" side="top" align="start">
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {description}
            </p>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 p-5 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-200 dark:border-gray-700',
        className
      )}
    >
      <div className="relative">
        <div className="flex items-center space-x-3 mb-3">
          <div
            className="p-2 rounded-lg shadow-md"
            style={{
              backgroundColor: color,
            }}
          >
            <Icon className="h-4 w-4 text-white" />
          </div>
          {titleContent}
        </div>
        <div className="space-y-2">{renderContent()}</div>
      </div>
    </div>
  );
}
