
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
import ReportBug from "./components/pages/ReportBug";
import SuggestionPage from "./components/pages/SuggestionPage"; 
import AchievementModal from "./components/AchievementModal";
import ZoneDiscoveryModal from "./components/ZoneDiscoveryModal";
import RunSummaryModal from "./components/RunSummaryModal";
import SyncModal from "./components/dashboard/SyncModal";
import LoginModal from "./components/auth/LoginModal";
import { ViewState } from "./types";
import { Layers, CheckCircle } from "lucide-react";
import { LanguageProvider, useLanguage } from "./LanguageContext";
import { MINT_COST, MINT_REWARD_GOV } from "./constants";

// Custom Hooks (Backend Logic)
import { useGameState } from "./hooks/useGameState";
import { useRunWorkflow } from "./hooks/useRunWorkflow";
import { useAchievements } from "./hooks/useAchievements";

const AppContent: React.FC = () => {
  const { t } = useLanguage();
  const [currentView, setCurrentView] = useState<ViewState>("LANDING");
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // 1. GAME STATE (Virtual Database)
  const gameState = useGameState();
  const { user, zones, setUser, setZones, loading } = gameState;

  // 2. WORKFLOWS (Business Logic)
  const runWorkflow = useRunWorkflow({ user, zones, setUser, setZones });
  const achievementSystem = useAchievements({ 
      user, zones, 
      missions: gameState.missions, 
      badges: gameState.badges, 
      setUser 
  });

  // --- AUTOMATIC REDIRECT & MODAL HANDLING ---
  useEffect(() => {
    // If user is authenticated
    if (user) {
        // If currently on landing page, move to dashboard
        if (currentView === "LANDING") {
            setCurrentView("DASHBOARD");
        }
        // Force close login modal if it's open
        if (showLoginModal) {
            setShowLoginModal(false);
        }
        
        // Security Check: If trying to access ADMIN but not admin, kick to dashboard
        if (currentView === "ADMIN" && !user.isAdmin) {
            setCurrentView("DASHBOARD");
        }

    } else if (!loading && !user && currentView !== "LANDING") {
        // If logged out and loading finished, return to landing
        // But allow rules/privacy pages to be viewed without login
        const publicPages: ViewState[] = ["RULES", "HOW_TO_PLAY", "PRIVACY", "TERMS", "COMMUNITY"];
        if (!publicPages.includes(currentView)) {
            setCurrentView("LANDING");
        }
    }
  }, [user, loading, currentView, showLoginModal]);

  // --- UI Handlers Wrapper ---
  const handleZoneConfirm = (name: string) => {
      const result = runWorkflow.confirmZoneCreation(name);
      if (!result.success) alert(t('alert.insufficient_run')); 
  };

  const handleClaimZone = (zoneId: string) => {
      if (!user) return;
      const z = zones.find(z => z.id === zoneId);
      if (z && z.shieldExpiresAt && z.shieldExpiresAt > Date.now()) {
          alert(t('alert.zone_shielded'));
          return;
      }
      if (user.runBalance < 50) {
          alert(t('alert.insufficient_run'));
          return;
      }
      if (window.confirm(t('alert.claim_confirm'))) {
          gameState.claimZone(zoneId);
          alert(`${t('alert.zone_claimed')} +10 GOV.`);
      }
  };

  const handleBoostZone = (zoneId: string) => {
      if (!user) return;
      const item = user.inventory.find(i => i.type === "BOOST");
      if (!item) { alert(t('alert.need_item') + " Boost."); return; }
      
      gameState.useItem(item, zoneId);
      alert(`${t('alert.item_used')} ${item.name}`);
  };

  const handleDefendZone = (zoneId: string) => {
      if (!user) return;
      const item = user.inventory.find(i => i.type === "DEFENSE");
      if (!item) { alert(t('alert.need_item') + " Defense."); return; }
      
      gameState.useItem(item, zoneId);
      alert(`${t('alert.item_used')} ${item.name}`);
  };

  const handleLogout = () => {
      gameState.logout();
      setCurrentView("LANDING");
  };

  // Auth Handlers
  const handleOpenLogin = () => setShowLoginModal(true);
  
  const isLanding = currentView === "LANDING";
  const showNavbar = !isLanding && user;
  const isDashboard = currentView === "DASHBOARD";

  // Determine if any full-screen modal is open to hide footer elements
  const isAnyModalOpen = 
      showSyncModal || 
      showLoginModal ||
      runWorkflow.zoneCreationQueue.length > 0 || 
      !!runWorkflow.runSummary || 
      achievementSystem.achievementQueue.length > 0;

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col">
      {showNavbar && <Navbar currentView={currentView} onNavigate={setCurrentView} user={user} onLogout={handleLogout} />}

      <main className={`flex-1 bg-gray-900 relative flex flex-col ${showNavbar && !isDashboard ? "pb-16 md:pb-0" : ""}`}>
        <div className="flex-1 relative">
          {isLanding && <LandingPage onLogin={handleOpenLogin} onNavigate={setCurrentView} />}

          {!isLanding && user && (
            <>
              {currentView === "DASHBOARD" && (
                <Dashboard
                  user={user}
                  zones={zones}
                  badges={gameState.badges}
                  users={gameState.allUsers}
                  onSyncRun={runWorkflow.startSync}
                  onClaim={handleClaimZone}
                  onBoost={handleBoostZone}
                  onDefend={handleDefendZone}
                  onNavigate={setCurrentView}
                  onOpenSync={() => setShowSyncModal(true)}
                />
              )}
              {currentView === "MARKETPLACE" && <Marketplace user={user} items={gameState.marketItems} onBuy={gameState.buyItem} />}
              {currentView === "WALLET" && (
                  <Wallet 
                      user={user} 
                      onBuyFiat={gameState.buyFiatGov} 
                      govToRunRate={gameState.govToRunRate}
                      onSwapGovToRun={gameState.swapGovToRun}
                  />
              )}
              {currentView === "INVENTORY" && <Inventory user={user} zones={zones} onUseItem={gameState.useItem} />}
              
              {currentView === "LEADERBOARD" && (
                  <Leaderboard 
                      users={gameState.allUsers} 
                      currentUser={user} 
                      zones={zones} 
                      badges={gameState.badges}
                      leaderboards={gameState.leaderboards}
                      levels={gameState.levels}
                  />
              )}
              
              {currentView === "PROFILE" && (
                <Profile
                  user={user}
                  zones={zones}
                  missions={gameState.missions}
                  badges={gameState.badges}
                  levels={gameState.levels}
                  leaderboards={gameState.leaderboards}
                  bugReports={gameState.bugReports}
                  suggestions={gameState.suggestions}
                  allUsers={gameState.allUsers}
                  onUpdateUser={gameState.updateUser}
                  onUpgradePremium={gameState.upgradePremium}
                  onClaim={handleClaimZone}
                  onBoost={handleBoostZone}
                  onDefend={handleDefendZone}
                />
              )}
              {currentView === "MISSIONS" && <Missions user={user} zones={zones} missions={gameState.missions} badges={gameState.badges} />}
              
              {currentView === "ADMIN" && user.isAdmin && (
                <Admin
                  marketItems={gameState.marketItems}
                  missions={gameState.missions}
                  badges={gameState.badges}
                  zones={zones}
                  govToRunRate={gameState.govToRunRate}
                  bugReports={gameState.bugReports}
                  suggestions={gameState.suggestions} 
                  leaderboards={gameState.leaderboards}
                  levels={gameState.levels}
                  onAddItem={gameState.addItem}
                  onUpdateItem={gameState.updateItem}
                  onRemoveItem={gameState.removeItem}
                  onAddMission={gameState.addMission}
                  onUpdateMission={gameState.updateMission}
                  onRemoveMission={gameState.removeMission}
                  onAddBadge={gameState.addBadge}
                  onUpdateBadge={gameState.updateBadge}
                  onRemoveBadge={gameState.removeBadge}
                  onUpdateZone={gameState.updateZone}
                  onDeleteZone={gameState.deleteZone}
                  onTriggerBurn={() => alert("Burn Executed")}
                  onDistributeRewards={() => alert("Rewards Distributed")}
                  onResetSeason={() => { if(confirm("Reset?")) gameState.setAllUsers({}); }}
                  onUpdateExchangeRate={gameState.setGovToRunRate}
                  onAddLeaderboard={gameState.addLeaderboard}
                  onUpdateLeaderboard={gameState.updateLeaderboard}
                  onDeleteLeaderboard={gameState.deleteLeaderboard}
                  onResetLeaderboard={gameState.resetLeaderboard}
                  onAddLevel={gameState.addLevel}
                  onUpdateLevel={gameState.updateLevel}
                  onDeleteLevel={gameState.deleteLevel}
                  onUpdateBugStatus={gameState.updateBugStatus}
                  onDeleteBugReport={gameState.deleteBugReport}
                  onDeleteSuggestion={gameState.deleteSuggestion}
                  onRevokeUserAchievement={gameState.revokeUserAchievement}
                  onAdjustBalance={gameState.adjustUserBalance}
                />
              )}
              {currentView === "REPORT_BUG" && <ReportBug onReport={gameState.reportBug} />}
              {currentView === "SUGGESTION" && <SuggestionPage onSubmit={gameState.submitSuggestion} />}
            </>
          )}

          {currentView === "RULES" && <GameRules onBack={() => setCurrentView(user ? "DASHBOARD" : "LANDING")} onNavigate={setCurrentView} />}
          {currentView === "HOW_TO_PLAY" && <HowToPlay onBack={() => setCurrentView(user ? "DASHBOARD" : "LANDING")} />}
          {currentView === "PRIVACY" && <Privacy />}
          {currentView === "TERMS" && <Terms />}
          {currentView === "COMMUNITY" && <Community />}
        </div>
      </main>

      {/* --- GLOBAL MODALS --- */}

      {showLoginModal && (
          <LoginModal 
              onClose={() => setShowLoginModal(false)}
              onLogin={gameState.login}
              onRegister={gameState.register}
          />
      )}

      {showSyncModal && user && (
          <SyncModal 
              onClose={() => setShowSyncModal(false)}
              onNavigate={setCurrentView}
              onSyncRun={runWorkflow.startSync}
              user={user}
          />
      )}

      {runWorkflow.zoneCreationQueue.length > 0 && (
          <ZoneDiscoveryModal
              isOpen={true}
              data={{
                  lat: runWorkflow.zoneCreationQueue[0].lat,
                  lng: runWorkflow.zoneCreationQueue[0].lng,
                  defaultName: runWorkflow.zoneCreationQueue[0].defaultName,
                  cost: MINT_COST,
                  reward: MINT_REWARD_GOV
              }}
              onConfirm={handleZoneConfirm}
              onDiscard={runWorkflow.discardZoneCreation}
          />
      )}

      {achievementSystem.achievementQueue.length > 0 && (
          <AchievementModal 
              key={achievementSystem.achievementQueue[0].item.id}
              data={achievementSystem.achievementQueue[0]} 
              onClose={achievementSystem.handleCloseNotification} 
              onClaimAll={achievementSystem.handleClaimAllNotifications}
              remainingCount={achievementSystem.achievementQueue.length - 1}
          />
      )}

      {runWorkflow.runSummary && (
          <RunSummaryModal 
              data={runWorkflow.runSummary} 
              onClose={runWorkflow.closeSummary} 
          />
      )}

      {achievementSystem.claimSummary && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center pointer-events-none">
           <div className="bg-gray-900/95 backdrop-blur-xl border border-emerald-500/50 p-6 rounded-2xl shadow-[0_0_50px_rgba(16,185,129,0.3)] animate-slide-up flex flex-col items-center gap-2 pointer-events-auto transform scale-110">
               <div className="p-3 bg-emerald-500/10 rounded-full mb-1">
                 <Layers className="text-emerald-400" size={32} />
               </div>
               <h3 className="text-xl font-bold text-white tracking-tight">{t('ach.batch_claimed')}</h3>
               <p className="text-gray-400 text-sm flex items-center gap-1">
                   <CheckCircle size={12}/> {achievementSystem.claimSummary.count} {t('ach.unlocked')}
               </p>
               
               <div className="flex flex-col items-center">
                   {achievementSystem.claimSummary.totalRun > 0 && (
                       <div className="mt-2 text-3xl font-mono font-black text-emerald-400 drop-shadow-lg flex items-center gap-2">
                           +{achievementSystem.claimSummary.totalRun} RUN
                       </div>
                   )}
                   {achievementSystem.claimSummary.totalGov > 0 && (
                       <div className="mt-1 text-xl font-mono font-black text-cyan-400 drop-shadow-lg flex items-center gap-2">
                           +{achievementSystem.claimSummary.totalGov} GOV
                       </div>
                   )}
               </div>
           </div>
        </div>
      )}

      <Footer onNavigate={setCurrentView} currentView={currentView} isAuthenticated={!!user} isHidden={isAnyModalOpen} />
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