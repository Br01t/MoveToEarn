
import React, { useState } from 'react';
import { Mission, Badge, Rarity } from '../../types';
import { Edit2, Target, Award, Search, Trash2 } from 'lucide-react';
import Pagination from '../Pagination';

interface AdminMissionsTabProps {
  missions: Mission[];
  badges: Badge[];
  onAddMission: (mission: Mission) => void;
  onUpdateMission: (mission: Mission) => void;
  onRemoveMission: (id: string) => void;
  onAddBadge: (badge: Badge) => void;
  onUpdateBadge: (badge: Badge) => void;
  onRemoveBadge: (id: string) => void;
}

const PAGE_SIZE = 5;

const AdminMissionsTab: React.FC<AdminMissionsTabProps> = ({ 
    missions, badges, 
    onAddMission, onUpdateMission, onRemoveMission,
    onAddBadge, onUpdateBadge, onRemoveBadge
}) => {
  // Mission State
  const [missionSearch, setMissionSearch] = useState('');
  const [missionPage, setMissionPage] = useState(1);
  const [editingMissionId, setEditingMissionId] = useState<string | null>(null);
  const [missionForm, setMissionForm] = useState({
      title: '', description: '', rewardRun: '100', rewardGov: '0', conditionType: 'TOTAL_KM', conditionValue: '50', rarity: 'COMMON'
  });

  // Badge State
  const [badgeSearch, setBadgeSearch] = useState('');
  const [badgePage, setBadgePage] = useState(1);
  const [editingBadgeId, setEditingBadgeId] = useState<string | null>(null);
  const [badgeForm, setBadgeForm] = useState({
      name: '', description: '', icon: 'Award', conditionType: 'TOTAL_KM', conditionValue: '100', rarity: 'COMMON', rewardRun: '50', rewardGov: '0'
  });

  // --- MISSION HANDLERS ---
  const filteredMissions = missions.filter(m => m.title.toLowerCase().includes(missionSearch.toLowerCase()));
  const currentMissions = filteredMissions.slice((missionPage - 1) * PAGE_SIZE, missionPage * PAGE_SIZE);
  const totalMissionPages = Math.ceil(filteredMissions.length / PAGE_SIZE);

  const startEditMission = (m: Mission) => {
      setEditingMissionId(m.id);
      setMissionForm({
          title: m.title,
          description: m.description,
          rewardRun: m.rewardRun.toString(),
          rewardGov: (m.rewardGov || 0).toString(),
          conditionType: m.conditionType || 'TOTAL_KM',
          conditionValue: (m.conditionValue || 0).toString(),
          rarity: m.rarity
      });
  };

  const cancelEditMission = () => {
      setEditingMissionId(null);
      setMissionForm({ title: '', description: '', rewardRun: '100', rewardGov: '0', conditionType: 'TOTAL_KM', conditionValue: '50', rarity: 'COMMON' });
  };

  const handleMissionSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const missionData: Mission = {
          id: editingMissionId || `m_${Date.now()}`,
          title: missionForm.title, 
          description: missionForm.description,
          rewardRun: parseInt(missionForm.rewardRun),
          rewardGov: parseInt(missionForm.rewardGov),
          conditionType: missionForm.conditionType as 'TOTAL_KM' | 'OWN_ZONES',
          conditionValue: parseInt(missionForm.conditionValue),
          rarity: missionForm.rarity as Rarity
      };

      if (editingMissionId) onUpdateMission(missionData);
      else onAddMission(missionData);
      cancelEditMission();
  };

  // --- BADGE HANDLERS ---
  const filteredBadges = badges.filter(b => b.name.toLowerCase().includes(badgeSearch.toLowerCase()));
  const currentBadges = filteredBadges.slice((badgePage - 1) * PAGE_SIZE, badgePage * PAGE_SIZE);
  const totalBadgePages = Math.ceil(filteredBadges.length / PAGE_SIZE);

  const startEditBadge = (b: Badge) => {
      setEditingBadgeId(b.id);
      setBadgeForm({
          name: b.name,
          description: b.description,
          icon: b.icon,
          conditionType: b.conditionType || 'TOTAL_KM',
          conditionValue: (b.conditionValue || 0).toString(),
          rarity: b.rarity,
          rewardRun: (b.rewardRun || 0).toString(),
          rewardGov: (b.rewardGov || 0).toString()
      });
  };

  const cancelEditBadge = () => {
      setEditingBadgeId(null);
      setBadgeForm({ name: '', description: '', icon: 'Award', conditionType: 'TOTAL_KM', conditionValue: '100', rarity: 'COMMON', rewardRun: '50', rewardGov: '0' });
  };

  const handleBadgeSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const badgeData: Badge = {
          id: editingBadgeId || `b_${Date.now()}`,
          name: badgeForm.name, 
          description: badgeForm.description, 
          icon: badgeForm.icon,
          conditionType: badgeForm.conditionType as 'TOTAL_KM' | 'OWN_ZONES',
          conditionValue: parseInt(badgeForm.conditionValue),
          rarity: badgeForm.rarity as Rarity,
          rewardRun: parseInt(badgeForm.rewardRun),
          rewardGov: parseInt(badgeForm.rewardGov)
      };

      if (editingBadgeId) onUpdateBadge(badgeData);
      else onAddBadge(badgeData);
      cancelEditBadge();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Missions Section */}
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-white flex gap-2">
                {editingMissionId ? <Edit2 className="text-blue-400" /> : <Target className="text-emerald-400"/>} 
                {editingMissionId ? 'Edit Mission' : 'Missions'}
            </h3>
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                <form onSubmit={handleMissionSubmit} className="space-y-3">
                    <input placeholder="Mission Title" value={missionForm.title} onChange={e => setMissionForm({...missionForm, title: e.target.value})} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white" />
                    <input placeholder="Description" value={missionForm.description} onChange={e => setMissionForm({...missionForm, description: e.target.value})} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white" />
                    <div className="grid grid-cols-2 gap-2">
                            <select value={missionForm.conditionType} onChange={e => setMissionForm({...missionForm, conditionType: e.target.value})} className="bg-gray-900 border border-gray-600 rounded p-2 text-white"><option value="TOTAL_KM">Total KM</option><option value="OWN_ZONES">Owned Zones</option></select>
                            <select value={missionForm.rarity} onChange={e => setMissionForm({...missionForm, rarity: e.target.value})} className="bg-gray-900 border border-gray-600 rounded p-2 text-white"><option value="COMMON">Common</option><option value="RARE">Rare</option><option value="EPIC">Epic</option><option value="LEGENDARY">Legendary</option></select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <input type="number" placeholder="Value" value={missionForm.conditionValue} onChange={e => setMissionForm({...missionForm, conditionValue: e.target.value})} className="bg-gray-900 border border-gray-600 rounded p-2 text-white" />
                        <div className="grid grid-cols-2 gap-2">
                            <input type="number" placeholder="RUN" value={missionForm.rewardRun} onChange={e => setMissionForm({...missionForm, rewardRun: e.target.value})} className="bg-gray-900 border border-emerald-500 rounded p-2 text-white" />
                            <input type="number" placeholder="GOV" value={missionForm.rewardGov} onChange={e => setMissionForm({...missionForm, rewardGov: e.target.value})} className="bg-gray-900 border border-cyan-500 rounded p-2 text-white" />
                        </div>
                    </div>
                    <div className="flex gap-2">
                            {editingMissionId && <button type="button" onClick={cancelEditMission} className="flex-1 py-2 bg-gray-700 text-white rounded font-bold">Cancel</button>}
                            <button className={`flex-1 py-2 ${editingMissionId ? 'bg-blue-600' : 'bg-emerald-600'} text-white rounded font-bold`}>{editingMissionId ? 'Update Mission' : 'Add Mission'}</button>
                    </div>
                </form>
            </div>
            
            {/* List */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
                <input 
                    type="text" 
                    placeholder="Search missions..." 
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-9 pr-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                    value={missionSearch}
                    onChange={(e) => { setMissionSearch(e.target.value); setMissionPage(1); }}
                />
            </div>
            <div className="space-y-2">
                {currentMissions.map(m => (
                    <div key={m.id} className="bg-gray-800 p-3 rounded flex justify-between items-center border border-gray-700">
                        <div><span className="font-bold text-white block">{m.title}</span><span className="text-xs text-gray-500">{m.rarity} | Target: {m.conditionValue} {m.conditionType}</span></div>
                        <div className="flex gap-1">
                            <button onClick={() => startEditMission(m)} className="text-blue-400 p-1 hover:bg-blue-500/10 rounded"><Edit2 size={16}/></button>
                            <button onClick={() => onRemoveMission(m.id)} className="text-red-500 p-1 hover:bg-red-500/10 rounded"><Trash2 size={16}/></button>
                        </div>
                    </div>
                ))}
                {filteredMissions.length === 0 && <p className="text-gray-500 text-center py-4">No missions found.</p>}
                <Pagination currentPage={missionPage} totalPages={totalMissionPages} onPageChange={setMissionPage} />
            </div>
        </div>

        {/* Badges Section */}
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-white flex gap-2">
                {editingBadgeId ? <Edit2 className="text-blue-400" /> : <Award className="text-yellow-400"/>}
                {editingBadgeId ? 'Edit Badge' : 'Badges'}
            </h3>
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                <form onSubmit={handleBadgeSubmit} className="space-y-3">
                    <input placeholder="Badge Name" value={badgeForm.name} onChange={e => setBadgeForm({...badgeForm, name: e.target.value})} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white" />
                    <input placeholder="Description" value={badgeForm.description} onChange={e => setBadgeForm({...badgeForm, description: e.target.value})} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white" />
                    <div className="grid grid-cols-2 gap-2">
                            <select value={badgeForm.icon} onChange={e => setBadgeForm({...badgeForm, icon: e.target.value})} className="bg-gray-900 border border-gray-600 rounded p-2 text-white"><option value="Award">Award</option><option value="Flag">Flag</option><option value="Crown">Crown</option></select>
                            <select value={badgeForm.rarity} onChange={e => setBadgeForm({...badgeForm, rarity: e.target.value})} className="bg-gray-900 border border-gray-600 rounded p-2 text-white"><option value="COMMON">Common</option><option value="RARE">Rare</option><option value="EPIC">Epic</option><option value="LEGENDARY">Legendary</option></select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <select value={badgeForm.conditionType} onChange={e => setBadgeForm({...badgeForm, conditionType: e.target.value})} className="bg-gray-900 border border-gray-600 rounded p-2 text-white"><option value="TOTAL_KM">Total KM</option><option value="OWN_ZONES">Owned Zones</option></select>
                        <input type="number" placeholder="Value" value={badgeForm.conditionValue} onChange={e => setBadgeForm({...badgeForm, conditionValue: e.target.value})} className="bg-gray-900 border border-gray-600 rounded p-2 text-white" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="grid grid-cols-2 gap-2 col-span-2">
                            <input type="number" placeholder="RUN" value={badgeForm.rewardRun} onChange={e => setBadgeForm({...badgeForm, rewardRun: e.target.value})} className="bg-gray-900 border border-emerald-500 rounded p-2 text-white" />
                            <input type="number" placeholder="GOV" value={badgeForm.rewardGov} onChange={e => setBadgeForm({...badgeForm, rewardGov: e.target.value})} className="bg-gray-900 border border-cyan-500 rounded p-2 text-white" />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {editingBadgeId && <button type="button" onClick={cancelEditBadge} className="flex-1 py-2 bg-gray-700 text-white rounded font-bold">Cancel</button>}
                        <button className={`flex-1 py-2 ${editingBadgeId ? 'bg-blue-600' : 'bg-yellow-600'} text-white rounded font-bold`}>{editingBadgeId ? 'Update Badge' : 'Add Badge'}</button>
                    </div>
                </form>
            </div>
            
            {/* List */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
                <input 
                    type="text" 
                    placeholder="Search badges..." 
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-9 pr-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                    value={badgeSearch}
                    onChange={(e) => { setBadgeSearch(e.target.value); setBadgePage(1); }}
                />
            </div>
            <div className="space-y-2">
                {currentBadges.map(b => (
                    <div key={b.id} className="bg-gray-800 p-3 rounded flex justify-between items-center border border-gray-700">
                        <div><span className="font-bold text-white block">{b.name}</span><span className="text-xs text-gray-500">{b.rarity} | Target: {b.conditionValue} {b.conditionType}</span></div>
                        <div className="flex gap-1">
                            <button onClick={() => startEditBadge(b)} className="text-blue-400 p-1 hover:bg-blue-500/10 rounded"><Edit2 size={16}/></button>
                            <button onClick={() => onRemoveBadge(b.id)} className="text-red-500 p-1 hover:bg-red-500/10 rounded"><Trash2 size={16}/></button>
                        </div>
                    </div>
                ))}
                {filteredBadges.length === 0 && <p className="text-gray-500 text-center py-4">No badges found.</p>}
                <Pagination currentPage={badgePage} totalPages={totalBadgePages} onPageChange={setBadgePage} />
            </div>
        </div>
    </div>
  );
};

export default AdminMissionsTab;