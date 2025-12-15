
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
import { GameRules } from "./components/pages/GameRules";
import { Whitepaper } from "./components/pages/Whitepaper";
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
import PWAInstallPrompt from "./components/PWAInstallPrompt"; 
import CookieBanner from "./components/privacy/CookieBanner"; // IMPORTED
import { ViewState } from "./types";
import { Layers, CheckCircle, AlertTriangle, X, ShoppingBag } from "lucide-react";
import { LanguageProvider, useLanguage } from "./LanguageContext";
import { GlobalUIProvider, useGlobalUI } from "./contexts/GlobalUIContext";
import { PrivacyProvider } from "./contexts/PrivacyContext"; // IMPORTED
import { MINT_COST, MINT_REWARD_GOV } from "./constants";

// Custom Hooks (Backend Logic)
import { useGameState } from "./hooks/useGameState";
import { useRunWorkflow } from "./hooks/useRunWorkflow";
import { useAchievements } from "./hooks/useAchievements";
import { usePWA } from "./hooks/usePWA";

const AppContent: React.FC = () => {
  const { t } = useLanguage();
  const { showToast, showConfirm } = useGlobalUI(); 
  const [currentView, setCurrentView] = useState<ViewState>("LANDING");
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showInsufficientFundsModal, setShowInsufficientFundsModal] = useState(false);
  
  // PWA State
  const { deferredPrompt, isIOS, isStandalone, installPWA } = usePWA();
  const [forceShowPWA, setForceShowPWA] = useState(false);

  // 1. GAME STATE (Virtual Database)
  const { 
    user, zones, setUser, setZones, loading, transactions, logTransaction, recoveryMode,
    lastBurnTimestamp,
    totalBurned,
    govToRunRate,
    marketItems,
    missions,
    badges,
    bugReports,
    suggestions,
    leaderboards,
    levels,
    allUsers,
    ...gameState
  } = useGameState();

  // 2. WORKFLOWS (Business Logic)
  const runWorkflow = useRunWorkflow({ 
      user, zones, setUser, setZones, 
      logTransaction, 
      recordRun: gameState.recordRun 
  });
  
  const achievementSystem = useAchievements({ 
      user, zones, 
      missions: missions, 
      badges: badges,
      setUser,
      logTransaction 
  });

  // --- SCROLL TO TOP ON VIEW CHANGE ---
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentView]);

  // --- AUTOMATIC REDIRECT & MODAL HANDLING ---
  useEffect(() => {
    if (recoveryMode) {
        setShowLoginModal(true);
    }

    if (user) {
        if (currentView === "LANDING") {
            setCurrentView("DASHBOARD");
        }
        if (showLoginModal && !recoveryMode) {
            setShowLoginModal(false);
        }
        
        if (currentView === "ADMIN" && !user.isAdmin) {
            setCurrentView("DASHBOARD");
        }

    } else if (!loading && !user && currentView !== "LANDING") {
        const publicPages: ViewState[] = ["RULES", "WHITEPAPER", "HOW_TO_PLAY", "PRIVACY", "TERMS", "COMMUNITY"];
        if (!publicPages.includes(currentView)) {
            setCurrentView("LANDING");
        }
    }
  }, [user, loading, currentView, showLoginModal, recoveryMode]);

  // --- WRAPPERS FOR AUTH TO SHOW TOASTS ---
  const handleLogin = async (email: string, password: string) => {
      const result = await gameState.login(email, password);
      if (!result.error) {
          showToast("Login Successful. Welcome back.", 'SUCCESS');
      }
      return result;
  };

  const handleRegister = async (email: string, password: string, username: string) => {
      const result = await gameState.register(email, password, username);
      if (!result.error) {
          if (result.data?.session) {
              showToast("Registration Complete. Logging in...", 'SUCCESS');
          } else {
              showToast("Registration Complete. Check email.", 'SUCCESS');
          }
      }
      return result;
  };

  // --- UI Handlers Wrapper ---
  const handleZoneConfirm = (name: string) => {
      const result = runWorkflow.confirmZoneCreation(name);
      if (!result.success) {
          setShowInsufficientFundsModal(true);
      }
  };

  const handleClaimZone = (zoneId: string) => {
      if (!user) return;
      const z = zones.find(z => z.id === zoneId);
      if (z && z.shieldExpiresAt && z.shieldExpiresAt > Date.now()) {
          showToast(t('alert.zone_shielded'), 'ERROR');
          return;
      }
      // Conquest Cost Check
      if (user.runBalance < 350) {
          setShowInsufficientFundsModal(true);
          return;
      }
      
      showConfirm({
          title: t('zone.action.claim'),
          message: t('alert.claim_confirm'),
          onConfirm: () => {
              gameState.claimZone(zoneId);
              showToast(`${t('alert.zone_claimed')} +25 GOV`, 'SUCCESS');
          }
      });
  };

  const handleBoostZone = (zoneId: string) => {
      if (!user) return;
      const item = user.inventory.find(i => i.type === "BOOST");
      if (!item) { 
          showToast(t('alert.need_item') + " Boost.", 'ERROR'); 
          return; 
      }
      
      gameState.useItem(item, zoneId);
  };

  const handleDefendZone = (zoneId: string) => {
      if (!user) return;
      const item = user.inventory.find(i => i.type === "DEFENSE");
      if (!item) { 
          showToast(t('alert.need_item') + " Defense.", 'ERROR'); 
          return; 
      }
      
      gameState.useItem(item, zoneId);
  };

  const handleLogout = async () => {
      await gameState.logout();
      window.location.reload(); 
  };

  const handleOpenLogin = () => setShowLoginModal(true);
  
  const handleFooterInstall = () => {
      if (deferredPrompt) {
          installPWA();
      } else if (isIOS) {
          setForceShowPWA(true);
      }
  };
  
  const isLanding = currentView === "LANDING";
  const showNavbar = !isLanding && user;
  const isDashboard = currentView === "DASHBOARD";

  const isAnyModalOpen = 
      showSyncModal || 
      showLoginModal ||
      showInsufficientFundsModal ||
      runWorkflow.zoneCreationQueue.length > 0 || 
      !!runWorkflow.runSummary || 
      achievementSystem.achievementQueue.length > 0;

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col">
      {showNavbar && <Navbar currentView={currentView} onNavigate={setCurrentView} user={user} onLogout={handleLogout} />}

      <main className={`flex-1 bg-gray-900 relative flex flex-col ${showNavbar && !isDashboard ? "pb-16 md:pb-0" : ""}`}>
        
        {/* PWA Install Prompt */}
        <PWAInstallPrompt 
            isAuthenticated={!!user} 
            deferredPrompt={deferredPrompt}
            isIOS={isIOS}
            isStandalone={isStandalone}
            onInstall={installPWA}
            forceShow={forceShowPWA}
            onCloseForce={() => setForceShowPWA(false)}
        />

        {/* Cookie Consent Banner */}
        <CookieBanner onNavigate={setCurrentView} />

        <div className="flex-1 relative">
          {isLanding && <LandingPage onLogin={handleOpenLogin} onNavigate={setCurrentView} />}

          {!isLanding && user && (
            <>
              {currentView === "DASHBOARD" && (
                <Dashboard
                  user={user}
                  zones={zones}
                  badges={badges} 
                  users={allUsers} 
                  onSyncRun={runWorkflow.startSync}
                  onClaim={handleClaimZone}
                  onBoost={handleBoostZone}
                  onDefend={handleDefendZone}
                  onNavigate={setCurrentView}
                  onOpenSync={() => setShowSyncModal(true)}
                  onGetZoneLeaderboard={gameState.fetchZoneLeaderboard}
                />
              )}
              {currentView === "MARKETPLACE" && <Marketplace user={user} items={marketItems} onBuy={gameState.buyItem} />}
              {currentView === "WALLET" && (
                  <Wallet 
                      user={user}
                      transactions={transactions}
                      onBuyFiat={gameState.buyFiatGov} 
                      govToRunRate={govToRunRate} 
                      onSwapGovToRun={gameState.swapGovToRun}
                      lastBurnTimestamp={lastBurnTimestamp}
                      totalBurned={totalBurned}
                  />
              )}
              {currentView === "INVENTORY" && <Inventory user={user} zones={zones} onUseItem={gameState.useItem} />}
              
              {currentView === "LEADERBOARD" && (
                  <Leaderboard 
                      users={allUsers} 
                      currentUser={user} 
                      zones={zones} 
                      badges={badges} 
                      leaderboards={leaderboards} 
                      levels={levels} 
                  />
              )}
              
              {currentView === "PROFILE" && (
                <Profile
                  user={user}
                  zones={zones}
                  missions={missions} 
                  badges={badges} 
                  levels={levels} 
                  leaderboards={leaderboards} 
                  bugReports={bugReports} 
                  suggestions={suggestions} 
                  allUsers={allUsers} 
                  onUpdateUser={gameState.updateUser}
                  onUpgradePremium={gameState.upgradePremium}
                  onClaim={handleClaimZone}
                  onBoost={handleBoostZone}
                  onDefend={handleDefendZone}
                  onGetZoneLeaderboard={gameState.fetchZoneLeaderboard}
                />
              )}
              {currentView === "MISSIONS" && <Missions user={user} zones={zones} missions={missions} badges={badges} />}
              
              {currentView === "ADMIN" && user.isAdmin && (
                <Admin
                  marketItems={marketItems}
                  missions={missions}
                  badges={badges}
                  zones={zones}
                  govToRunRate={govToRunRate}
                  bugReports={bugReports}
                  suggestions={suggestions} 
                  leaderboards={leaderboards}
                  levels={levels}
                  allUsers={allUsers} 
                  lastBurnTimestamp={lastBurnTimestamp} 
                  
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
                  onTriggerBurn={gameState.triggerGlobalBurn}
                  onDistributeRewards={gameState.distributeZoneRewards}
                  onResetSeason={() => { 
                      showConfirm({
                          title: "Reset Season",
                          message: "Are you sure? This will wipe all distance data.",
                          onConfirm: () => gameState.setAllUsers({}),
                          isDestructive: true
                      });
                  }}
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
                  onRefreshData={gameState.refreshData}
                />
              )}
              {currentView === "REPORT_BUG" && <ReportBug onReport={gameState.reportBug} />}
              {currentView === "SUGGESTION" && <SuggestionPage onSubmit={gameState.submitSuggestion} />}
            </>
          )}

          {currentView === "RULES" && <GameRules onBack={() => setCurrentView(user ? "DASHBOARD" : "LANDING")} onNavigate={setCurrentView} />}
          {currentView === "WHITEPAPER" && <Whitepaper onBack={() => setCurrentView(user ? "DASHBOARD" : "LANDING")} onNavigate={setCurrentView} />}
          {currentView === "HOW_TO_PLAY" && <HowToPlay onBack={() => setCurrentView(user ? "DASHBOARD" : "LANDING")} />}
          {currentView === "PRIVACY" && <Privacy />}
          {currentView === "TERMS" && <Terms onNavigate={setCurrentView} />}
          {currentView === "COMMUNITY" && <Community />}
        </div>
      </main>

      {/* --- GLOBAL MODALS --- */}

      {/* Insufficient Funds Modal */}
      {showInsufficientFundsModal && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fade-in">
              <div className="bg-gray-900 border-2 border-red-500 rounded-2xl w-full max-w-sm shadow-[0_0_50px_rgba(239,68,68,0.3)] overflow-hidden relative animate-slide-up">
                  <div className="absolute top-0 right-0 p-4">
                      <button onClick={() => setShowInsufficientFundsModal(false)} className="text-gray-500 hover:text-white"><X size={24}/></button>
                  </div>
                  <div className="p-8 text-center flex flex-col items-center">
                      <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4 animate-bounce">
                          <AlertTriangle size={32} className="text-red-500" />
                      </div>
                      <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">{t('app.funds.title')}</h3>
                      <p className="text-gray-400 text-sm mb-6">
                          {t('app.funds.body')}
                      </p>
                      <button 
                          onClick={() => { setShowInsufficientFundsModal(false); setCurrentView("MARKETPLACE"); }}
                          className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                      >
                          <ShoppingBag size={18} /> {t('app.funds.btn')}
                      </button>
                  </div>
              </div>
          </div>
      )}

      {showLoginModal && (
          <LoginModal 
              onClose={() => {
                  setShowLoginModal(false);
                  gameState.setRecoveryMode(false);
              }}
              onLogin={handleLogin}
              onRegister={handleRegister}
              onResetPassword={gameState.resetPassword}
              initialView={recoveryMode ? 'UPDATE_PASSWORD' : 'LOGIN'}
              onUpdatePassword={gameState.updatePassword}
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

      <Footer 
          onNavigate={setCurrentView} 
          currentView={currentView} 
          isAuthenticated={!!user} 
          isHidden={isAnyModalOpen} 
          onInstall={handleFooterInstall}
          isInstallable={!!deferredPrompt || isIOS}
          isStandalone={isStandalone}
      />
    </div>
  );
};

const App: React.FC = () => {
    return (
        <LanguageProvider>
            <GlobalUIProvider>
                <PrivacyProvider>
                    <AppContent />
                </PrivacyProvider>
            </GlobalUIProvider>
        </LanguageProvider>
    );
};

export default App;