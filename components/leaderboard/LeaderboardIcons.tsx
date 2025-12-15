
import React from 'react';
import { 
    Flag, Crown, Award, Zap, Mountain, Globe, Home, Landmark, Swords, Footprints, Rocket, Tent, Timer, 
    Building2, Moon, Sun, ShieldCheck, Gem, Users, Egg, Baby, Activity, MapPin, Smile, Wind, Compass, 
    Navigation, TrendingUp, Move, Target, Watch, Droplets, Shield, Star, BatteryCharging, Flame, Truck, 
    CloudLightning, Hexagon, FastForward, Trophy, Plane, Map as MapIcon, Layers, Briefcase, GraduationCap, 
    Brain, Crosshair, Anchor, Heart, Lock, Disc, Feather, FlagTriangleRight, Globe2, Camera, Sparkles, 
    Radio, BookOpen, Waves, Snowflake, CloudRain, ThermometerSnowflake, SunDim, MoonStar, Atom, Sword, 
    Axe, Ghost, Ship, PlusSquare, Skull, ChevronsUp, CloudFog, Circle, Infinity, Sparkle, ArrowUpCircle, 
    Clock, Eye, Type, Delete, PenTool, Medal 
} from 'lucide-react';

export const renderBadgeIcon = (iconName: string, className: string) => {
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

export const renderLevelIcon = (iconName: string, className: string) => {
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
        case 'Map': return <MapIcon className={className} />;
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