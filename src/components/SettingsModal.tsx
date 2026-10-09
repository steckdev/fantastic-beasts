import React from 'react';
import {
  Settings,
  Volume2,
  VolumeX,
  Car,
  X,
  Compass,
  BatteryCharging,
  Smartphone,
  MapPin,
  Layers
} from 'lucide-react';
import { HEROES } from '../data/heroesData';
import { GameSettings } from '../types';
import { haptics } from '../services/hapticsService';

interface SettingsModalProps {
  settings: GameSettings;
  currentHeroId: string;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onChangeHero: () => void;
  onResetGame: () => void;
  onClose: () => void;
  onShowToast?: (title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' | 'energy' | 'mark') => void;
}

export default function SettingsModal({
  settings,
  currentHeroId,
  onUpdateSettings,
  onChangeHero,
  onResetGame,
  onClose,
  onShowToast
}: SettingsModalProps) {
  const hero = HEROES.find((h) => h.id === currentHeroId) || HEROES[0];

  const mapStyles: { id: 'marauder' | 'parchment' | 'twilight'; label: string; desc: string }[] = [
    { id: 'marauder', label: 'Marauder’s Map', desc: 'Nocturnal magical leylines with glowing gold roads' },
    { id: 'parchment', label: 'Vintage Parchment', desc: '1920s Antique sepia New York wizarding map' },
    { id: 'twilight', label: 'Arcane Twilight', desc: 'Mystical celestial blue & violet illumination' }
  ];

  return (
    <div className="modal-overlay" style={{ zIndex: 1200 }}>
      <div
        className="glass-panel"
        style={{
          width: '92%',
          maxWidth: '430px',
          maxHeight: '88vh',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
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

        {/* Map Live Filter Theme Selector */}
        <div className="glass-card" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Compass color="#fbbf24" size={18} />
            <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#f8fafc' }}>
              Cartographic Style Filter
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {mapStyles.map((s) => {
              const isSelected = (settings.mapStyle || 'marauder') === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    onUpdateSettings({ mapStyle: s.id });
                    haptics.light(settings.hapticsEnabled ?? true);
                    if (onShowToast) {
                      onShowToast('Cartography Updated', `Active filter: ${s.label}`, 'info');
                    }
                  }}
                  className="glass-card"
                  style={{
                    padding: '8px 10px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    cursor: 'pointer',
                    textAlign: 'left',
                    background: isSelected ? 'rgba(30, 41, 59, 0.95)' : 'rgba(15, 23, 42, 0.6)',
                    border: isSelected ? '1.5px solid #fbbf24' : '1px solid rgba(255,255,255,0.08)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: isSelected ? '#fde047' : '#cbd5e1' }}>
                      {isSelected ? '✨ ' : ''}{s.label}
                    </span>
                    {isSelected && (
                      <span style={{ fontSize: '0.65rem', background: '#d97706', color: '#fff', padding: '1px 5px', borderRadius: '4px', fontWeight: 800 }}>
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>
                    {s.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sound Toggle */}
        <div className="glass-card" style={{ padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {settings.soundEnabled ? <Volume2 color="#34d399" size={20} /> : <VolumeX color="#94a3b8" size={20} />}
            <div>
              <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#f8fafc' }}>Sound Effects & Spells</div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Synthesized wand audio and beast cries</div>
            </div>
          </div>
          <button
            className="btn-secondary"
            onClick={() => {
              const nextVal = !settings.soundEnabled;
              onUpdateSettings({ soundEnabled: nextVal });
              haptics.light(settings.hapticsEnabled ?? true);
            }}
            style={{ padding: '6px 12px', fontSize: '0.75rem' }}
          >
            {settings.soundEnabled ? 'Enabled' : 'Muted'}
          </button>
        </div>

        {/* Haptic Physical Feedback */}
        <div className="glass-card" style={{ padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Smartphone color="#c084fc" size={20} />
            <div>
              <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#f8fafc' }}>Haptic Vibration Feedback</div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Sensory pulse on encounters, spells & marks</div>
            </div>
          </div>
          <button
            className={(settings.hapticsEnabled ?? true) ? 'btn-magical' : 'btn-secondary'}
            onClick={() => {
              const nextVal = !(settings.hapticsEnabled ?? true);
              onUpdateSettings({ hapticsEnabled: nextVal });
              if (nextVal) haptics.medium(true);
            }}
            style={{ padding: '6px 12px', fontSize: '0.75rem' }}
          >
            {(settings.hapticsEnabled ?? true) ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Passenger / Drive Mode Toggle */}
        <div className="glass-card" style={{ padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Car color="#38bdf8" size={20} />
            <div>
              <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#f8fafc' }}>Drive / Passenger Mode</div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Expands radius to 130m for car rides</div>
            </div>
          </div>
          <button
            className={settings.driveMode ? 'btn-magical' : 'btn-secondary'}
            onClick={() => {
              onUpdateSettings({ driveMode: !settings.driveMode });
              haptics.light(settings.hapticsEnabled ?? true);
            }}
            style={{ padding: '6px 12px', fontSize: '0.75rem' }}
          >
            {settings.driveMode ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Battery Saver Mode Toggle */}
        <div className="glass-card" style={{ padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BatteryCharging color="#fbbf24" size={20} />
            <div>
              <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#f8fafc' }}>Battery Saver (Eco Mode)</div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Disables intensive glows & throttles GPS for walks</div>
            </div>
          </div>
          <button
            className={settings.batterySaver ? 'btn-magical' : 'btn-secondary'}
            onClick={() => {
              const nextVal = !settings.batterySaver;
              onUpdateSettings({ batterySaver: nextVal });
              haptics.light(settings.hapticsEnabled ?? true);
              if (onShowToast) {
                onShowToast(
                  nextVal ? 'Battery Saver Active 🔋' : 'Performance Mode Restored',
                  nextVal ? 'Heavy visual effects & particle loops dimmed.' : 'Full high-fidelity visual fidelity restored.',
                  'info'
                );
              }
            }}
            style={{ padding: '6px 12px', fontSize: '0.75rem' }}
          >
            {settings.batterySaver ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Auto-Pin Coordinates on Apparition */}
        <div className="glass-card" style={{ padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MapPin color="#f43f5e" size={20} />
            <div>
              <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#f8fafc' }}>Apparition Auto-Pin</div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Keep map anchored after teleporting</div>
            </div>
          </div>
          <button
            className={(settings.autoPinApparate ?? true) ? 'btn-magical' : 'btn-secondary'}
            onClick={() => {
              onUpdateSettings({ autoPinApparate: !(settings.autoPinApparate ?? true) });
              haptics.light(settings.hapticsEnabled ?? true);
            }}
            style={{ padding: '6px 12px', fontSize: '0.75rem' }}
          >
            {(settings.autoPinApparate ?? true) ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* 3D Isometric Tilt Perspective */}
        <div className="glass-card" style={{ padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Layers color="#10b981" size={20} />
            <div>
              <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#f8fafc' }}>Camera 3D Perspective</div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Dynamic angled 3D view vs 2D top-down</div>
            </div>
          </div>
          <button
            className={(settings.cameraTilt3D ?? true) ? 'btn-magical' : 'btn-secondary'}
            onClick={() => {
              onUpdateSettings({ cameraTilt3D: !(settings.cameraTilt3D ?? true) });
              haptics.light(settings.hapticsEnabled ?? true);
            }}
            style={{ padding: '6px 12px', fontSize: '0.75rem' }}
          >
            {(settings.cameraTilt3D ?? true) ? '3D' : '2D'}
          </button>
        </div>

        {/* Reset Save Button */}
        <div style={{ paddingTop: '4px' }}>
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
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.78rem',
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
