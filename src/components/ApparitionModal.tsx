import React from 'react';
import { X, Zap, MapPin, Sparkles, Compass, Lock } from 'lucide-react';
import { Disturbance, Waypoint } from '../types';

export interface ApparitionTarget {
  type: 'disturbance' | 'waypoint';
  disturbance?: Disturbance;
  waypoint?: Waypoint;
  distMeters: number;
}

interface ApparitionModalProps {
  target: ApparitionTarget | null;
  currentEnergy?: number;
  onApparate: (target: ApparitionTarget) => void;
  onClose: () => void;
}

export default function ApparitionModal({ target, currentEnergy = 100, onApparate, onClose }: ApparitionModalProps) {
  if (!target) return null;

  const isDisturbance = target.type === 'disturbance' && target.disturbance;
  const distObj = target.disturbance;
  const wp = target.waypoint;

  const title = isDisturbance ? distObj!.beast.name : wp?.name || 'Waymark';
  const distance = target.distMeters;

  return (
    <div className="modal-overlay" style={{ zIndex: 1200 }}>
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
          border: '2px solid #a855f7',
          boxShadow: '0 0 32px rgba(168, 85, 247, 0.4), inset 0 0 20px rgba(0,0,0,0.6)',
          animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Top Header */}
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '9999px',
              background: 'rgba(168, 85, 247, 0.18)',
              border: '1px solid rgba(168, 85, 247, 0.5)',
              color: '#d8b4fe',
              fontSize: '0.78rem',
              fontWeight: 700
            }}
          >
            <Zap size={14} color="#c084fc" />
            <span>Apparition License</span>
          </div>

          <button
            className="btn-icon"
            style={{ width: '32px', height: '32px', borderColor: 'rgba(255,255,255,0.2)' }}
            onClick={onClose}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Hero Target Preview */}
        <div
          style={{
            position: 'relative',
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: isDisturbance
              ? 'radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, rgba(15, 23, 42, 0.9) 100%)'
              : 'radial-gradient(circle, rgba(245, 158, 11, 0.3) 0%, rgba(15, 23, 42, 0.9) 100%)',
            border: `3px solid ${isDisturbance ? distObj!.auraColor : '#fbbf24'}`,
            boxShadow: `0 0 24px ${isDisturbance ? distObj!.auraColor : '#fbbf24'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: '4px'
          }}
        >
          {isDisturbance ? (
            <img
              src={distObj!.beast.sprite}
              alt={title}
              style={{
                width: '76px',
                height: '76px',
                objectFit: 'contain',
                filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.8))'
              }}
            />
          ) : (
            <div style={{ fontSize: '48px' }}>{wp?.icon || '📍'}</div>
          )}

          <div
            style={{
              position: 'absolute',
              bottom: '-6px',
              background: '#0f172a',
              border: '1px solid #c084fc',
              color: '#f8fafc',
              fontSize: '10px',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '9999px',
              letterSpacing: '0.5px'
            }}
          >
            {distance}m AWAY
          </div>
        </div>

        {/* Target Info */}
        <div>
          <h2
            className="font-cinzel"
            style={{
              fontSize: '1.25rem',
              color: '#fef08a',
              fontWeight: 800,
              marginBottom: '4px',
              textShadow: '0 0 12px rgba(254, 240, 138, 0.4)'
            }}
          >
            {title}
          </h2>

          {isDisturbance && (
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
              <span className={`threat-badge threat-${distObj!.beast.dangerRating}`}>
                Class {distObj!.beast.classification} · Danger {distObj!.beast.dangerRating}
              </span>
              <span style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 700 }}>
                CP {distObj!.cp}
              </span>
              {distObj!.mark && (
                <span
                  style={{
                    background: 'rgba(251, 191, 36, 0.2)',
                    border: '1px solid #fbbf24',
                    color: '#fbbf24',
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '9999px'
                  }}
                >
                  {distObj!.mark.icon} {distObj!.mark.name}
                </span>
              )}
            </div>
          )}

          {!isDisturbance && wp && (
            <span className={`threat-badge ${wp.type === 'greenhouse' ? 'threat-1' : 'threat-3'}`}>
              {wp.type === 'greenhouse' ? '🌿 Herbology Greenhouse' : '🍺 Wizarding Inn'}
            </span>
          )}
        </div>

        {/* Flavor Lore */}
        <p
          style={{
            fontSize: '0.82rem',
            color: '#cbd5e1',
            lineHeight: 1.45,
            padding: '10px 14px',
            background: 'rgba(0, 0, 0, 0.4)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          Magical trace detected beyond standard wand reach. Channel the Three D&apos;s —{' '}
          <strong style={{ color: '#c084fc' }}>Destination</strong>,{' '}
          <strong style={{ color: '#c084fc' }}>Determination</strong>, and{' '}
          <strong style={{ color: '#c084fc' }}>Deliberation</strong> — to instantly Apparate beside it.
        </p>

        {/* Energy Cost Pill */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            borderRadius: '12px',
            background: currentEnergy >= 10 ? 'rgba(56, 189, 248, 0.1)' : 'rgba(239, 68, 68, 0.12)',
            border: `1px solid ${currentEnergy >= 10 ? 'rgba(56, 189, 248, 0.35)' : 'rgba(239, 68, 68, 0.4)'}`
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={15} color={currentEnergy >= 10 ? '#38bdf8' : '#f87171'} />
            <span style={{ fontSize: '0.84rem', color: '#e2e8f0', fontWeight: 600 }}>Apparition Cost</span>
          </div>
          <span
            style={{
              fontSize: '0.88rem',
              fontWeight: 800,
              color: currentEnergy >= 10 ? '#38bdf8' : '#f87171',
              textShadow: currentEnergy >= 10 ? '0 0 8px rgba(56, 189, 248, 0.5)' : '0 0 8px rgba(239, 68, 68, 0.5)'
            }}
          >
            -10 ⚡ <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 500 }}>(Have {currentEnergy} ⚡)</span>
          </span>
        </div>

        {/* Action Buttons */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            className="btn-magical"
            disabled={currentEnergy < 10}
            onClick={() => onApparate(target)}
            style={{
              width: '100%',
              padding: '13px',
              fontSize: '0.96rem',
              fontWeight: 800,
              background: currentEnergy >= 10
                ? 'linear-gradient(135deg, #7c3aed 0%, #4338ca 100%)'
                : 'rgba(51, 65, 85, 0.5)',
              borderColor: currentEnergy >= 10 ? '#c084fc' : 'rgba(255, 255, 255, 0.15)',
              boxShadow: currentEnergy >= 10
                ? '0 0 20px rgba(168, 85, 247, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                : 'none',
              opacity: currentEnergy >= 10 ? 1 : 0.6,
              cursor: currentEnergy >= 10 ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {currentEnergy >= 10 ? <Zap size={18} /> : <Lock size={18} />}
            <span>{currentEnergy >= 10 ? 'Apparate to Location (-10 ⚡)' : 'Insufficient Spell Energy (-10 ⚡ needed)'}</span>
          </button>

          <button
            className="btn-secondary"
            onClick={onClose}
            style={{ width: '100%', padding: '10px', fontSize: '0.85rem' }}
          >
            Cancel &amp; Stay Here
          </button>
        </div>
      </div>
    </div>
  );
}
