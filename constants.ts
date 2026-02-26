
import { Item, User, Zone, Mission, Badge, AchievementCategory, Difficulty, Rarity, LeaderboardConfig, LevelConfig } from './types';

// --- ASSETS ---
export const OFFICIAL_LOGO_URL = 'https://fjvmeffshcivnoctaikj.supabase.co/storage/v1/object/public/images/logo.png';
export const NAVBAR_LOGO_URL = 'https://fjvmeffshcivnoctaikj.supabase.co/storage/v1/object/public/images/logo_nobg%20(1).png';

// --- ECONOMY COSTS & REWARDS ---
export const MINT_COST = 150; 
export const MINT_REWARD_GOV = 15; 

export const CONQUEST_COST = 350;
export const CONQUEST_REWARD_GOV = 25; 

export const PREMIUM_COST = 50; // Cost in GOV

export const ITEM_DURATION_SEC = 86400; // 24 Hours in seconds

export const DEFAULT_ZONE_INTEREST_RATE = 2.0; // Default Yield % for new zones

// --- ECONOMY RATES ---
export const RUN_RATE_BASE = 12; // RUN per KM
export const RUN_RATE_BOOST = 24; // RUN per KM (Boost Active)
export const REWARD_SPLIT_USER = 0.98; // 98% to User
export const REWARD_SPLIT_POOL = 0.02; // 2% to Zone Pool

// Initial empty defaults if DB is empty
export const DEFAULT_LEADERBOARDS: LeaderboardConfig[] = [];
export const DEFAULT_LEVELS: LevelConfig[] = [];

export const MOCK_ITEMS: Item[] = [
  { 
    id: 'shield_std', 
    name: 'Zone Shield', 
    description: 'Prevents conquest attempts for 24 hours.', 
    priceRun: 500, 
    quantity: 100, 
    type: 'DEFENSE', 
    effectValue: 1, 
    icon: 'Shield' 
  },
  { 
    id: 'boost_std', 
    name: 'Energy Drink', 
    description: 'Doubles zone yield for 24 hours.', 
    priceRun: 300, 
    quantity: 100, 
    type: 'BOOST', 
    effectValue: 1, 
    icon: 'Zap' 
  },
  { 
    id: 'gov_crate_small', 
    name: 'Small GOV Stash', 
    description: 'Contains 10 GOV tokens. (Rate: 3000 RUN/GOV)', 
    priceRun: 30000, 
    quantity: 50, 
    type: 'CURRENCY', 
    effectValue: 10, 
    icon: 'Coins' 
  }
];

// Empty - Real users will be fetched from DB
export const MOCK_USERS: Record<string, any> = {};