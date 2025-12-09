
import React, { useState } from 'react';
import { Item, Mission, Badge, Rarity, Zone, BugReport, LeaderboardConfig, LeaderboardMetric, LevelConfig } from '../types';
import { Settings, Plus, Trash2, Flame, Gift, RefreshCw, Save, X, AlertTriangle, CheckCircle, Package, Target, Award, Map, Edit2, Search, ArrowRightLeft, Bug, Trophy, Calendar, BarChart3 } from 'lucide-react';
import Pagination from './Pagination';
import { useLanguage } from '../LanguageContext';

interface AdminProps {
  marketItems: Item[];
  missions: Mission[];
  badges: Badge[];
  zones: Zone[];
  govToRunRate: number;
  bugReports?: BugReport[];
  leaderboards?: LeaderboardConfig[];
  levels?: LevelConfig[];
  onAddItem: (item: Item) => void;
  onUpdateItem: (item: Item) => void;
  onRemoveItem: (id: string) => void;
  onAddMission: (mission: Mission) => void;
  onUpdateMission: (mission: Mission) => void;
  onRemoveMission: (id: string) => void;
  onAddBadge: (badge: Badge) => void;
  onUpdateBadge: (badge: Badge) => void;
  onRemoveBadge: (id: string) => void;
  onUpdateZoneName: (id: string, name: string) => void;
  onDeleteZone: (id: string) => void;
  onTriggerBurn: () => void;
  onDistributeRewards: () => void;
  onResetSeason: () => void;
  onUpdateExchangeRate: (rate: number) => void;
  onAddLeaderboard?: (config: LeaderboardConfig) => void;
  onUpdateLeaderboard?: (config: LeaderboardConfig) => void;
  onDeleteLeaderboard?: (id: string) => void;
  onResetLeaderboard?: (id: string) => void;
  onAddLevel?: (level: LevelConfig) => void;
  onUpdateLevel?: (level: LevelConfig) => void;
  onDeleteLevel?: (id: string) => void;
}

const ITEMS_PER_PAGE = 5;
const MISSIONS_PER_PAGE = 5;
const BADGES_PER_PAGE = 5;
const ZONES_PER_PAGE = 10;

