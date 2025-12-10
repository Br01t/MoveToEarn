
import React, { useState } from 'react';
import { Mission, Badge, Rarity, AchievementCategory, Difficulty } from '../../types';
import { Edit2, Target, Award, Search, Trash2, Save, X, Plus } from 'lucide-react';
import Pagination from '../Pagination';
import { NotificationToast, ConfirmModal } from './AdminUI';

interface AdminMissionsTabProps {
  missions: Mission[];
  badges: Badge[];
  onAddMission: (mission: Mission) => Promise<{ error?: string, success?: boolean }>;
  onUpdateMission: (mission: Mission) => Promise<{ error?: string, success?: boolean }>;
  onRemoveMission: (id: string) => Promise<{ error?: string, success?: boolean }>;
  onAddBadge: (badge: Badge) => Promise<{ error?: string, success?: boolean }>;
  onUpdateBadge: (badge: Badge) => Promise<{ error?: string, success?: boolean }>;
  onRemoveBadge: (id: string) => Promise<{ error?: string, success?: boolean }>;
}

const PAGE_SIZE = 5;

const CATEGORIES: AchievementCategory[] = ['Distance', 'Speed', 'Technical', 'TimeOfDay', 'Zone', 'Streak', 'Exploration', 'Social', 'Meta', 'Special', 'Event', 'Training', 'Performance', 'Endurance', 'Economy', 'Onboarding'];
const DIFFICULTIES: Difficulty[] = ['Easy', 'Medium', 'Hard', 'Expert', 'Special'];

