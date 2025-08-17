'use client';

import { Suspense } from 'react';
import { useUser } from '@/entities/user';
import { AuthRequiredMessage } from '@/shared/components';
import { HistoryPage as HistoryPageComponent } from '@/features/history/ui/history-page';
import { HistoryPageSkeleton } from '@/features/history/ui/history-page-skeleton';

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
