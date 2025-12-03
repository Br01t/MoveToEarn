
import { Item, User, Zone, Mission, Badge } from './types';

export const MINT_COST = 50; // RUN
export const MINT_REWARD_GOV = 5; // GOV earned for creating a zone
export const CONQUEST_REWARD_GOV = 10; // GOV earned for conquering
export const PREMIUM_COST = 50; // GOV per month

export const MOCK_ITEMS: Item[] = [
  {
    id: 'shield_lvl1',
    name: 'Zone Shield v1',
    description: 'Protect a zone from being conquered for 24h.',
    priceRun: 250, // Costs RUN now
    quantity: 50, // Stock
    type: 'DEFENSE',
    effectValue: 1,
    icon: 'Shield'
  },
  {
    id: 'boost_run',
    name: 'Nanofiber Shoes',
    description: '+1.0% temporary Interest Rate boost for 24h.',
    priceRun: 500, // Costs RUN now
    quantity: 100, // Stock
    type: 'BOOST',
    effectValue: 1.0,
    icon: 'Zap'
  },
  {
    id: 'gov_pack_small',
    name: 'GOV Supply Crate',
    description: 'Contains 50 GOV tokens. Essential for voting and long-term holding.',
    priceRun: 1000,
    quantity: 20, // Low Stock
    type: 'CURRENCY',
    effectValue: 50,
    icon: 'Coins'
  }
];

export const MOCK_MISSIONS: Mission[] = [
  // DISTANCE MISSIONS
  {
    id: 'm_dist_1',
    title: 'First Steps',
    description: 'Run your first 10 KM total.',
    rewardGov: 5,
    conditionType: 'TOTAL_KM',
    conditionValue: 10,
    rarity: 'COMMON'
  },
  {
    id: 'm_dist_2',
    title: 'Weekend Warrior',
    description: 'Accumulate 25 KM total distance.',
    rewardGov: 10,
    conditionType: 'TOTAL_KM',
    conditionValue: 25,
    rarity: 'COMMON'
  },
  {
    id: 'm1',
    title: 'Marathon Beginner',
    description: 'Run a total of 50 KM.',
    rewardGov: 20,
    conditionType: 'TOTAL_KM',
    conditionValue: 50,
    rarity: 'RARE'
  },
  {
    id: 'm_dist_3',
    title: 'Century Runner',
    description: 'Reach 100 KM in career distance.',
    rewardGov: 35,
    conditionType: 'TOTAL_KM',
    conditionValue: 100,
    rarity: 'RARE'
  },
  {
    id: 'm3',
    title: 'Ultra Runner',
    description: 'Reach a total distance of 500 KM.',
    rewardGov: 100,
    conditionType: 'TOTAL_KM',
    conditionValue: 500,
    rarity: 'EPIC'
  },
  {
    id: 'm_dist_4',
    title: 'Globetrotter',
    description: 'Log an impressive 1,000 KM.',
    rewardGov: 250,
    conditionType: 'TOTAL_KM',
    conditionValue: 1000,
    rarity: 'LEGENDARY'
  },

  // OWNERSHIP MISSIONS
  {
    id: 'm_own_1',
    title: 'Scout',
    description: 'Claim ownership of your first zone.',
    rewardGov: 10,
    conditionType: 'OWN_ZONES',
    conditionValue: 1,
    rarity: 'COMMON'
  },
  {
    id: 'm2',
    title: 'Landlord',
    description: 'Own at least 3 zones simultaneously.',
    rewardGov: 50,
    conditionType: 'OWN_ZONES',
    conditionValue: 3,
    rarity: 'RARE'
  },
  {
    id: 'm_own_2',
    title: 'District Manager',
    description: 'Control 5 distinct zones on the map.',
    rewardGov: 75,
    conditionType: 'OWN_ZONES',
    conditionValue: 5,
    rarity: 'RARE'
  },
  {
    id: 'm_own_3',
    title: 'Regional Governor',
    description: 'Expand your territory to 10 zones.',
    rewardGov: 150,
    conditionType: 'OWN_ZONES',
    conditionValue: 10,
    rarity: 'EPIC'
  },
  {
    id: 'm_own_4',
    title: 'Emperor',
    description: 'Dominate the map with 20 zones.',
    rewardGov: 500,
    conditionType: 'OWN_ZONES',
    conditionValue: 20,
    rarity: 'LEGENDARY'
  }
];

