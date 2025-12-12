
import React, { useState } from 'react';
import { User, Zone, Badge, Rarity, LeaderboardConfig, LeaderboardMetric, LevelConfig } from '../types';
import { Trophy, Medal, Map as MapIcon, Award, Flag, Crown, Zap, Mountain, Globe, Home, Landmark, Swords, Footprints, Rocket, Tent, Timer, Building2, Moon, Sun, ShieldCheck, Gem, Users, Clock, Coins, Activity, X, Egg, Baby, MapPin, Smile, Wind, Compass, Navigation, TrendingUp, Move, Target, Watch, Droplets, Shield, Star, BatteryCharging, Flame, Truck, CloudLightning, Hexagon, FastForward, Plane, Layers, Briefcase, GraduationCap, Brain, Crosshair, Anchor, Heart, Lock, Disc, Feather, FlagTriangleRight, Globe2, Camera, Sparkles, Radio, BookOpen, Waves, Snowflake, CloudRain, ThermometerSnowflake, SunDim, MoonStar, Atom, Sword, Axe, Ghost, Ship, PlusSquare, Skull, ChevronsUp, Orbit, CloudFog, Circle, Infinity, Sparkle, ArrowUpCircle, Eye, Type, Delete, PenTool, Search } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

interface LeaderboardProps {
  users: Record<string, Omit<User, 'inventory'>>;
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

const renderLevelIcon = (iconName: string, className: string) => {
    switch(iconName) {
        case 'Egg': return <Egg className={className} />;
        case 'Footprints': return <Footprints className={className} />;
        case 'Baby': return <Baby className={className} />;
        case 'Activity': return <Activity className={className} />;
        case 'MapPin': return <MapPin className={className} />;
        case 'Sun': return <Sun className={className} />;
        case 'Smile': return <Smile className={className} />;
        case 'Wind': return <Wind className={className} />;
        case 'Compass': return <Compass className={className} />;
        case 'Navigation': return <Navigation className={className} />;
        case 'TrendingUp': return <TrendingUp className={className} />;
        case 'Move': return <Move className={className} />;
        case 'Building': return <Building2 className={className} />;
        case 'Trees': return <Mountain className={className} />;
        case 'Target': return <Target className={className} />;
        case 'Watch': return <Watch className={className} />;
        case 'Droplets': return <Droplets className={className} />;
        case 'Shield': return <Shield className={className} />;
        case 'Mountain': return <Mountain className={className} />;
        case 'Star': return <Star className={className} />;
        case 'Flag': return <Flag className={className} />;
        case 'BatteryCharging': return <BatteryCharging className={className} />;
        case 'Flame': return <Flame className={className} />;
        case 'Truck': return <Truck className={className} />;
        case 'Award': return <Award className={className} />;
        case 'ShieldCheck': return <ShieldCheck className={className} />;
        case 'Zap': return <Zap className={className} />;
        case 'Moon': return <Moon className={className} />;
        case 'Sunrise': return <Sun className={className} />;
        case 'Medal': return <Medal className={className} />;
        case 'Repeat': return <Timer className={className} />;
        case 'CloudLightning': return <CloudLightning className={className} />;
        case 'Hexagon': return <Hexagon className={className} />;
        case 'FastForward': return <FastForward className={className} />;
        case 'Trophy': return <Trophy className={className} />;
        case 'Globe': return <Globe className={className} />;
        case 'Plane': return <Plane className={className} />;
        case 'Map': return <MapIcon className={className} />;
        case 'Layers': return <Layers className={className} />;
        case 'Briefcase': return <Briefcase className={className} />;
        case 'GraduationCap': return <GraduationCap className={className} />;
        case 'Users': return <Users className={className} />;
        case 'Brain': return <Brain className={className} />;
        case 'Crosshair': return <Crosshair className={className} />;
        case 'Anchor': return <Anchor className={className} />;
        case 'Heart': return <Heart className={className} />;
        case 'Lock': return <Lock className={className} />;
        case 'Disc': return <Disc className={className} />;
        case 'Gem': return <Gem className={className} />;
        case 'Crown': return <Crown className={className} />;
        case 'Feather': return <Feather className={className} />;
        case 'FlagTriangleRight': return <FlagTriangleRight className={className} />;
        case 'Globe2': return <Globe2 className={className} />;
        case 'Camera': return <Camera className={className} />;
        case 'Sparkles': return <Sparkles className={className} />;
        case 'Radio': return <Radio className={className} />;
        case 'BookOpen': return <BookOpen className={className} />;
        case 'Waves': return <Waves className={className} />;
        case 'Snowflake': return <Snowflake className={className} />;
        case 'CloudRain': return <CloudRain className={className} />;
        case 'ThermometerSnowflake': return <ThermometerSnowflake className={className} />;
        case 'SunDim': return <SunDim className={className} />;
        case 'MoonStar': return <MoonStar className={className} />;
        case 'Atom': return <Atom className={className} />;
        case 'Sword': return <Sword className={className} />;
        case 'Axe': return <Axe className={className} />;
        case 'Ghost': return <Ghost className={className} />;
        case 'Ship': return <Ship className={className} />;
        case 'PlusSquare': return <PlusSquare className={className} />;
        case 'Skull': return <Skull className={className} />;
        case 'ChevronsUp': return <ChevronsUp className={className} />;
        case 'Rocket': return <Rocket className={className} />;
        case 'User': return <Users className={className} />;
        case 'Orbit': return <Globe className={className} />;
        case 'CloudFog': return <CloudFog className={className} />;
        case 'Circle': return <Circle className={className} />;
        case 'Infinity': return <Infinity className={className} />;
        case 'Sparkle': return <Sparkle className={className} />;
        case 'ArrowUpCircle': return <ArrowUpCircle className={className} />;
        case 'Clock': return <Clock className={className} />;
        case 'Eye': return <Eye className={className} />;
        case 'Type': return <Type className={className} />;
        case 'Delete': return <Delete className={className} />;
        case 'PenTool': return <PenTool className={className} />;
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
    allUsers: Record<string, Omit<User, 'inventory'>>, 
    currentUser: User, 
    zones: Zone[], 
    badges: Badge[], 
    onClose: () => void,
    t: (key: string) => string,
    levels: LevelConfig[] | undefined
}) => {
    
    let user: Omit<User, 'inventory'> | User;
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
    let currentLevelConfig: LevelConfig | undefined;

    if (levels && levels.length > 0) {
        currentLevelConfig = levels.slice().reverse().find(l => user.totalKm >= l.minKm) || levels[0];
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
                        <div className="absolute -bottom-2 -right-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-1 rounded-md border border-gray-900 shadow-lg flex items-center gap-1">
                            {currentLevelConfig?.icon && renderLevelIcon(currentLevelConfig.icon, "w-3 h-3 text-white")}
                            LVL {currentLevel}
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-1 flex items-center justify-center gap-2">
                        {user.name}
                        {userId === currentUser.id && <span className="text-xs bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30 font-mono">YOU</span>}
                    </h2>
                    
                    {/* Level Title */}
                    {currentLevelConfig?.title && (
                        <div className="flex items-center justify-center gap-1 mb-2">
                            <span className="text-xs font-bold text-gray-300 uppercase tracking-widest bg-gray-800 px-2 py-0.5 rounded border border-gray-700">
                                {currentLevelConfig.title}
                            </span>
                        </div>
                    )}

                    {/* Stats Grid 2x2 */}
                    <div className="grid grid-cols-2 gap-3 mb-6 mt-4">
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
  const [searchQuery, setSearchQuery] = useState('');

  const activeBoard = leaderboards.find(b => b.id === activeBoardId) || leaderboards[0];

  const handleBoardChange = (id: string) => {
      setActiveBoardId(id);
      setSearchQuery('');
  };

  // --- SCORE CALCULATION LOGIC ---
  const getScore = (user: Omit<User, 'inventory'> | User, config: LeaderboardConfig): number => {
      // Metric logic now applies generally to all users based on available profile data
      const isMe = user.id === currentUser.id;
      
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
              if (isMe && currentUser.runHistory) {
                  return new Set(currentUser.runHistory.map(r => r.location)).size;
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
          <div className="max-w-7xl mx-auto p-4 md:p-6 text-center text-gray-500 min-h-[400px] flex flex-col items-center justify-center">
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
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-10 py-3 text-white focus:border-emerald-500 focus:outline-none transition-colors"
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
              <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-2xl">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-900 text-gray-400 text-[10px] uppercase font-bold tracking-wider">
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
                  <tbody className="divide-y divide-gray-700">
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
                            className={`${isMe ? 'bg-emerald-900/20' : 'hover:bg-gray-750'} transition-colors cursor-pointer group`}
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
                                      {isMe && <span className="text-[9px] bg-emerald-900 text-emerald-400 px-1 rounded font-mono hidden md:inline">YOU</span>}
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