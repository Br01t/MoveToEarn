
import React, { useState } from 'react';
import { LevelConfig } from '../../types';
import { BarChart3, Edit2, Plus, Trash2 } from 'lucide-react';
import { useLanguage } from '../../LanguageContext';

interface AdminLevelsTabProps {
  levels: LevelConfig[];
  onAddLevel?: (level: LevelConfig) => void;
  onUpdateLevel?: (level: LevelConfig) => void;
  onDeleteLevel?: (id: string) => void;
}

const AdminLevelsTab: React.FC<AdminLevelsTabProps> = ({ levels, onAddLevel, onUpdateLevel, onDeleteLevel }) => {
  const { t } = useLanguage();
  const [editingLvlId, setEditingLvlId] = useState<string | null>(null);
  const [lvlForm, setLvlForm] = useState<{ level: string; minKm: string; title: string }>({
      level: '', minKm: '', title: ''
  });

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
  );
};

export default AdminLevelsTab;