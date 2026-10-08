import { GameState, Quest } from '../types';

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
      desc: 'Spin 3 Magical Inns or Greenhouses today.',
      target: 3,
      current: 0,
      reward: { treat_moon_pellets: 2, knuts: 150 },
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
    beast_lure: 2
  },
  suitcase: [],
  seenBeasts: {},
  caughtBeasts: {},
  activeLureUntil: null,
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
    mapStyle: 'marauder'
  }
};

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
    }

    return {
      ...DEFAULT_STATE,
      ...parsed,
      lastDailyReset: today,
      quests,
      inventory: { ...DEFAULT_STATE.inventory, ...(parsed.inventory || {}) },
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
