
import React, { useState } from 'react';
import { Zone } from '../../types';
import { Edit2, Map, Search, Trash2, X, Save, CheckCircle } from 'lucide-react';
import Pagination from '../Pagination';
import { NotificationToast, ConfirmModal } from './AdminUI';

interface AdminZonesTabProps {
  zones: Zone[];
  onUpdateZone: (id: string, updates: Partial<Zone>) => Promise<{ error?: string, success?: boolean }>;
  onDeleteZone: (id: string) => Promise<{ error?: string, success?: boolean }>;
}

const ZONES_PER_PAGE = 10;

const AdminZonesTab: React.FC<AdminZonesTabProps> = ({ zones, onUpdateZone, onDeleteZone }) => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  
  // UI Feedback States
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ title: string, message: string, action: () => void } | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempName, setTempName] = useState('');
  const [tempInterest, setTempInterest] = useState('');

  const filteredZones = zones.filter(z => z.name.toLowerCase().includes(search.toLowerCase()));
  const currentZones = filteredZones.slice((page - 1) * ZONES_PER_PAGE, page * ZONES_PER_PAGE);
  const totalPages = Math.ceil(filteredZones.length / ZONES_PER_PAGE);

  const startEdit = (zone: Zone) => {
    setEditingId(zone.id);
    setTempName(zone.name);
    setTempInterest(zone.interestRate.toString());
  };

  const handleSave = async () => {
    if (editingId && tempName) {
      const result = await onUpdateZone(editingId, {
          name: tempName,
          interestRate: parseFloat(tempInterest) || 0
      });
      
      if (result.success) {
          setNotification({ message: "Zone updated successfully", type: 'success' });
          setEditingId(null);
          setTempName('');
          setTempInterest('');
      } else {
          setNotification({ message: result.error || "Update failed", type: 'error' });
      }
    }
  };

  const handleDelete = (id: string, name: string) => {
      setConfirmAction({
          title: "Delete Zone",
          message: `Are you sure you want to delete zone "${name}"? This will remove it from the map permanently.`,
          action: async () => {
              const result = await onDeleteZone(id);
              if (result.success) {
                  setNotification({ message: "Zone deleted", type: 'success' });
              } else {
                  setNotification({ message: result.error || "Delete failed", type: 'error' });
              }
              setConfirmAction(null);
          }
      });
  };

  return (
    <div className="space-y-6">
       {notification && <NotificationToast message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
       {confirmAction && (
          <ConfirmModal 
              title={confirmAction.title} 
              message={confirmAction.message} 
              onConfirm={confirmAction.action} 
              onCancel={() => setConfirmAction(null)} 
              isDestructive
              confirmLabel="Delete Zone"
          />
       )}

       <h3 className="text-xl font-bold text-white flex gap-2"><Map className="text-blue-400"/> Map Zones</h3>
       <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
              <input 
                type="text" 
                placeholder="Search zones..." 
                className="w-full bg-gray-900 border border-gray-600 rounded-lg pl-9 pr-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1); 
                }}
              />
          </div>

          <div className="space-y-2 pr-2">
             {currentZones.map(zone => (
               <div key={zone.id} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-700/50 hover:border-gray-500 transition-colors">
                  <div className="flex-1">
                     {editingId === zone.id ? (
                       <div className="flex gap-2 items-center">
                           <input 
                             type="text" 
                             value={tempName} 
                             onChange={(e) => setTempName(e.target.value)}
                             className="w-full bg-gray-800 border border-emerald-500 rounded p-1 text-white text-sm"
                             autoFocus
                             placeholder="Zone Name"
                           />
                           <input 
                             type="number" 
                             value={tempInterest} 
                             onChange={(e) => setTempInterest(e.target.value)}
                             className="w-24 bg-gray-800 border border-emerald-500 rounded p-1 text-white text-sm"
                             placeholder="Rate %"
                           />
                       </div>
                     ) : (
                       <div className="flex justify-between items-center pr-4">
                          <div>
                              <div className="font-bold text-white text-sm">{zone.name}</div>
                              <div className="text-xs text-gray-500">ID: {zone.id} | Owner: {zone.ownerId}</div>
                          </div>
                          <div className="text-xs font-bold text-emerald-400 bg-emerald-900/30 px-2 py-1 rounded">
                              {zone.interestRate}% Yield
                          </div>
                       </div>
                     )}
                  </div>
                  
                  <div className="ml-4 flex gap-2">
                     {editingId === zone.id ? (
                       <>
                         <button onClick={() => setEditingId(null)} className="p-2 text-gray-400 hover:text-white"><X size={16} /></button>
                         <button onClick={handleSave} className="p-2 text-emerald-400 hover:text-emerald-300"><Save size={16} /></button>
                       </>
                     ) : (
                       <>
                         <button onClick={() => startEdit(zone)} className="p-2 text-blue-400 hover:bg-blue-500/10 rounded"><Edit2 size={16} /></button>
                         <button onClick={() => handleDelete(zone.id, zone.name)} className="p-2 text-red-400 hover:bg-red-500/10 rounded"><Trash2 size={16} /></button>
                       </>
                     )}
                  </div>
               </div>
             ))}
             {filteredZones.length === 0 && <p className="text-gray-500 text-center py-4">No zones found.</p>}
             <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
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
  );
};

export default AdminZonesTab;