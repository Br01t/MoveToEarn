
import { Item, User, Zone, Mission, Badge, AchievementCategory, Difficulty, Rarity, LeaderboardConfig, LevelConfig } from './types';

export const MINT_COST = 50; 
export const MINT_REWARD_GOV = 5; 
export const CONQUEST_REWARD_GOV = 10; 
export const PREMIUM_COST = 50; 

export const DEFAULT_LEADERBOARDS: LeaderboardConfig[] = [
    { id: 'global_km', title: 'Global Distance', description: 'All-time total kilometers run.', metric: 'TOTAL_KM', type: 'PERMANENT' },
    { id: 'zone_owners', title: 'Land Barons', description: 'Most zones currently owned.', metric: 'OWNED_ZONES', type: 'PERMANENT' },
    { id: 'rich_list_run', title: 'RUN Whales', description: 'Highest liquid RUN holdings.', metric: 'RUN_BALANCE', type: 'PERMANENT' },
    { id: 'rich_list_gov', title: 'Governance Power', description: 'Highest staked GOV holdings.', metric: 'GOV_BALANCE', type: 'PERMANENT' }
];

// Generate 50 Levels
// Level 1 starts at 0. Level 2 at 50km. Level 50 at 2450km.
export const DEFAULT_LEVELS: LevelConfig[] = Array.from({ length: 50 }, (_, i) => ({
    id: `lvl_${i + 1}`,
    level: i + 1,
    minKm: i * 50,
    title: `Level ${i + 1}`
}));

export const MOCK_ITEMS: Item[] = [
  { id: 'shield_lvl1', name: 'Zone Shield v1', description: 'Protect a zone from being conquered for 24h.', priceRun: 250, quantity: 50, type: 'DEFENSE', effectValue: 1, icon: 'Shield' },
  { id: 'boost_run', name: 'Nanofiber Shoes', description: '+1.0% temporary Interest Rate boost for 24h.', priceRun: 500, quantity: 100, type: 'BOOST', effectValue: 1.0, icon: 'Zap' },
  { id: 'gov_pack_small', name: 'GOV Supply Crate', description: 'Contains 50 GOV tokens. Essential for voting and long-term holding.', priceRun: 1000, quantity: 20, type: 'CURRENCY', effectValue: 50, icon: 'Coins' }
];

