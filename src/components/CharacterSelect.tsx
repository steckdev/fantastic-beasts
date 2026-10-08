import React, { useState } from 'react';
import { HEROES } from '../data/heroesData';
import { Sparkles, ChevronRight } from 'lucide-react';
import { sounds } from '../services/soundService';

interface CharacterSelectProps {
  currentHeroId: string;
  onConfirmHero: (heroId: string) => void;
  isFirstTime?: boolean;
}

export default function CharacterSelect({ currentHeroId, onConfirmHero, isFirstTime = false }: CharacterSelectProps) {
  const [selectedId, setSelectedId] = useState<string>(currentHeroId || 'newt_scamander');

  const selectedHero = HEROES.find((h) => h.id === selectedId) || HEROES[0];

  const handleChoose = (id: string) => {
    setSelectedId(id);
    sounds.playWandCast('good');
  };

  const handleStartGame = () => {
    sounds.playCatchSuccess();
    onConfirmHero(selectedId);
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1300 }}>
      <div
        className="glass-panel"
        style={{
          width: '94%',
          maxWidth: '480px',
          maxHeight: '94vh',
          padding: '24px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          background: 'radial-gradient(circle at 50% 20%, #172554 0%, #090d16 100%)',
          border: '2px solid var(--border-gold-bright)',
          overflowY: 'auto'
        }}
      >
        {/* Story Banner Image */}
        <div style={{ width: '100%', borderRadius: '14px', overflow: 'hidden', border: '1px solid var(--border-gold)', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
          <img src="/home_screen.jpg" alt="Fantastic Beasts Collection" style={{ width: '100%', height: 'auto', display: 'block' }} />
        </div>

        {/* Story Intro */}
        <div style={{ textAlign: 'center' }}>
          <h1 className="font-cinzel title-glow" style={{ fontSize: '1.45rem', color: '#fef08a', fontWeight: 900 }}>
            {isFirstTime ? 'The Expedition Begins' : 'Select Your Magizoologist'}
          </h1>
          <p style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: '1.4', marginTop: '6px' }}>
            Magical creatures have escaped into the streets of your town! Choose your hero to venture out, trace leylines, and preserve the Statute of Secrecy.
          </p>
        </div>

        {/* Hero Selector Avatars */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', width: '100%' }}>
          {HEROES.map((h) => {
            const isSelected = h.id === selectedId;
            return (
              <div
                key={h.id}
                onClick={() => handleChoose(h.id)}
                className="glass-card"
                style={{
                  padding: '8px 4px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  border: isSelected ? '2px solid #fbbf24' : '1px solid rgba(255,255,255,0.1)',
                  boxShadow: isSelected ? '0 0 16px rgba(251, 191, 36, 0.6)' : 'none',
                  transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                  transition: 'all 0.2s ease'
                }}
              >
                <img src={h.sprite} alt={h.name} style={{ width: '56px', height: '56px', objectFit: 'contain' }} />
                <div
                  className="font-cinzel"
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: isSelected ? '#fde047' : '#94a3b8',
                    marginTop: '4px',
                    textAlign: 'center'
                  }}
                >
                  {h.name.split(' ')[0]}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Hero Details Card */}
        <div className="glass-card" style={{ width: '100%', padding: '16px', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '10px' }}>
            <img
              src={selectedHero.sprite}
              alt={selectedHero.name}
              style={{ width: '74px', height: '74px', objectFit: 'contain' }}
            />
            <div>
              <h2 className="font-cinzel title-glow" style={{ fontSize: '1.2rem', color: '#fef08a', fontWeight: 800 }}>
                {selectedHero.name}
              </h2>
              <div style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 600 }}>{selectedHero.title}</div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontStyle: 'italic', marginTop: '2px' }}>
                {selectedHero.quote}
              </div>
            </div>
          </div>

          <p style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: '1.4', marginBottom: '12px' }}>
            {selectedHero.bio}
          </p>

          {/* Unique Perk */}
          <div
            style={{
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '8px',
              padding: '10px 12px'
            }}
          >
            <div style={{ color: '#fbbf24', fontWeight: 800, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={15} />
              <span>Special Talent: {selectedHero.perkName}</span>
            </div>
            <div style={{ color: '#fef3c7', fontSize: '0.76rem', marginTop: '3px' }}>
              {selectedHero.perkDescription}
            </div>
          </div>
        </div>

        {/* Confirm Button */}
        <button className="btn-magical" style={{ width: '100%', padding: '14px' }} onClick={handleStartGame}>
          <span>Embark as {selectedHero.name}</span>
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
