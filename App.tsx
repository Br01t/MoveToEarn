
import React, { useState, useEffect, useRef } from "react";
import Navbar from "./components/Navbar";
import LandingPage from "./components/LandingPage";
import Dashboard from "./components/Dashboard";
import Marketplace from "./components/Marketplace";
import Wallet from "./components/Wallet";
import Inventory from "./components/Inventory";
import Leaderboard from "./components/Leaderboard";
import Profile from "./components/Profile";
import Admin from "./components/Admin";
import Footer from "./components/Footer";
import Missions from "./components/Missions";
import GameRules from "./components/pages/GameRules";
import HowToPlay from "./components/pages/HowToPlay";
import Privacy from "./components/pages/Privacy";
import Terms from "./components/pages/Terms";
import Community from "./components/pages/Community";
import AchievementModal from "./components/AchievementModal";
import ZoneDiscoveryModal from "./components/ZoneDiscoveryModal";
import RunSummaryModal from "./components/RunSummaryModal";
import { User, Zone, Item, ViewState, InventoryItem, Mission, Badge, RunEntry, RunAnalysisData } from "./types";
import {
  MOCK_ZONES,
  INITIAL_USER,
  MOCK_USERS,
  MOCK_ITEMS,
  MINT_COST,
  MINT_REWARD_GOV,
  CONQUEST_REWARD_GOV,
  PREMIUM_COST,
  MOCK_MISSIONS,
  MOCK_BADGES,
} from "./constants";
import { Layers, CheckCircle } from "lucide-react";
import { LanguageProvider, useLanguage } from "./LanguageContext";

// --- GEOSPATIAL MATH HELPERS ---

const R = 6371; // Radius of the earth in km
const deg2rad = (deg: number) => deg * (Math.PI / 180);
const rad2deg = (rad: number) => rad * (180 / Math.PI);

// Calculate distance between two lat/lng points
const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; 
  return d;
};

// Calculate Bearing (Direction) from Point A to Point B (0-360 degrees)
const getBearing = (startLat: number, startLng: number, destLat: number, destLng: number) => {
  const startLatRad = deg2rad(startLat);
  const startLngRad = deg2rad(startLng);
  const destLatRad = deg2rad(destLat);
  const destLngRad = deg2rad(destLng);

  const y = Math.sin(destLngRad - startLngRad) * Math.cos(destLatRad);
  const x = Math.cos(startLatRad) * Math.sin(destLatRad) -
            Math.sin(startLatRad) * Math.cos(destLatRad) * Math.cos(destLngRad - startLngRad);
  const brng = Math.atan2(y, x);
  return (rad2deg(brng) + 360) % 360;
};

// --- HEX GRID MATH ---

// Axial Hex Directions (Pointy Topped)
// 0: East, 1: SouthEast, 2: SouthWest, 3: West, 4: NorthWest, 5: NorthEast
const HEX_DIRECTIONS = [
    { q: 1, r: 0 },   // 0: East
    { q: 0, r: 1 },   // 1: SouthEast
    { q: -1, r: 1 },  // 2: SouthWest
    { q: -1, r: 0 },  // 3: West
    { q: 0, r: -1 },  // 4: NorthWest
    { q: 1, r: -1 }   // 5: NorthEast
];

// Map 0-360 bearing to 0-5 Hex Direction Index
const bearingToHexDirection = (bearing: number) => {
    if (bearing >= 0 && bearing < 60) return 5; // NE
    if (bearing >= 60 && bearing < 120) return 0; // E
    if (bearing >= 120 && bearing < 180) return 1; // SE
    if (bearing >= 180 && bearing < 240) return 2; // SW
    if (bearing >= 240 && bearing < 300) return 3; // W
    return 4; // NW
};


