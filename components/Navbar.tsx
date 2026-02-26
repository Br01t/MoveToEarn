import React from 'react';
import { ViewState, User } from '../types';
import { Map, ShoppingBag, Trophy, Wallet, LogOut, Package, User as UserIcon, Settings, Target, Volume2, VolumeX, HelpCircle, Info, UploadCloud } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { useGlobalUI } from '../contexts/GlobalUIContext';
import { useOnboarding } from '../contexts/OnboardingContext';
import { NAVBAR_LOGO_URL } from '../constants';
import LanguageDropdown from './ui/LanguageDropdown';

interface NavbarProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  user: User | null;
  onLogout: () => void;
  onOpenSync?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, user, onLogout, onOpenSync }) => {
  const { t } = useLanguage();
  const { isMuted, toggleMute } = useGlobalUI();
  const { startTutorial } = useOnboarding();

  if (!user) return null;

  const handleNavClick = (view: ViewState) => {
    onNavigate(view);
  };

  const NavItem = ({ view, icon: Icon, label, isAdmin = false, mobileLabel, compact = false, id }: { view: ViewState; icon: any; label: string; isAdmin?: boolean; mobileLabel?: string; compact?: boolean, id?: string }) => {
    const isActive = currentView === view;
    const activeClass = isAdmin ? 'text-red-400 bg-red-500/10' : 'text-emerald-400 bg-emerald-500/10';
    const inactiveClass = isAdmin ? 'text-gray-500 hover:text-red-400' : 'text-gray-400 hover:text-white';

    return (
      <button
        id={id}
        onClick={() => handleNavClick(view)}
        aria-current={isActive ? 'page' : undefined}
        aria-label={label}
        className={`flex flex-col items-center justify-center rounded-lg transition-colors ${
          compact ? 'py-2.5 w-full' : 'py-2 px-1.5 md:flex-row md:space-x-1'
        } ${isActive ? activeClass : inactiveClass}`}
      >
        <Icon size={compact ? 24 : 20} className={isActive ? 'stroke-2' : 'stroke-1'} aria-hidden="true" />
        <span className={`${compact ? 'text-[11px] mt-1' : 'text-xs md:text-sm mt-1 md:mt-0'} font-bold uppercase tracking-wide max-w-full leading-tight text-center px-1`}>
            {mobileLabel || label}
        </span>
      </button>
    );
  };

  return (
    <>
      <nav 
        className="md:hidden bg-gray-950/95 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50 h-16 flex items-center justify-between px-3"
        role="banner"
        aria-label="Mobile Header"
      >
        <div 
          className="flex-1 min-w-0 mr-3 flex items-center"
          onClick={() => handleNavClick('DASHBOARD')}
        >
          <img src={NAVBAR_LOGO_URL} alt="Logo" className="w-12 h-12 object-contain" referrerPolicy="no-referrer" />
          <span className="hidden text-lg font-black uppercase tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-500 truncate">
            ZoneRun
          </span>
        </div>
        
        <div className="flex items-center gap-1 shrink-0">
            <div className="relative group/tooltip">
              <button
                onClick={startTutorial}
                className="p-1 text-emerald-400 hover:text-emerald-300 transition-colors h-[32px] w-[32px] flex items-center justify-center border border-emerald-500/20 bg-emerald-900/10 rounded-lg"
                aria-label="Start Tutorial"
              >
                <HelpCircle size={16} aria-hidden="true" />
              </button>
              <div className="absolute right-0 top-full mt-2 px-3 py-2 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none whitespace-nowrap text-[11px] font-bold text-emerald-400 z-50">
                {t('nav.tutorial_tooltip') || 'Start Tutorial'}
                <div className="absolute right-3 -top-1 w-2 h-2 bg-gray-900 border-l border-t border-white/10 rotate-45"></div>
              </div>
            </div>

            <LanguageDropdown align="right" isCompact={true} />
            
            <button
              onClick={toggleMute}
              className={`p-1 transition-colors rounded-lg border h-[32px] w-[32px] flex items-center justify-center ${isMuted ? 'text-red-400 border-red-500/20 bg-red-900/10' : 'text-gray-400 border-white/10 bg-gray-900'}`}
              aria-label={isMuted ? "Unmute sounds" : "Mute sounds"}
            >
              {isMuted ? <VolumeX size={14} aria-hidden="true" /> : <Volume2 size={14} aria-hidden="true" />}
            </button>

            {user.isAdmin && (
                <button
                  onClick={() => handleNavClick('ADMIN')}
                  className={`p-1 transition-colors rounded-lg border h-[32px] w-[32px] flex items-center justify-center ${currentView === 'ADMIN' ? 'text-red-400 border-red-500/40 bg-red-900/20' : 'text-gray-500 border-white/10 bg-gray-900 hover:text-red-400'}`}
                  aria-label={t('nav.admin')}
                >
                  <Settings size={14} aria-hidden="true" />
                </button>
            )}

            <button
              onClick={onLogout}
              className="p-1 text-gray-500 hover:text-red-400 transition-colors h-[32px] w-[32px] flex items-center justify-center"
              aria-label={t('nav.logout')}
            >
              <LogOut size={14} aria-hidden="true" />
            </button>
        </div>
      </nav>

      <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50 h-16 hidden md:block" role="navigation" aria-label="Main Desktop Navigation">
        <div className="w-full h-full px-6 flex items-center justify-between">
          
          <div className="flex items-center shrink-0 min-w-[150px] gap-3">
            <img src={NAVBAR_LOGO_URL} alt="Logo" className="w-12 h-12 object-contain" referrerPolicy="no-referrer" />
            <span 
              className="text-3xl font-black uppercase tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 cursor-pointer" 
              onClick={() => handleNavClick('DASHBOARD')}
              role="link"
              aria-label="ZoneRun Home"
            >
              ZoneRun
            </span>
          </div>
          
          <div className="flex-1 flex justify-end items-center space-x-0.5">
            <NavItem view="DASHBOARD" icon={Map} label={t('nav.map')} id="nav-item-DASHBOARD" />
            <NavItem view="MARKETPLACE" icon={ShoppingBag} label={t('nav.market')} id="nav-item-MARKETPLACE" />
            <NavItem view="INVENTORY" icon={Package} label={t('nav.inventory')} id="nav-item-INVENTORY" />
            <NavItem view="MISSIONS" icon={Target} label={t('nav.missions')} id="nav-item-MISSIONS" />
            <NavItem view="LEADERBOARD" icon={Trophy} label={t('nav.rank')} id="nav-item-LEADERBOARD" />
            <NavItem view="WALLET" icon={Wallet} label={t('nav.wallet')} id="nav-item-WALLET" />
            <NavItem view="PROFILE" icon={UserIcon} label={t('nav.profile')} id="nav-item-PROFILE" />
            <NavItem view="INFO" icon={Info} label={t('nav.info')} id="nav-item-INFO" />
            
            {user.isAdmin && (
                <>
                  <div className="h-6 w-px bg-gray-700 mx-2" aria-hidden="true"></div>
                  <NavItem view="ADMIN" icon={Settings} label={t('nav.admin')} isAdmin={true} />
                </>
            )}
          </div>

          <div className="flex items-center justify-end shrink-0 min-w-[150px] gap-2">
            <div className="relative group/tooltip">
              <button
                onClick={startTutorial}
                className="p-2 text-emerald-400 hover:text-emerald-300 transition-colors h-[34px] w-[34px] flex items-center justify-center border border-emerald-500/30 bg-emerald-900/10 rounded-lg"
                aria-label="Start Tutorial"
              >
                <HelpCircle size={18} aria-hidden="true" />
              </button>
              <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-2 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none whitespace-nowrap text-[11px] font-bold text-emerald-400 z-50">
                {t('nav.tutorial_tooltip') || 'Start Tutorial'}
                <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-900 border-r border-t border-white/10 rotate-45"></div>
              </div>
            </div>

            <LanguageDropdown align="right" />
            
            <button
              onClick={toggleMute}
              className={`p-2 transition-colors rounded-lg border h-[34px] w-[34px] flex items-center justify-center ${isMuted ? 'text-red-400 border-red-500/30 bg-red-900/10' : 'text-gray-400 border-white/10 bg-gray-800 hover:text-white'}`}
              aria-label={isMuted ? "Unmute sounds" : "Mute sounds"}
            >
              {isMuted ? <VolumeX size={16} aria-hidden="true" /> : <Volume2 size={16} aria-hidden="true" />}
            </button>

            <div className="w-px h-6 bg-gray-700 mx-1" aria-hidden="true"></div>

            <button
              onClick={onLogout}
              className="p-2 text-gray-500 hover:text-red-400 transition-colors"
              aria-label={t('nav.logout')}
            >
              <LogOut size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      </nav>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-950/95 backdrop-blur-md border-t border-gray-800 z-50 pb-safe shadow-[0_-5px_20px_rgba(0,0,0,0.3)]" role="navigation" aria-label="Mobile Navigation Menu">
        <div className="flex flex-col w-full">
           <div className="grid grid-cols-4 w-full border-b border-gray-800/30">
               {onOpenSync && (
                 <button
                   id="sync-trigger-btn-mobile"
                   onClick={onOpenSync}
                   className="flex flex-col items-center justify-center py-2.5 w-full text-emerald-400 hover:text-emerald-300 transition-colors"
                   aria-label={t('sync.title')}
                 >
                   <UploadCloud size={24} className="animate-pulse" aria-hidden="true" />
                   <span className="text-[11px] mt-1 font-bold uppercase tracking-wide leading-tight text-center px-1">
                     {t('dash.sync_btn_sub')}
                   </span>
                 </button>
               )}
               <NavItem view="DASHBOARD" icon={Map} label={t('nav.map')} compact={true} id="nav-item-DASHBOARD-mobile" />
               <NavItem view="MISSIONS" icon={Target} label={t('nav.missions')} compact={true} id="nav-item-MISSIONS-mobile" />
               <NavItem view="LEADERBOARD" icon={Trophy} label={t('nav.rank')} compact={true} id="nav-item-LEADERBOARD-mobile" />
           </div>
           <div className="grid grid-cols-5 w-full">
               <NavItem view="MARKETPLACE" icon={ShoppingBag} label={t('nav.market')} compact={true} id="nav-item-MARKETPLACE-mobile" />
               <NavItem view="PROFILE" icon={UserIcon} label={t('nav.profile')} compact={true} id="nav-item-PROFILE-mobile" />
               <NavItem view="INVENTORY" icon={Package} label={t('nav.inventory')} compact={true} id="nav-item-INVENTORY-mobile" />
               <NavItem view="WALLET" icon={Wallet} label={t('nav.wallet')} compact={true} id="nav-item-WALLET-mobile" />
               <NavItem view="INFO" icon={Info} label={t('nav.info')} compact={true} id="nav-item-INFO-mobile" />
           </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;