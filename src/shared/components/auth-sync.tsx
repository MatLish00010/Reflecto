'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { syncAuthSession } from '@/shared/lib/auth-sync';
import { userKeys } from '@/entities/user/model/use-user';

export function AuthSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    syncAuthSession().then(() => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    });
  }, [queryClient]);

  return null;
}
