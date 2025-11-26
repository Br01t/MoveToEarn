
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

// Initial zones arranged in a contiguous Axial Cluster (Center + Ring)
export const MOCK_ZONES: Zone[] = [
  // Center
  { id: 'z1', x: 0, y: 0, ownerId: 'user_1', name: 'Parco Sempione', defenseLevel: 2, recordKm: 120, interestRate: 2.5 },
  
  // Ring around center
  { id: 'z2', x: 1, y: 0, ownerId: 'user_2', name: 'City Life', defenseLevel: 1, recordKm: 80, interestRate: 1.8 },
  { id: 'z3', x: 1, y: -1, ownerId: 'user_1', name: 'Bosco Verticale', defenseLevel: 0, recordKm: 50, interestRate: 1.2 },
  { id: 'z4', x: 0, y: -1, ownerId: 'user_2', name: 'Brera', defenseLevel: 0, recordKm: 30, interestRate: 3.0 },
  { id: 'z5', x: -1, y: 0, ownerId: 'user_3', name: 'Castello', defenseLevel: 2, recordKm: 200, interestRate: 2.0 },
  { id: 'z6', x: -1, y: 1, ownerId: 'user_3', name: 'Navigli', defenseLevel: 0, recordKm: 15, interestRate: 1.5 },
  { id: 'z7', x: 0, y: 1, ownerId: 'user_1', name: 'Duomo', defenseLevel: 3, recordKm: 150, interestRate: 2.8 },
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
