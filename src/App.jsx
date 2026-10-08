import React, { useState, useEffect, useRef } from 'react';
import { loadGameState, saveGameState } from './services/storageService';
import { generateDisturbances, generateWaypoints, fetchNearbyRealPOIs, getDistanceMeters } from './services/locationService';
import { sounds } from './services/soundService';
import { HEROES } from './data/heroesData';
import { ITEMS } from './data/itemsData';

import MapEngine from './components/MapEngine';
import EncounterModal from './components/EncounterModal';
import SuitcaseSanctuary from './components/SuitcaseSanctuary';
import FieldGuide from './components/FieldGuide';
import WaypointModal from './components/WaypointModal';
import CharacterSelect from './components/CharacterSelect';
import QuestsModal from './components/QuestsModal';
import SettingsModal from './components/SettingsModal';
import Navigation from './components/Navigation';

// Default initial coordinates (New York City / Woolworth Building MACUSA Headquarters)
const DEFAULT_LAT = 40.7124;
const DEFAULT_LNG = -74.0083;

export default function App() {
  const [gameState, setGameState] = useState(() => loadGameState());
  const [playerPos, setPlayerPos] = useState({ lat: DEFAULT_LAT, lng: DEFAULT_LNG });
  const [disturbances, setDisturbances] = useState([]);
  const [waypoints, setWaypoints] = useState([]);
  const [currentTab, setCurrentTab] = useState('map'); // 'map' | 'suitcase' | 'guide' | 'tasks' | 'settings'

  // Modals
  const [activeEncounter, setActiveEncounter] = useState(null);
  const [activeWaypoint, setActiveWaypoint] = useState(null);
  const [showHeroSelect, setShowHeroSelect] = useState(!gameState.hasChosenHero);
  const [showQuests, setShowQuests] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Active Lure Countdown
  const [lureTimeLeft, setLureTimeLeft] = useState(0);

  const hero = HEROES.find((h) => h.id === gameState.heroId) || HEROES[0];

  // Save game state whenever it updates
  useEffect(() => {
    saveGameState(gameState);
  }, [gameState]);

  // Sync sound settings with SoundService
  useEffect(() => {
    sounds.toggleSound(gameState.settings?.soundEnabled ?? true);
  }, [gameState.settings?.soundEnabled]);

  // Request Real Geolocation or fallback to default
  useEffect(() => {
    let watchId = null;
    if ('geolocation' in navigator && !gameState.settings.useVirtualGPS) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPlayerPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        (err) => {
          console.log('Using default magical coordinates (Woolworth MACUSA HQ):', err.message);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );

      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setPlayerPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        (err) => console.log('Geolocation watch error:', err.message),
        { enableHighAccuracy: true, maximumAge: 3000, timeout: 10000 }
      );
    }

    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, [gameState.settings.useVirtualGPS]);

  // Spawn initial disturbances and waypoints when player position initializes
  useEffect(() => {
    const markMult = hero.bonusMarkChance || 1.0;
    const initialDist = generateDisturbances(playerPos.lat, playerPos.lng, 8, markMult);
    setDisturbances(initialDist);

    const initialWaypoints = generateWaypoints(playerPos.lat, playerPos.lng, 6);
    setWaypoints(initialWaypoints);

    // Attempt real OSM POI lookup in the background
    fetchNearbyRealPOIs(playerPos.lat, playerPos.lng).then((realPOIs) => {
      if (realPOIs && realPOIs.length > 0) {
        setWaypoints(realPOIs);
      }
    });
  }, [playerPos.lat, playerPos.lng, hero.bonusMarkChance]);

  // Periodic disturbance spawner / timer (every 45 seconds checks for expired or replenishes)
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setDisturbances((prev) => {
        const remaining = prev.filter((d) => d.expiresAt > now);
        if (remaining.length < 6) {
          const fresh = generateDisturbances(playerPos.lat, playerPos.lng, 3, hero.bonusMarkChance || 1.0);
          return [...remaining, ...fresh];
        }
        return remaining;
      });
    }, 45000);

    return () => clearInterval(timer);
  }, [playerPos, hero.bonusMarkChance]);

  // Lure timer countdown
  useEffect(() => {
    if (!gameState.activeLureUntil) {
      setLureTimeLeft(0);
      return;
    }

    const interval = setInterval(() => {
      const remainingSecs = Math.max(0, Math.ceil((gameState.activeLureUntil - Date.now()) / 1000));
      setLureTimeLeft(remainingSecs);
      if (remainingSecs <= 0) {
        setGameState((prev) => ({ ...prev, activeLureUntil: null }));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState.activeLureUntil]);

  // Player moved manually via virtual joystick
  const handleMovePlayer = (newLat, newLng) => {
    setPlayerPos({ lat: newLat, lng: newLng });
  };

  // Select Disturbance from Map
  const handleSelectDisturbance = (distObj, inRange, distMeters) => {
    if (!inRange) {
      alert(`Too far! Move closer (${distMeters}m away) to investigate this magical trace.`);
      return;
    }
    setActiveEncounter(distObj);
    sounds.playWandCast('good');

    // Update seen count
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
  const handleSelectWaypoint = (wp, inRange, distMeters) => {
    setActiveWaypoint({ ...wp, inRange, distMeters });
  };

  // Consume an inventory item
  const handleConsumeItem = (itemKey, amount = 1) => {
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
  const handleCaptureSuccess = ({ beastId, cp, mark }) => {
    const newBeast = {
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
      // Update quests progress
      const updatedQuests = prev.quests.map((q) => {
        if (q.id === 'quest_first_catch') return { ...q, current: q.current + 1 };
        if (q.id === 'quest_find_mark' && mark) return { ...q, current: q.current + 1 };
        return q;
      });

      return {
        ...prev,
        suitcase: [newBeast, ...prev.suitcase],
        caughtBeasts: {
          ...prev.caughtBeasts,
          [beastId]: (prev.caughtBeasts[beastId] || 0) + 1
        },
        stats: {
          ...prev.stats,
          totalCaptures: prev.stats.totalCaptures + 1,
          marksDiscovered: mark ? prev.stats.marksDiscovered + 1 : prev.stats.marksDiscovered
        },
        quests: updatedQuests
      };
    });

    // Remove disturbance from map
    if (activeEncounter) {
      setDisturbances((prev) => prev.filter((d) => d.id !== activeEncounter.id));
    }
  };

  // Waypoint Spin Success
  const handleWaypointSpinSuccess = (waypointId, rewards) => {
    setGameState((prev) => {
      const newInventory = { ...prev.inventory };
      if (rewards.spell_energy) newInventory.spell_energy = Math.min(100, newInventory.spell_energy + rewards.spell_energy);
      if (rewards.knuts) newInventory.knuts = (newInventory.knuts || 0) + rewards.knuts;

      Object.keys(rewards).forEach((k) => {
        if (k.startsWith('treat_') || k === 'beast_lure') {
          newInventory[k] = (newInventory[k] || 0) + rewards[k];
        }
      });

      const updatedQuests = prev.quests.map((q) => {
        if (q.id === 'quest_waypoint_spin') return { ...q, current: q.current + 1 };
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

    // Set cooldown on this waypoint
    setWaypoints((prev) =>
      prev.map((wp) => (wp.id === waypointId ? { ...wp, cooldownUntil: Date.now() + 5 * 60 * 1000 } : wp))
    );
  };

  // Feed Beast in Suitcase
  const handleFeedBeast = (instanceId, treatKey, xpGain) => {
    handleConsumeItem(treatKey, 1);

    setGameState((prev) => {
      const updatedSuitcase = prev.suitcase.map((b) => {
        if (b.instanceId === instanceId) {
          const newXP = (b.bondXP || 0) + xpGain;
          let level = b.bondLevel || 1;
          let finalXP = newXP;
          if (newXP >= 100 && level < 10) {
            level += 1;
            finalXP = newXP - 100;
          }
          return {
            ...b,
            bondLevel: level,
            bondXP: finalXP,
            timesFed: (b.timesFed || 0) + 1
          };
        }
        return b;
      });

      const updatedQuests = prev.quests.map((q) => {
        if (q.id === 'quest_feed_beasts') return { ...q, current: q.current + 1 };
        return q;
      });

      return {
        ...prev,
        suitcase: updatedSuitcase,
        quests: updatedQuests
      };
    });
  };

  // Pet Beast in Suitcase
  const handlePetBeast = (instanceId) => {
    setGameState((prev) => {
      const updatedSuitcase = prev.suitcase.map((b) => {
        if (b.instanceId === instanceId) {
          const newXP = (b.bondXP || 0) + 10;
          let level = b.bondLevel || 1;
          let finalXP = newXP;
          if (newXP >= 100 && level < 10) {
            level += 1;
            finalXP = newXP - 100;
          }
          return {
            ...b,
            bondLevel: level,
            bondXP: finalXP,
            timesPetted: (b.timesPetted || 0) + 1
          };
        }
        return b;
      });
      return { ...prev, suitcase: updatedSuitcase };
    });
  };

  // Rename Beast in Suitcase
  const handleRenameBeast = (instanceId, newName) => {
    setGameState((prev) => ({
      ...prev,
      suitcase: prev.suitcase.map((b) => (b.instanceId === instanceId ? { ...b, nickname: newName } : b))
    }));
  };

  // Claim Quest Reward
  const handleClaimQuestReward = (questId, reward) => {
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
  };

  // Reset Game
  const handleResetGame = () => {
    localStorage.clear();
    window.location.reload();
  };

  // Activate Lure
  const handleActivateLure = () => {
    if (gameState.inventory.beast_lure <= 0) {
      alert('You need an Enchanted Suitcase Lure! Spin Waypoints or complete MACUSA tasks to obtain one.');
      return;
    }
    handleConsumeItem('beast_lure', 1);
    sounds.playMarkReveal();

    const lureDist = generateDisturbances(playerPos.lat, playerPos.lng, 4, (hero.bonusMarkChance || 1.0) * 1.8);
    setDisturbances((prev) => [...lureDist, ...prev]);

    setGameState((prev) => ({
      ...prev,
      activeLureUntil: Date.now() + 15 * 60 * 1000
    }));

    alert('Enchanted Suitcase Lure activated! 4 rare Fantastic Beasts have gathered at your location for 15 minutes.');
  };

  // Unread tasks count
  const unreadTasksCount = gameState.quests.filter((q) => q.current >= q.target && !q.claimed).length;

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* 1. Main Map View */}
      <MapEngine
        playerPos={playerPos}
        onMovePlayer={handleMovePlayer}
        disturbances={disturbances}
        waypoints={waypoints}
        selectedHeroId={gameState.heroId}
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

      {/* 2. Fullscreen Tabs Overlay */}
      {currentTab === 'suitcase' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 600 }}>
          <SuitcaseSanctuary
            suitcase={gameState.suitcase}
            inventory={gameState.inventory}
            hero={hero}
            onFeedBeast={handleFeedBeast}
            onPetBeast={handlePetBeast}
            onRenameBeast={handleRenameBeast}
            onClose={() => setCurrentTab('map')}
          />
        </div>
      )}

      {currentTab === 'guide' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 600 }}>
          <FieldGuide
            caughtBeasts={gameState.caughtBeasts}
            seenBeasts={gameState.seenBeasts}
            onClose={() => setCurrentTab('map')}
          />
        </div>
      )}

      {/* 3. Modals */}
      {/* Wild Encounter Modal */}
      {activeEncounter && (
        <EncounterModal
          disturbance={activeEncounter}
          hero={hero}
          inventory={gameState.inventory}
          onConsumeItem={handleConsumeItem}
          onCaptureSuccess={handleCaptureSuccess}
          onClose={() => setActiveEncounter(null)}
        />
      )}

      {/* Waypoint (Inn / Greenhouse) Spinner */}
      {activeWaypoint && (
        <WaypointModal
          waypoint={activeWaypoint}
          inRange={activeWaypoint.inRange}
          onSpinSuccess={handleWaypointSpinSuccess}
          onClose={() => setActiveWaypoint(null)}
        />
      )}

      {/* Tasks Modal */}
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

      {/* Settings Modal */}
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
        />
      )}

      {/* Character Selection Screen (First time or switched) */}
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
          }}
        />
      )}

      {/* Quick Lure Activation FAB (Over map) */}
      {currentTab === 'map' && (
        <div
          style={{
            position: 'fixed',
            left: '16px',
            top: 'calc(var(--safe-top) + 60px)',
            zIndex: 400
          }}
        >
          <button
            onClick={handleActivateLure}
            className="btn-magical"
            style={{
              padding: '6px 12px',
              fontSize: '0.76rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            title="Activate Suitcase Lure"
          >
            <span>🧳</span>
            <span>Lure (x{gameState.inventory.beast_lure || 0})</span>
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
