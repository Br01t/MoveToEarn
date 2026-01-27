import React, { useState, useEffect, useRef, Suspense } from "react";
import Navbar from "./components/Navbar";
import LandingPage from "./components/LandingPage";
import Dashboard from "./components/Dashboard";
import { ViewState, Zone } from "./types";
import { Layers, CheckCircle, AlertTriangle, X, ShoppingBag, Loader2 } from "lucide-react";
import { LanguageProvider, useLanguage } from "./LanguageContext";
import { GlobalUIProvider, useGlobalUI } from "./contexts/GlobalUIContext";
import { PrivacyProvider } from "./contexts/PrivacyContext";
import { MINT_COST, MINT_REWARD_GOV, CONQUEST_COST } from "./constants";

// Custom Hooks
import { useGameState } from "./hooks/useGameState";
import { useRunWorkflow } from "./hooks/useRunWorkflow";
import { useAchievements } from "./hooks/useAchievements";
import { usePWA } from "./hooks/usePWA";

// Lazy Loaded Components
const Marketplace = React.lazy(() => import("./components/Marketplace"));
const Wallet = React.lazy(() => import("./components/Wallet"));
const Inventory = React.lazy(() => import("./components/Inventory"));
const Leaderboard = React.lazy(() => import("./components/Leaderboard"));
const Profile = React.lazy(() => import("./components/Profile"));
const Admin = React.lazy(() => import("./components/Admin"));
const Missions = React.lazy(() => import("./components/Missions"));
const GameRules = React.lazy(() => import("./components/pages/GameRules").then(module => ({ default: module.GameRules })));
const Whitepaper = React.lazy(() => import("./components/pages/Whitepaper").then(module => ({ default: module.Whitepaper })));
const HowToPlay = React.lazy(() => import("./components/pages/HowToPlay"));
const Privacy = React.lazy(() => import("./components/pages/Privacy"));
const Terms = React.lazy(() => import("./components/pages/Terms"));
const Community = React.lazy(() => import("./components/pages/Community"));
const ReportBug = React.lazy(() => import("./components/pages/ReportBug"));
const SuggestionPage = React.lazy(() => import("./components/pages/SuggestionPage"));
const Footer = React.lazy(() => import("./components/Footer"));

// Modals
const AchievementModal = React.lazy(() => import("./components/AchievementModal"));
const ZoneDiscoveryModal = React.lazy(() => import("./components/ZoneDiscoveryModal"));
const RunSummaryModal = React.lazy(() => import("./components/RunSummaryModal"));
const SyncModal = React.lazy(() => import("./components/dashboard/SyncModal"));
const LoginModal = React.lazy(() => import("./components/auth/LoginModal"));
const PWAInstallPrompt = React.lazy(() => import("./components/PWAInstallPrompt"));
const CookieBanner = React.lazy(() => import("./components/privacy/CookieBanner"));
const InsufficientFundsModal = React.lazy(() => import("./components/InsufficientFundsModal"));

const LoadingFallback = () => (
  <div className="flex-1 flex items-center justify-center min-h-[50vh]">
    <Loader2 size={40} className="text-emerald-500 animate-spin" />
  </div>
);

