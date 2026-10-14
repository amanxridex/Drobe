'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, Upload, X, AlertCircle, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { BrandProfile } from './types';
import styles from './brand-dashboard.module.css';

interface OnboardingFlowProps {
  brand: BrandProfile;
  onChange: (updated: BrandProfile) => void;
  onGoLive: () => void;
  onExit: () => void;
  onSaveDraft?: () => void;
}

const STEPS = [
  { id: 'account', num: '01', title: 'Account', fullTitle: 'Account credentials', sub: 'Atelier email & secure password' },
  { id: 'basics', num: '02', title: 'Basics', fullTitle: 'Brand basics', sub: 'Name, category & atelier location' },
  { id: 'visuals', num: '03', title: 'Visuals', fullTitle: 'Visual assets', sub: 'Logo emblem, cover banner & story' },
  { id: 'channels', num: '04', title: 'Channels', fullTitle: 'Channels', sub: 'Website, Instagram & concierge email' },
  { id: 'launch', num: '05', title: 'Launch', fullTitle: 'Review & launch', sub: 'Verify brand dossier & go live' }
];

const STEP_THEMES = [
  {
    id: 'account',
    name: 'Obsidian Black',
    bg: 'linear-gradient(135deg, #18181b 0%, #09090b 100%)',
    shadow: '0 6px 18px -2px rgba(15, 23, 42, 0.42)',
    border: 'rgba(255, 255, 255, 0.22)',
    badgeBg: '#09090b'
  },
  {
    id: 'basics',
    name: 'Royal Cobalt Blue',
    bg: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    shadow: '0 6px 18px -2px rgba(37, 99, 235, 0.48)',
    border: 'rgba(191, 219, 254, 0.45)',
    badgeBg: '#1d4ed8'
  },
  {
    id: 'visuals',
    name: 'Emerald Jade',
    bg: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
    shadow: '0 6px 18px -2px rgba(5, 150, 105, 0.48)',
    border: 'rgba(167, 243, 208, 0.45)',
    badgeBg: '#047857'
  },
  {
    id: 'channels',
    name: 'Electric Violet',
    bg: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    shadow: '0 6px 18px -2px rgba(139, 92, 246, 0.48)',
    border: 'rgba(221, 214, 254, 0.45)',
    badgeBg: '#7c3aed'
  },
  {
    id: 'launch',
    name: 'Champagne Amber Gold',
    bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    shadow: '0 6px 18px -2px rgba(245, 158, 11, 0.5)',
    border: 'rgba(254, 243, 199, 0.5)',
    badgeBg: '#d97706'
  }
];

const CATEGORY_OPTIONS: Array<'Male' | 'Both' | 'Female'> = ['Male', 'Both', 'Female'];

