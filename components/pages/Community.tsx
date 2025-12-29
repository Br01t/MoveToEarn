import React from 'react';
import { Users, MessageCircle, Twitter, Instagram, Send, Mail, Copy, Check, ExternalLink } from 'lucide-react';
import { useLanguage } from '../../LanguageContext';

const Community: React.FC = () => {
  const { t } = useLanguage();
  const [copied, setCopied] = React.useState(false);
  const email = 'zonerun.team@gmail.com';

  const copyEmail = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const CommunityCard = ({ icon: Icon, title, desc, colorClass, link }: { icon: any, title: string, desc: string, colorClass: string, link?: string }) => (
    <div className={`glass-panel p-8 rounded-2xl border border-white/5 hover:border-${colorClass}/50 transition-all cursor-pointer group flex flex-col h-full shadow-lg`}>
       <div className={`text-${colorClass} mb-4 group-hover:scale-110 transition-transform`}>
          <Icon size={48} />
       </div>
       <h3 className="text-2xl font-bold text-white mb-2 uppercase tracking-tight">{title}</h3>
       <p className="text-gray-400 text-sm leading-relaxed flex-1 font-medium">{desc}</p>
       {link && (
         <div className={`mt-4 text-xs font-bold uppercase tracking-widest text-${colorClass} opacity-0 group-hover:opacity-100 transition-opacity`}>
           Connect Now →
         </div>
       )}
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-12 pb-24">
      {/* HEADER SECTION */}
      <div className="text-center space-y-6 mb-16">
        <div className="inline-flex p-4 glass-panel rounded-full mb-2 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
            <Users className="text-emerald-400" size={48} />
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight uppercase">
          {t('page.comm.title')}
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto font-medium leading-relaxed">
          {t('page.comm.subtitle')}
        </p>

        {/* EMAIL INTERACTIVE SECTION */}
        <div className="flex flex-col items-center gap-3 pt-6">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500/60">{t('page.comm.email')}</span>
            <div className="flex items-center gap-2">
                <div 
                    className="group flex items-center gap-4 px-6 py-4 glass-panel rounded-2xl border-white/10 hover:border-emerald-500/50 transition-all bg-emerald-500/5 shadow-2xl"
                >
                    <a 
                        href={`mailto:${email}`}
                        className="flex items-center gap-4 group/link"
                        title="Send Email"
                    >
                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 group-hover/link:bg-emerald-500 group-hover/link:text-black transition-all">
                            <Mail size={20} />
                        </div>
                        <span className="text-lg md:text-xl font-mono font-bold text-white group-hover/link:text-emerald-400 transition-colors border-b border-transparent group-hover/link:border-emerald-500/30">
                            {email}
                        </span>
                    </a>

                    <div className="w-px h-8 bg-white/10 mx-2 hidden sm:block"></div>

                    <button 
                        onClick={copyEmail}
                        className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-all border border-white/5 group/copy"
                        title="Copy to Clipboard"
                    >
                        {copied ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} className="group-hover/copy:scale-110 transition-transform" />}
                    </button>
                </div>
            </div>
            <div className="h-4">
                {copied && <span className="text-[10px] font-bold text-emerald-400 animate-pulse uppercase tracking-widest">Address copied!</span>}
            </div>
        </div>
      </div>

      {/* SOCIAL GRID - 4 CARDS (2x2 on Desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* DISCORD */}
          <CommunityCard 
            icon={MessageCircle} 
            title={t('page.comm.discord')} 
            desc={t('page.comm.discord_desc')} 
            colorClass="indigo-400"
          />

          {/* TELEGRAM */}
          <CommunityCard 
            icon={Send} 
            title={t('page.comm.telegram')} 
            desc={t('page.comm.telegram_desc')} 
            colorClass="sky-400"
          />

          {/* X / TWITTER */}
          <CommunityCard 
            icon={Twitter} 
            title={t('page.comm.twitter')} 
            desc={t('page.comm.twitter_desc')} 
            colorClass="white"
          />

          {/* INSTAGRAM */}
          <CommunityCard 
            icon={Instagram} 
            title={t('page.comm.instagram')} 
            desc={t('page.comm.instagram_desc')} 
            colorClass="pink-500"
          />
      </div>

      {/* FOOTER / SUPPORT SECTION */}
      <div className="mt-20 glass-panel p-10 rounded-3xl border-emerald-500/20 text-center relative overflow-hidden group shadow-2xl">
          <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
          <div className="relative z-10">
              <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">{t('page.comm.footer_title')}</h3>
              <p className="text-gray-400 text-sm max-w-lg mx-auto leading-relaxed font-medium">
                  {t('page.comm.footer_desc')}
              </p>
          </div>
          {/* Decorative background element */}
          <div className="absolute -bottom-6 -right-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <Users size={120} className="text-emerald-400" />
          </div>
      </div>
    </div>
  );
};

export default Community;