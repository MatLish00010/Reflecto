import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { AnalyticsPageSkeleton } from '@/features/analytics/shared/analytics-page-skeleton';

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
