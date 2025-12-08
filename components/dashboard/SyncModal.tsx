
import React, { useState, useRef } from 'react';
import { UploadCloud, HelpCircle, X, Shield, FileText, CheckCircle, Lock, Crown, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../../LanguageContext';
import { parseGPX, analyzeRun } from '../../utils/gpx';
import { RunAnalysisData, User } from '../../types';

interface SyncModalProps {
  onClose: () => void;
  onNavigate: (view: any) => void;
  onSyncRun: (data: RunAnalysisData[]) => void;
  user: User;
}

const SyncModal: React.FC<SyncModalProps> = ({ onClose, onNavigate, onSyncRun, user }) => {
  const { t } = useLanguage();
  const [syncTab, setSyncTab] = useState<'FREE' | 'PREMIUM'>('FREE');
  const [uploadStep, setUploadStep] = useState<'SELECT' | 'UPLOADING' | 'PROCESSING' | 'SUCCESS'>('SELECT');
  const [logs, setLogs] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [validResults, setValidResults] = useState<RunAnalysisData[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleStartUpload = async () => {
    if (selectedFiles.length === 0) {
        alert("Please select at least one GPX file.");
        return;
    }
    setUploadStep('UPLOADING');
    setLogs([]);
    setValidResults([]);

    const newResults: RunAnalysisData[] = [];
    const newLogs: string[] = [];

    const addLog = (msg: string) => {
        newLogs.push(msg);
        setLogs([...newLogs]);
    };

    addLog(`Preparing to process ${selectedFiles.length} file(s)...`);

    // Simulated delay for UX
    setTimeout(async () => {
        setUploadStep('PROCESSING');
        
        for (const file of selectedFiles) {
            addLog(`Reading file: ${file.name}...`);
            try {
                const text = await file.text();
                const tracks = parseGPX(text); // Now returns array of tracks
                
                addLog(`Found ${tracks.length} track(s) in ${file.name}. Analyzing...`);

                tracks.forEach((points, idx) => {
                    const analysis = analyzeRun(points, tracks.length > 1 ? `${file.name} (Track ${idx+1})` : file.name);
                    const result = analysis.result;

                    if (result.isValid) {
                        // Duplicate Check
                        const isDuplicate = user.runHistory.some(run => Math.abs(run.timestamp - result.startTime) < 60000);
                        if (isDuplicate) {
                            addLog(`⚠️ SKIPPED: ${file.name} (Track ${idx+1}) - Duplicate run detected.`);
                        } else {
                            newResults.push(result);
                            addLog(`✅ PASSED: ${file.name} (Track ${idx+1}) - ${result.totalKm.toFixed(2)}km`);
                        }
                    } else {
                        addLog(`❌ FAILED: ${file.name} (Track ${idx+1}) - ${result.failureReason}`);
                    }
                });

            } catch (err: any) {
                addLog(`❌ ERROR processing ${file.name}: ${err.message}`);
            }
        }

        setValidResults(newResults);
        
        if (newResults.length > 0) {
            setUploadStep('SUCCESS');
        } else {
            addLog("⚠️ No valid runs found in the selected files.");
            // Keep in processing state to show logs
        }

    }, 1000);
  };

  const handleFinalSubmit = () => {
     if (validResults.length > 0) {
         onSyncRun(validResults);
         onClose();
     }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-gray-800 rounded-t-2xl md:rounded-2xl border border-gray-700 w-full max-w-md shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[85vh]">
         
         {/* Header */}
         <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-900">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
               <UploadCloud className="text-emerald-400" /> {t('sync.title')}
            </h3>
            <div className="flex items-center gap-2">
                <button 
                    onClick={() => onNavigate('HOW_TO_PLAY')}
                    className="text-gray-400 hover:text-emerald-400 text-xs flex items-center gap-1 mr-2"
                    title="Guide"
                >
                    <HelpCircle size={16} /> Help
                </button>
                <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={24}/></button>
            </div>
         </div>
         
         {/* Tabs */}
         <div className="flex border-b border-gray-700">
            <button 
              onClick={() => { setSyncTab('FREE'); setUploadStep('SELECT'); }}
              className={`flex-1 py-3 font-bold text-sm transition-colors ${syncTab === 'FREE' ? 'bg-gray-800 text-emerald-400 border-b-2 border-emerald-400' : 'bg-gray-900 text-gray-500'}`}
            >
                {t('sync.manual')}
            </button>
            <button 
              onClick={() => setSyncTab('PREMIUM')}
              className={`flex-1 py-3 font-bold text-sm transition-colors flex justify-center items-center gap-2 ${syncTab === 'PREMIUM' ? 'bg-gray-800 text-yellow-400 border-b-2 border-yellow-400' : 'bg-gray-900 text-gray-500'}`}
            >
                <Crown size={14} /> {t('sync.auto')}
            </button>
         </div>
         
         {/* Content */}
         <div className="p-6 overflow-y-auto">
            {/* --- FREE TAB: Manual File Upload --- */}
            {syncTab === 'FREE' && (
                <>
                    {uploadStep === 'SELECT' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">{t('sync.upload_label')}</label>
                                {/* Added multiple attribute */}
                                <input 
                                    type="file" 
                                    accept=".gpx,.xml" 
                                    multiple
                                    hidden 
                                    ref={fileInputRef} 
                                    onChange={handleFileSelect} 
                                />
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`w-full border-2 border-dashed rounded-lg p-6 md:p-8 flex flex-col items-center justify-center cursor-pointer transition-colors group ${selectedFiles.length > 0 ? 'border-emerald-500 bg-emerald-900/10' : 'border-gray-600 hover:border-emerald-400 hover:bg-gray-800'}`}
                                >
                                    <FileText className={`mb-3 ${selectedFiles.length > 0 ? 'text-emerald-400' : 'text-gray-500 group-hover:text-emerald-300'}`} size={32} />
                                    {selectedFiles.length > 0 ? (
                                        <div className="text-center">
                                            <span className="text-white font-bold block text-sm">{selectedFiles.length} File(s) Selected</span>
                                            <span className="text-xs text-emerald-400">{t('sync.ready')}</span>
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <span className="text-gray-300 block mb-1 text-sm">{t('sync.click_select')}</span>
                                            <span className="text-xs text-gray-500">{t('sync.supports')}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button 
                                onClick={handleStartUpload}
                                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                            >
                                <UploadCloud size={20} /> {t('sync.analyze_btn')}
                            </button>
                        </div>
                    )}

                    {(uploadStep === 'UPLOADING' || uploadStep === 'PROCESSING') && (
                        <div className="flex flex-col items-center justify-center py-8 space-y-6">
                            <div className="relative">
                                <div className="w-16 h-16 border-4 border-gray-700 border-t-emerald-500 rounded-full animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Shield className="text-emerald-400" size={20} />
                                </div>
                            </div>
                            
                            <div className="w-full bg-black/50 rounded-lg p-4 font-mono text-xs text-emerald-400 h-40 overflow-y-auto border border-gray-700">
                                {logs.map((log, i) => (
                                    <div key={i} className="mb-1"> {log}</div>
                                ))}
                            </div>
                        </div>
                    )}

                    {uploadStep === 'SUCCESS' && (
                        <div className="flex flex-col items-center justify-center py-8 space-y-6 animate-slide-up">
                            <div className="bg-emerald-500/20 p-6 rounded-full border-2 border-emerald-500">
                                <CheckCircle size={48} className="text-emerald-400" />
                            </div>
                            <div className="text-center">
                                <h3 className="text-xl font-bold text-white mb-2">{t('sync.success')}</h3>
                                <div className="text-sm text-gray-300 mb-2">
                                    {validResults.length} run(s) validated successfully.
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm text-gray-300 mb-2 mt-4">
                                    <div className="bg-gray-800 p-2 rounded border border-gray-700">
                                        <span className="block text-[10px] text-gray-500 uppercase">Total Dist</span>
                                        <span className="font-mono text-white">
                                            {validResults.reduce((acc, r) => acc + r.totalKm, 0).toFixed(2)} km
                                        </span>
                                    </div>
                                    <div className="bg-gray-800 p-2 rounded border border-gray-700">
                                        <span className="block text-[10px] text-gray-500 uppercase">Avg Pace</span>
                                        <span className="font-mono text-white">
                                            {(validResults.reduce((acc, r) => acc + r.durationMinutes, 0) / validResults.reduce((acc, r) => acc + r.totalKm, 0)).toFixed(2)} min/km
                                        </span>
                                    </div>
                                </div>
                                <p className="text-gray-400 text-xs">{t('sync.success_desc')}</p>
                            </div>
                            <button 
                                onClick={handleFinalSubmit}
                                className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-colors"
                            >
                                {t('sync.confirm_btn')}
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* --- PREMIUM TAB: Auto-Sync --- */}
            {syncTab === 'PREMIUM' && (
                <div className="space-y-6 py-4">
                    {!user.isPremium ? (
                        <div className="text-center space-y-6">
                            <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700 flex flex-col items-center">
                                <div className="bg-gray-800 p-4 rounded-full mb-4">
                                    <Lock size={32} className="text-gray-500" />
                                </div>
                                <h4 className="text-lg font-bold text-white mb-2">{t('sync.premium_locked')}</h4>
                                <p className="text-gray-400 text-xs mb-6 max-w-xs mx-auto">
                                    {t('sync.premium_desc')}
                                </p>
                                <button className="w-full py-4 bg-gray-700 text-gray-400 font-bold rounded-xl cursor-not-allowed text-sm">
                                    Requires Premium Subscription
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-gray-900/50 p-4 rounded-xl border border-emerald-500/30 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="bg-[#FC4C02] p-2 rounded text-white font-bold text-xs">STRAVA</div>
                                    <div>
                                        <div className="text-white font-bold text-sm">Connected</div>
                                        <div className="text-xs text-emerald-400 flex items-center gap-1">
                                            <CheckCircle size={10} /> Sync Active
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default SyncModal;