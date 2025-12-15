
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import GameToast, { ToastType } from '../components/GameToast';
import { ConfirmModal } from '../components/admin/AdminUI';
import { playSound as playSoundUtil } from '../utils/audio';
import ParticleOverlay from '../components/effects/ParticleOverlay';

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
  triggerParticles: (x: number, y: number, color: string) => void;
  playSound: (type: 'CLICK' | 'HOVER' | 'SUCCESS' | 'ERROR' | 'GLITCH' | 'OPEN') => void;
  isMuted: boolean;
  toggleMute: () => void;
}

const GlobalUIContext = createContext<GlobalUIContextType | undefined>(undefined);

export const GlobalUIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [confirmState, setConfirmState] = useState<ConfirmOptions | null>(null);
  
  // Audio State
  const [isMuted, setIsMuted] = useState(() => {
      const saved = localStorage.getItem('zr_muted');
      return saved === 'true';
  });

  // Particle State
  const [particleEvents, setParticleEvents] = useState<{x: number, y: number, color: string}[]>([]);

  const toggleMute = () => {
      setIsMuted(prev => {
          const newState = !prev;
          localStorage.setItem('zr_muted', String(newState));
          if (!newState) {
              // Play a sound immediately when unmuting to confirm
              playSoundUtil('SUCCESS');
          }
          return newState;
      });
  };

  const playSound = (type: 'CLICK' | 'HOVER' | 'SUCCESS' | 'ERROR' | 'GLITCH' | 'OPEN') => {
      if (isMuted) return;
      playSoundUtil(type);
  };

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
    // Play sound based on toast type
    if (type === 'SUCCESS' || type === 'BOOST' || type === 'DEFENSE') playSound('SUCCESS');
    if (type === 'ERROR') playSound('ERROR');
  };

  const showConfirm = (options: ConfirmOptions) => {
    playSound('OPEN');
    setConfirmState(options);
  };

  const closeConfirm = () => {
    playSound('CLICK');
    setConfirmState(null);
  };

  const triggerParticles = (x: number, y: number, color: string) => {
      setParticleEvents(prev => [...prev, { x, y, color }]);
      playSound('SUCCESS');
  };

  return (
    <GlobalUIContext.Provider value={{ showToast, showConfirm, closeConfirm, triggerParticles, playSound, isMuted, toggleMute }}>
      <ParticleOverlay events={particleEvents} />
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
            playSound('CLICK');
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