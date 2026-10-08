import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { X, RotateCw, Zap, Lock } from 'lucide-react';
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

export default function WaypointModal({ waypoint, inRange, currentEnergy = 100, onSpinSuccess, onClose, onApparate }: WaypointModalProps) {
  const [spinning, setSpinning] = useState<boolean>(false);
  const [rewards, setRewards] = useState<Record<string, number> | null>(null);

  const isCooldown = waypoint.cooldownUntil && waypoint.cooldownUntil > Date.now();
  const cooldownSecs = Math.max(0, Math.ceil(((waypoint.cooldownUntil || 0) - Date.now()) / 1000));

  const handleSpin = () => {
    if (!inRange || isCooldown || spinning || rewards) return;
    setSpinning(true);
    sounds.playSpinChime();

    setTimeout(() => {
      setSpinning(false);

      const energyGain = Math.floor(12 + Math.random() * 15);
      const knutsGain = Math.floor(25 + Math.random() * 35);
      const treatsKeys = ['treat_brioche', 'treat_woodlice', 'treat_moon_pellets', 'treat_gilded_knut'];
      const awardedTreat = treatsKeys[Math.floor(Math.random() * treatsKeys.length)];

      const dropped: Record<string, number> = {
        spell_energy: energyGain,
        knuts: knutsGain,
        [awardedTreat]: 1
      };

      if (Math.random() < 0.12) {
        dropped.beast_lure = 1;
      }

      setRewards(dropped);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.5 }
      });

      onSpinSuccess(waypoint.id, dropped);
    }, 1200);
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }}>
      <div
        className="glass-panel"
        style={{
          width: '92%',
          maxWidth: '400px',
          padding: '24px 20px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          background: 'radial-gradient(circle at 50% 30%, #1e293b 0%, #090d16 100%)',
          border: '2px solid var(--border-gold-bright)'
        }}
      >
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className={`threat-badge ${waypoint.type === 'greenhouse' ? 'threat-1' : 'threat-3'}`}>
            {waypoint.type === 'greenhouse' ? '🌿 Herbology Greenhouse' : '🍺 Wizarding Inn'}
          </span>
          <button className="btn-icon" style={{ width: '34px', height: '34px' }} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div>
          <h2 className="font-cinzel title-glow" style={{ fontSize: '1.3rem', color: '#fef08a', fontWeight: 800 }}>
            {waypoint.name}
          </h2>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '2px' }}>
            {inRange ? 'Within Interaction Range' : 'Too far away! Move closer to spin.'}
          </p>
        </div>

        <div
          onClick={handleSpin}
          style={{
            position: 'relative',
            width: '180px',
            height: '180px',
            borderRadius: '50%',
            background: waypoint.type === 'greenhouse'
              ? 'radial-gradient(circle, #065f46 0%, #022c22 100%)'
              : 'radial-gradient(circle, #92400e 0%, #451a03 100%)',
            border: '4px solid #fbbf24',
            boxShadow: '0 0 24px rgba(251, 191, 36, 0.5), inset 0 0 16px rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: inRange && !isCooldown && !rewards ? 'pointer' : 'default',
            transform: spinning ? 'rotate(720deg)' : 'none',
            transition: spinning ? 'transform 1.2s cubic-bezier(0.1, 0.9, 0.2, 1)' : 'none'
          }}
        >
          <div style={{ fontSize: '72px', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.8))' }}>
            {isCooldown ? '⏳' : waypoint.icon}
          </div>
        </div>

        {rewards ? (
          <div className="glass-card" style={{ width: '100%', padding: '14px', textAlign: 'center' }}>
            <div style={{ color: '#34d399', fontWeight: 800, fontSize: '0.95rem', marginBottom: '8px' }}>
              ✨ Leyline Harvest Collected!
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
              {rewards.spell_energy && (
                <div style={{ fontSize: '0.85rem', color: '#38bdf8', fontWeight: 700 }}>
                  ⚡ +{rewards.spell_energy} Energy
                </div>
              )}
              {rewards.knuts && (
                <div style={{ fontSize: '0.85rem', color: '#fbbf24', fontWeight: 700 }}>
                  🪙 +{rewards.knuts} Knuts
                </div>
              )}
              {Object.keys(rewards)
                .filter((k) => k.startsWith('treat_') || k === 'beast_lure')
                .map((k) => (
                  <div key={k} style={{ fontSize: '0.85rem', color: '#f43f5e', fontWeight: 700 }}>
                    {ITEMS[k]?.icon} +{rewards[k]} {ITEMS[k]?.name}
                  </div>
                ))}
            </div>
          </div>
        ) : isCooldown ? (
          <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
            Inn recharging energy leylines. Available in {Math.ceil(cooldownSecs / 60)} minutes.
          </div>
        ) : !inRange ? (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              className="btn-magical"
              disabled={currentEnergy < 10}
              onClick={onApparate}
              style={{
                width: '100%',
                padding: '12px',
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
            disabled={spinning}
            onClick={handleSpin}
            style={{ width: '100%', padding: '12px' }}
          >
            <RotateCw size={18} className={spinning ? 'animate-spin' : ''} />
            <span>Spin Waypoint Plate</span>
          </button>
        )}

        {rewards && (
          <button className="btn-magical" style={{ width: '100%' }} onClick={onClose}>
            Back to Map
          </button>
        )}
      </div>
    </div>
  );
}
