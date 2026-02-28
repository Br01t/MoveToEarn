import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Mission, Badge, User, Zone, Rarity, RunEntry } from '../types';
import { Target, Award, CheckCircle, Lock, Flag, Crown, Star, Hexagon, Filter, Zap, Mountain, Globe, Home, Landmark, Swords, Footprints, Rocket, Tent, Timer, Building2, Moon, Sun, ShieldCheck, Gem, Users, Search, List, Info, X } from 'lucide-react';
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
  const [isMobile, setIsMobile] = useState(false);
  
  const [hoveredBadge, setHoveredBadge] = useState<{ badge: any, rect: DOMRect, element: HTMLElement } | null>(null);
  
  const [missionScrollProgress, setMissionScrollProgress] = useState(0);
  const [badgeScrollProgress, setBadgeScrollProgress] = useState(0);
  
  const missionScrollRef = useRef<HTMLDivElement>(null);
  const badgeScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      const checkMobile = () => setIsMobile(window.innerWidth < 1024);
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleScroll = (ref: React.RefObject<HTMLDivElement>, setProgress: (p: number) => void) => {
    if (!ref.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = ref.current;
    const totalScroll = scrollWidth - clientWidth;
    if (totalScroll <= 0) return;
    const progress = (scrollLeft / totalScroll) * 100;
    setProgress(progress);
    
    if (hoveredBadge) {
        setHoveredBadge(null);
    }
  };

  useEffect(() => {
    const handleGlobalScroll = () => {
      if (hoveredBadge) setHoveredBadge(null);
    };
    window.addEventListener('scroll', handleGlobalScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleGlobalScroll);
  }, [hoveredBadge]);
  
  const [missionFilter, setMissionFilter] = useState<'ALL' | Rarity>('ALL');
  const [badgeFilter, setBadgeFilter] = useState<'ALL' | Rarity>('ALL');
  
  const [missionStatus, setMissionStatus] = useState<'ALL' | 'DONE' | 'TODO'>('ALL');
  const [badgeStatus, setBadgeStatus] = useState<'ALL' | 'OWNED' | 'LOCKED'>('ALL');
  
  const [missionSearch, setMissionSearch] = useState('');
  const [badgeSearch, setBadgeSearch] = useState('');

  const ownedZonesCount = zones.filter(z => z.ownerId === user.id).length;

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

  const getItemStats = (item: Mission | Badge, isCompleted: boolean): { current: number; target: number; unit: string; percent: number } => {
      if (isCompleted) return { current: 1, target: 1, unit: '', percent: 100 };
      if (!item.logicId) {
          if (item.conditionType === 'TOTAL_KM') {
              const target = item.conditionValue || 100;
              return { current: user.totalKm, target, unit: 'km', percent: Math.min(100, (user.totalKm / target) * 100) };
          }
          if (item.conditionType === 'OWN_ZONES') {
              const target = item.conditionValue || 1;
              return { current: ownedZonesCount, target, unit: 'zones', percent: Math.min(100, (ownedZonesCount / target) * 100) };
          }
          return { current: 0, target: 1, unit: 'task', percent: 0 };
      }
      const history = user.runHistory;
      let current = 0; let target = 0; let unit = '';
      switch (item.logicId) {
          case 1: target = 10; unit = 'km'; current = user.totalKm; break;
          case 2: target = 50; unit = 'km'; current = user.totalKm; break;
          case 3: target = 100; unit = 'km'; current = user.totalKm; break;
          case 8: target = 160; unit = 'km'; current = user.totalKm; break;
          case 9: target = 500; unit = 'km'; current = user.totalKm; break;
          case 10: target = 1000; unit = 'km'; current = user.totalKm; break;
          case 4: target = 10.55; unit = 'km run'; current = Math.max(...history.map(r => r.km), 0); break;
          case 5: target = 21; unit = 'km run'; current = Math.max(...history.map(r => r.km), 0); break;
          case 6: target = 42.195; unit = 'km run'; current = Math.max(...history.map(r => r.km), 0); break;
          case 7: target = 50; unit = 'km run'; current = Math.max(...history.map(r => r.km), 0); break;
          case 11: target = 20; unit = 'km/h'; current = Math.max(...history.map(r => r.maxSpeed || 0), 0); break;
          case 12: target = 25; unit = 'km/h'; current = Math.max(...history.map(r => r.maxSpeed || 0), 0); break;
          case 13: target = 12; unit = 'km/h'; current = Math.max(...history.filter(r => r.km >= 2).map(r => r.avgSpeed || 0), 0); break;
          case 14: target = 15; unit = 'km/h'; current = Math.max(...history.filter(r => r.km >= 1).map(r => r.avgSpeed || 0), 0); break;
          case 15: target = 10; unit = 'km/h'; current = Math.max(...history.filter(r => r.km >= 10).map(r => r.avgSpeed || 0), 0); break;
          case 16: target = 12; unit = 'km/h'; current = Math.max(...history.filter(r => r.km >= 5).map(r => r.avgSpeed || 0), 0); break;
          case 18: target = 150; unit = 'm'; current = Math.max(...history.map(r => r.elevation || 0), 0); break;
          case 19: target = 500; unit = 'm'; current = Math.max(...history.map(r => r.elevation || 0), 0); break;
          case 20: target = 1000; unit = 'm'; current = Math.max(...history.map(r => r.elevation || 0), 0); break;
          case 31: target = 3; unit = 'days'; current = calculateStreak(history); break;
          case 32: target = 7; unit = 'days'; current = calculateStreak(history); break;
          case 33: target = 14; unit = 'days'; current = calculateStreak(history); break;
          case 34: target = 30; unit = 'days'; current = calculateStreak(history); break;
          case 40: target = 60; unit = 'days'; current = calculateStreak(history); break;
          case 41: target = 10; unit = 'zones'; current = new Set(history.map(r => r.location)).size; break;
          case 42: target = 25; unit = 'zones'; current = new Set(history.map(r => r.location)).size; break;
          case 43: target = 50; unit = 'zones'; current = new Set(history.map(r => r.location)).size; break;
          case 44: target = 100; unit = 'zones'; current = new Set(history.map(r => r.location)).size; break;
          case 47: target = 1; unit = 'owned'; current = ownedZonesCount; break;
          case 48: target = 5; unit = 'owned'; current = ownedZonesCount; break;
          case 49: target = 10; unit = 'owned'; current = ownedZonesCount; break;
          case 50: target = 25; unit = 'owned'; current = ownedZonesCount; break;
          case 69: target = 90; unit = 'min'; current = Math.max(...history.map(r => r.duration || 0), 0); break;
          case 70: target = 120; unit = 'min'; current = Math.max(...history.map(r => r.duration || 0), 0); break;
          case 95: target = 20; unit = 'missions'; current = user.completedMissionIds.length; break;
          case 96: target = 20; unit = 'badges'; current = user.earnedBadgeIds.length; break;
          case 97: target = 50; unit = 'badges'; current = user.earnedBadgeIds.length; break;
          case 100: target = 10; unit = 'epic+'; current = badges.filter(b => user.earnedBadgeIds.includes(b.id) && (b.rarity === 'EPIC' || b.rarity === 'LEGENDARY')).length; break;
          default: target = 1; unit = 'task'; current = 0; break;
      }
      const percent = Math.min(100, Math.max(0, (current / target) * 100));
      return { current, target, unit, percent };
  };

  const processedMissions = useMemo(() => {
      return missions.map(m => {
          const isCompleted = user.completedMissionIds.includes(m.id);
          const stats = getItemStats(m, isCompleted);
          const id = m.logicId || m.id; 
          const titleKey = `mission.${id}.title`;
          const descKey = `mission.${id}.desc`;
          const tTitle = t(titleKey);
          const tDesc = t(descKey);
          return {
              ...m,
              title: tTitle !== titleKey ? tTitle : m.title,
              description: tDesc !== descKey ? tDesc : m.description,
              isCompleted,
              stats
          };
      }).sort((a, b) => {
          if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
          if (a.stats.percent !== b.stats.percent) return b.stats.percent - a.stats.percent;
          return a.id > b.id ? -1 : 1;
      });
  }, [missions, language, t, user.completedMissionIds, user.totalKm, user.runHistory, ownedZonesCount]);

  const processedBadges = useMemo(() => {
      return badges.map(b => {
          const isUnlocked = user.earnedBadgeIds.includes(b.id);
          const stats = getItemStats(b, isUnlocked);
          const id = b.logicId || b.id;
          const titleKey = `badge.${id}.name`;
          const descKey = `badge.${id}.desc`;
          const tName = t(titleKey);
          const tDesc = t(descKey);
          return {
              ...b,
              name: tName !== titleKey ? tName : b.name,
              description: tDesc !== descKey ? tDesc : b.description,
              isUnlocked,
              stats
          };
      }).sort((a, b) => {
          if (a.isUnlocked !== b.isUnlocked) return a.isUnlocked ? 1 : -1;
          if (a.stats.percent !== b.stats.percent) return b.stats.percent - a.stats.percent;
          return a.id > b.id ? -1 : 1;
      });
  }, [badges, language, t, user.earnedBadgeIds, user.totalKm, user.runHistory, ownedZonesCount]);

  const filteredMissions = useMemo(() => processedMissions.filter(m => {
      const matchesRarity = missionFilter === 'ALL' || m.rarity === missionFilter;
      const matchesSearch = m.title.toLowerCase().includes(missionSearch.toLowerCase()) || m.description.toLowerCase().includes(missionSearch.toLowerCase());
      const matchesStatus = missionStatus === 'ALL' ? true : (missionStatus === 'DONE' ? m.isCompleted : !m.isCompleted);
      return matchesRarity && matchesSearch && matchesStatus;
  }), [processedMissions, missionFilter, missionSearch, missionStatus]);

  const filteredBadges = useMemo(() => processedBadges.filter(b => {
      const matchesRarity = badgeFilter === 'ALL' || b.rarity === badgeFilter;
      const matchesSearch = b.name.toLowerCase().includes(badgeSearch.toLowerCase()) || b.description.toLowerCase().includes(badgeSearch.toLowerCase());
      const matchesStatus = badgeStatus === 'ALL' ? true : (badgeStatus === 'OWNED' ? b.isUnlocked : !b.isUnlocked);
      return matchesRarity && matchesSearch && matchesStatus;
  }), [processedBadges, badgeFilter, badgeSearch, badgeStatus]);

  const missionsToRender = isMobile ? filteredMissions : filteredMissions.slice((missionPage - 1) * MISSIONS_PER_PAGE, missionPage * MISSIONS_PER_PAGE);
  const badgesToRender = isMobile ? filteredBadges : filteredBadges.slice((badgePage - 1) * BADGES_PER_PAGE, badgePage * BADGES_PER_PAGE);

  const totalMissionPages = Math.ceil(filteredMissions.length / MISSIONS_PER_PAGE);
  const totalBadgePages = Math.ceil(filteredBadges.length / BADGES_PER_PAGE);

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

  const getRarityStyles = (rarity: Rarity) => {
      switch(rarity) {
          case 'COMMON': return { border: 'border-emerald-500/50', text: 'text-emerald-400', badge: 'bg-emerald-900/50 text-emerald-400 border border-emerald-500/30', progress: 'bg-emerald-500', doneBadge: 'bg-emerald-500 text-black', filter: 'text-emerald-400 border-emerald-500/50 hover:bg-emerald-900/20', filterActive: 'bg-emerald-500 text-black border-emerald-500' };
          case 'RARE': return { border: 'border-cyan-500/50', text: 'text-cyan-400', badge: 'bg-cyan-900/50 text-cyan-400 border border-cyan-500/30', progress: 'bg-cyan-500', doneBadge: 'bg-cyan-500 text-black', filter: 'text-cyan-400 border-cyan-500/50 hover:bg-cyan-900/20', filterActive: 'bg-cyan-500 text-black border-cyan-500' };
          case 'EPIC': return { border: 'border-purple-500/50', text: 'text-purple-400', badge: 'bg-purple-900/50 text-purple-400 border border-purple-500/30', progress: 'bg-purple-500', doneBadge: 'bg-purple-500 text-black', filter: 'text-purple-400 border-purple-500/50 hover:bg-purple-900/20', filterActive: 'bg-purple-500 text-white border-purple-500' };
          case 'LEGENDARY': return { border: 'border-yellow-500/50', text: 'text-yellow-400', badge: 'bg-yellow-900/50 text-yellow-400 border border-yellow-500/50', progress: 'bg-yellow-500', doneBadge: 'bg-yellow-500 text-black', filter: 'text-yellow-400 border-yellow-500/50 hover:bg-yellow-900/20', filterActive: 'bg-yellow-500 text-black border-yellow-500' };
          default: return { border: 'border-gray-600', text: 'text-gray-400', badge: 'bg-gray-700', progress: 'bg-gray-500', doneBadge: 'bg-emerald-500 text-black', filter: 'text-gray-400 border-gray-700 hover:bg-white/5', filterActive: 'bg-white text-black border-white' };
      }
  };

  const handleMissionFilterChange = (filter: 'ALL' | Rarity) => { setMissionFilter(filter); setMissionPage(1); };
  const handleBadgeFilterChange = (filter: 'ALL' | Rarity) => { setBadgeFilter(filter); setBadgePage(1); };

  const FilterGroup = ({ currentFilter, onFilterChange }: { currentFilter: 'ALL' | Rarity, onFilterChange: (f: 'ALL' | Rarity) => void }) => (
      <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
        {['ALL', 'COMMON', 'RARE', 'EPIC', 'LEGENDARY'].map(f => {
            const style = f === 'ALL' ? getRarityStyles('COMMON' as any) : getRarityStyles(f as Rarity); 
            const isAll = f === 'ALL';
            const isActive = currentFilter === f;
            
            return (
                <button 
                    key={f} 
                    onClick={() => onFilterChange(f as any)} 
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all whitespace-nowrap border ${isActive ? (isAll ? 'bg-white text-black border-white' : style.filterActive) : (isAll ? 'glass-panel text-gray-400 hover:bg-white/10' : `glass-panel ${style.filter}`)}`}
                >
                    {t(`miss.filter.${f.toLowerCase()}`)}
                </button>
            );
        })}
      </div>
  );

  const StatusToggle = ({ current, onChange, type }: { current: any, onChange: (val: any) => void, type: 'MISSION' | 'BADGE' }) => {
      const isMission = type === 'MISSION';
      
      const ActiveStyle = isMission 
        ? 'bg-emerald-900/50 text-emerald-400 border-emerald-500/20' 
        : 'bg-yellow-900/50 text-yellow-400 border-yellow-500/20';

      return (
          <div className="flex glass-panel rounded-lg p-1 h-9 shrink-0 items-center">
              <button onClick={() => onChange('ALL')} className={`px-3 rounded transition-all flex items-center justify-center ${current === 'ALL' ? 'bg-gray-700/80 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`} title="Tutti">
                <List size={16} />
              </button>
              <button 
                onClick={() => onChange(isMission ? 'DONE' : 'OWNED')} 
                className={`px-3 rounded transition-all flex items-center justify-center gap-1 ${current === (isMission ? 'DONE' : 'OWNED') ? `${ActiveStyle} shadow-sm border` : 'text-gray-500 hover:text-gray-300'}`}
                title={isMission ? "Completate" : "Sbloccati"}
              >
                {isMission ? <CheckCircle size={16} /> : <Award size={16} />}
              </button>
              <button 
                onClick={() => onChange(isMission ? 'TODO' : 'LOCKED')} 
                className={`px-3 rounded transition-all flex items-center justify-center gap-1 ${current === (isMission ? 'TODO' : 'LOCKED') ? (isMission ? 'bg-red-900/50 text-red-400 border-red-500/20' : 'bg-gray-700 text-gray-200 border-gray-600') + ' shadow-sm border' : 'text-gray-500 hover:text-gray-300'}`}
                title={isMission ? "Da fare" : "Bloccati"}
              >
                {isMission ? <Target size={16} /> : <Lock size={16} />}
              </button>
          </div>
      );
  };

  const ScrollProgressBar = ({ progress, colorClass = 'bg-emerald-500' }: { progress: number, colorClass?: string }) => (
    <div className="lg:hidden w-full max-w-[200px] mx-auto h-1 bg-gray-800 rounded-full mt-2 overflow-hidden">
        <div className={`h-full transition-all duration-200 ${colorClass}`} style={{ width: `${progress}%` }}></div>
    </div>
  );

  const tooltipPos = useMemo(() => {
    if (!hoveredBadge) return null;
    const { rect } = hoveredBadge;
    const tooltipWidth = 224;
    const tooltipHeight = 160; 
    const padding = 12;

    let left = rect.left + (rect.width / 2);
    let top = rect.top;
    let isFlipped = false;

    if (top - tooltipHeight < padding) {
        top = rect.bottom + padding;
        isFlipped = true;
    } else {
        top = rect.top - padding;
    }

    const halfWidth = tooltipWidth / 2;
    if (left - halfWidth < padding) {
        left = halfWidth + padding;
    } else if (left + halfWidth > window.innerWidth - padding) {
        left = window.innerWidth - halfWidth - padding;
    }

    return { left, top, isFlipped };
  }, [hoveredBadge]);

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4">
         <div>
            <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2"><Target className="text-emerald-400" size={28} /> {t('miss.title')}</h1>
            <p className="text-gray-400 text-sm">{t('miss.subtitle')}</p>
         </div>
      </div>

      <div>
        <div className="flex flex-col gap-4 mb-4">
            <h2 className="text-lg font-bold text-white border-l-4 border-emerald-500 pl-3">{t('miss.log')}</h2>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-3 w-full lg:w-auto">
                    <StatusToggle type="MISSION" current={missionStatus} onChange={(val) => { setMissionStatus(val); setMissionPage(1); }} />
                    <div className="relative flex-1 lg:w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
                        <input type="text" placeholder={t('miss.search_missions')} value={missionSearch} onChange={(e) => { setMissionSearch(e.target.value); setMissionPage(1); }} className="w-full glass-panel rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none placeholder-gray-500" />
                    </div>
                </div>
                <FilterGroup currentFilter={missionFilter} onFilterChange={handleMissionFilterChange} />
            </div>
        </div>

        {filteredMissions.length === 0 ? (
            <div className="text-center py-12 glass-panel rounded-xl border-dashed">
                <Filter className="mx-auto text-gray-600 mb-2" /><p className="text-gray-500 text-sm">{t('miss.no_found')}</p>
                <button onClick={() => { handleMissionFilterChange('ALL'); setMissionSearch(''); setMissionStatus('ALL'); }} className="text-emerald-400 text-xs mt-2 hover:underline">{t('miss.clear_filter')}</button>
            </div>
        ) : (
            <>
              <div 
                ref={missionScrollRef}
                onScroll={() => handleScroll(missionScrollRef, setMissionScrollProgress)}
                className="flex overflow-x-auto lg:grid lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-4 lg:pb-0 no-scrollbar snap-x snap-mandatory"
              >
                  {missionsToRender.map(mission => {
                      const style = getRarityStyles(mission.rarity);
                      return (
                          <div key={mission.id} className={`rounded-lg p-4 flex flex-col justify-between relative transition-all min-w-[85%] lg:min-w-0 snap-center ${mission.isCompleted ? `glass-panel ${style.border} opacity-60` : 'glass-panel'}`}>
                              <div className="flex justify-between items-start mb-2">
                                  <h3 className={`font-bold text-sm pr-2 ${mission.isCompleted ? 'text-white' : 'text-gray-200'}`}>{mission.title}</h3>
                                  <div className="flex flex-col items-end gap-1 shrink-0">
                                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${style.badge}`}>{mission.rarity}</span>
                                      {mission.isCompleted && <span className={`${style.doneBadge} text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1`}><CheckCircle size={8} /> DONE</span>}
                                  </div>
                              </div>
                              <p className={`text-xs text-gray-400 mb-3 leading-tight ${mission.isCompleted ? 'opacity-70' : ''}`}>{mission.description}</p>
                              <div className="mb-3">
                                  <div className="flex justify-between text-[10px] mb-1 font-mono"><span className="text-gray-500">{t('miss.progress')}</span><span className={mission.isCompleted ? style.text : 'text-gray-300'}>{mission.stats.current % 1 !== 0 ? mission.stats.current.toFixed(1) : mission.stats.current} / {mission.stats.target} {mission.stats.unit}</span></div>
                                  <div className="w-full bg-black/40 rounded-full h-1.5 border border-gray-700/50"><div className={`h-full rounded-full transition-all duration-500 ${style.progress}`} style={{ width: `${mission.stats.percent}%` }}></div></div>
                              </div>
                              <div className={`flex flex-wrap justify-between items-center pt-2 border-t gap-1 ${mission.isCompleted ? 'border-gray-700/30 opacity-70' : 'border-gray-700/50'}`}>
                                  <span className="text-[10px] text-gray-500 font-bold uppercase">{t('miss.reward')}</span>
                                  <div className="flex items-center gap-2">
                                      {mission.rewardRun > 0 && <span className={`${mission.isCompleted ? style.text : 'text-emerald-400'} text-xs font-bold font-mono`}>+{mission.rewardRun} RUN</span>}
                                      {(mission.rewardGov !== undefined && mission.rewardGov > 0) && <span className={`${mission.isCompleted ? style.text : 'text-cyan-400'} text-xs font-bold font-mono border border-cyan-500/30 px-1 rounded`}>+{mission.rewardGov} GOV</span>}
                                  </div>
                              </div>
                          </div>
                      );
                  })}
              </div>
              <ScrollProgressBar progress={missionScrollProgress} />
            </>
        )}
        <div className="hidden lg:block">
            <Pagination currentPage={missionPage} totalPages={totalMissionPages} onPageChange={setMissionPage} />
        </div>
      </div>

      <div>
        <div className="flex flex-col gap-4 mb-4">
            <h2 className="text-lg font-bold text-white border-l-4 border-yellow-500 pl-3">{t('miss.gallery')}</h2>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-3 w-full lg:w-auto">
                    <StatusToggle type="BADGE" current={badgeStatus} onChange={(val) => { setBadgeStatus(val); setBadgePage(1); }} />
                    <div className="relative flex-1 lg:w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
                        <input type="text" placeholder={t('miss.search_badges')} value={badgeSearch} onChange={(e) => { setBadgeSearch(e.target.value); setBadgePage(1); }} className="w-full glass-panel rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:border-yellow-500 focus:outline-none placeholder-gray-500" />
                    </div>
                </div>
                <FilterGroup currentFilter={badgeFilter} onFilterChange={handleBadgeFilterChange} />
            </div>
        </div>

        {filteredBadges.length === 0 ? (
            <div className="text-center py-12 glass-panel rounded-xl border-dashed">
                <Award className="mx-auto text-gray-600 mb-2" /><p className="text-gray-500 text-sm">No badges found.</p>
                <button onClick={() => { handleBadgeFilterChange('ALL'); setBadgeSearch(''); setBadgeStatus('ALL'); }} className="text-yellow-400 text-xs mt-2 hover:underline">{t('miss.clear_filter')}</button>
            </div>
        ) : (
            <>
              <div 
                ref={badgeScrollRef}
                onScroll={() => handleScroll(badgeScrollRef, setBadgeScrollProgress)}
                className="flex overflow-x-auto lg:grid lg:grid-cols-6 gap-3 pb-4 lg:pb-0 no-scrollbar snap-x snap-mandatory"
              >
                  {badgesToRender.map(badge => {
                      const style = getRarityStyles(badge.rarity);
                      const isCurrentlyHovered = hoveredBadge?.badge.id === badge.id;
                      
                      return (
                          <div 
                            key={badge.id} 
                            onMouseEnter={(e) => !isMobile && setHoveredBadge({ badge, rect: e.currentTarget.getBoundingClientRect(), element: e.currentTarget })}
                            onMouseLeave={() => !isMobile && setHoveredBadge(null)}
                            onClick={(e) => {
                                if (isMobile) {
                                    if (isCurrentlyHovered) setHoveredBadge(null);
                                    else setHoveredBadge({ badge, rect: e.currentTarget.getBoundingClientRect(), element: e.currentTarget });
                                }
                            }}
                            className={`aspect-square rounded-xl flex flex-col items-center justify-between p-3 text-center transition-all relative group min-w-[140px] lg:min-w-0 snap-center ${badge.isUnlocked ? `glass-panel ${style.border}` : 'glass-panel opacity-60'} ${isCurrentlyHovered ? 'z-[100] border-white/40' : ''}`}
                          >
                              {badge.isUnlocked && (badge.rarity === 'LEGENDARY' || badge.rarity === 'EPIC') && (
                                  <div className={`absolute top-0 left-0 w-full h-full opacity-10 bg-gradient-to-br ${badge.rarity === 'LEGENDARY' ? 'from-yellow-500' : 'from-purple-500'} to-transparent rounded-xl`}></div>
                              )}
                              
                              <div className="flex-1 flex flex-col items-center justify-center w-full relative z-10">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${badge.isUnlocked ? `${style.badge} ring-2 ring-opacity-50` : 'bg-black/30 text-gray-500 ring-1 ring-gray-600/30'}`}>{renderIcon(badge.icon, "w-5 h-5")}</div>
                                  <h4 className={`font-bold text-xs truncate w-full px-1 ${badge.isUnlocked ? style.text : 'text-gray-400'}`}>{badge.name}</h4>
                                  {!badge.isUnlocked && (
                                      <div className="w-full px-2 mt-2 space-y-1">
                                          <div className="text-center"><span className="text-[9px] text-gray-500 font-mono">{badge.stats.current.toFixed(0)} / {badge.stats.target} {badge.stats.unit}</span></div>
                                          <div className="w-full bg-black/40 rounded-full h-1.5 border border-gray-700/50 overflow-hidden"><div className={`h-full rounded-full transition-all duration-500 ${style.progress}`} style={{ width: `${badge.stats.percent}%` }}></div></div>
                                      </div>
                                  )}
                              </div>
                              <div className="relative z-10 mt-1"><span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${style.badge}`}>{badge.rarity}</span></div>
                          </div>
                      );
                  })}
              </div>
              <ScrollProgressBar progress={badgeScrollProgress} colorClass="bg-yellow-500" />
            </>
        )}
        <div className="hidden lg:block pt-4">
            <Pagination currentPage={badgePage} totalPages={totalBadgePages} onPageChange={setBadgePage} />
        </div>
      </div>

      {hoveredBadge && tooltipPos && (
        <div 
          className="fixed z-[9999] pointer-events-none transition-opacity duration-200"
          style={{ 
            left: tooltipPos.left,
            top: tooltipPos.top,
            transform: tooltipPos.isFlipped ? 'translate(-50%, 0)' : 'translate(-50%, -100%)'
          }}
        >
          <div className="w-56 p-4 bg-gray-950 border-2 border-white/20 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,1)] animate-zoom-in relative">
              <div className={`absolute inset-0 opacity-10 bg-gradient-to-br ${hoveredBadge.badge.rarity === 'LEGENDARY' ? 'from-yellow-500' : hoveredBadge.badge.rarity === 'EPIC' ? 'from-purple-500' : 'from-cyan-500'} to-transparent rounded-2xl`}></div>
              <h5 className={`font-bold text-sm mb-1 relative z-10 ${getRarityStyles(hoveredBadge.badge.rarity).text}`}>{hoveredBadge.badge.name}</h5>
              <p className="text-[11px] text-gray-200 leading-tight relative z-10 mb-3 italic">"{hoveredBadge.badge.description}"</p>
              <div className="flex flex-wrap justify-center items-center gap-2 pt-2 border-t border-gray-800 mt-2 relative z-10">
                  <span className="text-[10px] text-gray-500 font-bold uppercase">{t('miss.reward')}:</span>
                  {(hoveredBadge.badge.rewardRun !== undefined && hoveredBadge.badge.rewardRun > 0) && <span className="text-xs text-emerald-400 font-bold font-mono">+{hoveredBadge.badge.rewardRun} RUN</span>}
                  {(hoveredBadge.badge.rewardGov !== undefined && hoveredBadge.badge.rewardGov > 0) && <span className="text-xs text-cyan-400 font-bold font-mono border border-cyan-500/30 px-1 rounded">+{hoveredBadge.badge.rewardGov} GOV</span>}
              </div>
              
              <div className={`absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gray-950 border-white/20 ${tooltipPos.isFlipped ? '-top-2 border-l-2 border-t-2' : '-bottom-2 border-r-2 border-b-2'} rotate-45`}></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Missions;