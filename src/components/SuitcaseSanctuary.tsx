import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Heart,
  Edit2,
  Check,
  ArrowLeft,
  Utensils,
  Smile,
  Star,
  Footprints,
  Sparkles,
  Wand2,
  Zap,
  Trash2,
  ArrowUpDown,
  Search,
  Award,
  Crown
} from 'lucide-react';
import { BEASTS } from '../data/beastsData';
import { ITEMS } from '../data/itemsData';
import { getMoMClassification } from '../data/ministryClassification';
import { sounds } from '../services/soundService';
import { haptics } from '../services/hapticsService';
import { CapturedBeast, Hero, Beast } from '../types';

interface FloatingHeart {
  id: number;
  x: number;
  y: number;
  emoji: string;
}

interface SuitcaseSanctuaryProps {
  suitcase: CapturedBeast[];
  inventory: Record<string, number>;
  hero: Hero;
  buddyInstanceId: string | null;
  onSetBuddy: (instanceId: string) => void;
  onFeedBeast: (instanceId: string, treatKey: string, xpGain: number) => void;
  onPetBeast: (instanceId: string) => void;
  onRenameBeast: (instanceId: string, newName: string) => void;
  onPowerUpBeast?: (instanceId: string) => void;
  onRelocateBeast?: (instanceId: string) => void;
  onToggleFavorite?: (instanceId: string) => void;
  onClose: () => void;
  onShowToast?: (title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' | 'energy' | 'mark') => void;
}

export default function SuitcaseSanctuary({
  suitcase,
  inventory,
  hero,
  buddyInstanceId,
  onSetBuddy,
  onFeedBeast,
  onPetBeast,
  onRenameBeast,
  onPowerUpBeast,
  onRelocateBeast,
  onToggleFavorite,
  onClose,
  onShowToast
}: SuitcaseSanctuaryProps) {
  const [selectedHabitat, setSelectedHabitat] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'cp' | 'bond' | 'recent' | 'marks'>('cp');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeBeast, setActiveBeast] = useState<{ beastObj: CapturedBeast; beast: Beast } | null>(null);
  const [showRelocateConfirm, setShowRelocateConfirm] = useState<boolean>(false);
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [tempName, setTempName] = useState<string>('');
  const [animationClass, setAnimationClass] = useState<string>('');
  const [emoteBubble, setEmoteBubble] = useState<string | null>(null);
  const [floatingHearts, setFloatingHearts] = useState<FloatingHeart[]>([]);

  const habitats = ['All', 'Sunlit Plains', 'Enchanted Forest', 'Mystic Marsh', 'Sky Heights', 'Ancient Ruins'];

  const currentBeastObj = activeBeast
    ? suitcase.find((b) => b.instanceId === activeBeast.beastObj.instanceId) || activeBeast.beastObj
    : null;

  // Sanctuary statistics overview
  const totalBeasts = suitcase.length;
  const uniqueSpeciesCount = new Set(suitcase.map((b) => b.beastId)).size;
  const highestCP = suitcase.length > 0 ? Math.max(...suitcase.map((b) => b.cp)) : 0;
  const markedBeastsCount = suitcase.filter((b) => !!b.mark).length;

