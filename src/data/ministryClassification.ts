import { MinistryClassification } from '../types';

export interface MoMClassificationInfo {
  code: MinistryClassification;
  romanNumeral: string;
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
    romanNumeral: 'X',
    title: 'MoM Class X · Docile',
    riskLevel: 'Minimal',
    color: '#94a3b8',
    bgColor: 'rgba(148, 163, 184, 0.15)',
    borderColor: 'rgba(148, 163, 184, 0.4)',
    sealIcon: '📜',
    officialDesc: 'Boring / Harmless',
    departmentNote: 'Creatures of negligible magical threat. Easily tended by first-year students or non-magical caretakers.'
  },
  XX: {
    code: 'XX',
    romanNumeral: 'XX',
    title: 'MoM Class XX · Harmless',
    riskLevel: 'Low',
    color: '#34d399',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.45)',
    sealIcon: '🌿',
    officialDesc: 'Harmless / May be Domesticated',
    departmentNote: 'Gentle beasts that rarely cause disturbance. Many make loyal wizarding companions.'
  },
  XXX: {
    code: 'XXX',
    romanNumeral: 'XXX',
    title: 'MoM Class XXX · Competent Wizard',
    riskLevel: 'Moderate',
    color: '#38bdf8',
    bgColor: 'rgba(56, 189, 248, 0.15)',
    borderColor: 'rgba(56, 189, 248, 0.45)',
    sealIcon: '⚖️',
    officialDesc: 'Competent Wizard Should Cope',
    departmentNote: 'Requires fundamental spellwork and understanding of magical creature temperaments to pacify.'
  },
  XXXX: {
    code: 'XXXX',
    romanNumeral: 'XXXX',
    title: 'MoM Class XXXX · Dangerous Beast',
    riskLevel: 'Severe',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: 'rgba(245, 158, 11, 0.45)',
    sealIcon: '🛡️',
    officialDesc: 'Dangerous / Specialist Handling Required',
    departmentNote: 'Possesses immense strength, camouflage, or lethal curses. Handled only by licensed Magizoologists.'
  },
  XXXXX: {
    code: 'XXXXX',
    romanNumeral: 'XXXXX',
    title: 'MoM Class XXXXX · Wizard Killer',
    riskLevel: 'Lethal',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: 'rgba(239, 68, 68, 0.55)',
    sealIcon: '⚡',
    officialDesc: 'Known Wizard Killer / Impossible to Train',
    departmentNote: 'Apex magical beasts capable of widespread devastation. MoM Beast Division extreme alert protocol.'
  }
};

export function getMoMClassification(code: string): MoMClassificationInfo {
  const norm = (code || 'XX').toUpperCase() as MinistryClassification;
  return MOM_CLASSIFICATIONS[norm] || MOM_CLASSIFICATIONS.XX;
}
