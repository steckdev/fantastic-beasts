import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Heart, Sparkles, Edit2, Check, ArrowLeft, Award, Utensils, Smile } from 'lucide-react';
import { BEASTS } from '../data/beastsData';
import { ITEMS } from '../data/itemsData';
import { sounds } from '../services/soundService';

export default function SuitcaseSanctuary({
  suitcase,
  inventory,
  hero,
  onFeedBeast,
  onPetBeast,
  onRenameBeast,
  onClose
}) {
  const [selectedHabitat, setSelectedHabitat] = useState('All');
  const [activeBeast, setActiveBeast] = useState(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  const [pettingFeedback, setPettingFeedback] = useState(false);

  const habitats = ['All', 'Sunlit Plains', 'Enchanted Forest', 'Mystic Marsh', 'Sky Heights', 'Ancient Ruins'];

  // Filter beasts by habitat
  const filteredBeasts = suitcase.filter((b) => {
    if (selectedHabitat === 'All') return true;
    const beastData = BEASTS.find((bd) => bd.id === b.beastId);
    return beastData && beastData.habitat === selectedHabitat;
  });

  const handleSelectBeast = (beastObj) => {
    setActiveBeast(beastObj);
    setIsEditingName(false);
    setTempName(beastObj.nickname || beastObj.beast?.name);
    sounds.playCreatureCry(beastObj.beast?.cryFreq || 440);
  };

  const handlePet = () => {
    if (!activeBeast) return;
    sounds.playPurr();
    setPettingFeedback(true);
    setTimeout(() => setPettingFeedback(false), 500);

    confetti({
      particleCount: 18,
      spread: 45,
      origin: { y: 0.4 },
      colors: ['#f43f5e', '#ec4899', '#fbbf24']
    });

    onPetBeast(activeBeast.instanceId);
  };

  const handleFeed = (treatKey) => {
    if (!activeBeast) return;
    const treat = ITEMS[treatKey];
    if (!treat || inventory[treatKey] <= 0) return;

    sounds.playPurr();
    sounds.playCreatureCry((activeBeast.beast?.cryFreq || 440) * 1.05);

    const isFavorite = activeBeast.beast?.favoriteTreat === treat.name;
    const multiplier = (isFavorite ? 1.8 : 1.0) * (hero.bonusTreatEffect || 1.0);
    const xpGain = Math.round(treat.bondXP * multiplier);

    confetti({
      particleCount: 25,
      spread: 60,
      origin: { y: 0.45 },
      colors: ['#34d399', '#fbbf24', '#f43f5e']
    });

    onFeedBeast(activeBeast.instanceId, treatKey, xpGain);
  };

  const handleSaveName = () => {
    if (!activeBeast || !tempName.trim()) return;
    onRenameBeast(activeBeast.instanceId, tempName.trim());
    setIsEditingName(false);
  };

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
            <span style={{ fontSize: '24px' }}>🧳</span>
          )}
          <div>
            <h1 className="font-cinzel title-glow" style={{ fontSize: '1.2rem', color: '#fef08a', fontWeight: 800 }}>
              {activeBeast ? 'Beast Care Sanctuary' : 'Newt\'s Suitcase Sanctuary'}
            </h1>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
              {activeBeast ? activeBeast.beast.species : `${suitcase.length} Fantastic Beasts Protected`}
            </div>
          </div>
        </div>

        <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={onClose}>
          Exit
        </button>
      </div>

      {/* Main Body */}
      {!activeBeast ? (
        /* Sanctuary Beast Grid View */
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Habitat Filter Pills */}
          <div
            style={{
              padding: '12px 16px',
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              whiteSpace: 'nowrap'
            }}
          >
            {habitats.map((hab) => (
              <button
                key={hab}
                onClick={() => setSelectedHabitat(hab)}
                className={selectedHabitat === hab ? 'btn-magical' : 'btn-secondary'}
                style={{
                  padding: '6px 14px',
                  fontSize: '0.78rem',
                  borderRadius: 'var(--radius-full)'
                }}
              >
                {hab}
              </button>
            ))}
          </div>

          {/* Beast Cards Grid */}
          <div
            style={{
              flex: 1,
              padding: '8px 16px 100px',
              overflowY: 'auto',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: '12px'
            }}
          >
            {filteredBeasts.length === 0 ? (
              <div
                style={{
                  gridColumn: '1 / -1',
                  textAlign: 'center',
                  padding: '60px 20px',
                  color: '#94a3b8'
                }}
              >
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🦉</div>
                <div className="font-cinzel" style={{ fontSize: '1.1rem', color: '#fde047', fontWeight: 700 }}>
                  No Beasts In This Habitat Yet
                </div>
                <p style={{ fontSize: '0.85rem', marginTop: '6px' }}>
                  Explore the map, trace disturbances in town, and capture beasts to build your collection!
                </p>
              </div>
            ) : (
              filteredBeasts.map((b) => {
                const beastData = BEASTS.find((bd) => bd.id === b.beastId) || b.beast;
                const hasMark = !!b.mark;
                return (
                  <div
                    key={b.instanceId}
                    onClick={() => handleSelectBeast({ ...b, beast: beastData })}
                    className="glass-card"
                    style={{
                      padding: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      cursor: 'pointer',
                      border: hasMark ? `1.5px solid ${b.mark.color}` : '1px solid var(--border-gold)',
                      boxShadow: hasMark ? `0 0 14px ${b.mark.glow}` : 'none'
                    }}
                  >
                    {/* Mark indicator top right */}
                    {hasMark && (
                      <div
                        style={{
                          alignSelf: 'flex-end',
                          fontSize: '0.72rem',
                          color: b.mark.color,
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2px'
                        }}
                      >
                        <span>{b.mark.icon}</span>
                        <span>{b.mark.rarity}</span>
                      </div>
                    )}

                    {/* Beast Sprite */}
                    <img
                      src={beastData.sprite}
                      alt={beastData.name}
                      style={{
                        width: '90px',
                        height: '90px',
                        objectFit: 'contain',
                        margin: '6px 0',
                        filter: hasMark ? `drop-shadow(0 0 10px ${b.mark.color})` : 'none'
                      }}
                    />

                    {/* Name & Title */}
                    <div
                      className="font-cinzel"
                      style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fef08a', textAlign: 'center' }}
                    >
                      {b.nickname || beastData.name}
                    </div>

                    {/* CP & Bond Level */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8' }}>CP {b.cp}</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ec4899', display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <Heart size={12} fill="#ec4899" /> {b.bondLevel || 1}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* Detailed Beast Care Room */
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px 100px',
            overflowY: 'auto'
          }}
        >
          {/* Beast Identity & Nickname */}
          <div style={{ textAlign: 'center', width: '100%' }}>
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
                <h2 className="font-cinzel title-glow" style={{ fontSize: '1.4rem', color: '#fef08a', fontWeight: 800 }}>
                  {activeBeast.nickname || activeBeast.beast.name}
                </h2>
                <button
                  onClick={() => setIsEditingName(true)}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                >
                  <Edit2 size={16} />
                </button>
              </div>
            )}

            {/* Mark Title if present */}
            {activeBeast.mark && (
              <div
                className="mark-badge"
                style={{
                  marginTop: '8px',
                  borderColor: activeBeast.mark.color,
                  color: activeBeast.mark.color,
                  boxShadow: `0 0 12px ${activeBeast.mark.glow}`
                }}
              >
                <span>{activeBeast.mark.icon}</span>
                <span>Title: {activeBeast.mark.title}</span>
              </div>
            )}

            {/* Bond Level Status Bar */}
            <div style={{ maxWidth: '300px', margin: '12px auto 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                <span style={{ color: '#f43f5e', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Heart size={14} fill="#f43f5e" /> Bond Level {activeBeast.bondLevel || 1} / 10
                </span>
                <span style={{ color: '#94a3b8' }}>{activeBeast.bondXP || 0} / 100 XP</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${Math.min(100, activeBeast.bondXP || 0)}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #ec4899, #f43f5e)',
                    transition: 'width 0.4s ease'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Central Interactive Sprite (Tap / stroke to Pet!) */}
          <div
            onClick={handlePet}
            style={{
              position: 'relative',
              width: '260px',
              height: '260px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              userSelect: 'none'
            }}
          >
            <div
              className="animate-float"
              style={{
                transform: pettingFeedback ? 'scale(1.12)' : 'scale(1)',
                transition: 'transform 0.15s ease'
              }}
            >
              <img
                src={activeBeast.beast.sprite}
                alt={activeBeast.beast.name}
                style={{
                  width: '220px',
                  height: '220px',
                  objectFit: 'contain',
                  filter: activeBeast.mark
                    ? `drop-shadow(0 0 16px ${activeBeast.mark.color})`
                    : 'drop-shadow(0 12px 24px rgba(0,0,0,0.6))'
                }}
              />
            </div>

            {/* Petting prompt */}
            <div
              style={{
                position: 'absolute',
                bottom: '0',
                background: 'rgba(15, 23, 42, 0.85)',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                borderRadius: 'var(--radius-full)',
                padding: '4px 12px',
                fontSize: '0.75rem',
                color: '#fde047',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Smile size={14} />
              <span>Tap or Stroke to Pet</span>
            </div>
          </div>

          {/* Treat Feeding Bar */}
          <div className="glass-panel" style={{ width: '100%', maxWidth: '380px', padding: '12px' }}>
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
        </div>
      )}
    </div>
  );
}
