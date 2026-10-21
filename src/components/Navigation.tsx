import React from 'react';
import { Map, BookOpen, Scroll, Settings } from 'lucide-react';

interface NavigationProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  unreadTasksCount: number;
  suitcaseCount: number;
}

export default function Navigation({ currentTab, onSelectTab, unreadTasksCount, suitcaseCount }: NavigationProps) {
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
        bottom: 'calc(var(--safe-bottom) + 8px)',
        left: '12px',
        right: '12px',
        maxWidth: '520px',
        margin: '0 auto',
        height: '62px',
        background: 'rgba(11, 15, 25, 0.94)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        borderRadius: '24px',
        border: '1.5px solid rgba(251, 191, 36, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 500,
        boxShadow: '0 12px 35px rgba(0, 0, 0, 0.8), 0 0 20px rgba(217, 119, 6, 0.25)',
        padding: '0 4px'
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
