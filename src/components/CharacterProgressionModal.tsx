import React, { useState } from 'react';
import { X, Award, Sparkles, Zap, Shield, Flame, Check, Lock, ChevronRight, Compass, Heart, Feather } from 'lucide-react';
import { Hero, CharacterProgression, GameStats } from '../types';
import { alchemistService, ALCHEMIST_RANKS, RankInfo } from '../services/alchemistService';
import { sounds } from '../services/soundService';

interface CharacterProgressionModalProps {
  hero: Hero;
  characterProgression: CharacterProgression;
  stats: GameStats;
  onClose: () => void;
}

export default function CharacterProgressionModal({
  hero,
  characterProgression,
  stats,
  onClose
}: CharacterProgressionModalProps) {
  const [activeTab, setActiveTab] = useState<'talents' | 'milestones'>('talents');

  const rank = characterProgression.alchemistRank || 1;
  const currentXP = characterProgression.alchemistXP || 0;
  const rankInfo = alchemistService.getRankInfo(rank);
  const targetXP = rankInfo.targetXP;
  const progressPercent = Math.min(100, Math.round((currentXP / targetXP) * 100));

  const milestones = [
    {
      id: 'm_potions',
      title: 'Master Potioneer',
      desc: 'Concoct potions in Newt\'s suitcase laboratory or table cauldrons',
      current: stats.potionsBrewed || 0,
      goals: [5, 20, 50, 100],
      icon: '🧪',
      color: '#10b981'
    },
    {
      id: 'm_masterwork',
      title: 'Celestial Precision',
      desc: 'Perfect timed essence drops for Masterwork double yield brews',
      current: stats.masterworkBrews || 0,
      goals: [3, 10, 25, 50],
      icon: '✨',
      color: '#fbbf24'
    },
    {
      id: 'm_harvest',
      title: 'Herbology Forager',
      desc: 'Harvest botanical flora & rare beast reagents from waypoints & companion walks',
      current: stats.ingredientsHarvested || 0,
      goals: [15, 50, 150, 300],
      icon: '🌿',
      color: '#34d399'
    },
    {
      id: 'm_tactical',
      title: 'Tactical Alchemist',
      desc: 'Deploy Focus, Thunderbrew, Maxima, Edurus, or Invisibility in wild encounters',
      current: stats.potionsUsed || 0,
      goals: [5, 20, 50, 100],
      icon: '⚡',
      color: '#a855f7'
    },
    {
      id: 'm_trades',
      title: 'Diagon Alley Patron',
      desc: 'Complete purchases and sell harvested flora at the Apothecary Shop',
      current: stats.shopTransactions || 0,
      goals: [3, 10, 25, 50],
      icon: '🛍️',
      color: '#f59e0b'
    },
    {
      id: 'm_marks',
      title: 'Ancient Mark Seeker',
      desc: 'Discover and shelter wild beasts bearing luminous Ancient Marks',
      current: stats.marksDiscovered || 0,
      goals: [1, 5, 15, 30],
      icon: '🌟',
      color: '#38bdf8'
    }
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(5, 7, 13, 0.88)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        padding: '12px'
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '24px',
          overflow: 'hidden',
          border: '1px solid rgba(251, 191, 36, 0.4)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 35px rgba(217, 119, 6, 0.25)',
          background: 'linear-gradient(180deg, #141724 0%, #0b0e17 100%)'
        }}
      >
        {/* Header Hero & Alchemist Profile Banner */}
        <div
          style={{
            position: 'relative',
            padding: '16px',
            background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.12) 0%, rgba(168, 85, 247, 0.12) 100%)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          {/* Top Row with Close */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.2rem' }}>📜</span>
              <h2
                style={{
                  margin: 0,
                  fontSize: '1.15rem',
                  fontWeight: 900,
                  fontFamily: 'var(--font-serif)',
                  color: '#fef08a',
                  letterSpacing: '0.03em'
                }}
              >
                Character Mastery & Talents
              </h2>
            </div>

            <button
              onClick={onClose}
              style={{
                background: 'rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#e2e8f0',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Hero Profile Card */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              background: 'rgba(0, 0, 0, 0.45)',
              padding: '12px 14px',
              borderRadius: '16px',
              border: '1px solid rgba(251, 191, 36, 0.25)'
            }}
          >
            {/* Hero Portrait */}
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '14px',
                background: 'radial-gradient(circle, #3b82f6 0%, #1e1b4b 100%)',
                border: '2px solid #fbbf24',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 0 16px rgba(251, 191, 36, 0.3)'
              }}
            >
              <img
                src={hero.sprite}
                alt={hero.name}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>

            {/* Hero Details */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.98rem', fontWeight: 800, color: '#f8fafc' }}>
                  {hero.name}
                </span>
                <span
                  style={{
                    fontSize: '0.66rem',
                    background: `${rankInfo.color}25`,
                    color: rankInfo.color,
                    border: `1px solid ${rankInfo.color}66`,
                    padding: '2px 8px',
                    borderRadius: '10px',
                    fontWeight: 800
                  }}
                >
                  Rank {rank}: {rankInfo.title}
                </span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
                {hero.title} · <span style={{ color: '#fbbf24' }}>{hero.perkName}</span>
              </div>

              {/* XP Bar */}
              <div style={{ marginTop: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#cbd5e1', marginBottom: '3px' }}>
                  <span>Alchemical Experience</span>
                  <span>
                    <strong style={{ color: '#fef08a' }}>{currentXP}</strong> / {targetXP} XP ({progressPercent}%)
                  </span>
                </div>
                <div
                  style={{
                    height: '7px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${progressPercent}%`,
                      background: 'linear-gradient(90deg, #f59e0b 0%, #10b981 100%)',
                      borderRadius: '4px',
                      transition: 'width 0.4s ease',
                      boxShadow: '0 0 8px rgba(245, 158, 11, 0.6)'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Switcher */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'rgba(15, 23, 42, 0.5)'
          }}
        >
          <button
            onClick={() => {
              sounds.playUiClick();
              setActiveTab('talents');
            }}
            style={{
              flex: 1,
              padding: '11px',
              background: activeTab === 'talents' ? 'rgba(251, 191, 36, 0.12)' : 'none',
              border: 'none',
              borderBottom: activeTab === 'talents' ? '2px solid #fbbf24' : '2px solid transparent',
              color: activeTab === 'talents' ? '#fef08a' : '#94a3b8',
              fontSize: '0.8rem',
              fontWeight: activeTab === 'talents' ? 800 : 600,
              cursor: 'pointer'
            }}
          >
            ⭐ Alchemist Talents ({rank} / 10 Ranks)
          </button>
          <button
            onClick={() => {
              sounds.playUiClick();
              setActiveTab('milestones');
            }}
            style={{
              flex: 1,
              padding: '11px',
              background: activeTab === 'milestones' ? 'rgba(251, 191, 36, 0.12)' : 'none',
              border: 'none',
              borderBottom: activeTab === 'milestones' ? '2px solid #fbbf24' : '2px solid transparent',
              color: activeTab === 'milestones' ? '#fef08a' : '#94a3b8',
              fontSize: '0.8rem',
              fontWeight: activeTab === 'milestones' ? 800 : 600,
              cursor: 'pointer'
            }}
          >
            🏆 Lifetime Milestones
          </button>
        </div>

        {/* Tab Body */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
        >
          {/* TAB 1: TALENTS TREE */}
          {activeTab === 'talents' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                Hogwarts Legacy talent perks unlocked as you brew potions, forage botanicals, and practice tactical alchemy:
              </div>

              {ALCHEMIST_RANKS.map((rk) => {
                const isUnlocked = rank >= rk.rank;
                const isCurrent = rank === rk.rank;

                return (
                  <div
                    key={rk.rank}
                    style={{
                      background: isUnlocked ? 'rgba(255, 255, 255, 0.035)' : 'rgba(255, 255, 255, 0.015)',
                      border: isCurrent
                        ? `1.5px solid #fbbf24`
                        : isUnlocked
                        ? `1px solid ${rk.color}55`
                        : '1px solid rgba(255, 255, 255, 0.07)',
                      borderRadius: '16px',
                      padding: '12px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      boxShadow: isCurrent ? '0 0 16px rgba(251, 191, 36, 0.25)' : 'none',
                      opacity: isUnlocked ? 1 : 0.65
                    }}
                  >
                    {/* Rank Badge Icon */}
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '12px',
                        background: isUnlocked
                          ? `radial-gradient(circle, ${rk.color}33 0%, rgba(0,0,0,0.6) 100%)`
                          : 'rgba(51, 65, 85, 0.3)',
                        border: isUnlocked ? `1px solid ${rk.color}` : '1px dashed #64748b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.3rem',
                        flexShrink: 0
                      }}
                    >
                      {rk.icon}
                    </div>

                    {/* Talent Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.84rem', fontWeight: 800, color: isUnlocked ? '#f8fafc' : '#94a3b8' }}>
                          Rank {rk.rank}: {rk.perk.name}
                        </span>
                        {isUnlocked && (
                          <span
                            style={{
                              fontSize: '0.62rem',
                              color: '#34d399',
                              background: 'rgba(16, 185, 129, 0.2)',
                              padding: '1px 6px',
                              borderRadius: '8px',
                              fontWeight: 800,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '2px'
                            }}
                          >
                            <Check size={10} /> Active
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: isUnlocked ? '#cbd5e1' : '#64748b', lineHeight: 1.3, marginTop: '2px' }}>
                        {rk.perk.desc}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div style={{ flexShrink: 0 }}>
                      {isUnlocked ? (
                        <div
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            background: 'rgba(16, 185, 129, 0.2)',
                            border: '1px solid #10b981',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#10b981'
                          }}
                        >
                          <Check size={16} />
                        </div>
                      ) : (
                        <div
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            background: 'rgba(51, 65, 85, 0.3)',
                            border: '1px solid #64748b',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#94a3b8'
                          }}
                        >
                          <Lock size={14} />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: LIFETIME MILESTONES */}
          {activeTab === 'milestones' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                Track your lifetime wizarding achievements and magizoology accolades:
              </div>

              {milestones.map((m) => {
                // Find next target
                const nextGoal = m.goals.find((g) => g > m.current) || m.goals[m.goals.length - 1];
                const achievedCount = m.goals.filter((g) => m.current >= g).length;
                const pct = Math.min(100, Math.round((m.current / nextGoal) * 100));

                return (
                  <div
                    key={m.id}
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '16px',
                      padding: '12px 14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.3rem' }}>{m.icon}</span>
                        <div>
                          <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#f8fafc' }}>
                            {m.title}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                            {m.desc}
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#fef08a' }}>
                          {m.current}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: '#64748b' }}> / {nextGoal}</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div
                      style={{
                        height: '6px',
                        background: 'rgba(255, 255, 255, 0.08)',
                        borderRadius: '3px',
                        overflow: 'hidden'
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${pct}%`,
                          background: `linear-gradient(90deg, ${m.color} 0%, #fbbf24 100%)`,
                          borderRadius: '3px'
                        }}
                      />
                    </div>

                    {/* Milestone tier stars */}
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {m.goals.map((g, idx) => {
                        const isDone = m.current >= g;
                        return (
                          <div
                            key={idx}
                            style={{
                              flex: 1,
                              padding: '4px',
                              borderRadius: '6px',
                              background: isDone ? `${m.color}22` : 'rgba(255, 255, 255, 0.04)',
                              border: isDone ? `1px solid ${m.color}66` : '1px solid rgba(255, 255, 255, 0.05)',
                              textAlign: 'center',
                              fontSize: '0.64rem',
                              fontWeight: 700,
                              color: isDone ? m.color : '#64748b'
                            }}
                          >
                            Tier {idx + 1} ({g})
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
