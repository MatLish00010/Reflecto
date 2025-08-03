import React from 'react';
import { Card, CardContent, CardHeader } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';

export const LoadingDisplay: React.FC = () => {
  return (
    <section className="flex items-center justify-center">
      <div className="max-w-6xl w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(index => (
            <Card key={index} className="h-full flex flex-col">
              <CardHeader>
                <Skeleton className="h-6 w-32 mx-auto mb-2" />
                <div className="text-center">
                  <Skeleton className="h-8 w-20 mx-auto mb-1" />
                  <Skeleton className="h-4 w-16 mx-auto" />
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <Skeleton className="h-12 w-full mb-6 mt-auto" />
                <div className="text-center">
                  <Skeleton className="h-4 w-48 mx-auto" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
