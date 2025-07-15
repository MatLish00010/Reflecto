import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { useTranslation } from '@/contexts/translation-context';

interface SummaryCardProps {
  icon: LucideIcon;
  title: string;
  content: string | string[];
  bulletColor?: string;
}

export function SummaryCard({
  icon: Icon,
  title,
  content,
  bulletColor = 'bg-blue-500',
}: SummaryCardProps) {
  const { t } = useTranslation();

  return (
    <Card className="gap-1">
      <CardHeader className="pb-2">
        <div className="flex items-center space-x-2">
          <Icon className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t(title)}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {Array.isArray(content) ? (
          <div className="space-y-1">
            {content.map((item, index) => (
              <div key={index} className="flex items-start space-x-2">
                <div
                  className={`w-1.5 h-1.5 ${bulletColor} rounded-full mt-2 flex-shrink-0`}
                />
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {item}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            {content}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
