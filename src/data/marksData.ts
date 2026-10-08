import { Mark } from '../types';

export const MARKS: Mark[] = [
  {
    id: 'mark_storm',
    name: 'Mark of the Storm',
    title: 'the Tempest-Born',
    description: 'A beast born amidst crackling lightning and rolling thunderclouds.',
    rarity: 'Rare',
    chance: 0.08,
    color: '#38bdf8',
    glow: 'rgba(56, 189, 248, 0.6)',
    icon: '⚡',
    bonusText: '+15% Spell Resistance'
  },
  {
    id: 'mark_gilded',
    name: 'Mark of the Gilded',
    title: 'the Shiny-Hoarder',
    description: 'Possesses a shimmering golden sheen and an irresistible magnetism for treasure.',
    rarity: 'Rare',
    chance: 0.07,
    color: '#fbbf24',
    glow: 'rgba(251, 191, 36, 0.6)',
    icon: '🪙',
    bonusText: 'Harvests double Knuts from Waypoints'
  },
  {
    id: 'mark_slumbering',
    name: 'Mark of the Slumbering',
    title: 'the Sleepy',
    description: 'Always found dozing peacefully; radiates serene, drowsy warmth.',
    rarity: 'Uncommon',
    chance: 0.12,
    color: '#a78bfa',
    glow: 'rgba(167, 139, 250, 0.5)',
    icon: '💤',
    bonusText: 'Easier to calm with treats'
  },
  {
    id: 'mark_dawn',
    name: 'Mark of the Dawn',
    title: 'the Early-Riser',
    description: 'Brimming with morning dew and boundless sunrise energy.',
    rarity: 'Uncommon',
    chance: 0.14,
    color: '#f97316',
    glow: 'rgba(249, 115, 22, 0.5)',
    icon: '🌅',
    bonusText: 'Gains +20% Bond XP during day'
  },
  {
    id: 'mark_dusk',
    name: 'Mark of Twilight',
    title: 'the Night-Prowler',
    description: 'A shadowy, elusive spirit active beneath starlit silhouettes.',
    rarity: 'Uncommon',
    chance: 0.13,
    color: '#818cf8',
    glow: 'rgba(129, 140, 248, 0.5)',
    icon: '🌙',
    bonusText: 'Gains +20% Bond XP at night'
  },
  {
    id: 'mark_ancient',
    name: 'Mark of the Ancient Rune',
    title: 'the Rune-Bearer',
    description: 'Carries glowing magical glyphs etched into its essence by Merlin himself.',
    rarity: 'Very Rare',
    chance: 0.04,
    color: '#34d399',
    glow: 'rgba(52, 211, 153, 0.7)',
    icon: 'ᚱ',
    bonusText: '+30% Base Creature Power (CP)'
  },
  {
    id: 'mark_mischief',
    name: 'Mark of Mischief',
    title: 'the Unruly Scamp',
    description: 'Constantly plotting playful escapades and vanishing with trinkets.',
    rarity: 'Uncommon',
    chance: 0.10,
    color: '#f43f5e',
    glow: 'rgba(244, 63, 94, 0.5)',
    icon: '🎭',
    bonusText: 'Brings unexpected gift treats'
  },
  {
    id: 'mark_starlight',
    name: 'Mark of Starlight',
    title: 'the Star-Touched',
    description: 'Bathed in celestial stardust; its fur and feathers sparkle with stellar constellations.',
    rarity: 'Mythic',
    chance: 0.02,
    color: '#c084fc',
    glow: 'rgba(192, 132, 252, 0.8)',
    icon: '✨',
    bonusText: 'Cosmic Prismatic Aura in Sanctuary'
  },
  {
    id: 'mark_chosen',
    name: 'Mark of the Pure-Hearted',
    title: 'the Chosen Familiar',
    description: 'An immaculate soul revered by ancient Magizoologists; recognized by the Qilin.',
    rarity: 'Mythic',
    chance: 0.01,
    color: '#fef08a',
    glow: 'rgba(254, 240, 138, 0.9)',
    icon: '👑',
    bonusText: 'Max Friendship Cap unlocked'
  }
];

export function rollMark(bonusMultiplier: number = 1.0): Mark | null {
  // True Chase Rarity: Base ~6.5% mark spawn rate (1 in 15 beasts)
  // Queenie or specialized lures can elevate this up to ~12-16%
  const hasMarkChance = Math.min(0.25, 0.065 * bonusMultiplier);
  if (Math.random() > hasMarkChance) return null;

  // Weighted roll among marks (Mythic is extremely rare)
  const totalWeight = MARKS.reduce((sum, m) => sum + m.chance, 0);
  let rand = Math.random() * totalWeight;
  for (const mark of MARKS) {
    if (rand <= mark.chance) {
      return mark;
    }
    rand -= mark.chance;
  }
  return MARKS[0];
}
