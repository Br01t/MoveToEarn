import React, { useState } from 'react';
import { Badge, Mission, Rarity, User } from '../../types';
import { Award, Lock, CheckCircle, Search, Flag, Crown, Zap, Mountain, Globe, Home, Landmark, Swords, Footprints, Rocket, Tent, Timer, Building2, Moon, Sun, ShieldCheck, Gem, Users, Info } from 'lucide-react';
import Pagination from '../Pagination';
import { useLanguage } from '../../LanguageContext';

interface ProfileAchievementsTabProps {
  user: User;
  earnedBadges: Badge[];
  completedMissions: Mission[];
  onEquipBadge: (id: string) => void;
}

const BADGES_PER_PAGE = 24;
const COMPLETED_MISSIONS_PER_PAGE = 5;

const ProfileAchievementsTab: React.FC<ProfileAchievementsTabProps> = ({ user, earnedBadges, completedMissions, onEquipBadge }) => {
  const { t } = useLanguage();
  const [badgePage, setBadgePage] = useState(1);
  const [badgeFilter, setBadgeFilter] = useState<'ALL' | Rarity>('ALL');
  
  const [completedMissionPage, setCompletedMissionPage] = useState(1);
  const [missionLogFilter, setMissionLogFilter] = useState<'ALL' | Rarity>('ALL');

  const filteredBadges = earnedBadges.filter(b => badgeFilter === 'ALL' || b.rarity === badgeFilter);
  const filteredMissions = completedMissions.filter(m => missionLogFilter === 'ALL' || m.rarity === missionLogFilter);

  const currentBadges = filteredBadges.slice((badgePage - 1) * BADGES_PER_PAGE, badgePage * BADGES_PER_PAGE);
  const totalBadgePages = Math.ceil(filteredBadges.length / BADGES_PER_PAGE);

  const currentCompletedMissions = filteredMissions.slice((completedMissionPage - 1) * COMPLETED_MISSIONS_PER_PAGE, completedMissionPage * COMPLETED_MISSIONS_PER_PAGE);
  const totalCompletedMissionPages = Math.ceil(filteredMissions.length / COMPLETED_MISSIONS_PER_PAGE);

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

  const getRarityGlow = (rarity: Rarity) => {
      switch(rarity) {
          case 'LEGENDARY': return 'shadow-[0_0_15px_rgba(250,204,21,0.5)] border-yellow-500/50 bg-yellow-500/10 text-yellow-400';
          case 'EPIC': return 'shadow-[0_0_10px_rgba(168,85,247,0.5)] border-purple-500/50 bg-purple-500/10 text-purple-400';
          case 'RARE': return 'shadow-[0_0_8px_rgba(6,182,212,0.4)] border-cyan-500/50 bg-cyan-500/10 text-cyan-400';
          default: return 'border-gray-600 bg-gray-800 text-gray-400';
      }
  };

  const getRarityText = (rarity: Rarity) => {
      switch(rarity) {
          case 'LEGENDARY': return 'text-yellow-400';
          case 'EPIC': return 'text-purple-400';
          case 'RARE': return 'text-cyan-400';
          default: return 'text-gray-400';
      }
  };

  const FilterButton = ({ label, isActive, onClick, variant }: { label: string, isActive: boolean, onClick: () => void, variant: 'ALL' | Rarity }) => {
      let className = "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all duration-300 whitespace-nowrap border ";
      
      if (variant === 'ALL') {
          className += isActive 
            ? 'bg-white text-black border-white shadow-[0_0_10px_rgba(255,255,255,0.3)]' 
            : 'bg-gray-900 text-gray-400 border-gray-700 hover:text-white hover:border-gray-500';
      } else if (variant === 'COMMON') {
          className += isActive 
            ? 'bg-gray-500 text-white border-gray-500 shadow-[0_0_10px_rgba(107,114,128,0.4)]' 
            : 'bg-gray-900 text-gray-500 border-gray-700 hover:text-gray-300 hover:border-gray-500';
      } else if (variant === 'RARE') {
          className += isActive 
            ? 'bg-cyan-500 text-black border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]' 
            : 'bg-gray-900 text-cyan-500 border-gray-700 hover:bg-cyan-900/20 hover:border-cyan-500/50';
      } else if (variant === 'EPIC') {
          className += isActive 
            ? 'bg-purple-500 text-white border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]' 
            : 'bg-gray-900 text-purple-500 border-gray-700 hover:bg-purple-900/20 hover:border-purple-500/50';
      } else if (variant === 'LEGENDARY') {
          className += isActive 
            ? 'bg-yellow-500 text-black border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.5)]' 
            : 'bg-gray-900 text-yellow-500 border-gray-700 hover:bg-yellow-900/20 hover:border-yellow-500/50';
      }

      return (
        <button onClick={onClick} className={className}>
            {label}
        </button>
      );
  };

  return (
      <div className="space-y-8">
          <div>
              <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                  <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('profile.badges_collected')} ({earnedBadges.length})</h4>
                      <span className="text-[9px] text-gray-500 italic hidden md:inline">{t('profile.tap_equip')}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 justify-center md:justify-end">
                      <FilterButton label={t('miss.filter.all')} isActive={badgeFilter === 'ALL'} onClick={() => { setBadgeFilter('ALL'); setBadgePage(1); }} variant="ALL" />
                      <FilterButton label={t('miss.filter.common')} isActive={badgeFilter === 'COMMON'} onClick={() => { setBadgeFilter('COMMON'); setBadgePage(1); }} variant="COMMON" />
                      <FilterButton label={t('miss.filter.rare')} isActive={badgeFilter === 'RARE'} onClick={() => { setBadgeFilter('RARE'); setBadgePage(1); }} variant="RARE" />
                      <FilterButton label={t('miss.filter.epic')} isActive={badgeFilter === 'EPIC'} onClick={() => { setBadgeFilter('EPIC'); setBadgePage(1); }} variant="EPIC" />
                      <FilterButton label={t('miss.filter.legendary')} isActive={badgeFilter === 'LEGENDARY'} onClick={() => { setBadgeFilter('LEGENDARY'); setBadgePage(1); }} variant="LEGENDARY" />
                  </div>
              </div>
              
              {filteredBadges.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-gray-700 rounded-xl">
                      <p className="text-gray-500 text-xs">
                          {badgeFilter === 'ALL' ? t('profile.start_earning') : t('miss.no_found')}
                      </p>
                  </div>
              ) : (
                  <>
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
                        {currentBadges.map(badge => {
                            const isEquipped = user.favoriteBadgeId === badge.id;
                            const glowStyles = getRarityGlow(badge.rarity);
                            
                            return (
                              <div key={badge.id} className="relative group flex flex-col items-center">
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 glass-panel-heavy rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-[100] transform scale-90 group-hover:scale-100">
                                      <div className="flex items-center gap-2 mb-1.5">
                                          <div className={`p-1.5 rounded-lg ${glowStyles.split(' ')[2]} ${glowStyles.split(' ')[3]}`}>
                                              {renderBadgeIcon(badge.icon, "w-4 h-4")}
                                          </div>
                                          <div className="min-w-0">
                                              <p className="text-xs font-bold text-white truncate">{badge.name}</p>
                                              <p className={`text-[8px] font-black uppercase tracking-widest ${getRarityText(badge.rarity)}`}>{badge.rarity}</p>
                                          </div>
                                      </div>
                                      <p className="text-[10px] text-gray-400 leading-tight mb-2 italic">"{badge.description}"</p>
                                      {(badge.rewardRun || badge.rewardGov) && (
                                          <div className="flex gap-2 pt-2 border-t border-white/10">
                                              {badge.rewardRun > 0 && <span className="text-[9px] font-mono font-bold text-emerald-400">+{badge.rewardRun} RUN</span>}
                                              {badge.rewardGov > 0 && <span className="text-[9px] font-mono font-bold text-cyan-400">+{badge.rewardGov} GOV</span>}
                                          </div>
                                      )}
                                      <div className="absolute left-1/2 -bottom-1 w-2 h-2 bg-gray-900 border-r border-b border-gray-700 transform -translate-x-1/2 rotate-45"></div>
                                  </div>

                                  <button 
                                    onClick={() => onEquipBadge(badge.id)}
                                    className={`flex flex-col items-center gap-1 w-full p-1 transition-all rounded-xl ${isEquipped ? 'bg-gray-900/50 ring-1 ring-emerald-500/50' : 'hover:bg-gray-700/30'}`} 
                                  >
                                      <div className={`p-3 rounded-full border bg-opacity-10 backdrop-blur-sm transition-transform group-hover:scale-110 ${glowStyles}`}>
                                          {renderBadgeIcon(badge.icon, "w-6 h-6 md:w-8 md:h-8")}
                                      </div>
                                      <span className={`text-[9px] font-bold text-center leading-none truncate w-full group-hover:text-white ${isEquipped ? 'text-emerald-400' : 'text-gray-500'}`}>
                                          {badge.name}
                                      </span>
                                      {isEquipped && (
                                          <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-gray-800 shadow shadow-emerald-500/50"></div>
                                      )}
                                  </button>
                              </div>
                            )
                        })}
                    </div>
                    <Pagination currentPage={badgePage} totalPages={totalBadgePages} onPageChange={setBadgePage} />
                  </>
              )}
          </div>

          <div className="pt-8 border-t border-gray-700/50">
              <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('profile.missions_log')}</h4>
                  
                  <div className="flex flex-wrap gap-2 justify-center md:justify-end">
                      <FilterButton label={t('miss.filter.all')} isActive={missionLogFilter === 'ALL'} onClick={() => { setMissionLogFilter('ALL'); setCompletedMissionPage(1); }} variant="ALL" />
                      <FilterButton label={t('miss.filter.common')} isActive={missionLogFilter === 'COMMON'} onClick={() => { setMissionLogFilter('COMMON'); setCompletedMissionPage(1); }} variant="COMMON" />
                      <FilterButton label={t('miss.filter.rare')} isActive={missionLogFilter === 'RARE'} onClick={() => { setMissionLogFilter('RARE'); setCompletedMissionPage(1); }} variant="RARE" />
                      <FilterButton label={t('miss.filter.epic')} isActive={missionLogFilter === 'EPIC'} onClick={() => { setMissionLogFilter('EPIC'); setCompletedMissionPage(1); }} variant="EPIC" />
                      <FilterButton label={t('miss.filter.legendary')} isActive={missionLogFilter === 'LEGENDARY'} onClick={() => { setMissionLogFilter('LEGENDARY'); setCompletedMissionPage(1); }} variant="LEGENDARY" />
                  </div>
              </div>
              
              <div className="space-y-2">
                  {currentCompletedMissions.map(m => (
                      <div key={m.id} className="relative group">
                          <div className="absolute bottom-full left-4 mb-2 w-64 p-4 glass-panel-heavy rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-[100] transform scale-95 group-hover:scale-100 origin-bottom-left">
                              <div className="flex items-center gap-2 mb-2">
                                  <div className={`p-1.5 rounded bg-white/5 ${getRarityText(m.rarity)}`}>
                                      <Award size={16} />
                                  </div>
                                  <span className="text-xs font-black uppercase tracking-widest text-white">{m.title}</span>
                              </div>
                              <p className="text-[11px] text-gray-400 leading-relaxed mb-3">{m.description}</p>
                              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/10">
                                  <div>
                                      <p className="text-[9px] text-gray-500 uppercase font-bold mb-1">Rewards Claimed</p>
                                      <div className="space-y-0.5">
                                          <p className="text-xs font-mono font-bold text-emerald-400">+{m.rewardRun} RUN</p>
                                          {m.rewardGov > 0 && <p className="text-xs font-mono font-bold text-cyan-400">+{m.rewardGov} GOV</p>}
                                      </div>
                                  </div>
                                  <div>
                                      <p className="text-[9px] text-gray-500 uppercase font-bold mb-1">Rarity Class</p>
                                      <p className={`text-xs font-bold ${getRarityText(m.rarity)}`}>{m.rarity}</p>
                                  </div>
                              </div>
                              <div className="absolute left-6 -bottom-1 w-2 h-2 bg-gray-900 border-r border-b border-gray-700 rotate-45"></div>
                          </div>

                          <div className="relative bg-gray-900 p-3 rounded-lg border border-gray-700 flex justify-between items-center hover:border-gray-600 transition-colors group-hover:bg-gray-800/80">
                              <div className="flex items-center gap-3">
                                  <CheckCircle size={16} className={getRarityText(m.rarity)} />
                                  <div className="flex flex-col">
                                      <span className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors">{m.title}</span>
                                      <span className={`text-[10px] font-bold uppercase tracking-tighter opacity-50 ${getRarityText(m.rarity)}`}>{m.rarity}</span>
                                  </div>
                              </div>
                              <div className="flex items-center gap-4">
                                  <div className="text-right">
                                      <span className="text-xs font-mono font-bold text-emerald-400 block">+{m.rewardRun} RUN</span>
                                      {m.rewardGov && m.rewardGov > 0 && <span className="text-[10px] font-mono text-cyan-400 block">+{m.rewardGov} GOV</span>}
                                  </div>
                                  <Info size={14} className="text-gray-600 group-hover:text-emerald-400 transition-colors" />
                              </div>
                          </div>
                      </div>
                  ))}
                  {filteredMissions.length === 0 && (
                      <p className="text-gray-500 text-xs italic text-center py-4">{missionLogFilter === 'ALL' ? t('profile.no_missions') : t('miss.no_found')}</p>
                  )}
              </div>
              <Pagination currentPage={completedMissionPage} totalPages={totalCompletedMissionPages} onPageChange={setCompletedMissionPage} />
          </div>
      </div>
  );
};

export default ProfileAchievementsTab;