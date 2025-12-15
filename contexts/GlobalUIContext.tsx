
import React, { createContext, useContext, useState, ReactNode } from 'react';
import GameToast, { ToastType } from '../components/GameToast';
import { ConfirmModal } from '../components/admin/AdminUI';

interface ConfirmOptions {
  title: string;
  message: string;
  onConfirm: () => void | Promise<void>;
  isDestructive?: boolean;
  confirmLabel?: string;
}

interface GlobalUIContextType {
  showToast: (message: string, type: ToastType) => void;
  showConfirm: (options: ConfirmOptions) => void;
  closeConfirm: () => void;
}

const GlobalUIContext = createContext<GlobalUIContextType | undefined>(undefined);

export const GlobalUIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [confirmState, setConfirmState] = useState<ConfirmOptions | null>(null);

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
  };

  const showConfirm = (options: ConfirmOptions) => {
    setConfirmState(options);
  };

  const closeConfirm = () => {
    setConfirmState(null);
  };

  return (
    <GlobalUIContext.Provider value={{ showToast, showConfirm, closeConfirm }}>
      {children}
      {toast && (
        <GameToast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      {confirmState && (
        <ConfirmModal
          title={confirmState.title}
          message={confirmState.message}
          onConfirm={async () => {
            await confirmState.onConfirm();
            closeConfirm();
          }}
          onCancel={closeConfirm}
          isDestructive={confirmState.isDestructive}
          confirmLabel={confirmState.confirmLabel}
        />
      )}
    </GlobalUIContext.Provider>
  );
};

export const useGlobalUI = () => {
  const context = useContext(GlobalUIContext);
  if (!context) {
    throw new Error('useGlobalUI must be used within a GlobalUIProvider');
  }
  return context;
};