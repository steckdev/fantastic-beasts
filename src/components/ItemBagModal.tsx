import React, { useState } from 'react';
import { X, Sparkles, Zap, Package, Utensils, ShoppingBag, Coins } from 'lucide-react';
import { ITEMS } from '../data/itemsData';
import { sounds } from '../services/soundService';
import { Item } from '../types';

interface ItemBagModalProps {
  inventory: Record<string, number>;
  onUseItem: (itemKey: string) => void;
  onOpenSanctuary: () => void;
  onBuyItem?: (itemKey: string, costKnuts: number, count?: number) => void;
  onClose: () => void;
}

export default function ItemBagModal({
  inventory,
  onUseItem,
  onOpenSanctuary,
  onBuyItem,
  onClose
}: ItemBagModalProps) {
  const [activeTab, setActiveTab] = useState<'inventory' | 'shop'>('inventory');
  const [activeCategory, setActiveCategory] = useState<'all' | 'treat' | 'energy' | 'lure'>('all');

  const categories: { id: 'all' | 'treat' | 'energy' | 'lure'; label: string }[] = [
    { id: 'all', label: 'All Items' },
    { id: 'treat', label: 'Treats' },
    { id: 'energy', label: 'Energy' },
    { id: 'lure', label: 'Lures & Artifacts' }
  ];

  const shopItems: { key: string; name: string; price: number; icon: string; desc: string; count: number }[] = [
    {
      key: 'energy_crystal',
      name: 'Leyline Energy Crystal',
      price: 120,
      icon: '💎',
      desc: 'Restores +40 Spell Energy instantly when shattered.',
      count: 1
    },
    {
      key: 'beast_lure',
      name: 'Enchanted Suitcase Lure',
      price: 150,
      icon: '🧳',
      desc: 'Draws 4 wild rare Fantastic Beasts directly to your location for 15 min.',
      count: 1
    },
    {
      key: 'treat_brioche',
      name: "Jacob's Sweet Brioche",
      price: 50,
      icon: '🥐',
      desc: 'Golden buttery pastry. Calms unruly wild beasts (+35% catch rate).',
      count: 2
    },
    {
      key: 'treat_gilded_knut',
      name: 'Gilded Sugar Coin',
      price: 60,
      icon: '✨',
      desc: 'Shimmering edible gold coin irresistible to greedy creatures (+45% catch rate).',
      count: 2
    },
    {
      key: 'treat_woodlice',
      name: 'Enchanted Woodlice',
      price: 40,
      icon: '🐛',
      desc: 'Sweet organic fairy woodlice. Favorite delicacy of Bowtruckles.',
      count: 2
    },
    {
      key: 'treat_moon_pellets',
      name: 'Silver Moon Pellets',
      price: 70,
      icon: '🌕',
      desc: 'Imbued with starlight. Cherished by Mooncalves, Qilin, and Demiguises.',
      count: 2
    },
    {
      key: 'treat_dragon_fruit',
      name: 'Dragon Fire Pepper',
      price: 90,
      icon: '🌶️',
      desc: 'Incandescent fiery treat favored by Thunderbirds and Phoenixes.',
      count: 1
    }
  ];

  const totalItemCount = Object.keys(ITEMS).reduce((sum, key) => {
    if (key === 'knuts') return sum;
    return sum + (inventory[key] || 0);
  }, 0);

  const filteredItemKeys = Object.keys(ITEMS).filter((key) => {
    if (key === 'knuts') return false; // Knuts are currency, displayed at top
    if (activeCategory === 'all') return true;
    return ITEMS[key].category === activeCategory;
  });

  const knuts = inventory.knuts || 0;

  return (
    <div className="modal-overlay" style={{ zIndex: 1150 }}>
      <div
        className="glass-panel"
        style={{
          width: '94%',
          maxWidth: '460px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          padding: '20px 16px',
          background: 'radial-gradient(circle at 50% 20%, #1e293b 0%, #090d16 100%)',
          border: '2px solid var(--border-gold-bright)',
          overflow: 'hidden'
        }}
      >
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'rgba(251, 191, 36, 0.15)',
                border: '1px solid #fbbf24',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px'
              }}
            >
              {activeTab === 'inventory' ? '🎒' : '🏪'}
            </div>
            <div>
              <h2 className="font-cinzel title-glow" style={{ fontSize: '1.25rem', color: '#fef08a', fontWeight: 800 }}>
                {activeTab === 'inventory' ? 'Enchanted Satchel' : 'Diagon Alley Supply Shop'}
              </h2>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                {activeTab === 'inventory'
                  ? `${totalItemCount} Magical Provisions Carried`
                  : 'Replenish potions, lures & treats with Knuts'}
              </div>
            </div>
          </div>

          <button className="btn-icon" style={{ width: '34px', height: '34px' }} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Currency Ribbon */}
        <div
          className="glass-card"
          style={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            padding: '8px 12px',
            marginBottom: '10px',
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid var(--border-gold)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '18px' }}>🪙</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fbbf24' }}>
              {knuts} Knuts
            </span>
          </div>

          <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '18px' }}>⚡</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#38bdf8' }}>
              {inventory.spell_energy || 0} / 100 Energy
            </span>
          </div>
        </div>

        {/* View Switcher: Satchel vs Diagon Alley Shop */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
          <button
            onClick={() => setActiveTab('inventory')}
            className={activeTab === 'inventory' ? 'btn-magical' : 'btn-secondary'}
            style={{ flex: 1, padding: '7px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            <span>🎒</span>
            <span>Satchel ({totalItemCount})</span>
          </button>
          <button
            onClick={() => setActiveTab('shop')}
            className={activeTab === 'shop' ? 'btn-magical' : 'btn-secondary'}
            style={{ flex: 1, padding: '7px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            <span>🏪</span>
            <span>Diagon Alley Shop</span>
          </button>
        </div>

        {/* Main Body */}
        {activeTab === 'inventory' ? (
          <>
            {/* Category Filters */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', overflowX: 'auto', paddingBottom: '2px' }}>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={activeCategory === cat.id ? 'btn-magical' : 'btn-secondary'}
                  style={{ padding: '4px 10px', fontSize: '0.72rem', borderRadius: 'var(--radius-full)', whiteSpace: 'nowrap' }}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Carried Item List */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                paddingRight: '4px'
              }}
            >
              {filteredItemKeys.map((key) => {
                const item: Item = ITEMS[key];
                const count = inventory[key] || 0;
                const isUsable = (key === 'beast_lure' || key === 'energy_crystal') && count > 0;
                const isTreat = item.category === 'treat';

                return (
                  <div
                    key={key}
                    className="glass-card"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      opacity: count > 0 ? 1 : 0.45,
                      border: count > 0 ? '1px solid rgba(251, 191, 36, 0.25)' : '1px solid rgba(255,255,255,0.06)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '10px',
                          background: 'rgba(0,0,0,0.4)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '24px',
                          flexShrink: 0
                        }}
                      >
                        {item.icon}
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span className="font-cinzel" style={{ fontSize: '0.86rem', fontWeight: 700, color: '#fef08a' }}>
                            {item.name}
                          </span>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 800,
                              color: count > 0 ? '#38bdf8' : '#64748b',
                              background: 'rgba(0,0,0,0.4)',
                              padding: '1px 6px',
                              borderRadius: '6px'
                            }}
                          >
                            x{count}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px', lineHeight: 1.3 }}>
                          {item.description}
                        </div>
                      </div>
                    </div>

                    <div style={{ flexShrink: 0, marginLeft: '10px' }}>
                      {isUsable ? (
                        <button
                          className="btn-magical"
                          onClick={() => {
                            sounds.playWandCast('masterful');
                            onUseItem(key);
                          }}
                          style={{ padding: '6px 12px', fontSize: '0.74rem' }}
                        >
                          Use
                        </button>
                      ) : isTreat ? (
                        <button
                          className="btn-secondary"
                          onClick={() => {
                            sounds.playPurr();
                            onOpenSanctuary();
                            onClose();
                          }}
                          style={{ padding: '6px 10px', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                          title="Open Suitcase Sanctuary to feed this treat"
                        >
                          <Utensils size={12} color="#fbbf24" />
                          <span>Feed</span>
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          /* Diagon Alley Shop Market */
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              paddingRight: '4px'
            }}
          >
            {shopItems.map((prod) => {
              const canAfford = knuts >= prod.price;
              const inStock = inventory[prod.key] || 0;

              return (
                <div
                  key={prod.key}
                  className="glass-card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    border: canAfford ? '1px solid rgba(251, 191, 36, 0.3)' : '1px solid rgba(255,255,255,0.08)',
                    background: 'rgba(15, 23, 42, 0.75)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '10px',
                        background: 'rgba(0,0,0,0.4)',
                        border: '1px solid rgba(251, 191, 36, 0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                        flexShrink: 0
                      }}
                    >
                      {prod.icon}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="font-cinzel" style={{ fontSize: '0.86rem', fontWeight: 700, color: '#fef08a' }}>
                          {prod.name}
                        </span>
                        {prod.count > 1 && (
                          <span style={{ fontSize: '0.72rem', color: '#a855f7', fontWeight: 800 }}>
                            (x{prod.count})
                          </span>
                        )}
                        <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                          [Carrying: {inStock}]
                        </span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px', lineHeight: 1.3 }}>
                        {prod.desc}
                      </div>
                    </div>
                  </div>

                  <div style={{ flexShrink: 0, marginLeft: '10px' }}>
                    <button
                      className={canAfford ? 'btn-magical' : 'btn-secondary'}
                      disabled={!canAfford}
                      onClick={() => {
                        if (onBuyItem && canAfford) {
                          onBuyItem(prod.key, prod.price, prod.count);
                        }
                      }}
                      style={{
                        padding: '6px 12px',
                        fontSize: '0.74rem',
                        opacity: canAfford ? 1 : 0.45,
                        cursor: canAfford ? 'pointer' : 'not-allowed',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      🪙 {prod.price} Knuts
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <button
          className="btn-secondary"
          onClick={onClose}
          style={{ width: '100%', marginTop: '12px', padding: '10px' }}
        >
          Close Satchel
        </button>
      </div>
    </div>
  );
}
