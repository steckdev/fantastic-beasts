import React from 'react';
import { Scroll, CheckCircle, Gift, X, Calendar } from 'lucide-react';
import { sounds } from '../services/soundService';
import { ITEMS } from '../data/itemsData';
import { Quest } from '../types';

interface QuestsModalProps {
  quests: Quest[];
  onClaimReward: (questId: string, reward: Record<string, number>) => void;
  onClose: () => void;
}

export default function QuestsModal({ quests, onClaimReward, onClose }: QuestsModalProps) {
  const handleClaim = (quest: Quest) => {
    sounds.playCatchSuccess();
    onClaimReward(quest.id, quest.reward);
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1200 }}>
      <div
        className="glass-panel"
        style={{
          width: '92%',
          maxWidth: '440px',
          maxHeight: '85vh',
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
            <Scroll size={22} color="#fbbf24" />
            <h2 className="font-cinzel title-glow" style={{ fontSize: '1.25rem', color: '#fef08a', fontWeight: 800 }}>
              Daily MACUSA Tasks
            </h2>
          </div>
          <button className="btn-icon" style={{ width: '34px', height: '34px' }} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#38bdf8' }}>
          <Calendar size={14} />
          <span>Refreshes daily at midnight • Track progress across town</span>
        </div>

        {/* Quests List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {quests.map((q) => {
            const isComplete = q.current >= q.target;
            const progressPct = Math.min(100, Math.round((q.current / q.target) * 100));

            return (
              <div
                key={q.id}
                className="glass-card"
                style={{
                  padding: '12px',
                  border: isComplete && !q.claimed ? '1.5px solid #34d399' : '1px solid rgba(255,255,255,0.08)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 className="font-cinzel" style={{ fontSize: '0.92rem', color: '#fef08a', fontWeight: 700 }}>
                      {q.title}
                    </h3>
                    <p style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '2px' }}>{q.desc}</p>
                  </div>

                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: isComplete ? '#34d399' : '#94a3b8' }}>
                    {q.current} / {q.target}
                  </span>
                </div>

                {/* Progress bar */}
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', margin: '8px 0', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${progressPct}%`,
                      height: '100%',
                      background: isComplete ? '#10b981' : '#f59e0b',
                      transition: 'width 0.3s'
                    }}
                  />
                </div>

                {/* Reward & Claim */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                  <div style={{ fontSize: '0.74rem', color: '#fbbf24', display: 'flex', gap: '8px' }}>
                    {Object.keys(q.reward).map((rk) => (
                      <span key={rk}>
                        {ITEMS[rk]?.icon || '🎁'} +{q.reward[rk]} {ITEMS[rk]?.name || rk}
                      </span>
                    ))}
                  </div>

                  {q.claimed ? (
                    <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <CheckCircle size={14} /> Claimed
                    </span>
                  ) : isComplete ? (
                    <button
                      className="btn-magical"
                      style={{ padding: '6px 14px', fontSize: '0.75rem' }}
                      onClick={() => handleClaim(q)}
                    >
                      <Gift size={14} /> Claim
                    </button>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>In Progress</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
