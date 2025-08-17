import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { AnalyticsPageSkeleton } from '@/features/analytics/ui/analytics-page-skeleton';

// Dynamic import for analytics with streaming
const AnalyticsPage = dynamic(() =>
  import('@/features/analytics').then(mod => ({
    default: mod.AnalyticsPage,
  }))
);

export default function AnalyticsPageWrapper() {
  return (
    <Suspense fallback={<AnalyticsPageSkeleton />}>
      <AnalyticsPage />
    </Suspense>
  );
}
