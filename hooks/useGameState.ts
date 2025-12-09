
import { useState, useEffect } from 'react';
import { User, Zone, Item, Mission, Badge, InventoryItem } from '../types';
import { MOCK_ZONES, INITIAL_USER, MOCK_USERS, MOCK_ITEMS, MOCK_MISSIONS, MOCK_BADGES, PREMIUM_COST, CONQUEST_REWARD_GOV } from '../constants';

export const useGameState = () => {
  // --- DATABASE STATE ---
  const [user, setUser] = useState<User | null>(null);
  const [zones, setZones] = useState<Zone[]>(MOCK_ZONES);
  const [usersMock, setUsersMock] = useState(MOCK_USERS);
  const [marketItems, setMarketItems] = useState<Item[]>(MOCK_ITEMS);
  const [missions, setMissions] = useState<Mission[]>(MOCK_MISSIONS);
  const [badges, setBadges] = useState<Badge[]>(MOCK_BADGES);
  
  // --- CONFIG STATE ---
  const [govToRunRate, setGovToRunRate] = useState<number>(100);

  // --- ACTIONS (API Layer) ---

  const login = () => {
    setTimeout(() => setUser(INITIAL_USER), 800);
  };

  const logout = () => {
    setUser(null);
  };

  const updateUser = (updates: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  };

  // Economy Actions
  const buyItem = (item: Item) => {
    if (!user) return { success: false, msg: "Not logged in" };
    if (item.quantity <= 0) return { success: false, msg: "Out of stock" };
    if (user.runBalance < item.priceRun) return { success: false, msg: "Insufficient funds" };

    // Update Market
    setMarketItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i)));

    // Handle Currency Pack
    if (item.type === "CURRENCY") {
      setUser((prev) => (prev ? { ...prev, runBalance: prev.runBalance - item.priceRun, govBalance: prev.govBalance + item.effectValue } : null));
      return { success: true, msg: `Purchased! +${item.effectValue} GOV` };
    }

    // Handle Inventory Item
    const newItem: InventoryItem = { ...item, quantity: 1 };
    const existingIdx = user.inventory.findIndex((i) => i.id === item.id);
    let newInventory = [...user.inventory];
    if (existingIdx >= 0) newInventory[existingIdx].quantity += 1;
    else newInventory.push(newItem);

    setUser((prev) => (prev ? { ...prev, runBalance: prev.runBalance - item.priceRun, inventory: newInventory } : null));
    return { success: true, msg: "Item added to inventory" };
  };

  const useItem = (item: InventoryItem, targetZoneId: string) => {
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
    
    // Consume Item
    const newInventory = user.inventory.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i)).filter((i) => i.quantity > 0);
    setUser((prev) => (prev ? { ...prev, inventory: newInventory } : null));
  };

  const swapGovToRun = (govAmount: number) => {
      if (!user || govAmount <= 0) return;
      const runReceived = govAmount * govToRunRate;
      setUser((prev) => (prev ? {
          ...prev,
          govBalance: prev.govBalance - govAmount,
          runBalance: prev.runBalance + runReceived
      } : null));
  };

  const buyFiatGov = (amountUSD: number) => {
    if (!user) return;
    const govAmount = amountUSD * 10;
    setUser((prev) => (prev ? { ...prev, govBalance: prev.govBalance + govAmount } : null));
  };

  const claimZone = (zoneId: string) => {
    if (!user) return;
    setZones((prev) =>
        prev.map((z) =>
          z.id === zoneId ? { ...z, ownerId: user.id, shieldExpiresAt: undefined, boostExpiresAt: undefined } : z
        )
    );
    setUser((prev) => (prev ? { ...prev, runBalance: prev.runBalance - 50, govBalance: prev.govBalance + CONQUEST_REWARD_GOV } : null));
  };

  const upgradePremium = () => {
      if (!user) return;
      setUser((prev) => (prev ? { ...prev, govBalance: prev.govBalance - PREMIUM_COST, isPremium: true } : null));
  };

  // --- BACKGROUND TASKS (Cron Jobs) ---
  
  // Auto Interest Yield
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

  return {
    // State
    user,
    zones,
    usersMock,
    marketItems,
    missions,
    badges,
    govToRunRate,
    // Setters (for Admin or internal use)
    setUser,
    setZones,
    setMarketItems,
    setMissions,
    setBadges,
    setUsersMock,
    setGovToRunRate,
    // Actions
    login,
    logout,
    updateUser,
    buyItem,
    useItem,
    swapGovToRun,
    buyFiatGov,
    claimZone,
    upgradePremium
  };
};