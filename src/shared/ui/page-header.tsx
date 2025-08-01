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
          <h1 className="text-3xl font-bold mb-2">{title}</h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>

        {rightContent}
      </div>
    </div>
  );
}