// --- 100 REAL ACHIEVEMENTS (DATA SOURCE) ---
// Updated with specific GOV rewards based on user request
const PDF_DATA = [
  { id: 1, name: "First 10K", logic: "Reach 10 km total.", diff: "Easy", cat: "Distance", reward: 100, rewardGov: 0, rarity: "COMMON" },
  { id: 2, name: "First 50K", logic: "Reach 50 km total.", diff: "Easy", cat: "Distance", reward: 200, rewardGov: 0, rarity: "COMMON" },
  { id: 3, name: "Centurion", logic: "Reach 100 km total.", diff: "Medium", cat: "Distance", reward: 300, rewardGov: 0, rarity: "RARE" },
  { id: 4, name: "Quarter Marathoner", logic: "Single run >= 10.55 km.", diff: "Medium", cat: "Distance", reward: 300, rewardGov: 0, rarity: "RARE" },
  { id: 5, name: "Half Marathoner", logic: "Single run >= 21 km.", diff: "Hard", cat: "Distance", reward: 600, rewardGov: 5, rarity: "EPIC" },
  { id: 6, name: "Marathoner", logic: "Single run >= 42.195 km.", diff: "Expert", cat: "Distance", reward: 1000, rewardGov: 10, rarity: "LEGENDARY" },
  { id: 7, name: "Ultrarunner", logic: "Single run >= 50 km.", diff: "Expert", cat: "Distance", reward: 1500, rewardGov: 15, rarity: "LEGENDARY" },
  { id: 8, name: "100 Miles Club", logic: "Reach 160 km total.", diff: "Expert", cat: "Distance", reward: 800, rewardGov: 5, rarity: "EPIC" },
  { id: 9, name: "Road Titan", logic: "Reach 500 km total.", diff: "Expert", cat: "Distance", reward: 2000, rewardGov: 10, rarity: "LEGENDARY" },
  { id: 10, name: "Kilometer Emperor", logic: "Reach 1000 km total.", diff: "Expert", cat: "Distance", reward: 5000, rewardGov: 25, rarity: "LEGENDARY" },
  { id: 11, name: "Sprinter", logic: "Max speed >= 20 km/h.", diff: "Medium", cat: "Speed", reward: 400, rewardGov: 0, rarity: "RARE" },
  { id: 12, name: "Jet Runner", logic: "Max speed >= 25 km/h.", diff: "Hard", cat: "Speed", reward: 600, rewardGov: 0, rarity: "EPIC" },
  { id: 13, name: "Fast Feet", logic: "Avg speed >= 12 km/h for 2km.", diff: "Medium", cat: "Speed", reward: 300, rewardGov: 0, rarity: "RARE" },
  { id: 14, name: "Lightning Pace", logic: "Avg speed >= 15 km/h for 1km.", diff: "Hard", cat: "Speed", reward: 500, rewardGov: 0, rarity: "EPIC" },
  { id: 15, name: "Endurance Speedster", logic: "Avg speed >= 10 km/h for 10km.", diff: "Hard", cat: "Speed", reward: 500, rewardGov: 0, rarity: "EPIC" },
  { id: 16, name: "Royal Pace", logic: "Avg pace <= 5:00 min/km for 5km.", diff: "Hard", cat: "Speed", reward: 500, rewardGov: 0, rarity: "EPIC" },
  { id: 17, name: "Negative Split Master", logic: "Second half faster than first.", diff: "Medium", cat: "Technical", reward: 400, rewardGov: 0, rarity: "RARE" },
  { id: 18, name: "Hill Crusher", logic: "Elevation gain >= 150m.", diff: "Medium", cat: "Technical", reward: 400, rewardGov: 0, rarity: "RARE" },
  { id: 19, name: "Hill Beast", logic: "Elevation gain >= 500m.", diff: "Hard", cat: "Technical", reward: 800, rewardGov: 0, rarity: "EPIC" },
  { id: 20, name: "Climbing King", logic: "Elevation gain >= 1000m.", diff: "Expert", cat: "Technical", reward: 1500, rewardGov: 5, rarity: "LEGENDARY" },
  { id: 21, name: "Morning Runner", logic: "Run between 05:00 - 07:00.", diff: "Easy", cat: "TimeOfDay", reward: 200, rewardGov: 0, rarity: "COMMON" },
  { id: 22, name: "Sunrise Sprinter", logic: "Run between 04:30 - 05:30.", diff: "Easy", cat: "TimeOfDay", reward: 150, rewardGov: 0, rarity: "COMMON" },
  { id: 23, name: "Lunch Break Runner", logic: "Run between 12:00 - 14:00.", diff: "Medium", cat: "TimeOfDay", reward: 300, rewardGov: 0, rarity: "RARE" },
  { id: 24, name: "Evening Jogger", logic: "Run between 18:00 - 20:00.", diff: "Medium", cat: "TimeOfDay", reward: 300, rewardGov: 0, rarity: "RARE" },
  { id: 25, name: "Night Owl", logic: "Run between 22:00 - 02:00.", diff: "Medium", cat: "TimeOfDay", reward: 300, rewardGov: 0, rarity: "RARE" },
  { id: 26, name: "Midnight Breaker", logic: "Run after 00:00.", diff: "Easy", cat: "TimeOfDay", reward: 150, rewardGov: 0, rarity: "COMMON" },
  { id: 27, name: "Twilight Runner", logic: "Run during sunset.", diff: "Easy", cat: "TimeOfDay", reward: 150, rewardGov: 0, rarity: "COMMON" },
  { id: 28, name: "Early Bird", logic: "Run before 06:00.", diff: "Hard", cat: "TimeOfDay", reward: 600, rewardGov: 0, rarity: "EPIC" },
  { id: 29, name: "Night Assassin", logic: "Conquer zone at night.", diff: "Hard", cat: "Zone", reward: 750, rewardGov: 5, rarity: "EPIC" },
  { id: 30, name: "24H Athlete", logic: "Run at 24 different hours.", diff: "Expert", cat: "Streak", reward: 2000, rewardGov: 10, rarity: "LEGENDARY" },
  { id: 31, name: "Consistency I", logic: "Run 3 consecutive days.", diff: "Easy", cat: "Streak", reward: 150, rewardGov: 0, rarity: "COMMON" },
  { id: 32, name: "Consistency II", logic: "Run 7 consecutive days.", diff: "Medium", cat: "Streak", reward: 350, rewardGov: 0, rarity: "RARE" },
  { id: 33, name: "Consistency III", logic: "Run 14 consecutive days.", diff: "Hard", cat: "Streak", reward: 700, rewardGov: 0, rarity: "EPIC" },
  { id: 34, name: "Consistency IV", logic: "Run 30 consecutive days.", diff: "Expert", cat: "Streak", reward: 1500, rewardGov: 5, rarity: "LEGENDARY" },
  { id: 35, name: "Weekend Warrior", logic: "Run Sat & Sun for 4 weeks.", diff: "Medium", cat: "Streak", reward: 400, rewardGov: 0, rarity: "RARE" },
  { id: 36, name: "Monday Booster", logic: "Run every Monday for 8 weeks.", diff: "Hard", cat: "Streak", reward: 600, rewardGov: 0, rarity: "EPIC" },
  { id: 37, name: "365 Runner", logic: "Run 200 days in a year.", diff: "Expert", cat: "Streak", reward: 2500, rewardGov: 10, rarity: "LEGENDARY" },
  { id: 38, name: "Month Master", logic: "20 runs in a month.", diff: "Medium", cat: "Streak", reward: 400, rewardGov: 0, rarity: "RARE" },
  { id: 39, name: "Daily Discipline", logic: "Run 50 distinct days.", diff: "Hard", cat: "Streak", reward: 600, rewardGov: 0, rarity: "EPIC" },
  { id: 40, name: "Relentless", logic: "Consistent running for 60 days.", diff: "Expert", cat: "Streak", reward: 1500, rewardGov: 5, rarity: "LEGENDARY" },
  { id: 41, name: "Zone Explorer I", logic: "Enter 10 distinct zones.", diff: "Easy", cat: "Zone", reward: 200, rewardGov: 0, rarity: "COMMON" },
  { id: 42, name: "Zone Explorer II", logic: "Enter 25 distinct zones.", diff: "Medium", cat: "Zone", reward: 400, rewardGov: 5, rarity: "RARE" },
  { id: 43, name: "Zone Explorer III", logic: "Enter 50 distinct zones.", diff: "Hard", cat: "Zone", reward: 800, rewardGov: 10, rarity: "EPIC" },
  { id: 44, name: "Zone Explorer IV", logic: "Enter 100 distinct zones.", diff: "Expert", cat: "Zone", reward: 2000, rewardGov: 20, rarity: "LEGENDARY" },
  { id: 45, name: "World Walker", logic: "Visit zones in 3 cities.", diff: "Medium", cat: "Exploration", reward: 500, rewardGov: 5, rarity: "RARE" },
  { id: 46, name: "Globetrotter", logic: "Visit zones in 5 countries.", diff: "Expert", cat: "Exploration", reward: 2500, rewardGov: 25, rarity: "LEGENDARY" },
  { id: 47, name: "Zone Owner I", logic: "Own 1 zone.", diff: "Easy", cat: "Zone", reward: 100, rewardGov: 0, rarity: "COMMON" },
  { id: 48, name: "Zone Owner II", logic: "Own 5 zones.", diff: "Medium", cat: "Zone", reward: 500, rewardGov: 0, rarity: "RARE" },
  { id: 49, name: "Zone Owner III", logic: "Own 10 zones.", diff: "Hard", cat: "Zone", reward: 1000, rewardGov: 5, rarity: "EPIC" },
  { id: 50, name: "Zone Empire", logic: "Own 25 zones.", diff: "Expert", cat: "Zone", reward: 3000, rewardGov: 20, rarity: "LEGENDARY" },
  { id: 51, name: "First Conquest", logic: "First zone conquest.", diff: "Easy", cat: "Zone", reward: 300, rewardGov: 10, rarity: "COMMON" },
  { id: 52, name: "Arch-Conqueror", logic: "Conquer 10 zones.", diff: "Hard", cat: "Zone", reward: 750, rewardGov: 20, rarity: "EPIC" },
  { id: 53, name: "Lord of Lands", logic: "Conquer 25 zones.", diff: "Expert", cat: "Zone", reward: 2000, rewardGov: 50, rarity: "LEGENDARY" },
  { id: 54, name: "100% Takeover", logic: "Double the zone record.", diff: "Expert", cat: "Zone", reward: 1000, rewardGov: 5, rarity: "EPIC" },
  { id: 55, name: "Defense Master", logic: "Defend 5 times.", diff: "Hard", cat: "Zone", reward: 600, rewardGov: 5, rarity: "EPIC" },
  { id: 56, name: "Iron Defense", logic: "Hold zone 30 days.", diff: "Medium", cat: "Zone", reward: 400, rewardGov: 0, rarity: "RARE" },
  { id: 57, name: "Fortress Lord", logic: "Hold zone 90 days.", diff: "Hard", cat: "Zone", reward: 1000, rewardGov: 5, rarity: "EPIC" },
  { id: 58, name: "Comeback King", logic: "Re-conquer lost zone.", diff: "Medium", cat: "Zone", reward: 300, rewardGov: 0, rarity: "RARE" },
  { id: 59, name: "Zone Combo", logic: "Conquer 2 zones in 1 day.", diff: "Medium", cat: "Zone", reward: 400, rewardGov: 0, rarity: "RARE" },
  { id: 60, name: "World Domination", logic: "Conquer 5 zones in 1 week.", diff: "Expert", cat: "Zone", reward: 1500, rewardGov: 20, rarity: "LEGENDARY" },
  { id: 61, name: "Cadence King", logic: "High cadence for 2km.", diff: "Hard", cat: "Technical", reward: 500, rewardGov: 0, rarity: "EPIC" },
  { id: 62, name: "Half Split Master", logic: "Negative split run.", diff: "Medium", cat: "Technical", reward: 300, rewardGov: 0, rarity: "RARE" },
  { id: 63, name: "Interval Runner", logic: "10 sprints.", diff: "Hard", cat: "Training", reward: 500, rewardGov: 0, rarity: "EPIC" },
  { id: 64, name: "Heart Warrior", logic: "Steady HR 10 mins.", diff: "Hard", cat: "Technical", reward: 500, rewardGov: 0, rarity: "EPIC" },
  { id: 65, name: "Cadence Consistency", logic: "Steady cadence 5km.", diff: "Medium", cat: "Technical", reward: 300, rewardGov: 0, rarity: "RARE" },
  { id: 66, name: "Steady Runner", logic: "Steady pace 5km.", diff: "Medium", cat: "Technical", reward: 300, rewardGov: 0, rarity: "RARE" },
  { id: 67, name: "Negative Climber", logic: "More descent than ascent.", diff: "Medium", cat: "Technical", reward: 200, rewardGov: 0, rarity: "RARE" },
  { id: 68, name: "Perfect Pace", logic: "Stable pace 3km.", diff: "Medium", cat: "Technical", reward: 300, rewardGov: 0, rarity: "RARE" },
  { id: 69, name: "Long Breath", logic: "Run 90 mins.", diff: "Hard", cat: "Endurance", reward: 600, rewardGov: 0, rarity: "EPIC" },
  { id: 70, name: "Ultra Focus", logic: "Run 2 hours.", diff: "Expert", cat: "Endurance", reward: 1200, rewardGov: 5, rarity: "LEGENDARY" },
  { id: 71, name: "Rain Runner", logic: "Run in rain.", diff: "Easy", cat: "Special", reward: 200, rewardGov: 0, rarity: "COMMON" },
  { id: 72, name: "Hot Run", logic: "Run in >30°C.", diff: "Medium", cat: "Special", reward: 300, rewardGov: 0, rarity: "RARE" },
  { id: 73, name: "Cold Run", logic: "Run in <0°C.", diff: "Medium", cat: "Special", reward: 300, rewardGov: 0, rarity: "RARE" },
  { id: 74, name: "Holiday Runner", logic: "Run on Holiday.", diff: "Special", cat: "Event", reward: 500, rewardGov: 0, rarity: "EPIC" },
  { id: 75, name: "Birthday Run", logic: "Run on Birthday.", diff: "Special", cat: "Event", reward: 1000, rewardGov: 10, rarity: "EPIC" },
  { id: 76, name: "New Area Pioneer", logic: "Mint new zone.", diff: "Hard", cat: "Zone", reward: 150, rewardGov: 5, rarity: "EPIC" },
  { id: 77, name: "Epic Return", logic: "Run after 30 days.", diff: "Easy", cat: "Special", reward: 100, rewardGov: 0, rarity: "COMMON" },
  { id: 78, name: "Perfect Loop", logic: "Start/End same spot.", diff: "Medium", cat: "Technical", reward: 200, rewardGov: 0, rarity: "RARE" },
  { id: 79, name: "Straight Arrow", logic: "1km straight line.", diff: "Medium", cat: "Technical", reward: 200, rewardGov: 0, rarity: "RARE" },
  { id: 80, name: "Zigzag Runner", logic: "20 turns in 1km.", diff: "Hard", cat: "Technical", reward: 400, rewardGov: 0, rarity: "EPIC" },
  { id: 81, name: "Park Lover", logic: "2km in park.", diff: "Easy", cat: "Exploration", reward: 150, rewardGov: 0, rarity: "COMMON" },
  { id: 82, name: "Bridge Crossover", logic: "Cross a bridge.", diff: "Medium", cat: "Exploration", reward: 200, rewardGov: 0, rarity: "RARE" },
  { id: 83, name: "Waterfront Runner", logic: "1km by water.", diff: "Medium", cat: "Exploration", reward: 200, rewardGov: 0, rarity: "RARE" },
  { id: 84, name: "Hilltop Touch", logic: "Reach high point.", diff: "Hard", cat: "Exploration", reward: 600, rewardGov: 0, rarity: "EPIC" },
  { id: 85, name: "Historic Path", logic: "Historic zone.", diff: "Easy", cat: "Exploration", reward: 150, rewardGov: 0, rarity: "COMMON" },
  { id: 86, name: "Coastal Runner", logic: "1km by coast.", diff: "Medium", cat: "Exploration", reward: 250, rewardGov: 0, rarity: "RARE" },
  { id: 87, name: "Trail Beginner", logic: "2km trail.", diff: "Easy", cat: "Exploration", reward: 150, rewardGov: 0, rarity: "COMMON" },
  { id: 88, name: "Trail Master", logic: "10km trail.", diff: "Hard", cat: "Exploration", reward: 500, rewardGov: 0, rarity: "EPIC" },
  { id: 89, name: "City Explorer", logic: "5km urban.", diff: "Easy", cat: "Exploration", reward: 150, rewardGov: 0, rarity: "COMMON" },
  { id: 90, name: "Forest Runner", logic: "1km forest.", diff: "Medium", cat: "Exploration", reward: 250, rewardGov: 0, rarity: "RARE" },
  { id: 91, name: "Social Sync", logic: "Connect App.", diff: "Easy", cat: "Social", reward: 100, rewardGov: 0, rarity: "COMMON" },
  { id: 92, name: "Media Writer", logic: "Add descriptions.", diff: "Easy", cat: "Social", reward: 150, rewardGov: 0, rarity: "COMMON" },
  { id: 93, name: "Photo Runner", logic: "Upload 10 photos.", diff: "Medium", cat: "Social", reward: 300, rewardGov: 0, rarity: "RARE" },
  { id: 94, name: "Sharer", logic: "Share run.", diff: "Easy", cat: "Social", reward: 100, rewardGov: 0, rarity: "COMMON" },
  { id: 95, name: "Completionist", logic: "20 missions.", diff: "Hard", cat: "Meta", reward: 1000, rewardGov: 5, rarity: "EPIC" },
  { id: 96, name: "Collector", logic: "20 badges.", diff: "Medium", cat: "Meta", reward: 500, rewardGov: 5, rarity: "RARE" },
  { id: 97, name: "Hardcore Collector", logic: "50 badges.", diff: "Hard", cat: "Meta", reward: 1500, rewardGov: 10, rarity: "EPIC" },
  { id: 98, name: "OG Runner", logic: "First month.", diff: "Special", cat: "Event", reward: 500, rewardGov: 5, rarity: "EPIC" },
  { id: 99, name: "Beta Veteran", logic: "Beta tester.", diff: "Special", cat: "Event", reward: 500, rewardGov: 5, rarity: "EPIC" },
  { id: 100, name: "Legendary Runner", logic: "10 Epic/Expert badges.", diff: "Expert", cat: "Meta", reward: 2500, rewardGov: 50, rarity: "LEGENDARY" }
];

