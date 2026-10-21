import React, { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Wand2, X, Heart, Sparkles, Wind, Flame, Droplets, Zap, ShieldAlert, FlaskConical, Shield, Eye, Target } from 'lucide-react';
import { sounds } from '../services/soundService';
import { ITEMS } from '../data/itemsData';
import { SPELLS, getSpellAffinity } from '../data/spellsData';
import { POTION_RECIPES } from '../data/potionsData';
import { Disturbance, Hero, Mark, Item, Spell, PotionRecipe, PotionEffectType, MentorId } from '../types';
import { getMoMClassification } from '../data/ministryClassification';
import { MENTORS, getMentorTacticalAdvice } from '../data/mentorData';

interface EncounterModalProps {
  disturbance: Disturbance;
  hero: Hero;
  inventory: Record<string, number>;
  alchemistRank?: number;
  activeMentorId?: MentorId;
  onConsumeItem: (itemKey: string, amount?: number) => void;
  onCaptureSuccess: (data: { beastId: string; cp: number; mark: Mark | null }) => void;
  onFlee: (disturbanceId: string) => void;
  onClose: () => void;
  onOpenSanctuary?: () => void;
  onShowToast?: (title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' | 'energy' | 'mark') => void;
  onReplenishEnergy?: (amount: number) => void;
  onPotionUsed?: (potionId: string) => void;
}

export default function EncounterModal({
  disturbance,
  hero,
  inventory,
  alchemistRank = 1,
  activeMentorId = 'newt',
  onConsumeItem,
  onCaptureSuccess,
  onFlee,
  onClose,
  onOpenSanctuary,
  onShowToast,
  onReplenishEnergy,
  onPotionUsed
}: EncounterModalProps) {
  const { beast, cp, mark } = disturbance;
  const mom = getMoMClassification(beast.classification);
  const mentor = MENTORS[activeMentorId] || MENTORS.newt;
  const tacticalAdvice = getMentorTacticalAdvice(activeMentorId, disturbance, inventory);

  const [phase, setPhase] = useState<'encounter' | 'casting' | 'capturing' | 'caught' | 'fled'>('encounter');
  const [wobbleCount, setWobbleCount] = useState<number>(0);
  const [treatBonus, setTreatBonus] = useState<number>(0);
  const [showTreatDrawer, setShowTreatDrawer] = useState<boolean>(false);
  const [showSpellDrawer, setShowSpellDrawer] = useState<boolean>(false);
  const [showPotionBelt, setShowPotionBelt] = useState<boolean>(false);
  const [activePotions, setActivePotions] = useState<Record<string, boolean>>({});
  const [beastStunnedTurns, setBeastStunnedTurns] = useState<number>(0);
  const [edurusShieldTurns, setEdurusShieldTurns] = useState<number>(0);
  const [castAccuracy, setCastAccuracy] = useState<'fair' | 'good' | 'great' | 'masterful' | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);

  // Default to a type-effective spell if one matches, otherwise Flipendo
  const initialSpell =
    SPELLS.find((s) => s.effectiveTypes.includes(beast.type)) ||
    SPELLS.find((s) => s.id === 'flipendo') ||
    SPELLS[0];
  const [selectedSpell, setSelectedSpell] = useState<Spell>(initialSpell);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const strokePointsRef = useRef<{ x: number; y: number }[]>([]);

  const spellAffinity = getSpellAffinity(selectedSpell, beast.type);
  const spellBonusMultiplier = spellAffinity.isSuperEffective ? 1.25 : 1.0;

  // Tactical potion modifiers (enhanced by Alchemist Talent Perks)
  const maximaMultiplier = activePotions.maxima ? (alchemistRank >= 6 ? 1.5 : 1.4) : 1.0;
  const surpriseBonus = activePotions.invisibility ? 0.25 : 0;
  const baseCatch = beast.baseCatchRate;
  const heroBonus = hero.catchAccuracyBonus || 1.0;
  const mentorMasterfulBonus = activeMentorId === 'dumbledore' ? 1.4 : 1.0;
  const tinaThreatBonus = activeMentorId === 'tina' && beast.dangerRating >= 4 ? 1.30 : 1.0;
  const accuracyMultiplier =
    castAccuracy === 'masterful'
      ? (alchemistRank >= 9 && activePotions.focus ? 1.8 : 1.6) * mentorMasterfulBonus
      : castAccuracy === 'great'
      ? 1.35
      : castAccuracy === 'good'
      ? 1.15
      : 1.0;
  const dangerPenalty =
    beastStunnedTurns > 0 ? 1.0 : beast.dangerRating >= 4 ? (beast.dangerRating === 5 ? 0.72 : 0.85) : 1.0;
  const cpDifficultyFactor = Math.max(0.65, 1 - (cp / (beast.maxCP * 1.6)) * 0.35);

