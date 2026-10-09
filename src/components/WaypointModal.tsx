import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { X, Sparkles, Zap, Lock, Beer, Leaf, FlaskConical, Clock } from 'lucide-react';
import { sounds } from '../services/soundService';
import { ITEMS } from '../data/itemsData';
import { Waypoint } from '../types';

interface WaypointModalProps {
  waypoint: Waypoint;
  inRange: boolean;
  currentEnergy?: number;
  onSpinSuccess: (waypointId: string, rewards: Record<string, number>) => void;
  onClose: () => void;
  onApparate?: () => void;
}

export default function WaypointModal({
  waypoint,
  inRange,
  currentEnergy = 100,
  onSpinSuccess,
  onClose,
  onApparate
}: WaypointModalProps) {
  const [isInteracting, setIsInteracting] = useState<boolean>(false);
  const [rewards, setRewards] = useState<Record<string, number> | null>(null);

  const isCooldown = waypoint.cooldownUntil && waypoint.cooldownUntil > Date.now();
  const cooldownSecs = Math.max(0, Math.ceil(((waypoint.cooldownUntil || 0) - Date.now()) / 1000));

  const getArtwork = () => {
    if (waypoint.type === 'greenhouse') return '/assets/greenhouse_botanical.jpg';
    if (waypoint.type === 'apothecary') return '/assets/cauldron_brewing_elixir.jpg';
    return '/assets/inn_butterbeer_feast.jpg';
  };

  const getWaypointMeta = () => {
    if (waypoint.type === 'greenhouse') {
      return {
        badge: '🌿 Herbology Greenhouse',
        actionLabel: 'Harvest Flora & Mandrakes',
        pendingLabel: 'Gathering Dittany & Botanical Herbs...',
        successTitle: '✨ Leyline Harvest Collected!',
        flavorNote: 'Fresh botanical flora, Mandrake pollen, and restorative herbs replenished your satchel.',
        color: '#10b981'
      };
    }
    if (waypoint.type === 'apothecary') {
      return {
        badge: '🧪 Potion Brewing Station',
        actionLabel: 'Stir Cauldron & Brew Elixir',
        pendingLabel: 'Bubbling Restorative Wiggenweld Potion...',
        successTitle: '✨ Potent Elixir Brewed!',
        flavorNote: 'Crafted an invigorating restorative potion in the bronze cauldron to infuse your magic.',
        color: '#a855f7'
      };
    }
    return {
      badge: '🍺 Wizarding Tavern & Inn',
      actionLabel: 'Order Butterbeer & Warm Meal',
      pendingLabel: 'Serving Frothing Butterbeer & Hearth Feast...',
      successTitle: '✨ Tavern Hospitality Enjoyed!',
      flavorNote: 'Sparkling Butterbeer and fresh brioche buns restored your spell energy and vitality.',
      color: '#f59e0b'
    };
  };

  const meta = getWaypointMeta();

  const handleInteract = () => {
    if (!inRange || isCooldown || isInteracting || rewards) return;
    setIsInteracting(true);
    sounds.playSpinChime();

    setTimeout(() => {
      setIsInteracting(false);

      const energyGain = Math.floor(14 + Math.random() * 16);
      const knutsGain = Math.floor(25 + Math.random() * 35);
      const treatsKeys = ['treat_brioche', 'treat_woodlice', 'treat_moon_pellets', 'treat_gilded_knut'];
      const awardedTreat = treatsKeys[Math.floor(Math.random() * treatsKeys.length)];

      const dropped: Record<string, number> = {
        spell_energy: energyGain,
        knuts: knutsGain,
        [awardedTreat]: 1
      };

      if (Math.random() < 0.15) {
        dropped.beast_lure = 1;
      }

      setRewards(dropped);
      confetti({
        particleCount: 55,
        spread: 65,
        origin: { y: 0.5 },
        colors: ['#fbbf24', '#38bdf8', '#34d399', '#f43f5e']
      });

      onSpinSuccess(waypoint.id, dropped);
    }, 1250);
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }}>
      <div
        className="glass-panel"
        style={{
          width: '92%',
          maxWidth: '410px',
          padding: '24px 20px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          background: 'radial-gradient(circle at 50% 25%, #1e1b4b 0%, #09091b 100%)',
          border: '2px solid var(--border-gold-bright)',
          boxShadow: '0 0 35px rgba(251, 191, 36, 0.35), inset 0 0 20px rgba(0,0,0,0.6)'
        }}
      >
        {/* Top Header */}
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '9999px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: `1px solid ${meta.color}`,
              color: meta.color,
              fontSize: '0.8rem',
              fontWeight: 800,
              letterSpacing: '0.5px'
            }}
          >
            {meta.badge}
          </span>
          <button className="btn-icon" style={{ width: '34px', height: '34px' }} onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Waypoint Title & Distance */}
        <div>
          <h2 className="font-cinzel title-glow" style={{ fontSize: '1.35rem', color: '#fef08a', fontWeight: 800 }}>
            {waypoint.name}
          </h2>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '3px' }}>
            {inRange ? 'Within Interaction Range · Ready to replenish' : 'Beyond Reach · Apparate or move closer to visit.'}
          </p>
        </div>

        {/* Circular Illustrated Artwork Portal */}
        <div
          onClick={handleInteract}
          style={{
            position: 'relative',
            width: '190px',
            height: '190px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '4px solid #fbbf24',
            boxShadow: isInteracting
              ? '0 0 40px rgba(251, 191, 36, 0.8), inset 0 0 25px rgba(0,0,0,0.8)'
              : '0 0 26px rgba(251, 191, 36, 0.45), inset 0 0 16px rgba(0,0,0,0.8)',
            cursor: inRange && !isCooldown && !rewards ? 'pointer' : 'default',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#090d16'
          }}
        >
          <img
            src={getArtwork()}
            alt={waypoint.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: isInteracting ? 'scale(1.12) rotate(3deg)' : 'scale(1)',
              transition: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
              filter: isCooldown ? 'grayscale(0.85) brightness(0.6)' : 'brightness(1.05)'
            }}
          />

          {/* Shimmering Aura */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: isInteracting
                ? 'radial-gradient(circle, rgba(251, 191, 36, 0.45) 0%, transparent 75%)'
                : 'radial-gradient(circle, transparent 55%, rgba(0,0,0,0.45) 100%)',
              pointerEvents: 'none'
            }}
          />

          {isCooldown && (
            <div
              style={{
                position: 'absolute',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                background: 'rgba(15, 23, 42, 0.85)',
                padding: '8px 14px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <Clock size={24} color="#f59e0b" />
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#fef08a' }}>
                {Math.ceil(cooldownSecs / 60)}m Cooldown
              </span>
            </div>
          )}
        </div>

        {/* Rewards Card or Interaction Controls */}
        {rewards ? (
          <div className="glass-card" style={{ width: '100%', padding: '16px 14px', textAlign: 'center' }}>
            <div style={{ color: '#34d399', fontWeight: 800, fontSize: '1rem', marginBottom: '4px' }}>
              {meta.successTitle}
            </div>
            <p style={{ fontSize: '0.78rem', color: '#cbd5e1', marginBottom: '12px', lineHeight: 1.4 }}>
              {meta.flavorNote}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
              {rewards.spell_energy && (
                <div style={{ fontSize: '0.9rem', color: '#38bdf8', fontWeight: 800 }}>
                  ⚡ +{rewards.spell_energy} Energy
                </div>
              )}
              {rewards.knuts && (
                <div style={{ fontSize: '0.9rem', color: '#fbbf24', fontWeight: 800 }}>
                  🪙 +{rewards.knuts} Knuts
                </div>
              )}
              {Object.keys(rewards)
                .filter((k) => k.startsWith('treat_') || k === 'beast_lure')
                .map((k) => (
                  <div key={k} style={{ fontSize: '0.9rem', color: '#f43f5e', fontWeight: 800 }}>
                    {ITEMS[k]?.icon} +{rewards[k]} {ITEMS[k]?.name}
                  </div>
                ))}
            </div>
          </div>
        ) : isCooldown ? (
          <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
            Magical leylines recharging. Return in {Math.ceil(cooldownSecs / 60)} minutes for another feast.
          </div>
        ) : !inRange ? (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              className="btn-magical"
              disabled={currentEnergy < 10}
              onClick={onApparate}
              style={{
                width: '100%',
                padding: '13px',
                fontSize: '0.96rem',
                fontWeight: 800,
                background: currentEnergy >= 10
                  ? 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)'
                  : 'rgba(51, 65, 85, 0.5)',
                borderColor: currentEnergy >= 10 ? '#c084fc' : 'rgba(255, 255, 255, 0.15)',
                boxShadow: currentEnergy >= 10 ? '0 0 16px rgba(168, 85, 247, 0.4)' : 'none',
                opacity: currentEnergy >= 10 ? 1 : 0.6,
                cursor: currentEnergy >= 10 ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {currentEnergy >= 10 ? <Zap size={18} /> : <Lock size={18} />}
              <span>
                {currentEnergy >= 10
                  ? `Apparate to Location (-10 ⚡)`
                  : `Need 10 ⚡ to Apparate (Have ${currentEnergy} ⚡)`}
              </span>
            </button>
            <div style={{ fontSize: '0.76rem', color: '#94a3b8', textAlign: 'center' }}>
              Apparition costs 10 Spell Energy {waypoint.distMeters ? `· ${waypoint.distMeters}m away` : ''}
            </div>
          </div>
        ) : (
          <button
            className="btn-magical"
            disabled={isInteracting}
            onClick={handleInteract}
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '0.98rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {isInteracting ? (
              <Sparkles size={18} className="animate-spin" />
            ) : waypoint.type === 'greenhouse' ? (
              <Leaf size={18} />
            ) : waypoint.type === 'apothecary' ? (
              <FlaskConical size={18} />
            ) : (
              <Beer size={18} />
            )}
            <span>{isInteracting ? meta.pendingLabel : meta.actionLabel}</span>
          </button>
        )}

        {rewards && (
          <button className="btn-magical" style={{ width: '100%', padding: '12px' }} onClick={onClose}>
            Back to Map
          </button>
        )}
      </div>
    </div>
  );
}
