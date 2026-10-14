'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Mail, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { BrandProfile } from './types';
import styles from './brand-dashboard.module.css';

interface BrandStartScreenProps {
  brand: BrandProfile;
  onStartOnboarding: () => void;
  onViewLiveDashboard: () => void;
  onEditLiveBrand?: () => void;
  onResetBrand?: () => void;
  onLoginSuccess?: (email: string) => void;
}

const CAROUSEL_SLIDES = [
  {
    id: 'space',
    titleLine1: 'Build your',
    titleLine2: 'brand space',
    subtitle: 'Showcase your signature collections and connect directly with discerning clients on Drobe.',
    illustration: 'box'
  },
  {
    id: 'try',
    titleLine1: '10-minute',
    titleLine2: 'try at home',
    subtitle: 'Ahmedabad darkstore riders deliver your collection to customer doorsteps in 10 minutes so clients try before they buy.',
    illustration: 'delivery'
  },
  {
    id: 'control',
    titleLine1: 'Your brand.',
    titleLine2: 'Your control.',
    subtitle: 'Track warehouse stock, manage trial orders, and receive direct automated payouts to your verified bank account.',
    illustration: 'telemetry'
  }
];

export default function BrandStartScreen({
  brand,
  onStartOnboarding,
  onViewLiveDashboard,
  onEditLiveBrand,
  onResetBrand,
  onLoginSuccess
}: BrandStartScreenProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Auto-advance carousel smoothly every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const isApprovedOrPublished = (brand.status === 'Published' || brand.status === 'Approved') && Boolean(brand.name?.trim());
  const isWaitingApproval = brand.status === 'Waiting for Approval' && Boolean(brand.name?.trim());
  const hasDraft = Boolean(brand.name?.trim()) && !isApprovedOrPublished && !isWaitingApproval;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const emailTrimmed = loginEmail.trim();
    if (!emailTrimmed || !emailTrimmed.includes('@')) {
      setLoginError('Please enter a valid brand email address.');
      return;
    }

    if (!loginPassword || loginPassword.length < 6) {
      setLoginError('Password must be at least 6 characters.');
      return;
    }

    if (onLoginSuccess) {
      onLoginSuccess(emailTrimmed);
    } else {
      onStartOnboarding();
    }
    setShowLoginModal(false);
  };

  const slide = CAROUSEL_SLIDES[activeSlide] || CAROUSEL_SLIDES[0];

  return (
    <div className={styles.screen1Container}>
      {/* 1. TOP STATUS & BRANDING BAR */}
      <div className={styles.screen1TopBar}>
        {/* Drobe Wordmark / Emblem */}
        <div className={styles.topBarBrand}>
          <span className={styles.brandWordmark}>DROBE</span>
          <span className={styles.brandPartnerTag}>PARTNER</span>
        </div>

        {/* Center Pill Pagination Indicator (Abode style) */}
        <div className={styles.pillDotsContainer} role="tablist" aria-label="Onboarding carousel">
          {CAROUSEL_SLIDES.map((s, idx) => {
            const isActive = idx === activeSlide;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveSlide(idx)}
                className={`${styles.pillDot} ${isActive ? styles.pillDotActive : ''}`}
                aria-label={`Go to slide ${idx + 1}`}
                aria-current={isActive ? 'true' : 'false'}
              />
            );
          })}
        </div>

        {/* Top Right Login Pill */}
        <button
          type="button"
          onClick={() => setShowLoginModal(true)}
          className={styles.topLoginPill}
        >
          {isApprovedOrPublished ? 'Dashboard' : 'Login'}
        </button>
      </div>

      {/* 2. CENTER CAROUSEL STAGE */}
      <div className={styles.carouselStage}>
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className={styles.carouselSlide}
          >
            {/* Visual Illustration matching the video */}
            <div className={styles.illustrationBox}>
              {slide.illustration === 'box' && (
                <svg viewBox="0 0 260 210" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.heroSvg}>
                  {/* Subtle ground oval shadow */}
                  <ellipse cx="130" cy="195" rx="70" ry="8" fill="#e2e8f0" fillOpacity="0.8" />
                  
                  {/* Open Delivery Box in Sunny Amber */}
                  <g id="open-box">
                    {/* Left flap */}
                    <path d="M72 78 L46 64 L46 142 L72 158 Z" fill="#fde68a" />
                    {/* Right flap */}
                    <path d="M188 78 L214 64 L214 142 L188 158 Z" fill="#fde68a" />
                    {/* Box body */}
                    <rect x="70" y="76" width="120" height="92" rx="14" fill="#ffffff" stroke="#f59e0b" strokeWidth="8" />
                    {/* Interior depth */}
                    <rect x="76" y="82" width="108" height="80" rx="10" fill="#f8fafc" />
                    {/* Top tape accent */}
                    <path d="M74 76 H186" stroke="#f59e0b" strokeWidth="10" strokeLinecap="round" />
                    {/* Bottom tape accent */}
                    <path d="M74 168 H186" stroke="#f59e0b" strokeWidth="10" strokeLinecap="round" />
                  </g>

                  {/* Cute Cobalt Blue Cloud Mascot with Eyes (like the video) */}
                  <g id="cloud-mascot" transform="translate(18, 0)">
                    <path
                      d="M110 52 C110 40 120 30 132 30 C138 30 144 33 148 38 C153 32 161 28 170 30 C182 32 191 43 189 55 C197 58 202 66 201 74 C200 84 191 91 181 91 L118 91 C107 91 99 83 99 73 C99 63 105 55 110 52 Z"
                      fill="#2563eb"
                    />
                    {/* Cute white pill eyes */}
                    <ellipse cx="140" cy="58" rx="4" ry="6" fill="#ffffff" />
                    <ellipse cx="160" cy="58" rx="4" ry="6" fill="#ffffff" />
                    <circle cx="141" cy="57" r="2.2" fill="#0f172a" />
                    <circle cx="161" cy="57" r="2.2" fill="#0f172a" />
                  </g>

                  {/* Golden Luxury Hanger Badge */}
                  <g id="golden-hanger" transform="translate(112, 102)">
                    <rect x="0" y="0" width="36" height="36" rx="10" fill="#2563eb" />
                    <path d="M18 10 C18 7.5 19.5 6 21 7.5 C22.5 9 20 11 18 13 L8 22 H28 L18 13 Z" stroke="#ffffff" strokeWidth="2.2" strokeLinejoin="round" fill="none" />
                  </g>

                  {/* Pink/Coral Speech Bubble with Heart (Abode style) */}
                  <g id="pink-bubble" transform="translate(24, 60)">
                    <path
                      d="M26 12 C34 12 40 18 40 26 C40 33 34 38 27 39 L22 45 L23 39 C16 38 12 33 12 26 C12 18 18 12 26 12 Z"
                      fill="#f43f5e"
                    />
                    {/* Tiny white heart */}
                    <path d="M26 22 C24.5 19.5 21 21 21 23 C21 25.5 26 29 26 29 C26 29 31 25.5 31 23 C31 21 27.5 19.5 26 22 Z" fill="#ffffff" />
                  </g>

                  {/* Green Luxury Check Tag */}
                  <g id="mint-tag" transform="translate(182, 120)">
                    <circle cx="16" cy="16" r="16" fill="#10b981" />
                    <path d="M10 16.5 L14 20.5 L22 12" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </g>
                </svg>
              )}

              {slide.illustration === 'delivery' && (
                <svg viewBox="0 0 260 210" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.heroSvg}>
                  {/* Subtle ground shadow */}
                  <ellipse cx="130" cy="195" rx="72" ry="8" fill="#e2e8f0" fillOpacity="0.8" />

                  {/* 10-Minute Darkstore Delivery Garment Box */}
                  <rect x="55" y="70" width="150" height="105" rx="20" fill="#ffffff" stroke="#2563eb" strokeWidth="6" />
                  <rect x="63" y="78" width="134" height="89" rx="14" fill="#eff6ff" />

                  {/* Speed lines */}
                  <path d="M30 95 H48" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
                  <path d="M22 115 H44" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
                  <path d="M34 135 H48" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />

                  {/* Floating 10-MIN pill badge */}
                  <g id="10-min-badge" transform="translate(86, 38)">
                    <rect x="0" y="0" width="88" height="34" rx="17" fill="#f59e0b" />
                    <text x="44" y="22" fill="#ffffff" fontSize="13" fontWeight="900" fontFamily="system-ui, sans-serif" textAnchor="middle" letterSpacing="0.04em">
                      10 MINS
                    </text>
                  </g>

                  {/* Ahmedabad Hub Doorstep Trial Tag */}
                  <g id="hub-tag" transform="translate(80, 104)">
                    <rect x="0" y="0" width="100" height="42" rx="12" fill="#ffffff" stroke="#dbeafe" strokeWidth="2" />
                    <circle cx="18" cy="21" r="9" fill="#2563eb" />
                    <path d="M15 21 L17.5 23.5 L21.5 18.5" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <text x="34" y="19" fill="#0f172a" fontSize="11" fontWeight="700" fontFamily="system-ui, sans-serif">
                      Doorstep Trial
                    </text>
                    <text x="34" y="31" fill="#64748b" fontSize="9" fontWeight="600" fontFamily="system-ui, sans-serif">
                      Ahmedabad Hub
                    </text>
                  </g>

                  {/* Coral energy bubble */}
                  <g id="coral-bubble" transform="translate(192, 65)">
                    <circle cx="16" cy="16" r="16" fill="#f43f5e" />
                    <path d="M16 8 L18 14 H24 L19 18 L21 24 L16 20 L11 24 L13 18 L8 14 H14 Z" fill="#ffffff" />
                  </g>
                </svg>
              )}

              {slide.illustration === 'telemetry' && (
                <svg viewBox="0 0 260 210" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.heroSvg}>
                  {/* Subtle ground shadow */}
                  <ellipse cx="130" cy="195" rx="72" ry="8" fill="#e2e8f0" fillOpacity="0.8" />

                  {/* Main Bank Payout Card (Family wallet style) */}
                  <g id="payout-card" transform="translate(42, 60)">
                    <rect x="0" y="0" width="176" height="110" rx="20" fill="#0f172a" />
                    <rect x="16" y="20" width="32" height="22" rx="6" fill="#f59e0b" />
                    <circle cx="150" cy="28" r="10" fill="#2563eb" />
                    <circle cx="138" cy="28" r="10" fill="#38bdf8" fillOpacity="0.8" />
                    <text x="18" y="74" fill="#ffffff" fontSize="13" fontWeight="700" fontFamily="system-ui, sans-serif" letterSpacing="0.08em">
                      •••• •••• •••• 4289
                    </text>
                    <text x="18" y="93" fill="#94a3b8" fontSize="10" fontWeight="600" fontFamily="system-ui, sans-serif">
                      INSTANT UPI SETTLEMENTS
                    </text>
                  </g>

                  {/* Floating Telemetry Metric Pill */}
                  <g id="telemetry-pill" transform="translate(68, 30)">
                    <rect x="0" y="0" width="124" height="32" rx="16" fill="#ffffff" stroke="#e2e8f0" strokeWidth="2" />
                    <circle cx="16" cy="16" r="6" fill="#10b981" />
                    <text x="30" y="20" fill="#0f172a" fontSize="11" fontWeight="800" fontFamily="system-ui, sans-serif">
                      98% In-Stock Live
                    </text>
                  </g>

                  {/* Protected Inventory Shield */}
                  <g id="shield-badge" transform="translate(186, 134)">
                    <rect x="0" y="0" width="38" height="38" rx="12" fill="#2563eb" />
                    <path d="M19 10 L27 13.5 V19 C27 24 23.5 27.5 19 29 C14.5 27.5 11 24 11 19 V13.5 L19 10 Z" fill="#ffffff" />
                  </g>
                </svg>
              )}
            </div>

            {/* Chunky Bold Display Headline (Like the video) */}
            <h1 className={styles.carouselTitle}>
              {slide.titleLine1}<br />{slide.titleLine2}
            </h1>

            {/* Clean 2-Line Subtitle */}
            <p className={styles.carouselSub}>
              {slide.subtitle}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 3. SOFT BOTTOM CLOUD WAVE & ACTION SECTION */}
      <div className={styles.screen1BottomWrapper}>
        {/* Soft Cloud Wave transition curve from video */}
        <div className={styles.cloudWaveDivider}>
          <svg viewBox="0 0 375 28" fill="none" preserveAspectRatio="none" style={{ width: '100%', height: '28px', display: 'block' }}>
            <path d="M0 28 C90 8, 160 22, 230 10 C300 0, 340 18, 375 10 L375 28 L0 28 Z" fill="#ffffff" />
          </svg>
        </div>

        {/* Real Action Buttons */}
        <div className={styles.screen1BottomSection}>
          {isApprovedOrPublished ? (
            <>
              <button
                type="button"
                onClick={onViewLiveDashboard}
                className={styles.screen1BtnPrimary}
              >
                Open Brand Dashboard
              </button>

              <button
                type="button"
                onClick={onEditLiveBrand || onViewLiveDashboard}
                className={styles.screen1BtnSecondary}
              >
                Edit Brand Details
              </button>
            </>
          ) : isWaitingApproval ? (
            <>
              <button
                type="button"
                onClick={onViewLiveDashboard}
                className={styles.screen1BtnPrimary}
              >
                ⏳ View Application Status ({brand.name})
              </button>

              <button
                type="button"
                onClick={onStartOnboarding}
                className={styles.screen1BtnSecondary}
              >
                Review Submitted Dossier
              </button>
            </>
          ) : hasDraft ? (
            <>
              <button
                type="button"
                onClick={onStartOnboarding}
                className={styles.screen1BtnPrimary}
              >
                Continue Onboarding ({brand.name})
              </button>

              <button
                type="button"
                onClick={() => setShowLoginModal(true)}
                className={styles.screen1BtnSecondary}
              >
                Log In
              </button>

              {onResetBrand && (
                <button
                  type="button"
                  onClick={onResetBrand}
                  className={styles.resetFreshBtn}
                >
                  Start Fresh Application
                </button>
              )}
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onStartOnboarding}
                className={styles.screen1BtnPrimary}
              >
                Get Started
              </button>

              <button
                type="button"
                onClick={() => setShowLoginModal(true)}
                className={styles.screen1BtnSecondary}
              >
                Log In
              </button>
            </>
          )}

          {/* Clean Terms & Conditions (matching the video) */}
          <p className={styles.screen1Terms}>
            By joining Drobe you acknowledge that you have read and agree to Drobe&apos;s Terms &amp; Conditions and Partner Policy.
          </p>
        </div>
      </div>

      {/* 4. PARTNER LOG IN MODAL (Clean Crisp White Sheet) */}
      {showLoginModal && (
        <div className={styles.loginModalOverlay}>
          <div className={styles.loginModalSheet}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#2563eb', fontWeight: 800 }}>
                  PARTNER PORTAL
                </span>
                <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#0b132b', margin: '4px 0 2px 0', letterSpacing: '-0.02em', fontFamily: 'var(--brand-display-font)' }}>
                  Log In to Brand Portal
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                  Sign in with your email and password to access your brand store.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowLoginModal(false);
                  setLoginError(null);
                }}
                className={styles.modalCloseBtn}
                title="Close"
              >
                <X size={20} />
              </button>
            </div>

            {loginError && (
              <div className={styles.loginErrorBanner}>
                <AlertCircle size={15} />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label className={styles.loginInputLabel}>
                  Brand Email
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="founder@yourbrand.com"
                    required
                    className={styles.loginInputField}
                  />
                  <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label className={styles.loginInputLabel}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className={styles.loginInputField}
                    style={{ paddingRight: '44px' }}
                  />
                  <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={styles.eyeToggleButton}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className={styles.loginSubmitBtn}
              >
                Log In
              </button>

              <div style={{ marginTop: '14px', textAlign: 'center' }}>
                <span style={{ fontSize: '13px', color: '#64748b' }}>
                  New to Drobe?{' '}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setShowLoginModal(false);
                    onStartOnboarding();
                  }}
                  className={styles.getStartedLinkBtn}
                >
                  Get Started
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
