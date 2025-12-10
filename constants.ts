
import { Item, User, Zone, Mission, Badge, AchievementCategory, Difficulty, Rarity, LeaderboardConfig, LevelConfig } from './types';

export const MINT_COST = 50; 
export const MINT_REWARD_GOV = 5; 
export const CONQUEST_REWARD_GOV = 10; 
export const PREMIUM_COST = 50; 

// Initial empty defaults if DB is empty
export const DEFAULT_LEADERBOARDS: LeaderboardConfig[] = [];
export const DEFAULT_LEVELS: LevelConfig[] = [];
export const MOCK_ITEMS: Item[] = [];

// --- ZONES AND USERS (PRESERVED) ---
export const MOCK_ZONES: Zone[] = [
  // --- CLUSTER 1: MILAN (Italy) ---
  { id: 'z1', x: 0, y: 0, lat: 45.4706, lng: 9.1775, ownerId: 'user_1', name: 'Parco Sempione, Milan - IT', defenseLevel: 2, recordKm: 120, interestRate: 4.5, boostExpiresAt: Date.now() + 1000 * 60 * 60 * 12 },
  { id: 'z_mi_1', x: 1, y: 0, lat: 45.4641, lng: 9.1919, ownerId: 'user_2', name: 'Duomo, Milan - IT', defenseLevel: 3, recordKm: 150, interestRate: 2.8 },
  { id: 'z_mi_2', x: 1, y: -1, lat: 45.4716, lng: 9.1878, ownerId: 'user_1', name: 'Brera, Milan - IT', defenseLevel: 0, recordKm: 30, interestRate: 3.0 },
  { id: 'z_mi_3', x: 0, y: -1, lat: 45.4842, lng: 9.1895, ownerId: 'user_3', name: 'Garibaldi, Milan - IT', defenseLevel: 1, recordKm: 40, interestRate: 2.1 },
  { id: 'z_mi_4', x: -1, y: 0, lat: 45.4778, lng: 9.1561, ownerId: 'user_2', name: 'City Life, Milan - IT', defenseLevel: 4, recordKm: 90, interestRate: 3.5 },
  { id: 'z_mi_5', x: -1, y: 1, lat: 45.4544, lng: 9.1729, ownerId: 'user_3', name: 'Navigli, Milan - IT', defenseLevel: 0, recordKm: 15, interestRate: 1.5 },
  { id: 'z_mi_6', x: 0, y: 1, lat: 45.4520, lng: 9.2030, ownerId: 'user_1', name: 'Porta Romana, Milan - IT', defenseLevel: 2, recordKm: 60, interestRate: 2.2 },
  { id: 'z_mi_7', x: -2, y: 1, lat: 45.4781, lng: 9.1240, ownerId: 'user_1', name: 'San Siro, Milan - IT', defenseLevel: 2, recordKm: 110, interestRate: 2.6 },
  // --- CLUSTER 2: NEW YORK (USA) ---
  { id: 'z_ny_1', x: 3, y: -2, lat: 40.7829, lng: -73.9654, ownerId: 'user_2', name: 'Central Park, NY - US', defenseLevel: 5, recordKm: 80, interestRate: 1.8, shieldExpiresAt: Date.now() + 1000 * 60 * 60 * 20 },
  { id: 'z_ny_2', x: 4, y: -3, lat: 40.7128, lng: -74.0060, ownerId: 'user_3', name: 'Manhattan, NY - US', defenseLevel: 2, recordKm: 55, interestRate: 2.0 },
  { id: 'z_ny_3', x: 3, y: -3, lat: 40.7061, lng: -73.9969, ownerId: 'user_2', name: 'Brooklyn Bridge, NY - US', defenseLevel: 1, recordKm: 40, interestRate: 1.9 },
  { id: 'z_ny_4', x: 4, y: -2, lat: 40.7580, lng: -73.9855, ownerId: 'user_1', name: 'Times Square, NY - US', defenseLevel: 0, recordKm: 25, interestRate: 1.4 },
  // --- CLUSTER 3: LONDON (UK) ---
  { id: 'z_ld_1', x: -3, y: -1, lat: 51.5074, lng: -0.1657, ownerId: 'user_1', name: 'Hyde Park, London - UK', defenseLevel: 3, recordKm: 70, interestRate: 3.2 },
  { id: 'z_ld_2', x: -4, y: -1, lat: 51.5138, lng: -0.1332, ownerId: 'user_3', name: 'Soho, London - UK', defenseLevel: 1, recordKm: 35, interestRate: 1.6 },
  { id: 'z_ld_3', x: -3, y: -2, lat: 51.5390, lng: -0.1426, ownerId: 'user_1', name: 'Camden Town, London - UK', defenseLevel: 0, recordKm: 45, interestRate: 2.1 },
  // --- CLUSTER 4: TOKYO (JP) ---
  { id: 'z_tk_1', x: 2, y: 2, lat: 35.6580, lng: 139.7016, ownerId: 'user_3', name: 'Shibuya, Tokyo - JP', defenseLevel: 4, recordKm: 200, interestRate: 2.9 },
  { id: 'z_tk_2', x: 3, y: 1, lat: 35.6917, lng: 139.7034, ownerId: 'user_2', name: 'Shinjuku, Tokyo - JP', defenseLevel: 2, recordKm: 110, interestRate: 2.5 },
  { id: 'z_tk_3', x: 2, y: 3, lat: 35.6984, lng: 139.7744, ownerId: 'user_3', name: 'Akihabara, Tokyo - JP', defenseLevel: 1, recordKm: 85, interestRate: 1.8 },
  { id: 'z_tk_4', x: 1, y: 3, lat: 35.6628, lng: 139.7315, ownerId: 'user_1', name: 'Roppongi, Tokyo - JP', defenseLevel: 1, recordKm: 95, interestRate: 2.2 },
];

export const MOCK_USERS: Record<string, { id: string; name: string; totalKm: number; avatar: string; favoriteBadgeId?: string; runBalance: number; govBalance: number; }> = {
  'user_1': { id: 'user_1', name: 'RunnerOne', totalKm: 450, avatar: 'https://picsum.photos/seed/u1/200', favoriteBadgeId: 'b_1', runBalance: 2500.5, govBalance: 50 },
  'user_2': { id: 'user_2', name: 'CryptoJogger', totalKm: 320, avatar: 'https://picsum.photos/seed/u2/200', favoriteBadgeId: 'b_21', runBalance: 1250.0, govBalance: 25 },
  'user_3': { id: 'user_3', name: 'SpeedDemon', totalKm: 890, avatar: 'https://picsum.photos/seed/u3/200', favoriteBadgeId: 'b_11', runBalance: 5400.0, govBalance: 120 },
};