
import React, { useState } from 'react';
import { Badge, Mission, Rarity, User } from '../../types';
import { Award, Lock, CheckCircle, Search, Flag, Crown, Zap, Mountain, Globe, Home, Landmark, Swords, Footprints, Rocket, Tent, Timer, Building2, Moon, Sun, ShieldCheck, Gem, Users } from 'lucide-react';
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
      // (Simplified logic to save space, assuming same styles as Profile.tsx)
      const activeBase = "border bg-opacity-100";
      const inactiveBase = "bg-gray-900 border-opacity-50 hover:bg-opacity-20";
      return (
        <button 
            onClick={onClick}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-colors whitespace-nowrap border ${isActive ? 'bg-white text-black border-white' : 'bg-gray-900 text-gray-400 border-gray-700'}`}
        >
            {label}
        </button>
      );
  };

  return (
      <div className="space-y-8">
          {/* BADGES SECTION */}
          <div>
              <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                  <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('profile.badges_collected')} ({earnedBadges.length})</h4>
                      <span className="text-[9px] text-gray-500 italic hidden md:inline">{t('profile.tap_equip')}</span>
                  </div>
                  
                  {/* Badges Filter */}
                  {/* Changed from overflow-x-auto to flex-wrap */}
                  <div className="flex flex-wrap gap-2">
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
                            return (
                              <button 
                                key={badge.id} 
                                onClick={() => onEquipBadge(badge.id)}
                                className={`flex flex-col items-center gap-1 group relative p-1 transition-all rounded-xl ${isEquipped ? 'bg-gray-900/50 ring-1 ring-emerald-500/50' : 'hover:bg-gray-700/30'}`} 
                              >
                                  <div className={`p-3 rounded-full border bg-opacity-10 backdrop-blur-sm transition-transform group-hover:scale-110 ${getRarityGlow(badge.rarity)}`}>
                                      {renderBadgeIcon(badge.icon, "w-6 h-6 md:w-8 md:h-8")}
                                  </div>
                                  <span className={`text-[9px] font-bold text-center leading-none truncate w-full group-hover:text-white ${isEquipped ? 'text-emerald-400' : 'text-gray-500'}`}>
                                      {badge.name}
                                  </span>
                                  {isEquipped && (
                                      <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-gray-800 shadow shadow-emerald-500/50"></div>
                                  )}
                              </button>
                            )
                        })}
                    </div>
                    <Pagination currentPage={badgePage} totalPages={totalBadgePages} onPageChange={setBadgePage} />
                  </>
              )}
          </div>

          {/* MISSIONS LOG SECTION */}
          <div className="pt-8 border-t border-gray-700/50">
              <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('profile.missions_log')}</h4>
                  
                  {/* Missions Filter */}
                  {/* Changed from overflow-x-auto to flex-wrap */}
                  <div className="flex flex-wrap gap-2">
                      <FilterButton label={t('miss.filter.all')} isActive={missionLogFilter === 'ALL'} onClick={() => { setMissionLogFilter('ALL'); setCompletedMissionPage(1); }} variant="ALL" />
                      <FilterButton label={t('miss.filter.common')} isActive={missionLogFilter === 'COMMON'} onClick={() => { setMissionLogFilter('COMMON'); setCompletedMissionPage(1); }} variant="COMMON" />
                      <FilterButton label={t('miss.filter.rare')} isActive={missionLogFilter === 'RARE'} onClick={() => { setMissionLogFilter('RARE'); setCompletedMissionPage(1); }} variant="RARE" />
                      <FilterButton label={t('miss.filter.epic')} isActive={missionLogFilter === 'EPIC'} onClick={() => { setMissionLogFilter('EPIC'); setCompletedMissionPage(1); }} variant="EPIC" />
                      <FilterButton label={t('miss.filter.legendary')} isActive={missionLogFilter === 'LEGENDARY'} onClick={() => { setMissionLogFilter('LEGENDARY'); setCompletedMissionPage(1); }} variant="LEGENDARY" />
                  </div>
              </div>
              
              <div className="space-y-2">
                  {currentCompletedMissions.map(m => (
                      <div key={m.id} className="relative group bg-gray-900 p-3 rounded-lg border border-gray-700 flex justify-between items-center hover:border-gray-600 transition-colors">
                          <div className="flex items-center gap-3">
                              <CheckCircle size={16} className={getRarityText(m.rarity)} />
                              <span className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors">{m.title}</span>
                          </div>
                          <div className="text-right">
                              <span className="text-xs font-mono text-emerald-400 block">+{m.rewardRun} RUN</span>
                              {m.rewardGov && m.rewardGov > 0 && <span className="text-[10px] font-mono text-cyan-400 block">+{m.rewardGov} GOV</span>}
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