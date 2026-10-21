import { MinistryClassification } from '../types';

export interface MoMClassificationInfo {
  code: MinistryClassification;
  tierNumber: 1 | 2 | 3 | 4 | 5;
  tierName: string;
  badgeText: string;
  shortLabel: string;
  stars: string;
  starLevel: string;
  title: string;
  riskLevel: 'Minimal' | 'Low' | 'Moderate' | 'Severe' | 'Lethal';
  color: string;
  bgColor: string;
  borderColor: string;
  sealIcon: string;
  officialDesc: string;
  departmentNote: string;
}

export const MOM_CLASSIFICATIONS: Record<MinistryClassification, MoMClassificationInfo> = {
  X: {
    code: 'X',
    tierNumber: 1,
    tierName: 'Familiar',
    badgeText: '🐾 1★ Familiar · ★☆☆☆☆',
    shortLabel: '1★ Familiar',
    stars: '★☆☆☆☆',
    starLevel: 'Level 1 (★☆☆☆☆)',
    title: 'Level 1 · Familiar Creature',
    riskLevel: 'Minimal',
    color: '#94a3b8',
    bgColor: 'rgba(148, 163, 184, 0.15)',
    borderColor: 'rgba(148, 163, 184, 0.4)',
    sealIcon: '🐾',
    officialDesc: 'Gentle & Docile Familiar',
    departmentNote: 'Gentle creatures cherished by young witches and wizards for everyday companionship.'
  },
  XX: {
    code: 'XX',
    tierNumber: 2,
    tierName: 'Curious',
    badgeText: '🌿 2★ Curious · ★★☆☆☆',
    shortLabel: '2★ Curious',
    stars: '★★☆☆☆',
    starLevel: 'Level 2 (★★☆☆☆)',
    title: 'Level 2 · Curious Beast',
    riskLevel: 'Low',
    color: '#34d399',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.45)',
    sealIcon: '🌿',
    officialDesc: 'Enchanted Companion & Trickster',
    departmentNote: 'Clever and playful creatures that bring luck or friendly mischief to careful handlers.'
  },
  XXX: {
    code: 'XXX',
    tierNumber: 3,
    tierName: 'Formidable',
    badgeText: '⚡ 3★ Formidable · ★★★☆☆',
    shortLabel: '3★ Formidable',
    stars: '★★★☆☆',
    starLevel: 'Level 3 (★★★☆☆)',
    title: 'Level 3 · Formidable Beast',
    riskLevel: 'Moderate',
    color: '#38bdf8',
    bgColor: 'rgba(56, 189, 248, 0.15)',
    borderColor: 'rgba(56, 189, 248, 0.45)',
    sealIcon: '⚡',
    officialDesc: 'Spirited & Powerful Beast',
    departmentNote: 'Spirited wild creatures possessing potent magic that test a wizard\'s reflexes and wandwork.'
  },
  XXXX: {
    code: 'XXXX',
    tierNumber: 4,
    tierName: 'Mythic',
    badgeText: '🔮 4★ Mythic · ★★★★☆',
    shortLabel: '4★ Mythic',
    stars: '★★★★☆',
    starLevel: 'Level 4 (★★★★☆)',
    title: 'Level 4 · Mythic Beast',
    riskLevel: 'Severe',
    color: '#c084fc',
    bgColor: 'rgba(192, 132, 252, 0.18)',
    borderColor: 'rgba(192, 132, 252, 0.55)',
    sealIcon: '🔮',
    officialDesc: 'Extraordinary Mythical Creature',
    departmentNote: 'Rare creatures of immense arcane power, extraordinary camouflage, or specialized defenses.'
  },
  XXXXX: {
    code: 'XXXXX',
    tierNumber: 5,
    tierName: 'Apex',
    badgeText: '👑 5★ Apex · ★★★★★',
    shortLabel: '5★ Apex',
    stars: '★★★★★',
    starLevel: 'Level 5 (★★★★★)',
    title: 'Level 5 · Legendary Apex',
    riskLevel: 'Lethal',
    color: '#fbbf24',
    bgColor: 'rgba(251, 191, 36, 0.22)',
    borderColor: 'rgba(251, 191, 36, 0.65)',
    sealIcon: '👑',
    officialDesc: 'Supreme Apex Titan',
    departmentNote: 'Apex mythical creatures of legend whose power commands reverence across the magical world.'
  }
};

export function getMoMClassification(code: string): MoMClassificationInfo {
  const norm = (code || 'XX').toUpperCase() as MinistryClassification;
  return MOM_CLASSIFICATIONS[norm] || MOM_CLASSIFICATIONS.XX;
}
