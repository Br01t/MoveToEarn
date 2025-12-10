
import React, { useState } from 'react';
import { LeaderboardConfig, LeaderboardMetric } from '../../types';
import { Calendar, Edit2, Plus, RefreshCw, Trash2, Trophy } from 'lucide-react';
import { useLanguage } from '../../LanguageContext';
import { NotificationToast, ConfirmModal } from './AdminUI';

interface AdminLeaderboardTabProps {
  leaderboards: LeaderboardConfig[];
  onAddLeaderboard?: (config: LeaderboardConfig) => Promise<{ error?: string, success?: boolean }>;
  onUpdateLeaderboard?: (config: LeaderboardConfig) => Promise<{ error?: string, success?: boolean }>;
  onDeleteLeaderboard?: (id: string) => Promise<{ error?: string, success?: boolean }>;
  onResetLeaderboard?: (id: string) => Promise<{ error?: string, success?: boolean }>;
}

const AdminLeaderboardTab: React.FC<AdminLeaderboardTabProps> = ({ 
    leaderboards, onAddLeaderboard, onUpdateLeaderboard, onDeleteLeaderboard, onResetLeaderboard 
}) => {
  const { t } = useLanguage();
  // UI Feedback States
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ title: string, message: string, action: () => void } | null>(null);

  const [editingLbId, setEditingLbId] = useState<string | null>(null);
  const [lbForm, setLbForm] = useState<{ title: string; desc: string; metric: LeaderboardMetric; type: 'PERMANENT' | 'TEMPORARY'; pool: string; currency: 'GOV' | 'RUN'; endTime?: string }>({
      title: '', desc: '', metric: 'TOTAL_KM', type: 'PERMANENT', pool: '', currency: 'GOV'
  });

  const startEditLeaderboard = (lb: LeaderboardConfig) => {
      setEditingLbId(lb.id);
      let endDate = '';
      if (lb.endTime) {
           const d = new Date(lb.endTime);
           const offset = d.getTimezoneOffset() * 60000;
           const localDate = new Date(d.getTime() - offset);
           endDate = localDate.toISOString().slice(0, 16);
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
      if (newType === 'TEMPORARY' && !newEndTime) {
          const d = new Date();
          d.setDate(d.getDate() + 7);
          const offset = d.getTimezoneOffset() * 60000;
          const localDate = new Date(d.getTime() - offset);
          newEndTime = localDate.toISOString().slice(0, 16); 
      }
      setLbForm({ ...lbForm, type: newType, endTime: newEndTime });
  };

  const handleSubmitLeaderboard = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!onAddLeaderboard || !onUpdateLeaderboard) return;
      
      const config: LeaderboardConfig = {
          id: editingLbId || `lb_${Date.now()}`,
          title: lbForm.title,
          description: lbForm.desc,
          metric: lbForm.metric,
          type: lbForm.type,
          rewardPool: lbForm.pool ? parseInt(lbForm.pool) : undefined,
          rewardCurrency: lbForm.currency as 'RUN' | 'GOV',
          startTime: editingLbId ? undefined : (lbForm.type === 'TEMPORARY' ? Date.now() : undefined), 
          endTime: lbForm.endTime ? new Date(lbForm.endTime).getTime() : undefined
      };
      
      let result;
      if (editingLbId) {
          const existing = leaderboards.find(l => l.id === editingLbId);
          if (existing) {
              config.startTime = existing.startTime;
              config.lastResetTimestamp = existing.lastResetTimestamp;
          }
          result = await onUpdateLeaderboard(config);
      } else {
          result = await onAddLeaderboard(config);
      }

      if (result.success) {
          setNotification({ message: editingLbId ? "Leaderboard updated" : "Leaderboard created", type: 'success' });
          cancelEditLeaderboard();
      } else {
          setNotification({ message: result.error || "Failed to save leaderboard", type: 'error' });
      }
  };

  const handleResetClick = (id: string) => {
      setConfirmAction({
          title: "Reset Leaderboard",
          message: t('admin.leader.reset_confirm'),
          action: async () => {
              if (onResetLeaderboard) {
                  const result = await onResetLeaderboard(id);
                  if (result.success) setNotification({ message: "Leaderboard reset!", type: 'success' });
                  else setNotification({ message: result.error || "Reset failed", type: 'error' });
              }
              setConfirmAction(null);
          }
      });
  };

  const handleDeleteClick = (id: string) => {
      setConfirmAction({
          title: "Delete Leaderboard",
          message: "Are you sure you want to delete this leaderboard?",
          action: async () => {
              if (onDeleteLeaderboard) {
                  const result = await onDeleteLeaderboard(id);
                  if (result.success) setNotification({ message: "Leaderboard deleted", type: 'success' });
                  else setNotification({ message: result.error || "Delete failed", type: 'error' });
              }
              setConfirmAction(null);
          }
      });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {notification && <NotificationToast message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
        {confirmAction && (
            <ConfirmModal 
                title={confirmAction.title} 
                message={confirmAction.message} 
                onConfirm={confirmAction.action} 
                onCancel={() => setConfirmAction(null)} 
                isDestructive
                confirmLabel="Confirm"
            />
        )}

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
                        <select value={lbForm.type} onChange={handleLbTypeChange} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white">
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
                            <button 
                                onClick={() => startEditLeaderboard(board)}
                                className="p-2 text-blue-400 hover:bg-blue-500/10 rounded transition-colors"
                                title={t('admin.leader.edit')}
                            >
                                <Edit2 size={18} />
                            </button>
                            <button 
                                onClick={() => handleResetClick(board.id)}
                                className="p-2 text-amber-500 hover:bg-amber-500/10 rounded transition-colors"
                                title={t('admin.leader.reset')}
                            >
                                <RefreshCw size={18} />
                            </button>
                            <button 
                                onClick={() => handleDeleteClick(board.id)} 
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
  );
};

export default AdminLeaderboardTab;