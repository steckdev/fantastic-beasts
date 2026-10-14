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
import { bondService } from '../services/bondService';
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
      if (sortBy === 'bond') {
        const bondWeightA = (a.bondLevel || 1) * 1000 + (a.bondXP || 0);
        const bondWeightB = (b.bondLevel || 1) * 1000 + (b.bondXP || 0);
        return bondWeightB - bondWeightA;
      }
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

    setAnimationClass('interactive-beast-bounce creature-growth-pop');
    setTimeout(() => setAnimationClass(''), 750);
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

  // Current Beast Bond and Growth metrics
  const bondLvl = currentBeastObj?.bondLevel || 1;
  const tierInfo = bondService.getTierInfo(bondLvl);
  const targetXP = bondService.getTargetXP(bondLvl);
  const currentXP = currentBeastObj?.bondXP || 0;
  const isMaxLevel = bondLvl >= 10;
  const progressPercent = isMaxLevel ? 100 : Math.min(100, Math.round((currentXP / targetXP) * 100));
  const creatureScale = bondService.getCreatureScale(bondLvl, currentBeastObj?.cp);

  return (
    <div className="suitcase-view-frame">
      {/* Top Header */}
      <div
        style={{
          padding: 'calc(var(--safe-top) + 8px) 14px 10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-gold)',
          background: 'rgba(11, 15, 25, 0.92)',
          backdropFilter: 'blur(14px)',
          zIndex: 20
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {activeBeast ? (
            <button className="btn-icon" style={{ width: '34px', height: '34px' }} onClick={() => setActiveBeast(null)}>
              <ArrowLeft size={17} />
            </button>
          ) : (
            <img src="/items/briefcase_closed.png" alt="Suitcase" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
          )}
          <div>
            <h1 className="font-cinzel title-glow" style={{ fontSize: '1.05rem', color: '#fef08a', fontWeight: 800, lineHeight: 1.2 }}>
              {activeBeast ? 'Beast Sanctuary' : "Newt's Sanctuary"}
            </h1>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
              {activeBeast ? activeBeast.beast.species : `${totalBeasts} Protected Creatures`}
            </div>
          </div>
        </div>

        <button
          className="btn-secondary"
          style={{ padding: '5px 12px', fontSize: '0.74rem', borderRadius: 'var(--radius-full)' }}
          onClick={onClose}
        >
          Exit
        </button>
      </div>

      {/* Main Sanctuary Body */}
      {!activeBeast ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Quick Stats Ribbon (Compact Single Line) */}
          <div
            style={{
              padding: '6px 12px 4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '6px',
              fontSize: '0.68rem',
              color: '#cbd5e1',
              borderBottom: '1px solid rgba(255,255,255,0.06)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#fef08a', fontWeight: 700 }}>🧳 {totalBeasts} Beasts</span>
              <span style={{ color: '#64748b' }}>•</span>
              <span style={{ color: '#38bdf8', fontWeight: 700 }}>🎖️ {uniqueSpeciesCount} Species</span>
              {highestCP > 0 && (
                <>
                  <span style={{ color: '#64748b' }}>•</span>
                  <span style={{ color: '#fbbf24', fontWeight: 700 }}>👑 Top CP {highestCP}</span>
                </>
              )}
            </div>

            {markedBeastsCount > 0 && (
              <span style={{ color: '#c084fc', fontWeight: 700 }}>
                ✨ {markedBeastsCount} Marks
              </span>
            )}
          </div>

          {/* Search & Sort Row */}
          <div
            style={{
              padding: '6px 12px 4px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {/* Instant Search Bar */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(15, 23, 42, 0.75)',
                border: '1px solid rgba(251, 191, 36, 0.25)',
                borderRadius: 'var(--radius-full)',
                padding: '4px 10px',
                height: '32px'
              }}
            >
              <Search size={13} color="#fbbf24" />
              <input
                type="text"
                placeholder="Search beasts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#f8fafc',
                  fontSize: '0.72rem',
                  width: '100%'
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.72rem' }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Compact Sort Buttons */}
            <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
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
                    background: sortBy === s.id ? 'rgba(251, 191, 36, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                    border: sortBy === s.id ? '1px solid #fbbf24' : '1px solid rgba(255, 255, 255, 0.08)',
                    color: sortBy === s.id ? '#fef08a' : '#94a3b8',
                    padding: '3px 7px',
                    borderRadius: '6px',
                    fontSize: '0.68rem',
                    fontWeight: sortBy === s.id ? 700 : 500,
                    cursor: 'pointer'
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Habitat Filter Pills (Swipeable Row) */}
          <div
            style={{
              padding: '4px 12px 6px',
              display: 'flex',
              gap: '6px',
              overflowX: 'auto',
              whiteSpace: 'nowrap',
              WebkitOverflowScrolling: 'touch'
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
                style={{ padding: '4px 10px', fontSize: '0.70rem', borderRadius: 'var(--radius-full)' }}
              >
                {hab}
              </button>
            ))}
          </div>

          {/* Mobile-First 3-Column Collection Grid */}
          <div
            className="sanctuary-grid-container"
            style={{ flex: 1, overflowY: 'auto' }}
          >
            {filteredAndSortedBeasts.length === 0 ? (
              <div
                style={{
                  gridColumn: '1 / -1',
                  textAlign: 'center',
                  padding: '40px 16px',
                  color: '#94a3b8'
                }}
              >
                <div style={{ fontSize: '36px', marginBottom: '8px' }}>🧳</div>
                <div className="font-cinzel" style={{ fontSize: '1rem', color: '#fbbf24', fontWeight: 700 }}>
                  {searchQuery ? `No Beasts matching "${searchQuery}"` : 'No Beasts in this Habitat'}
                </div>
                <div style={{ fontSize: '0.76rem', marginTop: '4px' }}>
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
                const cardScale = bondService.getCreatureScale(b.bondLevel || 1, b.cp);

                return (
                  <div
                    key={b.instanceId}
                    onClick={() => handleSelectBeast(b)}
                    className="sanctuary-beast-card"
                    style={{
                      border: isBuddy
                        ? '1.5px solid #38bdf8'
                        : hasMark
                        ? `1.5px solid ${b.mark?.color}`
                        : isFav
                        ? '1.5px solid #fbbf24'
                        : '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: isBuddy
                        ? '0 0 12px rgba(56, 189, 248, 0.4)'
                        : hasMark
                        ? `0 0 10px ${b.mark?.glow}`
                        : isFav
                        ? '0 0 8px rgba(251, 191, 36, 0.25)'
                        : 'none'
                    }}
                  >
                    {/* Top Row: CP & Status Icons */}
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.70rem', fontWeight: 800, color: '#38bdf8' }}>
                        CP {b.cp}
                      </span>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        {isBuddy && (
                          <span style={{ fontSize: '0.62rem', color: '#38bdf8', fontWeight: 800 }} title="Active Buddy">
                            <Footprints size={11} />
                          </span>
                        )}
                        {hasMark && (
                          <span style={{ fontSize: '0.68rem', color: b.mark?.color }} title={b.mark?.title}>
                            {b.mark?.icon}
                          </span>
                        )}
                        {isFav && (
                          <Star size={11} fill="#fbbf24" color="#fbbf24" />
                        )}
                      </div>
                    </div>

                    {/* Beast Sprite (Scaled to Growth Level) */}
                    <div
                      style={{
                        position: 'relative',
                        width: '56px',
                        height: '56px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <img
                        src={beastData.sprite}
                        alt={beastData.name}
                        style={{
                          width: '52px',
                          height: '52px',
                          objectFit: 'contain',
                          transform: `scale(${cardScale})`,
                          transition: 'transform 0.2s ease',
                          filter: hasMark ? `drop-shadow(0 0 6px ${b.mark?.color})` : 'none'
                        }}
                      />
                    </div>

                    {/* Bottom Row: Name & Bond Level */}
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                      <span
                        className="font-cinzel"
                        style={{
                          fontSize: '0.70rem',
                          fontWeight: 700,
                          color: '#fef08a',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '75%'
                        }}
                      >
                        {b.nickname || beastData.name}
                      </span>

                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#ec4899', display: 'flex', alignItems: 'center', gap: '1px' }}>
                        <Heart size={10} fill="#ec4899" /> {b.bondLevel || 1}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* Beast Care & Growth Room (Mobile-First Thumb Friendly Suite) */
        <div
          style={{
            flex: 1,
            width: '100%',
            maxWidth: '860px',
            margin: '0 auto',
            padding: '12px 14px 90px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          {/* Top Identity & Threat Tier Card */}
          <div className="glass-card" style={{ padding: '12px', textAlign: 'center', position: 'relative' }}>
            {isEditingName ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  maxLength={18}
                  style={{
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid var(--gold-bright)',
                    color: '#fef08a',
                    padding: '5px 10px',
                    borderRadius: '8px',
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1rem',
                    textAlign: 'center'
                  }}
                />
                <button className="btn-icon" style={{ width: '32px', height: '32px' }} onClick={handleSaveName}>
                  <Check size={14} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <h2 className="font-cinzel title-glow" style={{ fontSize: '1.25rem', color: '#fef08a', fontWeight: 800 }}>
                  {currentBeastObj?.nickname || activeBeast.beast.name}
                </h2>
                <button onClick={() => setIsEditingName(true)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }} title="Rename">
                  <Edit2 size={14} />
                </button>
                {onToggleFavorite && currentBeastObj && (
                  <button
                    onClick={() => onToggleFavorite(currentBeastObj.instanceId)}
                    style={{ background: 'none', border: 'none', color: currentBeastObj.isFavorite ? '#fbbf24' : '#64748b', cursor: 'pointer', padding: '2px' }}
                    title={currentBeastObj.isFavorite ? 'Favorited' : 'Add to Favorites'}
                  >
                    <Star size={16} fill={currentBeastObj.isFavorite ? '#fbbf24' : 'none'} />
                  </button>
                )}
              </div>
            )}

            {/* Badges: Threat Tier & Growth Stage */}
            <div style={{ marginTop: '6px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              {(() => {
                const mom = getMoMClassification(activeBeast.beast.classification);
                return (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      background: mom.bgColor,
                      border: `1px solid ${mom.borderColor}`,
                      color: mom.color,
                      fontSize: '0.68rem',
                      fontWeight: 800
                    }}
                  >
                    {mom.badgeText}
                  </span>
                );
              })()}

              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  background: 'rgba(56, 189, 248, 0.15)',
                  border: '1px solid #38bdf8',
                  color: '#38bdf8',
                  fontSize: '0.68rem',
                  fontWeight: 700
                }}
              >
                {tierInfo.stage} • Stature {(creatureScale * 100).toFixed(0)}%
              </span>
            </div>

            {/* Mark Title if present */}
            {currentBeastObj?.mark && (
              <div
                className="mark-badge"
                style={{
                  marginTop: '6px',
                  borderColor: currentBeastObj.mark.color,
                  color: currentBeastObj.mark.color,
                  boxShadow: `0 0 10px ${currentBeastObj.mark.glow}`,
                  fontSize: '0.70rem'
                }}
              >
                <span>{currentBeastObj.mark.icon}</span>
                <span>Title: {currentBeastObj.mark.title}</span>
              </div>
            )}

            {/* REAL PROGRESSIVE BOND BAR (No more fixed 100 XP!) */}
            <div style={{ marginTop: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', marginBottom: '3px' }}>
                <span style={{ color: '#f43f5e', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Heart size={13} fill="#f43f5e" /> Bond Level {bondLvl} / 10 • {tierInfo.title}
                </span>
                <span style={{ color: '#fde047', fontWeight: 700 }}>
                  {isMaxLevel ? 'MAX BOND 👑' : `${currentXP} / ${targetXP} XP`}
                </span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${progressPercent}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #ec4899, #f43f5e)',
                    transition: 'width 0.4s ease'
                  }}
                />
              </div>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '4px' }}>
                ✨ {tierInfo.perk}
              </div>
            </div>
          </div>

          {/* Interactive Creature Stage with Visual Growth */}
          <div
            onClick={handlePet}
            className="glass-card"
            style={{
              position: 'relative',
              width: '100%',
              minHeight: '230px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              userSelect: 'none',
              padding: '14px',
              border: '1.5px solid var(--border-gold)',
              background: 'radial-gradient(circle at 50% 50%, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)',
              overflow: 'hidden'
            }}
          >
            {/* Dynamic Emote Bubble */}
            {emoteBubble && (
              <div
                style={{
                  position: 'absolute',
                  top: '10px',
                  background: 'rgba(15, 23, 42, 0.95)',
                  border: '1.5px solid #fbbf24',
                  borderRadius: '10px',
                  padding: '5px 12px',
                  fontSize: '0.72rem',
                  color: '#fef08a',
                  fontWeight: 600,
                  boxShadow: '0 4px 14px rgba(0,0,0,0.6)',
                  zIndex: 15,
                  maxWidth: '260px',
                  textAlign: 'center',
                  animation: 'slideDown 0.25s ease'
                }}
              >
                {emoteBubble}
              </div>
            )}

            {/* Floating Heart Particles */}
            {floatingHearts.map((fh) => (
              <div
                key={fh.id}
                style={{
                  position: 'absolute',
                  left: `${fh.x}px`,
                  top: `${fh.y}px`,
                  fontSize: '22px',
                  pointerEvents: 'none',
                  animation: 'beast-heart-float 1s forwards ease-out',
                  zIndex: 20
                }}
              >
                {fh.emoji}
              </div>
            ))}

            {/* Creature Sprite (Scales with Growth Level!) */}
            <div
              className={`animate-float ${animationClass}`}
              style={{
                position: 'relative',
                margin: '14px 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {bondLvl >= 10 && <div className="apex-aura-ring" />}
              <img
                src={activeBeast.beast.sprite}
                alt={activeBeast.beast.name}
                style={{
                  width: '180px',
                  height: '180px',
                  objectFit: 'contain',
                  transform: `scale(${creatureScale})`,
                  transition: 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.3s ease',
                  filter: activeBeast.beastObj.mark
                    ? `drop-shadow(0 0 16px ${activeBeast.beastObj.mark.color})`
                    : tierInfo.auraColor
                    ? `drop-shadow(0 0 14px ${tierInfo.auraColor})`
                    : 'drop-shadow(0 10px 20px rgba(0,0,0,0.6))'
                }}
              />
            </div>

            <div
              style={{
                background: 'rgba(15, 23, 42, 0.85)',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                borderRadius: 'var(--radius-full)',
                padding: '3px 12px',
                fontSize: '0.70rem',
                color: '#fde047',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Smile size={13} />
              <span>Tap or Stroke to Bond (+5 XP)</span>
            </div>
          </div>

          {/* Tactile Bonding Actions Bar */}
          <div style={{ display: 'flex', gap: '8px', width: '100%', justifyContent: 'center' }}>
            <button
              onClick={(e) => handlePet(e)}
              className="btn-secondary"
              style={{ flex: 1, padding: '8px 4px', fontSize: '0.74rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}
              title="Stroke and cuddle"
            >
              <Heart size={15} color="#ec4899" />
              <span>Pet (+5 XP)</span>
            </button>

            <button
              onClick={handleBrush}
              className="btn-secondary"
              style={{ flex: 1, padding: '8px 4px', fontSize: '0.74rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}
              title="Groom fur and feathers"
            >
              <Sparkles size={15} color="#fbbf24" />
              <span>Groom (+5 XP)</span>
            </button>

            <button
              onClick={handlePlayTrick}
              className="btn-secondary"
              style={{ flex: 1, padding: '8px 4px', fontSize: '0.74rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}
              title="Teach mini-trick"
            >
              <Wand2 size={15} color="#38bdf8" />
              <span>Trick (+5 XP)</span>
            </button>
          </div>

          {/* Treat Feeding Station */}
          <div className="glass-panel" style={{ padding: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span className="font-cinzel" style={{ fontSize: '0.82rem', color: '#fbbf24', fontWeight: 700 }}>
                Feed Treats (Favorite: {activeBeast.beast.favoriteTreat})
              </span>
              <Utensils size={15} color="#fbbf24" />
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
                      <span style={{ fontSize: '18px' }}>{it.icon}</span>
                      <span style={{ fontSize: '0.65rem', color: '#cbd5e1' }}>x{count}</span>
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Power Up CP & Walking Buddy Buttons */}
          <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
            {onPowerUpBeast && currentBeastObj && (
              <button
                className="btn-magical"
                onClick={() => onPowerUpBeast(currentBeastObj.instanceId)}
                disabled={(inventory.knuts || 0) < 45}
                style={{
                  flex: 1,
                  padding: '9px 10px',
                  fontSize: '0.76rem',
                  opacity: (inventory.knuts || 0) >= 45 ? 1 : 0.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Zap size={14} />
                <span>Power Up (+CP & Stature • 45🪙)</span>
              </button>
            )}

            <button
              className={isCurrentBuddy ? 'btn-magical' : 'btn-secondary'}
              onClick={() => onSetBuddy(activeBeast.beastObj.instanceId)}
              style={{
                flex: 1,
                padding: '9px 10px',
                fontSize: '0.76rem',
                borderRadius: 'var(--radius-full)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px'
              }}
            >
              <Footprints size={14} />
              <span>{isCurrentBuddy ? 'Active Buddy' : 'Set as Buddy'}</span>
            </button>
          </div>

          {/* Relocate to Ministry Sanctuary */}
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
              padding: '8px',
              fontSize: '0.74rem',
              color: isCurrentBuddy ? '#64748b' : '#f87171',
              borderColor: isCurrentBuddy ? 'rgba(255,255,255,0.08)' : 'rgba(239, 68, 68, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Trash2 size={13} />
            <span>Relocate to Ministry (+40 Knuts &amp; Treat)</span>
          </button>
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
