import { LucideIcon } from 'lucide-react';
import { useTranslation } from '@/shared/contexts/translation-context';

interface SummaryCardProps {
  icon: LucideIcon;
  titleKey: string;
  content: string | string[];
  gradientFrom: string;
  gradientTo: string;
  darkGradientFrom: string;
  darkGradientTo: string;
  iconGradientFrom: string;
  iconGradientTo: string;
  className?: string;
}

export function SummaryCard({
  icon: Icon,
  titleKey,
  content,
  gradientFrom,
  gradientTo,
  darkGradientFrom,
  darkGradientTo,
  iconGradientFrom,
  iconGradientTo,
  className = '',
}: SummaryCardProps) {
  const { t } = useTranslation();

  const renderContent = () => {
    if (Array.isArray(content)) {
      return content.map((item, index) => (
        <div key={index} className="flex items-start space-x-2">
          <div
            className={`w-1.5 h-1.5 bg-gradient-to-r ${iconGradientFrom} ${iconGradientTo} rounded-full mt-2 flex-shrink-0`}
          />
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            {item}
          </p>
        </div>
      ));
    }
    return (
      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
        {content}
      </p>
    );
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-xl bg-gradient-to-br ${gradientFrom} ${gradientTo} ${darkGradientFrom} ${darkGradientTo} p-5 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${className}`}
    >
      <div className="relative">
        <div className="flex items-center space-x-3 mb-3">
          <div
            className={`p-2 bg-gradient-to-br ${iconGradientFrom} ${iconGradientTo} rounded-lg shadow-md`}
          >
            <Icon className="h-4 w-4 text-white" />
          </div>
          <h4 className="font-medium text-gray-800 dark:text-gray-200">
            {t(titleKey)}
          </h4>
        </div>
        <div className="space-y-2">{renderContent()}</div>
      </div>
    </div>
  );
}
