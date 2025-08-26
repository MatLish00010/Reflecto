import { cva, type VariantProps } from 'class-variance-authority';
import type * as React from 'react';

import { cn } from '@/shared/common/lib/utils';

const alertVariants = cva(
  'relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-center [&>svg]:size-4 [&>svg]:text-current',
  {
    variants: {
      variant: {
        default: 'bg-card text-card-foreground border-border',
        destructive:
          'bg-white/90 border-red-200/30 text-red-700 [&>svg]:text-red-500 *:data-[slot=alert-description]:text-red-600/80 dark:bg-gray-900/90 dark:border-red-700/30 dark:text-red-300 dark:[&>svg]:text-red-400 dark:*:data-[slot=alert-description]:text-red-300/80',
        success:
          'bg-white/90 border-green-200/30 text-green-700 [&>svg]:text-green-500 *:data-[slot=alert-description]:text-green-600/80 dark:bg-gray-900/90 dark:border-green-700/30 dark:text-green-300 dark:[&>svg]:text-green-400 dark:*:data-[slot=alert-description]:text-green-300/80',
        warning:
          'bg-white/90 border-yellow-200/30 text-yellow-700 [&>svg]:text-yellow-500 *:data-[slot=alert-description]:text-yellow-600/80 dark:bg-gray-900/90 dark:border-yellow-700/30 dark:text-yellow-300 dark:[&>svg]:text-yellow-400 dark:*:data-[slot=alert-description]:text-yellow-300/80',
        info: 'bg-white/90 border-blue-200/30 text-blue-700 [&>svg]:text-blue-500 *:data-[slot=alert-description]:text-blue-600/80 dark:bg-gray-900/90 dark:border-blue-700/30 dark:text-blue-300 dark:[&>svg]:text-blue-400 dark:*:data-[slot=alert-description]:text-blue-300/80',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        'col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight',
        className
      )}
      {...props}
    />
  );
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        'text-muted-foreground col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed',
        className
      )}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription };
