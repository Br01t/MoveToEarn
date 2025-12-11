
import React, { useState, useEffect } from 'react';
import { Mail, ArrowRight, X, Activity, AlertTriangle, Lock, User as UserIcon, KeyRound, CheckCircle, ArrowLeft } from 'lucide-react';
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
          if (onUpdatePassword) {
              const { error } = await onUpdatePassword(password);
              if (error) throw error;
              setSuccessMsg("Password updated successfully! You can now log in.");
              setTimeout(() => {
                  onClose();
              }, 2000);
          }
      } else if (viewState === 'RESET') {
          if (!email) return;
          const { error } = await onResetPassword(email);
          if (error) throw error;
          setSuccessMsg("Check your email for the reset link.");
      } else if (viewState === 'SIGNUP') {
          if (!email || !password || !username) return;
          const { error } = await onRegister(email, password, username);
          if (error) throw error;
      } else {
          if (!email || !password) return;
          const { error } = await onLogin(email, password);
          if (error) throw error;
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

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-md bg-gray-900 rounded-3xl border-2 border-emerald-500/50 shadow-[0_0_50px_rgba(16,185,129,0.2)] overflow-hidden">
        
        {/* Decorative Grid BG */}
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px] opacity-10 pointer-events-none"></div>
        
        {/* Close Button - Increased z-index and click area */}
        <button 
            type="button" 
            onClick={onClose} 
            className="absolute top-4 right-4 text-gray-500 hover:text-white z-50 transition-colors p-2 bg-gray-900/50 rounded-full"
        >
          <X size={24} />
        </button>

        <div className="p-8 relative z-10">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto bg-emerald-500/10 rounded-full flex items-center justify-center mb-4 border border-emerald-500/30">
               {viewState === 'RESET' || viewState === 'UPDATE_PASSWORD' ? <KeyRound size={32} className="text-emerald-400" /> : <Activity size={32} className="text-emerald-400" />}
            </div>
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-1">
              {viewState === 'SIGNUP' ? 'New Runner' : (viewState === 'RESET' ? 'Reset Password' : (viewState === 'UPDATE_PASSWORD' ? 'New Password' : t('auth.title')))}
            </h2>
            <p className="text-gray-400 text-sm">
              {viewState === 'SIGNUP' ? 'Create your identity to join the grid.' : (viewState === 'RESET' ? 'Enter your email to recover access.' : (viewState === 'UPDATE_PASSWORD' ? 'Enter your new secure password.' : t('auth.subtitle')))}
            </p>
          </div>

          <div className="space-y-6">
            {/* Form */}
            {successMsg ? (
                <div className="bg-emerald-500/10 border border-emerald-500/50 p-6 rounded-xl flex flex-col items-center gap-4 text-center">
                    <CheckCircle size={48} className="text-emerald-400" />
                    <p className="text-emerald-300 text-sm font-bold">{successMsg}</p>
                    {viewState !== 'UPDATE_PASSWORD' && (
                        <button 
                            onClick={() => handleSwitchView('LOGIN')}
                            className="text-white bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider"
                        >
                            Back to Login
                        </button>
                    )}
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                
                {viewState === 'SIGNUP' && (
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2 pl-1">
                        Username
                        </label>
                        <div className="relative group">
                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-400 transition-colors" size={20} />
                        <input 
                            type="text" 
                            placeholder="RunnerOne"
                            className="w-full bg-gray-800 border-2 border-gray-700 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-emerald-500 focus:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required={viewState === 'SIGNUP'}
                        />
                        </div>
                    </div>
                )}

                {viewState !== 'UPDATE_PASSWORD' && (
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2 pl-1">
                        {t('auth.email_label')}
                        </label>
                        <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-400 transition-colors" size={20} />
                        <input 
                            type="email" 
                            placeholder={t('auth.email_placeholder')}
                            className="w-full bg-gray-800 border-2 border-gray-700 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-emerald-500 focus:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        </div>
                    </div>
                )}

                {viewState !== 'RESET' && (
                    <div>
                        <div className="flex justify-between items-center mb-2 px-1">
                            <label className="block text-xs font-bold text-gray-500 uppercase">
                            {viewState === 'UPDATE_PASSWORD' ? 'New Password' : 'Password'}
                            </label>
                            {viewState === 'LOGIN' && (
                                <button 
                                    type="button"
                                    onClick={() => handleSwitchView('RESET')}
                                    className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 uppercase tracking-wider"
                                >
                                    Forgot Password?
                                </button>
                            )}
                        </div>
                        <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-400 transition-colors" size={20} />
                        <input 
                            type="password" 
                            placeholder="••••••••"
                            className="w-full bg-gray-800 border-2 border-gray-700 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-emerald-500 focus:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                        </div>
                    </div>
                )}

                {errorMsg && (
                    <div className="bg-red-500/10 border border-red-500/50 p-3 rounded-lg flex items-center gap-2 text-red-400 text-xs">
                    <AlertTriangle size={14} /> {errorMsg}
                    </div>
                )}

                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait"
                >
                    {isLoading ? (
                    <span className="animate-pulse">{t('auth.sending')}</span>
                    ) : (
                    <>
                        {viewState === 'SIGNUP' ? 'Sign Up' : (viewState === 'RESET' ? 'Send Reset Link' : (viewState === 'UPDATE_PASSWORD' ? 'Save Password' : 'Login'))} 
                        {viewState !== 'RESET' && <ArrowRight size={20} />}
                    </>
                    )}
                </button>
                </form>
            )}

            <div className="text-center pt-4 border-t border-gray-800">
                {viewState === 'RESET' ? (
                    <button 
                        type="button"
                        onClick={() => handleSwitchView('LOGIN')}
                        className="text-gray-400 hover:text-white font-bold text-xs flex items-center justify-center gap-2 mx-auto"
                    >
                        <ArrowLeft size={14} /> Back to Login
                    </button>
                ) : viewState === 'UPDATE_PASSWORD' ? (
                    // No links here, forcing update
                    null
                ) : (
                    <>
                        <p className="text-gray-500 text-sm mb-2">
                            {viewState === 'SIGNUP' ? "Already have an account?" : "Don't have an account?"}
                        </p>
                        <button 
                            type="button"
                            onClick={() => handleSwitchView(viewState === 'SIGNUP' ? 'LOGIN' : 'SIGNUP')}
                            className="text-emerald-400 font-bold hover:text-emerald-300 uppercase tracking-wider text-xs"
                        >
                            {viewState === 'SIGNUP' ? "Switch to Login" : "Create Account"}
                        </button>
                    </>
                )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginModal;