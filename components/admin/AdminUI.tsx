
import React, { useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';

// --- NOTIFICATION TOAST ---
interface NotificationToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-6 py-4 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.5)] animate-slide-up border-l-4 ${
        type === 'success' ? 'bg-gray-800 border-emerald-500 text-white' : 'bg-gray-800 border-red-500 text-white'
    }`}>
        {type === 'success' ? <CheckCircle className="text-emerald-500" size={20} /> : <AlertCircle className="text-red-500" size={20} />}
        <span className="font-bold text-sm">{message}</span>
        <button onClick={onClose} className="ml-4 text-gray-500 hover:text-white"><X size={16}/></button>
    </div>
  );
};

// --- CONFIRMATION MODAL ---
interface ConfirmModalProps {
  title: string;
  message: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  confirmLabel?: string;
  isDestructive?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({ 
    title, message, onConfirm, onCancel, confirmLabel = "Confirm", isDestructive = false 
}) => {
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
        <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-slide-up">
            <div className="p-6 text-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${isDestructive ? 'bg-red-900/30 text-red-500' : 'bg-yellow-900/30 text-yellow-500'}`}>
                    <AlertTriangle size={24} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                <p className="text-gray-400 text-sm">{message}</p>
            </div>
            <div className="flex border-t border-gray-800 bg-gray-800/50">
                <button 
                    onClick={onCancel}
                    className="flex-1 py-4 text-sm font-bold text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                >
                    Cancel
                </button>
                <div className="w-px bg-gray-800"></div>
                <button 
                    onClick={onConfirm as any}
                    className={`flex-1 py-4 text-sm font-bold transition-colors ${isDestructive ? 'text-red-400 hover:bg-red-900/20' : 'text-emerald-400 hover:bg-emerald-900/20'}`}
                >
                    {confirmLabel}
                </button>
            </div>
        </div>
    </div>
  );
};