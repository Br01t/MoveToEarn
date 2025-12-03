
import React, { useState } from 'react';
import { Mission, Badge, User, Zone, Rarity } from '../types';
import { Target, Award, CheckCircle, Lock, Flag, Crown, Star, Hexagon } from 'lucide-react';
import Pagination from './Pagination';

interface MissionsProps {
  user: User;
  zones: Zone[];
  missions: Mission[];
  badges: Badge[];
}

const MISSIONS_PER_PAGE = 8;
const BADGES_PER_PAGE = 12;

const Missions: React.FC<MissionsProps> = ({ user, zones, missions, badges }) => {
  const [missionPage, setMissionPage] = useState(1);
  const [badgePage, setBadgePage] = useState(1);

  const ownedZonesCount = zones.filter(z => z.ownerId === user.id).length;

  // Pagination Logic - Missions
  const totalMissionPages = Math.ceil(missions.length / MISSIONS_PER_PAGE);
  const currentMissions = missions.slice(
    (missionPage - 1) * MISSIONS_PER_PAGE,
    missionPage * MISSIONS_PER_PAGE
  );

  // Pagination Logic - Badges
  const totalBadgePages = Math.ceil(badges.length / BADGES_PER_PAGE);
  const currentBadges = badges.slice(
    (badgePage - 1) * BADGES_PER_PAGE,
    badgePage * BADGES_PER_PAGE
  );

  // Helper to calculate progress for a specific requirement
  const getProgress = (type: 'TOTAL_KM' | 'OWN_ZONES', target: number) => {
    let current = 0;
    if (type === 'TOTAL_KM') current = user.totalKm;
    if (type === 'OWN_ZONES') current = ownedZonesCount;
    return Math.min(100, (current / target) * 100);
  };

  const getCurrentValue = (type: 'TOTAL_KM' | 'OWN_ZONES') => {
      if (type === 'TOTAL_KM') return user.totalKm.toFixed(1) + ' km';
      if (type === 'OWN_ZONES') return ownedZonesCount;
      return 0;
  };

  // Helper to render dynamic icon based on string name
  const renderIcon = (iconName: string, className: string) => {
      switch(iconName) {
          case 'Flag': return <Flag className={className} />;
          case 'Crown': return <Crown className={className} />;
          case 'Award': return <Award className={className} />;
          default: return <Award className={className} />;
      }
  };

  // Helper for Rarity Styling
  const getRarityStyles = (rarity: Rarity) => {
      switch(rarity) {
          case 'COMMON': return { 
              border: 'border-gray-600', 
              text: 'text-gray-400', 
              bg: 'bg-gray-800', 
              badge: 'bg-gray-700 text-gray-300',
              progress: 'bg-gray-500'
          };
          case 'RARE': return { 
              border: 'border-cyan-500', 
              text: 'text-cyan-400', 
              bg: 'bg-cyan-900/10', 
              badge: 'bg-cyan-900 text-cyan-400 border border-cyan-500/30',
              progress: 'bg-cyan-500'
          };
          case 'EPIC': return { 
              border: 'border-purple-500', 
              text: 'text-purple-400', 
              bg: 'bg-purple-900/10', 
              badge: 'bg-purple-900 text-purple-400 border border-purple-500/30',
              progress: 'bg-purple-500'
          };
          case 'LEGENDARY': return { 
              border: 'border-yellow-500', 
              text: 'text-yellow-400', 
              bg: 'bg-yellow-900/10', 
              badge: 'bg-yellow-900 text-yellow-400 border border-yellow-500/50',
              progress: 'bg-yellow-500'
          };
          default: return { border: 'border-gray-600', text: 'text-gray-400', bg: 'bg-gray-800', badge: 'bg-gray-700', progress: 'bg-gray-500' };
      }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-8">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
         <div>
            <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                <Target className="text-emerald-400" size={28} /> Missions & Achievements
            </h1>
            <p className="text-gray-400 text-sm">Complete tasks to earn GOV rewards.</p>
         </div>
         
         {/* LEGEND */}
         <div className="bg-gray-800 border border-gray-700 p-3 rounded-lg flex flex-wrap gap-3 text-[10px] font-bold uppercase tracking-wider">
             <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-gray-500"></div> Common</div>
             <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_6px_rgba(6,182,212,0.8)]"></div> Rare</div>
             <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_6px_rgba(168,85,247,0.8)]"></div> Epic</div>
             <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_6px_rgba(234,179,8,0.8)]"></div> Legendary</div>
         </div>
      </div>

      {/* ACTIVE MISSIONS */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4 border-l-4 border-emerald-500 pl-3">Missions Log</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {currentMissions.map(mission => {
                const isCompleted = user.completedMissionIds.includes(mission.id);
                const progress = getProgress(mission.conditionType, mission.conditionValue);
                const style = getRarityStyles(mission.rarity);
                
                return (
                    <div key={mission.id} className={`rounded-lg border p-4 flex flex-col justify-between relative overflow-hidden transition-all ${style.border} ${isCompleted ? 'bg-gray-800/80' : style.bg}`}>
                        
                        {/* Header: Title + Badges */}
                        <div className="flex justify-between items-start mb-2">
                            <h3 className={`font-bold text-sm pr-2 ${isCompleted ? 'text-white line-through opacity-70' : style.text}`}>{mission.title}</h3>
                            <div className="flex flex-col items-end gap-1 shrink-0">
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${style.badge}`}>
                                    {mission.rarity}
                                </span>
                                {isCompleted && (
                                    <span className="bg-emerald-500 text-black text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                                        <CheckCircle size={8} /> DONE
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        <p className={`text-xs text-gray-400 mb-3 leading-tight ${isCompleted ? 'opacity-50' : ''}`}>{mission.description}</p>
                        
                        {/* Progress Bar */}
                        <div className="mb-3">
                            <div className="flex justify-between text-[10px] mb-1 font-mono">
                                <span className="text-gray-500">Progress</span>
                                <span className={isCompleted ? 'text-emerald-400' : 'text-gray-300'}>
                                    {getCurrentValue(mission.conditionType)} / {mission.conditionValue}
                                </span>
                            </div>
                            <div className="w-full bg-gray-900 rounded-full h-1.5 border border-gray-700/50">
                                <div 
                                    className={`h-full rounded-full transition-all duration-500 ${isCompleted ? 'bg-emerald-500' : style.progress}`} 
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Footer: Reward */}
                        <div className={`flex justify-between items-center pt-2 border-t ${isCompleted ? 'border-gray-700/30 opacity-50' : 'border-gray-700/50'}`}>
                            <span className="text-[10px] text-gray-500 font-bold uppercase">Reward</span>
                            <span className="text-emerald-400 text-xs font-bold font-mono">+{mission.rewardGov} GOV</span>
                        </div>
                    </div>
                );
            })}
        </div>
        <Pagination 
          currentPage={missionPage} 
          totalPages={totalMissionPages} 
          onPageChange={setMissionPage} 
        />
      </div>

      {/* BADGE GALLERY */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4 border-l-4 border-yellow-500 pl-3">Badge Gallery</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {currentBadges.map(badge => {
                const isUnlocked = user.earnedBadgeIds.includes(badge.id);
                const style = getRarityStyles(badge.rarity);
                
                return (
                    <div key={badge.id} className={`aspect-square rounded-xl flex flex-col items-center justify-between p-3 text-center border transition-all relative overflow-hidden group ${isUnlocked ? `${style.bg} ${style.border}` : 'bg-gray-900 border-gray-800 opacity-60 grayscale'}`}>
                        
                        {/* Rarity Glow Background for High Tier */}
                        {isUnlocked && (badge.rarity === 'LEGENDARY' || badge.rarity === 'EPIC') && (
                            <div className={`absolute top-0 left-0 w-full h-full opacity-20 bg-gradient-to-br ${badge.rarity === 'LEGENDARY' ? 'from-yellow-500 to-transparent' : 'from-purple-500 to-transparent'}`}></div>
                        )}

                        <div className="flex-1 flex flex-col items-center justify-center w-full relative z-10">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${isUnlocked ? `${style.badge} ring-2 ring-opacity-50` : 'bg-gray-800 text-gray-600'}`}>
                                {isUnlocked ? renderIcon(badge.icon, "w-4 h-4") : <Lock size={14} />}
                            </div>
                            
                            <h4 className={`font-bold text-xs truncate w-full px-1 ${isUnlocked ? style.text : 'text-gray-500'}`}>{badge.name}</h4>
                            
                            {/* Added Description */}
                            <p className={`text-[9px] leading-tight line-clamp-2 px-1 mt-1 ${isUnlocked ? 'text-gray-300' : 'text-gray-600'}`}>
                                {badge.description}
                            </p>
                        </div>
                        
                        {/* Footer Status */}
                        <div className="relative z-10 mt-1">
                            {isUnlocked ? (
                                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${style.badge}`}>{badge.rarity}</span>
                            ) : (
                                <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-gray-800 text-gray-600">LOCKED</span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
        <Pagination 
          currentPage={badgePage} 
          totalPages={totalBadgePages} 
          onPageChange={setBadgePage} 
        />
      </div>

    </div>
  );
};

export default Missions;