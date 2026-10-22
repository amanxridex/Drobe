'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Smartphone, 
  Zap, 
  Building2, 
  User, 
  LogOut, 
  Edit3, 
  CheckCircle2,
  MapPin,
  Sparkles,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { BrandProfile } from './types';
import styles from './brand-mobile.module.css';

export interface BrandProfilePageProps {
  brand: BrandProfile;
  onBack?: () => void;
  onUpdateBrand?: (updated: BrandProfile) => void;
  onEditClick?: () => void;
  onSignOut?: () => void;
  onToast?: (msg: string) => void;
}

export default function BrandProfilePage({
  brand,
  onBack,
  onUpdateBrand,
  onEditClick,
  onSignOut,
  onToast
}: BrandProfilePageProps) {
  // Interactive Merchant Settings Toggles
  const [trialAlerts, setTrialAlerts] = useState(true);
  const [autoSettlements, setAutoSettlements] = useState(true);
  const [lowStockAlerts, setLowStockAlerts] = useState(true);

  const brandName = brand.name && brand.name.trim().length > 0 ? brand.name : 'Your Brand';
  const founderName = brand.founderName && brand.founderName.trim().length > 0 ? brand.founderName : 'Founder & Creative Lead';
  const founderRole = brand.founderRole || 'Founder & Director';
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
    <div className={styles.mobileContainer} style={{ width: '100%', height: '100%', minHeight: '100%', backgroundColor: '#F4F6FB', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Ambient Lighting Mesh Glow */}
      <div className={styles.bdMeshGlow} />

      {/* 1. TOP STICKY NAVIGATION BAR */}
      <header style={{
        height: '56px',
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        zIndex: 30,
        backgroundColor: 'rgba(244, 246, 251, 0.94)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(148, 163, 184, 0.15)'
      }}>
        {/* Back Button */}
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to dashboard"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            height: '34px',
            padding: '0 12px 0 8px',
            borderRadius: '9999px',
            backgroundColor: '#FFFFFF',
            border: '1.5px solid rgba(148, 163, 184, 0.25)',
            color: '#0F172A',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(24, 39, 75, 0.05)',
            transition: 'transform 0.15s ease'
          }}
        >
          <ArrowLeft size={16} color="#2F69FE" />
          <span>Dashboard</span>
        </button>

        {/* Title */}
        <div style={{
          fontSize: '15px',
          fontWeight: 850,
          color: '#0F172A',
          letterSpacing: '-0.02em',
          textAlign: 'center'
        }}>
          Brand Profile
        </div>

        {/* Verified Badge */}
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '11px',
          fontWeight: 800,
          color: '#059669',
          background: '#ECFDF5',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          padding: '4px 8px',
          borderRadius: '9999px'
        }}>
          <CheckCircle2 size={12} />
          Verified
        </span>
      </header>

      {/* 2. SCROLLABLE PAGE BODY */}
      <main style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '16px 18px 36px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        position: 'relative',
        zIndex: 2,
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        WebkitOverflowScrolling: 'touch'
      }}>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
        >
          {/* --- CARD 1: HERO MERCHANT IDENTITY --- */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '24px',
            padding: '20px 18px',
            boxShadow: '0 10px 30px -4px rgba(24, 39, 75, 0.06)',
            border: '1.5px solid rgba(255, 255, 255, 0.95)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Subtle Radial Glow */}
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '130px',
              height: '130px',
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
                    width: '68px',
                    height: '68px',
                    borderRadius: '22px',
                    objectFit: 'cover',
                    boxShadow: '0 8px 20px -3px rgba(47, 105, 254, 0.25)',
                    border: '2px solid #FFFFFF',
                    flexShrink: 0
                  }}
                />
              ) : (
                <div style={{
                  width: '68px',
                  height: '68px',
                  borderRadius: '22px',
                  background: 'linear-gradient(135deg, #2F69FE 0%, #1D4ED8 100%)',
                  color: '#FFFFFF',
                  fontSize: '24px',
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <h1 style={{ fontSize: '20px', fontWeight: 850, color: '#0F172A', margin: 0, letterSpacing: '-0.025em' }}>
                    {brandName}
                  </h1>
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
                    Verified Partner
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: '#334155', fontWeight: 650, marginTop: '4px' }}>
                  <User size={14} color="#2F69FE" />
                  <span>Founder: <strong>{founderName}</strong></span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                  <MapPin size={13} color="#94A3B8" />
                  <span>{brand.basedOutOf || 'India'} · {category}</span>
                </div>
              </div>
            </div>

            {/* Tagline / Bio if present */}
            {brand.tagline && (
              <div style={{
                marginTop: '14px',
                padding: '10px 12px',
                borderRadius: '12px',
                background: '#F8FAFD',
                border: '1px solid rgba(148, 163, 184, 0.15)',
                fontSize: '12.5px',
                color: '#475569',
                fontStyle: 'italic',
                lineHeight: 1.4
              }}>
                "{brand.tagline}"
              </div>
            )}

            {/* Warehouse Allocation Sub-bar */}
            <div style={{
              marginTop: '14px',
              paddingTop: '12px',
              borderTop: '1px solid rgba(148, 163, 184, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '12px',
              color: '#475569'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Building2 size={14} color="#2F69FE" />
                <span style={{ fontWeight: 600 }}>{warehouse}</span>
              </span>
              <span style={{
                fontWeight: 800,
                color: '#0F172A',
                background: '#F1F5F9',
                padding: '3px 8px',
                borderRadius: '6px',
                fontSize: '11px'
              }}>
                1% Take Rate
              </span>
            </div>
          </div>

          {/* --- CARD 2: MERCHANT OPERATIONAL SETTINGS --- */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '24px',
            padding: '20px 18px',
            boxShadow: '0 10px 30px -4px rgba(24, 39, 75, 0.06)',
            border: '1.5px solid rgba(255, 255, 255, 0.95)'
          }}>
            <div style={{
              fontSize: '12px',
              fontWeight: 800,
              color: '#0F172A',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Zap size={15} color="#2F69FE" />
              <span>Merchant Settings</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Setting 1: Trial Alerts */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 750, color: '#0F172A' }}>
                    Instant Trial Alerts (WhatsApp / SMS)
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px', lineHeight: 1.4 }}>
                    Real-time notifications whenever a customer books a 10-minute doorstep fitting.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle('Instant Trial Alerts', trialAlerts, setTrialAlerts)}
                  style={{
                    width: '48px',
                    height: '28px',
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
                    width: '24px',
                    height: '24px',
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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 750, color: '#0F172A' }}>
                    Automated T+1 Daily Settlements
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px', lineHeight: 1.4 }}>
                    Direct auto-deposit of kept &amp; purchased pieces into your bank account every morning.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle('Automated Settlements', autoSettlements, setAutoSettlements)}
                  style={{
                    width: '48px',
                    height: '28px',
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
                    width: '24px',
                    height: '24px',
                    borderRadius: '9999px',
                    backgroundColor: '#FFFFFF',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.18)',
                    transform: autoSettlements ? 'translateX(20px)' : 'translateX(0)',
                    transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
                  }} />
                </button>
              </div>

              <div style={{ height: '1px', backgroundColor: 'rgba(148, 163, 184, 0.12)' }} />

              {/* Setting 3: Low-Stock Reorder Alerts */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 750, color: '#0F172A' }}>
                    Low-Stock Reorder Alerts
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px', lineHeight: 1.4 }}>
                    Notify your operations team automatically when darkstore inventory drops below 5 units.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle('Low-Stock Alerts', lowStockAlerts, setLowStockAlerts)}
                  style={{
                    width: '48px',
                    height: '28px',
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
                    width: '24px',
                    height: '24px',
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

          {/* --- CARD 3: SECURITY & ACTIVE SESSIONS --- */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '24px',
            padding: '20px 18px',
            boxShadow: '0 10px 30px -4px rgba(24, 39, 75, 0.06)',
            border: '1.5px solid rgba(255, 255, 255, 0.95)'
          }}>
            <div style={{
              fontSize: '12px',
              fontWeight: 800,
              color: '#0F172A',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={15} color="#059669" />
                <span>Security &amp; Active Sessions</span>
              </div>
              <span style={{
                fontSize: '10.5px',
                fontWeight: 800,
                color: '#059669',
                background: '#ECFDF5',
                padding: '3px 9px',
                borderRadius: '9999px'
              }}>
                1 Active
              </span>
            </div>

            <div style={{
              background: '#F8FAFD',
              borderRadius: '16px',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              border: '1px solid rgba(148, 163, 184, 0.16)'
            }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '14px',
                background: '#EEF3FF',
                color: '#2F69FE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Smartphone size={20} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13.5px', fontWeight: 750, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>Current Device (Mobile Web)</span>
                  <span style={{ width: '7px', height: '7px', borderRadius: '9999px', backgroundColor: '#10B981', display: 'inline-block' }} />
                </div>
                <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px' }}>
                  Ahmedabad, IN · Signed in via Founder Credentials
                </div>
              </div>
            </div>

            <div style={{ marginTop: '12px', fontSize: '11px', color: '#94A3B8', textAlign: 'center' }}>
              End-to-End TLS Encrypted · Supabase Auth Protected
            </div>
          </div>

          {/* --- CARD 4: PRIMARY ACTION BUTTONS --- */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
            {onEditClick && (
              <button
                type="button"
                onClick={onEditClick}
                className={styles.obBtnPrimary}
                style={{ height: '52px', fontSize: '15px' }}
              >
                <Edit3 size={17} />
                <span>Edit Brand Profile &amp; Dossier</span>
              </button>
            )}

            {onSignOut && (
              <button
                type="button"
                onClick={onSignOut}
                className={styles.obBtnSecondary}
                style={{
                  height: '50px',
                  fontSize: '14.5px',
                  color: '#DC2626',
                  borderColor: 'rgba(220, 38, 38, 0.25)',
                  background: '#FEF2F2'
                }}
              >
                <LogOut size={16} />
                <span>Sign Out of {brandName}</span>
              </button>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
