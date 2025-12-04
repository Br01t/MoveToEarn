
import React, { useState } from 'react';
import { User, Zone, Mission, Badge, Rarity } from '../types';
import { Save, User as UserIcon, Mail, Activity, Coins, Shield, Crown, Award, History, Clock, CheckCircle, TrendingUp, BarChart3, MapPin, Camera, X, Flag, Zap, Mountain, Globe, Home, Landmark, Swords, Footprints, Rocket, Tent, Timer, Building2 } from 'lucide-react';
import { PREMIUM_COST } from '../constants';
import Pagination from './Pagination';

interface ProfileProps {
  user: User;
  zones: Zone[];
  missions?: Mission[];
  badges?: Badge[];
  onUpdateUser: (updates: Partial<User>) => void;
  onUpgradePremium: () => void;
}

const BADGES_PER_PAGE = 12;
const RUNS_PER_PAGE = 8;
const COMPLETED_MISSIONS_PER_PAGE = 5;

const Profile: React.FC<ProfileProps> = ({ user, zones, missions = [], badges = [], onUpdateUser, onUpgradePremium }) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email || '');
  const [avatar, setAvatar] = useState(user.avatar);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'ACHIEVEMENTS' | 'HISTORY'>('ACHIEVEMENTS');
  
  const [badgePage, setBadgePage] = useState(1);
  const [runPage, setRunPage] = useState(1);
  const [completedMissionPage, setCompletedMissionPage] = useState(1);

  // --- DERIVED STATS ---
  const myZones = zones.filter(z => z.ownerId === user.id);
  const earnedBadges = badges.filter(b => user.earnedBadgeIds.includes(b.id));
  const completedMissions = missions.filter(m => user.completedMissionIds.includes(m.id));
  
  const favoriteBadge = badges.find(b => b.id === user.favoriteBadgeId);

  // Running Stats
  const totalRuns = user.runHistory.length;
  const avgDistance = totalRuns > 0 ? (user.totalKm / totalRuns).toFixed(2) : '0.00';
  const maxDistance = totalRuns > 0 ? Math.max(...user.runHistory.map(r => r.km)).toFixed(2) : '0.00';
  
  // Economy Stats
  const dailyYield = myZones.reduce((acc, z) => acc + (z.interestRate * 0.5 * 6 * 24), 0); // Approx calculation based on 10s loop
  const totalNetWorth = user.runBalance + (user.govBalance * 10); // Fake valuation 1 GOV = 10 RUN

  // Level Calculation (Simple Formula: 1 Level per 50km)
  const currentLevel = Math.floor(user.totalKm / 50) + 1;
  const nextLevelKm = currentLevel * 50;
  const progressToNextLevel = ((user.totalKm - ((currentLevel - 1) * 50)) / 50) * 100;

  // Pagination Data
  const currentBadges = earnedBadges.slice((badgePage - 1) * BADGES_PER_PAGE, badgePage * BADGES_PER_PAGE);
  const totalBadgePages = Math.ceil(earnedBadges.length / BADGES_PER_PAGE);
  
  const currentRuns = user.runHistory.slice((runPage - 1) * RUNS_PER_PAGE, runPage * RUNS_PER_PAGE);
  const totalRunPages = Math.ceil(user.runHistory.length / RUNS_PER_PAGE);

  const currentCompletedMissions = completedMissions.slice((completedMissionPage - 1) * COMPLETED_MISSIONS_PER_PAGE, completedMissionPage * COMPLETED_MISSIONS_PER_PAGE);
  const totalCompletedMissionPages = Math.ceil(completedMissions.length / COMPLETED_MISSIONS_PER_PAGE);

  const handleSave = () => {
    onUpdateUser({ name, email, avatar });
    setIsEditing(false);
  };

  const handleCancel = () => {
      setIsEditing(false);
      setName(user.name);
      setEmail(user.email || '');
      setAvatar(user.avatar);
  };

  const handleEquipBadge = (badgeId: string) => {
      onUpdateUser({ favoriteBadgeId: badgeId });
  };

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
          default: return <Award className={className} />;
      }
  };

  const getRarityColor = (rarity: Rarity) => {
      switch(rarity) {
          case 'LEGENDARY': return 'text-yellow-400 border-yellow-500/50 bg-yellow-900/20';
          case 'EPIC': return 'text-purple-400 border-purple-500/50 bg-purple-900/20';
          case 'RARE': return 'text-cyan-400 border-cyan-500/50 bg-cyan-900/20';
          default: return 'text-gray-300 border-gray-600 bg-gray-800';
      }
  };

  const getRarityText = (rarity: Rarity) => {
      switch(rarity) {
          case 'LEGENDARY': return 'text-yellow-400';
          case 'EPIC': return 'text-purple-400';
          case 'RARE': return 'text-cyan-400';
          default: return 'text-gray-400';
      }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      
      {/* --- HEADER SECTION: IDENTITY & LEVEL --- */}
      <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden shadow-xl">
          {/* Banner */}
          <div className="h-32 bg-gradient-to-r from-gray-900 via-emerald-950 to-gray-900 relative">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30"></div>
              {user.isPremium && (
                 <div className="absolute top-4 right-4 bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg z-10">
                    <Crown size={12} fill="black" /> PREMIUM AGENT
                 </div>
              )}
          </div>
          
          <div className="px-6 md:px-8 pb-6 flex flex-col md:flex-row items-end md:items-start gap-6 -mt-12 relative z-10">
             {/* Avatar */}
             <div className="relative group">
                 <img src={isEditing ? avatar : user.avatar} alt="Avatar" className={`w-32 h-32 rounded-2xl border-4 bg-gray-800 shadow-2xl object-cover ${user.isPremium ? 'border-yellow-500' : 'border-gray-700'}`} />
                 <div className="absolute -bottom-3 -right-3 bg-gray-900 text-white text-xs font-bold px-3 py-1 rounded-lg border border-gray-600 shadow-lg z-20">
                    LVL {currentLevel}
                 </div>
                 {isEditing && (
                     <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-2xl border-4 border-transparent z-10">
                         <Camera className="text-white opacity-80" />
                     </div>
                 )}
             </div>

             {/* Identity Details */}
             <div className="flex-1 w-full md:w-auto pt-2">
                 {!isEditing ? (
                    <div>
                        <div className="flex flex-wrap items-center gap-3 mb-1">
                            <h1 className="text-3xl font-bold text-white tracking-tight">{user.name}</h1>
                            {favoriteBadge && (
                                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border bg-gray-900/80 ${getRarityColor(favoriteBadge.rarity)}`} title={favoriteBadge.name}>
                                    {renderBadgeIcon(favoriteBadge.icon, "w-4 h-4")}
                                    <span className="text-[10px] font-bold uppercase tracking-wider">{favoriteBadge.name}</span>
                                </div>
                            )}
                            <button onClick={() => setIsEditing(true)} className="text-gray-500 hover:text-emerald-400 p-1 hover:bg-gray-700/50 rounded-lg transition-colors"><Save size={18}/></button>
                        </div>
                        <p className="text-gray-400 flex items-center gap-2 text-sm mt-1">
                            <Mail size={14} className="text-emerald-500" /> {user.email || 'No secure contact linked'}
                        </p>
                        
                        {/* Level Progress Bar (View Mode) */}
                        <div className="mt-4 max-w-lg">
                            <div className="flex justify-between text-[10px] uppercase font-bold text-gray-500 mb-1">
                                <span>XP Progress</span>
                                <span>{user.totalKm.toFixed(1)} / {nextLevelKm} KM</span>
                            </div>
                            <div className="w-full bg-gray-900 rounded-full h-2 border border-gray-700">
                                <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${progressToNextLevel}%` }}></div>
                            </div>
                        </div>
                    </div>
                 ) : (
                    <div className="flex flex-col gap-3 w-full max-w-lg animate-fade-in bg-gray-900/50 p-4 rounded-xl border border-gray-700">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Agent Name</label>
                                <input value={name} onChange={e => setName(e.target.value)} className="w-full bg-gray-900 border border-emerald-500 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500" />
                            </div>
                            <div>
                                <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Contact Email</label>
                                <input value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-gray-900 border border-gray-600 focus:border-emerald-500 rounded px-3 py-2 text-white text-sm focus:outline-none" />
                            </div>
                        </div>
                        <div>
                             <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Avatar URL</label>
                             <input value={avatar} onChange={e => setAvatar(e.target.value)} placeholder="https://..." className="w-full bg-gray-900 border border-gray-600 focus:border-emerald-500 rounded px-3 py-2 text-white text-sm focus:outline-none" />
                        </div>
                        <div className="flex gap-2 mt-2">
                            <button onClick={handleSave} className="flex-1 bg-emerald-600 hover:bg-emerald-500 px-3 py-2 rounded text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2">
                                <CheckCircle size={14}/> Save Profile
                            </button>
                            <button onClick={handleCancel} className="flex-1 bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2">
                                <X size={14}/> Cancel
                            </button>
                        </div>
                    </div>
                 )}
             </div>

             {/* Quick Actions (Only visible in View Mode) */}
             {!isEditing && (
                <div className="flex gap-3 mt-4 md:mt-12">
                    {!user.isPremium && (
                        <button onClick={onUpgradePremium} className="px-5 py-2.5 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded-xl text-sm shadow-lg flex items-center gap-2 transition-colors">
                            <Crown size={16} /> Upgrade Pro
                        </button>
                    )}
                </div>
             )}
          </div>
      </div>

      {/* --- KPI GRID: HIGH LEVEL STATS --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Distance" value={`${user.totalKm.toFixed(1)} km`} icon={Activity} color="text-emerald-400" subValue="Lifetime" />
          <StatCard label="Zones Controlled" value={myZones.length.toString()} icon={MapPin} color="text-cyan-400" subValue={`Yielding ${Math.floor(dailyYield)} RUN/day`} />
          <StatCard label="Total Runs" value={totalRuns.toString()} icon={TrendingUp} color="text-purple-400" subValue={`Avg ${avgDistance} km`} />
          <StatCard label="Net Worth" value={`≈ ${totalNetWorth.toFixed(0)}`} icon={Coins} color="text-yellow-400" subValue="Combined Value" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* --- LEFT COL: DETAILED ANALYTICS --- */}
          <div className="lg:col-span-1 space-y-6">
              
              {/* Wallet Summary (Moved to Top) */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 p-5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5"><Coins size={80}/></div>
                  <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                      <Coins size={18} className="text-yellow-500"/> Liquid Assets
                  </h3>
                  <div className="space-y-3 relative z-10">
                      <div className="flex justify-between items-end bg-black/20 p-3 rounded-lg">
                          <span className="text-sm text-gray-400">RUN Balance</span>
                          <span className="text-xl font-mono font-bold text-emerald-400">{user.runBalance.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between items-end bg-black/20 p-3 rounded-lg">
                          <span className="text-sm text-gray-400">GOV Holdings</span>
                          <span className="text-xl font-mono font-bold text-cyan-400">{user.govBalance.toFixed(1)}</span>
                      </div>
                  </div>
              </div>

              {/* Physical Stats */}
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
                  <h3 className="text-white font-bold mb-4 flex items-center gap-2 border-b border-gray-700 pb-2">
                      <BarChart3 size={18} className="text-gray-400"/> Performance Metrics
                  </h3>
                  <div className="space-y-4">
                      <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-400">Longest Run</span>
                          <span className="text-white font-mono font-bold">{maxDistance} km</span>
                      </div>
                      <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-400">Average Distance</span>
                          <span className="text-white font-mono font-bold">{avgDistance} km</span>
                      </div>
                      <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-400">Activity Frequency</span>
                          <span className="text-emerald-400 text-xs font-bold px-2 py-0.5 bg-emerald-900/30 rounded">HIGH</span>
                      </div>
                  </div>
              </div>

              {/* Empire Stats */}
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
                  <h3 className="text-white font-bold mb-4 flex items-center gap-2 border-b border-gray-700 pb-2">
                      <Shield size={18} className="text-gray-400"/> Territory Status
                  </h3>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-gray-900 p-3 rounded-lg text-center">
                          <span className="block text-xl font-bold text-white">{myZones.filter(z => z.defenseLevel > 1).length}</span>
                          <span className="text-[10px] text-gray-500 uppercase">Fortified</span>
                      </div>
                      <div className="bg-gray-900 p-3 rounded-lg text-center">
                          <span className="block text-xl font-bold text-white">{myZones.filter(z => z.interestRate > 3).length}</span>
                          <span className="text-[10px] text-gray-500 uppercase">High Yield</span>
                      </div>
                  </div>
                  <div className="text-xs text-gray-500 text-center">
                      Your empire generates passive income 24/7.
                  </div>
              </div>
          </div>

          {/* --- RIGHT COL: TABS (HISTORY & ACHIEVEMENTS) --- */}
          <div className="lg:col-span-2">
              <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden min-h-[500px] flex flex-col">
                  {/* Tabs Header */}
                  <div className="flex border-b border-gray-700 bg-gray-900/50">
                      <button 
                        onClick={() => setActiveTab('ACHIEVEMENTS')}
                        className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'ACHIEVEMENTS' ? 'border-yellow-500 text-yellow-400 bg-gray-800' : 'border-transparent text-gray-500 hover:text-white'}`}
                      >
                          <Award size={16} /> Achievements
                      </button>
                      <button 
                        onClick={() => setActiveTab('HISTORY')}
                        className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'HISTORY' ? 'border-emerald-500 text-emerald-400 bg-gray-800' : 'border-transparent text-gray-500 hover:text-white'}`}
                      >
                          <History size={16} /> Run Log
                      </button>
                  </div>

                  {/* Tab Content */}
                  <div className="p-6 flex-1 bg-gray-800">

                      {/* --- ACHIEVEMENTS TAB --- */}
                      {activeTab === 'ACHIEVEMENTS' && (
                          <div className="space-y-8">
                              <div>
                                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Badges Collected ({earnedBadges.length})</h4>
                                  <p className="text-[10px] text-gray-500 mb-4 italic">Click a badge to set as Favorite.</p>
                                  {earnedBadges.length === 0 ? (
                                      <div className="text-center py-10 border border-dashed border-gray-700 rounded-xl">
                                          <p className="text-gray-500 text-xs">Start completing missions to earn badges.</p>
                                      </div>
                                  ) : (
                                      <>
                                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                                            {currentBadges.map(badge => {
                                                const isEquipped = user.favoriteBadgeId === badge.id;
                                                return (
                                                  <button 
                                                    key={badge.id} 
                                                    onClick={() => handleEquipBadge(badge.id)}
                                                    className={`aspect-square rounded-lg flex flex-col items-center justify-center p-2 border bg-gray-900 transition-all hover:scale-105 relative ${getRarityColor(badge.rarity)} ${isEquipped ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900' : ''}`} 
                                                    title={isEquipped ? 'Equipped' : `Click to Equip ${badge.name}`}
                                                  >
                                                      {isEquipped && <div className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full"></div>}
                                                      {renderBadgeIcon(badge.icon, "w-5 h-5 mb-2")}
                                                      <span className="text-[9px] font-bold text-center leading-none">{badge.name}</span>
                                                  </button>
                                                )
                                            })}
                                        </div>
                                        <Pagination currentPage={badgePage} totalPages={totalBadgePages} onPageChange={setBadgePage} />
                                      </>
                                  )}
                              </div>

                              <div>
                                  <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Completed Missions Log</h4>
                                      {/* Legend */}
                                      <div className="flex gap-2 sm:gap-3 text-[9px] font-bold uppercase tracking-wider text-gray-400">
                                          <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-gray-500"></div> Common</div>
                                          <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_4px_rgba(6,182,212,0.8)]"></div> Rare</div>
                                          <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_4px_rgba(168,85,247,0.8)]"></div> Epic</div>
                                          <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-yellow-500 shadow-[0_0_4px_rgba(234,179,8,0.8)]"></div> Leg.</div>
                                      </div>
                                  </div>
                                  
                                  <div className="space-y-2">
                                      {currentCompletedMissions.map(m => (
                                          <div key={m.id} className="bg-gray-900 p-3 rounded-lg border border-gray-700 flex justify-between items-center">
                                              <div className="flex items-center gap-3">
                                                  <CheckCircle size={16} className={getRarityText(m.rarity)} />
                                                  <span className="text-sm font-bold text-gray-300">{m.title}</span>
                                              </div>
                                              <span className="text-xs font-mono text-cyan-400">+{m.rewardGov} GOV</span>
                                          </div>
                                      ))}
                                      {completedMissions.length === 0 && (
                                          <p className="text-gray-500 text-xs italic">No missions completed yet.</p>
                                      )}
                                  </div>
                                  <Pagination currentPage={completedMissionPage} totalPages={totalCompletedMissionPages} onPageChange={setCompletedMissionPage} />
                              </div>
                          </div>
                      )}
                      
                      {/* --- RUN HISTORY TAB --- */}
                      {activeTab === 'HISTORY' && (
                          <div className="space-y-4">
                              {user.runHistory.length === 0 ? (
                                  <div className="text-center py-20 text-gray-500">
                                      <Clock size={48} className="mx-auto mb-4 opacity-20" />
                                      <p>No runs recorded yet.</p>
                                  </div>
                              ) : (
                                  <>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="text-[10px] uppercase font-bold text-gray-500 border-b border-gray-700">
                                                <tr>
                                                    <th className="pb-3 pl-2">Date</th>
                                                    <th className="pb-3">Location</th>
                                                    <th className="pb-3 text-right">Dist</th>
                                                    <th className="pb-3 text-right pr-2">Rewards</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-700/50 text-sm">
                                                {currentRuns.map(run => (
                                                    <tr key={run.id} className="hover:bg-gray-750 transition-colors">
                                                        <td className="py-3 pl-2 text-gray-400 text-xs">
                                                            {new Date(run.timestamp).toLocaleDateString()}
                                                        </td>
                                                        <td className="py-3 font-medium text-white">{run.location}</td>
                                                        <td className="py-3 text-right font-mono text-emerald-400">{run.km.toFixed(2)} km</td>
                                                        <td className="py-3 text-right pr-2">
                                                            <div className="flex flex-col items-end">
                                                                <span className="text-xs font-bold text-white">+{run.runEarned} RUN</span>
                                                                {run.govEarned && <span className="text-[10px] text-cyan-400">+{run.govEarned} GOV</span>}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
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

      </div>
    </div>
  );
};

// Helper Component for Stats
const StatCard = ({ label, value, icon: Icon, color, subValue }: { label: string, value: string, icon: any, color: string, subValue?: string }) => (
    <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-lg">
        <div className="flex items-start justify-between mb-2">
            <span className="text-[10px] uppercase font-bold text-gray-500">{label}</span>
            <div className={`p-1.5 rounded-lg bg-gray-900 ${color}`}><Icon size={14} /></div>
        </div>
        <div className="text-2xl font-bold text-white font-mono tracking-tight">{value}</div>
        {subValue && <div className="text-[10px] text-gray-400 mt-1">{subValue}</div>}
    </div>
);

export default Profile;