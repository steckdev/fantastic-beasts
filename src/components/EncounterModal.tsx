import React, { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Wand2, X, Heart, Sparkles, Wind, Flame, Droplets, Zap, ShieldAlert } from 'lucide-react';
import { sounds } from '../services/soundService';
import { ITEMS } from '../data/itemsData';
import { SPELLS, getSpellAffinity } from '../data/spellsData';
import { Disturbance, Hero, Mark, Item, Spell } from '../types';

interface EncounterModalProps {
  disturbance: Disturbance;
  hero: Hero;
  inventory: Record<string, number>;
  onConsumeItem: (itemKey: string, amount?: number) => void;
  onCaptureSuccess: (data: { beastId: string; cp: number; mark: Mark | null }) => void;
  onFlee: (disturbanceId: string) => void;
  onClose: () => void;
  onOpenSanctuary?: () => void;
  onShowToast?: (title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' | 'energy' | 'mark') => void;
}

export default function EncounterModal({
  disturbance,
  hero,
  inventory,
  onConsumeItem,
  onCaptureSuccess,
  onFlee,
  onClose,
  onOpenSanctuary,
  onShowToast
}: EncounterModalProps) {
  const { beast, cp, mark } = disturbance;
  const [phase, setPhase] = useState<'encounter' | 'casting' | 'capturing' | 'caught' | 'fled'>('encounter');
  const [wobbleCount, setWobbleCount] = useState<number>(0);
  const [treatBonus, setTreatBonus] = useState<number>(0);
  const [showTreatDrawer, setShowTreatDrawer] = useState<boolean>(false);
  const [showSpellDrawer, setShowSpellDrawer] = useState<boolean>(false);
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

  // Calculate current catch probability (0.0 to 1.0)
  const baseCatch = beast.baseCatchRate;
  const heroBonus = hero.catchAccuracyBonus || 1.0;
  const accuracyMultiplier =
    castAccuracy === 'masterful' ? 1.7 : castAccuracy === 'great' ? 1.4 : castAccuracy === 'good' ? 1.2 : 1.0;
  const currentCatchChance = Math.min(
    0.95,
    (baseCatch + treatBonus) * heroBonus * accuracyMultiplier * spellBonusMultiplier
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
    if (length > 35) acc = 'masterful';
    else if (length > 20) acc = 'great';
    else if (length > 10) acc = 'good';
    else acc = 'fair';

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
    const acc = ratings[Math.floor(Math.random() * ratings.length)];
    setCastAccuracy(acc);
    sounds.playWandCast(acc);
    executeCaptureAttempt();
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
        // Genuine Breakout & Flee Check
        // Threat levels 3-5 have higher risk of fleeing into the night
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
    const bonus = (treat.calmPower || 0.3) * (hero.bonusTreatEffect || 1.0);
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
            <span className={`threat-badge threat-${beast.dangerRating}`}>
              Level {beast.dangerRating} • Class {beast.classification}
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
              className="btn-icon"
              style={{ width: '36px', height: '36px' }}
              title="Leave encounter"
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
            <div className="animate-float" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img
                src={beast.sprite}
                alt={beast.name}
                style={{
                  width: '200px',
                  height: '200px',
                  objectFit: 'contain',
                  filter: mark ? `drop-shadow(0 0 16px ${mark.color})` : 'drop-shadow(0 8px 16px rgba(0,0,0,0.6))'
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
              <div className="font-cinzel" style={{ fontSize: '1rem', fontWeight: 700, color: '#fbbf24', letterSpacing: '0.1em' }}>
                {wobbleCount === 0 && 'SUITCASE CLOSING...'}
                {wobbleCount === 1 && 'SHAKE 1...'}
                {wobbleCount === 2 && 'SHAKE 2...'}
                {wobbleCount === 3 && 'SHAKE 3...'}
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
                <div
                  style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '-6px',
                    fontSize: '26px'
                  }}
                >
                  🎉
                </div>
              </div>

              <h3 className="font-cinzel" style={{ fontSize: '1.35rem', color: '#34d399', fontWeight: 800 }}>
                {beast.name.toUpperCase()} CAPTURED!
              </h3>
              <p style={{ color: '#cbd5e1', fontSize: '0.82rem', marginTop: '2px' }}>
                CP {cp} · Class {beast.classification} · {beast.habitat}
              </p>

              {/* Reward Highlights */}
              <div
                className="glass-card"
                style={{
                  margin: '12px auto',
                  padding: '10px 14px',
                  display: 'flex',
                  justifyContent: 'space-around',
                  maxWidth: '320px',
                  borderColor: 'rgba(251, 191, 36, 0.4)'
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#fbbf24' }}>🪙 +30</div>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Knuts</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#38bdf8' }}>⚡ +10</div>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Spell Energy</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#a855f7' }}>📜 +100</div>
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
              border: `1.5px dashed ${selectedSpell.color}`,
              borderRadius: 'var(--radius-md)',
              background: 'rgba(15, 23, 42, 0.75)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              boxShadow: `inset 0 0 16px ${selectedSpell.glow}`
            }}
          >
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
              <Wand2 size={22} style={{ margin: '0 auto 4px', color: selectedSpell.color }} />
              <div>Trace Wand Spell Across Box</div>
              <div style={{ fontSize: '0.72rem', color: selectedSpell.color, fontWeight: 700 }}>
                "{selectedSpell.incantation}"
              </div>
            </div>
          </div>
        )}

        {/* Bottom Action Controls */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 10 }}>
          {phase === 'encounter' && (
            <>
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

              <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                <button
                  className="btn-secondary"
                  onClick={() => setShowTreatDrawer(!showTreatDrawer)}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <Heart size={16} color="#ec4899" />
                  <span>Feed Treat</span>
                </button>

                <button
                  className="btn-magical"
                  onClick={handleQuickCast}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <Wand2 size={16} />
                  <span>Cast Charm</span>
                </button>
              </div>
            </>
          )}

          {phase === 'caught' && (
            <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
              <button
                className="btn-secondary"
                onClick={onClose}
                style={{ flex: 1, padding: '12px', fontSize: '0.85rem' }}
              >
                Keep Exploring
              </button>
              {onOpenSanctuary && (
                <button
                  className="btn-magical"
                  onClick={onOpenSanctuary}
                  style={{ flex: 1, padding: '12px', fontSize: '0.85rem' }}
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
      </div>
    </div>
  );
}
