
import React, { useState } from 'react';
import { Mail, ArrowRight, X, Activity, AlertTriangle, Lock, User as UserIcon } from 'lucide-react';
import { useLanguage } from '../../LanguageContext';

interface LoginModalProps {
  onClose: () => void;
  onLogin: (email: string, password: string) => Promise<{ error: any }>;
  onRegister: (email: string, password: string, username: string) => Promise<{ error: any }>;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose, onLogin, onRegister }) => {
  const { t } = useLanguage();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState(''); 
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    if (isSignUp && !username) return;
    
    setIsLoading(true);
    setErrorMsg(null);
    
    try {
      if (isSignUp) {
          const { error } = await onRegister(email, password, username);
          if (error) throw error;
          // App.tsx useEffect will handle redirection and closing
      } else {
          const { error } = await onLogin(email, password);
          if (error) throw error;
          // App.tsx useEffect will handle redirection and closing
      }
    } catch (err: any) {
      setErrorMsg(err.message || t('auth.error'));
      setIsLoading(false);
    }
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
               <Activity size={32} className="text-emerald-400" />
            </div>
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-1">
              {isSignUp ? 'New Runner' : t('auth.title')}
            </h2>
            <p className="text-gray-400 text-sm">
              {isSignUp ? 'Create your identity to join the grid.' : t('auth.subtitle')}
            </p>
          </div>

          <div className="space-y-6">
            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {isSignUp && (
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
                        required={isSignUp}
                      />
                    </div>
                  </div>
              )}

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

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2 pl-1">
                  Password
                </label>
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
                    {isSignUp ? 'Sign Up' : 'Login'} <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-4 border-t border-gray-800">
                <p className="text-gray-500 text-sm mb-2">
                    {isSignUp ? "Already have an account?" : "Don't have an account?"}
                </p>
                <button 
                    type="button"
                    onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(null); }}
                    className="text-emerald-400 font-bold hover:text-emerald-300 uppercase tracking-wider text-xs"
                >
                    {isSignUp ? "Switch to Login" : "Create Account"}
                </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginModal;