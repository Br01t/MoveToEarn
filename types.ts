
export type ViewState = 'LANDING' | 'DASHBOARD' | 'MARKETPLACE' | 'INVENTORY' | 'LEADERBOARD' | 'WALLET' | 'PROFILE' | 'MISSIONS' | 'RULES' | 'HOW_TO_PLAY' | 'PRIVACY' | 'TERMS' | 'COMMUNITY' | 'ADMIN' | 'REPORT_BUG' | 'SUGGESTION';

export type Rarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';

// New types for the 100 items
export type AchievementCategory = 'Distance' | 'Speed' | 'Technical' | 'TimeOfDay' | 'Zone' | 'Streak' | 'Exploration' | 'Social' | 'Meta' | 'Special' | 'Event' | 'Training' | 'Performance' | 'Endurance' | 'Economy' | 'Onboarding';
export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Expert' | 'Special';

export interface Mission {
  id: string;
  title: string;
  description: string;
  rewardRun: number; 
  rewardGov?: number; // Added optional GOV reward
  rarity: Rarity;
  
  // Legacy System (Preserved but optional)
  conditionType?: 'TOTAL_KM' | 'OWN_ZONES';
  conditionValue?: number;

  // New System (For the 100 new missions)
  logicId?: number; // 1-100 from PDF
  category?: AchievementCategory;
  difficulty?: Difficulty;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name
  rarity: Rarity;
  rewardRun?: number;
  rewardGov?: number; // Added optional GOV reward

  // Legacy System (Preserved but optional)
  conditionType?: 'TOTAL_KM' | 'OWN_ZONES';
  conditionValue?: number;

  // New System
  logicId?: number;
  category?: AchievementCategory;
  difficulty?: Difficulty;
}

export interface RunEntry {
  id: string;
  location: string;
  km: number;
  timestamp: number;
  govEarned?: number;
  runEarned: number;

  // New Metrics for 100 Missions logic
  duration?: number; // minutes
  elevation?: number; // meters
  maxSpeed?: number; // km/h
  avgSpeed?: number; // km/h
}

export interface User {
  id: string;
  name: string;
  email?: string;
  avatar: string;
  runBalance: number;
  govBalance: number;
  totalKm: number;
  isPremium: boolean;
  inventory: InventoryItem[];
  runHistory: RunEntry[];
  completedMissionIds: string[];
  earnedBadgeIds: string[];
  favoriteBadgeId?: string;
}

export interface Zone {
  id: string;
  x: number;
  y: number;
  lat: number; // Geographical Latitude
  lng: number; // Geographical Longitude
  ownerId: string | null;
  name: string;
  defenseLevel: number;
  recordKm: number;
  interestRate: number;
  boostExpiresAt?: number;
  shieldExpiresAt?: number;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  priceRun: number;
  quantity: number;
  type: 'DEFENSE' | 'BOOST' | 'CURRENCY';
  effectValue: number;
  icon: string;
}

export interface InventoryItem extends Item {
  quantity: number;
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  totalKm: number;
  zonesOwned: number;
}

export interface BugReport {
  id: string;
  userId: string;
  userName: string;
  description: string;
  screenshot?: string; // Base64 string
  timestamp: number;
  status: 'OPEN' | 'RESOLVED';
}

export interface Suggestion {
  id: string;
  userId: string;
  userName: string;
  title: string;
  description: string;
  timestamp: number;
}

export type LeaderboardMetric = 'TOTAL_KM' | 'OWNED_ZONES' | 'RUN_BALANCE' | 'GOV_BALANCE' | 'UNIQUE_ZONES';

export interface LeaderboardConfig {
  id: string;
  title: string;
  description: string;
  metric: LeaderboardMetric;
  type: 'PERMANENT' | 'TEMPORARY';
  startTime?: number;
  endTime?: number;
  rewardPool?: number;
  rewardCurrency?: 'RUN' | 'GOV';
  lastResetTimestamp?: number;
}

export interface LevelConfig {
  id: string;
  level: number;
  minKm: number;
  title?: string;
}

export interface GameState {
  currentUser: User | null;
  zones: Zone[];
  // UPDATED: Allow runBalance and govBalance for other users
  users: Record<string, Omit<User, 'inventory'>>;
  items: Item[];
  missions: Mission[];
  badges: Badge[];
  marketTaxRate: number;
  bugReports: BugReport[];
  levels: LevelConfig[];
}

// Data passed from Dashboard to App during Sync
export interface RunAnalysisData {
  fileName: string;
  totalKm: number;
  startTime: number; // Exact GPS start timestamp
  durationMinutes: number;
  avgSpeed: number;
  maxSpeed: number;
  elevation: number;
  startPoint: { lat: number; lng: number };
  endPoint: { lat: number; lng: number };
  points: { lat: number; lng: number, ele: number, time: Date }[];
  isValid: boolean;
  failureReason?: string;
}