
import React, { useState } from 'react';
import { User, Zone, Badge, LevelConfig } from '../../types';
import { X, Activity, Crown, Maximize2, ZoomIn } from 'lucide-react';
import { renderBadgeIcon, renderLevelIcon } from './LeaderboardIcons';

interface PlayerProfileModalProps {
    userId: string;
    allUsers: Record<string, Omit<User, 'inventory'>>;
    currentUser: User;
    zones: Zone[];
    badges: Badge[];
    onClose: () => void;
    t: (key: string) => string;
    levels: LevelConfig[] | undefined;
}

const PlayerProfileModal: React.FC<PlayerProfileModalProps> = ({ 
    userId, 
    allUsers, 
    currentUser, 
    zones, 
    badges, 
    onClose,
    t,
    levels
}) => {
    const [isImageExpanded, setIsImageExpanded] = useState(false);
    
    let user: Omit<User, 'inventory'> | User;
    if (userId === currentUser.id) {
        user = currentUser;
    } else {
        user = allUsers[userId];
    }

    if (!user) return null;

    // Calculate derived stats for the profile view
    const ownedZones = zones.filter(z => z.ownerId === userId).length;
    const favoriteBadge = user.favoriteBadgeId ? badges.find(b => b.id === user.favoriteBadgeId) : null;
    
    // Dynamic Level Calculation
    let currentLevel = 1;
    let nextLevelKm = 50; 
    let progressToNextLevel = 0;
    let currentLevelConfig: LevelConfig | undefined;

    if (levels && levels.length > 0) {
        currentLevelConfig = levels.slice().reverse().find(l => user.totalKm >= l.minKm) || levels[0];
        currentLevel = currentLevelConfig.level;
        
        const nextLevelConfig = levels.find(l => l.level === currentLevel + 1);
        
        if (nextLevelConfig) {
            nextLevelKm = nextLevelConfig.minKm;
            const currentLevelMin = currentLevelConfig.minKm;
            const range = nextLevelConfig.minKm - currentLevelMin;
            const progress = user.totalKm - currentLevelMin;
            progressToNextLevel = Math.min(100, Math.max(0, (progress / range) * 100));
        } else {
            nextLevelKm = user.totalKm;
            progressToNextLevel = 100;
        }
    } else {
        // Fallback hardcoded logic
        currentLevel = Math.floor(user.totalKm / 50) + 1;
        nextLevelKm = currentLevel * 50;
        progressToNextLevel = ((user.totalKm - ((currentLevel - 1) * 50)) / 50) * 100;
    }

    const getRarityColor = (rarity: string) => {
        switch(rarity) {
            case 'LEGENDARY': return 'text-yellow-400 border-yellow-500/50 bg-yellow-900/20';
            case 'EPIC': return 'text-purple-400 border-purple-500/50 bg-purple-900/20';
            case 'RARE': return 'text-cyan-400 border-cyan-500/50 bg-cyan-900/20';
            default: return 'text-gray-300 border-gray-600 bg-gray-800';
        }
    };

    return (
        <>
            {/* FULLSCREEN IMAGE OVERLAY */}
            {isImageExpanded && (
                <div 
                    className="fixed inset-0 z-[250] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-fade-in p-4"
                    onClick={() => setIsImageExpanded(false)}
                >
                    <button className="absolute top-6 right-6 text-white bg-white/10 p-3 rounded-full hover:bg-white/20 transition-colors">
                        <X size={32} />
                    </button>
                    <img 
                        src={user.avatar} 
                        alt={user.name} 
                        className="max-w-full max-h-[85vh] rounded-3xl shadow-2xl border-2 border-white/10 animate-zoom-in"
                        onClick={(e) => e.stopPropagation()}
                    />
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white font-bold bg-black/40 px-6 py-2 rounded-full border border-white/10">
                        {user.name}
                    </div>
                </div>
            )}

            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
                <div className="glass-panel-heavy rounded-2xl w-full max-w-sm shadow-2xl relative overflow-hidden animate-slide-up">
                    
                    {/* Header Banner - Semi-transparent */}
                    <div className="h-24 bg-gradient-to-r from-gray-800/80 to-gray-900/80 relative border-b border-white/5">
                        <button onClick={onClose} className="absolute top-4 right-4 text-white hover:text-red-400 z-10 bg-black/40 rounded-full p-1 transition-colors"><X size={20}/></button>
                    </div>

                    <div className="px-6 pb-6 relative z-10 -mt-12 text-center">
                        {/* Avatar */}
                        <div className="relative inline-block mb-3 group/avatar">
                            <div 
                                className="relative cursor-zoom-in transition-transform active:scale-95"
                                onClick={() => setIsImageExpanded(true)}
                            >
                                <img src={user.avatar} alt={user.name} className="w-24 h-24 rounded-2xl border-4 border-gray-900 bg-gray-800 object-cover shadow-xl group-hover/avatar:border-emerald-500/50 transition-colors" />
                                <div className="absolute inset-0 bg-emerald-500/0 group-hover/avatar:bg-emerald-500/10 flex items-center justify-center rounded-2xl transition-all">
                                    <ZoomIn className="text-white opacity-0 group-hover/avatar:opacity-100 transition-opacity" size={24} />
                                </div>
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-1 rounded-md border border-gray-900 shadow-lg flex items-center gap-1 pointer-events-none">
                                {currentLevelConfig?.icon && renderLevelIcon(currentLevelConfig.icon, "w-3 h-3 text-white")}
                                LVL {currentLevel}
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-white mb-1 flex items-center justify-center gap-2">
                            {user.name}
                            {userId === currentUser.id && <span className="text-xs bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30 font-mono">YOU</span>}
                        </h2>
                        
                        {/* Level Title */}
                        {currentLevelConfig?.title && (
                            <div className="flex items-center justify-center gap-1 mb-2">
                                <span className="text-xs font-bold text-gray-300 uppercase tracking-widest bg-black/30 px-2 py-0.5 rounded border border-white/5">
                                    {currentLevelConfig.title}
                                </span>
                            </div>
                        )}

                        {/* Stats Grid 2x2 */}
                        <div className="grid grid-cols-2 gap-3 mb-6 mt-4">
                            <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                                <div className="text-[10px] text-gray-400 uppercase font-bold mb-1">{t('leader.profile.total_km')}</div>
                                <div className="text-xl font-mono font-bold text-white">{user.totalKm.toLocaleString()} KM</div>
                            </div>
                            <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                                <div className="text-[10px] text-gray-400 uppercase font-bold mb-1">{t('leader.profile.owned_zones')}</div>
                                <div className="text-xl font-mono font-bold text-emerald-400">{ownedZones}</div>
                            </div>
                            
                            {/* New Balances */}
                            <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                                <div className="text-[10px] text-gray-400 uppercase font-bold mb-1 flex items-center justify-center gap-1"><Activity size={10} /> RUN</div>
                                <div className="text-xl font-mono font-bold text-emerald-400">{(user as any).runBalance?.toFixed(0) ?? 0}</div>
                            </div>
                            <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                                <div className="text-[10px] text-gray-400 uppercase font-bold mb-1 flex items-center justify-center gap-1"><Crown size={10} /> GOV</div>
                                <div className="text-xl font-mono font-bold text-cyan-400">{(user as any).govBalance?.toFixed(0) ?? 0}</div>
                            </div>
                        </div>

                        {/* Favorite Badge */}
                        {favoriteBadge ? (
                            <div className="bg-black/30 p-4 rounded-xl border border-white/5 flex items-center gap-4 text-left">
                                <div className={`p-3 rounded-full border bg-gray-900 ${getRarityColor(favoriteBadge.rarity)}`}>
                                    {renderBadgeIcon(favoriteBadge.icon, "w-6 h-6")}
                                </div>
                                <div>
                                    <div className="text-[10px] text-gray-500 uppercase font-bold">{t('leader.profile.fav_badge')}</div>
                                    <div className="font-bold text-white text-sm">{favoriteBadge.name}</div>
                                    <div className="text-[10px] text-gray-400">{favoriteBadge.rarity}</div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 rounded-xl border border-white/10 border-dashed text-gray-500 text-xs italic">
                                No badge equipped
                            </div>
                        )}

                        {/* Level Progress */}
                        <div className="mt-6">
                            <div className="flex justify-between text-[10px] uppercase font-bold text-gray-500 mb-1">
                                <span>{t('leader.profile.level')} {currentLevel}</span>
                                <span>{Math.floor(progressToNextLevel)}%</span>
                            </div>
                            <div className="w-full bg-black/50 rounded-full h-1.5 overflow-hidden">
                                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${progressToNextLevel}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PlayerProfileModal;