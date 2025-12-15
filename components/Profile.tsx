
import React, { useState, useMemo, useEffect } from 'react';
import { User, Zone, Mission, Badge, Rarity, LevelConfig, LeaderboardConfig, BugReport, Suggestion } from '../types';
import { Award, History, Coins, BarChart3, Shield, Trophy, MapPin, ChevronUp, ChevronDown, Users, X, Medal, Crown, Zap, Search, Package } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import Pagination from './Pagination';
import ZoneStatsModal from './profile/ZoneStatsModal';
import UserSubmissionsModal from './profile/UserSubmissionsModal';

// Sub Components
import ProfileHeader from './profile/ProfileHeader';
import ProfileAchievementsTab from './profile/ProfileAchievementsTab';

interface ProfileProps {
  user: User;
  zones: Zone[];
  missions?: Mission[];
  badges?: Badge[];
  levels?: LevelConfig[]; 
  leaderboards?: LeaderboardConfig[];
  bugReports?: BugReport[];
  suggestions?: Suggestion[];
  allUsers?: Record<string, any>;
  onUpdateUser: (updates: Partial<User>) => void;
  onUpgradePremium: () => void;
  onClaim: (zoneId: string) => void;
  onBoost: (zoneId: string) => void;
  onDefend: (zoneId: string) => void;
  onGetZoneLeaderboard: (zoneId: string) => Promise<any[]>;
}

const RUNS_PER_PAGE = 8;
const ZONES_PER_PAGE = 5;

