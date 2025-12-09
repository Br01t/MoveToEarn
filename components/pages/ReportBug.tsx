
import React, { useState } from 'react';
import { Bug, Camera, Send, CheckCircle, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../../LanguageContext';

interface ReportBugProps {
  onReport: (description: string, screenshot?: string) => void;
}

const ReportBug: React.FC<ReportBugProps> = ({ onReport }) => {
  const { t } = useLanguage();
  const [description, setDescription] = useState('');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
          alert("File too large. Max 2MB.");
          return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshot(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
        setError(t('report.error_desc'));
        return;
    }
    onReport(description, screenshot || undefined);
    setIsSubmitted(true);
    setError(null);
  };

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-8">
      <h1 className="text-4xl font-bold text-white mb-6 flex items-center gap-3">
        <Bug className="text-red-500" /> {t('report.title')}
      </h1>
      
      <p className="text-gray-400">{t('report.subtitle')}</p>

      {isSubmitted ? (
          <div className="bg-emerald-900/20 border border-emerald-500 rounded-xl p-8 text-center animate-fade-in">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">{t('report.success_title')}</h2>
              <p className="text-gray-400">{t('report.success_desc')}</p>
              <button 
                onClick={() => { setIsSubmitted(false); setDescription(''); setScreenshot(null); }}
                className="mt-6 px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-bold"
              >
                  Send Another
              </button>
          </div>
      ) : (
          <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl p-8 border border-gray-700 space-y-6">
              <div>
                  <label className="block text-sm font-bold text-gray-400 uppercase mb-2">{t('report.desc_label')}</label>
                  <textarea 
                      className="w-full bg-gray-900 border border-gray-600 rounded-xl p-4 text-white focus:border-emerald-500 focus:outline-none min-h-[150px]"
                      placeholder={t('report.desc_placeholder')}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                  />
                  {error && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertTriangle size={12}/> {error}</p>}
              </div>

              <div>
                  <label className="block text-sm font-bold text-gray-400 uppercase mb-2">{t('report.screenshot_label')}</label>
                  <div className="flex items-center gap-4">
                      <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg hover:border-emerald-500 transition-colors group">
                          <Camera size={20} className="text-gray-400 group-hover:text-emerald-400" />
                          <span className="text-sm text-gray-300">Upload Image</span>
                          <input type="file" accept="image/*" onChange={handleFileChange} hidden />
                      </label>
                      {screenshot && (
                          <div className="relative group">
                              <img src={screenshot} alt="Preview" className="h-12 w-12 object-cover rounded border border-gray-600" />
                              <button 
                                type="button"
                                onClick={() => setScreenshot(null)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                  <AlertTriangle size={10} />
                              </button>
                          </div>
                      )}
                  </div>
              </div>

              <button 
                  type="submit"
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg"
              >
                  <Send size={20} /> {t('report.submit_btn')}
              </button>
          </form>
      )}
    </div>
  );
};

export default ReportBug;