import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { loadGameState, saveGameState, saveActiveDisturbances, loadActiveDisturbances } from './services/storageService';
import { generateDisturbances, generateWaypoints, fetchNearbyRealPOIs, getDistanceMeters } from './services/locationService';
import { sounds } from './services/soundService';
import { motionService } from './services/motionService';
import { HEROES } from './data/heroesData';
import { ITEMS } from './data/itemsData';
import { BEASTS } from './data/beastsData';
import { Disturbance, Waypoint, CapturedBeast, Mark, GameState, Hero, Item, ToastNotification } from './types';

import MapEngine from './components/MapEngine';
import EncounterModal from './components/EncounterModal';
import SuitcaseSanctuary from './components/SuitcaseSanctuary';
import FieldGuide from './components/FieldGuide';
import WaypointModal from './components/WaypointModal';
import CharacterSelect from './components/CharacterSelect';
import QuestsModal from './components/QuestsModal';
import SettingsModal from './components/SettingsModal';
import Navigation from './components/Navigation';
import Toast from './components/Toast';
import ItemBagModal from './components/ItemBagModal';

// Default initial coordinates (New York City / Woolworth Building MACUSA Headquarters)
const DEFAULT_LAT = 40.7124;
const DEFAULT_LNG = -74.0083;

export default function App() {
  const [gameState, setGameState] = useState<GameState>(() => loadGameState());
  const [playerPos, setPlayerPos] = useState<{ lat: number; lng: number }>({ lat: DEFAULT_LAT, lng: DEFAULT_LNG });
  const [disturbances, setDisturbances] = useState<Disturbance[]>([]);
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [currentTab, setCurrentTab] = useState<string>('map');

  // Modals
  const [activeEncounter, setActiveEncounter] = useState<Disturbance | null>(null);
  const [activeWaypoint, setActiveWaypoint] = useState<Waypoint | null>(null);
  const [showHeroSelect, setShowHeroSelect] = useState<boolean>(!gameState.hasChosenHero);
  const [showQuests, setShowQuests] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showItemBag, setShowItemBag] = useState<boolean>(false);

  // In-game Toast Notification System (replaces native window.alert)
  const [activeToast, setActiveToast] = useState<ToastNotification | null>(null);

  const showToast = (title: string, message: string, type: ToastNotification['type'] = 'info') => {
    setActiveToast({
      id: `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title,
      message,
      type
    });
  };

  // Active Lure Countdown
  const [lureTimeLeft, setLureTimeLeft] = useState<number>(0);

  // Previous position for distance accumulation
  const lastPosRef = useRef<{ lat: number; lng: number }>(playerPos);

  const hero: Hero = HEROES.find((h) => h.id === gameState.heroId) || HEROES[0];
  const buddyInstance: CapturedBeast | null =
    gameState.suitcase.find((b) => b.instanceId === gameState.buddyInstanceId) || null;

  // Save game state whenever it updates
  useEffect(() => {
    saveGameState(gameState);
  }, [gameState]);

  // Sync sound settings with SoundService
  useEffect(() => {
    sounds.toggleSound(gameState.settings?.soundEnabled ?? true);
  }, [gameState.settings?.soundEnabled]);

  // Request Real Geolocation & Motion
  useEffect(() => {
    if (!navigator.geolocation || gameState.settings?.useVirtualGPS) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        handleMovementDelta(latitude, longitude);
        setPlayerPos({ lat: latitude, lng: longitude });
      },
      (err) => {
        console.warn('Geolocation unavailable or denied, falling back to simulated GPS:', err.message);
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [gameState.settings?.useVirtualGPS]);

  // Motion Service Listener for Walking & Pedometer
  useEffect(() => {
    motionService.startListening((_steps) => {
      handleStepTaken(1);
    });

    return () => {
      motionService.stopListening();
    };
  }, []);

  // Handle player movement delta
  const handleMovementDelta = (newLat: number, newLng: number) => {
    const distMeters = getDistanceMeters(lastPosRef.current.lat, lastPosRef.current.lng, newLat, newLng);
    lastPosRef.current = { lat: newLat, lng: newLng };

    // Ignore teleports or micro-jitter (<2m or >500m)
    if (distMeters < 2 || distMeters > 500) return;

    const kmDelta = distMeters / 1000;
    accumulateDistance(kmDelta);
  };

  // Handle steps from device motion
  const handleStepTaken = (deltaSteps: number) => {
    const kmDelta = (deltaSteps * 0.75) / 1000;
    accumulateDistance(kmDelta);
  };

  // Accumulate walking distance
  const accumulateDistance = (kmDelta: number) => {
    setGameState((prev) => {
      const newTotalKm = +(prev.totalKmWalked + kmDelta).toFixed(3);
      const newBuddyProg = +(prev.buddyKmProgress + kmDelta).toFixed(3);

      let newInventory = { ...prev.inventory };
      let newSuitcase = [...prev.suitcase];
      let quests = [...prev.quests];

      // 1.0 km Buddy Milestone
      if (newBuddyProg >= 1.0) {
        if (prev.buddyInstanceId) {
          const treatKeys = ['treat_brioche', 'treat_gilded_knut', 'treat_woodlice', 'treat_moon_pellets'];
          const rewardTreat = treatKeys[Math.floor(Math.random() * treatKeys.length)];
          newInventory[rewardTreat] = (newInventory[rewardTreat] || 0) + 1;
          newInventory.spell_energy = Math.min(100, (newInventory.spell_energy || 0) + 15);

          newSuitcase = newSuitcase.map((b) => {
            if (b.instanceId === prev.buddyInstanceId) {
              const newXP = (b.bondXP || 0) + 20;
              const newLevel = Math.min(10, Math.floor(newXP / 100) + 1);
              return { ...b, bondXP: newXP, bondLevel: newLevel, kmWalked: (b.kmWalked || 0) + 1.0 };
            }
            return b;
          });

          // Celebration
          sounds.playMarkReveal();
          confetti({ particleCount: 30, spread: 50, origin: { y: 0.2 } });
          showToast('Buddy Milestone Reached!', 'Walked 1.0 km! Buddy brought you a treat & 15 Spell Energy!', 'success');

          // Update walk quest
          quests = quests.map((q) => {
            if (q.id === 'daily_walk_km') return { ...q, current: Math.min(q.target, q.current + 1) };
            return q;
          });
        }
      }

      return {
        ...prev,
        totalKmWalked: newTotalKm,
        buddyKmProgress: newBuddyProg >= 1.0 ? +(newBuddyProg - 1.0).toFixed(3) : newBuddyProg,
        inventory: newInventory,
        suitcase: newSuitcase,
        quests,
        stats: {
          ...prev.stats,
          kmWalked: newTotalKm
        }
      };
    });
  };

  // Initialize and persist disturbances with deterministic attempt tracking
  useEffect(() => {
    const markMult = hero.bonusMarkChance || 1.0;
    const stored = loadActiveDisturbances();
    const attempted = gameState.attemptedDisturbances || {};
    const now = Date.now();

    // Filter out already attempted or expired disturbances from storage
    const validStored = stored.filter(
      (d: Disturbance) => d && d.id && !attempted[d.id] && d.expiresAt && d.expiresAt > now
    );

    if (validStored.length >= 6) {
      setDisturbances(validStored);
    } else {
      const needed = Math.max(3, 8 - validStored.length);
      const fresh = generateDisturbances(playerPos.lat, playerPos.lng, needed, markMult);
      const combined = [...validStored, ...fresh];
      setDisturbances(combined);
      saveActiveDisturbances(combined);
    }

    const initialWaypoints = generateWaypoints(playerPos.lat, playerPos.lng, 6);
    setWaypoints(initialWaypoints);

    fetchNearbyRealPOIs(playerPos.lat, playerPos.lng).then((realPOIs) => {
      if (realPOIs && realPOIs.length > 0) {
        setWaypoints(realPOIs);
      }
    });
  }, []);

  // Periodic disturbance spawner & refresh cycle (checks every 45s)
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const attempted = gameState.attemptedDisturbances || {};

      setDisturbances((prev) => {
        // Prune expired or attempted
        const remaining = prev.filter((d) => d.expiresAt > now && !attempted[d.id]);
        const targetCount = gameState.activeLureUntil && gameState.activeLureUntil > now ? 9 : 6;

        if (remaining.length < targetCount) {
          const needed = targetCount - remaining.length;
          const fresh = generateDisturbances(playerPos.lat, playerPos.lng, needed, hero.bonusMarkChance || 1.0);
          const updated = [...remaining, ...fresh];
          saveActiveDisturbances(updated);
          return updated;
        }

        saveActiveDisturbances(remaining);
        return remaining;
      });
    }, 45000);

    return () => clearInterval(timer);
  }, [playerPos, hero.bonusMarkChance, gameState.activeLureUntil, gameState.attemptedDisturbances]);

  // Lure timer countdown
  useEffect(() => {
    if (!gameState.activeLureUntil) {
      setLureTimeLeft(0);
      return;
    }

    const interval = setInterval(() => {
      const remainingSecs = Math.max(0, Math.ceil((gameState.activeLureUntil! - Date.now()) / 1000));
      setLureTimeLeft(remainingSecs);
      if (remainingSecs <= 0) {
        setGameState((prev) => ({ ...prev, activeLureUntil: null }));
        showToast('Suitcase Lure Expired', 'The enchanted aroma has dispersed.', 'info');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState.activeLureUntil]);

  // Player moved manually via virtual joystick
  const handleMovePlayer = (newLat: number, newLng: number) => {
    handleMovementDelta(newLat, newLng);
    setPlayerPos({ lat: newLat, lng: newLng });
  };

  // Select Disturbance from Map
  const handleSelectDisturbance = (distObj: Disturbance, inRange: boolean, distMeters: number) => {
    // Check if disturbance was already attempted
    if (gameState.attemptedDisturbances && gameState.attemptedDisturbances[distObj.id]) {
      showToast('Trace Dissipated', 'This magical disturbance has already departed.', 'info');
      setDisturbances((prev) => prev.filter((d) => d.id !== distObj.id));
      return;
    }

    if (!inRange) {
      showToast(
        'Out of Interaction Range',
        `Too far! Move closer (${distMeters}m away) to investigate this magical trace.`,
        'warning'
      );
      return;
    }

    setActiveEncounter(distObj);
    sounds.playWandCast('good');

    setGameState((prev) => ({
      ...prev,
      seenBeasts: {
        ...prev.seenBeasts,
        [distObj.beast.id]: (prev.seenBeasts[distObj.beast.id] || 0) + 1
      },
      stats: {
        ...prev.stats,
        totalEncounters: prev.stats.totalEncounters + 1
      }
    }));
  };

  // Select Waypoint from Map
  const handleSelectWaypoint = (wp: Waypoint, inRange: boolean, distMeters: number) => {
    setActiveWaypoint({ ...wp, inRange, distMeters });
  };

  // Consume an inventory item
  const handleConsumeItem = (itemKey: string, amount: number = 1) => {
    setGameState((prev) => ({
      ...prev,
      inventory: {
        ...prev.inventory,
        [itemKey]: Math.max(0, (prev.inventory[itemKey] || 0) - amount)
      },
      stats: {
        ...prev.stats,
        totalSpellsCast: itemKey === 'spell_energy' ? prev.stats.totalSpellsCast + amount : prev.stats.totalSpellsCast
      }
    }));
  };

  // Capture Success Handler
  const handleCaptureSuccess = ({ beastId, cp, mark }: { beastId: string; cp: number; mark: Mark | null }) => {
    const newBeast: CapturedBeast = {
      instanceId: `inst_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      beastId,
      nickname: null,
      cp,
      mark,
      bondLevel: 1,
      bondXP: 0,
      capturedAt: Date.now(),
      timesFed: 0,
      timesPetted: 0
    };

    setGameState((prev) => {
      const updatedQuests = prev.quests.map((q) => {
        if (q.id === 'daily_capture_two' || q.id === 'quest_first_catch') return { ...q, current: q.current + 1 };
        if ((q.id === 'daily_find_mark' || q.id === 'quest_find_mark') && mark) return { ...q, current: q.current + 1 };
        return q;
      });

      return {
        ...prev,
        suitcase: [newBeast, ...prev.suitcase],
        buddyInstanceId: prev.buddyInstanceId || newBeast.instanceId,
        caughtBeasts: {
          ...prev.caughtBeasts,
          [beastId]: (prev.caughtBeasts[beastId] || 0) + 1
        },
        attemptedDisturbances: {
          ...prev.attemptedDisturbances,
          ...(activeEncounter ? { [activeEncounter.id]: { status: 'captured' as const, timestamp: Date.now() } } : {})
        },
        stats: {
          ...prev.stats,
          totalCaptures: prev.stats.totalCaptures + 1,
          marksDiscovered: mark ? prev.stats.marksDiscovered + 1 : prev.stats.marksDiscovered
        },
        quests: updatedQuests
      };
    });

    if (activeEncounter) {
      setDisturbances((prev) => {
        const remaining = prev.filter((d) => d.id !== activeEncounter.id);
        saveActiveDisturbances(remaining);
        return remaining;
      });
    }
  };

  // Beast Flee Handler (breaks free and runs away)
  const handleFlee = (disturbanceId: string) => {
    setGameState((prev) => ({
      ...prev,
      attemptedDisturbances: {
        ...prev.attemptedDisturbances,
        [disturbanceId]: { status: 'fled' as const, timestamp: Date.now() }
      }
    }));

    setDisturbances((prev) => {
      const remaining = prev.filter((d) => d.id !== disturbanceId);
      saveActiveDisturbances(remaining);
      return remaining;
    });
  };

  // Voluntarily leaving/fleeing encounter without capture
  const handleCloseEncounter = () => {
    if (activeEncounter) {
      setGameState((prev) => ({
        ...prev,
        attemptedDisturbances: {
          ...prev.attemptedDisturbances,
          [activeEncounter.id]: { status: 'escaped' as const, timestamp: Date.now() }
        }
      }));

      setDisturbances((prev) => {
        const remaining = prev.filter((d) => d.id !== activeEncounter.id);
        saveActiveDisturbances(remaining);
        return remaining;
      });
      setActiveEncounter(null);
    }
  };

  // Waypoint Spin Success
  const handleWaypointSpinSuccess = (waypointId: string, rewards: Record<string, number>) => {
    setGameState((prev) => {
      const newInventory = { ...prev.inventory };
      if (rewards.spell_energy) newInventory.spell_energy = Math.min(100, (newInventory.spell_energy || 0) + rewards.spell_energy);
      if (rewards.knuts) newInventory.knuts = (newInventory.knuts || 0) + rewards.knuts;

      Object.keys(rewards).forEach((k) => {
        if (k.startsWith('treat_') || k === 'beast_lure') {
          newInventory[k] = (newInventory[k] || 0) + rewards[k];
        }
      });

      const updatedQuests = prev.quests.map((q) => {
        if (q.id === 'daily_spin_inns' || q.id === 'quest_waypoint_spin') return { ...q, current: q.current + 1 };
        return q;
      });

      return {
        ...prev,
        inventory: newInventory,
        stats: {
          ...prev.stats,
          totalWaypointsSpun: prev.stats.totalWaypointsSpun + 1
        },
        quests: updatedQuests
      };
    });

    setWaypoints((prev) =>
      prev.map((wp) => (wp.id === waypointId ? { ...wp, cooldownUntil: Date.now() + 5 * 60 * 1000 } : wp))
    );

    showToast('Waypoint Harvested!', 'Recovered Spell Energy and Wizarding Provisions!', 'success');
  };

  // Beast Feeding in Sanctuary
  const handleFeedBeast = (instanceId: string, treatKey: string, xpGain: number) => {
    handleConsumeItem(treatKey, 1);

    setGameState((prev) => {
      let isBuddy = false;
      const updatedSuitcase = prev.suitcase.map((b) => {
        if (b.instanceId === instanceId) {
          if (prev.buddyInstanceId === instanceId) isBuddy = true;
          const newXP = (b.bondXP || 0) + xpGain;
          const newLevel = Math.min(10, Math.floor(newXP / 100) + 1);
          return {
            ...b,
            bondXP: newXP,
            bondLevel: newLevel,
            timesFed: (b.timesFed || 0) + 1
          };
        }
        return b;
      });

      const updatedQuests = prev.quests.map((q) => {
        if (q.id === 'daily_feed_buddy' && isBuddy) return { ...q, current: q.current + 1 };
        return q;
      });

      return {
        ...prev,
        suitcase: updatedSuitcase,
        quests: updatedQuests,
        stats: {
          ...prev.stats,
          treatsFed: prev.stats.treatsFed + 1
        }
      };
    });
  };

  // Beast Petting in Sanctuary
  const handlePetBeast = (instanceId: string) => {
    setGameState((prev) => {
      const updatedSuitcase = prev.suitcase.map((b) => {
        if (b.instanceId === instanceId) {
          const newXP = (b.bondXP || 0) + 5;
          const newLevel = Math.min(10, Math.floor(newXP / 100) + 1);
          return {
            ...b,
            bondXP: newXP,
            bondLevel: newLevel,
            timesPetted: (b.timesPetted || 0) + 1
          };
        }
        return b;
      });
      return { ...prev, suitcase: updatedSuitcase };
    });
  };

  // Rename Beast in Suitcase
  const handleRenameBeast = (instanceId: string, newName: string) => {
    setGameState((prev) => ({
      ...prev,
      suitcase: prev.suitcase.map((b) => (b.instanceId === instanceId ? { ...b, nickname: newName } : b))
    }));
    showToast('Name Updated', `Companion is now named "${newName}"!`, 'info');
  };

  // Set Buddy Companion
  const handleSetBuddy = (instanceId: string) => {
    setGameState((prev) => ({
      ...prev,
      buddyInstanceId: instanceId
    }));
    sounds.playPurr();
    showToast('Buddy Companion Assigned', 'They will now walk alongside you on the magical map!', 'success');
  };

  // Claim Quest Reward
  const handleClaimQuestReward = (questId: string, reward: Record<string, number>) => {
    setGameState((prev) => {
      const newInventory = { ...prev.inventory };
      Object.keys(reward).forEach((k) => {
        newInventory[k] = (newInventory[k] || 0) + reward[k];
      });

      return {
        ...prev,
        inventory: newInventory,
        quests: prev.quests.map((q) => (q.id === questId ? { ...q, claimed: true } : q))
      };
    });
    showToast('Task Completed!', 'Claimed Ministry bounty rewards!', 'success');
  };

  // Reset Game
  const handleResetGame = () => {
    localStorage.clear();
    window.location.reload();
  };

  // Activate Lure
  const handleActivateLure = () => {
    if ((gameState.inventory.beast_lure || 0) <= 0) {
      showToast('Suitcase Lure Needed', 'Spin Waypoints or complete MACUSA tasks to obtain one!', 'warning');
      return;
    }
    handleConsumeItem('beast_lure', 1);
    sounds.playMarkReveal();

    const lureDist = generateDisturbances(playerPos.lat, playerPos.lng, 4, (hero.bonusMarkChance || 1.0) * 1.8);
    setDisturbances((prev) => {
      const combined = [...lureDist, ...prev];
      saveActiveDisturbances(combined);
      return combined;
    });

    setGameState((prev) => ({
      ...prev,
      activeLureUntil: Date.now() + 15 * 60 * 1000
    }));

    showToast(
      'Enchanted Lure Activated!',
      '4 rare Fantastic Beasts have gathered at your location for 15 minutes!',
      'success'
    );
  };

  // Use Satchel Item directly from Bag
  const handleUseBagItem = (itemKey: string) => {
    if (itemKey === 'energy_crystal') {
      if ((gameState.inventory.energy_crystal || 0) <= 0) return;
      handleConsumeItem('energy_crystal', 1);
      setGameState((prev) => ({
        ...prev,
        inventory: {
          ...prev.inventory,
          spell_energy: Math.min(100, (prev.inventory.spell_energy || 0) + 40)
        }
      }));
      sounds.playSpinChime();
      showToast('Energy Restored!', 'Shattered a Leyline Crystal! Gained +40 Spell Energy ⚡', 'energy');
    } else if (itemKey === 'beast_lure') {
      handleActivateLure();
    }
  };

  const unreadTasksCount = gameState.quests.filter((q) => q.current >= q.target && !q.claimed).length;

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* Toast Notification Banner System */}
      <Toast toast={activeToast} onDismiss={() => setActiveToast(null)} />

      {/* 1. Main Map View */}
      <MapEngine
        playerPos={playerPos}
        onMovePlayer={handleMovePlayer}
        disturbances={disturbances}
        waypoints={waypoints}
        selectedHeroId={gameState.heroId}
        buddyInstance={buddyInstance}
        buddyProgressKm={gameState.buddyKmProgress}
        totalKmWalked={gameState.totalKmWalked}
        totalSteps={gameState.totalSteps}
        onOpenBuddySelect={() => setCurrentTab('suitcase')}
        driveMode={gameState.settings.driveMode}
        onToggleDriveMode={() =>
          setGameState((prev) => ({
            ...prev,
            settings: { ...prev.settings, driveMode: !prev.settings.driveMode }
          }))
        }
        useVirtualGPS={gameState.settings.useVirtualGPS}
        onToggleVirtualGPS={() =>
          setGameState((prev) => ({
            ...prev,
            settings: { ...prev.settings, useVirtualGPS: !prev.settings.useVirtualGPS }
          }))
        }
        onSelectDisturbance={handleSelectDisturbance}
        onSelectWaypoint={handleSelectWaypoint}
        activeLureTimeLeft={lureTimeLeft}
      />

      {/* 2. Top-Level Tab Views */}
      {currentTab === 'suitcase' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 500 }}>
          <SuitcaseSanctuary
            suitcase={gameState.suitcase}
            inventory={gameState.inventory}
            hero={hero}
            buddyInstanceId={gameState.buddyInstanceId}
            onSetBuddy={handleSetBuddy}
            onFeedBeast={handleFeedBeast}
            onPetBeast={handlePetBeast}
            onRenameBeast={handleRenameBeast}
            onClose={() => setCurrentTab('map')}
            onShowToast={showToast}
          />
        </div>
      )}

      {currentTab === 'guide' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 500 }}>
          <FieldGuide
            caughtBeasts={gameState.caughtBeasts}
            seenBeasts={gameState.seenBeasts}
            onClose={() => setCurrentTab('map')}
          />
        </div>
      )}

      {/* 3. Modals */}
      {activeEncounter && (
        <EncounterModal
          disturbance={activeEncounter}
          hero={hero}
          inventory={gameState.inventory}
          onConsumeItem={handleConsumeItem}
          onCaptureSuccess={handleCaptureSuccess}
          onFlee={handleFlee}
          onClose={handleCloseEncounter}
          onShowToast={showToast}
        />
      )}

      {activeWaypoint && (
        <WaypointModal
          waypoint={activeWaypoint}
          inRange={activeWaypoint.inRange ?? false}
          onSpinSuccess={handleWaypointSpinSuccess}
          onClose={() => setActiveWaypoint(null)}
        />
      )}

      {(showQuests || currentTab === 'tasks') && (
        <QuestsModal
          quests={gameState.quests}
          onClaimReward={handleClaimQuestReward}
          onClose={() => {
            setShowQuests(false);
            if (currentTab === 'tasks') setCurrentTab('map');
          }}
        />
      )}

      {(showSettings || currentTab === 'settings') && (
        <SettingsModal
          settings={gameState.settings}
          currentHeroId={gameState.heroId}
          onUpdateSettings={(newSettings) =>
            setGameState((prev) => ({
              ...prev,
              settings: { ...prev.settings, ...newSettings }
            }))
          }
          onChangeHero={() => {
            setShowSettings(false);
            setShowHeroSelect(true);
          }}
          onResetGame={handleResetGame}
          onClose={() => {
            setShowSettings(false);
            if (currentTab === 'settings') setCurrentTab('map');
          }}
          onShowToast={showToast}
        />
      )}

      {showHeroSelect && (
        <CharacterSelect
          currentHeroId={gameState.heroId}
          isFirstTime={!gameState.hasChosenHero}
          onConfirmHero={(chosenId) => {
            setGameState((prev) => ({
              ...prev,
              heroId: chosenId,
              hasChosenHero: true
            }));
            setShowHeroSelect(false);
            showToast('Hero Selected', `You are exploring as ${HEROES.find(h => h.id === chosenId)?.name}!`, 'info');
          }}
        />
      )}

      {showItemBag && (
        <ItemBagModal
          inventory={gameState.inventory}
          onUseItem={handleUseBagItem}
          onOpenSanctuary={() => {
            setShowItemBag(false);
            setCurrentTab('suitcase');
          }}
          onClose={() => setShowItemBag(false)}
        />
      )}

      {/* Quick Lure & Satchel Bag HUD Buttons */}
      {currentTab === 'map' && (
        <div style={{ position: 'fixed', left: '16px', top: 'calc(var(--safe-top) + 60px)', zIndex: 400, display: 'flex', gap: '8px' }}>
          <button
            onClick={handleActivateLure}
            className="btn-magical"
            style={{ padding: '6px 12px', fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            title="Activate Suitcase Lure"
          >
            <span>🧳</span>
            <span>Lure (x{gameState.inventory.beast_lure || 0})</span>
          </button>

          <button
            onClick={() => setShowItemBag(true)}
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(15, 23, 42, 0.85)' }}
            title="Open Enchanted Satchel"
          >
            <span>🎒</span>
            <span>Bag</span>
          </button>
        </div>
      )}

      {/* 4. Bottom Navigation Bar */}
      <Navigation
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab === 'tasks') setShowQuests(true);
          else if (tab === 'settings') setShowSettings(true);
          else setCurrentTab(tab);
        }}
        unreadTasksCount={unreadTasksCount}
        suitcaseCount={gameState.suitcase.length}
      />
    </div>
  );
}