export default function OnboardingFlow({
  brand,
  onChange,
  onGoLive,
  onExit,
  onSaveDraft
}: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const normalizedCategory: 'Male' | 'Both' | 'Female' = 
    brand.category === 'Male' ? 'Male' : 
    brand.category === 'Female' ? 'Female' : 'Both';

  const updateField = <K extends keyof BrandProfile>(key: K, value: BrandProfile[K]) => {
    setErrorNotice(null);
    onChange({
      ...brand,
      [key]: value
    });
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    onComplete: (dataUrl: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onComplete(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const validateStep = (stepIdx: number): boolean => {
    const step = STEPS[stepIdx];
    if (step.id === 'account') {
      const emailTrimmed = brand.email?.trim() || '';
      if (!emailTrimmed || !emailTrimmed.includes('@')) {
        setErrorNotice('Please enter a valid atelier email address to continue.');
        return false;
      }
      if (!brand.password || brand.password.length < 6) {
        setErrorNotice('Password must be at least 6 characters.');
        return false;
      }
    }
    if (step.id === 'basics') {
      if (!brand.name?.trim()) {
        setErrorNotice('Please enter your Brand Name to continue.');
        return false;
      }
    }
    setErrorNotice(null);
    return true;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleStepClick = (idx: number) => {
    if (idx > currentStep && !validateStep(currentStep)) return;
    setCurrentStep(idx);
  };

  const activeStepMeta = STEPS[currentStep];

  return (
    <div className={styles.mobileContainer}>

      {/* 1. Haute Couture Glass Stepper */}
      <div className={styles.stepperWrapper}>
        <div className={styles.stepperPillTrack}>
          {STEPS.map((st, idx) => {
            const isActive = idx === currentStep;
            const isDone = idx < currentStep;
            const theme = STEP_THEMES[idx] || STEP_THEMES[0];

            return (
              <motion.button
                key={st.id}
                type="button"
                onClick={() => handleStepClick(idx)}
                whileTap={{ scale: 0.96 }}
                className={`${styles.stepPillItem} ${isActive ? styles.stepPillItemActive : ''} ${isDone ? styles.stepPillItemDone : ''}`}
                aria-current={isActive ? 'step' : undefined}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeStepGlider"
                    className={styles.stepGlider}
                    style={{
                      background: theme.bg,
                      boxShadow: `${theme.shadow}, inset 0 1px 0.5px ${theme.border}`,
                      border: `1px solid ${theme.border}`
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 420,
                      damping: 32
                    }}
                  />
                )}
                <div className={styles.stepPillContent}>
                  <div className={styles.stepPillNumRow}>
                    {isDone ? (
                      <span
                        className={styles.stepDoneBadge}
                        style={{ background: theme.badgeBg }}
                      >
                        <Check size={8} strokeWidth={3} />
                      </span>
                    ) : (
                      <span className={`${styles.stepPillNum} ${isActive ? styles.stepPillNumActive : ''}`}>
                        {st.num}
                      </span>
                    )}
                  </div>
                  <span className={`${styles.stepPillLabel} ${isActive ? styles.stepPillLabelActive : ''} ${isDone ? styles.stepPillLabelDone : ''}`}>
                    {st.title}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* 3. Scrollable Form Content */}
      <div className={styles.onboardingScrollContent}>
        <div className={styles.onboardingCenterStage}>
          {/* Step Header */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStepMeta.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            style={{ marginBottom: '14px', textAlign: 'center' }}
          >
            <h2 className={styles.onboardingStepTitle}>
              {activeStepMeta.fullTitle || activeStepMeta.title}
            </h2>
            <p className={styles.onboardingStepSub}>
              {activeStepMeta.sub}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Validation Error Banner */}
        {errorNotice && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className={styles.glassErrorBanner}
          >
            <div className={styles.glassErrorIconWrapper}>
              <AlertCircle size={14} strokeWidth={2.4} />
            </div>
            <span className={styles.glassErrorText}>{errorNotice}</span>
          </motion.div>
        )}

        {/* STEP 1: Account Credentials */}
        {activeStepMeta.id === 'account' && (
          <div className={styles.ronasFormContainer}>
            <div className={styles.ronasInputGroup}>
              <label className={styles.ronasInputLabel}>Atelier Email *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  value={brand.email || ''}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="founder@yourbrand.com"
                  className={styles.ronasInputField}
                  autoFocus
                />
                <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              </div>
              <span style={{ fontSize: '11px', color: '#64748b', marginTop: '5px', display: 'block' }}>
                Used to log in, receive partner notices, and client inquiries.
              </span>
            </div>

            <div className={styles.ronasInputGroup}>
              <label className={styles.ronasInputLabel}>Password *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={brand.password || ''}
                  onChange={(e) => updateField('password', e.target.value)}
                  placeholder="Create a password (min. 6 characters)"
                  className={styles.ronasInputField}
                  style={{ paddingRight: '48px' }}
                />
                <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles.inputEyeButton}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <span style={{ fontSize: '11px', color: '#64748b', marginTop: '5px', display: 'block' }}>
                Must be at least 6 characters.
              </span>
            </div>
          </div>
        )}

        {/* STEP 2: Brand Basics */}
        {activeStepMeta.id === 'basics' && (
          <div className={styles.ronasFormContainer}>
            <div className={styles.ronasInputGroup}>
              <label className={styles.ronasInputLabel}>Brand Name *</label>
              <input
                type="text"
                value={brand.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="e.g. Atelier Vesper"
                className={styles.ronasInputField}
                autoFocus
              />
            </div>

            <div className={styles.ronasInputGroup}>
              <label className={styles.ronasInputLabel}>Tagline or Philosophy</label>
              <input
                type="text"
                value={brand.tagline}
                onChange={(e) => updateField('tagline', e.target.value)}
                placeholder="e.g. Rare botanical essences and mindful daily pauses"
                className={styles.ronasInputField}
              />
            </div>

            <div className={styles.categoryToggleContainer}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className={styles.ronasInputLabel} style={{ marginBottom: 0 }}>Category</label>
                <span style={{ fontSize: '11px', color: '#64748b' }}>
                  {normalizedCategory === 'Both' ? 'Both (Male & Female)' : normalizedCategory}
                </span>
              </div>
              <div className={styles.categoryToggleTrack}>
                <button
                  type="button"
                  onClick={() => updateField('category', 'Male')}
                  className={`${styles.categoryToggleOption} ${normalizedCategory === 'Male' ? styles.categoryToggleOptionActive : ''}`}
                >
                  Male
                </button>
                <button
                  type="button"
                  onClick={() => updateField('category', 'Both')}
                  className={`${styles.categoryToggleOption} ${normalizedCategory === 'Both' ? styles.categoryToggleOptionActive : ''}`}
                >
                  Both
                </button>
                <button
                  type="button"
                  onClick={() => updateField('category', 'Female')}
                  className={`${styles.categoryToggleOption} ${normalizedCategory === 'Female' ? styles.categoryToggleOptionActive : ''}`}
                >
                  Female
                </button>
              </div>
            </div>

            <div className={styles.ronasRowTwo}>
              <div className={styles.ronasInputGroup}>
                <label className={styles.ronasInputLabel}>Atelier Location</label>
                <input
                  type="text"
                  value={brand.basedOutOf}
                  onChange={(e) => updateField('basedOutOf', e.target.value)}
                  placeholder="e.g. Kyoto & Paris"
                  className={styles.ronasInputField}
                />
              </div>

              <div className={styles.ronasInputGroup}>
                <label className={styles.ronasInputLabel}>Year Founded</label>
                <input
                  type="text"
                  value={brand.establishedYear}
                  onChange={(e) => updateField('establishedYear', e.target.value)}
                  placeholder="e.g. 2024"
                  className={styles.ronasInputField}
                />
              </div>
            </div>

            <div className={styles.ronasRowTwo}>
              <div className={styles.ronasInputGroup}>
                <label className={styles.ronasInputLabel}>Founder / Creative Director</label>
                <input
                  type="text"
                  value={brand.founderName}
                  onChange={(e) => updateField('founderName', e.target.value)}
                  placeholder="e.g. Sophie Laurent"
                  className={styles.ronasInputField}
                />
              </div>

              <div className={styles.ronasInputGroup}>
                <label className={styles.ronasInputLabel}>Founder Role / Title</label>
                <input
                  type="text"
                  value={brand.founderRole}
                  onChange={(e) => updateField('founderRole', e.target.value)}
                  placeholder="e.g. Founder & Formulator"
                  className={styles.ronasInputField}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Visual Assets & Story */}
        {activeStepMeta.id === 'visuals' && (
          <div className={styles.ronasFormContainer}>
            {/* Logo Emblem */}
            <div className={styles.ronasInputGroup}>
              <label className={styles.ronasInputLabel}>Brand Logo / Emblem (1:1)</label>
              <div className={styles.ronasEmblemPreviewBox}>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                  {brand.profileImage ? (
                    <div style={{ position: 'relative' }}>
                      <img
                        src={brand.profileImage}
                        alt="Logo preview"
                        className={styles.ronasEmblemThumb}
                      />
                      <button
                        type="button"
                        onClick={() => updateField('profileImage', '')}
                        style={{ position: 'absolute', top: '-6px', right: '-6px', width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#ef4444', color: '#ffffff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                        title="Remove emblem"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <div className={styles.ronasEmblemFallback}>
                      {brand.name ? brand.name.slice(0, 1).toUpperCase() : 'B'}
                    </div>
                  )}

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <label className={styles.ronasUploadBtn} style={{ cursor: 'pointer' }}>
                        <Upload size={14} style={{ marginRight: '6px' }} />
                        Upload Image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, (data) => updateField('profileImage', data))}
                          style={{ display: 'none' }}
                        />
                      </label>
                    </div>
                    <div style={{ marginTop: '8px' }}>
                      <input
                        type="text"
                        value={brand.profileImage.startsWith('data:') ? '' : brand.profileImage}
                        onChange={(e) => updateField('profileImage', e.target.value)}
                        placeholder="Or enter direct image URL..."
                        className={styles.ronasInputField}
                        style={{ fontSize: '11px', padding: '8px 10px' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cover Banner */}
            <div className={styles.ronasInputGroup}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label className={styles.ronasInputLabel}>Cover Panorama Banner (16:9)</label>
                {brand.coverImage && (
                  <button
                    type="button"
                    onClick={() => updateField('coverImage', '')}
                    style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '11px', cursor: 'pointer' }}
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className={styles.ronasBannerPreviewBox}>
                {brand.coverImage ? (
                  <img
                    src={brand.coverImage}
                    alt="Cover banner"
                    className={styles.ronasBannerImg}
                  />
                ) : (
                  <div className={styles.ronasBannerEmpty}>
                    No cover banner uploaded yet
                  </div>
                )}

                <div className={styles.ronasMediaControlsRow}>
                  <label className={styles.ronasUploadBtn} style={{ cursor: 'pointer', flexShrink: 0 }}>
                    <Upload size={14} style={{ marginRight: '6px' }} />
                    Upload Cover
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, (data) => updateField('coverImage', data))}
                      style={{ display: 'none' }}
                    />
                  </label>
                  <input
                    type="text"
                    value={brand.coverImage.startsWith('data:') ? '' : brand.coverImage}
                    onChange={(e) => updateField('coverImage', e.target.value)}
                    placeholder="Or enter banner image URL..."
                    className={styles.ronasInputField}
                    style={{ flex: 1, fontSize: '12px' }}
                  />
                </div>
              </div>
            </div>

            {/* Brand Story & Ethos */}
            <div className={styles.ronasInputGroup}>
              <label className={styles.ronasInputLabel}>Atelier Story & Craft</label>
              <textarea
                value={brand.about}
                onChange={(e) => updateField('about', e.target.value)}
                placeholder="Share your brand's philosophy, artisanal processes, materials, and origin..."
                className={styles.ronasInputField}
                style={{ minHeight: '74px', lineHeight: '1.45' }}
              />
            </div>

            <div className={styles.ronasInputGroup}>
              <label className={styles.ronasInputLabel}>Founder Quote / Statement</label>
              <input
                type="text"
                value={brand.founderQuote}
                onChange={(e) => updateField('founderQuote', e.target.value)}
                placeholder="e.g. We treat beauty as a sacred daily ritual of restoration."
                className={styles.ronasInputField}
              />
            </div>
          </div>
        )}

        {/* STEP 4: Direct Channels */}
        {activeStepMeta.id === 'channels' && (
          <div className={styles.ronasFormContainer}>
            <div className={styles.ronasInputGroup}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className={styles.ronasInputLabel} style={{ marginBottom: 0 }}>Official Website URL</label>
                <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500 }}>Optional</span>
              </div>
              <input
                type="text"
                value={brand.website}
                onChange={(e) => updateField('website', e.target.value)}
                placeholder="https://yourbrand.com (optional)"
                className={styles.ronasInputField}
              />
            </div>

            <div className={styles.ronasInputGroup}>
              <label className={styles.ronasInputLabel}>Official Instagram Handle</label>
              <input
                type="text"
                value={brand.instagram}
                onChange={(e) => updateField('instagram', e.target.value)}
                placeholder="@yourbrand"
                className={styles.ronasInputField}
              />
            </div>

            <div className={styles.ronasInputGroup}>
              <label className={styles.ronasInputLabel}>Concierge & Inquiries Email</label>
              <input
                type="email"
                value={brand.inquiriesEmail || brand.email || ''}
                onChange={(e) => updateField('inquiriesEmail', e.target.value)}
                placeholder={brand.email || "concierge@yourbrand.com"}
                className={styles.ronasInputField}
              />
            </div>
          </div>
        )}

        {/* STEP 5: Review & Go Live */}
        {activeStepMeta.id === 'launch' && (
          <div className={styles.ronasFormContainer}>
            <div className={styles.ronasDossierCard}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '14px' }}>
                {brand.profileImage ? (
                  <img
                    src={brand.profileImage}
                    alt={brand.name}
                    className={styles.ronasDossierAvatar}
                  />
                ) : (
                  <div className={styles.ronasDossierAvatarFallback}>
                    {brand.name ? brand.name.slice(0, 1).toUpperCase() : 'B'}
                  </div>
                )}
                <div>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#0f172a', fontWeight: 700 }}>
                    {normalizedCategory === 'Both' ? 'Both (Male & Female)' : normalizedCategory}
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a', letterSpacing: '-0.02em' }}>
                    {brand.name || 'Untitled Atelier'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    {brand.basedOutOf || 'Global Atelier'} · Est. {brand.establishedYear || '2024'}
                  </div>
                </div>
              </div>

              {brand.coverImage && (
                <div style={{ borderRadius: '12px', overflow: 'hidden', height: '110px', marginBottom: '14px' }}>
                  <img
                    src={brand.coverImage}
                    alt="Cover"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                <div>
                  <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Atelier Dossier</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                    Profile Verified
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Portal Status</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#0284c7' }}>
                    ● Ready for Admin Submission
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.ronasReadyNotice}>
              <Check size={16} color="#0284c7" />
              <span>Everything is verified. Tap &ldquo;Submit Profile for Admin Approval&rdquo;. Once Drobe Admin approves your brand, you will be authorized to dispatch physical inventory to the Ahmedabad Darkstore Hub.</span>
            </div>
          </div>
        )}
        </div>
      </div>

      {/* 4. Sticky Bottom Action Bar */}
      <footer className={styles.ronasBottomActionBar}>
        {currentStep === 0 ? (
          <button
            type="button"
            onClick={onExit}
            className={styles.ronasBackPillBtn}
          >
            Exit
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setCurrentStep(currentStep - 1)}
            className={styles.ronasBackPillBtn}
          >
            Back
          </button>
        )}

        {currentStep < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={handleNext}
            className={styles.ronasContinuePillBtn}
            style={{
              background: (STEP_THEMES[currentStep] || STEP_THEMES[0]).bg,
              boxShadow: (STEP_THEMES[currentStep] || STEP_THEMES[0]).shadow
            }}
          >
            Continue
            <ArrowRight size={15} />
          </button>
        ) : (
          <button
            type="button"
            onClick={onGoLive}
            className={styles.ronasGoLivePillBtn}
            style={{
              background: (STEP_THEMES[currentStep] || STEP_THEMES[0]).bg,
              boxShadow: (STEP_THEMES[currentStep] || STEP_THEMES[0]).shadow
            }}
          >
            Submit Profile for Admin Approval →
          </button>
        )}
      </footer>
    </div>
  );
}
