export type ViewState = 'LANDING' | 'DASHBOARD' | 'MARKETPLACE' | 'INVENTORY' | 'LEADERBOARD' | 'WALLET' | 'PROFILE' | 'MISSIONS' | 'RULES' | 'WHITEPAPER' | 'HOW_TO_PLAY' | 'PRIVACY' | 'TERMS' | 'COMMUNITY' | 'ADMIN' | 'REPORT_BUG' | 'SUGGESTION';

export type Rarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';

export type AchievementCategory = 'Distance' | 'Speed' | 'Technical' | 'TimeOfDay' | 'Zone' | 'Streak' | 'Exploration' | 'Social' | 'Meta' | 'Special' | 'Event' | 'Training' | 'Performance' | 'Endurance' | 'Economy' | 'Onboarding';
export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Expert' | 'Special';

export interface Transaction {
  id: string;
  userId: string;
  type: 'IN' | 'OUT';
  token: 'RUN' | 'GOV' | 'ITEM';
  amount: number;
  description: string;
  timestamp: number;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  rewardRun: number; 
  rewardGov?: number;
  rarity: Rarity;
  conditionType?: 'TOTAL_KM' | 'OWN_ZONES';
  conditionValue?: number;
  logicId?: number;
  category?: AchievementCategory;
  difficulty?: Difficulty;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: Rarity;
  rewardRun?: number;
  rewardGov?: number;
  conditionType?: 'TOTAL_KM' | 'OWN_ZONES';
  conditionValue?: number;
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
  duration?: number;
  elevation?: number;
  maxSpeed?: number;
  avgSpeed?: number;
  involvedZones?: string[];
  zoneBreakdown?: Record<string, number>; 
}

export interface AchievementLog {
  id: string;
  claimedAt: number;
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
  isAdmin: boolean;
  inventory: InventoryItem[];
  runHistory: RunEntry[];
  missionLog: AchievementLog[];
  badgeLog: AchievementLog[];
  completedMissionIds: string[];
  earnedBadgeIds: string[];
  favoriteBadgeId?: string;
}

export interface Zone {
  id: string;
  x: number;
  y: number;
  lat: number; 
  lng: number; 
  location: string;
  ownerId: string | null;
  name: string;
  defenseLevel: number;
  recordKm: number;
  totalKm: number;
  interestRate: number;
  interestPool: number;
  lastDistributionTime?: number;
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
  screenshot?: string;
  timestamp: number;
  status: 'OPEN' | 'WIP' | 'FIXED' | 'RESOLVED';
}

export interface Suggestion {
  id: string;
  userId: string;
  userName: string;
  title: string;
  description: string;
  timestamp: number;
}

export type LeaderboardMetric = 'TOTAL_KM' | 'OWNED_ZONES' | 'RUN_BALANCE' | 'GOV_BALANCE' | 'UNIQUE_ZONES' | 'TOTAL_RUNS' | 'TOTAL_ACHIEVEMENTS';

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
  icon?: string;
}

export interface GameState {
  currentUser: User | null;
  zones: Zone[];
  users: Record<string, Omit<User, 'inventory'>>;
  items: Item[];
  missions: Mission[];
  badges: Badge[];
  marketTaxRate: number;
  bugReports: BugReport[];
  levels: LevelConfig[];
}

export interface RunAnalysisData {
  fileName: string;
  totalKm: number;
  startTime: number;
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