'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  AlertCircle,
  Search,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Sparkles,
  Zap,
  ShieldCheck,
  Building2,
  Clock
} from 'lucide-react';
import { BrandProfile, mapDbBrandToBrandProfile } from './types';
import { supabaseFetchBrands, supabaseFetchBrandById, supabaseFetchBrandProducts } from '../lib/supabaseClient';
import { ForgotPasswordModal } from './AuthModals';
import styles from './brand-mobile.module.css';

interface BrandStartScreenProps {
  brand: BrandProfile;
  onStartOnboarding: () => void;
  onViewLiveDashboard: () => void;
  onEditLiveBrand?: () => void;
  onResetBrand?: () => void;
  onLoginSuccess?: (email: string) => void;
  onSelectBrand?: (brand: BrandProfile) => void;
}

const CAROUSEL_SLIDES = [
  {
    id: 'space',
    badge: 'CURATED LUXURY',
    titleLine1: 'Build your luxury',
    titleLine2: 'brand space.',
    subtitle: 'Showcase your signature collections directly to discerning clients on DROBE.',
    accent: 'blue'
  },
  {
    id: 'try',
    badge: '10-MIN RAPID DISPATCH',
    titleLine1: '10-minute doorstep',
    titleLine2: 'try before you buy.',
    subtitle: 'Ahmedabad darkstore riders deliver your garments to doorsteps in 10 minutes so clients try on first.',
    accent: 'orange'
  },
  {
    id: 'control',
    badge: 'DIRECT SETTLEMENTS',
    titleLine1: 'Direct payouts.',
    titleLine2: 'Total brand control.',
    subtitle: 'Real-time darkstore inventory telemetry, 1% sales fee, and automated daily payouts.',
    accent: 'purple'
  }
];

