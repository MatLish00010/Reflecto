"use client";

import { createContext, useContext, ReactNode } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, AlertTriangle, Info } from "lucide-react";
import { useAlert } from "@/hooks/use-alert";

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
    throw new Error("useAlertContext must be used within AlertProvider");
  }
  return context;
}

interface AlertProviderProps {
  children: ReactNode;
}

export function AlertProvider({ children }: AlertProviderProps) {
  const {
    alert,
    showError,
    showSuccess,
    showWarning,
    showInfo,
    hideAlert,
    clearAlert,
  } = useAlert();

  const getAlertIcon = () => {
    switch (alert.type) {
      case "error":
        return <AlertCircle className="h-4 w-4" />;
      case "success":
        return <CheckCircle className="h-4 w-4" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4" />;
      case "info":
        return <Info className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getAlertVariant = () => {
    switch (alert.type) {
      case "error":
        return "destructive";
      case "success":
        return "default";
      case "warning":
        return "default";
      case "info":
        return "default";
      default:
        return "default";
    }
  };

  const getAlertClassName = () => {
    const baseClasses =
      "fixed top-4 right-4 z-50 max-w-sm transition-all duration-300";

    if (alert.isVisible) {
      return `${baseClasses} opacity-100 translate-y-0`;
    } else {
      return `${baseClasses} opacity-0 -translate-y-2 pointer-events-none`;
    }
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
          <Alert variant={getAlertVariant() as "default" | "destructive"}>
            {getAlertIcon()}
            <AlertDescription>{alert.message}</AlertDescription>
          </Alert>
        )}
      </div>
    </AlertContext.Provider>
  );
}
