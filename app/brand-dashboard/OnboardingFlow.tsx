'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Upload, 
  X, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  Loader2,
  Building2,
  CreditCard,
  ShieldCheck
} from 'lucide-react';
import { BrandProfile, BrandBankAccount } from './types';
import { supabaseUploadMedia } from '../lib/supabaseClient';
import styles from './brand-dashboard.module.css';

interface OnboardingFlowProps {
  brand: BrandProfile;
  onChange: (updated: BrandProfile) => void;
  onGoLive: () => void;
  onExit: () => void;
  onSaveDraft?: () => void;
}

const POPULAR_BANKS = [
  'HDFC Bank',
  'ICICI Bank',
  'State Bank of India',
  'Axis Bank',
  'Kotak Mahindra Bank',
  'Punjab National Bank',
  'Bank of Baroda',
  'IndusInd Bank'
];

const STEPS = [
  { id: 'account', num: '01', title: 'Account', fullTitle: 'Account credentials', sub: 'Brand email & secure password' },
  { id: 'basics', num: '02', title: 'Basics', fullTitle: 'Brand basics', sub: 'Name, category & location' },
  { id: 'visuals', num: '03', title: 'Visuals', fullTitle: 'Visual assets', sub: 'Logo emblem, cover banner & story' },
  { id: 'channels', num: '04', title: 'Channels', fullTitle: 'Channels', sub: 'Website, Instagram & concierge email' },
  { id: 'banking', num: '05', title: 'Banking', fullTitle: 'Payout Banking', sub: 'Settlement account for daily door-trial payouts' },
  { id: 'launch', num: '06', title: 'Launch', fullTitle: 'Review & submit', sub: 'Verify brand dossier & submit for approval' }
];

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
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [confirmAccountNumber, setConfirmAccountNumber] = useState(brand.bankAccount?.accountNumber || '');
  const [logoFailed, setLogoFailed] = useState(false);
  const pillTrackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pillTrackRef.current) {
      const activeBtn = pillTrackRef.current.children[currentStep] as HTMLElement | undefined;
      if (activeBtn) {
        activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [currentStep]);

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

  const updateBankField = (field: keyof BrandBankAccount, val: any) => {
    setErrorNotice(null);
    const currentBank = brand.bankAccount || {
      accountHolderName: '',
      bankName: 'HDFC Bank',
      accountNumber: '',
      ifscCode: '',
      accountType: 'Current',
      isVerified: true
    };
    onChange({
      ...brand,
      bankAccount: {
        ...currentBank,
        [field]: val
      }
    });
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    folder: 'brands/logos' | 'brands/banners',
    onComplete: (url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingMedia(true);
      setErrorNotice(null);
      try {
        const brandSlug = (brand.name || 'brand').toLowerCase().replace(/[^a-z0-9]/g, '-');
        const uploadRes = await supabaseUploadMedia(file, folder, `${brandSlug}_${Date.now()}`);
        if (uploadRes && uploadRes.url) {
          onComplete(uploadRes.url);
        } else {
          const reader = new FileReader();
          reader.onload = () => {
            if (typeof reader.result === 'string') {
              onComplete(reader.result);
            }
          };
          reader.readAsDataURL(file);
        }
      } catch (err) {
        console.warn('Storage upload error, fallback to data URL:', err);
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            onComplete(reader.result);
          }
        };
        reader.readAsDataURL(file);
      } finally {
        setIsUploadingMedia(false);
      }
    }
  };

  const validateStep = (stepIdx: number): boolean => {
    const step = STEPS[stepIdx];
    if (step.id === 'account') {
      const emailTrimmed = brand.email?.trim() || '';
      if (!emailTrimmed || !emailTrimmed.includes('@')) {
        setErrorNotice('Please enter a valid brand email address to continue.');
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
    if (step.id === 'banking') {
      const bank = brand.bankAccount;
      const nameTrimmed = bank?.accountHolderName?.trim();
      if (!nameTrimmed || nameTrimmed.length < 3) {
        setErrorNotice('Please enter the Account Holder Name matching your bank account.');
        return false;
      }
      if (!bank?.bankName?.trim()) {
        setErrorNotice('Please select or enter your Bank Name.');
        return false;
      }
      const accTrimmed = (bank?.accountNumber || '').trim().replace(/\s/g, '');
      if (!accTrimmed || accTrimmed.length < 8) {
        setErrorNotice('Please enter a valid Bank Account Number (at least 8 digits).');
        return false;
      }
      const confirmTrimmed = confirmAccountNumber.trim().replace(/\s/g, '');
      if (confirmTrimmed && accTrimmed !== confirmTrimmed) {
        setErrorNotice('Bank Account Numbers do not match. Please verify your entries.');
        return false;
      }
      const ifscTrimmed = (bank?.ifscCode || '').trim().toUpperCase();
      if (!ifscTrimmed || ifscTrimmed.length < 8) {
        setErrorNotice('Please enter a valid Bank IFSC Code (e.g. HDFC0001842).');
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
      {/* 1. CLEAN TOP HEADER WITH BACK & DRAFT */}
      <div className={styles.onboardingTopNav}>
        <button
          type="button"
          onClick={currentStep === 0 ? onExit : () => setCurrentStep(currentStep - 1)}
          className={styles.onboardingNavBtn}
        >
          <ArrowLeft size={16} />
          <span>{currentStep === 0 ? 'Exit' : 'Back'}</span>
        </button>

        {/* Center Official DROBE Logo */}
        <div className={styles.onboardingHeaderLogo}>
          {logoFailed ? (
            <span className={styles.brandWordmark}>DROBE</span>
          ) : (
            <img
              src="/drobe-logo-full.png"
              alt="DROBE"
              className={styles.onboardingHeaderLogoImg}
              onError={() => setLogoFailed(true)}
            />
          )}
        </div>

        {onSaveDraft ? (
          <button
            type="button"
            onClick={onSaveDraft}
            className={styles.onboardingSaveDraftBtn}
          >
            Save Draft
          </button>
        ) : (
          <div style={{ width: '60px' }} />
        )}
      </div>

      {/* 2. CRISP STEPPER PILL TRACK */}
      <div className={styles.stepperWrapper}>
        <div ref={pillTrackRef} className={styles.stepperPillTrack}>
          {STEPS.map((st, idx) => {
            const isActive = idx === currentStep;
            const isDone = idx < currentStep;

            return (
              <button
                key={st.id}
                type="button"
                onClick={() => handleStepClick(idx)}
                className={`${styles.stepPillItem} ${isActive ? styles.stepPillItemActive : ''} ${isDone ? styles.stepPillItemDone : ''}`}
                aria-current={isActive ? 'step' : undefined}
              >
                <div className={styles.stepPillContent}>
                  {isDone ? (
                    <Check size={11} strokeWidth={3} className={styles.stepPillDoneIcon} />
                  ) : (
                    <span className={styles.stepPillNum}>{st.num}</span>
                  )}
                  <span className={styles.stepPillLabel}>{st.title}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. SCROLLABLE FORM CONTENT */}
      <div className={styles.onboardingScrollContent}>
        <div className={styles.onboardingCenterStage}>
          {/* Step Headline & Subtitle */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStepMeta.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
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
                <label className={styles.ronasInputLabel}>Brand Email *</label>
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
                <span className={styles.ronasInputHelper}>
                  Used to log in, receive partner notices, and customer inquiries.
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
                <span className={styles.ronasInputHelper}>
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
                  placeholder="e.g. Studio Vesper"
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
                  <label className={styles.ronasInputLabel}>Brand Location</label>
                  <input
                    type="text"
                    value={brand.basedOutOf}
                    onChange={(e) => updateField('basedOutOf', e.target.value)}
                    placeholder="e.g. Ahmedabad & Paris"
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

          {/* STEP 3: Visual Assets & Story */}
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
                          className={styles.removeBadgeBtn}
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
                          Upload Logo
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, 'brands/logos', (data) => updateField('profileImage', data))}
                            style={{ display: 'none' }}
                          />
                        </label>
                      </div>
                      <div style={{ marginTop: '8px' }}>
                        <input
                          type="text"
                          value={brand.profileImage.startsWith('data:') ? '' : brand.profileImage}
                          onChange={(e) => updateField('profileImage', e.target.value)}
                          placeholder="Or enter image URL..."
                          className={styles.ronasInputField}
                          style={{ fontSize: '11px', padding: '8px 10px' }}
                        />
                      </div>
                      {isUploadingMedia && (
                        <div style={{ fontSize: '11px', color: '#6366f1', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '6px', fontWeight: 500 }}>
                          <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> Uploading directly to Supabase drobe-media bucket (0 Vercel bytes)...
                        </div>
                      )}
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
                      style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
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
                      Upload Banner
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'brands/banners', (data) => updateField('coverImage', data))}
                        style={{ display: 'none' }}
                      />
                    </label>
                    <input
                      type="text"
                      value={brand.coverImage.startsWith('data:') ? '' : brand.coverImage}
                      onChange={(e) => updateField('coverImage', e.target.value)}
                      placeholder="Or enter banner URL..."
                      className={styles.ronasInputField}
                      style={{ flex: 1, fontSize: '12px' }}
                    />
                  </div>
                  {isUploadingMedia && (
                    <div style={{ fontSize: '11px', color: '#6366f1', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '6px', fontWeight: 500 }}>
                      <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> Uploading directly to Supabase drobe-media bucket (0 Vercel bytes)...
                    </div>
                  )}
                </div>
              </div>

              {/* Brand Story & Ethos */}
              <div className={styles.ronasInputGroup}>
                <label className={styles.ronasInputLabel}>Brand Story &amp; Craft</label>
                <textarea
                  value={brand.about}
                  onChange={(e) => updateField('about', e.target.value)}
                  placeholder="Share your brand's philosophy, artisanal processes, materials, and origin..."
                  className={styles.ronasInputField}
                  style={{ minHeight: '80px', lineHeight: '1.45' }}
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
                <label className={styles.ronasInputLabel}>Concierge &amp; Inquiries Email</label>
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

          {/* STEP 5: Payout Banking */}
          {activeStepMeta.id === 'banking' && (
            <div className={styles.ronasFormContainer}>
              {/* Trust & RBI compliance notice */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '12px 14px',
                marginBottom: '16px'
              }}>
                <ShieldCheck size={18} color="#2563eb" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.45 }}>
                  <strong style={{ color: '#0f172a' }}>RBI Direct NEFT / RTGS Settlement:</strong> Door-trial purchases and customer retentions are automatically transferred to this verified account within 24 hours of trial completion.
                </div>
              </div>

              {/* Account Holder Name */}
              <div className={styles.ronasInputGroup}>
                <label className={styles.ronasInputLabel}>Account Holder / Business Entity Name *</label>
                <input
                  type="text"
                  value={brand.bankAccount?.accountHolderName || ''}
                  onChange={(e) => updateBankField('accountHolderName', e.target.value)}
                  placeholder="Legal name as registered with your bank"
                  className={styles.ronasInputField}
                  autoFocus
                />
                <span className={styles.ronasInputHelper}>
                  Must match the entity name on your bank passbook, statement or GSTIN.
                </span>
              </div>

              {/* Account Type Toggle */}
              <div className={styles.ronasInputGroup}>
                <label className={styles.ronasInputLabel}>Account Type</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => updateBankField('accountType', 'Current')}
                    style={{
                      padding: '10px',
                      borderRadius: '10px',
                      border: `1.5px solid ${brand.bankAccount?.accountType !== 'Savings' ? '#2563eb' : '#e2e8f0'}`,
                      background: brand.bankAccount?.accountType !== 'Savings' ? '#eff6ff' : '#ffffff',
                      color: brand.bankAccount?.accountType !== 'Savings' ? '#1d4ed8' : '#64748b',
                      fontWeight: 700,
                      fontSize: '13px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    Current Account (Recommended)
                  </button>
                  <button
                    type="button"
                    onClick={() => updateBankField('accountType', 'Savings')}
                    style={{
                      padding: '10px',
                      borderRadius: '10px',
                      border: `1.5px solid ${brand.bankAccount?.accountType === 'Savings' ? '#2563eb' : '#e2e8f0'}`,
                      background: brand.bankAccount?.accountType === 'Savings' ? '#eff6ff' : '#ffffff',
                      color: brand.bankAccount?.accountType === 'Savings' ? '#1d4ed8' : '#64748b',
                      fontWeight: 700,
                      fontSize: '13px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    Savings Account
                  </button>
                </div>
              </div>

              {/* Bank Name */}
              <div className={styles.ronasInputGroup}>
                <label className={styles.ronasInputLabel}>Bank Name *</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                  {POPULAR_BANKS.map(bank => {
                    const isSelected = brand.bankAccount?.bankName === bank;
                    return (
                      <button
                        key={bank}
                        type="button"
                        onClick={() => updateBankField('bankName', bank)}
                        style={{
                          fontSize: '11px',
                          padding: '5px 9px',
                          borderRadius: '6px',
                          border: isSelected ? '1px solid #2563eb' : '1px solid #e2e8f0',
                          background: isSelected ? '#eff6ff' : '#f8fafc',
                          color: isSelected ? '#2563eb' : '#475569',
                          fontWeight: isSelected ? 700 : 500,
                          cursor: 'pointer'
                        }}
                      >
                        {bank}
                      </button>
                    );
                  })}
                </div>
                <input
                  type="text"
                  value={brand.bankAccount?.bankName || ''}
                  onChange={(e) => updateBankField('bankName', e.target.value)}
                  placeholder="Or enter bank name..."
                  className={styles.ronasInputField}
                />
              </div>

              {/* Bank Account Number */}
              <div className={styles.ronasInputGroup}>
                <label className={styles.ronasInputLabel}>Bank Account Number *</label>
                <input
                  type="password"
                  value={brand.bankAccount?.accountNumber || ''}
                  onChange={(e) => updateBankField('accountNumber', e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="Enter bank account number"
                  className={styles.ronasInputField}
                  maxLength={22}
                />
              </div>

              {/* Confirm Bank Account Number */}
              <div className={styles.ronasInputGroup}>
                <label className={styles.ronasInputLabel}>Re-enter Bank Account Number *</label>
                <input
                  type="text"
                  value={confirmAccountNumber}
                  onChange={(e) => setConfirmAccountNumber(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="Confirm bank account number"
                  className={styles.ronasInputField}
                  maxLength={22}
                />
                {confirmAccountNumber && brand.bankAccount?.accountNumber && (
                  <span style={{
                    fontSize: '11px',
                    marginTop: '4px',
                    fontWeight: 600,
                    color: confirmAccountNumber === brand.bankAccount.accountNumber ? '#16a34a' : '#dc2626',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    {confirmAccountNumber === brand.bankAccount.accountNumber ? (
                      <>✓ Account numbers match</>
                    ) : (
                      <>✕ Numbers do not match</>
                    )}
                  </span>
                )}
              </div>

              {/* IFSC Code */}
              <div className={styles.ronasInputGroup}>
                <label className={styles.ronasInputLabel}>Bank IFSC Code *</label>
                <input
                  type="text"
                  value={brand.bankAccount?.ifscCode || ''}
                  onChange={(e) => updateBankField('ifscCode', e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                  placeholder="e.g. HDFC0001842"
                  className={styles.ronasInputField}
                  maxLength={11}
                />
                <span className={styles.ronasInputHelper}>
                  11-character alpha-numeric code found on your chequebook or mobile banking app.
                </span>
              </div>
            </div>
          )}

          {/* STEP 6: Review & Submit */}
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
                    <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#2563eb', fontWeight: 800 }}>
                      {normalizedCategory === 'Both' ? 'Both (Male & Female)' : normalizedCategory}
                    </div>
                    <div style={{ fontSize: '19px', fontWeight: 800, color: '#0b132b', letterSpacing: '-0.02em', fontFamily: 'var(--brand-display-font)' }}>
                      {brand.name || 'Untitled Brand'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      {brand.basedOutOf || 'India'} · Est. {brand.establishedYear || '2024'}
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
                    <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Brand Summary</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                      Profile Verified
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Portal Status</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#2563eb' }}>
                      ● Ready for Submission
                    </div>
                  </div>
                </div>

                {/* Settlement Account Summary Box */}
                {brand.bankAccount?.accountNumber && (
                  <div style={{
                    marginTop: '14px',
                    padding: '10px 12px',
                    background: '#f8fafc',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Building2 size={16} color="#2563eb" />
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
                          {brand.bankAccount.bankName || 'Settlement Bank'}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          •••• {brand.bankAccount.accountNumber.slice(-4)} · {brand.bankAccount.ifscCode || 'IFSC'}
                        </div>
                      </div>
                    </div>
                    <span style={{ fontSize: '10px', background: '#dcfce7', color: '#15803d', fontWeight: 700, padding: '3px 7px', borderRadius: '5px' }}>
                      VERIFIED
                    </span>
                  </div>
                )}
              </div>

              <div className={styles.ronasReadyNotice}>
                <Check size={16} color="#2563eb" />
                <span>Everything is verified. Tap &ldquo;Submit Profile for Verification&rdquo;. Once your brand is approved, you will be authorized to dispatch physical inventory to the Ahmedabad Darkstore Hub.</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. CLEAN STICKY BOTTOM ACTION BAR */}
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
          >
            <span>Continue</span>
            <ArrowRight size={15} />
          </button>
        ) : (
          <button
            type="button"
            onClick={onGoLive}
            className={styles.ronasGoLivePillBtn}
          >
            <span>Submit Profile for Verification →</span>
          </button>
        )}
      </footer>
    </div>
  );
}
