

import { Item, User, Zone } from './types';

export const MINT_COST = 50; // RUN
export const MINT_REWARD_GOV = 5; // GOV earned for creating a zone
export const CONQUEST_REWARD_GOV = 10; // GOV earned for conquering

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
    name: 'Parco Sempione, Milan (IT)', 
    defenseLevel: 2, 
    recordKm: 120, 
    interestRate: 4.5, 
    boostExpiresAt: Date.now() + 1000 * 60 * 60 * 12 
  },
  { id: 'z_mi_1', x: 1, y: 0, ownerId: 'user_2', name: 'Duomo, Milan (IT)', defenseLevel: 3, recordKm: 150, interestRate: 2.8 },
  { id: 'z_mi_2', x: 1, y: -1, ownerId: 'user_1', name: 'Brera, Milan (IT)', defenseLevel: 0, recordKm: 30, interestRate: 3.0 },
  { id: 'z_mi_3', x: 0, y: -1, ownerId: 'user_3', name: 'Garibaldi, Milan (IT)', defenseLevel: 1, recordKm: 40, interestRate: 2.1 },
  { id: 'z_mi_4', x: -1, y: 0, ownerId: 'user_2', name: 'City Life, Milan (IT)', defenseLevel: 4, recordKm: 90, interestRate: 3.5 },
  { id: 'z_mi_5', x: -1, y: 1, ownerId: 'user_3', name: 'Navigli, Milan (IT)', defenseLevel: 0, recordKm: 15, interestRate: 1.5 },
  { id: 'z_mi_6', x: 0, y: 1, ownerId: 'user_1', name: 'Porta Romana, Milan (IT)', defenseLevel: 2, recordKm: 60, interestRate: 2.2 },
  // Extended Milan edges
  { id: 'z_mi_7', x: -2, y: 1, ownerId: 'user_1', name: 'San Siro, Milan (IT)', defenseLevel: 2, recordKm: 110, interestRate: 2.6 },


  // --- CLUSTER 2: NEW YORK (USA) - TOP RIGHT ---
  // Shifted East/NorthEast to ensure separation from Milan's East side.
  // Closest Milan Point: (1, -1). New York starts at (3, -2).
  // Gap: (2, -1) and (2, -2) are empty.
  { 
    id: 'z_ny_1', 
    x: 3, 
    y: -2, 
    ownerId: 'user_2', 
    name: 'Central Park, NY (US)', 
    defenseLevel: 5, 
    recordKm: 80, 
    interestRate: 1.8,
    shieldExpiresAt: Date.now() + 1000 * 60 * 60 * 20 
  },
  { id: 'z_ny_2', x: 4, y: -3, ownerId: 'user_3', name: 'Manhattan, NY (US)', defenseLevel: 2, recordKm: 55, interestRate: 2.0 },
  { id: 'z_ny_3', x: 3, y: -3, ownerId: 'user_2', name: 'Brooklyn Bridge, NY (US)', defenseLevel: 1, recordKm: 40, interestRate: 1.9 },
  { id: 'z_ny_4', x: 4, y: -2, ownerId: 'user_1', name: 'Times Square, NY (US)', defenseLevel: 0, recordKm: 25, interestRate: 1.4 },


  // --- CLUSTER 3: LONDON (UK) - TOP LEFT ---
  // Shifted West/NorthWest to ensure separation from Milan's West side.
  // Closest Milan Point: (-1, 0) and (-2, 1). London starts at (-3, -1).
  // Gap: (-2, 0) and (-2, -1) are empty.
  { id: 'z_ld_1', x: -3, y: -1, ownerId: 'user_1', name: 'Hyde Park, London (UK)', defenseLevel: 3, recordKm: 70, interestRate: 3.2 },
  { id: 'z_ld_2', x: -4, y: -1, ownerId: 'user_3', name: 'Soho, London (UK)', defenseLevel: 1, recordKm: 35, interestRate: 1.6 },
  { id: 'z_ld_3', x: -3, y: -2, ownerId: 'user_1', name: 'Camden Town, London (UK)', defenseLevel: 0, recordKm: 45, interestRate: 2.1 },


  // --- CLUSTER 4: TOKYO (JP) - BOTTOM RIGHT ---
  // Shifted South/SouthEast to ensure separation from Milan's South side.
  // Closest Milan Point: (0, 1) and (1, 0). Tokyo starts at (2, 2).
  // Gap: (1, 1) and (1, 2) are empty.
  { id: 'z_tk_1', x: 2, y: 2, ownerId: 'user_3', name: 'Shibuya, Tokyo (JP)', defenseLevel: 4, recordKm: 200, interestRate: 2.9 },
  { id: 'z_tk_2', x: 3, y: 1, ownerId: 'user_2', name: 'Shinjuku, Tokyo (JP)', defenseLevel: 2, recordKm: 110, interestRate: 2.5 },
  { id: 'z_tk_3', x: 2, y: 3, ownerId: 'user_3', name: 'Akihabara, Tokyo (JP)', defenseLevel: 1, recordKm: 85, interestRate: 1.8 },
  { id: 'z_tk_4', x: 1, y: 3, ownerId: 'user_1', name: 'Roppongi, Tokyo (JP)', defenseLevel: 1, recordKm: 95, interestRate: 2.2 },
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
  inventory: []
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