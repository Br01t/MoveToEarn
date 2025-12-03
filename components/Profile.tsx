
import React, { useState } from 'react';
import { User, Zone, Mission, Badge, Rarity } from '../types';
import { Save, User as UserIcon, Mail, MapPin, Activity, Coins, Shield, Crown, CheckCircle, Award, Target, Flag } from 'lucide-react';
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

const BADGES_PER_PAGE = 8;
const MISSIONS_PER_PAGE = 5;

const Profile: React.FC<ProfileProps> = ({ user, zones, missions = [], badges = [], onUpdateUser, onUpgradePremium }) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email || '');
  const [isEditing, setIsEditing] = useState(false);
  
  const [badgePage, setBadgePage] = useState(1);
  const [missionPage, setMissionPage] = useState(1);

  const myZones = zones.filter(z => z.ownerId === user.id);
  
  // Get earned badges objects
  const earnedBadges = badges.filter(b => user.earnedBadgeIds.includes(b.id));
  const completedMissions = missions.filter(m => user.completedMissionIds.includes(m.id));

  // Pagination for Badges
  const totalBadgePages = Math.ceil(earnedBadges.length / BADGES_PER_PAGE);
  const currentBadges = earnedBadges.slice((badgePage - 1) * BADGES_PER_PAGE, badgePage * BADGES_PER_PAGE);

  // Pagination for Missions
  const totalMissionPages = Math.ceil(completedMissions.length / MISSIONS_PER_PAGE);
  const currentMissions = completedMissions.slice((missionPage - 1) * MISSIONS_PER_PAGE, missionPage * MISSIONS_PER_PAGE);

  const handleSave = () => {
    onUpdateUser({ name, email });
    setIsEditing(false);
  };

  const renderIcon = (iconName: string) => {
    switch(iconName) {
        case 'Flag': return <Flag size={20} />;
        case 'Crown': return <Crown size={20} />;
        case 'Award': return <Award size={20} />;
        default: return <Award size={20} />;
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

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <h2 className="text-3xl font-bold text-white mb-6">Agent Profile</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: User Details */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 flex flex-col items-center text-center shadow-lg relative overflow-hidden">
             {user.isPremium && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-600 to-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1 z-10">
                    <Crown size={12} fill="black" /> PRO AGENT
                </div>
             )}
            <div className="relative mb-4">
              <img 
                src={user.avatar} 
                alt="Profile" 
                className={`w-32 h-32 rounded-full border-4 shadow-[0_0_20px_rgba(16,185,129,0.3)] ${user.isPremium ? 'border-yellow-400' : 'border-emerald-500'}`} 
              />
              <div className="absolute bottom-0 right-0 bg-gray-900 p-2 rounded-full border border-gray-700">
                <Shield size={16} className={user.isPremium ? 'text-yellow-400' : 'text-emerald-400'} />
              </div>
            </div>
            
            {!isEditing ? (
              <>
                <h3 className="text-2xl font-bold text-white">{user.name}</h3>
                <p className="text-gray-400 text-sm mb-6">{user.email || 'No email linked'}</p>
                <button 
                  onClick={() => setIsEditing(true)}
                  className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                >
                  Edit Profile
                </button>
              </>
            ) : (
              <div className="w-full space-y-4">
                <div className="text-left">
                  <label className="text-xs text-gray-500 mb-1 block">Display Name</label>
                  <div className="flex items-center bg-gray-900 rounded-lg border border-gray-700 px-3 py-2">
                    <UserIcon size={16} className="text-gray-500 mr-2" />
                    <input 
                      type="text" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)}
                      className="bg-transparent text-white w-full focus:outline-none"
                    />
                  </div>
                </div>
                <div className="text-left">
                  <label className="text-xs text-gray-500 mb-1 block">Email Address</label>
                  <div className="flex items-center bg-gray-900 rounded-lg border border-gray-700 px-3 py-2">
                    <Mail size={16} className="text-gray-500 mr-2" />
                    <input 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-transparent text-white w-full focus:outline-none"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-2 bg-gray-700 text-gray-300 rounded-lg text-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSave}
                    className="flex-1 py-2 bg-emerald-500 text-black font-bold rounded-lg text-sm flex items-center justify-center gap-2"
                  >
                    <Save size={16} /> Save
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Premium Card */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 shadow-lg">
             <div className="flex items-center gap-2 mb-4">
               <Crown className={user.isPremium ? 'text-yellow-400' : 'text-gray-500'} />
               <h4 className="font-bold text-white">Subscription Status</h4>
             </div>
             
             {user.isPremium ? (
               <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-lg">
                  <p className="text-yellow-400 font-bold text-sm mb-1">Premium Active</p>
                  <p className="text-xs text-yellow-200/70">Auto-sync enabled. Priority support active.</p>
               </div>
             ) : (
               <div className="space-y-4">
                  <p className="text-sm text-gray-400">Upgrade to Pro to unlock automatic Strava sync and more.</p>
                  <button 
                    onClick={onUpgradePremium}
                    className="w-full py-2 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black font-bold rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                     <Crown size={14} /> Upgrade ({PREMIUM_COST} GOV)
                  </button>
               </div>
             )}
          </div>

          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 shadow-lg">
             <h4 className="font-bold text-white mb-4 flex items-center gap-2">
               <Activity size={18} className="text-emerald-400" /> Stats Overview
             </h4>
             <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                  <span className="text-gray-400">Total Distance</span>
                  <span className="text-white font-mono">{user.totalKm.toFixed(2)} km</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                   <span className="text-gray-400">Zones Conquered</span>
                   <span className="text-emerald-400 font-bold">{myZones.length}</span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-gray-400">Items Owned</span>
                   <span className="text-white">{user.inventory.reduce((acc, i) => acc + i.quantity, 0)}</span>
                </div>
             </div>
          </div>
        </div>

        {/* Right Column: Financials, Zones, Achievements */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Financials */}
          <div className="bg-gradient-to-r from-gray-800 to-gray-800 rounded-xl border border-gray-700 p-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5">
               <Coins size={150} />
             </div>
             <h3 className="text-xl font-bold text-white mb-6">Financial Status</h3>
             <div className="grid grid-cols-2 gap-6 relative z-10">
               <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-600/50">
                 <p className="text-gray-400 text-sm mb-1">RUN Balance</p>
                 <p className="text-3xl font-bold text-emerald-400">{user.runBalance.toFixed(2)}</p>
               </div>
               <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-600/50">
                 <p className="text-gray-400 text-sm mb-1">GOV Balance</p>
                 <p className="text-3xl font-bold text-cyan-400">{user.govBalance.toFixed(2)}</p>
               </div>
             </div>
          </div>

          {/* Achievements Section */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
               <Award className="text-yellow-400" /> Achievements
            </h3>
            
            <div className="space-y-6">
                {/* Badges */}
                <div>
                   <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Earned Badges</h4>
                   {earnedBadges.length > 0 ? (
                       <>
                         <div className="flex flex-wrap gap-4">
                             {currentBadges.map(badge => (
                                 <div key={badge.id} className={`p-3 rounded-lg flex items-center gap-3 pr-5 border ${getRarityColor(badge.rarity)}`} title={badge.description}>
                                      <div>
                                          {renderIcon(badge.icon)}
                                      </div>
                                      <div>
                                          <div className="text-sm font-bold">{badge.name}</div>
                                          <div className="text-[10px] font-bold opacity-70">{badge.rarity}</div>
                                      </div>
                                 </div>
                             ))}
                         </div>
                         <Pagination currentPage={badgePage} totalPages={totalBadgePages} onPageChange={setBadgePage} />
                       </>
                   ) : (
                       <p className="text-gray-500 text-sm">No badges earned yet.</p>
                   )}
                </div>

                {/* Completed Missions */}
                <div>
                   <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Completed Missions</h4>
                   {completedMissions.length > 0 ? (
                       <>
                         <div className="space-y-2">
                             {currentMissions.map(mission => (
                                 <div key={mission.id} className="flex justify-between items-center bg-gray-900/50 p-3 rounded-lg border border-emerald-500/30">
                                     <div className="flex flex-col">
                                         <span className="text-sm text-white font-medium">{mission.title}</span>
                                         <span className="text-[10px] text-gray-500">{mission.rarity}</span>
                                     </div>
                                     <span className="text-xs font-mono text-emerald-400">+{mission.rewardGov} GOV</span>
                                 </div>
                             ))}
                         </div>
                         <Pagination currentPage={missionPage} totalPages={totalMissionPages} onPageChange={setMissionPage} />
                       </>
                   ) : (
                       <p className="text-gray-500 text-sm">No missions completed yet.</p>
                   )}
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;