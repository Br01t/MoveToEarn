
import React from 'react';
import { ViewState } from '../types';
import { useLanguage } from '../LanguageContext';

interface FooterProps {
    onNavigate: (view: ViewState) => void;
    currentView: ViewState;
    isAuthenticated: boolean;
    isHidden?: boolean;
}

const Footer: React.FC<FooterProps> = ({ onNavigate, currentView, isAuthenticated, isHidden }) => {
  const { t } = useLanguage();

  // 1. DASHBOARD MODE: No Footer
  // The map takes up the full screen, and we removed the floating widget as requested.
  if (currentView === 'DASHBOARD') {
      return null;
  }

  // 2. STANDARD MODE: Static Footer (Landing Page, Rules, Profile, Market, etc.)
  return (
    <footer className={`bg-gray-950 border-t border-gray-800 py-10 relative z-30 mt-auto ${isHidden ? 'hidden' : ''}`}>
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 gap-4">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-500 cursor-pointer" onClick={() => onNavigate('DASHBOARD')}>ZoneRun</span> 
          <span className="text-gray-700">|</span>
          <span className="font-mono text-xs">{t('footer.subtitle')}</span>
        </div>
        <div className="flex flex-wrap justify-center gap-6 font-medium">
           <button onClick={() => onNavigate('RULES')} className="hover:text-emerald-400 transition-colors">{t('footer.rules')}</button>
           <button onClick={() => onNavigate('PRIVACY')} className="hover:text-emerald-400 transition-colors">{t('footer.privacy')}</button>
           <button onClick={() => onNavigate('TERMS')} className="hover:text-emerald-400 transition-colors">{t('footer.terms')}</button>
           <button onClick={() => onNavigate('COMMUNITY')} className="hover:text-emerald-400 transition-colors">{t('footer.community')}</button>
           
           {/* Added these links here since they were previously only in the dashboard sliding panel */}
           {isAuthenticated && (
               <>
                   <button onClick={() => onNavigate('REPORT_BUG')} className="hover:text-red-400 transition-colors">{t('footer.report_bug')}</button>
                   <button onClick={() => onNavigate('SUGGESTION')} className="hover:text-yellow-400 transition-colors">{t('footer.suggestion')}</button>
               </>
           )}
        </div>
        <div className="text-xs text-gray-600 font-mono">
           &copy; {new Date().getFullYear()} ZoneRun Protocol
        </div>
      </div>
    </footer>
  );
};

export default Footer;