'use client';

import { Suspense } from 'react';
import { useUser } from '@/entities/user';
import { HistoryPage as HistoryPageComponent } from '@/features/history/ui/history-page';
import { HistoryPageSkeleton } from '@/features/history/ui/history-page-skeleton';
import { AuthRequiredMessage } from '@/shared/client/components';

export default function HistoryPage() {
  const { user } = useUser();

  if (!user) {
    return <AuthRequiredMessage messageKey="auth.authRequired" />;
  }

  return (
    <div className="container mx-auto">
      <Suspense fallback={<HistoryPageSkeleton />}>
        <HistoryPageComponent selectedDate={new Date()} />
      </Suspense>
    </div>
  );
}
