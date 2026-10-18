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
  ShieldCheck,
  Crop,
  Camera,
  Zap
} from 'lucide-react';
import { BrandProfile, BrandBankAccount } from './types';
import { supabaseUploadMedia } from '../lib/supabaseClient';
import { EmailOtpModal, ForgotPasswordModal } from './AuthModals';
import ImageCropDrawer from './ImageCropDrawer';
import { POPULAR_BANKS, ALL_INDIAN_BANKS, POPULAR_UPI_HANDLES } from './indianBanks';
import styles from './brand-dashboard.module.css';

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
  { id: 'visuals', num: '03', title: 'Visuals', fullTitle: 'Visual assets', sub: 'Logo emblem, cover banner & story' },
  { id: 'channels', num: '04', title: 'Channels', fullTitle: 'Channels', sub: 'Website, Instagram & concierge email' },
  { id: 'banking', num: '05', title: 'Banking', fullTitle: 'Payout Banking', sub: 'Settlement account for daily door-trial payouts' },
  { id: 'launch', num: '06', title: 'Launch', fullTitle: 'Review & submit', sub: 'Verify brand dossier & submit for approval' }
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
      fontSize: '10px',
      color: '#e11d48',
      backgroundColor: '#ffe4e6',
      border: '1px solid #fecdd3',
      padding: '2px 7px',
      borderRadius: '10px',
      fontWeight: 700,
      letterSpacing: '0.02em',
      textTransform: 'uppercase',
      lineHeight: '1',
      display: 'inline-flex',
      alignItems: 'center',
      flexShrink: 0
    }}>
      Mandatory
    </span>
  );
}

