import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { loadGameState, saveGameState, saveActiveDisturbances, loadActiveDisturbances } from './services/storageService';
import { generateDisturbances, generateWaypoints, fetchNearbyRealPOIs, getDistanceMeters } from './services/locationService';
import { sounds } from './services/soundService';
import { haptics } from './services/hapticsService';
import { bondService } from './services/bondService';
import { motionService } from './services/motionService';
import { HEROES } from './data/heroesData';
import { ITEMS } from './data/itemsData';
import { BEASTS } from './data/beastsData';
import { Disturbance, Waypoint, CapturedBeast, Mark, GameState, Hero, Item, ToastNotification, CauldronSlot, MentorId, MasterclassLesson } from './types';

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
import ApparitionModal, { ApparitionTarget } from './components/ApparitionModal';
import RaidModal from './components/RaidModal';
import ApothecaryShopModal from './components/ApothecaryShopModal';
import CharacterProgressionModal from './components/CharacterProgressionModal';
import MentorMasterclassModal from './components/MentorMasterclassModal';
import { alchemistService } from './services/alchemistService';

// Default initial coordinates (New York City / Woolworth Building MACUSA Headquarters)
const DEFAULT_LAT = 40.7124;
const DEFAULT_LNG = -74.0083;

export default function App() {
  const [gameState, setGameState] = useState<GameState>(() => loadGameState());
  const [playerPos, setPlayerPos] = useState<{ lat: number; lng: number }>({ lat: DEFAULT_LAT, lng: DEFAULT_LNG });
  const [disturbances, setDisturbances] = useState<Disturbance[]>([]);
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [currentTab, setCurrentTab] = useState<string>('map');
  const [suitcaseInitialTab, setSuitcaseInitialTab] = useState<'menagerie' | 'potions'>('menagerie');

  // Modals
  const [activeEncounter, setActiveEncounter] = useState<Disturbance | null>(null);
  const [activeWaypoint, setActiveWaypoint] = useState<Waypoint | null>(null);
  const [activeRaid, setActiveRaid] = useState<Waypoint | null>(null);
  const [showHeroSelect, setShowHeroSelect] = useState<boolean>(!gameState.hasChosenHero);
  const [showQuests, setShowQuests] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showItemBag, setShowItemBag] = useState<boolean>(false);
  const [showShop, setShowShop] = useState<boolean>(false);
  const [showCharacterProgression, setShowCharacterProgression] = useState<boolean>(false);
  const [showMentorModal, setShowMentorModal] = useState<boolean>(false);
  const [apparitionTarget, setApparitionTarget] = useState<ApparitionTarget | null>(null);
  const [isApparating, setIsApparating] = useState<boolean>(false);
  const [isLocationPinned, setIsLocationPinned] = useState<boolean>(false);

  // In-game Toast Notification System (replaces native window.alert)
  const [activeToast, setActiveToast] = useState<ToastNotification | null>(null);

  const showToast = React.useCallback((title: string, message: string, type: ToastNotification['type'] = 'info') => {
    setActiveToast({
      id: `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title,
      message,
      type
    });
  }, []);

  const handleDismissToast = React.useCallback(() => {
    setActiveToast(null);
  }, []);

  // Active Lure Countdown
  const [lureTimeLeft, setLureTimeLeft] = useState<number>(0);

  // Previous position for distance accumulation
  const lastPosRef = useRef<{ lat: number; lng: number }>(playerPos);
  // Coordinate anchor for the active spawn cluster
  const lastSpawnPosRef = useRef<{ lat: number; lng: number }>(playerPos);

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

  // Battery Saver Low-Power mode class toggle
  useEffect(() => {
    if (gameState.settings?.batterySaver) {
      document.body.classList.add('battery-saver');
    } else {
      document.body.classList.remove('battery-saver');
    }
  }, [gameState.settings?.batterySaver]);

  // Request Real Geolocation & Motion
  useEffect(() => {
    if (!navigator.geolocation || gameState.settings?.useVirtualGPS) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        handleMovementDelta(latitude, longitude);
        if (!isLocationPinned) {
          setPlayerPos({ lat: latitude, lng: longitude });
          checkAndSpawnAtLocation(latitude, longitude);
        }
      },
      (err) => {
        console.warn('Geolocation unavailable or denied, falling back to simulated GPS:', err.message);
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [gameState.settings?.useVirtualGPS, isLocationPinned]);

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

          // Buddy also discovers rare botanical flora!
          const botanicalKeys = ['ing_dittany', 'ing_fluxweed', 'ing_mooncalf_fur', 'ing_shrivelfig', 'ing_horklump_juice'];
          const rewardBotanical = botanicalKeys[Math.floor(Math.random() * botanicalKeys.length)];
          newInventory[rewardBotanical] = (newInventory[rewardBotanical] || 0) + 1;

          newInventory.spell_energy = Math.min(100, (newInventory.spell_energy || 0) + 15);

          newSuitcase = newSuitcase.map((b) => {
            if (b.instanceId === prev.buddyInstanceId) {
              const res = bondService.addXP(b.bondLevel, b.bondXP, 25);
              return { ...b, bondXP: res.newXP, bondLevel: res.newLevel, cp: b.cp + res.cpBonus, kmWalked: (b.kmWalked || 0) + 1.0 };
            }
            return b;
          });

          // Celebration
          sounds.playMarkReveal();
          confetti({ particleCount: 30, spread: 50, origin: { y: 0.2 } });
          showToast('Buddy Milestone Reached!', 'Walked 1.0 km! Buddy brought you a treat, botanical herb, & 15 Spell Energy!', 'success');

          // Update walk quest
          quests = quests.map((q) => {
            if (q.id === 'daily_walk_km') return { ...q, current: Math.min(q.target, q.current + 1) };
            return q;
          });
        }
      }

      // Accelerate simmering cauldrons with walking distance (100m = 10s faster)
      let cauldrons = prev.cauldrons ? [...prev.cauldrons] : [];
      if (kmDelta > 0 && cauldrons.length > 0) {
        const bonusMs = Math.round(kmDelta * 100) * 1000;
        cauldrons = cauldrons.map((c) => {
          if (c.recipeId && c.finishesAt && !c.isReady) {
            const newFinish = Math.max(Date.now(), c.finishesAt - bonusMs);
            return { ...c, finishesAt: newFinish, isReady: Date.now() >= newFinish };
          }
          return c;
        });
      }

      return {
        ...prev,
        totalKmWalked: newTotalKm,
        buddyKmProgress: newBuddyProg >= 1.0 ? +(newBuddyProg - 1.0).toFixed(3) : newBuddyProg,
        inventory: newInventory,
        suitcase: newSuitcase,
        cauldrons,
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

    const initialWaypoints = generateWaypoints(playerPos.lat, playerPos.lng, 7);
    setWaypoints(initialWaypoints);
  }, []);

  // Dynamic Movement Cluster Spawner: generates fresh beasts and waypoints when roaming into new territory
  const checkAndSpawnAtLocation = (newLat: number, newLng: number, force: boolean = false) => {
    const distFromLastSpawn = getDistanceMeters(
      lastSpawnPosRef.current.lat,
      lastSpawnPosRef.current.lng,
      newLat,
      newLng
    );

    // If player has moved more than 135 meters from the last spawn center (or forced on Apparition)
    if (distFromLastSpawn >= 135 || force) {
      lastSpawnPosRef.current = { lat: newLat, lng: newLng };
      const now = Date.now();
      const attempted = gameState.attemptedDisturbances || {};
      const markMult = hero.bonusMarkChance || 1.0;

      // 1. Dynamic Spawning for Disturbances
      setDisturbances((prev) => {
        // Keep active disturbances within 650m
        const nearby = prev.filter((d) => {
          if (!d || !d.id || attempted[d.id] || !d.expiresAt || d.expiresAt <= now) return false;
          const dDist = getDistanceMeters(newLat, newLng, d.lat, d.lng);
          return dDist <= 650;
        });

        // Count how many are in the immediate vicinity (<= 280m)
        const closeCount = nearby.filter((d) => getDistanceMeters(newLat, newLng, d.lat, d.lng) <= 280).length;
        const targetCount = gameState.activeLureUntil && gameState.activeLureUntil > now ? 9 : 7;

        let updated = [...nearby];
        if (closeCount < 5) {
          const needed = Math.max(3, targetCount - closeCount);
          const fresh = generateDisturbances(newLat, newLng, needed, markMult);
          updated = [...nearby, ...fresh];
        }

        saveActiveDisturbances(updated);
        return updated;
      });

      // 2. Dynamic Spawning for Waypoints (Inns & Greenhouses)
      setWaypoints((prev) => {
        // Keep existing waypoints within 650m so cooldowns are remembered
        const nearby = prev.filter((w) => getDistanceMeters(newLat, newLng, w.lat, w.lng) <= 650);
        const closeCount = nearby.filter((w) => getDistanceMeters(newLat, newLng, w.lat, w.lng) <= 320).length;

        if (closeCount < 4) {
          const needed = Math.max(3, 7 - closeCount);
          const fresh = generateWaypoints(newLat, newLng, needed);
          return [...nearby, ...fresh];
        }
        return nearby;
      });
    }
  };

  // Handle Apparition (Magical Teleportation to distant beast or waypoint)
  const handleApparate = (target: ApparitionTarget) => {
    const currentEnergy = gameState.inventory.spell_energy ?? 0;
    const APPARITION_ENERGY_COST = 10;

    if (currentEnergy < APPARITION_ENERGY_COST) {
      sounds.playSpellFailure();
      showToast(
        'Depleted Spell Energy',
        `Apparition requires ${APPARITION_ENERGY_COST} ⚡ Energy (you have ${currentEnergy}). Visit an Inn or shatter a Leyline Crystal!`,
        'energy'
      );
      return;
    }

    // Deduct 10 spell energy
    handleConsumeItem('spell_energy', APPARITION_ENERGY_COST);

    const destLat = target.type === 'disturbance' ? target.disturbance!.lat : target.waypoint!.lat;
    const destLng = target.type === 'disturbance' ? target.disturbance!.lng : target.waypoint!.lng;
    const destName = target.type === 'disturbance' ? target.disturbance!.beast.name : target.waypoint!.name;

    sounds.playApparition();
    haptics.apparate(gameState.settings?.hapticsEnabled ?? true);
    setIsApparating(true);
    if (gameState.settings?.autoPinApparate !== false) {
      setIsLocationPinned(true); // Snap and lock position in place
    }
    confetti({
      particleCount: 50,
      spread: 75,
      origin: { y: 0.5 },
      colors: ['#c084fc', '#fbbf24', '#38bdf8', '#ffffff']
    });

    setPlayerPos({ lat: destLat, lng: destLng });
    lastPosRef.current = { lat: destLat, lng: destLng };

    // Dynamically trigger fresh spawns around destination
    checkAndSpawnAtLocation(destLat, destLng, true);
    setApparitionTarget(null);

    setTimeout(() => {
      setIsApparating(false);

      if (target.type === 'disturbance' && target.disturbance) {
        setActiveEncounter(target.disturbance);
        sounds.playWandCast('good');
        setGameState((prev) => ({
          ...prev,
          seenBeasts: {
            ...prev.seenBeasts,
            [target.disturbance!.beast.id]: (prev.seenBeasts[target.disturbance!.beast.id] || 0) + 1
          },
          stats: {
            ...prev.stats,
            totalEncounters: prev.stats.totalEncounters + 1
          }
        }));
      } else if (target.type === 'waypoint' && target.waypoint) {
        if (target.waypoint.type === 'fortress') {
          setActiveRaid({ ...target.waypoint, inRange: true, distMeters: 0 });
        } else {
          setActiveWaypoint({ ...target.waypoint, inRange: true, distMeters: 0 });
        }
      }

      showToast('⚡ *CRACK!*', `Apparated to ${destName}! (-10 ⚡ Energy)`, 'success');
    }, 450);
  };

  // Toggle Location Pin lock (anchored apparate position vs resuming live GPS)
  const handleToggleLocationPin = () => {
    if (isLocationPinned) {
      setIsLocationPinned(false);
      showToast('🧭 Re-centered', 'Map re-synchronized with your live physical location.', 'info');
      if (navigator.geolocation && !gameState.settings?.useVirtualGPS) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            setPlayerPos({ lat: latitude, lng: longitude });
            checkAndSpawnAtLocation(latitude, longitude, true);
          },
          (err) => console.warn('Could not re-sync GPS:', err)
        );
      }
    } else {
      setIsLocationPinned(true);
      showToast('📌 Location Pinned', 'Map anchored at current coordinates. Tap pin to resume GPS.', 'info');
    }
  };

  // Periodic disturbance spawner & refresh cycle (checks every 45s)
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const attempted = gameState.attemptedDisturbances || {};

      setDisturbances((prev) => {
        // Prune expired or attempted
        const remaining = prev.filter((d) => d.expiresAt > now && !attempted[d.id]);
        const closeCount = remaining.filter((d) => getDistanceMeters(playerPos.lat, playerPos.lng, d.lat, d.lng) <= 300).length;
        const targetCount = gameState.activeLureUntil && gameState.activeLureUntil > now ? 9 : 6;

        if (closeCount < 5) {
          const needed = Math.max(3, targetCount - closeCount);
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
    checkAndSpawnAtLocation(newLat, newLng);
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
      // Prompt player to magically Apparate directly to the trace
      setApparitionTarget({
        type: 'disturbance',
        disturbance: distObj,
        distMeters
      });
      return;
    }

    setActiveEncounter(distObj);
    sounds.playWandCast('good');
    haptics.encounter(gameState.settings?.hapticsEnabled ?? true);

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

  // Select Waypoint from Map (Inns, Greenhouses, or Fortress Citadel Raids)
  const handleSelectWaypoint = (wp: Waypoint, inRange: boolean, distMeters: number) => {
    if (wp.type === 'fortress') {
      if (!inRange) {
        setApparitionTarget({
          type: 'waypoint',
          waypoint: wp,
          distMeters
        });
        return;
      }
      setActiveRaid(wp);
      return;
    }
    setActiveWaypoint({ ...wp, inRange, distMeters });
  };

  // Record completed Citadel Raid victory
  const handleRaidComplete = () => {
    const today = new Date().toISOString().slice(0, 10);
    setGameState((prev) => {
      const countToday = prev.lastRaidDate === today ? (prev.raidsCompletedToday || 0) : 0;
      const updatedQuests = prev.quests.map((q) => {
        if (q.id === 'daily_citadel_raid') {
          return { ...q, current: Math.min(q.target, q.current + 1) };
        }
        return q;
      });

      return {
        ...prev,
        lastRaidDate: today,
        raidsCompletedToday: countToday + 1,
        quests: updatedQuests,
        stats: {
          ...prev.stats,
          raidsWon: (prev.stats.raidsWon || 0) + 1
        }
      };
    });
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

  const handleAddInventoryItem = (itemKey: string, amount: number = 1) => {
    setGameState((prev) => ({
      ...prev,
      inventory: {
        ...prev.inventory,
        [itemKey]: (prev.inventory[itemKey] || 0) + amount
      }
    }));
  };

  const handleUpdateCauldrons = (cauldrons: CauldronSlot[]) => {
    setGameState((prev) => ({
      ...prev,
      cauldrons
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

      const newInventory = {
        ...prev.inventory,
        knuts: (prev.inventory.knuts || 0) + 30
      };

      if (mark) {
        haptics.mark(gameState.settings?.hapticsEnabled ?? true);
      } else {
        haptics.success(gameState.settings?.hapticsEnabled ?? true);
      }

      return {
        ...prev,
        inventory: newInventory,
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

  // Alchemist XP & Rank Advancement
  const handleAddAlchemistXP = (amount: number) => {
    setGameState((prev) => {
      const prog = prev.characterProgression || alchemistService.normalizeProgression();
      const res = alchemistService.addXP(prog.alchemistRank, prog.alchemistXP, amount);

      if (res.didRankUp && res.unlockedPerk) {
        sounds.playLevelUp();
        confetti({
          particleCount: 65,
          spread: 75,
          origin: { y: 0.4 },
          colors: ['#fbbf24', '#f59e0b', '#10b981', '#a855f7']
        });
        showToast(
          'ALCHEMICAL RANK UP!',
          `Promoted to Rank ${res.newRank}: ${alchemistService.getRankInfo(res.newRank).title}! Unlocked: ${res.unlockedPerk.name}!`,
          'mark'
        );
      }

      return {
        ...prev,
        characterProgression: {
          alchemistRank: res.newRank,
          alchemistXP: res.newXP,
          unlockedTalentPerks: alchemistService.getUnlockedPerks(res.newRank).map((p) => p.id)
        }
      };
    });
  };

  // Cauldron brew success callback
  const handleBrewSuccess = (isMasterwork: boolean) => {
    const xpGain = isMasterwork ? 60 : 30;
    setGameState((prev) => {
      const stats = {
        ...prev.stats,
        potionsBrewed: (prev.stats.potionsBrewed || 0) + 1,
        masterworkBrews: isMasterwork ? (prev.stats.masterworkBrews || 0) + 1 : (prev.stats.masterworkBrews || 0)
      };

      // Progress daily brew quest
      const quests = prev.quests.map((q) => {
        if (q.id === 'daily_brew_potions') {
          return { ...q, current: Math.min(q.target, q.current + 1) };
        }
        return q;
      });

      return {
        ...prev,
        stats,
        quests
      };
    });
    handleAddAlchemistXP(xpGain);
  };

  // Tactical potion deployed in encounter
  const handleTacticalPotionUsed = (_potionId: string) => {
    setGameState((prev) => {
      const stats = {
        ...prev.stats,
        potionsUsed: (prev.stats.potionsUsed || 0) + 1
      };

      const quests = prev.quests.map((q) => {
        if (q.id === 'daily_use_potion') {
          return { ...q, current: Math.min(q.target, q.current + 1) };
        }
        return q;
      });

      return {
        ...prev,
        stats,
        quests
      };
    });
    handleAddAlchemistXP(20);
  };

  // Apothecary Shop purchase
  const handleShopBuy = (itemKey: string, costKnuts: number, count: number = 1) => {
    setGameState((prev) => {
      const inv = { ...prev.inventory };
      inv.knuts = Math.max(0, (inv.knuts || 0) - costKnuts);
      inv[itemKey] = (inv[itemKey] || 0) + count;
      const stats = {
        ...prev.stats,
        shopTransactions: (prev.stats.shopTransactions || 0) + 1
      };
      return {
        ...prev,
        inventory: inv,
        stats
      };
    });
    handleAddAlchemistXP(15);
  };

  // Apothecary Shop sale of gathered flora
  const handleShopSell = (itemKey: string, knutsEarned: number, count: number = 1) => {
    setGameState((prev) => {
      const inv = { ...prev.inventory };
      inv[itemKey] = Math.max(0, (inv[itemKey] || 0) - count);
      inv.knuts = (inv.knuts || 0) + knutsEarned;
      const stats = {
        ...prev.stats,
        shopTransactions: (prev.stats.shopTransactions || 0) + 1
      };
      return {
        ...prev,
        inventory: inv,
        stats
      };
    });
    handleAddAlchemistXP(15);
  };

  // Upgrade Cauldron slots from shop workshop
  const handleUpgradeCauldrons = (newCount: number, costKnuts: number) => {
    setGameState((prev) => {
      const inv = { ...prev.inventory };
      inv.knuts = Math.max(0, (inv.knuts || 0) - costKnuts);
      const cauldrons = prev.cauldrons ? [...prev.cauldrons] : [];
      if (!cauldrons.some((c) => c.id === `cauldron_${newCount}`)) {
        cauldrons.unshift({ id: `cauldron_${newCount}`, recipeId: null, startedAt: null, finishesAt: null, isReady: false });
      }
      return {
        ...prev,
        inventory: inv,
        cauldronSlotsCount: newCount,
        cauldrons,
        stats: {
          ...prev.stats,
          shopTransactions: (prev.stats.shopTransactions || 0) + 1
        }
      };
    });
    handleAddAlchemistXP(50);
  };

  // Waypoint Spin Success
  const handleWaypointSpinSuccess = (waypointId: string, rewards: Record<string, number>) => {
    let harvestedBotanicals = 0;

    setGameState((prev) => {
      const newInventory = { ...prev.inventory };
      if (rewards.spell_energy) newInventory.spell_energy = Math.min(100, (newInventory.spell_energy || 0) + rewards.spell_energy);
      if (rewards.knuts) newInventory.knuts = (newInventory.knuts || 0) + rewards.knuts;

      Object.keys(rewards).forEach((k) => {
        if (k !== 'spell_energy' && k !== 'knuts') {
          newInventory[k] = (newInventory[k] || 0) + rewards[k];
          if (k.startsWith('ing_')) {
            harvestedBotanicals += rewards[k];
          }
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
          totalWaypointsSpun: prev.stats.totalWaypointsSpun + 1,
          ingredientsHarvested: (prev.stats.ingredientsHarvested || 0) + harvestedBotanicals
        },
        quests: updatedQuests
      };
    });

    if (harvestedBotanicals > 0) {
      handleAddAlchemistXP(15);
    }

    setWaypoints((prev) =>
      prev.map((wp) => (wp.id === waypointId ? { ...wp, cooldownUntil: Date.now() + 5 * 60 * 1000 } : wp))
    );

    showToast('Waypoint Harvested!', 'Recovered Spell Energy and Wizarding Provisions!', 'success');
  };

  // Beast Feeding in Sanctuary (Satiety & Hunger Meter: max 100%)
  const handleFeedBeast = (instanceId: string, treatKey: string, xpGain: number) => {
    const targetBeast = gameState.suitcase.find((b) => b.instanceId === instanceId);
    if (!targetBeast) return;

    const satiety = bondService.getSatiety(targetBeast);
    if (satiety.isFull) {
      sounds.playSpellFailure();
      showToast(
        'Full & Content! 🥧',
        `This creature is completely full (100% Satiety). Allow its tummy to digest before offering more treats!`,
        'warning'
      );
      return;
    }

    handleConsumeItem(treatKey, 1);

    setGameState((prev) => {
      let isBuddy = false;
      let levelUpInfo: { beastName: string; newLevel: number; title: string; cpBonus: number } | null = null;
      const updatedSuitcase = prev.suitcase.map((b) => {
        if (b.instanceId === instanceId) {
          if (prev.buddyInstanceId === instanceId) isBuddy = true;
          const res = bondService.addXP(b.bondLevel, b.bondXP, xpGain);
          if (res.leveledUp) {
            const beastDef = BEASTS.find((bd) => bd.id === b.beastId);
            const tierInfo = bondService.getTierInfo(res.newLevel);
            levelUpInfo = {
              beastName: b.nickname || beastDef?.name || 'Beast',
              newLevel: res.newLevel,
              title: tierInfo.title,
              cpBonus: res.cpBonus
            };
          }
          const currentSatiety = bondService.getSatiety(b).current;
          return {
            ...b,
            bondXP: res.newXP,
            bondLevel: res.newLevel,
            cp: b.cp + res.cpBonus,
            timesFed: (b.timesFed || 0) + 1,
            satietyLevel: Math.min(100, currentSatiety + 34),
            lastFedTimestamp: Date.now()
          };
        }
        return b;
      });

      if (levelUpInfo) {
        sounds.playMarkReveal();
        confetti({ particleCount: 50, spread: 75, origin: { y: 0.3 } });
        showToast(
          '✨ BOND LEVEL UP!',
          `${levelUpInfo.beastName} grew to Level ${levelUpInfo.newLevel} (${levelUpInfo.title})! +${levelUpInfo.cpBonus} CP & Stature Growth!`,
          'success'
        );
      }

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

  // Beast Petting in Sanctuary (Daily cap: 25 XP/day)
  const handlePetBeast = (instanceId: string) => {
    setGameState((prev) => {
      const today = bondService.getTodayString();
      let wasAffectionMaxed = false;
      let beastName = 'Companion';

      const updatedSuitcase = prev.suitcase.map((b) => {
        if (b.instanceId === instanceId) {
          const affection = bondService.getDailyAffection(b, today);
          const xpToAward = Math.min(5, affection.remaining);
          beastName = b.nickname || 'Companion';

          if (xpToAward <= 0) {
            wasAffectionMaxed = true;
            return {
              ...b,
              timesPetted: (b.timesPetted || 0) + 1
            };
          }

          const res = bondService.addXP(b.bondLevel, b.bondXP, xpToAward);
          return {
            ...b,
            bondXP: res.newXP,
            bondLevel: res.newLevel,
            cp: b.cp + res.cpBonus,
            timesPetted: (b.timesPetted || 0) + 1,
            dailyAffectionXP: (b.lastAffectionDate === today ? (b.dailyAffectionXP || 0) : 0) + xpToAward,
            lastAffectionDate: today
          };
        }
        return b;
      });

      if (wasAffectionMaxed) {
        showToast(
          'Affection Satisfied ❤️',
          `${beastName} has already received all 25 daily bond affection points today! (Come back tomorrow for more XP)`,
          'info'
        );
      }

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

  // Toggle quick map sound
  const handleToggleSound = () => {
    const currentSound = gameState.settings?.soundEnabled ?? true;
    const newSound = !currentSound;
    setGameState((prev) => ({
      ...prev,
      settings: { ...prev.settings, soundEnabled: newSound }
    }));
    sounds.toggleSound(newSound);
    showToast('Audio Settings', newSound ? 'Game audio enabled 🔊' : 'Game audio muted 🔇', 'info');
  };

  // Beast Power Up CP (Infuse leylines)
  const handlePowerUpBeast = (instanceId: string) => {
    const beastInstance = gameState.suitcase.find((b) => b.instanceId === instanceId);
    if (!beastInstance) return;
    const beastDef = BEASTS.find((b) => b.id === beastInstance.beastId);
    const beastName = beastInstance.nickname || beastDef?.name || 'Beast';

    const cost = 45;
    if ((gameState.inventory.knuts || 0) < cost) {
      showToast('Need More Knuts', `Powering up requires ${cost} Knuts (Have: ${gameState.inventory.knuts || 0})`, 'warning');
      return;
    }

    const cpGain = Math.floor(Math.random() * 21) + 18; // +18 to +38 CP

    setGameState((prev) => {
      const updatedSuitcase = prev.suitcase.map((b) => {
        if (b.instanceId === instanceId) {
          const res = bondService.addXP(b.bondLevel, b.bondXP, 15);
          return {
            ...b,
            cp: b.cp + cpGain + res.cpBonus,
            bondXP: res.newXP,
            bondLevel: res.newLevel
          };
        }
        return b;
      });

      return {
        ...prev,
        inventory: {
          ...prev.inventory,
          knuts: Math.max(0, (prev.inventory.knuts || 0) - cost)
        },
        suitcase: updatedSuitcase
      };
    });

    sounds.playPowerUp();
    confetti({
      particleCount: 35,
      spread: 60,
      origin: { y: 0.4 },
      colors: ['#38bdf8', '#fbbf24', '#a855f7', '#ffffff']
    });

    showToast('Magical Growth Infused!', `${beastName}'s CP grew by +${cpGain}! Stature & Power expanded! ⚡`, 'success');
  };

  // Relocate Beast to MACUSA Ministry
  const handleRelocateBeast = (instanceId: string) => {
    const beastInstance = gameState.suitcase.find((b) => b.instanceId === instanceId);
    if (!beastInstance) return;
    const beastDef = BEASTS.find((b) => b.id === beastInstance.beastId);
    const beastName = beastInstance.nickname || beastDef?.name || 'Beast';

    if (instanceId === gameState.buddyInstanceId) {
      showToast('Cannot Relocate', 'Please unassign this creature as your buddy before transferring!', 'warning');
      return;
    }

    const treatKeys = ['treat_brioche', 'treat_gilded_knut', 'treat_woodlice', 'treat_moon_pellets'];
    const bonusTreat = treatKeys[Math.floor(Math.random() * treatKeys.length)];

    setGameState((prev) => {
      const remainingSuitcase = prev.suitcase.filter((b) => b.instanceId !== instanceId);
      const newInventory = {
        ...prev.inventory,
        knuts: (prev.inventory.knuts || 0) + 40,
        spell_energy: Math.min(100, (prev.inventory.spell_energy || 0) + 15),
        [bonusTreat]: (prev.inventory[bonusTreat] || 0) + 1
      };

      return {
        ...prev,
        suitcase: remainingSuitcase,
        inventory: newInventory
      };
    });

    sounds.playSpinChime();
    showToast(
      'Relocated to Ministry',
      `Transferred ${beastName}! Received 40 Knuts, 1 Treat, and 15 Spell Energy!`,
      'success'
    );
  };

  // Toggle Favorite Star
  const handleToggleFavorite = (instanceId: string) => {
    let nowFavorite = false;
    setGameState((prev) => {
      const updatedSuitcase = prev.suitcase.map((b) => {
        if (b.instanceId === instanceId) {
          nowFavorite = !b.isFavorite;
          return { ...b, isFavorite: nowFavorite };
        }
        return b;
      });
      return { ...prev, suitcase: updatedSuitcase };
    });

    sounds.playSparkle();
    showToast(
      nowFavorite ? 'Added to Favorites' : 'Removed from Favorites',
      nowFavorite ? 'Creature pinned & protected! ⭐' : 'Creature unpinned.',
      'info'
    );
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

  // Buy Satchel Item from Diagon Alley Shop
  const handleBuyBagItem = (itemKey: string, costKnuts: number, count: number = 1) => {
    if ((gameState.inventory.knuts || 0) < costKnuts) {
      sounds.playSpellFailure();
      showToast('Need More Knuts', `You need ${costKnuts} Knuts to purchase this provision.`, 'warning');
      return;
    }
    sounds.playSpinChime();
    haptics.success(gameState.settings?.hapticsEnabled ?? true);
    setGameState((prev) => ({
      ...prev,
      inventory: {
        ...prev.inventory,
        knuts: Math.max(0, (prev.inventory.knuts || 0) - costKnuts),
        [itemKey]: (prev.inventory[itemKey] || 0) + count
      }
    }));
    const itemDef = ITEMS[itemKey];
    showToast(
      'Diagon Alley Purchase',
      `Acquired ${itemDef?.name || itemKey} (x${count}) for ${costKnuts} Knuts!`,
      'success'
    );
  };

  const handleSelectMentor = (mentorId: MentorId) => {
    setGameState((prev) => ({
      ...prev,
      activeMentorId: mentorId
    }));
  };

  const handleCompleteMasterclass = (lesson: MasterclassLesson, bonusKnuts: number) => {
    setGameState((prev) => {
      const alreadyCompleted = (prev.completedMasterclasses || []).includes(lesson.id);
      const updatedMasterclasses = alreadyCompleted
        ? prev.completedMasterclasses || []
        : [...(prev.completedMasterclasses || []), lesson.id];

      const currentKnuts = prev.inventory.knuts || 0;
      const totalKnutsAwarded = lesson.rewardKnuts + (bonusKnuts || 0);

      const currentProgression = prev.characterProgression || alchemistService.normalizeProgression();
      const xpResult = alchemistService.addXP(
        currentProgression.alchemistRank,
        currentProgression.alchemistXP,
        lesson.rewardXP
      );
      const updatedProgression = {
        alchemistRank: xpResult.newRank,
        alchemistXP: xpResult.newXP,
        unlockedTalentPerks: alchemistService.getUnlockedPerks(xpResult.newRank).map((p) => p.id)
      };

      return {
        ...prev,
        completedMasterclasses: updatedMasterclasses,
        inventory: {
          ...prev.inventory,
          knuts: currentKnuts + totalKnutsAwarded
        },
        characterProgression: updatedProgression,
        stats: {
          ...prev.stats,
          masterclassesCompleted: (prev.stats.masterclassesCompleted || 0) + (alreadyCompleted ? 0 : 1)
        }
      };
    });
  };

  const unreadTasksCount = gameState.quests.filter((q) => q.current >= q.target && !q.claimed).length;
  const todayStr = new Date().toISOString().slice(0, 10);
  const raidsCompletedToday = gameState.lastRaidDate === todayStr ? (gameState.raidsCompletedToday || 0) : 0;

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* Toast Notification Banner System */}
      <Toast toast={activeToast} onDismiss={handleDismissToast} />

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
        mapStyle={gameState.settings?.mapStyle || 'marauder'}
        soundEnabled={gameState.settings?.soundEnabled ?? true}
        onToggleSound={handleToggleSound}
        isLocationPinned={isLocationPinned}
        onToggleLocationPin={handleToggleLocationPin}
      />

      {/* 2. Top-Level Tab Views */}
      {currentTab === 'suitcase' && (
        <div className="suitcase-desktop-wrapper" style={{ position: 'fixed', inset: 0, zIndex: 500 }}>
          <SuitcaseSanctuary
            suitcase={gameState.suitcase}
            inventory={gameState.inventory}
            hero={hero}
            buddyInstanceId={gameState.buddyInstanceId}
            cauldrons={gameState.cauldrons || []}
            initialTab={suitcaseInitialTab}
            alchemistRank={gameState.characterProgression?.alchemistRank || 1}
            cauldronSlotsCount={gameState.cauldronSlotsCount || 2}
            onSetBuddy={handleSetBuddy}
            onFeedBeast={handleFeedBeast}
            onPetBeast={handlePetBeast}
            onRenameBeast={handleRenameBeast}
            onPowerUpBeast={handlePowerUpBeast}
            onRelocateBeast={handleRelocateBeast}
            onToggleFavorite={handleToggleFavorite}
            onConsumeItem={handleConsumeItem}
            onAddInventoryItem={handleAddInventoryItem}
            onUpdateCauldrons={handleUpdateCauldrons}
            onBrewSuccess={handleBrewSuccess}
            onOpenShop={() => setShowShop(true)}
            onOpenProgression={() => setShowCharacterProgression(true)}
            onOpenMentors={() => setShowMentorModal(true)}
            onClose={() => {
              setCurrentTab('map');
              setSuitcaseInitialTab('menagerie');
            }}
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
          alchemistRank={gameState.characterProgression?.alchemistRank || 1}
          activeMentorId={gameState.activeMentorId || 'dumbledore'}
          onConsumeItem={handleConsumeItem}
          onCaptureSuccess={handleCaptureSuccess}
          onFlee={handleFlee}
          onClose={handleCloseEncounter}
          onPotionUsed={handleTacticalPotionUsed}
          onOpenSanctuary={() => {
            setActiveEncounter(null);
            setSuitcaseInitialTab('menagerie');
            setCurrentTab('suitcase');
          }}
          onShowToast={showToast}
          onReplenishEnergy={(amt) =>
            setGameState((p) => ({
              ...p,
              inventory: {
                ...p.inventory,
                spell_energy: Math.min(100, (p.inventory.spell_energy || 0) + amt)
              }
            }))
          }
        />
      )}

      {activeWaypoint && (
        <WaypointModal
          waypoint={activeWaypoint}
          inRange={activeWaypoint.inRange ?? false}
          currentEnergy={gameState.inventory.spell_energy || 0}
          onSpinSuccess={handleWaypointSpinSuccess}
          onClose={() => setActiveWaypoint(null)}
          onApparate={() =>
            handleApparate({
              type: 'waypoint',
              waypoint: activeWaypoint,
              distMeters: activeWaypoint.distMeters || 0
            })
          }
          onOpenPotionsLab={() => {
            setActiveWaypoint(null);
            setSuitcaseInitialTab('potions');
            setCurrentTab('suitcase');
          }}
          onOpenShop={() => {
            setActiveWaypoint(null);
            setShowShop(true);
          }}
        />
      )}

      {/* Citadel Ancient Fortress Legendary Raid Modal */}
      {activeRaid && (
        <RaidModal
          waypoint={activeRaid}
          hero={hero}
          buddyInstance={buddyInstance}
          inventory={gameState.inventory}
          raidsCompletedToday={raidsCompletedToday}
          onConsumeItem={handleConsumeItem}
          onCaptureSuccess={handleCaptureSuccess}
          onRaidComplete={handleRaidComplete}
          onClose={() => setActiveRaid(null)}
          onOpenSanctuary={() => {
            setActiveRaid(null);
            setCurrentTab('suitcase');
          }}
          onShowToast={showToast}
        />
      )}

      {/* Apparition Confirmation Modal */}
      {apparitionTarget && (
        <ApparitionModal
          target={apparitionTarget}
          currentEnergy={gameState.inventory.spell_energy || 0}
          onApparate={handleApparate}
          onClose={() => setApparitionTarget(null)}
        />
      )}

      {/* Magical Apparition Teleportation Screen FX */}
      {isApparating && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            pointerEvents: 'all',
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.45) 0%, rgba(10, 15, 29, 0.94) 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)'
          }}
        >
          <div
            style={{
              width: '180px',
              height: '180px',
              borderRadius: '50%',
              border: '4px dashed #fbbf24',
              boxShadow: '0 0 60px #a855f7, inset 0 0 40px #a855f7',
              animation: 'apparitionVortex 0.45s ease-out forwards',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div style={{ fontSize: '52px', filter: 'drop-shadow(0 0 20px #fde047)' }}>⚡</div>
          </div>
          <div
            className="font-cinzel"
            style={{
              marginTop: '20px',
              fontSize: '1.25rem',
              fontWeight: 800,
              color: '#fef08a',
              letterSpacing: '2px',
              textShadow: '0 0 20px rgba(251, 191, 36, 0.8)'
            }}
          >
            *CRACK!* APPARATING...
          </div>
        </div>
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
            setGameState((prev) => {
              let updatedMentorId = prev.activeMentorId;
              if (chosenId === 'newt_scamander' && updatedMentorId === 'newt') {
                updatedMentorId = 'dumbledore';
              } else if (chosenId === 'tina_goldstein' && updatedMentorId === 'tina') {
                updatedMentorId = 'dumbledore';
              }
              return {
                ...prev,
                heroId: chosenId,
                hasChosenHero: true,
                activeMentorId: updatedMentorId
              };
            });
            setShowHeroSelect(false);
            showToast('Hero Selected', `You are exploring as ${HEROES.find(h => h.id === chosenId)?.name}!`, 'info');
          }}
        />
      )}

      {showItemBag && (
        <ItemBagModal
          inventory={gameState.inventory}
          onUseItem={handleUseBagItem}
          onBuyItem={handleBuyBagItem}
          onOpenSanctuary={() => {
            setShowItemBag(false);
            setCurrentTab('suitcase');
          }}
          onClose={() => setShowItemBag(false)}
        />
      )}

      {showShop && (
        <ApothecaryShopModal
          knuts={gameState.inventory.knuts || 0}
          inventory={gameState.inventory}
          characterRank={gameState.characterProgression?.alchemistRank || 1}
          cauldronSlotsCount={gameState.cauldronSlotsCount || 2}
          onBuyItem={handleShopBuy}
          onSellItem={handleShopSell}
          onUpgradeCauldrons={handleUpgradeCauldrons}
          onOpenPotionsLab={() => {
            setShowShop(false);
            setSuitcaseInitialTab('potions');
            setCurrentTab('suitcase');
          }}
          onClose={() => setShowShop(false)}
        />
      )}

      {showCharacterProgression && (
        <CharacterProgressionModal
          hero={hero}
          characterProgression={gameState.characterProgression || alchemistService.normalizeProgression()}
          stats={gameState.stats}
          onClose={() => setShowCharacterProgression(false)}
        />
      )}

      {showMentorModal && (
        <MentorMasterclassModal
          heroId={gameState.heroId}
          activeMentorId={gameState.activeMentorId || 'dumbledore'}
          completedMasterclasses={gameState.completedMasterclasses || []}
          alchemistRank={gameState.characterProgression?.alchemistRank || 1}
          onSelectMentor={handleSelectMentor}
          onCompleteMasterclass={handleCompleteMasterclass}
          onClose={() => setShowMentorModal(false)}
          onShowToast={showToast}
        />
      )}

      {/* Quick Lure, Satchel Bag, Apothecary Shop, Mastery & Mentors HUD Buttons */}
      {currentTab === 'map' && (
        <div
          style={{
            position: 'fixed',
            left: '14px',
            top: 'calc(var(--safe-top) + 60px)',
            zIndex: 400,
            display: 'flex',
            gap: '6px',
            flexWrap: 'wrap',
            maxWidth: 'calc(100vw - 28px)'
          }}
        >
          <button
            onClick={handleActivateLure}
            className="btn-magical"
            style={{ padding: '6px 10px', fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: '5px' }}
            title="Activate Suitcase Lure"
          >
            <span>🧳</span>
            <span>Lure (x{gameState.inventory.beast_lure || 0})</span>
          </button>

          <button
            onClick={() => setShowItemBag(true)}
            className="btn-secondary"
            style={{ padding: '6px 10px', fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(15, 23, 42, 0.85)' }}
            title="Open Enchanted Satchel"
          >
            <span>🎒</span>
            <span>Bag</span>
          </button>

          <button
            onClick={() => setShowShop(true)}
            className="btn-secondary"
            style={{
              padding: '6px 10px',
              fontSize: '0.74rem',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              background: 'rgba(30, 20, 10, 0.88)',
              borderColor: '#fbbf24',
              color: '#fef08a',
              boxShadow: '0 0 10px rgba(251, 191, 36, 0.25)'
            }}
            title="Enter Apothecary & Reagents Shop"
          >
            <span>⚗️</span>
            <span>Shop</span>
          </button>

          <button
            onClick={() => setShowCharacterProgression(true)}
            className="btn-secondary"
            style={{
              padding: '6px 10px',
              fontSize: '0.74rem',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              background: 'rgba(20, 15, 35, 0.88)',
              borderColor: '#c084fc',
              color: '#f5d0fe'
            }}
            title="Character Progression & Talents"
          >
            <span>⭐</span>
            <span>Rank {gameState.characterProgression?.alchemistRank || 1}</span>
          </button>

          <button
            onClick={() => setShowMentorModal(true)}
            className="btn-secondary"
            style={{
              padding: '6px 10px',
              fontSize: '0.74rem',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              background: 'rgba(15, 23, 42, 0.92)',
              borderColor: '#38bdf8',
              color: '#7dd3fc',
              boxShadow: '0 0 10px rgba(56, 189, 248, 0.25)'
            }}
            title="Wizarding Mentors & Masterclasses"
          >
            <span>🎓</span>
            <span>Mentors</span>
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
