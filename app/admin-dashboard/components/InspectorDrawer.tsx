'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import styles from '../admin.module.css';

interface InspectorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
  footerActions?: React.ReactNode;
}

export default function InspectorDrawer({
  isOpen,
  onClose,
  title,
  subtitle,
  badge,
  children,
  footerActions
}: InspectorDrawerProps) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', justifyContent: 'flex-end' }}>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.45)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              cursor: 'pointer'
            }}
          />

          {/* Slide-Over Drawer Sheet */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            style={{
              position: 'relative',
              width: '520px',
              maxWidth: '92vw',
              height: '100vh',
              background: 'rgba(255, 255, 255, 0.96)',
              backdropFilter: 'blur(32px) saturate(190%)',
              WebkitBackdropFilter: 'blur(32px) saturate(190%)',
              borderLeft: '1px solid rgba(226, 232, 240, 0.8)',
              boxShadow: '-12px 0 40px rgba(15, 23, 42, 0.16)',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 101,
              overflow: 'hidden',
              fontFamily: 'var(--font-apple-text)',
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale'
            }}
          >
            {/* Drawer Header */}
            <div style={{
              padding: '22px 24px 18px 24px',
              borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
              background: 'rgba(255, 255, 255, 0.85)',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '16px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  {badge}
                </div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 800,
                  letterSpacing: '-0.025em',
                  color: '#0f172a',
                  margin: 0
                }}>
                  {title}
                </h3>
                {subtitle && (
                  <p style={{
                    fontSize: '12.5px',
                    color: '#64748b',
                    margin: '3px 0 0 0',
                    lineHeight: 1.4
                  }}>
                    {subtitle}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 120ms ease',
                  flexShrink: 0
                }}
                title="Close Drawer (Esc)"
              >
                <X size={16} />
              </button>
            </div>

            {/* Drawer Scrollable Content */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}>
              {children}
            </div>

            {/* Drawer Footer Actions (Sticky) */}
            {footerActions && (
              <div style={{
                padding: '16px 24px',
                borderTop: '1px solid rgba(226, 232, 240, 0.8)',
                background: 'rgba(255, 255, 255, 0.92)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '10px'
              }}>
                {footerActions}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
