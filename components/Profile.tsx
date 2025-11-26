
import React, { useState } from 'react';
import { User, Zone } from '../types';
import { Save, User as UserIcon, Mail, MapPin, Activity, Coins, Shield } from 'lucide-react';

interface ProfileProps {
  user: User;
  zones: Zone[];
  onUpdateUser: (updates: Partial<User>) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, zones, onUpdateUser }) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email || '');
  const [isEditing, setIsEditing] = useState(false);

  const myZones = zones.filter(z => z.ownerId === user.id);
  // Calculate potential yield per hour for display instead of pending
  const totalYieldRate = myZones.reduce((acc, z) => acc + z.interestRate, 0);

  const handleSave = () => {
    onUpdateUser({ name, email });
    setIsEditing(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <h2 className="text-3xl font-bold text-white mb-6">Agent Profile</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: User Details */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 flex flex-col items-center text-center shadow-lg">
            <div className="relative mb-4">
              <img 
                src={user.avatar} 
                alt="Profile" 
                className="w-32 h-32 rounded-full border-4 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]" 
              />
              <div className="absolute bottom-0 right-0 bg-gray-900 p-2 rounded-full border border-gray-700">
                <Shield size={16} className="text-emerald-400" />
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

        {/* Right Column: Financials & Zones */}
        <div className="lg:col-span-2 space-y-6">
          {/* Wallet Summary Card */}
          <div className="bg-gradient-to-r from-gray-800 to-gray-800 rounded-xl border border-gray-700 p-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5">
               <Coins size={150} />
             </div>
             <h3 className="text-xl font-bold text-white mb-6">Financial Status</h3>
             <div className="grid grid-cols-2 gap-6 relative z-10">
               <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-600/50">
                 <p className="text-gray-400 text-sm mb-1">RUN Balance</p>
                 <p className="text-3xl font-bold text-emerald-400">{user.runBalance.toFixed(2)}</p>
                 <p className="text-xs text-emerald-500/70 mt-2">Auto-Compounding Enabled</p>
               </div>
               <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-600/50">
                 <p className="text-gray-400 text-sm mb-1">GOV Balance</p>
                 <p className="text-3xl font-bold text-cyan-400">{user.govBalance.toFixed(2)}</p>
                 <p className="text-xs text-cyan-500/70 mt-2">Governance Power</p>
               </div>
             </div>
          </div>

          {/* Owned Zones Grid */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 min-h-[300px]">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
               <MapPin className="text-emerald-400" /> My Territories
            </h3>
            
            {myZones.length === 0 ? (
               <div className="text-center text-gray-500 py-10">
                  <MapPin size={48} className="mx-auto mb-3 opacity-20" />
                  <p>You haven't conquered any zones yet.</p>
                  <p className="text-sm">Start running to claim your first territory!</p>
               </div>
            ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myZones.map(zone => (
                    <div key={zone.id} className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 flex justify-between items-center group hover:border-emerald-500/30 transition-colors">
                       <div>
                          <h5 className="font-bold text-white group-hover:text-emerald-400 transition-colors">{zone.name}</h5>
                          <div className="text-xs text-gray-500 mt-1 flex gap-3">
                             <span>Yield: {zone.interestRate}%</span>
                             <span>Def: Lvl {zone.defenseLevel}</span>
                          </div>
                       </div>
                       <div className="text-right">
                          <span className="block text-xs text-gray-400">Status</span>
                          <span className="font-mono font-bold text-emerald-400">Active</span>
                       </div>
                    </div>
                  ))}
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
