
import React, { useEffect } from 'react';
import { Zap, Shield, CheckCircle, X } from 'lucide-react';

export type ToastType = 'BOOST' | 'DEFENSE' | 'SUCCESS';

interface GameToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

const GameToast: React.FC<GameToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); // Auto close after 3 seconds
    return () => clearTimeout(timer);
  }, [onClose]);

  const getStyle = () => {
    switch (type) {
      case 'BOOST':
        return {
          bg: 'bg-amber-900/90',
          border: 'border-amber-500',
          text: 'text-white',
          iconColor: 'text-amber-400',
          Icon: Zap,
          shadow: 'shadow-[0_0_20px_rgba(245,158,11,0.4)]'
        };
      case 'DEFENSE':
        return {
          bg: 'bg-cyan-900/90',
          border: 'border-cyan-500',
          text: 'text-white',
          iconColor: 'text-cyan-400',
          Icon: Shield,
          shadow: 'shadow-[0_0_20px_rgba(6,182,212,0.4)]'
        };
      case 'SUCCESS':
      default:
        return {
          bg: 'bg-emerald-900/90',
          border: 'border-emerald-500',
          text: 'text-white',
          iconColor: 'text-emerald-400',
          Icon: CheckCircle,
          shadow: 'shadow-[0_0_20px_rgba(16,185,129,0.4)]'
        };
    }
  };

  const style = getStyle();
  const Icon = style.Icon;

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[200] w-full max-w-sm px-4 animate-slide-down pointer-events-none">
      <div className={`pointer-events-auto flex items-center justify-between p-4 rounded-xl border-2 backdrop-blur-md ${style.bg} ${style.border} ${style.shadow} ${style.text}`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full bg-black/20 ${style.iconColor}`}>
            <Icon size={24} className="animate-pulse" />
          </div>
          <span className="font-bold text-sm shadow-black drop-shadow-md">{message}</span>
        </div>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-white/10 rounded-full transition-colors"
        >
          <X size={18} className="opacity-70" />
        </button>
      </div>
    </div>
  );
};

export default GameToast;