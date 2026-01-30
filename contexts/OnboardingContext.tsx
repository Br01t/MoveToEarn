import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';

export interface OnboardingStep {
  id: string;
  targetId: string;
  titleKey: string;
  contentKey: string;
  view: string; 
}

interface OnboardingContextType {
  isActive: boolean;
  currentStepIndex: number;
  startTutorial: () => void;
  stopTutorial: () => void;
  skipTutorial: () => void;
  nextStep: () => void;
  prevStep: () => void;
  steps: OnboardingStep[];
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const steps: OnboardingStep[] = useMemo(() => [
    {
      id: 'welcome',
      targetId: 'root',
      titleKey: 'tutorial.welcome.title',
      contentKey: 'tutorial.welcome.content',
      view: 'DASHBOARD'
    },
    {
      id: 'map_grid',
      targetId: 'hex-map-container',
      titleKey: 'tutorial.map_grid.title',
      contentKey: 'tutorial.map_grid.content',
      view: 'DASHBOARD'
    },
    {
      id: 'toggle_exp',
      targetId: 'toggle-exploration',
      titleKey: 'tutorial.toggle_exp.title',
      contentKey: 'tutorial.toggle_exp.content',
      view: 'DASHBOARD'
    },
    {
      id: 'toggle_traj',
      targetId: 'toggle-trajectories',
      titleKey: 'tutorial.toggle_traj.title',
      contentKey: 'tutorial.toggle_traj.content',
      view: 'DASHBOARD'
    },
    {
      id: 'sync_action',
      targetId: 'sync-trigger-btn',
      titleKey: 'tutorial.sync_action.title',
      contentKey: 'tutorial.sync_action.content',
      view: 'DASHBOARD'
    },
    {
      id: 'nav_market',
      targetId: 'nav-item-MARKETPLACE',
      titleKey: 'tutorial.nav_market.title',
      contentKey: 'tutorial.nav_market.content',
      view: 'MARKETPLACE'
    },
    {
      id: 'nav_inventory',
      targetId: 'nav-item-INVENTORY',
      titleKey: 'tutorial.nav_inventory.title',
      contentKey: 'tutorial.nav_inventory.content',
      view: 'INVENTORY'
    },
    {
      id: 'nav_missions',
      targetId: 'nav-item-MISSIONS',
      titleKey: 'tutorial.nav_missions.title',
      contentKey: 'tutorial.nav_missions.content',
      view: 'MISSIONS'
    },
    {
      id: 'nav_leaderboard',
      targetId: 'nav-item-LEADERBOARD',
      titleKey: 'tutorial.nav_leaderboard.title',
      contentKey: 'tutorial.nav_leaderboard.content',
      view: 'LEADERBOARD'
    },
    {
      id: 'nav_wallet',
      targetId: 'nav-item-WALLET',
      titleKey: 'tutorial.nav_wallet.title',
      contentKey: 'tutorial.nav_wallet.content',
      view: 'WALLET'
    },
    {
      id: 'nav_profile',
      targetId: 'nav-item-PROFILE',
      titleKey: 'tutorial.nav_profile.title',
      contentKey: 'tutorial.nav_profile.content',
      view: 'PROFILE'
    },
    {
      id: 'end',
      targetId: 'root',
      titleKey: 'tutorial.end.title',
      contentKey: 'tutorial.end.content',
      view: 'DASHBOARD'
    }
  ], []);

  const startTutorial = useCallback(() => {
    setCurrentStepIndex(0);
    setIsActive(true);
  }, []);

  const stopTutorial = useCallback(() => {
    setIsActive(false);
    localStorage.setItem('zr_onboarding_complete', 'true');
  }, []);

  const skipTutorial = useCallback(() => {
    setIsActive(false);
    localStorage.setItem('zr_onboarding_complete', 'true');
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStepIndex(prev => {
      if (prev < steps.length - 1) {
          return prev + 1;
      } else {
          setTimeout(() => {
            setIsActive(false);
            localStorage.setItem('zr_onboarding_complete', 'true');
          }, 100);
          return prev;
      }
    });
  }, [steps.length]);

  const prevStep = useCallback(() => {
    setCurrentStepIndex(prev => (prev > 0 ? prev - 1 : prev));
  }, []);

  const value = useMemo(() => ({
    isActive,
    currentStepIndex,
    startTutorial,
    stopTutorial,
    skipTutorial,
    nextStep,
    prevStep,
    steps
  }), [isActive, currentStepIndex, startTutorial, stopTutorial, skipTutorial, nextStep, prevStep, steps]);

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) throw new Error('useOnboarding must be used within OnboardingProvider');
  return context;
};