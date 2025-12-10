
import React, { useState } from 'react';
import { Item, Mission, Badge, Zone, BugReport, LeaderboardConfig, LevelConfig, Suggestion } from '../types';
import { Settings } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

// Import Sub-Components
import AdminItemsTab from './admin/AdminItemsTab';
import AdminMissionsTab from './admin/AdminMissionsTab';
import AdminZonesTab from './admin/AdminZonesTab';
import AdminEconomyTab from './admin/AdminEconomyTab';
import AdminLeaderboardTab from './admin/AdminLeaderboardTab';
import AdminLevelsTab from './admin/AdminLevelsTab';
import AdminReportsTab from './admin/AdminReportsTab';
import AdminSuggestionsTab from './admin/AdminSuggestionsTab';

interface AdminProps {
  marketItems: Item[];
  missions: Mission[];
  badges: Badge[];
  zones: Zone[];
  govToRunRate: number;
  bugReports?: BugReport[];
  suggestions?: Suggestion[];
  leaderboards?: LeaderboardConfig[];
  levels?: LevelConfig[];
  // CRUD Actions
  onAddItem: (item: Item) => Promise<{ error?: string; success?: boolean }>;
  onUpdateItem: (item: Item) => Promise<{ error?: string; success?: boolean }>;
  onRemoveItem: (id: string) => Promise<{ error?: string; success?: boolean }>;
  onAddMission: (mission: Mission) => Promise<{ error?: string; success?: boolean }>;
  onUpdateMission: (mission: Mission) => Promise<{ error?: string; success?: boolean }>;
  onRemoveMission: (id: string) => Promise<{ error?: string; success?: boolean }>;
  onAddBadge: (badge: Badge) => Promise<{ error?: string; success?: boolean }>;
  onUpdateBadge: (badge: Badge) => Promise<{ error?: string; success?: boolean }>;
  onRemoveBadge: (id: string) => Promise<{ error?: string; success?: boolean }>;
  onUpdateZone: (id: string, updates: Partial<Zone>) => Promise<{ error?: string; success?: boolean }>;
  onDeleteZone: (id: string) => Promise<{ error?: string; success?: boolean }>;
  // Config Actions
  onTriggerBurn: () => void;
  onDistributeRewards: () => void;
  onResetSeason: () => void;
  onUpdateExchangeRate: (rate: number) => void;
  // Leaderboard & Levels
  onAddLeaderboard?: (config: LeaderboardConfig) => Promise<{ error?: string; success?: boolean }>;
  onUpdateLeaderboard?: (config: LeaderboardConfig) => Promise<{ error?: string; success?: boolean }>;
  onDeleteLeaderboard?: (id: string) => Promise<{ error?: string; success?: boolean }>;
  onResetLeaderboard?: (id: string) => Promise<{ error?: string; success?: boolean }>;
  onAddLevel?: (level: LevelConfig) => Promise<{ error?: string; success?: boolean }>;
  onUpdateLevel?: (level: LevelConfig) => Promise<{ error?: string; success?: boolean }>;
  onDeleteLevel?: (id: string) => Promise<{ error?: string; success?: boolean }>;
  // Bugs & Suggestions
  onUpdateBugStatus?: (id: string, status: any) => Promise<{ error?: string; success?: boolean }>;
  onDeleteBugReport?: (id: string) => Promise<{ error?: string; success?: boolean }>;
  onDeleteSuggestion?: (id: string) => Promise<{ error?: string; success?: boolean }>;
}

