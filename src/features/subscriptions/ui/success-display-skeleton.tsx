import type React from 'react';
import { Card, CardContent } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';

export const SuccessDisplaySkeleton: React.FC = () => {
  return (
    <section className="flex items-center justify-center">
      <div className="max-w-md w-full">
        <Card>
          <CardContent className="text-center py-8">
            <Skeleton className="w-16 h-16 rounded-full mx-auto mb-4" />
            <Skeleton className="h-8 w-48 mx-auto mb-4" />
            <Skeleton className="h-4 w-64 mx-auto mb-6" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
