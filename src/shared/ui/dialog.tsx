'use client';

import {
  Close as DialogClose,
  Content as DialogContent,
  Description as DialogDescription,
  Overlay as DialogOverlay,
  Portal as DialogPortal,
  Root as DialogRoot,
  Title as DialogTitle,
  Trigger as DialogTrigger,
} from '@radix-ui/react-dialog';
import type * as React from 'react';
import { XIcon } from '@/shared/icons';

import { cn } from '@/shared/lib/utils';

function Dialog({ ...props }: React.ComponentProps<typeof DialogRoot>) {
  return <DialogRoot data-slot="dialog" {...props} />;
}

function DialogTriggerComponent({
  ...props
}: React.ComponentProps<typeof DialogTrigger>) {
  return <DialogTrigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortalComponent({
  ...props
}: React.ComponentProps<typeof DialogPortal>) {
  return <DialogPortal data-slot="dialog-portal" {...props} />;
}

function DialogCloseComponent({
  ...props
}: React.ComponentProps<typeof DialogClose>) {
  return <DialogClose data-slot="dialog-close" {...props} />;
}

function DialogOverlayComponent({
  className,
  ...props
}: React.ComponentProps<typeof DialogOverlay>) {
  return (
    <DialogOverlay
      data-slot="dialog-overlay"
      className={cn(
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50',
        className
      )}
      {...props}
    />
  );
}

function DialogContentComponent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogContent> & {
  showCloseButton?: boolean;
}) {
  return (
    <DialogPortalComponent data-slot="dialog-portal">
      <DialogOverlayComponent />
      <DialogContent
        data-slot="dialog-content"
        className={cn(
          'bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg',
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogCloseComponent
            data-slot="dialog-close"
            className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 cursor-pointer"
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogCloseComponent>
        )}
      </DialogContent>
    </DialogPortalComponent>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="dialog-header"
      className={cn('flex flex-col gap-2 text-center sm:text-left', className)}
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        'flex flex-col-reverse gap-2 sm:flex-row sm:justify-end',
        className
      )}
      {...props}
    />
  );
}

function DialogTitleComponent({
  className,
  ...props
}: React.ComponentProps<typeof DialogTitle>) {
  return (
    <DialogTitle
      data-slot="dialog-title"
      className={cn('text-lg leading-none font-semibold', className)}
      {...props}
    />
  );
}

function DialogDescriptionComponent({
  className,
  ...props
}: React.ComponentProps<typeof DialogDescription>) {
  return (
    <DialogDescription
      data-slot="dialog-description"
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogCloseComponent as DialogClose,
  DialogContentComponent as DialogContent,
  DialogDescriptionComponent as DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlayComponent as DialogOverlay,
  DialogPortalComponent as DialogPortal,
  DialogTitleComponent as DialogTitle,
  DialogTriggerComponent as DialogTrigger,
};
