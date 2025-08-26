'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { userKeys } from '@/entities/user/model/use-user';
import { syncAuthSession } from '@/shared/client/lib/auth-sync';

export function AuthSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    syncAuthSession().then(() => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    });
  }, [queryClient]);

  return null;
}
