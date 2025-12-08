
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
import { getDistanceFromLatLonInKm, calculateHexPosition } from "./utils/geo";
import { processRunRewards, checkAchievement } from "./utils/rewards";

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

  // --- Zone Discovery Queue ---
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
  
  // Ref to track zones created during this session
  const sessionCreatedZonesRef = useRef<Zone[]>([]);

  // BATCH PROCESSING
  const [pendingRunsQueue, setPendingRunsQueue] = useState<RunAnalysisData[]>([]);
  // Use a ref for batch stats to avoid heavy state updates during loop
  const batchStatsRef = useRef<{
      totalKm: number;
      duration: number;
      runEarned: number;
      involvedZoneNames: string[];
      reinforcedCount: number;
  }>({ totalKm: 0, duration: 0, runEarned: 0, involvedZoneNames: [], reinforcedCount: 0 });

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

  const handleSyncRun = (dataList: RunAnalysisData[]) => {
    if (!user) return;
    
    // Reset batch stats for new sync
    batchStatsRef.current = { totalKm: 0, duration: 0, runEarned: 0, involvedZoneNames: [], reinforcedCount: 0 };
    sessionCreatedZonesRef.current = [];
    
    // Start Queue
    setPendingRunsQueue(dataList);
  };

  // Processor Effect for Run Queue
  useEffect(() => {
      if (pendingRunsQueue.length > 0 && zoneCreationQueue.length === 0 && !pendingRunData) {
          const nextRun = pendingRunsQueue[0];
          checkAndProcessRun(nextRun);
      } else if (pendingRunsQueue.length === 0 && batchStatsRef.current.totalKm > 0 && !runSummary && zoneCreationQueue.length === 0 && !pendingRunData) {
          // Batch Complete - Show Summary
          const stats = batchStatsRef.current;
          setRunSummary({
              totalKm: stats.totalKm,
              duration: stats.duration,
              runEarned: stats.runEarned,
              involvedZoneNames: Array.from(new Set(stats.involvedZoneNames)), // Unique names
              isReinforced: stats.reinforcedCount > 0
          });
          // Reset ref after showing summary to prevent loop
          batchStatsRef.current = { totalKm: 0, duration: 0, runEarned: 0, involvedZoneNames: [], reinforcedCount: 0 };
      }
  }, [pendingRunsQueue, zoneCreationQueue.length, pendingRunData, runSummary]); // Add runSummary to deps to prevent re-trigger

  const checkAndProcessRun = (data: RunAnalysisData) => {
    const { startPoint, endPoint } = data;
    
    // Check existing zones (including those just created in session)
    const allZones = [...zones, ...sessionCreatedZonesRef.current];

    let startZone = allZones.find(z => getDistanceFromLatLonInKm(startPoint.lat, startPoint.lng, z.lat, z.lng) < 1.0);
    let endZone = allZones.find(z => getDistanceFromLatLonInKm(endPoint.lat, endPoint.lng, z.lat, z.lng) < 1.0);

    // Prepare Queue for Potential New Zones
    const zonesToCreate: { lat: number; lng: number; defaultName: string; type: 'START' | 'END' }[] = [];

    if (!startZone) {
        zonesToCreate.push({
            lat: startPoint.lat,
            lng: startPoint.lng,
            defaultName: `New Zone ${Math.floor(startPoint.lat*100)},${Math.floor(startPoint.lng*100)}`,
            type: 'START'
        });
    }

    const distStartEnd = getDistanceFromLatLonInKm(startPoint.lat, startPoint.lng, endPoint.lat, endPoint.lng);
    if (!endZone && distStartEnd > 1.0) {
        zonesToCreate.push({
             lat: endPoint.lat,
             lng: endPoint.lng,
             defaultName: `New Zone ${Math.floor(endPoint.lat*100)},${Math.floor(endPoint.lng*100)}`,
             type: 'END'
        });
    }

    if (zonesToCreate.length > 0) {
        // Halt queue processing, ask user input
        setPendingRunData(data);
        setZoneCreationQueue(zonesToCreate);
    } else {
        // No new zones needed, finalize immediately
        finalizeRunProcessing(data, user!, zones);
    }
  };

  const finalizeRunProcessing = (data: RunAnalysisData, currentUser: User, currentZones: Zone[]) => {
      const allZonesMap = new Map<string, Zone>();
      currentZones.forEach(z => allZonesMap.set(z.id, z));
      sessionCreatedZonesRef.current.forEach(z => allZonesMap.set(z.id, z));
      const fullZoneList = Array.from(allZonesMap.values());

      const result = processRunRewards(data, currentUser, fullZoneList);

      const newRun: RunEntry = {
          id: `run_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          location: result.locationName,
          km: data.totalKm,
          timestamp: data.startTime, 
          runEarned: result.totalRunEarned,
          duration: data.durationMinutes,
          elevation: data.elevation,
          maxSpeed: data.maxSpeed,
          avgSpeed: data.avgSpeed
      };

      const finalUser = {
          ...currentUser,
          runHistory: [newRun, ...currentUser.runHistory],
          runBalance: currentUser.runBalance + result.totalRunEarned,
          totalKm: currentUser.totalKm + data.totalKm
      };

      // Update App State
      setZones(result.zoneUpdates);
      setUser(finalUser);
      
      // Update Batch Stats
      batchStatsRef.current.totalKm += data.totalKm;
      batchStatsRef.current.duration += data.durationMinutes;
      batchStatsRef.current.runEarned += result.totalRunEarned;
      batchStatsRef.current.involvedZoneNames.push(...result.involvedZoneNames);
      if (result.isReinforced) batchStatsRef.current.reinforcedCount++;

      // Clear pending state to proceed to next
      setPendingRunData(null);
      setPendingRunsQueue(prev => prev.slice(1));
  };

  // Called when user Confirms Minting in Modal
  const handleZoneConfirm = (customName: string) => {
      if (!user || !pendingRunData) return;
      
      const pendingZone = zoneCreationQueue[0];
      const hasCountryCode = / - [A-Z]{2}$/.test(customName);
      const finalName = hasCountryCode ? customName : `${customName} - XX`;

      // Check Funds
      if (user.runBalance < MINT_COST) {
          alert(t('alert.insufficient_run'));
          return; 
      }

      // Determine Reference Zone for adjacency
      let referenceZone: Zone | null = null;
      if (pendingZone.type === 'END' && sessionCreatedZonesRef.current.length > 0) {
          referenceZone = sessionCreatedZonesRef.current[0];
      }

      const currentAllZones = [...zones, ...sessionCreatedZonesRef.current];
      
      const hexPos = calculateHexPosition(
          referenceZone, 
          pendingZone.lat, 
          pendingZone.lng, 
          "XX", 
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
      
      sessionCreatedZonesRef.current.push(newZone);
      
      setUser(updatedUser);
      setZones(prev => [...prev, newZone]); 

      // Proceed to next zone in this run's creation queue
      handleNextZoneInQueue(updatedUser, [...zones, newZone]);
  };

  // Called when user Discards in Modal
  const handleZoneDiscard = () => {
      if (!user) return;
      handleNextZoneInQueue(user, zones);
  };

  const handleNextZoneInQueue = (currentUser: User, currentZones: Zone[]) => {
      const nextQueue = zoneCreationQueue.slice(1);
      setZoneCreationQueue(nextQueue);

      // If no more zones for this run, finalize it
      if (nextQueue.length === 0 && pendingRunData) {
          finalizeRunProcessing(pendingRunData, currentUser, currentZones);
      }
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

  // Main Effect to Monitor and Award Achievements
  useEffect(() => {
    if (!user) return;
    
    let newCompletedMissions = [...user.completedMissionIds];
    let newEarnedBadges = [...user.earnedBadgeIds];
    let additionalRun = 0; 
    let hasChanges = false;
    
    const newUnlockQueue: { type: 'MISSION' | 'BADGE'; item: Mission | Badge }[] = [];

    missions.forEach((m) => {
      if (!newCompletedMissions.includes(m.id)) {
        if (checkAchievement(m, user, zones)) {
           newCompletedMissions.push(m.id);
           additionalRun += m.rewardRun; 
           hasChanges = true;
           newUnlockQueue.push({ type: 'MISSION', item: m });
        }
      }
    });

    badges.forEach((b) => {
      if (!newEarnedBadges.includes(b.id)) {
        if (checkAchievement(b, user, zones)) {
           newEarnedBadges.push(b.id);
           additionalRun += (b.rewardRun || 0); 
           hasChanges = true;
           newUnlockQueue.push({ type: 'BADGE', item: b });
        }
      }
    });

    if (hasChanges) {
      setUser((prev) =>
        prev
          ? {
              ...prev,
              completedMissionIds: newCompletedMissions,
              earnedBadgeIds: newEarnedBadges,
              runBalance: prev.runBalance + additionalRun,
            }
          : null
      );
      
      if (newUnlockQueue.length > 0) {
          setAchievementQueue(prev => [...prev, ...newUnlockQueue]);
      }
    }

  }, [user?.totalKm, user?.runHistory, zones, missions, badges, user?.completedMissionIds.length, user?.earnedBadgeIds.length]);

  const handleCloseNotification = () => {
    setAchievementQueue(prev => prev.slice(1));
  };

  const handleClaimAllNotifications = () => {
      const totalRun = achievementQueue.reduce((acc, entry) => {
          if (entry.type === 'MISSION') return acc + (entry.item as Mission).rewardRun;
          if (entry.type === 'BADGE') return acc + ((entry.item as Badge).rewardRun || 0);
          return acc;
      }, 0);
      const count = achievementQueue.length;

      setAchievementQueue([]);
      setClaimSummary({ count, totalRun });

      setTimeout(() => {
          setClaimSummary(null);
      }, 3000);
  };

  const isLanding = currentView === "LANDING";
  const showNavbar = !isLanding && user; 

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col">
      {showNavbar && <Navbar currentView={currentView} onNavigate={setCurrentView} user={user} onLogout={handleLogout} />}

      <main className={`flex-1 bg-gray-900 relative flex flex-col ${showNavbar ? "pb-16 md:pb-0" : ""}`}>
        <div className="flex-1 relative">
          {isLanding && <LandingPage onLogin={handleLogin} onNavigate={setCurrentView} />}

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

          {currentView === "RULES" && <GameRules onBack={() => setCurrentView(user ? "DASHBOARD" : "LANDING")} onNavigate={setCurrentView} />}
          {currentView === "HOW_TO_PLAY" && <HowToPlay onBack={() => setCurrentView(user ? "DASHBOARD" : "LANDING")} />}
          {currentView === "PRIVACY" && <Privacy />}
          {currentView === "TERMS" && <Terms />}
          {currentView === "COMMUNITY" && <Community />}
        </div>
      </main>

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

      {achievementQueue.length > 0 && (
          <AchievementModal 
              key={achievementQueue[0].item.id}
              data={achievementQueue[0]} 
              onClose={handleCloseNotification} 
              onClaimAll={handleClaimAllNotifications}
              remainingCount={achievementQueue.length - 1}
          />
      )}

      {runSummary && (
          <RunSummaryModal 
              data={runSummary} 
              onClose={() => setRunSummary(null)} 
          />
      )}

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