const getCategoryIcon = (cat: string) => {
    switch(cat) {
        case 'Distance': return 'Footprints';
        case 'Speed': return 'Zap';
        case 'Technical': return 'Mountain';
        case 'TimeOfDay': return 'Clock';
        case 'Zone': return 'Map';
        case 'Streak': return 'Flame';
        case 'Exploration': return 'Globe';
        case 'Social': return 'Users';
        case 'Meta': return 'Trophy';
        case 'Event': return 'Calendar';
        case 'Training': return 'Timer';
        case 'Endurance': return 'Battery';
        case 'Economy': return 'Coins';
        default: return 'Award';
    }
};

const NEW_MISSIONS: Mission[] = PDF_DATA.map(a => ({
    id: `m_${a.id}`,
    logicId: a.id,
    title: a.name,
    description: a.logic,
    rewardRun: a.reward,
    rewardGov: a.rewardGov,
    category: a.cat as AchievementCategory,
    difficulty: a.diff as Difficulty,
    rarity: a.rarity as Rarity
}));

const NEW_BADGES: Badge[] = PDF_DATA.map(a => ({
    id: `b_${a.id}`,
    logicId: a.id,
    name: a.name,
    description: a.logic,
    icon: getCategoryIcon(a.cat),
    rewardRun: a.reward,
    rewardGov: a.rewardGov,
    category: a.cat as AchievementCategory,
    difficulty: a.diff as Difficulty,
    rarity: a.rarity as Rarity
}));

