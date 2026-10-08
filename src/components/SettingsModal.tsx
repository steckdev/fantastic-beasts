import React, { useState } from 'react';
import { Settings, Volume2, VolumeX, Car, X, Key } from 'lucide-react';
import { HEROES } from '../data/heroesData';
import { GameSettings } from '../types';

interface SettingsModalProps {
  settings: GameSettings;
  currentHeroId: string;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onChangeHero: () => void;
  onResetGame: () => void;
  onClose: () => void;
}

export default function SettingsModal({
  settings,
  currentHeroId,
  onUpdateSettings,
  onChangeHero,
  onResetGame,
  onClose
}: SettingsModalProps) {
  const [apiKey, setApiKey] = useState<string>(settings.googleMapsApiKey || '');
  const hero = HEROES.find((h) => h.id === currentHeroId) || HEROES[0];

  const handleSaveApiKey = () => {
    onUpdateSettings({ googleMapsApiKey: apiKey });
    alert('Google Maps API key saved! (If empty, standard cartographic tiles will be used)');
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1200 }}>
      <div
        className="glass-panel"
        style={{
          width: '92%',
          maxWidth: '420px',
          maxHeight: '85vh',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          background: 'radial-gradient(circle at 50% 20%, #172554 0%, #090d16 100%)',
          border: '2px solid var(--border-gold-bright)',
          overflowY: 'auto'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Settings size={22} color="#fbbf24" />
            <h2 className="font-cinzel title-glow" style={{ fontSize: '1.25rem', color: '#fef08a', fontWeight: 800 }}>
              Settings & Cartography
            </h2>
          </div>
          <button className="btn-icon" style={{ width: '34px', height: '34px' }} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Current Hero & Switch button */}
        <div className="glass-card" style={{ padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src={hero.sprite} alt={hero.name} style={{ width: '42px', height: '42px', objectFit: 'contain' }} />
            <div>
              <div className="font-cinzel" style={{ fontSize: '0.9rem', color: '#fef08a', fontWeight: 700 }}>
                {hero.name}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{hero.title}</div>
            </div>
          </div>
          <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={onChangeHero}>
            Change Hero
          </button>
        </div>

        {/* Sound Toggle */}
        <div className="glass-card" style={{ padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {settings.soundEnabled ? <Volume2 color="#34d399" size={20} /> : <VolumeX color="#94a3b8" size={20} />}
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc' }}>Sound Effects & Spells</div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Synthesized wand audio and beast cries</div>
            </div>
          </div>
          <button
            className="btn-secondary"
            onClick={() => onUpdateSettings({ soundEnabled: !settings.soundEnabled })}
            style={{ padding: '6px 12px', fontSize: '0.75rem' }}
          >
            {settings.soundEnabled ? 'Enabled' : 'Muted'}
          </button>
        </div>

        {/* Passenger / Drive Mode Toggle */}
        <div className="glass-card" style={{ padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Car color="#38bdf8" size={20} />
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc' }}>Drive / Passenger Mode</div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Expands range to 130m for car rides</div>
            </div>
          </div>
          <button
            className={settings.driveMode ? 'btn-magical' : 'btn-secondary'}
            onClick={() => onUpdateSettings({ driveMode: !settings.driveMode })}
            style={{ padding: '6px 12px', fontSize: '0.75rem' }}
          >
            {settings.driveMode ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Google Maps API Key Config */}
        <div className="glass-card" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Key color="#fbbf24" size={18} />
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>
              Google Maps Key (Optional)
            </div>
          </div>
          <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
            CartoDB/OSM vector map is default. If you have a Google Maps JavaScript API key, enter it below:
          </p>
          <div style={{ display: 'flex', gap: '6px' }}>
            <input
              type="text"
              placeholder="Paste Google Maps Key here..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              style={{
                flex: 1,
                background: 'rgba(15, 23, 42, 0.7)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#f8fafc',
                padding: '6px 10px',
                borderRadius: '6px',
                fontSize: '0.78rem'
              }}
            />
            <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={handleSaveApiKey}>
              Save
            </button>
          </div>
        </div>

        {/* Reset Save Button */}
        <div style={{ paddingTop: '8px' }}>
          <button
            onClick={() => {
              if (window.confirm('Reset all game data and suitcase collection? This cannot be undone.')) {
                onResetGame();
              }
            }}
            style={{
              width: '100%',
              background: 'transparent',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#f87171',
              padding: '8px',
              borderRadius: '8px',
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}
          >
            Reset Game Data
          </button>
        </div>
      </div>
    </div>
  );
}
