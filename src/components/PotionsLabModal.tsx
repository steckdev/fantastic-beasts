import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  FlaskConical,
  Flame,
  RotateCw,
  Sparkles,
  Check,
  Clock,
  Zap,
  Info,
  ChevronRight,
  Shield,
  Eye,
  Target
} from 'lucide-react';
import { POTION_RECIPES } from '../data/potionsData';
import { ITEMS } from '../data/itemsData';
import { sounds } from '../services/soundService';
import { haptics } from '../services/hapticsService';
import { PotionRecipe, CauldronSlot } from '../types';

interface PotionsLabModalProps {
  inventory: Record<string, number>;
  cauldrons?: CauldronSlot[];
  alchemistRank?: number;
  cauldronSlotsCount?: number;
  onConsumeItem: (itemKey: string, amount?: number) => void;
  onAddInventoryItem: (itemKey: string, amount: number) => void;
  onUpdateCauldrons: (cauldrons: CauldronSlot[]) => void;
  onBrewSuccess?: (isMasterwork: boolean) => void;
  onOpenShop?: () => void;
  onShowToast?: (
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' | 'energy' | 'mark'
  ) => void;
  onClose?: () => void;
}

export default function PotionsLabModal({
  inventory,
  cauldrons = [],
  alchemistRank = 1,
  cauldronSlotsCount = 2,
  onConsumeItem,
  onAddInventoryItem,
  onUpdateCauldrons,
  onBrewSuccess,
  onOpenShop,
  onShowToast,
  onClose
}: PotionsLabModalProps) {
  const [selectedRecipe, setSelectedRecipe] = useState<PotionRecipe>(POTION_RECIPES[0]);
  const [activeTab, setActiveTab] = useState<'station' | 'recipes' | 'ingredients'>('station');

  // Interactive Mini-game state
  const [isMiniGameActive, setIsMiniGameActive] = useState<boolean>(false);
  const [miniGamePhase, setMiniGamePhase] = useState<'stir' | 'heat' | 'infuse' | 'success'>('stir');
  const [stirProgress, setStirProgress] = useState<number>(0);
  const [lastStirAngle, setLastStirAngle] = useState<number | null>(null);
  const [heatLevel, setHeatLevel] = useState<number>(35); // 0 to 100, sweet spot: 55-80
  const [heatTimeInZone, setHeatTimeInZone] = useState<number>(0);
  const [infusionScale, setInfusionScale] = useState<number>(1.6);
  const [isMasterwork, setIsMasterwork] = useState<boolean>(false);

  const cauldronRef = useRef<HTMLDivElement | null>(null);

  // Dynamically initialize cauldron slots up to cauldronSlotsCount plus Hopping Pot
  const regularSlots: CauldronSlot[] = [];
  const maxSlots = Math.max(2, Math.min(4, cauldronSlotsCount));
  for (let i = 1; i <= maxSlots; i++) {
    const existing = cauldrons.find((c) => c.id === `cauldron_${i}`);
    regularSlots.push(
      existing || { id: `cauldron_${i}`, recipeId: null, startedAt: null, finishesAt: null, isReady: false }
    );
  }
  const hoppingPot = cauldrons.find((c) => c.isHoppingPot) || {
    id: 'cauldron_hopping',
    recipeId: 'potion_wiggenweld',
    startedAt: Date.now() - 35000,
    finishesAt: Date.now() - 5000,
    isHoppingPot: true,
    isReady: true
  };
  const currentCauldrons: CauldronSlot[] = [...regularSlots, hoppingPot];

  // Tick background simmering cauldrons
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      let changed = false;
      const updated = currentCauldrons.map((c) => {
        if (c.recipeId && c.finishesAt && now >= c.finishesAt && !c.isReady) {
          changed = true;
          return { ...c, isReady: true };
        }
        return c;
      });
      if (changed) {
        onUpdateCauldrons(updated);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [currentCauldrons, onUpdateCauldrons]);

  // Mini-game: Heat Decay Loop
  useEffect(() => {
    if (!isMiniGameActive || miniGamePhase !== 'heat') return;
    const interval = setInterval(() => {
      setHeatLevel((prev) => Math.max(10, prev - 2.5));
      // Sweet spot is between 50 and 80
      setHeatLevel((current) => {
        if (current >= 50 && current <= 82) {
          setHeatTimeInZone((t) => {
            const nextT = t + 0.1;
            if (nextT >= 3.0) {
              // Heat phase complete!
              sounds.playCauldronBubble();
              haptics.medium();
              setMiniGamePhase('infuse');
            }
            return nextT;
          });
        }
        return current;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [isMiniGameActive, miniGamePhase]);

  // Mini-game: Infusion ring contraction
  useEffect(() => {
    if (!isMiniGameActive || miniGamePhase !== 'infuse') return;
    const interval = setInterval(() => {
      setInfusionScale((prev) => {
        if (prev <= 0.4) return 1.6;
        return prev - 0.05;
      });
    }, 60);
    return () => clearInterval(interval);
  }, [isMiniGameActive, miniGamePhase]);

  // Check if player has required ingredients for selected recipe
  const hasIngredients = (recipe: PotionRecipe): boolean => {
    return recipe.ingredients.every((ing) => (inventory[ing.itemId] || 0) >= ing.quantity);
  };

  const handleStartSkillBrew = () => {
    if (!hasIngredients(selectedRecipe)) {
      if (onShowToast) {
        onShowToast(
          'Missing Ingredients',
          `Gather more ${selectedRecipe.ingredients.map((i) => ITEMS[i.itemId]?.name || i.itemId).join(' & ')} to brew!`,
          'warning'
        );
      }
      return;
    }

    // Deduct ingredients upfront
    selectedRecipe.ingredients.forEach((ing) => {
      onConsumeItem(ing.itemId, ing.quantity);
    });

    sounds.playCauldronBubble();
    haptics.light();
    setStirProgress(0);
    setLastStirAngle(null);
    setHeatLevel(35);
    setHeatTimeInZone(0);
    setIsMasterwork(false);
    setMiniGamePhase('stir');
    setIsMiniGameActive(true);
  };

  // Circular Stirring Handler
  const handleStirMove = (clientX: number, clientY: number) => {
    if (miniGamePhase !== 'stir' || !cauldronRef.current) return;
    const rect = cauldronRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    if (lastStirAngle !== null) {
      let delta = angle - lastStirAngle;
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;

      // Positive delta = clockwise stirring
      if (Math.abs(delta) > 5 && Math.abs(delta) < 70) {
        setStirProgress((prev) => {
          const next = Math.min(100, prev + Math.abs(delta) * 0.45);
          if (next >= 100) {
            sounds.playCauldronStir();
            haptics.medium();
            setMiniGamePhase('heat');
          } else if (Math.floor(next) % 25 === 0) {
            sounds.playCauldronBubble();
          }
          return next;
        });
      }
    }
    setLastStirAngle(angle);
  };

  const handlePumpBellows = () => {
    if (miniGamePhase !== 'heat') return;
    sounds.playCauldronBubble();
    haptics.light();
    setHeatLevel((prev) => Math.min(100, prev + 14));
  };

  const handleDropInfusion = () => {
    if (miniGamePhase !== 'infuse') return;
    // Perfect sweet-spot is between 0.9 and 1.15
    const isMaster = infusionScale >= 0.88 && infusionScale <= 1.18;
    setIsMasterwork(isMaster);
    setMiniGamePhase('success');

    const yieldCount = isMaster ? 2 : 1;
    onAddInventoryItem(selectedRecipe.id, yieldCount);

    if (onBrewSuccess) {
      onBrewSuccess(isMaster);
    }

    if (isMaster) {
      sounds.playSparkle();
      sounds.playDrinkPotion();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.5 },
        colors: [selectedRecipe.color, '#fbbf24', '#fde047']
      });
      if (onShowToast) {
        onShowToast(
          'Masterwork Double Brew!',
          `Flawless alchemical timing! Crafted 2x ${selectedRecipe.name}! (+60 Alchemist XP)`,
          'success'
        );
      }
    } else {
      sounds.playDrinkPotion();
      if (onShowToast) {
        onShowToast('Potion Brewed!', `Successfully brewed ${selectedRecipe.name}! (+30 Alchemist XP)`, 'success');
      }
    }
  };

  const handleCollectSimmeringCauldron = (slotIndex: number) => {
    const slot = currentCauldrons[slotIndex];
    if (!slot || !slot.recipeId || !slot.isReady) return;

    const recipe = POTION_RECIPES.find((r) => r.id === slot.recipeId) || POTION_RECIPES[0];
    onAddInventoryItem(recipe.id, 1);
    sounds.playDrinkPotion();

    if (onBrewSuccess) {
      onBrewSuccess(false);
    }

    confetti({
      particleCount: 25,
      spread: 45,
      origin: { y: 0.55 },
      colors: [recipe.color, '#fbbf24']
    });

    if (onShowToast) {
      onShowToast(
        slot.isHoppingPot ? 'Hopping Pot Mystery Brew!' : 'Cauldron Brew Ready!',
        `Collected ${recipe.name} from the simmering station! (+30 Alchemist XP)`,
        'success'
      );
    }

    const updated = [...currentCauldrons];
    if (slot.isHoppingPot) {
      // Hopping Pot automatically begins a new random potion
      const randomRecipe = POTION_RECIPES[Math.floor(Math.random() * POTION_RECIPES.length)];
      const hoppingMult = alchemistRank >= 10 ? 0.5 : 1.0;
      updated[slotIndex] = {
        ...slot,
        recipeId: randomRecipe.id,
        startedAt: Date.now(),
        finishesAt: Date.now() + Math.round(randomRecipe.brewTimeSeconds * 1000 * hoppingMult),
        isReady: false
      };
    } else {
      // Reset normal slot to empty
      updated[slotIndex] = {
        ...slot,
        recipeId: null,
        startedAt: null,
        finishesAt: null,
        isReady: false
      };
    }
    onUpdateCauldrons(updated);
  };

  const handleStartSimmerSlot = (slotIndex: number) => {
    const slot = currentCauldrons[slotIndex];
    if (!slot || slot.recipeId) return;

    if (!hasIngredients(selectedRecipe)) {
      if (onShowToast) {
        onShowToast(
          'Missing Ingredients',
          `Gather more ${selectedRecipe.ingredients.map((i) => ITEMS[i.itemId]?.name || i.itemId).join(' & ')} to brew!`,
          'warning'
        );
      }
      return;
    }

    // Deduct ingredients
    selectedRecipe.ingredients.forEach((ing) => {
      onConsumeItem(ing.itemId, ing.quantity);
    });

    sounds.playCauldronBubble();
    haptics.light();

    // Rapid Simmering perk (Rank 5) gives 25% faster brew times
    const timeMult = alchemistRank >= 5 ? 0.75 : 1.0;
    const durationMs = Math.round(selectedRecipe.brewTimeSeconds * 1000 * timeMult);

    const updated = [...currentCauldrons];
    updated[slotIndex] = {
      ...slot,
      recipeId: selectedRecipe.id,
      startedAt: Date.now(),
      finishesAt: Date.now() + durationMs,
      isReady: false
    };
    onUpdateCauldrons(updated);

    if (onShowToast) {
      onShowToast(
        'Simmering in Cauldron',
        `${selectedRecipe.name} will finish in ${Math.round(durationMs / 1000)}s!${alchemistRank >= 5 ? ' (25% Rapid Simmer)' : ''}`,
        'info'
      );
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        background: 'radial-gradient(circle at 50% 25%, #171c2d 0%, #080c14 100%)'
      }}
    >
      {/* Sub-header Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(15, 23, 42, 0.75)',
          padding: '6px 12px',
          gap: '8px'
        }}
      >
        <button
          onClick={() => {
            setActiveTab('station');
            haptics.light();
          }}
          className={activeTab === 'station' ? 'btn-magical' : 'btn-secondary'}
          style={{ flex: 1, padding: '6px 8px', fontSize: '0.74rem', borderRadius: 'var(--radius-full)' }}
        >
          🧪 Alchemy Cauldron
        </button>
        <button
          onClick={() => {
            setActiveTab('recipes');
            haptics.light();
          }}
          className={activeTab === 'recipes' ? 'btn-magical' : 'btn-secondary'}
          style={{ flex: 1, padding: '6px 8px', fontSize: '0.74rem', borderRadius: 'var(--radius-full)' }}
        >
          📜 Recipes ({POTION_RECIPES.length})
        </button>
        <button
          onClick={() => {
            setActiveTab('ingredients');
            haptics.light();
          }}
          className={activeTab === 'ingredients' ? 'btn-magical' : 'btn-secondary'}
          style={{ flex: 1, padding: '6px 8px', fontSize: '0.74rem', borderRadius: 'var(--radius-full)' }}
        >
          🌿 Satchel
        </button>

        {onOpenShop && (
          <button
            onClick={() => {
              haptics.light();
              onOpenShop();
            }}
            className="btn-secondary"
            style={{
              padding: '6px 10px',
              fontSize: '0.74rem',
              borderRadius: 'var(--radius-full)',
              borderColor: '#fbbf24',
              color: '#fef08a',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span>🛍️ Shop</span>
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px 40px' }}>
        {activeTab === 'station' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '640px', margin: '0 auto' }}>
            {/* Active Potion Selector Pill Strip */}
            <div
              style={{
                display: 'flex',
                gap: '6px',
                overflowX: 'auto',
                paddingBottom: '4px',
                whiteSpace: 'nowrap',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              {POTION_RECIPES.map((recipe) => {
                const isSelected = selectedRecipe.id === recipe.id;
                const canCraft = hasIngredients(recipe);
                const count = inventory[recipe.id] || 0;
                return (
                  <button
                    key={recipe.id}
                    onClick={() => {
                      setSelectedRecipe(recipe);
                      sounds.playCauldronBubble();
                      haptics.light();
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '5px 10px',
                      borderRadius: 'var(--radius-full)',
                      background: isSelected ? 'rgba(251, 191, 36, 0.22)' : 'rgba(255, 255, 255, 0.05)',
                      border: isSelected
                        ? `1.5px solid ${recipe.color}`
                        : canCraft
                        ? '1px solid rgba(56, 189, 248, 0.4)'
                        : '1px solid rgba(255, 255, 255, 0.08)',
                      color: isSelected ? '#fef08a' : '#cbd5e1',
                      fontSize: '0.72rem',
                      fontWeight: isSelected ? 700 : 500,
                      cursor: 'pointer'
                    }}
                  >
                    <span>{recipe.icon}</span>
                    <span>{recipe.name}</span>
                    {count > 0 && (
                      <span
                        style={{
                          background: 'rgba(0,0,0,0.4)',
                          borderRadius: '10px',
                          padding: '1px 5px',
                          fontSize: '0.62rem',
                          color: '#38bdf8'
                        }}
                      >
                        x{count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Central Cauldron Workstation */}
            <div
              className="glass-card"
              style={{
                padding: '16px',
                textAlign: 'center',
                position: 'relative',
                border: `1.5px solid ${selectedRecipe.color}`,
                boxShadow: `0 0 24px ${selectedRecipe.glow}, inset 0 0 30px rgba(0,0,0,0.7)`,
                background: 'radial-gradient(circle at 50% 40%, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%)'
              }}
            >
              {/* Recipe Badge & Title */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    color: selectedRecipe.color,
                    background: 'rgba(0,0,0,0.5)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    border: `1px solid ${selectedRecipe.color}`
                  }}
                >
                  {selectedRecipe.category}
                </span>

                <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Clock size={12} /> {selectedRecipe.brewTimeSeconds}s Simmer
                </span>
              </div>

              <h2 className="font-cinzel title-glow" style={{ fontSize: '1.25rem', color: '#fef08a', fontWeight: 800 }}>
                {selectedRecipe.name}
              </h2>

              <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '4px auto 10px', maxWidth: '380px', lineHeight: 1.35 }}>
                {selectedRecipe.description}
              </p>

              {/* Gameplay tactical bonus callout */}
              <div
                style={{
                  background: 'rgba(0,0,0,0.4)',
                  border: `1px dashed ${selectedRecipe.color}`,
                  borderRadius: '8px',
                  padding: '6px 10px',
                  fontSize: '0.74rem',
                  color: '#e2e8f0',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '14px'
                }}
              >
                <Sparkles size={14} color={selectedRecipe.color} />
                <span>{selectedRecipe.gameplayBonusText}</span>
              </div>

              {/* Visual Bubbling Cauldron Canvas */}
              <div
                ref={cauldronRef}
                onPointerMove={(e) => handleStirMove(e.clientX, e.clientY)}
                style={{
                  position: 'relative',
                  width: '180px',
                  height: '160px',
                  margin: '0 auto 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  userSelect: 'none',
                  touchAction: 'none'
                }}
              >
                {/* Cauldron Cast Iron Body */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '10px',
                    width: '140px',
                    height: '110px',
                    borderRadius: '40% 40% 50% 50%',
                    background: 'linear-gradient(180deg, #334155 0%, #0f172a 100%)',
                    border: '3px solid #64748b',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.8), inset 0 -8px 12px rgba(0,0,0,0.9)'
                  }}
                />

                {/* Hearth Fire Sparks underneath */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '0',
                    width: '80px',
                    height: '16px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, #f59e0b 0%, #ef4444 80%, transparent 100%)',
                    filter: 'blur(3px)',
                    animation: 'pulse 1.4s infinite alternate'
                  }}
                />

                {/* Boiling Fluid Rim & Surface */}
                <div
                  style={{
                    position: 'absolute',
                    top: '42px',
                    width: '116px',
                    height: '42px',
                    borderRadius: '50%',
                    background: `radial-gradient(ellipse at 50% 50%, ${selectedRecipe.color} 0%, #090d16 95%)`,
                    border: `2px solid ${selectedRecipe.color}`,
                    boxShadow: `0 0 16px ${selectedRecipe.glow}, inset 0 0 10px ${selectedRecipe.color}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                  }}
                >
                  {/* Swirling fluid vortex */}
                  <div
                    style={{
                      width: '85px',
                      height: '28px',
                      borderRadius: '50%',
                      border: '1.5px dashed rgba(255,255,255,0.4)',
                      animation: 'spin 3s linear infinite'
                    }}
                  />
                </div>

                {/* Interactive Mini-Game Elements */}
                {isMiniGameActive && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(11, 15, 25, 0.94)',
                      borderRadius: '16px',
                      border: `2px solid ${selectedRecipe.color}`,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 30,
                      padding: '10px'
                    }}
                  >
                    {miniGamePhase === 'stir' && (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <div style={{ fontSize: '0.76rem', color: '#fef08a', fontWeight: 700 }}>
                          Trace Circular Stirring!
                        </div>
                        <div
                          style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            border: `3px dashed ${selectedRecipe.color}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            animation: 'spin 4s linear infinite'
                          }}
                        >
                          <RotateCw size={26} color="#fef08a" />
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                          Stir Progress: {Math.round(stirProgress)}%
                        </div>
                        <div style={{ width: '120px', height: '6px', background: '#334155', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${stirProgress}%`, height: '100%', background: selectedRecipe.color }} />
                        </div>
                      </div>
                    )}

                    {miniGamePhase === 'heat' && (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', width: '100%' }}>
                        <div style={{ fontSize: '0.74rem', color: '#fef08a', fontWeight: 700 }}>
                          Pump Bellows into Green Zone!
                        </div>
                        {/* Gauge */}
                        <div style={{ position: 'relative', width: '140px', height: '14px', background: '#1e293b', borderRadius: '7px', overflow: 'hidden' }}>
                          {/* Sweet spot bar */}
                          <div
                            style={{
                              position: 'absolute',
                              left: '50%',
                              width: '32%',
                              height: '100%',
                              background: 'rgba(16, 185, 129, 0.45)',
                              borderLeft: '1px solid #10b981',
                              borderRight: '1px solid #10b981'
                            }}
                          />
                          {/* Needle */}
                          <div
                            style={{
                              position: 'absolute',
                              left: `${heatLevel}%`,
                              width: '4px',
                              height: '100%',
                              background: '#fbbf24',
                              boxShadow: '0 0 6px #fbbf24'
                            }}
                          />
                        </div>
                        <div style={{ fontSize: '0.66rem', color: heatLevel >= 50 && heatLevel <= 82 ? '#34d399' : '#f87171' }}>
                          {heatLevel >= 50 && heatLevel <= 82
                            ? `Boiling perfectly! (${(3.0 - heatTimeInZone).toFixed(1)}s)`
                            : 'Pump bellows to increase heat!'}
                        </div>
                        <button
                          onClick={handlePumpBellows}
                          className="btn-magical"
                          style={{ padding: '6px 14px', fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Flame size={14} /> Pump Bellows
                        </button>
                      </div>
                    )}

                    {miniGamePhase === 'infuse' && (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                        <div style={{ fontSize: '0.74rem', color: '#fef08a', fontWeight: 700 }}>
                          Timing: Tap to Drop Essence!
                        </div>
                        <div
                          style={{
                            position: 'relative',
                            width: '70px',
                            height: '70px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {/* Sweet Spot Target Ring */}
                          <div
                            style={{
                              position: 'absolute',
                              width: '44px',
                              height: '44px',
                              borderRadius: '50%',
                              border: '2px solid #fbbf24',
                              boxShadow: '0 0 8px #fbbf24'
                            }}
                          />
                          {/* Contracting Infusion Ring */}
                          <div
                            style={{
                              position: 'absolute',
                              width: `${44 * infusionScale}px`,
                              height: `${44 * infusionScale}px`,
                              borderRadius: '50%',
                              border: `2px solid ${selectedRecipe.color}`,
                              transition: 'width 0.06s, height 0.06s'
                            }}
                          />
                        </div>
                        <button
                          onClick={handleDropInfusion}
                          className="btn-magical"
                          style={{ padding: '6px 16px', fontSize: '0.74rem' }}
                        >
                          Add Essence!
                        </button>
                      </div>
                    )}

                    {miniGamePhase === 'success' && (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                        <div style={{ fontSize: '28px' }}>✨</div>
                        <div className="font-cinzel" style={{ fontSize: '0.88rem', color: '#fbbf24', fontWeight: 800 }}>
                          {isMasterwork ? 'MASTERWORK BREW (x2)!' : 'BREW COMPLETE (x1)!'}
                        </div>
                        <button
                          onClick={() => setIsMiniGameActive(false)}
                          className="btn-secondary"
                          style={{ padding: '5px 12px', fontSize: '0.72rem' }}
                        >
                          Continue
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Recipe Ingredients Requirements */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '12px',
                  marginBottom: '14px',
                  flexWrap: 'wrap'
                }}
              >
                {selectedRecipe.ingredients.map((ing) => {
                  const it = ITEMS[ing.itemId];
                  const currentCount = inventory[ing.itemId] || 0;
                  const satisfied = currentCount >= ing.quantity;
                  return (
                    <div
                      key={ing.itemId}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'rgba(0,0,0,0.4)',
                        padding: '4px 10px',
                        borderRadius: '8px',
                        border: satisfied ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)'
                      }}
                    >
                      <span style={{ fontSize: '18px' }}>{it?.icon || '🌿'}</span>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '0.70rem', color: '#e2e8f0', fontWeight: 600 }}>{it?.name}</div>
                        <div style={{ fontSize: '0.64rem', color: satisfied ? '#34d399' : '#f87171' }}>
                          {currentCount} / {ing.quantity}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <button
                  onClick={handleStartSkillBrew}
                  disabled={!hasIngredients(selectedRecipe) || isMiniGameActive}
                  className="btn-magical"
                  style={{
                    flex: 1.2,
                    padding: '10px 12px',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    opacity: hasIngredients(selectedRecipe) ? 1 : 0.45,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px'
                  }}
                >
                  <Sparkles size={14} />
                  <span>Brew with Skill (2x Yield)</span>
                </button>
              </div>
            </div>

            {/* Simmering Table Cauldrons & Hopping Pot */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="font-cinzel" style={{ fontSize: '0.85rem', color: '#fbbf24', fontWeight: 700 }}>
                    Simmering Table Cauldrons
                  </span>
                  <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>({cauldronSlotsCount}/4 Slots)</span>
                </div>
                {onOpenShop && cauldronSlotsCount < 4 && (
                  <button
                    onClick={onOpenShop}
                    style={{
                      padding: '3px 8px',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      borderRadius: 'var(--radius-full)',
                      border: '1px solid #fbbf24',
                      background: 'rgba(251, 191, 36, 0.15)',
                      color: '#fef08a',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    title="Unlock extra cauldrons in Diagon Alley shop"
                  >
                    <span>⚗️</span>
                    <span>+ Buy Cauldrons</span>
                  </button>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '8px' }}>
                {currentCauldrons.map((slot, idx) => {
                  const recipe = slot.recipeId ? POTION_RECIPES.find((r) => r.id === slot.recipeId) : null;
                  const now = Date.now();
                  const remainingSecs = slot.finishesAt ? Math.max(0, Math.ceil((slot.finishesAt - now) / 1000)) : 0;

                  return (
                    <div
                      key={slot.id}
                      className="glass-card"
                      style={{
                        padding: '10px 8px',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        minHeight: '130px',
                        border: slot.isReady
                          ? '1.5px solid #34d399'
                          : slot.recipeId
                          ? '1.5px solid #38bdf8'
                          : '1px dashed rgba(255,255,255,0.15)',
                        boxShadow: slot.isReady ? '0 0 12px rgba(52, 211, 153, 0.3)' : 'none'
                      }}
                    >
                      {/* Badge / Type */}
                      <span
                        style={{
                          fontSize: '0.62rem',
                          color: slot.isHoppingPot ? '#c084fc' : '#94a3b8',
                          fontWeight: 700
                        }}
                      >
                        {slot.isHoppingPot ? '✨ Hopping Pot' : `Cauldron #${idx + 1}`}
                      </span>

                      {/* Center Status */}
                      {slot.recipeId && recipe ? (
                        <div style={{ margin: '4px 0' }}>
                          <div style={{ fontSize: '26px' }}>{recipe.icon}</div>
                          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: recipe.color }}>{recipe.name}</div>
                          {slot.isReady ? (
                            <div style={{ fontSize: '0.64rem', color: '#34d399', fontWeight: 700 }}>Ready to Collect!</div>
                          ) : (
                            <div style={{ fontSize: '0.64rem', color: '#94a3b8' }}>{remainingSecs}s left</div>
                          )}
                        </div>
                      ) : (
                        <div style={{ margin: '8px 0', color: '#64748b' }}>
                          <div style={{ fontSize: '24px' }}>🧪</div>
                          <div style={{ fontSize: '0.64rem' }}>Empty Slot</div>
                        </div>
                      )}

                      {/* Action Button */}
                      {slot.isReady ? (
                        <button
                          onClick={() => handleCollectSimmeringCauldron(idx)}
                          className="btn-magical"
                          style={{
                            width: '100%',
                            padding: '4px 0',
                            fontSize: '0.68rem',
                            background: 'linear-gradient(135deg, #10b981, #059669)'
                          }}
                        >
                          Collect
                        </button>
                      ) : slot.recipeId ? (
                        <div
                          style={{
                            width: '100%',
                            height: '4px',
                            background: '#334155',
                            borderRadius: '2px',
                            overflow: 'hidden'
                          }}
                        >
                          <div
                            style={{
                              width: `${Math.min(
                                100,
                                Math.round(
                                  ((now - (slot.startedAt || now)) /
                                    ((slot.finishesAt || now) - (slot.startedAt || now))) *
                                    100
                                )
                              )}%`,
                              height: '100%',
                              background: '#38bdf8'
                            }}
                          />
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartSimmerSlot(idx)}
                          disabled={!hasIngredients(selectedRecipe)}
                          className="btn-secondary"
                          style={{
                            width: '100%',
                            padding: '4px 0',
                            fontSize: '0.64rem',
                            opacity: hasIngredients(selectedRecipe) ? 1 : 0.4
                          }}
                        >
                          Simmer
                        </button>
                      )}
                    </div>
                  );
                })}

                {/* Locked Table Cauldron Slots (Discoverability for Cauldron Expansion) */}
                {Array.from({ length: Math.max(0, 4 - (cauldronSlotsCount || 2)) }).map((_, lockIdx) => {
                  const slotNumber = (cauldronSlotsCount || 2) + lockIdx + 1;
                  const upgradeCost = slotNumber === 3 ? 450 : 850;
                  return (
                    <div
                      key={`locked_slot_${slotNumber}`}
                      onClick={() => {
                        if (onOpenShop) {
                          sounds.playUiClick();
                          onOpenShop();
                        }
                      }}
                      className="glass-card"
                      style={{
                        padding: '10px 8px',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        minHeight: '130px',
                        border: '1.5px dashed rgba(251, 191, 36, 0.45)',
                        background: 'rgba(30, 25, 15, 0.55)',
                        cursor: onOpenShop ? 'pointer' : 'default',
                        transition: 'all 0.2s'
                      }}
                      title="Visit Apothecary to expand cauldron brewing slots"
                    >
                      <span style={{ fontSize: '0.62rem', color: '#fbbf24', fontWeight: 800 }}>
                        Slot #{slotNumber}
                      </span>

                      <div style={{ margin: '4px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span style={{ fontSize: '24px' }}>🔒</span>
                        <span style={{ fontSize: '0.66rem', color: '#fef08a', fontWeight: 700, marginTop: '2px' }}>
                          Locked Slot
                        </span>
                        <span style={{ fontSize: '0.60rem', color: '#94a3b8' }}>
                          🪙 {upgradeCost} Knuts
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onOpenShop) onOpenShop();
                        }}
                        style={{
                          width: '100%',
                          padding: '4px 2px',
                          fontSize: '0.64rem',
                          fontWeight: 700,
                          borderRadius: '6px',
                          border: '1px solid #fbbf24',
                          background: 'rgba(251, 191, 36, 0.2)',
                          color: '#fef08a',
                          cursor: 'pointer'
                        }}
                      >
                        + Buy in Shop
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Full Recipe Compendium */}
        {activeTab === 'recipes' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '640px', margin: '0 auto' }}>
            {POTION_RECIPES.map((recipe) => {
              const count = inventory[recipe.id] || 0;
              const craftable = hasIngredients(recipe);
              return (
                <div
                  key={recipe.id}
                  className="glass-card"
                  style={{
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    border: `1px solid ${recipe.color}40`,
                    boxShadow: `0 0 10px ${recipe.glow}20`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '24px' }}>{recipe.icon}</span>
                      <div>
                        <div className="font-cinzel" style={{ fontSize: '0.88rem', color: '#fef08a', fontWeight: 800 }}>
                          {recipe.canonicalName}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: recipe.color, fontWeight: 700 }}>
                          {recipe.category.toUpperCase()} • In Satchel: {count}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedRecipe(recipe);
                        setActiveTab('station');
                      }}
                      className={craftable ? 'btn-magical' : 'btn-secondary'}
                      style={{ padding: '5px 12px', fontSize: '0.72rem' }}
                    >
                      {craftable ? 'Select & Brew' : 'View Recipe'}
                    </button>
                  </div>

                  <p style={{ fontSize: '0.74rem', color: '#cbd5e1', lineHeight: 1.4 }}>{recipe.description}</p>

                  <div
                    style={{
                      background: 'rgba(0,0,0,0.3)',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '0.70rem',
                      color: '#fbbf24',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Sparkles size={12} />
                    <span>Tactical Bonus: {recipe.gameplayBonusText}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '2px' }}>
                    {recipe.ingredients.map((ing) => {
                      const it = ITEMS[ing.itemId];
                      const cur = inventory[ing.itemId] || 0;
                      return (
                        <span
                          key={ing.itemId}
                          style={{
                            fontSize: '0.66rem',
                            color: cur >= ing.quantity ? '#34d399' : '#f87171',
                            background: 'rgba(0,0,0,0.4)',
                            padding: '2px 6px',
                            borderRadius: '4px'
                          }}
                        >
                          {it?.icon} {it?.name}: {cur}/{ing.quantity}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 3: Botanical Satchel & Ingredients */}
        {activeTab === 'ingredients' && (
          <div style={{ maxWidth: '640px', margin: '0 auto' }}>
            <div
              style={{
                fontSize: '0.76rem',
                color: '#94a3b8',
                marginBottom: '10px',
                lineHeight: 1.4
              }}
            >
              🌿 Harvest fresh botanicals from <strong style={{ color: '#10b981' }}>Herbology Greenhouses</strong>, gather
              reagents from <strong style={{ color: '#a855f7' }}>Apothecaries</strong>, or discover them when walking with your
              beast buddy!
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              {Object.keys(ITEMS)
                .filter((k) => ITEMS[k].category === 'ingredient')
                .map((key) => {
                  const it = ITEMS[key];
                  const count = inventory[key] || 0;
                  return (
                    <div
                      key={key}
                      className="glass-card"
                      style={{
                        padding: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        border: count > 0 ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.04)',
                        opacity: count > 0 ? 1 : 0.45
                      }}
                    >
                      <span style={{ fontSize: '24px' }}>{it.icon}</span>
                      <div style={{ overflow: 'hidden' }}>
                        <div
                          style={{
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            color: '#fef08a',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {it.name}
                        </div>
                        <div style={{ fontSize: '0.64rem', color: '#94a3b8' }}>In Stock: x{count}</div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