  const currentCatchChance = Math.min(
    0.98,
    Math.max(
      0.15,
      (baseCatch * dangerPenalty * cpDifficultyFactor + treatBonus + surpriseBonus) *
        heroBonus *
        accuracyMultiplier *
        spellBonusMultiplier *
        maximaMultiplier *
        tinaThreatBonus
    )
  );

  // Play creature cry on encounter open
  useEffect(() => {
    sounds.playCreatureCry(beast.cryFreq || 440);
  }, [beast]);

  // Wand gesture canvas handling
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  }, [phase]);

  const handleStartDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (phase !== 'encounter') return;
    setIsDrawing(true);
    strokePointsRef.current = [];
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    strokePointsRef.current.push({ x, y });
  };

  const handleDrawMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    strokePointsRef.current.push({ x, y });

    // Draw glowing wand beam styled by the selected spell
    ctx.lineWidth = 7;
    ctx.strokeStyle = selectedSpell.color;
    ctx.shadowColor = selectedSpell.color;
    ctx.shadowBlur = 16;

    const pts = strokePointsRef.current;
    if (pts.length > 1) {
      ctx.beginPath();
      ctx.moveTo(pts[pts.length - 2].x, pts[pts.length - 2].y);
      ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
      ctx.stroke();
    }
  };

  const handleEndDraw = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const pts = strokePointsRef.current;
    if (pts.length < 5) return;

    if (inventory.spell_energy <= 0) {
      if (onShowToast) {
        onShowToast('Out of Spell Energy', 'Visit a nearby Magical Inn or spin a Waypoint to replenish!', 'energy');
      }
      return;
    }

    onConsumeItem('spell_energy', 1);

    const length = pts.length;
    let acc: 'fair' | 'good' | 'great' | 'masterful' = 'good';
    if (activePotions.focus) {
      acc = 'masterful';
    } else if (length > 35) {
      acc = 'masterful';
    } else if (length > 20) {
      acc = 'great';
    } else if (length > 10) {
      acc = 'good';
    } else {
      acc = 'fair';
    }

    setCastAccuracy(acc);
    sounds.playWandCast(acc);
    executeCaptureAttempt();
  };

  const handleQuickCast = () => {
    if (inventory.spell_energy <= 0) {
      if (onShowToast) {
        onShowToast('Out of Spell Energy', 'Visit a nearby Magical Inn or spin a Waypoint to replenish!', 'energy');
      }
      return;
    }
    onConsumeItem('spell_energy', 1);
    const ratings: ('good' | 'great' | 'masterful')[] = ['good', 'great', 'masterful'];
    const acc = activePotions.focus ? 'masterful' : ratings[Math.floor(Math.random() * ratings.length)];
    setCastAccuracy(acc);
    sounds.playWandCast(acc);
    executeCaptureAttempt();
  };

  const handleDrinkPotion = (potion: PotionRecipe) => {
    if ((inventory[potion.id] || 0) <= 0) return;

    onConsumeItem(potion.id, 1);
    sounds.playDrinkPotion();

    if (onPotionUsed) {
      onPotionUsed(potion.id);
    }

    if (potion.effectType === 'wiggenweld') {
      // Wiggenweld Mastery (Rank 2): restores +65 Spell Energy (up from +50)
      const energyRestored = alchemistRank >= 2 ? 65 : 50;
      if (onReplenishEnergy) {
        onReplenishEnergy(energyRestored);
      } else {
        onConsumeItem('spell_energy', -energyRestored);
      }
      confetti({ particleCount: 30, spread: 50, colors: ['#10b981', '#34d399', '#fde047'] });
      if (onShowToast) {
        onShowToast(
          'Vitality Restored!',
          `Drank Wiggenweld Potion! +${energyRestored} Spell Energy restored!${alchemistRank >= 2 ? ' (Wiggenweld Mastery)' : ''}`,
          'energy'
        );
      }
    } else if (potion.effectType === 'thunderbrew') {
      sounds.playThunderbrew();
      // Tempest Storm Surge (Rank 7): 4 turns stun (up from 3)
      const stunTurns = alchemistRank >= 7 ? 4 : 3;
      setBeastStunnedTurns(stunTurns);
      setActivePotions((prev) => ({ ...prev, thunderbrew: true }));
      confetti({ particleCount: 40, spread: 60, colors: ['#a855f7', '#38bdf8', '#fde047'] });
      if (onShowToast) {
        onShowToast(
          'Tempest Stun!',
          `Thunderbrew struck with lightning! STUNNED for ${stunTurns} turns!${alchemistRank >= 7 ? ' (Storm Surge)' : ''}`,
          'mark'
        );
      }
    } else if (potion.effectType === 'focus') {
      sounds.playFocusChime();
      setActivePotions((prev) => ({ ...prev, focus: true }));
      confetti({ particleCount: 30, spread: 50, colors: ['#fbbf24', '#fde047', '#38bdf8'] });
      if (onShowToast) {
        onShowToast(
          'Mind Focused!',
          `Golden guide runes projected! Next cast is guaranteed MASTERFUL!${alchemistRank >= 9 ? ' (Celestial Glyph 1.8x)' : ''}`,
          'success'
        );
      }
    } else if (potion.effectType === 'maxima') {
      sounds.playSparkle();
      setActivePotions((prev) => ({ ...prev, maxima: true }));
      confetti({ particleCount: 35, spread: 55, colors: ['#ef4444', '#f97316', '#fbbf24'] });
      const boostPct = alchemistRank >= 6 ? '+50%' : '+40%';
      if (onShowToast) {
        onShowToast(
          'Spell Power Surged!',
          `Maxima Potion consumed! Wand charm catch power surged ${boostPct}!${alchemistRank >= 6 ? ' (Maxima Overdrive)' : ''}`,
          'success'
        );
      }
    } else if (potion.effectType === 'invisibility') {
      setActivePotions((prev) => ({ ...prev, invisibility: true }));
      confetti({ particleCount: 30, spread: 50, colors: ['#38bdf8', '#cbd5e1', '#ffffff'] });
      if (onShowToast) onShowToast('Camouflaged!', 'Invisibility Potion active! 0% flee rate & +25% surprise ambush bonus!', 'success');
    } else if (potion.effectType === 'edurus') {
      // Barkskin Aegis (Rank 4): 3 turns shield (up from 2)
      const shieldTurns = alchemistRank >= 4 ? 3 : 2;
      setEdurusShieldTurns(shieldTurns);
      setActivePotions((prev) => ({ ...prev, edurus: true }));
      confetti({ particleCount: 30, spread: 50, colors: ['#d97706', '#b45309', '#fde047'] });
      if (onShowToast) {
        onShowToast(
          'Barkskin Active!',
          `Edurus Potion hardened defenses! Beast cannot flee for ${shieldTurns} turns!${alchemistRank >= 4 ? ' (Barkskin Aegis)' : ''}`,
          'success'
        );
      }
    }

    setShowPotionBelt(false);
  };

  const executeCaptureAttempt = () => {
    setPhase('capturing');
    setWobbleCount(0);

    setTimeout(() => {
      sounds.playSuitcaseClick();
      setWobbleCount(1);
    }, 700);

    setTimeout(() => {
      sounds.playSuitcaseClick();
      setWobbleCount(2);
    }, 1400);

    setTimeout(() => {
      sounds.playSuitcaseClick();
      setWobbleCount(3);
    }, 2100);

    setTimeout(() => {
      const roll = Math.random();
      const success = roll <= currentCatchChance;

      if (success) {
        setPhase('caught');
        sounds.playCatchSuccess();
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
        if (mark) {
          setTimeout(() => {
            sounds.playMarkReveal();
            if (onShowToast) {
              onShowToast('Rare Mark Discovered!', `You captured a beast with ${mark.name}: ${mark.title}!`, 'mark');
            }
          }, 600);
        }
        onCaptureSuccess({
          beastId: beast.id,
          cp,
          mark
        });
      } else {
        // Tactical Potion Immunity Check against fleeing!
        if (activePotions.invisibility || (activePotions.edurus && edurusShieldTurns > 0) || (activePotions.thunderbrew && beastStunnedTurns > 0)) {
          setPhase('encounter');
          setCastAccuracy(null);
          sounds.playCreatureCry((beast.cryFreq || 440) * 1.1);

          if (beastStunnedTurns > 0) setBeastStunnedTurns((prev) => prev - 1);
          if (edurusShieldTurns > 0) setEdurusShieldTurns((prev) => prev - 1);

          if (onShowToast) {
            const reason = activePotions.invisibility
              ? 'Invisibility Active: Beast cannot detect you and cannot flee!'
              : activePotions.edurus
              ? 'Edurus Barkskin: Shield prevented the beast from escaping!'
              : 'Thunderbrew Stun: Beast was stunned and unable to flee!';
            onShowToast('Broke Free but Trapped!', reason, 'info');
          }
          return;
        }

        // Genuine Breakout & Flee Check
        const baseFlee = beast.fleeRate || 0.12;
        const threatFactor = (beast.dangerRating - 1) * 0.06;
        const effectiveFleeRate = Math.min(0.65, Math.max(0.06, baseFlee + threatFactor - treatBonus * 0.3));
        const fleeRoll = Math.random();

        if (fleeRoll < effectiveFleeRate) {
          setPhase('fled');
          sounds.playFlee();
          sounds.playCreatureCry((beast.cryFreq || 440) * 0.65);
          onFlee(disturbance.id);
          if (onShowToast) {
            onShowToast('Beast Fled!', `${beast.name} escaped into the shadows!`, 'warning');
          }
        } else {
          // Broke free but still in encounter
          setPhase('encounter');
          setCastAccuracy(null);
          sounds.playCreatureCry((beast.cryFreq || 440) * 1.1);
          if (onShowToast) {
            onShowToast('Broke Free!', `${beast.name} resisted the suitcase vortex! Feed a treat or cast again!`, 'warning');
          }
        }
      }
    }, 2800);
  };

  const handleFeedTreat = (treatKey: string) => {
    const treat: Item = ITEMS[treatKey];
    if (!treat || (inventory[treatKey] || 0) <= 0) return;

    onConsumeItem(treatKey, 1);
    sounds.playPurr();
    const mentorTreatBonus = activeMentorId === 'newt' ? 1.35 : 1.0;
    const bonus = (treat.calmPower || 0.3) * (hero.bonusTreatEffect || 1.0) * mentorTreatBonus;
    setTreatBonus((prev) => prev + bonus);
    setShowTreatDrawer(false);

    confetti({
      particleCount: 25,
      spread: 50,
      origin: { y: 0.4 },
      colors: ['#f43f5e', '#ec4899', '#fbbf24']
    });

    if (onShowToast) {
      onShowToast('Treat Accepted!', `Fed ${treat.name}. Capture chance raised!`, 'success');
    }
  };

  const getRingColor = (): string => {
    if (currentCatchChance > 0.65) return '#10b981';
    if (currentCatchChance > 0.45) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }}>
      <div
        className="glass-panel"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '440px',
          height: '92vh',
          maxHeight: '840px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 16px',
          background: 'radial-gradient(circle at 50% 30%, #1e293b 0%, #090d16 100%)',
          border: '2px solid var(--border-gold-bright)',
          overflow: 'hidden'
        }}
      >
        {/* Top Header */}
        <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              className="threat-badge"
              style={{
                background: mom.bgColor,
                color: mom.color,
                borderColor: mom.borderColor,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <span>{mom.badgeText}</span>
            </span>
            <span
              style={{
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#fbbf24',
                background: 'rgba(0,0,0,0.5)',
                padding: '3px 8px',
                borderRadius: '6px',
                border: '1px solid rgba(251, 191, 36, 0.4)'
              }}
            >
              CP {cp}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: inventory.spell_energy > 10 ? '#38bdf8' : '#ef4444'
              }}
            >
              <span>⚡</span>
              <span>{inventory.spell_energy || 0}</span>
            </div>

            <button
              onClick={onClose}
              className="btn-modal-close"
              title="Leave encounter"
              aria-label="Leave encounter"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Beast Name & Title */}
        <div style={{ textAlign: 'center', zIndex: 10, marginTop: '2px' }}>
          <h2 className="font-cinzel title-glow" style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fef08a', letterSpacing: '0.04em' }}>
            {beast.name}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{beast.species}</span>
            <span style={{ fontSize: '0.72rem', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.15)', padding: '1px 6px', borderRadius: '4px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
              Type: {beast.type}
            </span>
          </div>

          {mark && (
            <div
              className="mark-badge"
              style={{
                marginTop: '6px',
                borderColor: mark.color,
                color: mark.color,
                boxShadow: `0 0 12px ${mark.glow}`,
                animation: 'golden-shimmer 2s infinite ease-in-out'
              }}
            >
              <span>{mark.icon}</span>
              <span>Mark: {mark.title}</span>
            </div>
          )}
        </div>

        {/* Tactical Mentor Coaching Chip */}
        {phase === 'encounter' && (
          <div
            style={{
              width: '100%',
              maxWidth: '380px',
              zIndex: 10,
              margin: '4px 0 2px',
              padding: '6px 10px',
              borderRadius: '12px',
              background: 'rgba(15, 23, 42, 0.9)',
              border: `1.5px solid ${tacticalAdvice.urgency === 'critical' ? '#ef4444' : tacticalAdvice.urgency === 'caution' ? '#f59e0b' : mentor.accentColor}`,
              boxShadow: `0 4px 14px ${tacticalAdvice.urgency === 'critical' ? 'rgba(239, 68, 68, 0.25)' : mentor.glowColor}`,
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <img
              src={mentor.sprite}
              alt={mentor.name}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                border: `1.5px solid ${mentor.accentColor}`,
                objectFit: 'cover',
                flexShrink: 0,
                background: '#090d16'
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    color: mentor.accentColor,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}
                >
                  {mentor.name.split(' ')[0]}'s Coaching
                </span>
                {tacticalAdvice.urgency !== 'normal' && (
                  <span
                    style={{
                      fontSize: '0.6rem',
                      fontWeight: 800,
                      color: tacticalAdvice.urgency === 'critical' ? '#fca5a5' : '#fef08a',
                      background: tacticalAdvice.urgency === 'critical' ? 'rgba(239, 68, 68, 0.35)' : 'rgba(245, 158, 11, 0.35)',
                      padding: '1px 5px',
                      borderRadius: '4px'
                    }}
                  >
                    {tacticalAdvice.urgency === 'critical' ? 'CRITICAL RISK' : 'FIELD CAUTION'}
                  </span>
                )}
              </div>
              <p
                style={{
                  margin: '1px 0 0',
                  fontSize: '0.74rem',
                  color: '#e2e8f0',
                  lineHeight: '1.25',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical'
                }}
              >
                "{tacticalAdvice.text}"
              </p>
            </div>
          </div>
        )}

        {/* Center Stage: Beast & Catch Ring */}
        <div
          style={{
            position: 'relative',
            width: '270px',
            height: '270px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 5
          }}
        >
          {phase === 'encounter' && (
            <div
              style={{
                position: 'absolute',
                width: '220px',
                height: '220px',
                borderRadius: '50%',
                border: `3px dashed ${getRingColor()}`,
                animation: 'pulse-ring 2s infinite ease-in-out',
                pointerEvents: 'none'
              }}
            />
          )}

          {phase !== 'capturing' && phase !== 'caught' && phase !== 'fled' && (
            <div
              className="animate-float"
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                filter: activePotions.invisibility ? 'opacity(0.85)' : 'none'
              }}
            >
              {/* Thunderbrew Stun Aura */}
              {beastStunnedTurns > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: 'rgba(168, 85, 247, 0.45)',
                    padding: '3px 10px',
                    borderRadius: '12px',
                    border: '1.5px solid #c084fc',
                    color: '#fef08a',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    boxShadow: '0 0 14px rgba(168, 85, 247, 0.8)',
                    zIndex: 15,
                    animation: 'pulse 1s infinite'
                  }}
                >
                  <span>⚡</span>
                  <span>STUNNED ({beastStunnedTurns} Turns)</span>
                </div>
              )}

              {/* Invisibility Camouflage Status */}
              {activePotions.invisibility && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '-14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: 'rgba(56, 189, 248, 0.35)',
                    padding: '3px 10px',
                    borderRadius: '12px',
                    border: '1.5px solid #38bdf8',
                    color: '#38bdf8',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    zIndex: 15
                  }}
                >
                  <span>🌫️</span>
                  <span>Camouflaged (0% Flee)</span>
                </div>
              )}

              <img
                src={beast.sprite}
                alt={beast.name}
                style={{
                  width: '200px',
                  height: '200px',
                  objectFit: 'contain',
                  filter: mark
                    ? `drop-shadow(0 0 16px ${mark.color})`
                    : activePotions.maxima
                    ? 'drop-shadow(0 0 20px #ef4444)'
                    : activePotions.edurus
                    ? 'drop-shadow(0 0 18px #d97706)'
                    : 'drop-shadow(0 8px 16px rgba(0,0,0,0.6))',
                  transition: 'filter 0.3s'
                }}
              />
            </div>
          )}

          {/* Capturing Suitcase */}
          {phase === 'capturing' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '140px',
                  height: '140px',
                  transform: wobbleCount % 2 === 1 ? 'rotate(-14deg)' : wobbleCount > 0 ? 'rotate(14deg)' : 'none',
                  transition: 'transform 0.15s ease-in-out',
                  filter: 'drop-shadow(0 14px 28px rgba(245, 158, 11, 0.6))'
                }}
              >
                <img
                  src={wobbleCount === 0 ? '/items/briefcase_vortex.png' : '/items/briefcase_closed.png'}
                  alt="Newt's Suitcase"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>
            </div>
          )}

          {/* Caught Success View */}
          {phase === 'caught' && (
            <div style={{ textAlign: 'center', width: '100%', animation: 'slideUp 0.35s ease-out' }}>
              <div style={{ position: 'relative', width: '130px', height: '130px', margin: '0 auto 8px' }}>
                <img
                  src={beast.sprite}
                  alt={beast.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    filter: mark
                      ? `drop-shadow(0 0 16px ${mark.color})`
                      : 'drop-shadow(0 8px 16px rgba(0,0,0,0.7))'
                  }}
                />
              </div>

              <h3 className="font-cinzel" style={{ fontSize: '1.35rem', color: '#34d399', fontWeight: 800 }}>
                {beast.name.toUpperCase()} CAPTURED!
              </h3>
              <p style={{ color: '#cbd5e1', fontSize: '0.82rem', marginTop: '2px' }}>
                CP {cp} · {mom.title} ({mom.stars}) · {beast.habitat}
              </p>

              {/* Reward Highlights - Knuts & XP only, no free energy */}
              <div
                className="glass-card"
                style={{
                  margin: '12px auto',
                  padding: '10px 18px',
                  display: 'flex',
                  justifyContent: 'space-around',
                  maxWidth: '280px',
                  borderColor: 'rgba(251, 191, 36, 0.4)'
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.96rem', fontWeight: 800, color: '#fbbf24' }}>🪙 +30</div>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Knuts</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.96rem', fontWeight: 800, color: '#a855f7' }}>📜 +100</div>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Ministry XP</div>
                </div>
              </div>

              {mark && (
                <div
                  className="glass-card"
                  style={{
                    margin: '8px auto 6px',
                    maxWidth: '320px',
                    padding: '8px 12px',
                    borderColor: mark.color,
                    color: mark.color,
                    boxShadow: `0 0 16px ${mark.glow}`
                  }}
                >
                  <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>
                    {mark.icon} Rare Mark: {mark.title}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#cbd5e1' }}>{mark.bonusText}</div>
                </div>
              )}
            </div>
          )}

          {/* Fled View */}
          {phase === 'fled' && (
            <div style={{ textAlign: 'center', padding: '16px' }}>
              <div style={{ fontSize: '64px', marginBottom: '8px' }}>💨</div>
              <h3 className="font-cinzel" style={{ fontSize: '1.35rem', color: '#ef4444', fontWeight: 800 }}>
                THE BEAST HAS FLED!
              </h3>
              <p style={{ color: '#cbd5e1', fontSize: '0.85rem', marginTop: '6px', lineHeight: 1.4 }}>
                {beast.name} broke free from the vortex and vanished into the enchanted mists.
              </p>
              <div
                style={{
                  marginTop: '10px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.75rem',
                  color: '#94a3b8',
                  background: 'rgba(0,0,0,0.4)',
                  padding: '4px 10px',
                  borderRadius: '6px'
                }}
              >
                <ShieldAlert size={14} color="#f87171" />
                <span>Marked as Fled in your disturbance registry</span>
              </div>
            </div>
          )}
        </div>

        {/* Wand Spell & Type Affinity Bar */}
        {phase === 'encounter' && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.78rem', color: '#fbbf24', fontWeight: 700 }}>
                  Active Spell:
                </span>
                <span
                  style={{
                    fontSize: '0.78rem',
                    color: selectedSpell.color,
                    fontWeight: 800,
                    textShadow: `0 0 8px ${selectedSpell.glow}`
                  }}
                >
                  {selectedSpell.icon} {selectedSpell.name}
                </span>
              </div>

              <button
                onClick={() => setShowSpellDrawer(!showSpellDrawer)}
                className="btn-secondary"
                style={{ padding: '2px 8px', fontSize: '0.72rem', borderRadius: '6px' }}
              >
                Switch Spell
              </button>
            </div>

            {/* Affinity Badge */}
            {spellAffinity.isSuperEffective && (
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.2)',
                  border: '1px solid #10b981',
                  borderRadius: '6px',
                  padding: '3px 8px',
                  fontSize: '0.72rem',
                  color: '#6ee7b7',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Sparkles size={12} />
                <span>Super Effective vs {beast.type}! (+25% Catch Power)</span>
              </div>
            )}
          </div>
        )}

        {/* Gesture Drawing Canvas */}
        {phase === 'encounter' && (
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '140px',
              border: activePotions.focus ? '2px solid #fbbf24' : `1.5px dashed ${selectedSpell.color}`,
              borderRadius: 'var(--radius-md)',
              background: activePotions.focus ? 'rgba(30, 27, 75, 0.85)' : 'rgba(15, 23, 42, 0.75)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              boxShadow: activePotions.focus ? 'inset 0 0 24px rgba(251, 191, 36, 0.4)' : `inset 0 0 16px ${selectedSpell.glow}`
            }}
          >
            {/* Luminous Golden Rune Guidelines when Focus Potion is active */}
            {activePotions.focus && (
              <svg
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none',
                  zIndex: 12,
                  filter: 'drop-shadow(0 0 8px #fbbf24)'
                }}
              >
                <path
                  d="M 30 70 Q 110 20 190 70 T 350 70"
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="3.5"
                  strokeDasharray="6 6"
                />
                <circle cx="30" cy="70" r="5" fill="#fde047" />
                <circle cx="350" cy="70" r="5" fill="#fde047" />
                <text x="190" y="52" fill="#fef08a" fontSize="11" fontWeight="800" textAnchor="middle">
                  ✨ FOCUS RUNE GUIDELINE (GUARANTEED MASTERFUL) ✨
                </text>
              </svg>
            )}

            <canvas
              ref={canvasRef}
              width={380}
              height={140}
              onMouseDown={handleStartDraw}
              onMouseMove={handleDrawMove}
              onMouseUp={handleEndDraw}
              onTouchStart={handleStartDraw}
              onTouchMove={handleDrawMove}
              onTouchEnd={handleEndDraw}
              style={{ position: 'absolute', inset: 0, touchAction: 'none', cursor: 'crosshair', zIndex: 10 }}
            />
            <div style={{ pointerEvents: 'none', textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem' }}>
              <Wand2 size={22} style={{ margin: '0 auto 4px', color: activePotions.focus ? '#fbbf24' : selectedSpell.color }} />
              <div>{activePotions.focus ? 'Trace Along Golden Path' : 'Trace Wand Spell Across Box'}</div>
              <div style={{ fontSize: '0.72rem', color: activePotions.focus ? '#fef08a' : selectedSpell.color, fontWeight: 700 }}>
                "{selectedSpell.incantation}"
              </div>
            </div>
          </div>
        )}

        {/* Bottom Action Controls */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '6px', zIndex: 10 }}>
          {phase === 'encounter' && (
            <>
              {/* Active Potion Status Chips Ribbon */}
              {Object.keys(activePotions).some((k) => activePotions[k]) && (
                <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '2px', whiteSpace: 'nowrap' }}>
                  {activePotions.focus && (
                    <span style={{ fontSize: '0.64rem', background: 'rgba(234, 179, 8, 0.25)', border: '1px solid #eab308', color: '#fef08a', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                      🎯 Focus: Masterful Cast
                    </span>
                  )}
                  {activePotions.maxima && (
                    <span style={{ fontSize: '0.64rem', background: 'rgba(239, 68, 68, 0.25)', border: '1px solid #ef4444', color: '#fca5a5', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                      💥 Maxima: +40% Power
                    </span>
                  )}
                  {activePotions.invisibility && (
                    <span style={{ fontSize: '0.64rem', background: 'rgba(56, 189, 248, 0.25)', border: '1px solid #38bdf8', color: '#7dd3fc', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                      🌫️ Invisibility: 0% Flee
                    </span>
                  )}
                  {activePotions.thunderbrew && (
                    <span style={{ fontSize: '0.64rem', background: 'rgba(168, 85, 247, 0.25)', border: '1px solid #a855f7', color: '#d8b4fe', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                      ⚡ Thunderbrew Stun
                    </span>
                  )}
                  {activePotions.edurus && (
                    <span style={{ fontSize: '0.64rem', background: 'rgba(217, 119, 6, 0.25)', border: '1px solid #d97706', color: '#fde68a', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                      🛡️ Edurus Barkskin
                    </span>
                  )}
                </div>
              )}

              <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>Capture Chance:</span>
                <div style={{ flex: 1, height: '8px', background: '#334155', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${Math.round(currentCatchChance * 100)}%`,
                      height: '100%',
                      background: getRingColor(),
                      transition: 'width 0.3s'
                    }}
                  />
                </div>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: getRingColor() }}>
                  {Math.round(currentCatchChance * 100)}%
                </span>
              </div>

              {/* 3-Button Action Suite */}
              <div style={{ display: 'flex', gap: '6px', width: '100%' }}>
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setShowTreatDrawer(!showTreatDrawer);
                    setShowPotionBelt(false);
                    setShowSpellDrawer(false);
                  }}
                  style={{ flex: 1, padding: '9px 4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '0.74rem' }}
                >
                  <Heart size={14} color="#ec4899" />
                  <span>Treat</span>
                </button>

                <button
                  className={showPotionBelt ? 'btn-magical' : 'btn-secondary'}
                  onClick={() => {
                    setShowPotionBelt(!showPotionBelt);
                    setShowTreatDrawer(false);
                    setShowSpellDrawer(false);
                    sounds.playCauldronBubble();
                  }}
                  style={{
                    flex: 1.1,
                    padding: '9px 4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    fontSize: '0.74rem',
                    borderColor: '#a855f7'
                  }}
                >
                  <FlaskConical size={14} color="#c084fc" />
                  <span>Potions</span>
                </button>

                <button
                  className="btn-magical"
                  onClick={handleQuickCast}
                  style={{ flex: 1.2, padding: '9px 4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '0.74rem', fontWeight: 800 }}
                >
                  <Wand2 size={14} />
                  <span>Cast Charm</span>
                </button>
              </div>
            </>
          )}

          {phase === 'caught' && (
            <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
              <button
                className="btn-magical"
                onClick={onClose}
                style={{ flex: 1.2, padding: '12px', fontSize: '0.88rem', fontWeight: 800 }}
              >
                Keep Exploring
              </button>
              {onOpenSanctuary && (
                <button
                  className="btn-secondary"
                  onClick={onOpenSanctuary}
                  style={{ flex: 1, padding: '12px', fontSize: '0.82rem' }}
                >
                  Suitcase Sanctuary
                </button>
              )}
            </div>
          )}

          {phase === 'fled' && (
            <button className="btn-magical" onClick={onClose} style={{ width: '100%', padding: '14px' }}>
              Return to Map
            </button>
          )}
        </div>

        {/* Spell Selector Drawer */}
        {showSpellDrawer && (
          <div
            className="glass-panel"
            style={{
              position: 'absolute',
              bottom: '75px',
              left: '10px',
              right: '10px',
              padding: '14px',
              background: 'rgba(11, 15, 25, 0.98)',
              border: '2px solid var(--border-gold-bright)',
              zIndex: 35,
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.9)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="font-cinzel" style={{ fontSize: '0.9rem', color: '#fbbf24', fontWeight: 700 }}>
                Select Wand Spell Charm
              </span>
              <button
                onClick={() => setShowSpellDrawer(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '18px' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '220px', overflowY: 'auto' }}>
              {SPELLS.map((spell) => {
                const aff = getSpellAffinity(spell, beast.type);
                const isSelected = selectedSpell.id === spell.id;
                return (
                  <button
                    key={spell.id}
                    onClick={() => {
                      setSelectedSpell(spell);
                      setShowSpellDrawer(false);
                      sounds.playWandCast('good');
                    }}
                    className="glass-card"
                    style={{
                      padding: '8px 10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      border: isSelected ? `2px solid ${spell.color}` : aff.isSuperEffective ? '1.5px solid #10b981' : '1px solid rgba(255,255,255,0.1)',
                      background: isSelected ? 'rgba(30, 41, 59, 0.9)' : 'rgba(15, 23, 42, 0.8)',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '20px' }}>{spell.icon}</span>
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: spell.color }}>
                          {spell.name}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                          "{spell.incantation}"
                        </div>
                      </div>
                    </div>

                    {aff.isSuperEffective && (
                      <span
                        style={{
                          fontSize: '0.68rem',
                          color: '#6ee7b7',
                          fontWeight: 800,
                          background: 'rgba(16, 185, 129, 0.25)',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          border: '1px solid #10b981'
                        }}
                      >
                        Super Effective (+25%)
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Treat Selector Drawer */}
        {showTreatDrawer && (
          <div
            className="glass-panel"
            style={{
              position: 'absolute',
              bottom: '75px',
              left: '10px',
              right: '10px',
              padding: '14px',
              background: 'rgba(11, 15, 25, 0.98)',
              border: '2px solid var(--border-gold-bright)',
              zIndex: 35,
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.9)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="font-cinzel" style={{ fontSize: '0.9rem', color: '#fbbf24', fontWeight: 700 }}>
                Select Treat to Feed
              </span>
              <button
                onClick={() => setShowTreatDrawer(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '18px' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
              {Object.keys(ITEMS)
                .filter((k) => ITEMS[k].category === 'treat')
                .map((key) => {
                  const it = ITEMS[key];
                  const count = inventory[key] || 0;
                  return (
                    <button
                      key={key}
                      onClick={() => handleFeedTreat(key)}
                      disabled={count <= 0}
                      className="glass-card"
                      style={{
                        padding: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: count > 0 ? 'pointer' : 'not-allowed',
                        opacity: count > 0 ? 1 : 0.4,
                        textAlign: 'left'
                      }}
                    >
                      <span style={{ fontSize: '22px' }}>{it.icon}</span>
                      <div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f8fafc' }}>{it.name}</div>
                        <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                          x{count} • +{Math.round((it.calmPower || 0.3) * 100)}% Calm
                        </div>
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>
        )}

        {/* Tactical Potion Belt Drawer */}
        {showPotionBelt && (
          <div
            className="glass-panel"
            style={{
              position: 'absolute',
              bottom: '75px',
              left: '10px',
              right: '10px',
              padding: '14px',
              background: 'rgba(11, 15, 25, 0.98)',
              border: '2px solid #a855f7',
              zIndex: 35,
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.9)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FlaskConical size={16} color="#c084fc" />
                <span className="font-cinzel" style={{ fontSize: '0.88rem', color: '#fef08a', fontWeight: 800 }}>
                  Tactical Potion Belt
                </span>
              </div>
              <button
                onClick={() => setShowPotionBelt(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '18px' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px', maxHeight: '230px', overflowY: 'auto' }}>
              {POTION_RECIPES.map((potion) => {
                const count = inventory[potion.id] || 0;
                const isActive = !!activePotions[potion.effectType];
                return (
                  <button
                    key={potion.id}
                    onClick={() => handleDrinkPotion(potion)}
                    disabled={count <= 0 || isActive}
                    className="glass-card"
                    style={{
                      padding: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: count > 0 && !isActive ? 'pointer' : 'not-allowed',
                      opacity: count > 0 && !isActive ? 1 : 0.45,
                      border: isActive ? `1.5px solid #10b981` : `1px solid ${potion.color}50`,
                      background: isActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(15, 23, 42, 0.75)',
                      textAlign: 'left'
                    }}
                  >
                    <span style={{ fontSize: '22px' }}>{potion.icon}</span>
                    <div style={{ overflow: 'hidden' }}>
                      <div
                        style={{
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          color: potion.color,
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                          overflow: 'hidden'
                        }}
                      >
                        {potion.name}
                      </div>
                      <div style={{ fontSize: '0.64rem', color: isActive ? '#34d399' : '#94a3b8' }}>
                        {isActive ? 'ACTIVE' : `Drink (x${count})`}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
