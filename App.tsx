
import React, { useState, useEffect, useRef, Suspense } from "react";
import Navbar from "./components/Navbar";
import LandingPage from "./components/LandingPage";
import Dashboard from "./components/Dashboard";
import { ViewState } from "./types";
import { Layers, CheckCircle, AlertTriangle, X, ShoppingBag, Loader2 } from "lucide-react";
import { LanguageProvider, useLanguage } from "./LanguageContext";
import { GlobalUIProvider, useGlobalUI } from "./contexts/GlobalUIContext";
import { PrivacyProvider } from "./contexts/PrivacyContext";
import { MINT_COST, MINT_REWARD_GOV } from "./constants";

// Custom Hooks (Backend Logic)
import { useGameState } from "./hooks/useGameState";
import { useRunWorkflow } from "./hooks/useRunWorkflow";
import { useAchievements } from "./hooks/useAchievements";
import { usePWA } from "./hooks/usePWA";

// --- LAZY LOADED COMPONENTS (Code Splitting) ---
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

const LoadingFallback = () => (
  <div className="flex-1 flex items-center justify-center min-h-[50vh]">
    <Loader2 size={40} className="text-emerald-500 animate-spin" />
  </div>
);

const AppContent: React.FC = () => {
  const { t } = useLanguage();
  const { showToast, showConfirm, playSound } = useGlobalUI(); 
  const [currentView, setCurrentView] = useState<ViewState>("LANDING");
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showInsufficientFundsModal, setShowInsufficientFundsModal] = useState(false);
  
  const { deferredPrompt, isIOS, isStandalone, installPWA } = usePWA();
  const [forceShowPWA, setForceShowPWA] = useState(false);

  const lastHoveredRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleGlobalInteraction = (e: Event) => {
        if (currentView === 'WHITEPAPER') return;

        const target = e.target as HTMLElement;
        const interactiveElement = target.closest('button, a, [role="button"], input[type="submit"], input[type="button"]');

        if (interactiveElement) {
            if (e.type === 'click') {
                playSound('CLICK');
            } else if (e.type === 'mouseover') {
                if (interactiveElement !== lastHoveredRef.current) {
                    playSound('HOVER');
                    lastHoveredRef.current = interactiveElement as HTMLElement;
                }
            }
        } else {
            if (e.type === 'mouseover') {
                lastHoveredRef.current = null;
            }
        }
    };

    window.addEventListener('click', handleGlobalInteraction);
    window.addEventListener('mouseover', handleGlobalInteraction);

    return () => {
        window.removeEventListener('click', handleGlobalInteraction);
        window.removeEventListener('mouseover', handleGlobalInteraction);
    };
  }, [currentView, playSound]);

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

  const runWorkflow = useRunWorkflow({ 
      user, zones, setUser, setZones, 
      logTransaction, 
      recordRun: gameState.recordRun,
      mintZone: gameState.mintZone // FIX: Passata la funzione mintZone al workflow
  });
  
  const achievementSystem = useAchievements({ 
      user, zones, 
      missions: missions, 
      badges: badges,
      setUser,
      logTransaction 
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentView]);

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

  const handleZoneConfirm = async (name: string) => {
      const result = await runWorkflow.confirmZoneCreation(name);
      if (!result?.success) {
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
      setCurrentView("LANDING");
      await gameState.logout();
      setTimeout(() => {
          window.location.reload(); 
      }, 100);
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
    <div className="min-h-screen font-sans flex flex-col relative text-slate-200">
      
      <div className="fixed inset-0 z-[-1] bg-gray-950 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-950 to-black"></div>
          <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900/30 via-gray-950/0 to-transparent blur-[100px]"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/30 via-gray-950/0 to-transparent blur-[100px]"></div>
          <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[50%] h-[50%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent blur-[80px] opacity-50"></div>
          <div 
              className="absolute inset-0 opacity-[0.08]" 
              style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='98' viewBox='0 0 56 98'%3E%3Cpath d='M28 66L0 50L0 16L28 0L56 16L56 50L28 66L28 100' fill='none' stroke='%2334d399' stroke-width='1' /%3E%3C/svg%3E")`, 
                  backgroundSize: '56px 98px'
              }}
          ></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_10%,#020617_100%)] opacity-90"></div>
      </div>

      <div className={`relative z-10 flex flex-col min-h-screen ${showNavbar && !isDashboard ? "pb-40 md:pb-0" : ""}`}>
          {showNavbar && <Navbar currentView={currentView} onNavigate={setCurrentView} user={user} onLogout={handleLogout} />}

          <main className="flex-1 relative flex flex-col">
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
              {isLanding && <LandingPage onLogin={handleOpenLogin} onNavigate={setCurrentView} />}

              {!isLanding && user && (
                <Suspense fallback={<LoadingFallback />}>
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
                </Suspense>
              )}

              <Suspense fallback={<LoadingFallback />}>
                {currentView === "RULES" && <GameRules onBack={() => setCurrentView(user ? "DASHBOARD" : "LANDING")} onNavigate={setCurrentView} isAuthenticated={!!user} />}
                {currentView === "WHITEPAPER" && <Whitepaper onBack={() => setCurrentView(user ? "DASHBOARD" : "LANDING")} onNavigate={setCurrentView} isAuthenticated={!!user} />}
                {currentView === "HOW_TO_PLAY" && <HowToPlay onBack={() => setCurrentView(user ? "DASHBOARD" : "LANDING")} isAuthenticated={!!user} />}
                {currentView === "PRIVACY" && <Privacy />}
                {currentView === "TERMS" && <Terms onNavigate={setCurrentView} />}
                {currentView === "COMMUNITY" && <Community />}
              </Suspense>
            </div>
          </main>

          <Suspense fallback={null}>
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
          </Suspense>
      </div>
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