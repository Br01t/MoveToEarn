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
import GameRules from './components/pages/GameRules';
import Privacy from './components/pages/Privacy';
import Terms from './components/pages/Terms';
import Community from './components/pages/Community';
import { User, Zone, Item, ViewState, InventoryItem } from './types';
import { MOCK_ZONES, INITIAL_USER, MOCK_USERS, MOCK_ITEMS, MINT_COST } from './constants';

const App: React.FC = () => {
  // --- Game State ---
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>('LANDING');
  const [zones, setZones] = useState<Zone[]>(MOCK_ZONES);
  const [usersMock, setUsersMock] = useState(MOCK_USERS);
  const [marketItems, setMarketItems] = useState<Item[]>(MOCK_ITEMS);

  // --- Actions ---

  const handleLogin = () => {
    // Simulate auth delay
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

  // Helper: Find a random open hex coordinate adjacent to existing map
  // Modified to use a Random Walker approach for organic/irregular growth
  const findOpenNeighbor = (currentZones: Zone[]): { x: number, y: number } => {
    // Directions for Hex Axial Coordinates (q, r)
    // (1, 0), (1, -1), (0, -1), (-1, 0), (-1, 1), (0, 1)
    const directions = [
      { q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 },
      { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 }
    ];

    const occupied = new Set(currentZones.map(z => `${z.x},${z.y}`));
    
    // Shuffle existing zones to pick a random "sprouting" point.
    // This creates tendrils and irregular shapes rather than filling the perimeter uniformly.
    const shuffledZones = [...currentZones].sort(() => 0.5 - Math.random());

    for (const zone of shuffledZones) {
        // Shuffle directions to pick a random side to grow from
        const shuffledDirs = [...directions].sort(() => 0.5 - Math.random());

        for (const dir of shuffledDirs) {
            const nx = zone.x + dir.q;
            const ny = zone.y + dir.r;
            if (!occupied.has(`${nx},${ny}`)) {
                return { x: nx, y: ny };
            }
        }
    }

    // Fallback if somehow map is fully enclosed (impossible with open grid)
    return { x: 5, y: 5 }; 
  };

  const handleSyncRun = (data: { km: number, name: string }) => {
    if (!user) return;
    const { km, name } = data;
    
    // Reward logic: 1 KM = 10 RUN
    const runReward = km * 10;
    const potentialBalance = user.runBalance + runReward;
    
    // Check if zone exists by name (Case insensitive)
    const existingZone = zones.find(z => z.name.toLowerCase().trim() === name.toLowerCase().trim());

    if (existingZone) {
      // --- EXISTING ZONE LOGIC ---
      if (existingZone.ownerId === user.id) {
          // My Zone: Reinforce
          setZones(prev => prev.map(z => z.id === existingZone.id ? { ...z, recordKm: z.recordKm + km } : z));
          
          setUser(prev => prev ? { 
            ...prev, 
            runBalance: prev.runBalance + runReward, 
            totalKm: prev.totalKm + km 
          } : null);

          alert(`Run Synced! You reinforced your zone "${existingZone.name}".\n\n+${runReward.toFixed(2)} RUN earned.`);
      } else {
          // Enemy Zone Check for Shield
          if (existingZone.shieldExpiresAt && existingZone.shieldExpiresAt > Date.now()) {
              alert(`Cannot contest "${existingZone.name}"!\n\nThis zone is currently SHIELDED by the owner.`);
               setUser(prev => prev ? { 
                ...prev, 
                runBalance: prev.runBalance + runReward, 
                totalKm: prev.totalKm + km 
              } : null);
              return;
          }

          const ownerName = existingZone.ownerId ? (usersMock[existingZone.ownerId]?.name || 'Unknown') : 'Unknown';
          const contestFee = 50;
          
          const wantToContest = window.confirm(
            `Zone Match Found: "${existingZone.name}"\n` +
            `Owner: ${ownerName}\n` +
            `Your Run: ${km} km\n` +
            `Earned: +${runReward.toFixed(2)} RUN\n\n` +
            `Do you want to CONTEST this zone? (Cost: ${contestFee} RUN)`
          );

          if (wantToContest) {
            if (potentialBalance >= contestFee) {
               // Conquest Logic
               setZones(prev => prev.map(z => {
                   if (z.id === existingZone.id) return { ...z, ownerId: user.id, recordKm: km, shieldExpiresAt: undefined, boostExpiresAt: undefined };
                   return z;
               }));
               setUser(prev => prev ? {
                   ...prev,
                   runBalance: prev.runBalance + runReward - contestFee,
                   totalKm: prev.totalKm + km
               } : null);
               alert(`Victory! "${existingZone.name}" is now yours.`);
               return; // Exit early
            } else {
               alert(`Insufficient funds to contest. (Cost: ${contestFee}, You have: ${potentialBalance.toFixed(2)})`);
            }
          }

          // If declined or failed contest, just give rewards
          setUser(prev => prev ? {
              ...prev,
              runBalance: prev.runBalance + runReward,
              totalKm: prev.totalKm + km
          } : null);
      }

    } else {
      // --- NEW ZONE LOGIC ---
      
      if (potentialBalance < MINT_COST) {
          alert(`You explored a new area: "${name}"!\n\nEarned: +${runReward.toFixed(2)} RUN\n\n(To claim this zone, you need ${MINT_COST} RUN. You have ${potentialBalance.toFixed(2)})`);
          setUser(prev => prev ? { 
            ...prev, 
            runBalance: prev.runBalance + runReward, 
            totalKm: prev.totalKm + km 
          } : null);
          return;
      }

      const confirm = window.confirm(
          `You discovered: "${name}"\n\n` +
          `Reward: +${runReward.toFixed(2)} RUN\n` +
          `Claim Cost: -${MINT_COST} RUN\n` +
          `----------------\n` +
          `Net Change: ${(runReward - MINT_COST).toFixed(2)} RUN\n\n` +
          `Do you want to mint and claim this zone?`
      );
      
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
             interestRate: parseFloat((Math.random() * 2 + 1).toFixed(1)) // 1.0% to 3.0%
          };
          setZones(prev => [...prev, newZone]);
          setUser(prev => prev ? { 
            ...prev, 
            runBalance: prev.runBalance + runReward - MINT_COST, 
            totalKm: prev.totalKm + km 
          } : null);
          alert(`Zone Created! "${newZone.name}" is now on the map.`);
      } else {
          // Just give rewards if they decline to mint
          setUser(prev => prev ? { 
            ...prev, 
            runBalance: prev.runBalance + runReward, 
            totalKm: prev.totalKm + km 
          } : null);
      }
    }
  };

  const handleClaimZone = (zoneId: string) => {
    if (!user) return;
    const CONTEST_COST = 50;

    const targetZone = zones.find(z => z.id === zoneId);
    if (targetZone && targetZone.shieldExpiresAt && targetZone.shieldExpiresAt > Date.now()) {
        alert("This zone is SHIELDED and cannot be attacked right now.");
        return;
    }

    if (user.runBalance < CONTEST_COST) {
      alert("Not enough RUN tokens to contest!");
      return;
    }

    const confirm = window.confirm(`Contest this zone for ${CONTEST_COST} RUN? \n(In full version, this checks if your Total KM > Owner's Record KM)`);

    if (confirm) {
        setZones(prev => prev.map(z => {
          if (z.id === zoneId) {
            return { ...z, ownerId: user.id, recordKm: z.recordKm + 5, shieldExpiresAt: undefined, boostExpiresAt: undefined }; // Boost record slightly on conquest
          }
          return z;
        }));

        setUser(prev => prev ? { ...prev, runBalance: prev.runBalance - CONTEST_COST } : null);
        alert("Zone Conquered! You are the new owner.");
    }
  };

  const handleBoostZone = (zoneId: string) => {
    if (!user) return;
    const boostItem = user.inventory.find(i => i.type === 'BOOST');
    
    if (!boostItem) {
        alert("You need a Boost item (e.g., Nanofiber Shoes) from the Marketplace to boost yields.");
        return;
    }

    const confirm = window.confirm(`Use '${boostItem.name}' to activate SUPER BOOST?\n\nThis will increase the zone's yield by +${boostItem.effectValue}% for 24 HOURS.`);
    if(confirm) {
        handleUseItem(boostItem, zoneId);
    }
  };

  const handleDefendZone = (zoneId: string) => {
    if (!user) return;
    const defenseItem = user.inventory.find(i => i.type === 'DEFENSE');

    if (!defenseItem) {
        alert("You need a Defense item (e.g., Zone Shield) from the Marketplace.");
        return;
    }

    const confirm = window.confirm(`Use '${defenseItem.name}' to activate SHIELD?\n\nThis will protect the zone from attacks for 24 HOURS.`);
    if (confirm) {
        handleUseItem(defenseItem, zoneId);
    }
  };

  const handleBuyItem = (item: Item) => {
    if (!user) return;
    if (user.govBalance < item.priceGov) return;

    const newItem: InventoryItem = { ...item, quantity: 1 };
    
    // Check if exists in inventory
    const existingIdx = user.inventory.findIndex(i => i.id === item.id);
    let newInventory = [...user.inventory];
    
    if (existingIdx >= 0) {
      newInventory[existingIdx] = {
        ...newInventory[existingIdx],
        quantity: newInventory[existingIdx].quantity + 1
      };
    } else {
      newInventory.push(newItem);
    }

    setUser(prev => prev ? {
      ...prev,
      govBalance: prev.govBalance - item.priceGov,
      inventory: newInventory
    } : null);
  };

  const handleUseItem = (item: InventoryItem, targetZoneId: string) => {
    if (!user) return;
    
    const zoneIndex = zones.findIndex(z => z.id === targetZoneId);
    if (zoneIndex === -1) return;
    const targetZone = zones[zoneIndex];

    // 1. Update Zone Logic
    let effectMessage = "";
    const updatedZones = [...zones];
    
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;

    if (item.type === 'DEFENSE') {
       updatedZones[zoneIndex] = {
         ...targetZone,
         defenseLevel: targetZone.defenseLevel + item.effectValue,
         shieldExpiresAt: Date.now() + ONE_DAY_MS
       };
       effectMessage = `Zone Shielded for 24 hours! Defense increased by +${item.effectValue} levels.`;
    } else if (item.type === 'BOOST') {
      updatedZones[zoneIndex] = {
        ...targetZone,
        interestRate: parseFloat((targetZone.interestRate + item.effectValue).toFixed(1)),
        boostExpiresAt: Date.now() + ONE_DAY_MS
      };
      effectMessage = `Zone Yield Super-Charged by +${item.effectValue}% for 24 hours!`;
    }

    setZones(updatedZones);

    // 2. Update Inventory Logic
    const newInventory = user.inventory.map(invItem => {
      if (invItem.id === item.id) {
        return { ...invItem, quantity: invItem.quantity - 1 };
      }
      return invItem;
    }).filter(invItem => invItem.quantity > 0);

    setUser(prev => prev ? { ...prev, inventory: newInventory } : null);
    
    alert(`Success! Used ${item.name} on "${targetZone.name}".\n${effectMessage}`);
  };

  const handleExchange = (from: 'RUN' | 'GOV', amount: number) => {
     if (!user) return;
     const RATE = 10; // 10 RUN = 1 GOV

     if (from === 'RUN') {
        const received = amount / RATE;
        setUser(prev => prev ? {
           ...prev,
           runBalance: prev.runBalance - amount,
           govBalance: prev.govBalance + received
        } : null);
     } else {
        const received = amount * RATE;
        setUser(prev => prev ? {
           ...prev,
           govBalance: prev.govBalance - amount,
           runBalance: prev.runBalance + received
        } : null);
     }
  };

  // --- Admin Actions ---
  const handleAddItem = (item: Item) => {
    setMarketItems(prev => [...prev, item]);
  };

  const handleRemoveItem = (id: string) => {
    setMarketItems(prev => prev.filter(i => i.id !== id));
  };

  const handleTriggerBurn = () => {
    alert("Burn Protocol Initiated.\n\n5,000,000 RUN tokens have been removed from the circulating supply.");
  };

  const handleDistributeRewards = () => {
     if(!user) return;
     const rewardAmount = 500;
     setUser(prev => prev ? { ...prev, govBalance: prev.govBalance + rewardAmount } : null);
     alert(`Rewards Distributed!\n\nAll active users (including you) received ${rewardAmount} GOV.`);
  };

  const handleResetSeason = () => {
     const confirm = window.confirm("Are you sure? This will reset the Leaderboard.");
     if (confirm) {
        const resetUsers = { ...usersMock };
        Object.keys(resetUsers).forEach(key => {
            resetUsers[key] = { ...resetUsers[key], totalKm: 0 };
        });
        setUsersMock(resetUsers);
        setUser(prev => prev ? { ...prev, totalKm: 0 } : null);
        alert("Season Reset Successful. All distances set to 0.");
     }
  };

  // AUTOMATIC INTEREST GENERATION
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(() => {
      let totalGain = 0;
      zones.forEach(z => {
        if (z.ownerId === user.id) {
          const rate = z.interestRate || 1;
          const gain = 0.5 * rate; 
          totalGain += gain;
        }
      });

      if (totalGain > 0) {
        setUser(prev => prev ? { ...prev, runBalance: prev.runBalance + totalGain } : null);
      }
    }, 10000); 

    return () => clearInterval(interval);
  }, [user?.id, zones]); 

  // Routing Logic
  const publicViews = ['RULES', 'PRIVACY', 'TERMS', 'COMMUNITY'];
  // If not logged in and not on a public page, or explicitly on LANDING, show Landing Page.
  if (currentView === 'LANDING' || (!user && !publicViews.includes(currentView))) {
    return <LandingPage onLogin={handleLogin} onNavigate={setCurrentView} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col">
      <Navbar 
        currentView={currentView} 
        onNavigate={setCurrentView} 
        user={user}
        onLogout={handleLogout}
      />

      <main className="flex-1 bg-gray-900 relative flex flex-col">
        <div className="flex-1 relative">
            {currentView === 'DASHBOARD' && (
            <Dashboard 
                user={user!} 
                zones={zones} 
                onSyncRun={handleSyncRun}
                onClaim={handleClaimZone}
                onBoost={handleBoostZone}
                onDefend={handleDefendZone}
            />
            )}
            {currentView === 'MARKETPLACE' && (
            <Marketplace user={user!} items={marketItems} onBuy={handleBuyItem} />
            )}
            {currentView === 'WALLET' && (
            <Wallet user={user!} onExchange={handleExchange} />
            )}
            {currentView === 'INVENTORY' && (
            <Inventory user={user!} zones={zones} onUseItem={handleUseItem} />
            )}
            {currentView === 'LEADERBOARD' && (
            <Leaderboard users={usersMock} currentUser={user!} zones={zones} />
            )}
            {currentView === 'PROFILE' && (
            <Profile user={user!} zones={zones} onUpdateUser={handleUpdateUser} />
            )}
            {currentView === 'ADMIN' && (
              <Admin 
                marketItems={marketItems}
                onAddItem={handleAddItem}
                onRemoveItem={handleRemoveItem}
                onTriggerBurn={handleTriggerBurn}
                onDistributeRewards={handleDistributeRewards}
                onResetSeason={handleResetSeason}
              />
            )}
            {currentView === 'RULES' && <GameRules onBack={() => setCurrentView(user ? 'DASHBOARD' : 'LANDING')} />}
            {currentView === 'PRIVACY' && <Privacy />}
            {currentView === 'TERMS' && <Terms />}
            {currentView === 'COMMUNITY' && <Community />}
        </div>
      </main>

      <Footer onNavigate={setCurrentView} />
    </div>
  );
};

export default App;