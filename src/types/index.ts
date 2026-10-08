export type MinistryClassification = 'X' | 'XX' | 'XXX' | 'XXXX' | 'XXXXX';

export type BeastHabitat =
  | 'Sunlit Plains'
  | 'Enchanted Forest'
  | 'Mystic Marsh'
  | 'Sky Heights'
  | 'Ancient Ruins'
  | 'Whispering Mountains'
  | 'Coastal Waters';

export interface Beast {
  id: string;
  name: string;
  species: string;
  classification: MinistryClassification;
  type: string;
  dangerRating: 1 | 2 | 3 | 4 | 5;
  baseCatchRate: number;
  fleeRate: number;
  minCP: number;
  maxCP: number;
  habitat: BeastHabitat;
  favoriteTreat: string;
  sprite: string;
  lore: string;
  cryFreq: number;
  isRaidExclusive?: boolean;
}

export interface Hero {
  id: string;
  name: string;
  title: string;
  sprite: string;
  quote: string;
  bio: string;
  perkName: string;
  perkDescription: string;
  bonusMarkChance: number;
  bonusTreatEffect: number;
  catchAccuracyBonus: number;
  startingItem: string;
}

export interface Mark {
  id: string;
  name: string;
  title: string;
  description: string;
  rarity: 'Uncommon' | 'Rare' | 'Very Rare' | 'Mythic';
  chance: number;
  color: string;
  glow: string;
  icon: string;
  bonusText: string;
}

export interface Item {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: 'energy' | 'currency' | 'treat' | 'lure';
  max?: number;
  bondXP?: number;
  calmPower?: number;
  durationMinutes?: number;
}

export interface CapturedBeast {
  instanceId: string;
  beastId: string;
  nickname: string | null;
  cp: number;
  mark: Mark | null;
  bondLevel: number;
  bondXP: number;
  capturedAt: number;
  timesFed: number;
  timesPetted: number;
  kmWalked?: number;
  isFavorite?: boolean;
}

export interface Disturbance {
  id: string;
  lat: number;
  lng: number;
  beast: Beast;
  cp: number;
  mark: Mark | null;
  category: string;
  categoryLabel: string;
  auraColor: string;
  spawnedAt: number;
  expiresAt: number;
}

export interface Waypoint {
  id: string;
  name: string;
  type: 'inn' | 'greenhouse' | 'fortress';
  icon: string;
  color: string;
  lat: number;
  lng: number;
  cooldownUntil: number;
  distMeters?: number;
  inRange?: boolean;
  raidBoss?: {
    beastId: string;
    cp: number;
    name: string;
    hp: number;
    maxHp: number;
    sprite: string;
  };
}

export interface Quest {
  id: string;
  title: string;
  desc: string;
  target: number;
  current: number;
  reward: Record<string, number>;
  claimed: boolean;
  isDaily?: boolean;
}

export interface Spell {
  id: string;
  name: string;
  incantation: string;
  description: string;
  effectiveTypes: string[];
  color: string;
  glow: string;
  icon: string;
  bonusRate: number;
}

export interface ToastNotification {
  id: string;
  title?: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'energy' | 'mark';
}

export interface GameSettings {
  soundEnabled: boolean;
  driveMode: boolean;
  useVirtualGPS: boolean;
  googleMapsApiKey?: string;
  mapStyle: 'marauder' | 'parchment' | 'twilight';
}

export interface GameStats {
  totalEncounters: number;
  totalCaptures: number;
  totalWaypointsSpun: number;
  totalSpellsCast: number;
  masterfulCasts: number;
  marksDiscovered: number;
  kmWalked: number;
  treatsFed: number;
  raidsWon?: number;
}

export interface GameState {
  heroId: string;
  hasChosenHero: boolean;
  buddyInstanceId: string | null;
  totalKmWalked: number;
  totalSteps: number;
  buddyKmProgress: number;
  lastDailyReset: string;
  inventory: Record<string, number>;
  suitcase: CapturedBeast[];
  seenBeasts: Record<string, number>;
  caughtBeasts: Record<string, number>;
  attemptedDisturbances: Record<string, { status: 'captured' | 'fled' | 'escaped'; timestamp: number }>;
  activeLureUntil: number | null;
  raidsCompletedToday?: number;
  lastRaidDate?: string;
  isLocationPinned?: boolean;
  stats: GameStats;
  quests: Quest[];
  settings: GameSettings;
}
