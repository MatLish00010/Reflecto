'use client';

import type { User } from '@supabase/supabase-js';
import { createContext, type ReactNode, useContext } from 'react';
import type { UserSubscription } from '@/shared/common/types/subscriptions';

interface UserContextType {
  user: User | null;
  subscription: UserSubscription | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
  initialUser: User | null;
  subscription: UserSubscription | null;
}

export function UserProvider({
  children,
  initialUser,
  subscription,
}: UserProviderProps) {
  return (
    <UserContext.Provider value={{ user: initialUser, subscription }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