const Admin: React.FC<AdminProps> = ({ 
  marketItems, missions, badges, zones, govToRunRate, bugReports = [], suggestions = [], leaderboards = [], levels = [],
  onAddItem, onUpdateItem, onRemoveItem,
  onAddMission, onUpdateMission, onRemoveMission,
  onAddBadge, onUpdateBadge, onRemoveBadge,
  onUpdateZone, onDeleteZone,
  onTriggerBurn, onDistributeRewards, onUpdateExchangeRate, 
  onAddLeaderboard, onUpdateLeaderboard, onDeleteLeaderboard, onResetLeaderboard,
  onAddLevel, onUpdateLevel, onDeleteLevel,
  onUpdateBugStatus, onDeleteBugReport, onDeleteSuggestion
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'ITEMS' | 'ECONOMY' | 'MISSIONS' | 'ZONES' | 'LEADERBOARD' | 'REPORTS' | 'IDEAS' | 'LEVELS'>('ITEMS');

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 relative">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-red-500/20 rounded-xl text-red-400"><Settings size={32} /></div>
        <div><h1 className="text-3xl font-bold text-white">Admin Console</h1></div>
      </div>

      <div className="flex border-b border-gray-700 mb-8 overflow-x-auto">
        {['ITEMS', 'MISSIONS', 'ZONES', 'ECONOMY', 'LEADERBOARD', 'LEVELS', 'REPORTS', 'IDEAS'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab as any)} 
            className={`px-6 py-4 font-bold text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === tab ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-gray-500 hover:text-white'}`}>
                {tab === 'ITEMS' ? 'Market Items' : tab === 'MISSIONS' ? 'Missions' : tab === 'ZONES' ? 'Zones' : tab === 'ECONOMY' ? 'Economy' : tab === 'LEADERBOARD' ? 'Leaderboards' : tab === 'LEVELS' ? 'Levels' : tab === 'REPORTS' ? 'Reports' : 'Suggestions'}
            </button>
        ))}
      </div>

      {activeTab === 'ITEMS' && (
          <AdminItemsTab 
              items={marketItems} 
              onAddItem={onAddItem} 
              onUpdateItem={onUpdateItem} 
              onRemoveItem={onRemoveItem} 
          />
      )}

      {activeTab === 'MISSIONS' && (
          <AdminMissionsTab 
              missions={missions} 
              badges={badges}
              onAddMission={onAddMission} 
              onUpdateMission={onUpdateMission} 
              onRemoveMission={onRemoveMission}
              onAddBadge={onAddBadge}
              onUpdateBadge={onUpdateBadge}
              onRemoveBadge={onRemoveBadge}
          />
      )}

      {activeTab === 'ZONES' && (
          <AdminZonesTab 
              zones={zones} 
              onUpdateZone={onUpdateZone} 
              onDeleteZone={onDeleteZone} 
          />
      )}

      {activeTab === 'ECONOMY' && (
          <AdminEconomyTab 
              govToRunRate={govToRunRate} 
              onUpdateExchangeRate={onUpdateExchangeRate} 
              onTriggerBurn={onTriggerBurn} 
              onDistributeRewards={onDistributeRewards} 
          />
      )}

      {activeTab === 'LEADERBOARD' && (
          <AdminLeaderboardTab 
              leaderboards={leaderboards || []}
              onAddLeaderboard={onAddLeaderboard}
              onUpdateLeaderboard={onUpdateLeaderboard}
              onDeleteLeaderboard={onDeleteLeaderboard}
              onResetLeaderboard={onResetLeaderboard}
          />
      )}

      {activeTab === 'LEVELS' && (
          <AdminLevelsTab
              levels={levels || []}
              onAddLevel={onAddLevel}
              onUpdateLevel={onUpdateLevel}
              onDeleteLevel={onDeleteLevel}
          />
      )}

      {activeTab === 'REPORTS' && (
          <AdminReportsTab 
              bugReports={bugReports} 
              onUpdateStatus={onUpdateBugStatus}
              onDelete={onDeleteBugReport}
          />
      )}

      {activeTab === 'IDEAS' && (
          <AdminSuggestionsTab 
              suggestions={suggestions} 
              onDelete={onDeleteSuggestion}
          />
      )}

    </div>
  );
};

export default Admin;