import { GameState, Quest } from '../types';
import { bondService } from './bondService';

const STORAGE_KEY = 'fantastic_beasts_save_v2';

function getTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function generateDailyQuests(): Quest[] {
  return [
    {
      id: 'daily_capture_two',
      title: 'Daily Trackdown',
      desc: 'Capture 2 wild Fantastic Beasts in your area today.',
      target: 2,
      current: 0,
      reward: { knuts: 180, spell_energy: 25 },
      claimed: false,
      isDaily: true
    },
    {
      id: 'daily_find_mark',
      title: 'Ancient Mark Seeker',
      desc: 'Encounter or capture a beast bearing an Ancient Mark.',
      target: 1,
      current: 0,
      reward: { knuts: 250, beast_lure: 1 },
      claimed: false,
      isDaily: true
    },
    {
      id: 'daily_feed_buddy',
      title: 'Companion Nourishment',
      desc: 'Feed your buddy companion 3 delicious treats today.',
      target: 3,
      current: 0,
      reward: { treat_brioche: 2, treat_gilded_knut: 1 },
      claimed: false,
      isDaily: true
    },
    {
      id: 'daily_walk_km',
      title: 'Town Walkway',
      desc: 'Walk 1.0 km exploring leylines with your active buddy.',
      target: 1,
      current: 0,
      reward: { knuts: 200, spell_energy: 30 },
      claimed: false,
      isDaily: true
    },
    {
      id: 'daily_spin_inns',
      title: 'Leyline Harvest',
      desc: 'Visit 3 Magical Inns, Greenhouses, or Potions Stations today.',
      target: 3,
      current: 0,
      reward: { treat_moon_pellets: 2, knuts: 150 },
      claimed: false,
      isDaily: true
    },
    {
      id: 'daily_citadel_raid',
      title: 'Fortress Citadel Raid',
      desc: 'Conquer an Ancient Fortress Citadel Raid today.',
      target: 1,
      current: 0,
      reward: { knuts: 250, beast_lure: 1 },
      claimed: false,
      isDaily: true
    }
  ];
}

const DEFAULT_STATE: GameState = {
  heroId: 'newt_scamander',
  hasChosenHero: false,
  buddyInstanceId: null,
  totalKmWalked: 0,
  totalSteps: 0,
  buddyKmProgress: 0,
  lastDailyReset: getTodayString(),
  inventory: {
    spell_energy: 75,
    knuts: 320,
    treat_brioche: 6,
    treat_gilded_knut: 3,
    treat_woodlice: 5,
    treat_moon_pellets: 3,
    treat_dragon_fruit: 2,
    beast_lure: 2,
    potion_wiggenweld: 2,
    potion_focus: 1,
    potion_maxima: 1,
    ing_dittany: 4,
    ing_horklump_juice: 3,
    ing_ashwinder_eggs: 2,
    ing_mongrel_fur: 2,
    ing_leech_juice: 2,
    ing_spider_fangs: 2,
    ing_lacewing_flies: 2,
    ing_mooncalf_fur: 2,
    ing_fluxweed: 2,
    ing_dugbog_tongue: 2,
    ing_shrivelfig: 2
  },
  suitcase: [],
  seenBeasts: {},
  caughtBeasts: {},
  attemptedDisturbances: {},
  activeLureUntil: null,
  cauldrons: [
    { id: 'cauldron_1', recipeId: null, startedAt: null, finishesAt: null, isReady: false },
    { id: 'cauldron_2', recipeId: null, startedAt: null, finishesAt: null, isReady: false },
    { id: 'cauldron_hopping', recipeId: 'potion_wiggenweld', startedAt: Date.now() - 35000, finishesAt: Date.now() - 5000, isHoppingPot: true, isReady: true }
  ],
  activeBuffs: {},
  stats: {
    totalEncounters: 0,
    totalCaptures: 0,
    totalWaypointsSpun: 0,
    totalSpellsCast: 0,
    masterfulCasts: 0,
    marksDiscovered: 0,
    kmWalked: 0,
    treatsFed: 0
  },
  quests: generateDailyQuests(),
  settings: {
    soundEnabled: true,
    driveMode: false,
    useVirtualGPS: false,
    googleMapsApiKey: '',
    mapStyle: 'marauder',
    batterySaver: false,
    hapticsEnabled: true,
    autoPinApparate: true,
    cameraTilt3D: true
  }
};

const DISTURBANCES_KEY = 'fantastic_beasts_disturbances_v2';

export function loadGameState(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const today = getTodayString();

    if (!raw) {
      return DEFAULT_STATE;
    }

    const parsed = JSON.parse(raw) as Partial<GameState>;
    let quests = parsed.quests || DEFAULT_STATE.quests;

    // Daily reset check
    if (parsed.lastDailyReset !== today) {
      quests = generateDailyQuests();
    } else {
      // Migrate existing quests to new text or add missing daily citadel raid
      quests = quests.map((q) => {
        if (q.id === 'daily_spin_inns' && q.desc.includes('Spin')) {
          return { ...q, desc: 'Visit 3 Magical Inns, Greenhouses, or Potions Stations today.' };
        }
        return q;
      });
      if (!quests.some((q) => q.id === 'daily_citadel_raid')) {
        quests.push({
          id: 'daily_citadel_raid',
          title: 'Fortress Citadel Raid',
          desc: 'Conquer an Ancient Fortress Citadel Raid today.',
          target: 1,
          current: 0,
          reward: { knuts: 250, beast_lure: 1 },
          claimed: false,
          isDaily: true
        });
      }
    }

    const suitcase = (parsed.suitcase || DEFAULT_STATE.suitcase).map((b) => bondService.normalizeBeast(b));

    return {
      ...DEFAULT_STATE,
      ...parsed,
      lastDailyReset: today,
      quests,
      suitcase,
      attemptedDisturbances: parsed.attemptedDisturbances || {},
      inventory: { ...DEFAULT_STATE.inventory, ...(parsed.inventory || {}) },
      cauldrons: parsed.cauldrons && parsed.cauldrons.length > 0 ? parsed.cauldrons : DEFAULT_STATE.cauldrons,
      activeBuffs: parsed.activeBuffs || {},
      stats: { ...DEFAULT_STATE.stats, ...(parsed.stats || {}) },
      settings: { ...DEFAULT_STATE.settings, ...(parsed.settings || {}) }
    };
  } catch (err) {
    console.error('Error loading game state:', err);
    return DEFAULT_STATE;
  }
}

export function saveGameState(state: GameState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Error saving game state:', err);
  }
}

export function saveActiveDisturbances(disturbances: any[]): void {
  try {
    localStorage.setItem(DISTURBANCES_KEY, JSON.stringify(disturbances));
  } catch (err) {
    console.error('Error saving disturbances:', err);
  }
}

export function loadActiveDisturbances(): any[] {
  try {
    const raw = localStorage.getItem(DISTURBANCES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const now = Date.now();
    // Only return non-expired disturbances
    if (Array.isArray(parsed)) {
      return parsed.filter((d: any) => d && d.expiresAt && d.expiresAt > now);
    }
    return [];
  } catch (err) {
    console.error('Error loading disturbances:', err);
    return [];
  }
}
