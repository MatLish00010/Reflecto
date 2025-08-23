'use client';

import * as TabsPrimitive from '@radix-ui/react-tabs';
import { useRouter, useSearchParams } from 'next/navigation';
import * as React from 'react';

import { cn } from '@/shared/lib/utils';

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      'inline-flex h-10 items-center justify-center rounded-md bg-slate-100 dark:bg-slate-800 p-1',
      className
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=inactive]:text-slate-600 dark:data-[state=inactive]:text-slate-400 hover:data-[state=inactive]:text-slate-800 dark:hover:data-[state=inactive]:text-slate-200 cursor-pointer',
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      className
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

interface TabsWithURLProps extends React.ComponentProps<typeof Tabs> {
  urlParam?: string;
  defaultValue?: string;
}

const TabsWithURL = React.forwardRef<
  React.ElementRef<typeof Tabs>,
  TabsWithURLProps
>(({ urlParam = 'tab', defaultValue, value, onValueChange, ...props }, ref) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlValue = searchParams.get(urlParam);
  const initialValue = urlValue || defaultValue || '';

  const [internalValue, setInternalValue] = React.useState(initialValue);

  const currentValue = value !== undefined ? value : internalValue;

  const handleValueChange = React.useCallback(
    (newValue: string) => {
      if (value === undefined) {
        setInternalValue(newValue);
      }

      if (onValueChange) {
        onValueChange(newValue);
      }

      const params = new URLSearchParams(searchParams.toString());
      params.set(urlParam, newValue);
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      router.replace(newUrl, { scroll: false });
    },
    [value, onValueChange, searchParams, urlParam, router]
  );

  return (
    <Tabs
      ref={ref}
      value={currentValue}
      onValueChange={handleValueChange}
      {...props}
    />
  );
});

TabsWithURL.displayName = 'TabsWithURL';

export { Tabs, TabsList, TabsTrigger, TabsContent, TabsWithURL };
