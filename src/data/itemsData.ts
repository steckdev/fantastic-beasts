import { Item } from '../types';

export const ITEMS: Record<string, Item> = {
  spell_energy: {
    id: 'spell_energy',
    name: 'Spell Energy',
    icon: '⚡',
    description: 'Vital magical energy drawn from leylines to cast capture charms.',
    category: 'energy',
    max: 100
  },
  knuts: {
    id: 'knuts',
    name: 'Bronze Knuts & Galleons',
    icon: '🪙',
    description: 'Wizarding currency gathered from waypoints and treasure-seeking Nifflers.',
    category: 'currency'
  },
  treat_brioche: {
    id: 'treat_brioche',
    name: 'Jacob\'s Sweet Brioche',
    icon: '🥐',
    description: 'Golden buttery pastry baked with love. Calms unruly wild beasts (+35% catch rate).',
    category: 'treat',
    bondXP: 30,
    calmPower: 0.35
  },
  treat_gilded_knut: {
    id: 'treat_gilded_knut',
    name: 'Gilded Sugar Coin',
    icon: '✨',
    description: 'Edible shimmering gold coin irresistible to Nifflers and greedy creatures (+45% catch rate).',
    category: 'treat',
    bondXP: 45,
    calmPower: 0.45
  },
  treat_woodlice: {
    id: 'treat_woodlice',
    name: 'Enchanted Woodlice',
    icon: '🐛',
    description: 'Sweet, organic fairy woodlice. Favorite delicacy of Bowtruckles and tree creatures.',
    category: 'treat',
    bondXP: 35,
    calmPower: 0.30
  },
  treat_moon_pellets: {
    id: 'treat_moon_pellets',
    name: 'Silver Moon Pellets',
    icon: '🌕',
    description: 'Pellets imbued with starlight and dew. Cherished by Mooncalves, Qilin, and Demiguises.',
    category: 'treat',
    bondXP: 50,
    calmPower: 0.40
  },
  treat_dragon_fruit: {
    id: 'treat_dragon_fruit',
    name: 'Dragon Fire Pepper',
    icon: '🌶️',
    description: 'Incandescent fiery treat favored by Thunderbirds, Phoenixes, and ferocious behemoths.',
    category: 'treat',
    bondXP: 60,
    calmPower: 0.50
  },
  beast_lure: {
    id: 'beast_lure',
    name: 'Enchanted Suitcase Lure',
    icon: '🧳',
    description: 'A bottle of rare beast pheromones that draws 4 wild Fantastic Beasts directly to you.',
    category: 'lure',
    durationMinutes: 15
  }
};
