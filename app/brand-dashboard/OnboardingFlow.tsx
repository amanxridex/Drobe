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
  ShieldCheck,
  Crop,
  Camera,
  Zap,
  Warehouse,
  MapPin
} from 'lucide-react';
import { BrandProfile, BrandBankAccount } from './types';
import { supabaseUploadMedia } from '../lib/supabaseClient';
import { EmailOtpModal, ForgotPasswordModal } from './AuthModals';
import ImageCropDrawer from './ImageCropDrawer';
import { ALL_INDIAN_BANKS } from './indianBanks';
import { DROBE_WAREHOUSES } from './warehousesData';
import OnboardingPaymentModal from './OnboardingPaymentModal';
import styles from './brand-mobile.module.css';

interface OnboardingFlowProps {
  brand: BrandProfile;
  onChange: (updated: BrandProfile) => void;
  onGoLive: () => void;
  onExit: () => void;
  onSaveDraft?: () => void;
}

const STEPS = [
  { id: 'account', num: '01', title: 'Account', fullTitle: 'Account credentials', sub: 'Brand email & secure password' },
  { id: 'basics', num: '02', title: 'Basics', fullTitle: 'Brand basics', sub: 'Name, category & location' },
  { id: 'visuals', num: '03', title: 'Visuals', fullTitle: 'Visual assets', sub: 'Logo emblem, cover banner & craft story' },
  { id: 'channels', num: '04', title: 'Channels', fullTitle: 'Channels', sub: 'Website, Instagram & concierge email' },
  { id: 'warehouse', num: '05', title: 'Warehouse', fullTitle: 'Fulfillment Hub', sub: 'Select darkstore hub to inward & store your stock' },
  { id: 'banking', num: '06', title: 'Banking', fullTitle: 'Payout Banking', sub: 'Settlement account for daily door-trial payouts' },
  { id: 'launch', num: '07', title: 'Launch', fullTitle: 'Review & submit', sub: 'Verify brand dossier & submit for approval' }
];

export function MaleIcon({ size = 15, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <circle cx="10" cy="14" r="5" />
      <path d="M19 5l-5.4 5.4" />
      <path d="M15 5h4v4" />
    </svg>
  );
}

export function FemaleIcon({ size = 15, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <circle cx="12" cy="9" r="5" />
      <path d="M12 14v7" />
      <path d="M9 18h6" />
    </svg>
  );
}

export function BothIcon({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
      <MaleIcon size={size} color={color} />
      <FemaleIcon size={size} color={color} />
    </span>
  );
}

export function MandatoryBadge() {
  return (
    <span style={{
      fontSize: '9.5px',
      color: '#E11D48',
      backgroundColor: '#FFE4E6',
      border: '1px solid #FECDD3',
      padding: '2px 7px',
      borderRadius: '9999px',
      fontWeight: 800,
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
      lineHeight: '1',
      display: 'inline-flex',
      alignItems: 'center',
      flexShrink: 0
    }}>
      Required
    </span>
  );
}

