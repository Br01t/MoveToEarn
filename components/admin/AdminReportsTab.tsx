
import React from 'react';
import { BugReport } from '../../types';
import { Bug, CheckCircle, User } from 'lucide-react';
import { useLanguage } from '../../LanguageContext';

interface AdminReportsTabProps {
  bugReports: BugReport[];
}

const AdminReportsTab: React.FC<AdminReportsTabProps> = ({ bugReports }) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Bug className="text-red-500" /> {t('admin.report.title')}
        </h3>
        
        {bugReports.length === 0 ? (
            <div className="text-center py-12 bg-gray-800 rounded-xl border border-gray-700 border-dashed">
                <CheckCircle className="mx-auto text-gray-600 mb-2" size={48} />
                <p className="text-gray-500">{t('admin.report.no_reports')}</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 gap-4">
                {bugReports.map(report => (
                    <div key={report.id} className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                                <User size={16} className="text-gray-400"/>
                                <div>
                                    <div className="font-bold text-white text-sm">{report.userName}</div>
                                    <div className="text-xs text-gray-500 font-mono">{report.userId}</div>
                                </div>
                            </div>
                            <div className="text-xs text-gray-400">
                                {new Date(report.timestamp).toLocaleString()}
                            </div>
                        </div>
                        <div className="bg-gray-900/50 p-3 rounded-lg mb-3 border border-gray-700/50">
                            <p className="text-gray-300 text-sm">{report.description}</p>
                        </div>
                        {report.screenshot && (
                            <div className="mb-3">
                                <p className="text-xs text-gray-500 mb-1 font-bold uppercase">{t('admin.report.screenshot')}</p>
                                <img src={report.screenshot} alt="Bug Screenshot" className="max-h-48 rounded border border-gray-600" />
                            </div>
                        )}
                        <div className="flex justify-between items-center mt-2 border-t border-gray-700 pt-2">
                            <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${report.status === 'OPEN' ? 'bg-red-900/30 text-red-400' : 'bg-emerald-900/30 text-emerald-400'}`}>
                                {report.status}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
  );
};

export default AdminReportsTab;