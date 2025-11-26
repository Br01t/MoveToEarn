import React from 'react';
import { User, Zone } from '../types';
import { Trophy, Medal, Map } from 'lucide-react';

interface MockUser {
  id: string;
  name: string;
  totalKm: number;
  avatar: string;
}

interface LeaderboardProps {
  users: Record<string, MockUser>;
  currentUser: User;
  zones: Zone[];
}

const Leaderboard: React.FC<LeaderboardProps> = ({ users, currentUser, zones }) => {
  // Compute rankings on the fly
  const rankings = Object.values(users).map((u: MockUser) => {
     // If it's the current user, use the latest live data
     if (u.id === currentUser.id) {
        return {
           ...u,
           totalKm: currentUser.totalKm,
           zonesOwned: zones.filter(z => z.ownerId === currentUser.id).length
        };
     }
     return {
        ...u,
        zonesOwned: zones.filter(z => z.ownerId === u.id).length
     }
  }).sort((a, b) => b.totalKm - a.totalKm);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
        <Trophy className="text-yellow-400" /> Global Leaderboard
      </h2>

      <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-900 text-gray-400 text-xs uppercase font-bold">
            <tr>
              <th className="px-6 py-4">Rank</th>
              <th className="px-6 py-4">Runner</th>
              <th className="px-6 py-4 text-right">Distance (KM)</th>
              <th className="px-6 py-4 text-right">Zones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {rankings.map((user, index) => {
              const isMe = user.id === currentUser.id;
              let rankIcon = null;
              if (index === 0) rankIcon = <Medal className="text-yellow-400" size={20} />;
              else if (index === 1) rankIcon = <Medal className="text-gray-300" size={20} />;
              else if (index === 2) rankIcon = <Medal className="text-amber-600" size={20} />;

              return (
                <tr key={user.id} className={`${isMe ? 'bg-emerald-900/10' : 'hover:bg-gray-750'} transition-colors`}>
                  <td className="px-6 py-4 font-bold text-white w-20">
                    <div className="flex items-center gap-2">
                      <span className="w-6">{index + 1}</span>
                      {rankIcon}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full bg-gray-600" />
                      <span className={`font-medium ${isMe ? 'text-emerald-400' : 'text-gray-300'}`}>
                        {user.name} {isMe && '(You)'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-cyan-400">
                    {user.totalKm.toFixed(1)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 text-gray-300">
                      {user.zonesOwned} <Map size={14} className="text-gray-500" />
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