import { useState, useCallback } from 'react';

interface AlertState {
  message: string | null;
  type: 'error' | 'success' | 'warning' | 'info';
  isVisible: boolean;
}

export function useAlert() {
  const [alert, setAlert] = useState<AlertState>({
    message: null,
    type: 'error',
    isVisible: false,
  });

  const showError = useCallback((message: string) => {
    setAlert({
      message,
      type: 'error',
      isVisible: true,
    });
  }, []);

  const showSuccess = useCallback((message: string) => {
    setAlert({
      message,
      type: 'success',
      isVisible: true,
    });
  }, []);

  const showWarning = useCallback((message: string) => {
    setAlert({
      message,
      type: 'warning',
      isVisible: true,
    });
  }, []);

  const showInfo = useCallback((message: string) => {
    setAlert({
      message,
      type: 'info',
      isVisible: true,
    });
  }, []);

  const hideAlert = useCallback(() => {
    setAlert(prev => ({ ...prev, isVisible: false }));
  }, []);

  const clearAlert = useCallback(() => {
    setAlert({
      message: null,
      type: 'error',
      isVisible: false,
    });
  }, []);

  return {
    alert,
    showError,
    showSuccess,
    showWarning,
    showInfo,
    hideAlert,
    clearAlert,
  };
}
