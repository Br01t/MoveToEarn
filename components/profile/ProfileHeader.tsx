
import React, { useState, useRef } from 'react';
import { User, Badge, LevelConfig } from '../../types';
import { Crown, Save, Mail, Camera, CheckCircle, X, Flag, Award, Zap, Mountain, Globe, Home, Landmark, Swords, Footprints, Rocket, Tent, Timer, Building2, Moon, Sun, ShieldCheck, Gem, Users, FileText, Egg, Baby, Activity, MapPin, Smile, Wind, Compass, Navigation, TrendingUp, Move, Target, Watch, Droplets, Shield, Star, BatteryCharging, Flame, Truck, CloudLightning, Hexagon, FastForward, Trophy, Plane, Map, Layers, Briefcase, GraduationCap, Brain, Crosshair, Anchor, Heart, Lock, Disc, Feather, FlagTriangleRight, Globe2, Sparkles, Radio, BookOpen, Waves, Snowflake, CloudRain, ThermometerSnowflake, SunDim, MoonStar, Atom, Sword, Axe, Ghost, Ship, PlusSquare, Skull, ChevronsUp, Orbit, CloudFog, Circle, Infinity, Sparkle, ArrowUpCircle, Clock, Eye, Type, Delete, PenTool, Medal, UploadCloud, Loader2, Edit2, Info, ChevronRight, Image, FileImage } from 'lucide-react';
import { useLanguage } from '../../LanguageContext';
import { compressImage } from '../../utils/imageCompression';
import { useGameState } from '../../hooks/useGameState';
import { useGlobalUI } from '../../contexts/GlobalUIContext';

