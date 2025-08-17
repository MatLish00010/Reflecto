import React from 'react';
import { Skeleton } from '@/shared/ui/skeleton';
import { Card, CardContent } from '@/shared/ui/card';

export const MessageDisplaySkeleton: React.FC = () => {
  return (
    <section className="flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card>
          <CardContent className="text-center py-8">
            <Skeleton className="w-16 h-16 rounded-full mx-auto mb-4" />
            <Skeleton className="h-6 w-64 mx-auto" />
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
