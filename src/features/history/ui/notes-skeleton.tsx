'use client';

import { Card, CardContent, CardHeader } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';

export function NotesSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(3)].map((_, index) => (
        <Card
          key={`note-skeleton-${index}`}
          className="relative py-4 px-4 gap-1"
        >
          <CardHeader className="px-0">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-3 w-3" />
              <Skeleton className="h-3 w-12" />
            </div>
          </CardHeader>
          <CardContent className="px-0">
            <div className="space-y-1">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