const AppContent: React.FC = () => {
  const { t } = useLanguage();
  // --- Game State ---
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>("LANDING");
  const [zones, setZones] = useState<Zone[]>(MOCK_ZONES);
  const [usersMock, setUsersMock] = useState(MOCK_USERS);
  const [marketItems, setMarketItems] = useState<Item[]>(MOCK_ITEMS);

  // Missions & Badges State
  const [missions, setMissions] = useState<Mission[]>(MOCK_MISSIONS);
  const [badges, setBadges] = useState<Badge[]>(MOCK_BADGES);

  // --- Achievement Notification Queue ---
  const [achievementQueue, setAchievementQueue] = useState<{ type: 'MISSION' | 'BADGE'; item: Mission | Badge }[]>([]);
  
  // --- Claim All Summary Popup State ---
  const [claimSummary, setClaimSummary] = useState<{ count: number; totalRun: number } | null>(null);

  // --- Zone Discovery Queue (Replacing Alerts) ---
  const [zoneCreationQueue, setZoneCreationQueue] = useState<{
    lat: number;
    lng: number;
    defaultName: string;
    type: 'START' | 'END';
  }[]>([]);
  
  // --- Run Summary Modal State ---
  const [runSummary, setRunSummary] = useState<{
      totalKm: number;
      duration: number;
      runEarned: number;
      involvedZoneNames: string[];
      isReinforced: boolean;
  } | null>(null);
  
  // Temp state to hold run analysis while processing zone modals
  const [pendingRunData, setPendingRunData] = useState<RunAnalysisData | null>(null);
  
  // Ref to track zones created during this session (to maintain adjacency reference AND ensure split logic works)
  const sessionCreatedZonesRef = useRef<Zone[]>([]);

  // --- Actions ---

  const handleLogin = () => {
    setTimeout(() => {
      setUser(INITIAL_USER);
      setCurrentView("DASHBOARD");
    }, 800);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView("LANDING");
  };

  const handleUpdateUser = (updates: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  };

  // HELPER: Find a valid Hex position based on a reference zone and target coordinates
  const calculateHexPosition = (referenceZone: Zone | null, targetLat: number, targetLng: number, countryCode: string, currentZones: Zone[]) => {
      let anchorZone = referenceZone;

      // 1. If no specific reference zone provided, find the best anchor in the same country
      if (!anchorZone) {
          // Filter zones by country to form a cluster
          const clusterZones = currentZones.filter(z => z.name.endsWith(` - ${countryCode}`));
          
          if (clusterZones.length === 0) {
              // CASE: New Country Cluster
              // If the map is completely empty, start at 0,0
              if (currentZones.length === 0) return { x: 0, y: 0 };

              // If other zones exist, start a new cluster far away to avoid overlap
              // We place it to the right of the existing map bounds
              const maxX = Math.max(...currentZones.map(z => z.x));
              // Add a buffer (e.g., 5 hexes) to separate clusters visualy
              return { x: maxX + 5, y: 0 }; 
          }

          // CASE: Existing Country Cluster
          // Find the geographically nearest zone in this cluster to attach to
          let minDist = Infinity;
          clusterZones.forEach(z => {
              const d = getDistanceFromLatLonInKm(targetLat, targetLng, z.lat, z.lng);
              if (d < minDist) {
                  minDist = d;
                  anchorZone = z;
              }
          });
      }

      // Fallback (Should typically be handled by New Cluster logic, but for safety)
      if (!anchorZone) return { x: 0, y: 0 };

      // 2. Calculate Direction
      // Determine bearing from the anchor zone to the new target location
      const bearing = getBearing(anchorZone.lat, anchorZone.lng, targetLat, targetLng);
      const idealDirIndex = bearingToHexDirection(bearing);
      const idealDir = HEX_DIRECTIONS[idealDirIndex];

      // 3. Determine Coordinates
      // Try to place it directly adjacent in the calculated direction
      let proposedX = anchorZone.x + idealDir.q;
      let proposedY = anchorZone.y + idealDir.r;

      // 4. Collision Resolution (Spiral Search)
      // If the ideal spot is taken, find the nearest empty spot spiraling out from the proposed location
      const isOccupied = (x: number, y: number) => currentZones.some(z => z.x === x && z.y === y);

      if (!isOccupied(proposedX, proposedY)) {
          return { x: proposedX, y: proposedY };
      }

      // BFS Spiral to find nearest empty spot
      const queue = [{ x: proposedX, y: proposedY }];
      const visited = new Set([`${proposedX},${proposedY}`]);
      let safeGuard = 0;
      
      while (queue.length > 0 && safeGuard < 500) {
          const current = queue.shift()!;
          safeGuard++;

          for (const dir of HEX_DIRECTIONS) {
              const nx = current.x + dir.q;
              const ny = current.y + dir.r;
              const key = `${nx},${ny}`;

              if (!visited.has(key)) {
                  visited.add(key);
                  if (!isOccupied(nx, ny)) {
                      return { x: nx, y: ny };
                  }
                  queue.push({ x: nx, y: ny });
              }
          }
      }
      
      // Ultimate fallback if map is incredibly dense
      return { x: proposedX + 10, y: proposedY + 10 };
  };

  const handleSyncRun = (data: RunAnalysisData) => {
    if (!user) return;
    const { totalKm, startPoint, endPoint } = data;
    
    console.log("🚀 [SYNC] Received Validated Run Data:", data);

    // Check existing zones
    let startZone = zones.find(z => getDistanceFromLatLonInKm(startPoint.lat, startPoint.lng, z.lat, z.lng) < 1.0);
    let endZone = zones.find(z => getDistanceFromLatLonInKm(endPoint.lat, endPoint.lng, z.lat, z.lng) < 1.0);

    if (startZone) console.log(`📍 [SYNC] Start Point matches existing zone: ${startZone.name}`);
    if (endZone) console.log(`📍 [SYNC] End Point matches existing zone: ${endZone.name}`);

    // Prepare Queue for Potential New Zones
    const zonesToCreate: { lat: number; lng: number; defaultName: string; type: 'START' | 'END' }[] = [];

    // Check Start Point for Minting
    if (!startZone) {
        console.log("🆕 [SYNC] Start Point eligible for New Zone.");
        zonesToCreate.push({
            lat: startPoint.lat,
            lng: startPoint.lng,
            defaultName: `New Zone ${Math.floor(startPoint.lat*100)},${Math.floor(startPoint.lng*100)}`,
            type: 'START'
        });
    }

    // Check End Point for Minting (if distinct)
    const distStartEnd = getDistanceFromLatLonInKm(startPoint.lat, startPoint.lng, endPoint.lat, endPoint.lng);
    if (!endZone && distStartEnd > 1.0) {
        console.log(`🆕 [SYNC] End Point eligible for New Zone (Dist from Start: ${distStartEnd.toFixed(2)}km).`);
        zonesToCreate.push({
             lat: endPoint.lat,
             lng: endPoint.lng,
             defaultName: `New Zone ${Math.floor(endPoint.lat*100)},${Math.floor(endPoint.lng*100)}`,
             type: 'END'
        });
    }

    setPendingRunData(data);
    sessionCreatedZonesRef.current = []; // Reset session tracking
    
    if (zonesToCreate.length > 0) {
        // Start the modal flow
        console.log("🛠️ [SYNC] Starting Zone Creation Queue:", zonesToCreate.length);
        setZoneCreationQueue(zonesToCreate);
    } else {
        // No new zones, process run immediately
        finalizeRunProcessing(data, user, zones);
    }
  };

  // Called when user Confirms Minting in Modal
  const handleZoneConfirm = (customName: string) => {
      if (!user || !pendingRunData) return;
      
      const pendingZone = zoneCreationQueue[0];
      
      // Logic: If name already has a country code (e.g. "My Zone - IT"), preserve it.
      // Otherwise, append " - XX" (or we could default to XX)
      const hasCountryCode = / - [A-Z]{2}$/.test(customName);
      const finalName = hasCountryCode ? customName : `${customName} - XX`;

      // Check Funds
      if (user.runBalance < MINT_COST) {
          alert(t('alert.insufficient_run'));
          return; 
      }

      // Logic to determine Reference Zone for adjacency
      let referenceZone: Zone | null = null;
      if (pendingZone.type === 'END' && sessionCreatedZonesRef.current.length > 0) {
          referenceZone = sessionCreatedZonesRef.current[0];
      }

      const currentAllZones = [...zones, ...sessionCreatedZonesRef.current];
      
      const hexPos = calculateHexPosition(
          referenceZone, 
          pendingZone.lat, 
          pendingZone.lng, 
          "XX", // Placeholder country code logic
          currentAllZones
      );

      const newZone: Zone = {
          id: `z_${Date.now()}_${pendingZone.type}`,
          x: hexPos.x,
          y: hexPos.y,
          lat: pendingZone.lat,
          lng: pendingZone.lng,
          ownerId: user.id,
          name: finalName,
          defenseLevel: 1,
          recordKm: pendingRunData.totalKm, 
          interestRate: 2.0
      };

      // Update State
      const updatedUser = { 
          ...user, 
          runBalance: user.runBalance - MINT_COST,
          govBalance: user.govBalance + MINT_REWARD_GOV 
      };
      
      // Update local tracking (Ref ensures immediate availability for next step in queue)
      sessionCreatedZonesRef.current.push(newZone);
      console.log(`✨ [ZONE MINT] Created new zone: ${newZone.name} (Type: ${pendingZone.type})`);
      
      setUser(updatedUser);
      setZones(prev => [...prev, newZone]); // Add to map immediately

      // Proceed to next or finish
      handleNextInQueue(updatedUser, [...zones, newZone]);
  };

  // Called when user Discards in Modal
  const handleZoneDiscard = () => {
      if (!user) return;
      handleNextInQueue(user, zones);
  };

  const handleNextInQueue = (currentUser: User, currentZones: Zone[]) => {
      const nextQueue = zoneCreationQueue.slice(1);
      setZoneCreationQueue(nextQueue);

      if (nextQueue.length === 0 && pendingRunData) {
          // All done, finalize run history
          finalizeRunProcessing(pendingRunData, currentUser, currentZones);
      }
  };

  const finalizeRunProcessing = (data: RunAnalysisData, currentUser: User, currentZones: Zone[]) => {
      console.log("🏁 [FINALIZE] Starting final run processing...");
      const { totalKm, startPoint, endPoint } = data;

      // MERGE: Ensure we have a complete list of zones including those just created in session refs
      // This protects against stale state closures.
      const allZonesMap = new Map<string, Zone>();
      currentZones.forEach(z => allZonesMap.set(z.id, z));
      sessionCreatedZonesRef.current.forEach(z => allZonesMap.set(z.id, z));
      
      // Use the merged map as the source of truth for updates
      const fullZoneList = Array.from(allZonesMap.values());
      console.log(`🗺️ [FINALIZE] Merged Zone List Size: ${fullZoneList.length} (Session Created: ${sessionCreatedZonesRef.current.length})`);

      // 1. Identify Zones (using geospatial distance)
      const startZone = fullZoneList.find(z => getDistanceFromLatLonInKm(startPoint.lat, startPoint.lng, z.lat, z.lng) < 1.0);
      const endZone = fullZoneList.find(z => getDistanceFromLatLonInKm(endPoint.lat, endPoint.lng, z.lat, z.lng) < 1.0);

      console.log("🔍 [FINALIZE] Found Start Zone:", startZone?.name || "None");
      console.log("🔍 [FINALIZE] Found End Zone:", endZone?.name || "None");

      // 2. Determine involved zones for splitting
      const involvedZones: Zone[] = [];
      if (startZone) involvedZones.push(startZone);
      if (endZone && (!startZone || endZone.id !== startZone.id)) involvedZones.push(endZone);

      const zoneCount = involvedZones.length;
      const kmPerZone = zoneCount > 0 ? totalKm / zoneCount : 0;
      
      console.log("🔗 [FINALIZE] Involved Zones:", involvedZones.map(z => z.name));
      console.log("➗ [FINALIZE] Split Logic:", { totalKm, zoneCount, kmPerZone });

      let totalRunEarned = 0;
      let isReinforced = false;
      const involvedZoneNames: string[] = [];

      // Create update list from fullZoneList to ensure we don't miss new zones
      const zoneUpdates = fullZoneList.map(z => ({...z}));

      if (zoneCount === 0) {
          // Wilderness Run (No zones)
          totalRunEarned = totalKm * 10;
          involvedZoneNames.push("Wilderness Run");
          console.log("🌲 [FINALIZE] Wilderness Run (No Zones involved).");
      } else {
          // Split logic: Divide KM and Rewards among involved zones
          involvedZones.forEach(invZone => {
              involvedZoneNames.push(invZone.name);
              
              // Calculate Reward for this segment (10 RUN per km)
              const segmentReward = kmPerZone * 10;
              totalRunEarned += segmentReward;

              console.log(`💰 [REWARD] Distributing to ${invZone.name}: ${kmPerZone.toFixed(2)}km -> ${segmentReward.toFixed(2)} RUN`);

              // Find in update list and update recordKm
              const idx = zoneUpdates.findIndex(z => z.id === invZone.id);
              if (idx !== -1) {
                  const targetZone = zoneUpdates[idx];
                  // Update Record if Owner
                  if (targetZone.ownerId === currentUser.id) {
                      zoneUpdates[idx] = {
                          ...targetZone,
                          recordKm: targetZone.recordKm + kmPerZone
                      };
                      isReinforced = true;
                      console.log(`💪 [REINFORCE] Updated zone record for owner.`);
                  }
              }
          });
      }

      // History Entry Name
      const locationName = involvedZoneNames.length > 0 ? involvedZoneNames[0] : "Wilderness";

      const newRun: RunEntry = {
          id: `run_${Date.now()}`,
          location: locationName,
          km: totalKm,
          timestamp: Date.now(),
          runEarned: totalRunEarned,
          duration: data.durationMinutes,
          elevation: data.elevation,
          maxSpeed: data.maxSpeed,
          avgSpeed: data.avgSpeed
      };

      const finalUser = {
          ...currentUser,
          runHistory: [newRun, ...currentUser.runHistory],
          runBalance: currentUser.runBalance + totalRunEarned,
          totalKm: currentUser.totalKm + totalKm
      };

      setZones(zoneUpdates);
      setUser(finalUser);
      setPendingRunData(null);
      sessionCreatedZonesRef.current = []; // Clear ref

      setRunSummary({
          totalKm,
          duration: data.durationMinutes,
          runEarned: totalRunEarned,
          involvedZoneNames: involvedZoneNames,
          isReinforced: isReinforced
      });
  };


  const handleClaimZone = (zoneId: string) => {
    if (!user) return;
    const targetZone = zones.find((z) => z.id === zoneId);
    if (!targetZone) return;

    if (targetZone.shieldExpiresAt && targetZone.shieldExpiresAt > Date.now()) {
      alert(t('alert.zone_shielded'));
      return;
    }
    if (user.runBalance < 50) {
      alert(t('alert.insufficient_run'));
      return;
    }
    
    if (window.confirm(t('alert.claim_confirm'))) {
      setZones((prev) =>
        prev.map((z) =>
          z.id === zoneId ? { ...z, ownerId: user.id, shieldExpiresAt: undefined, boostExpiresAt: undefined } : z
        )
      );
      setUser((prev) => (prev ? { ...prev, runBalance: prev.runBalance - 50, govBalance: prev.govBalance + CONQUEST_REWARD_GOV } : null));
      alert(`${t('alert.zone_claimed')} +${CONQUEST_REWARD_GOV} GOV.`);
    }
  };

  const handleBoostZone = (zoneId: string) => {
    if (!user) return;
    const boostItem = user.inventory.find((i) => i.type === "BOOST");
    if (!boostItem) {
      alert(t('alert.need_item') + " Boost.");
      return;
    }
    if (window.confirm(`${t('alert.use_item_confirm')} '${boostItem.name}'?`)) handleUseItem(boostItem, zoneId);
  };

  const handleDefendZone = (zoneId: string) => {
    if (!user) return;
    const defenseItem = user.inventory.find((i) => i.type === "DEFENSE");
    if (!defenseItem) {
      alert(t('alert.need_item') + " Defense.");
      return;
    }
    if (window.confirm(`${t('alert.use_item_confirm')} '${defenseItem.name}'?`)) handleUseItem(defenseItem, zoneId);
  };

  const handleBuyItem = (item: Item) => {
    if (!user) return;
    if (item.quantity <= 0) {
      alert("Out of stock!");
      return;
    }
    if (user.runBalance < item.priceRun) {
      alert(t('alert.insufficient_run'));
      return;
    }

    setMarketItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i)));

    if (item.type === "CURRENCY") {
      setUser((prev) => (prev ? { ...prev, runBalance: prev.runBalance - item.priceRun, govBalance: prev.govBalance + item.effectValue } : null));
      alert(`${t('alert.purchased')} +${item.effectValue} GOV`);
      return;
    }

    const newItem: InventoryItem = { ...item, quantity: 1 };
    const existingIdx = user.inventory.findIndex((i) => i.id === item.id);
    let newInventory = [...user.inventory];
    if (existingIdx >= 0) newInventory[existingIdx].quantity += 1;
    else newInventory.push(newItem);

    setUser((prev) => (prev ? { ...prev, runBalance: prev.runBalance - item.priceRun, inventory: newInventory } : null));
  };

  const handleUseItem = (item: InventoryItem, targetZoneId: string) => {
    if (!user) return;
    const zoneIndex = zones.findIndex((z) => z.id === targetZoneId);
    if (zoneIndex === -1) return;
    const targetZone = zones[zoneIndex];
    let updatedZones = [...zones];

    if (item.type === "DEFENSE") {
      updatedZones[zoneIndex] = { ...targetZone, defenseLevel: targetZone.defenseLevel + item.effectValue, shieldExpiresAt: Date.now() + 86400000 };
    } else if (item.type === "BOOST") {
      updatedZones[zoneIndex] = { ...targetZone, interestRate: targetZone.interestRate + item.effectValue, boostExpiresAt: Date.now() + 86400000 };
    }
    setZones(updatedZones);
    const newInventory = user.inventory.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i)).filter((i) => i.quantity > 0);
    setUser((prev) => (prev ? { ...prev, inventory: newInventory } : null));
    alert(`${t('alert.item_used')} ${item.name} -> "${targetZone.name}".`);
  };

  const handleBuyFiat = (amountUSD: number) => {
    if (!user) return;
    const govAmount = amountUSD * 10;
    setUser((prev) => (prev ? { ...prev, govBalance: prev.govBalance + govAmount } : null));
    alert(`Payment Successful! +${govAmount} GOV.`);
  };

  const handleUpgradePremium = () => {
    if (!user) return;
    if (user.govBalance < PREMIUM_COST) {
      alert(`Need ${PREMIUM_COST} GOV.`);
      return;
    }
    if (window.confirm(`Upgrade for ${PREMIUM_COST} GOV?`)) {
      setUser((prev) => (prev ? { ...prev, govBalance: prev.govBalance - PREMIUM_COST, isPremium: true } : null));
      alert(t('alert.upgraded'));
    }
  };

  // --- Admin Actions ---
  const handleAddItem = (item: Item) => setMarketItems((prev) => [...prev, item]);
  const handleUpdateItem = (item: Item) => setMarketItems((prev) => prev.map((i) => (i.id === item.id ? item : i)));
  const handleRemoveItem = (id: string) => setMarketItems((prev) => prev.filter((i) => i.id !== id));

  const handleAddMission = (m: Mission) => setMissions((prev) => [...prev, m]);
  const handleUpdateMission = (m: Mission) => setMissions((prev) => prev.map((mission) => (mission.id === m.id ? m : mission)));
  const handleRemoveMission = (id: string) => setMissions((prev) => prev.filter((m) => m.id !== id));

  const handleAddBadge = (b: Badge) => setBadges((prev) => [...prev, b]);
  const handleUpdateBadge = (b: Badge) => setBadges((prev) => prev.map((badge) => (badge.id === b.id ? b : badge)));
  const handleRemoveBadge = (id: string) => setBadges((prev) => prev.filter((b) => b.id !== id));

  const handleUpdateZoneName = (zoneId: string, newName: string) => {
    setZones((prev) => prev.map((z) => (z.id === zoneId ? { ...z, name: newName } : z)));
  };

  const handleDeleteZone = (zoneId: string) => {
    setZones((prev) => prev.filter((z) => z.id !== zoneId));
  };

  const handleTriggerBurn = () => alert("Burn Protocol Initiated. 5M RUN burned.");

  const handleDistributeRewards = () => {
    if (!user) return;
    const kmReward = Math.floor(user.totalKm / 5);
    const zoneReward = zones.filter((z) => z.ownerId === user.id).length * 10;
    const totalReward = kmReward + zoneReward;
    if (totalReward > 0) {
      setUser((prev) => (prev ? { ...prev, govBalance: prev.govBalance + totalReward } : null));
      alert(`${t('alert.rewards_dist')} +${totalReward} GOV`);
    } else {
      alert(t('alert.no_rewards'));
    }
  };

  const handleResetSeason = () => {
    if (window.confirm(t('alert.reset_confirm'))) {
      const resetUsers = { ...usersMock };
      Object.keys(resetUsers).forEach((key) => (resetUsers[key].totalKm = 0));
      setUsersMock(resetUsers);
      setUser((prev) => (prev ? { ...prev, totalKm: 0 } : null));
      alert(t('alert.season_reset'));
    }
  };

  // Auto Interest
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      let totalGain = 0;
      zones.forEach((z) => {
        if (z.ownerId === user.id) totalGain += 0.5 * (z.interestRate || 1);
      });
      if (totalGain > 0) setUser((prev) => (prev ? { ...prev, runBalance: prev.runBalance + totalGain } : null));
    }, 10000);
    return () => clearInterval(interval);
  }, [user?.id, zones]);

  // --- AUTOMATED ACHIEVEMENT LOGIC ---

  // Helper: Calculate Max Consecutive Days Streak
  const calculateStreak = (history: RunEntry[]): number => {
      if (history.length === 0) return 0;
      
      // Get unique days from timestamps (ignoring time)
      const days = Array.from(new Set(history.map(run => {
         const d = new Date(run.timestamp);
         d.setHours(0,0,0,0);
         return d.getTime();
      }))).sort((a,b) => b - a); // Descending (newest first)

      if (days.length === 0) return 0;

      let streak = 1;
      const today = new Date();
      today.setHours(0,0,0,0);
      const todayTime = today.getTime();
      const diffSinceLastRun = (todayTime - days[0]) / (1000 * 60 * 60 * 24);

      if (diffSinceLastRun > 1) return 0; // Streak broken

      for (let i = 0; i < days.length - 1; i++) {
          const current = days[i];
          const prev = days[i+1];
          const diffDays = (current - prev) / (1000 * 60 * 60 * 24);
          if (diffDays === 1) {
              streak++;
          } else {
              break;
          }
      }
      return streak;
  };

  // Main Logic Checker
  const checkAchievement = (item: Mission | Badge, currentUser: User, currentZones: Zone[]): boolean => {
      // 1. LEGACY CHECK
      if (item.conditionType === 'TOTAL_KM' && item.conditionValue) {
          return currentUser.totalKm >= item.conditionValue;
      }
      if (item.conditionType === 'OWN_ZONES' && item.conditionValue) {
          const owned = currentZones.filter(z => z.ownerId === currentUser.id).length;
          return owned >= item.conditionValue;
      }

      // 2. NEW LOGIC SYSTEM (Based on logicId 1-100)
      if (!item.logicId) return false;
      const history = currentUser.runHistory;
      const ownedZones = currentZones.filter(z => z.ownerId === currentUser.id);
      
      switch (item.logicId) {
          // --- DISTANCE ---
          case 1: return currentUser.totalKm >= 10;
          case 2: return currentUser.totalKm >= 50;
          case 3: return currentUser.totalKm >= 100;
          case 4: return history.some(r => r.km >= 10.55);
          case 5: return history.some(r => r.km >= 21);
          case 6: return history.some(r => r.km >= 42.195);
          case 7: return history.some(r => r.km >= 50);
          case 8: return currentUser.totalKm >= 160;
          case 9: return currentUser.totalKm >= 500;
          case 10: return currentUser.totalKm >= 1000;
          
          // --- SPEED ---
          case 11: return history.some(r => (r.maxSpeed || 0) >= 20);
          case 12: return history.some(r => (r.maxSpeed || 0) >= 25);
          case 13: return history.some(r => (r.avgSpeed || 0) >= 12 && r.km >= 2);
          case 14: return history.some(r => (r.avgSpeed || 0) >= 15 && r.km >= 1);
          case 15: return history.some(r => (r.avgSpeed || 0) >= 10 && r.km >= 10);
          case 16: return history.some(r => {
             return (r.avgSpeed || 0) >= 12 && r.km >= 5;
          });

          // --- TECHNICAL / ELEVATION ---
          case 18: return history.some(r => (r.elevation || 0) >= 150);
          case 19: return history.some(r => (r.elevation || 0) >= 500);
          case 20: return history.some(r => (r.elevation || 0) >= 1000);
          
          // --- TIME OF DAY ---
          case 21: return history.some(r => { const h = new Date(r.timestamp).getHours(); return h >= 5 && h < 7; });
          case 22: return history.some(r => { 
             const d = new Date(r.timestamp);
             return d.getHours() === 4 && d.getMinutes() >= 30 || d.getHours() === 5 && d.getMinutes() <= 30; 
          });
          case 23: return history.some(r => { const h = new Date(r.timestamp).getHours(); return h >= 12 && h < 14; });
          case 24: return history.some(r => { const h = new Date(r.timestamp).getHours(); return h >= 18 && h < 20; });
          case 25: return history.some(r => { const h = new Date(r.timestamp).getHours(); return h >= 22 || h < 2; });
          case 26: return history.some(r => { const h = new Date(r.timestamp).getHours(); return h === 0; });
          case 28: return history.some(r => { const h = new Date(r.timestamp).getHours(); return h < 6; });
          case 30: return new Set(history.map(r => new Date(r.timestamp).getHours())).size >= 24;

          // --- STREAK ---
          case 31: return calculateStreak(history) >= 3;
          case 32: return calculateStreak(history) >= 7;
          case 33: return calculateStreak(history) >= 14;
          case 34: return calculateStreak(history) >= 30;
          case 37: return new Set(history.map(r => new Date(r.timestamp).toDateString())).size >= 200;
          case 38: 
             // 20 runs in a month (check current month)
             const currentMonthRuns = history.filter(r => {
                 const d = new Date(r.timestamp);
                 const now = new Date();
                 return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
             });
             return currentMonthRuns.length >= 20;
          case 39: return new Set(history.map(r => new Date(r.timestamp).toDateString())).size >= 50;
          case 40: return calculateStreak(history) >= 60;

          // --- ZONE / EXPLORATION ---
          case 41: return new Set(history.map(r => r.location)).size >= 10;
          case 42: return new Set(history.map(r => r.location)).size >= 25;
          case 43: return new Set(history.map(r => r.location)).size >= 50;
          case 44: return new Set(history.map(r => r.location)).size >= 100;
          case 47: return ownedZones.length >= 1;
          case 48: return ownedZones.length >= 5;
          case 49: return ownedZones.length >= 10;
          case 50: return ownedZones.length >= 25;
          case 51: return history.some(r => r.govEarned && r.govEarned >= 10); // Approximation of "Conquest" if govEarned is high
          case 52: return history.filter(r => r.govEarned && r.govEarned >= 10).length >= 10;
          case 53: return history.filter(r => r.govEarned && r.govEarned >= 10).length >= 25;
          
          // --- ENDURANCE ---
          case 69: return history.some(r => (r.duration || 0) >= 90);
          case 70: return history.some(r => (r.duration || 0) >= 120);

          // --- META / COLLECTION ---
          case 95: return currentUser.completedMissionIds.length >= 20;
          case 96: return currentUser.earnedBadgeIds.length >= 20;
          case 97: return currentUser.earnedBadgeIds.length >= 50;
          case 100: 
             const highTierBadges = badges.filter(b => currentUser.earnedBadgeIds.includes(b.id) && (b.rarity === 'EPIC' || b.rarity === 'LEGENDARY'));
             return highTierBadges.length >= 10;

          default: return false;
      }
  };

  // Main Effect to Monitor and Award Achievements
  useEffect(() => {
    if (!user) return;
    
    let newCompletedMissions = [...user.completedMissionIds];
    let newEarnedBadges = [...user.earnedBadgeIds];
    let additionalRun = 0; // Changed to add RUN
    let hasChanges = false;
    
    // Temp queue to hold new unlocks in this cycle
    const newUnlockQueue: { type: 'MISSION' | 'BADGE'; item: Mission | Badge }[] = [];

    // 1. Check Missions
    missions.forEach((m) => {
      // If not already completed
      if (!newCompletedMissions.includes(m.id)) {
        if (checkAchievement(m, user, zones)) {
           newCompletedMissions.push(m.id);
           additionalRun += m.rewardRun; // Award RUN
           hasChanges = true;
           // Add to notification queue
           newUnlockQueue.push({ type: 'MISSION', item: m });
        }
      }
    });

    // 2. Check Badges
    badges.forEach((b) => {
      // If not already earned
      if (!newEarnedBadges.includes(b.id)) {
        if (checkAchievement(b, user, zones)) {
           newEarnedBadges.push(b.id);
           additionalRun += (b.rewardRun || 0); // Award RUN if badge has reward
           hasChanges = true;
           // Add to notification queue
           newUnlockQueue.push({ type: 'BADGE', item: b });
        }
      }
    });

    // 3. Update User State if needed
    if (hasChanges) {
      setUser((prev) =>
        prev
          ? {
              ...prev,
              completedMissionIds: newCompletedMissions,
              earnedBadgeIds: newEarnedBadges,
              runBalance: prev.runBalance + additionalRun, // Update RUN balance
            }
          : null
      );
      
      // Update global notification queue state
      if (newUnlockQueue.length > 0) {
          setAchievementQueue(prev => [...prev, ...newUnlockQueue]);
      }
    }

  }, [user?.totalKm, user?.runHistory, zones, missions, badges, user?.completedMissionIds.length, user?.earnedBadgeIds.length]);

  // Handle closing a modal notification
  const handleCloseNotification = () => {
    setAchievementQueue(prev => prev.slice(1));
  };

  const handleClaimAllNotifications = () => {
      // 1. Calculate totals
      const totalRun = achievementQueue.reduce((acc, entry) => {
          if (entry.type === 'MISSION') return acc + (entry.item as Mission).rewardRun;
          if (entry.type === 'BADGE') return acc + ((entry.item as Badge).rewardRun || 0);
          return acc;
      }, 0);
      const count = achievementQueue.length;

      // 2. Clear Queue
      setAchievementQueue([]);

      // 3. Show Summary
      setClaimSummary({ count, totalRun });

      // 4. Auto-hide after 3 seconds
      setTimeout(() => {
          setClaimSummary(null);
      }, 3000);
  };

  // Main Render Logic
  const isLanding = currentView === "LANDING";
  const showNavbar = !isLanding && user; // Only show navbar if logged in and not on landing page

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col">
      {/* Navbar is strictly for logged-in users inside the app */}
      {showNavbar && <Navbar currentView={currentView} onNavigate={setCurrentView} user={user} onLogout={handleLogout} />}

      {/* Main Content Area */}
      <main className={`flex-1 bg-gray-900 relative flex flex-col ${showNavbar ? "pb-16 md:pb-0" : ""}`}>
        <div className="flex-1 relative">
          {isLanding && <LandingPage onLogin={handleLogin} onNavigate={setCurrentView} />}

          {/* Authenticated Routes */}
          {!isLanding && (
            <>
              {currentView === "DASHBOARD" && user && (
                <Dashboard
                  user={user}
                  zones={zones}
                  badges={badges}
                  users={usersMock}
                  onSyncRun={handleSyncRun}
                  onClaim={handleClaimZone}
                  onBoost={handleBoostZone}
                  onDefend={handleDefendZone}
                  onNavigate={setCurrentView}
                />
              )}
              {currentView === "MARKETPLACE" && user && <Marketplace user={user} items={marketItems} onBuy={handleBuyItem} />}
              {currentView === "WALLET" && user && <Wallet user={user} onBuyFiat={handleBuyFiat} />}
              {currentView === "INVENTORY" && user && <Inventory user={user} zones={zones} onUseItem={handleUseItem} />}
              {currentView === "LEADERBOARD" && user && <Leaderboard users={usersMock} currentUser={user} zones={zones} badges={badges} />}
              {currentView === "PROFILE" && user && (
                <Profile
                  user={user}
                  zones={zones}
                  missions={missions}
                  badges={badges}
                  onUpdateUser={handleUpdateUser}
                  onUpgradePremium={handleUpgradePremium}
                />
              )}
              {currentView === "MISSIONS" && user && <Missions user={user} zones={zones} missions={missions} badges={badges} />}
              {currentView === "ADMIN" && user && (
                <Admin
                  marketItems={marketItems}
                  missions={missions}
                  badges={badges}
                  zones={zones}
                  onAddItem={handleAddItem}
                  onUpdateItem={handleUpdateItem}
                  onRemoveItem={handleRemoveItem}
                  onAddMission={handleAddMission}
                  onUpdateMission={handleUpdateMission}
                  onRemoveMission={handleRemoveMission}
                  onAddBadge={handleAddBadge}
                  onUpdateBadge={handleUpdateBadge}
                  onRemoveBadge={handleRemoveBadge}
                  onUpdateZoneName={handleUpdateZoneName}
                  onDeleteZone={handleDeleteZone}
                  onTriggerBurn={handleTriggerBurn}
                  onDistributeRewards={handleDistributeRewards}
                  onResetSeason={handleResetSeason}
                />
              )}
            </>
          )}

          {/* Public Pages */}
          {currentView === "RULES" && <GameRules onBack={() => setCurrentView(user ? "DASHBOARD" : "LANDING")} onNavigate={setCurrentView} />}
          {currentView === "HOW_TO_PLAY" && <HowToPlay onBack={() => setCurrentView(user ? "DASHBOARD" : "LANDING")} />}
          {currentView === "PRIVACY" && <Privacy />}
          {currentView === "TERMS" && <Terms />}
          {currentView === "COMMUNITY" && <Community />}
        </div>
      </main>

      {/* Zone Discovery Queue */}
      {zoneCreationQueue.length > 0 && (
          <ZoneDiscoveryModal
              isOpen={true}
              data={{
                  lat: zoneCreationQueue[0].lat,
                  lng: zoneCreationQueue[0].lng,
                  defaultName: zoneCreationQueue[0].defaultName,
                  cost: MINT_COST,
                  reward: MINT_REWARD_GOV
              }}
              onConfirm={handleZoneConfirm}
              onDiscard={handleZoneDiscard}
          />
      )}

      {/* Achievement Modal Overlay */}
      {achievementQueue.length > 0 && (
          <AchievementModal 
              key={achievementQueue[0].item.id}
              data={achievementQueue[0]} 
              onClose={handleCloseNotification} 
              onClaimAll={handleClaimAllNotifications}
              remainingCount={achievementQueue.length - 1}
          />
      )}

      {/* Run Summary Modal */}
      {runSummary && (
          <RunSummaryModal 
              data={runSummary} 
              onClose={() => setRunSummary(null)} 
          />
      )}

      {/* Batch Claim Summary Toast/Popup */}
      {claimSummary && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center pointer-events-none">
           <div className="bg-gray-900/95 backdrop-blur-xl border border-emerald-500/50 p-6 rounded-2xl shadow-[0_0_50px_rgba(16,185,129,0.3)] animate-slide-up flex flex-col items-center gap-2 pointer-events-auto transform scale-110">
               <div className="p-3 bg-emerald-500/10 rounded-full mb-1">
                 <Layers className="text-emerald-400" size={32} />
               </div>
               <h3 className="text-xl font-bold text-white tracking-tight">{t('ach.batch_claimed')}</h3>
               <p className="text-gray-400 text-sm flex items-center gap-1">
                   <CheckCircle size={12}/> {claimSummary.count} {t('ach.unlocked')}
               </p>
               
               <div className="mt-2 text-3xl font-mono font-black text-emerald-400 drop-shadow-lg flex items-center gap-2">
                   +{claimSummary.totalRun} RUN
               </div>
           </div>
        </div>
      )}

      {/* Footer is Global */}
      <Footer onNavigate={setCurrentView} currentView={currentView} />
    </div>
  );
};

const App: React.FC = () => {
    return (
        <LanguageProvider>
            <AppContent />
        </LanguageProvider>
    );
};

export default App;