const AdminMissionsTab: React.FC<AdminMissionsTabProps> = ({ 
    missions, badges, 
    onAddMission, onUpdateMission, onRemoveMission,
    onAddBadge, onUpdateBadge, onRemoveBadge
}) => {
  // UI Feedback States
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ title: string, message: string, action: () => void } | null>(null);

  // Mission State
  const [missionSearch, setMissionSearch] = useState('');
  const [missionPage, setMissionPage] = useState(1);
  const [editingMissionId, setEditingMissionId] = useState<string | null>(null);
  
  const defaultMissionForm = {
      title: '', description: '', rewardRun: '100', rewardGov: '0', 
      conditionType: 'TOTAL_KM', conditionValue: '50', rarity: 'COMMON',
      category: 'Distance', difficulty: 'Easy', logicId: ''
  };
  const [missionForm, setMissionForm] = useState(defaultMissionForm);

  // Badge State
  const [badgeSearch, setBadgeSearch] = useState('');
  const [badgePage, setBadgePage] = useState(1);
  const [editingBadgeId, setEditingBadgeId] = useState<string | null>(null);
  
  const defaultBadgeForm = {
      name: '', description: '', icon: 'Award', 
      conditionType: 'TOTAL_KM', conditionValue: '100', rarity: 'COMMON', 
      rewardRun: '50', rewardGov: '0',
      category: 'Distance', difficulty: 'Easy', logicId: ''
  };
  const [badgeForm, setBadgeForm] = useState(defaultBadgeForm);

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
          rarity: m.rarity,
          category: m.category || 'Distance',
          difficulty: m.difficulty || 'Easy',
          logicId: m.logicId ? m.logicId.toString() : ''
      });
  };

  const cancelEditMission = () => {
      setEditingMissionId(null);
      setMissionForm(defaultMissionForm);
  };

  const handleMissionSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const missionData: Mission = {
          id: editingMissionId || `m_${Date.now()}`,
          title: missionForm.title, 
          description: missionForm.description,
          rewardRun: parseInt(missionForm.rewardRun) || 0,
          rewardGov: parseInt(missionForm.rewardGov) || 0,
          conditionType: missionForm.conditionType as 'TOTAL_KM' | 'OWN_ZONES',
          conditionValue: parseInt(missionForm.conditionValue) || 0,
          rarity: missionForm.rarity as Rarity,
          category: missionForm.category as AchievementCategory,
          difficulty: missionForm.difficulty as Difficulty,
          logicId: missionForm.logicId ? parseInt(missionForm.logicId) : undefined
      };

      let result;
      if (editingMissionId) result = await onUpdateMission(missionData);
      else result = await onAddMission(missionData);

      if (result.success) {
          setNotification({ message: editingMissionId ? "Mission updated!" : "Mission created!", type: 'success' });
          cancelEditMission();
      } else {
          setNotification({ message: result.error || "Failed to save mission", type: 'error' });
      }
  };

  const handleDeleteMission = (m: Mission) => {
      setConfirmAction({
          title: "Delete Mission",
          message: `Delete mission "${m.title}"?`,
          action: async () => {
              const result = await onRemoveMission(m.id);
              if (result.success) setNotification({ message: "Mission deleted", type: 'success' });
              else setNotification({ message: result.error || "Error deleting mission", type: 'error' });
              setConfirmAction(null);
          }
      });
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
          rewardGov: (b.rewardGov || 0).toString(),
          category: b.category || 'Distance',
          difficulty: b.difficulty || 'Easy',
          logicId: b.logicId ? b.logicId.toString() : ''
      });
  };

  const cancelEditBadge = () => {
      setEditingBadgeId(null);
      setBadgeForm(defaultBadgeForm);
  };

  const handleBadgeSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const badgeData: Badge = {
          id: editingBadgeId || `b_${Date.now()}`,
          name: badgeForm.name, 
          description: badgeForm.description, 
          icon: badgeForm.icon,
          conditionType: badgeForm.conditionType as 'TOTAL_KM' | 'OWN_ZONES',
          conditionValue: parseInt(badgeForm.conditionValue) || 0,
          rarity: badgeForm.rarity as Rarity,
          rewardRun: parseInt(badgeForm.rewardRun) || 0,
          rewardGov: parseInt(badgeForm.rewardGov) || 0,
          category: badgeForm.category as AchievementCategory,
          difficulty: badgeForm.difficulty as Difficulty,
          logicId: badgeForm.logicId ? parseInt(badgeForm.logicId) : undefined
      };

      let result;
      if (editingBadgeId) result = await onUpdateBadge(badgeData);
      else result = await onAddBadge(badgeData);

      if (result.success) {
          setNotification({ message: editingBadgeId ? "Badge updated!" : "Badge created!", type: 'success' });
          cancelEditBadge();
      } else {
          setNotification({ message: result.error || "Failed to save badge", type: 'error' });
      }
  };

  const handleDeleteBadge = (b: Badge) => {
      setConfirmAction({
          title: "Delete Badge",
          message: `Delete badge "${b.name}"?`,
          action: async () => {
              const result = await onRemoveBadge(b.id);
              if (result.success) setNotification({ message: "Badge deleted", type: 'success' });
              else setNotification({ message: result.error || "Error deleting badge", type: 'error' });
              setConfirmAction(null);
          }
      });
  };

  const renderFormInputs = (
      form: any, 
      setForm: any, 
      isMission: boolean, 
      isEditing: boolean, 
      onCancel: () => void
  ) => (
    <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
                <div>
                    <label className="text-xs text-gray-400 font-bold uppercase">{isMission ? 'Title' : 'Name'}</label>
                    <input 
                        value={isMission ? form.title : form.name} 
                        onChange={e => setForm({...form, [isMission ? 'title' : 'name']: e.target.value})} 
                        className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white" 
                        placeholder={isMission ? "Mission Title" : "Badge Name"}
                    />
                </div>
                <div>
                    <label className="text-xs text-gray-400 font-bold uppercase">Description</label>
                    <textarea 
                        value={form.description} 
                        onChange={e => setForm({...form, description: e.target.value})} 
                        className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white resize-none h-20" 
                        placeholder="Description..."
                    />
                </div>
                {!isMission && (
                    <div>
                        <label className="text-xs text-gray-400 font-bold uppercase">Icon (Lucide Name)</label>
                        <input 
                            value={form.icon} 
                            onChange={e => setForm({...form, icon: e.target.value})} 
                            className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white" 
                            placeholder="e.g. Award, Zap, Flag"
                        />
                    </div>
                )}
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="text-xs text-gray-400 font-bold uppercase">Category</label>
                        <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white">
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 font-bold uppercase">Difficulty</label>
                        <select value={form.difficulty} onChange={e => setForm({...form, difficulty: e.target.value})} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white">
                            {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="text-xs text-gray-400 font-bold uppercase">Rarity</label>
                        <select value={form.rarity} onChange={e => setForm({...form, rarity: e.target.value})} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white">
                            <option value="COMMON">Common</option>
                            <option value="RARE">Rare</option>
                            <option value="EPIC">Epic</option>
                            <option value="LEGENDARY">Legendary</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 font-bold uppercase">Logic ID (Optional)</label>
                        <input 
                            type="number" 
                            value={form.logicId} 
                            onChange={e => setForm({...form, logicId: e.target.value})} 
                            className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white" 
                            placeholder="1-100"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="text-xs text-emerald-500 font-bold uppercase">Reward RUN</label>
                        <input type="number" value={form.rewardRun} onChange={e => setForm({...form, rewardRun: e.target.value})} className="w-full bg-gray-900 border border-emerald-500/50 rounded p-2 text-white" />
                    </div>
                    <div>
                        <label className="text-xs text-cyan-500 font-bold uppercase">Reward GOV</label>
                        <input type="number" value={form.rewardGov} onChange={e => setForm({...form, rewardGov: e.target.value})} className="w-full bg-gray-900 border border-cyan-500/50 rounded p-2 text-white" />
                    </div>
                </div>
            </div>
        </div>

        <div className="flex gap-3 pt-2">
            {isEditing && (
                <button type="button" onClick={onCancel} className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold flex items-center gap-2">
                    <X size={16} /> Cancel
                </button>
            )}
            <button type="submit" className={`flex-1 py-2 rounded-lg text-white font-bold flex items-center justify-center gap-2 ${isEditing ? 'bg-blue-600 hover:bg-blue-500' : 'bg-emerald-600 hover:bg-emerald-500'}`}>
                {isEditing ? <Save size={16}/> : <Plus size={16}/>}
                {isEditing ? `Update ${isMission ? 'Mission' : 'Badge'}` : `Create ${isMission ? 'Mission' : 'Badge'}`}
            </button>
        </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {notification && <NotificationToast message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
        {confirmAction && (
            <ConfirmModal 
                title={confirmAction.title} 
                message={confirmAction.message} 
                onConfirm={confirmAction.action} 
                onCancel={() => setConfirmAction(null)} 
                isDestructive
                confirmLabel="Delete"
            />
        )}
        
        {/* MISSIONS SECTION */}
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Target className="text-emerald-400"/> Missions Management
            </h3>
            
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
                <form onSubmit={handleMissionSubmit}>
                    {renderFormInputs(missionForm, setMissionForm, true, !!editingMissionId, cancelEditMission)}
                </form>
            </div>
            
            {/* Mission List */}
            <div className="space-y-3">
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
                <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                    {currentMissions.map(m => (
                        <div key={m.id} className="p-4 border-b border-gray-700 last:border-0 flex justify-between items-center hover:bg-gray-700/50 transition-colors group">
                            <div>
                                <span className="font-bold text-white text-sm block">{m.title}</span>
                                <div className="flex gap-2 text-xs text-gray-400 mt-1">
                                    <span className="bg-gray-900 px-1.5 rounded">{m.category}</span>
                                    <span className="bg-gray-900 px-1.5 rounded">{m.difficulty}</span>
                                    {m.logicId && <span className="text-gray-500">#{m.logicId}</span>}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => startEditMission(m)} className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500 hover:text-white transition-colors"><Edit2 size={16}/></button>
                                <button onClick={() => handleDeleteMission(m)} className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-colors"><Trash2 size={16}/></button>
                            </div>
                        </div>
                    ))}
                    {filteredMissions.length === 0 && <div className="p-8 text-center text-gray-500">No missions found.</div>}
                </div>
                <Pagination currentPage={missionPage} totalPages={totalMissionPages} onPageChange={setMissionPage} />
            </div>
        </div>

        {/* BADGES SECTION */}
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Award className="text-yellow-400"/> Badges Management
            </h3>
            
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
                <form onSubmit={handleBadgeSubmit}>
                    {renderFormInputs(badgeForm, setBadgeForm, false, !!editingBadgeId, cancelEditBadge)}
                </form>
            </div>
            
            {/* Badge List */}
            <div className="space-y-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
                    <input 
                        type="text" 
                        placeholder="Search badges..." 
                        className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-9 pr-3 py-2 text-white focus:border-yellow-500 focus:outline-none"
                        value={badgeSearch}
                        onChange={(e) => { setBadgeSearch(e.target.value); setBadgePage(1); }}
                    />
                </div>
                <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                    {currentBadges.map(b => (
                        <div key={b.id} className="p-4 border-b border-gray-700 last:border-0 flex justify-between items-center hover:bg-gray-700/50 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-900 border border-gray-600 flex items-center justify-center text-gray-400">
                                    <Award size={16} />
                                </div>
                                <div>
                                    <span className="font-bold text-white text-sm block">{b.name}</span>
                                    <div className="flex gap-2 text-xs text-gray-400 mt-1">
                                        <span className="bg-gray-900 px-1.5 rounded">{b.rarity}</span>
                                        <span className="bg-gray-900 px-1.5 rounded">{b.category}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => startEditBadge(b)} className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500 hover:text-white transition-colors"><Edit2 size={16}/></button>
                                <button onClick={() => handleDeleteBadge(b)} className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-colors"><Trash2 size={16}/></button>
                            </div>
                        </div>
                    ))}
                    {filteredBadges.length === 0 && <div className="p-8 text-center text-gray-500">No badges found.</div>}
                </div>
                <Pagination currentPage={badgePage} totalPages={totalBadgePages} onPageChange={setBadgePage} />
            </div>
        </div>
    </div>
  );
};

export default AdminMissionsTab;