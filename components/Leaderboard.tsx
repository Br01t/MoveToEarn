import React, { useState } from 'react';
import { User, Zone, Badge, Rarity, LeaderboardConfig, LeaderboardMetric } from '../types';
import { Trophy, Medal, Map, Award, Flag, Crown, Zap, Mountain, Globe, Home, Landmark, Swords, Footprints, Rocket, Tent, Timer, Building2, Moon, Sun, ShieldCheck, Gem, Users, Clock, Coins, Activity } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

interface MockUser {
  id: string;
  name: string;
  totalKm: number;
  avatar: string;
  favoriteBadgeId?: string;
}

interface LeaderboardProps {
  users: Record<string, MockUser>;
  currentUser: User;
  zones: Zone[];
  badges: Badge[];
  leaderboards: LeaderboardConfig[];
}

const Leaderboard: React.FC<LeaderboardProps> = ({ users, currentUser, zones, badges, leaderboards }) => {
  const { t } = useLanguage();
  const [activeBoardId, setActiveBoardId] = useState<string>(leaderboards[0]?.id || 'global_km');

  const activeBoard = leaderboards.find(b => b.id === activeBoardId) || leaderboards[0];

  // --- SCORE CALCULATION LOGIC ---
  const getScore = (user: MockUser | User, config: LeaderboardConfig, isCurrentUser: boolean): number => {
      // Determine the effective start time filter
      // Priority: lastResetTimestamp -> startTime -> 0 (all time)
      const timeFilter = config.lastResetTimestamp || config.startTime || 0;
      const endTimeFilter = config.endTime || Infinity;

      // 1. Current User: Use real data
      if (isCurrentUser) {
          const u = user as User;
          
          // Filter runs based on leaderboard time constraints
          const validRuns = u.runHistory.filter(r => r.timestamp >= timeFilter && r.timestamp <= endTimeFilter);

          switch(config.metric) {
              case 'TOTAL_KM': 
                  return validRuns.reduce((acc, r) => acc + r.km, 0);
              case 'UNIQUE_ZONES': 
                  return new Set(validRuns.map(r => r.location)).size;
              // For snapshot metrics (Balance, Owned Zones), we use current state as fallback
              // since we don't have historical snapshots in this version.
              case 'OWNED_ZONES': return zones.filter(z => z.ownerId === u.id).length;
              case 'RUN_BALANCE': return u.runBalance;
              case 'GOV_BALANCE': return u.govBalance;
              default: return 0;
          }
      }
      
      // 2. Mock User: Simulate data based on their totalKm to keep relative strength consistent
      const u = user as MockUser;
      const seed = u.name.length; 
      
      // Simulate "recent" activity ratio for time-based boards (approx 20% of all-time stats for temp boards)
      const isTemporary = config.type === 'TEMPORARY' || !!config.lastResetTimestamp;
      const activityRatio = isTemporary ? 0.2 : 1.0; 

      switch(config.metric) {
          case 'TOTAL_KM': return u.totalKm * activityRatio;
          case 'OWNED_ZONES': return zones.filter(z => z.ownerId === u.id).length; 
          case 'RUN_BALANCE': return (u.totalKm * 10) + (seed * 50); 
          case 'GOV_BALANCE': return (u.totalKm / 10) + (seed * 2); 
          case 'UNIQUE_ZONES': return Math.floor((u.totalKm * activityRatio) / 5) + 1;
          default: return 0;
      }
  };

  // Compute rankings for active board
  const rankings = Object.values(users).map((u: MockUser) => {
     // Current User
     if (u.id === currentUser.id) {
        return {
           ...u,
           score: getScore(currentUser, activeBoard, true),
           badgeId: currentUser.favoriteBadgeId
        };
     }
     // Mock User
     return {
        ...u,
        score: getScore(u, activeBoard, false),
        badgeId: u.favoriteBadgeId
     };
  }).sort((a, b) => b.score - a.score);

  const getMetricIcon = (metric: LeaderboardMetric) => {
      switch(metric) {
          case 'TOTAL_KM': return <Footprints size={16} />;
          case 'OWNED_ZONES': return <Map size={16} />;
          case 'RUN_BALANCE': return <Activity size={16} />;
          case 'GOV_BALANCE': return <Crown size={16} />;
          case 'UNIQUE_ZONES': return <Globe size={16} />;
      }
  };

  const getMetricLabel = (metric: LeaderboardMetric) => {
      switch(metric) {
          case 'TOTAL_KM': return t('leader.metric_km');
          case 'OWNED_ZONES': return t('leader.metric_zones');
          case 'RUN_BALANCE': return t('leader.metric_run');
          case 'GOV_BALANCE': return t('leader.metric_gov');
          case 'UNIQUE_ZONES': return t('leader.metric_unique');
      }
  };

  const getRarityColor = (rarity: Rarity) => {
      switch(rarity) {
          case 'LEGENDARY': return 'text-yellow-400 bg-yellow-900/30 border-yellow-500/50';
          case 'EPIC': return 'text-purple-400 bg-purple-900/30 border-purple-500/50';
          case 'RARE': return 'text-cyan-400 bg-cyan-900/30 border-cyan-500/50';
          default: return 'text-gray-400 bg-gray-800 border-gray-600';
      }
  };

  const timeLeft = activeBoard.endTime ? Math.max(0, activeBoard.endTime - Date.now()) : 0;
  const daysLeft = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hasEnded = activeBoard.type === 'TEMPORARY' && timeLeft <= 0;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      <div className="flex flex-col lg:flex-row gap-6">
          
          {/* SIDEBAR: Board Selector */}
          <div className="w-full lg:w-64 shrink-0 space-y-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-4">
                  <Trophy className="text-yellow-400" /> {t('leader.title')}
              </h2>
              
              <div className="flex flex-col gap-2">
                  {leaderboards.map(board => (
                      <button
                          key={board.id}
                          onClick={() => setActiveBoardId(board.id)}
                          className={`flex items-center justify-between p-3 rounded-xl border transition-all text-left group ${
                              activeBoardId === board.id 
                              ? 'bg-emerald-900/20 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                              : 'bg-gray-800 border-gray-700 hover:border-gray-500'
                          }`}
                      >
                          <div className="flex flex-col">
                              <span className={`font-bold text-sm ${activeBoardId === board.id ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>
                                  {board.title}
                              </span>
                              <div className="flex items-center gap-1 mt-1">
                                  <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${board.type === 'PERMANENT' ? 'bg-gray-700 text-gray-400' : 'bg-purple-900/50 text-purple-400 border border-purple-500/30'}`}>
                                      {board.type === 'PERMANENT' ? t('leader.perm_tag') : t('leader.temp_tag')}
                                  </span>
                              </div>
                          </div>
                          {activeBoardId === board.id && <Crown size={16} className="text-emerald-400" />}
                      </button>
                  ))}
              </div>
          </div>

          {/* MAIN CONTENT: Ranking Table */}
          <div className="flex-1 space-y-6">
              
              {/* Header Card */}
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                      {activeBoard.type === 'TEMPORARY' ? <Clock size={120} /> : <Trophy size={120} />}
                  </div>
                  
                  <div className="relative z-10">
                      <div className="flex justify-between items-start">
                          <div>
                              <h1 className="text-3xl font-black text-white uppercase tracking-tight">{activeBoard.title}</h1>
                              <p className="text-gray-400 mt-1 max-w-lg">{activeBoard.description}</p>
                          </div>
                          {activeBoard.type === 'TEMPORARY' && (
                              <div className="text-right">
                                  {hasEnded ? (
                                      <div className="text-xs font-bold text-red-400 uppercase tracking-wider mb-1">Event Ended</div>
                                  ) : (
                                      <div className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-1">{t('leader.ends_in')}</div>
                                  )}
                                  <div className={`text-2xl font-mono font-bold ${hasEnded ? 'text-gray-500' : 'text-white'}`}>
                                      {hasEnded ? 'CLOSED' : `${daysLeft} Days`}
                                  </div>
                              </div>
                          )}
                      </div>

                      {activeBoard.rewardPool && (
                          <div className="mt-4 inline-flex items-center gap-2 bg-yellow-900/20 border border-yellow-500/30 px-4 py-2 rounded-lg">
                              <Coins size={16} className="text-yellow-400" />
                              <span className="text-xs text-yellow-200 font-bold uppercase tracking-wider">{t('leader.pool')}:</span>
                              <span className="text-lg font-mono font-bold text-yellow-400">{activeBoard.rewardPool.toLocaleString()} {activeBoard.rewardCurrency || 'GOV'}</span>
                          </div>
                      )}
                  </div>
              </div>

              {/* Table */}
              <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-2xl">
                <table className="w-full text-left">
                  <thead className="bg-gray-900 text-gray-400 text-xs uppercase font-bold">
                    <tr>
                      <th className="px-4 md:px-6 py-4 w-20">{t('leader.rank')}</th>
                      <th className="px-4 md:px-6 py-4">{t('leader.runner')}</th>
                      <th className="px-4 md:px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                              {getMetricIcon(activeBoard.metric)}
                              {getMetricLabel(activeBoard.metric)}
                          </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {rankings.map((user, index) => {
                      const isMe = user.id === currentUser.id;
                      let rankIcon = null;
                      if (index === 0) rankIcon = <Medal className="text-yellow-400" size={24} />;
                      else if (index === 1) rankIcon = <Medal className="text-gray-300" size={24} />;
                      else if (index === 2) rankIcon = <Medal className="text-amber-600" size={24} />;

                      const userBadge = user.badgeId ? badges.find(b => b.id === user.badgeId) : null;

                      return (
                        <tr key={user.id} className={`${isMe ? 'bg-emerald-900/20' : 'hover:bg-gray-750'} transition-colors`}>
                          <td className="px-4 md:px-6 py-4 font-bold text-white">
                            <div className="flex items-center gap-3">
                              <span className="w-6 text-lg text-center">{index + 1}</span>
                              {rankIcon}
                            </div>
                          </td>
                          <td className="px-4 md:px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="relative">
                                  <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full bg-gray-600 object-cover ring-2 ring-gray-700" />
                                  {index === 0 && <Crown size={14} className="absolute -top-2 -right-1 text-yellow-500 fill-yellow-500 animate-pulse" />}
                              </div>
                              
                              <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
                                  <span className={`font-bold text-lg ${isMe ? 'text-emerald-400' : 'text-white'}`}>
                                    {user.name} {isMe && t('leader.you')}
                                  </span>
                                  
                                  {userBadge && (
                                       <div className={`hidden md:flex items-center gap-1.5 px-2 py-1 rounded-md border ${getRarityColor(userBadge.rarity)}`} title={userBadge.name}>
                                           {userBadge.icon === 'Award' ? <Award className="w-3 h-3"/> : <Flag className="w-3 h-3"/>}
                                           <span className="text-[10px] font-bold uppercase tracking-wide">{userBadge.name}</span>
                                       </div>
                                  )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 md:px-6 py-4 text-right">
                            <span className="font-mono text-xl font-bold text-cyan-400">
                                {user.score.toLocaleString(undefined, { minimumFractionDigits: activeBoard.metric.includes('BALANCE') || activeBoard.metric === 'TOTAL_KM' ? 1 : 0 })}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
          </div>
      </div>
    </div>
  );
};

export default Leaderboard;