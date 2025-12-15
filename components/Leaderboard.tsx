
import React, { useState } from 'react';
import { User, Zone, Badge, Rarity, LeaderboardConfig, LeaderboardMetric, LevelConfig } from '../types';
import { Trophy, Medal, Map as MapIcon, Crown, Footprints, Clock, Coins, Activity, X, Globe, Search } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { renderBadgeIcon } from './leaderboard/LeaderboardIcons';
import PlayerProfileModal from './leaderboard/PlayerProfileModal';

interface LeaderboardProps {
  users: Record<string, Omit<User, 'inventory'>>;
  currentUser: User;
  zones: Zone[];
  badges: Badge[];
  leaderboards: LeaderboardConfig[];
  levels?: LevelConfig[]; // Optional dynamic levels
}

const Leaderboard: React.FC<LeaderboardProps> = ({ users, currentUser, zones, badges, leaderboards, levels }) => {
  const { t } = useLanguage();
  const [activeBoardId, setActiveBoardId] = useState<string>(leaderboards[0]?.id || 'global_km');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const activeBoard = leaderboards.find(b => b.id === activeBoardId) || leaderboards[0];

  const handleBoardChange = (id: string) => {
      setActiveBoardId(id);
      setSearchQuery('');
  };

  // --- SCORE CALCULATION LOGIC ---
  const getScore = (user: Omit<User, 'inventory'> | User, config: LeaderboardConfig): number => {
      // Metric logic now applies generally to all users based on available profile data
      
      switch(config.metric) {
          case 'TOTAL_KM': 
              // Prioritize runHistory calculation if available (usually for currentUser) to ensure consistency
              if ('runHistory' in user && user.runHistory && user.runHistory.length > 0) {
                  return user.runHistory.reduce((acc, r) => acc + Number(r.km), 0);
              }
              // Fallback to totalKm property (calculated in hook or stored in DB)
              return user.totalKm;
              
          case 'OWNED_ZONES': 
              return zones.filter(z => z.ownerId === user.id).length;
              
          case 'RUN_BALANCE': 
              return user.runBalance;
              
          case 'GOV_BALANCE': 
              return user.govBalance;
              
          case 'UNIQUE_ZONES': 
              if ('runHistory' in user && user.runHistory) {
                  return new Set(user.runHistory.map(r => r.location)).size;
              }
              return Math.floor(user.totalKm / 5) + 1; // Fallback estimate
              
          default: return 0;
      }
  };

  const getMetricIcon = (metric: LeaderboardMetric) => {
      switch(metric) {
          case 'TOTAL_KM': return <Footprints size={16} />;
          case 'OWNED_ZONES': return <MapIcon size={16} />;
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

  if (!activeBoard) {
      return (
          <div className="max-w-7xl mx-auto p-4 md:p-6 text-center text-gray-500 min-h-[400px] flex flex-col items-center justify-center glass-panel rounded-xl">
              <Trophy size={64} className="mx-auto mb-4 opacity-20" />
              <h2 className="text-2xl font-bold text-white mb-2">No active leaderboards</h2>
              <p>Check back later for global rankings.</p>
          </div>
      );
  }

  // Combine current user (full data) with all other users (profile data)
  const allUserList = Object.values(users) as Array<Omit<User, 'inventory'>>;
  const uniqueUsers = new Map<string, Omit<User, 'inventory'> | User>();
  
  allUserList.forEach(u => uniqueUsers.set(u.id, u));
  uniqueUsers.set(currentUser.id, currentUser);

  // 1. Calculate All Scores & Sort (The "Truth")
  const allRankings = Array.from(uniqueUsers.values()).map((u) => {
     return { 
         ...u, 
         score: getScore(u, activeBoard), 
         badgeId: u.favoriteBadgeId 
     };
  }).sort((a, b) => b.score - a.score);

  // 2. Map to add 'rank' property, THEN filter by search query
  const displayedRankings = allRankings.map((u, index) => ({
      ...u,
      rank: index + 1
  })).filter(u => 
      u.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const now = Date.now();
  const endTime = activeBoard.endTime || 0;
  const timeLeft = Math.max(0, endTime - now);
  const daysLeft = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hasEnded = activeBoard.type === 'TEMPORARY' && timeLeft <= 0;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 pb-20 md:pb-6">
      
      {/* Player Profile Modal */}
      {selectedUserId && (
          <PlayerProfileModal 
              userId={selectedUserId}
              allUsers={users}
              currentUser={currentUser}
              zones={zones}
              badges={badges}
              onClose={() => setSelectedUserId(null)}
              t={t}
              levels={levels}
          />
      )}

      <div className="flex flex-col lg:flex-row gap-6">
          
          {/* SIDEBAR: Board Selector */}
          <div className="w-full lg:w-64 shrink-0 space-y-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-4">
                  <Trophy className="text-yellow-400" /> {t('leader.title')}
              </h2>
              
              <div className="flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                  {leaderboards.map(board => (
                      <button
                          key={board.id}
                          onClick={() => handleBoardChange(board.id)}
                          className={`flex items-center justify-between p-3 rounded-xl border transition-all text-left group shrink-0 min-w-[200px] lg:min-w-0 ${
                              activeBoardId === board.id 
                              ? 'glass-panel-active text-emerald-400' 
                              : 'glass-panel border-gray-700 hover:border-gray-500 text-gray-400'
                          }`}
                      >
                          <div className="flex flex-col">
                              <span className={`font-bold text-sm ${activeBoardId === board.id ? 'text-emerald-400' : 'text-gray-300 group-hover:text-white'}`}>
                                  {board.title}
                              </span>
                              <div className="flex items-center gap-1 mt-1">
                                  <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${board.type === 'PERMANENT' ? 'bg-gray-800 text-gray-500' : 'bg-purple-900/50 text-purple-400 border border-purple-500/30'}`}>
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
              <div className="glass-panel rounded-xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                      {activeBoard.type === 'TEMPORARY' ? <Clock size={120} /> : <Trophy size={120} />}
                  </div>
                  
                  <div className="relative z-10">
                      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4">
                          <div>
                              <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight leading-none">{activeBoard.title}</h1>
                              <p className="text-gray-400 mt-2 text-sm max-w-lg">{activeBoard.description}</p>
                          </div>
                          {activeBoard.type === 'TEMPORARY' && (
                              <div className="text-left md:text-right bg-black/20 p-3 rounded-lg md:bg-transparent md:p-0">
                                  {hasEnded ? (
                                      <div className="text-xs font-bold text-red-400 uppercase tracking-wider mb-1">Event Ended</div>
                                  ) : (
                                      <div className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-1">{t('leader.ends_in')}</div>
                                  )}
                                  <div className={`text-xl font-mono font-bold ${hasEnded ? 'text-gray-500' : 'text-white'}`}>
                                      {hasEnded ? 'CLOSED' : `${daysLeft} Days`}
                                  </div>
                              </div>
                          )}
                      </div>

                      {activeBoard.rewardPool && (
                          <div className="mt-4 inline-flex items-center gap-2 bg-yellow-900/20 border border-yellow-500/30 px-3 py-1.5 rounded-lg">
                              <Coins size={14} className="text-yellow-400" />
                              <span className="text-[10px] text-yellow-200 font-bold uppercase tracking-wider">{t('leader.pool')}:</span>
                              <span className="text-sm font-mono font-bold text-yellow-400">{activeBoard.rewardPool.toLocaleString()} {activeBoard.rewardCurrency || 'GOV'}</span>
                          </div>
                      )}
                  </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
                  <input 
                      type="text" 
                      placeholder="Search runner..." 
                      className="w-full glass-panel rounded-xl pl-10 pr-10 py-3 text-white focus:border-emerald-500 focus:outline-none transition-colors"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                      <button 
                          onClick={() => setSearchQuery('')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white"
                      >
                          <X size={16} />
                      </button>
                  )}
              </div>

              {/* Table */}
              <div className="glass-panel rounded-xl overflow-hidden shadow-2xl">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-black/30 text-gray-400 text-[10px] uppercase font-bold tracking-wider">
                    <tr>
                      <th className="px-3 py-3 w-12 text-center md:px-6">{t('leader.rank')}</th>
                      <th className="px-3 py-3 md:px-6">{t('leader.runner')}</th>
                      <th className="px-3 py-3 text-right md:px-6">
                          <div className="flex items-center justify-end gap-1 md:gap-2">
                              {getMetricIcon(activeBoard.metric)}
                              <span className="hidden md:inline">{getMetricLabel(activeBoard.metric)}</span>
                          </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/50">
                    {displayedRankings.map((user) => {
                      const isMe = user.id === currentUser.id;
                      let rankIcon = null;
                      if (user.rank === 1) rankIcon = <Medal className="text-yellow-400 fill-yellow-400/20" size={20} />;
                      else if (user.rank === 2) rankIcon = <Medal className="text-gray-300 fill-gray-300/20" size={20} />;
                      else if (user.rank === 3) rankIcon = <Medal className="text-amber-600 fill-amber-600/20" size={20} />;

                      const userBadge = user.badgeId ? badges.find(b => b.id === user.badgeId) : null;

                      return (
                        <tr 
                            key={user.id} 
                            onClick={() => setSelectedUserId(user.id)}
                            className={`${isMe ? 'bg-emerald-900/20' : 'hover:bg-white/5'} transition-colors cursor-pointer group`}
                        >
                          <td className="px-2 md:px-6 py-4 font-bold text-white text-center w-12 align-middle">
                            <div className="flex flex-col items-center justify-center">
                              {rankIcon ? rankIcon : <span className="text-sm text-gray-500 font-mono">#{user.rank}</span>}
                            </div>
                          </td>
                          
                          <td className="px-2 md:px-6 py-3 align-middle">
                            <div className="flex items-center gap-3 md:gap-4">
                              {/* Avatar */}
                              <div className="relative shrink-0">
                                  <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full bg-gray-600 object-cover ring-2 ring-gray-700 group-hover:border-emerald-500 transition-colors" />
                                  {user.rank === 1 && <Crown size={14} className="absolute -top-1.5 -right-1 text-yellow-500 fill-yellow-500 animate-pulse bg-gray-900 rounded-full" />}
                              </div>
                              
                              {/* Name & Badge Stack */}
                              <div className="flex flex-col min-w-0">
                                  <div className="flex items-center gap-2">
                                      <span className={`font-bold text-sm md:text-lg truncate ${isMe ? 'text-emerald-400' : 'text-white group-hover:text-emerald-300 transition-colors'}`}>
                                        {user.name}
                                      </span>
                                      {isMe && <span className="text-[9px] bg-emerald-900/50 text-emerald-400 px-1 rounded font-mono hidden md:inline border border-emerald-500/30">YOU</span>}
                                  </div>
                                  
                                  {/* Badge - Always Visible, Stacked */}
                                  {userBadge && (
                                       <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border w-fit mt-1 max-w-full ${getRarityColor(userBadge.rarity)}`} title={userBadge.name}>
                                           {renderBadgeIcon(userBadge.icon, "w-3 h-3 shrink-0")}
                                           <span className="text-[10px] font-bold uppercase tracking-wide truncate">{userBadge.name}</span>
                                       </div>
                                  )}
                              </div>
                            </div>
                          </td>
                          
                          <td className="px-3 md:px-6 py-3 text-right align-middle">
                            <span className="font-mono text-base md:text-xl font-bold text-cyan-400">
                                {user.score.toLocaleString(undefined, { minimumFractionDigits: activeBoard.metric.includes('BALANCE') || activeBoard.metric === 'TOTAL_KM' ? 1 : 0 })}
                            </span>
                            <div className="text-[9px] text-gray-500 uppercase md:hidden">{getMetricLabel(activeBoard.metric)}</div>
                          </td>
                        </tr>
                      );
                    })}
                    {displayedRankings.length === 0 && (
                        <tr>
                            <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                                No runners found matching "{searchQuery}"
                            </td>
                        </tr>
                    )}
                  </tbody>
                </table>
              </div>
          </div>
      </div>
    </div>
  );
};

export default Leaderboard;