export const MOCK_BADGES: Badge[] = [
  // DISTANCE BADGES
  {
    id: 'b_warmup',
    name: 'Warm Up',
    description: 'Completed 5 KM.',
    icon: 'Flag',
    conditionType: 'TOTAL_KM',
    conditionValue: 5,
    rarity: 'COMMON'
  },
  {
    id: 'b2',
    name: 'Elite Runner',
    description: 'Clocked over 100 KM total distance.',
    icon: 'Award',
    conditionType: 'TOTAL_KM',
    conditionValue: 100,
    rarity: 'RARE'
  },
  {
    id: 'b_iron',
    name: 'Iron Legs',
    description: 'Surpassed the 500 KM mark.',
    icon: 'Award',
    conditionType: 'TOTAL_KM',
    conditionValue: 500,
    rarity: 'EPIC'
  },
  {
    id: 'b_titan',
    name: 'Titan',
    description: 'A legendary 2,000 KM career.',
    icon: 'Crown',
    conditionType: 'TOTAL_KM',
    conditionValue: 2000,
    rarity: 'LEGENDARY'
  },

  // OWNERSHIP BADGES
  {
    id: 'b1',
    name: 'Pioneer',
    description: 'Owned your first zone.',
    icon: 'Flag',
    conditionType: 'OWN_ZONES',
    conditionValue: 1,
    rarity: 'COMMON'
  },
  {
    id: 'b_settler',
    name: 'Settler',
    description: 'Established a foothold with 3 zones.',
    icon: 'Flag',
    conditionType: 'OWN_ZONES',
    conditionValue: 3,
    rarity: 'RARE'
  },
  {
    id: 'b3',
    name: 'Tycoon',
    description: 'Control an empire of 10 zones.',
    icon: 'Crown',
    conditionType: 'OWN_ZONES',
    conditionValue: 10,
    rarity: 'EPIC'
  },
  {
    id: 'b_warlord',
    name: 'Warlord',
    description: 'Conquered 25 zones.',
    icon: 'Crown',
    conditionType: 'OWN_ZONES',
    conditionValue: 25,
    rarity: 'EPIC'
  },
  {
    id: 'b_king',
    name: 'Kingpin',
    description: 'The map is yours. 50 zones owned.',
    icon: 'Crown',
    conditionType: 'OWN_ZONES',
    conditionValue: 50,
    rarity: 'LEGENDARY'
  }
];

// Initial zones arranged in VISUAL CLUSTERS to represent real-world distance
// UPDATED: Compact "World Map" with 1-hex separation channels between nations.
export const MOCK_ZONES: Zone[] = [
  // --- CLUSTER 1: MILAN (Italy) - CENTER ---
  // Core: (0,0) and surrounding ring 1
  { 
    id: 'z1', 
    x: 0, 
    y: 0, 
    ownerId: 'user_1', 
    name: 'Parco Sempione, Milan - IT', 
    defenseLevel: 2, 
    recordKm: 120, 
    interestRate: 4.5, 
    boostExpiresAt: Date.now() + 1000 * 60 * 60 * 12 
  },
  { id: 'z_mi_1', x: 1, y: 0, ownerId: 'user_2', name: 'Duomo, Milan - IT', defenseLevel: 3, recordKm: 150, interestRate: 2.8 },
  { id: 'z_mi_2', x: 1, y: -1, ownerId: 'user_1', name: 'Brera, Milan - IT', defenseLevel: 0, recordKm: 30, interestRate: 3.0 },
  { id: 'z_mi_3', x: 0, y: -1, ownerId: 'user_3', name: 'Garibaldi, Milan - IT', defenseLevel: 1, recordKm: 40, interestRate: 2.1 },
  { id: 'z_mi_4', x: -1, y: 0, ownerId: 'user_2', name: 'City Life, Milan - IT', defenseLevel: 4, recordKm: 90, interestRate: 3.5 },
  { id: 'z_mi_5', x: -1, y: 1, ownerId: 'user_3', name: 'Navigli, Milan - IT', defenseLevel: 0, recordKm: 15, interestRate: 1.5 },
  { id: 'z_mi_6', x: 0, y: 1, ownerId: 'user_1', name: 'Porta Romana, Milan - IT', defenseLevel: 2, recordKm: 60, interestRate: 2.2 },
  // Extended Milan edges
  { id: 'z_mi_7', x: -2, y: 1, ownerId: 'user_1', name: 'San Siro, Milan - IT', defenseLevel: 2, recordKm: 110, interestRate: 2.6 },


  // --- CLUSTER 2: NEW YORK (USA) - TOP RIGHT ---
  // Shifted East/NorthEast to ensure separation from Milan's East side.
  // Closest Milan Point: (1, -1). New York starts at (3, -2).
  // Gap: (2, -1) and (2, -2) are empty.
  { 
    id: 'z_ny_1', 
    x: 3, 
    y: -2, 
    ownerId: 'user_2', 
    name: 'Central Park, NY - US', 
    defenseLevel: 5, 
    recordKm: 80, 
    interestRate: 1.8,
    shieldExpiresAt: Date.now() + 1000 * 60 * 60 * 20 
  },
  { id: 'z_ny_2', x: 4, y: -3, ownerId: 'user_3', name: 'Manhattan, NY - US', defenseLevel: 2, recordKm: 55, interestRate: 2.0 },
  { id: 'z_ny_3', x: 3, y: -3, ownerId: 'user_2', name: 'Brooklyn Bridge, NY - US', defenseLevel: 1, recordKm: 40, interestRate: 1.9 },
  { id: 'z_ny_4', x: 4, y: -2, ownerId: 'user_1', name: 'Times Square, NY - US', defenseLevel: 0, recordKm: 25, interestRate: 1.4 },


  // --- CLUSTER 3: LONDON (UK) - TOP LEFT ---
  // Shifted West/NorthWest to ensure separation from Milan's West side.
  // Closest Milan Point: (-1, 0) and (-2, 1). London starts at (-3, -1).
  // Gap: (-2, 0) and (-2, -1) are empty.
  { id: 'z_ld_1', x: -3, y: -1, ownerId: 'user_1', name: 'Hyde Park, London - UK', defenseLevel: 3, recordKm: 70, interestRate: 3.2 },
  { id: 'z_ld_2', x: -4, y: -1, ownerId: 'user_3', name: 'Soho, London - UK', defenseLevel: 1, recordKm: 35, interestRate: 1.6 },
  { id: 'z_ld_3', x: -3, y: -2, ownerId: 'user_1', name: 'Camden Town, London - UK', defenseLevel: 0, recordKm: 45, interestRate: 2.1 },


  // --- CLUSTER 4: TOKYO (JP) - BOTTOM RIGHT ---
  // Shifted South/SouthEast to ensure separation from Milan's South side.
  // Closest Milan Point: (0, 1) and (1, 0). Tokyo starts at (2, 2).
  // Gap: (1, 1) and (1, 2) are empty.
  { id: 'z_tk_1', x: 2, y: 2, ownerId: 'user_3', name: 'Shibuya, Tokyo - JP', defenseLevel: 4, recordKm: 200, interestRate: 2.9 },
  { id: 'z_tk_2', x: 3, y: 1, ownerId: 'user_2', name: 'Shinjuku, Tokyo - JP', defenseLevel: 2, recordKm: 110, interestRate: 2.5 },
  { id: 'z_tk_3', x: 2, y: 3, ownerId: 'user_3', name: 'Akihabara, Tokyo - JP', defenseLevel: 1, recordKm: 85, interestRate: 1.8 },
  { id: 'z_tk_4', x: 1, y: 3, ownerId: 'user_1', name: 'Roppongi, Tokyo - JP', defenseLevel: 1, recordKm: 95, interestRate: 2.2 },
];

