
import React from 'react';
import { ViewState } from '../types';

interface FooterProps {
    onNavigate: (view: ViewState) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-gray-950 border-t border-gray-800 py-8 relative z-30">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
        <div className="mb-4 md:mb-0 flex items-center gap-2">
          <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-500 cursor-pointer" onClick={() => onNavigate('DASHBOARD')}>ZoneRun</span> 
          <span className="text-gray-600">|</span>
          <span>&copy; 2025 Move-to-Earn</span>
        </div>
        <div className="flex flex-wrap justify-center gap-6">
          <button onClick={() => onNavigate('RULES')} className="hover:text-emerald-400 transition-colors">Game Rules</button>
          <button onClick={() => onNavigate('PRIVACY')} className="hover:text-emerald-400 transition-colors">Privacy Policy</button>
          <button onClick={() => onNavigate('TERMS')} className="hover:text-emerald-400 transition-colors">Terms of Service</button>
          <button onClick={() => onNavigate('COMMUNITY')} className="hover:text-emerald-400 transition-colors">Community</button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
