import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User as UserIcon, X, Camera, ArrowRight, Globe } from 'lucide-react';
import { useLanguage } from '../../LanguageContext';
import { User, ViewState } from '../../types';
import LanguageDropdown from './LanguageDropdown';

interface ProfilePicReminderProps {
  user: User | null;
  onNavigate: (view: ViewState) => void;
  isOpen: boolean;
  onClose: () => void;
}

const ProfilePicReminder: React.FC<ProfilePicReminderProps> = ({ user, onNavigate, isOpen, onClose }) => {
  const { t } = useLanguage();
  const [dontShowAgain, setDontShowAgain] = useState(false);

  if (!user || !isOpen) return null;

  const isDefaultAvatar = user.avatar?.includes('dicebear.com');

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem(`zr_hide_avatar_reminder_${user.id}`, 'true');
    }
    onClose();
  };

  const handleGoToProfile = () => {
    if (dontShowAgain) {
      localStorage.setItem(`zr_hide_avatar_reminder_${user.id}`, 'true');
    }
    onNavigate('PROFILE');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-gray-900 border border-emerald-500/30 rounded-2xl overflow-hidden shadow-2xl shadow-emerald-500/10"
          >
            <div className="absolute top-4 left-4 z-20">
              <LanguageDropdown align="left" />
            </div>

            <div className="bg-emerald-500/10 p-6 flex flex-col items-center text-center border-b border-emerald-500/20">
              <div className="relative mb-4">
                <div className="w-20 h-20 rounded-full bg-gray-800 border-2 border-emerald-500 flex items-center justify-center overflow-hidden">
                  {isDefaultAvatar ? (
                    <UserIcon size={40} className="text-emerald-500/50" />
                  ) : (
                    <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-gray-950 shadow-lg">
                  <Camera size={16} />
                </div>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {t('alert.profile_pic_reminder.title')}
              </h2>
            </div>

            <div className="p-6 space-y-6">
              <p className="text-slate-400 text-center leading-relaxed">
                {t('alert.profile_pic_reminder.body')}
              </p>

              <div className="flex items-center justify-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={dontShowAgain}
                      onChange={(e) => setDontShowAgain(e.target.checked)}
                    />
                    <div className="w-5 h-5 border-2 border-emerald-500/30 rounded peer-checked:bg-emerald-500 peer-checked:border-emerald-500 transition-all duration-200"></div>
                    <X size={14} className="absolute text-gray-950 opacity-0 peer-checked:opacity-100 transition-opacity duration-200" />
                  </div>
                  <span className="text-sm text-slate-500 group-hover:text-slate-300 transition-colors">
                    {t('alert.profile_pic_reminder.dont_show')}
                  </span>
                </label>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleGoToProfile}
                  className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  {t('alert.profile_pic_reminder.btn')}
                  <ArrowRight size={18} />
                </button>
                <button
                  onClick={handleClose}
                  className="w-full py-3 px-4 bg-gray-800 hover:bg-gray-700 text-slate-300 font-medium rounded-xl transition-all active:scale-[0.98]"
                >
                  {t('landing.close')}
                </button>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ProfilePicReminder;