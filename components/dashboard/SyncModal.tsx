
import React, { useState, useRef } from 'react';
import { UploadCloud, HelpCircle, X, Shield, FileText, CheckCircle, Lock, Crown, AlertTriangle, RefreshCw, Archive } from 'lucide-react';
import { useLanguage } from '../../LanguageContext';
import { parseActivityFile, analyzeRun } from '../../utils/gpx';
import { RunAnalysisData, User } from '../../types';
import JSZip from 'jszip';
import { useGlobalUI } from '../../contexts/GlobalUIContext';

interface SyncModalProps {
  onClose: () => void;
  onNavigate: (view: any) => void;
  onSyncRun: (data: RunAnalysisData[]) => void;
  user: User;
}

const SyncModal: React.FC<SyncModalProps> = ({ onClose, onNavigate, onSyncRun, user }) => {
  const { t } = useLanguage();
  const { showToast } = useGlobalUI();
  const [syncTab, setSyncTab] = useState<'FREE' | 'PREMIUM'>('FREE');
  const [uploadStep, setUploadStep] = useState<'SELECT' | 'UPLOADING' | 'PROCESSING' | 'SUCCESS' | 'ERROR'>('SELECT');
  const [errorType, setErrorType] = useState<'DUPLICATE' | 'INVALID' | null>(null);
  const [failureDetail, setFailureDetail] = useState<string | null>(null); 
  const [logs, setLogs] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [validResults, setValidResults] = useState<RunAnalysisData[]>([]);
  const [processedCount, setProcessedCount] = useState(0);
  const [totalFilesToProcess, setTotalFilesToProcess] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleStartUpload = async () => {
    if (selectedFiles.length === 0) {
        showToast(t('sync.alert.no_file'), 'ERROR');
        return;
    }
    setUploadStep('UPLOADING');
    setErrorType(null);
    setFailureDetail(null);
    setLogs([]);
    setValidResults([]);
    setProcessedCount(0);
    setTotalFilesToProcess(0);

    const newResults: RunAnalysisData[] = [];
    let duplicateCount = 0;
    let ignoredOldCount = 0;
    let lastFailureReason = "";

    const addLog = (msg: string) => {
        setLogs(prev => [...prev, msg]);
    };

    // Calculate the 7-day cutoff timestamp (from now, or strictly from file upload time)
    // 7 days * 24h * 60m * 60s * 1000ms
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
    const cutoffTimestamp = Date.now() - SEVEN_DAYS_MS;

    addLog(`Preparing to process files... Cutoff: ${new Date(cutoffTimestamp).toLocaleDateString()}`);

    // Helper to process a single raw file content
    const processSingleFileContent = async (content: string | ArrayBuffer, fileName: string) => {
        try {
            const tracks = await parseActivityFile(content, fileName);
            let validInFile = 0;

            tracks.forEach((points, idx) => {
                // 1. DATE CHECK (7-Day Rule)
                // Use the start time of the run found in the GPS data
                // if (points.length > 0 && points[0].time.getTime() < cutoffTimestamp) {
                //     ignoredOldCount++;
                //     // Only log if it's not spamming
                //     // addLog(`Skipped (Old): ${fileName} - ${points[0].time.toLocaleDateString()}`);
                //     return;
                // }

                const analysis = analyzeRun(points, tracks.length > 1 ? `${fileName} (Track ${idx+1})` : fileName);
                const result = analysis.result;

                if (result.isValid) {
                    // --- ENHANCED DUPLICATE CHECK ---
                    const isDuplicate = user.runHistory.some(run => {
                        const timeMatch = Math.abs(run.timestamp - result.startTime) < 60000;
                        const statsMatch = Math.abs(Number(run.km) - result.totalKm) < 0.1 && Math.abs((run.duration || 0) - result.durationMinutes) < 1.0;
                        return timeMatch || statsMatch;
                    });

                    if (isDuplicate) {
                        duplicateCount++;
                        lastFailureReason = "Duplicate run detected.";
                        // addLog(`⚠️ Duplicate: ${fileName}`);
                    } else {
                        // Check if duplicate is already in current batch
                        const isBatchDuplicate = newResults.some(res => Math.abs(res.startTime - result.startTime) < 60000);
                        if (!isBatchDuplicate) {
                            newResults.push(result);
                            validInFile++;
                            addLog(`✅ OK: ${fileName} (${result.totalKm.toFixed(2)}km)`);
                        }
                    }
                } else {
                    lastFailureReason = result.failureReason || "Validation Error";
                    // addLog(`❌ Invalid: ${fileName} - ${result.failureReason}`);
                }
            });
            return validInFile;
        } catch (err: any) {
            // addLog(`Error parsing ${fileName}: ${err.message}`);
            return 0;
        }
    };

    setTimeout(async () => {
        setUploadStep('PROCESSING');
        
        const allPendingFiles: { name: string, content: string | ArrayBuffer }[] = [];

        // 1. Unzip / Expand Files
        for (const file of selectedFiles) {
            if (file.name.toLowerCase().endsWith('.zip')) {
                addLog(`📦 Unzipping ${file.name}...`);
                try {
                    const zip = await JSZip.loadAsync(file);
                    const filesInZip = Object.keys(zip.files);
                    
                    for (const filename of filesInZip) {
                        const zipEntry = zip.files[filename];
                        if (zipEntry.dir || filename.startsWith('__MACOSX') || filename.startsWith('.')) continue;
                        
                        const lowerName = filename.toLowerCase();
                        if (lowerName.endsWith('.gpx') || lowerName.endsWith('.tcx') || lowerName.endsWith('.json') || lowerName.endsWith('.csv') || lowerName.endsWith('.xml')) {
                            const text = await zipEntry.async("string");
                            allPendingFiles.push({ name: filename, content: text });
                        } else if (lowerName.endsWith('.fit')) {
                            const arrayBuffer = await zipEntry.async("arraybuffer");
                            allPendingFiles.push({ name: filename, content: arrayBuffer });
                        }
                    }
                } catch (e) {
                    addLog(`❌ ZIP Error: ${e}`);
                }
            } else {
                // Regular file
                let content: string | ArrayBuffer;
                if (file.name.toLowerCase().endsWith('.fit')) {
                    content = await file.arrayBuffer();
                } else {
                    content = await file.text();
                }
                allPendingFiles.push({ name: file.name, content });
            }
        }

        setTotalFilesToProcess(allPendingFiles.length);
        addLog(`Found ${allPendingFiles.length} files to analyze.`);

        // 2. Process expanded list
        for (let i = 0; i < allPendingFiles.length; i++) {
            setProcessedCount(i + 1);
            await processSingleFileContent(allPendingFiles[i].content, allPendingFiles[i].name);
            
            // Allow UI to breathe
            if (i % 5 === 0) await new Promise(r => setTimeout(r, 10));
        }

        if (newResults.length > 0) {
            setValidResults(newResults);
            setUploadStep('SUCCESS');
        } else {
            if (duplicateCount > 0) {
                setErrorType('DUPLICATE');
                setFailureDetail(t('sync.error.bulk_duplicates'));
                addLog(`⚠️ Processed ${processedCount} files. ${duplicateCount} duplicates. ${ignoredOldCount} too old.`);
            } else if (ignoredOldCount > 0 && newResults.length === 0) {
                setErrorType('INVALID');
                setFailureDetail(t('sync.error.7days'));
                addLog(`⚠️ All files skipped (7-Day Rule).`);
            } else {
                setErrorType('INVALID');
                setFailureDetail(lastFailureReason || "No valid data found.");
            }
            setUploadStep('ERROR');
        }

    }, 500);
  };

  const handleFinalSubmit = () => {
     if (validResults.length > 0) {
         onSyncRun(validResults);
         onClose();
     }
  };

  const handleRetry = () => {
      setUploadStep('SELECT');
      setSelectedFiles([]);
      setLogs([]);
      setErrorType(null);
      setFailureDetail(null);
  };

  const getFriendlyErrorMessage = (errorKey: 'DUPLICATE' | 'INVALID' | null, detail: string | null) => {
      if (errorKey === 'DUPLICATE') return t('sync.error.duplicate_desc');
      return detail || t('sync.error.no_data_desc');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="glass-panel-heavy rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[85vh]">
         
         <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/20">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
               <UploadCloud className="text-emerald-400" /> {t('sync.title')}
            </h3>
            <div className="flex items-center gap-2">
                <button 
                    onClick={() => { onClose(); onNavigate('HOW_TO_PLAY'); }}
                    className="text-gray-400 hover:text-emerald-400 text-xs flex items-center gap-1 mr-2"
                >
                    <HelpCircle size={16} /> Help
                </button>
                <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10"><X size={24}/></button>
            </div>
         </div>
         
         <div className="flex border-b border-white/10 bg-black/10">
            <button 
              onClick={() => { setSyncTab('FREE'); setUploadStep('SELECT'); }}
              disabled={uploadStep === 'PROCESSING' || uploadStep === 'SUCCESS'}
              className={`flex-1 py-3 font-bold text-sm transition-colors ${syncTab === 'FREE' ? 'bg-white/5 text-emerald-400 border-b-2 border-emerald-400' : 'text-gray-500 hover:text-gray-300'}`}
            >
                {t('sync.manual')}
            </button>
            <button 
              onClick={() => setSyncTab('PREMIUM')}
              disabled={uploadStep === 'PROCESSING' || uploadStep === 'SUCCESS'}
              className={`flex-1 py-3 font-bold text-sm transition-colors flex justify-center items-center gap-2 ${syncTab === 'PREMIUM' ? 'bg-white/5 text-yellow-400 border-b-2 border-yellow-400' : 'text-gray-500 hover:text-gray-300'}`}
            >
                <Crown size={14} /> {t('sync.auto')}
            </button>
         </div>
         
         <div className="p-6 overflow-y-auto">
            {syncTab === 'FREE' && (
                <>
                    {uploadStep === 'SELECT' && (
                        <div className="space-y-4">
                            {/* Bulk Info */}
                            <div className="bg-blue-900/20 border border-blue-500/30 p-3 rounded-lg flex items-start gap-3">
                                <Archive size={18} className="text-blue-400 shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="text-xs font-bold text-blue-200 uppercase">{t('sync.bulk.title')}</h4>
                                    <p className="text-[10px] text-blue-300 leading-tight mt-1">{t('sync.bulk.info')}</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">{t('sync.upload_label')}</label>
                                <input 
                                    type="file" 
                                    accept=".gpx,.xml,.tcx,.fit,.json,.csv,.zip" 
                                    multiple
                                    hidden 
                                    ref={fileInputRef} 
                                    onChange={handleFileSelect} 
                                />
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`w-full border-2 border-dashed rounded-lg p-6 md:p-8 flex flex-col items-center justify-center cursor-pointer transition-colors group ${selectedFiles.length > 0 ? 'border-emerald-500 bg-emerald-900/10' : 'border-gray-600 hover:border-emerald-400 hover:bg-white/5'}`}
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
                                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20"
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
                            
                            {totalFilesToProcess > 0 && (
                                <div className="w-full text-center">
                                    <p className="text-xs font-bold text-gray-300 mb-1">Processing {processedCount} / {totalFilesToProcess}</p>
                                    <div className="w-full bg-gray-700 rounded-full h-1.5 overflow-hidden">
                                        <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${(processedCount/totalFilesToProcess)*100}%` }}></div>
                                    </div>
                                </div>
                            )}

                            <div className="w-full bg-black/50 rounded-lg p-4 font-mono text-xs text-emerald-400 h-40 overflow-y-auto border border-gray-700/50">
                                {logs.map((log, i) => <div key={i} className="mb-1"> {log}</div>)}
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
                                <div className="text-sm text-gray-300 mb-2">{validResults.length} run(s) validated.</div>
                                <div className="grid grid-cols-2 gap-4 text-sm text-gray-300 mb-2 mt-4">
                                    <div className="bg-black/30 p-2 rounded border border-gray-700">
                                        <span className="block text-[10px] text-gray-500 uppercase">Total Dist</span>
                                        <span className="font-mono text-white">{validResults.reduce((acc, r) => acc + r.totalKm, 0).toFixed(2)} km</span>
                                    </div>
                                    <div className="bg-black/30 p-2 rounded border border-gray-700">
                                        <span className="block text-[10px] text-gray-500 uppercase">Total Time</span>
                                        <span className="font-mono text-white">{Math.floor(validResults.reduce((acc, r) => acc + r.durationMinutes, 0))} min</span>
                                    </div>
                                </div>
                                <p className="text-gray-400 text-xs">{t('sync.success_desc')}</p>
                            </div>
                            <button onClick={handleFinalSubmit} className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-colors">{t('sync.confirm_btn')}</button>
                        </div>
                    )}

                    {uploadStep === 'ERROR' && (
                        <div className="flex flex-col items-center justify-center py-8 space-y-6 animate-slide-up">
                            <div className="bg-red-500/20 p-6 rounded-full border-2 border-red-500 animate-pulse">
                                <AlertTriangle size={48} className="text-red-500" />
                            </div>
                            <div className="text-center">
                                <h3 className="text-xl font-bold text-white mb-2">{t('sync.error.title')}</h3>
                                <div className="bg-red-900/30 border border-red-500/30 p-3 rounded-lg mb-4 text-center">
                                    <p className="text-red-200 font-bold text-sm">{getFriendlyErrorMessage(errorType, failureDetail)}</p>
                                    {failureDetail && !errorType && <p className="text-[10px] text-red-400/50 mt-1 font-mono">{failureDetail}</p>}
                                </div>
                                <div className="w-full bg-black/50 rounded-lg p-3 font-mono text-[10px] text-red-300 h-32 overflow-y-auto border border-red-900/50 text-left mb-4">
                                    {logs.map((log, i) => <div key={i} className="mb-1">{log}</div>)}
                                </div>
                            </div>
                            <button onClick={handleRetry} className="w-full py-4 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                                <RefreshCw size={20} /> {t('sync.retry_btn')}
                            </button>
                        </div>
                    )}
                </>
            )}

            {syncTab === 'PREMIUM' && (
                <div className="space-y-6 py-4">
                    {!user.isPremium ? (
                        <div className="text-center space-y-6">
                            <div className="bg-black/30 p-6 rounded-xl border border-gray-700 flex flex-col items-center">
                                <div className="bg-gray-800 p-4 rounded-full mb-4"><Lock size={32} className="text-gray-500" /></div>
                                <h4 className="text-lg font-bold text-white mb-2">{t('sync.premium_locked')}</h4>
                                <p className="text-gray-400 text-xs mb-6 max-w-xs mx-auto">{t('sync.premium_desc')}</p>
                                <button className="w-full py-4 bg-gray-700 text-gray-400 font-bold rounded-xl cursor-not-allowed text-sm">Requires Premium Subscription</button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-black/30 p-4 rounded-xl border border-emerald-500/30 flex items-center justify-center">
                                <div className="flex items-center gap-3">
                                    <div className="bg-[#FC4C02] p-2 rounded text-white font-bold text-xs">STRAVA</div>
                                    <div>
                                        <div className="text-white font-bold text-sm">Connected</div>
                                        <div className="text-xs text-emerald-400 flex items-center gap-1"><CheckCircle size={10} /> Sync Active</div>
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