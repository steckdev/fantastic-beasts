import { CapturedBeast } from '../types';

export interface BondTierInfo {
  level: number;
  targetXP: number;
  title: string;
  stage: string;
  scale: number;
  perk: string;
  auraColor?: string;
}

export const BOND_TIERS: Record<number, BondTierInfo> = {
  1: {
    level: 1,
    targetXP: 100,
    title: 'Newly Rescued',
    stage: '🌱 Juvenile',
    scale: 0.90,
    perk: 'Standard companion bond'
  },
  2: {
    level: 2,
    targetXP: 150,
    title: 'Curious Companion',
    stage: '🌿 Developing',
    scale: 1.00,
    perk: '+10% Treat feeding bond efficiency'
  },
  3: {
    level: 3,
    targetXP: 220,
    title: 'Trusted Friend',
    stage: '🌿 Developing',
    scale: 1.06,
    perk: 'Unlocks playful acrobatic trick animations'
  },
  4: {
    level: 4,
    targetXP: 300,
    title: 'Devoted Ally',
    stage: '⚡ Mature Guardian',
    scale: 1.14,
    perk: 'Finds bonus Knuts during walking exploration',
    auraColor: 'rgba(56, 189, 248, 0.4)'
  },
  5: {
    level: 5,
    targetXP: 400,
    title: 'Guardian Partner',
    stage: '⚡ Mature Guardian',
    scale: 1.20,
    perk: 'Buddy Assist: +15% wild capture spell accuracy',
    auraColor: 'rgba(56, 189, 248, 0.6)'
  },
  6: {
    level: 6,
    targetXP: 520,
    title: 'Resolute Beast',
    stage: '🔮 Awakened Champion',
    scale: 1.26,
    perk: 'Unlocks rare elemental walking aura particles',
    auraColor: 'rgba(168, 85, 247, 0.5)'
  },
  7: {
    level: 7,
    targetXP: 660,
    title: 'Arcane Prodigy',
    stage: '🔮 Awakened Champion',
    scale: 1.32,
    perk: 'Reduces waypoint cooldown time when nearby',
    auraColor: 'rgba(168, 85, 247, 0.7)'
  },
  8: {
    level: 8,
    targetXP: 820,
    title: 'Sanctuary Champion',
    stage: '👑 Ancient Titan',
    scale: 1.38,
    perk: 'Doubles buddy walking distance milestone rewards',
    auraColor: 'rgba(251, 191, 36, 0.6)'
  },
  9: {
    level: 9,
    targetXP: 1000,
    title: 'Mythic Vanguard',
    stage: '👑 Ancient Titan',
    scale: 1.44,
    perk: 'Draws wild beasts closer to your leylines radius',
    auraColor: 'rgba(251, 191, 36, 0.8)'
  },
  10: {
    level: 10,
    targetXP: 1000,
    title: 'Apex Soulbound',
    stage: '👑 Supreme Apex',
    scale: 1.50,
    perk: 'Permanent Crowned Golden Apex Shimmer & Legendary Masteries',
    auraColor: 'rgba(251, 191, 36, 1.0)'
  }
};

