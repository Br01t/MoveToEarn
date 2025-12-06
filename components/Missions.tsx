
import React, { useState } from 'react';
import { Mission, Badge, User, Zone, Rarity } from '../types';
import { Target, Award, CheckCircle, Lock, Flag, Crown, Star, Hexagon, Filter, Zap, Mountain, Globe, Home, Landmark, Swords, Footprints, Rocket, Tent, Timer, Building2, Moon, Sun, ShieldCheck, Gem, Users } from 'lucide-react';
import Pagination from './Pagination';
import { useLanguage } from '../LanguageContext';

interface MissionsProps {
  user: User;
  zones: Zone[];
  missions: Mission[];
  badges: Badge[];
}

const MISSIONS_PER_PAGE = 8;
const BADGES_PER_PAGE = 12;

const Missions: React.FC<MissionsProps> = ({ user, zones, missions, badges }) => {
  const { t } = useLanguage();
  const [missionPage, setMissionPage] = useState(1);
  const [badgePage, setBadgePage] = useState(1);
  const [missionFilter, setMissionFilter] = useState<'ALL' | Rarity>('ALL');

  const ownedZonesCount = zones.filter(z => z.ownerId === user.id).length;

  // Filter Logic - Missions
  const filteredMissions = missions.filter(m => {
      if (missionFilter === 'ALL') return true;
      return m.rarity === missionFilter;
  });

  // Pagination Logic - Missions
  const totalMissionPages = Math.ceil(filteredMissions.length / MISSIONS_PER_PAGE);
  const currentMissions = filteredMissions.slice(
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

  // Helper for Rarity Styling
  const getRarityStyles = (rarity: Rarity) => {
      switch(rarity) {
          case 'COMMON': return { 
              border: 'border-gray-600', 
              text: 'text-gray-400', 
              bg: 'bg-gray-800', 
              badge: 'bg-gray-700 text-gray-300',
              progress: 'bg-gray-500',
              doneBadge: 'bg-gray-700 text-gray-300'
          };
          case 'RARE': return { 
              border: 'border-cyan-500', 
              text: 'text-cyan-400', 
              bg: 'bg-cyan-900/20', 
              badge: 'bg-cyan-900 text-cyan-400 border border-cyan-500/30',
              progress: 'bg-cyan-500',
              doneBadge: 'bg-cyan-500 text-black'
          };
          case 'EPIC': return { 
              border: 'border-purple-500', 
              text: 'text-purple-400', 
              bg: 'bg-purple-900/20', 
              badge: 'bg-purple-900 text-purple-400 border border-purple-500/30',
              progress: 'bg-purple-500',
              doneBadge: 'bg-purple-500 text-black'
          };
          case 'LEGENDARY': return { 
              border: 'border-yellow-500', 
              text: 'text-yellow-400', 
              bg: 'bg-yellow-900/20', 
              badge: 'bg-yellow-900 text-yellow-400 border border-yellow-500/50',
              progress: 'bg-yellow-500',
              doneBadge: 'bg-yellow-500 text-black'
          };
          default: return { 
              border: 'border-gray-600', 
              text: 'text-gray-400', 
              bg: 'bg-gray-800', 
              badge: 'bg-gray-700', 
              progress: 'bg-gray-500',
              doneBadge: 'bg-emerald-500 text-black'
          };
      }
  };

  const handleFilterChange = (filter: 'ALL' | Rarity) => {
      setMissionFilter(filter);
      setMissionPage(1); // Reset to first page
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-8">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
         <div>
            <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                <Target className="text-emerald-400" size={28} /> {t('miss.title')}
            </h1>
            <p className="text-gray-400 text-sm">{t('miss.subtitle')}</p>
         </div>
      </div>

      {/* ACTIVE MISSIONS */}
      <div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <h2 className="text-lg font-bold text-white border-l-4 border-emerald-500 pl-3">{t('miss.log')}</h2>
            
            {/* Filter Controls */}
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                <button 
                   onClick={() => handleFilterChange('ALL')}
                   className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-colors whitespace-nowrap ${missionFilter === 'ALL' ? 'bg-white text-black' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                >
                    {t('miss.filter.all')}
                </button>
                <button 
                   onClick={() => handleFilterChange('COMMON')}
                   className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-colors whitespace-nowrap ${missionFilter === 'COMMON' ? 'bg-gray-500 text-white' : 'bg-gray-800 text-gray-500 hover:text-gray-300'}`}
                >
                    {t('miss.filter.common')}
                </button>
                <button 
                   onClick={() => handleFilterChange('RARE')}
                   className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-colors whitespace-nowrap ${missionFilter === 'RARE' ? 'bg-cyan-500 text-black' : 'bg-gray-800 text-cyan-500 hover:bg-cyan-900/20'}`}
                >
                    {t('miss.filter.rare')}
                </button>
                <button 
                   onClick={() => handleFilterChange('EPIC')}
                   className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-colors whitespace-nowrap ${missionFilter === 'EPIC' ? 'bg-purple-500 text-white' : 'bg-gray-800 text-purple-500 hover:bg-purple-900/20'}`}
                >
                    {t('miss.filter.epic')}
                </button>
                <button 
                   onClick={() => handleFilterChange('LEGENDARY')}
                   className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-colors whitespace-nowrap ${missionFilter === 'LEGENDARY' ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-yellow-500 hover:bg-yellow-900/20'}`}
                >
                    {t('miss.filter.legendary')}
                </button>
            </div>
        </div>

        {filteredMissions.length === 0 ? (
            <div className="text-center py-12 bg-gray-800 rounded-xl border border-gray-700 border-dashed">
                <Filter className="mx-auto text-gray-600 mb-2" />
                <p className="text-gray-500 text-sm">{t('miss.no_found')}</p>
                <button onClick={() => handleFilterChange('ALL')} className="text-emerald-400 text-xs mt-2 hover:underline">{t('miss.clear_filter')}</button>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {currentMissions.map(mission => {
                    const isCompleted = user.completedMissionIds.includes(mission.id);
                    const progress = getProgress(mission.conditionType, mission.conditionValue);
                    const style = getRarityStyles(mission.rarity);
                    
                    // Active missions are darker/neutral to encourage unlocking. 
                    // Completed missions show full rarity colors.
                    const containerClass = isCompleted 
                        ? `${style.bg} ${style.border}` 
                        : 'bg-gray-800 border-gray-700';

                    return (
                        <div key={mission.id} className={`rounded-lg border p-4 flex flex-col justify-between relative overflow-hidden transition-all ${containerClass}`}>
                            
                            {/* Header: Title + Badges */}
                            <div className="flex justify-between items-start mb-2">
                                <h3 className={`font-bold text-sm pr-2 ${isCompleted ? 'text-white' : 'text-gray-200'}`}>
                                    {mission.title}
                                </h3>
                                <div className="flex flex-col items-end gap-1 shrink-0">
                                    {/* Badge is always colored to show potential value */}
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${style.badge}`}>
                                        {mission.rarity}
                                    </span>
                                    {isCompleted && (
                                        <span className={`${style.doneBadge} text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1`}>
                                            <CheckCircle size={8} /> DONE
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Description */}
                            <p className={`text-xs text-gray-400 mb-3 leading-tight ${isCompleted ? 'opacity-70' : ''}`}>{mission.description}</p>
                            
                            {/* Progress Bar */}
                            <div className="mb-3">
                                <div className="flex justify-between text-[10px] mb-1 font-mono">
                                    <span className="text-gray-500">{t('miss.progress')}</span>
                                    <span className={isCompleted ? style.text : 'text-gray-300'}>
                                        {getCurrentValue(mission.conditionType)} / {mission.conditionValue}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-900 rounded-full h-1.5 border border-gray-700/50">
                                    <div 
                                        className={`h-full rounded-full transition-all duration-500 ${isCompleted ? style.progress : style.progress}`} 
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Footer: Reward */}
                            <div className={`flex justify-between items-center pt-2 border-t ${isCompleted ? 'border-gray-700/30 opacity-70' : 'border-gray-700/50'}`}>
                                <span className="text-[10px] text-gray-500 font-bold uppercase">{t('miss.reward')}</span>
                                <span className={`${isCompleted ? style.text : 'text-emerald-400'} text-xs font-bold font-mono`}>+{mission.rewardRun} RUN</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        )}
        <Pagination 
          currentPage={missionPage} 
          totalPages={totalMissionPages} 
          onPageChange={setMissionPage} 
        />
      </div>

      {/* BADGE GALLERY */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4 border-l-4 border-yellow-500 pl-3">{t('miss.gallery')}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {currentBadges.map(badge => {
                const isUnlocked = user.earnedBadgeIds.includes(badge.id);
                const style = getRarityStyles(badge.rarity);
                const reward = badge.rewardRun || 0;
                
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
                                <div className="flex flex-col items-center">
                                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${style.badge}`}>{badge.rarity}</span>
                                    {reward > 0 && <span className="text-[8px] text-emerald-400 font-mono mt-0.5">+{reward} RUN</span>}
                                </div>
                            ) : (
                                <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-gray-800 text-gray-600">{t('miss.locked')}</span>
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