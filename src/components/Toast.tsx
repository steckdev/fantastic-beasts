import React, { useEffect } from 'react';
import { X, Sparkles, AlertTriangle, CheckCircle, Zap, Award } from 'lucide-react';
import { ToastNotification } from '../types';

interface ToastProps {
  toast: ToastNotification | null;
  onDismiss: () => void;
}

export default function Toast({ toast, onDismiss }: ToastProps) {
  const onDismissRef = React.useRef(onDismiss);
  onDismissRef.current = onDismiss;

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onDismissRef.current();
    }, 2800);
    return () => clearTimeout(timer);
  }, [toast?.id]);

  if (!toast) return null;

  const getIcon = () => {
    switch (toast.type) {
      case 'energy':
        return <Zap size={20} color="#38bdf8" />;
      case 'mark':
        return <Award size={20} color="#fbbf24" />;
      case 'warning':
      case 'error':
        return <AlertTriangle size={20} color="#f87171" />;
      case 'success':
        return <CheckCircle size={20} color="#34d399" />;
      default:
        return <Sparkles size={20} color="#fbbf24" />;
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case 'energy':
        return 'rgba(56, 189, 248, 0.8)';
      case 'mark':
        return 'rgba(251, 191, 36, 0.9)';
      case 'warning':
      case 'error':
        return 'rgba(239, 68, 68, 0.8)';
      case 'success':
        return 'rgba(52, 211, 153, 0.8)';
      default:
        return 'var(--border-gold-bright)';
    }
  };

  return (
    <div
      role="alert"
      onClick={onDismiss}
      style={{
        position: 'fixed',
        top: 'calc(var(--safe-top) + 16px)',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        width: 'calc(100% - 32px)',
        maxWidth: '430px',
        animation: 'slideDown 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        pointerEvents: 'auto',
        cursor: 'pointer'
      }}
    >
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.96) 0%, rgba(10, 15, 29, 0.98) 100%)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: `1.5px solid ${getBorderColor()}`,
          borderRadius: '16px',
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.7), 0 0 20px rgba(245, 158, 11, 0.25)',
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}
      >
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          {getIcon()}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {toast.title && (
            <div
              className="font-cinzel"
              style={{
                fontSize: '0.86rem',
                fontWeight: 700,
                color: '#fef08a',
                letterSpacing: '0.5px',
                marginBottom: '2px',
                lineHeight: 1.2
              }}
            >
              {toast.title}
            </div>
          )}
          <div
            style={{
              fontSize: '0.78rem',
              color: '#e2e8f0',
              lineHeight: 1.35,
              wordBreak: 'break-word'
            }}
          >
            {toast.message}
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
          aria-label="Dismiss message"
        >
          <X size={16} />
        </button>

        {/* Auto-dismiss progress bar indicator */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            height: '3px',
            background: getBorderColor(),
            width: '100%',
            animation: 'toastProgress 2.8s linear forwards'
          }}
        />
      </div>
    </div>
  );
}