// --- EXPORT ONLY NEW DATA ---
export const MOCK_MISSIONS: Mission[] = NEW_MISSIONS;
export const MOCK_BADGES: Badge[] = NEW_BADGES;

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

const DEFAULT_USER_STATE = {
  runBalance: 0,
  govBalance: 0,
  totalKm: 0,
  isPremium: false,
  inventory: [],
  runHistory: [],
  completedMissionIds: [],
  earnedBadgeIds: [],
  favoriteBadgeId: undefined
};

// INITIAL USER - PRE-FILLED FOR DEMO
export const INITIAL_USER: User = {
  id: 'user_1',
  name: 'RunnerOne',
  email: 'runner.one@zonerun.eth',
  avatar: 'https://picsum.photos/seed/u1/200',
  favoriteBadgeId: 'b_1', // First 10K Badge
  ...DEFAULT_USER_STATE,
  runBalance: 2500.50,
  govBalance: 50.00,
  totalKm: 450,
  // Completed New Missions (m_1 = First 10K, m_2 = First 50K, m_47 = Zone Owner I)
  completedMissionIds: ['m_1', 'm_2', 'm_21', 'm_47', 'm_51'],
  // Earned New Badges
  earnedBadgeIds: ['b_1', 'b_2', 'b_21', 'b_47', 'b_51', 'b_11', 'b_18', 'b_31'],
  
  runHistory: [
    { id: 'run_init_1', location: 'Parco Sempione, Milan - IT', km: 5.5, timestamp: Date.now() - 86400000, runEarned: 55, duration: 30, elevation: 20, maxSpeed: 12, avgSpeed: 11 },
    { id: 'run_init_2', location: 'Duomo, Milan - IT', km: 3.2, timestamp: Date.now() - 172800000, runEarned: 32, duration: 20, elevation: 10, maxSpeed: 10, avgSpeed: 9.6 },
    { id: 'run_fake_1', location: 'Central Park, NY - US', km: 8.5, timestamp: Date.now() - 259200000, runEarned: 85, govEarned: 5, duration: 45, elevation: 150, maxSpeed: 14, avgSpeed: 11.3 }, 
    { id: 'run_fake_2', location: 'Hyde Park, London - UK', km: 6.0, timestamp: Date.now() - 345600000, runEarned: 60, duration: 35, elevation: 30, maxSpeed: 11, avgSpeed: 10.2 },
    { id: 'run_fake_3', location: 'San Siro, Milan - IT', km: 10.2, timestamp: Date.now() - 432000000, runEarned: 102, govEarned: 10, duration: 55, elevation: 40, maxSpeed: 21, avgSpeed: 11.1 },
    { id: 'run_fake_4', location: 'Shibuya, Tokyo - JP', km: 4.5, timestamp: Date.now() - 518400000, runEarned: 45, duration: 25, elevation: 15, maxSpeed: 10, avgSpeed: 10.8 },
    { id: 'run_fake_5', location: 'Brooklyn Bridge, NY - US', km: 7.1, timestamp: Date.now() - 604800000, runEarned: 71, duration: 40, elevation: 20, maxSpeed: 12, avgSpeed: 10.6 },
    { id: 'run_fake_6', location: 'Porta Romana, Milan - IT', km: 3.8, timestamp: Date.now() - 691200000, runEarned: 38, duration: 22, elevation: 10, maxSpeed: 9, avgSpeed: 10.3 },
    { id: 'run_fake_7', location: 'Camden Town, London - UK', km: 5.9, timestamp: Date.now() - 777600000, runEarned: 59, duration: 32, elevation: 25, maxSpeed: 11, avgSpeed: 11.0 },
    { id: 'run_fake_8', location: 'Roppongi, Tokyo - JP', km: 6.5, timestamp: Date.now() - 864000000, runEarned: 65, govEarned: 5, duration: 38, elevation: 30, maxSpeed: 13, avgSpeed: 10.2 },
    { id: 'run_fake_9', location: 'City Life, Milan - IT', km: 12.0, timestamp: Date.now() - 950400000, runEarned: 120, duration: 65, elevation: 50, maxSpeed: 12, avgSpeed: 11.0 },
    { id: 'run_fake_10', location: 'Times Square, NY - US', km: 4.0, timestamp: Date.now() - 1036800000, runEarned: 40, duration: 24, elevation: 10, maxSpeed: 10, avgSpeed: 10.0 }
  ],
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
    }
  ]
};