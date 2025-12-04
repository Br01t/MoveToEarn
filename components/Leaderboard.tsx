
import React from 'react';
import { User, Zone, Badge, Rarity } from '../types';
import { Trophy, Medal, Map, Award, Flag, Crown, Zap, Mountain, Globe, Home, Landmark, Swords, Footprints, Rocket, Tent, Timer, Building2, Moon, Sun, ShieldCheck, Gem, Users } from 'lucide-react';

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
}

const Leaderboard: React.FC<LeaderboardProps> = ({ users, currentUser, zones, badges }) => {
  // Compute rankings on the fly
  const rankings = Object.values(users).map((u: MockUser) => {
     // If it's the current user, use the latest live data
     if (u.id === currentUser.id) {
        return {
           ...u,
           totalKm: currentUser.totalKm,
           zonesOwned: zones.filter(z => z.ownerId === currentUser.id).length,
           favoriteBadgeId: currentUser.favoriteBadgeId
        };
     }
     return {
        ...u,
        zonesOwned: zones.filter(z => z.ownerId === u.id).length
     }
  }).sort((a, b) => b.totalKm - a.totalKm);

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

  const getRarityColor = (rarity: Rarity) => {
      switch(rarity) {
          case 'LEGENDARY': return 'text-yellow-400 bg-yellow-900/30 border-yellow-500/50';
          case 'EPIC': return 'text-purple-400 bg-purple-900/30 border-purple-500/50';
          case 'RARE': return 'text-cyan-400 bg-cyan-900/30 border-cyan-500/50';
          default: return 'text-gray-400 bg-gray-800 border-gray-600';
      }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
        <Trophy className="text-yellow-400" /> Global Leaderboard
      </h2>

      <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead className="bg-gray-900 text-gray-400 text-xs uppercase font-bold">
            <tr>
              <th className="px-4 md:px-6 py-4">Rank</th>
              <th className="px-4 md:px-6 py-4">Runner</th>
              <th className="px-4 md:px-6 py-4 text-right">Distance (KM)</th>
              <th className="px-4 md:px-6 py-4 text-right">Zones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {rankings.map((user, index) => {
              const isMe = user.id === currentUser.id;
              let rankIcon = null;
              if (index === 0) rankIcon = <Medal className="text-yellow-400" size={24} />;
              else if (index === 1) rankIcon = <Medal className="text-gray-300" size={24} />;
              else if (index === 2) rankIcon = <Medal className="text-amber-600" size={24} />;

              const userBadge = user.favoriteBadgeId ? badges.find(b => b.id === user.favoriteBadgeId) : null;

              return (
                <tr key={user.id} className={`${isMe ? 'bg-emerald-900/20' : 'hover:bg-gray-750'} transition-colors`}>
                  <td className="px-4 md:px-6 py-4 font-bold text-white w-20">
                    <div className="flex items-center gap-3">
                      <span className="w-6 text-lg">{index + 1}</span>
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
                            {user.name} {isMe && '(You)'}
                          </span>
                          
                          {/* BADGE DISPLAY - Bigger and clearer */}
                          {userBadge && (
                               <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md border ${getRarityColor(userBadge.rarity)}`} title={userBadge.name}>
                                   {renderBadgeIcon(userBadge.icon, "w-4 h-4")}
                                   <span className="text-[10px] font-bold uppercase tracking-wide hidden md:inline-block">{userBadge.name}</span>
                               </div>
                          )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4 text-right">
                    <span className="font-mono text-xl font-bold text-cyan-400">{user.totalKm.toFixed(1)}</span>
                  </td>
                  <td className="px-4 md:px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5 text-gray-300 font-bold">
                      {user.zonesOwned} <Map size={16} className="text-gray-500" />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;