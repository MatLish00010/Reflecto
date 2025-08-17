import dynamic from 'next/dynamic';
import { Skeleton } from '@/shared/ui/skeleton';

// Dynamic import for analytics with loading fallback
const AnalyticsPage = dynamic(
  () =>
    import('@/features/analytics').then(mod => ({
      default: mod.AnalyticsPage,
    })),
  {
    loading: () => (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    ),
  }
);

export default function AnalyticsPageWrapper() {
  return <AnalyticsPage />;
}
