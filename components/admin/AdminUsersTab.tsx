import React, { useState, useEffect } from 'react';
import { User, Mission, Badge, LevelConfig } from '../../types';
import { Search, User as UserIcon, Award, Target, Trash2, Wallet } from 'lucide-react';
import { NotificationToast, ConfirmModal } from './AdminUI';

interface AdminUsersTabProps {
  allUsers: Record<string, Omit<User, 'inventory'>>;
  missions: Mission[];
  badges: Badge[];
  levels?: LevelConfig[];
  onRevokeAchievement?: (userId: string, type: 'MISSION' | 'BADGE', idToRemove: string) => Promise<{ error?: string, success?: boolean }>;
  onAdjustBalance?: (userId: string, runChange: number, govChange: number) => Promise<{ error?: string, success?: boolean }>;
}

const AdminUsersTab: React.FC<AdminUsersTabProps> = ({ allUsers, missions, badges, levels = [], onRevokeAchievement, onAdjustBalance }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [balanceAmount, setBalanceAmount] = useState<string>('');
  
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ title: string, message: string, action: () => Promise<void> } | null>(null);

  // 👇 LOG allUsers when the component loads or updates
  useEffect(() => {
    console.log("🔍 allUsers received by AdminUsersTab:", allUsers);
  }, [allUsers]);


  const filteredUsers = Object.values(allUsers).filter((u): u is Omit<User, 'inventory'> => 
    (u as any).name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u as any).email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 👇 LOG users filtered by search
  useEffect(() => {
    console.log("🔎 Users after search filter:", filteredUsers);
  }, [searchTerm, filteredUsers]);


  const selectedUser = selectedUserId ? allUsers[selectedUserId] : null;

  // 👇 LOG selected user
  useEffect(() => {
    console.log("👤 Selected User:", selectedUser);
  }, [selectedUserId, selectedUser]);


  // Calculate Level
  const getUserLevel = (user: Omit<User, 'inventory'>) => {
    if (!levels || levels.length === 0) return 1;
    const currentLevelConfig = levels.slice().reverse().find(l => user.totalKm >= l.minKm) || levels[0];
    return currentLevelConfig.level;
  };

  const handleRevoke = (type: 'MISSION' | 'BADGE', itemId: string, itemName: string) => {
    if (!selectedUserId || !onRevokeAchievement) return;

    console.log(`⚠️ Revoking ${type} with ID ${itemId} from user`, selectedUserId);

    setConfirmAction({
      title: `Revoke ${type === 'MISSION' ? 'Mission' : 'Badge'}`,
      message: `Are you sure you want to remove "${itemName}" from ${selectedUser?.name}?`,
      action: async () => {
        const result = await onRevokeAchievement(selectedUserId, type, itemId);
        setNotification(result.success
          ? { message: `${type} revoked successfully`, type: 'success' }
          : { message: result.error || "Revoke failed", type: 'error' }
        );
        setConfirmAction(null);
      }
    });
  };

  const handleBalanceUpdate = async (type: 'RUN' | 'GOV', operation: 'ADD' | 'REMOVE') => {
    if (!selectedUserId || !onAdjustBalance || !balanceAmount) return;

    const amount = parseFloat(balanceAmount);
    if (isNaN(amount) || amount <= 0) {
        setNotification({ message: "Invalid amount", type: 'error' });
        return;
    }

    console.log(`💰 Updating balance: type=${type}, operation=${operation}, amount=${amount}, user=${selectedUserId}`);

    const runChange = type === 'RUN' ? (operation === 'ADD' ? amount : -amount) : 0;
    const govChange = type === 'GOV' ? (operation === 'ADD' ? amount : -amount) : 0;

    const result = await onAdjustBalance(selectedUserId, runChange, govChange);
    setNotification(result.success
      ? { message: `Balance updated successfully`, type: 'success' }
      : { message: result.error || "Update failed", type: 'error' }
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
        {notification && <NotificationToast message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
        {confirmAction && (
            <ConfirmModal 
                title={confirmAction.title} 
                message={confirmAction.message} 
                onConfirm={confirmAction.action} 
                onCancel={() => setConfirmAction(null)} 
                isDestructive
                confirmLabel="Revoke"
            />
        )}

        {/* User List Column */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-700 bg-gray-900/50">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <UserIcon size={18} className="text-emerald-400" /> Users ({Object.keys(allUsers).length})
                    </h3>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={14} />
                    <input 
                        type="text" 
                        placeholder="Search users..." 
                        className="w-full bg-gray-900 border border-gray-600 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {filteredUsers.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-xs">No users found.</div>
                ) : (
                    filteredUsers.map(user => (
                        <button 
                            key={user.id}
                            onClick={() => setSelectedUserId(user.id)}
                            className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${selectedUserId === user.id ? 'bg-emerald-900/30 border border-emerald-500/30' : 'hover:bg-gray-700/50 border border-transparent'}`}
                        >
                            <img src={user.avatar} className="w-8 h-8 rounded-full bg-gray-700 object-cover" alt={user.name} />
                            <div className="min-w-0">
                                <div className={`font-bold text-sm truncate ${selectedUserId === user.id ? 'text-emerald-400' : 'text-white'}`}>{user.name}</div>
                                <div className="text-[10px] text-gray-500 truncate">{user.email || user.id.substring(0,8)}</div>
                            </div>
                        </button>
                    ))
                )}
            </div>
        </div>

        {/* User Details Column */}
        <div className="md:col-span-2 bg-gray-800 rounded-xl border border-gray-700 flex flex-col overflow-hidden">
            {!selectedUser ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                    <UserIcon size={48} className="mb-4 opacity-20" />
                    <p>Select a user to manage achievements.</p>
                </div>
            ) : (
                <div className="flex flex-col h-full">
                    {/* Header Details */}
                    <div className="p-6 border-b border-gray-700 bg-gray-900/30 flex items-center gap-4">
                        <img src={selectedUser.avatar} className="w-16 h-16 rounded-full border-2 border-gray-600 object-cover" alt={selectedUser.name} />
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-bold text-white">{selectedUser.name}</h2>
                                    <p className="text-gray-400 text-sm font-mono">{selectedUser.id}</p>
                                </div>
                                <div className="bg-gray-900 px-3 py-1 rounded border border-gray-600 text-center">
                                    <div className="text-[10px] text-gray-500 uppercase font-bold">Level</div>
                                    <div className="text-xl font-bold text-white">{getUserLevel(selectedUser)}</div>
                                </div>
                            </div>
                            
                            <div className="flex gap-4 mt-3 text-xs">
                                <span className="bg-gray-900 px-2 py-1 rounded text-emerald-400 font-mono font-bold">RUN: {selectedUser.runBalance.toFixed(0)}</span>
                                <span className="bg-gray-900 px-2 py-1 rounded text-cyan-400 font-mono font-bold">GOV: {selectedUser.govBalance.toFixed(0)}</span>
                                <span className="bg-gray-900 px-2 py-1 rounded text-white font-mono font-bold">KM: {selectedUser.totalKm.toFixed(1)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Content Tabs */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-8">
                        
                        {/* Wallet Management Section */}
                        <div>
                            <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-gray-700 pb-2">
                                <Wallet size={20} className="text-blue-400" /> 
                                Wallet Management
                            </h4>
                            <div className="flex items-end gap-3 bg-gray-900/50 p-4 rounded-xl border border-gray-700">
                                <div className="flex-1">
                                    <label className="text-xs text-gray-400 font-bold uppercase mb-1 block">Amount</label>
                                    <input 
                                        type="number" 
                                        value={balanceAmount} 
                                        onChange={(e) => setBalanceAmount(e.target.value)} 
                                        className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white"
                                        placeholder="0"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <div className="flex flex-col gap-1">
                                        <button onClick={() => handleBalanceUpdate('RUN', 'ADD')} className="px-3 py-1 bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-500/50 rounded text-emerald-400 hover:text-white text-xs font-bold transition-colors">+ RUN</button>
                                        <button onClick={() => handleBalanceUpdate('RUN', 'REMOVE')} className="px-3 py-1 bg-red-600/20 hover:bg-red-600 border border-red-500/50 rounded text-red-400 hover:text-white text-xs font-bold transition-colors">- RUN</button>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <button onClick={() => handleBalanceUpdate('GOV', 'ADD')} className="px-3 py-1 bg-cyan-600/20 hover:bg-cyan-600 border border-cyan-500/50 rounded text-cyan-400 hover:text-white text-xs font-bold transition-colors">+ GOV</button>
                                        <button onClick={() => handleBalanceUpdate('GOV', 'REMOVE')} className="px-3 py-1 bg-red-600/20 hover:bg-red-600 border border-red-500/50 rounded text-red-400 hover:text-white text-xs font-bold transition-colors">- GOV</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Missions Section */}
                        <div>
                            <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-gray-700 pb-2">
                                <Target size={20} className="text-emerald-400" /> 
                                Completed Missions ({selectedUser.completedMissionIds.length})
                            </h4>
                            {selectedUser.completedMissionIds.length === 0 ? (
                                <p className="text-gray-500 text-sm italic">No missions completed.</p>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                    {selectedUser.completedMissionIds.map(missionId => {
                                        const mission = missions.find(m => m.id === missionId);
                                        if (!mission) return null;
                                        return (
                                            <div key={mission.id} className="bg-gray-900/50 p-3 rounded-lg border border-gray-700 flex justify-between items-center group hover:border-red-500/30 transition-colors">
                                                <div className="min-w-0 pr-2">
                                                    <div className="font-bold text-sm text-gray-200 truncate">{mission.title}</div>
                                                    <div className="text-[10px] text-gray-500">{mission.category} • {mission.rarity}</div>
                                                </div>
                                                <button 
                                                    onClick={() => handleRevoke('MISSION', mission.id, mission.title)}
                                                    className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                                                    title="Revoke Mission"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Badges Section */}
                        <div>
                            <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-gray-700 pb-2">
                                <Award size={20} className="text-yellow-400" /> 
                                Earned Badges ({selectedUser.earnedBadgeIds.length})
                            </h4>
                            {selectedUser.earnedBadgeIds.length === 0 ? (
                                <p className="text-gray-500 text-sm italic">No badges earned.</p>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                    {selectedUser.earnedBadgeIds.map(badgeId => {
                                        const badge = badges.find(b => b.id === badgeId);
                                        if (!badge) return null;
                                        return (
                                            <div key={badge.id} className="bg-gray-900/50 p-3 rounded-lg border border-gray-700 flex justify-between items-center group hover:border-red-500/30 transition-colors">
                                                <div className="min-w-0 pr-2 flex items-center gap-3">
                                                    <Award size={16} className="text-yellow-500/50" />
                                                    <div>
                                                        <div className="font-bold text-sm text-gray-200 truncate">{badge.name}</div>
                                                        <div className="text-[10px] text-gray-500">{badge.rarity}</div>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => handleRevoke('BADGE', badge.id, badge.name)}
                                                    className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                                                    title="Revoke Badge"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            )}
        </div>
    </div>
  );
};

export default AdminUsersTab;