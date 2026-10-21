import { AlchemistTalentPerk, CharacterProgression } from '../types';

export interface RankInfo {
  rank: number;
  title: string;
  badge: string;
  icon: string;
  color: string;
  targetXP: number;
  perk: AlchemistTalentPerk;
}

export const ALCHEMIST_RANKS: RankInfo[] = [
  {
    rank: 1,
    title: 'Alchemical Novice',
    badge: 'Novice Potioneer',
    icon: '🧪',
    color: '#94a3b8',
    targetXP: 100,
    perk: {
      id: 'perk_basic_brewing',
      rank: 1,
      name: 'Basic Cauldron Alchemy',
      desc: 'Craft restorative draughts and protective elixirs in Newt\'s suitcase laboratory.',
      icon: '🧪',
      category: 'brewing'
    }
  },
  {
    rank: 2,
    title: 'Apprentice Potioneer',
    badge: 'Apprentice Brewer',
    icon: '🌿',
    color: '#10b981',
    targetXP: 250,
    perk: {
      id: 'perk_wiggenweld_mastery',
      rank: 2,
      name: 'Wiggenweld Mastery',
      desc: 'Wiggenweld Potion potency surges: restores +65 Spell Energy on demand (up from +50).',
      icon: '🧪',
      category: 'combat'
    }
  },
  {
    rank: 3,
    title: 'Herbologist Gatherer',
    badge: 'Herbology Expert',
    icon: '🍄',
    color: '#34d399',
    targetXP: 450,
    perk: {
      id: 'perk_green_thumb',
      rank: 3,
      name: 'Green Thumb Foraging',
      desc: 'Greenhouses and companion walking milestones drop +1 extra botanical flora.',
      icon: '🌿',
      category: 'harvest'
    }
  },
  {
    rank: 4,
    title: 'Apothecary Adept',
    badge: 'Apothecary Scholar',
    icon: '🛡️',
    color: '#d97706',
    targetXP: 700,
    perk: {
      id: 'perk_barkskin_aegis',
      rank: 4,
      name: 'Barkskin Aegis',
      desc: 'Edurus Potion shield extended to 3 turns and reflects 25% beast aggression back as calm aura.',
      icon: '🛡️',
      category: 'combat'
    }
  },
  {
    rank: 5,
    title: 'Brewmaster Journeyman',
    badge: 'Cauldron Specialist',
    icon: '⚗️',
    color: '#38bdf8',
    targetXP: 1000,
    perk: {
      id: 'perk_rapid_simmering',
      rank: 5,
      name: 'Rapid Simmering',
      desc: 'All background table cauldrons and brewing stations simmer 25% faster!',
      icon: '⏱️',
      category: 'efficiency'
    }
  },
  {
    rank: 6,
    title: 'Master of Elixirs',
    badge: 'Elixir Grandmaster',
    icon: '💥',
    color: '#ef4444',
    targetXP: 1400,
    perk: {
      id: 'perk_maxima_overdrive',
      rank: 6,
      name: 'Maxima Overdrive',
      desc: 'Maxima Potion elevates wand charm catch power by +50% (up from +40%).',
      icon: '💥',
      category: 'combat'
    }
  },
  {
    rank: 7,
    title: 'Tempest Concoctor',
    badge: 'Storm Channeler',
    icon: '⚡',
    color: '#a855f7',
    targetXP: 1900,
    perk: {
      id: 'perk_storm_surge',
      rank: 7,
      name: 'Tempest Storm Surge',
      desc: 'Thunderbrew lightning stun duration extended to 4 turns, totally pacifying fierce beasts.',
      icon: '⚡',
      category: 'combat'
    }
  },
  {
    rank: 8,
    title: 'Transmutation Savant',
    badge: 'Transmutation Sage',
    icon: '✨',
    color: '#fbbf24',
    targetXP: 2500,
    perk: {
      id: 'perk_alchemical_duplication',
      rank: 8,
      name: 'Alchemical Duplication',
      desc: '25% chance to duplicate any brewed potion or harvested reagent for double yield!',
      icon: '✨',
      category: 'brewing'
    }
  },
  {
    rank: 9,
    title: 'Celestial Alchemist',
    badge: 'Celestial Adept',
    icon: '🎯',
    color: '#fde047',
    targetXP: 3200,
    perk: {
      id: 'perk_celestial_focus',
      rank: 9,
      name: 'Celestial Focus Glyph',
      desc: 'Focus Potion guideline illuminates wider celestial rune path with 1.8x catch bonus.',
      icon: '🎯',
      category: 'combat'
    }
  },
  {
    rank: 10,
    title: 'Order of Merlin Luminary',
    badge: 'First Class Alchemist',
    icon: '👑',
    color: '#ec4899',
    targetXP: 3200,
    perk: {
      id: 'perk_philosophers_zenith',
      rank: 10,
      name: 'Philosopher\'s Zenith',
      desc: 'The Hopping Pot brews 2x faster with guaranteed Masterwork Double Yield (x2)!',
      icon: '👑',
      category: 'brewing'
    }
  }
];

class AlchemistService {
  getRankInfo(rank: number): RankInfo {
    const clamped = Math.max(1, Math.min(10, rank));
    return ALCHEMIST_RANKS.find((r) => r.rank === clamped) || ALCHEMIST_RANKS[0];
  }

  getTargetXP(rank: number): number {
    return this.getRankInfo(rank).targetXP;
  }

  getUnlockedPerks(rank: number): AlchemistTalentPerk[] {
    const clamped = Math.max(1, Math.min(10, rank));
    return ALCHEMIST_RANKS.filter((r) => r.rank <= clamped).map((r) => r.perk);
  }

  hasPerk(rank: number, perkId: string): boolean {
    const perks = this.getUnlockedPerks(rank);
    return perks.some((p) => p.id === perkId);
  }

  addXP(
    currentRank: number,
    currentXP: number,
    amount: number
  ): {
    newRank: number;
    newXP: number;
    didRankUp: boolean;
    unlockedPerk?: AlchemistTalentPerk;
  } {
    let rank = Math.max(1, Math.min(10, currentRank));
    let xp = currentXP + amount;
    let didRankUp = false;
    let unlockedPerk: AlchemistTalentPerk | undefined;

    while (rank < 10) {
      const target = this.getTargetXP(rank);
      if (xp >= target) {
        xp -= target;
        rank += 1;
        didRankUp = true;
        unlockedPerk = this.getRankInfo(rank).perk;
      } else {
        break;
      }
    }

    if (rank >= 10) {
      xp = Math.min(xp, this.getTargetXP(10));
    }

    return {
      newRank: rank,
      newXP: xp,
      didRankUp,
      unlockedPerk
    };
  }

  normalizeProgression(prog?: Partial<CharacterProgression>): CharacterProgression {
    const rank = Math.max(1, Math.min(10, prog?.alchemistRank || 1));
    const xp = Math.max(0, prog?.alchemistXP || 0);
    const perks = this.getUnlockedPerks(rank).map((p) => p.id);

    return {
      alchemistRank: rank,
      alchemistXP: xp,
      unlockedTalentPerks: perks
    };
  }
}

export const alchemistService = new AlchemistService();
