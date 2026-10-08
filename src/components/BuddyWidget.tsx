import React from 'react';
import { Footprints, Heart, Sparkles, Plus } from 'lucide-react';
import { CapturedBeast, Beast } from '../types';
import { BEASTS } from '../data/beastsData';

import { sounds } from '../services/soundService';

interface BuddyWidgetProps {
  buddyInstance: CapturedBeast | null;
  buddyProgressKm: number;
  totalKmWalked: number;
  totalSteps: number;
  onOpenBuddySelect: () => void;
}

export default function BuddyWidget({
  buddyInstance,
  buddyProgressKm,
  totalKmWalked,
  totalSteps,
  onOpenBuddySelect
}: BuddyWidgetProps) {
  const [bouncing, setBouncing] = React.useState(false);
  const beastData: Beast | undefined = buddyInstance
    ? BEASTS.find((b) => b.id === buddyInstance.beastId)
    : undefined;

  const targetKm = 1.0;
  const progressPercent = Math.min(100, Math.round((buddyProgressKm / targetKm) * 100));

  const handleClick = () => {
    if (buddyInstance) {
      setBouncing(true);
      sounds.playPlayfulBounce();
      setTimeout(() => setBouncing(false), 550);
    }
    onOpenBuddySelect();
  };

  return (
    <div
      onClick={handleClick}
      className={`glass-panel ${bouncing ? 'interactive-beast-bounce' : ''}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '6px 12px',
        borderRadius: 'var(--radius-full)',
        cursor: 'pointer',
        boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
        border: '1.5px solid var(--border-gold-bright)',
        transition: 'transform 0.15s ease'
      }}
      title={buddyInstance ? 'Interact with Buddy Companion' : 'Choose a Buddy Companion'}
    >
      {/* Buddy Avatar or Add icon */}
      <div
        style={{
          position: 'relative',
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          background: '#0f172a',
          border: '2px solid #fbbf24',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}
      >
        {beastData ? (
          <img
            src={beastData.sprite}
            alt={beastData.name}
            style={{ width: '32px', height: '32px', objectFit: 'contain' }}
          />
        ) : (
          <Plus size={18} color="#fbbf24" />
        )}
      </div>

      {/* Progress Info */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            className="font-cinzel"
            style={{ fontSize: '0.78rem', fontWeight: 700, color: '#fef08a' }}
          >
            {buddyInstance ? (buddyInstance.nickname || beastData?.name) : 'Set Buddy'}
          </span>
          {buddyInstance && (
            <span style={{ fontSize: '0.7rem', color: '#ec4899', display: 'flex', alignItems: 'center', gap: '2px' }}>
              <Heart size={10} fill="#ec4899" /> Lvl {buddyInstance.bondLevel}
            </span>
          )}
        </div>

        {/* Progress Bar & km */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
          <div style={{ width: '70px', height: '5px', background: 'rgba(255,255,255,0.15)', borderRadius: '3px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${progressPercent}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #38bdf8, #818cf8)',
                transition: 'width 0.3s'
              }}
            />
          </div>
          <span style={{ fontSize: '0.66rem', color: '#cbd5e1', fontWeight: 600 }}>
            {buddyProgressKm.toFixed(1)} / {targetKm} km
          </span>
        </div>
      </div>

      {/* Footprints icon */}
      <Footprints size={15} color="#38bdf8" style={{ marginLeft: '2px' }} />
    </div>
  );
}
