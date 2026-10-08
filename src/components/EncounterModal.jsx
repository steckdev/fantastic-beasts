import React, { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Wand2, X, AlertTriangle, Shield, CheckCircle, Heart } from 'lucide-react';
import { sounds } from '../services/soundService';
import { ITEMS } from '../data/itemsData';

export default function EncounterModal({
  disturbance,
  hero,
  inventory,
  onConsumeItem,
  onCaptureSuccess,
  onClose
}) {
  const { beast, cp, mark } = disturbance;
  const [phase, setPhase] = useState('encounter'); // 'encounter' | 'casting' | 'capturing' | 'caught' | 'fled'
  const [wobbleCount, setWobbleCount] = useState(0);
  const [selectedTreat, setSelectedTreat] = useState(null);
  const [treatBonus, setTreatBonus] = useState(0);
  const [showTreatDrawer, setShowTreatDrawer] = useState(false);
  const [castAccuracy, setCastAccuracy] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef(null);
  const strokePointsRef = useRef([]);

  // Calculate current catch probability (0.0 to 1.0)
  const baseCatch = beast.baseCatchRate;
  const heroBonus = hero.catchAccuracyBonus || 1.0;
  const accuracyMultiplier = castAccuracy === 'masterful' ? 1.7 : castAccuracy === 'great' ? 1.4 : castAccuracy === 'good' ? 1.2 : 1.0;
  const currentCatchChance = Math.min(0.95, (baseCatch + treatBonus) * heroBonus * accuracyMultiplier);

  // Play creature cry on encounter open
  useEffect(() => {
    sounds.playCreatureCry(beast.cryFreq);
  }, [beast]);

  // Wand gesture canvas handling
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [phase]);

  const handleStartDraw = (e) => {
    if (phase !== 'encounter') return;
    setIsDrawing(true);
    strokePointsRef.current = [];
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const rect = canvas.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    strokePointsRef.current.push({ x, y });
  };

  const handleDrawMove = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    strokePointsRef.current.push({ x, y });

    // Draw glowing wand beam
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#fde047';
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 12;

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
    if (pts.length < 5) return; // Too short to be a gesture

    // Check if player has spell energy
    if (inventory.spell_energy <= 0) {
      alert('You are out of Spell Energy! Visit a nearby Magical Inn to replenish.');
      return;
    }

    onConsumeItem('spell_energy', 1);

    // Rate gesture accuracy based on length and smoothness
    const length = pts.length;
    let acc = 'good';
    if (length > 35) acc = 'masterful';
    else if (length > 20) acc = 'great';
    else if (length > 10) acc = 'good';
    else acc = 'fair';

    setCastAccuracy(acc);
    sounds.playWandCast(acc);
    executeCaptureAttempt(acc);
  };

  // Quick Cast Button for accessibility
  const handleQuickCast = () => {
    if (inventory.spell_energy <= 0) {
      alert('You are out of Spell Energy! Visit a nearby Magical Inn to replenish.');
      return;
    }
    onConsumeItem('spell_energy', 1);
    const ratings = ['good', 'great', 'masterful'];
    const acc = ratings[Math.floor(Math.random() * ratings.length)];
    setCastAccuracy(acc);
    sounds.playWandCast(acc);
    executeCaptureAttempt(acc);
  };

  // Execute the 3-wobble suitcase sequence
  const executeCaptureAttempt = (accuracy) => {
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

    // Final outcome
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
          }, 600);
        }
        onCaptureSuccess({
          beastId: beast.id,
          cp,
          mark
        });
      } else {
        // Flee check
        const fleeRoll = Math.random();
        if (fleeRoll < beast.fleeRate) {
          setPhase('fled');
          sounds.playCreatureCry(beast.cryFreq * 0.7);
        } else {
          // Broke free, can try again
          setPhase('encounter');
          setCastAccuracy(null);
          sounds.playCreatureCry(beast.cryFreq * 1.1);
        }
      }
    }, 2800);
  };

  // Feed treat to beast
  const handleFeedTreat = (treatKey) => {
    const treat = ITEMS[treatKey];
    if (!treat || inventory[treatKey] <= 0) return;

    onConsumeItem(treatKey, 1);
    sounds.playPurr();
    const bonus = treat.calmPower * (hero.bonusTreatEffect || 1.0);
    setTreatBonus((prev) => prev + bonus);
    setSelectedTreat(treat);
    setShowTreatDrawer(false);

    confetti({
      particleCount: 25,
      spread: 50,
      origin: { y: 0.4 },
      colors: ['#f43f5e', '#ec4899', '#fbbf24']
    });
  };

  // Ring color based on catch chance
  const getRingColor = () => {
    if (currentCatchChance > 0.65) return '#10b981'; // Green
    if (currentCatchChance > 0.45) return '#f59e0b'; // Yellow
    return '#ef4444'; // Orange/Red
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
              <span>{inventory.spell_energy}</span>
            </div>

            <button
              onClick={onClose}
              className="btn-icon"
              style={{ width: '36px', height: '36px' }}
              title="Flee encounter"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Beast Name & Title */}
        <div style={{ textAlign: 'center', zIndex: 10, marginTop: '4px' }}>
          <h2
            className="font-cinzel title-glow"
            style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fef08a', letterSpacing: '0.04em' }}
          >
            {beast.name}
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{beast.species}</p>

          {/* Mark Badge if present */}
          {mark && (
            <div
              className="mark-badge"
              style={{
                marginTop: '6px',
                borderColor: mark.color,
                color: mark.color,
                boxShadow: `0 0 12px ${mark.glow}`
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
            width: '280px',
            height: '280px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 5
          }}
        >
          {/* Target Capture Ring */}
          {phase === 'encounter' && (
            <div
              style={{
                position: 'absolute',
                width: '230px',
                height: '230px',
                borderRadius: '50%',
                border: `3px dashed ${getRingColor()}`,
                animation: 'pulse-ring 2s infinite ease-in-out',
                pointerEvents: 'none'
              }}
            />
          )}

          {/* Beast Sprite / Suitcase Animation */}
          {phase !== 'capturing' && phase !== 'caught' && phase !== 'fled' && (
            <div
              className="animate-float"
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <img
                src={beast.sprite}
                alt={beast.name}
                style={{
                  width: '210px',
                  height: '210px',
                  objectFit: 'contain',
                  filter: mark ? `drop-shadow(0 0 16px ${mark.color})` : 'drop-shadow(0 8px 16px rgba(0,0,0,0.6))'
                }}
              />
            </div>
          )}

          {/* Capturing Suitcase with Wobbles */}
          {phase === 'capturing' && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <div
                style={{
                  fontSize: '84px',
                  transform: wobbleCount % 2 === 1 ? 'rotate(-12deg)' : wobbleCount > 0 ? 'rotate(12deg)' : 'none',
                  transition: 'transform 0.15s ease-in-out',
                  filter: 'drop-shadow(0 12px 24px rgba(245, 158, 11, 0.5))'
                }}
              >
                🧳
              </div>
              <div
                className="font-cinzel"
                style={{
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: '#fbbf24',
                  letterSpacing: '0.1em'
                }}
              >
                {wobbleCount === 0 && 'SUITCASE CLOSING...'}
                {wobbleCount === 1 && 'SHAKE 1...'}
                {wobbleCount === 2 && 'SHAKE 2...'}
                {wobbleCount === 3 && 'SHAKE 3...'}
              </div>
            </div>
          )}

          {/* Caught Success View */}
          {phase === 'caught' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '72px', marginBottom: '8px' }}>🎉</div>
              <h3 className="font-cinzel" style={{ fontSize: '1.4rem', color: '#34d399', fontWeight: 800 }}>
                BEAST CAPTURED!
              </h3>
              <p style={{ color: '#cbd5e1', fontSize: '0.88rem', marginTop: '4px' }}>
                Safely contained in Newt's Suitcase Sanctuary!
              </p>
              {mark && (
                <div
                  className="glass-card"
                  style={{
                    marginTop: '12px',
                    padding: '8px 12px',
                    borderColor: mark.color,
                    color: mark.color
                  }}
                >
                  <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>
                    {mark.icon} Rare Mark: {mark.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>{mark.bonusText}</div>
                </div>
              )}
            </div>
          )}

          {/* Fled View */}
          {phase === 'fled' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '64px', marginBottom: '8px' }}>💨</div>
              <h3 className="font-cinzel" style={{ fontSize: '1.3rem', color: '#ef4444', fontWeight: 800 }}>
                THE BEAST VANISHED!
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>
                It escaped into the shadows of the town. Keep searching!
              </p>
            </div>
          )}
        </div>

        {/* Gesture Drawing Canvas (Active during encounter) */}
        {phase === 'encounter' && (
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '160px',
              border: '1px dashed rgba(251, 191, 36, 0.4)',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(15, 23, 42, 0.65)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}
          >
            <canvas
              ref={canvasRef}
              width={380}
              height={160}
              onMouseDown={handleStartDraw}
              onMouseMove={handleDrawMove}
              onMouseUp={handleEndDraw}
              onTouchStart={handleStartDraw}
              onTouchMove={handleDrawMove}
              onTouchEnd={handleEndDraw}
              style={{ position: 'absolute', inset: 0, touchAction: 'none', cursor: 'crosshair', zIndex: 10 }}
            />
            <div style={{ pointerEvents: 'none', textAlign: 'center', color: '#94a3b8', fontSize: '0.82rem' }}>
              <Wand2 size={24} style={{ margin: '0 auto 4px', color: '#fbbf24', opacity: 0.8 }} />
              <div>Trace Wand Spell Across Box</div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Flipendo • Arresto Momentum</div>
            </div>
          </div>
        )}

        {/* Bottom Action Controls */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px', zIndex: 10 }}>
          {phase === 'encounter' && (
            <>
              {/* Catch probability bar */}
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

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                {/* Treat button */}
                <button
                  className="btn-secondary"
                  onClick={() => setShowTreatDrawer(!showTreatDrawer)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Heart size={16} color="#ec4899" />
                  <span>Feed Treat</span>
                </button>

                {/* Quick Cast Button */}
                <button
                  className="btn-magical"
                  onClick={handleQuickCast}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Wand2 size={16} />
                  <span>Cast Charm</span>
                </button>
              </div>
            </>
          )}

          {/* After capture complete button */}
          {(phase === 'caught' || phase === 'fled') && (
            <button className="btn-magical" onClick={onClose} style={{ width: '100%', padding: '14px' }}>
              Return to Map
            </button>
          )}
        </div>

        {/* Treat Selector Drawer */}
        {showTreatDrawer && (
          <div
            className="glass-panel"
            style={{
              position: 'absolute',
              bottom: '80px',
              left: '12px',
              right: '12px',
              padding: '16px',
              background: 'rgba(15, 23, 42, 0.95)',
              zIndex: 30,
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="font-cinzel" style={{ fontSize: '0.9rem', color: '#fbbf24', fontWeight: 700 }}>
                Select Treat to Feed
              </span>
              <button
                onClick={() => setShowTreatDrawer(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
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
                          x{count} • +{Math.round(it.calmPower * 100)}% Calm
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
