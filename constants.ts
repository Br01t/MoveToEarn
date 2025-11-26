
import { Item, User, Zone } from './types';

export const MINT_COST = 50;

export const MOCK_ITEMS: Item[] = [
  {
    id: 'shield_lvl1',
    name: 'Zone Shield v1',
    description: 'Protect a zone from being conquered for 24h.',
    priceGov: 50,
    type: 'DEFENSE',
    effectValue: 1,
    icon: 'Shield'
  },
  {
    id: 'boost_run',
    name: 'Nanofiber Shoes',
    description: '+0.2% permanent Interest Rate increase on a zone.',
    priceGov: 100,
    type: 'BOOST',
    effectValue: 0.2,
    icon: 'Zap'
  },
  {
    id: 'shield_lvl2',
    name: 'Fortress Projector',
    description: 'Significantly increases zone defense difficulty (+5 levels).',
    priceGov: 250,
    type: 'DEFENSE',
    effectValue: 5,
    icon: 'Castle'
  }
];

// Initial zones arranged in an asymmetric, organic cluster (Connected Graph) without holes
export const MOCK_ZONES: Zone[] = [
  // --- Center Hub ---
  { id: 'z1', x: 0, y: 0, ownerId: 'user_1', name: 'Parco Sempione', defenseLevel: 2, recordKm: 120, interestRate: 2.5 },
  
  // --- First Ring (Complete) ---
  { id: 'z2', x: 1, y: 0, ownerId: 'user_2', name: 'City Life', defenseLevel: 1, recordKm: 80, interestRate: 1.8 },
  { id: 'z3', x: 1, y: -1, ownerId: 'user_1', name: 'Bosco Verticale', defenseLevel: 0, recordKm: 50, interestRate: 1.2 },
  { id: 'z4', x: 0, y: -1, ownerId: 'user_2', name: 'Brera', defenseLevel: 0, recordKm: 30, interestRate: 3.0 },
  { id: 'z_fill_1', x: -1, y: 0, ownerId: 'user_3', name: 'Castello Sforzesco', defenseLevel: 4, recordKm: 200, interestRate: 2.9 }, // Filled Gap
  { id: 'z6', x: -1, y: 1, ownerId: 'user_3', name: 'Navigli', defenseLevel: 0, recordKm: 15, interestRate: 1.5 },
  { id: 'z7', x: 0, y: 1, ownerId: 'user_1', name: 'Duomo', defenseLevel: 3, recordKm: 150, interestRate: 2.8 },

  // --- Extended Tendrils & Fillers ---
  { id: 'z8', x: 2, y: -1, ownerId: 'user_2', name: 'Città Studi', defenseLevel: 1, recordKm: 45, interestRate: 1.6 },
  { id: 'z10', x: 1, y: -2, ownerId: 'user_1', name: 'Stazione Centrale', defenseLevel: 2, recordKm: 90, interestRate: 2.2 },
  
  { id: 'z12', x: -1, y: -1, ownerId: 'user_3', name: 'Chinatown', defenseLevel: 1, recordKm: 55, interestRate: 1.7 },
  { id: 'z_fill_2', x: -2, y: -1, ownerId: 'user_2', name: 'Tre Torri', defenseLevel: 1, recordKm: 35, interestRate: 1.4 }, // Connector

  { id: 'z14', x: -2, y: 1, ownerId: 'user_1', name: 'Baggio', defenseLevel: 0, recordKm: 10, interestRate: 1.1 },
  { id: 'z13', x: -2, y: 0, ownerId: 'user_3', name: 'San Siro', defenseLevel: 3, recordKm: 210, interestRate: 2.4 },
  
  // Southern Extension
  { id: 'z17', x: 0, y: 2, ownerId: 'user_3', name: 'Porta Romana', defenseLevel: 2, recordKm: 100, interestRate: 2.3 },
  { id: 'z_fill_3', x: 1, y: 1, ownerId: 'user_2', name: 'Missori', defenseLevel: 0, recordKm: 25, interestRate: 1.9 }, // Connector
  
  // Eastern Extension
  { id: 'z19', x: 2, y: 0, ownerId: 'user_1', name: 'Porta Venezia', defenseLevel: 2, recordKm: 110, interestRate: 2.6 },
  { id: 'z20', x: 3, y: -1, ownerId: 'user_3', name: 'Lambrate', defenseLevel: 0, recordKm: 40, interestRate: 1.9 },
  
  // Far West Outpost
  { id: 'z21', x: -3, y: 1, ownerId: 'user_2', name: 'Bisceglie', defenseLevel: 1, recordKm: 20, interestRate: 1.4 },
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
  runBalance: 1250.50,
  govBalance: 300.00,
  totalKm: 450,
  inventory: [
    {
      id: 'shield_lvl1',
      name: 'Zone Shield v1',
      description: 'Protect a zone from being conquered for 24h.',
      priceGov: 50,
      type: 'DEFENSE',
      effectValue: 1,
      icon: 'Shield',
      quantity: 2
    },
    {
      id: 'boost_run',
      name: 'Nanofiber Shoes',
      description: '+0.2% permanent Interest Rate increase on a zone.',
      priceGov: 100,
      type: 'BOOST',
      effectValue: 0.2,
      icon: 'Zap',
      quantity: 1
    }
  ]
  // --- DEMO OVERRIDES END ---
};
