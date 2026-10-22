'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ShieldCheck, 
  Smartphone, 
  Zap, 
  Building2, 
  User, 
  LogOut, 
  Edit3, 
  CheckCircle2,
  MapPin
} from 'lucide-react';
import { BrandProfile } from './types';
import styles from './brand-mobile.module.css';

export interface BrandProfileSheetProps {
  isOpen: boolean;
  onClose: () => void;
  brand: BrandProfile;
  onUpdateBrand?: (updated: BrandProfile) => void;
  onEditClick?: () => void;
  onSignOut?: () => void;
  onToast?: (msg: string) => void;
}

export default function BrandProfileSheet({
  isOpen,
  onClose,
  brand,
  onUpdateBrand,
  onEditClick,
  onSignOut,
  onToast
}: BrandProfileSheetProps) {
  // 2-3 Interactive Merchant Settings Toggles
  const [trialAlerts, setTrialAlerts] = useState(true);
  const [autoSettlements, setAutoSettlements] = useState(true);
  const [lowStockAlerts, setLowStockAlerts] = useState(true);

  const brandName = brand.name && brand.name.trim().length > 0 ? brand.name : 'Your Brand';
  const founderName = brand.founderName && brand.founderName.trim().length > 0 ? brand.founderName : 'Founder & Creative Lead';
  const category = brand.category || 'Luxury Label';
  const warehouse = brand.warehouse === 'chandigarh'
    ? 'Chandigarh Express Darkstore'
    : brand.warehouse === 'gurgaon'
    ? 'Gurgaon CyberCity Hub'
    : brand.warehouse === 'lucknow'
    ? 'Lucknow Metro Darkstore'
    : 'Ahmedabad Mega Darkstore #01';

  const handleToggle = (setting: string, currentVal: boolean, setter: (val: boolean) => void) => {
    const newVal = !currentVal;
    setter(newVal);
    if (onToast) {
      onToast(`${setting} ${newVal ? 'enabled' : 'disabled'}`);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={styles.bdDrawerOverlay} onClick={onClose}>
          <motion.div
            className={styles.bdDrawerSheet}
            style={{
              maxHeight: '92vh',
              padding: '12px 18px 36px 18px',
              backgroundColor: '#F8FAFD',
              borderTopLeftRadius: '32px',
              borderTopRightRadius: '32px'
            }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Handle */}
            <div className={styles.bdDrawerHandle} style={{ background: '#CBD5E1', marginBottom: '14px' }} />

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#2F69FE' }}>
                  Merchant Identity
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 850, color: '#0F172A', margin: '2px 0 0 0', letterSpacing: '-0.025em' }}>
                  Brand Profile
                </h3>
              </div>
              <button
                type="button"
                className={styles.bdDrawerCloseBtn}
                onClick={onClose}
                aria-label="Close Profile"
                style={{ width: '34px', height: '34px', borderRadius: '9999px', background: '#FFFFFF', border: '1px solid rgba(148, 163, 184, 0.25)', color: '#0F172A' }}
              >
                <X size={17} />
              </button>
            </div>

            {/* Scrollable Container */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto', paddingRight: '2px' }}>
              
              {/* --- 1. HERO BRAND & FOUNDER IDENTITY CARD --- */}
              <div style={{
                background: '#FFFFFF',
                borderRadius: '24px',
                padding: '20px 18px',
                boxShadow: '0 10px 30px -4px rgba(24, 39, 75, 0.06)',
                border: '1.5px solid rgba(255, 255, 255, 0.95)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-20px',
                  right: '-20px',
                  width: '120px',
                  height: '120px',
                  borderRadius: '9999px',
                  background: 'radial-gradient(circle, rgba(47, 105, 254, 0.12) 0%, transparent 70%)',
                  pointerEvents: 'none'
                }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  {/* Brand Avatar */}
                  {brand.profileImage ? (
                    <img
                      src={brand.profileImage}
                      alt={brandName}
                      style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '20px',
                        objectFit: 'cover',
                        boxShadow: '0 8px 20px -3px rgba(47, 105, 254, 0.25)',
                        border: '2px solid #FFFFFF',
                        flexShrink: 0
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '20px',
                      background: 'linear-gradient(135deg, #2F69FE 0%, #1D4ED8 100%)',
                      color: '#FFFFFF',
                      fontSize: '22px',
                      fontWeight: 850,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 8px 20px -3px rgba(47, 105, 254, 0.35)',
                      flexShrink: 0
                    }}>
                      {brandName.slice(0, 2).toUpperCase()}
                    </div>
                  )}

                  {/* Brand & Founder Info */}
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <h4 style={{ fontSize: '18px', fontWeight: 850, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
                        {brandName}
                      </h4>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                        fontSize: '10.5px',
                        fontWeight: 800,
                        color: '#059669',
                        background: '#ECFDF5',
                        border: '1px solid rgba(16, 185, 129, 0.25)',
                        padding: '2px 7px',
                        borderRadius: '9999px'
                      }}>
                        <CheckCircle2 size={11} />
                        Verified
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12.5px', color: '#475569', fontWeight: 600, marginTop: '3px' }}>
                      <User size={13} color="#2F69FE" />
                      <span>Founder: <strong>{founderName}</strong></span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11.5px', color: '#64748B', marginTop: '2px' }}>
                      <MapPin size={12} color="#94A3B8" />
                      <span>{brand.basedOutOf || 'India'} · {category}</span>
                    </div>
                  </div>
                </div>

                {/* Sub-bar with tier info */}
                <div style={{
                  marginTop: '14px',
                  paddingTop: '12px',
                  borderTop: '1px solid rgba(148, 163, 184, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '11.5px',
                  color: '#475569'
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Building2 size={13} color="#2F69FE" />
                    <span>{warehouse}</span>
                  </span>
                  <span style={{ fontWeight: 700, color: '#0F172A' }}>
                    1% Merchant Tier
                  </span>
                </div>
              </div>

              {/* --- 2. BASIC SETTINGS SECTION --- */}
              <div style={{
                background: '#FFFFFF',
                borderRadius: '24px',
                padding: '18px',
                boxShadow: '0 10px 30px -4px rgba(24, 39, 75, 0.06)',
                border: '1.5px solid rgba(255, 255, 255, 0.95)'
              }}>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Zap size={14} color="#2F69FE" />
                  <span>Merchant Settings</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Setting 1: Trial Alerts */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13.5px', fontWeight: 750, color: '#0F172A' }}>
                        Instant Trial Alerts (WhatsApp / SMS)
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px', lineHeight: 1.4 }}>
                        Real-time alerts whenever a customer books a 10-minute doorstep fitting.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggle('Instant Trial Alerts', trialAlerts, setTrialAlerts)}
                      style={{
                        width: '46px',
                        height: '26px',
                        borderRadius: '9999px',
                        backgroundColor: trialAlerts ? '#2F69FE' : '#E2E8F0',
                        border: 'none',
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'background-color 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        flexShrink: 0,
                        padding: '2px'
                      }}
                      aria-label="Toggle trial alerts"
                    >
                      <div style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '9999px',
                        backgroundColor: '#FFFFFF',
                        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.18)',
                        transform: trialAlerts ? 'translateX(20px)' : 'translateX(0)',
                        transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
                      }} />
                    </button>
                  </div>

                  <div style={{ height: '1px', backgroundColor: 'rgba(148, 163, 184, 0.12)' }} />

                  {/* Setting 2: Automated T+1 Settlements */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13.5px', fontWeight: 750, color: '#0F172A' }}>
                        Automated T+1 Daily Settlements
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px', lineHeight: 1.4 }}>
                        Direct auto-deposit of purchased pieces to your bank account next morning.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggle('Automated Settlements', autoSettlements, setAutoSettlements)}
                      style={{
                        width: '46px',
                        height: '26px',
                        borderRadius: '9999px',
                        backgroundColor: autoSettlements ? '#2F69FE' : '#E2E8F0',
                        border: 'none',
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'background-color 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        flexShrink: 0,
                        padding: '2px'
                      }}
                      aria-label="Toggle auto settlements"
                    >
                      <div style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '9999px',
                        backgroundColor: '#FFFFFF',
                        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.18)',
                        transform: autoSettlements ? 'translateX(20px)' : 'translateX(0)',
                        transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
                      }} />
                    </button>
                  </div>

                  <div style={{ height: '1px', backgroundColor: 'rgba(148, 163, 184, 0.12)' }} />

                  {/* Setting 3: Low-Stock Darkstore Alert */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13.5px', fontWeight: 750, color: '#0F172A' }}>
                        Low-Stock Reorder Alerts
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px', lineHeight: 1.4 }}>
                        Notify your inventory manager when warehouse stock dips below 5 units.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggle('Low-Stock Alerts', lowStockAlerts, setLowStockAlerts)}
                      style={{
                        width: '46px',
                        height: '26px',
                        borderRadius: '9999px',
                        backgroundColor: lowStockAlerts ? '#2F69FE' : '#E2E8F0',
                        border: 'none',
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'background-color 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        flexShrink: 0,
                        padding: '2px'
                      }}
                      aria-label="Toggle low stock alerts"
                    >
                      <div style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '9999px',
                        backgroundColor: '#FFFFFF',
                        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.18)',
                        transform: lowStockAlerts ? 'translateX(20px)' : 'translateX(0)',
                        transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
                      }} />
                    </button>
                  </div>
                </div>
              </div>

              {/* --- 3. ACTIVE SESSIONS SECTION --- */}
              <div style={{
                background: '#FFFFFF',
                borderRadius: '24px',
                padding: '18px',
                boxShadow: '0 10px 30px -4px rgba(24, 39, 75, 0.06)',
                border: '1.5px solid rgba(255, 255, 255, 0.95)'
              }}>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={14} color="#059669" />
                    <span>Security &amp; Active Sessions</span>
                  </div>
                  <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#059669', background: '#ECFDF5', padding: '2px 8px', borderRadius: '9999px' }}>
                    1 Active
                  </span>
                </div>

                <div style={{
                  background: '#F8FAFD',
                  borderRadius: '16px',
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  border: '1px solid rgba(148, 163, 184, 0.16)'
                }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '12px',
                    background: '#EEF3FF',
                    color: '#2F69FE',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Smartphone size={18} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 750, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>Current Device (Mobile Web)</span>
                      <span style={{ width: '6px', height: '6px', borderRadius: '9999px', backgroundColor: '#10B981', display: 'inline-block' }} />
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                      Ahmedabad, IN · Signed in via Founder Credentials
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '10px', fontSize: '11px', color: '#94A3B8', textAlign: 'center' }}>
                  End-to-End TLS Encrypted · Supabase Auth Protected
                </div>
              </div>

              {/* --- 4. ACTION BUTTONS --- */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
                {onEditClick && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onEditClick();
                    }}
                    className={styles.obBtnPrimary}
                    style={{ height: '50px', fontSize: '14.5px' }}
                  >
                    <Edit3 size={16} />
                    <span>Edit Brand Profile &amp; Dossier</span>
                  </button>
                )}

                {onSignOut && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onSignOut();
                    }}
                    className={styles.obBtnSecondary}
                    style={{ height: '48px', fontSize: '14px', color: '#DC2626', borderColor: 'rgba(220, 38, 38, 0.25)', background: '#FEF2F2' }}
                  >
                    <LogOut size={15} />
                    <span>Sign Out of {brandName}</span>
                  </button>
                )}
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
