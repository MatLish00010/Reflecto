'use client';

import { useUser } from '@/entities/user';
import { AuthRequiredMessage } from '@/shared/components';
import { HistoryPage as HistoryPageComponent } from '@/features/history/ui/history-page';

export default function HistoryPage() {
  const { user } = useUser();

  if (!user) {
    return <AuthRequiredMessage messageKey="auth.authRequired" />;
  }

  return (
    <div className="container mx-auto">
      <HistoryPageComponent selectedDate={new Date()} />
    </div>
  );
}