export const MOCK_USERS: Record<string, { id: string; name: string; totalKm: number; avatar: string }> = {
  'user_1': { id: 'user_1', name: 'RunnerOne', totalKm: 450, avatar: 'https://picsum.photos/seed/u1/200' },
  'user_2': { id: 'user_2', name: 'CryptoJogger', totalKm: 320, avatar: 'https://picsum.photos/seed/u2/200' },
  'user_3': { id: 'user_3', name: 'SpeedDemon', totalKm: 890, avatar: 'https://picsum.photos/seed/u3/200' },
};

// Default User Template: Defines the standard "new user" state (Empty)
const DEFAULT_USER_STATE = {
  runBalance: 0,
  govBalance: 0,
  totalKm: 0,
  isPremium: false,
  inventory: [],
  completedMissionIds: [],
  earnedBadgeIds: []
};

// MVP DEMO USER: Explicitly overrides defaults to provide a populated experience for the demo
export const INITIAL_USER: User = {
  id: 'user_1',
  name: 'RunnerOne',
  email: 'runner.one@zonerun.eth',
  avatar: 'https://picsum.photos/seed/u1/200',
  
  // Apply Default State
  ...DEFAULT_USER_STATE,

  // --- DEMO OVERRIDES START ---
  // These values are injected only for this MVP version to demonstrate features
  runBalance: 2500.50, // More RUN for testing new economy
  govBalance: 50.00, // Lower initial GOV (harder to get now)
  totalKm: 450,
  completedMissionIds: ['m_dist_1', 'm_dist_2', 'm1', 'm_own_1'], // Completed a few starter missions
  earnedBadgeIds: ['b1', 'b2'], // Already has Pioneer and Elite Runner
  inventory: [
    {
      id: 'shield_lvl1',
      name: 'Zone Shield v1',
      description: 'Protect a zone from being conquered for 24h.',
      priceRun: 250,
      quantity: 1,
      type: 'DEFENSE',
      effectValue: 1,
      icon: 'Shield',
      // The market stock "quantity" property is ignored for inventory items as "quantity" here means owned amount
    }
  ]
  // --- DEMO OVERRIDES END ---
};
