'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  RotateCw, 
  Edit3, 
  LogOut, 
  Sparkles, 
  Zap,
  Check,
  Building2,
  Warehouse,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { BrandProfile } from './types';
import { supabaseFetchBrandById, supabaseUpsertBrand } from '../lib/supabaseClient';
import EditBrandProfileSheet from './EditBrandProfileSheet';
import styles from './brand-mobile.module.css';

interface ApprovalPendingScreenProps {
  brand: BrandProfile;
  onUpdateBrand: (updated: BrandProfile) => void;
  onApproveSuccess: () => void;
  onSignOut: () => void;
  onToast?: (msg: string) => void;
}

export default function ApprovalPendingScreen({
  brand,
  onUpdateBrand,
  onApproveSuccess,
  onSignOut,
  onToast
}: ApprovalPendingScreenProps) {
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [isEditingDossier, setIsEditingDossier] = useState(false);
  const [lastCheckedTime, setLastCheckedTime] = useState<string>('Just now');
  const [isFastTracking, setIsFastTracking] = useState(false);

  // Background auto-polling every 8 seconds to check if brand was approved in Supabase
  useEffect(() => {
    const lookupKey = brand.id || brand.name;
    if (!lookupKey) return;

    const interval = setInterval(async () => {
      try {
        const dbBrand = await supabaseFetchBrandById(lookupKey, true);
        if (dbBrand && (dbBrand.status === 'Approved' || dbBrand.status === 'Published')) {
          onToast?.('🎉 Application Approved! Welcome to DROBE Partner Network.');
          onApproveSuccess();
        }
      } catch {
        // Silent background polling error handling
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [brand.id, brand.name, onApproveSuccess, onToast]);

  const handleManualCheckStatus = async () => {
    setIsCheckingStatus(true);
    const lookupKey = brand.id || brand.name;

    try {
      if (lookupKey) {
        const dbBrand = await supabaseFetchBrandById(lookupKey, true);
        setLastCheckedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

        if (dbBrand && (dbBrand.status === 'Approved' || dbBrand.status === 'Published')) {
          const updated: BrandProfile = {
            ...brand,
            status: 'Approved'
          };
          onUpdateBrand(updated);
          onToast?.('🎉 Application Approved! Welcome to DROBE Partner Network.');
          onApproveSuccess();
          return;
        }
      }
      onToast?.('⏳ Application is still undergoing verification by the curation team.');
    } catch {
      onToast?.('Status verified: Application currently under review.');
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleSimulateApproval = async () => {
    setIsFastTracking(true);
    try {
      const approvedBrand: BrandProfile = {
        ...brand,
        status: 'Approved',
        updatedAt: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      };

      // Save to Supabase and local state
      await supabaseUpsertBrand(approvedBrand);
      onUpdateBrand(approvedBrand);

      // Fire celebratory confetti
      try {
        const confettiModule = (await import('canvas-confetti')).default;
        confettiModule({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.55 },
          colors: ['#2F69FE', '#38BDF8', '#10B981', '#FF6B00']
        });
      } catch {
        // fallback
      }

      onToast?.('⚡ Fast-Track Approved! Live Brand Dashboard Unlocked.');
      onApproveSuccess();
    } catch (err) {
      console.warn('Fast-track approval error:', err);
      onToast?.('Failed to fast-track approval.');
    } finally {
      setIsFastTracking(false);
    }
  };

  const isUpiPayout = brand.bankAccount?.payoutMethod === 'upi';
  const warehouseName = brand.warehouse === 'chandigarh'
    ? 'Chandigarh Express Darkstore'
    : brand.warehouse === 'gurgaon'
    ? 'Gurgaon CyberCity Hub'
    : brand.warehouse === 'lucknow'
    ? 'Lucknow Metro Darkstore'
    : 'Ahmedabad Mega Darkstore #01';

  return (
    <div className={styles.obPendingContainer}>
      {/* Ambient Lighting Mesh Glow */}
      <div className={styles.bdMeshGlow} />

      {/* 1. TOP NAVIGATION BAR */}
      <header className={styles.obTopNav}>
        <div className={styles.obBrandEmblemGroup}>
          <span className={styles.obBrandWordmark}>DROBE</span>
          <span className={styles.obPartnerTag}>PORTAL</span>
        </div>

        <button
          type="button"
          onClick={onSignOut}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12.5px',
            fontWeight: 700,
            color: '#64748B',
            backgroundColor: '#FFFFFF',
            border: '1.5px solid rgba(148, 163, 184, 0.2)',
            padding: '7px 14px',
            borderRadius: '9999px',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(24, 39, 75, 0.04)',
            fontFamily: 'inherit'
          }}
        >
          <LogOut size={13} />
          <span>Exit / Sign Out</span>
        </button>
      </header>

      {/* 2. MAIN CENTER STAGE */}
      <main style={{
        maxWidth: '560px',
        margin: '0 auto',
        padding: '24px 18px',
        width: '100%',
        boxSizing: 'border-box',
        position: 'relative',
        zIndex: 2
      }}>
        {/* HERO STATUS CARD */}
        <div className={styles.obPendingHeroCard}>
          {/* Live Breathing Pulse Pill */}
          <div className={styles.obLiveStatusPill}>
            <span className={styles.obPulseDotAmber} />
            <span>APPLICATION UNDER REVIEW</span>
          </div>

          <h1 style={{
            fontSize: '26px',
            fontWeight: 850,
            letterSpacing: '-0.03em',
            color: '#0F172A',
            margin: '0 0 8px 0'
          }}>
            Dossier Under Curation Review
          </h1>

          <p style={{
            fontSize: '13.5px',
            color: '#64748B',
            maxWidth: '440px',
            margin: '0 auto 20px auto',
            lineHeight: 1.5
          }}>
            Your brand dossier has been submitted and is undergoing verification by the DROBE merchant curation committee.
          </p>

          {/* Brand Profile Quick View */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            background: '#F8FAFD',
            borderRadius: '22px',
            padding: '14px 16px',
            border: '1.5px solid rgba(148, 163, 184, 0.16)',
            marginBottom: '18px',
            textAlign: 'left'
          }}>
            {brand.profileImage ? (
              <img
                src={brand.profileImage}
                alt={brand.name}
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '16px',
                  objectFit: 'cover',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  backgroundColor: '#FFFFFF',
                  flexShrink: 0
                }}
              />
            ) : (
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '16px',
                backgroundColor: '#EEF3FF',
                color: '#2F69FE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                fontWeight: 900,
                flexShrink: 0
              }}>
                {brand.name ? brand.name.slice(0, 1).toUpperCase() : 'B'}
              </div>
            )}

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {brand.name || 'Your Brand'}
                </h3>
                <span style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  backgroundColor: '#EEF3FF',
                  color: '#2F69FE',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  textTransform: 'uppercase'
                }}>
                  {brand.category || 'Luxury'}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                {brand.basedOutOf ? `${brand.basedOutOf} · ` : ''}Est. {brand.establishedYear || '2024'}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsEditingDossier(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '12px',
                fontWeight: 700,
                color: '#2F69FE',
                backgroundColor: '#EEF3FF',
                border: '1px solid rgba(47, 105, 254, 0.2)',
                padding: '7px 12px',
                borderRadius: '9999px',
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              <Edit3 size={12} />
              <span>Edit</span>
            </button>
          </div>

          {/* Quick Bento Specs */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px'
          }}>
            <div style={{ background: '#F8FAFD', padding: '10px', borderRadius: '16px', border: '1px solid rgba(148, 163, 184, 0.14)', textAlign: 'left' }}>
              <span style={{ fontSize: '10px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>
                Fulfillment Hub
              </span>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A', marginTop: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {warehouseName}
              </div>
            </div>

            <div style={{ background: '#F8FAFD', padding: '10px', borderRadius: '16px', border: '1px solid rgba(148, 163, 184, 0.14)', textAlign: 'left' }}>
              <span style={{ fontSize: '10px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>
                Payout Destination
              </span>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A', marginTop: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {isUpiPayout ? 'UPI Settlement' : 'Direct Bank'}
              </div>
            </div>

            <div style={{ background: '#ECFDF5', padding: '10px', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.2)', textAlign: 'left' }}>
              <span style={{ fontSize: '10px', color: '#065F46', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>
                Activation Fee
              </span>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#065F46', marginTop: '3px' }}>
                ✓ ₹99 Paid
              </div>
            </div>
          </div>
        </div>

        {/* 4-STAGE TACTILE VERIFICATION ROADMAP */}
        <div className={styles.obTimelineStageCard}>
          <h3 style={{ fontSize: '12px', fontWeight: 850, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748B', margin: '0 0 16px 0' }}>
            Verification Stages
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Stage 1: Done */}
            <div className={styles.obTimelineStep}>
              <div className={styles.obTimelineNum} style={{ background: '#ECFDF5', color: '#065F46' }}>
                <Check size={16} strokeWidth={3} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>
                  1. Brand Dossier &amp; ₹99 Activation Paid
                </div>
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px', lineHeight: 1.4 }}>
                  Commercial terms agreed (1% brand sales fee), ₹99 fee paid via Razorpay, and payout banking registered.
                </div>
              </div>
              <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#065F46', background: '#ECFDF5', padding: '3px 8px', borderRadius: '9999px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                Passed
              </span>
            </div>

            {/* Stage 2: In Review */}
            <div className={styles.obTimelineStep}>
              <div className={styles.obTimelineNum} style={{ background: '#FFFBEB', color: '#B45309' }}>
                <Clock size={16} strokeWidth={2.5} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#B45309' }}>
                  2. Merchant Curation &amp; Quality Standards Review
                </div>
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px', lineHeight: 1.4 }}>
                  The curation team is verifying aesthetic standards, craftsmanship tier, and catalog readiness.
                </div>
              </div>
              <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#B45309', background: '#FFFBEB', padding: '3px 8px', borderRadius: '9999px', border: '1px solid #FDE68A' }}>
                In Review
              </span>
            </div>

            {/* Stage 3: Upcoming */}
            <div className={styles.obTimelineStep} style={{ opacity: 0.6 }}>
              <div className={styles.obTimelineNum} style={{ background: '#F1F5F9', color: '#94A3B8' }}>
                3
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#475569' }}>
                  3. Ahmedabad Darkstore Shelf Allocation
                </div>
                <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>
                  Climate-controlled garment racks and barcode serialization reserved at Hub #01.
                </div>
              </div>
              <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#94A3B8', background: '#F1F5F9', padding: '3px 8px', borderRadius: '9999px' }}>
                Pending
              </span>
            </div>

            {/* Stage 4: Upcoming */}
            <div className={styles.obTimelineStep} style={{ opacity: 0.6 }}>
              <div className={styles.obTimelineNum} style={{ background: '#F1F5F9', color: '#94A3B8' }}>
                4
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#475569' }}>
                  4. Live Storefront &amp; 10-Min Doorstep Dispatch
                </div>
                <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>
                  Main admin dashboard unlocks and products become available for instant doorstep trial.
                </div>
              </div>
              <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#94A3B8', background: '#F1F5F9', padding: '3px 8px', borderRadius: '9999px' }}>
                Pending
              </span>
            </div>
          </div>
        </div>

        {/* ACTION CONTROLS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          <button
            type="button"
            onClick={handleManualCheckStatus}
            disabled={isCheckingStatus}
            className={styles.obBtnPrimary}
            style={{ height: '52px' }}
          >
            <RotateCw size={15} className={isCheckingStatus ? 'animate-spin' : ''} />
            <span>{isCheckingStatus ? 'Querying Live Database...' : 'Check Live Approval Status'}</span>
          </button>

          <div style={{ textAlign: 'center', fontSize: '11.5px', color: '#94A3B8' }}>
            Auto-checking every 8s · Last checked: {lastCheckedTime}
          </div>
        </div>

        {/* DEVELOPER / ADMIN SIMULATION CARD */}
        <div style={{
          background: 'linear-gradient(135deg, #EEF3FF 0%, #F4F6FB 100%)',
          border: '1.5px dashed rgba(47, 105, 254, 0.35)',
          borderRadius: '24px',
          padding: '18px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#2F69FE', marginBottom: '4px' }}>
            🛠️ Brand Admin Fast-Track Simulation
          </div>
          <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 14px 0', lineHeight: 1.4 }}>
            For evaluation &amp; preview: Click below to simulate instant approval and unlock the live brand dashboard immediately.
          </p>
          <button
            type="button"
            onClick={handleSimulateApproval}
            disabled={isFastTracking}
            className={styles.obBtnPrimary}
            style={{
              height: '44px',
              fontSize: '13.5px',
              maxWidth: '320px',
              margin: '0 auto'
            }}
          >
            <Sparkles size={14} />
            <span>{isFastTracking ? 'Activating...' : 'Simulate Approval → Unlock Dashboard'}</span>
          </button>
        </div>

        {/* Support Footer */}
        <div style={{ textAlign: 'center', marginTop: '28px', fontSize: '12px', color: '#64748B' }}>
          <span>Have questions regarding your brand application? Contact </span>
          <a href="mailto:concierge@drobe.one" style={{ color: '#2F69FE', fontWeight: 700, textDecoration: 'none' }}>
            concierge@drobe.one
          </a>
        </div>
      </main>

      {/* Profile Edit Drawer */}
      <EditBrandProfileSheet
        brand={brand}
        isOpen={isEditingDossier}
        onClose={() => setIsEditingDossier(false)}
        onSave={(updated) => {
          onUpdateBrand(updated);
          supabaseUpsertBrand(updated);
          onToast?.('Dossier updated successfully.');
        }}
      />
    </div>
  );
}
