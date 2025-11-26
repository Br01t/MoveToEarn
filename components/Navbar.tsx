
import React from 'react';
import { ViewState, User } from '../types';
import { Map, ShoppingBag, Trophy, Wallet, LogOut, Package, User as UserIcon } from 'lucide-react';

interface NavbarProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  user: User | null;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, user, onLogout }) => {
  if (!user) return null;

  const NavItem = ({ view, icon: Icon, label }: { view: ViewState; icon: any; label: string }) => (
    <button
      onClick={() => onNavigate(view)}
      className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
        currentView === view
          ? 'bg-emerald-500/20 text-emerald-400'
          : 'text-gray-400 hover:text-white hover:bg-gray-800'
      }`}
    >
      <Icon size={20} />
      <span className="hidden md:inline font-medium">{label}</span>
    </button>
  );

  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-500 cursor-pointer" onClick={() => onNavigate('DASHBOARD')}>
              ZoneRun
            </span>
          </div>
          
          <div className="flex items-center space-x-1 md:space-x-2 lg:space-x-4">
            <NavItem view="DASHBOARD" icon={Map} label="Map" />
            <NavItem view="MARKETPLACE" icon={ShoppingBag} label="Market" />
            <NavItem view="INVENTORY" icon={Package} label="Items" />
            <NavItem view="LEADERBOARD" icon={Trophy} label="Rank" />
            <NavItem view="WALLET" icon={Wallet} label="Wallet" />
            <NavItem view="PROFILE" icon={UserIcon} label="Profile" />
          </div>

          <div className="flex items-center ml-4">
            <button
              onClick={onLogout}
              className="p-2 text-gray-500 hover:text-red-400 transition-colors"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
