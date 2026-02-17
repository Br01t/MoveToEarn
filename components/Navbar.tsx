import React from 'react';
import { ViewState, User } from '../types';
import { Map, ShoppingBag, Trophy, Wallet, LogOut, Package, User as UserIcon, Settings, Target, Volume2, VolumeX } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { useGlobalUI } from '../contexts/GlobalUIContext';
import LanguageDropdown from './ui/LanguageDropdown';

interface NavbarProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  user: User | null;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, user, onLogout }) => {
  const { t } = useLanguage();
  const { isMuted, toggleMute } = useGlobalUI();

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
          compact ? 'py-2.5 w-full' : 'py-2 px-3 md:flex-row md:space-x-2'
        } ${isActive ? activeClass : inactiveClass}`}
      >
        <Icon size={compact ? 24 : 20} className={isActive ? 'stroke-2' : 'stroke-1'} aria-hidden="true" />
        <span className={`${compact ? 'text-xs mt-1' : 'text-xs md:text-sm mt-1 md:mt-0'} font-bold uppercase tracking-wide truncate max-w-full leading-tight`}>
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
          className="flex-1 min-w-0 mr-3"
          onClick={() => handleNavClick('DASHBOARD')}
        >
          <span className="text-lg font-black uppercase tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-500 truncate block">
            ZoneRun
          </span>
        </div>
        
        <div className="flex items-center gap-1 shrink-0">
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
          
          <div className="flex items-center shrink-0 min-w-[150px]">
            <span 
              className="text-3xl font-black uppercase tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-500 cursor-pointer" 
              onClick={() => handleNavClick('DASHBOARD')}
              role="link"
              aria-label="ZoneRun Home"
            >
              ZoneRun
            </span>
          </div>
          
          <div className="flex-1 flex justify-center items-center space-x-1 lg:space-x-2">
            <NavItem view="DASHBOARD" icon={Map} label={t('nav.map')} id="nav-item-DASHBOARD" />
            <NavItem view="MARKETPLACE" icon={ShoppingBag} label={t('nav.market')} id="nav-item-MARKETPLACE" />
            <NavItem view="INVENTORY" icon={Package} label={t('nav.inventory')} id="nav-item-INVENTORY" />
            <NavItem view="MISSIONS" icon={Target} label={t('nav.missions')} id="nav-item-MISSIONS" />
            <NavItem view="LEADERBOARD" icon={Trophy} label={t('nav.rank')} id="nav-item-LEADERBOARD" />
            <NavItem view="WALLET" icon={Wallet} label={t('nav.wallet')} id="nav-item-WALLET" />
            <NavItem view="PROFILE" icon={UserIcon} label={t('nav.profile')} id="nav-item-PROFILE" />
            
            {user.isAdmin && (
                <>
                  <div className="h-6 w-px bg-gray-700 mx-2" aria-hidden="true"></div>
                  <NavItem view="ADMIN" icon={Settings} label={t('nav.admin')} isAdmin={true} />
                </>
            )}
          </div>

          <div className="flex items-center justify-end shrink-0 min-w-[150px] gap-2">
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
           <div className="grid grid-cols-3 w-full border-b border-gray-800/30">
               <NavItem view="DASHBOARD" icon={Map} label={t('nav.map')} compact={true} id="nav-item-DASHBOARD-mobile" />
               <NavItem view="MISSIONS" icon={Target} label={t('nav.missions')} compact={true} id="nav-item-MISSIONS-mobile" />
               <NavItem view="LEADERBOARD" icon={Trophy} label={t('nav.rank')} compact={true} id="nav-item-LEADERBOARD-mobile" />
           </div>
           <div className="grid grid-cols-4 w-full">
               <NavItem view="MARKETPLACE" icon={ShoppingBag} label={t('nav.market')} compact={true} id="nav-item-MARKETPLACE-mobile" />
               <NavItem view="PROFILE" icon={UserIcon} label={t('nav.profile')} compact={true} id="nav-item-PROFILE-mobile" />
               <NavItem view="INVENTORY" icon={Package} label={t('nav.inventory')} compact={true} id="nav-item-INVENTORY-mobile" />
               <NavItem view="WALLET" icon={Wallet} label={t('nav.wallet')} compact={true} id="nav-item-WALLET-mobile" />
           </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;