import { Hero } from '../types';

export const HEROES: Hero[] = [
  {
    id: 'newt_scamander',
    name: 'Newt Scamander',
    title: 'World-Renowned Magizoologist',
    sprite: '/sprites/heroes/newt_scamander.png',
    quote: '"My philosophy is that worrying means you suffer twice."',
    bio: 'Dedicated protector of magical creatures and author of Fantastic Beasts and Where to Find Them. Carries an enchanted leather case that houses secret biomes.',
    perkName: 'Gentle Magizoologist',
    perkDescription: '+25% faster Bond Level growth when feeding and petting beasts in the Suitcase Sanctuary.',
    bonusMarkChance: 1.15,
    bonusTreatEffect: 1.25,
    catchAccuracyBonus: 1.10,
    startingItem: 'Enchanted Suitcase Lure'
  },
  {
    id: 'tina_goldstein',
    name: 'Tina Goldstein',
    title: 'MACUSA Auror Investigator',
    sprite: '/sprites/heroes/tina_goldstein.png',
    quote: '"The Statute of Secrecy must be upheld, but these beasts deserve our protection."',
    bio: 'Sharp-witted, dutiful MACUSA Auror with an unyielding moral compass. Unrivaled in tracing magical anomalies and subduing chaotic disturbances.',
    perkName: 'Auror Focus',
    perkDescription: '+25% Spell Accuracy on high-danger disturbances; reveals hidden trace hotspots.',
    bonusMarkChance: 1.10,
    bonusTreatEffect: 1.0,
    catchAccuracyBonus: 1.30,
    startingItem: 'Auror Detection Beacon'
  },
  {
    id: 'jacob_kowalski',
    name: 'Jacob Kowalski',
    title: 'Master Baker & Loyal No-Maj',
    sprite: '/sprites/heroes/jacob_kowalski.png',
    quote: '"I want to be a baker! Because people need snacks when things are scary."',
    bio: 'Heart of gold and master of enchanted pastries. Even the most terrifying magical behemoths melt at the aroma of Jacob\'s fresh brioches.',
    perkName: 'Sweet Brioche Aroma',
    perkDescription: 'Treats are +50% more effective at calming wild beasts, drastically reducing flee chances.',
    bonusMarkChance: 1.20,
    bonusTreatEffect: 1.60,
    catchAccuracyBonus: 1.05,
    startingItem: 'Jacob\'s Fresh Cinnamon Brioche'
  },
  {
    id: 'queenie_goldstein',
    name: 'Queenie Goldstein',
    title: 'Legilimens & Empath',
    sprite: '/sprites/heroes/queenie_goldstein.png',
    quote: '"People think they\'re so good at hiding what\'s in their hearts, but I hear it clear as day."',
    bio: 'Born Legilimens with the natural gift to perceive thoughts and feelings. Senses the secret marks, spirits, and moods of every beast in the wild.',
    perkName: 'Heart of Legilimens',
    perkDescription: '3x higher chance of encountering beasts bearing rare Ancient Marks and hidden titles.',
    bonusMarkChance: 2.50,
    bonusTreatEffect: 1.20,
    catchAccuracyBonus: 1.15,
    startingItem: 'Enchanted Mind Mirror'
  }
];