  const filteredAndSortedBeasts = [...suitcase]
    .filter((b) => {
      const beastData = BEASTS.find((bd) => bd.id === b.beastId);
      if (selectedHabitat !== 'All' && beastData?.habitat !== selectedHabitat) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const nickname = (b.nickname || '').toLowerCase();
        const name = (beastData?.name || '').toLowerCase();
        const species = (beastData?.species || '').toLowerCase();
        const markTitle = (b.mark?.title || '').toLowerCase();
        const markName = (b.mark?.name || '').toLowerCase();
        if (
          !nickname.includes(query) &&
          !name.includes(query) &&
          !species.includes(query) &&
          !markTitle.includes(query) &&
          !markName.includes(query)
        ) {
          return false;
        }
      }
      return true;
    })
    .sort((a, b) => {
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;

      if (sortBy === 'cp') return b.cp - a.cp;
      if (sortBy === 'bond') return (b.bondLevel * 100 + b.bondXP) - (a.bondLevel * 100 + a.bondXP);
      if (sortBy === 'recent') return b.capturedAt - a.capturedAt;
      if (sortBy === 'marks') {
        if (a.mark && !b.mark) return -1;
        if (!a.mark && b.mark) return 1;
        return b.cp - a.cp;
      }
      return b.cp - a.cp;
    });

  const handleSelectBeast = (beastObj: CapturedBeast) => {
    const beastData = BEASTS.find((bd) => bd.id === beastObj.beastId) || BEASTS[0];
    setActiveBeast({ beastObj, beast: beastData });
    setIsEditingName(false);
    setTempName(beastObj.nickname || beastData.name);
    setEmoteBubble(`"${beastData.name} greets you warmly!"`);
    sounds.playCreatureCry(beastData.cryFreq || 440);
    haptics.light();
  };

  const spawnFloatingHeart = (x?: number, y?: number) => {
    const posX = x ?? (90 + Math.random() * 80);
    const posY = y ?? (60 + Math.random() * 60);
    const emojis = ['💖', '✨', '🐾', '🌟', '💕', '🥰'];
    const newHeart: FloatingHeart = {
      id: Date.now() + Math.random(),
      x: posX,
      y: posY,
      emoji: emojis[Math.floor(Math.random() * emojis.length)]
    };
    setFloatingHearts((prev) => [...prev.slice(-6), newHeart]);

    setTimeout(() => {
      setFloatingHearts((prev) => prev.filter((h) => h.id !== newHeart.id));
    }, 1100);
  };

  const handlePet = (e?: React.MouseEvent) => {
    if (!activeBeast) return;
    sounds.playPurr();
    haptics.medium();
    setAnimationClass('interactive-beast-bounce');
    setTimeout(() => setAnimationClass(''), 550);

    let clickX = 130;
    let clickY = 100;
    if (e) {
      const rect = e.currentTarget.getBoundingClientRect();
      clickX = e.clientX - rect.left;
      clickY = e.clientY - rect.top;
    }
    spawnFloatingHeart(clickX, clickY);

    const emotes = [
      `Purrs contently and nuzzles your fingers!`,
      `Wiggles with joy! Affection +5`,
      `Leans into your gentle petting!`,
      `Beams with magical trust and happiness!`
    ];
    setEmoteBubble(emotes[Math.floor(Math.random() * emotes.length)]);

    confetti({
      particleCount: 16,
      spread: 45,
      origin: { y: 0.45 },
      colors: ['#f43f5e', '#ec4899', '#fbbf24']
    });

    onPetBeast(activeBeast.beastObj.instanceId);
  };

  const handleBrush = () => {
    if (!activeBeast) return;
    sounds.playPlayfulBounce();
    haptics.light();
    setAnimationClass('interactive-beast-wiggle');
    setTimeout(() => setAnimationClass(''), 600);

    spawnFloatingHeart(120, 90);
    spawnFloatingHeart(140, 110);
    setEmoteBubble(`Groomed! Feathers & fur shine with golden luster!`);

    confetti({
      particleCount: 22,
      spread: 55,
      origin: { y: 0.45 },
      colors: ['#fbbf24', '#fde047', '#38bdf8']
    });

    onPetBeast(activeBeast.beastObj.instanceId);
    if (onShowToast) {
      onShowToast('Bond Strengthened!', `Groomed ${activeBeast.beast.name} (+5 Bond XP)`, 'success');
    }
  };

  const handlePlayTrick = () => {
    if (!activeBeast) return;
    sounds.playWandCast('masterful');
    sounds.playCreatureCry((activeBeast.beast.cryFreq || 440) * 1.15);
    haptics.medium();
    setAnimationClass('interactive-beast-bounce');
    setTimeout(() => setAnimationClass(''), 650);

    spawnFloatingHeart(130, 80);
    spawnFloatingHeart(110, 120);
    setEmoteBubble(`Magnificent trick! ${activeBeast.beast.name} does a joyful aerial spin!`);

    confetti({
      particleCount: 28,
      spread: 70,
      origin: { y: 0.45 },
      colors: ['#c084fc', '#38bdf8', '#34d399', '#fde047']
    });

    onPetBeast(activeBeast.beastObj.instanceId);
  };

  const handleFeed = (treatKey: string) => {
    if (!activeBeast) return;
    const treat = ITEMS[treatKey];
    if (!treat || (inventory[treatKey] || 0) <= 0) return;

    sounds.playPurr();
    sounds.playCreatureCry((activeBeast.beast.cryFreq || 440) * 1.05);
    haptics.medium();

    const isFavorite = activeBeast.beast.favoriteTreat === treat.name;
    const multiplier = (isFavorite ? 1.8 : 1.0) * (hero.bonusTreatEffect || 1.0);
    const xpGain = Math.round((treat.bondXP || 30) * multiplier);

    setAnimationClass('interactive-beast-bounce');
    setTimeout(() => setAnimationClass(''), 550);
    spawnFloatingHeart(130, 90);

    setEmoteBubble(
      isFavorite
        ? `Adored their favorite treat (${treat.name})! HUGE +${xpGain} Bond XP!`
        : `Munched happily on ${treat.name}! +${xpGain} Bond XP`
    );

    confetti({
      particleCount: 30,
      spread: 60,
      origin: { y: 0.45 },
      colors: ['#34d399', '#fbbf24', '#f43f5e']
    });

    onFeedBeast(activeBeast.beastObj.instanceId, treatKey, xpGain);
    if (onShowToast) {
      onShowToast(
        isFavorite ? 'Favorite Treat Fed!' : 'Treat Enjoyed!',
        `Gained +${xpGain} Bond XP with ${activeBeast.beast.name}`,
        'success'
      );
    }
  };

  const handleSaveName = () => {
    if (!activeBeast || !tempName.trim()) return;
    onRenameBeast(activeBeast.beastObj.instanceId, tempName.trim());
    setIsEditingName(false);
    haptics.light();
  };

  const isCurrentBuddy = activeBeast && buddyInstanceId === activeBeast.beastObj.instanceId;

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'radial-gradient(circle at 50% 20%, #172554 0%, #090d16 100%)',
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
          {activeBeast ? (
            <button className="btn-icon" style={{ width: '36px', height: '36px' }} onClick={() => setActiveBeast(null)}>
              <ArrowLeft size={18} />
            </button>
          ) : (
            <img src="/items/briefcase_closed.png" alt="Suitcase" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
          )}
          <div>
            <h1 className="font-cinzel title-glow" style={{ fontSize: '1.2rem', color: '#fef08a', fontWeight: 800 }}>
              {activeBeast ? 'Beast Care Sanctuary' : "Newt's Suitcase Sanctuary"}
            </h1>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
              {activeBeast ? activeBeast.beast.species : `${totalBeasts} Fantastic Beasts Protected`}
            </div>
          </div>
        </div>

        <button className="btn-secondary" style={{ padding: '6px 14px', fontSize: '0.8rem' }} onClick={onClose}>
          Exit
        </button>
      </div>

      {/* Main Body */}
      {!activeBeast ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Desktop & Mobile Sanctuary Summary Stats Bar */}
          <div
            style={{
              width: '100%',
              maxWidth: '1280px',
              margin: '0 auto',
              padding: '8px 16px 4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              flexWrap: 'wrap'
            }}
          >
            {/* Quick Sanctuary Badges */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', fontSize: '0.74rem' }}>
              <div
                className="glass-card"
                style={{
                  padding: '4px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  color: '#fef08a',
                  fontWeight: 700
                }}
              >
                <span>🧳</span>
                <span>{totalBeasts} Protected</span>
              </div>

              <div
                className="glass-card"
                style={{
                  padding: '4px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  color: '#38bdf8',
                  fontWeight: 700
                }}
              >
                <Award size={13} />
                <span>{uniqueSpeciesCount} Species</span>
              </div>

              {highestCP > 0 && (
                <div
                  className="glass-card"
                  style={{
                    padding: '4px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    color: '#fbbf24',
                    fontWeight: 700
                  }}
                >
                  <Crown size={13} />
                  <span>Top CP {highestCP}</span>
                </div>
              )}

              {markedBeastsCount > 0 && (
                <div
                  className="glass-card"
                  style={{
                    padding: '4px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    color: '#a855f7',
                    fontWeight: 700
                  }}
                >
                  <Sparkles size={13} />
                  <span>{markedBeastsCount} Ancient Marks</span>
                </div>
              )}
            </div>

            {/* Quick Search Input */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(15, 23, 42, 0.75)',
                border: '1px solid rgba(251, 191, 36, 0.25)',
                borderRadius: 'var(--radius-full)',
                padding: '4px 10px',
                minWidth: '200px'
              }}
            >
              <Search size={14} color="#fbbf24" />
              <input
                type="text"
                placeholder="Search beasts or marks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#f8fafc',
                  fontSize: '0.74rem',
                  width: '100%'
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.75rem' }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Habitat Filter Pills */}
          <div
            style={{
              width: '100%',
              maxWidth: '1280px',
              margin: '0 auto',
              padding: '6px 16px 4px',
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              whiteSpace: 'nowrap'
            }}
          >
            {habitats.map((hab) => (
              <button
                key={hab}
                onClick={() => {
                  setSelectedHabitat(hab);
                  haptics.light();
                }}
                className={selectedHabitat === hab ? 'btn-magical' : 'btn-secondary'}
                style={{ padding: '5px 12px', fontSize: '0.74rem', borderRadius: 'var(--radius-full)' }}
              >
                {hab}
              </button>
            ))}
          </div>

          {/* Sort Selector Bar */}
          <div
            style={{
              width: '100%',
              maxWidth: '1280px',
              margin: '0 auto',
              padding: '4px 16px 10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.74rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#94a3b8' }}>
              <ArrowUpDown size={14} color="#fbbf24" />
              <span>Sort:</span>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {(
                [
                  { id: 'cp', label: 'CP' },
                  { id: 'bond', label: 'Bond' },
                  { id: 'recent', label: 'Recent' },
                  { id: 'marks', label: 'Marks' }
                ] as const
              ).map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setSortBy(s.id);
                    haptics.light();
                  }}
                  style={{
                    background: sortBy === s.id ? 'rgba(251, 191, 36, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    border: sortBy === s.id ? '1px solid #fbbf24' : '1px solid rgba(255, 255, 255, 0.1)',
                    color: sortBy === s.id ? '#fef08a' : '#94a3b8',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    fontWeight: sortBy === s.id ? 700 : 500,
                    cursor: 'pointer'
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Beasts Collection Grid (Desktop Fixed: alignContent: 'start', gridAutoRows: 'max-content') */}
          <div
            style={{
              flex: 1,
              width: '100%',
              maxWidth: '1280px',
              margin: '0 auto',
              padding: '8px 16px 90px',
              overflowY: 'auto',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gridAutoRows: 'max-content',
              alignContent: 'start',
              alignItems: 'start',
              gap: '14px'
            }}
          >
            {filteredAndSortedBeasts.length === 0 ? (
              <div
                style={{
                  gridColumn: '1 / -1',
                  textAlign: 'center',
                  padding: '60px 20px',
                  color: '#94a3b8'
                }}
              >
                <div style={{ fontSize: '42px', marginBottom: '12px' }}>🧳</div>
                <div className="font-cinzel" style={{ fontSize: '1.1rem', color: '#fbbf24', fontWeight: 700 }}>
                  {searchQuery ? `No Beasts matching "${searchQuery}"` : 'No Beasts in this Habitat'}
                </div>
                <div style={{ fontSize: '0.82rem', marginTop: '6px' }}>
                  {searchQuery
                    ? 'Try clearing the search query or selecting "All" habitats.'
                    : 'Cast charms in the wild map to rescue creatures into your suitcase!'}
                </div>
              </div>
            ) : (
              filteredAndSortedBeasts.map((b) => {
                const beastData = BEASTS.find((bd) => bd.id === b.beastId) || BEASTS[0];
                const isBuddy = buddyInstanceId === b.instanceId;
                const hasMark = !!b.mark;
                const isFav = !!b.isFavorite;

                return (
                  <div
                    key={b.instanceId}
                    onClick={() => handleSelectBeast(b)}
                    className="glass-card sanctuary-beast-card"
                    style={{
                      position: 'relative',
                      padding: '12px 10px',
                      cursor: 'pointer',
                      border: isBuddy
                        ? '2px solid #38bdf8'
                        : hasMark
                        ? `1.5px solid ${b.mark?.color}`
                        : isFav
                        ? '1.5px solid #fbbf24'
                        : '1px solid var(--border-gold)',
                      boxShadow: isBuddy
                        ? '0 0 16px rgba(56, 189, 248, 0.5)'
                        : hasMark
                        ? `0 0 14px ${b.mark?.glow}`
                        : isFav
                        ? '0 0 10px rgba(251, 191, 36, 0.3)'
                        : 'none',
                      background: 'rgba(15, 23, 42, 0.78)'
                    }}
                  >
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {isBuddy ? (
                        <span style={{ fontSize: '0.68rem', color: '#38bdf8', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '2px' }}>
                          <Footprints size={12} /> BUDDY
                        </span>
                      ) : <span />}

                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {hasMark && (
                          <div style={{ fontSize: '0.72rem', color: b.mark?.color, fontWeight: 800 }} title={b.mark?.title}>
                            <span>{b.mark?.icon}</span>
                          </div>
                        )}
                        {onToggleFavorite && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleFavorite(b.instanceId);
                              haptics.light();
                            }}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: isFav ? '#fbbf24' : '#64748b',
                              cursor: 'pointer',
                              padding: '1px'
                            }}
                            title={isFav ? 'Favorited' : 'Add to Favorites'}
                          >
                            <Star size={14} fill={isFav ? '#fbbf24' : 'none'} />
                          </button>
                        )}
                      </div>
                    </div>

                    <img
                      src={beastData.sprite}
                      alt={beastData.name}
                      style={{
                        width: '88px',
                        height: '88px',
                        objectFit: 'contain',
                        margin: '4px 0',
                        filter: hasMark ? `drop-shadow(0 0 10px ${b.mark?.color})` : 'none'
                      }}
                    />

                    <div style={{ width: '100%', textAlign: 'center' }}>
                      <div className="font-cinzel" style={{ fontSize: '0.86rem', fontWeight: 700, color: '#fef08a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {b.nickname || beastData.name}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '4px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8' }}>CP {b.cp}</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ec4899', display: 'flex', alignItems: 'center', gap: '2px' }}>
                          <Heart size={12} fill="#ec4899" /> {b.bondLevel || 1}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* Detailed Interactive Beast Care Room (Desktop 2-Column Responsive Layout) */
        <div
          style={{
            flex: 1,
            width: '100%',
            maxWidth: '1020px',
            margin: '0 auto',
            padding: '16px 20px 90px',
            overflowY: 'auto',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'flex-start',
            gap: '24px'
          }}
        >
          {/* Left Column: Interactive Beast Stage & Tactile Actions */}
          <div
            style={{
              flex: '1 1 360px',
              maxWidth: '460px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '14px'
            }}
          >
            {/* Interactive Sprite Stage */}
            <div
              onClick={handlePet}
              className="glass-card"
              style={{
                position: 'relative',
                width: '100%',
                minHeight: '290px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                userSelect: 'none',
                padding: '16px',
                border: '1.5px solid var(--border-gold)',
                background: 'radial-gradient(circle at 50% 50%, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)'
              }}
            >
              {/* Dynamic Emote Speech Bubble */}
              {emoteBubble && (
                <div
                  style={{
                    position: 'absolute',
                    top: '12px',
                    background: 'rgba(15, 23, 42, 0.95)',
                    border: '1.5px solid #fbbf24',
                    borderRadius: '12px',
                    padding: '6px 14px',
                    fontSize: '0.74rem',
                    color: '#fef08a',
                    fontWeight: 600,
                    boxShadow: '0 4px 14px rgba(0,0,0,0.6)',
                    zIndex: 15,
                    maxWidth: '280px',
                    textAlign: 'center',
                    animation: 'slideDown 0.25s ease'
                  }}
                >
                  {emoteBubble}
                </div>
              )}

              {/* Floating Heart / Sparkle Particles */}
              {floatingHearts.map((fh) => (
                <div
                  key={fh.id}
                  style={{
                    position: 'absolute',
                    left: `${fh.x}px`,
                    top: `${fh.y}px`,
                    fontSize: '24px',
                    pointerEvents: 'none',
                    animation: 'beast-heart-float 1s forwards ease-out',
                    zIndex: 20
                  }}
                >
                  {fh.emoji}
                </div>
              ))}

              <div className={`animate-float ${animationClass}`} style={{ margin: '18px 0' }}>
                <img
                  src={activeBeast.beast.sprite}
                  alt={activeBeast.beast.name}
                  style={{
                    width: '210px',
                    height: '210px',
                    objectFit: 'contain',
                    filter: activeBeast.beastObj.mark
                      ? `drop-shadow(0 0 18px ${activeBeast.beastObj.mark.color})`
                      : 'drop-shadow(0 12px 24px rgba(0,0,0,0.6))'
                  }}
                />
              </div>

              <div
                style={{
                  background: 'rgba(15, 23, 42, 0.85)',
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                  borderRadius: 'var(--radius-full)',
                  padding: '4px 14px',
                  fontSize: '0.74rem',
                  color: '#fde047',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Smile size={14} />
                <span>Tap or Stroke to Bond</span>
              </div>
            </div>

            {/* Tactile Bonding Actions Bar */}
            <div style={{ display: 'flex', gap: '8px', width: '100%', justifyContent: 'center' }}>
              <button
                onClick={(e) => handlePet(e)}
                className="btn-secondary"
                style={{ flex: 1, padding: '10px 4px', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}
                title="Stroke and cuddle"
              >
                <Heart size={16} color="#ec4899" />
                <span>Pet (+5 XP)</span>
              </button>

              <button
                onClick={handleBrush}
                className="btn-secondary"
                style={{ flex: 1, padding: '10px 4px', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}
                title="Groom fur and feathers"
              >
                <Sparkles size={16} color="#fbbf24" />
                <span>Groom (+5 XP)</span>
              </button>

              <button
                onClick={handlePlayTrick}
                className="btn-secondary"
                style={{ flex: 1, padding: '10px 4px', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}
                title="Teach mini-trick"
              >
                <Wand2 size={16} color="#38bdf8" />
                <span>Trick (+5 XP)</span>
              </button>
            </div>

            {/* Set as Walking Buddy button */}
            <button
              className={isCurrentBuddy ? 'btn-magical' : 'btn-secondary'}
              onClick={() => onSetBuddy(activeBeast.beastObj.instanceId)}
              style={{ width: '100%', padding: '9px 14px', fontSize: '0.78rem', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <Footprints size={15} />
              <span>{isCurrentBuddy ? 'Active Buddy Companion' : 'Set as Walking Buddy'}</span>
            </button>
          </div>

          {/* Right Column: Beast Identity, Bond Status, Treat Feeding & Care Controls */}
          <div
            style={{
              flex: '1 1 380px',
              maxWidth: '460px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            {/* Identity & Nickname Card */}
            <div className="glass-card" style={{ padding: '14px', textAlign: 'center' }}>
              {isEditingName ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    maxLength={18}
                    style={{
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid var(--gold-bright)',
                      color: '#fef08a',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontFamily: 'var(--font-serif)',
                      fontSize: '1.1rem',
                      textAlign: 'center'
                    }}
                  />
                  <button className="btn-icon" style={{ width: '36px', height: '36px' }} onClick={handleSaveName}>
                    <Check size={16} />
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <h2 className="font-cinzel title-glow" style={{ fontSize: '1.35rem', color: '#fef08a', fontWeight: 800 }}>
                    {currentBeastObj?.nickname || activeBeast.beast.name}
                  </h2>
                  <button onClick={() => setIsEditingName(true)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }} title="Rename">
                    <Edit2 size={16} />
                  </button>
                  {onToggleFavorite && currentBeastObj && (
                    <button
                      onClick={() => onToggleFavorite(currentBeastObj.instanceId)}
                      style={{ background: 'none', border: 'none', color: currentBeastObj.isFavorite ? '#fbbf24' : '#64748b', cursor: 'pointer', padding: '2px' }}
                      title={currentBeastObj.isFavorite ? 'Favorited' : 'Add to Favorites'}
                    >
                      <Star size={18} fill={currentBeastObj.isFavorite ? '#fbbf24' : 'none'} />
                    </button>
                  )}
                </div>
              )}

              {/* Threat Tier Badge */}
              <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'center' }}>
                {(() => {
                  const mom = getMoMClassification(activeBeast.beast.classification);
                  return (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '4px 12px',
                        borderRadius: '9999px',
                        background: mom.bgColor,
                        border: `1px solid ${mom.borderColor}`,
                        color: mom.color,
                        fontSize: '0.74rem',
                        fontWeight: 800,
                        letterSpacing: '0.4px',
                        boxShadow: `0 0 10px ${mom.bgColor}`
                      }}
                    >
                      <span>{mom.badgeText}</span>
                    </span>
                  );
                })()}
              </div>

              {/* Mark Title if present */}
              {currentBeastObj?.mark && (
                <div
                  className="mark-badge"
                  style={{
                    marginTop: '8px',
                    borderColor: currentBeastObj.mark.color,
                    color: currentBeastObj.mark.color,
                    boxShadow: `0 0 12px ${currentBeastObj.mark.glow}`,
                    animation: 'golden-shimmer 2s infinite ease-in-out'
                  }}
                >
                  <span>{currentBeastObj.mark.icon}</span>
                  <span>Title: {currentBeastObj.mark.title}</span>
                </div>
              )}

              {/* Bond Progression Bar */}
              <div style={{ marginTop: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                  <span style={{ color: '#f43f5e', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Heart size={14} fill="#f43f5e" /> Bond Level {currentBeastObj?.bondLevel || 1} / 10
                  </span>
                  <span style={{ color: '#94a3b8' }}>{currentBeastObj?.bondXP || 0} / 100 XP</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${Math.min(100, currentBeastObj?.bondXP || 0)}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #ec4899, #f43f5e)',
                      transition: 'width 0.4s ease'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Treat Feeding Station */}
            <div className="glass-panel" style={{ padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span className="font-cinzel" style={{ fontSize: '0.85rem', color: '#fbbf24', fontWeight: 700 }}>
                  Feed Treats (Favorite: {activeBeast.beast.favoriteTreat})
                </span>
                <Utensils size={16} color="#fbbf24" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
                {Object.keys(ITEMS)
                  .filter((k) => ITEMS[k].category === 'treat')
                  .map((key) => {
                    const it = ITEMS[key];
                    const count = inventory[key] || 0;
                    const isFav = activeBeast.beast.favoriteTreat === it.name;
                    return (
                      <button
                        key={key}
                        onClick={() => handleFeed(key)}
                        disabled={count <= 0}
                        className="glass-card"
                        style={{
                          padding: '6px 2px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '2px',
                          cursor: count > 0 ? 'pointer' : 'not-allowed',
                          opacity: count > 0 ? 1 : 0.4,
                          border: isFav ? '1.5px solid #fbbf24' : '1px solid rgba(255,255,255,0.1)'
                        }}
                        title={`${it.name} (x${count})`}
                      >
                        <span style={{ fontSize: '20px' }}>{it.icon}</span>
                        <span style={{ fontSize: '0.65rem', color: '#cbd5e1' }}>x{count}</span>
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Power Up CP Card */}
            <div
              className="glass-card"
              style={{
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                border: '1.5px solid rgba(56, 189, 248, 0.4)',
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.7) 100%)'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="font-cinzel" style={{ fontSize: '0.96rem', color: '#38bdf8', fontWeight: 800 }}>
                    CP {currentBeastObj?.cp}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                    ({inventory.knuts || 0} Knuts)
                  </span>
                </div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '2px' }}>
                  Infuse leylines to raise Creature Power
                </div>
              </div>

              {onPowerUpBeast && currentBeastObj && (
                <button
                  className="btn-magical"
                  onClick={() => onPowerUpBeast(currentBeastObj.instanceId)}
                  disabled={(inventory.knuts || 0) < 45}
                  style={{
                    padding: '7px 14px',
                    fontSize: '0.78rem',
                    opacity: (inventory.knuts || 0) >= 45 ? 1 : 0.5,
                    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                    borderColor: '#38bdf8',
                    boxShadow: (inventory.knuts || 0) >= 45 ? '0 0 14px rgba(56, 189, 248, 0.4)' : 'none'
                  }}
                >
                  <Zap size={14} />
                  <span>Power Up (45 🪙)</span>
                </button>
              )}
            </div>

            {/* Relocate to Ministry Sanctuary Button */}
            <button
              onClick={() => {
                if (isCurrentBuddy) {
                  if (onShowToast) onShowToast('Buddy Protected', 'Cannot relocate your active walking companion!', 'warning');
                  return;
                }
                setShowRelocateConfirm(true);
              }}
              className="btn-secondary"
              style={{
                width: '100%',
                padding: '9px',
                fontSize: '0.76rem',
                color: isCurrentBuddy ? '#64748b' : '#f87171',
                borderColor: isCurrentBuddy ? 'rgba(255,255,255,0.08)' : 'rgba(239, 68, 68, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <Trash2 size={14} />
              <span>Relocate to Ministry (+40 Knuts &amp; Treat)</span>
            </button>
          </div>
        </div>
      )}

      {/* Relocation Confirmation Modal */}
      {showRelocateConfirm && currentBeastObj && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div
            className="glass-panel"
            style={{
              width: '90%',
              maxWidth: '380px',
              padding: '22px 18px',
              textAlign: 'center',
              background: 'radial-gradient(circle, #1e1b4b 0%, #090d16 100%)',
              border: '2px solid #ef4444',
              boxShadow: '0 0 32px rgba(239, 68, 68, 0.3)'
            }}
          >
            <div style={{ fontSize: '42px', marginBottom: '8px' }}>🏛️</div>
            <h3 className="font-cinzel" style={{ fontSize: '1.2rem', color: '#fef08a', fontWeight: 800 }}>
              Relocate {currentBeastObj.nickname || activeBeast?.beast.name}?
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#cbd5e1', margin: '8px 0 14px', lineHeight: 1.45 }}>
              Transfer this creature to the MACUSA Creature Conservation Reserve. You will receive:
            </p>
            <div
              className="glass-card"
              style={{
                padding: '10px',
                display: 'flex',
                justifyContent: 'space-around',
                marginBottom: '18px',
                fontSize: '0.82rem',
                color: '#34d399',
                fontWeight: 700
              }}
            >
              <span>🪙 +40 Knuts</span>
              <span>🍬 +1 Treat</span>
              <span>⚡ +15 Energy</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="btn-secondary"
                onClick={() => setShowRelocateConfirm(false)}
                style={{ flex: 1, padding: '10px', fontSize: '0.84rem' }}
              >
                Keep Beast
              </button>
              <button
                className="btn-magical"
                onClick={() => {
                  setShowRelocateConfirm(false);
                  if (onRelocateBeast) onRelocateBeast(currentBeastObj.instanceId);
                  setActiveBeast(null);
                }}
                style={{
                  flex: 1,
                  padding: '10px',
                  fontSize: '0.84rem',
                  background: 'linear-gradient(135deg, #dc2626, #991b1b)',
                  borderColor: '#f87171'
                }}
              >
                Confirm Transfer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
