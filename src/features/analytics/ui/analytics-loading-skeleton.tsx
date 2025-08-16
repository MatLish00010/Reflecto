import { Skeleton } from '@/shared/ui/skeleton';
import { AnalyticsHeader } from './analytics-header';

interface AnalyticsLoadingSkeletonProps {
  fromDate: Date | string;
  toDate: Date | string;
}

export function AnalyticsLoadingSkeleton({
  fromDate,
  toDate,
}: AnalyticsLoadingSkeletonProps) {
  return (
    <div className="container mx-auto">
      <AnalyticsHeader fromDate={fromDate} toDate={toDate} />

      <div className="space-y-8">
        <section>
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </section>

        <section>
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </section>

        <section>
          <Skeleton className="h-8 w-48 mb-6" />
          <Skeleton className="h-96" />
        </section>
      </div>
    </div>
  );
}
