'use client';

import { AuthModal } from '@/features/auth';
import { useAuthModalContext } from '@/shared/client/contexts/auth-modal-context';

export function AuthModalWrapper() {
  const { isOpen, closeModal } = useAuthModalContext();

  return <AuthModal isOpen={isOpen} onClose={closeModal} />;
}
