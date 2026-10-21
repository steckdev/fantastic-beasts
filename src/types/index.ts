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

export type PotionEffectType =
  | 'wiggenweld'
  | 'edurus'
  | 'maxima'
  | 'invisibility'
  | 'focus'
  | 'thunderbrew';

export interface PotionRecipe {
  id: string;
  name: string;
  canonicalName: string;
  icon: string;
  color: string;
  glow: string;
  category: 'restorative' | 'offensive' | 'defensive' | 'stealth';
  effectType: PotionEffectType;
  description: string;
  gameplayBonusText: string;
  brewTimeSeconds: number;
  ingredients: {
    itemId: string;
    quantity: number;
  }[];
}

export interface CauldronSlot {
  id: string;
  recipeId: string | null;
  startedAt: number | null;
  finishesAt: number | null;
  isHoppingPot?: boolean;
  isReady: boolean;
}

export interface ActivePotionBuff {
  potionId: string;
  recipeId: string;
  effectType: PotionEffectType;
  name: string;
  icon: string;
  color: string;
  activatedAt: number;
  expiresAt?: number;
}

export interface Item {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: 'energy' | 'currency' | 'treat' | 'lure' | 'potion' | 'ingredient';
  max?: number;
  bondXP?: number;
  calmPower?: number;
  durationMinutes?: number;
  potionEffect?: PotionEffectType;
  potionRecipeId?: string;
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
  dailyAffectionXP?: number;
  lastAffectionDate?: string;
  satietyLevel?: number;
  lastFedTimestamp?: number;
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
  type: 'inn' | 'greenhouse' | 'fortress' | 'apothecary';
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
  batterySaver?: boolean;
  hapticsEnabled?: boolean;
  autoPinApparate?: boolean;
  cameraTilt3D?: boolean;
}

export interface AlchemistTalentPerk {
  id: string;
  rank: number;
  name: string;
  desc: string;
  icon: string;
  category: 'brewing' | 'harvest' | 'combat' | 'efficiency';
}

export interface CharacterProgression {
  alchemistRank: number; // 1 to 10
  alchemistXP: number;
  unlockedTalentPerks: string[];
}

export type MentorId = 'dumbledore' | 'grindelwald' | 'lally' | 'theseus' | 'newt' | 'tina';

export interface MentorInfo {
  id: MentorId;
  name: string;
  title: string;
  domain: string;
  quote: string;
  philosophy: string;
  sprite: string;
  accentColor: string;
  glowColor: string;
  passivePerkName: string;
  passivePerkDesc: string;
  specialtyTip: string;
}

export interface MasterclassDialogueStep {
  speaker: string;
  avatar: string;
  text: string;
  loreNote?: string;
}

export interface MasterclassChoice {
  id: string;
  text: string;
  response: string;
  isOptimal?: boolean;
  bonusKnuts?: number;
}

export interface MasterclassLesson {
  id: string;
  mentorId: MentorId;
  title: string;
  subtitle: string;
  domain: string;
  recommendedLevel: number;
  rewardXP: number;
  rewardKnuts: number;
  rewardTitle: string;
  dialogue: MasterclassDialogueStep[];
  interactiveChoice?: {
    prompt: string;
    options: MasterclassChoice[];
  };
  tacticalTakeaway: string;
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
  potionsBrewed?: number;
  masterworkBrews?: number;
  ingredientsHarvested?: number;
  potionsUsed?: number;
  shopTransactions?: number;
  masterclassesCompleted?: number;
}

export interface GameState {
  heroId: string;
  hasChosenHero: boolean;
  buddyInstanceId: string | null;
  activeMentorId?: MentorId;
  completedMasterclasses?: string[];
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
  cauldrons?: CauldronSlot[];
  activeBuffs?: Record<string, ActivePotionBuff>;
  characterProgression?: CharacterProgression;
  cauldronSlotsCount?: number;
  raidsCompletedToday?: number;
  lastRaidDate?: string;
  isLocationPinned?: boolean;
  stats: GameStats;
  quests: Quest[];
  settings: GameSettings;
}

