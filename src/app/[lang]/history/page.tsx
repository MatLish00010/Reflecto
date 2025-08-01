'use client';

import { useUser } from '@/entities/user';
import { AuthRequiredMessage } from '@/shared/components';
import { History } from '@/features/history';
import { HistoryHeader } from '@/features/history/ui/history-header';

export default function HistoryPage() {
  const { user } = useUser();

  if (!user) {
    return <AuthRequiredMessage messageKey="auth.authRequired" />;
  }

  return (
    <div className="container mx-auto">
      <HistoryHeader />
      <History selectedDate={new Date()} />
    </div>
  );
}
