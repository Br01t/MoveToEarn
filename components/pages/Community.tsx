
import React from 'react';
import { Users, MessageCircle, Twitter, Globe } from 'lucide-react';
import { useLanguage } from '../../LanguageContext';

const Community: React.FC = () => {
  const { t, tRich } = useLanguage();
  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <h1 className="text-4xl font-bold text-white mb-6 flex items-center gap-3">
        <Users className="text-emerald-400" /> {t('page.comm.title')}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel p-8 rounded-xl hover:border-emerald-500 transition-colors cursor-pointer group">
             <MessageCircle size={48} className="text-indigo-400 mb-4 group-hover:scale-110 transition-transform" />
             <h3 className="text-2xl font-bold text-white mb-2">{t('page.comm.discord')}</h3>
             <p className="text-gray-400">Join 50,000+ runners. Coordinate attacks, trade items, and chat with devs.</p>
          </div>

          <div className="glass-panel p-8 rounded-xl hover:border-cyan-500 transition-colors cursor-pointer group">
             <Twitter size={48} className="text-cyan-400 mb-4 group-hover:scale-110 transition-transform" />
             <h3 className="text-2xl font-bold text-white mb-2">{t('page.comm.twitter')}</h3>
             <p className="text-gray-400">Follow for real-time updates on Burn Events and new feature drops.</p>
          </div>

          <div className="glass-panel p-8 rounded-xl hover:border-yellow-500 transition-colors cursor-pointer group md:col-span-2">
             <Globe size={48} className="text-yellow-400 mb-4 group-hover:scale-110 transition-transform" />
             <h3 className="text-2xl font-bold text-white mb-2">{t('page.comm.dao')}</h3>
             <p className="text-gray-400">Vote on proposals. Use your GOV tokens to decide the future map expansion.</p>
          </div>
      </div>
    </div>
  );
};

export default Community;