
import React, { useState, useMemo } from 'react';
import { Mission, Badge, User, Zone, Rarity, RunEntry } from '../types';
import { Target, Award, CheckCircle, Lock, Flag, Crown, Star, Hexagon, Filter, Zap, Mountain, Globe, Home, Landmark, Swords, Footprints, Rocket, Tent, Timer, Building2, Moon, Sun, ShieldCheck, Gem, Users, Search } from 'lucide-react';
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
  const { t, language } = useLanguage();
  const [missionPage, setMissionPage] = useState(1);
  const [badgePage, setBadgePage] = useState(1);
  const [missionFilter, setMissionFilter] = useState<'ALL' | Rarity>('ALL');
  
  // Search States
  const [missionSearch, setMissionSearch] = useState('');
  const [badgeSearch, setBadgeSearch] = useState('');

  const ownedZonesCount = zones.filter(z => z.ownerId === user.id).length;

  // --- LOCALIZATION LOGIC ---
  // We process the raw missions/badges to inject translated titles/descriptions 
  // BEFORE filtering, so the search works on the current language.
  
  const localizedMissions = useMemo(() => {
      return missions.map(m => {
          // Construct Translation Keys based on logicId (e.g., "mission.1.title")
          // Fallback to ID if logicId is missing
          const id = m.logicId || m.id; 
          const titleKey = `mission.${id}.title`;
          const descKey = `mission.${id}.desc`;
          
          const tTitle = t(titleKey);
          const tDesc = t(descKey);

          // If translation returns the key itself, it means no translation exists -> use default
          return {
              ...m,
              title: tTitle !== titleKey ? tTitle : m.title,
              description: tDesc !== descKey ? tDesc : m.description
          };
      });
  }, [missions, language, t]);

  const localizedBadges = useMemo(() => {
      return badges.map(b => {
          const id = b.logicId || b.id;
          const titleKey = `badge.${id}.name`;
          const descKey = `badge.${id}.desc`;
          
          const tName = t(titleKey);
          const tDesc = t(descKey);

          return {
              ...b,
              name: tName !== titleKey ? tName : b.name,
              description: tDesc !== descKey ? tDesc : b.description
          };
      });
  }, [badges, language, t]);

  // Filter Logic - Missions (Using Localized Data)
  const filteredMissions = localizedMissions.filter(m => {
      const matchesRarity = missionFilter === 'ALL' || m.rarity === missionFilter;
      const matchesSearch = m.title.toLowerCase().includes(missionSearch.toLowerCase()) || 
                            m.description.toLowerCase().includes(missionSearch.toLowerCase());
      return matchesRarity && matchesSearch;
  });

  // Filter Logic - Badges (Using Localized Data)
  const filteredBadges = localizedBadges.filter(b => {
      return b.name.toLowerCase().includes(badgeSearch.toLowerCase()) || 
             b.description.toLowerCase().includes(badgeSearch.toLowerCase());
  });

  // Pagination Logic - Missions
  const totalMissionPages = Math.ceil(filteredMissions.length / MISSIONS_PER_PAGE);
  const currentMissions = filteredMissions.slice(
    (missionPage - 1) * MISSIONS_PER_PAGE,
    missionPage * MISSIONS_PER_PAGE
  );

  // Pagination Logic - Badges
  const totalBadgePages = Math.ceil(filteredBadges.length / BADGES_PER_PAGE);
  const currentBadges = filteredBadges.slice(
    (badgePage - 1) * BADGES_PER_PAGE,
    badgePage * BADGES_PER_PAGE
  );

  // --- HELPER: Calculate Streak ---
  const calculateStreak = (history: RunEntry[]): number => {
      if (history.length === 0) return 0;
      const days = Array.from(new Set(history.map(run => {
         const d = new Date(run.timestamp);
         d.setHours(0,0,0,0);
         return d.getTime();
      }))).sort((a,b) => b - a);

      if (days.length === 0) return 0;

      let streak = 1;
      const today = new Date();
      today.setHours(0,0,0,0);
      const todayTime = today.getTime();
      const diffSinceLastRun = (todayTime - days[0]) / (1000 * 60 * 60 * 24);

      if (diffSinceLastRun > 1) return 0; 

      for (let i = 0; i < days.length - 1; i++) {
          const current = days[i];
          const prev = days[i+1];
          const diffDays = (current - prev) / (1000 * 60 * 60 * 24);
          if (diffDays === 1) streak++;
          else break;
      }
      return streak;
  };

  // --- HELPER: Calculate Progress for specific Logic ID ---
  const getMissionStats = (mission: Mission): { current: number; target: number; unit: string; percent: number } => {
      // Default / Legacy fallback
      if (!mission.logicId) {
          if (mission.conditionType === 'TOTAL_KM') {
              const target = mission.conditionValue || 100;
              return { current: user.totalKm, target, unit: 'km', percent: Math.min(100, (user.totalKm / target) * 100) };
          }
          if (mission.conditionType === 'OWN_ZONES') {
              const target = mission.conditionValue || 1;
              return { current: ownedZonesCount, target, unit: 'zones', percent: Math.min(100, (ownedZonesCount / target) * 100) };
          }
          return { current: 0, target: 1, unit: '', percent: 0 };
      }

      const history = user.runHistory;
      let current = 0;
      let target = 0;
      let unit = '';

      switch (mission.logicId) {
          // --- DISTANCE (Total) ---
          case 1: target = 10; unit = 'km'; current = user.totalKm; break;
          case 2: target = 50; unit = 'km'; current = user.totalKm; break;
          case 3: target = 100; unit = 'km'; current = user.totalKm; break;
          case 8: target = 160; unit = 'km'; current = user.totalKm; break;
          case 9: target = 500; unit = 'km'; current = user.totalKm; break;
          case 10: target = 1000; unit = 'km'; current = user.totalKm; break;

          // --- DISTANCE (Single Run) ---
          case 4: target = 10.55; unit = 'km run'; current = Math.max(...history.map(r => r.km), 0); break;
          case 5: target = 21; unit = 'km run'; current = Math.max(...history.map(r => r.km), 0); break;
          case 6: target = 42.195; unit = 'km run'; current = Math.max(...history.map(r => r.km), 0); break;
          case 7: target = 50; unit = 'km run'; current = Math.max(...history.map(r => r.km), 0); break;

          // --- SPEED (Max) ---
          case 11: target = 20; unit = 'km/h'; current = Math.max(...history.map(r => r.maxSpeed || 0), 0); break;
          case 12: target = 25; unit = 'km/h'; current = Math.max(...history.map(r => r.maxSpeed || 0), 0); break;

          // --- SPEED (Avg) ---
          case 13: target = 12; unit = 'km/h'; current = Math.max(...history.filter(r => r.km >= 2).map(r => r.avgSpeed || 0), 0); break;
          case 14: target = 15; unit = 'km/h'; current = Math.max(...history.filter(r => r.km >= 1).map(r => r.avgSpeed || 0), 0); break;
          case 15: target = 10; unit = 'km/h'; current = Math.max(...history.filter(r => r.km >= 10).map(r => r.avgSpeed || 0), 0); break;
          case 16: target = 12; unit = 'km/h'; current = Math.max(...history.filter(r => r.km >= 5).map(r => r.avgSpeed || 0), 0); break;

          // --- ELEVATION ---
          case 18: target = 150; unit = 'm'; current = Math.max(...history.map(r => r.elevation || 0), 0); break;
          case 19: target = 500; unit = 'm'; current = Math.max(...history.map(r => r.elevation || 0), 0); break;
          case 20: target = 1000; unit = 'm'; current = Math.max(...history.map(r => r.elevation || 0), 0); break;

          // --- STREAK ---
          case 31: target = 3; unit = 'days'; current = calculateStreak(history); break;
          case 32: target = 7; unit = 'days'; current = calculateStreak(history); break;
          case 33: target = 14; unit = 'days'; current = calculateStreak(history); break;
          case 34: target = 30; unit = 'days'; current = calculateStreak(history); break;
          case 40: target = 60; unit = 'days'; current = calculateStreak(history); break;

          // --- ZONE / EXPLORATION ---
          case 41: target = 10; unit = 'zones'; current = new Set(history.map(r => r.location)).size; break;
          case 42: target = 25; unit = 'zones'; current = new Set(history.map(r => r.location)).size; break;
          case 43: target = 50; unit = 'zones'; current = new Set(history.map(r => r.location)).size; break;
          case 44: target = 100; unit = 'zones'; current = new Set(history.map(r => r.location)).size; break;
          
          case 47: target = 1; unit = 'owned'; current = ownedZonesCount; break;
          case 48: target = 5; unit = 'owned'; current = ownedZonesCount; break;
          case 49: target = 10; unit = 'owned'; current = ownedZonesCount; break;
          case 50: target = 25; unit = 'owned'; current = ownedZonesCount; break;

          // --- ENDURANCE ---
          case 69: target = 90; unit = 'min'; current = Math.max(...history.map(r => r.duration || 0), 0); break;
          case 70: target = 120; unit = 'min'; current = Math.max(...history.map(r => r.duration || 0), 0); break;

          // --- META ---
          case 95: target = 20; unit = 'missions'; current = user.completedMissionIds.length; break;
          case 96: target = 20; unit = 'badges'; current = user.earnedBadgeIds.length; break;
          case 97: target = 50; unit = 'badges'; current = user.earnedBadgeIds.length; break;
          case 100: target = 10; unit = 'epic+'; current = badges.filter(b => user.earnedBadgeIds.includes(b.id) && (b.rarity === 'EPIC' || b.rarity === 'LEGENDARY')).length; break;

          // --- DEFAULT / BOOLEAN (0 or 1) ---
          default: 
             target = 1; 
             unit = 'task'; 
             // If completed, current is 1, else 0
             current = user.completedMissionIds.includes(mission.id) ? 1 : 0; 
             break;
      }

      // Cap percent at 100
      const percent = Math.min(100, Math.max(0, (current / target) * 100));
      return { current, target, unit, percent };
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
        <div className="flex flex-col gap-4 mb-4">
            <h2 className="text-lg font-bold text-white border-l-4 border-emerald-500 pl-3">{t('miss.log')}</h2>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Search Bar for Missions */}
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
                    <input 
                        type="text" 
                        placeholder={t('miss.search_missions')} 
                        value={missionSearch}
                        onChange={(e) => {
                            setMissionSearch(e.target.value);
                            setMissionPage(1);
                        }}
                        className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                    />
                </div>

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
        </div>

        {filteredMissions.length === 0 ? (
            <div className="text-center py-12 bg-gray-800 rounded-xl border border-gray-700 border-dashed">
                <Filter className="mx-auto text-gray-600 mb-2" />
                <p className="text-gray-500 text-sm">{t('miss.no_found')}</p>
                <button onClick={() => { handleFilterChange('ALL'); setMissionSearch(''); }} className="text-emerald-400 text-xs mt-2 hover:underline">{t('miss.clear_filter')}</button>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {currentMissions.map(mission => {
                    const isCompleted = user.completedMissionIds.includes(mission.id);
                    const stats = getMissionStats(mission);
                    const style = getRarityStyles(mission.rarity);
                    
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
                                        {stats.current % 1 !== 0 ? stats.current.toFixed(1) : stats.current} / {stats.target} {stats.unit}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-900 rounded-full h-1.5 border border-gray-700/50">
                                    <div 
                                        className={`h-full rounded-full transition-all duration-500 ${style.progress}`} 
                                        style={{ width: `${isCompleted ? 100 : stats.percent}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Footer: Reward */}
                            <div className={`flex flex-wrap justify-between items-center pt-2 border-t gap-1 ${isCompleted ? 'border-gray-700/30 opacity-70' : 'border-gray-700/50'}`}>
                                <span className="text-[10px] text-gray-500 font-bold uppercase">{t('miss.reward')}</span>
                                <div className="flex items-center gap-2">
                                    <span className={`${isCompleted ? style.text : 'text-emerald-400'} text-xs font-bold font-mono`}>+{mission.rewardRun} RUN</span>
                                    {mission.rewardGov && mission.rewardGov > 0 && (
                                        <span className={`${isCompleted ? style.text : 'text-cyan-400'} text-xs font-bold font-mono border border-cyan-500/30 px-1 rounded`}>+{mission.rewardGov} GOV</span>
                                    )}
                                </div>
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
        <div className="flex flex-col gap-4 mb-4">
            <h2 className="text-lg font-bold text-white border-l-4 border-yellow-500 pl-3">{t('miss.gallery')}</h2>
            
            {/* Search Bar for Badges - Left Aligned in new row */}
            <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
                <input 
                    type="text" 
                    placeholder={t('miss.search_badges')} 
                    value={badgeSearch}
                    onChange={(e) => {
                        setBadgeSearch(e.target.value);
                        setBadgePage(1);
                    }}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:border-yellow-500 focus:outline-none"
                />
            </div>
        </div>

        {filteredBadges.length === 0 ? (
            <div className="text-center py-12 bg-gray-800 rounded-xl border border-gray-700 border-dashed">
                <Award className="mx-auto text-gray-600 mb-2" />
                <p className="text-gray-500 text-sm">No badges found.</p>
                <button onClick={() => setBadgeSearch('')} className="text-yellow-400 text-xs mt-2 hover:underline">{t('miss.clear_filter')}</button>
            </div>
        ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {currentBadges.map(badge => {
                    const isUnlocked = user.earnedBadgeIds.includes(badge.id);
                    const style = getRarityStyles(badge.rarity);
                    const rewardRun = badge.rewardRun || 0;
                    const rewardGov = badge.rewardGov || 0;
                    
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
                                        {rewardRun > 0 && <span className="text-[8px] text-emerald-400 font-mono mt-0.5">+{rewardRun} RUN</span>}
                                        {rewardGov > 0 && <span className="text-[8px] text-cyan-400 font-mono">+{rewardGov} GOV</span>}
                                    </div>
                                ) : (
                                    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-gray-800 text-gray-600">{t('miss.locked')}</span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        )}
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