import { useTranslation } from '@/shared/client/contexts/translation-context';
import { PageHeader } from '@/shared/client/ui';
import { Skeleton } from '@/shared/client/ui/skeleton';

export function AnalyticsDataLoadingSkeleton() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto">
      <PageHeader
        title={t('analytics.title')}
        description={t('analytics.description')}
      />

      <div className="space-y-8">
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton items don't change order
                key={`overview-card-${index}`}
                className="group relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-200 dark:border-gray-700"
              >
                <div className="relative">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2 rounded-lg bg-gray-300 dark:bg-gray-600">
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
        </section>

        <section>
          <h2 className="text-[21px] sm:text-3xl font-medium text-gray-900 dark:text-gray-100 mb-6">
            {t('analytics.achievements')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton items don't change order
                key={`productivity-card-${index}`}
                className="group relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-200 dark:border-gray-700"
              >
                <div className="relative">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2 rounded-lg bg-gray-300 dark:bg-gray-600">
                      <Skeleton className="h-4 w-4" />
                    </div>
                    <div className="flex items-start justify-between w-full">
                      <Skeleton className="h-4 w-28" />
                      <div className="p-1 rounded-full mt-0.5 ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0">
                        <Skeleton className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-[21px] sm:text-3xl font-medium text-gray-900 dark:text-gray-100 mb-6">
            {t('analytics.chartsAndInsights')}
          </h2>
          <div className="space-y-4">
            <div className="flex space-x-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton
                  // biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton items don't change order
                  key={`tab-${index}`}
                  className="h-10 w-20 rounded-md"
                />
              ))}
            </div>

            {/* Main chart skeleton */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <Skeleton className="h-6 w-32 mb-4" />
              <Skeleton className="h-4 w-64 mb-6" />
              <Skeleton className="h-80 w-full rounded-lg" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
