
import React from 'react';
import { ViewState, User } from '../types';
import { Map, ShoppingBag, Trophy, Wallet, LogOut, Package, User as UserIcon, Settings, Target } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

interface NavbarProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  user: User | null;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, user, onLogout }) => {
  const { toggleLanguage, language, t } = useLanguage();

  if (!user) return null;

  const NavItem = ({ view, icon: Icon, label, isAdmin = false, mobileLabel, compact = false }: { view: ViewState; icon: any; label: string; isAdmin?: boolean; mobileLabel?: string; compact?: boolean }) => {
    const isActive = currentView === view;
    const activeClass = isAdmin ? 'text-red-400 bg-red-500/10' : 'text-emerald-400 bg-emerald-500/10';
    const inactiveClass = isAdmin ? 'text-gray-500 hover:text-red-400' : 'text-gray-400 hover:text-white';

    // Mobile layout adjustment: 
    // Increased padding (py-2.5 instead of py-1.5)
    // Increased Icon size (24 instead of 18)
    // Increased Text size (text-[11px] instead of text-[9px])
    return (
      <button
        onClick={() => onNavigate(view)}
        className={`flex flex-col items-center justify-center rounded-lg transition-colors w-full ${
          compact ? 'py-2.5' : 'py-2 px-3 md:flex-row md:space-x-2'
        } ${isActive ? activeClass : inactiveClass}`}
      >
        <Icon size={compact ? 24 : 20} className={isActive ? 'stroke-2' : 'stroke-1'} />
        <span className={`${compact ? 'text-[11px] mt-1' : 'text-[10px] md:text-sm mt-1 md:mt-0'} font-medium truncate max-w-full leading-tight tracking-tight`}>
            {mobileLabel || label}
        </span>
      </button>
    );
  };

  return (
    <>
      {/* DESKTOP TOP BAR */}
      <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50 h-16 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center justify-between h-full">
            <div className="flex items-center">
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-500 cursor-pointer" onClick={() => onNavigate('DASHBOARD')}>
                ZoneRun
              </span>
            </div>
            
            <div className="flex items-center space-x-1 lg:space-x-2">
              <NavItem view="DASHBOARD" icon={Map} label={t('nav.map')} />
              <NavItem view="MARKETPLACE" icon={ShoppingBag} label={t('nav.market')} />
              <NavItem view="INVENTORY" icon={Package} label={t('nav.inventory')} />
              <NavItem view="MISSIONS" icon={Target} label={t('nav.missions')} />
              <NavItem view="LEADERBOARD" icon={Trophy} label={t('nav.rank')} />
              <NavItem view="WALLET" icon={Wallet} label={t('nav.wallet')} />
              <NavItem view="PROFILE" icon={UserIcon} label={t('nav.profile')} />
              
              {user.isAdmin && (
                  <>
                    <div className="h-6 w-px bg-gray-700 mx-2"></div>
                    <NavItem view="ADMIN" icon={Settings} label={t('nav.admin')} isAdmin={true} />
                  </>
              )}
            </div>

            <div className="flex items-center ml-4 gap-2">
              <button
                onClick={toggleLanguage}
                className="p-2 text-xl hover:scale-110 transition-transform bg-gray-800 rounded-lg border border-gray-700"
                title="Switch Language"
              >
                {language === 'en' ? '🇮🇹' : '🇬🇧'}
              </button>
              <button
                onClick={onLogout}
                className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                title={t('nav.logout')}
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* MOBILE TOP BAR (Logo + Language + Admin + Logout) */}
      {/* Increased height to h-16, larger text and icons */}
      <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50 h-16 md:hidden flex justify-between items-center px-4 shadow-lg">
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-500" onClick={() => onNavigate('DASHBOARD')}>
            ZoneRun
          </span>
          <div className="flex items-center gap-4">
             <button
                onClick={toggleLanguage}
                className="text-2xl hover:scale-110 transition-transform"
              >
                {language === 'en' ? '🇮🇹' : '🇬🇧'}
              </button>
             {user.isAdmin && (
                 <button onClick={() => onNavigate('ADMIN')} className={`text-gray-400 ${currentView === 'ADMIN' ? 'text-red-400' : ''}`}>
                    <Settings size={24}/>
                 </button>
             )}
             <button onClick={onLogout} className="text-gray-400 hover:text-white transition-colors"><LogOut size={24}/></button>
          </div>
      </nav>

      {/* MOBILE BOTTOM NAV BAR - 2 ROWS LAYOUT */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-950/95 backdrop-blur-md border-t border-gray-800 z-50 pb-safe shadow-[0_-5px_20px_rgba(0,0,0,0.3)]">
        <div className="flex flex-col w-full">
           
           {/* ROW 1: Map, Missions, Rank (Centered 3 cols) */}
           <div className="grid grid-cols-3 w-full border-b border-gray-800/30">
               <NavItem view="DASHBOARD" icon={Map} label={t('nav.map')} mobileLabel={t('nav.map')} compact={true} />
               <NavItem view="MISSIONS" icon={Target} label={t('nav.missions')} mobileLabel={t('nav.missions')} compact={true} />
               <NavItem view="LEADERBOARD" icon={Trophy} label={t('nav.rank')} mobileLabel={t('nav.rank')} compact={true} />
           </div>

           {/* ROW 2: Market, Profile, Inventory, Wallet (Centered 4 cols) */}
           <div className="grid grid-cols-4 w-full">
               <NavItem view="MARKETPLACE" icon={ShoppingBag} label={t('nav.market')} mobileLabel={t('nav.market')} compact={true} />
               <NavItem view="PROFILE" icon={UserIcon} label={t('nav.profile')} mobileLabel={t('nav.profile')} compact={true} />
               <NavItem view="INVENTORY" icon={Package} label={t('nav.inventory')} mobileLabel={t('nav.inventory')} compact={true} />
               <NavItem view="WALLET" icon={Wallet} label={t('nav.wallet')} mobileLabel={t('nav.wallet')} compact={true} />
           </div>

        </div>
      </nav>
    </>
  );
};

export default Navbar;