const Profile: React.FC<ProfileProps> = ({ 
    user, zones, missions = [], badges = [], levels = [], leaderboards = [], 
    bugReports = [], suggestions = [], allUsers = {},
    onUpdateUser, onUpgradePremium, onClaim, onBoost, onDefend, onGetZoneLeaderboard
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'ACHIEVEMENTS' | 'HISTORY'>('ACHIEVEMENTS');
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  
  // Local states
  const [runPage, setRunPage] = useState(1);
  const [historySearch, setHistorySearch] = useState(''); 
  const [zonePage, setZonePage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: 'rank' | 'count' | 'km'; direction: 'asc' | 'desc' }>({ key: 'km', direction: 'desc' });
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [zoneLeaderboard, setZoneLeaderboard] = useState<any[]>([]);

  // --- DERIVED STATS ---
  const myZones = zones.filter(z => z.ownerId === user.id);
  const allEarnedBadges = badges.filter(b => user.earnedBadgeIds.includes(b.id));
  const allCompletedMissions = missions.filter(m => user.completedMissionIds.includes(m.id));
  const favoriteBadge = badges.find(b => b.id === user.favoriteBadgeId);

  const myBugReports = useMemo(() => bugReports.filter(b => b.userId === user.id), [bugReports, user.id]);
  const mySuggestions = useMemo(() => suggestions.filter(s => s.userId === user.id), [suggestions, user.id]);

  // Inventory Calcs
  const totalItems = user.inventory.reduce((acc, i) => acc + i.quantity, 0);
  const boostCount = user.inventory.filter(i => i.type === 'BOOST').reduce((acc, i) => acc + i.quantity, 0);
  const shieldCount = user.inventory.filter(i => i.type === 'DEFENSE').reduce((acc, i) => acc + i.quantity, 0);

  // --- PERFORMANCE METRICS ---
  const validHistory = user.runHistory || [];
  const totalRuns = validHistory.length;
  const maxDistance = totalRuns > 0 ? Math.max(...validHistory.map(r => Number(r.km))).toFixed(2) : '0.00';
  const calculatedTotalKm = validHistory.reduce((acc, curr) => acc + Number(curr.km), 0).toFixed(2);

  // Territory Stats
  const now = Date.now();
  const totalOwned = myZones.length;
  const activeBoosts = myZones.filter(z => z.boostExpiresAt && z.boostExpiresAt > now).length;
  const activeShields = myZones.filter(z => z.shieldExpiresAt && z.shieldExpiresAt > now).length;

  // --- LEVEL LOGIC ---
  let currentLevel = 1;
  let nextLevelKm = 50; 
  let progressToNextLevel = 0;
  let currentLevelConfig: LevelConfig | undefined;
  const currentTotalKmVal = parseFloat(calculatedTotalKm);

  if (levels && levels.length > 0) {
      currentLevelConfig = levels.slice().reverse().find(l => currentTotalKmVal >= l.minKm) || levels[0];
      currentLevel = currentLevelConfig.level;
      const nextLevelConfig = levels.find(l => l.level === currentLevel + 1);
      
      if (nextLevelConfig) {
          nextLevelKm = nextLevelConfig.minKm;
          const range = nextLevelConfig.minKm - currentLevelConfig.minKm;
          progressToNextLevel = Math.min(100, Math.max(0, ((currentTotalKmVal - currentLevelConfig.minKm) / range) * 100));
      } else {
          nextLevelKm = currentTotalKmVal;
          progressToNextLevel = 100;
      }
  } else {
      currentLevel = Math.floor(currentTotalKmVal / 50) + 1;
      nextLevelKm = currentLevel * 50;
      progressToNextLevel = ((currentTotalKmVal - ((currentLevel - 1) * 50)) / 50) * 100;
  }

  // --- ZONE DATA LOOKUP ---
  const selectedZone = useMemo(() => zones.find(z => z.id === selectedZoneId), [zones, selectedZoneId]);

  useEffect(() => {
      if (selectedZone) {
          setZoneLeaderboard([]); 
          onGetZoneLeaderboard(selectedZone.id).then(setZoneLeaderboard);
      }
  }, [selectedZone, onGetZoneLeaderboard]);

  const ownerDetails = useMemo(() => {
      if (!selectedZone) return null;
      if (!selectedZone.ownerId) return { name: 'Unclaimed', avatar: null, badge: null };
      let userData = selectedZone.ownerId === user.id ? user : allUsers[selectedZone.ownerId];
      if (!userData) return { name: 'Unknown', avatar: null, badge: null };
      const userBadge = userData.favoriteBadgeId ? badges.find(b => b.id === userData.favoriteBadgeId) : null;
      return { name: userData.name, avatar: userData.avatar, badge: userBadge };
  }, [selectedZone, allUsers, user, badges]);

  // --- ZONE STATS LOGIC ---
  const sortedZoneStats = useMemo(() => {
      const statsMap = new Map<string, { id: string; name: string; count: number; km: number; isOwned: boolean }>();
      myZones.forEach(z => {
          statsMap.set(z.id, { id: z.id, name: z.name, count: 0, km: z.recordKm, isOwned: true });
      });

      const updateEntry = (zoneId: string, zoneName: string, kmToAdd: number) => {
          const entry = statsMap.get(zoneId);
          if (entry) {
              entry.count += 1;
              if (!entry.isOwned) entry.km += kmToAdd;
          } else {
              statsMap.set(zoneId, { id: zoneId, name: zoneName, count: 1, km: kmToAdd, isOwned: false });
          }
      };

      validHistory.forEach(run => {
          const involvedIds = new Set<string>();
          if (run.involvedZones && run.involvedZones.length > 0) run.involvedZones.forEach(id => involvedIds.add(id));
          
          if (involvedIds.size === 0 && run.location) {
              const cleanLoc = run.location.trim().toLowerCase();
              const match = zones.find(z => {
                  const zName = z.name.trim().toLowerCase();
                  return zName === cleanLoc || zName.startsWith(cleanLoc) || cleanLoc.startsWith(zName);
              });
              if (match) involvedIds.add(match.id);
          }

          const idsArray = Array.from(involvedIds);
          if (idsArray.length > 0) {
              idsArray.forEach(zoneId => {
                  const zoneDef = zones.find(z => z.id === zoneId);
                  const zoneName = zoneDef ? zoneDef.name : "Unknown Zone";
                  let runKmForZone = 0;
                  if (run.zoneBreakdown && run.zoneBreakdown[zoneId]) runKmForZone = Number(run.zoneBreakdown[zoneId]);
                  else runKmForZone = run.km / idsArray.length;
                  updateEntry(zoneId, zoneName, runKmForZone);
              });
          }
      });

      const dataWithRank = Array.from(statsMap.values()).map(stat => {
          const zoneObj = zones.find(z => z.id === stat.id);
          let rank = 999; 
          if (zoneObj) {
              if (zoneObj.ownerId === user.id) rank = 1; 
              else if (zoneObj.recordKm > 0) {
                  const ratio = stat.km / zoneObj.recordKm;
                  if (ratio >= 1) rank = 1;
                  else if (ratio > 0.8) rank = 2;
                  else if (ratio > 0.6) rank = 3;
                  else if (ratio > 0.4) rank = 4;
                  else rank = Math.floor((1 - ratio) * 10) + 5; 
              } else rank = 1;
          }
          return { ...stat, rank };
      });

      return dataWithRank.sort((a, b) => {
          const modifier = sortConfig.direction === 'asc' ? 1 : -1;
          if (a[sortConfig.key] < b[sortConfig.key]) return -1 * modifier;
          if (a[sortConfig.key] > b[sortConfig.key]) return 1 * modifier;
          return 0;
      });
  }, [validHistory, sortConfig, zones, user.id, myZones]);

  const currentZoneStats = sortedZoneStats.slice((zonePage - 1) * ZONES_PER_PAGE, zonePage * ZONES_PER_PAGE);

  // --- FILTERED HISTORY ---
  const filteredRuns = useMemo(() => {
      return validHistory.filter(run => {
          if (!historySearch) return true;
          const searchLower = historySearch.toLowerCase();
          const locationDisplay = (run.involvedZones && run.involvedZones.length > 0)
              ? run.involvedZones.map(id => zones.find(z => z.id === id)?.name).filter(Boolean).join(', ')
              : run.location;
          const dateStr = new Date(run.timestamp).toLocaleDateString();
          return (locationDisplay || '').toLowerCase().includes(searchLower) || dateStr.includes(searchLower);
      });
  }, [validHistory, historySearch, zones]);

  const currentRuns = filteredRuns.slice((runPage - 1) * RUNS_PER_PAGE, runPage * RUNS_PER_PAGE);
  const totalRunPages = Math.ceil(filteredRuns.length / RUNS_PER_PAGE);

  // --- LEADERBOARD LOGIC ---
  const getLeaderboardRank = (board: LeaderboardConfig) => {
      const getScore = (u: any, isCurrentUser: boolean) => {
          const timeFilter = board.lastResetTimestamp || board.startTime || 0;
          const endTimeFilter = board.endTime || Infinity;
          if (isCurrentUser) {
              const validRuns = (u.runHistory || []).filter((r: any) => r.timestamp >= timeFilter && r.timestamp <= endTimeFilter);
              switch(board.metric) {
                  case 'TOTAL_KM': return validRuns.reduce((acc: number, r: any) => acc + r.km, 0);
                  case 'OWNED_ZONES': return zones.filter(z => z.ownerId === u.id).length;
                  case 'RUN_BALANCE': return u.runBalance;
                  case 'GOV_BALANCE': return u.govBalance;
                  case 'UNIQUE_ZONES': return new Set(validRuns.map((r: any) => r.location)).size;
                  default: return 0;
              }
          } else {
              const seed = u.name.length;
              const ratio = (board.type === 'TEMPORARY' || !!board.lastResetTimestamp) ? 0.2 : 1.0;
              switch(board.metric) {
                  case 'TOTAL_KM': return u.totalKm * ratio;
                  case 'OWNED_ZONES': return zones.filter(z => z.ownerId === u.id).length;
                  case 'RUN_BALANCE': return u.runBalance ?? ((u.totalKm * 10) + (seed * 50));
                  case 'GOV_BALANCE': return u.govBalance ?? ((u.totalKm / 10) + (seed * 2));
                  case 'UNIQUE_ZONES': return Math.floor((u.totalKm * ratio) / 5) + 1;
                  default: return 0;
              }
          }
      };
      const userScore = getScore(user, true);
      const allScores = [{ id: user.id, score: userScore }, ...Object.values(allUsers).map((u: any) => ({ id: u.id, score: getScore(u, false) }))];
      allScores.sort((a, b) => b.score - a.score);
      return { rank: allScores.findIndex(s => s.id === user.id) + 1, score: userScore };
  };

  const handleSort = (key: 'rank' | 'count' | 'km') => {
      setSortConfig(current => ({ key, direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc' }));
  };

  const renderSortArrow = (key: 'rank' | 'count' | 'km') => {
      if (sortConfig.key !== key) return null;
      return sortConfig.direction === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />;
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      
      {/* HEADER */}
      <ProfileHeader 
          user={{...user, totalKm: currentTotalKmVal}} 
          favoriteBadge={favoriteBadge} 
          nextLevelKm={nextLevelKm} 
          currentLevel={currentLevel}
          levelTitle={currentLevelConfig?.title}
          levelIcon={currentLevelConfig?.icon}
          levels={levels}
          progressToNextLevel={progressToNextLevel}
          onUpdateUser={onUpdateUser}
          onUpgradePremium={onUpgradePremium}
          onViewSubmissions={() => setShowSubmissionsModal(true)}
      />

      {/* STATS ROW (HUD EFFECT APPLIED) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel rounded-xl p-5 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 p-4 opacity-5"><Coins size={80}/></div>
              <h3 className="text-white font-bold uppercase tracking-wide mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
                  <Coins size={18} className="text-yellow-500"/> {t('profile.liquid_assets')}
              </h3>
              
              <div className="space-y-3 relative z-10 flex-1">
                  <div className="flex justify-between items-end bg-black/20 p-3 rounded-lg border border-white/5">
                      <span className="text-sm text-gray-400 font-bold">{t('profile.run_balance')}</span>
                      <span className="text-xl font-mono font-bold text-emerald-400">{user.runBalance.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between items-end bg-black/20 p-3 rounded-lg border border-white/5">
                      <span className="text-sm text-gray-400 font-bold">{t('profile.gov_holdings')}</span>
                      <span className="text-xl font-mono font-bold text-cyan-400">{user.govBalance.toFixed(1)}</span>
                  </div>
                  
                  {/* INVENTORY SUMMARY */}
                  <div className="flex flex-col bg-black/20 p-3 rounded-lg border border-white/5 mt-auto">
                      <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-400 font-bold flex items-center gap-1">
                              <Package size={14} className="text-gray-500"/> {t('profile.inventory_items')}
                          </span>
                          <span className="text-xl font-mono font-bold text-white">{totalItems}</span>
                      </div>
                      <div className="flex gap-2">
                          {boostCount > 0 && (
                              <span className="text-[10px] bg-amber-900/40 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20 font-bold flex items-center gap-1">
                                  <Zap size={10} className="fill-amber-400"/> {boostCount}
                              </span>
                          )}
                          {shieldCount > 0 && (
                              <span className="text-[10px] bg-cyan-900/40 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/20 font-bold flex items-center gap-1">
                                  <Shield size={10} className="fill-cyan-400"/> {shieldCount}
                              </span>
                          )}
                          {totalItems === 0 && (
                              <span className="text-[10px] text-gray-600 italic">Empty Backpack</span>
                          )}
                      </div>
                  </div>
              </div>
          </div>

          <div className="glass-panel rounded-xl p-5 flex flex-col justify-between">
              <h3 className="text-white font-bold uppercase tracking-wide mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
                  <BarChart3 size={18} className="text-gray-400"/> {t('profile.perf_metrics')}
              </h3>
              <div className="space-y-4">
                  <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400 font-medium">{t('profile.longest_run')}</span>
                      <span className="text-white font-mono font-bold text-lg">{maxDistance} km</span>
                  </div>
                  <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400 font-medium">{t('profile.total_dist')}</span>
                      <span className="text-white font-mono font-bold text-lg">{calculatedTotalKm} km</span>
                  </div>
                  <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400 font-medium">{t('profile.total_runs')}</span>
                      <span className="text-white font-mono font-bold text-lg">{totalRuns}</span>
                  </div>
              </div>
          </div>

          {/* TERRITORY STATUS */}
          <div className="glass-panel rounded-xl p-5 flex flex-col justify-between">
              <h3 className="text-white font-bold uppercase tracking-wide mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
                  <Shield size={18} className="text-gray-400"/> {t('profile.territory_status')}
              </h3>
              
              <div className="bg-black/30 p-3 rounded-lg border border-white/5 flex items-center justify-between mb-3">
                   <div className="flex items-center gap-2">
                       <div className="p-1.5 bg-emerald-500/20 rounded text-emerald-400">
                           <MapPin size={16} />
                       </div>
                       <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">{t('profile.owned_zones')}</span>
                   </div>
                   <span className="text-2xl font-mono font-bold text-white">{totalOwned}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                  <div className="bg-black/30 p-3 rounded-lg border border-white/5 flex flex-col items-center justify-center">
                      <div className="flex items-center gap-1 text-xl font-mono font-bold text-white mb-1">
                          <Zap size={16} className="text-amber-400 fill-amber-400" /> {activeBoosts}
                      </div>
                      <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{t('zone.boosted')}</span>
                  </div>
                  <div className="bg-black/30 p-3 rounded-lg border border-white/5 flex flex-col items-center justify-center">
                      <div className="flex items-center gap-1 text-xl font-mono font-bold text-white mb-1">
                          <Shield size={16} className="text-cyan-400 fill-cyan-400/50" /> {activeShields}
                      </div>
                      <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{t('zone.shielded')}</span>
                  </div>
              </div>
          </div>
      </div>

      {/* LEADERBOARD RANKS */}
      {leaderboards.length > 0 && (
          <div className="glass-panel rounded-xl p-5">
              <h3 className="text-white font-bold uppercase tracking-wide mb-4 flex items-center gap-2">
                  <Trophy size={18} className="text-yellow-400"/> {t('profile.active_rankings')}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {leaderboards.map(lb => {
                      const { rank, score } = getLeaderboardRank(lb);
                      const isTop3 = rank <= 3;
                      return (
                          <div key={lb.id} className={`p-3 rounded-xl border transition-colors flex flex-col justify-between ${isTop3 ? 'bg-gradient-to-br from-black/60 to-yellow-900/20 border-yellow-500/30' : 'bg-black/40 border-white/5'}`}>
                              <div className="flex justify-between items-start mb-2 gap-2">
                                  <div className="min-w-0">
                                      <h4 className="font-bold text-white text-xs truncate uppercase tracking-wider" title={lb.title}>{lb.title}</h4>
                                      <span className={`text-[9px] uppercase font-bold px-1 py-0.5 rounded ${lb.type === 'PERMANENT' ? 'bg-gray-800 text-gray-500' : 'bg-purple-900/50 text-purple-400'}`}>
                                          {lb.type === 'PERMANENT' ? 'Seas.' : 'Evt.'}
                                      </span>
                                  </div>
                                  <div className={`flex flex-col items-center justify-center w-8 h-8 rounded-lg shrink-0 ${isTop3 ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-gray-400'}`}>
                                      <span className="text-[9px] font-bold">#</span>
                                      <span className="text-sm font-black leading-none font-mono">{rank}</span>
                                  </div>
                              </div>
                              <div className="mt-1 pt-2 border-t border-white/10 flex justify-between items-center">
                                  <span className="text-[9px] text-gray-500 uppercase font-bold truncate pr-1 hidden sm:block">{t('profile.score')}</span>
                                  <span className={`font-mono text-xs font-bold truncate ${isTop3 ? 'text-yellow-400' : 'text-emerald-400'}`}>
                                      {score.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 1 })}
                                  </span>
                              </div>
                          </div>
                      );
                  })}
              </div>
          </div>
      )}

      {/* ZONE STATS */}
      <div className="glass-panel rounded-xl p-5">
          <h3 className="text-white font-bold uppercase tracking-wide mb-4 flex items-center gap-2">
              <MapPin size={18} className="text-emerald-400"/> {t('profile.zone_stats')}
          </h3>
          {sortedZoneStats.length === 0 ? (
              <div className="text-center py-8 text-gray-500 border border-dashed border-white/10 rounded-lg"><p>{t('profile.no_runs')}</p></div>
          ) : (
              <div>
                  <div className="rounded-lg overflow-hidden border border-white/10 bg-black/40 mb-4">
                      <div className="grid grid-cols-12 gap-2 p-3 bg-black/60 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b border-white/10">
                          <button onClick={() => handleSort('rank')} className="col-span-2 md:col-span-1 text-center hover:text-white flex items-center justify-center gap-1">
                              {t('profile.zone_rank')} {renderSortArrow('rank')}
                          </button>
                          <div className="col-span-6 md:col-span-7">{t('profile.location')}</div>
                          <button onClick={() => handleSort('count')} className="col-span-2 text-right hover:text-white flex items-center justify-end gap-1">
                              {renderSortArrow('count')} {t('profile.zone_runs')}
                          </button>
                          <button onClick={() => handleSort('km')} className="col-span-2 text-right hover:text-white flex items-center justify-end gap-1">
                              {renderSortArrow('km')} {t('profile.zone_total')}
                          </button>
                      </div>
                      <div className="divide-y divide-white/10">
                          {currentZoneStats.map((stat, idx) => {
                              const rank = stat.rank; 
                              let rankColor = "text-gray-500";
                              let rankIcon = null;
                              
                              if (rank === 1) {
                                  rankColor = "text-yellow-400";
                                  rankIcon = <Crown size={12} className="fill-yellow-400 inline mb-0.5 mr-1" />;
                              }
                              else if (rank === 2) rankColor = "text-gray-300";
                              else if (rank === 3) rankColor = "text-amber-600";

                              return (
                                  <div key={idx} className="grid grid-cols-12 gap-2 p-3 items-center hover:bg-white/5 transition-colors cursor-pointer group" onClick={() => setSelectedZoneId(stat.id)}>
                                      <div className={`col-span-2 md:col-span-1 text-center font-black ${rankColor} text-sm flex items-center justify-center font-mono`}>
                                          {rankIcon} #{rank}
                                      </div>
                                      <div className="col-span-6 md:col-span-7 font-bold text-white text-xs truncate group-hover:text-emerald-400 transition-colors uppercase tracking-wide" title={stat.name}>{stat.name}</div>
                                      <div className="col-span-2 text-right font-mono text-white font-bold text-xs">{stat.count}</div>
                                      <div className="col-span-2 text-right font-mono text-emerald-400 font-bold text-xs">{stat.km.toFixed(1)}</div>
                                  </div>
                              );
                          })}
                      </div>
                  </div>
                  <Pagination currentPage={zonePage} totalPages={Math.ceil(sortedZoneStats.length / ZONES_PER_PAGE)} onPageChange={setZonePage} />
              </div>
          )}
      </div>

      {/* TABS (Glass Style) */}
      <div className="w-full">
          <div className="glass-panel rounded-xl min-h-[500px] flex flex-col relative z-0">
              <div className="flex border-b border-white/10 bg-black/40 rounded-t-xl">
                  <button onClick={() => setActiveTab('ACHIEVEMENTS')} className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'ACHIEVEMENTS' ? 'border-yellow-500 text-yellow-400 bg-white/5 rounded-tl-xl' : 'border-transparent text-gray-500 hover:text-white rounded-tl-xl'}`}>
                      <Award size={16} /> {t('profile.tab.achievements')}
                  </button>
                  <button onClick={() => setActiveTab('HISTORY')} className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'HISTORY' ? 'border-emerald-500 text-emerald-400 bg-white/5 rounded-tr-xl' : 'border-transparent text-gray-500 hover:text-white rounded-tr-xl'}`}>
                      <History size={16} /> {t('profile.tab.history')}
                  </button>
              </div>

              <div className="p-6 flex-1 rounded-b-xl">
                  {activeTab === 'ACHIEVEMENTS' && (
                      <ProfileAchievementsTab 
                          user={user} 
                          earnedBadges={allEarnedBadges} 
                          completedMissions={allCompletedMissions} 
                          onEquipBadge={(id) => onUpdateUser({ favoriteBadgeId: id })}
                      />
                  )}
                  {activeTab === 'HISTORY' && (
                      <div className="space-y-4">
                          {validHistory.length === 0 ? (
                              <div className="text-center py-20 text-gray-500"><History size={48} className="mx-auto mb-4 opacity-20" /><p>{t('profile.no_runs')}</p></div>
                          ) : (
                              <>
                                {/* SEARCH BAR */}
                                <div className="relative mb-2">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
                                    <input 
                                        type="text" 
                                        placeholder="Search history by location or date..." 
                                        className="w-full bg-black/40 border border-gray-600 rounded-lg pl-9 pr-8 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                                        value={historySearch}
                                        onChange={(e) => {
                                            setHistorySearch(e.target.value);
                                            setRunPage(1); 
                                        }}
                                    />
                                    {historySearch && (
                                        <button 
                                            onClick={() => { setHistorySearch(''); setRunPage(1); }}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white"
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="text-[10px] uppercase font-bold text-gray-500 border-b border-gray-700 tracking-wider">
                                            <tr><th className="pb-3 pl-2">{t('profile.date')}</th><th className="pb-3">{t('profile.location')}</th><th className="pb-3 text-right">Dist</th><th className="pb-3 text-right pr-2">{t('profile.rewards')}</th></tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/10 text-sm">
                                            {filteredRuns.length === 0 ? (
                                                <tr><td colSpan={4} className="py-8 text-center text-gray-500 italic">No runs found matching search.</td></tr>
                                            ) : (
                                                currentRuns.map(run => {
                                                    const locationDisplay = (run.involvedZones && run.involvedZones.length > 0)
                                                        ? run.involvedZones.map(id => zones.find(z => z.id === id)?.name).filter(Boolean).join(', ')
                                                        : run.location;

                                                    return (
                                                        <tr key={run.id} className="hover:bg-white/5 transition-colors">
                                                            <td className="py-3 pl-2 text-gray-400 text-xs font-mono">{new Date(run.timestamp).toLocaleDateString()}</td>
                                                            <td className="py-3 font-bold text-white uppercase tracking-wide text-xs md:text-sm">{locationDisplay}</td>
                                                            <td className="py-3 text-right font-mono text-emerald-400">{run.km.toFixed(2)} km</td>
                                                            <td className="py-3 text-right pr-2"><div className="flex flex-col items-end"><span className="text-xs font-bold text-white font-mono">+{run.runEarned} RUN</span>{run.govEarned && <span className="text-[10px] text-cyan-400 font-mono">+{run.govEarned} GOV</span>}</div></td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <Pagination currentPage={runPage} totalPages={totalRunPages} onPageChange={setRunPage} />
                              </>
                          )}
                      </div>
                  )}
              </div>
          </div>
      </div>

      {/* ZONE DETAILS MODAL */}
      {selectedZone && (
          <ZoneStatsModal 
              zone={selectedZone}
              user={user}
              onClose={() => setSelectedZoneId(null)}
              ownerDetails={ownerDetails}
              zoneLeaderboard={zoneLeaderboard}
          />
      )}

      {/* SUBMISSIONS MODAL */}
      {showSubmissionsModal && (
          <UserSubmissionsModal 
              bugReports={myBugReports}
              suggestions={mySuggestions}
              onClose={() => setShowSubmissionsModal(false)}
          />
      )}

    </div>
  );
};

export default Profile;