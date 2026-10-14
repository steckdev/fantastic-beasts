import { PotionRecipe, Item } from '../types';

export const POTION_RECIPES: PotionRecipe[] = [
  {
    id: 'potion_wiggenweld',
    name: 'Wiggenweld Potion',
    canonicalName: 'Wiggenweld Restorative Elixir',
    icon: '🧪',
    color: '#10b981',
    glow: 'rgba(16, 185, 129, 0.5)',
    category: 'restorative',
    effectType: 'wiggenweld',
    description: 'Canonical invigorating potion brewed from Horklump juice and Dittany. Instantly replenishes magical vigor.',
    gameplayBonusText: 'Instantly restores +50 Spell Energy on demand in or out of encounters.',
    brewTimeSeconds: 30,
    ingredients: [
      { itemId: 'ing_horklump_juice', quantity: 1 },
      { itemId: 'ing_dittany', quantity: 1 }
    ]
  },
  {
    id: 'potion_edurus',
    name: 'Edurus Potion',
    canonicalName: 'Edurus Barkskin Brew',
    icon: '🛡️',
    color: '#d97706',
    glow: 'rgba(217, 119, 6, 0.45)',
    category: 'defensive',
    effectType: 'edurus',
    description: 'Coats the drinker in tough, stony bark. Hardens your wizarding defenses against aggressive beasts.',
    gameplayBonusText: 'Prevents beast from fleeing for 2 turns & shields against 50% raid attack damage.',
    brewTimeSeconds: 45,
    ingredients: [
      { itemId: 'ing_ashwinder_eggs', quantity: 1 },
      { itemId: 'ing_mongrel_fur', quantity: 1 }
    ]
  },
  {
    id: 'potion_maxima',
    name: 'Maxima Potion',
    canonicalName: 'Maxima Surging Draught',
    icon: '💥',
    color: '#ef4444',
    glow: 'rgba(239, 68, 68, 0.5)',
    category: 'offensive',
    effectType: 'maxima',
    description: 'Surges wand spell potency with crackling crimson electricity. Maximizes capture charm resonance.',
    gameplayBonusText: '+40% Wand Charm Catch Power and +50% Raid Boss Spell Damage!',
    brewTimeSeconds: 60,
    ingredients: [
      { itemId: 'ing_leech_juice', quantity: 1 },
      { itemId: 'ing_spider_fangs', quantity: 1 }
    ]
  },
  {
    id: 'potion_invisibility',
    name: 'Invisibility Potion',
    canonicalName: 'Invisibility Camouflage Mist',
    icon: '🌫️',
    color: '#38bdf8',
    glow: 'rgba(56, 189, 248, 0.45)',
    category: 'stealth',
    effectType: 'invisibility',
    description: 'Translucent silver mist that masks the drinker completely from sight and scent.',
    gameplayBonusText: '0% Flee Rate (Beast cannot detect or run away) + guaranteed Surprise Ambush bonus (+25% catch)!',
    brewTimeSeconds: 60,
    ingredients: [
      { itemId: 'ing_lacewing_flies', quantity: 1 },
      { itemId: 'ing_mooncalf_fur', quantity: 1 }
    ]
  },
  {
    id: 'potion_focus',
    name: 'Focus Potion',
    canonicalName: 'Focus Mind Draught',
    icon: '🎯',
    color: '#eab308',
    glow: 'rgba(234, 179, 8, 0.5)',
    category: 'offensive',
    effectType: 'focus',
    description: 'Sharpens concentration and spell reflexes. Illuminates celestial wand pathways.',
    gameplayBonusText: 'Projects glowing golden rune trace guides onto wand canvas for guaranteed Masterful Cast!',
    brewTimeSeconds: 75,
    ingredients: [
      { itemId: 'ing_fluxweed', quantity: 1 },
      { itemId: 'ing_dugbog_tongue', quantity: 1 }
    ]
  },
  {
    id: 'potion_thunderbrew',
    name: 'Thunderbrew Potion',
    canonicalName: 'Thunderbrew Tempest Brew',
    icon: '⚡',
    color: '#a855f7',
    glow: 'rgba(168, 85, 247, 0.5)',
    category: 'offensive',
    effectType: 'thunderbrew',
    description: 'Unleashes a violent storm of swirling thunderbolts that stun and overwhelm fierce adversaries.',
    gameplayBonusText: 'Strikes aggressive beasts with lightning, STUNNING them and pacifying their resistance rings!',
    brewTimeSeconds: 90,
    ingredients: [
      { itemId: 'ing_ashwinder_eggs', quantity: 1 },
      { itemId: 'ing_shrivelfig', quantity: 1 }
    ]
  }
];

