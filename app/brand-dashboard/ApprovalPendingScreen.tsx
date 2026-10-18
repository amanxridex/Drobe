'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  Building2, 
  Warehouse, 
  ArrowRight, 
  RotateCw, 
  Edit3, 
  LogOut, 
  Sparkles, 
  AlertCircle, 
  ExternalLink,
  ChevronRight,
  Mail,
  Zap,
  Check
} from 'lucide-react';
import { BrandProfile } from './types';
import { supabaseFetchBrandById, supabaseUpsertBrand } from '../lib/supabaseClient';
import EditBrandProfileSheet from './EditBrandProfileSheet';
import styles from './brand-dashboard.module.css';

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
      } catch (err) {
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
    } catch (err) {
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
          colors: ['#0284c7', '#38bdf8', '#10b981', '#f59e0b']
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
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      color: '#0f172a',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      paddingBottom: '60px'
    }}>
      {/* 1. TOP NAVIGATION BAR */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid #e2e8f0',
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img
            src="/drobe-logo-full.png"
            alt="DROBE"
            style={{ height: '24px', width: 'auto', objectFit: 'contain' }}
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: '#64748b',
            backgroundColor: '#f1f5f9',
            padding: '3px 8px',
            borderRadius: '6px'
          }}>
            Partner Portal
          </span>
        </div>

        <button
          type="button"
          onClick={onSignOut}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12.5px',
            fontWeight: 600,
            color: '#64748b',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            padding: '6px 12px',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <LogOut size={13} />
          <span>Exit / Sign Out</span>
        </button>
      </header>

      {/* 2. MAIN CENTER STAGE */}
      <main style={{
        maxWidth: '680px',
        margin: '0 auto',
        padding: '32px 18px'
      }}>
        {/* Animated Status Pill */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#fef3c7',
            border: '1px solid #fde68a',
            color: '#b45309',
            padding: '6px 14px',
            borderRadius: '24px',
            fontSize: '12.5px',
            fontWeight: 700,
            letterSpacing: '0.01em',
            boxShadow: '0 2px 8px rgba(245, 158, 11, 0.08)'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#f59e0b',
              display: 'inline-block',
              animation: 'pulse 1.8s infinite'
            }} />
            <span>Application Status: Pending Approval</span>
          </div>

          <h1 style={{
            fontSize: '28px',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: '#0f172a',
            marginTop: '14px',
            marginBottom: '8px'
          }}>
            Dossier Under Curation Review
          </h1>

          <p style={{
            fontSize: '14px',
            color: '#64748b',
            maxWidth: '520px',
            margin: '0 auto',
            lineHeight: 1.5
          }}>
            Thank you for applying to the DROBE 30-minute luxury network. Your brand dossier has been submitted and is undergoing curation verification.
          </p>
        </div>

        {/* Brand Overview Card */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '18px',
          border: '1px solid #e2e8f0',
          padding: '20px 22px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '18px' }}>
            {brand.profileImage ? (
              <img
                src={brand.profileImage}
                alt={brand.name}
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '14px',
                  objectFit: 'contain',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#ffffff',
                  padding: '3px'
                }}
              />
            ) : (
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '14px',
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                fontWeight: 800
              }}>
                {brand.name ? brand.name.slice(0, 1).toUpperCase() : 'B'}
              </div>
            )}

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {brand.name || 'Your Brand'}
                </h3>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  backgroundColor: '#f1f5f9',
                  color: '#475569',
                  padding: '2px 8px',
                  borderRadius: '6px'
                }}>
                  {brand.category || 'Luxury Apparel'}
                </span>
              </div>

              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
                {brand.basedOutOf ? `${brand.basedOutOf} · ` : ''}Est. {brand.establishedYear || '2024'} · Directed by {brand.founderName || 'Creative Director'}
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
                fontWeight: 600,
                color: '#2563eb',
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                padding: '6px 12px',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              <Edit3 size={12} />
              <span>Edit Dossier</span>
            </button>
          </div>

          {/* Quick Specifications */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '10px',
            borderTop: '1px solid #f1f5f9',
            paddingTop: '14px'
          }}>
            <div style={{ backgroundColor: '#f8fafc', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', display: 'block' }}>
                Fulfillment Hub
              </span>
              <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f172a', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Warehouse size={13} color="#16a34a" />
                <span>{warehouseName}</span>
              </div>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', display: 'block' }}>
                Payout Destination
              </span>
              <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f172a', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                {isUpiPayout ? <Zap size={13} color="#7c3aed" /> : <Building2 size={13} color="#2563eb" />}
                <span>
                  {isUpiPayout 
                    ? (brand.bankAccount?.upiId || 'UPI Settlement') 
                    : (brand.bankAccount?.bankName || 'Direct Bank')}
                </span>
              </div>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', display: 'block' }}>
                Onboarding Activation
              </span>
              <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#15803d', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Check size={13} color="#16a34a" strokeWidth={2.6} />
                <span>₹99 Fee Paid (Razorpay)</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4-Stage Verification Roadmap */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '18px',
          border: '1px solid #e2e8f0',
          padding: '20px 22px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
          marginBottom: '20px'
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748b', marginBottom: '16px' }}>
            Verification Stages
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Stage 1: Done */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: '#dcfce7',
                color: '#15803d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Check size={15} strokeWidth={3} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>
                  1. Brand Dossier &amp; ₹99 Onboarding Activation Paid
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                  Commercial terms agreed (1% sales commission &amp; 5% user markup fee), ₹99 fee paid via Razorpay, and KYC banking registered.
                </div>
              </div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#15803d', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '6px' }}>
                Passed
              </span>
            </div>

            {/* Stage 2: In Progress */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: '#fef3c7',
                color: '#b45309',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Clock size={15} strokeWidth={2.5} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#b45309' }}>
                  2. Merchant Curation &amp; Quality Standards Review
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                  The DROBE curation committee is verifying brand aesthetic, craftsmanship tier, and catalog readiness.
                </div>
              </div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#b45309', backgroundColor: '#fffbeb', border: '1px solid #fde68a', padding: '2px 8px', borderRadius: '6px' }}>
                In Review
              </span>
            </div>

            {/* Stage 3: Upcoming */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', opacity: 0.65 }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: '#f1f5f9',
                color: '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Warehouse size={14} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#475569' }}>
                  3. Ahmedabad Darkstore Shelf Allocation
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                  Climate-controlled garment racks and barcode serialization reserved at Hub #01.
                </div>
              </div>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '6px' }}>
                Pending
              </span>
            </div>

            {/* Stage 4: Upcoming */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', opacity: 0.65 }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: '#f1f5f9',
                color: '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Sparkles size={14} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#475569' }}>
                  4. Live Storefront &amp; 30-Min Doorstep Dispatch
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                  Main admin dashboard unlocks and products become available for instant doorstep trial.
                </div>
              </div>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '6px' }}>
                Pending
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          <button
            type="button"
            onClick={handleManualCheckStatus}
            disabled={isCheckingStatus}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              backgroundColor: '#0f172a',
              color: '#ffffff',
              padding: '14px 20px',
              borderRadius: '12px',
              fontSize: '13.5px',
              fontWeight: 700,
              cursor: isCheckingStatus ? 'not-allowed' : 'pointer',
              border: 'none',
              boxShadow: '0 4px 14px rgba(15, 23, 42, 0.15)',
              transition: 'all 0.15s ease'
            }}
          >
            <RotateCw size={15} className={isCheckingStatus ? 'animate-spin' : ''} />
            <span>{isCheckingStatus ? 'Querying Live Database...' : 'Check Live Approval Status'}</span>
          </button>

          <div style={{ textAlign: 'center', fontSize: '11.5px', color: '#94a3b8' }}>
            Auto-checking every few seconds · Last checked: {lastCheckedTime}
          </div>
        </div>

        {/* Developer / Admin Instant Simulation Toggle */}
        <div style={{
          backgroundColor: '#eff6ff',
          border: '1px dashed #93c5fd',
          borderRadius: '14px',
          padding: '16px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#1e40af', marginBottom: '4px' }}>
            🛠️ Brand Admin Fast-Track Simulation
          </div>
          <p style={{ fontSize: '11.5px', color: '#3b82f6', margin: '0 0 12px', lineHeight: 1.4 }}>
            For testing and evaluation: Click below to simulate instant approval and reveal the live admin dashboard immediately.
          </p>
          <button
            type="button"
            onClick={handleSimulateApproval}
            disabled={isFastTracking}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '9px 18px',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)'
            }}
          >
            <Sparkles size={14} />
            <span>{isFastTracking ? 'Activating...' : 'Simulate Instant Approval → Unlock Dashboard'}</span>
          </button>
        </div>

        {/* Support & Concierge Footer */}
        <div style={{ textAlign: 'center', marginTop: '28px', fontSize: '12px', color: '#64748b' }}>
          <span>Have questions regarding your brand application? Contact luxury merchant support at </span>
          <a href="mailto:concierge@drobe.one" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>
            concierge@drobe.one
          </a>
        </div>
      </main>

      {/* Profile Edit Drawer if requested */}
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
