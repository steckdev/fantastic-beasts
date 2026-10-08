import React, { useState } from 'react';
import { X } from 'lucide-react';
import { BEASTS } from '../data/beastsData';
import { SPELLS } from '../data/spellsData';
import { sounds } from '../services/soundService';
import { Beast, MinistryClassification } from '../types';

interface FieldGuideProps {
  caughtBeasts: Record<string, number>;
  seenBeasts: Record<string, number>;
  onClose: () => void;
}

export default function FieldGuide({ caughtBeasts, seenBeasts, onClose }: FieldGuideProps) {
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [inspectBeast, setInspectBeast] = useState<Beast | null>(null);

  const classes: ('ALL' | MinistryClassification)[] = ['ALL', 'XX', 'XXX', 'XXXX', 'XXXXX'];

  const filteredBeasts = BEASTS.filter((b) => {
    if (selectedClass === 'ALL') return true;
    return b.classification === selectedClass;
  });

  const totalCaughtCount = Object.keys(caughtBeasts).filter((k) => (caughtBeasts[k] || 0) > 0).length;

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'radial-gradient(circle at 50% 20%, #1e1b4b 0%, #090d16 100%)',
        overflow: 'hidden'
      }}
    >
      {/* Top Header */}
      <div
        style={{
          padding: 'calc(var(--safe-top) + 12px) 16px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-gold)',
          background: 'rgba(11, 15, 25, 0.85)',
          backdropFilter: 'blur(12px)',
          zIndex: 20
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/home_screen.jpg" alt="Collection" style={{ width: '38px', height: '38px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--border-gold)' }} />
          <div>
            <h1 className="font-cinzel title-glow" style={{ fontSize: '1.2rem', color: '#fef08a', fontWeight: 800 }}>
              Magizoology Field Guide
            </h1>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
              {totalCaughtCount} of {BEASTS.length} Fantastic Beasts Discovered
            </div>
          </div>
        </div>

        <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={onClose}>
          Exit
        </button>
      </div>

      {/* Ministry Classification Filter Tabs */}
      <div style={{ padding: '12px 16px', display: 'flex', gap: '8px', overflowX: 'auto', whiteSpace: 'nowrap' }}>
        {classes.map((cls) => (
          <button
            key={cls}
            onClick={() => setSelectedClass(cls)}
            className={selectedClass === cls ? 'btn-magical' : 'btn-secondary'}
            style={{ padding: '6px 14px', fontSize: '0.78rem', borderRadius: 'var(--radius-full)' }}
          >
            {cls === 'ALL' ? 'All Classes' : `Class ${cls}`}
          </button>
        ))}
      </div>

      {/* Roster Grid */}
      <div
        style={{
          flex: 1,
          padding: '8px 16px 100px',
          overflowY: 'auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(105px, 1fr))',
          gap: '10px'
        }}
      >
        {filteredBeasts.map((b) => {
          const caught = (caughtBeasts[b.id] || 0) > 0;
          const seen = (seenBeasts[b.id] || 0) > 0;

          return (
            <div
              key={b.id}
              onClick={() => setInspectBeast(b)}
              className="glass-card"
              style={{
                padding: '10px 6px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                opacity: caught ? 1 : seen ? 0.6 : 0.35,
                border: caught ? '1px solid var(--border-gold)' : '1px solid rgba(255,255,255,0.08)'
              }}
            >
              <div style={{ position: 'relative', width: '70px', height: '70px' }}>
                <img
                  src={b.sprite}
                  alt={b.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    filter: caught ? 'none' : 'brightness(0) invert(0.3)'
                  }}
                />
              </div>

              <div
                className="font-cinzel"
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: caught ? '#fef08a' : '#94a3b8',
                  marginTop: '4px',
                  textAlign: 'center',
                  lineHeight: '1.2'
                }}
              >
                {caught || seen ? b.name : '???'}
              </div>

              <div style={{ fontSize: '0.62rem', color: '#64748b', marginTop: '2px' }}>
                Class {b.classification}
              </div>
            </div>
          );
        })}
      </div>

      {/* Inspect Beast Modal */}
      {inspectBeast && (
        <div className="modal-overlay" style={{ zIndex: 1200 }} onClick={() => setInspectBeast(null)}>
          <div
            className="glass-panel"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '90%',
              maxWidth: '380px',
              padding: '20px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <div style={{ alignSelf: 'flex-end', cursor: 'pointer' }} onClick={() => setInspectBeast(null)}>
              <X size={20} color="#94a3b8" />
            </div>

            <img
              src={inspectBeast.sprite}
              alt={inspectBeast.name}
              style={{ width: '140px', height: '140px', objectFit: 'contain' }}
            />

            <div>
              <h2 className="font-cinzel title-glow" style={{ fontSize: '1.3rem', color: '#fef08a', fontWeight: 800 }}>
                {inspectBeast.name}
              </h2>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{inspectBeast.species}</div>
            </div>

            <div style={{ display: 'flex', gap: '8px', width: '100%', justifyContent: 'center' }}>
              <button
                className="btn-secondary"
                onClick={() => sounds.playCreatureCry(inspectBeast.cryFreq || 440)}
                style={{ padding: '6px 14px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <span>🔊</span>
                <span>Listen to Call</span>
              </button>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <span className={`threat-badge threat-${inspectBeast.dangerRating}`}>
                Threat Level {inspectBeast.dangerRating}
              </span>
              <span className="glass-card" style={{ padding: '3px 8px', fontSize: '0.75rem', color: '#fbbf24' }}>
                Ministry Class {inspectBeast.classification}
              </span>
              <span className="glass-card" style={{ padding: '3px 8px', fontSize: '0.75rem', color: '#38bdf8' }}>
                Type: {inspectBeast.type}
              </span>
            </div>

            <div className="glass-card" style={{ padding: '10px 14px', width: '100%', textAlign: 'left', fontSize: '0.82rem' }}>
              <div style={{ marginBottom: '6px' }}>
                <strong style={{ color: '#fbbf24' }}>Habitat:</strong> {inspectBeast.habitat}
              </div>
              <div style={{ marginBottom: '6px' }}>
                <strong style={{ color: '#ec4899' }}>Favorite Treat:</strong> {inspectBeast.favoriteTreat}
              </div>

              {/* Recommended Wand Spell */}
              {(() => {
                const recSpell =
                  SPELLS.find((s) => s.effectiveTypes.includes(inspectBeast.type)) ||
                  SPELLS.find((s) => s.id === 'flipendo');
                if (!recSpell) return null;
                return (
                  <div
                    style={{
                      marginTop: '8px',
                      marginBottom: '8px',
                      padding: '6px 10px',
                      background: 'rgba(15, 23, 42, 0.7)',
                      borderRadius: '8px',
                      border: `1px solid ${recSpell.color}`
                    }}
                  >
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Recommended Wand Charm:</div>
                    <div style={{ fontWeight: 800, color: recSpell.color, fontSize: '0.82rem', marginTop: '2px' }}>
                      {recSpell.icon} {recSpell.name} ("{recSpell.incantation}")
                    </div>
                  </div>
                );
              })()}

              <p style={{ color: '#cbd5e1', lineHeight: '1.4', fontSize: '0.8rem', marginTop: '6px' }}>
                {inspectBeast.lore}
              </p>

              <div
                style={{
                  marginTop: '10px',
                  paddingTop: '8px',
                  borderTop: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.74rem',
                  color: '#94a3b8'
                }}
              >
                <span>Seen in Wild: <strong>{seenBeasts[inspectBeast.id] || 0}</strong></span>
                <span style={{ color: '#34d399' }}>Rescued into Suitcase: <strong>{caughtBeasts[inspectBeast.id] || 0}</strong></span>
              </div>
            </div>

            <button className="btn-magical" style={{ width: '100%' }} onClick={() => setInspectBeast(null)}>
              Close Field Record
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