interface ProfileHeaderProps {
  user: User;
  favoriteBadge: Badge | undefined;
  nextLevelKm: number;
  currentLevel: number;
  levelTitle?: string;
  levelIcon?: string;
  levels?: LevelConfig[]; // Added levels to props
  progressToNextLevel: number;
  onUpdateUser: (updates: Partial<User>) => void;
  onUpgradePremium: () => void;
  onViewSubmissions: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ 
    user, favoriteBadge, nextLevelKm, currentLevel, levelTitle, levelIcon, levels = [], progressToNextLevel, onUpdateUser, onUpgradePremium, onViewSubmissions 
}) => {
  const { t } = useLanguage();
  const { uploadFile } = useGameState();
  const { showToast } = useGlobalUI();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email || '');
  const [avatar, setAvatar] = useState(user.avatar);
  const [isUploading, setIsUploading] = useState(false);
  const [showLevelModal, setShowLevelModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleAvatarClick = () => {
      if (isEditing && fileInputRef.current) {
          fileInputRef.current.click();
      }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setIsUploading(true);
          try {
              const originalFile = e.target.files[0];
              // Compress aggressively: max 250px width (plenty for avatar), 0.6 quality JPEG
              const compressedFile = await compressImage(originalFile, 250, 0.6);
              
              // Upload with fallback to Base64 if storage fails
              const publicUrl = await uploadFile(compressedFile, 'avatars');
              
              if (publicUrl) {
                  setAvatar(publicUrl);
              } else {
                  showToast("Failed to process image. Please try a different file.", 'ERROR');
              }
          } catch (error) {
              console.error("Error processing image:", error);
              showToast("Error processing image.", 'ERROR');
          } finally {
              setIsUploading(false);
          }
      }
  };

  // ... (renderBadgeIcon and renderLevelIcon helper functions remain same as before)
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

  const renderLevelIcon = (iconName: string, className: string) => {
      switch(iconName) {
          case 'Egg': return <Egg className={className} />;
          case 'Footprints': return <Footprints className={className} />;
          case 'Baby': return <Baby className={className} />;
          case 'Activity': return <Activity className={className} />;
          case 'MapPin': return <MapPin className={className} />;
          case 'Sun': return <Sun className={className} />;
          case 'Smile': return <Smile className={className} />;
          case 'Wind': return <Wind className={className} />;
          case 'Compass': return <Compass className={className} />;
          case 'Navigation': return <Navigation className={className} />;
          case 'TrendingUp': return <TrendingUp className={className} />;
          case 'Move': return <Move className={className} />;
          case 'Building': return <Building2 className={className} />;
          case 'Trees': return <Mountain className={className} />; 
          case 'Target': return <Target className={className} />;
          case 'Watch': return <Watch className={className} />;
          case 'Droplets': return <Droplets className={className} />;
          case 'Shield': return <Shield className={className} />;
          case 'Mountain': return <Mountain className={className} />;
          case 'Star': return <Star className={className} />;
          case 'Flag': return <Flag className={className} />;
          case 'BatteryCharging': return <BatteryCharging className={className} />;
          case 'Flame': return <Flame className={className} />;
          case 'Truck': return <Truck className={className} />;
          case 'Award': return <Award className={className} />;
          case 'ShieldCheck': return <ShieldCheck className={className} />;
          case 'Zap': return <Zap className={className} />;
          case 'Moon': return <Moon className={className} />;
          case 'Sunrise': return <Sun className={className} />;
          case 'Medal': return <Medal className={className} />;
          case 'Repeat': return <Timer className={className} />; 
          case 'CloudLightning': return <CloudLightning className={className} />;
          case 'Hexagon': return <Hexagon className={className} />;
          case 'FastForward': return <FastForward className={className} />;
          case 'Trophy': return <Trophy className={className} />;
          case 'Globe': return <Globe className={className} />;
          case 'Plane': return <Plane className={className} />;
          case 'Map': return <Map className={className} />;
          case 'Layers': return <Layers className={className} />;
          case 'Briefcase': return <Briefcase className={className} />;
          case 'GraduationCap': return <GraduationCap className={className} />;
          case 'Users': return <Users className={className} />;
          case 'Brain': return <Brain className={className} />;
          case 'Crosshair': return <Crosshair className={className} />;
          case 'Anchor': return <Anchor className={className} />;
          case 'Heart': return <Heart className={className} />;
          case 'Lock': return <Lock className={className} />;
          case 'Disc': return <Disc className={className} />;
          case 'Gem': return <Gem className={className} />;
          case 'Crown': return <Crown className={className} />;
          case 'Feather': return <Feather className={className} />;
          case 'FlagTriangleRight': return <FlagTriangleRight className={className} />;
          case 'Globe2': return <Globe2 className={className} />;
          case 'Camera': return <Camera className={className} />;
          case 'Sparkles': return <Sparkles className={className} />;
          case 'Radio': return <Radio className={className} />;
          case 'BookOpen': return <BookOpen className={className} />;
          case 'Waves': return <Waves className={className} />;
          case 'Snowflake': return <Snowflake className={className} />;
          case 'CloudRain': return <CloudRain className={className} />;
          case 'ThermometerSnowflake': return <ThermometerSnowflake className={className} />;
          case 'SunDim': return <SunDim className={className} />;
          case 'MoonStar': return <MoonStar className={className} />;
          case 'Atom': return <Atom className={className} />;
          case 'Sword': return <Sword className={className} />;
          case 'Axe': return <Axe className={className} />;
          case 'Ghost': return <Ghost className={className} />;
          case 'Ship': return <Ship className={className} />;
          case 'PlusSquare': return <PlusSquare className={className} />;
          case 'Skull': return <Skull className={className} />;
          case 'ChevronsUp': return <ChevronsUp className={className} />;
          case 'Rocket': return <Rocket className={className} />;
          case 'User': return <Users className={className} />;
          case 'Orbit': return <Globe className={className} />;
          case 'CloudFog': return <CloudFog className={className} />;
          case 'Circle': return <Circle className={className} />;
          case 'Infinity': return <Infinity className={className} />;
          case 'Sparkle': return <Sparkle className={className} />;
          case 'ArrowUpCircle': return <ArrowUpCircle className={className} />;
          case 'Clock': return <Clock className={className} />;
          case 'Eye': return <Eye className={className} />;
          case 'Type': return <Type className={className} />;
          case 'Delete': return <Delete className={className} />;
          case 'PenTool': return <PenTool className={className} />;
          default: return <Award className={className} />;
      }
  };

  // Helper to get next few levels
  const getNextLevels = () => {
      // Assuming 'levels' prop is sorted by level, or sort it first
      const sortedLevels = [...levels].sort((a, b) => a.level - b.level);
      // Find current level index
      const currentIndex = sortedLevels.findIndex(l => l.level === currentLevel);
      
      // Get the current one and the next 4
      const startIndex = Math.max(0, currentIndex);
      return sortedLevels.slice(startIndex, startIndex + 5);
  };

  const nextLevelsList = getNextLevels();

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
             {/* AVATAR SECTION */}
             <div className={`relative group ${isEditing ? 'cursor-pointer' : ''}`} onClick={handleAvatarClick}>
                 <img src={isEditing ? avatar : user.avatar} alt="Avatar" className={`w-32 h-32 rounded-2xl border-4 bg-gray-800 shadow-2xl object-cover ${user.isPremium ? 'border-yellow-500' : 'border-gray-700'}`} />
                 
                 <div className="absolute -bottom-3 -right-3 bg-gray-900 text-white text-xs font-bold px-3 py-1 rounded-lg border border-gray-600 shadow-lg z-20 flex items-center gap-1.5">
                    {levelIcon ? renderLevelIcon(levelIcon, "w-3 h-3 text-emerald-400") : null}
                    LVL {currentLevel}
                 </div>
                 
                 {/* Reverted style: Just the icon, no text, but keeping the accept='image/*' fix below */}
                 {isEditing && (
                     <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center rounded-2xl border-4 border-emerald-500 z-10 transition-opacity hover:bg-black/70 animate-pulse">
                         {isUploading ? (
                             <Loader2 className="text-emerald-400 animate-spin" />
                         ) : (
                             <Camera size={32} className="text-white" />
                         )}
                     </div>
                 )}
                 <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/*" 
                    hidden 
                    disabled={isUploading || !isEditing}
                 />
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
                            <button onClick={() => setIsEditing(true)} className="text-gray-500 hover:text-emerald-400 p-1 hover:bg-gray-700/50 rounded-lg transition-colors">
                                <Edit2 size={18}/>
                            </button>
                        </div>
                        <p className="text-gray-400 flex items-center gap-2 text-sm mt-1">
                            <Mail size={14} className="text-emerald-500" /> {user.email || t('profile.no_email')}
                        </p>
                        
                        <div className="mt-4 max-w-lg">
                            {/* Level Title Display - Positioned above Progress */}
                            {levelTitle && (
                                <div className="mb-2 cursor-pointer group w-fit" onClick={() => setShowLevelModal(true)}>
                                    <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-0.5 flex items-center gap-1 group-hover:text-emerald-400 transition-colors">
                                        Rank <Info size={10} className="opacity-70"/>
                                    </span>
                                    <h3 className="text-white font-bold text-lg flex items-center gap-2 group-hover:text-emerald-300 transition-colors">
                                        {levelIcon && renderLevelIcon(levelIcon, "w-5 h-5 text-emerald-400")}
                                        {levelTitle}
                                    </h3>
                                </div>
                            )}

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
                        
                        <div className="text-[10px] text-emerald-400 italic flex items-center gap-1">
                            <CheckCircle size={10} /> Tap on the avatar image to upload a new photo.
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
                <div className="flex flex-col gap-2 mt-4 md:mt-8 items-end min-w-[140px]">
                    {!user.isPremium && (
                        <button onClick={onUpgradePremium} className="w-full px-5 py-2.5 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded-xl text-sm shadow-lg flex items-center justify-center gap-2 transition-colors">
                            <Crown size={16} /> {t('profile.upgrade_pro')}
                        </button>
                    )}
                    <button 
                        onClick={onViewSubmissions}
                        className="w-full px-4 py-2 bg-gray-900 border border-gray-700 hover:border-gray-500 text-gray-400 hover:text-white rounded-xl text-xs font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        <FileText size={14} /> My Reports
                    </button>
                </div>
             )}
          </div>

          {/* LEVEL MODAL */}
          {showLevelModal && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setShowLevelModal(false)}>
                  <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-sm shadow-2xl relative overflow-hidden animate-slide-up" onClick={e => e.stopPropagation()}>
                      <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-800/50">
                          <h3 className="font-bold text-white flex items-center gap-2">
                              <Trophy size={18} className="text-yellow-400"/> Rank Progression
                          </h3>
                          <button onClick={() => setShowLevelModal(false)} className="text-gray-400 hover:text-white"><X size={20}/></button>
                      </div>
                      <div className="p-4 space-y-2">
                          {nextLevelsList.map((l, index) => {
                              const isCurrent = l.level === currentLevel;
                              return (
                                  <div key={l.id} className={`flex items-center p-3 rounded-xl border ${isCurrent ? 'bg-emerald-900/20 border-emerald-500/50' : 'bg-gray-800/50 border-gray-700 opacity-80'}`}>
                                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${isCurrent ? 'bg-emerald-900/40 border-emerald-500 text-emerald-400' : 'bg-gray-700 border-gray-600 text-gray-400'}`}>
                                          {l.icon ? renderLevelIcon(l.icon, "w-5 h-5") : <Image size={16}/>}
                                      </div>
                                      <div className="ml-3 flex-1">
                                          <div className="flex items-center gap-2">
                                              <span className={`text-[10px] font-mono font-bold px-1.5 rounded border ${isCurrent ? 'border-emerald-500 text-emerald-400 bg-emerald-900/30' : 'border-gray-600 text-gray-500 bg-gray-800'}`}>
                                                  #{l.level}
                                              </span>
                                              <span className={`text-sm font-bold ${isCurrent ? 'text-white' : 'text-gray-300'}`}>
                                                  {l.title || `Rank ${l.level}`}
                                              </span>
                                          </div>
                                          <div className="text-[10px] text-gray-500 font-mono mt-0.5">Minimum distance: {l.minKm} KM</div>
                                      </div>
                                      {isCurrent && (
                                          <div className="text-xs bg-emerald-500 text-black px-2 py-0.5 rounded font-bold uppercase">Current</div>
                                      )}
                                  </div>
                              );
                          })}
                          {nextLevelsList.length === 0 && <p className="text-center text-gray-500 text-xs py-4">Max level reached!</p>}
                      </div>
                  </div>
              </div>
          )}
      </div>
  );
};

export default ProfileHeader;