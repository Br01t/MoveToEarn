
import React, { useState } from 'react';
import { User, Badge } from '../../types';
import { Crown, Save, Mail, Camera, CheckCircle, X, Flag, Award, Zap, Mountain, Globe, Home, Landmark, Swords, Footprints, Rocket, Tent, Timer, Building2, Moon, Sun, ShieldCheck, Gem, Users } from 'lucide-react';
import { useLanguage } from '../../LanguageContext';

interface ProfileHeaderProps {
  user: User;
  favoriteBadge: Badge | undefined;
  nextLevelKm: number;
  currentLevel: number;
  progressToNextLevel: number;
  onUpdateUser: (updates: Partial<User>) => void;
  onUpgradePremium: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ 
    user, favoriteBadge, nextLevelKm, currentLevel, progressToNextLevel, onUpdateUser, onUpgradePremium 
}) => {
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email || '');
  const [avatar, setAvatar] = useState(user.avatar);

  const handleSave = () => {
    onUpdateUser({ name, email, avatar });
    setIsEditing(false);
  };

  const handleCancel = () => {
      setIsEditing(false);
      setName(user.name);
      setEmail(user.email || '');
      setAvatar(user.avatar);
  };

  const renderBadgeIcon = (iconName: string, className: string) => {
      switch(iconName) {
          case 'Flag': return <Flag className={className} />;
          case 'Crown': return <Crown className={className} />;
          case 'Award': return <Award className={className} />;
          case 'Zap': return <Zap className={className} />;
          case 'Mountain': return <Mountain className={className} />;
          case 'Globe': return <Globe className={className} />;
          case 'Home': return <Home className={className} />;
          case 'Landmark': return <Landmark className={className} />;
          case 'Swords': return <Swords className={className} />;
          case 'Footprints': return <Footprints className={className} />;
          case 'Rocket': return <Rocket className={className} />;
          case 'Tent': return <Tent className={className} />;
          case 'Timer': return <Timer className={className} />;
          case 'Building2': return <Building2 className={className} />;
          case 'Moon': return <Moon className={className} />;
          case 'Sun': return <Sun className={className} />;
          case 'ShieldCheck': return <ShieldCheck className={className} />;
          case 'Gem': return <Gem className={className} />;
          case 'Users': return <Users className={className} />;
          default: return <Award className={className} />;
      }
  };

  return (
      <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden shadow-xl">
          <div className="h-32 bg-gradient-to-r from-gray-900 via-emerald-950 to-gray-900 relative">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30"></div>
              {user.isPremium && (
                 <div className="absolute top-4 right-4 bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg z-10">
                    <Crown size={12} fill="black" /> {t('profile.premium_agent')}
                 </div>
              )}
          </div>
          
          <div className="px-6 md:px-8 pb-6 flex flex-col md:flex-row items-end md:items-start gap-6 -mt-12 relative z-10">
             <div className="relative group">
                 <img src={isEditing ? avatar : user.avatar} alt="Avatar" className={`w-32 h-32 rounded-2xl border-4 bg-gray-800 shadow-2xl object-cover ${user.isPremium ? 'border-yellow-500' : 'border-gray-700'}`} />
                 <div className="absolute -bottom-3 -right-3 bg-gray-900 text-white text-xs font-bold px-3 py-1 rounded-lg border border-gray-600 shadow-lg z-20">
                    LVL {currentLevel}
                 </div>
                 {isEditing && (
                     <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-2xl border-4 border-transparent z-10">
                         <Camera className="text-white opacity-80" />
                     </div>
                 )}
             </div>

             <div className="flex-1 w-full md:w-auto pt-2">
                 {!isEditing ? (
                    <div>
                        <div className="flex flex-wrap items-center gap-3 mb-1">
                            <h1 className="text-3xl font-bold text-white tracking-tight">{user.name}</h1>
                            {favoriteBadge && (
                                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border bg-gray-900/80 text-emerald-400 border-emerald-500`} title={favoriteBadge.name}>
                                    {renderBadgeIcon(favoriteBadge.icon, "w-4 h-4")}
                                    <span className="text-[10px] font-bold uppercase tracking-wider">{favoriteBadge.name}</span>
                                </div>
                            )}
                            <button onClick={() => setIsEditing(true)} className="text-gray-500 hover:text-emerald-400 p-1 hover:bg-gray-700/50 rounded-lg transition-colors"><Save size={18}/></button>
                        </div>
                        <p className="text-gray-400 flex items-center gap-2 text-sm mt-1">
                            <Mail size={14} className="text-emerald-500" /> {user.email || t('profile.no_email')}
                        </p>
                        <div className="mt-4 max-w-lg">
                            <div className="flex justify-between text-[10px] uppercase font-bold text-gray-500 mb-1">
                                <span>{t('profile.xp_progress')}</span>
                                <span>{user.totalKm.toFixed(1)} / {nextLevelKm} KM</span>
                            </div>
                            <div className="w-full bg-gray-900 rounded-full h-2 border border-gray-700">
                                <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${progressToNextLevel}%` }}></div>
                            </div>
                        </div>
                    </div>
                 ) : (
                    <div className="flex flex-col gap-3 w-full max-w-lg animate-fade-in bg-gray-900/50 p-4 rounded-xl border border-gray-700">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">{t('profile.agent_name')}</label>
                                <input value={name} onChange={e => setName(e.target.value)} className="w-full bg-gray-900 border border-emerald-500 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500" />
                            </div>
                            <div>
                                <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">{t('profile.contact_email')}</label>
                                <input value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-gray-900 border border-gray-600 focus:border-emerald-500 rounded px-3 py-2 text-white text-sm focus:outline-none" />
                            </div>
                        </div>
                        <div>
                             <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">{t('profile.avatar_url')}</label>
                             <input value={avatar} onChange={e => setAvatar(e.target.value)} placeholder="https://..." className="w-full bg-gray-900 border border-gray-600 focus:border-emerald-500 rounded px-3 py-2 text-white text-sm focus:outline-none" />
                        </div>
                        <div className="flex gap-2 mt-2">
                            <button onClick={handleSave} className="flex-1 bg-emerald-600 hover:bg-emerald-500 px-3 py-2 rounded text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2">
                                <CheckCircle size={14}/> {t('profile.save_profile')}
                            </button>
                            <button onClick={handleCancel} className="flex-1 bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2">
                                <X size={14}/> {t('profile.cancel')}
                            </button>
                        </div>
                    </div>
                 )}
             </div>

             {!isEditing && (
                <div className="flex gap-3 mt-4 md:mt-12">
                    {!user.isPremium && (
                        <button onClick={onUpgradePremium} className="px-5 py-2.5 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded-xl text-sm shadow-lg flex items-center gap-2 transition-colors">
                            <Crown size={16} /> {t('profile.upgrade_pro')}
                        </button>
                    )}
                </div>
             )}
          </div>
      </div>
  );
};

export default ProfileHeader;