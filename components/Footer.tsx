
import React, { useState } from 'react';
import { ViewState } from '../types';
import { ChevronUp, ChevronDown, Info } from 'lucide-react';

interface FooterProps {
    onNavigate: (view: ViewState) => void;
    currentView: ViewState;
}

const Footer: React.FC<FooterProps> = ({ onNavigate, currentView }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // DASHBOARD MODE: Floating / Collapsible Footer
  if (currentView === 'DASHBOARD') {
      return (
          <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none flex flex-col items-center">
              {/* Sliding Panel */}
              <div 
                className={`pointer-events-auto transition-transform duration-300 ease-in-out bg-gray-950/95 backdrop-blur-xl border-t border-gray-700 w-full md:w-auto md:min-w-[400px] md:rounded-t-xl overflow-hidden shadow-[0_-5px_20px_rgba(0,0,0,0.5)] flex flex-col ${isExpanded ? 'translate-y-[calc(0%-56px)] md:translate-y-0' : 'translate-y-[100%]'}`}
              >
                  {/* Close Toggle (Visible only when expanded) */}
                  <button 
                    onClick={() => setIsExpanded(false)}
                    className="w-full h-8 bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white transition-colors flex items-center justify-center border-b border-gray-800"
                  >
                      <ChevronDown size={20} />
                  </button>
                  
                  {/* Content */}
                  <div className="p-6 flex flex-col md:flex-row items-center justify-center gap-6 text-xs text-gray-500">
                     <span className="text-gray-400 font-bold font-mono uppercase tracking-wider">&copy; ZoneRun 2025</span>
                     <div className="flex flex-wrap justify-center gap-6 font-medium">
                        <button onClick={() => onNavigate('RULES')} className="hover:text-emerald-400 transition-colors">Rules</button>
                        <button onClick={() => onNavigate('PRIVACY')} className="hover:text-emerald-400 transition-colors">Privacy</button>
                        <button onClick={() => onNavigate('TERMS')} className="hover:text-emerald-400 transition-colors">Terms</button>
                        <button onClick={() => onNavigate('COMMUNITY')} className="hover:text-emerald-400 transition-colors">Community</button>
                     </div>
                  </div>
              </div>

              {/* Triggers (Visible only when collapsed) */}
              <div className={`pointer-events-auto absolute bottom-[66px] md:bottom-0 transition-opacity duration-300 ${isExpanded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                  
                  {/* Mobile Trigger: Round Icon above Bottom Nav */}
                  <button 
                     onClick={() => setIsExpanded(true)}
                     className="md:hidden bg-gray-800/90 backdrop-blur p-2.5 rounded-full border border-gray-700 shadow-lg text-gray-400 hover:text-white"
                  >
                     <Info size={20} />
                  </button>
                  
                  {/* Desktop Trigger: Tab at bottom */}
                  <button 
                     onClick={() => setIsExpanded(true)}
                     className="hidden md:flex bg-gray-900 border border-gray-700 border-b-0 rounded-t-lg px-6 py-1.5 text-xs font-bold text-gray-400 hover:text-emerald-400 items-center gap-2 shadow-lg"
                  >
                     <Info size={14} /> Legal & Info
                  </button>
              </div>
          </div>
      );
  }

  // STANDARD MODE: Static Footer (Landing Page, Rules, Profile, etc.)
  return (
    <footer className="bg-gray-950 border-t border-gray-800 py-10 relative z-30 mt-auto">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 gap-4">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-500 cursor-pointer" onClick={() => onNavigate('DASHBOARD')}>ZoneRun</span> 
          <span className="text-gray-700">|</span>
          <span>&copy; 2025 Decentralized Move-to-Earn</span>
        </div>
        <div className="flex flex-wrap justify-center gap-8 font-medium">
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