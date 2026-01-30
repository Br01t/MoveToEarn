import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useOnboarding } from '../contexts/OnboardingContext';
import { ChevronRight, ChevronLeft, X, Target, FastForward } from 'lucide-react';
import { useGlobalUI } from '../contexts/GlobalUIContext';
import { useLanguage } from '../LanguageContext';

const OnboardingManager: React.FC<{ currentView: string; onNavigate: (v: any) => void }> = ({ currentView, onNavigate }) => {
  const { isActive, currentStepIndex, steps, nextStep, prevStep, stopTutorial, skipTutorial } = useOnboarding();
  const { playSound } = useGlobalUI();
  const { t } = useLanguage();
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({ opacity: 0 });
  
  const currentStep = steps[currentStepIndex];

  useEffect(() => {
    if (!isActive || !currentStep) return;

    const updateRect = () => {
      if (currentStep.targetId === 'root') {
        setTargetRect(null);
        return;
      }

      const isMobile = window.innerWidth < 768;
      let finalId = currentStep.targetId;
      if (finalId.startsWith('nav-item-') && isMobile) {
          finalId = `${finalId}-mobile`;
      }

      const el = document.getElementById(finalId);
      if (el) {
        setTargetRect(el.getBoundingClientRect());
      } else {
        setTargetRect(null);
      }
    };

    updateRect();
    const interval = setInterval(updateRect, 150); 
    window.addEventListener('resize', updateRect);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', updateRect);
    };
  }, [isActive, currentStep?.targetId, currentStepIndex]);

  useEffect(() => {
    if (isActive && currentStep?.view && currentStep.view !== currentView) {
      onNavigate(currentStep.view);
    }
  }, [isActive, currentStepIndex, currentView, onNavigate, currentStep?.view]);

  useEffect(() => {
    if (!isActive) return;

    const calculatePosition = () => {
        const padding = 12;
        const isMobile = window.innerWidth < 768;
        const tooltipWidth = isMobile ? Math.min(window.innerWidth - (padding * 2), 280) : 340;
        const tooltipHeight = isMobile ? 180 : 240; 

        if (!targetRect || currentStep.targetId === 'root') {
            setTooltipStyle({
                position: 'fixed',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: `${tooltipWidth}px`,
                opacity: 1,
                zIndex: 310,
                transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
            });
            return;
        }

        const isLargeElement = targetRect.width > window.innerWidth * 0.7;
        const isBottomElement = targetRect.top > window.innerHeight * 0.6;

        let left = targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2);
        let top = targetRect.bottom + 15;

        if (isBottomElement || (top + tooltipHeight > window.innerHeight - padding)) {
            top = targetRect.top - tooltipHeight - 15;
        }

        if (isLargeElement) {
            top = window.innerHeight * 0.3;
            left = (window.innerWidth / 2) - (tooltipWidth / 2);
        }

        const minLeft = padding;
        const maxLeft = window.innerWidth - tooltipWidth - padding;
        left = Math.max(minLeft, Math.min(maxLeft, left));

        const minTop = padding;
        const maxTop = window.innerHeight - tooltipHeight - padding;
        top = Math.max(minTop, Math.min(maxTop, top));

        setTooltipStyle({
            position: 'fixed',
            left: `${left}px`,
            top: `${top}px`,
            width: `${tooltipWidth}px`,
            opacity: 1,
            zIndex: 310,
            transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
        });
    };

    calculatePosition();
    const timer = setTimeout(calculatePosition, 60);
    return () => clearTimeout(timer);
  }, [targetRect, isActive, currentStepIndex, currentStep?.targetId]);

  if (!isActive || !currentStep) return null;

  return (
    <div className="fixed inset-0 z-[300] pointer-events-none overflow-hidden">
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-auto"
        onClick={(e) => {
           if (e.target === e.currentTarget) {
             playSound('CLICK');
             stopTutorial();
           }
        }}
      >
        <defs>
          <mask id="spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {targetRect && (
              <rect 
                x={targetRect.left - 6} 
                y={targetRect.top - 6} 
                width={targetRect.width + 12} 
                height={targetRect.height + 12} 
                fill="black" 
                rx="10"
                className="transition-all duration-300"
              />
            )}
          </mask>
        </defs>
        <rect 
          x="0" y="0" width="100%" height="100%" 
          fill="rgba(2, 6, 23, 0.6)" 
          mask="url(#spotlight-mask)"
        />
      </svg>

      <div 
        ref={tooltipRef}
        style={tooltipStyle}
        className="pointer-events-auto"
      >
        <div className="glass-panel-heavy rounded-2xl border-2 border-emerald-500/50 shadow-[0_0_50px_rgba(16,185,129,0.3)] overflow-hidden animate-slide-up">
          <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-3 py-2 flex justify-between items-center">
            <div className="flex items-center gap-1.5">
                <div className="bg-emerald-500/20 p-1 rounded">
                  <Target size={10} className="text-emerald-400 animate-pulse" />
                </div>
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-emerald-400">{t('tutorial.controls.step')} {currentStepIndex + 1}/{steps.length}</span>
            </div>
            <div className="flex items-center gap-1.5">
                <button 
                  onClick={(e) => { e.stopPropagation(); playSound('CLICK'); skipTutorial(); }}
                  className="text-[8px] font-bold uppercase tracking-widest text-gray-500 hover:text-emerald-400 transition-colors flex items-center gap-1 bg-white/5 px-1.5 py-0.5 rounded-md"
                >
                  <FastForward size={8} /> {t('tutorial.controls.skip')}
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); playSound('CLICK'); stopTutorial(); }}
                  className="text-gray-500 hover:text-white transition-colors p-0.5"
                >
                  <X size={14} />
                </button>
            </div>
          </div>

          <div className="p-3 md:p-5">
            <h4 className="text-white font-bold text-sm md:text-lg mb-1 uppercase tracking-tight leading-tight">{t(currentStep.titleKey)}</h4>
            <p className="text-gray-400 text-[10px] md:text-sm leading-snug mb-4 font-medium">
              {t(currentStep.contentKey)}
            </p>

            <div className="flex gap-2">
              {currentStepIndex > 0 && (
                <button 
                  onClick={(e) => { e.stopPropagation(); playSound('CLICK'); prevStep(); }}
                  className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold rounded-lg text-[9px] uppercase flex items-center justify-center gap-1 transition-all active:scale-95"
                >
                  {t('tutorial.controls.back')}
                </button>
              )}
              <button 
                onClick={(e) => { e.stopPropagation(); playSound('SUCCESS'); nextStep(); }}
                className="flex-[2] py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-lg text-[9px] uppercase flex items-center justify-center gap-1 shadow-lg transition-all active:scale-95"
              >
                {currentStepIndex === steps.length - 1 ? t('tutorial.controls.finish') : t('tutorial.controls.next')} <ChevronRight size={12} />
              </button>
            </div>
          </div>
          
          <div className="h-0.5 bg-gray-900 w-full">
            <div 
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingManager;