import { Skeleton } from '@/shared/client/ui/skeleton';

interface AnalyticsCardSkeletonProps {
  count?: number;
  className?: string;
}

export function AnalyticsCardSkeleton({
  count = 4,
  className = 'grid grid-cols-1 md:grid-cols-2 gap-3.5',
}: AnalyticsCardSkeletonProps) {
  return (
    <div className={className}>
      {Array.from({ length: count }, (_, index) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton items don't change order
          key={`card-skeleton-${index}`}
          className="group relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-200 dark:border-gray-700"
        >
          <div className="relative">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 rounded-lg shadow-md bg-gray-300 dark:bg-gray-600">
                <Skeleton className="h-4 w-4" />
              </div>
              <div className="flex items-start justify-between w-full">
                <Skeleton className="h-4 w-24" />
                <div className="p-1 rounded-full mt-0.5 ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0">
                  <Skeleton className="h-4 w-4" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function AnalyticsChartSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <Skeleton className="h-6 w-32 mb-4" />
      <Skeleton className="h-4 w-64 mb-6" />
      <Skeleton className="h-80 w-full rounded-lg" />
    </div>
  );
}
