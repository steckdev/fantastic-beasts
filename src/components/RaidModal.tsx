import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { X, ShieldAlert, Zap, Wand2, Heart, Sparkles, Swords, Crown } from 'lucide-react';
import { Waypoint, Hero, CapturedBeast, Beast, Mark, Spell } from '../types';
import { BEASTS } from '../data/beastsData';
import { SPELLS, getSpellAffinity } from '../data/spellsData';
import { sounds } from '../services/soundService';
import { rollRaidMark } from '../data/marksData';
import { getMoMClassification } from '../data/ministryClassification';

interface RaidModalProps {
  waypoint: Waypoint;
  hero: Hero;
  buddyInstance: CapturedBeast | null;
  inventory: Record<string, number>;
  raidsCompletedToday: number;
  onConsumeItem: (itemKey: string, amount: number) => void;
  onCaptureSuccess: (data: { beastId: string; cp: number; mark: Mark | null }) => void;
  onRaidComplete: () => void;
  onClose: () => void;
  onOpenSanctuary?: () => void;
  onShowToast: (title: string, message: string, type: any) => void;
}

export default function RaidModal({
  waypoint,
  hero,
  buddyInstance,
  inventory,
  raidsCompletedToday,
  onConsumeItem,
  onCaptureSuccess,
  onRaidComplete,
  onClose,
  onOpenSanctuary,
  onShowToast
}: RaidModalProps) {
  // Identify Boss Beast
  const bossDef: Beast =
    (waypoint.raidBoss && BEASTS.find((b) => b.id === waypoint.raidBoss!.beastId)) ||
    BEASTS.find((b) => b.isRaidExclusive) ||
    BEASTS[0];

  const bossCp = waypoint.raidBoss?.cp || Math.floor(bossDef.minCP * 1.4 + 500);
  const mom = getMoMClassification(bossDef.classification);

  // Buddy Companion Beast Definition
  const buddyDef = buddyInstance ? BEASTS.find((b) => b.id === buddyInstance.beastId) : undefined;
  const buddyBond = buddyInstance?.bondLevel || 1;

  // Phases: 'briefing' | 'battle' | 'containment' | 'victory' | 'fled'
  const [phase, setPhase] = useState<'briefing' | 'battle' | 'containment' | 'victory' | 'fled'>('briefing');
  const [bossHp, setBossHp] = useState<number>(100);
  const [wobbleCount, setWobbleCount] = useState<number>(0);
  const [selectedSpell, setSelectedSpell] = useState<Spell>(SPELLS[0]);
  const [buddyActionText, setBuddyActionText] = useState<string>('');
  const [capturedMark, setCapturedMark] = useState<Mark | null>(null);
  const [isWobbling, setIsWobbling] = useState<boolean>(false);

  const energyAvailable = inventory.spell_energy || 0;
  const maxDailyRaids = 2;
  const isDailyLimitReached = raidsCompletedToday >= maxDailyRaids;

  // Sound upon boss encounter
  useEffect(() => {
    sounds.playCreatureCry((bossDef.cryFreq || 200) * 0.85);
  }, [bossDef]);

  // Buddy Autonomous Combat Assistance Loop in Battle phase
  useEffect(() => {
    if (phase !== 'battle' || bossHp <= 0) return;

    const interval = setInterval(() => {
      const buddyName = buddyInstance?.nickname || buddyDef?.name || 'Buddy Companion';
      const dmg = Math.floor(10 + buddyBond * 2.5 + Math.random() * 6);

      const combatLines = [
        `${buddyName} unleashed an arcane flank strike! (-${dmg} Stagger)`,
        `${buddyName} created a shimmering ward diversion! (-${dmg} Stagger)`,
        `${buddyName} targeted the creature's blind spot! (-${dmg} Stagger)`
      ];

      const line = combatLines[Math.floor(Math.random() * combatLines.length)];
      setBuddyActionText(line);
      sounds.playPlayfulBounce();

      setBossHp((prev) => {
        const next = Math.max(0, prev - dmg);
        if (next === 0) {
          triggerBossStaggered();
        }
        return next;
      });
    }, 2400);

    return () => clearInterval(interval);
  }, [phase, bossHp, buddyBond, buddyDef, buddyInstance]);

  // Start Raid Battle (Costs 20 Energy)
  const handleStartBattle = () => {
    if (isDailyLimitReached) {
      onShowToast('Citadel Limit Reached', 'You have completed 2/2 daily citadel challenges!', 'warning');
      return;
    }

    if (energyAvailable < 20) {
      onShowToast('Spell Energy Needed', 'Breaching ancient citadel wards requires 20 Spell Energy ⚡', 'energy');
      return;
    }

    onConsumeItem('spell_energy', 20);
    sounds.playApparition();
    sounds.playWandCast('masterful');
    setPhase('battle');
    setBossHp(100);
    onShowToast('Wards Breached!', 'Engaging Legendary Citadel Raid with your companion!', 'success');
  };

  // Player Casts Spell in Battle Phase
  const handlePlayerCast = (spell: Spell) => {
    if (phase !== 'battle') return;
    setSelectedSpell(spell);

    const affinity = getSpellAffinity(spell, bossDef.type);
    const baseDamage = spell.bonusRate > 1.2 ? 26 : 20;
    const totalDmg = Math.floor(baseDamage * (affinity.isSuperEffective ? 1.4 : 1.0) + Math.random() * 6);

    sounds.playWandCast('great');

    setBossHp((prev) => {
      const next = Math.max(0, prev - totalDmg);
      if (next === 0) {
        triggerBossStaggered();
      }
      return next;
    });
  };

  // Boss reaches 0 Stagger HP -> Transitions to Briefcase Containment
  const triggerBossStaggered = () => {
    sounds.playMarkReveal();
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.5 },
      colors: ['#c084fc', '#fbbf24', '#38bdf8']
    });
    setBuddyActionText('⚡ LEGENDARY BEAST STAGGERED! READY FOR CONTAINMENT!');

    setTimeout(() => {
      setPhase('containment');
    }, 1200);
  };

  // Attempt Containment Throw (Costs 5 Energy per toss)
  const handleAttemptCapture = () => {
    if (energyAvailable < 5) {
      onShowToast('Exhausted Energy', 'Out of energy! The legendary creature broke free!', 'error');
      setPhase('fled');
      sounds.playFlee();
      return;
    }

    onConsumeItem('spell_energy', 5);
    setIsWobbling(true);
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
      setIsWobbling(false);
      // High catch chance on staggered boss (65%), but requires multiple attempts if resisted
      const success = Math.random() <= 0.65;

      if (success) {
        const markRoll = rollRaidMark();
        setCapturedMark(markRoll);
        setPhase('victory');
        sounds.playCatchSuccess();

        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#fbbf24', '#c084fc', '#34d399', '#ffffff']
        });

        onCaptureSuccess({
          beastId: bossDef.id,
          cp: bossCp,
          mark: markRoll
        });

        onRaidComplete();
        onShowToast('Legendary Capture!', `Successfully subdued ${bossDef.name}!`, 'success');
      } else {
        // Resisted toss
        sounds.playCreatureCry((bossDef.cryFreq || 200) * 1.15);
        if (energyAvailable <= 5) {
          setPhase('fled');
          sounds.playFlee();
          onShowToast('Beast Escaped', 'With your energy depleted, the beast vanished!', 'warning');
        } else {
          onShowToast('Resisted Containment!', 'The beast resisted! Cost 5 energy to throw again.', 'warning');
        }
      }
    }, 2800);
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1200 }}>
      <div
        className="glass-panel"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '430px',
          height: '92vh',
          maxHeight: '840px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 16px',
          background: 'radial-gradient(circle at 50% 25%, #2e1065 0%, #090618 100%)',
          border: '2px solid rgba(192, 132, 252, 0.7)',
          boxShadow: '0 0 35px rgba(168, 85, 247, 0.35)',
          overflow: 'hidden'
        }}
      >
        {/* Top Header */}
        <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              className="threat-badge"
              style={{
                background: 'rgba(168, 85, 247, 0.25)',
                color: '#e9d5ff',
                borderColor: '#c084fc',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <span>🏰</span>
              <span>CITADEL RAID</span>
            </span>

            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#fbbf24',
                background: 'rgba(0,0,0,0.6)',
                padding: '3px 8px',
                borderRadius: '6px',
                border: '1px solid rgba(251, 191, 36, 0.4)'
              }}
            >
              CP {bossCp}
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
                color: energyAvailable >= 20 ? '#38bdf8' : '#ef4444'
              }}
            >
              <Zap size={14} />
              <span>{energyAvailable} ⚡</span>
            </div>
            <button
              onClick={onClose}
              className="btn-icon"
              style={{ width: '32px', height: '32px', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Phase 1: Briefing */}
        {phase === 'briefing' && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '10px 0' }}>
            <div
              style={{
                width: '160px',
                height: '160px',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '10px auto'
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, transparent 70%)',
                  animation: 'pulse-ring 2.5s infinite'
                }}
              />
              <img
                src={bossDef.sprite}
                alt={bossDef.name}
                style={{
                  width: '140px',
                  height: '140px',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 0 24px rgba(168, 85, 247, 0.8))'
                }}
              />
            </div>

            <h2 className="font-cinzel" style={{ fontSize: '1.45rem', color: '#fef08a', fontWeight: 800, margin: '6px 0 2px' }}>
              {bossDef.name.toUpperCase()}
            </h2>
            <div style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
              {mom.title} ({mom.stars}) · <span style={{ color: '#38bdf8' }}>Exclusive Legendary Raid</span>
            </div>

            {/* Raid Quota Pill */}
            <div
              className="glass-card"
              style={{
                margin: '14px 0 10px',
                padding: '8px 16px',
                borderColor: isDailyLimitReached ? '#ef4444' : 'rgba(168, 85, 247, 0.5)',
                fontSize: '0.78rem',
                color: isDailyLimitReached ? '#f87171' : '#e9d5ff'
              }}
            >
              <div style={{ fontWeight: 800 }}>
                Daily Citadel Limit: {raidsCompletedToday} / {maxDailyRaids} Completed
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
                {isDailyLimitReached ? 'Ancient wards are dormant until dawn.' : '20 Spell Energy required to breach the citadel'}
              </div>
            </div>

            {/* Buddy Co-Op Readiness */}
            {buddyDef && (
              <div
                className="glass-card"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  textAlign: 'left',
                  borderColor: 'rgba(56, 189, 248, 0.4)',
                  background: 'rgba(15, 23, 42, 0.7)'
                }}
              >
                <img
                  src={buddyDef.sprite}
                  alt={buddyDef.name}
                  style={{ width: '40px', height: '40px', objectFit: 'contain' }}
                />
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#38bdf8' }}>
                    Co-Op Companion: {buddyInstance?.nickname || buddyDef.name}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>
                    Bond Lvl {buddyBond} (+{buddyBond * 8}% Stagger Synergy)
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Phase 2: Active Co-Op Battle */}
        {phase === 'battle' && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ position: 'relative', width: '170px', height: '170px', margin: '4px auto' }}>
              <img
                src={bossDef.sprite}
                alt={bossDef.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 0 20px rgba(239, 68, 68, 0.7))',
                  animation: 'float 2s ease-in-out infinite'
                }}
              />
            </div>

            {/* Boss Stagger Bar */}
            <div style={{ width: '100%', maxWidth: '320px', margin: '8px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, color: '#e9d5ff', marginBottom: '4px' }}>
                <span>BOSS STAGGER RESILIENCE</span>
                <span>{bossHp}%</span>
              </div>
              <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '5px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${bossHp}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #ec4899, #a855f7)',
                    transition: 'width 0.25s ease'
                  }}
                />
              </div>
            </div>

            {/* Buddy Combat Speech */}
            {buddyActionText && (
              <div
                style={{
                  fontSize: '0.76rem',
                  color: '#38bdf8',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                  padding: '6px 12px',
                  borderRadius: '16px',
                  margin: '6px 0',
                  animation: 'slideUp 0.3s ease-out'
                }}
              >
                {buddyActionText}
              </div>
            )}

            {/* Player Spell Deck */}
            <div style={{ width: '100%', marginTop: '12px' }}>
              <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginBottom: '6px', fontWeight: 700 }}>
                CAST COMBAT SPELLS (TAP TO STAGGER)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                {SPELLS.slice(0, 4).map((spell) => (
                  <button
                    key={spell.id}
                    className="glass-card"
                    onClick={() => handlePlayerCast(spell)}
                    style={{
                      padding: '8px 10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      textAlign: 'left',
                      borderColor: spell.color,
                      cursor: 'pointer'
                    }}
                  >
                    <span style={{ fontSize: '18px' }}>{spell.icon}</span>
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 800, color: spell.color }}>
                        {spell.incantation}
                      </div>
                      <div style={{ fontSize: '0.66rem', color: '#94a3b8' }}>
                        {spell.name}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Phase 3: Containment */}
        {phase === 'containment' && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div
              style={{
                width: '150px',
                height: '150px',
                margin: '16px auto',
                transform: isWobbling && wobbleCount % 2 === 1 ? 'rotate(-14deg)' : isWobbling && wobbleCount > 0 ? 'rotate(14deg)' : 'none',
                transition: 'transform 0.15s ease-in-out',
                filter: 'drop-shadow(0 14px 28px rgba(245, 158, 11, 0.6))'
              }}
            >
              <img
                src={isWobbling && wobbleCount > 0 ? '/items/briefcase_closed.png' : '/items/briefcase_vortex.png'}
                alt="Newt's Briefcase"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>

            <h3 className="font-cinzel" style={{ fontSize: '1.25rem', color: '#fde047', fontWeight: 800 }}>
              CONTAINMENT VORTEX OPEN
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#cbd5e1', maxWidth: '300px', margin: '6px 0 16px' }}>
              The beast is staggered! Each containment throw costs 5 Spell Energy.
            </p>

            <div
              className="glass-card"
              style={{
                padding: '8px 16px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                color: energyAvailable >= 5 ? '#38bdf8' : '#ef4444',
                fontWeight: 700,
                fontSize: '0.84rem'
              }}
            >
              <Zap size={14} />
              <span>Available Energy: {energyAvailable} ⚡ (Cost: 5 ⚡/throw)</span>
            </div>
          </div>
        )}

        {/* Phase 4: Victory Card */}
        {phase === 'victory' && (
          <div style={{ width: '100%', textAlign: 'center', animation: 'slideUp 0.35s ease-out' }}>
            <div style={{ position: 'relative', width: '140px', height: '140px', margin: '0 auto 8px' }}>
              <img
                src={bossDef.sprite}
                alt={bossDef.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  filter: capturedMark
                    ? `drop-shadow(0 0 20px ${capturedMark.color})`
                    : 'drop-shadow(0 8px 20px rgba(0,0,0,0.8))'
                }}
              />
            </div>

            <h3 className="font-cinzel" style={{ fontSize: '1.4rem', color: '#34d399', fontWeight: 800 }}>
              {bossDef.name.toUpperCase()} CAPTURED!
            </h3>
            <p style={{ color: '#cbd5e1', fontSize: '0.82rem', marginTop: '2px' }}>
              CP {bossCp} · {mom.title} ({mom.stars}) · Ancient Citadel
            </p>

            {/* Raid Bounty Highlights */}
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
                <div style={{ fontSize: '0.96rem', fontWeight: 800, color: '#fbbf24' }}>🪙 +100</div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Knuts</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.96rem', fontWeight: 800, color: '#a855f7' }}>📜 +250</div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Ministry XP</div>
              </div>
            </div>

            {capturedMark && (
              <div
                className="glass-card"
                style={{
                  margin: '8px auto 6px',
                  maxWidth: '320px',
                  padding: '8px 12px',
                  borderColor: capturedMark.color,
                  color: capturedMark.color,
                  boxShadow: `0 0 16px ${capturedMark.glow}`
                }}
              >
                <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>
                  {capturedMark.icon} Rare Mark: {capturedMark.title}
                </div>
                <div style={{ fontSize: '0.74rem', color: '#cbd5e1' }}>{capturedMark.bonusText}</div>
              </div>
            )}
          </div>
        )}

        {/* Phase 5: Fled */}
        {phase === 'fled' && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '64px', marginBottom: '8px' }}>💨</div>
            <h3 className="font-cinzel" style={{ fontSize: '1.35rem', color: '#ef4444', fontWeight: 800 }}>
              THE RAID BOSS ESCAPED!
            </h3>
            <p style={{ color: '#cbd5e1', fontSize: '0.84rem', marginTop: '6px' }}>
              The beast shattered the containment vortex and retreated deep into the ley lines.
            </p>
          </div>
        )}

        {/* Bottom Actions */}
        <div style={{ width: '100%', marginTop: '14px' }}>
          {phase === 'briefing' && (
            <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
              <button
                className="btn-secondary"
                onClick={onClose}
                style={{ flex: 1, padding: '12px', fontSize: '0.84rem' }}
              >
                Leave Citadel
              </button>
              <button
                className="btn-magical"
                onClick={handleStartBattle}
                disabled={isDailyLimitReached || energyAvailable < 20}
                style={{
                  flex: 1.5,
                  padding: '12px',
                  fontSize: '0.84rem',
                  opacity: isDailyLimitReached || energyAvailable < 20 ? 0.5 : 1
                }}
              >
                <Swords size={16} />
                <span>Begin Raid (-20 ⚡)</span>
              </button>
            </div>
          )}

          {phase === 'containment' && (
            <button
              className="btn-magical"
              onClick={handleAttemptCapture}
              disabled={isWobbling || energyAvailable < 5}
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '0.9rem',
                opacity: isWobbling || energyAvailable < 5 ? 0.5 : 1
              }}
            >
              <Wand2 size={16} />
              <span>Throw Briefcase (-5 ⚡)</span>
            </button>
          )}

          {phase === 'victory' && (
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
            <button className="btn-secondary" onClick={onClose} style={{ width: '100%', padding: '14px' }}>
              Return to Map
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