export function OptionalBadge() {
  return (
    <span style={{
      fontSize: '9.5px',
      color: '#94A3B8',
      backgroundColor: '#F1F5F9',
      border: '1px solid rgba(148, 163, 184, 0.2)',
      padding: '2px 7px',
      borderRadius: '9999px',
      fontWeight: 700,
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
      lineHeight: '1',
      display: 'inline-flex',
      alignItems: 'center',
      flexShrink: 0
    }}>
      Optional
    </span>
  );
}

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
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [devOtpHint, setDevOtpHint] = useState<string | undefined>(undefined);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [emailAlreadyExists, setEmailAlreadyExists] = useState(false);
  const [existingBrandName, setExistingBrandName] = useState<string | undefined>(undefined);
  const [isOtherBankSelected, setIsOtherBankSelected] = useState(false);
  const [customBankName, setCustomBankName] = useState('');
  const [lockedWarehouseNotice, setLockedWarehouseNotice] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const [cropConfig, setCropConfig] = useState<{
    isOpen: boolean;
    imageSrc: string | null;
    targetAspect: number;
    title: string;
    aspectLabel: string;
    shape: 'rect' | 'round';
    field: 'profileImage' | 'coverImage' | null;
  }>({
    isOpen: false,
    imageSrc: null,
    targetAspect: 1,
    title: 'Crop & Frame Brand Emblem',
    aspectLabel: '1:1 Square',
    shape: 'round',
    field: null
  });

  const pillTrackRef = useRef<HTMLDivElement>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);

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
    if (key === 'email') {
      setEmailAlreadyExists(false);
      if (brand.emailVerified && value !== brand.email) {
        onChange({
          ...brand,
          [key]: value,
          emailVerified: false
        });
        return;
      }
    }
    onChange({
      ...brand,
      [key]: value
    });
  };

  const handleCheckEmailExists = async (emailToCheck: string) => {
    const clean = emailToCheck.trim().toLowerCase();
    if (!clean || !clean.includes('@')) return false;

    try {
      const res = await fetch(`/api/auth/check-email?email=${encodeURIComponent(clean)}`);
      const data = await res.json();
      if (data.exists) {
        setEmailAlreadyExists(true);
        setExistingBrandName(data.brandName);
        setErrorNotice(`This email is already registered with brand "${data.brandName || 'Partner'}". Please log in or reset your password.`);
        return true;
      } else {
        setEmailAlreadyExists(false);
        setExistingBrandName(undefined);
        return false;
      }
    } catch {
      return false;
    }
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

  const handleFileSelectForCrop = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'profileImage' | 'coverImage'
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setCropConfig({
            isOpen: true,
            imageSrc: reader.result,
            targetAspect: field === 'profileImage' ? 1 : 16 / 9,
            title: field === 'profileImage' ? 'Crop & Frame Brand Emblem' : 'Crop & Frame Cover Panorama Banner',
            aspectLabel: field === 'profileImage' ? '1:1 Square' : '16:9 Panorama Banner',
            shape: field === 'profileImage' ? 'round' : 'rect',
            field
          });
        }
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    }
  };

  const handleOpenExistingCrop = (field: 'profileImage' | 'coverImage') => {
    const currentSrc = field === 'profileImage' ? brand.profileImage : brand.coverImage;
    if (!currentSrc) return;
    setCropConfig({
      isOpen: true,
      imageSrc: currentSrc,
      targetAspect: field === 'profileImage' ? 1 : 16 / 9,
      title: field === 'profileImage' ? 'Adjust Brand Emblem' : 'Adjust Cover Panorama Banner',
      aspectLabel: field === 'profileImage' ? '1:1 Square' : '16:9 Panorama Banner',
      shape: field === 'profileImage' ? 'round' : 'rect',
      field
    });
  };

  const handleApplyCroppedImage = async (croppedDataUrl: string, blob?: Blob) => {
    if (!cropConfig.field) return;
    const field = cropConfig.field;
    const folder = field === 'profileImage' ? 'brands/logos' : 'brands/banners';

    updateField(field, croppedDataUrl);

    if (blob) {
      setIsUploadingMedia(true);
      try {
        const brandSlug = (brand.name || 'brand').toLowerCase().replace(/[^a-z0-9]/g, '-');
        const file = new File([blob], `${brandSlug}_${field}_${Date.now()}.jpg`, { type: 'image/jpeg' });
        const uploadRes = await supabaseUploadMedia(file, folder, `${brandSlug}_${Date.now()}`);
        if (uploadRes && uploadRes.url) {
          updateField(field, uploadRes.url);
        }
      } catch (err) {
        console.warn('Background storage upload error:', err);
      } finally {
        setIsUploadingMedia(false);
      }
    }
  };

  const validateStep = (stepIdx: number, silent = false): boolean => {
    const step = STEPS[stepIdx];
    if (!step) return true;

    if (step.id === 'account') {
      const emailTrimmed = brand.email?.trim() || '';
      if (!emailTrimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
        if (!silent) setErrorNotice('Please enter a valid brand email address (e.g. founder@yourbrand.com).');
        return false;
      }
      if (!brand.password || brand.password.length < 6) {
        if (!silent) setErrorNotice('Password is required and must be at least 6 characters.');
        return false;
      }
    }

    if (step.id === 'basics') {
      if (!brand.name?.trim()) {
        if (!silent) setErrorNotice('Brand Legal / Trade Name is required to proceed.');
        return false;
      }
      if (!brand.category?.trim()) {
        if (!silent) setErrorNotice('Please select your brand category (Male, Female, or Both).');
        return false;
      }
      if (!brand.basedOutOf?.trim()) {
        if (!silent) setErrorNotice('Brand Location / City is required (e.g. Ahmedabad, Mumbai, Paris).');
        return false;
      }
      const yearTrimmed = brand.establishedYear?.trim() || '';
      if (!yearTrimmed || !/^\d{4}$/.test(yearTrimmed)) {
        if (!silent) setErrorNotice('Year Founded is required (please enter a valid 4-digit year, e.g. 2024).');
        return false;
      }
      if (!brand.founderName?.trim()) {
        if (!silent) setErrorNotice('Founder / Creative Director name is required.');
        return false;
      }
      if (!brand.founderRole?.trim()) {
        if (!silent) setErrorNotice('Founder Role / Title is required (e.g. Founder & Creative Director).');
        return false;
      }
    }

    if (step.id === 'visuals') {
      if (!brand.profileImage?.trim()) {
        if (!silent) setErrorNotice('Brand Logo / Emblem (1:1) is required.');
        return false;
      }
      if (!brand.coverImage?.trim()) {
        if (!silent) setErrorNotice('Cover Panorama Banner (16:9) is required.');
        return false;
      }
      const aboutTrimmed = brand.about?.trim() || '';
      if (!aboutTrimmed || aboutTrimmed.length < 20) {
        if (!silent) setErrorNotice('Brand Story & Craft is required (minimum 20 characters explaining your brand philosophy).');
        return false;
      }
    }

    if (step.id === 'channels') {
      const igTrimmed = brand.instagram?.trim().replace(/^@/, '') || '';
      if (!igTrimmed) {
        if (!silent) setErrorNotice('Official Instagram handle is required to verify your brand.');
        return false;
      }
      const inqTrimmed = (brand.inquiriesEmail || brand.email || '').trim();
      if (!inqTrimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inqTrimmed)) {
        if (!silent) setErrorNotice('Concierge & Inquiries Email is required for customer support.');
        return false;
      }
    }

    if (step.id === 'warehouse') {
      const selectedWh = (brand.warehouse || 'ahmedabad').trim();
      if (!selectedWh) {
        if (!silent) setErrorNotice('Please select an active fulfillment darkstore hub.');
        return false;
      }
    }

    if (step.id === 'banking') {
      const bank = brand.bankAccount;
      const isUpi = bank?.payoutMethod === 'upi';

      if (isUpi) {
        const nameTrimmed = bank?.accountHolderName?.trim();
        if (!nameTrimmed || nameTrimmed.length < 3) {
          if (!silent) setErrorNotice('Beneficiary / Entity Name registered with your UPI is required.');
          return false;
        }
        const upiTrimmed = bank?.upiId?.trim() || '';
        if (!upiTrimmed || !upiTrimmed.includes('@') || upiTrimmed.length < 5) {
          if (!silent) setErrorNotice('UPI ID / VPA is required (e.g. yourbrand@okhdfcbank).');
          return false;
        }
      } else {
        const nameTrimmed = bank?.accountHolderName?.trim();
        if (!nameTrimmed || nameTrimmed.length < 3) {
          if (!silent) setErrorNotice('Account Holder Name matching your bank account is required.');
          return false;
        }
        const finalBank = isOtherBankSelected ? (customBankName.trim() || bank?.bankName?.trim()) : bank?.bankName?.trim();
        if (!finalBank || finalBank === 'Other Bank (Specify Below)') {
          if (!silent) setErrorNotice('Please select or specify your Bank Name.');
          return false;
        }
        const accTrimmed = (bank?.accountNumber || '').trim().replace(/\s/g, '');
        if (!accTrimmed || accTrimmed.length < 8) {
          if (!silent) setErrorNotice('Bank Account Number is required (at least 8 digits).');
          return false;
        }
        const confirmTrimmed = confirmAccountNumber.trim().replace(/\s/g, '');
        if (confirmTrimmed && accTrimmed !== confirmTrimmed) {
          if (!silent) setErrorNotice('Bank Account Numbers do not match. Please verify your entries.');
          return false;
        }
        const ifscTrimmed = (bank?.ifscCode || '').trim().toUpperCase();
        if (!ifscTrimmed || ifscTrimmed.length !== 11) {
          if (!silent) setErrorNotice('Bank IFSC Code is required (11-character code, e.g. HDFC0001842).');
          return false;
        }
      }
    }

    if (!silent) setErrorNotice(null);
    return true;
  };

  const validateFullProfile = (): boolean => {
    for (let s = 0; s < 6; s++) {
      if (!validateStep(s)) {
        setCurrentStep(s);
        return false;
      }
      if (s === 0 && !brand.emailVerified) {
        setCurrentStep(0);
        setErrorNotice('Your brand email must be verified via OTP before submitting your profile.');
        return false;
      }
    }
    setErrorNotice(null);
    return true;
  };

  const handleFinalSubmit = () => {
    if (!validateFullProfile()) {
      return;
    }
    if (brand.onboardingPayment?.status === 'paid') {
      onGoLive();
    } else {
      setShowPaymentModal(true);
    }
  };

  const handleNext = async () => {
    if (!validateStep(currentStep)) return;

    if (currentStep === 0 && !brand.emailVerified) {
      setIsSendingOtp(true);
      setErrorNotice(null);

      try {
        const res = await fetch('/api/auth/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: brand.email?.trim().toLowerCase(),
            purpose: 'signup'
          })
        });

        const data = await res.json();

        if (res.status === 409 || data.error === 'already_exists') {
          setEmailAlreadyExists(true);
          setExistingBrandName(data.brandName);
          setErrorNotice(data.message || 'This email is already registered in DROBE. Please log in or reset your password.');
          setIsSendingOtp(false);
          return;
        }

        if (!res.ok) {
          setErrorNotice(data.message || 'Failed to dispatch verification email from verify@drobe.one. Please try again.');
          setIsSendingOtp(false);
          return;
        }

        if (data.devOtp) {
          setDevOtpHint(data.devOtp);
        }
        setShowOtpModal(true);
      } catch {
        setErrorNotice('Network error requesting verification OTP. Please try again.');
      } finally {
        setIsSendingOtp(false);
      }
      return;
    }

    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleOtpVerified = (savedBrand?: any) => {
    setShowOtpModal(false);
    setErrorNotice(null);
    setEmailAlreadyExists(false);

    const updated: BrandProfile = {
      ...brand,
      emailVerified: true,
      ...(savedBrand?.id ? { id: savedBrand.id } : {})
    };
    onChange(updated);
    setCurrentStep(1);
  };

  const handleStepClick = (idx: number) => {
    if (idx > currentStep) {
      for (let s = currentStep; s < idx; s++) {
        if (!validateStep(s)) {
          setCurrentStep(s);
          return;
        }
        if (s === 0 && !brand.emailVerified) {
          setCurrentStep(0);
          setErrorNotice('Please verify your email before proceeding.');
          return;
        }
      }
    }
    setErrorNotice(null);
    setCurrentStep(idx);
  };

  const isStep0Done = Boolean(brand.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(brand.email.trim()) && brand.password && brand.password.length >= 6 && brand.emailVerified);
  const isStep1Done = Boolean(
    brand.name?.trim() &&
    brand.category?.trim() &&
    brand.basedOutOf?.trim() &&
    brand.establishedYear?.trim() &&
    /^\d{4}$/.test(brand.establishedYear.trim()) &&
    brand.founderName?.trim() &&
    brand.founderRole?.trim()
  );
  const isStep2Done = Boolean(
    brand.profileImage?.trim() &&
    brand.coverImage?.trim() &&
    brand.about?.trim() &&
    brand.about.trim().length >= 20
  );
  const isStep3Done = Boolean(
    brand.instagram?.trim().replace(/^@/, '') &&
    (brand.inquiriesEmail || brand.email || '').trim().includes('@')
  );
  const isStep4Done = Boolean((brand.warehouse || 'ahmedabad').trim());
  const isStep5Done = Boolean(
    brand.bankAccount?.payoutMethod === 'upi'
      ? (brand.bankAccount?.accountHolderName?.trim() && (brand.bankAccount?.accountHolderName?.trim().length || 0) >= 3 && brand.bankAccount?.upiId?.trim() && brand.bankAccount.upiId.includes('@'))
      : (brand.bankAccount?.accountHolderName?.trim() && (brand.bankAccount?.accountHolderName?.trim().length || 0) >= 3 && brand.bankAccount?.bankName?.trim() && brand.bankAccount.bankName !== 'Other Bank (Specify Below)' && (brand.bankAccount?.accountNumber || '').trim().length >= 8 && (brand.bankAccount?.ifscCode || '').trim().length === 11)
  );

  const isProfileComplete = isStep0Done && isStep1Done && isStep2Done && isStep3Done && isStep4Done && isStep5Done;
  const activeStepMeta = STEPS[currentStep];

  return (
    <div className={styles.obFlowContainer}>
      {/* Ambient Radial Lighting Glow */}
      <div className={styles.bdMeshGlow} />

      {/* 1. TOP HEADER & CLOSE / SAVE */}
      <header className={styles.obFlowHeader}>
        <div className={styles.obBrandEmblemGroup}>
          <span className={styles.obBrandWordmark}>DROBE</span>
          <span className={styles.obPartnerTag}>ONBOARDING</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {onSaveDraft && (
            <button
              type="button"
              onClick={onSaveDraft}
              style={{
                background: '#FFFFFF',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                padding: '6px 12px',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: 700,
                color: '#64748B',
                cursor: 'pointer'
              }}
            >
              Save Draft
            </button>
          )}

          <button
            type="button"
            onClick={onExit}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '9999px',
              background: '#FFFFFF',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748B',
              cursor: 'pointer'
            }}
          >
            <X size={16} />
          </button>
        </div>
      </header>

      {/* 2. SQUIRCLE STEPPER TRACK */}
      <div className={styles.obStepperWrapper}>
        <div ref={pillTrackRef} className={styles.obStepperTrack}>
          {STEPS.map((st, idx) => {
            const isActive = idx === currentStep;
            const isDone = idx < currentStep;

            return (
              <button
                key={st.id}
                type="button"
                onClick={() => handleStepClick(idx)}
                className={`${styles.obStepPill} ${isActive ? styles.obStepPillActive : ''} ${isDone ? styles.obStepPillDone : ''}`}
              >
                {isDone ? (
                  <Check size={12} strokeWidth={3} />
                ) : (
                  <span style={{ fontSize: '11px', opacity: 0.8 }}>{st.num}</span>
                )}
                <span>{st.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. SCROLLABLE FORM CONTENT */}
      <div className={styles.obFlowContent}>
        <div className={styles.obFormStage}>
          {/* Step Headline & Subtitle */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStepMeta.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              style={{ marginBottom: '18px' }}
            >
              <h2 className={styles.obStepTitle}>
                {activeStepMeta.fullTitle || activeStepMeta.title}
              </h2>
              <p className={styles.obStepSub}>
                {activeStepMeta.sub}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Error Banner */}
          {errorNotice && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: '16px',
                padding: '12px 14px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#991B1B',
                fontSize: '12.5px',
                fontWeight: 600
              }}
            >
              <AlertCircle size={15} color="#DC2626" style={{ flexShrink: 0 }} />
              <span>{errorNotice}</span>
            </motion.div>
          )}

          {/* STEP 0: Account Credentials */}
          {activeStepMeta.id === 'account' && (
            <div style={{ background: '#FFFFFF', borderRadius: '26px', padding: '20px', boxShadow: 'var(--shadow-card)', border: '1.5px solid rgba(148, 163, 184, 0.16)' }}>
              <div className={styles.obInputGroup}>
                <div className={styles.obInputHeader}>
                  <label className={styles.obInputLabel}>Brand Email</label>
                  {brand.emailVerified ? (
                    <span style={{ fontSize: '11px', color: '#065F46', fontWeight: 800, backgroundColor: '#ECFDF5', padding: '3px 9px', borderRadius: '9999px' }}>
                      ✓ Verified
                    </span>
                  ) : (
                    <MandatoryBadge />
                  )}
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    value={brand.email || ''}
                    onChange={(e) => updateField('email', e.target.value)}
                    onBlur={() => handleCheckEmailExists(brand.email || '')}
                    placeholder="founder@yourbrand.com"
                    className={styles.obInputField}
                    style={{ paddingLeft: '40px' }}
                    autoFocus
                  />
                  <Mail size={16} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>

                {brand.emailVerified ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', color: '#16A34A', fontSize: '12px', fontWeight: 700 }}>
                    <ShieldCheck size={14} color="#16A34A" />
                    <span>Email verified by verify@drobe.one</span>
                  </div>
                ) : (
                  <span style={{ fontSize: '11.5px', color: '#64748B', marginTop: '5px', display: 'block' }}>
                    A 6-digit verification code will be sent to this email from <strong style={{ color: '#0F172A' }}>verify@drobe.one</strong>.
                  </span>
                )}

                {emailAlreadyExists && (
                  <div style={{
                    backgroundColor: '#FEF2F2',
                    border: '1px solid #FECACA',
                    borderRadius: '14px',
                    padding: '12px 14px',
                    marginTop: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    <div style={{ color: '#991B1B', fontSize: '12.5px', fontWeight: 700 }}>
                      Account already exists in DROBE{existingBrandName ? ` for "${existingBrandName}"` : ''}.
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={onExit}
                        className={styles.obBtnPrimary}
                        style={{ height: '38px', fontSize: '12px' }}
                      >
                        Sign In →
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowForgotPasswordModal(true)}
                        className={styles.obBtnSecondary}
                        style={{ height: '38px', fontSize: '12px' }}
                      >
                        Reset Password
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.obInputGroup} style={{ marginBottom: 0 }}>
                <div className={styles.obInputHeader}>
                  <label className={styles.obInputLabel}>Password</label>
                  <MandatoryBadge />
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={brand.password || ''}
                    onChange={(e) => updateField('password', e.target.value)}
                    placeholder="Create a password (min. 6 characters)"
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
                <span style={{ fontSize: '11.5px', color: '#64748B', marginTop: '5px', display: 'block' }}>
                  Must be at least 6 characters.
                </span>
              </div>
            </div>
          )}

          {/* STEP 1: Brand Basics */}
          {activeStepMeta.id === 'basics' && (
            <div style={{ background: '#FFFFFF', borderRadius: '26px', padding: '20px', boxShadow: 'var(--shadow-card)', border: '1.5px solid rgba(148, 163, 184, 0.16)' }}>
              <div className={styles.obInputGroup}>
                <div className={styles.obInputHeader}>
                  <label className={styles.obInputLabel}>Brand Legal / Trade Name</label>
                  <MandatoryBadge />
                </div>
                <input
                  type="text"
                  value={brand.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="e.g. Studio Vesper"
                  className={styles.obInputField}
                  autoFocus
                />
              </div>

              <div className={styles.obInputGroup}>
                <div className={styles.obInputHeader}>
                  <label className={styles.obInputLabel}>Tagline or Philosophy</label>
                  <OptionalBadge />
                </div>
                <input
                  type="text"
                  value={brand.tagline}
                  onChange={(e) => updateField('tagline', e.target.value)}
                  placeholder="e.g. Artisanal silhouette and mindful daily tailoring"
                  className={styles.obInputField}
                />
              </div>

              {/* Target Category 3-way toggle */}
              <div className={styles.obInputGroup}>
                <div className={styles.obInputHeader}>
                  <label className={styles.obInputLabel}>Target Audience / Category</label>
                  <MandatoryBadge />
                </div>
                <div className={styles.obSegmentedTrack}>
                  <button
                    type="button"
                    onClick={() => updateField('category', 'Male')}
                    className={`${styles.obSegmentedPill} ${normalizedCategory === 'Male' ? styles.obSegmentedPillActiveBlue : ''}`}
                  >
                    Male
                  </button>
                  <button
                    type="button"
                    onClick={() => updateField('category', 'Both')}
                    className={`${styles.obSegmentedPill} ${normalizedCategory === 'Both' ? styles.obSegmentedPillActivePurple : ''}`}
                  >
                    Both
                  </button>
                  <button
                    type="button"
                    onClick={() => updateField('category', 'Female')}
                    className={`${styles.obSegmentedPill} ${normalizedCategory === 'Female' ? styles.obSegmentedPillActivePink : ''}`}
                  >
                    Female
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className={styles.obInputGroup}>
                  <div className={styles.obInputHeader}>
                    <label className={styles.obInputLabel}>Location</label>
                    <MandatoryBadge />
                  </div>
                  <input
                    type="text"
                    value={brand.basedOutOf}
                    onChange={(e) => updateField('basedOutOf', e.target.value)}
                    placeholder="e.g. Ahmedabad"
                    className={styles.obInputField}
                  />
                </div>

                <div className={styles.obInputGroup}>
                  <div className={styles.obInputHeader}>
                    <label className={styles.obInputLabel}>Year Founded</label>
                    <MandatoryBadge />
                  </div>
                  <input
                    type="text"
                    value={brand.establishedYear}
                    onChange={(e) => updateField('establishedYear', e.target.value)}
                    placeholder="e.g. 2024"
                    className={styles.obInputField}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: 0 }}>
                <div className={styles.obInputGroup} style={{ marginBottom: 0 }}>
                  <div className={styles.obInputHeader}>
                    <label className={styles.obInputLabel}>Founder Name</label>
                    <MandatoryBadge />
                  </div>
                  <input
                    type="text"
                    value={brand.founderName}
                    onChange={(e) => updateField('founderName', e.target.value)}
                    placeholder="e.g. Sophie Laurent"
                    className={styles.obInputField}
                  />
                </div>

                <div className={styles.obInputGroup} style={{ marginBottom: 0 }}>
                  <div className={styles.obInputHeader}>
                    <label className={styles.obInputLabel}>Founder Title</label>
                    <MandatoryBadge />
                  </div>
                  <input
                    type="text"
                    value={brand.founderRole}
                    onChange={(e) => updateField('founderRole', e.target.value)}
                    placeholder="e.g. Creative Director"
                    className={styles.obInputField}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Visual Assets & Story */}
          {activeStepMeta.id === 'visuals' && (
            <div>
              {/* Emblem / Logo Card */}
              <div className={styles.obMediaCard}>
                <div className={styles.obInputHeader}>
                  <label className={styles.obInputLabel}>Brand Logo / Emblem (1:1)</label>
                  <MandatoryBadge />
                </div>

                <div className={styles.obEmblemDropRow}>
                  <div className={styles.obEmblemFrame}>
                    {brand.profileImage ? (
                      <img
                        src={brand.profileImage}
                        alt="Logo emblem"
                        className={styles.obEmblemImg}
                      />
                    ) : (
                      <span style={{ fontSize: '24px', fontWeight: 900, color: '#2F69FE' }}>
                        {brand.name ? brand.name.slice(0, 1).toUpperCase() : 'B'}
                      </span>
                    )}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <label style={{
                        background: '#EEF3FF',
                        border: '1px solid rgba(47, 105, 254, 0.2)',
                        color: '#2F69FE',
                        padding: '8px 14px',
                        borderRadius: '9999px',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <Upload size={13} />
                        <span>{brand.profileImage ? 'Change Emblem' : 'Upload Emblem'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileSelectForCrop(e, 'profileImage')}
                          style={{ display: 'none' }}
                        />
                      </label>

                      {brand.profileImage && (
                        <button
                          type="button"
                          onClick={() => handleOpenExistingCrop('profileImage')}
                          style={{
                            background: '#FFFFFF',
                            border: '1px solid rgba(148, 163, 184, 0.2)',
                            color: '#0F172A',
                            padding: '8px 14px',
                            borderRadius: '9999px',
                            fontSize: '12.5px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px'
                          }}
                        >
                          <Crop size={13} />
                          <span>Adjust &amp; Frame</span>
                        </button>
                      )}
                    </div>

                    <div style={{ marginTop: '8px' }}>
                      <input
                        type="text"
                        value={brand.profileImage.startsWith('data:') ? '' : brand.profileImage}
                        onChange={(e) => updateField('profileImage', e.target.value)}
                        placeholder="Or enter image URL..."
                        className={styles.obInputField}
                        style={{ height: '38px', fontSize: '12px' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Cover Banner Card */}
              <div className={styles.obMediaCard}>
                <div className={styles.obInputHeader}>
                  <label className={styles.obInputLabel}>Cover Panorama Banner (16:9)</label>
                  <MandatoryBadge />
                </div>

                <div
                  className={styles.obBannerFrame}
                  onClick={() => coverFileInputRef.current?.click()}
                >
                  {brand.coverImage ? (
                    <img
                      src={brand.coverImage}
                      alt="Cover Panorama"
                      className={styles.obBannerImg}
                    />
                  ) : (
                    <>
                      <Camera size={26} color="#94A3B8" />
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748B' }}>
                        Click to upload &amp; crop 16:9 panorama banner
                      </span>
                    </>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    ref={coverFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileSelectForCrop(e, 'coverImage')}
                    style={{ display: 'none' }}
                  />
                  <button
                    type="button"
                    onClick={() => coverFileInputRef.current?.click()}
                    style={{
                      background: '#EEF3FF',
                      border: '1px solid rgba(47, 105, 254, 0.2)',
                      color: '#2F69FE',
                      padding: '8px 14px',
                      borderRadius: '9999px',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      flexShrink: 0
                    }}
                  >
                    <Upload size={13} />
                    <span>{brand.coverImage ? 'Change Banner' : 'Upload Banner'}</span>
                  </button>

                  {brand.coverImage && (
                    <button
                      type="button"
                      onClick={() => handleOpenExistingCrop('coverImage')}
                      style={{
                        background: '#FFFFFF',
                        border: '1px solid rgba(148, 163, 184, 0.2)',
                        color: '#0F172A',
                        padding: '8px 14px',
                        borderRadius: '9999px',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        flexShrink: 0
                      }}
                    >
                      <Crop size={13} />
                      <span>Crop</span>
                    </button>
                  )}

                  <input
                    type="text"
                    value={brand.coverImage.startsWith('data:') ? '' : brand.coverImage}
                    onChange={(e) => updateField('coverImage', e.target.value)}
                    placeholder="Or enter banner URL..."
                    className={styles.obInputField}
                    style={{ height: '38px', fontSize: '12px', flex: 1 }}
                  />
                </div>
              </div>

              {/* Story / Craft */}
              <div style={{ background: '#FFFFFF', borderRadius: '26px', padding: '20px', boxShadow: 'var(--shadow-card)', border: '1.5px solid rgba(148, 163, 184, 0.16)' }}>
                <div className={styles.obInputGroup}>
                  <div className={styles.obInputHeader}>
                    <label className={styles.obInputLabel}>Brand Story &amp; Craft</label>
                    <MandatoryBadge />
                  </div>
                  <textarea
                    value={brand.about}
                    onChange={(e) => updateField('about', e.target.value)}
                    placeholder="Share your brand's philosophy, artisanal craftsmanship, materials, and origin (min. 20 characters)..."
                    className={styles.obInputField}
                    style={{ minHeight: '90px', padding: '12px 16px', lineHeight: 1.5, resize: 'vertical' }}
                  />
                </div>

                <div className={styles.obInputGroup} style={{ marginBottom: 0 }}>
                  <div className={styles.obInputHeader}>
                    <label className={styles.obInputLabel}>Founder Quote / Statement</label>
                    <OptionalBadge />
                  </div>
                  <input
                    type="text"
                    value={brand.founderQuote}
                    onChange={(e) => updateField('founderQuote', e.target.value)}
                    placeholder="e.g. Modern luxury begins with reverence for the silhouette."
                    className={styles.obInputField}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Channels */}
          {activeStepMeta.id === 'channels' && (
            <div style={{ background: '#FFFFFF', borderRadius: '26px', padding: '20px', boxShadow: 'var(--shadow-card)', border: '1.5px solid rgba(148, 163, 184, 0.16)' }}>
              <div className={styles.obInputGroup}>
                <div className={styles.obInputHeader}>
                  <label className={styles.obInputLabel}>Official Instagram Handle</label>
                  <MandatoryBadge />
                </div>
                <input
                  type="text"
                  value={brand.instagram}
                  onChange={(e) => updateField('instagram', e.target.value)}
                  placeholder="@yourbrand"
                  className={styles.obInputField}
                />
                <span style={{ fontSize: '11.5px', color: '#64748B', marginTop: '5px', display: 'block' }}>
                  Required for social verification and client credibility.
                </span>
              </div>

              <div className={styles.obInputGroup}>
                <div className={styles.obInputHeader}>
                  <label className={styles.obInputLabel}>Concierge &amp; Inquiries Email</label>
                  <MandatoryBadge />
                </div>
                <input
                  type="email"
                  value={brand.inquiriesEmail || brand.email || ''}
                  onChange={(e) => updateField('inquiriesEmail', e.target.value)}
                  placeholder={brand.email || "concierge@yourbrand.com"}
                  className={styles.obInputField}
                />
              </div>

              <div className={styles.obInputGroup} style={{ marginBottom: 0 }}>
                <div className={styles.obInputHeader}>
                  <label className={styles.obInputLabel}>Official Website URL</label>
                  <OptionalBadge />
                </div>
                <input
                  type="text"
                  value={brand.website}
                  onChange={(e) => updateField('website', e.target.value)}
                  placeholder="https://yourbrand.com (optional)"
                  className={styles.obInputField}
                />
              </div>
            </div>
          )}

          {/* STEP 4: Fulfillment Hub */}
          {activeStepMeta.id === 'warehouse' && (
            <div>
              {/* Introduction Pill */}
              <div style={{
                background: '#ECFDF5',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                borderRadius: '18px',
                padding: '12px 16px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <Warehouse size={18} color="#065F46" style={{ flexShrink: 0 }} />
                <div style={{ fontSize: '12.5px', color: '#065F46', lineHeight: 1.45, fontWeight: 600 }}>
                  Select the central darkstore where your inventory will be tagged for 10-minute doorstep try-on delivery.
                </div>
              </div>

              {lockedWarehouseNotice && (
                <div style={{
                  backgroundColor: '#FFFBEB',
                  border: '1px solid #FDE68A',
                  borderRadius: '16px',
                  padding: '12px 14px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '10px',
                  color: '#92400E',
                  fontSize: '12px'
                }}>
                  <span>{lockedWarehouseNotice}</span>
                  <button
                    type="button"
                    onClick={() => setLockedWarehouseNotice(null)}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#92400E' }}
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {DROBE_WAREHOUSES.map((wh) => {
                const isSelected = (brand.warehouse || 'ahmedabad') === wh.id;
                const isAvailable = wh.isAvailable;

                return (
                  <div
                    key={wh.id}
                    onClick={() => {
                      if (isAvailable) {
                        updateField('warehouse', wh.id);
                        setLockedWarehouseNotice(null);
                      } else {
                        setLockedWarehouseNotice(
                          `Regional expansion: ${wh.name} (${wh.city}) is scheduled for ${wh.phase}. Currently, all stock is inwarded through Ahmedabad Mega Darkstore #01.`
                        );
                      }
                    }}
                    className={`${styles.obWarehouseCard} ${isSelected ? styles.obWarehouseCardSelected : ''} ${!isAvailable ? styles.obWarehouseCardLocked : ''}`}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <div style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '12px',
                          background: isSelected ? '#2F69FE' : '#F1F5F9',
                          color: isSelected ? '#FFFFFF' : '#64748B',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <Warehouse size={18} />
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>
                              {wh.name}
                            </span>
                            <span style={{
                              fontSize: '10px',
                              fontWeight: 800,
                              padding: '2px 8px',
                              borderRadius: '9999px',
                              backgroundColor: isSelected ? '#EEF3FF' : isAvailable ? '#ECFDF5' : '#F1F5F9',
                              color: isSelected ? '#2F69FE' : isAvailable ? '#065F46' : '#64748B'
                            }}>
                              {isAvailable ? (isSelected ? 'Active · Selected' : wh.badge) : 'Next Phase'}
                            </span>
                          </div>
                          <p style={{ fontSize: '12px', color: '#64748B', margin: '3px 0 0', lineHeight: 1.4 }}>
                            {wh.tagline}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', fontSize: '11px', color: '#94A3B8' }}>
                            <MapPin size={11} />
                            <span>{wh.address}</span>
                          </div>
                        </div>
                      </div>

                      <div style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        border: `2px solid ${isSelected ? '#2F69FE' : '#CBD5E1'}`,
                        backgroundColor: isSelected ? '#2F69FE' : '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {isSelected && <Check size={13} strokeWidth={3} color="#FFFFFF" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* STEP 5: Payout Banking */}
          {activeStepMeta.id === 'banking' && (
            <div style={{ background: '#FFFFFF', borderRadius: '26px', padding: '20px', boxShadow: 'var(--shadow-card)', border: '1.5px solid rgba(148, 163, 184, 0.16)' }}>
              {/* Method Switcher */}
              <div style={{ marginBottom: '16px' }}>
                <div className={styles.obInputHeader}>
                  <label className={styles.obInputLabel}>Payout Method</label>
                  <MandatoryBadge />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => updateBankField('payoutMethod', 'bank')}
                    className={`${styles.obSegmentedPill} ${brand.bankAccount?.payoutMethod !== 'upi' ? styles.obSegmentedPillActiveBlue : ''}`}
                    style={{ background: brand.bankAccount?.payoutMethod !== 'upi' ? undefined : '#F8FAFD' }}
                  >
                    <Building2 size={14} />
                    <span>Bank Transfer</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => updateBankField('payoutMethod', 'upi')}
                    className={`${styles.obSegmentedPill} ${brand.bankAccount?.payoutMethod === 'upi' ? styles.obSegmentedPillActivePurple : ''}`}
                    style={{ background: brand.bankAccount?.payoutMethod === 'upi' ? undefined : '#F8FAFD' }}
                  >
                    <Zap size={14} />
                    <span>Instant UPI</span>
                  </button>
                </div>
              </div>

              {brand.bankAccount?.payoutMethod === 'upi' ? (
                <>
                  <div className={styles.obInputGroup}>
                    <div className={styles.obInputHeader}>
                      <label className={styles.obInputLabel}>Beneficiary / Entity Name</label>
                      <MandatoryBadge />
                    </div>
                    <input
                      type="text"
                      value={brand.bankAccount?.accountHolderName || ''}
                      onChange={(e) => updateBankField('accountHolderName', e.target.value)}
                      placeholder="Legal entity name matching UPI"
                      className={styles.obInputField}
                      autoFocus
                    />
                  </div>

                  <div className={styles.obInputGroup} style={{ marginBottom: 0 }}>
                    <div className={styles.obInputHeader}>
                      <label className={styles.obInputLabel}>UPI ID / VPA</label>
                      <MandatoryBadge />
                    </div>
                    <input
                      type="text"
                      value={brand.bankAccount?.upiId || ''}
                      onChange={(e) => updateBankField('upiId', e.target.value.trim().toLowerCase())}
                      placeholder="e.g. brandname@okhdfcbank"
                      className={styles.obInputField}
                    />
                    <span style={{ fontSize: '11.5px', color: '#64748B', marginTop: '5px', display: 'block' }}>
                      Daily door-trial settlements will automatically deposit to this handle.
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className={styles.obInputGroup}>
                    <div className={styles.obInputHeader}>
                      <label className={styles.obInputLabel}>Account Holder Name</label>
                      <MandatoryBadge />
                    </div>
                    <input
                      type="text"
                      value={brand.bankAccount?.accountHolderName || ''}
                      onChange={(e) => updateBankField('accountHolderName', e.target.value)}
                      placeholder="Legal bank account holder name"
                      className={styles.obInputField}
                      autoFocus
                    />
                  </div>

                  <div className={styles.obInputGroup}>
                    <div className={styles.obInputHeader}>
                      <label className={styles.obInputLabel}>Bank Name</label>
                      <MandatoryBadge />
                    </div>
                    <select
                      value={isOtherBankSelected ? 'Other Bank (Specify Below)' : (brand.bankAccount?.bankName || 'HDFC Bank')}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'Other Bank (Specify Below)') {
                          setIsOtherBankSelected(true);
                        } else {
                          setIsOtherBankSelected(false);
                          updateBankField('bankName', val);
                        }
                      }}
                      className={styles.obInputField}
                      style={{ appearance: 'auto', cursor: 'pointer' }}
                    >
                      {ALL_INDIAN_BANKS.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                      <option value="Other Bank (Specify Below)">Other Bank (Specify Below)</option>
                    </select>

                    {isOtherBankSelected && (
                      <input
                        type="text"
                        value={customBankName}
                        onChange={(e) => {
                          setCustomBankName(e.target.value);
                          updateBankField('bankName', e.target.value);
                        }}
                        placeholder="Specify your bank name..."
                        className={styles.obInputField}
                        style={{ marginTop: '8px' }}
                      />
                    )}
                  </div>

                  <div className={styles.obInputGroup}>
                    <div className={styles.obInputHeader}>
                      <label className={styles.obInputLabel}>Account Number</label>
                      <MandatoryBadge />
                    </div>
                    <input
                      type="password"
                      value={brand.bankAccount?.accountNumber || ''}
                      onChange={(e) => updateBankField('accountNumber', e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="Enter bank account number"
                      className={styles.obInputField}
                      maxLength={22}
                    />
                  </div>

                  <div className={styles.obInputGroup}>
                    <div className={styles.obInputHeader}>
                      <label className={styles.obInputLabel}>Confirm Account Number</label>
                      <MandatoryBadge />
                    </div>
                    <input
                      type="text"
                      value={confirmAccountNumber}
                      onChange={(e) => setConfirmAccountNumber(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="Re-enter bank account number"
                      className={styles.obInputField}
                      maxLength={22}
                    />
                  </div>

                  <div className={styles.obInputGroup} style={{ marginBottom: 0 }}>
                    <div className={styles.obInputHeader}>
                      <label className={styles.obInputLabel}>Bank IFSC Code</label>
                      <MandatoryBadge />
                    </div>
                    <input
                      type="text"
                      value={brand.bankAccount?.ifscCode || ''}
                      onChange={(e) => updateBankField('ifscCode', e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                      placeholder="e.g. HDFC0001842"
                      className={styles.obInputField}
                      maxLength={11}
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* STEP 6: Review & Submit */}
          {activeStepMeta.id === 'launch' && (
            <div>
              {/* Dossier Summary Card */}
              <div style={{ background: '#FFFFFF', borderRadius: '26px', padding: '20px', boxShadow: 'var(--shadow-card)', border: '1.5px solid rgba(148, 163, 184, 0.16)', marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '14px' }}>
                  {brand.profileImage ? (
                    <img
                      src={brand.profileImage}
                      alt={brand.name}
                      style={{ width: '56px', height: '56px', borderRadius: '18px', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: '#EEF3FF', color: '#2F69FE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: 900 }}>
                      {brand.name ? brand.name.slice(0, 1).toUpperCase() : 'B'}
                    </div>
                  )}

                  <div>
                    <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#2F69FE', fontWeight: 800 }}>
                      {normalizedCategory === 'Both' ? 'Both (Male & Female)' : normalizedCategory}
                    </span>
                    <h3 style={{ fontSize: '19px', fontWeight: 850, color: '#0F172A', margin: '2px 0' }}>
                      {brand.name || 'Untitled Brand'}
                    </h3>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>
                      {brand.basedOutOf || 'India'} · Est. {brand.establishedYear || '2024'}
                    </div>
                  </div>
                </div>

                {brand.coverImage && (
                  <div style={{ borderRadius: '16px', overflow: 'hidden', height: '110px', marginBottom: '14px' }}>
                    <img
                      src={brand.coverImage}
                      alt="Cover"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', paddingTop: '12px', borderTop: '1px solid #F1F5F9' }}>
                  <div>
                    <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Fulfillment Hub</div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>
                      Ahmedabad Hub #01
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Payout Channel</div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#2F69FE' }}>
                      {brand.bankAccount?.payoutMethod === 'upi' ? 'Instant UPI' : 'Direct Bank'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Commercial Terms Bento */}
              <div style={{
                background: 'linear-gradient(135deg, #EEF3FF 0%, #F8FAFD 100%)',
                borderRadius: '24px',
                border: '1.5px solid rgba(47, 105, 254, 0.25)',
                padding: '18px',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#2F69FE', fontWeight: 800 }}>
                    COMMERCIAL PLAN &amp; ACTIVATION
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#065F46', background: '#ECFDF5', padding: '2px 8px', borderRadius: '9999px' }}>
                    {brand.onboardingPayment?.status === 'paid' ? '✓ ₹99 Paid' : '₹99 Activation Fee'}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '10px' }}>
                  <div style={{ background: '#FFFFFF', padding: '8px 10px', borderRadius: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', color: '#64748B', fontWeight: 700 }}>Activation</div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>₹99 One-Time</div>
                  </div>
                  <div style={{ background: '#FFFFFF', padding: '8px 10px', borderRadius: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', color: '#065F46', fontWeight: 700 }}>Commission</div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#065F46' }}>1% Brand Fee</div>
                  </div>
                  <div style={{ background: '#FFFFFF', padding: '8px 10px', borderRadius: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', color: '#2F69FE', fontWeight: 700 }}>User Markup</div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#2F69FE' }}>5% Consumer</div>
                  </div>
                </div>

                <div style={{ fontSize: '11.5px', color: '#1E40AF', lineHeight: 1.4 }}>
                  The 5% technology fee is charged to <em>consumers</em> at checkout — <strong>zero deductions from your brand</strong>.
                </div>
              </div>

              {/* Checklist Audit */}
              <div style={{ background: '#FFFFFF', borderRadius: '24px', padding: '16px', border: '1.5px solid rgba(148, 163, 184, 0.16)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748B', fontWeight: 800 }}>
                    Dossier Completeness
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: isProfileComplete ? '#065F46' : '#DC2626' }}>
                    {isProfileComplete ? '✓ 100% Ready' : 'Incomplete'}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {[
                    { step: 0, label: '01. Email & Password Verified', done: isStep0Done },
                    { step: 1, label: '02. Brand Basics & Founder Dossier', done: isStep1Done },
                    { step: 2, label: '03. Visual Assets & Craft Story', done: isStep2Done },
                    { step: 3, label: '04. Channels & Instagram Handle', done: isStep3Done },
                    { step: 4, label: '05. Darkstore Warehouse Selected', done: isStep4Done },
                    { step: 5, label: '06. Settlement Bank / UPI Registered', done: isStep5Done }
                  ].map((item) => (
                    <div
                      key={item.step}
                      onClick={() => setCurrentStep(item.step)}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 12px',
                        borderRadius: '12px',
                        background: item.done ? '#F8FAFD' : '#FEF2F2',
                        cursor: 'pointer'
                      }}
                    >
                      <span style={{ fontSize: '12px', fontWeight: 700, color: item.done ? '#0F172A' : '#991B1B' }}>
                        {item.label}
                      </span>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: item.done ? '#065F46' : '#DC2626' }}>
                        {item.done ? '✓' : 'Fix →'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. STICKY FLOATING BOTTOM ACTION BAR */}
      <footer className={styles.obFlowBottomBar}>
        {currentStep === 0 ? (
          <button
            type="button"
            onClick={onExit}
            className={styles.obBackBtn}
          >
            Exit
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setCurrentStep(currentStep - 1)}
            className={styles.obBackBtn}
          >
            Back
          </button>
        )}

        {currentStep < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={handleNext}
            disabled={isSendingOtp}
            className={styles.obContinueBtn}
            style={currentStep === 0 && !brand.emailVerified ? { background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)' } : undefined}
          >
            {isSendingOtp ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Sending Code...</span>
              </>
            ) : currentStep === 0 && !brand.emailVerified ? (
              <>
                <span>Verify Email &amp; Continue</span>
                <ArrowRight size={15} />
              </>
            ) : (
              <>
                <span>Continue</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleFinalSubmit}
            className={styles.obContinueBtn}
            style={!isProfileComplete ? { background: '#64748B', opacity: 0.8 } : undefined}
          >
            <span>{brand.onboardingPayment?.status === 'paid' ? 'Submit Profile for Verification →' : 'Review Plan & Pay ₹99 to Submit →'}</span>
          </button>
        )}
      </footer>

      {/* 5. EMAIL OTP VERIFICATION MODAL */}
      <EmailOtpModal
        isOpen={showOtpModal}
        email={brand.email || ''}
        password={brand.password}
        brandData={brand}
        onClose={() => setShowOtpModal(false)}
        onVerified={handleOtpVerified}
        initialDevOtp={devOtpHint}
      />

      {/* 6. FORGOT PASSWORD MODAL */}
      <ForgotPasswordModal
        isOpen={showForgotPasswordModal}
        initialEmail={brand.email || ''}
        onClose={() => setShowForgotPasswordModal(false)}
        onSuccess={() => {
          setShowForgotPasswordModal(false);
          onExit();
        }}
      />

      {/* 7. IMAGE CROP DRAWER */}
      <ImageCropDrawer
        isOpen={cropConfig.isOpen}
        imageSrc={cropConfig.imageSrc}
        targetAspect={cropConfig.targetAspect}
        title={cropConfig.title}
        aspectLabel={cropConfig.aspectLabel}
        shape={cropConfig.shape}
        onClose={() => setCropConfig((prev) => ({ ...prev, isOpen: false }))}
        onApplyCrop={handleApplyCroppedImage}
      />

      {/* 8. COMMERCIAL PLAN & RS 99 PAYMENT MODAL */}
      <OnboardingPaymentModal
        isOpen={showPaymentModal}
        brand={brand}
        onClose={() => setShowPaymentModal(false)}
        onPaymentSuccess={(updatedBrand) => {
          setShowPaymentModal(false);
          onChange(updatedBrand);
          onGoLive();
        }}
      />
    </div>
  );
}
