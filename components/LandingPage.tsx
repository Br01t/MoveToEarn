import React from 'react';
import { Activity, Shield, Coins, TrendingUp } from 'lucide-react';
import { ViewState } from '../types';

interface LandingPageProps {
  onLogin: () => void;
  onNavigate: (view: ViewState) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onNavigate }) => {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px]"></div>
      </div>

      <header className="relative z-10 px-6 py-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="text-3xl font-bold text-white tracking-tighter">
          Zone<span className="text-emerald-400">Run</span>
        </div>
        {/* Top right button removed as requested */}
      </header>

      <main className="relative z-10 flex-1 flex flex-col justify-center items-center px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-4">
            Run. Conquer. <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">Earn.</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            The first Move-to-Earn strategy game. Claim real-world zones by running, earn passive <span className="text-emerald-400 font-mono">RUN</span> interest, and defend your territory with <span className="text-cyan-400 font-mono">GOV</span> tokens.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <button
              onClick={onLogin}
              className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 font-bold text-lg rounded-xl hover:bg-gray-100 transition-colors shadow-lg shadow-white/10"
            >
              Start Running
            </button>
            <button 
              onClick={() => onNavigate('RULES')}
              className="w-full sm:w-auto px-8 py-4 bg-transparent border border-gray-700 text-white font-bold text-lg rounded-xl hover:border-emerald-500 transition-colors"
            >
              How to Play
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-24 max-w-6xl mx-auto w-full px-4">
          <FeatureCard 
            icon={<Activity className="text-emerald-400" size={32} />}
            title="Move to Earn"
            description="Track your kilometers. Every step earns you RUN tokens directly to your wallet."
          />
          <FeatureCard 
            icon={<TrendingUp className="text-purple-400" size={32} />}
            title="Conquer Zones"
            description="Be the top runner in a zone to claim ownership and earn 1% passive tax from others."
          />
          <FeatureCard 
            icon={<Shield className="text-blue-400" size={32} />}
            title="Defend Territory"
            description="Use GOV tokens to buy consumables. Shield your zones from hostile takeovers."
          />
          <FeatureCard 
            icon={<Coins className="text-yellow-400" size={32} />}
            title="Burn & Govern"
            description="Periodic burns increase scarcity. Stake GOV to influence map expansion."
          />
        </div>
      </main>

      <footer className="relative z-10 py-8 text-center text-gray-600 text-sm">
        &copy; 2025 ZoneRun Project. MVP Version.
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: any, title: string, description: string }) => (
  <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-6 rounded-2xl text-left hover:border-emerald-500/50 transition-colors">
    <div className="mb-4 bg-gray-900 w-14 h-14 rounded-full flex items-center justify-center">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
    <p className="text-gray-400 leading-relaxed">{description}</p>
  </div>
);

export default LandingPage;