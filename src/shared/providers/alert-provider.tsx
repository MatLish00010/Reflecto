'use client';

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Info,
  X,
} from '@/shared/icons';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';

interface AlertState {
  message: string | null;
  type: 'error' | 'success' | 'warning' | 'info';
  isVisible: boolean;
}

interface AlertContextType {
  showError: (message: string) => void;
  showSuccess: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
  hideAlert: () => void;
  clearAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function useAlertContext() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlertContext must be used within AlertProvider');
  }
  return context;
}

interface AlertProviderProps {
  children: ReactNode;
}

export function AlertProvider({ children }: AlertProviderProps) {
  const [alert, setAlert] = useState<AlertState>({
    message: null,
    type: 'error',
    isVisible: false,
  });

  const hideAlert = useCallback(() => {
    setAlert(prev => ({ ...prev, isVisible: false }));
  }, []);

  // Auto-hide alerts after 5 seconds
  useEffect(() => {
    if (alert.isVisible && alert.message) {
      const timer = setTimeout(() => {
        hideAlert();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [alert.isVisible, alert.message, hideAlert]);

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

  const clearAlert = useCallback(() => {
    setAlert({
      message: null,
      type: 'error',
      isVisible: false,
    });
  }, []);

  const getAlertIcon = () => {
    switch (alert.type) {
      case 'error':
        return <AlertCircle className="h-4 w-4" />;
      case 'success':
        return <CheckCircle className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'info':
        return <Info className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getAlertVariant = () => {
    switch (alert.type) {
      case 'error':
        return 'destructive';
      case 'success':
        return 'success';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'default';
    }
  };

  const getAlertClassName = () => {
    const baseClasses =
      'fixed top-4 right-4 z-[9999] max-w-sm transition-all duration-300 ease-in-out shadow-lg rounded-lg';

    if (alert.isVisible) {
      return `${baseClasses} opacity-100 translate-y-0`;
    } else {
      return `${baseClasses} opacity-0 -translate-y-2 pointer-events-none`;
    }
  };

  const handleClose = () => {
    hideAlert();
  };

  return (
    <AlertContext.Provider
      value={{
        showError,
        showSuccess,
        showWarning,
        showInfo,
        hideAlert,
        clearAlert,
      }}
    >
      {children}

      <div className={getAlertClassName()}>
        {alert.message && (
          <Alert
            variant={getAlertVariant() as 'default' | 'destructive'}
            className="relative"
          >
            {getAlertIcon()}
            <AlertDescription className="pr-8">
              {alert.message}
            </AlertDescription>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="absolute top-2 right-2 h-6 w-6 p-0 hover:bg-background/80"
            >
              <X className="h-3 w-3" />
            </Button>
          </Alert>
        )}
      </div>
    </AlertContext.Provider>
  );
}
