
import React, { useState, useEffect } from 'react';
import { Zone, User, Badge, Rarity } from '../../types';
import { X, Crown, Shield, Medal, Lock, Zap, Flag, Award, Mountain, Globe, Home, Landmark, Swords, Footprints, Rocket, Tent, Timer, Building2, Moon, Sun, ShieldCheck, Gem, Users, MapPin, Activity, Coins } from 'lucide-react';
import { useLanguage } from '../../LanguageContext';

interface ZoneStatsModalProps {
  zone: Zone;
  user: User;
  onClose: () => void;
  ownerDetails: { name: string; avatar: string | null; badge: Badge | null | undefined } | null;
  zoneLeaderboard: any[];
}

const ZoneStatsModal: React.FC<ZoneStatsModalProps> = ({ 
    zone, user, onClose, ownerDetails, zoneLeaderboard 
}) => {
  const { t } = useLanguage();
  const [now, setNow] = useState(Date.now());

  // Update timer to handle expiration while modal is open
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const isBoostActive = zone.boostExpiresAt && zone.boostExpiresAt > now;
  const isShieldActive = zone.shieldExpiresAt && zone.shieldExpiresAt > now;

  const renderBadgeIcon = (iconName: string, className: string) => {
      switch(iconName) {
          case 'Flag': return <Flag className={className} />;
          case 'Crown': return <Crown className={className} />;
          case 'Award': return <Award className={className} />;
          case 'Zap': return <Zap className={className} />;
          case 'Mountain': return <Mountain className={className} />;
          case 'Globe': return <Globe className={className} />;
          case 'Home': return <Home className={className} />;
          case 'Landmark': return <Landmark className={className} />;
          case 'Swords': return <Swords className={className} />;
          case 'Footprints': return <Footprints className={className} />;
          case 'Rocket': return <Rocket className={className} />;
          case 'Tent': return <Tent className={className} />;
          case 'Timer': return <Timer className={className} />;
          case 'Building2': return <Building2 className={className} />;
          case 'Moon': return <Moon className={className} />;
          case 'Sun': return <Sun className={className} />;
          case 'ShieldCheck': return <ShieldCheck className={className} />;
          case 'Gem': return <Gem className={className} />;
          case 'Users': return <Users className={className} />;
          default: return <Award className={className} />;
      }
  };

  const getRarityColor = (rarity: Rarity) => {
      switch(rarity) {
          case 'LEGENDARY': return 'text-yellow-400 border-yellow-500/50 bg-yellow-900/20';
          case 'EPIC': return 'text-purple-400 border-purple-500/50 bg-purple-900/20';
          case 'RARE': return 'text-cyan-400 border-cyan-500/50 bg-cyan-900/20';
          default: return 'text-gray-300 border-gray-600 bg-gray-800';
      }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-sm glass-panel-heavy rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-slide-up">
        
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex justify-between items-center bg-black/20">
            <div className="flex items-center gap-2 overflow-hidden">
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 shrink-0 border border-emerald-500/20">
                    <MapPin size={20} />
                </div>
                <h3 className="font-bold text-lg text-white truncate">{zone.name}</h3>
            </div>
            <button onClick={onClose} className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                <X size={20} />
            </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 overflow-y-auto max-h-[70vh]">
            
            {/* Owner Info */}
            {ownerDetails && (
                <div className="bg-black/30 p-4 rounded-xl border border-white/5 flex items-center gap-4">
                    <div className="relative shrink-0">
                        <img 
                            src={ownerDetails.avatar || `https://ui-avatars.com/api/?name=${ownerDetails.name}&background=10b981&color=fff`} 
                            className="w-12 h-12 rounded-full border-2 border-gray-700 object-cover" 
                            alt="Owner"
                        />
                        <div className="absolute -top-1 -right-1 bg-yellow-500 text-black p-0.5 rounded-full ring-2 ring-gray-900">
                            <Crown size={10} />
                        </div>
                    </div>
                    <div className="min-w-0">
                        <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-0.5">{t('zone.owner_info')}</div>
                        <div className="flex items-center gap-2">
                           <div className={`font-bold text-base truncate ${zone.ownerId === user.id ? 'text-emerald-400' : 'text-white'}`}>
                                {ownerDetails.name} {zone.ownerId === user.id && t('zone.you')}
                           </div>
                           {ownerDetails.badge && (
                               <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[9px] ${getRarityColor(ownerDetails.badge.rarity)}`} title={ownerDetails.badge.name}>
                                   {renderBadgeIcon(ownerDetails.badge.icon, "w-3 h-3")}
                               </div>
                           )}
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-black/30 p-3 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center">
                     <div className="text-[10px] text-gray-400 uppercase font-bold mb-1">{t('dash.yield')}</div>
                     <div className="font-mono text-xl font-bold text-emerald-400 flex items-center gap-1">
                         <Zap size={14} className="mb-0.5" /> {zone.interestRate}%
                     </div>
                </div>

                <div className="bg-black/30 p-3 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center">
                     <div className="text-[10px] text-gray-400 uppercase font-bold mb-1">{t('zone.status')}</div>
                     
                     {isBoostActive ? (
                         <div className="font-mono text-lg font-bold text-amber-400 flex items-center gap-1 animate-pulse">
                             <Zap size={14} className="mb-0.5 fill-amber-400" /> {t('zone.boosted')}
                         </div>
                     ) : isShieldActive ? (
                         <div className="font-mono text-lg font-bold text-cyan-400 flex items-center gap-1 animate-pulse">
                             <Shield size={14} className="mb-0.5 fill-cyan-400/50" /> {t('zone.shielded')}
                         </div>
                     ) : (
                         <div className="font-mono text-lg font-bold text-gray-400 flex items-center gap-1">
                             <Activity size={14} className="mb-0.5" /> Standard
                         </div>
                     )}
                </div>
            </div>

            {/* NEW: Interest Pool & Global Distance Block */}
            <div className="bg-emerald-900/20 p-4 rounded-xl border border-emerald-500/20 text-center">
                <div className="mb-3">
                    <div className="text-xs text-emerald-200/70 uppercase font-bold tracking-wider mb-1">{t('zone.interest_pool')}</div>
                    <div className="font-mono text-emerald-400 font-bold text-lg flex items-center justify-center gap-1">
                        <Coins size={14} /> {(zone.interestPool || 0).toFixed(4)} RUN
                    </div>
                </div>
                <div className="pt-2 border-t border-emerald-500/10">
                    <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-0.5">Global Distance</div>
                    <div className="text-white font-mono font-bold text-sm">{(zone.totalKm || 0).toFixed(1)} KM</div>
                </div>
            </div>

            {/* Leaderboard */}
            <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2 pl-1">
                    <Medal size={14} className="text-yellow-500"/> {t('zone.top_runners')}
                </h4>
                <div className="bg-black/30 rounded-xl border border-white/5 overflow-hidden">
                    {zoneLeaderboard.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 text-xs">No runners recorded yet.</div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {zoneLeaderboard.map((runner, index) => (
                                <div key={runner.id} className={`flex items-center justify-between p-3 transition-colors ${runner.id === user.id ? 'bg-emerald-900/10' : ''}`}>
                                    <div className="flex items-center gap-3">
                                        <span className={`w-5 text-center font-bold text-xs ${index === 0 ? 'text-yellow-400' : (index === 1 ? 'text-gray-300' : (index === 2 ? 'text-amber-600' : 'text-gray-600'))}`}>
                                            #{index + 1}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <img src={runner.avatar} className="w-6 h-6 rounded-full bg-gray-700 object-cover" alt={runner.name}/>
                                            <span className={`text-xs ${runner.id === user.id ? 'text-emerald-400 font-bold' : 'text-gray-300'}`}>
                                                {runner.name}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="font-mono text-xs text-gray-400">
                                        {runner.km.toFixed(1)} km
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ZoneStatsModal;