import { Spell } from '../types';

export const SPELLS: Spell[] = [
  {
    id: 'arresto_momentum',
    name: 'Arresto Momentum',
    incantation: 'Arresto Momentum!',
    description: 'The Slowing Charm. Calms kinetic movement and swift terrestrial creatures.',
    effectiveTypes: ['Beast', 'Equine'],
    color: '#38bdf8',
    glow: 'rgba(56, 189, 248, 0.7)',
    icon: '⏳',
    bonusRate: 0.25
  },
  {
    id: 'immobilus',
    name: 'Immobilus',
    incantation: 'Immobilus!',
    description: 'The Freezing Charm. Subdues mischievous tricksters and hyperactive woodland sprites in mid-air.',
    effectiveTypes: ['Humoresque'],
    color: '#60a5fa',
    glow: 'rgba(96, 165, 250, 0.7)',
    icon: '❄️',
    bonusRate: 0.25
  },
  {
    id: 'lumos_solem',
    name: 'Lumos Solem',
    incantation: 'Lumos Solem!',
    description: 'Radiates intense solar warmth, soothing botanical and herbological creatures.',
    effectiveTypes: ['Herbological'],
    color: '#facc15',
    glow: 'rgba(250, 204, 21, 0.7)',
    icon: '☀️',
    bonusRate: 0.25
  },
  {
    id: 'aguamenti',
    name: 'Aguamenti',
    incantation: 'Aguamenti!',
    description: 'Summons pure enchanted water currents, resonating with aquatic and amphibious beasts.',
    effectiveTypes: ['Aquatic'],
    color: '#06b6d4',
    glow: 'rgba(6, 182, 212, 0.7)',
    icon: '🌊',
    bonusRate: 0.25
  },
  {
    id: 'ventus',
    name: 'Ventus',
    incantation: 'Ventus!',
    description: 'The Wind Jinx. Generates gentle updrafts to steer airborne avian flyers safely to earth.',
    effectiveTypes: ['Avian'],
    color: '#a78bfa',
    glow: 'rgba(167, 139, 250, 0.7)',
    icon: '🪶',
    bonusRate: 0.25
  },
  {
    id: 'riddikulus',
    name: 'Riddikulus',
    incantation: 'Riddikulus!',
    description: 'Transforms frightful apparitions into comedic shapes; super effective against shapeshifters and phantoms.',
    effectiveTypes: ['Spectral', 'Non-Being'],
    color: '#ec4899',
    glow: 'rgba(236, 72, 153, 0.7)',
    icon: '🎭',
    bonusRate: 0.25
  },
  {
    id: 'bombarda',
    name: 'Bombarda',
    incantation: 'Bombarda!',
    description: 'A forceful concussive blast of magic powerful enough to subdue scale-plated dragons and stone golems.',
    effectiveTypes: ['Draconic', 'Construct'],
    color: '#f97316',
    glow: 'rgba(249, 115, 22, 0.7)',
    icon: '💥',
    bonusRate: 0.25
  },
  {
    id: 'flipendo',
    name: 'Flipendo',
    incantation: 'Flipendo!',
    description: 'The classic Hogwarts Knockback Jinx. Reliable and universally balanced for any wild trace.',
    effectiveTypes: [],
    color: '#fbbf24',
    glow: 'rgba(251, 191, 36, 0.6)',
    icon: '🪄',
    bonusRate: 0.05
  }
];

export function getSpellAffinity(spell: Spell, beastType: string): { isSuperEffective: boolean; label: string } {
  if (spell.effectiveTypes.includes(beastType)) {
    return {
      isSuperEffective: true,
      label: `Super Effective vs ${beastType}! (+25% Catch Chance)`
    };
  }
  return {
    isSuperEffective: false,
    label: `Standard Charm vs ${beastType}`
  };
}
