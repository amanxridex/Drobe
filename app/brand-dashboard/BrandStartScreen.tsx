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
  Sparkles
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
    subtitle: 'Showcase signature collections directly to discerning clients on DROBE.',
    accent: 'blue',
    image: '/brands/jihi/cover.jpg',
    chipTitle: 'Curated Brand Space',
    chipSub: 'Exclusive Verified Merchant Tier'
  },
  {
    id: 'try',
    badge: '10-MIN RAPID DISPATCH',
    titleLine1: '10-minute doorstep',
    titleLine2: 'try before you buy.',
    subtitle: 'Ahmedabad darkstore riders deliver your garments in 10 minutes so clients try on first.',
    accent: 'orange',
    image: '/assets/real/products/8712/angle_1.jpg',
    chipTitle: 'Ahmedabad Hub #01',
    chipSub: '10-Min Doorstep Trial Dispatch'
  },
  {
    id: 'control',
    badge: 'DIRECT SETTLEMENTS',
    titleLine1: 'Direct payouts.',
    titleLine2: 'Total brand control.',
    subtitle: 'Real-time darkstore inventory telemetry, 1% sales fee, and automated daily payouts.',
    accent: 'purple',
    image: '/assets/real/women/asset_62_brand_vasavi_vs076_s_1.jpg',
    chipTitle: 'Instant Settlement Banking',
    chipSub: '1% Platform Fee · Daily UPI Payouts'
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
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false);

  // Auto-advance carousel smoothly every 5.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
    }, 5500);
    return () => clearInterval(timer);
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

      setLoginError(data.message || 'Incorrect email or password. Please try again or reset your password.');
    } catch {
      setLoginError('Network error authenticating. Please try again.');
    } finally {
      setIsSubmittingLogin(false);
    }
  };

  const slide = CAROUSEL_SLIDES[activeSlide] || CAROUSEL_SLIDES[0];

  return (
    <div className={styles.obStartContainer}>
      {/* Ambient Lighting Mesh Glow */}
      <div className={styles.bdMeshGlow} />

      {/* 1. TOP HEADER & NAVIGATION */}
      <header className={styles.obTopNav}>
        <div className={styles.obBrandEmblemGroup}>
          <span className={styles.obBrandWordmark} style={{ color: '#0F172A' }}>DROBE</span>
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
            setShowLoginModal(true);
          }}
          className={styles.obTopLoginBtn}
          style={{ color: '#2F69FE' }}
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
            {/* Tactile Luxury Presentation Card */}
            <div className={styles.obHeroCard} style={{ position: 'relative' }}>
              <img
                src={slide.image}
                alt={slide.titleLine1}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
              {/* Soft Gradient Scrim Overlay */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.2) 0%, rgba(15, 23, 42, 0.72) 100%)'
              }} />

              {/* Floating Top Badge */}
              <div style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                background: slide.accent === 'blue' ? 'rgba(47, 105, 254, 0.92)' : slide.accent === 'orange' ? 'rgba(255, 107, 0, 0.92)' : 'rgba(124, 58, 237, 0.92)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                color: '#FFFFFF',
                padding: '5px 12px',
                borderRadius: '9999px',
                fontSize: '10.5px',
                fontWeight: 800,
                letterSpacing: '0.06em',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
              }}>
                {slide.badge}
              </div>

              {/* Floating Bottom Glass Chip */}
              <div style={{
                position: 'absolute',
                bottom: '16px',
                left: '16px',
                right: '16px',
                background: 'rgba(255, 255, 255, 0.94)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                borderRadius: '18px',
                padding: '12px 14px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                textAlign: 'left'
              }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>
                    {slide.chipTitle}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>
                    {slide.chipSub}
                  </div>
                </div>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '9999px',
                  background: slide.accent === 'blue' ? '#EEF3FF' : slide.accent === 'orange' ? '#FFF2EA' : '#F5F3FF',
                  color: slide.accent === 'blue' ? '#2F69FE' : slide.accent === 'orange' ? '#FF6B00' : '#7C3AED',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Sparkles size={14} />
                </div>
              </div>
            </div>

            {/* Bold High-Contrast Typography */}
            <h1 className={styles.obHeroTitle} style={{ color: '#0F172A', margin: '0 0 8px 0' }}>
              {slide.titleLine1}<br />{slide.titleLine2}
            </h1>
            <p className={styles.obHeroSubtitle} style={{ color: '#475569', margin: '0 auto' }}>
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
              style={{ color: '#0F172A' }}
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
              style={{
                background: 'linear-gradient(135deg, #FF6B00 0%, #EA580C 100%)',
                boxShadow: '0 14px 28px -4px rgba(255, 107, 0, 0.35)',
                color: '#FFFFFF'
              }}
            >
              <span>View Review Status ({brand.name})</span>
              <ArrowRight size={16} />
            </button>

            <button
              type="button"
              onClick={onStartOnboarding}
              className={styles.obBtnSecondary}
              style={{ color: '#0F172A' }}
            >
              <span>Review Submitted Dossier</span>
            </button>

            {onResetBrand && (
              <button
                type="button"
                onClick={onResetBrand}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748B',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '4px',
                  fontFamily: 'inherit',
                  textDecoration: 'underline'
                }}
              >
                Switch Brand / Start New Application
              </button>
            )}
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
                setShowLoginModal(true);
              }}
              className={styles.obBtnSecondary}
              style={{ color: '#0F172A' }}
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
                  color: '#64748B',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '4px',
                  fontFamily: 'inherit',
                  textDecoration: 'underline'
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
                setShowLoginModal(true);
              }}
              className={styles.obBtnSecondary}
              style={{ color: '#0F172A' }}
            >
              <span>Partner Sign In</span>
            </button>
          </>
        )}

        <p className={styles.obTermsText} style={{ color: '#64748B' }}>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#2F69FE', fontWeight: 800 }}>
                  PARTNER PORTAL
                </span>
                <h3 style={{ fontSize: '21px', fontWeight: 850, color: '#0F172A', margin: '3px 0 2px 0', letterSpacing: '-0.025em' }}>
                  Sign In to Partner Portal
                </h3>
                <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
                  Enter your brand email and password to access your dashboard.
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

            <form onSubmit={handleLoginSubmit}>
                <div className={styles.obInputGroup}>
                  <label className={styles.obInputLabel} style={{ display: 'block', marginBottom: '6px', color: '#0F172A' }}>
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
                      style={{ paddingLeft: '40px', color: '#0F172A' }}
                    />
                    <Mail size={16} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  </div>
                </div>

                <div className={styles.obInputGroup}>
                  <label className={styles.obInputLabel} style={{ display: 'block', marginBottom: '6px', color: '#0F172A' }}>
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
                      style={{ paddingLeft: '40px', paddingRight: '44px', color: '#0F172A' }}
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
        }}
      />
    </div>
  );
}
