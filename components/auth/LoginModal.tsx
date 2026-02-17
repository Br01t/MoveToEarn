import React, { useState, useEffect } from 'react';
import { Mail, ArrowRight, X, Activity, AlertTriangle, Lock, User as UserIcon, KeyRound, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { useLanguage } from '../../LanguageContext';

interface LoginModalProps {
  onClose: () => void;
  onLogin: (email: string, password: string) => Promise<{ error: any }>;
  onRegister: (email: string, password: string, username: string) => Promise<{ error: any }>;
  onResetPassword: (email: string) => Promise<{ error: any }>;
  initialView?: 'LOGIN' | 'SIGNUP' | 'RESET' | 'UPDATE_PASSWORD';
  onUpdatePassword?: (password: string) => Promise<{ error: any }>;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose, onLogin, onRegister, onResetPassword, initialView = 'LOGIN', onUpdatePassword }) => {
  const { t } = useLanguage();
  const [viewState, setViewState] = useState<'LOGIN' | 'SIGNUP' | 'RESET' | 'UPDATE_PASSWORD'>(initialView);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState(''); 
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
      setViewState(initialView);
  }, [initialView]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    
    try {
      if (viewState === 'UPDATE_PASSWORD') {
          if (!password) return;
          if (password.length < 6) throw new Error(t('auth.error_password_length'));
          if (onUpdatePassword) {
              const { error } = await onUpdatePassword(password);
              if (error) throw error;
              setSuccessMsg(t('auth.success_update'));
              setTimeout(() => {
                  setViewState('LOGIN');
                  setSuccessMsg(null);
              }, 2500);
          }
      } else if (viewState === 'RESET') {
          if (!email) return;
          const { error } = await onResetPassword(email);
          if (error) throw error;
          setSuccessMsg(t('auth.success_reset'));
      } else if (viewState === 'SIGNUP') {
          if (!email || !password || !username) return;
          const { error } = await onRegister(email, password, username);
          if (error) throw error;
          setSuccessMsg(t('auth.success_signup'));
      } else {
          if (!email || !password) return;
          const { error } = await onLogin(email, password);
          if (error) throw error;
          setSuccessMsg(t('auth.success_login'));
      }
    } catch (err: any) {
      setErrorMsg(err.message || t('auth.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchView = (view: 'LOGIN' | 'SIGNUP' | 'RESET') => {
      setViewState(view);
      setErrorMsg(null);
      setSuccessMsg(null);
  };

  const getTitle = () => {
      switch(viewState) {
          case 'SIGNUP': return t('auth.signup_title');
          case 'RESET': return t('auth.reset_title');
          case 'UPDATE_PASSWORD': return t('auth.update_title');
          default: return t('auth.title');
      }
  };

  const getSubtitle = () => {
      switch(viewState) {
          case 'SIGNUP': return t('auth.signup_subtitle');
          case 'RESET': return t('auth.reset_subtitle');
          case 'UPDATE_PASSWORD': return t('auth.update_subtitle');
          default: return t('auth.subtitle');
      }
  };

  const getButtonLabel = () => {
      switch(viewState) {
          case 'SIGNUP': return t('auth.btn_signup');
          case 'RESET': return t('auth.btn_reset');
          case 'UPDATE_PASSWORD': return t('auth.btn_save');
          default: return t('auth.btn_login');
      }
  };

  return (
    <div 
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="relative w-full max-w-md glass-panel-heavy rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(16,185,129,0.15)]">
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px] opacity-10 pointer-events-none"></div>
        
        {viewState !== 'UPDATE_PASSWORD' && !successMsg && (
            <button 
                type="button" 
                onClick={onClose} 
                className="absolute top-4 right-4 text-gray-500 hover:text-white z-50 transition-colors p-2 hover:bg-white/10 rounded-full"
            >
              <X size={24} />
            </button>
        )}

        <div className="p-8 relative z-10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto bg-emerald-500/10 rounded-full flex items-center justify-center mb-4 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
               {viewState === 'RESET' || viewState === 'UPDATE_PASSWORD' ? <KeyRound size={32} className="text-emerald-400" /> : <Activity size={32} className="text-emerald-400" />}
            </div>
            <h2 id="auth-modal-title" className="text-3xl font-black text-white tracking-tighter uppercase mb-1">
              {getTitle()}
            </h2>
            <p className="text-gray-400 text-sm">
              {getSubtitle()}
            </p>
          </div>

          <div className="space-y-6">
            {successMsg ? (
                <div className="bg-emerald-500/10 border border-emerald-500/50 p-6 rounded-xl flex flex-col items-center gap-4 text-center animate-fade-in">
                    <CheckCircle size={48} className="text-emerald-400 animate-bounce" />
                    <p className="text-emerald-300 text-sm font-bold">{successMsg}</p>
                    {viewState === 'RESET' && (
                        <button 
                            onClick={() => handleSwitchView('LOGIN')}
                            className="text-white bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider"
                        >
                            {t('auth.back_to_login')}
                        </button>
                    )}
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                {viewState === 'SIGNUP' && (
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2 pl-1">{t('auth.username_label')}</label>
                        <div className="relative group">
                          <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-400 transition-colors" size={20} />
                          <input 
                              type="text" 
                              placeholder="RunnerOne"
                              className="w-full bg-black/40 border border-gray-600 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-emerald-500 transition-all placeholder-gray-600"
                              value={username}
                              onChange={(e) => setUsername(e.target.value)}
                              required={viewState === 'SIGNUP'}
                          />
                        </div>
                    </div>
                )}

                {viewState !== 'UPDATE_PASSWORD' && (
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2 pl-1">{t('auth.email_label')}</label>
                        <div className="relative group">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-400 transition-colors" size={20} />
                          <input 
                              type="email" 
                              placeholder={t('auth.email_placeholder')}
                              className="w-full bg-black/40 border border-gray-600 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-emerald-500 transition-all placeholder-gray-600"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required
                          />
                        </div>
                    </div>
                )}

                {(viewState === 'LOGIN' || viewState === 'SIGNUP' || viewState === 'UPDATE_PASSWORD') && (
                    <div>
                        <div className="flex justify-between items-center mb-2 px-1">
                            <label className="block text-xs font-bold text-gray-500 uppercase">
                              {viewState === 'UPDATE_PASSWORD' ? t('auth.password_new_label') : t('auth.password_label')}
                            </label>
                            {viewState === 'LOGIN' && (
                                <button 
                                    type="button"
                                    onClick={() => handleSwitchView('RESET')}
                                    className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 uppercase tracking-wider"
                                >
                                    {t('auth.forgot_password')}
                                </button>
                            )}
                        </div>
                        <div className="relative group">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-400 transition-colors" size={20} />
                          <input 
                              type="password" 
                              placeholder="••••••••"
                              className="w-full bg-black/40 border border-gray-600 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-emerald-500 transition-all placeholder-gray-600"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              required
                              minLength={6}
                          />
                        </div>
                    </div>
                )}

                {errorMsg && (
                    <div className="bg-red-900/30 border border-red-500/50 p-3 rounded-lg flex items-center gap-2 text-red-200 text-xs">
                      <AlertTriangle size={14} className="text-red-400" /> {errorMsg}
                    </div>
                )}

                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black py-4 rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70"
                >
                    {isLoading ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                    <>
                        {getButtonLabel()} 
                        {viewState !== 'RESET' && <ArrowRight size={20} />}
                    </>
                    )}
                </button>
                </form>
            )}

            {!successMsg && (
                <div className="text-center pt-4 border-t border-white/10">
                    {viewState === 'RESET' ? (
                        <button 
                            type="button"
                            onClick={() => handleSwitchView('LOGIN')}
                            className="text-gray-400 hover:text-white font-bold text-xs flex items-center justify-center gap-2 mx-auto"
                        >
                            <ArrowLeft size={14} /> {t('auth.back_to_login')}
                        </button>
                    ) : viewState === 'UPDATE_PASSWORD' ? (
                        <p className="text-[10px] text-gray-600 uppercase">{t('auth.session_security')}</p>
                    ) : (
                        <>
                            <p className="text-gray-500 text-sm mb-2">
                                {viewState === 'SIGNUP' ? t('auth.has_account') : t('auth.no_account')}
                            </p>
                            <button 
                                type="button"
                                onClick={() => handleSwitchView(viewState === 'SIGNUP' ? 'LOGIN' : 'SIGNUP')}
                                className="text-emerald-400 font-bold hover:text-emerald-300 uppercase tracking-wider text-xs"
                            >
                                {viewState === 'SIGNUP' ? t('auth.switch_login') : t('auth.switch_signup')}
                            </button>
                        </>
                    )}
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;