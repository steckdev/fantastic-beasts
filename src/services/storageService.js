const STORAGE_KEY = 'fantastic_beasts_save_v1';

const DEFAULT_STATE = {
  heroId: 'newt_scamander',
  hasChosenHero: false,
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
  suitcase: [], // array of captured beast objects
  seenBeasts: {}, // beastId -> count
  caughtBeasts: {}, // beastId -> count
  activeLureUntil: null,
  stats: {
    totalEncounters: 0,
    totalCaptures: 0,
    totalWaypointsSpun: 0,
    totalSpellsCast: 0,
    masterfulCasts: 0,
    marksDiscovered: 0
  },
  quests: [
    {
      id: 'quest_first_catch',
      title: 'The Great Escape',
      desc: 'Capture 3 wild Fantastic Beasts loose in the town.',
      target: 3,
      current: 0,
      reward: { knuts: 150, spell_energy: 25 },
      claimed: false
    },
    {
      id: 'quest_waypoint_spin',
      title: 'Tapping the Leylines',
      desc: 'Visit and spin 3 Magical Inns or Greenhouses.',
      target: 3,
      current: 0,
      reward: { treat_brioche: 3, treat_moon_pellets: 2 },
      claimed: false
    },
    {
      id: 'quest_feed_beasts',
      title: 'Gentle Caretaker',
      desc: 'Feed your captured beasts 5 delicious treats in the Suitcase Sanctuary.',
      target: 5,
      current: 0,
      reward: { knuts: 200, beast_lure: 1 },
      claimed: false
    },
    {
      id: 'quest_masterful_spell',
      title: 'Wand Mastery',
      desc: 'Cast 2 Masterful or Great spell charms during encounters.',
      target: 2,
      current: 0,
      reward: { treat_gilded_knut: 2, spell_energy: 30 },
      claimed: false
    },
    {
      id: 'quest_find_mark',
      title: 'Ancient Lineage',
      desc: 'Encounter or capture a beast bearing a rare Ancient Mark.',
      target: 1,
      current: 0,
      reward: { knuts: 350, treat_dragon_fruit: 2 },
      claimed: false
    }
  ],
  settings: {
    soundEnabled: true,
    driveMode: false,
    useVirtualGPS: false,
    googleMapsApiKey: '',
    mapStyle: 'marauder' // 'marauder' | 'dark' | 'satellite'
  }
};

export function loadGameState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_STATE,
      ...parsed,
      inventory: { ...DEFAULT_STATE.inventory, ...(parsed.inventory || {}) },
      stats: { ...DEFAULT_STATE.stats, ...(parsed.stats || {}) },
      settings: { ...DEFAULT_STATE.settings, ...(parsed.settings || {}) },
      quests: DEFAULT_STATE.quests.map((dq) => {
        const existing = (parsed.quests || []).find((q) => q.id === dq.id);
        return existing ? { ...dq, ...existing } : dq;
      })
    };
  } catch (err) {
    console.error('Error loading game state:', err);
    return DEFAULT_STATE;
  }
}

export function saveGameState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Error saving game state:', err);
  }
}
