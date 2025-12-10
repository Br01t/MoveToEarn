
import React, { useState } from 'react';
import { BugReport, Suggestion } from '../../types';
import { X, Bug, Lightbulb, CheckCircle, Clock } from 'lucide-react';
import { useLanguage } from '../../LanguageContext';

interface UserSubmissionsModalProps {
  bugReports: BugReport[];
  suggestions: Suggestion[];
  onClose: () => void;
}

const UserSubmissionsModal: React.FC<UserSubmissionsModalProps> = ({ bugReports, suggestions, onClose }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'BUGS' | 'IDEAS'>('BUGS');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-lg shadow-2xl flex flex-col max-h-[80vh] animate-slide-up">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-800/50 rounded-t-2xl">
            <h3 className="font-bold text-white flex items-center gap-2">
                {activeTab === 'BUGS' ? <Bug className="text-red-400" size={20}/> : <Lightbulb className="text-yellow-400" size={20}/>}
                My Submissions
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-700 transition-colors">
                <X size={20} />
            </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
            <button 
                onClick={() => setActiveTab('BUGS')}
                className={`flex-1 py-3 text-sm font-bold transition-colors border-b-2 ${activeTab === 'BUGS' ? 'border-red-500 text-white bg-red-900/10' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
            >
                Bug Reports ({bugReports.length})
            </button>
            <button 
                onClick={() => setActiveTab('IDEAS')}
                className={`flex-1 py-3 text-sm font-bold transition-colors border-b-2 ${activeTab === 'IDEAS' ? 'border-yellow-500 text-white bg-yellow-900/10' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
            >
                Suggestions ({suggestions.length})
            </button>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {activeTab === 'BUGS' ? (
                bugReports.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 text-sm">No bug reports submitted.</div>
                ) : (
                    bugReports.map(bug => (
                        <div key={bug.id} className="bg-gray-800 p-3 rounded-xl border border-gray-700">
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${bug.status === 'OPEN' ? 'bg-red-900/30 text-red-400' : 'bg-emerald-900/30 text-emerald-400'}`}>
                                    {bug.status}
                                </span>
                                <span className="text-[10px] text-gray-500">{new Date(bug.timestamp).toLocaleDateString()}</span>
                            </div>
                            <p className="text-sm text-gray-300 line-clamp-2 mb-2">{bug.description}</p>
                            {bug.screenshot && (
                                <div className="text-[10px] text-gray-500 flex items-center gap-1">
                                    <CheckCircle size={10} /> Screenshot attached
                                </div>
                            )}
                        </div>
                    ))
                )
            ) : (
                suggestions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 text-sm">No suggestions submitted.</div>
                ) : (
                    suggestions.map(idea => (
                        <div key={idea.id} className="bg-gray-800 p-3 rounded-xl border border-gray-700">
                            <div className="flex justify-between items-start mb-1">
                                <h4 className="font-bold text-yellow-400 text-sm">{idea.title}</h4>
                                <span className="text-[10px] text-gray-500">{new Date(idea.timestamp).toLocaleDateString()}</span>
                            </div>
                            <p className="text-sm text-gray-300 line-clamp-3">{idea.description}</p>
                        </div>
                    ))
                )
            )}
        </div>

      </div>
    </div>
  );
};

export default UserSubmissionsModal;