const AppContent: React.FC = () => {
  const { t } = useLanguage();
  const { showToast, playSound } = useGlobalUI(); 
  const [currentView, setCurrentView] = useState<ViewState>("LANDING");
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showFundsModal, setShowFundsModal] = useState<{required: number, current: number} | null>(null);
  
  const { deferredPrompt, isIOS, isStandalone, installPWA } = usePWA();
  const [forceShowPWA, setForceShowPWA] = useState(false);

  const { 
    user, zones, setUser, setZones, loading, transactions, logTransaction, recoveryMode,
    lastBurnTimestamp, totalBurned, govToRunRate, marketItems,
    missions, badges, bugReports, suggestions, leaderboards,
    levels, allUsers, isSyncing, syncError, refreshData, ...gameState
  } = useGameState();

  const runWorkflow = useRunWorkflow({ 
      user, zones, setUser, setZones, 
      logTransaction, 
      recordRun: gameState.recordRun,
      mintZone: gameState.mintZone 
  });
  
  const achievementSystem = useAchievements({ 
      user, zones, missions, badges, setUser, logTransaction 
  });

  const handleClaimZone = (zoneId: string) => {
      if (user && user.runBalance < CONQUEST_COST) {
          setShowFundsModal({ required: CONQUEST_COST, current: user.runBalance });
          return;
      }
      gameState.claimZone(zoneId);
  };

  const handleBoostZone = (zoneId: string) => {
      if (!user) return;
      const itm = user.inventory.find(i => i.type === 'BOOST');
      if (itm) {
          gameState.useItem(itm, zoneId);
      } else {
          showToast(t('alert.need_item') + " Energy Drink", "ERROR");
      }
  };

  const handleDefendZone = (zoneId: string) => {
      if (!user) return;
      const itm = user.inventory.find(i => i.type === 'DEFENSE');
      if (itm) {
          gameState.useItem(itm, zoneId);
      } else {
          showToast(t('alert.need_item') + " Zone Shield", "ERROR");
      }
  };

  useEffect(() => {
    const handleGlobalInteraction = (e: MouseEvent) => {
        if (user && currentView !== "ADMIN") {
            const target = e.target as HTMLElement;
            const isClickable = target.closest('button, a, select, input, [role="button"]') || 
                               window.getComputedStyle(target).cursor === 'pointer';
            if (isClickable) playSound('CLICK');
        }
    };
    window.addEventListener('mousedown', handleGlobalInteraction, true);
    return () => window.removeEventListener('mousedown', handleGlobalInteraction, true);
  }, [user, currentView, playSound]);

  useEffect(() => {
    if (!loading) {
        if (user) {
            if (currentView === "LANDING") {
                setCurrentView("DASHBOARD");
                setShowLoginModal(false);
            }
            if (currentView === "ADMIN" && !user.isAdmin) {
                setCurrentView("DASHBOARD");
                showToast("Access Denied", "ERROR");
            }
        } else {
            const publicPages: ViewState[] = ["RULES", "WHITEPAPER", "HOW_TO_PLAY", "PRIVACY", "TERMS", "COMMUNITY"];
            if (currentView !== "LANDING" && !publicPages.includes(currentView)) setCurrentView("LANDING");
        }
    }
  }, [user, loading, currentView, showToast]);

  if (loading) return <LoadingFallback />;

  const isLanding = currentView === "LANDING";
  const showNavbar = !isLanding && user;
  const isDashboard = currentView === "DASHBOARD";

  return (
    <div className="min-h-screen font-sans flex flex-col relative text-slate-200">
      <div className="fixed inset-0 z-[-1] bg-gray-950 pointer-events-none overflow-hidden" aria-hidden="true">
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-950 to-black"></div>
      </div>

      <div className={`relative z-10 flex flex-col min-h-screen ${showNavbar && !isDashboard ? "pb-40 md:pb-0" : ""}`}>
          {showNavbar && <Navbar currentView={currentView} onNavigate={setCurrentView} user={user} onLogout={gameState.logout} />}

          <main className="flex-1 relative flex flex-col" role="main">
            <Suspense fallback={null}>
                <PWAInstallPrompt 
                    isAuthenticated={!!user} 
                    deferredPrompt={deferredPrompt}
                    isIOS={isIOS}
                    isStandalone={isStandalone}
                    onInstall={installPWA}
                    forceShow={forceShowPWA}
                    onCloseForce={() => setForceShowPWA(false)}
                />
                <CookieBanner onNavigate={setCurrentView} />
            </Suspense>

            <div className="flex-1 relative">
              {isLanding && <LandingPage onLogin={() => setShowLoginModal(true)} onNavigate={setCurrentView} />}

              {!isLanding && user && (
                <Suspense fallback={<LoadingFallback />}>
                  {currentView === "DASHBOARD" && (
                    <Dashboard 
                      user={user} zones={zones} badges={badges} users={allUsers} 
                      isSyncing={isSyncing} syncError={syncError} onRefreshData={refreshData}
                      onSyncRun={runWorkflow.startSync} onClaim={handleClaimZone} 
                      onBoost={handleBoostZone} onDefend={handleDefendZone} 
                      onNavigate={setCurrentView} onOpenSync={() => setShowSyncModal(true)} onGetZoneLeaderboard={gameState.fetchZoneLeaderboard} 
                    />
                  )}
                  {currentView === "MARKETPLACE" && <Marketplace user={user} items={marketItems} onBuy={gameState.buyItem} />}
                  {currentView === "WALLET" && <Wallet user={user} transactions={transactions} onBuyFiat={gameState.buyFiatGov} govToRunRate={govToRunRate} onSwapGovToRun={gameState.swapGovToRun} lastBurnTimestamp={lastBurnTimestamp} totalBurned={totalBurned} />}
                  {currentView === "INVENTORY" && <Inventory user={user} zones={zones} onUseItem={gameState.useItem} />}
                  {currentView === "LEADERBOARD" && <Leaderboard users={allUsers} currentUser={user} zones={zones} badges={badges} leaderboards={leaderboards} levels={levels} />}
                  {currentView === "PROFILE" && <Profile user={user} zones={zones} missions={missions} badges={badges} levels={levels} leaderboards={leaderboards} bugReports={bugReports} suggestions={suggestions} allUsers={allUsers} onUpdateUser={gameState.updateUser} onUpgradePremium={gameState.upgradePremium} onClaim={handleClaimZone} onBoost={handleBoostZone} onDefend={handleDefendZone} onGetZoneLeaderboard={gameState.fetchZoneLeaderboard} />}
                  {currentView === "MISSIONS" && <Missions user={user} zones={zones} missions={missions} badges={badges} />}
                  {currentView === "ADMIN" && user.isAdmin && <Admin marketItems={marketItems} missions={missions} badges={badges} zones={zones} govToRunRate={govToRunRate} bugReports={bugReports} suggestions={suggestions} leaderboards={leaderboards} levels={levels} allUsers={allUsers} lastBurnTimestamp={lastBurnTimestamp} onAddItem={gameState.addItem} onUpdateItem={gameState.updateItem} onRemoveItem={gameState.removeItem} onAddMission={gameState.addMission} onUpdateMission={gameState.updateMission} onRemoveMission={gameState.removeMission} onAddBadge={gameState.addBadge} onUpdateBadge={gameState.updateBadge} onRemoveBadge={gameState.removeBadge} onUpdateZone={gameState.updateZone} onDeleteZone={gameState.deleteZone} onTriggerBurn={gameState.triggerGlobalBurn} onDistributeRewards={gameState.distributeZoneRewards} onResetSeason={() => {}} onUpdateExchangeRate={gameState.setGovToRunRate} onRefreshData={refreshData} onRevokeUserAchievement={gameState.revokeUserAchievement} onAdjustBalance={gameState.adjustUserBalance} />}
                  {currentView === "REPORT_BUG" && <ReportBug onReport={gameState.reportBug} />}
                  {currentView === "SUGGESTION" && <SuggestionPage onSubmit={gameState.submitSuggestion} />}
                </Suspense>
              )}

              <Suspense fallback={<LoadingFallback />}>
                {currentView === "RULES" && <GameRules onBack={() => setCurrentView(user ? "DASHBOARD" : "LANDING")} onNavigate={setCurrentView} isAuthenticated={!!user} />}
                {currentView === "WHITEPAPER" && <Whitepaper onBack={() => setCurrentView(user ? "DASHBOARD" : "LANDING")} onNavigate={setCurrentView} isAuthenticated={!!user} />}
                {currentView === "HOW_TO_PLAY" && <HowToPlay onBack={() => setCurrentView(user ? "DASHBOARD" : "LANDING")} isAuthenticated={!!user} />}
                {currentView === "PRIVACY" && <Privacy onNavigate={setCurrentView} />}
                {currentView === "TERMS" && <Terms onNavigate={setCurrentView} />}
                {currentView === "COMMUNITY" && <Community />}
              </Suspense>
            </div>
          </main>

          <Suspense fallback={null}>
            {showLoginModal && <LoginModal onClose={() => { setShowLoginModal(false); gameState.setRecoveryMode(false); }} onLogin={gameState.login} onRegister={gameState.register} onResetPassword={gameState.resetPassword} onUpdatePassword={gameState.updatePassword} initialView={recoveryMode ? 'UPDATE_PASSWORD' : 'LOGIN'} />}
            {showSyncModal && user && <SyncModal onClose={() => setShowSyncModal(false)} onNavigate={setCurrentView} onSyncRun={runWorkflow.startSync} user={user} />}
            {showFundsModal && <InsufficientFundsModal onClose={() => setShowFundsModal(null)} onNavigate={setCurrentView} requiredAmount={showFundsModal.required} currentBalance={showFundsModal.current} />}
            {runWorkflow.zoneCreationQueue.length > 0 && <ZoneDiscoveryModal isOpen={true} data={{ lat: runWorkflow.zoneCreationQueue[0].lat, lng: runWorkflow.zoneCreationQueue[0].lng, defaultName: runWorkflow.zoneCreationQueue[0].defaultName, cost: MINT_COST, reward: MINT_REWARD_GOV }} onConfirm={runWorkflow.confirmZoneCreation} onDiscard={runWorkflow.discardZoneCreation} />}
            {achievementSystem.achievementQueue.length > 0 && <AchievementModal key={achievementSystem.achievementQueue[0].item.id} data={achievementSystem.achievementQueue[0]} onClose={achievementSystem.handleCloseNotification} onClaimAll={achievementSystem.handleClaimAllNotifications} remainingCount={achievementSystem.achievementQueue.length - 1} />}
            {runWorkflow.runSummary && <RunSummaryModal data={runWorkflow.runSummary} onClose={runWorkflow.closeSummary} />}
            <Footer onNavigate={setCurrentView} currentView={currentView} isAuthenticated={!!user} />
          </Suspense>
      </div>
    </div>
  );
};

const App: React.FC = () => (
    <LanguageProvider>
      <GlobalUIProvider>
        <PrivacyProvider>
          <AppContent />
        </PrivacyProvider>
      </GlobalUIProvider>
    </LanguageProvider>
);

export default App;