'use client';

import type { User } from '@supabase/supabase-js';
import { createContext, type ReactNode, useContext } from 'react';

interface UserContextType {
  user: User | null;
  isSubscribed: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
  initialUser: User | null;
  isSubscribed: boolean;
}

export function UserProvider({
  children,
  initialUser,
  isSubscribed,
}: UserProviderProps) {
  return (
    <UserContext.Provider value={{ user: initialUser, isSubscribed }}>
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
