
import React, { useState } from 'react';
import { BugReport } from '../../types';
import { Bug, CheckCircle, Trash2, User, Loader2 } from 'lucide-react';
import { useLanguage } from '../../LanguageContext';
import { ConfirmModal, NotificationToast } from './AdminUI';

interface AdminReportsTabProps {
  bugReports: BugReport[];
  onUpdateStatus?: (id: string, status: 'OPEN' | 'WIP' | 'FIXED' | 'RESOLVED') => Promise<{ error?: string, success?: boolean }>;
  onDelete?: (id: string) => Promise<{ error?: string, success?: boolean }>;
}

const AdminReportsTab: React.FC<AdminReportsTabProps> = ({ bugReports, onUpdateStatus, onDelete }) => {
  const { t } = useLanguage();
  const [confirmAction, setConfirmAction] = useState<{ title: string, message: string, action: () => Promise<void> } | null>(null);
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleStatusChange = async (reportId: string, newStatus: string) => {
      if (!onUpdateStatus) return;
      // Optimistic update handled by parent, but we show loading locally if needed
      const result = await onUpdateStatus(reportId, newStatus as any);
      if (result.success) setNotification({ message: "Status updated", type: 'success' });
      else setNotification({ message: result.error || "Update failed. Check DB permissions.", type: 'error' });
  };

  const handleDelete = (report: BugReport) => {
      setConfirmAction({
          title: "Delete Bug Report",
          message: "Are you sure you want to delete this report?",
          action: async () => {
              if (onDelete) {
                  setLoadingId(report.id);
                  const result = await onDelete(report.id);
                  setLoadingId(null);
                  if (result.success) setNotification({ message: "Report deleted", type: 'success' });
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
                    <div key={report.id} className="bg-gray-800 p-4 rounded-xl border border-gray-700 hover:border-gray-600 transition-colors">
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
                                <a href={report.screenshot} target="_blank" rel="noreferrer">
                                    <img src={report.screenshot} alt="Bug Screenshot" className="max-h-48 rounded border border-gray-600 hover:opacity-80 transition-opacity" />
                                </a>
                            </div>
                        )}
                        <div className="flex justify-between items-center mt-2 border-t border-gray-700 pt-2">
                            <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${report.status === 'OPEN' ? 'bg-red-500' : (report.status === 'WIP' ? 'bg-yellow-500' : 'bg-emerald-500')}`}></span>
                                <select 
                                    value={report.status}
                                    onChange={(e) => handleStatusChange(report.id, e.target.value)}
                                    className="bg-gray-900 border border-gray-600 text-white text-xs rounded px-2 py-1 focus:outline-none focus:border-emerald-500"
                                >
                                    <option value="OPEN">OPEN</option>
                                    <option value="WIP">WIP</option>
                                    <option value="FIXED">FIXED</option>
                                    <option value="RESOLVED">RESOLVED</option>
                                </select>
                            </div>
                            <button 
                                onClick={() => handleDelete(report)}
                                disabled={loadingId === report.id}
                                className="text-gray-500 hover:text-red-500 p-2 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                                title="Delete Report"
                            >
                                {loadingId === report.id ? <Loader2 size={16} className="animate-spin text-red-500"/> : <Trash2 size={16} />}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
  );
};

export default AdminReportsTab;