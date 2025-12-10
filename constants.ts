
import { Item, User, Zone, Mission, Badge, AchievementCategory, Difficulty, Rarity, LeaderboardConfig, LevelConfig } from './types';

export const MINT_COST = 50; 
export const MINT_REWARD_GOV = 5; 
export const CONQUEST_REWARD_GOV = 10; 
export const PREMIUM_COST = 50; 

// Initial empty defaults if DB is empty
export const DEFAULT_LEADERBOARDS: LeaderboardConfig[] = [];
export const DEFAULT_LEVELS: LevelConfig[] = [];
export const MOCK_ITEMS: Item[] = [];

// --- ZONES (Preserved as initial map state, but owners should be updated via DB if possible) ---
export const MOCK_ZONES: Zone[] = [
  // --- CLUSTER 1: MILAN (Italy) ---
  { id: 'z1', x: 0, y: 0, lat: 45.4706, lng: 9.1775, ownerId: null, name: 'Parco Sempione, Milan - IT', defenseLevel: 2, recordKm: 120, interestRate: 4.5, boostExpiresAt: Date.now() + 1000 * 60 * 60 * 12 },
  { id: 'z_mi_1', x: 1, y: 0, lat: 45.4641, lng: 9.1919, ownerId: null, name: 'Duomo, Milan - IT', defenseLevel: 3, recordKm: 150, interestRate: 2.8 },
  { id: 'z_mi_2', x: 1, y: -1, lat: 45.4716, lng: 9.1878, ownerId: null, name: 'Brera, Milan - IT', defenseLevel: 0, recordKm: 30, interestRate: 3.0 },
  { id: 'z_mi_3', x: 0, y: -1, lat: 45.4842, lng: 9.1895, ownerId: null, name: 'Garibaldi, Milan - IT', defenseLevel: 1, recordKm: 40, interestRate: 2.1 },
  { id: 'z_mi_4', x: -1, y: 0, lat: 45.4778, lng: 9.1561, ownerId: null, name: 'City Life, Milan - IT', defenseLevel: 4, recordKm: 90, interestRate: 3.5 },
  { id: 'z_mi_5', x: -1, y: 1, lat: 45.4544, lng: 9.1729, ownerId: null, name: 'Navigli, Milan - IT', defenseLevel: 0, recordKm: 15, interestRate: 1.5 },
  { id: 'z_mi_6', x: 0, y: 1, lat: 45.4520, lng: 9.2030, ownerId: null, name: 'Porta Romana, Milan - IT', defenseLevel: 2, recordKm: 60, interestRate: 2.2 },
  { id: 'z_mi_7', x: -2, y: 1, lat: 45.4781, lng: 9.1240, ownerId: null, name: 'San Siro, Milan - IT', defenseLevel: 2, recordKm: 110, interestRate: 2.6 },
  // --- CLUSTER 2: NEW YORK (USA) ---
  { id: 'z_ny_1', x: 3, y: -2, lat: 40.7829, lng: -73.9654, ownerId: null, name: 'Central Park, NY - US', defenseLevel: 5, recordKm: 80, interestRate: 1.8, shieldExpiresAt: Date.now() + 1000 * 60 * 60 * 20 },
  { id: 'z_ny_2', x: 4, y: -3, lat: 40.7128, lng: -74.0060, ownerId: null, name: 'Manhattan, NY - US', defenseLevel: 2, recordKm: 55, interestRate: 2.0 },
  { id: 'z_ny_3', x: 3, y: -3, lat: 40.7061, lng: -73.9969, ownerId: null, name: 'Brooklyn Bridge, NY - US', defenseLevel: 1, recordKm: 40, interestRate: 1.9 },
  { id: 'z_ny_4', x: 4, y: -2, lat: 40.7580, lng: -73.9855, ownerId: null, name: 'Times Square, NY - US', defenseLevel: 0, recordKm: 25, interestRate: 1.4 },
  // --- CLUSTER 3: LONDON (UK) ---
  { id: 'z_ld_1', x: -3, y: -1, lat: 51.5074, lng: -0.1657, ownerId: null, name: 'Hyde Park, London - UK', defenseLevel: 3, recordKm: 70, interestRate: 3.2 },
  { id: 'z_ld_2', x: -4, y: -1, lat: 51.5138, lng: -0.1332, ownerId: null, name: 'Soho, London - UK', defenseLevel: 1, recordKm: 35, interestRate: 1.6 },
  { id: 'z_ld_3', x: -3, y: -2, lat: 51.5390, lng: -0.1426, ownerId: null, name: 'Camden Town, London - UK', defenseLevel: 0, recordKm: 45, interestRate: 2.1 },
  // --- CLUSTER 4: TOKYO (JP) ---
  { id: 'z_tk_1', x: 2, y: 2, lat: 35.6580, lng: 139.7016, ownerId: null, name: 'Shibuya, Tokyo - JP', defenseLevel: 4, recordKm: 200, interestRate: 2.9 },
  { id: 'z_tk_2', x: 3, y: 1, lat: 35.6917, lng: 139.7034, ownerId: null, name: 'Shinjuku, Tokyo - JP', defenseLevel: 2, recordKm: 110, interestRate: 2.5 },
  { id: 'z_tk_3', x: 2, y: 3, lat: 35.6984, lng: 139.7744, ownerId: null, name: 'Akihabara, Tokyo - JP', defenseLevel: 1, recordKm: 85, interestRate: 1.8 },
  { id: 'z_tk_4', x: 1, y: 3, lat: 35.6628, lng: 139.7315, ownerId: null, name: 'Roppongi, Tokyo - JP', defenseLevel: 1, recordKm: 95, interestRate: 2.2 },
];

// Empty - Real users will be fetched from DB
export const MOCK_USERS: Record<string, any> = {};