import React, { useState } from 'react';
import { X, Sparkles, Coins, ShoppingBag, ArrowRightLeft, Wrench, Package, Flame, Check, AlertCircle, ArrowUpRight } from 'lucide-react';
import { sounds } from '../services/soundService';
import { POTION_RECIPES, POTION_ITEMS, INGREDIENT_ITEMS } from '../data/potionsData';

interface ApothecaryShopModalProps {
  knuts: number;
  inventory: Record<string, number>;
  characterRank: number;
  cauldronSlotsCount: number;
  onBuyItem: (itemKey: string, costKnuts: number, count?: number) => void;
  onSellItem: (itemKey: string, knutsEarned: number, count?: number) => void;
  onUpgradeCauldrons?: (newCount: number, costKnuts: number) => void;
  onOpenPotionsLab?: () => void;
  onClose: () => void;
}

export default function ApothecaryShopModal({
  knuts,
  inventory,
  characterRank,
  cauldronSlotsCount,
  onBuyItem,
  onSellItem,
  onUpgradeCauldrons,
  onOpenPotionsLab,
  onClose
}: ApothecaryShopModalProps) {
  const [activeTab, setActiveTab] = useState<'potions' | 'reagents' | 'workshop' | 'daily'>('potions');
  const [reagentSubTab, setReagentSubTab] = useState<'buy' | 'sell'>('buy');
  const [dialogue, setDialogue] = useState<string>(
    '“Welcome to the Apothecary! Fresh herbs and ready draughts straight from our copper cauldrons. What can I brew up for you today?”'
  );
  const [purchaseNotice, setPurchaseNotice] = useState<string | null>(null);

  const triggerDialogue = (text: string) => {
    setDialogue(text);
  };

  const notify = (msg: string) => {
    setPurchaseNotice(msg);
    setTimeout(() => {
      setPurchaseNotice(null);
    }, 2800);
  };

  // Canonical Potions for sale
  const potionOfferings = [
    {
      key: 'potion_wiggenweld',
      name: 'Wiggenweld Restorative',
      cost: 75,
      icon: '🧪',
      tag: 'Restorative',
      color: '#10b981',
      desc: 'Replenishes +50 Spell Energy instantly on demand in or out of encounters.'
    },
    {
      key: 'potion_focus',
      name: 'Focus Mind Draught',
      cost: 95,
      icon: '🎯',
      tag: 'Combat Reflex',
      color: '#eab308',
      desc: 'Illuminates celestial golden rune guide on wand canvas for guaranteed Masterful Cast.'
    },
    {
      key: 'potion_maxima',
      name: 'Maxima Surging Draught',
      cost: 110,
      icon: '💥',
      tag: 'Surging Power',
      color: '#ef4444',
      desc: '+40% Wand Charm Catch Power and +50% Raid Boss spell damage.'
    },
    {
      key: 'potion_invisibility',
      name: 'Invisibility Mist Draught',
      cost: 120,
      icon: '🌫️',
      tag: 'Camouflage',
      color: '#38bdf8',
      desc: '0% Flee Rate (beast cannot detect or run away) + guaranteed Surprise Ambush bonus.'
    },
    {
      key: 'potion_edurus',
      name: 'Edurus Barkskin Brew',
      cost: 90,
      icon: '🛡️',
      tag: 'Defense',
      color: '#d97706',
      desc: 'Coats drinker in stone barkskin. Beast cannot flee for 2 turns + 50% raid damage reduction.'
    },
    {
      key: 'potion_thunderbrew',
      name: 'Thunderbrew Tempest Brew',
      cost: 135,
      icon: '⚡',
      tag: 'Tempest',
      color: '#a855f7',
      desc: 'Unleashes storm lightning that STUNS fierce aggressive beasts and freezes resistance rings.'
    }
  ];

  // Reagents available to buy
  const buyReagents = [
    { key: 'ing_ashwinder_eggs', name: 'Ashwinder Eggs', cost: 45, count: 2, icon: '🥚', desc: 'Blazing fiery eggs for Edurus & Thunderbrew.' },
    { key: 'ing_spider_fangs', name: 'Acromantula Fangs', cost: 50, count: 2, icon: '🕷️', desc: 'Potent venom tips for Maxima brewing.' },
    { key: 'ing_leech_juice', name: 'Leech Juice', cost: 40, count: 2, icon: '💧', desc: 'Amplifies spell and chemical potency.' },
    { key: 'ing_lacewing_flies', name: 'Lacewing Flies', cost: 40, count: 2, icon: '🪰', desc: 'Stewed for 21 days for Invisibility Mist.' },
    { key: 'ing_mooncalf_fur', name: 'Mooncalf Soft Fur', cost: 45, count: 2, icon: '🌕', desc: 'Silken down for Camouflage mist.' },
    { key: 'ing_dugbog_tongue', name: 'Dugbog Tongue', cost: 40, count: 2, icon: '👅', desc: 'Grounds turbulent Focus draughts.' },
    { key: 'ing_dittany', name: 'Dittany Leaves', cost: 35, count: 2, icon: '🌿', desc: 'Essential restorative healing herb.' },
    { key: 'ing_fluxweed', name: 'Fluxweed Stems', cost: 40, count: 2, icon: '🌱', desc: 'Full moon herb for Focus mind brews.' },
    { key: 'ing_shrivelfig', name: 'Shrivelfig Fruit', cost: 45, count: 2, icon: '🍇', desc: 'Channels tempest storm electricity.' },
    { key: 'ing_horklump_juice', name: 'Horklump Juice', cost: 35, count: 2, icon: '🍄', desc: 'Pressed golden mushroom nectar.' },
    { key: 'ing_mongrel_fur', name: 'Dark Mongrel Fur', cost: 40, count: 2, icon: '🐺', desc: 'Coarse protective pelt for Edurus barkskin.' }
  ];

  // Botanical items the player can sell for Knuts
  const sellReagents = [
    { key: 'ing_dittany', name: 'Dittany Leaves', priceEach: 18, icon: '🌿' },
    { key: 'ing_horklump_juice', name: 'Horklump Juice', priceEach: 18, icon: '🍄' },
    { key: 'ing_fluxweed', name: 'Fluxweed Stems', priceEach: 20, icon: '🌱' },
    { key: 'ing_shrivelfig', name: 'Shrivelfig Fruit', priceEach: 22, icon: '🍇' },
    { key: 'ing_mooncalf_fur', name: 'Mooncalf Soft Fur', priceEach: 22, icon: '🌕' },
    { key: 'ing_mongrel_fur', name: 'Dark Mongrel Fur', priceEach: 20, icon: '🐺' },
    { key: 'ing_ashwinder_eggs', name: 'Ashwinder Eggs', priceEach: 22, icon: '🥚' },
    { key: 'ing_spider_fangs', name: 'Acromantula Fangs', priceEach: 25, icon: '🕷️' }
  ];

  const handleBuyPotion = (item: typeof potionOfferings[0]) => {
    if (knuts < item.cost) {
      sounds.playErrorSound();
      triggerDialogue('“Blimey! You’re a few Knuts short for that draught. Try bartering some botanical herbs!”');
      return;
    }
    sounds.playCoinChime();
    onBuyItem(item.key, item.cost, 1);
    notify(`Purchased 1x ${item.name}!`);
    triggerDialogue(`“A fine choice! That ${item.name} will serve you well in the field.”`);
  };

  const handleBuyReagent = (item: typeof buyReagents[0]) => {
    if (knuts < item.cost) {
      sounds.playErrorSound();
      triggerDialogue('“Short on coins? You can sell excess flora in our Reagent Exchange tab!”');
      return;
    }
    sounds.playCoinChime();
    onBuyItem(item.key, item.cost, item.count);
    notify(`Purchased ${item.count}x ${item.name}!`);
    triggerDialogue(`“Careful with those ${item.name}—potent magical properties if brewed right!”`);
  };

  const handleSellReagent = (key: string, name: string, priceEach: number, countToSell: number) => {
    const currentQty = inventory[key] || 0;
    if (currentQty < countToSell) {
      sounds.playErrorSound();
      return;
    }
    const totalKnuts = priceEach * countToSell;
    sounds.playCoinChime();
    onSellItem(key, totalKnuts, countToSell);
    notify(`Sold ${countToSell}x ${name} for +${totalKnuts} Knuts!`);
    triggerDialogue(`“Splendid harvest! Fresh ${name} is always in high demand by our brewmasters.”`);
  };

  const handleBuyDailyBundle = () => {
    const bundleCost = 195;
    if (knuts < bundleCost) {
      sounds.playErrorSound();
      triggerDialogue('“The daily bundle is an exceptional deal, but you’ll need 195 Knuts.”');
      return;
    }
    sounds.playCoinChime();
    // Daily Bundle: 1x Focus Potion, 1x Wiggenweld Potion, 2x Ashwinder Eggs, 2x Dittany
    onBuyItem('potion_focus', 0, 1);
    onBuyItem('potion_wiggenweld', 0, 1);
    onBuyItem('ing_ashwinder_eggs', 0, 2);
    onBuyItem('ing_dittany', bundleCost, 2);
    notify('Claimed Daily Alchemist Bundle! (2 Potions + 4 Reagents)');
    triggerDialogue('“May the ancient stars align for your brewing! An exquisite batch!”');
  };

  const handleUpgradeCauldronSlot = () => {
    if (cauldronSlotsCount >= 4) return;
    const nextSlot = cauldronSlotsCount + 1;
    const cost = nextSlot === 3 ? 450 : 850;
    if (knuts < cost) {
      sounds.playErrorSound();
      triggerDialogue(`“Unlocking Cauldron Slot #${nextSlot} costs ${cost} Knuts. Save up and return soon!”`);
      return;
    }
    sounds.playLevelUp();
    if (onUpgradeCauldrons) {
      onUpgradeCauldrons(nextSlot, cost);
    }
    notify(`Unlocked Simmer Cauldron Slot #${nextSlot}!`);
    triggerDialogue(`“Sturdy brass craftsmanship! You can now simmer ${nextSlot} table draughts at once.”`);
  };

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
          background: 'linear-gradient(180deg, #18120e 0%, #0d0f17 100%)'
        }}
      >
        {/* Ambient Shopfront Header Banner */}
        <div
          style={{
            position: 'relative',
            height: '145px',
            backgroundImage: 'url(/assets/apothecary_shop_interior.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center 30%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '14px 16px',
            borderBottom: '1px solid rgba(251, 191, 36, 0.3)'
          }}
        >
          {/* Dark Overlay Gradient */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(13, 15, 23, 0.95) 100%)',
              zIndex: 1
            }}
          />

          {/* Top Bar with Balance and Close */}
          <div
            style={{
              position: 'relative',
              zIndex: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            {/* Coins Balance Indicator */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(0, 0, 0, 0.75)',
                padding: '6px 14px',
                borderRadius: '20px',
                border: '1px solid #fbbf24',
                boxShadow: '0 0 15px rgba(251, 191, 36, 0.3)'
              }}
            >
              <Coins size={16} color="#fbbf24" />
              <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#fef08a' }}>
                {knuts} <span style={{ fontSize: '0.72rem', color: '#fbbf24' }}>Knuts</span>
              </span>
            </div>

            {/* Backroom Lab Portal Button & Close */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {onOpenPotionsLab && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenPotionsLab();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'rgba(168, 85, 247, 0.25)',
                    border: '1px solid #c084fc',
                    color: '#f5d0fe',
                    padding: '6px 12px',
                    borderRadius: '16px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <span>🧪 Backroom Lab</span>
                  <ArrowUpRight size={13} />
                </button>
              )}
              <button
                className="btn-modal-close"
                onClick={onClose}
                title="Close"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Title Branding */}
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '1.2rem' }}>⚗️</span>
              <h2
                style={{
                  margin: 0,
                  fontSize: '1.25rem',
                  fontWeight: 900,
                  fontFamily: 'var(--font-serif)',
                  color: '#fef08a',
                  letterSpacing: '0.04em',
                  textShadow: '0 2px 10px rgba(0,0,0,0.9)'
                }}
              >
                Mulpepper & Pippin’s Apothecary
              </h2>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '2px' }}>
              Diagon Alley Purveyors of Fine Elixirs, Rare Reagents & Brass Cauldrons
            </div>
          </div>
        </div>

        {/* Shopkeeper Dialogue Banner */}
        <div
          style={{
            padding: '10px 16px',
            background: 'rgba(30, 22, 14, 0.75)',
            borderBottom: '1px solid rgba(251, 191, 36, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, #f59e0b 0%, #78350f 100%)',
              border: '2px solid #fbbf24',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.1rem',
              flexShrink: 0
            }}
          >
            🧔‍♂️
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#fbbf24', textTransform: 'uppercase' }}>
              Shopkeeper Parry Pippin
            </div>
            <div
              style={{
                fontSize: '0.78rem',
                color: '#f1f5f9',
                fontStyle: 'italic',
                lineHeight: 1.3,
                marginTop: '1px'
              }}
            >
              {dialogue}
            </div>
          </div>
        </div>

        {/* Notification Toast */}
        {purchaseNotice && (
          <div
            style={{
              background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
              color: '#ffffff',
              padding: '6px 14px',
              fontSize: '0.78rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)'
            }}
          >
            <Check size={14} />
            <span>{purchaseNotice}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'rgba(15, 23, 42, 0.5)'
          }}
        >
          {[
            { id: 'potions', label: '🧪 Potions Bar' },
            { id: 'reagents', label: '🌿 Reagents Market' },
            { id: 'workshop', label: '⚗️ Cauldrons' },
            { id: 'daily', label: '✨ Daily Bundle' }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  sounds.playUiClick();
                  setActiveTab(tab.id as any);
                }}
                style={{
                  flex: 1,
                  padding: '11px 4px',
                  background: isActive ? 'rgba(251, 191, 36, 0.12)' : 'none',
                  border: 'none',
                  borderBottom: isActive ? '2px solid #fbbf24' : '2px solid transparent',
                  color: isActive ? '#fef08a' : '#94a3b8',
                  fontSize: '0.78rem',
                  fontWeight: isActive ? 800 : 600,
                  cursor: 'pointer',
                  transition: 'all 0.18s ease'
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Body */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          {/* TAB 1: POTIONS BAR */}
          {activeTab === 'potions' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '0.76rem', color: '#94a3b8' }}>
                Canonical Hogwarts Legacy draughts brewed, bottled, and ready for immediate deployment in the field:
              </div>

              {potionOfferings.map((pot) => {
                const currentQty = inventory[pot.key] || 0;
                const canAfford = knuts >= pot.cost;

                return (
                  <div
                    key={pot.key}
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '16px',
                      padding: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      transition: 'border-color 0.2s'
                    }}
                  >
                    <div
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '12px',
                        background: `radial-gradient(circle, ${pot.color}33 0%, rgba(0,0,0,0.6) 100%)`,
                        border: `1.5px solid ${pot.color}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.4rem',
                        flexShrink: 0,
                        boxShadow: `0 0 14px ${pot.color}40`
                      }}
                    >
                      {pot.icon}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#f8fafc' }}>
                          {pot.name}
                        </span>
                        <span
                          style={{
                            fontSize: '0.62rem',
                            padding: '1px 6px',
                            borderRadius: '8px',
                            background: `${pot.color}22`,
                            color: pot.color,
                            border: `1px solid ${pot.color}55`,
                            fontWeight: 700
                          }}
                        >
                          {pot.tag}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: '0.72rem',
                          color: '#94a3b8',
                          lineHeight: 1.3,
                          marginTop: '2px'
                        }}
                      >
                        {pot.desc}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#cbd5e1', marginTop: '3px' }}>
                        In Satchel: <strong style={{ color: currentQty > 0 ? '#34d399' : '#64748b' }}>{currentQty}</strong>
                      </div>
                    </div>

                    <button
                      disabled={!canAfford}
                      onClick={() => handleBuyPotion(pot)}
                      style={{
                        padding: '8px 14px',
                        background: canAfford
                          ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                          : 'rgba(51, 65, 85, 0.4)',
                        border: canAfford ? '1px solid #fbbf24' : '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        color: canAfford ? '#18120e' : '#64748b',
                        fontWeight: 900,
                        fontSize: '0.78rem',
                        cursor: canAfford ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        minWidth: '78px',
                        boxShadow: canAfford ? '0 0 12px rgba(245, 158, 11, 0.35)' : 'none',
                        flexShrink: 0
                      }}
                    >
                      <span>Buy</span>
                      <span style={{ fontSize: '0.7rem' }}>{pot.cost} Knuts</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: REAGENTS MARKET (BUY & SELL) */}
          {activeTab === 'reagents' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Buy / Sell Toggle Sub-bar */}
              <div
                style={{
                  display: 'flex',
                  gap: '6px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  padding: '4px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}
              >
                <button
                  onClick={() => {
                    sounds.playUiClick();
                    setReagentSubTab('buy');
                  }}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '8px',
                    border: 'none',
                    background: reagentSubTab === 'buy' ? '#fbbf24' : 'transparent',
                    color: reagentSubTab === 'buy' ? '#18120e' : '#94a3b8',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  🛒 Purchase Reagents
                </button>
                <button
                  onClick={() => {
                    sounds.playUiClick();
                    setReagentSubTab('sell');
                  }}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '8px',
                    border: 'none',
                    background: reagentSubTab === 'sell' ? '#10b981' : 'transparent',
                    color: reagentSubTab === 'sell' ? '#ffffff' : '#94a3b8',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  💰 Sell Gathered Flora
                </button>
              </div>

              {/* BUY SUB-TAB */}
              {reagentSubTab === 'buy' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                    Purchase fresh reagents for Newt's suitcase laboratory cauldron recipes:
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '8px' }}>
                    {buyReagents.map((reag) => {
                      const currentQty = inventory[reag.key] || 0;
                      const canAfford = knuts >= reag.cost;

                      return (
                        <div
                          key={reag.key}
                          style={{
                            background: 'rgba(255, 255, 255, 0.025)',
                            border: '1px solid rgba(255, 255, 255, 0.07)',
                            borderRadius: '14px',
                            padding: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                          }}
                        >
                          <div style={{ fontSize: '1.5rem', flexShrink: 0 }}>{reag.icon}</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f8fafc' }}>
                              {reag.count}x {reag.name}
                            </div>
                            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{reag.desc}</div>
                            <div style={{ fontSize: '0.66rem', color: '#64748b', marginTop: '2px' }}>
                              Have: <strong style={{ color: '#cbd5e1' }}>{currentQty}</strong>
                            </div>
                          </div>
                          <button
                            disabled={!canAfford}
                            onClick={() => handleBuyReagent(reag)}
                            style={{
                              padding: '6px 10px',
                              background: canAfford ? '#fbbf24' : 'rgba(51, 65, 85, 0.4)',
                              border: 'none',
                              borderRadius: '10px',
                              color: canAfford ? '#18120e' : '#64748b',
                              fontSize: '0.74rem',
                              fontWeight: 800,
                              cursor: canAfford ? 'pointer' : 'not-allowed',
                              flexShrink: 0
                            }}
                          >
                            {reag.cost} K
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SELL SUB-TAB */}
              {reagentSubTab === 'sell' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                    Sell botanical flora gathered while walking with your companion or harvesting greenhouses:
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {sellReagents.map((item) => {
                      const qty = inventory[item.key] || 0;
                      return (
                        <div
                          key={item.key}
                          style={{
                            background: 'rgba(255, 255, 255, 0.025)',
                            border: '1px solid rgba(255, 255, 255, 0.07)',
                            borderRadius: '14px',
                            padding: '10px 14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                          }}
                        >
                          <div style={{ fontSize: '1.4rem' }}>{item.icon}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#f8fafc' }}>
                              {item.name}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#34d399' }}>
                              Value: +{item.priceEach} Knuts each · Owned: <strong>{qty}</strong>
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              disabled={qty < 1}
                              onClick={() => handleSellReagent(item.key, item.name, item.priceEach, 1)}
                              style={{
                                padding: '6px 10px',
                                background: qty >= 1 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(51, 65, 85, 0.3)',
                                border: qty >= 1 ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.05)',
                                borderRadius: '8px',
                                color: qty >= 1 ? '#34d399' : '#64748b',
                                fontSize: '0.72rem',
                                fontWeight: 800,
                                cursor: qty >= 1 ? 'pointer' : 'not-allowed'
                              }}
                            >
                              Sell 1 (+{item.priceEach}K)
                            </button>
                            <button
                              disabled={qty < 5}
                              onClick={() => handleSellReagent(item.key, item.name, item.priceEach, 5)}
                              style={{
                                padding: '6px 10px',
                                background: qty >= 5 ? 'rgba(16, 185, 129, 0.25)' : 'rgba(51, 65, 85, 0.2)',
                                border: qty >= 5 ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.05)',
                                borderRadius: '8px',
                                color: qty >= 5 ? '#a7f3d0' : '#475569',
                                fontSize: '0.72rem',
                                fontWeight: 800,
                                cursor: qty >= 5 ? 'pointer' : 'not-allowed'
                              }}
                            >
                              Sell 5 (+{item.priceEach * 5}K)
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: WORKSHOP & CAULDRON UPGRADES */}
          {activeTab === 'workshop' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '0.76rem', color: '#94a3b8' }}>
                Expand your suitcase brewing capacity. Simmer multiple canonical potions simultaneously while roaming:
              </div>

              {/* Cauldron Slots Upgrade Card */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(251, 191, 36, 0.3)',
                  borderRadius: '16px',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      background: 'radial-gradient(circle, #f59e0b33 0%, rgba(0,0,0,0.6) 100%)',
                      border: '1px solid #fbbf24',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.4rem'
                    }}
                  >
                    ⚗️
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#fef08a' }}>
                      Table Cauldron Slots ({cauldronSlotsCount} / 4 Unlocked)
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>
                      Simmer potions passively in real-time while walking your companion.
                    </div>
                  </div>
                </div>

                {/* Progress Indicators */}
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[1, 2, 3, 4].map((slotNum) => {
                    const isUnlocked = slotNum <= cauldronSlotsCount;
                    return (
                      <div
                        key={slotNum}
                        style={{
                          flex: 1,
                          padding: '8px',
                          borderRadius: '10px',
                          background: isUnlocked ? 'rgba(251, 191, 36, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                          border: isUnlocked ? '1px solid #fbbf24' : '1px dashed rgba(255, 255, 255, 0.15)',
                          textAlign: 'center'
                        }}
                      >
                        <div style={{ fontSize: '0.72rem', fontWeight: 800, color: isUnlocked ? '#fbbf24' : '#64748b' }}>
                          Slot #{slotNum}
                        </div>
                        <div style={{ fontSize: '0.64rem', color: isUnlocked ? '#34d399' : '#94a3b8', marginTop: '2px' }}>
                          {isUnlocked ? '✓ Active' : 'Locked'}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {cauldronSlotsCount < 4 ? (
                  <button
                    onClick={handleUpgradeCauldronSlot}
                    disabled={knuts < (cauldronSlotsCount === 2 ? 450 : 850)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '12px',
                      background:
                        knuts >= (cauldronSlotsCount === 2 ? 450 : 850)
                          ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                          : 'rgba(51, 65, 85, 0.4)',
                      border: 'none',
                      color: knuts >= (cauldronSlotsCount === 2 ? 450 : 850) ? '#18120e' : '#64748b',
                      fontWeight: 900,
                      fontSize: '0.84rem',
                      cursor: knuts >= (cauldronSlotsCount === 2 ? 450 : 850) ? 'pointer' : 'not-allowed',
                      boxShadow: '0 0 15px rgba(245, 158, 11, 0.3)'
                    }}
                  >
                    Unlock Slot #{cauldronSlotsCount + 1} ({cauldronSlotsCount === 2 ? 450 : 850} Knuts)
                  </button>
                ) : (
                  <div
                    style={{
                      textAlign: 'center',
                      fontSize: '0.78rem',
                      color: '#34d399',
                      fontWeight: 700,
                      padding: '6px'
                    }}
                  >
                    ✨ Maximum Table Cauldrons Unlocked!
                  </div>
                )}
              </div>

              {/* Hopping Pot Information */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.025)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  padding: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <div style={{ fontSize: '1.6rem' }}>🫕</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f8fafc' }}>
                    Self-Brewing Hopping Pot
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                    Active in your suitcase laboratory! Automatically brews mystery potions for free every 35 seconds.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DAILY SPECIAL BUNDLE */}
          {activeTab === 'daily' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)',
                  border: '1.5px solid #fbbf24',
                  borderRadius: '18px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  boxShadow: '0 0 20px rgba(251, 191, 36, 0.2)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.4rem' }}>📦</span>
                    <div>
                      <div style={{ fontSize: '0.94rem', fontWeight: 900, color: '#fef08a' }}>
                        Alchemist Explorer Crate
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>
                        Daily rotating Apothecary specialty package
                      </div>
                    </div>
                  </div>
                  <span
                    style={{
                      background: '#ef4444',
                      color: '#fff',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '10px'
                    }}
                  >
                    28% OFF
                  </span>
                </div>

                {/* Bundle items list */}
                <div
                  style={{
                    background: 'rgba(0, 0, 0, 0.35)',
                    borderRadius: '12px',
                    padding: '10px',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '8px'
                  }}
                >
                  <div style={{ fontSize: '0.74rem', color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>🎯</span> 1x Focus Mind Draught
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>🧪</span> 1x Wiggenweld Elixir
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>🥚</span> 2x Ashwinder Eggs
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>🌿</span> 2x Dittany Leaves
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ textDecoration: 'line-through', color: '#64748b', fontSize: '0.76rem', marginRight: '6px' }}>
                      270 Knuts
                    </span>
                    <strong style={{ color: '#fbbf24', fontSize: '1.05rem' }}>195 Knuts</strong>
                  </div>

                  <button
                    disabled={knuts < 195}
                    onClick={handleBuyDailyBundle}
                    style={{
                      padding: '10px 18px',
                      background: knuts >= 195 ? 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)' : 'rgba(51, 65, 85, 0.4)',
                      border: 'none',
                      borderRadius: '12px',
                      color: knuts >= 195 ? '#18120e' : '#64748b',
                      fontSize: '0.82rem',
                      fontWeight: 900,
                      cursor: knuts >= 195 ? 'pointer' : 'not-allowed',
                      boxShadow: knuts >= 195 ? '0 0 14px rgba(251, 191, 36, 0.4)' : 'none'
                    }}
                  >
                    Claim Bundle
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
