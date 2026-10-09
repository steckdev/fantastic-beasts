import { MinistryClassification } from '../types';

export interface MoMClassificationInfo {
  code: MinistryClassification;
  tierNumber: 1 | 2 | 3 | 4 | 5;
  tierName: string;
  badgeText: string;
  stars: string;
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
    tierName: 'Familiar Creature',
    badgeText: '🐾 FAMILIAR · ★☆☆☆☆',
    stars: '★☆☆☆☆',
    title: 'Familiar Creature',
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
    tierName: 'Curious Beast',
    badgeText: '🌿 CURIOUS · ★★☆☆☆',
    stars: '★★☆☆☆',
    title: 'Curious Beast',
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
    tierName: 'Formidable Beast',
    badgeText: '⚡ FORMIDABLE · ★★★☆☆',
    stars: '★★★☆☆',
    title: 'Formidable Beast',
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
    tierName: 'Mythical Beast',
    badgeText: '🔮 MYTHICAL · ★★★★☆',
    stars: '★★★★☆',
    title: 'Mythical Beast',
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
    tierName: 'Legendary Apex',
    badgeText: '👑 LEGENDARY APEX · ★★★★★',
    stars: '★★★★★',
    title: 'Legendary Apex Beast',
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
