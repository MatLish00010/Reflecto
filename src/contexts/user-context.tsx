'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useUser } from '@/hooks/use-user';
import type { Tables } from '@/types/supabase';

type User = Tables<'users'>;

interface UserContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const userData = useUser();

  return (
    <UserContext.Provider value={userData}>{children}</UserContext.Provider>
  );
}

export function useUserContext() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
}
