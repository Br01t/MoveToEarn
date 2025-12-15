
import React, { useState } from 'react';
import { Bug, Camera, Send, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { useLanguage } from '../../LanguageContext';
import { compressImage } from '../../utils/imageCompression';
import { useGlobalUI } from '../../contexts/GlobalUIContext';

interface ReportBugProps {
  onReport: (description: string, screenshot?: File) => Promise<boolean>;
}

const ReportBug: React.FC<ReportBugProps> = ({ onReport }) => {
  const { t } = useLanguage();
  const { showToast } = useGlobalUI();
  const [description, setDescription] = useState('');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Increased limit to 20MB for high-res mobile photos (compression will reduce this significantly later)
      if (file.size > 20 * 1024 * 1024) { 
          showToast("File too large. Max 20MB.", 'ERROR');
          return;
      }
      
      try {
          // Compress immediately for preview and preparation
          // Reduce to 1024px width and 0.6 quality for better readability of bug reports
          const compressed = await compressImage(file, 1024, 0.6);
          setScreenshotFile(compressed);
          setPreviewUrl(URL.createObjectURL(compressed));
      } catch (err) {
          console.error("Compression error:", err);
          showToast("Failed to process image.", 'ERROR');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
        setError(t('report.error_desc'));
        return;
    }
    
    setIsSending(true);
    setError(null);
    
    const success = await onReport(description, screenshotFile || undefined);
    
    setIsSending(false);
    if (success) {
        setIsSubmitted(true);
    } else {
        setError("Failed to send report. Please check your connection and try again.");
    }
  };

  const resetForm = () => {
      setIsSubmitted(false);
      setDescription('');
      setScreenshotFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
  };

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-8">
      <h1 className="text-4xl font-bold text-white mb-6 flex items-center gap-3">
        <Bug className="text-red-500" /> {t('report.title')}
      </h1>
      
      <p className="text-gray-400">{t('report.subtitle')}</p>

      {isSubmitted ? (
          <div className="bg-emerald-900/20 border border-emerald-500 rounded-xl p-8 text-center animate-fade-in backdrop-blur-sm">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">{t('report.success_title')}</h2>
              <p className="text-gray-400">{t('report.success_desc')}</p>
              <button 
                onClick={resetForm}
                className="mt-6 px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-bold"
              >
                  Send Another
              </button>
          </div>
      ) : (
          <form onSubmit={handleSubmit} className="glass-panel rounded-xl p-8 space-y-6">
              <div>
                  <label className="block text-sm font-bold text-gray-400 uppercase mb-2">{t('report.desc_label')}</label>
                  <textarea 
                      className="w-full bg-black/40 border border-gray-600 rounded-xl p-4 text-white focus:border-emerald-500 focus:outline-none min-h-[150px]"
                      placeholder={t('report.desc_placeholder')}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      disabled={isSending}
                  />
                  {error && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertTriangle size={12}/> {error}</p>}
              </div>

              <div>
                  <label className="block text-sm font-bold text-gray-400 uppercase mb-2">{t('report.screenshot_label')}</label>
                  <div className="flex items-center gap-4">
                      <label className={`cursor-pointer flex items-center gap-2 px-4 py-2 bg-black/40 border border-gray-600 rounded-lg hover:border-emerald-500 transition-colors group ${isSending ? 'opacity-50 cursor-not-allowed' : ''}`}>
                          <Camera size={20} className="text-gray-400 group-hover:text-emerald-400" />
                          <span className="text-sm text-gray-300">Upload Image</span>
                          <input type="file" accept="image/*" onChange={handleFileChange} hidden disabled={isSending} />
                      </label>
                      {previewUrl && (
                          <div className="relative group">
                              <img src={previewUrl} alt="Preview" className="h-12 w-12 object-cover rounded border border-gray-600" />
                              <button 
                                type="button"
                                onClick={() => { setScreenshotFile(null); URL.revokeObjectURL(previewUrl); setPreviewUrl(null); }}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                disabled={isSending}
                              >
                                  <AlertTriangle size={10} />
                              </button>
                          </div>
                      )}
                  </div>
                  <p className="text-[10px] text-gray-500 mt-2">Supported formats: JPG, PNG, WEBP.</p>
              </div>

              <button 
                  type="submit"
                  disabled={isSending}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
              >
                  {isSending ? <Loader2 size={20} className="animate-spin"/> : <Send size={20} />} 
                  {isSending ? 'Sending...' : t('report.submit_btn')}
              </button>
          </form>
      )}
    </div>
  );
};

export default ReportBug;