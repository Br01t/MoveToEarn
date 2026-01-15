import React, { useState, useMemo, useEffect, useRef } from 'react';
import { User, Zone, Badge, Rarity, LeaderboardConfig, LeaderboardMetric, LevelConfig } from '../types';
import { Trophy, Medal, Map as MapIcon, Crown, Activity, X, Search, MapPin, Zap, Rocket, BarChart3, Loader2, Target, Globe, Filter, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { renderBadgeIcon } from './leaderboard/LeaderboardIcons';
import PlayerProfileModal from './leaderboard/PlayerProfileModal';
import { supabase } from '../supabaseClient';
import Pagination from './Pagination';

interface LeaderboardProps {
  users: Record<string, Omit<User, 'inventory'>>;
  currentUser: User;
  zones: Zone[];
  badges: Badge[];
  leaderboards: LeaderboardConfig[];
  levels?: LevelConfig[];
}

const ITEMS_PER_PAGE = 10;

const Leaderboard: React.FC<LeaderboardProps> = ({ users, currentUser, zones, badges, leaderboards, levels }) => {
  const { t } = useLanguage();
  const [activeBoardId, setActiveBoardId] = useState<string>(leaderboards[0]?.id || 'global_km');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileCategory, setMobileCategory] = useState<'USER' | 'ZONE'>('USER');
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  
  const [filterCountries, setFilterCountries] = useState<string[]>([]);
  const [filterCities, setFilterCities] = useState<string[]>([]);
  const [isGeoPanelOpen, setIsGeoPanelOpen] = useState(false);
  
  const [zoneRunCounts, setZoneRunCounts] = useState<Record<string, number>>({});
  const [userRunCounts, setUserRunCounts] = useState<Record<string, number>>({});
  const [isLoadingCounts, setIsLoadingCounts] = useState(false);

  const careerVirtualBoards: LeaderboardConfig[] = [
    {
        id: 'global_runs',
        title: t('leader.board.runs.title'),
        description: t('leader.board.runs.desc'),
        metric: 'TOTAL_RUNS',
        type: 'PERMANENT'
    },
    {
        id: 'global_achievements',
        title: t('leader.board.achievements.title'),
        description: t('leader.board.achievements.desc'),
        metric: 'TOTAL_ACHIEVEMENTS',
        type: 'PERMANENT'
    }
  ];

  const zoneBoards: LeaderboardConfig[] = [
    {
        id: 'zone_frequency',
        title: t('leader.board.visited.title'),
        description: t('leader.board.visited.desc'),
        metric: 'OWNED_ZONES', 
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

  const allCareerBoards = useMemo(() => [...leaderboards, ...careerVirtualBoards], [leaderboards, careerVirtualBoards]);

  const isZoneRanking = zoneBoards.some(b => b.id === activeBoardId);
  const activeBoard = [...allCareerBoards, ...zoneBoards].find(b => b.id === activeBoardId) || allCareerBoards[0];

  const geoData = useMemo(() => {
    const countries = new Set<string>();
    const cityMap: Record<string, Set<string>> = {};

    zones.forEach(z => {
      const parts = z.name.split(' - ');
      if (parts.length === 2) {
        const country = parts[1].trim();
        countries.add(country);
        
        const locParts = parts[0].split(', ');
        if (locParts.length >= 2) {
          const city = locParts[locParts.length - 1].trim();
          if (!cityMap[country]) cityMap[country] = new Set();
          cityMap[country].add(city);
        }
      }
    });

    return {
      countries: Array.from(countries).sort(),
      citiesByCountry: cityMap
    };
  }, [zones]);

  useEffect(() => {
    if (!isZoneRanking) {
      setFilterCountries([]);
      setFilterCities([]);
      setIsGeoPanelOpen(false);
    }
  }, [isZoneRanking]);

  useEffect(() => {
      const fetchCounts = async () => {
          if (isLoadingCounts) return;

          const needsZoneCounts = isZoneRanking && Object.keys(zoneRunCounts).length === 0;
          const needsUserRuns = activeBoardId === 'global_runs' && Object.keys(userRunCounts).length === 0;

          if (needsZoneCounts || needsUserRuns) {
              setIsLoadingCounts(true);
              try {
                  const { data: runs, error } = await supabase
                    .from('runs')
                    .select('user_id, involved_zones');

                  if (!error && runs) {
                      const zCounts: Record<string, number> = {};
                      const uCounts: Record<string, number> = {};

                      runs.forEach(run => {
                          if (run.user_id) {
                              uCounts[run.user_id] = (uCounts[run.user_id] || 0) + 1;
                          }

                          const zoneIds = Array.isArray(run.involved_zones) 
                            ? run.involved_zones 
                            : JSON.parse(run.involved_zones || '[]');
                          
                          zoneIds.forEach((id: string) => {
                              zCounts[id] = (zCounts[id] || 0) + 1;
                          });
                      });

                      setZoneRunCounts(zCounts);
                      setUserRunCounts(uCounts);
                  }
              } catch (e) {
                  console.error("Error fetching run aggregations:", e);
              } finally {
                  setIsLoadingCounts(false);
              }
          }
      };
      fetchCounts();
  }, [activeBoardId, isZoneRanking, zoneRunCounts, userRunCounts]);

  const handleBoardChange = (id: string) => {
      setActiveBoardId(id);
      setSearchQuery('');
      setCurrentPage(1);
      setHighlightedId(null);
  };

  const getScore = (user: Omit<User, 'inventory'> | User, config: LeaderboardConfig): number => {
      switch(config.metric) {
          case 'TOTAL_KM': return user.totalKm;
          case 'OWNED_ZONES': return zones.filter(z => z.ownerId === user.id).length;
          case 'RUN_BALANCE': return user.runBalance;
          case 'GOV_BALANCE': return user.govBalance;
          case 'UNIQUE_ZONES': return Math.floor(user.totalKm / 5) + 1;
          case 'TOTAL_RUNS': return userRunCounts[user.id] || 0;
          case 'TOTAL_ACHIEVEMENTS': 
              return (user.missionLog?.length || 0) + (user.badgeLog?.length || 0);
          default: return 0;
      }
  };

  const filteredRankings = useMemo(() => {
      if (isZoneRanking) {
          return zones
            .filter(z => {
              if (filterCountries.length > 0) {
                const zoneCountry = z.name.split(' - ')[1]?.trim();
                if (!filterCountries.includes(zoneCountry)) return false;
              }
              
              if (filterCities.length > 0) {
                const parts = z.name.split(' - ')[0].split(', ');
                const zoneCity = parts[parts.length - 1]?.trim();
                if (!filterCities.includes(zoneCity)) return false;
              }

              return true;
            })
            .map(z => {
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
  }, [isZoneRanking, zones, users, currentUser, activeBoard, activeBoardId, zoneRunCounts, userRunCounts, searchQuery, filterCountries, filterCities]);

  const totalPages = Math.ceil(filteredRankings.length / ITEMS_PER_PAGE);
  const paginatedRankings = useMemo(() => {
      const start = (currentPage - 1) * ITEMS_PER_PAGE;
      return filteredRankings.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredRankings, currentPage]);

  const toggleCountryFilter = (country: string) => {
    setFilterCountries(prev => 
      prev.includes(country) ? prev.filter(c => c !== country) : [...prev, country]
    );
    setCurrentPage(1);
  };

  const toggleCityFilter = (city: string) => {
    setFilterCities(prev => 
      prev.includes(city) ? prev.filter(c => c !== city) : [...prev, city]
    );
    setCurrentPage(1);
  };

  const handleFindMe = () => {
      let index = -1;
      let targetId = "";
      if (isZoneRanking) {
          const found = (filteredRankings as any[]).find(item => item.ownerId === currentUser.id);
          if (found) {
            index = (filteredRankings as any[]).indexOf(found);
            targetId = found.id;
          }
      } else {
          index = filteredRankings.findIndex(item => item.id === currentUser.id);
          targetId = currentUser.id;
      }

      if (index !== -1) {
          const page = Math.floor(index / ITEMS_PER_PAGE) + 1;
          setSearchQuery('');
          setCurrentPage(page);
          setHighlightedId(targetId);
          setTimeout(() => {
              const element = document.getElementById(`rank-row-${targetId}`);
              if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 100);
          setTimeout(() => setHighlightedId(null), 3000);
      }
  };

  const hasDataForFindMe = useMemo(() => {
      if (isZoneRanking) return (filteredRankings as any[]).some(item => item.ownerId === currentUser.id);
      return filteredRankings.some(item => item.id === currentUser.id);
  }, [isZoneRanking, filteredRankings, currentUser.id]);

  const getMetricLabel = () => {
      if (activeBoardId === 'zone_frequency') return t('leader.metric.sessions');
      if (activeBoardId === 'zone_heavy_duty') return t('leader.metric.total_km');
      switch(activeBoard.metric) {
          case 'TOTAL_KM': return t('leader.metric_km');
          case 'OWNED_ZONES': return t('leader.metric_zones');
          case 'RUN_BALANCE': return t('leader.metric_run');
          case 'GOV_BALANCE': return t('leader.metric_gov');
          case 'UNIQUE_ZONES': return t('leader.metric_unique');
          case 'TOTAL_RUNS': return t('leader.metric_runs');
          case 'TOTAL_ACHIEVEMENTS': return t('leader.metric_achievements');
          default: return 'Score';
      }
  };

  const visibleCities = useMemo(() => {
    if (filterCountries.length === 0) {
      return Array.from(new Set(Object.values(geoData.citiesByCountry).flatMap(set => Array.from(set)))).sort();
    }
    const cities = new Set<string>();
    filterCountries.forEach(country => {
      if (geoData.citiesByCountry[country]) {
        geoData.citiesByCountry[country].forEach(c => cities.add(c));
      }
    });
    return Array.from(cities).sort();
  }, [filterCountries, geoData]);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 pb-24 md:pb-6 overflow-x-hidden">
      
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
          
          <div className="w-full lg:w-64 shrink-0 space-y-4 md:space-y-6">
              <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                  <Trophy className="text-yellow-400" /> {t('leader.title')}
              </h2>

              <div className="flex md:hidden bg-gray-900/50 p-1 rounded-xl border border-gray-800">
                  <button 
                      onClick={() => setMobileCategory('USER')}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${mobileCategory === 'USER' ? 'bg-emerald-500 text-black shadow-lg' : 'text-gray-500'}`}
                  >
                      {t('leader.career')}
                  </button>
                  <button 
                      onClick={() => setMobileCategory('ZONE')}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${mobileCategory === 'ZONE' ? 'bg-cyan-500 text-black shadow-lg' : 'text-gray-500'}`}
                  >
                      {t('leader.territorial')}
                  </button>
              </div>
              
              <div className="flex flex-col gap-2">
                  <div className={`space-y-2 ${mobileCategory === 'USER' ? 'block' : 'hidden md:block'}`}>
                      <div className="hidden lg:block py-2 px-1">
                          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-500/60 mb-1">
                             <Trophy size={20} className="text-yellow-400" />{t('leader.career')}
                          </div>
                          <div className="h-px w-full bg-gradient-to-r from-emerald-500/30 to-transparent"></div>
                      </div>
                      
                      <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                        {allCareerBoards.map(board => (
                            <button
                                key={board.id}
                                onClick={() => handleBoardChange(board.id)}
                                className={`flex items-center justify-between p-3 rounded-xl border transition-all text-left group shrink-0 ${
                                    activeBoardId === board.id 
                                    ? 'glass-panel-active text-emerald-400 border-emerald-500/40' 
                                    : 'glass-panel border-gray-700/50 hover:border-gray-500 text-gray-400'
                                }`}
                            >
                                <span className={`font-bold text-[10px] md:text-sm truncate ${activeBoardId === board.id ? 'text-emerald-400' : 'text-gray-300'}`}>
                                    {board.title}
                                </span>
                                {activeBoardId === board.id && <Crown size={12} className="text-emerald-400 shrink-0 ml-1 hidden xs:block" />}
                            </button>
                        ))}
                      </div>
                  </div>

                  <div className={`space-y-2 lg:mt-4 ${mobileCategory === 'ZONE' ? 'block' : 'hidden md:block'}`}>
                      <div className="hidden lg:block py-4 px-1">
                          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-500/60 mb-1">
                             <MapPin size={20} className="text-cyan-500"/> {t('leader.territorial')}
                          </div>
                          <div className="h-px w-full bg-gradient-to-r from-cyan-500/30 to-transparent"></div>
                      </div>

                      <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                        {zoneBoards.map(board => (
                            <button
                                key={board.id}
                                onClick={() => handleBoardChange(board.id)}
                                className={`flex items-center justify-between p-3 rounded-xl border transition-all text-left group shrink-0 ${
                                    activeBoardId === board.id 
                                    ? 'glass-panel-active border-cyan-500/50 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]' 
                                    : 'glass-panel border-gray-700/50 hover:border-cyan-500/30 text-gray-400'
                                }`}
                            >
                                <span className={`font-bold text-[10px] md:text-sm truncate ${activeBoardId === board.id ? 'text-cyan-400' : 'text-gray-300'}`}>
                                    {board.title}
                                </span>
                                {activeBoardId === board.id && <Zap size={12} className="text-cyan-400 animate-pulse shrink-0 ml-1 hidden xs:block" />}
                            </button>
                        ))}
                      </div>
                  </div>
              </div>
          </div>

          <div className="flex-1 space-y-4 md:space-y-6">
              
              <div className="glass-panel rounded-xl p-4 md:p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 md:p-6 opacity-5 pointer-events-none">
                      {isZoneRanking ? <MapIcon size={80} className="md:w-32 md:h-32" /> : <Trophy size={80} className="md:w-32 md:h-32" />}
                  </div>
                  <div className="relative z-10">
                      <h1 className="text-lg md:text-3xl font-black text-white uppercase tracking-tight leading-none">{activeBoard.title}</h1>
                      <p className="text-gray-400 mt-1 md:mt-2 text-[10px] md:text-sm max-w-lg leading-snug">{activeBoard.description}</p>
                  </div>
              </div>

              <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row gap-3">
                      <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
                          <input 
                              type="text" 
                              placeholder={isZoneRanking ? t('leader.search_sector') : t('dash.search_placeholder')} 
                              className="w-full glass-panel rounded-xl pl-10 pr-10 py-3 text-white focus:border-emerald-500 focus:outline-none transition-colors text-sm md:text-base"
                              value={searchQuery}
                              onChange={(e) => {
                                  setSearchQuery(e.target.value);
                                  setCurrentPage(1);
                                  setHighlightedId(null);
                              }}
                          />
                          {searchQuery && (
                              <button onClick={() => { setSearchQuery(''); setCurrentPage(1); }} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white">
                                  <X size={16} />
                              </button>
                          )}
                      </div>
                      
                      <div className="flex gap-2 shrink-0">
                          {isZoneRanking && (
                              <button 
                                onClick={() => setIsGeoPanelOpen(!isGeoPanelOpen)}
                                className={`px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all border relative ${
                                    isGeoPanelOpen || filterCountries.length > 0 || filterCities.length > 0
                                    ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400' 
                                    : 'glass-panel border-gray-700 text-gray-400'
                                }`}
                              >
                                  <Globe size={18} />
                                  <span className="uppercase tracking-wide text-[10px] md:text-xs">{t('leader.geo.btn_label')}</span>
                                  {(filterCountries.length > 0 || filterCities.length > 0) && (
                                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-cyan-500 text-black text-[9px] font-black rounded-full flex items-center justify-center px-1 shadow-[0_0_8px_#06b6d4]">
                                      {filterCountries.length + filterCities.length}
                                    </span>
                                  )}
                                  {isGeoPanelOpen ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                              </button>
                          )}

                          <button 
                            onClick={handleFindMe}
                            disabled={!hasDataForFindMe}
                            className={`px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all border shrink-0 ${
                                hasDataForFindMe 
                                ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500 hover:text-black shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                                : 'bg-gray-800 border-gray-700 text-gray-600 cursor-not-allowed'
                            }`}
                          >
                              <Target size={18} />
                              <span className="uppercase tracking-wide text-[10px] md:text-xs hidden xs:inline">{isZoneRanking ? t('leader.find_my_sector') : t('leader.find_me')}</span>
                          </button>
                      </div>
                  </div>

                  {isZoneRanking && isGeoPanelOpen && (
                    <div className="glass-panel p-4 rounded-xl border-cyan-500/20 animate-fade-in space-y-4">
                        <div className="flex justify-between items-center pb-2 border-b border-white/5">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t('leader.geo.selection_title')}</span>
                            <button 
                                onClick={() => { setFilterCountries([]); setFilterCities([]); setCurrentPage(1); }}
                                className="text-[10px] font-bold text-cyan-400 hover:underline"
                            >
                                {t('leader.geo.all_territories')}
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-[9px] font-bold text-gray-500 uppercase mb-2 flex items-center justify-between">
                                  <span>{t('leader.geo.select_country')}</span>
                                  {filterCountries.length > 0 && <span className="text-emerald-400 text-[12px]">{filterCountries.length}</span>}
                                </h4>
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                                    {geoData.countries.map(country => {
                                        const isActive = filterCountries.includes(country);
                                        return (
                                          <button 
                                              key={country}
                                              onClick={() => toggleCountryFilter(country)}
                                              className={`px-2 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all border truncate flex items-center justify-center gap-1 ${isActive ? 'bg-emerald-500 text-black border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-gray-900 text-gray-400 border-gray-700 hover:border-gray-500'}`}
                                          >
                                              {isActive && <Check size={10} />} {country}
                                          </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="animate-fade-in">
                                <h4 className="text-[9px] font-bold text-gray-500 uppercase mb-2 flex items-center justify-between">
                                    <span>{t('leader.geo.select_city')}</span>
                                    {filterCities.length > 0 && <span className="text-cyan-400 text-[12px]">{filterCities.length}</span>}
                                </h4>
                                <div className="max-h-40 overflow-y-auto no-scrollbar pr-1 border border-white/5 rounded-lg p-2 bg-black/20">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                        {visibleCities.map(city => {
                                            const isActive = filterCities.includes(city);
                                            return (
                                              <button 
                                                  key={city}
                                                  onClick={() => toggleCityFilter(city)}
                                                  className={`px-2 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all border truncate flex items-center justify-center gap-1 ${isActive ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]' : 'bg-gray-900 text-gray-400 border-gray-700 hover:border-gray-500'}`}
                                              >
                                                  {isActive && <Check size={10} />} {city}
                                              </button>
                                            );
                                        })}
                                        {visibleCities.length === 0 && (
                                          <div className="col-span-full py-4 text-center text-[10px] text-gray-600 italic">
                                            {t('leader.geo.no_data')}
                                          </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                  )}
              </div>

              <div className="glass-panel rounded-xl overflow-hidden shadow-2xl relative">
                {isLoadingCounts && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-20 flex items-center justify-center">
                        <Loader2 className="text-cyan-400 animate-spin" size={32} />
                    </div>
                )}
                
                <div className="overflow-x-auto no-scrollbar scroll-smooth">
                    <table className="w-full text-left border-collapse table-fixed">
                      <thead className="bg-black/30 text-gray-400 text-[10px] uppercase font-bold tracking-wider">
                        <tr>
                          <th className="px-2 md:px-6 py-3 w-10 md:w-16 text-center">#</th>
                          <th className="px-1 md:px-6 py-3">{isZoneRanking ? t('leader.sector') : t('leader.runner')}</th>
                          <th className="px-2 md:px-6 py-3 text-right w-24 md:w-40">
                              <div className="flex items-center justify-end gap-1 md:gap-2">
                                  {isZoneRanking ? <Activity size={12}/> : <BarChart3 size={12}/>}
                                  <span className="hidden xs:inline">{getMetricLabel()}</span>
                                  <span className="xs:hidden">VAL</span>
                              </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700/50">
                        {paginatedRankings.map((item) => {
                          const isMe = isZoneRanking ? (item.ownerId === currentUser.id) : (item.id === currentUser.id);
                          const isHighlighted = highlightedId === item.id;

                          let rankIcon = null;
                          if (item.rank === 1) rankIcon = <Medal className="text-yellow-400 fill-yellow-400/20" size={18} />;
                          else if (item.rank === 2) rankIcon = <Medal className="text-gray-300 fill-gray-300/20" size={18} />;
                          else if (item.rank === 3) rankIcon = <Medal className="text-amber-600 fill-amber-600/20" size={18} />;

                          const owner = isZoneRanking ? (item.ownerId ? (users[item.ownerId] || currentUser) : null) : null;
                          const userBadge = !isZoneRanking && (item as any).badgeId ? badges.find(b => b.id === (item as any).badgeId) : null;
                          const canClick = isZoneRanking ? !!item.ownerId : true;

                          return (
                            <tr 
                                id={`rank-row-${item.id}`}
                                key={item.id} 
                                onClick={() => {
                                    if (isZoneRanking) {
                                        if (item.ownerId) setSelectedUserId(item.ownerId);
                                    } else {
                                        setSelectedUserId(item.id);
                                    }
                                }}
                                className={`${isMe ? 'bg-emerald-900/30' : 'hover:bg-white/5'} ${isHighlighted ? 'ring-2 ring-emerald-500 ring-inset bg-emerald-500/10' : ''} transition-all duration-500 ${canClick ? 'cursor-pointer' : 'cursor-default'} group`}
                            >
                              <td className="px-2 md:px-6 py-4 font-bold text-white text-center align-middle text-[11px] md:text-sm">
                                {rankIcon ? <div className="flex justify-center">{rankIcon}</div> : <span className="text-gray-500 font-mono">#{item.rank}</span>}
                              </td>
                              
                              <td className="px-1 md:px-6 py-3 align-middle overflow-hidden">
                                <div className="flex items-center gap-2 md:gap-4 min-w-0">
                                  <div className="relative shrink-0">
                                      <img 
                                        src={isZoneRanking ? (owner?.avatar || `https://ui-avatars.com/api/?name=${item.name}&background=1e293b&color=fff`) : (item as any).avatar} 
                                        alt={item.name} 
                                        className={`w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-full bg-gray-600 object-cover ring-1 md:ring-2 ring-gray-700/50 group-hover:ring-${isZoneRanking ? 'cyan' : 'emerald'}-500 transition-colors`} 
                                      />
                                      {isZoneRanking && item.ownerId && <Crown size={10} className="absolute -top-1 -right-1 text-yellow-500 fill-yellow-500 bg-gray-900 rounded-full" />}
                                  </div>
                                  
                                  <div className="flex flex-col min-w-0">
                                      <div className="flex items-center gap-1.5 overflow-hidden">
                                          <span className={`font-bold text-[11px] md:text-base truncate ${isMe ? 'text-emerald-400' : 'text-white group-hover:text-cyan-300 transition-colors'}`}>
                                            {item.name}
                                          </span>
                                      </div>
                                      
                                      {isZoneRanking ? (
                                          <span className="text-[8px] md:text-[10px] text-gray-500 uppercase tracking-widest font-bold truncate">
                                              <span className="hidden xs:inline">{t('leader.controller')}:</span> <span className="text-gray-300">{owner?.name || t('leader.unclaimed')}</span>
                                          </span>
                                      ) : (
                                          userBadge && (
                                               <div className={`flex items-center gap-1 px-1 rounded-md border w-fit mt-0.5 max-w-full ${
                                                   userBadge.rarity === 'LEGENDARY' ? 'text-yellow-400 bg-yellow-900/30 border-yellow-500/30' : 
                                                   userBadge.rarity === 'EPIC' ? 'text-purple-400 bg-purple-900/30 border-purple-500/30' : 
                                                   'text-cyan-400 bg-cyan-900/30 border-cyan-500/30'
                                               }`}>
                                                   {renderBadgeIcon(userBadge.icon, "w-2 h-2 shrink-0")}
                                                   <span className="text-[7px] md:text-[8px] font-bold uppercase tracking-wide truncate">{userBadge.name}</span>
                                               </div>
                                          )
                                      )}
                                  </div>
                                </div>
                              </td>
                              
                              <td className="px-2 md:px-6 py-3 text-right align-middle">
                                <span className={`font-mono text-xs md:text-xl font-bold ${isZoneRanking ? 'text-cyan-400' : 'text-emerald-400'}`}>
                                    {item.score.toLocaleString(undefined, { 
                                        minimumFractionDigits: (activeBoardId === 'zone_frequency' || activeBoard.metric === 'TOTAL_RUNS' || activeBoard.metric === 'TOTAL_ACHIEVEMENTS') ? 0 : 1,
                                        maximumFractionDigits: (activeBoardId === 'zone_frequency' || activeBoard.metric === 'TOTAL_RUNS' || activeBoard.metric === 'TOTAL_ACHIEVEMENTS') ? 0 : 1 
                                    })}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                        {filteredRankings.length === 0 && (
                            <tr>
                                <td colSpan={3} className="px-6 py-12 text-center text-gray-500 text-sm">
                                    {t('leader.geo.no_data')}
                                </td>
                            </tr>
                        )}
                      </tbody>
                    </table>
                </div>
              </div>
              
              <div className="flex justify-center pt-2 md:pt-6">
                  <Pagination 
                      currentPage={currentPage} 
                      totalPages={totalPages} 
                      onPageChange={setCurrentPage} 
                  />
              </div>
          </div>
      </div>
    </div>
  );
};

export default Leaderboard;