export default function BrandStartScreen({
  brand,
  onStartOnboarding,
  onViewLiveDashboard,
  onEditLiveBrand,
  onResetBrand,
  onLoginSuccess,
  onSelectBrand
}: BrandStartScreenProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [modalTab, setModalTab] = useState<'login' | 'claim'>('claim');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [allBrands, setAllBrands] = useState<BrandProfile[]>([]);
  const [isLoadingBrands, setIsLoadingBrands] = useState(false);
  const [isOpeningBrand, setIsOpeningBrand] = useState(false);

  // Auto-advance carousel smoothly every 5.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  // Fetch live brands from Supabase
  useEffect(() => {
    setIsLoadingBrands(true);
    supabaseFetchBrands().then((brandsList) => {
      if (brandsList && brandsList.length > 0) {
        setAllBrands(brandsList.map(b => mapDbBrandToBrandProfile(b, b.products)));
      }
    }).catch((err) => {
      console.warn('Failed to load brands from Supabase:', err);
    }).finally(() => {
      setIsLoadingBrands(false);
    });
  }, []);

  const isApprovedOrPublished = (brand.status === 'Published' || brand.status === 'Approved') && Boolean(brand.name?.trim());
  const isWaitingApproval = brand.status === 'Waiting for Approval' && Boolean(brand.name?.trim());
  const hasDraft = Boolean(brand.name?.trim()) && !isApprovedOrPublished && !isWaitingApproval;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const emailTrimmed = loginEmail.trim().toLowerCase();
    if (!emailTrimmed || !emailTrimmed.includes('@')) {
      setLoginError('Please enter a valid brand email address.');
      return;
    }

    if (!loginPassword || loginPassword.length < 6) {
      setLoginError('Password must be at least 6 characters.');
      return;
    }

    setIsSubmittingLogin(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailTrimmed,
          password: loginPassword
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setShowLoginModal(false);
        if (data.brand && onSelectBrand) {
          const prods = await supabaseFetchBrandProducts(data.brand.id || data.brand.name, data.brand.name);
          const mapped = mapDbBrandToBrandProfile(data.brand, prods || []);
          onSelectBrand(mapped);
        } else if (onLoginSuccess) {
          onLoginSuccess(emailTrimmed);
        }
        return;
      }

      // Check if local brand matches (fallback)
      const matchedBrand = allBrands.find(b => 
        (b.email && b.email.toLowerCase().trim() === emailTrimmed) ||
        (b.inquiriesEmail && b.inquiriesEmail.toLowerCase().trim() === emailTrimmed)
      );

      if (matchedBrand && onSelectBrand) {
        onSelectBrand(matchedBrand);
        setShowLoginModal(false);
        return;
      }

      setLoginError(data.message || 'Incorrect email or password. Please try again or reset your password.');
    } catch {
      setLoginError('Network error authenticating. Please try again.');
    } finally {
      setIsSubmittingLogin(false);
    }
  };

  const handleSelectSearchedBrand = async (b: BrandProfile) => {
    setIsOpeningBrand(true);
    try {
      const fullBrand = await supabaseFetchBrandById(b.id || b.name);
      const prods = await supabaseFetchBrandProducts(b.id || b.name, b.name);
      const mapped = mapDbBrandToBrandProfile(fullBrand || b, prods || []);
      if (onSelectBrand) {
        onSelectBrand(mapped);
      }
      setShowLoginModal(false);
    } catch {
      if (onSelectBrand) {
        onSelectBrand(b);
      }
      setShowLoginModal(false);
    } finally {
      setIsOpeningBrand(false);
    }
  };

  const filteredBrands = searchQuery.trim().length === 0
    ? allBrands.slice(0, 15)
    : allBrands.filter(b => 
        b.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.basedOutOf?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.founderName?.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 20);

  const slide = CAROUSEL_SLIDES[activeSlide] || CAROUSEL_SLIDES[0];

  return (
    <div className={styles.obStartContainer}>
      {/* Ambient Lighting Mesh Glow */}
      <div className={styles.bdMeshGlow} />

      {/* 1. TOP HEADER & NAVIGATION */}
      <header className={styles.obTopNav}>
        <div className={styles.obBrandEmblemGroup}>
          <span className={styles.obBrandWordmark}>DROBE</span>
          <span className={styles.obPartnerTag}>PARTNER</span>
        </div>

        {/* Fluid Pill Pagination */}
        <div className={styles.obPillDots} role="tablist" aria-label="Carousel navigation">
          {CAROUSEL_SLIDES.map((s, idx) => {
            const isActive = idx === activeSlide;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveSlide(idx)}
                className={`${styles.obPillDot} ${isActive ? styles.obPillDotActive : ''}`}
                aria-label={`Slide ${idx + 1}`}
                aria-current={isActive ? 'true' : 'false'}
              />
            );
          })}
        </div>

        {/* Top Right Action Pill */}
        <button
          type="button"
          onClick={() => {
            setModalTab('login');
            setShowLoginModal(true);
          }}
          className={styles.obTopLoginBtn}
        >
          {isApprovedOrPublished ? 'Dashboard' : 'Sign In'}
        </button>
      </header>

      {/* 2. CENTER CAROUSEL STAGE (TACTILE SOFT-UI & CLAYMORPHISM) */}
      <main className={styles.obCarouselStage}>
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.96 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className={styles.obCarouselSlide}
          >
            {/* Tactile 3D Soft-UI Visual Presentation */}
            <div className={styles.obHeroCard}>
              <div 
                className={styles.obHeroCardGlow}
                style={{
                  background: slide.accent === 'blue'
                    ? 'radial-gradient(circle at 50% 40%, rgba(47, 105, 254, 0.14) 0%, transparent 70%)'
                    : slide.accent === 'orange'
                    ? 'radial-gradient(circle at 50% 40%, rgba(255, 107, 0, 0.14) 0%, transparent 70%)'
                    : 'radial-gradient(circle at 50% 40%, rgba(124, 58, 237, 0.14) 0%, transparent 70%)'
                }}
              />

              {/* SLIDE 1: BRAND SPACE */}
              {slide.id === 'space' && (
                <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  {/* Floating Luxury Garment Badge */}
                  <div style={{
                    width: '74px',
                    height: '74px',
                    borderRadius: '24px',
                    background: 'linear-gradient(135deg, #2F69FE 0%, #1D4ED8 100%)',
                    boxShadow: '0 16px 32px -4px rgba(47, 105, 254, 0.42)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    marginBottom: '14px',
                    position: 'relative'
                  }}>
                    <Sparkles size={34} strokeWidth={2.2} />
                    <span style={{
                      position: 'absolute',
                      bottom: '-4px',
                      right: '-4px',
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      background: '#10B981',
                      border: '2px solid #FFFFFF'
                    }} />
                  </div>

                  {/* Tactile Floating Tags */}
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div style={{
                      background: '#F8FAFD',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      padding: '5px 12px',
                      borderRadius: '9999px',
                      fontSize: '11px',
                      fontWeight: 800,
                      color: '#0F172A',
                      boxShadow: '0 2px 8px rgba(24, 39, 75, 0.04)'
                    }}>
                      Exclusive Collections
                    </div>
                    <div style={{
                      background: '#EEF3FF',
                      border: '1px solid rgba(47, 105, 254, 0.2)',
                      padding: '5px 12px',
                      borderRadius: '9999px',
                      fontSize: '11px',
                      fontWeight: 800,
                      color: '#2F69FE'
                    }}>
                      Verified Partner Tier
                    </div>
                  </div>
                </div>
              )}

              {/* SLIDE 2: 10-MINUTE TRY-AT-HOME */}
              {slide.id === 'try' && (
                <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  {/* Glowing 10-Minute Dispatch Pill */}
                  <div style={{
                    background: 'linear-gradient(135deg, #FF6B00 0%, #EA580C 100%)',
                    padding: '8px 20px',
                    borderRadius: '9999px',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 900,
                    letterSpacing: '0.04em',
                    boxShadow: '0 12px 28px -4px rgba(255, 107, 0, 0.42)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '16px'
                  }}>
                    <Zap size={14} />
                    <span>10-MIN TRY AT HOME</span>
                  </div>

                  {/* Courier Darkstore Tag */}
                  <div style={{
                    background: '#FFFFFF',
                    border: '1.5px solid rgba(148, 163, 184, 0.18)',
                    borderRadius: '20px',
                    padding: '12px 18px',
                    boxShadow: '0 8px 24px rgba(24, 39, 75, 0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '10px',
                      background: '#FFF2EA',
                      color: '#FF6B00',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800
                    }}>
                      <Clock size={16} />
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>
                        Ahmedabad Mega Darkstore #01
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>
                        Doorstep Fitting &amp; Instant Return Rider
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SLIDE 3: CONTROL & PAYOUTS */}
              {slide.id === 'control' && (
                <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  {/* Luxury Payout Titanium Card */}
                  <div style={{
                    width: '210px',
                    height: '92px',
                    borderRadius: '20px',
                    background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
                    boxShadow: '0 16px 36px -6px rgba(15, 23, 42, 0.35)',
                    padding: '14px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    color: '#FFFFFF',
                    marginBottom: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.15)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '10px', letterSpacing: '0.08em', fontWeight: 800, color: '#94A3B8' }}>
                        AUTOMATED SETTLEMENTS
                      </span>
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10B981' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', letterSpacing: '0.1em', fontWeight: 700, fontFamily: 'monospace' }}>
                        •••• •••• •••• 4289
                      </div>
                      <div style={{ fontSize: '9.5px', color: '#38BDF8', fontWeight: 700, marginTop: '2px' }}>
                        DIRECT UPI &amp; BANK TRANSFERS
                      </div>
                    </div>
                  </div>

                  {/* Micro Commercial Tag */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{
                      background: '#F5F3FF',
                      border: '1px solid rgba(124, 58, 237, 0.2)',
                      padding: '4px 12px',
                      borderRadius: '9999px',
                      fontSize: '11px',
                      fontWeight: 800,
                      color: '#7C3AED'
                    }}>
                      1% Low Brand Sales Fee
                    </span>
                    <span style={{
                      background: '#ECFDF5',
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                      padding: '4px 12px',
                      borderRadius: '9999px',
                      fontSize: '11px',
                      fontWeight: 800,
                      color: '#065F46'
                    }}>
                      T+1 Automated Payouts
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Typography Display */}
            <h1 className={styles.obHeroTitle}>
              {slide.titleLine1}<br />{slide.titleLine2}
            </h1>
            <p className={styles.obHeroSubtitle}>
              {slide.subtitle}
            </p>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* 3. FLOATING ACTION DOCK */}
      <footer className={styles.obBottomDock}>
        {isApprovedOrPublished ? (
          <>
            <button
              type="button"
              onClick={onViewLiveDashboard}
              className={styles.obBtnPrimary}
            >
              <span>Open Brand Dashboard</span>
              <ArrowRight size={16} />
            </button>

            <button
              type="button"
              onClick={onEditLiveBrand || onViewLiveDashboard}
              className={styles.obBtnSecondary}
            >
              <span>Edit Brand Profile</span>
            </button>
          </>
        ) : isWaitingApproval ? (
          <>
            <button
              type="button"
              onClick={onViewLiveDashboard}
              className={styles.obBtnPrimary}
              style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', boxShadow: '0 14px 28px -4px rgba(245, 158, 11, 0.35)' }}
            >
              <span>View Review Status ({brand.name})</span>
              <ArrowRight size={16} />
            </button>

            <button
              type="button"
              onClick={onStartOnboarding}
              className={styles.obBtnSecondary}
            >
              <span>Review Submitted Dossier</span>
            </button>
          </>
        ) : hasDraft ? (
          <>
            <button
              type="button"
              onClick={onStartOnboarding}
              className={styles.obBtnPrimary}
            >
              <span>Continue Application ({brand.name})</span>
              <ArrowRight size={16} />
            </button>

            <button
              type="button"
              onClick={() => {
                setModalTab('login');
                setShowLoginModal(true);
              }}
              className={styles.obBtnSecondary}
            >
              <span>Brand Sign In</span>
            </button>

            {onResetBrand && (
              <button
                type="button"
                onClick={onResetBrand}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '4px',
                  fontFamily: 'inherit'
                }}
              >
                Discard Draft &amp; Start Fresh
              </button>
            )}
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={onStartOnboarding}
              className={styles.obBtnPrimary}
            >
              <span>Register Your Brand</span>
              <ArrowRight size={16} />
            </button>

            <button
              type="button"
              onClick={() => {
                setModalTab('login');
                setShowLoginModal(true);
              }}
              className={styles.obBtnSecondary}
            >
              <span>Partner Sign In</span>
            </button>
          </>
        )}

        <p className={styles.obTermsText}>
          Protected by DROBE Luxury Commerce &amp; Merchant Curation Standards.
        </p>
      </footer>

      {/* 4. TACTILE SOFT-UI AUTH & BRAND SEARCH MODAL */}
      {showLoginModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          zIndex: 100
        }}>
          <div style={{
            width: '100%',
            maxWidth: '480px',
            backgroundColor: '#FFFFFF',
            borderTopLeftRadius: '32px',
            borderTopRightRadius: '32px',
            boxShadow: '0 -20px 50px rgba(0, 0, 0, 0.15)',
            padding: '24px 20px 34px 20px',
            boxSizing: 'border-box',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#2F69FE', fontWeight: 800 }}>
                  PARTNER PORTAL
                </span>
                <h3 style={{ fontSize: '21px', fontWeight: 850, color: '#0F172A', margin: '3px 0 2px 0', letterSpacing: '-0.025em' }}>
                  {modalTab === 'claim' ? 'Find & Claim Your Brand' : 'Sign In to Portal'}
                </h3>
                <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
                  {modalTab === 'claim' 
                    ? 'Search verified partner brands on DROBE to enter your store.'
                    : 'Sign in with your email and password to access your brand store.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowLoginModal(false);
                  setLoginError(null);
                }}
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '9999px',
                  background: '#F1F5F9',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748B',
                  cursor: 'pointer'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Segmented Tab Switcher */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '6px',
              marginBottom: '18px',
              background: '#F4F6FB',
              padding: '4px',
              borderRadius: '16px'
            }}>
              <button
                type="button"
                onClick={() => setModalTab('claim')}
                style={{
                  padding: '9px 12px',
                  borderRadius: '12px',
                  border: 'none',
                  background: modalTab === 'claim' ? '#FFFFFF' : 'transparent',
                  color: modalTab === 'claim' ? '#2F69FE' : '#64748B',
                  fontWeight: 800,
                  fontSize: '12.5px',
                  cursor: 'pointer',
                  boxShadow: modalTab === 'claim' ? '0 2px 8px rgba(24, 39, 75, 0.06)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Search size={13} />
                <span>Find Brand ({allBrands.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setModalTab('login')}
                style={{
                  padding: '9px 12px',
                  borderRadius: '12px',
                  border: 'none',
                  background: modalTab === 'login' ? '#FFFFFF' : 'transparent',
                  color: modalTab === 'login' ? '#2F69FE' : '#64748B',
                  fontWeight: 800,
                  fontSize: '12.5px',
                  cursor: 'pointer',
                  boxShadow: modalTab === 'login' ? '0 2px 8px rgba(24, 39, 75, 0.06)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Lock size={13} />
                <span>Password Sign In</span>
              </button>
            </div>

            {loginError && (
              <div style={{
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: '14px',
                padding: '12px 14px',
                marginBottom: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                color: '#991B1B',
                fontSize: '12.5px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
                  <AlertCircle size={15} />
                  <span>{loginError}</span>
                </div>
                {(loginError.toLowerCase().includes('password') || loginError.toLowerCase().includes('incorrect')) && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowLoginModal(false);
                      setShowForgotPasswordModal(true);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#DC2626',
                      fontSize: '12px',
                      fontWeight: 700,
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      padding: 0,
                      textAlign: 'left'
                    }}
                  >
                    Forgot your password? Click here to reset with OTP →
                  </button>
                )}
              </div>
            )}

            {/* TAB 1: CLAIM / SEARCH BRANDS FROM SUPABASE */}
            {modalTab === 'claim' && (
              <div>
                <div style={{ position: 'relative', marginBottom: '14px' }}>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search brand name (e.g. Jihi, Underrated Club...)"
                    className={styles.obInputField}
                    style={{ paddingLeft: '40px' }}
                    autoFocus
                  />
                  <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>

                {isLoadingBrands ? (
                  <div style={{ padding: '36px', textAlign: 'center', color: '#64748B', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Loading verified partner brands...</span>
                  </div>
                ) : (
                  <div style={{ maxHeight: '260px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }}>
                    {filteredBrands.map((b) => (
                      <div
                        key={b.id || b.name}
                        onClick={() => handleSelectSearchedBrand(b)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 14px',
                          borderRadius: '16px',
                          border: '1.5px solid rgba(148, 163, 184, 0.16)',
                          background: '#FFFFFF',
                          cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(24, 39, 75, 0.03)',
                          transition: 'transform 0.15s ease, border-color 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                          {b.profileImage ? (
                            <img
                              src={b.profileImage}
                              alt={b.name}
                              style={{ width: '36px', height: '36px', borderRadius: '12px', objectFit: 'cover', flexShrink: 0 }}
                            />
                          ) : (
                            <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: '#EEF3FF', color: '#2F69FE', fontWeight: 800, fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              {b.name.slice(0, 1).toUpperCase()}
                            </div>
                          )}
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {b.name}
                            </div>
                            <div style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 600 }}>
                              {b.category} · {b.basedOutOf || 'India'}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={isOpeningBrand}
                          style={{
                            fontSize: '12px',
                            fontWeight: 800,
                            padding: '7px 14px',
                            borderRadius: '9999px',
                            border: 'none',
                            background: '#2F69FE',
                            color: '#FFFFFF',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            flexShrink: 0
                          }}
                        >
                          <span>Open</span>
                          <ArrowRight size={12} />
                        </button>
                      </div>
                    ))}

                    {filteredBrands.length === 0 && (
                      <div style={{ padding: '28px', textAlign: 'center', color: '#64748B', fontSize: '13px' }}>
                        No brand found matching &ldquo;{searchQuery}&rdquo;.
                        <div style={{ marginTop: '10px' }}>
                          <button
                            type="button"
                            onClick={() => {
                              setShowLoginModal(false);
                              onStartOnboarding();
                            }}
                            className={styles.obBtnPrimary}
                            style={{ height: '42px', fontSize: '13px' }}
                          >
                            + Start New Brand Application
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: EMAIL & PASSWORD SIGN IN */}
            {modalTab === 'login' && (
              <form onSubmit={handleLoginSubmit}>
                <div className={styles.obInputGroup}>
                  <label className={styles.obInputLabel} style={{ display: 'block', marginBottom: '6px' }}>
                    Brand Email
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="founder@yourbrand.com"
                      required
                      className={styles.obInputField}
                      style={{ paddingLeft: '40px' }}
                    />
                    <Mail size={16} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  </div>
                </div>

                <div className={styles.obInputGroup}>
                  <label className={styles.obInputLabel} style={{ display: 'block', marginBottom: '6px' }}>
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      className={styles.obInputField}
                      style={{ paddingLeft: '40px', paddingRight: '44px' }}
                    />
                    <Lock size={16} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#94A3B8'
                      }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '18px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowLoginModal(false);
                      setShowForgotPasswordModal(true);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#DC2626',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    Forgot Password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingLogin}
                  className={styles.obBtnPrimary}
                >
                  {isSubmittingLogin ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Signing In...</span>
                    </>
                  ) : (
                    <span>Log In to Dashboard →</span>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* FORGOT PASSWORD MODAL */}
      <ForgotPasswordModal
        isOpen={showForgotPasswordModal}
        initialEmail={loginEmail}
        onClose={() => setShowForgotPasswordModal(false)}
        onSuccess={(email) => {
          setLoginEmail(email);
          setShowForgotPasswordModal(false);
          setShowLoginModal(true);
          setModalTab('login');
        }}
      />
    </div>
  );
}