const Admin: React.FC<AdminProps> = ({ 
  marketItems, missions, badges, zones, govToRunRate, bugReports = [], leaderboards = [], levels = [],
  onAddItem, onUpdateItem, onRemoveItem,
  onAddMission, onUpdateMission, onRemoveMission,
  onAddBadge, onUpdateBadge, onRemoveBadge,
  onUpdateZoneName, onDeleteZone,
  onTriggerBurn, onDistributeRewards, onResetSeason,
  onUpdateExchangeRate, onAddLeaderboard, onUpdateLeaderboard, onDeleteLeaderboard, onResetLeaderboard,
  onAddLevel, onUpdateLevel, onDeleteLevel
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'ITEMS' | 'ECONOMY' | 'MISSIONS' | 'ZONES' | 'LEADERBOARD' | 'REPORTS' | 'LEVELS'>('ITEMS');
  
  // ... (Previous states)
  const [showBurnModal, setShowBurnModal] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [itemSearch, setItemSearch] = useState('');
  const [missionSearch, setMissionSearch] = useState('');
  const [badgeSearch, setBadgeSearch] = useState('');
  const [zoneSearch, setZoneSearch] = useState('');
  const [itemPage, setItemPage] = useState(1);
  const [missionPage, setMissionPage] = useState(1);
  const [badgePage, setBadgePage] = useState(1);
  const [zonePage, setZonePage] = useState(1);
  
  // Leaderboard Form State
  const [lbForm, setLbForm] = useState<{ title: string; desc: string; metric: LeaderboardMetric; type: 'PERMANENT' | 'TEMPORARY'; pool: string; currency: 'GOV' | 'RUN'; endTime?: string }>({
      title: '', desc: '', metric: 'TOTAL_KM', type: 'PERMANENT', pool: '', currency: 'GOV'
  });
  const [editingLbId, setEditingLbId] = useState<string | null>(null);

  // Level Form State
  const [lvlForm, setLvlForm] = useState<{ level: string; minKm: string; title: string }>({
      level: '', minKm: '', title: ''
  });
  const [editingLvlId, setEditingLvlId] = useState<string | null>(null);

  // --- ITEM FORM ---
  const [itemFormData, setItemFormData] = useState<{
    name: string; description: string; priceRun: string; quantity: string;
    type: 'DEFENSE' | 'BOOST' | 'CURRENCY'; effectValue: string;
  }>({ name: '', description: '', priceRun: '100', quantity: '100', type: 'DEFENSE', effectValue: '1' });
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const startEditItem = (item: Item) => {
    setEditingItemId(item.id);
    setItemFormData({
        name: item.name,
        description: item.description,
        priceRun: item.priceRun.toString(),
        quantity: item.quantity.toString(),
        type: item.type,
        effectValue: item.effectValue.toString()
    });
  };

  const cancelEditItem = () => {
    setEditingItemId(null);
    setItemFormData({ name: '', description: '', priceRun: '100', quantity: '100', type: 'DEFENSE', effectValue: '1' });
  };

  const handleSubmitItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemFormData.name) return;
    let iconName = 'Zap';
    if (itemFormData.type === 'DEFENSE') iconName = 'Shield';
    if (itemFormData.type === 'CURRENCY') iconName = 'Coins';

    const itemData: Item = {
      id: editingItemId || `item_${Date.now()}`,
      name: itemFormData.name, 
      description: itemFormData.description,
      priceRun: parseFloat(itemFormData.priceRun), 
      quantity: parseInt(itemFormData.quantity),
      type: itemFormData.type, 
      effectValue: parseFloat(itemFormData.effectValue), 
      icon: iconName
    };

    if (editingItemId) {
        onUpdateItem(itemData);
        alert('Item updated');
    } else {
        onAddItem(itemData);
        alert('Item added');
    }
    cancelEditItem();
  };

  // Filter Items
  const filteredItems = marketItems.filter(item => 
    item.name.toLowerCase().includes(itemSearch.toLowerCase())
  );
  const currentItems = filteredItems.slice((itemPage - 1) * ITEMS_PER_PAGE, itemPage * ITEMS_PER_PAGE);
  const totalItemPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);

  // --- MISSION FORM ---
  const [missionFormData, setMissionFormData] = useState({
      title: '', description: '', rewardRun: '100', rewardGov: '0', conditionType: 'TOTAL_KM', conditionValue: '50', rarity: 'COMMON'
  });
  const [editingMissionId, setEditingMissionId] = useState<string | null>(null);

  const startEditMission = (m: Mission) => {
      setEditingMissionId(m.id);
      setMissionFormData({
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
      setMissionFormData({ title: '', description: '', rewardRun: '100', rewardGov: '0', conditionType: 'TOTAL_KM', conditionValue: '50', rarity: 'COMMON' });
  };

  const handleSubmitMission = (e: React.FormEvent) => {
      e.preventDefault();
      const missionData: Mission = {
          id: editingMissionId || `m_${Date.now()}`,
          title: missionFormData.title, 
          description: missionFormData.description,
          rewardRun: parseInt(missionFormData.rewardRun),
          rewardGov: parseInt(missionFormData.rewardGov),
          conditionType: missionFormData.conditionType as 'TOTAL_KM' | 'OWN_ZONES',
          conditionValue: parseInt(missionFormData.conditionValue),
          rarity: missionFormData.rarity as Rarity
      };

      if (editingMissionId) {
          onUpdateMission(missionData);
      } else {
          onAddMission(missionData);
      }
      cancelEditMission();
  };

  // Filter Missions
  const filteredMissions = missions.filter(m => 
    m.title.toLowerCase().includes(missionSearch.toLowerCase())
  );
  const currentMissions = filteredMissions.slice((missionPage - 1) * MISSIONS_PER_PAGE, missionPage * MISSIONS_PER_PAGE);
  const totalMissionPages = Math.ceil(filteredMissions.length / MISSIONS_PER_PAGE);

  // --- BADGE FORM ---
  const [badgeFormData, setBadgeFormData] = useState({
      name: '', description: '', icon: 'Award', conditionType: 'TOTAL_KM', conditionValue: '100', rarity: 'COMMON', rewardRun: '50', rewardGov: '0'
  });
  const [editingBadgeId, setEditingBadgeId] = useState<string | null>(null);

  const startEditBadge = (b: Badge) => {
      setEditingBadgeId(b.id);
      setBadgeFormData({
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
      setBadgeFormData({ name: '', description: '', icon: 'Award', conditionType: 'TOTAL_KM', conditionValue: '100', rarity: 'COMMON', rewardRun: '50', rewardGov: '0' });
  };

  const handleSubmitBadge = (e: React.FormEvent) => {
      e.preventDefault();
      const badgeData: Badge = {
          id: editingBadgeId || `b_${Date.now()}`,
          name: badgeFormData.name, 
          description: badgeFormData.description, 
          icon: badgeFormData.icon,
          conditionType: badgeFormData.conditionType as 'TOTAL_KM' | 'OWN_ZONES',
          conditionValue: parseInt(badgeFormData.conditionValue),
          rarity: badgeFormData.rarity as Rarity,
          rewardRun: parseInt(badgeFormData.rewardRun),
          rewardGov: parseInt(badgeFormData.rewardGov)
      };

      if (editingBadgeId) {
          onUpdateBadge(badgeData);
      } else {
          onAddBadge(badgeData);
      }
      cancelEditBadge();
  };

  // Filter Badges
  const filteredBadges = badges.filter(b => 
    b.name.toLowerCase().includes(badgeSearch.toLowerCase())
  );
  const currentBadges = filteredBadges.slice((badgePage - 1) * BADGES_PER_PAGE, badgePage * BADGES_PER_PAGE);
  const totalBadgePages = Math.ceil(filteredBadges.length / BADGES_PER_PAGE);
  
  // --- ZONES MANAGEMENT ---
  const [editingZoneId, setEditingZoneId] = useState<string | null>(null);
  const [tempZoneName, setTempZoneName] = useState('');

  const filteredZones = zones.filter(z => z.name.toLowerCase().includes(zoneSearch.toLowerCase()));
  const currentZones = filteredZones.slice((zonePage - 1) * ZONES_PER_PAGE, zonePage * ZONES_PER_PAGE);
  const totalZonePages = Math.ceil(filteredZones.length / ZONES_PER_PAGE);

  const handleEditZoneName = (zone: Zone) => {
    setEditingZoneId(zone.id);
    setTempZoneName(zone.name);
  };

  const handleSaveZoneName = () => {
    if (editingZoneId && tempZoneName) {
      onUpdateZoneName(editingZoneId, tempZoneName);
      setEditingZoneId(null);
      setTempZoneName('');
    }
  };

  const handleDeleteZoneClick = (id: string, name: string) => {
      if (window.confirm(`Are you sure you want to permanently delete zone "${name}"?`)) {
          onDeleteZone(id);
      }
  };

  const handleConfirmBurn = () => { onTriggerBurn(); setShowBurnModal(false); };
  const handleConfirmReward = () => { onDistributeRewards(); setShowRewardModal(false); };

  // --- LEADERBOARD HANDLERS ---
  
  const startEditLeaderboard = (lb: LeaderboardConfig) => {
      setEditingLbId(lb.id);
      // Format date for datetime-local input
      let endDate = '';
      if (lb.endTime) {
           const d = new Date(lb.endTime);
           const offset = d.getTimezoneOffset() * 60000;
           endDate = new Date(d.getTime() - offset).toISOString().slice(0, 16);
      }
      
      setLbForm({
          title: lb.title,
          desc: lb.description,
          metric: lb.metric,
          type: lb.type,
          pool: lb.rewardPool ? lb.rewardPool.toString() : '',
          currency: lb.rewardCurrency || 'GOV',
          endTime: endDate
      });
  };

  const cancelEditLeaderboard = () => {
      setEditingLbId(null);
      setLbForm({ title: '', desc: '', metric: 'TOTAL_KM', type: 'PERMANENT', pool: '', currency: 'GOV', endTime: '' });
  };

  const handleLbTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newType = e.target.value as 'PERMANENT' | 'TEMPORARY';
      let newEndTime = lbForm.endTime;
      
      // If switching to temporary, default to 7 days from now if empty
      if (newType === 'TEMPORARY' && !newEndTime) {
          const d = new Date();
          d.setDate(d.getDate() + 7);
          const offset = d.getTimezoneOffset() * 60000;
          newEndTime = new Date(d.getTime() - offset).toISOString().slice(0, 16);
      }
      
      setLbForm({ ...lbForm, type: newType, endTime: newEndTime });
  };

  const handleSubmitLeaderboard = (e: React.FormEvent) => {
      e.preventDefault();
      if (!onAddLeaderboard || !onUpdateLeaderboard) return;
      
      const config: LeaderboardConfig = {
          id: editingLbId || `lb_${Date.now()}`,
          title: lbForm.title,
          description: lbForm.desc,
          metric: lbForm.metric,
          type: lbForm.type,
          rewardPool: lbForm.pool ? parseInt(lbForm.pool) : undefined,
          rewardCurrency: lbForm.currency,
          // Handle dates: User input takes precedence
          startTime: editingLbId ? undefined : (lbForm.type === 'TEMPORARY' ? Date.now() : undefined), 
          endTime: lbForm.endTime ? new Date(lbForm.endTime).getTime() : undefined
      };
      
      if (editingLbId) {
          const existing = leaderboards?.find(l => l.id === editingLbId);
          if (existing) {
              config.startTime = existing.startTime;
              config.lastResetTimestamp = existing.lastResetTimestamp;
          }
          onUpdateLeaderboard(config);
          alert('Leaderboard updated!');
      } else {
          onAddLeaderboard(config);
          alert('Leaderboard created!');
      }
      
      cancelEditLeaderboard();
  };

  const handleResetLeaderboard = (id: string) => {
      if (confirm(t('admin.leader.reset_confirm'))) {
          onResetLeaderboard && onResetLeaderboard(id);
      }
  };

  // --- LEVEL HANDLERS ---
  const startEditLevel = (lvl: LevelConfig) => {
      setEditingLvlId(lvl.id);
      setLvlForm({
          level: lvl.level.toString(),
          minKm: lvl.minKm.toString(),
          title: lvl.title || ''
      });
  };

  const cancelEditLevel = () => {
      setEditingLvlId(null);
      setLvlForm({ level: '', minKm: '', title: '' });
  };

  const handleSubmitLevel = (e: React.FormEvent) => {
      e.preventDefault();
      if (!onAddLevel || !onUpdateLevel) return;

      const newLevel: LevelConfig = {
          id: editingLvlId || `lvl_${Date.now()}`,
          level: parseInt(lvlForm.level),
          minKm: parseInt(lvlForm.minKm),
          title: lvlForm.title
      };

      if (editingLvlId) {
          onUpdateLevel(newLevel);
      } else {
          onAddLevel(newLevel);
      }
      cancelEditLevel();
  };

  const handleDeleteLevelClick = (id: string) => {
      if (confirm(t('admin.levels.delete_confirm'))) {
          onDeleteLevel && onDeleteLevel(id);
      }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 relative">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-red-500/20 rounded-xl text-red-400"><Settings size={32} /></div>
        <div><h1 className="text-3xl font-bold text-white">Admin Console</h1></div>
      </div>

      <div className="flex border-b border-gray-700 mb-8 overflow-x-auto">
        {['ITEMS', 'MISSIONS', 'ZONES', 'ECONOMY', 'LEADERBOARD', 'LEVELS', 'REPORTS'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab as any)} 
            className={`px-6 py-4 font-bold text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === tab ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-gray-500 hover:text-white'}`}>
                {tab === 'ITEMS' ? 'Market Items' : tab === 'MISSIONS' ? 'Missions & Badges' : tab === 'ZONES' ? 'Map Zones' : tab === 'ECONOMY' ? 'Economy Ops' : tab === 'REPORTS' ? 'Reports' : tab === 'LEVELS' ? 'Levels' : 'Leaderboards'}
            </button>
        ))}
      </div>

      {/* LEVELS MANAGEMENT */}
      {activeTab === 'LEVELS' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Level Form */}
              <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 h-fit">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      {editingLvlId ? <Edit2 size={20} className="text-blue-400" /> : <Plus size={20} className="text-emerald-400" />}
                      {editingLvlId ? t('admin.levels.edit') : t('admin.levels.add_btn')}
                  </h3>
                  <form onSubmit={handleSubmitLevel} className="space-y-4">
                      <div>
                          <label className="text-xs text-gray-400 uppercase font-bold">{t('admin.levels.level_num')}</label>
                          <input type="number" required value={lvlForm.level} onChange={e => setLvlForm({...lvlForm, level: e.target.value})} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white" />
                      </div>
                      <div>
                          <label className="text-xs text-gray-400 uppercase font-bold">{t('admin.levels.min_km')}</label>
                          <input type="number" required value={lvlForm.minKm} onChange={e => setLvlForm({...lvlForm, minKm: e.target.value})} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white" />
                      </div>
                      <div>
                          <label className="text-xs text-gray-400 uppercase font-bold">{t('admin.levels.level_title')}</label>
                          <input type="text" value={lvlForm.title} onChange={e => setLvlForm({...lvlForm, title: e.target.value})} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white" />
                      </div>
                      
                      <div className="flex gap-2">
                          {editingLvlId && (
                              <button type="button" onClick={cancelEditLevel} className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-bold transition-colors">
                                  {t('admin.leader.cancel')}
                              </button>
                          )}
                          <button className={`flex-1 py-3 rounded-lg text-white font-bold transition-colors ${editingLvlId ? 'bg-blue-600 hover:bg-blue-500' : 'bg-emerald-600 hover:bg-emerald-500'}`}>
                              {editingLvlId ? t('admin.leader.save') : t('admin.levels.add_btn')}
                          </button>
                      </div>
                  </form>
              </div>

              {/* Levels List */}
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2 sticky top-0 bg-gray-900 py-2 z-10">
                      <BarChart3 size={20} className="text-yellow-400" /> Defined Levels ({levels.length})
                  </h3>
                  {levels.map(lvl => (
                      <div key={lvl.id} className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex justify-between items-center group hover:border-gray-500 transition-colors">
                          <div>
                              <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-emerald-400 text-lg">LVL {lvl.level}</span>
                                  <span className="text-sm font-bold text-white">{lvl.title}</span>
                              </div>
                              <p className="text-xs text-gray-400 mt-1">Min Distance: <span className="font-mono text-white">{lvl.minKm} km</span></p>
                          </div>
                          <div className="flex gap-2">
                              <button 
                                  onClick={() => startEditLevel(lvl)}
                                  className="p-2 text-blue-400 hover:bg-blue-500/10 rounded transition-colors"
                              >
                                  <Edit2 size={18} />
                              </button>
                              <button 
                                  onClick={() => handleDeleteLevelClick(lvl.id)} 
                                  className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                              >
                                  <Trash2 size={18} />
                              </button>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* LEADERBOARD MANAGEMENT */}
      {activeTab === 'LEADERBOARD' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Creator/Editor */}
              <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 h-fit">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      {editingLbId ? <Edit2 size={20} className="text-blue-400" /> : <Plus size={20} className="text-emerald-400" />}
                      {editingLbId ? t('admin.leader.edit') : t('admin.leader.add_btn')}
                  </h3>
                  <form onSubmit={handleSubmitLeaderboard} className="space-y-4">
                      <div>
                          <label className="text-xs text-gray-400 uppercase font-bold">{t('admin.leader.name')}</label>
                          <input required value={lbForm.title} onChange={e => setLbForm({...lbForm, title: e.target.value})} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white" />
                      </div>
                      <div>
                          <label className="text-xs text-gray-400 uppercase font-bold">{t('admin.leader.desc')}</label>
                          <input required value={lbForm.desc} onChange={e => setLbForm({...lbForm, desc: e.target.value})} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="text-xs text-gray-400 uppercase font-bold">{t('admin.leader.metric')}</label>
                              <select value={lbForm.metric} onChange={e => setLbForm({...lbForm, metric: e.target.value as any})} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white">
                                  <option value="TOTAL_KM">Total KM</option>
                                  <option value="OWNED_ZONES">Owned Zones</option>
                                  <option value="RUN_BALANCE">RUN Balance</option>
                                  <option value="GOV_BALANCE">GOV Balance</option>
                                  <option value="UNIQUE_ZONES">Unique Zones</option>
                              </select>
                          </div>
                          <div>
                              <label className="text-xs text-gray-400 uppercase font-bold">{t('admin.leader.type')}</label>
                              <select value={lbForm.type} onChange={handleLbTypeChange} disabled={!!editingLbId} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white disabled:opacity-50">
                                  <option value="PERMANENT">{t('admin.leader.perm')}</option>
                                  <option value="TEMPORARY">{t('admin.leader.temp')}</option>
                              </select>
                          </div>
                      </div>
                      
                      {lbForm.type === 'TEMPORARY' && (
                          <div className="bg-purple-900/20 p-4 rounded-lg border border-purple-500/30 space-y-3 animate-fade-in">
                              <h4 className="text-xs font-bold text-purple-400 uppercase flex items-center gap-2">
                                  <Calendar size={12} /> Event Settings
                              </h4>
                              <div>
                                  <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">{t('admin.leader.end')}</label>
                                  <input 
                                    type="datetime-local" 
                                    required
                                    value={lbForm.endTime || ''} 
                                    onChange={e => setLbForm({...lbForm, endTime: e.target.value})} 
                                    style={{ colorScheme: 'dark' }}
                                    className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white focus:border-purple-500 outline-none" 
                                  />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                  <div>
                                      <label className="text-xs text-gray-400 uppercase font-bold">{t('admin.leader.pool')}</label>
                                      <input type="number" value={lbForm.pool} onChange={e => setLbForm({...lbForm, pool: e.target.value})} placeholder="1000" className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white" />
                                  </div>
                                  <div>
                                      <label className="text-xs text-gray-400 uppercase font-bold">{t('admin.leader.currency')}</label>
                                      <select value={lbForm.currency} onChange={e => setLbForm({...lbForm, currency: e.target.value as any})} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white">
                                          <option value="GOV">GOV</option>
                                          <option value="RUN">RUN</option>
                                      </select>
                                  </div>
                              </div>
                          </div>
                      )}

                      <div className="flex gap-2">
                          {editingLbId && (
                              <button type="button" onClick={cancelEditLeaderboard} className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-bold transition-colors">
                                  {t('admin.leader.cancel')}
                              </button>
                          )}
                          <button className={`flex-1 py-3 rounded-lg text-white font-bold transition-colors ${editingLbId ? 'bg-blue-600 hover:bg-blue-500' : 'bg-emerald-600 hover:bg-emerald-500'}`}>
                              {editingLbId ? t('admin.leader.save') : t('admin.leader.add_btn')}
                          </button>
                      </div>
                  </form>
              </div>

              {/* List */}
              <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <Trophy size={20} className="text-yellow-400" /> Active Boards
                  </h3>
                  {leaderboards.map(board => (
                      <div key={board.id} className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex flex-col gap-3 group hover:border-gray-500 transition-colors">
                          <div className="flex justify-between items-start">
                              <div>
                                  <div className="flex items-center gap-2">
                                      <span className="font-bold text-white">{board.title}</span>
                                      <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${board.type === 'PERMANENT' ? 'bg-gray-700 text-gray-400' : 'bg-purple-900/50 text-purple-400 border border-purple-500/30'}`}>
                                          {board.type}
                                      </span>
                                  </div>
                                  <p className="text-xs text-gray-400 mt-1">{board.description}</p>
                                  {board.type === 'TEMPORARY' && board.endTime && (
                                      <p className="text-[10px] text-gray-500 mt-1 flex items-center gap-1">
                                          <Calendar size={10} /> Ends: {new Date(board.endTime).toLocaleDateString()} {new Date(board.endTime).toLocaleTimeString()}
                                      </p>
                                  )}
                                  {board.lastResetTimestamp && (
                                      <p className="text-[10px] text-amber-500 mt-1 flex items-center gap-1">
                                          <RefreshCw size={10} /> Reset: {new Date(board.lastResetTimestamp).toLocaleDateString()}
                                      </p>
                                  )}
                              </div>
                              <div className="flex gap-2">
                                  {/* Edit Button - Primarily for Temporary Boards */}
                                  {board.type === 'TEMPORARY' && (
                                      <button 
                                          onClick={() => startEditLeaderboard(board)}
                                          className="p-2 text-blue-400 hover:bg-blue-500/10 rounded transition-colors"
                                          title={t('admin.leader.edit')}
                                      >
                                          <Edit2 size={18} />
                                      </button>
                                  )}
                                  
                                  {/* Reset Button */}
                                  <button 
                                      onClick={() => handleResetLeaderboard(board.id)}
                                      className="p-2 text-amber-500 hover:bg-amber-500/10 rounded transition-colors"
                                      title={t('admin.leader.reset')}
                                  >
                                      <RefreshCw size={18} />
                                  </button>

                                  {/* Delete Button */}
                                  <button 
                                      onClick={() => onDeleteLeaderboard && onDeleteLeaderboard(board.id)} 
                                      className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                                      title={t('admin.leader.delete_confirm')}
                                  >
                                      <Trash2 size={18} />
                                  </button>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* ... (Other Tabs) ... */}
      {/* ITEM MANAGER */}
      {activeTab === 'ITEMS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 h-fit">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                {editingItemId ? <Edit2 size={20} className="text-blue-400" /> : <Plus size={20} className="text-emerald-400" />} 
                {editingItemId ? 'Edit Item' : 'Create Item'}
            </h3>
            <form onSubmit={handleSubmitItem} className="space-y-4">
              <div><label className="text-xs text-gray-400">Name</label><input type="text" required value={itemFormData.name} onChange={e => setItemFormData({...itemFormData, name: e.target.value})} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white" /></div>
              <div><label className="text-xs text-gray-400">Desc</label><input type="text" required value={itemFormData.description} onChange={e => setItemFormData({...itemFormData, description: e.target.value})} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white" /></div>
              <div className="grid grid-cols-2 gap-2">
                 <div><label className="text-xs text-gray-400">Price (RUN)</label><input type="number" required value={itemFormData.priceRun} onChange={e => setItemFormData({...itemFormData, priceRun: e.target.value})} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white" /></div>
                 <div><label className="text-xs text-gray-400">Quantity</label><input type="number" required value={itemFormData.quantity} onChange={e => setItemFormData({...itemFormData, quantity: e.target.value})} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white" /></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                 <div><label className="text-xs text-gray-400">Type</label><select value={itemFormData.type} onChange={e => setItemFormData({...itemFormData, type: e.target.value as any})} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white"><option value="DEFENSE">Defense</option><option value="BOOST">Boost</option><option value="CURRENCY">Currency</option></select></div>
                 <div><label className="text-xs text-gray-400">Effect</label><input type="number" required value={itemFormData.effectValue} onChange={e => setItemFormData({...itemFormData, effectValue: e.target.value})} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white" /></div>
              </div>
              <div className="flex gap-2">
                  {editingItemId && <button type="button" onClick={cancelEditItem} className="flex-1 py-2 bg-gray-700 text-white rounded-lg">Cancel</button>}
                  <button type="submit" className={`flex-1 py-2 ${editingItemId ? 'bg-blue-500 hover:bg-blue-400' : 'bg-emerald-500 hover:bg-emerald-400'} text-black font-bold rounded-lg`}>
                      {editingItemId ? 'Update' : 'Save'}
                  </button>
              </div>
            </form>
          </div>
          <div className="lg:col-span-2 space-y-4">
             {/* Item Search */}
             <div className="relative mb-4">
                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
                 <input 
                   type="text" 
                   placeholder="Search items..." 
                   className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-9 pr-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                   value={itemSearch}
                   onChange={(e) => {
                     setItemSearch(e.target.value);
                     setItemPage(1);
                   }}
                 />
             </div>
             
             {currentItems.map(item => (
                <div key={item.id} className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex justify-between items-center group">
                   <div><h4 className="font-bold text-white">{item.name}</h4><p className="text-xs text-gray-400">{item.description}</p></div>
                   <div className="flex gap-2">
                        <button onClick={() => startEditItem(item)} className="text-blue-400 hover:bg-blue-500/10 p-2 rounded"><Edit2 size={20}/></button>
                        <button onClick={() => onRemoveItem(item.id)} className="text-red-500 hover:bg-red-500/10 p-2 rounded"><Trash2 size={20}/></button>
                   </div>
                </div>
             ))}
             {filteredItems.length === 0 && <p className="text-gray-500 text-center py-4">No items found.</p>}
             <Pagination currentPage={itemPage} totalPages={totalItemPages} onPageChange={setItemPage} />
          </div>
        </div>
      )}

      {/* MISSIONS & BADGES */}
      {activeTab === 'MISSIONS' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Mission Creator */}
              <div className="space-y-6">
                  <h3 className="text-xl font-bold text-white flex gap-2">
                      {editingMissionId ? <Edit2 className="text-blue-400" /> : <Target className="text-emerald-400"/>} 
                      {editingMissionId ? 'Edit Mission' : 'Missions'}
                  </h3>
                  <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <form onSubmit={handleSubmitMission} className="space-y-3">
                        <input placeholder="Mission Title" value={missionFormData.title} onChange={e => setMissionFormData({...missionFormData, title: e.target.value})} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white" />
                        <input placeholder="Description" value={missionFormData.description} onChange={e => setMissionFormData({...missionFormData, description: e.target.value})} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white" />
                        <div className="grid grid-cols-2 gap-2">
                             <select value={missionFormData.conditionType} onChange={e => setMissionFormData({...missionFormData, conditionType: e.target.value})} className="bg-gray-900 border border-gray-600 rounded p-2 text-white"><option value="TOTAL_KM">Total KM</option><option value="OWN_ZONES">Owned Zones</option></select>
                             <select value={missionFormData.rarity} onChange={e => setMissionFormData({...missionFormData, rarity: e.target.value})} className="bg-gray-900 border border-gray-600 rounded p-2 text-white"><option value="COMMON">Common</option><option value="RARE">Rare</option><option value="EPIC">Epic</option><option value="LEGENDARY">Legendary</option></select>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <input type="number" placeholder="Value" value={missionFormData.conditionValue} onChange={e => setMissionFormData({...missionFormData, conditionValue: e.target.value})} className="bg-gray-900 border border-gray-600 rounded p-2 text-white" />
                            <div>
                                <div className="grid grid-cols-2 gap-2">
                                    <input type="number" placeholder="RUN" value={missionFormData.rewardRun} onChange={e => setMissionFormData({...missionFormData, rewardRun: e.target.value})} className="bg-gray-900 border border-emerald-500 rounded p-2 text-white" />
                                    <input type="number" placeholder="GOV" value={missionFormData.rewardGov} onChange={e => setMissionFormData({...missionFormData, rewardGov: e.target.value})} className="bg-gray-900 border border-cyan-500 rounded p-2 text-white" />
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                             {editingMissionId && <button type="button" onClick={cancelEditMission} className="flex-1 py-2 bg-gray-700 text-white rounded font-bold">Cancel</button>}
                             <button className={`flex-1 py-2 ${editingMissionId ? 'bg-blue-600' : 'bg-emerald-600'} text-white rounded font-bold`}>{editingMissionId ? 'Update Mission' : 'Add Mission'}</button>
                        </div>
                    </form>
                  </div>
                  
                  {/* Mission List Search */}
                  <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
                      <input 
                        type="text" 
                        placeholder="Search missions..." 
                        className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-9 pr-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                        value={missionSearch}
                        onChange={(e) => {
                          setMissionSearch(e.target.value);
                          setMissionPage(1);
                        }}
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

              {/* Badge Creator */}
              <div className="space-y-6">
                  <h3 className="text-xl font-bold text-white flex gap-2">
                      {editingBadgeId ? <Edit2 className="text-blue-400" /> : <Award className="text-yellow-400"/>}
                      {editingBadgeId ? 'Edit Badge' : 'Badges'}
                  </h3>
                  <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <form onSubmit={handleSubmitBadge} className="space-y-3">
                        <input placeholder="Badge Name" value={badgeFormData.name} onChange={e => setBadgeFormData({...badgeFormData, name: e.target.value})} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white" />
                        <input placeholder="Description" value={badgeFormData.description} onChange={e => setBadgeFormData({...badgeFormData, description: e.target.value})} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white" />
                        <div className="grid grid-cols-2 gap-2">
                             <select value={badgeFormData.icon} onChange={e => setBadgeFormData({...badgeFormData, icon: e.target.value})} className="bg-gray-900 border border-gray-600 rounded p-2 text-white"><option value="Award">Award</option><option value="Flag">Flag</option><option value="Crown">Crown</option></select>
                             <select value={badgeFormData.rarity} onChange={e => setBadgeFormData({...badgeFormData, rarity: e.target.value})} className="bg-gray-900 border border-gray-600 rounded p-2 text-white"><option value="COMMON">Common</option><option value="RARE">Rare</option><option value="EPIC">Epic</option><option value="LEGENDARY">Legendary</option></select>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <select value={badgeFormData.conditionType} onChange={e => setBadgeFormData({...badgeFormData, conditionType: e.target.value})} className="bg-gray-900 border border-gray-600 rounded p-2 text-white"><option value="TOTAL_KM">Total KM</option><option value="OWN_ZONES">Owned Zones</option></select>
                            <input type="number" placeholder="Value" value={badgeFormData.conditionValue} onChange={e => setBadgeFormData({...badgeFormData, conditionValue: e.target.value})} className="bg-gray-900 border border-gray-600 rounded p-2 text-white" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="grid grid-cols-2 gap-2 col-span-2">
                                <input type="number" placeholder="RUN" value={badgeFormData.rewardRun} onChange={e => setBadgeFormData({...badgeFormData, rewardRun: e.target.value})} className="bg-gray-900 border border-emerald-500 rounded p-2 text-white" />
                                <input type="number" placeholder="GOV" value={badgeFormData.rewardGov} onChange={e => setBadgeFormData({...badgeFormData, rewardGov: e.target.value})} className="bg-gray-900 border border-cyan-500 rounded p-2 text-white" />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {editingBadgeId && <button type="button" onClick={cancelEditBadge} className="flex-1 py-2 bg-gray-700 text-white rounded font-bold">Cancel</button>}
                            <button className={`flex-1 py-2 ${editingBadgeId ? 'bg-blue-600' : 'bg-yellow-600'} text-white rounded font-bold`}>{editingBadgeId ? 'Update Badge' : 'Add Badge'}</button>
                        </div>
                    </form>
                  </div>
                  
                  {/* Badge List Search */}
                  <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
                      <input 
                        type="text" 
                        placeholder="Search badges..." 
                        className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-9 pr-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                        value={badgeSearch}
                        onChange={(e) => {
                          setBadgeSearch(e.target.value);
                          setBadgePage(1);
                        }}
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
      )}

      {/* ZONE MANAGEMENT */}
      {activeTab === 'ZONES' && (
        <div className="space-y-6">
           <h3 className="text-xl font-bold text-white flex gap-2"><Map className="text-blue-400"/> Map Zones</h3>
           <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
              <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search zones..." 
                    className="w-full bg-gray-900 border border-gray-600 rounded-lg pl-9 pr-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                    value={zoneSearch}
                    onChange={(e) => {
                      setZoneSearch(e.target.value);
                      setZonePage(1); // Reset to first page on search
                    }}
                  />
              </div>

              <div className="space-y-2 pr-2">
                 {currentZones.map(zone => (
                   <div key={zone.id} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-700/50 hover:border-gray-500 transition-colors">
                      <div className="flex-1">
                         {editingZoneId === zone.id ? (
                           <input 
                             type="text" 
                             value={tempZoneName} 
                             onChange={(e) => setTempZoneName(e.target.value)}
                             className="w-full bg-gray-800 border border-emerald-500 rounded p-1 text-white text-sm"
                             autoFocus
                           />
                         ) : (
                           <div>
                              <div className="font-bold text-white text-sm">{zone.name}</div>
                              <div className="text-xs text-gray-500">ID: {zone.id} | Owner: {zone.ownerId}</div>
                           </div>
                         )}
                      </div>
                      
                      <div className="ml-4 flex gap-2">
                         {editingZoneId === zone.id ? (
                           <>
                             <button onClick={() => setEditingZoneId(null)} className="p-2 text-gray-400 hover:text-white"><X size={16} /></button>
                             <button onClick={handleSaveZoneName} className="p-2 text-emerald-400 hover:text-emerald-300"><Save size={16} /></button>
                           </>
                         ) : (
                           <>
                             <button onClick={() => handleEditZoneName(zone)} className="p-2 text-blue-400 hover:bg-blue-500/10 rounded"><Edit2 size={16} /></button>
                             <button onClick={() => handleDeleteZoneClick(zone.id, zone.name)} className="p-2 text-red-400 hover:bg-red-500/10 rounded"><Trash2 size={16} /></button>
                           </>
                         )}
                      </div>
                   </div>
                 ))}
                 {filteredZones.length === 0 && <p className="text-gray-500 text-center py-4">No zones found.</p>}
                 <Pagination currentPage={zonePage} totalPages={totalZonePages} onPageChange={setZonePage} />
              </div>
           </div>
           <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg flex items-start gap-3">
             <CheckCircle className="text-blue-400 shrink-0 mt-0.5" size={18} />
             <div>
               <p className="text-sm text-blue-200 font-bold">Naming Convention Reminder</p>
               <p className="text-xs text-blue-300/70">Ensure zone names follow the format: <strong>Name, City - CC</strong> (e.g. "Parco Sempione, Milan - IT") for filters to work correctly.</p>
             </div>
           </div>
        </div>
      )}

      {/* ECONOMY OPS */}
      {activeTab === 'ECONOMY' && (
        <div className="space-y-8">
            {/* Rate Config */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <ArrowRightLeft className="text-emerald-400" /> {t('admin.eco.swap_config')}
                </h3>
                <div className="flex items-end gap-4 max-w-sm">
                    <div className="flex-1">
                        <label className="text-xs text-gray-400 block mb-1">{t('admin.eco.rate_label')}</label>
                        <input 
                            type="number" 
                            value={govToRunRate} 
                            onChange={(e) => onUpdateExchangeRate(parseInt(e.target.value) || 0)} 
                            className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:border-emerald-500" 
                        />
                    </div>
                    <div className="bg-gray-900 p-2 rounded text-emerald-400 font-bold text-sm">RUN</div>
                </div>
                <p className="text-xs text-gray-500 mt-2">{t('admin.eco.rate_help')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 flex flex-col items-center text-center">
                    <Flame size={48} className="text-red-500 mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-2">Trigger Burn</h3>
                    <button onClick={() => setShowBurnModal(true)} className="px-8 py-3 bg-red-600 rounded-xl font-bold shadow-lg hover:bg-red-500 transition-colors">Execute Burn Protocol</button>
                </div>
                <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 flex flex-col items-center text-center">
                    <Gift size={48} className="text-cyan-400 mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-2">Distribute Rewards</h3>
                    <button onClick={() => setShowRewardModal(true)} className="px-8 py-3 bg-cyan-600 rounded-xl font-bold shadow-lg hover:bg-cyan-500 transition-colors">Distribute Airdrop</button>
                </div>
            </div>
        </div>
      )}

      {/* Burn Modal */}
      {showBurnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-gray-800 rounded-2xl border border-red-500 w-full max-w-md p-6 space-y-4">
            <h3 className="text-xl font-bold text-white">Confirm Burn</h3>
            <p className="text-gray-300">Burning 5M RUN. Action irreversible.</p>
            <div className="flex gap-3"><button onClick={() => setShowBurnModal(false)} className="flex-1 py-3 bg-gray-700 rounded-xl">Cancel</button><button onClick={handleConfirmBurn} className="flex-1 py-3 bg-red-600 rounded-xl font-bold">Ignite</button></div>
          </div>
        </div>
      )}

      {/* Reward Modal */}
      {showRewardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-gray-800 rounded-2xl border border-cyan-500 w-full max-w-md p-6 space-y-4">
            <h3 className="text-xl font-bold text-white">Distribute Airdrop</h3>
            <p className="text-gray-300">Sending GOV based on KM stats.</p>
            <div className="flex gap-3"><button onClick={() => setShowRewardModal(false)} className="flex-1 py-3 bg-gray-700 rounded-xl">Cancel</button><button onClick={handleConfirmReward} className="flex-1 py-3 bg-cyan-600 rounded-xl font-bold">Send</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;