
import React, { useState } from 'react';
import { Item } from '../../types';
import { Edit2, Plus, Search, Trash2 } from 'lucide-react';
import Pagination from '../Pagination';

interface AdminItemsTabProps {
  items: Item[];
  onAddItem: (item: Item) => void;
  onUpdateItem: (item: Item) => void;
  onRemoveItem: (id: string) => void;
}

const ITEMS_PER_PAGE = 5;

const AdminItemsTab: React.FC<AdminItemsTabProps> = ({ items, onAddItem, onUpdateItem, onRemoveItem }) => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<{
    name: string; description: string; priceRun: string; quantity: string;
    type: 'DEFENSE' | 'BOOST' | 'CURRENCY'; effectValue: string;
  }>({ name: '', description: '', priceRun: '100', quantity: '100', type: 'DEFENSE', effectValue: '1' });

  const filteredItems = items.filter(item => item.name.toLowerCase().includes(search.toLowerCase()));
  const currentItems = filteredItems.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);

  const startEdit = (item: Item) => {
    setEditingId(item.id);
    setFormData({
        name: item.name,
        description: item.description,
        priceRun: item.priceRun.toString(),
        quantity: item.quantity.toString(),
        type: item.type,
        effectValue: item.effectValue.toString()
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', description: '', priceRun: '100', quantity: '100', type: 'DEFENSE', effectValue: '1' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    
    let iconName = 'Zap';
    if (formData.type === 'DEFENSE') iconName = 'Shield';
    if (formData.type === 'CURRENCY') iconName = 'Coins';

    const itemData: Item = {
      id: editingId || `item_${Date.now()}`,
      name: formData.name, 
      description: formData.description,
      priceRun: parseFloat(formData.priceRun), 
      quantity: parseInt(formData.quantity),
      type: formData.type, 
      effectValue: parseFloat(formData.effectValue), 
      icon: iconName
    };

    if (editingId) {
        onUpdateItem(itemData);
    } else {
        onAddItem(itemData);
    }
    cancelEdit();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Form */}
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 h-fit">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            {editingId ? <Edit2 size={20} className="text-blue-400" /> : <Plus size={20} className="text-emerald-400" />} 
            {editingId ? 'Edit Item' : 'Create Item'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="text-xs text-gray-400">Name</label><input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white" /></div>
          <div><label className="text-xs text-gray-400">Desc</label><input type="text" required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white" /></div>
          <div className="grid grid-cols-2 gap-2">
             <div><label className="text-xs text-gray-400">Price (RUN)</label><input type="number" required value={formData.priceRun} onChange={e => setFormData({...formData, priceRun: e.target.value})} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white" /></div>
             <div><label className="text-xs text-gray-400">Quantity</label><input type="number" required value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white" /></div>
          </div>
          <div className="grid grid-cols-2 gap-2">
             <div><label className="text-xs text-gray-400">Type</label><select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white"><option value="DEFENSE">Defense</option><option value="BOOST">Boost</option><option value="CURRENCY">Currency</option></select></div>
             <div><label className="text-xs text-gray-400">Effect</label><input type="number" required value={formData.effectValue} onChange={e => setFormData({...formData, effectValue: e.target.value})} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white" /></div>
          </div>
          <div className="flex gap-2">
              {editingId && <button type="button" onClick={cancelEdit} className="flex-1 py-2 bg-gray-700 text-white rounded-lg">Cancel</button>}
              <button type="submit" className={`flex-1 py-2 ${editingId ? 'bg-blue-500 hover:bg-blue-400' : 'bg-emerald-500 hover:bg-emerald-400'} text-black font-bold rounded-lg`}>
                  {editingId ? 'Update' : 'Save'}
              </button>
          </div>
        </form>
      </div>

      {/* List */}
      <div className="lg:col-span-2 space-y-4">
         <div className="relative mb-4">
             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
             <input 
               type="text" 
               placeholder="Search items..." 
               className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-9 pr-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
               value={search}
               onChange={(e) => { setSearch(e.target.value); setPage(1); }}
             />
         </div>
         
         {currentItems.map(item => (
            <div key={item.id} className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex justify-between items-center group">
               <div><h4 className="font-bold text-white">{item.name}</h4><p className="text-xs text-gray-400">{item.description}</p></div>
               <div className="flex gap-2">
                    <button onClick={() => startEdit(item)} className="text-blue-400 hover:bg-blue-500/10 p-2 rounded"><Edit2 size={20}/></button>
                    <button onClick={() => onRemoveItem(item.id)} className="text-red-500 hover:bg-red-500/10 p-2 rounded"><Trash2 size={20}/></button>
               </div>
            </div>
         ))}
         {filteredItems.length === 0 && <p className="text-gray-500 text-center py-4">No items found.</p>}
         <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
};

export default AdminItemsTab;