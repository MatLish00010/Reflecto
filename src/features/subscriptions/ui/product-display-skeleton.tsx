import type React from 'react';
import { Card, CardContent, CardHeader } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';

export const ProductDisplaySkeleton: React.FC = () => {
  return (
    <div className="flex items-center justify-center">
      <div className="max-w-6xl w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card
              key={`product-skeleton-${index}`}
              className="h-full flex flex-col"
            >
              <CardHeader>
                <Skeleton className="h-8 w-32 mx-auto mb-4" />
                <div className="text-center">
                  <div className="relative">
                    <Skeleton className="h-10 w-20 mx-auto mb-2" />
                    <Skeleton className="h-5 w-12 mx-auto" />
                  </div>
                  <Skeleton className="h-4 w-24 mx-auto mt-1" />
                  <Skeleton className="h-3 w-48 mx-auto mt-1" />
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col">
                <Skeleton className="h-12 w-full rounded-lg mt-auto" />
                <div className="mt-6 text-center">
                  <Skeleton className="h-4 w-48 mx-auto" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
