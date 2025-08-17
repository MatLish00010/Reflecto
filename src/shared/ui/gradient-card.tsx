import { LucideIcon, HelpCircle } from '@/shared/icons';
import { useTranslation } from '@/shared/contexts/translation-context';
import { cn } from '@/shared/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

interface GradientCardProps {
  icon: LucideIcon;
  title: string;
  titleKey?: string;
  content?: string | string[];
  value?: string | number;
  subtitle?: string;
  description?: string;
  gradientFrom: string;
  gradientTo: string;
  darkGradientFrom: string;
  darkGradientTo: string;
  iconGradientFrom: string;
  iconGradientTo: string;
  className?: string;
  variant?: 'summary' | 'stats';
}

export function GradientCard({
  icon: Icon,
  title,
  titleKey,
  content,
  value,
  subtitle,
  description,
  gradientFrom,
  gradientTo,
  darkGradientFrom,
  darkGradientTo,
  iconGradientFrom,
  iconGradientTo,
  className = '',
  variant = 'summary',
}: GradientCardProps) {
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
            className={cn(
              'w-1.5 h-1.5 bg-gradient-to-r rounded-full mt-2 flex-shrink-0',
              `${iconGradientFrom} ${iconGradientTo}`
            )}
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
        'group relative overflow-hidden rounded-xl bg-gradient-to-br',
        `${gradientFrom} ${gradientTo}`,
        `${darkGradientFrom} ${darkGradientTo}`,
        'p-5 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1',
        className
      )}
    >
      <div className="relative">
        <div className="flex items-center space-x-3 mb-3">
          <div
            className={cn(
              'p-2 bg-gradient-to-br rounded-lg shadow-md',
              `${iconGradientFrom} ${iconGradientTo}`
            )}
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
