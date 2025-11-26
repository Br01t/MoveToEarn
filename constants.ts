

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

// Initial zones arranged in an asymmetric, organic cluster (Connected Graph) without holes
export const MOCK_ZONES: Zone[] = [
  // --- Center Hub (Mixed International) ---
  { 
    id: 'z1', 
    x: 0, 
    y: 0, 
    ownerId: 'user_1', 
    name: 'Parco Sempione, Milan (IT)', 
    defenseLevel: 2, 
    recordKm: 120, 
    interestRate: 4.5, 
    boostExpiresAt: Date.now() + 1000 * 60 * 60 * 12 // Expire in 12 hours
  },
  
  // --- First Ring (International Mix) ---
  { 
    id: 'z2', 
    x: 1, 
    y: 0, 
    ownerId: 'user_2', 
    name: 'Central Park, NY (US)', 
    defenseLevel: 5, 
    recordKm: 80, 
    interestRate: 1.8,
    shieldExpiresAt: Date.now() + 1000 * 60 * 60 * 20 // Active Shield for demo
  },
  { id: 'z3', x: 1, y: -1, ownerId: 'user_1', name: 'Hyde Park, London (UK)', defenseLevel: 0, recordKm: 50, interestRate: 1.2 },
  { id: 'z4', x: 0, y: -1, ownerId: 'user_2', name: 'Brera, Milan (IT)', defenseLevel: 0, recordKm: 30, interestRate: 3.0 },
  { id: 'z_fill_1', x: -1, y: 0, ownerId: 'user_3', name: 'Shibuya, Tokyo (JP)', defenseLevel: 4, recordKm: 200, interestRate: 2.9 }, // Filled Gap
  { id: 'z6', x: -1, y: 1, ownerId: 'user_3', name: 'Navigli, Milan (IT)', defenseLevel: 0, recordKm: 15, interestRate: 1.5 },
  { id: 'z7', x: 0, y: 1, ownerId: 'user_1', name: 'Duomo, Milan (IT)', defenseLevel: 3, recordKm: 150, interestRate: 2.8 },

  // --- Extended Tendrils & Fillers ---
  { id: 'z8', x: 2, y: -1, ownerId: 'user_2', name: 'Bondi Beach, Sydney (AU)', defenseLevel: 1, recordKm: 45, interestRate: 1.6 },
  { id: 'z10', x: 1, y: -2, ownerId: 'user_1', name: 'Stazione Centrale, Milan (IT)', defenseLevel: 2, recordKm: 90, interestRate: 2.2 },
  
  { id: 'z12', x: -1, y: -1, ownerId: 'user_3', name: 'Chinatown, Milan (IT)', defenseLevel: 1, recordKm: 55, interestRate: 1.7 },
  { id: 'z_fill_2', x: -2, y: -1, ownerId: 'user_2', name: 'Eiffel Tower, Paris (FR)', defenseLevel: 1, recordKm: 35, interestRate: 1.4 }, 

  { id: 'z14', x: -2, y: 1, ownerId: 'user_1', name: 'Kreuzberg, Berlin (DE)', defenseLevel: 0, recordKm: 10, interestRate: 1.1 },
  { id: 'z13', x: -2, y: 0, ownerId: 'user_3', name: 'San Siro, Milan (IT)', defenseLevel: 3, recordKm: 210, interestRate: 2.4 },
  
  // Southern Extension
  { id: 'z17', x: 0, y: 2, ownerId: 'user_3', name: 'Colosseum, Rome (IT)', defenseLevel: 2, recordKm: 100, interestRate: 2.3 },
  { id: 'z_fill_3', x: 1, y: 1, ownerId: 'user_2', name: 'Missori, Milan (IT)', defenseLevel: 0, recordKm: 25, interestRate: 1.9 }, 
  
  // Eastern Extension
  { id: 'z19', x: 2, y: 0, ownerId: 'user_1', name: 'Porta Venezia, Milan (IT)', defenseLevel: 2, recordKm: 110, interestRate: 2.6 },
  { id: 'z20', x: 3, y: -1, ownerId: 'user_3', name: 'Brooklyn Bridge, NY (US)', defenseLevel: 0, recordKm: 40, interestRate: 1.9 },
  
  // Far West Outpost
  { id: 'z21', x: -3, y: 1, ownerId: 'user_2', name: 'Santa Monica, LA (US)', defenseLevel: 1, recordKm: 20, interestRate: 1.4 },
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