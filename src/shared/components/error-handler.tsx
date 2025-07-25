'use client';

import { useEffect } from 'react';
import { useAlertContext } from '@/shared/providers/alert-provider';
import { useTranslation } from '@/shared/contexts/translation-context';

interface QueryErrorHandlerProps {
  errorMap?: Record<string, string>;
  paramName?: string;
}

const DEFAULT_ERROR_MAP: Record<string, string> = {
  no_auth_code: 'auth.authCallbackErrors.no_auth_code',
  auth_callback_error: 'auth.authCallbackErrors.auth_callback_error',
  auth_callback_failed: 'auth.authCallbackErrors.auth_callback_failed',
};

export function QueryErrorHandler({
  errorMap = DEFAULT_ERROR_MAP,
  paramName = 'error',
}: QueryErrorHandlerProps) {
  const { showError } = useAlertContext();
  const { t } = useTranslation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get(paramName);
    if (error && errorMap[error]) {
      const message = errorMap[error].startsWith('auth.')
        ? t(errorMap[error])
        : errorMap[error];
      showError(message);

      params.delete(paramName);
      const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
      window.history.replaceState({}, '', newUrl);
    }
  }, [showError, t, errorMap, paramName]);

  return null;
}
