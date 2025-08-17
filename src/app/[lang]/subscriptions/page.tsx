import { Suspense } from 'react';
import { SubscriptionsPage } from '@/features/subscriptions';
import { SubscriptionsPageSkeleton } from '@/features/subscriptions/ui/subscriptions-page-skeleton';

export default function SubscriptionsPageWrapper() {
  return (
    <Suspense fallback={<SubscriptionsPageSkeleton />}>
      <SubscriptionsPage />
    </Suspense>
  );
}
