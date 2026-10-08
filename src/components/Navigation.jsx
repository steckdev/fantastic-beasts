import React from 'react';
import { Map, BookOpen, Scroll, Settings } from 'lucide-react';

export default function Navigation({ currentTab, onSelectTab, unreadTasksCount, suitcaseCount }) {
  const tabs = [
    { id: 'map', label: 'Map', icon: <Map size={20} /> },
    {
      id: 'suitcase',
      label: 'Suitcase',
      icon: <span style={{ fontSize: '20px' }}>🧳</span>,
      badge: suitcaseCount > 0 ? suitcaseCount : null
    },
    { id: 'guide', label: 'Field Guide', icon: <BookOpen size={20} /> },
    {
      id: 'tasks',
      label: 'Tasks',
      icon: <Scroll size={20} />,
      badge: unreadTasksCount > 0 ? unreadTasksCount : null
    },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> }
  ];

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 'calc(64px + var(--safe-bottom))',
        paddingBottom: 'var(--safe-bottom)',
        background: 'rgba(11, 15, 25, 0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid var(--border-gold)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 500,
        boxShadow: '0 -4px 20px rgba(0,0,0,0.5)'
      }}
    >
      {tabs.map((t) => {
        const isActive = currentTab === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onSelectTab(t.id)}
            style={{
              position: 'relative',
              background: 'none',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '3px',
              color: isActive ? '#fbbf24' : '#94a3b8',
              cursor: 'pointer',
              padding: '6px 12px',
              transition: 'all 0.2s ease'
            }}
          >
            {t.icon}
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: isActive ? 700 : 500,
                fontFamily: 'var(--font-sans)',
                letterSpacing: '0.02em'
              }}
            >
              {t.label}
            </span>

            {/* Notification Badge */}
            {t.badge && (
              <span
                style={{
                  position: 'absolute',
                  top: '2px',
                  right: '8px',
                  background: '#ef4444',
                  color: '#fff',
                  fontSize: '9px',
                  fontWeight: 800,
                  padding: '1px 5px',
                  borderRadius: '10px',
                  border: '1px solid #ffffff'
                }}
              >
                {t.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
