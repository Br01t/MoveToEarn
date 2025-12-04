
export type ViewState = 'LANDING' | 'DASHBOARD' | 'MARKETPLACE' | 'INVENTORY' | 'LEADERBOARD' | 'WALLET' | 'PROFILE' | 'MISSIONS' | 'RULES' | 'HOW_TO_PLAY' | 'PRIVACY' | 'TERMS' | 'COMMUNITY' | 'ADMIN';

export type Rarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';

export interface Mission {
  id: string;
  title: string;
  description: string;
  rewardGov: number;
  conditionType: 'TOTAL_KM' | 'OWN_ZONES';
  conditionValue: number;
  rarity: Rarity;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name
  conditionType: 'TOTAL_KM' | 'OWN_ZONES';
  conditionValue: number;
  rarity: Rarity;
}

export interface RunEntry {
  id: string;
  location: string;
  km: number;
  timestamp: number;
  govEarned?: number;
  runEarned: number;
}

export interface User {
  id: string;
  name: string;
  email?: string;
  avatar: string;
  runBalance: number;
  govBalance: number;
  totalKm: number;
  isPremium: boolean; // Subscription status
  inventory: InventoryItem[];
  runHistory: RunEntry[];
  completedMissionIds: string[];
  earnedBadgeIds: string[];
  favoriteBadgeId?: string; // The badge displayed next to name
}

export interface Zone {
  id: string;
  x: number;
  y: number;
  ownerId: string | null;
  name: string;
  defenseLevel: number;
  recordKm: number; // Max KM run in this zone by owner
  interestRate: number; // Percentage yield per run, e.g. 1.5%
  boostExpiresAt?: number; // Timestamp when the yield boost expires
  shieldExpiresAt?: number; // Timestamp when the defense shield expires
}

export interface Item {
  id: string;
  name: string;
  description: string;
  priceRun: number; // Changed from priceGov to priceRun
  quantity: number; // Market Stock
  type: 'DEFENSE' | 'BOOST' | 'CURRENCY'; // Added CURRENCY for GOV packs
  effectValue: number;
  icon: string;
}

export interface InventoryItem extends Item {
  quantity: number; // Amount owned (overrides Item.quantity)
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  totalKm: number;
  zonesOwned: number;
}

export interface GameState {
  currentUser: User | null;
  zones: Zone[];
  users: Record<string, Omit<User, 'inventory' | 'runBalance' | 'govBalance'>>; // Public user info
  items: Item[];
  missions: Mission[];
  badges: Badge[];
  marketTaxRate: number; // Dynamic burning rate
}