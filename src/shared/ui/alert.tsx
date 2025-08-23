import { cva, type VariantProps } from 'class-variance-authority';
import type * as React from 'react';

import { cn } from '@/shared/lib/utils';

const alertVariants = cva(
  'relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current',
  {
    variants: {
      variant: {
        default: 'bg-card text-card-foreground border-border',
        destructive:
          'bg-destructive/10 border-destructive/20 text-destructive [&>svg]:text-destructive *:data-[slot=alert-description]:text-destructive/80',
        success:
          'bg-emerald-50/50 border-emerald-200/50 text-emerald-700 [&>svg]:text-emerald-600 *:data-[slot=alert-description]:text-emerald-600/80 dark:bg-emerald-950/20 dark:border-emerald-800/30 dark:text-emerald-300 dark:[&>svg]:text-emerald-400 dark:*:data-[slot=alert-description]:text-emerald-300/80',
        warning:
          'bg-amber-50/50 border-amber-200/50 text-amber-700 [&>svg]:text-amber-600 *:data-[slot=alert-description]:text-amber-600/80 dark:bg-amber-950/20 dark:border-amber-800/30 dark:text-amber-300 dark:[&>svg]:text-amber-400 dark:*:data-[slot=alert-description]:text-amber-300/80',
        info: 'bg-blue-50/50 border-blue-200/50 text-blue-700 [&>svg]:text-blue-600 *:data-[slot=alert-description]:text-blue-600/80 dark:bg-blue-950/20 dark:border-blue-800/30 dark:text-blue-300 dark:[&>svg]:text-blue-400 dark:*:data-[slot=alert-description]:text-blue-300/80',
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
