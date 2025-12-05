
import React, { useState, useEffect } from "react";
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
import { User, Zone, Item, ViewState, InventoryItem, Mission, Badge, RunEntry } from "./types";
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

const App: React.FC = () => {
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
  const [claimSummary, setClaimSummary] = useState<{ count: number; totalGov: number } | null>(null);

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

  const findOpenNeighbor = (currentZones: Zone[]): { x: number; y: number } => {
    const directions = [
      { q: 1, r: 0 },
      { q: 1, r: -1 },
      { q: 0, r: -1 },
      { q: -1, r: 0 },
      { q: -1, r: 1 },
      { q: 0, r: 1 },
    ];
    const occupied = new Set(currentZones.map((z) => `${z.x},${z.y}`));
    const shuffledZones = [...currentZones].sort(() => 0.5 - Math.random());
    for (const zone of shuffledZones) {
      const shuffledDirs = [...directions].sort(() => 0.5 - Math.random());
      for (const dir of shuffledDirs) {
        const nx = zone.x + dir.q;
        const ny = zone.y + dir.r;
        if (!occupied.has(`${nx},${ny}`)) return { x: nx, y: ny };
      }
    }
    return { x: 5, y: 5 };
  };

  const handleSyncRun = (data: { km: number; name: string }) => {
    if (!user) return;
    const { km, name } = data;
    const runReward = km * 10;
    const potentialBalance = user.runBalance + runReward;
    const existingZone = zones.find((z) => z.name.toLowerCase().trim() === name.toLowerCase().trim());

    // Generate random realistic metrics for the run if not provided
    // In a real app, these come from the GPX file
    const duration = Math.floor(km * (5 + Math.random() * 2)); // approx 5-7 min/km
    const elevation = Math.floor(km * (Math.random() * 20)); // random elevation
    const maxSpeed = 10 + Math.random() * 15; // 10-25 km/h
    const avgSpeed = (km / (duration / 60)); 

    // Create History Entry
    const newRun: RunEntry = {
      id: `run_${Date.now()}`,
      location: name,
      km: km,
      timestamp: Date.now(),
      runEarned: runReward,
      duration,
      elevation,
      maxSpeed,
      avgSpeed
    };

    let updatedUser = { ...user, runHistory: [newRun, ...user.runHistory] };

    if (existingZone) {
      if (existingZone.ownerId === user.id) {
        setZones((prev) => prev.map((z) => (z.id === existingZone.id ? { ...z, recordKm: z.recordKm + km } : z)));
        setUser({ ...updatedUser, runBalance: updatedUser.runBalance + runReward, totalKm: updatedUser.totalKm + km });
        alert(`Run Synced! Reinforced "${existingZone.name}".\n+${runReward.toFixed(2)} RUN earned.`);
      } else {
        // Logica di conquista è gestita nel bottone manuale ora, qui accumuliamo solo KM
        setUser({ ...updatedUser, runBalance: updatedUser.runBalance + runReward, totalKm: updatedUser.totalKm + km });
        alert(`Run Synced! You ran in "${existingZone.name}".\nCheck the Zone Details to see if you can claim it!`);
      }
    } else {
      if (potentialBalance < MINT_COST) {
        alert(`Explored "${name}". Earned +${runReward.toFixed(2)} RUN. Need ${MINT_COST} RUN to claim.`);
        setUser({ ...updatedUser, runBalance: updatedUser.runBalance + runReward, totalKm: updatedUser.totalKm + km });
        return;
      }
      const confirm = window.confirm(`Discovered "${name}".\nClaim Cost: ${MINT_COST} RUN\nReward: +${MINT_REWARD_GOV} GOV\nMint Zone?`);
      if (confirm) {
        const coords = findOpenNeighbor(zones);
        const newZone: Zone = {
          id: `z_new_${Date.now()}`,
          x: coords.x,
          y: coords.y,
          ownerId: user.id,
          name: name.trim(),
          defenseLevel: 1,
          recordKm: km,
          interestRate: 2.0,
        };
        setZones((prev) => [...prev, newZone]);
        updatedUser.runHistory[0].govEarned = MINT_REWARD_GOV; // Track GOV in history
        setUser({
          ...updatedUser,
          runBalance: updatedUser.runBalance + runReward - MINT_COST,
          govBalance: updatedUser.govBalance + MINT_REWARD_GOV,
          totalKm: updatedUser.totalKm + km,
        });
        alert(`Zone Created! Received ${MINT_REWARD_GOV} GOV.`);
      } else {
        setUser({ ...updatedUser, runBalance: updatedUser.runBalance + runReward, totalKm: updatedUser.totalKm + km });
      }
    }
  };

  const handleClaimZone = (zoneId: string) => {
    if (!user) return;
    const targetZone = zones.find((z) => z.id === zoneId);
    if (!targetZone) return;

    if (targetZone.shieldExpiresAt && targetZone.shieldExpiresAt > Date.now()) {
      alert("Zone is SHIELDED. Cannot claim.");
      return;
    }
    if (user.runBalance < 50) {
      alert("Not enough RUN to pay claim fee.");
      return;
    }
    
    // Logic check handled in UI, but double check here could be good.
    // Assuming UI prevents calling this if not #1.

    if (window.confirm("Claim ownership for 50 RUN?")) {
      setZones((prev) =>
        prev.map((z) =>
          z.id === zoneId ? { ...z, ownerId: user.id, shieldExpiresAt: undefined, boostExpiresAt: undefined } : z
        )
      );
      setUser((prev) => (prev ? { ...prev, runBalance: prev.runBalance - 50, govBalance: prev.govBalance + CONQUEST_REWARD_GOV } : null));
      alert(`Zone Claimed! +${CONQUEST_REWARD_GOV} GOV.`);
    }
  };

  const handleBoostZone = (zoneId: string) => {
    if (!user) return;
    const boostItem = user.inventory.find((i) => i.type === "BOOST");
    if (!boostItem) {
      alert("Need Boost item.");
      return;
    }
    if (window.confirm(`Use '${boostItem.name}'?`)) handleUseItem(boostItem, zoneId);
  };

  const handleDefendZone = (zoneId: string) => {
    if (!user) return;
    const defenseItem = user.inventory.find((i) => i.type === "DEFENSE");
    if (!defenseItem) {
      alert("Need Defense item.");
      return;
    }
    if (window.confirm(`Use '${defenseItem.name}'?`)) handleUseItem(defenseItem, zoneId);
  };

  const handleBuyItem = (item: Item) => {
    if (!user) return;
    if (item.quantity <= 0) {
      alert("Out of stock!");
      return;
    }
    if (user.runBalance < item.priceRun) {
      alert("Insufficient RUN!");
      return;
    }

    setMarketItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i)));

    if (item.type === "CURRENCY") {
      setUser((prev) => (prev ? { ...prev, runBalance: prev.runBalance - item.priceRun, govBalance: prev.govBalance + item.effectValue } : null));
      alert(`Purchased! +${item.effectValue} GOV`);
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
    alert(`Used ${item.name} on "${targetZone.name}".`);
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
      alert("Upgraded to Premium!");
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
      alert(`Rewards Distributed! +${totalReward} GOV`);
    } else {
      alert("No rewards to distribute.");
    }
  };

  const handleResetSeason = () => {
    if (window.confirm("Reset Season?")) {
      const resetUsers = { ...usersMock };
      Object.keys(resetUsers).forEach((key) => (resetUsers[key].totalKm = 0));
      setUsersMock(resetUsers);
      setUser((prev) => (prev ? { ...prev, totalKm: 0 } : null));
      alert("Season Reset.");
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
      // Check for today or yesterday to start streak (allow 1 day gap if today haven't run yet?)
      // For strict streak: recent day must be today or yesterday
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
             // Pace 5:00 min/km = 12 km/h. Lower pace is faster speed.
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
    let additionalGov = 0;
    let hasChanges = false;
    
    // Temp queue to hold new unlocks in this cycle
    const newUnlockQueue: { type: 'MISSION' | 'BADGE'; item: Mission | Badge }[] = [];

    // 1. Check Missions
    missions.forEach((m) => {
      // If not already completed
      if (!newCompletedMissions.includes(m.id)) {
        if (checkAchievement(m, user, zones)) {
           newCompletedMissions.push(m.id);
           additionalGov += m.rewardGov;
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
              govBalance: prev.govBalance + additionalGov,
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
      const totalGov = achievementQueue.reduce((acc, entry) => {
          return acc + (entry.type === 'MISSION' ? (entry.item as Mission).rewardGov : 0);
      }, 0);
      const count = achievementQueue.length;

      // 2. Clear Queue
      setAchievementQueue([]);

      // 3. Show Summary
      setClaimSummary({ count, totalGov });

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

      {/* Batch Claim Summary Toast/Popup */}
      {claimSummary && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center pointer-events-none">
           <div className="bg-gray-900/95 backdrop-blur-xl border border-emerald-500/50 p-6 rounded-2xl shadow-[0_0_50px_rgba(16,185,129,0.3)] animate-slide-up flex flex-col items-center gap-2 pointer-events-auto transform scale-110">
               <div className="p-3 bg-emerald-500/10 rounded-full mb-1">
                 <Layers className="text-emerald-400" size={32} />
               </div>
               <h3 className="text-xl font-bold text-white tracking-tight">Batch Claimed!</h3>
               <p className="text-gray-400 text-sm flex items-center gap-1">
                   <CheckCircle size={12}/> {claimSummary.count} Achievements unlocked
               </p>
               
               <div className="mt-2 text-3xl font-mono font-black text-cyan-400 drop-shadow-lg flex items-center gap-2">
                   +{claimSummary.totalGov} GOV
               </div>
           </div>
        </div>
      )}

      {/* Footer is Global */}
      <Footer onNavigate={setCurrentView} currentView={currentView} />
    </div>
  );
};

export default App;