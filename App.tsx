
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import Marketplace from './components/Marketplace';
import Wallet from './components/Wallet';
import Inventory from './components/Inventory';
import Leaderboard from './components/Leaderboard';
import Profile from './components/Profile';
import Admin from './components/Admin';
import Footer from './components/Footer';
import Missions from './components/Missions';
import GameRules from './components/pages/GameRules';
import HowToPlay from './components/pages/HowToPlay';
import Privacy from './components/pages/Privacy';
import Terms from './components/pages/Terms';
import Community from './components/pages/Community';
import { User, Zone, Item, ViewState, InventoryItem, Mission, Badge } from './types';
import { MOCK_ZONES, INITIAL_USER, MOCK_USERS, MOCK_ITEMS, MINT_COST, MINT_REWARD_GOV, CONQUEST_REWARD_GOV, PREMIUM_COST, MOCK_MISSIONS, MOCK_BADGES } from './constants';

const App: React.FC = () => {
  // --- Game State ---
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>('LANDING');
  const [zones, setZones] = useState<Zone[]>(MOCK_ZONES);
  const [usersMock, setUsersMock] = useState(MOCK_USERS);
  const [marketItems, setMarketItems] = useState<Item[]>(MOCK_ITEMS);
  
  // Missions & Badges State
  const [missions, setMissions] = useState<Mission[]>(MOCK_MISSIONS);
  const [badges, setBadges] = useState<Badge[]>(MOCK_BADGES);

  // --- Actions ---

  const handleLogin = () => {
    setTimeout(() => {
      setUser(INITIAL_USER);
      setCurrentView('DASHBOARD');
    }, 800);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('LANDING');
  };

  const handleUpdateUser = (updates: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...updates } : null);
  };

  const findOpenNeighbor = (currentZones: Zone[]): { x: number, y: number } => {
    const directions = [{ q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 }, { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 }];
    const occupied = new Set(currentZones.map(z => `${z.x},${z.y}`));
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

  const handleSyncRun = (data: { km: number, name: string }) => {
    if (!user) return;
    const { km, name } = data;
    const runReward = km * 10;
    const potentialBalance = user.runBalance + runReward;
    const existingZone = zones.find(z => z.name.toLowerCase().trim() === name.toLowerCase().trim());

    if (existingZone) {
      if (existingZone.ownerId === user.id) {
          setZones(prev => prev.map(z => z.id === existingZone.id ? { ...z, recordKm: z.recordKm + km } : z));
          setUser(prev => prev ? { ...prev, runBalance: prev.runBalance + runReward, totalKm: prev.totalKm + km } : null);
          alert(`Run Synced! Reinforced "${existingZone.name}".\n+${runReward.toFixed(2)} RUN earned.`);
      } else {
          if (existingZone.shieldExpiresAt && existingZone.shieldExpiresAt > Date.now()) {
              alert(`Cannot contest "${existingZone.name}"!\n\nZone SHIELDED.`);
               setUser(prev => prev ? { ...prev, runBalance: prev.runBalance + runReward, totalKm: prev.totalKm + km } : null);
              return;
          }
          const wantToContest = window.confirm(`Contest "${existingZone.name}"?\nCost: 50 RUN\nReward: +${CONQUEST_REWARD_GOV} GOV`);
          if (wantToContest) {
            if (potentialBalance >= 50) {
               setZones(prev => prev.map(z => {
                   if (z.id === existingZone.id) return { ...z, ownerId: user.id, recordKm: km, shieldExpiresAt: undefined, boostExpiresAt: undefined };
                   return z;
               }));
               setUser(prev => prev ? { ...prev, runBalance: prev.runBalance + runReward - 50, govBalance: prev.govBalance + CONQUEST_REWARD_GOV, totalKm: prev.totalKm + km } : null);
               alert(`Victory! Zone conquered.\n+${CONQUEST_REWARD_GOV} GOV`);
               return; 
            } else { alert("Insufficient funds."); }
          }
          setUser(prev => prev ? { ...prev, runBalance: prev.runBalance + runReward, totalKm: prev.totalKm + km } : null);
      }
    } else {
      if (potentialBalance < MINT_COST) {
          alert(`Explored "${name}". Earned +${runReward.toFixed(2)} RUN. Need ${MINT_COST} RUN to claim.`);
          setUser(prev => prev ? { ...prev, runBalance: prev.runBalance + runReward, totalKm: prev.totalKm + km } : null);
          return;
      }
      const confirm = window.confirm(`Discovered "${name}".\nClaim Cost: ${MINT_COST} RUN\nReward: +${MINT_REWARD_GOV} GOV\nMint Zone?`);
      if (confirm) {
          const coords = findOpenNeighbor(zones);
          const newZone: Zone = {
             id: `z_new_${Date.now()}`, x: coords.x, y: coords.y, ownerId: user.id, name: name.trim(), defenseLevel: 1, recordKm: km, interestRate: 2.0
          };
          setZones(prev => [...prev, newZone]);
          setUser(prev => prev ? { ...prev, runBalance: prev.runBalance + runReward - MINT_COST, govBalance: prev.govBalance + MINT_REWARD_GOV, totalKm: prev.totalKm + km } : null);
          alert(`Zone Created! Received ${MINT_REWARD_GOV} GOV.`);
      } else {
          setUser(prev => prev ? { ...prev, runBalance: prev.runBalance + runReward, totalKm: prev.totalKm + km } : null);
      }
    }
  };

  const handleClaimZone = (zoneId: string) => {
    if (!user) return;
    const targetZone = zones.find(z => z.id === zoneId);
    if (targetZone?.shieldExpiresAt && targetZone.shieldExpiresAt > Date.now()) { alert("Zone is SHIELDED."); return; }
    if (user.runBalance < 50) { alert("Not enough RUN."); return; }
    if (window.confirm("Contest for 50 RUN?")) {
        setZones(prev => prev.map(z => z.id === zoneId ? { ...z, ownerId: user.id, recordKm: z.recordKm + 5, shieldExpiresAt: undefined, boostExpiresAt: undefined } : z));
        setUser(prev => prev ? { ...prev, runBalance: prev.runBalance - 50, govBalance: prev.govBalance + CONQUEST_REWARD_GOV } : null);
        alert(`Conquered! +${CONQUEST_REWARD_GOV} GOV.`);
    }
  };

  const handleBoostZone = (zoneId: string) => {
    if (!user) return;
    const boostItem = user.inventory.find(i => i.type === 'BOOST');
    if (!boostItem) { alert("Need Boost item."); return; }
    if(window.confirm(`Use '${boostItem.name}'?`)) handleUseItem(boostItem, zoneId);
  };

  const handleDefendZone = (zoneId: string) => {
    if (!user) return;
    const defenseItem = user.inventory.find(i => i.type === 'DEFENSE');
    if (!defenseItem) { alert("Need Defense item."); return; }
    if (window.confirm(`Use '${defenseItem.name}'?`)) handleUseItem(defenseItem, zoneId);
  };

  const handleBuyItem = (item: Item) => {
    if (!user) return;
    if (item.quantity <= 0) { alert("Out of stock!"); return; }
    if (user.runBalance < item.priceRun) { alert("Insufficient RUN!"); return; }

    setMarketItems(prev => prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i));

    if (item.type === 'CURRENCY') {
        setUser(prev => prev ? { ...prev, runBalance: prev.runBalance - item.priceRun, govBalance: prev.govBalance + item.effectValue } : null);
        alert(`Purchased! +${item.effectValue} GOV`);
        return;
    }

    const newItem: InventoryItem = { ...item, quantity: 1 };
    const existingIdx = user.inventory.findIndex(i => i.id === item.id);
    let newInventory = [...user.inventory];
    if (existingIdx >= 0) newInventory[existingIdx].quantity += 1;
    else newInventory.push(newItem);

    setUser(prev => prev ? { ...prev, runBalance: prev.runBalance - item.priceRun, inventory: newInventory } : null);
  };

  const handleUseItem = (item: InventoryItem, targetZoneId: string) => {
    if (!user) return;
    const zoneIndex = zones.findIndex(z => z.id === targetZoneId);
    if (zoneIndex === -1) return;
    const targetZone = zones[zoneIndex];
    let updatedZones = [...zones];
    
    if (item.type === 'DEFENSE') {
       updatedZones[zoneIndex] = { ...targetZone, defenseLevel: targetZone.defenseLevel + item.effectValue, shieldExpiresAt: Date.now() + 86400000 };
    } else if (item.type === 'BOOST') {
      updatedZones[zoneIndex] = { ...targetZone, interestRate: targetZone.interestRate + item.effectValue, boostExpiresAt: Date.now() + 86400000 };
    }
    setZones(updatedZones);
    const newInventory = user.inventory.map(i => i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i).filter(i => i.quantity > 0);
    setUser(prev => prev ? { ...prev, inventory: newInventory } : null);
    alert(`Used ${item.name} on "${targetZone.name}".`);
  };

  const handleBuyFiat = (amountUSD: number) => {
      if (!user) return;
      const govAmount = amountUSD * 10;
      setUser(prev => prev ? { ...prev, govBalance: prev.govBalance + govAmount } : null);
      alert(`Payment Successful! +${govAmount} GOV.`);
  };

  const handleUpgradePremium = () => {
    if (!user) return;
    if (user.govBalance < PREMIUM_COST) { alert(`Need ${PREMIUM_COST} GOV.`); return; }
    if (window.confirm(`Upgrade for ${PREMIUM_COST} GOV?`)) {
      setUser(prev => prev ? { ...prev, govBalance: prev.govBalance - PREMIUM_COST, isPremium: true } : null);
      alert("Upgraded to Premium!");
    }
  };

  // --- Admin Actions ---
  const handleAddItem = (item: Item) => setMarketItems(prev => [...prev, item]);
  const handleUpdateItem = (item: Item) => setMarketItems(prev => prev.map(i => i.id === item.id ? item : i));
  const handleRemoveItem = (id: string) => setMarketItems(prev => prev.filter(i => i.id !== id));
  
  const handleAddMission = (m: Mission) => setMissions(prev => [...prev, m]);
  const handleUpdateMission = (m: Mission) => setMissions(prev => prev.map(mission => mission.id === m.id ? m : mission));
  const handleRemoveMission = (id: string) => setMissions(prev => prev.filter(m => m.id !== id));
  
  const handleAddBadge = (b: Badge) => setBadges(prev => [...prev, b]);
  const handleUpdateBadge = (b: Badge) => setBadges(prev => prev.map(badge => badge.id === b.id ? b : badge));
  const handleRemoveBadge = (id: string) => setBadges(prev => prev.filter(b => b.id !== id));

  const handleUpdateZoneName = (zoneId: string, newName: string) => {
    setZones(prev => prev.map(z => z.id === zoneId ? { ...z, name: newName } : z));
  };

  const handleDeleteZone = (zoneId: string) => {
      setZones(prev => prev.filter(z => z.id !== zoneId));
  };

  const handleTriggerBurn = () => alert("Burn Protocol Initiated. 5M RUN burned.");
  
  const handleDistributeRewards = () => {
     if(!user) return;
     const kmReward = Math.floor(user.totalKm / 5);
     const zoneReward = zones.filter(z => z.ownerId === user.id).length * 10;
     const totalReward = kmReward + zoneReward;
     if (totalReward > 0) {
        setUser(prev => prev ? { ...prev, govBalance: prev.govBalance + totalReward } : null);
        alert(`Rewards Distributed! +${totalReward} GOV`);
     } else {
         alert("No rewards to distribute.");
     }
  };

  const handleResetSeason = () => {
     if (window.confirm("Reset Season?")) {
        const resetUsers = { ...usersMock };
        Object.keys(resetUsers).forEach(key => resetUsers[key].totalKm = 0);
        setUsersMock(resetUsers);
        setUser(prev => prev ? { ...prev, totalKm: 0 } : null);
        alert("Season Reset.");
     }
  };

  // Auto Interest
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      let totalGain = 0;
      zones.forEach(z => { if (z.ownerId === user.id) totalGain += 0.5 * (z.interestRate || 1); });
      if (totalGain > 0) setUser(prev => prev ? { ...prev, runBalance: prev.runBalance + totalGain } : null);
    }, 10000); 
    return () => clearInterval(interval);
  }, [user?.id, zones]); 

  // Check Missions Completion
  useEffect(() => {
    if (!user) return;
    let newCompleted = [...user.completedMissionIds];
    let newBadges = [...user.earnedBadgeIds];
    let rewards = 0;
    const ownedZones = zones.filter(z => z.ownerId === user.id).length;

    missions.forEach(m => {
        if (!newCompleted.includes(m.id)) {
            if ((m.conditionType === 'TOTAL_KM' && user.totalKm >= m.conditionValue) ||
                (m.conditionType === 'OWN_ZONES' && ownedZones >= m.conditionValue)) {
                newCompleted.push(m.id);
                rewards += m.rewardGov;
            }
        }
    });

    badges.forEach(b => {
        if (!newBadges.includes(b.id)) {
            if ((b.conditionType === 'TOTAL_KM' && user.totalKm >= b.conditionValue) ||
                (b.conditionType === 'OWN_ZONES' && ownedZones >= b.conditionValue)) {
                newBadges.push(b.id);
            }
        }
    });

    if (newCompleted.length > user.completedMissionIds.length || newBadges.length > user.earnedBadgeIds.length) {
        setUser(prev => prev ? { 
            ...prev, 
            completedMissionIds: newCompleted, 
            earnedBadgeIds: newBadges,
            govBalance: prev.govBalance + rewards
        } : null);
    }
  }, [user?.totalKm, zones, missions, badges]);

  // Main Render Logic
  const isLanding = currentView === 'LANDING';
  const showNavbar = !isLanding && user; // Only show navbar if logged in and not on landing page

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col">
      {/* Navbar is strictly for logged-in users inside the app */}
      {showNavbar && (
        <Navbar currentView={currentView} onNavigate={setCurrentView} user={user} onLogout={handleLogout} />
      )}

      {/* Main Content Area */}
      <main className={`flex-1 bg-gray-900 relative flex flex-col ${showNavbar ? 'pb-16 md:pb-0' : ''}`}>
        <div className="flex-1 relative">
            {isLanding && <LandingPage onLogin={handleLogin} onNavigate={setCurrentView} />}
            
            {/* Authenticated Routes */}
            {!isLanding && (
                <>
                    {currentView === 'DASHBOARD' && user && <Dashboard user={user} zones={zones} onSyncRun={handleSyncRun} onClaim={handleClaimZone} onBoost={handleBoostZone} onDefend={handleDefendZone} onNavigate={setCurrentView} />}
                    {currentView === 'MARKETPLACE' && user && <Marketplace user={user} items={marketItems} onBuy={handleBuyItem} />}
                    {currentView === 'WALLET' && user && <Wallet user={user} onBuyFiat={handleBuyFiat} />}
                    {currentView === 'INVENTORY' && user && <Inventory user={user} zones={zones} onUseItem={handleUseItem} />}
                    {currentView === 'LEADERBOARD' && user && <Leaderboard users={usersMock} currentUser={user} zones={zones} />}
                    {currentView === 'PROFILE' && user && <Profile user={user} zones={zones} missions={missions} badges={badges} onUpdateUser={handleUpdateUser} onUpgradePremium={handleUpgradePremium} />}
                    {currentView === 'MISSIONS' && user && <Missions user={user} zones={zones} missions={missions} badges={badges} />}
                    {currentView === 'ADMIN' && user && <Admin 
                        marketItems={marketItems} missions={missions} badges={badges} zones={zones}
                        onAddItem={handleAddItem} onUpdateItem={handleUpdateItem} onRemoveItem={handleRemoveItem}
                        onAddMission={handleAddMission} onUpdateMission={handleUpdateMission} onRemoveMission={handleRemoveMission}
                        onAddBadge={handleAddBadge} onUpdateBadge={handleUpdateBadge} onRemoveBadge={handleRemoveBadge}
                        onUpdateZoneName={handleUpdateZoneName} onDeleteZone={handleDeleteZone}
                        onTriggerBurn={handleTriggerBurn} onDistributeRewards={handleDistributeRewards} onResetSeason={handleResetSeason} 
                    />}
                </>
            )}

            {/* Public Pages (Can be viewed without login if routed correctly, or from Landing) */}
            {currentView === 'RULES' && <GameRules onBack={() => setCurrentView(user ? 'DASHBOARD' : 'LANDING')} onNavigate={setCurrentView} />}
            {currentView === 'HOW_TO_PLAY' && <HowToPlay onBack={() => setCurrentView(user ? 'DASHBOARD' : 'LANDING')} />}
            {currentView === 'PRIVACY' && <Privacy />}
            {currentView === 'TERMS' && <Terms />}
            {currentView === 'COMMUNITY' && <Community />}
        </div>
      </main>

      {/* Footer is Global */}
      <Footer onNavigate={setCurrentView} currentView={currentView} />
    </div>
  );
};

export default App;