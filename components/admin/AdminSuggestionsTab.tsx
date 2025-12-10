
import React, { useState } from 'react';
import { Suggestion } from '../../types';
import { Lightbulb, Trash2, User, Loader2 } from 'lucide-react';
import { useLanguage } from '../../LanguageContext';
import { ConfirmModal, NotificationToast } from './AdminUI';

interface AdminSuggestionsTabProps {
  suggestions: Suggestion[];
  onDelete?: (id: string) => Promise<{ error?: string, success?: boolean }>;
}

const AdminSuggestionsTab: React.FC<AdminSuggestionsTabProps> = ({ suggestions, onDelete }) => {
  const { t } = useLanguage();
  const [confirmAction, setConfirmAction] = useState<{ title: string, message: string, action: () => Promise<void> } | null>(null);
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleDelete = (idea: Suggestion) => {
      setConfirmAction({
          title: "Delete Suggestion",
          message: "Are you sure you want to delete this suggestion?",
          action: async () => {
              if (onDelete) {
                  setLoadingId(idea.id);
                  const result = await onDelete(idea.id);
                  setLoadingId(null);
                  if (result.success) setNotification({ message: "Suggestion deleted", type: 'success' });
                  else setNotification({ message: result.error || "Delete failed. Check DB permissions.", type: 'error' });
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
                confirmLabel="Delete"
            />
        )}

        <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Lightbulb className="text-yellow-400" /> {t('admin.ideas.title')}
        </h3>
        
        {suggestions.length === 0 ? (
            <div className="text-center py-12 bg-gray-800 rounded-xl border border-gray-700 border-dashed">
                <Lightbulb className="mx-auto text-gray-600 mb-2" size={48} />
                <p className="text-gray-500">{t('admin.ideas.no_ideas')}</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 gap-4">
                {suggestions.map(idea => (
                    <div key={idea.id} className="bg-gray-800 p-4 rounded-xl border border-gray-700 hover:border-gray-600 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                                <User size={16} className="text-gray-400"/>
                                <div>
                                    <div className="font-bold text-white text-sm">{idea.userName}</div>
                                    <div className="text-xs text-gray-500 font-mono">{idea.userId}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="text-xs text-gray-400">
                                    {new Date(idea.timestamp).toLocaleString()}
                                </div>
                                <button 
                                    onClick={() => handleDelete(idea)}
                                    disabled={loadingId === idea.id}
                                    className="text-gray-500 hover:text-red-500 p-1 hover:bg-red-500/10 rounded transition-colors disabled:opacity-50"
                                >
                                    {loadingId === idea.id ? <Loader2 size={16} className="animate-spin text-red-500"/> : <Trash2 size={16} />}
                                </button>
                            </div>
                        </div>
                        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50">
                            <h4 className="text-yellow-400 font-bold mb-1 text-sm">{idea.title}</h4>
                            <p className="text-gray-300 text-sm">{idea.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
  );
};

export default AdminSuggestionsTab;