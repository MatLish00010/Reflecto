import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  rightContent?: ReactNode;
}

export function PageHeader({
  title,
  description,
  rightContent,
}: PageHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[21px] sm:text-3xl font-medium">{title}</h1>
          {description && (
            <p className="text-[16px] sm:text-base text-muted-foreground">
              {description}
            </p>
          )}
        </div>

        {rightContent}
      </div>
    </div>
  );
}
