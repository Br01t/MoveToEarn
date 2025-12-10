
import React, { useState, useMemo } from 'react';
import { User, Zone, Mission, Badge, Rarity, LevelConfig, LeaderboardConfig } from '../types';
import { Award, History, Coins, BarChart3, Shield, Trophy, MapPin, ChevronUp, ChevronDown, Users, X, Medal } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import Pagination from './Pagination';
import ZoneStatsModal from './profile/ZoneStatsModal';

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
  allUsers?: Record<string, any>;
  onUpdateUser: (updates: Partial<User>) => void;
  onUpgradePremium: () => void;
  onClaim: (zoneId: string) => void;
  onBoost: (zoneId: string) => void;
  onDefend: (zoneId: string) => void;
}

const RUNS_PER_PAGE = 8;
const ZONES_PER_PAGE = 5;

const Profile: React.FC<ProfileProps> = ({ 
    user, zones, missions = [], badges = [], levels = [], leaderboards = [], allUsers = {},
    onUpdateUser, onUpgradePremium, onClaim, onBoost, onDefend
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'ACHIEVEMENTS' | 'HISTORY'>('ACHIEVEMENTS');
  
  // Local states for history/zones that remain in parent for now or can be extracted further
  const [runPage, setRunPage] = useState(1);
  const [zonePage, setZonePage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: 'rank' | 'count' | 'km'; direction: 'asc' | 'desc' }>({ key: 'km', direction: 'desc' });
  const [selectedZoneDetail, setSelectedZoneDetail] = useState<string | null>(null);

  // --- DERIVED STATS ---
  const myZones = zones.filter(z => z.ownerId === user.id);
  const allEarnedBadges = badges.filter(b => user.earnedBadgeIds.includes(b.id));
  const allCompletedMissions = missions.filter(m => user.completedMissionIds.includes(m.id));
  const favoriteBadge = badges.find(b => b.id === user.favoriteBadgeId);

  // Stats
  const totalRuns = user.runHistory.length;
  const avgDistance = totalRuns > 0 ? (user.totalKm / totalRuns).toFixed(2) : '0.00';
  const maxDistance = totalRuns > 0 ? Math.max(...user.runHistory.map(r => r.km)).toFixed(2) : '0.00';

  // --- LEVEL LOGIC ---
  let currentLevel = 1;
  let nextLevelKm = 50; 
  let progressToNextLevel = 0;

  if (levels && levels.length > 0) {
      const currentLevelConfig = levels.slice().reverse().find(l => user.totalKm >= l.minKm) || levels[0];
      currentLevel = currentLevelConfig.level;
      const nextLevelConfig = levels.find(l => l.level === currentLevel + 1);
      
      if (nextLevelConfig) {
          nextLevelKm = nextLevelConfig.minKm;
          const range = nextLevelConfig.minKm - currentLevelConfig.minKm;
          progressToNextLevel = Math.min(100, Math.max(0, ((user.totalKm - currentLevelConfig.minKm) / range) * 100));
      } else {
          nextLevelKm = user.totalKm;
          progressToNextLevel = 100;
      }
  } else {
      currentLevel = Math.floor(user.totalKm / 50) + 1;
      nextLevelKm = currentLevel * 50;
      progressToNextLevel = ((user.totalKm - ((currentLevel - 1) * 50)) / 50) * 100;
  }

  // --- ZONE DATA LOOKUP FOR MODAL ---
  const selectedZone = useMemo(() => zones.find(z => z.name === selectedZoneDetail), [zones, selectedZoneDetail]);

  const ownerDetails = useMemo(() => {
      if (!selectedZone) return null;
      if (!selectedZone.ownerId) return { name: 'Unclaimed', avatar: null, badge: null };
      let userData = selectedZone.ownerId === user.id ? user : allUsers[selectedZone.ownerId];
      if (!userData) return { name: 'Unknown', avatar: null, badge: null };
      const userBadge = userData.favoriteBadgeId ? badges.find(b => b.id === userData.favoriteBadgeId) : null;
      return { name: userData.name, avatar: userData.avatar, badge: userBadge };
  }, [selectedZone, allUsers, user, badges]);

  const zoneLeaderboard = useMemo(() => {
      if (!selectedZone) return [];
      const zoneName = selectedZone.name;
      const myRuns = user.runHistory.filter(r => r.location === zoneName);
      const myTotalKm = myRuns.reduce((acc, r) => acc + r.km, 0);
      const leaderboard = Object.values(allUsers).map((u: any) => {
          if (u.id === user.id) return { id: u.id, name: u.name, avatar: u.avatar, km: myTotalKm };
          const seed = (u.id.charCodeAt(u.id.length - 1) + zoneName.length) % 100;
          const fakeKm = (u.totalKm * (seed / 100)) / 5;
          return { id: u.id, name: u.name, avatar: u.avatar, km: fakeKm };
      });
      return leaderboard.sort((a, b) => b.km - a.km).slice(0, 10);
  }, [selectedZone, allUsers, user]);

  // --- ZONE RANK LOGIC (FOR TABLE) ---
  const getZoneRank = (zoneName: string, myKm: number) => {
      const leaderboard = Object.values(allUsers).map((u: any) => {
          if (u.id === user.id) return { id: u.id, km: myKm };
          const seed = (u.id.charCodeAt(u.id.length - 1) + zoneName.length) % 100;
          const fakeKm = (u.totalKm * (seed / 100)) / 5;
          return { id: u.id, km: fakeKm };
      });
      leaderboard.sort((a, b) => b.km - a.km);
      return leaderboard.findIndex(u => u.id === user.id) + 1;
  };

  const sortedZoneStats = useMemo(() => {
      const stats: Record<string, { name: string; count: number; km: number }> = {};
      user.runHistory.forEach(run => {
          if (!stats[run.location]) stats[run.location] = { name: run.location, count: 0, km: 0 };
          stats[run.location].count += 1;
          stats[run.location].km += run.km;
      });
      const dataWithRank = Object.values(stats).map(stat => ({ ...stat, rank: getZoneRank(stat.name, stat.km) }));
      return dataWithRank.sort((a, b) => {
          const modifier = sortConfig.direction === 'asc' ? 1 : -1;
          if (a[sortConfig.key] < b[sortConfig.key]) return -1 * modifier;
          if (a[sortConfig.key] > b[sortConfig.key]) return 1 * modifier;
          return 0;
      });
  }, [user.runHistory, sortConfig, allUsers]);

  const currentZoneStats = sortedZoneStats.slice((zonePage - 1) * ZONES_PER_PAGE, zonePage * ZONES_PER_PAGE);
  const currentRuns = user.runHistory.slice((runPage - 1) * RUNS_PER_PAGE, runPage * RUNS_PER_PAGE);

  // --- LEADERBOARD LOGIC ---
  const getLeaderboardRank = (board: LeaderboardConfig) => {
      const getScore = (u: any, isCurrentUser: boolean) => {
          const timeFilter = board.lastResetTimestamp || board.startTime || 0;
          const endTimeFilter = board.endTime || Infinity;
          if (isCurrentUser) {
              const validRuns = u.runHistory.filter((r: any) => r.timestamp >= timeFilter && r.timestamp <= endTimeFilter);
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
          user={user} 
          favoriteBadge={favoriteBadge} 
          nextLevelKm={nextLevelKm} 
          currentLevel={currentLevel} 
          progressToNextLevel={progressToNextLevel}
          onUpdateUser={onUpdateUser}
          onUpgradePremium={onUpgradePremium}
      />

      {/* STATS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 p-5 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 p-4 opacity-5"><Coins size={80}/></div>
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <Coins size={18} className="text-yellow-500"/> {t('profile.liquid_assets')}
              </h3>
              <div className="space-y-3 relative z-10">
                  <div className="flex justify-between items-end bg-black/20 p-3 rounded-lg">
                      <span className="text-sm text-gray-400">{t('profile.run_balance')}</span>
                      <span className="text-xl font-mono font-bold text-emerald-400">{user.runBalance.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between items-end bg-black/20 p-3 rounded-lg">
                      <span className="text-sm text-gray-400">{t('profile.gov_holdings')}</span>
                      <span className="text-xl font-mono font-bold text-cyan-400">{user.govBalance.toFixed(1)}</span>
                  </div>
              </div>
          </div>

          <div className="bg-gray-800 rounded-xl border border-gray-700 p-5 flex flex-col justify-between">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2 border-b border-gray-700 pb-2">
                  <BarChart3 size={18} className="text-gray-400"/> {t('profile.perf_metrics')}
              </h3>
              <div className="space-y-4">
                  <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">{t('profile.longest_run')}</span>
                      <span className="text-white font-mono font-bold">{maxDistance} km</span>
                  </div>
                  <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">{t('profile.avg_dist')}</span>
                      <span className="text-white font-mono font-bold">{avgDistance} km</span>
                  </div>
              </div>
          </div>

          <div className="bg-gray-800 rounded-xl border border-gray-700 p-5 flex flex-col justify-between">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2 border-b border-gray-700 pb-2">
                  <Shield size={18} className="text-gray-400"/> {t('profile.territory_status')}
              </h3>
              <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-900 p-3 rounded-lg text-center">
                      <span className="block text-xl font-bold text-white">{myZones.filter(z => z.defenseLevel > 1).length}</span>
                      <span className="text-[10px] text-gray-500 uppercase">{t('profile.fortified')}</span>
                  </div>
                  <div className="bg-gray-900 p-3 rounded-lg text-center">
                      <span className="block text-xl font-bold text-white">{myZones.filter(z => z.interestRate > 3).length}</span>
                      <span className="text-[10px] text-gray-500 uppercase">{t('profile.high_yield')}</span>
                  </div>
              </div>
          </div>
      </div>

      {/* LEADERBOARD RANKS */}
      {leaderboards.length > 0 && (
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <Trophy size={18} className="text-yellow-400"/> {t('profile.active_rankings')}
              </h3>
              {/* Changed from flex gap-2 w-full overflow-hidden to responsive grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {leaderboards.map(lb => {
                      const { rank, score } = getLeaderboardRank(lb);
                      const isTop3 = rank <= 3;
                      return (
                          <div key={lb.id} className={`p-3 rounded-xl border transition-colors flex flex-col justify-between ${isTop3 ? 'bg-gradient-to-br from-gray-900 to-yellow-900/20 border-yellow-500/30' : 'bg-gray-900 border-gray-700'}`}>
                              <div className="flex justify-between items-start mb-2 gap-2">
                                  <div className="min-w-0">
                                      <h4 className="font-bold text-white text-xs truncate" title={lb.title}>{lb.title}</h4>
                                      <span className={`text-[9px] uppercase font-bold px-1 py-0.5 rounded ${lb.type === 'PERMANENT' ? 'bg-gray-800 text-gray-500' : 'bg-purple-900/50 text-purple-400'}`}>
                                          {lb.type === 'PERMANENT' ? 'Seas.' : 'Evt.'}
                                      </span>
                                  </div>
                                  <div className={`flex flex-col items-center justify-center w-8 h-8 rounded-lg shrink-0 ${isTop3 ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-gray-400'}`}>
                                      <span className="text-[9px] font-bold">#</span>
                                      <span className="text-sm font-black leading-none">{rank}</span>
                                  </div>
                              </div>
                              <div className="mt-1 pt-2 border-t border-gray-800 flex justify-between items-center">
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
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <MapPin size={18} className="text-emerald-400"/> {t('profile.zone_stats')}
          </h3>
          {sortedZoneStats.length === 0 ? (
              <div className="text-center py-8 text-gray-500 border border-dashed border-gray-700 rounded-lg"><p>{t('profile.no_runs')}</p></div>
          ) : (
              <div>
                  <div className="rounded-lg overflow-hidden border border-gray-700 bg-gray-900 mb-4">
                      <div className="grid grid-cols-12 gap-2 p-3 bg-gray-950 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-700">
                          <button onClick={() => handleSort('rank')} className="col-span-1 text-center hover:text-white flex items-center justify-center gap-1"># {renderSortArrow('rank')}</button>
                          <div className="col-span-7">{t('profile.location')}</div>
                          <button onClick={() => handleSort('count')} className="col-span-2 text-right hover:text-white flex items-center justify-end gap-1">{renderSortArrow('count')} {t('profile.zone_runs')}</button>
                          <button onClick={() => handleSort('km')} className="col-span-2 text-right hover:text-white flex items-center justify-end gap-1">{renderSortArrow('km')} {t('profile.zone_total')}</button>
                      </div>
                      <div className="divide-y divide-gray-800">
                          {currentZoneStats.map((stat, idx) => {
                              const rank = stat.rank; 
                              let rankColor = "text-gray-500";
                              if (rank === 1) rankColor = "text-yellow-400";
                              else if (rank === 2) rankColor = "text-gray-300";
                              else if (rank === 3) rankColor = "text-amber-600";
                              return (
                                  <div key={idx} className="grid grid-cols-12 gap-2 p-3 items-center hover:bg-gray-800 transition-colors cursor-pointer group" onClick={() => setSelectedZoneDetail(stat.name)}>
                                      <div className={`col-span-1 text-center font-black ${rankColor} text-sm`}>{rank}</div>
                                      <div className="col-span-7 font-bold text-white text-xs truncate group-hover:text-emerald-400 transition-colors" title={stat.name}>{stat.name}</div>
                                      <div className="col-span-2 text-right font-mono text-gray-300 text-xs">{stat.count}</div>
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

      {/* TABS */}
      <div className="w-full">
          <div className="bg-gray-800 rounded-xl border border-gray-700 min-h-[500px] flex flex-col relative z-0">
              <div className="flex border-b border-gray-700 bg-gray-900/50 rounded-t-xl">
                  <button onClick={() => setActiveTab('ACHIEVEMENTS')} className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'ACHIEVEMENTS' ? 'border-yellow-500 text-yellow-400 bg-gray-800 rounded-tl-xl' : 'border-transparent text-gray-500 hover:text-white rounded-tl-xl'}`}>
                      <Award size={16} /> {t('profile.tab.achievements')}
                  </button>
                  <button onClick={() => setActiveTab('HISTORY')} className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'HISTORY' ? 'border-emerald-500 text-emerald-400 bg-gray-800 rounded-tr-xl' : 'border-transparent text-gray-500 hover:text-white rounded-tr-xl'}`}>
                      <History size={16} /> {t('profile.tab.history')}
                  </button>
              </div>

              <div className="p-6 flex-1 bg-gray-800 rounded-b-xl">
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
                          {user.runHistory.length === 0 ? (
                              <div className="text-center py-20 text-gray-500"><History size={48} className="mx-auto mb-4 opacity-20" /><p>{t('profile.no_runs')}</p></div>
                          ) : (
                              <>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="text-[10px] uppercase font-bold text-gray-500 border-b border-gray-700">
                                            <tr><th className="pb-3 pl-2">{t('profile.date')}</th><th className="pb-3">{t('profile.location')}</th><th className="pb-3 text-right">Dist</th><th className="pb-3 text-right pr-2">{t('profile.rewards')}</th></tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-700/50 text-sm">
                                            {currentRuns.map(run => (
                                                <tr key={run.id} className="hover:bg-gray-750 transition-colors">
                                                    <td className="py-3 pl-2 text-gray-400 text-xs">{new Date(run.timestamp).toLocaleDateString()}</td>
                                                    <td className="py-3 font-medium text-white">{run.location}</td>
                                                    <td className="py-3 text-right font-mono text-emerald-400">{run.km.toFixed(2)} km</td>
                                                    <td className="py-3 text-right pr-2"><div className="flex flex-col items-end"><span className="text-xs font-bold text-white">+{run.runEarned} RUN</span>{run.govEarned && <span className="text-[10px] text-cyan-400">+{run.govEarned} GOV</span>}</div></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <Pagination currentPage={runPage} totalPages={Math.ceil(user.runHistory.length / RUNS_PER_PAGE)} onPageChange={setRunPage} />
                              </>
                          )}
                      </div>
                  )}
              </div>
          </div>
      </div>

      {/* ZONE DETAILS MODAL (Displayed when a zone is selected from stats) */}
      {selectedZone && (
          <ZoneStatsModal 
              zone={selectedZone}
              user={user}
              onClose={() => setSelectedZoneDetail(null)}
              ownerDetails={ownerDetails}
              zoneLeaderboard={zoneLeaderboard}
          />
      )}

    </div>
  );
};

export default Profile;