export function OptionalBadge() {
  return (
    <span style={{
      fontSize: '10px',
      color: '#94a3b8',
      backgroundColor: '#f1f5f9',
      border: '1px solid #e2e8f0',
      padding: '2px 7px',
      borderRadius: '10px',
      fontWeight: 600,
      letterSpacing: '0.02em',
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
  const [logoFailed, setLogoFailed] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [devOtpHint, setDevOtpHint] = useState<string | undefined>(undefined);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [emailAlreadyExists, setEmailAlreadyExists] = useState(false);
  const [existingBrandName, setExistingBrandName] = useState<string | undefined>(undefined);
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
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const [isOtherBankSelected, setIsOtherBankSelected] = useState(false);
  const [customBankName, setCustomBankName] = useState('');


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

    // Set cropped data url immediately so user sees the change right away
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
        if (!silent) setErrorNotice('Password is mandatory and must be at least 6 characters.');
        return false;
      }
    }

    if (step.id === 'basics') {
      if (!brand.name?.trim()) {
        if (!silent) setErrorNotice('Brand Legal / Trade Name is mandatory to proceed.');
        return false;
      }
      if (!brand.category?.trim()) {
        if (!silent) setErrorNotice('Please select your brand category (Male, Female, or Both).');
        return false;
      }
      if (!brand.basedOutOf?.trim()) {
        if (!silent) setErrorNotice('Brand Location / City is mandatory (e.g. Ahmedabad, Mumbai, Paris).');
        return false;
      }
      const yearTrimmed = brand.establishedYear?.trim() || '';
      if (!yearTrimmed || !/^\d{4}$/.test(yearTrimmed)) {
        if (!silent) setErrorNotice('Year Founded is mandatory (please enter a valid 4-digit year, e.g. 2024).');
        return false;
      }
      if (!brand.founderName?.trim()) {
        if (!silent) setErrorNotice('Founder / Creative Director name is mandatory.');
        return false;
      }
      if (!brand.founderRole?.trim()) {
        if (!silent) setErrorNotice('Founder Role / Title is mandatory (e.g. Founder & Creative Director).');
        return false;
      }
    }

    if (step.id === 'visuals') {
      if (!brand.profileImage?.trim()) {
        if (!silent) setErrorNotice('Brand Logo / Emblem (1:1) is mandatory. Please upload a logo or enter an image URL.');
        return false;
      }
      if (!brand.coverImage?.trim()) {
        if (!silent) setErrorNotice('Cover Panorama Banner (16:9) is mandatory. Please upload a banner or enter an image URL.');
        return false;
      }
      const aboutTrimmed = brand.about?.trim() || '';
      if (!aboutTrimmed || aboutTrimmed.length < 20) {
        if (!silent) setErrorNotice('Brand Story & Craft is mandatory (minimum 20 characters explaining your brand philosophy and craftsmanship).');
        return false;
      }
    }

    if (step.id === 'channels') {
      const igTrimmed = brand.instagram?.trim().replace(/^@/, '') || '';
      if (!igTrimmed) {
        if (!silent) setErrorNotice('Official Instagram handle is mandatory to verify your brand presence.');
        return false;
      }
      const inqTrimmed = (brand.inquiriesEmail || brand.email || '').trim();
      if (!inqTrimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inqTrimmed)) {
        if (!silent) setErrorNotice('Concierge & Inquiries Email is mandatory for customer support and order coordination.');
        return false;
      }
    }

    if (step.id === 'banking') {
      const bank = brand.bankAccount;
      const isUpi = bank?.payoutMethod === 'upi';

      if (isUpi) {
        const nameTrimmed = bank?.accountHolderName?.trim();
        if (!nameTrimmed || nameTrimmed.length < 3) {
          if (!silent) setErrorNotice('Beneficiary / Entity Name registered with your UPI is mandatory.');
          return false;
        }
        const upiTrimmed = bank?.upiId?.trim() || '';
        if (!upiTrimmed || !upiTrimmed.includes('@') || upiTrimmed.length < 5) {
          if (!silent) setErrorNotice('UPI ID / VPA is mandatory (e.g. yourbrand@okhdfcbank or business@upi).');
          return false;
        }
      } else {
        const nameTrimmed = bank?.accountHolderName?.trim();
        if (!nameTrimmed || nameTrimmed.length < 3) {
          if (!silent) setErrorNotice('Account Holder Name matching your bank account is mandatory.');
          return false;
        }
        const finalBank = isOtherBankSelected ? (customBankName.trim() || bank?.bankName?.trim()) : bank?.bankName?.trim();
        if (!finalBank || finalBank === 'Other Bank (Specify Below)') {
          if (!silent) setErrorNotice('Please select or specify your Bank Name.');
          return false;
        }
        const accTrimmed = (bank?.accountNumber || '').trim().replace(/\s/g, '');
        if (!accTrimmed || accTrimmed.length < 8) {
          if (!silent) setErrorNotice('Bank Account Number is mandatory (at least 8 digits).');
          return false;
        }
        const confirmTrimmed = confirmAccountNumber.trim().replace(/\s/g, '');
        if (confirmTrimmed && accTrimmed !== confirmTrimmed) {
          if (!silent) setErrorNotice('Bank Account Numbers do not match. Please verify your entries.');
          return false;
        }
        const ifscTrimmed = (bank?.ifscCode || '').trim().toUpperCase();
        if (!ifscTrimmed || ifscTrimmed.length !== 11) {
          if (!silent) setErrorNotice('Bank IFSC Code is mandatory (11-character alpha-numeric code, e.g. HDFC0001842).');
          return false;
        }
      }
    }

    if (!silent) setErrorNotice(null);
    return true;
  };

  const validateFullProfile = (): boolean => {
    // Step 0: Account
    if (!validateStep(0)) {
      setCurrentStep(0);
      return false;
    }
    if (!brand.emailVerified) {
      setCurrentStep(0);
      setErrorNotice('Your brand email must be verified via OTP before submitting your profile.');
      return false;
    }

    // Step 1: Basics
    if (!validateStep(1)) {
      setCurrentStep(1);
      return false;
    }

    // Step 2: Visuals
    if (!validateStep(2)) {
      setCurrentStep(2);
      return false;
    }

    // Step 3: Channels
    if (!validateStep(3)) {
      setCurrentStep(3);
      return false;
    }

    // Step 4: Banking
    if (!validateStep(4)) {
      setCurrentStep(4);
      return false;
    }

    setErrorNotice(null);
    return true;
  };

  const handleFinalSubmit = () => {
    if (!validateFullProfile()) {
      return;
    }
    onGoLive();
  };

  const handleNext = async () => {
    if (!validateStep(currentStep)) return;

    // STEP 0: Account Credentials Email Verification
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
    setCurrentStep(1); // Advance to Basics step
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
          setErrorNotice('Please verify your email before proceeding to subsequent steps.');
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
  const isStep4Done = Boolean(
    brand.bankAccount?.payoutMethod === 'upi'
      ? (brand.bankAccount?.accountHolderName?.trim() && (brand.bankAccount?.accountHolderName?.trim().length || 0) >= 3 && brand.bankAccount?.upiId?.trim() && brand.bankAccount.upiId.includes('@'))
      : (brand.bankAccount?.accountHolderName?.trim() && (brand.bankAccount?.accountHolderName?.trim().length || 0) >= 3 && brand.bankAccount?.bankName?.trim() && brand.bankAccount.bankName !== 'Other Bank (Specify Below)' && (brand.bankAccount?.accountNumber || '').trim().length >= 8 && (brand.bankAccount?.ifscCode || '').trim().length === 11)
  );

  const isProfileComplete = isStep0Done && isStep1Done && isStep2Done && isStep3Done && isStep4Done;

  const activeStepMeta = STEPS[currentStep];

  return (
    <div className={styles.mobileContainer}>
      {/* 1. CLEAN CENTERED DROBE HEADER */}
      <div className={styles.onboardingTopNav}>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <label className={styles.ronasInputLabel} style={{ marginBottom: 0 }}>Brand Email</label>
                    <span style={{ color: '#e11d48', fontWeight: 800 }}>*</span>
                  </div>
                  {brand.emailVerified ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#15803d', fontWeight: 700, backgroundColor: '#dcfce7', padding: '2px 8px', borderRadius: '12px' }}>
                      <Check size={11} strokeWidth={3} /> Verified
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
                    className={styles.ronasInputField}
                    autoFocus
                  />
                  <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                </div>

                {/* Email Verification Status */}
                {brand.emailVerified ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', color: '#16a34a', fontSize: '12px', fontWeight: 600 }}>
                    <ShieldCheck size={14} color="#16a34a" />
                    <span>Email verified by verify@drobe.one (Inbox protected)</span>
                  </div>
                ) : (
                  <span className={styles.ronasInputHelper}>
                    A 6-digit verification code will be sent to this email from <strong style={{ color: '#0f172a' }}>verify@drobe.one</strong>.
                  </span>
                )}

                {/* Already Exists in Database Alert Banner */}
                {emailAlreadyExists && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      backgroundColor: '#fef2f2',
                      border: '1px solid #fecaca',
                      borderRadius: '12px',
                      padding: '12px 14px',
                      marginTop: '10px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px', color: '#991b1b', fontSize: '12.5px', fontWeight: 600 }}>
                      <AlertCircle size={15} color="#dc2626" />
                      <span>Account already exists in DROBE{existingBrandName ? ` for "${existingBrandName}"` : ''}.</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={onExit}
                        style={{
                          backgroundColor: '#0f172a',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '9999px',
                          padding: '6px 14px',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Sign In to Existing Account →
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowForgotPasswordModal(true)}
                        style={{
                          backgroundColor: '#ffffff',
                          color: '#dc2626',
                          border: '1px solid #fca5a5',
                          borderRadius: '9999px',
                          padding: '6px 14px',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Forgot Password? Reset OTP
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>

              <div className={styles.ronasInputGroup}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <label className={styles.ronasInputLabel} style={{ marginBottom: 0 }}>Password</label>
                    <span style={{ color: '#e11d48', fontWeight: 800 }}>*</span>
                  </div>
                  <MandatoryBadge />
                </div>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <label className={styles.ronasInputLabel} style={{ marginBottom: 0 }}>Brand Legal / Trade Name</label>
                    <span style={{ color: '#e11d48', fontWeight: 800 }}>*</span>
                  </div>
                  <MandatoryBadge />
                </div>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label className={styles.ronasInputLabel} style={{ marginBottom: 0 }}>Tagline or Philosophy</label>
                  <OptionalBadge />
                </div>
                <input
                  type="text"
                  value={brand.tagline}
                  onChange={(e) => updateField('tagline', e.target.value)}
                  placeholder="e.g. Rare botanical essences and mindful daily pauses"
                  className={styles.ronasInputField}
                />
              </div>

              <div className={styles.categoryToggleContainer}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <label className={styles.ronasInputLabel} style={{ marginBottom: 0 }}>Target Category</label>
                    <span style={{ color: '#e11d48', fontWeight: 800 }}>*</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MandatoryBadge />
                    {normalizedCategory === 'Male' && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', fontWeight: 700, color: '#2563eb', backgroundColor: '#eff6ff', padding: '2px 9px', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                        <MaleIcon size={12} color="#2563eb" /> Male
                      </span>
                    )}
                    {normalizedCategory === 'Female' && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', fontWeight: 700, color: '#db2777', backgroundColor: '#fdf2f8', padding: '2px 9px', borderRadius: '12px', border: '1px solid #fbcfe8' }}>
                        <FemaleIcon size={12} color="#db2777" /> Female
                      </span>
                    )}
                    {normalizedCategory === 'Both' && (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        background: 'linear-gradient(90deg, #eff6ff 0%, #fdf2f8 100%)',
                        padding: '2px 9px',
                        borderRadius: '12px',
                        border: '1px solid #e0e7ff',
                        color: '#4338ca'
                      }}>
                        <BothIcon size={11} color="#6366f1" /> Both (Male & Female)
                      </span>
                    )}
                  </div>
                </div>
                <div className={styles.categoryToggleTrack}>
                  <button
                    type="button"
                    onClick={() => updateField('category', 'Male')}
                    className={`${styles.categoryToggleOption} ${normalizedCategory === 'Male' ? styles.categoryToggleOptionMaleActive : ''}`}
                  >
                    <MaleIcon size={15} color={normalizedCategory === 'Male' ? '#ffffff' : '#2563eb'} />
                    <span>Male</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => updateField('category', 'Both')}
                    className={`${styles.categoryToggleOption} ${normalizedCategory === 'Both' ? styles.categoryToggleOptionBothActive : ''}`}
                  >
                    <BothIcon size={14} color={normalizedCategory === 'Both' ? '#ffffff' : '#6366f1'} />
                    <span>Both</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => updateField('category', 'Female')}
                    className={`${styles.categoryToggleOption} ${normalizedCategory === 'Female' ? styles.categoryToggleOptionFemaleActive : ''}`}
                  >
                    <FemaleIcon size={15} color={normalizedCategory === 'Female' ? '#ffffff' : '#db2777'} />
                    <span>Female</span>
                  </button>
                </div>
              </div>

              <div className={styles.ronasRowTwo}>
                <div className={styles.ronasInputGroup}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <label className={styles.ronasInputLabel} style={{ marginBottom: 0 }}>Brand Location</label>
                      <span style={{ color: '#e11d48', fontWeight: 800 }}>*</span>
                    </div>
                    <MandatoryBadge />
                  </div>
                  <input
                    type="text"
                    value={brand.basedOutOf}
                    onChange={(e) => updateField('basedOutOf', e.target.value)}
                    placeholder="e.g. Ahmedabad & Paris"
                    className={styles.ronasInputField}
                  />
                </div>

                <div className={styles.ronasInputGroup}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <label className={styles.ronasInputLabel} style={{ marginBottom: 0 }}>Year Founded</label>
                      <span style={{ color: '#e11d48', fontWeight: 800 }}>*</span>
                    </div>
                    <MandatoryBadge />
                  </div>
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <label className={styles.ronasInputLabel} style={{ marginBottom: 0 }}>Founder / Creative Director</label>
                      <span style={{ color: '#e11d48', fontWeight: 800 }}>*</span>
                    </div>
                    <MandatoryBadge />
                  </div>
                  <input
                    type="text"
                    value={brand.founderName}
                    onChange={(e) => updateField('founderName', e.target.value)}
                    placeholder="e.g. Sophie Laurent"
                    className={styles.ronasInputField}
                  />
                </div>

                <div className={styles.ronasInputGroup}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <label className={styles.ronasInputLabel} style={{ marginBottom: 0 }}>Founder Role / Title</label>
                      <span style={{ color: '#e11d48', fontWeight: 800 }}>*</span>
                    </div>
                    <MandatoryBadge />
                  </div>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <label className={styles.ronasInputLabel} style={{ marginBottom: 0 }}>Brand Logo / Emblem (1:1)</label>
                    <span style={{ color: '#e11d48', fontWeight: 800 }}>*</span>
                  </div>
                  <MandatoryBadge />
                </div>
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
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <label className={styles.ronasUploadBtn} style={{ cursor: 'pointer' }}>
                          <Upload size={14} style={{ marginRight: '6px' }} />
                          {brand.profileImage ? 'Change & Crop' : 'Upload Logo'}
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
                            className={styles.cropActionBtn}
                          >
                            <Crop size={13} />
                            <span>Crop &amp; Frame (1:1)</span>
                          </button>
                        )}
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <label className={styles.ronasInputLabel} style={{ marginBottom: 0 }}>Cover Panorama Banner (16:9)</label>
                    <span style={{ color: '#e11d48', fontWeight: 800 }}>*</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {brand.coverImage && (
                      <button
                        type="button"
                        onClick={() => updateField('coverImage', '')}
                        style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                      >
                        Remove
                      </button>
                    )}
                    <MandatoryBadge />
                  </div>
                </div>

                <div className={styles.ronasBannerPreviewBox}>
                  {brand.coverImage ? (
                    <div
                      style={{ position: 'relative', cursor: 'pointer', overflow: 'hidden', borderRadius: '12px' }}
                      onClick={() => handleOpenExistingCrop('coverImage')}
                      title="Click to adjust framing and crop (16:9)"
                    >
                      <img
                        src={brand.coverImage}
                        alt="Cover banner"
                        className={styles.ronasBannerImg}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '8px',
                          right: '8px',
                          backgroundColor: 'rgba(15, 23, 42, 0.78)',
                          backdropFilter: 'blur(6px)',
                          color: '#ffffff',
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '4px 10px',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        <Crop size={12} />
                        <span>Adjust &amp; Crop (16:9)</span>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={styles.ronasBannerEmpty}
                      onClick={() => coverFileInputRef.current?.click()}
                      style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '6px' }}
                      title="Click to upload & crop cover banner"
                    >
                      <Camera size={24} color="#94a3b8" />
                      <span>Click to upload &amp; crop panorama banner (16:9)</span>
                    </div>
                  )}

                  <div className={styles.ronasMediaControlsRow}>
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
                      className={styles.ronasUploadBtn}
                      style={{ cursor: 'pointer', flexShrink: 0 }}
                    >
                      <Upload size={14} style={{ marginRight: '6px' }} />
                      {brand.coverImage ? 'Change & Crop' : 'Upload Banner'}
                    </button>

                    {brand.coverImage && (
                      <button
                        type="button"
                        onClick={() => handleOpenExistingCrop('coverImage')}
                        className={styles.cropActionBtn}
                        style={{ flexShrink: 0 }}
                      >
                        <Crop size={13} />
                        <span>Crop &amp; Frame (16:9)</span>
                      </button>
                    )}

                    <input
                      type="text"
                      value={brand.coverImage.startsWith('data:') ? '' : brand.coverImage}
                      onChange={(e) => updateField('coverImage', e.target.value)}
                      placeholder="Or enter banner URL..."
                      className={styles.ronasInputField}
                      style={{ flex: 1, fontSize: '12px' }}
                    />

                    {brand.coverImage && !brand.coverImage.startsWith('data:') && (
                      <button
                        type="button"
                        onClick={() => handleOpenExistingCrop('coverImage')}
                        className={styles.cropActionBtn}
                        style={{ flexShrink: 0 }}
                        title="Crop loaded URL image"
                      >
                        <Crop size={13} />
                        <span>Crop</span>
                      </button>
                    )}
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <label className={styles.ronasInputLabel} style={{ marginBottom: 0 }}>Brand Story &amp; Craft</label>
                    <span style={{ color: '#e11d48', fontWeight: 800 }}>*</span>
                  </div>
                  <MandatoryBadge />
                </div>
                <textarea
                  value={brand.about}
                  onChange={(e) => updateField('about', e.target.value)}
                  placeholder="Share your brand's philosophy, artisanal processes, materials, and origin (min. 20 characters)..."
                  className={styles.ronasInputField}
                  style={{ minHeight: '80px', lineHeight: '1.45' }}
                />
              </div>

              <div className={styles.ronasInputGroup}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label className={styles.ronasInputLabel} style={{ marginBottom: 0 }}>Founder Quote / Statement</label>
                  <OptionalBadge />
                </div>
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
                  <OptionalBadge />
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <label className={styles.ronasInputLabel} style={{ marginBottom: 0 }}>Official Instagram Handle</label>
                    <span style={{ color: '#e11d48', fontWeight: 800 }}>*</span>
                  </div>
                  <MandatoryBadge />
                </div>
                <input
                  type="text"
                  value={brand.instagram}
                  onChange={(e) => updateField('instagram', e.target.value)}
                  placeholder="@yourbrand"
                  className={styles.ronasInputField}
                  style={!brand.instagram?.trim() && errorNotice?.includes('Instagram') ? { borderColor: '#e11d48', backgroundColor: '#fff1f2' } : undefined}
                />
                <span style={{ fontSize: '11.5px', color: '#64748b', marginTop: '5px', display: 'block' }}>
                  Mandatory for brand verification and social credibility on DROBE.
                </span>
              </div>

              <div className={styles.ronasInputGroup}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <label className={styles.ronasInputLabel} style={{ marginBottom: 0 }}>Concierge &amp; Inquiries Email</label>
                    <span style={{ color: '#e11d48', fontWeight: 800 }}>*</span>
                  </div>
                  <MandatoryBadge />
                </div>
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

          {/* STEP 5: Payout Banking & Settlement */}
          {activeStepMeta.id === 'banking' && (
            <div className={styles.ronasFormContainer}>
              {/* Payout Method Toggle */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <label className={styles.ronasInputLabel} style={{ marginBottom: 0 }}>Settlement Payout Method</label>
                    <span style={{ color: '#e11d48', fontWeight: 800 }}>*</span>
                  </div>
                  <MandatoryBadge />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => updateBankField('payoutMethod', 'bank')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: `2px solid ${brand.bankAccount?.payoutMethod !== 'upi' ? '#2563eb' : '#e2e8f0'}`,
                      backgroundColor: brand.bankAccount?.payoutMethod !== 'upi' ? '#eff6ff' : '#ffffff',
                      color: brand.bankAccount?.payoutMethod !== 'upi' ? '#1d4ed8' : '#64748b',
                      fontWeight: 700,
                      fontSize: '13px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Building2 size={16} />
                    <span>Bank Transfer (NEFT/RTGS)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateBankField('payoutMethod', 'upi')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: `2px solid ${brand.bankAccount?.payoutMethod === 'upi' ? '#7c3aed' : '#e2e8f0'}`,
                      backgroundColor: brand.bankAccount?.payoutMethod === 'upi' ? '#f5f3ff' : '#ffffff',
                      color: brand.bankAccount?.payoutMethod === 'upi' ? '#6d28d9' : '#64748b',
                      fontWeight: 700,
                      fontSize: '13px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Zap size={16} color={brand.bankAccount?.payoutMethod === 'upi' ? '#7c3aed' : '#94a3b8'} />
                    <span>UPI ID / VPA (Instant)</span>
                  </button>
                </div>
              </div>

              {brand.bankAccount?.payoutMethod === 'upi' ? (
                /* --- UPI PAYOUT OPTION --- */
                <>
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    background: '#f5f3ff',
                    border: '1px solid #ddd6fe',
                    borderRadius: '12px',
                    padding: '12px 14px',
                    marginBottom: '16px'
                  }}>
                    <Zap size={18} color="#7c3aed" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div style={{ fontSize: '12px', color: '#5b21b6', lineHeight: 1.45 }}>
                      <strong style={{ color: '#4c1d95' }}>Instant UPI Settlement:</strong> Door-trial purchases and customer retentions are automatically transferred directly to your verified UPI VPA handle.
                    </div>
                  </div>

                  {/* Beneficiary Name */}
                  <div className={styles.ronasInputGroup}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <label className={styles.ronasInputLabel} style={{ marginBottom: 0 }}>Beneficiary / Entity Name</label>
                        <span style={{ color: '#e11d48', fontWeight: 800 }}>*</span>
                      </div>
                      <MandatoryBadge />
                    </div>
                    <input
                      type="text"
                      value={brand.bankAccount?.accountHolderName || ''}
                      onChange={(e) => updateBankField('accountHolderName', e.target.value)}
                      placeholder="Legal entity name or beneficiary name registered with UPI"
                      className={styles.ronasInputField}
                      autoFocus
                    />
                    <span className={styles.ronasInputHelper}>
                      Must match the name registered on your UPI handle or bank account.
                    </span>
                  </div>

                  {/* UPI ID / VPA */}
                  <div className={styles.ronasInputGroup}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <label className={styles.ronasInputLabel} style={{ marginBottom: 0 }}>UPI ID / VPA</label>
                        <span style={{ color: '#e11d48', fontWeight: 800 }}>*</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {brand.bankAccount?.upiId && brand.bankAccount.upiId.includes('@') && (
                          <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <Check size={12} /> Valid VPA
                          </span>
                        )}
                        <MandatoryBadge />
                      </div>
                    </div>
                    <input
                      type="text"
                      value={brand.bankAccount?.upiId || ''}
                      onChange={(e) => updateBankField('upiId', e.target.value.trim().toLowerCase())}
                      placeholder="e.g. brandname@okhdfcbank or business@upi"
                      className={styles.ronasInputField}
                    />

                    {/* Quick Handle Suggestions */}
                    <div style={{ marginTop: '8px' }}>
                      <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '5px' }}>
                        Quick UPI Handles:
                      </span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                        {POPULAR_UPI_HANDLES.map(handle => (
                          <button
                            key={handle}
                            type="button"
                            onClick={() => {
                              const current = brand.bankAccount?.upiId || '';
                              const prefix = current.split('@')[0] || (brand.name ? brand.name.toLowerCase().replace(/[^a-z0-9]/g, '') : 'brand');
                              updateBankField('upiId', `${prefix}${handle}`);
                            }}
                            style={{
                              fontSize: '11px',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              border: '1px solid #e2e8f0',
                              background: '#f8fafc',
                              color: '#6d28d9',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            {handle}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* --- DIRECT BANK TRANSFER OPTION --- */
                <>
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <label className={styles.ronasInputLabel} style={{ marginBottom: 0 }}>Account Holder / Entity Name</label>
                        <span style={{ color: '#e11d48', fontWeight: 800 }}>*</span>
                      </div>
                      <MandatoryBadge />
                    </div>
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

                  {/* Bank Name with Full Indian Banks Dropdown and Other Option */}
                  <div className={styles.ronasInputGroup}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <label className={styles.ronasInputLabel} style={{ marginBottom: 0 }}>Select Bank</label>
                        <span style={{ color: '#e11d48', fontWeight: 800 }}>*</span>
                      </div>
                      <MandatoryBadge />
                    </div>

                    {/* Popular Bank Chips */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                      {POPULAR_BANKS.map(bank => {
                        const isSelected = brand.bankAccount?.bankName === bank && !isOtherBankSelected;
                        return (
                          <button
                            key={bank}
                            type="button"
                            onClick={() => {
                              setIsOtherBankSelected(false);
                              updateBankField('bankName', bank);
                            }}
                            style={{
                              fontSize: '11px',
                              padding: '5px 9px',
                              borderRadius: '6px',
                              border: isSelected ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                              background: isSelected ? '#eff6ff' : '#f8fafc',
                              color: isSelected ? '#2563eb' : '#475569',
                              fontWeight: isSelected ? 700 : 500,
                              cursor: 'pointer',
                              transition: 'all 0.1s ease'
                            }}
                          >
                            {bank}
                          </button>
                        );
                      })}
                      <button
                        type="button"
                        onClick={() => {
                          setIsOtherBankSelected(true);
                          updateBankField('bankName', customBankName || 'Other Bank (Specify Below)');
                        }}
                        style={{
                          fontSize: '11px',
                          padding: '5px 9px',
                          borderRadius: '6px',
                          border: isOtherBankSelected ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                          background: isOtherBankSelected ? '#eff6ff' : '#f8fafc',
                          color: isOtherBankSelected ? '#2563eb' : '#475569',
                          fontWeight: isOtherBankSelected ? 700 : 500,
                          cursor: 'pointer'
                        }}
                      >
                        + Other Bank
                      </button>
                    </div>

                    {/* All Indian Banks Dropdown */}
                    <div style={{ marginBottom: isOtherBankSelected ? '8px' : '0' }}>
                      <select
                        value={isOtherBankSelected ? 'Other Bank (Specify Below)' : (brand.bankAccount?.bankName || '')}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === 'Other Bank (Specify Below)') {
                            setIsOtherBankSelected(true);
                            updateBankField('bankName', customBankName || '');
                          } else {
                            setIsOtherBankSelected(false);
                            updateBankField('bankName', val);
                          }
                        }}
                        className={styles.ronasInputField}
                        style={{
                          appearance: 'auto',
                          fontWeight: 600,
                          color: '#0f172a',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="" disabled>-- Select from All Banks in India --</option>
                        {ALL_INDIAN_BANKS.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Custom Bank Name Input when Other is selected */}
                    {isOtherBankSelected && (
                      <div style={{ marginTop: '8px' }}>
                        <label style={{ fontSize: '11px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                          Specify Bank Name *
                        </label>
                        <input
                          type="text"
                          value={customBankName}
                          onChange={(e) => {
                            setCustomBankName(e.target.value);
                            updateBankField('bankName', e.target.value);
                          }}
                          placeholder="Type your bank name, e.g. Saraswat Bank, Cosmos Bank, DCB..."
                          className={styles.ronasInputField}
                          autoFocus
                        />
                      </div>
                    )}
                  </div>

                  {/* Bank Account Number */}
                  <div className={styles.ronasInputGroup}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <label className={styles.ronasInputLabel} style={{ marginBottom: 0 }}>Bank Account Number</label>
                        <span style={{ color: '#e11d48', fontWeight: 800 }}>*</span>
                      </div>
                      <MandatoryBadge />
                    </div>
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <label className={styles.ronasInputLabel} style={{ marginBottom: 0 }}>Re-enter Bank Account Number</label>
                        <span style={{ color: '#e11d48', fontWeight: 800 }}>*</span>
                      </div>
                      <MandatoryBadge />
                    </div>
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <label className={styles.ronasInputLabel} style={{ marginBottom: 0 }}>Bank IFSC Code</label>
                        <span style={{ color: '#e11d48', fontWeight: 800 }}>*</span>
                      </div>
                      <MandatoryBadge />
                    </div>
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
                </>
              )}
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
                {(brand.bankAccount?.accountNumber || brand.bankAccount?.upiId) && (
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
                      {brand.bankAccount.payoutMethod === 'upi' ? (
                        <Zap size={16} color="#7c3aed" />
                      ) : (
                        <Building2 size={16} color="#2563eb" />
                      )}
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
                          {brand.bankAccount.payoutMethod === 'upi' ? 'UPI Payout VPA' : (brand.bankAccount.bankName || 'Settlement Bank')}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          {brand.bankAccount.payoutMethod === 'upi' 
                            ? (brand.bankAccount.upiId || 'UPI VPA Set')
                            : `•••• ${brand.bankAccount.accountNumber ? brand.bankAccount.accountNumber.slice(-4) : '••••'} · ${brand.bankAccount.ifscCode || 'IFSC'}`}
                        </div>
                      </div>
                    </div>
                    <span style={{ fontSize: '10px', background: '#dcfce7', color: '#15803d', fontWeight: 700, padding: '3px 7px', borderRadius: '5px' }}>
                      {brand.bankAccount.payoutMethod === 'upi' ? 'INSTANT UPI' : 'RBI DIRECT'}
                    </span>
                  </div>
                )}
              </div>

              {/* MANDATORY DOSSIER CHECKLIST AUDIT */}
              <div style={{ marginTop: '16px', background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', fontWeight: 800 }}>
                    Mandatory Dossier Checklist
                  </span>
                  {isProfileComplete ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 700, color: '#15803d', backgroundColor: '#dcfce7', padding: '2px 8px', borderRadius: '12px' }}>
                      <Check size={11} strokeWidth={3} /> 100% Complete
                    </span>
                  ) : (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 700, color: '#dc2626', backgroundColor: '#fee2e2', padding: '2px 8px', borderRadius: '12px' }}>
                      <AlertCircle size={11} strokeWidth={3} /> Incomplete Dossier
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { step: 0, label: '01. Account Credentials & Email Verified', done: isStep0Done, desc: brand.emailVerified ? brand.email : 'Email verification required' },
                    { step: 1, label: '02. Brand Basics & Leadership Dossier', done: isStep1Done, desc: brand.name ? `${brand.name} · ${brand.founderName || 'Founder'}` : 'Name, category, location, founder required' },
                    { step: 2, label: '03. Visual Assets & Brand Craft', done: isStep2Done, desc: (brand.profileImage && brand.coverImage) ? 'Emblem (1:1), banner (16:9) & story set' : 'Emblem, cover banner & craft story required' },
                    { step: 3, label: '04. Verified Channels & Inquiries', done: isStep3Done, desc: brand.instagram ? `@${brand.instagram.replace(/^@/, '')}` : 'Instagram handle & concierge email required' },
                    { step: 4, label: '05. Payout Settlement Banking', done: isStep4Done, desc: brand.bankAccount?.payoutMethod === 'upi' ? (brand.bankAccount.upiId || 'UPI VPA') : (brand.bankAccount?.bankName || 'Direct Bank Settlement') }
                  ].map((item) => (
                    <div
                      key={item.step}
                      onClick={() => setCurrentStep(item.step)}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '9px 12px',
                        borderRadius: '10px',
                        backgroundColor: item.done ? '#f8fafc' : '#fef2f2',
                        border: `1px solid ${item.done ? '#e2e8f0' : '#fecaca'}`,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      title={`Click to review ${item.label}`}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          backgroundColor: item.done ? '#dcfce7' : '#fee2e2',
                          color: item.done ? '#15803d' : '#dc2626',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          fontWeight: 800,
                          flexShrink: 0
                        }}>
                          {item.done ? '✓' : '!'}
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: 700, color: item.done ? '#0f172a' : '#991b1b' }}>
                            {item.label}
                          </div>
                          <div style={{ fontSize: '10.5px', color: '#64748b' }}>
                            {item.desc}
                          </div>
                        </div>
                      </div>

                      <span style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        color: item.done ? '#15803d' : '#dc2626',
                        backgroundColor: '#ffffff',
                        border: `1px solid ${item.done ? '#bbf7d0' : '#fca5a5'}`,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.02em'
                      }}>
                        {item.done ? 'Complete ✓' : 'Fix Step →'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {!isProfileComplete && (
                <div style={{
                  marginTop: '12px',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '12px',
                  padding: '11px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#991b1b',
                  fontSize: '12px',
                  fontWeight: 600
                }}>
                  <AlertCircle size={15} color="#dc2626" style={{ flexShrink: 0 }} />
                  <span>Profile Incomplete: All mandatory details must be provided before your brand can be submitted for darkstore onboarding.</span>
                </div>
              )}

              <div className={styles.ronasReadyNotice}>
                <Check size={16} color="#2563eb" />
                <span>Once all details are verified and approved, you will be authorized to dispatch physical inventory to the Ahmedabad Darkstore Hub.</span>
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
            disabled={isSendingOtp}
            className={styles.ronasContinuePillBtn}
            style={currentStep === 0 && !brand.emailVerified ? { backgroundColor: '#dc2626', color: '#ffffff' } : undefined}
          >
            {isSendingOtp ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Sending Code...</span>
              </>
            ) : currentStep === 0 && !brand.emailVerified ? (
              <>
                <ShieldCheck size={15} />
                <span>Verify Email & Continue</span>
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
            className={styles.ronasGoLivePillBtn}
            style={!isProfileComplete ? { backgroundColor: '#475569' } : undefined}
          >
            <span>Submit Profile for Verification →</span>
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

      {/* 7. BOTTOM DRAWER FOR IMAGE CROPPING & POSITIONING */}
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
    </div>
  );
}

