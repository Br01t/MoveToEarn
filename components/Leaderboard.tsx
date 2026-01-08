import React, { useState, useMemo, useEffect } from 'react';
import { User, Zone, Badge, Rarity, LeaderboardConfig, LeaderboardMetric, LevelConfig } from '../types';
import { Trophy, Medal, Map as MapIcon, Crown, Footprints, Clock, Coins, Activity, X, Globe, Search, MapPin, Zap, Rocket, BarChart3, Loader2 } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { renderBadgeIcon } from './leaderboard/LeaderboardIcons';
import PlayerProfileModal from './leaderboard/PlayerProfileModal';
import { supabase } from '../supabaseClient';

interface LeaderboardProps {
  users: Record<string, Omit<User, 'inventory'>>;
  currentUser: User;
  zones: Zone[];
  badges: Badge[];
  leaderboards: LeaderboardConfig[];
  levels?: LevelConfig[];
}

const Leaderboard: React.FC<LeaderboardProps> = ({ users, currentUser, zones, badges, leaderboards, levels }) => {
  const { t } = useLanguage();
  const [activeBoardId, setActiveBoardId] = useState<string>(leaderboards[0]?.id || 'global_km');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // State per i dati aggregati delle zone (visite reali da DB)
  const [zoneRunCounts, setZoneRunCounts] = useState<Record<string, number>>({});
  const [isLoadingCounts, setIsLoadingCounts] = useState(false);

  // Configurazioni classifiche ZONE
  const zoneBoards: LeaderboardConfig[] = [
    {
        id: 'zone_frequency',
        title: t('leader.board.visited.title'),
        description: t('leader.board.visited.desc'),
        metric: 'OWNED_ZONES', // Placeholder
        type: 'PERMANENT'
    },
    {
        id: 'zone_heavy_duty',
        title: t('leader.board.heavy.title'),
        description: t('leader.board.heavy.desc'),
        metric: 'TOTAL_KM',
        type: 'PERMANENT'
    }
  ];

  const isZoneRanking = zoneBoards.some(b => b.id === activeBoardId);
  const allBoards = useMemo(() => [...leaderboards, ...zoneBoards], [leaderboards, zoneBoards]);
  const activeBoard = allBoards.find(b => b.id === activeBoardId) || leaderboards[0];

  // Effetto per recuperare il conteggio reale delle corse per zona da Supabase
  useEffect(() => {
      if (isZoneRanking && Object.keys(zoneRunCounts).length === 0) {
          const fetchCounts = async () => {
              setIsLoadingCounts(true);
              try {
                  const { data: runs, error } = await supabase
                    .from('runs')
                    .select('involved_zones');

                  if (!error && runs) {
                      const counts: Record<string, number> = {};
                      runs.forEach(run => {
                          const zoneIds = Array.isArray(run.involved_zones) 
                            ? run.involved_zones 
                            : JSON.parse(run.involved_zones || '[]');
                          
                          zoneIds.forEach((id: string) => {
                              counts[id] = (counts[id] || 0) + 1;
                          });
                      });
                      setZoneRunCounts(counts);
                  }
              } catch (e) {
                  console.error("Error fetching zone frequencies:", e);
              } finally {
                  setIsLoadingCounts(false);
              }
          };
          fetchCounts();
      }
  }, [isZoneRanking, zoneRunCounts]);

  const handleBoardChange = (id: string) => {
      setActiveBoardId(id);
      setSearchQuery('');
  };

  // --- SCORE CALCULATION LOGIC (GLOBAL) ---
  const getScore = (user: Omit<User, 'inventory'> | User, config: LeaderboardConfig): number => {
      switch(config.metric) {
          case 'TOTAL_KM': 
              return user.totalKm;
          case 'OWNED_ZONES': 
              return zones.filter(z => z.ownerId === user.id).length;
          case 'RUN_BALANCE': 
              return user.runBalance;
          case 'GOV_BALANCE': 
              return user.govBalance;
          case 'UNIQUE_ZONES': 
              return Math.floor(user.totalKm / 5) + 1;
          default: return 0;
      }
  };

  // --- RANKING AGGREGATION ---
  const filteredRankings = useMemo(() => {
      if (isZoneRanking) {
          return zones.map(z => {
              let score = 0;
              if (activeBoardId === 'zone_frequency') {
                  score = zoneRunCounts[z.id] || 0;
              } else {
                  score = z.totalKm || 0;
              }
              return {
                  id: z.id,
                  name: z.name,
                  ownerId: z.ownerId,
                  score: score
              };
          })
          .sort((a, b) => b.score - a.score)
          .map((item, index) => ({ ...item, rank: index + 1 }))
          .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
      } else {
          const allUserList = Object.values(users) as Array<Omit<User, 'inventory'>>;
          const uniqueUsers = new Map<string, Omit<User, 'inventory'> | User>();
          allUserList.forEach(u => uniqueUsers.set(u.id, u));
          uniqueUsers.set(currentUser.id, currentUser);

          return Array.from(uniqueUsers.values()).map((u) => {
             return { 
                 ...u, 
                 score: getScore(u, activeBoard), 
                 badgeId: u.favoriteBadgeId 
             };
          })
          .sort((a, b) => b.score - a.score)
          .map((item, index) => ({ ...item, rank: index + 1 }))
          .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
      }
  }, [isZoneRanking, zones, users, currentUser, activeBoard, activeBoardId, zoneRunCounts, searchQuery]);

  const getMetricLabel = () => {
      if (activeBoardId === 'zone_frequency') return t('leader.metric.sessions');
      if (activeBoardId === 'zone_heavy_duty') return t('leader.metric.total_km');
      switch(activeBoard.metric) {
          case 'TOTAL_KM': return t('leader.metric_km');
          case 'OWNED_ZONES': return t('leader.metric_zones');
          case 'RUN_BALANCE': return t('leader.metric_run');
          case 'GOV_BALANCE': return t('leader.metric_gov');
          case 'UNIQUE_ZONES': return t('leader.metric_unique');
          default: return 'Score';
      }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 pb-20 md:pb-6">
      
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
          
          <div className="w-full lg:w-64 shrink-0 space-y-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
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
                              <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest mt-1">{t('leader.career')}</span>
                          </div>
                          {activeBoardId === board.id && <Crown size={14} className="text-emerald-400" />}
                      </button>
                  ))}

                  <div className="py-4 px-1 hidden lg:block">
                      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <MapPin size={10} className="text-cyan-500/50"/> {t('leader.zones_title')}
                      </h2>
                  </div>

                  {zoneBoards.map(board => (
                      <button
                          key={board.id}
                          onClick={() => handleBoardChange(board.id)}
                          className={`flex items-center justify-between p-3 rounded-xl border transition-all text-left group shrink-0 min-w-[200px] lg:min-w-0 ${
                              activeBoardId === board.id 
                              ? 'glass-panel-active border-cyan-500/50 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]' 
                              : 'glass-panel border-gray-700 hover:border-cyan-500/30 text-gray-400'
                          }`}
                      >
                          <div className="flex flex-col">
                              <span className={`font-bold text-sm ${activeBoardId === board.id ? 'text-cyan-400' : 'text-gray-300 group-hover:text-white'}`}>
                                  {board.title}
                              </span>
                              <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest mt-1">{t('leader.territorial')}</span>
                          </div>
                          {activeBoardId === board.id && <Crown size={14} className="text-emerald-400" />}
                      </button>
                  ))}
              </div>
          </div>

          <div className="flex-1 space-y-6">
              
              <div className="glass-panel rounded-xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                      {isZoneRanking ? <MapIcon size={120} /> : <Trophy size={120} />}
                  </div>
                  <div className="relative z-10">
                      <h1 className="text-3xl font-black text-white uppercase tracking-tight leading-none">{activeBoard.title}</h1>
                      <p className="text-gray-400 mt-2 text-sm max-w-lg">{activeBoard.description}</p>
                  </div>
              </div>

              <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
                  <input 
                      type="text" 
                      placeholder={isZoneRanking ? t('leader.search_sector') : t('dash.search_placeholder')} 
                      className="w-full glass-panel rounded-xl pl-10 pr-10 py-3 text-white focus:border-emerald-500 focus:outline-none transition-colors"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                      <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white">
                          <X size={16} />
                      </button>
                  )}
              </div>

              <div className="glass-panel rounded-xl overflow-hidden shadow-2xl relative">
                {isLoadingCounts && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-20 flex items-center justify-center">
                        <Loader2 className="text-cyan-400 animate-spin" size={32} />
                    </div>
                )}
                
                <table className="w-full text-left border-collapse">
                  <thead className="bg-black/30 text-gray-400 text-[10px] uppercase font-bold tracking-wider">
                    <tr>
                      <th className="px-6 py-3 w-12 text-center">{t('leader.rank')}</th>
                      <th className="px-6 py-3">{isZoneRanking ? t('leader.sector') : t('leader.runner')}</th>
                      <th className="px-6 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                              {isZoneRanking ? <Activity size={14}/> : <BarChart3 size={14}/>}
                              <span>{getMetricLabel()}</span>
                          </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/50">
                    {filteredRankings.map((item) => {
                      const isMe = !isZoneRanking && item.id === currentUser.id;
                      let rankIcon = null;
                      if (item.rank === 1) rankIcon = <Medal className="text-yellow-400 fill-yellow-400/20" size={20} />;
                      else if (item.rank === 2) rankIcon = <Medal className="text-gray-300 fill-gray-300/20" size={20} />;
                      else if (item.rank === 3) rankIcon = <Medal className="text-amber-600 fill-amber-600/20" size={20} />;

                      // Dati specifici per Zone
                      const owner = isZoneRanking ? (item.ownerId ? (users[item.ownerId] || currentUser) : null) : null;
                      const userBadge = !isZoneRanking && (item as any).badgeId ? badges.find(b => b.id === (item as any).badgeId) : null;

                      return (
                        <tr 
                            key={item.id} 
                            onClick={() => !isZoneRanking && setSelectedUserId(item.id)}
                            className={`${isMe ? 'bg-emerald-900/20' : 'hover:bg-white/5'} transition-colors cursor-pointer group`}
                        >
                          <td className="px-6 py-4 font-bold text-white text-center w-12 align-middle">
                            {rankIcon ? rankIcon : <span className="text-sm text-gray-500 font-mono">#{item.rank}</span>}
                          </td>
                          
                          <td className="px-6 py-3 align-middle">
                            <div className="flex items-center gap-4">
                              <div className="relative shrink-0">
                                  <img 
                                    src={isZoneRanking ? (owner?.avatar || `https://ui-avatars.com/api/?name=${item.name}&background=1e293b&color=fff`) : (item as any).avatar} 
                                    alt={item.name} 
                                    className={`w-12 h-12 rounded-full bg-gray-600 object-cover ring-2 ring-gray-700 group-hover:border-${isZoneRanking ? 'cyan' : 'emerald'}-500 transition-colors`} 
                                  />
                                  {isZoneRanking && item.ownerId && <Crown size={12} className="absolute -top-1 -right-1 text-yellow-500 fill-yellow-500 bg-gray-900 rounded-full" />}
                              </div>
                              
                              <div className="flex flex-col min-w-0">
                                  <div className="flex items-center gap-2">
                                      <span className={`font-bold text-base md:text-lg truncate ${isMe ? 'text-emerald-400' : 'text-white group-hover:text-cyan-300 transition-colors'}`}>
                                        {item.name}
                                      </span>
                                      {isMe && <span className="text-[9px] bg-emerald-900/50 text-emerald-400 px-1 rounded font-mono border border-emerald-500/30">{t('leader.you')}</span>}
                                  </div>
                                  
                                  {isZoneRanking ? (
                                      <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                                          {t('leader.controller')}: <span className="text-gray-300">{owner?.name || t('leader.unclaimed')}</span>
                                      </span>
                                  ) : (
                                      userBadge && (
                                           <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border w-fit mt-1 max-w-full ${
                                               userBadge.rarity === 'LEGENDARY' ? 'text-yellow-400 bg-yellow-900/30 border-yellow-500/50' : 
                                               userBadge.rarity === 'EPIC' ? 'text-purple-400 bg-purple-900/30 border-purple-500/50' : 
                                               'text-cyan-400 bg-cyan-900/30 border-cyan-500/50'
                                           }`}>
                                               {renderBadgeIcon(userBadge.icon, "w-3 h-3 shrink-0")}
                                               <span className="text-[10px] font-bold uppercase tracking-wide truncate">{userBadge.name}</span>
                                           </div>
                                      )
                                  )}
                              </div>
                            </div>
                          </td>
                          
                          <td className="px-6 py-3 text-right align-middle">
                            <span className={`font-mono text-xl font-bold ${isZoneRanking ? 'text-cyan-400' : 'text-emerald-400'}`}>
                                {item.score.toLocaleString(undefined, { minimumFractionDigits: activeBoardId === 'zone_frequency' ? 0 : 1 })}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredRankings.length === 0 && (
                        <tr>
                            <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                                No results found for "{searchQuery}"
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