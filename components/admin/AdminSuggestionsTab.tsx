
import React from 'react';
import { Suggestion } from '../../types';
import { Lightbulb, User } from 'lucide-react';
import { useLanguage } from '../../LanguageContext';

interface AdminSuggestionsTabProps {
  suggestions: Suggestion[];
}

const AdminSuggestionsTab: React.FC<AdminSuggestionsTabProps> = ({ suggestions }) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
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
                    <div key={idea.id} className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                                <User size={16} className="text-gray-400"/>
                                <div>
                                    <div className="font-bold text-white text-sm">{idea.userName}</div>
                                    <div className="text-xs text-gray-500 font-mono">{idea.userId}</div>
                                </div>
                            </div>
                            <div className="text-xs text-gray-400">
                                {new Date(idea.timestamp).toLocaleString()}
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