export const bondService = {
  /**
   * Get the target XP needed to advance to the next bond level.
   */
  getTargetXP(level: number): number {
    const tier = BOND_TIERS[level] || BOND_TIERS[10];
    return tier.targetXP;
  },

  /**
   * Get tier info (title, size growth scale, stage badge, perk) for a bond level.
   */
  getTierInfo(level: number): BondTierInfo {
    return BOND_TIERS[Math.min(10, Math.max(1, level))] || BOND_TIERS[1];
  },

  /**
   * Get creature visual scale multiplier based on its bond level & CP growth.
   */
  getCreatureScale(level: number, cp?: number): number {
    const baseScale = this.getTierInfo(level).scale;
    // Slight additional natural stature growth for beasts with high CP
    const cpBonusScale = cp ? Math.min(0.12, (cp / 3000) * 0.12) : 0;
    return +(baseScale + cpBonusScale).toFixed(2);
  },

  /**
   * Add Bond XP and handle smooth multi-level progression with rollover XP and CP growth rewards.
   */
  addXP(
    currentLevel: number,
    currentXP: number,
    xpGain: number
  ): {
    newLevel: number;
    newXP: number;
    leveledUp: boolean;
    levelsGained: number;
    cpBonus: number;
  } {
    let lvl = Math.min(10, Math.max(1, currentLevel));
    let xp = Math.max(0, currentXP) + xpGain;
    let levelsGained = 0;
    let cpBonus = 0;

    while (lvl < 10) {
      const target = this.getTargetXP(lvl);
      if (xp >= target) {
        xp -= target;
        lvl += 1;
        levelsGained += 1;
        // Award +20 to +35 bonus CP on each bond level up!
        cpBonus += 20 + lvl * 2;
      } else {
        break;
      }
    }

    if (lvl >= 10) {
      lvl = 10;
      xp = Math.min(xp, this.getTargetXP(10));
    }

    return {
      newLevel: lvl,
      newXP: xp,
      leveledUp: levelsGained > 0,
      levelsGained,
      cpBonus
    };
  },

  DAILY_AFFECTION_MAX: 25,

  /**
   * Get today's YYYY-MM-DD date string.
   */
  getTodayString(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  },

  /**
   * Check daily affection progress (petting, grooming, tricks) capped at 25 XP/day.
   */
  getDailyAffection(
    beast: CapturedBeast,
    todayStr?: string
  ): {
    current: number;
    max: number;
    remaining: number;
    isMaxed: boolean;
  } {
    const today = todayStr || this.getTodayString();
    const current = beast.lastAffectionDate === today ? (beast.dailyAffectionXP || 0) : 0;
    const max = this.DAILY_AFFECTION_MAX;
    const remaining = Math.max(0, max - current);
    return {
      current,
      max,
      remaining,
      isMaxed: remaining <= 0
    };
  },

  /**
   * Calculate creature's current satiety (0% to 100%) taking into account digestion over time.
   * Fullness decreases by ~20% per hour.
   */
  getSatiety(
    beast: CapturedBeast
  ): {
    current: number;
    max: number;
    isFull: boolean;
    percent: number;
    hoursUntilHungry: number;
  } {
    const max = 100;
    const rawSatiety = beast.satietyLevel ?? 0;
    const lastFed = beast.lastFedTimestamp || 0;

    let current = rawSatiety;
    if (lastFed > 0) {
      const hoursPassed = (Date.now() - lastFed) / (1000 * 60 * 60);
      const decay = Math.floor(hoursPassed * 20); // 20% digestion per hour
      current = Math.max(0, Math.min(100, rawSatiety - decay));
    }

    const isFull = current >= 100;
    const hoursUntilHungry = isFull ? Math.ceil((current - 70) / 20) : 0;

    return {
      current,
      max,
      isFull,
      percent: current,
      hoursUntilHungry
    };
  },

  /**
   * Normalizes saved beast data from legacy flat /100 XP system
   */
  normalizeBeast(beast: CapturedBeast): CapturedBeast {
    const lvl = Math.min(10, Math.max(1, beast.bondLevel || 1));
    const target = this.getTargetXP(lvl);
    let xp = beast.bondXP || 0;

    // If beast was Level 2+ but had old cumulative 100 XP or greater than target
    if (xp >= target && lvl < 10) {
      xp = xp % target;
    }

    return {
      ...beast,
      bondLevel: lvl,
      bondXP: xp,
      dailyAffectionXP: beast.dailyAffectionXP || 0,
      lastAffectionDate: beast.lastAffectionDate || '',
      satietyLevel: beast.satietyLevel ?? 0,
      lastFedTimestamp: beast.lastFedTimestamp || 0
    };
  }
};
