'use client';

import {
  Close as PopoverClose,
  Content as PopoverContent,
  Portal as PopoverPortal,
  Root as PopoverRoot,
  Trigger as PopoverTrigger,
} from '@radix-ui/react-popover';
import type * as React from 'react';

import { cn } from '@/shared/common/lib/utils';

function Popover({ ...props }: React.ComponentProps<typeof PopoverRoot>) {
  return <PopoverRoot data-slot="popover" {...props} />;
}

function PopoverTriggerComponent({
  ...props
}: React.ComponentProps<typeof PopoverTrigger>) {
  return <PopoverTrigger data-slot="popover-trigger" {...props} />;
}

function PopoverContentComponent({
  className,
  align = 'center',
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof PopoverContent>) {
  return (
    <PopoverPortal>
      <PopoverContent
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          'bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 origin-(--radix-popover-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden',
          className
        )}
        {...props}
      />
    </PopoverPortal>
  );
}

function PopoverAnchorComponent({
  ...props
}: React.ComponentProps<typeof PopoverClose>) {
  return <PopoverClose data-slot="popover-anchor" {...props} />;
}

export {
  Popover,
  PopoverTriggerComponent as PopoverTrigger,
  PopoverContentComponent as PopoverContent,
  PopoverAnchorComponent as PopoverAnchor,
};