export const POTION_ITEMS: Record<string, Item> = {
  potion_wiggenweld: {
    id: 'potion_wiggenweld',
    name: 'Wiggenweld Potion',
    icon: '🧪',
    description: 'Canonical Hogwarts restorative elixir. Restores +50 Spell Energy instantly.',
    category: 'potion',
    potionEffect: 'wiggenweld',
    potionRecipeId: 'potion_wiggenweld'
  },
  potion_edurus: {
    id: 'potion_edurus',
    name: 'Edurus Potion',
    icon: '🛡️',
    description: 'Tough rocky barkskin brew. Shields against beast flee and reduces raid damage by 50%.',
    category: 'potion',
    potionEffect: 'edurus',
    potionRecipeId: 'potion_edurus'
  },
  potion_maxima: {
    id: 'potion_maxima',
    name: 'Maxima Potion',
    icon: '💥',
    description: 'Crimson surging draught. Boosts wand charm catch power by +40% & raid spell damage by +50%.',
    category: 'potion',
    potionEffect: 'maxima',
    potionRecipeId: 'potion_maxima'
  },
  potion_invisibility: {
    id: 'potion_invisibility',
    name: 'Invisibility Potion',
    icon: '🌫️',
    description: 'Camouflaging ethereal mist. Prevents beast fleeing (0% flee) with +25% surprise ambush bonus.',
    category: 'potion',
    potionEffect: 'invisibility',
    potionRecipeId: 'potion_invisibility'
  },
  potion_focus: {
    id: 'potion_focus',
    name: 'Focus Potion',
    icon: '🎯',
    description: 'Sharpens magical reflex. Illuminates glowing golden guide runes on wand canvas for Masterful casts.',
    category: 'potion',
    potionEffect: 'focus',
    potionRecipeId: 'potion_focus'
  },
  potion_thunderbrew: {
    id: 'potion_thunderbrew',
    name: 'Thunderbrew Potion',
    icon: '⚡',
    description: 'Tempest storm brew. Summons electric lightning to stun aggressive beasts and freeze resistance.',
    category: 'potion',
    potionEffect: 'thunderbrew',
    potionRecipeId: 'potion_thunderbrew'
  }
};

export const INGREDIENT_ITEMS: Record<string, Item> = {
  ing_dittany: {
    id: 'ing_dittany',
    name: 'Dittany Leaves',
    icon: '🌿',
    description: 'Fragrant healing herb with restorative sap. Harvested from Greenhouses.',
    category: 'ingredient'
  },
  ing_horklump_juice: {
    id: 'ing_horklump_juice',
    name: 'Horklump Juice',
    icon: '🍄',
    description: 'Golden juice pressed from fleshy pink Horklump mushrooms.',
    category: 'ingredient'
  },
  ing_ashwinder_eggs: {
    id: 'ing_ashwinder_eggs',
    name: 'Ashwinder Eggs',
    icon: '🥚',
    description: 'Glowing incandescent fiery eggs left by serpents of magical fire.',
    category: 'ingredient'
  },
  ing_mongrel_fur: {
    id: 'ing_mongrel_fur',
    name: 'Dark Mongrel Fur',
    icon: '🐺',
    description: 'Coarse protective fur harvested safely from roaming magical mongrels.',
    category: 'ingredient'
  },
  ing_leech_juice: {
    id: 'ing_leech_juice',
    name: 'Leech Juice',
    icon: '💧',
    description: 'Concentrated essence that amplifies chemical and spell potency.',
    category: 'ingredient'
  },
  ing_spider_fangs: {
    id: 'ing_spider_fangs',
    name: 'Acromantula Fangs',
    icon: '🕷️',
    description: 'Rare venomous fang tips found near ancient ruins and dark grottos.',
    category: 'ingredient'
  },
  ing_lacewing_flies: {
    id: 'ing_lacewing_flies',
    name: 'Lacewing Flies',
    icon: '🪰',
    description: 'Delicate gossamer wings stewed for 21 days for transmutation potions.',
    category: 'ingredient'
  },
  ing_mooncalf_fur: {
    id: 'ing_mooncalf_fur',
    name: 'Mooncalf Soft Fur',
    icon: '🌕',
    description: 'Silken down shed by Mooncalves during full moon mating dances.',
    category: 'ingredient'
  },
  ing_fluxweed: {
    id: 'ing_fluxweed',
    name: 'Fluxweed Stems',
    icon: '🌱',
    description: 'Herb that must be picked under full moonlight to focus magical energies.',
    category: 'ingredient'
  },
  ing_dugbog_tongue: {
    id: 'ing_dugbog_tongue',
    name: 'Dugbog Tongue',
    icon: '👅',
    description: 'Rubbery tongue of a swamp marsh creature, used to ground turbulent brews.',
    category: 'ingredient'
  },
  ing_shrivelfig: {
    id: 'ing_shrivelfig',
    name: 'Shrivelfig Fruit',
    icon: '🍇',
    description: 'Deep violet fruit whose bitter peel channels electrical tempest magic.',
    category: 'ingredient'
  }
};
