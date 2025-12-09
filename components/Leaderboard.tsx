
import React, { useState } from 'react';
import { User, Zone, Badge, Rarity, LeaderboardConfig, LeaderboardMetric, LevelConfig } from '../types';
import { Trophy, Medal, Map, Award, Flag, Crown, Zap, Mountain, Globe, Home, Landmark, Swords, Footprints, Rocket, Tent, Timer, Building2, Moon, Sun, ShieldCheck, Gem, Users, Clock, Coins, Activity, X } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

interface MockUser {
  id: string;
  name: string;
  totalKm: number;
  avatar: string;
  favoriteBadgeId?: string;
  // Added balances
  runBalance?: number;
  govBalance?: number;
}

interface LeaderboardProps {
  users: Record<string, MockUser>;
  currentUser: User;
  zones: Zone[];
  badges: Badge[];
  leaderboards: LeaderboardConfig[];
  levels?: LevelConfig[]; // Optional dynamic levels
}

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

// Sub-component for Player Profile Modal
const PlayerProfileModal = ({ 
    userId, 
    allUsers, 
    currentUser, 
    zones, 
    badges, 
    onClose,
    t,
    levels
}: { 
    userId: string, 
    allUsers: Record<string, MockUser>, 
    currentUser: User, 
    zones: Zone[], 
    badges: Badge[], 
    onClose: () => void,
    t: (key: string) => string,
    levels: LevelConfig[] | undefined
}) => {
    
    // Determine if it's the current user or a mock user
    let user: MockUser | User;
    if (userId === currentUser.id) {
        user = currentUser;
    } else {
        user = allUsers[userId];
    }

    if (!user) return null;

    // Calculate derived stats for the profile view
    const ownedZones = zones.filter(z => z.ownerId === userId).length;
    const favoriteBadge = user.favoriteBadgeId ? badges.find(b => b.id === user.favoriteBadgeId) : null;
    
    // Dynamic Level Calculation
    let currentLevel = 1;
    let nextLevelKm = 50; 
    let progressToNextLevel = 0;

    if (levels && levels.length > 0) {
        const currentLevelConfig = levels.slice().reverse().find(l => user.totalKm >= l.minKm) || levels[0];
        currentLevel = currentLevelConfig.level;
        
        const nextLevelConfig = levels.find(l => l.level === currentLevel + 1);
        
        if (nextLevelConfig) {
            nextLevelKm = nextLevelConfig.minKm;
            const currentLevelMin = currentLevelConfig.minKm;
            const range = nextLevelConfig.minKm - currentLevelMin;
            const progress = user.totalKm - currentLevelMin;
            progressToNextLevel = Math.min(100, Math.max(0, (progress / range) * 100));
        } else {
            nextLevelKm = user.totalKm;
            progressToNextLevel = 100;
        }
    } else {
        // Fallback hardcoded logic
        currentLevel = Math.floor(user.totalKm / 50) + 1;
        nextLevelKm = currentLevel * 50;
        progressToNextLevel = ((user.totalKm - ((currentLevel - 1) * 50)) / 50) * 100;
    }

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
            <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-sm shadow-2xl relative overflow-hidden animate-slide-up">
                
                {/* Header Banner */}
                <div className="h-24 bg-gradient-to-r from-gray-800 to-gray-900 relative">
                    <button onClick={onClose} className="absolute top-4 right-4 text-white hover:text-red-400 z-10 bg-black/20 rounded-full p-1"><X size={20}/></button>
                </div>

                <div className="px-6 pb-6 relative z-10 -mt-12 text-center">
                    {/* Avatar */}
                    <div className="relative inline-block mb-3">
                        <img src={user.avatar} alt={user.name} className="w-24 h-24 rounded-2xl border-4 border-gray-900 bg-gray-800 object-cover shadow-xl" />
                        <div className="absolute -bottom-2 -right-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-1 rounded-md border border-gray-900 shadow-lg">
                            LVL {currentLevel}
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-1 flex items-center justify-center gap-2">
                        {user.name}
                        {userId === currentUser.id && <span className="text-xs bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30 font-mono">YOU</span>}
                    </h2>
                    <p className="text-gray-500 text-xs uppercase font-bold tracking-widest mb-6">Runner Profile</p>

                    {/* Stats Grid 2x2 */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="bg-gray-800 p-3 rounded-xl border border-gray-700">
                            <div className="text-[10px] text-gray-400 uppercase font-bold mb-1">{t('leader.profile.total_km')}</div>
                            <div className="text-xl font-mono font-bold text-white">{user.totalKm.toLocaleString()} KM</div>
                        </div>
                        <div className="bg-gray-800 p-3 rounded-xl border border-gray-700">
                            <div className="text-[10px] text-gray-400 uppercase font-bold mb-1">{t('leader.profile.owned_zones')}</div>
                            <div className="text-xl font-mono font-bold text-emerald-400">{ownedZones}</div>
                        </div>
                        
                        {/* New Balances */}
                        <div className="bg-gray-800 p-3 rounded-xl border border-gray-700">
                            <div className="text-[10px] text-gray-400 uppercase font-bold mb-1 flex items-center justify-center gap-1"><Activity size={10} /> RUN</div>
                            <div className="text-xl font-mono font-bold text-emerald-400">{(user as any).runBalance?.toFixed(0) ?? 0}</div>
                        </div>
                        <div className="bg-gray-800 p-3 rounded-xl border border-gray-700">
                            <div className="text-[10px] text-gray-400 uppercase font-bold mb-1 flex items-center justify-center gap-1"><Crown size={10} /> GOV</div>
                            <div className="text-xl font-mono font-bold text-cyan-400">{(user as any).govBalance?.toFixed(0) ?? 0}</div>
                        </div>
                    </div>

                    {/* Favorite Badge */}
                    {favoriteBadge ? (
                        <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 flex items-center gap-4 text-left">
                            <div className={`p-3 rounded-full border bg-gray-900 ${getRarityColor(favoriteBadge.rarity)}`}>
                                {renderBadgeIcon(favoriteBadge.icon, "w-6 h-6")}
                            </div>
                            <div>
                                <div className="text-[10px] text-gray-500 uppercase font-bold">{t('leader.profile.fav_badge')}</div>
                                <div className="font-bold text-white text-sm">{favoriteBadge.name}</div>
                                <div className="text-[10px] text-gray-400">{favoriteBadge.rarity}</div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 rounded-xl border border-gray-700 border-dashed text-gray-500 text-xs italic">
                            No badge equipped
                        </div>
                    )}

                    {/* Level Progress */}
                    <div className="mt-6">
                        <div className="flex justify-between text-[10px] uppercase font-bold text-gray-500 mb-1">
                            <span>{t('leader.profile.level')} {currentLevel}</span>
                            <span>{Math.floor(progressToNextLevel)}%</span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${progressToNextLevel}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Leaderboard: React.FC<LeaderboardProps> = ({ users, currentUser, zones, badges, leaderboards, levels }) => {
  const { t } = useLanguage();
  const [activeBoardId, setActiveBoardId] = useState<string>(leaderboards[0]?.id || 'global_km');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const activeBoard = leaderboards.find(b => b.id === activeBoardId) || leaderboards[0];

  // --- SCORE CALCULATION LOGIC ---
  const getScore = (user: MockUser | User, config: LeaderboardConfig, isCurrentUser: boolean): number => {
      // Determine the effective start time filter
      const timeFilter = config.lastResetTimestamp || config.startTime || 0;
      const endTimeFilter = config.endTime || Infinity;

      // 1. Current User: Use real data
      if (isCurrentUser) {
          const u = user as User;
          const validRuns = u.runHistory.filter(r => r.timestamp >= timeFilter && r.timestamp <= endTimeFilter);

          switch(config.metric) {
              case 'TOTAL_KM': return validRuns.reduce((acc, r) => acc + r.km, 0);
              case 'UNIQUE_ZONES': return new Set(validRuns.map(r => r.location)).size;
              case 'OWNED_ZONES': return zones.filter(z => z.ownerId === u.id).length;
              case 'RUN_BALANCE': return u.runBalance;
              case 'GOV_BALANCE': return u.govBalance;
              default: return 0;
          }
      }
      
      // 2. Mock User
      const u = user as MockUser;
      const seed = u.name.length; 
      const isTemporary = config.type === 'TEMPORARY' || !!config.lastResetTimestamp;
      const activityRatio = isTemporary ? 0.2 : 1.0; 

      switch(config.metric) {
          case 'TOTAL_KM': return u.totalKm * activityRatio;
          case 'OWNED_ZONES': return zones.filter(z => z.ownerId === u.id).length; 
          // Use provided balances or fallback to simulation
          case 'RUN_BALANCE': return u.runBalance ?? ((u.totalKm * 10) + (seed * 50)); 
          case 'GOV_BALANCE': return u.govBalance ?? ((u.totalKm / 10) + (seed * 2)); 
          case 'UNIQUE_ZONES': return Math.floor((u.totalKm * activityRatio) / 5) + 1;
          default: return 0;
      }
  };

  const rankings = Object.values(users).map((u: MockUser) => {
     if (u.id === currentUser.id) {
        return { ...u, score: getScore(currentUser, activeBoard, true), badgeId: currentUser.favoriteBadgeId };
     }
     return { ...u, score: getScore(u, activeBoard, false), badgeId: u.favoriteBadgeId };
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
                        <tr 
                            key={user.id} 
                            onClick={() => setSelectedUserId(user.id)}
                            className={`${isMe ? 'bg-emerald-900/20' : 'hover:bg-gray-750'} transition-colors cursor-pointer group`}
                        >
                          <td className="px-4 md:px-6 py-4 font-bold text-white">
                            <div className="flex items-center gap-3">
                              <span className="w-6 text-lg text-center">{index + 1}</span>
                              {rankIcon}
                            </div>
                          </td>
                          <td className="px-4 md:px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="relative">
                                  <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full bg-gray-600 object-cover ring-2 ring-gray-700 group-hover:border-emerald-500 transition-colors" />
                                  {index === 0 && <Crown size={14} className="absolute -top-2 -right-1 text-yellow-500 fill-yellow-500 animate-pulse" />}
                              </div>
                              <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
                                  <span className={`font-bold text-lg ${isMe ? 'text-emerald-400' : 'text-white group-hover:text-emerald-300 transition-colors'}`}>
                                    {user.name} {isMe && t('leader.you')}
                                  </span>
                                  {userBadge && (
                                       <div className={`hidden md:flex items-center gap-1.5 px-2 py-1 rounded-md border ${getRarityColor(userBadge.rarity)}`} title={userBadge.name}>
                                           {renderBadgeIcon(userBadge.icon, "w-3 h-3")}
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