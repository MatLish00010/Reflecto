import type React from 'react';
import { Card, CardContent } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';

export const ProductDisplaySkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
      {[1, 2, 3].map(index => (
        <div key={index} className="relative h-full">
          <Card className="relative overflow-hidden h-full flex flex-col">
            <CardContent className="p-4 flex flex-col flex-1">
              <div className="flex items-center justify-between mb-4 lg:flex-col lg:text-center lg:mb-6">
                <div className="flex items-center gap-3 lg:flex-col lg:gap-0 lg:mb-3">
                  <div className="lg:mb-3">
                    <Skeleton className="w-12 h-12 rounded-lg" />
                  </div>
                  <div>
                    <Skeleton className="h-5 w-20 lg:w-24" />
                  </div>
                </div>

                <div className="text-right lg:text-center">
                  <Skeleton className="h-8 w-16 lg:h-10 lg:w-20 lg:mb-1" />
                  <Skeleton className="h-4 w-12 lg:h-4 lg:w-16 lg:mb-2 lg:block hidden" />
                  <div className="mt-1 lg:mt-0">
                    <Skeleton className="h-5 w-16" />
                  </div>
                </div>
              </div>

              <div className="mt-auto">
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
};
