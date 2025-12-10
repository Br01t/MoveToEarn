
import React, { useState } from 'react';
import { Lightbulb, Send, CheckCircle, AlertTriangle, Sparkles, Loader2 } from 'lucide-react';
import { useLanguage } from '../../LanguageContext';

interface SuggestionPageProps {
  onSubmit: (title: string, description: string) => Promise<boolean>;
}

const SuggestionPage: React.FC<SuggestionPageProps> = ({ onSubmit }) => {
  const { t } = useLanguage();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
        setError(t('suggest.error_desc'));
        return;
    }
    
    setIsSending(true);
    setError(null);
    
    const success = await onSubmit(title, description);
    
    setIsSending(false);
    if (success) {
        setIsSubmitted(true);
    } else {
        setError("Failed to submit suggestion. Please try again.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-8">
      <h1 className="text-4xl font-bold text-white mb-6 flex items-center gap-3">
        <Lightbulb className="text-yellow-400" /> {t('suggest.title')}
      </h1>
      
      <p className="text-gray-400">{t('suggest.subtitle')}</p>

      {isSubmitted ? (
          <div className="bg-yellow-900/20 border border-yellow-500 rounded-xl p-8 text-center animate-fade-in relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10"><Sparkles size={100} /></div>
              <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-yellow-500/50">
                  <CheckCircle size={32} className="text-yellow-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">{t('suggest.success_title')}</h2>
              <p className="text-gray-400">{t('suggest.success_desc')}</p>
              <button 
                onClick={() => { setIsSubmitted(false); setTitle(''); setDescription(''); }}
                className="mt-6 px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-bold transition-colors"
              >
                  Send Another
              </button>
          </div>
      ) : (
          <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl p-8 border border-gray-700 space-y-6">
              <div>
                  <label className="block text-sm font-bold text-gray-400 uppercase mb-2">{t('suggest.title_label')}</label>
                  <input 
                      type="text"
                      className="w-full bg-gray-900 border border-gray-600 rounded-xl p-4 text-white focus:border-yellow-500 focus:outline-none"
                      placeholder={t('suggest.title_placeholder')}
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      disabled={isSending}
                  />
              </div>

              <div>
                  <label className="block text-sm font-bold text-gray-400 uppercase mb-2">{t('suggest.desc_label')}</label>
                  <textarea 
                      className="w-full bg-gray-900 border border-gray-600 rounded-xl p-4 text-white focus:border-yellow-500 focus:outline-none min-h-[150px]"
                      placeholder={t('suggest.desc_placeholder')}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      disabled={isSending}
                  />
                  {error && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertTriangle size={12}/> {error}</p>}
              </div>

              <button 
                  type="submit"
                  disabled={isSending}
                  className="w-full py-4 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-yellow-900/20 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                  {isSending ? <Loader2 size={20} className="animate-spin"/> : <Send size={20} />} 
                  {isSending ? 'Sending...' : t('suggest.submit_btn')}
              </button>
          </form>
      )}
    </div>
  );
};

export default SuggestionPage;