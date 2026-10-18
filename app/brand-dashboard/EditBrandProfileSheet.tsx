'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Upload, 
  Trash2, 
  Globe, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Check, 
  AlertCircle,
  Building2,
  Camera,
  User,
  Compass,
  FileText,
  Loader2,
  Crop,
  Warehouse,
  MapPin
} from 'lucide-react';
import { BrandProfile } from './types';
import { MaleIcon, FemaleIcon, BothIcon, MandatoryBadge, OptionalBadge } from './OnboardingFlow';
import ImageCropDrawer from './ImageCropDrawer';
import { DROBE_WAREHOUSES } from './warehousesData';
import styles from './brand-dashboard.module.css';
import { supabaseUploadMedia } from '../lib/supabaseClient';

const InstagramIcon = ({ size = 15, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

interface EditBrandProfileSheetProps {
  brand: BrandProfile;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: BrandProfile) => void;
}

export default function EditBrandProfileSheet({
  brand,
  isOpen,
  onClose,
  onSave
}: EditBrandProfileSheetProps) {
  const [formData, setFormData] = useState<BrandProfile>({ ...brand });
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [lockedWarehouseNotice, setLockedWarehouseNotice] = useState<string | null>(null);
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
    title: 'Crop Brand Emblem',
    aspectLabel: '1:1 Square',
    shape: 'round',
    field: null
  });

  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Sync form data whenever opened
  React.useEffect(() => {
    if (isOpen) {
      setFormData({ ...brand });
      setErrorMsg(null);
    }
  }, [isOpen, brand]);

  if (!isOpen) return null;

  const updateField = <K extends keyof BrandProfile>(key: K, value: BrandProfile[K]) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
    if (errorMsg) setErrorMsg(null);
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
    const currentSrc = field === 'profileImage' ? formData.profileImage : formData.coverImage;
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
        const brandSlug = (formData.name || 'brand').toLowerCase().replace(/[^a-z0-9]/g, '-');
        const file = new File([blob], `${brandSlug}_${field}_${Date.now()}.jpg`, { type: 'image/jpeg' });
        const uploadRes = await supabaseUploadMedia(file, folder, `${brandSlug}_${Date.now()}`);
        if (uploadRes && uploadRes.url) {
          updateField(field, uploadRes.url);
        }
      } catch (err) {
        console.warn('Background upload error:', err);
      } finally {
        setIsUploadingMedia(false);
      }
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'profileImage' | 'coverImage') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg('Image size exceeds 10MB limit. Please upload a smaller image.');
        return;
      }
      setIsUploadingMedia(true);
      setErrorMsg(null);
      try {
        const folder = field === 'profileImage' ? 'brands/logos' : 'brands/banners';
        const brandSlug = (formData.name || 'brand').toLowerCase().replace(/[^a-z0-9]/g, '-');
        const uploadRes = await supabaseUploadMedia(file, folder, `${brandSlug}_${field}_${Date.now()}`);
        if (uploadRes && uploadRes.url) {
          updateField(field, uploadRes.url);
        } else {
          // Fallback to data URL only if storage upload failed
          const reader = new FileReader();
          reader.onload = () => {
            if (typeof reader.result === 'string') {
              updateField(field, reader.result);
            }
          };
          reader.readAsDataURL(file);
        }
      } catch (err) {
        console.warn('Direct upload error, falling back:', err);
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            updateField(field, reader.result);
          }
        };
        reader.readAsDataURL(file);
      } finally {
        setIsUploadingMedia(false);
      }
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);

    // Validation: enforce all mandatory details
    const trimmedName = formData.name?.trim();
    if (!trimmedName) {
      setErrorMsg('Brand Legal / Trade Name is mandatory.');
      return;
    }

    if (!formData.profileImage?.trim()) {
      setErrorMsg('Brand Logo / Emblem is mandatory.');
      return;
    }

    if (!formData.coverImage?.trim()) {
      setErrorMsg('Cover Panorama Banner is mandatory.');
      return;
    }

    if (!formData.basedOutOf?.trim()) {
      setErrorMsg('Brand Location is mandatory.');
      return;
    }

    const yearTrimmed = formData.establishedYear?.trim() || '';
    if (!yearTrimmed || !/^\d{4}$/.test(yearTrimmed)) {
      setErrorMsg('Year Founded is mandatory (valid 4-digit year, e.g. 2024).');
      return;
    }

    if (!formData.founderName?.trim()) {
      setErrorMsg('Founder / Creative Director name is mandatory.');
      return;
    }

    if (!formData.founderRole?.trim()) {
      setErrorMsg('Founder Role / Title is mandatory.');
      return;
    }

    const aboutTrimmed = formData.about?.trim() || '';
    if (!aboutTrimmed || aboutTrimmed.length < 20) {
      setErrorMsg('About the Brand (Story & Craft) is mandatory (minimum 20 characters).');
      return;
    }

    const trimmedIg = formData.instagram?.trim().replace(/^@/, '');
    if (!trimmedIg) {
      setErrorMsg('Official Instagram handle is mandatory.');
      return;
    }

    const inqTrimmed = (formData.inquiriesEmail || formData.email || '').trim();
    if (!inqTrimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inqTrimmed)) {
      setErrorMsg('Concierge & Inquiries Email is mandatory.');
      return;
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      setErrorMsg('Please enter a valid account email address.');
      return;
    }

    const selectedWh = (formData.warehouse || 'ahmedabad').trim();
    if (!selectedWh) {
      setErrorMsg('Fulfillment Darkstore Warehouse is mandatory.');
      return;
    }

    setIsSubmitting(true);

    const updated: BrandProfile = {
      ...formData,
      name: trimmedName,
      warehouse: selectedWh,
      warehouses: Array.isArray(formData.warehouses) && formData.warehouses.length > 0 ? formData.warehouses : [selectedWh],
      updatedAt: new Date().toISOString()
    };

    setTimeout(() => {
      onSave(updated);
      setIsSubmitting(false);
      onClose();
    }, 200);
  };

  return (
    <AnimatePresence>
      <div 
        className={styles.editProfileOverlay}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ y: '100%', opacity: 0.5 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 30, stiffness: 350 }}
          className={styles.editProfileSheet}
        >
          {/* 1. Sticky Haute Top Navigation Bar */}
          <div className={styles.editProfileTopBar}>
            <button
              type="button"
              onClick={onClose}
              className={styles.editProfileCloseBtn}
              aria-label="Cancel editing"
            >
              <X size={18} />
            </button>

            <div className={styles.editProfileTitleGroup}>
              <h3 className={styles.editProfileMainTitle}>Edit Brand Profile</h3>
              <span className={styles.editProfileSubTitle}>Live Brand Profile</span>
            </div>

            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={isSubmitting}
              className={styles.editProfileTopSaveBtn}
            >
              {isSubmitting ? (
                <span>Saving...</span>
              ) : (
                <>
                  <Check size={14} strokeWidth={2.6} />
                  <span>Save</span>
                </>
              )}
            </button>
          </div>

          {/* Validation Notice Banner */}
          {errorMsg && (
            <div className={styles.editProfileErrorBanner}>
              <AlertCircle size={15} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 2. Scrollable Single-Page Form Body */}
          <div className={styles.editProfileScrollBody}>
            {/* --- SECTION 1: VISUAL ASSETS --- */}
            <div className={styles.editSectionCard}>
              <div className={styles.editSectionHeader}>
                <Camera size={15} className={styles.editSectionIcon} />
                <div>
                  <h4 className={styles.editSectionTitle}>Visual Assets</h4>
                  <p className={styles.editSectionSub}>Brand logo & signature lookbook banner</p>
                </div>
              </div>

              {/* Logo / Profile Image */}
              <div className={styles.editFieldGroup}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <label className={styles.editFieldLabel} style={{ marginBottom: 0 }}>Brand Logo / Emblem (1:1)</label>
                    <span style={{ color: '#e11d48', fontWeight: 800 }}>*</span>
                  </div>
                  <MandatoryBadge />
                </div>
                <div className={styles.editAvatarRow}>
                  <div className={styles.editAvatarPreview}>
                    {formData.profileImage ? (
                      <img src={formData.profileImage} alt={formData.name} className={styles.editAvatarImg} />
                    ) : (
                      <div className={styles.editAvatarFallback}>
                        {formData.name ? formData.name.slice(0, 1).toUpperCase() : 'D'}
                      </div>
                    )}
                  </div>

                  <div className={styles.editUploadActions}>
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => handleFileSelectForCrop(e, 'profileImage')}
                    />
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className={styles.editUploadPillBtn}
                    >
                      <Upload size={13} />
                      {formData.profileImage ? 'Change & Crop' : 'Upload Emblem'}
                    </button>

                    {formData.profileImage && (
                      <button
                        type="button"
                        onClick={() => handleOpenExistingCrop('profileImage')}
                        className={styles.cropActionBtn}
                        title="Crop & frame emblem"
                      >
                        <Crop size={13} />
                        <span>Crop &amp; Frame</span>
                      </button>
                    )}

                    {formData.profileImage && (
                      <button
                        type="button"
                        onClick={() => updateField('profileImage', '')}
                        className={styles.editRemoveBtn}
                        title="Remove emblem"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
                {isUploadingMedia && (
                  <div style={{ fontSize: '11px', color: '#6366f1', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '4px', fontWeight: 500 }}>
                    <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> Uploading directly to Supabase drobe-media bucket (0 Vercel bytes)...
                  </div>
                )}
                <span className={styles.editFieldHint}>Square PNG or JPG recommended (min. 400x400px).</span>
              </div>

              {/* Cover Banner */}
              <div className={styles.editFieldGroup} style={{ marginTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <label className={styles.editFieldLabel} style={{ marginBottom: 0 }}>Cover Panorama Banner (16:9)</label>
                    <span style={{ color: '#e11d48', fontWeight: 800 }}>*</span>
                  </div>
                  <MandatoryBadge />
                </div>
                <div className={styles.editBannerContainer}>
                  {formData.coverImage ? (
                    <img src={formData.coverImage} alt="Cover Banner" className={styles.editBannerImg} />
                  ) : (
                    <div
                      className={styles.editBannerEmpty}
                      onClick={() => coverInputRef.current?.click()}
                      style={{ cursor: 'pointer' }}
                      title="Click to upload & crop cover banner"
                    >
                      <Camera size={22} color="#94a3b8" />
                      <span>Click to upload &amp; crop panorama banner (16:9)</span>
                    </div>
                  )}

                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => handleFileSelectForCrop(e, 'coverImage')}
                  />
                  <div className={styles.editBannerOverlayActions}>
                    <button
                      type="button"
                      onClick={() => coverInputRef.current?.click()}
                      className={styles.editUploadPillBtn}
                    >
                      <Upload size={13} />
                      {formData.coverImage ? 'Change & Crop' : 'Upload Banner'}
                    </button>

                    {formData.coverImage && (
                      <button
                        type="button"
                        onClick={() => handleOpenExistingCrop('coverImage')}
                        className={styles.cropActionBtn}
                        title="Crop & frame cover banner"
                      >
                        <Crop size={13} />
                        <span>Crop &amp; Frame</span>
                      </button>
                    )}

                    {formData.coverImage && (
                      <button
                        type="button"
                        onClick={() => updateField('coverImage', '')}
                        className={styles.editRemoveBtn}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
                <span className={styles.editFieldHint}>16:9 cinematic landscape banner (min. 1200x675px).</span>
              </div>
            </div>

            {/* --- SECTION 2: BRAND IDENTITY & BASICS --- */}
            <div className={styles.editSectionCard}>
              <div className={styles.editSectionHeader}>
                <Building2 size={15} className={styles.editSectionIcon} />
                <div>
                  <h4 className={styles.editSectionTitle}>Brand Identity & Basics</h4>
                  <p className={styles.editSectionSub}>Name, target client audience & brand location</p>
                </div>
              </div>

              {/* Brand Name */}
              <div className={styles.editFieldGroup}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <label className={styles.editFieldLabel} style={{ marginBottom: 0 }}>Brand Legal / Trade Name</label>
                    <span style={{ color: '#e11d48', fontWeight: 800 }}>*</span>
                  </div>
                  <MandatoryBadge />
                </div>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="e.g. Maison de Silk"
                  className={styles.editTextInput}
                />
              </div>

              {/* Tagline */}
              <div className={styles.editFieldGroup}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label className={styles.editFieldLabel} style={{ marginBottom: 0 }}>Tagline / Subtitle</label>
                  <OptionalBadge />
                </div>
                <input
                  type="text"
                  value={formData.tagline || ''}
                  onChange={(e) => updateField('tagline', e.target.value)}
                  placeholder="e.g. Artisanal tailoring for modern luxury."
                  className={styles.editTextInput}
                />
              </div>

              {/* Category Segmented Selector */}
              <div className={styles.editFieldGroup}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <label className={styles.editFieldLabel} style={{ marginBottom: 0 }}>Target Client Category</label>
                    <span style={{ color: '#e11d48', fontWeight: 800 }}>*</span>
                  </div>
                  <MandatoryBadge />
                </div>
                <div className={styles.editSegmentedGroup}>
                  {[
                    { value: 'Male', label: 'Male', icon: <MaleIcon size={14} color={formData.category === 'Male' ? '#ffffff' : '#2563eb'} /> },
                    { value: 'Both', label: 'Both', icon: <BothIcon size={13} color={(formData.category === 'Both' || formData.category === 'Male & Female') ? '#ffffff' : '#6366f1'} /> },
                    { value: 'Female', label: 'Female', icon: <FemaleIcon size={14} color={formData.category === 'Female' ? '#ffffff' : '#db2777'} /> }
                  ].map(cat => {
                    const isSelected = cat.value === 'Both' 
                      ? (formData.category === 'Both' || formData.category === 'Male & Female')
                      : formData.category === cat.value;
                    const activeClass = isSelected
                      ? (cat.value === 'Male' ? styles.categoryToggleOptionMaleActive : cat.value === 'Female' ? styles.categoryToggleOptionFemaleActive : styles.categoryToggleOptionBothActive)
                      : '';
                    return (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => updateField('category', cat.value as any)}
                        className={`${styles.editSegmentBtn} ${activeClass}`}
                        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      >
                        {cat.icon}
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Two columns: Location & Established Year */}
              <div className={styles.editTwoColRow}>
                <div className={styles.editFieldGroup}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <label className={styles.editFieldLabel} style={{ marginBottom: 0 }}>Brand Location</label>
                      <span style={{ color: '#e11d48', fontWeight: 800 }}>*</span>
                    </div>
                    <MandatoryBadge />
                  </div>
                  <input
                    type="text"
                    value={formData.basedOutOf || ''}
                    onChange={(e) => updateField('basedOutOf', e.target.value)}
                    placeholder="e.g. Milan / Mumbai"
                    className={styles.editTextInput}
                  />
                </div>

                <div className={styles.editFieldGroup}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <label className={styles.editFieldLabel} style={{ marginBottom: 0 }}>Established Year</label>
                      <span style={{ color: '#e11d48', fontWeight: 800 }}>*</span>
                    </div>
                    <MandatoryBadge />
                  </div>
                  <input
                    type="text"
                    value={formData.establishedYear || ''}
                    onChange={(e) => updateField('establishedYear', e.target.value)}
                    placeholder="e.g. 2024"
                    className={styles.editTextInput}
                  />
                </div>
              </div>
            </div>

            {/* --- SECTION 3: FOUNDER DOSSIER --- */}
            <div className={styles.editSectionCard}>
              <div className={styles.editSectionHeader}>
                <User size={15} className={styles.editSectionIcon} />
                <div>
                  <h4 className={styles.editSectionTitle}>Founder & Leadership</h4>
                  <p className={styles.editSectionSub}>Introduce the visionary mind behind the brand</p>
                </div>
              </div>

              <div className={styles.editTwoColRow}>
                <div className={styles.editFieldGroup}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <label className={styles.editFieldLabel} style={{ marginBottom: 0 }}>Founder Name</label>
                      <span style={{ color: '#e11d48', fontWeight: 800 }}>*</span>
                    </div>
                    <MandatoryBadge />
                  </div>
                  <input
                    type="text"
                    value={formData.founderName || ''}
                    onChange={(e) => updateField('founderName', e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    className={styles.editTextInput}
                  />
                </div>

                <div className={styles.editFieldGroup}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <label className={styles.editFieldLabel} style={{ marginBottom: 0 }}>Founder Role / Title</label>
                      <span style={{ color: '#e11d48', fontWeight: 800 }}>*</span>
                    </div>
                    <MandatoryBadge />
                  </div>
                  <input
                    type="text"
                    value={formData.founderRole || ''}
                    onChange={(e) => updateField('founderRole', e.target.value)}
                    placeholder="e.g. Creative Director"
                    className={styles.editTextInput}
                  />
                </div>
              </div>

              <div className={styles.editFieldGroup}>
                <label className={styles.editFieldLabel}>Founder Biography</label>
                <textarea
                  rows={3}
                  value={formData.founderBio || ''}
                  onChange={(e) => updateField('founderBio', e.target.value)}
                  placeholder="Share the founder's background, craftsmanship roots, and vision..."
                  className={styles.editTextarea}
                />
              </div>

              <div className={styles.editFieldGroup}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label className={styles.editFieldLabel} style={{ marginBottom: 0 }}>Signature Founder Quote</label>
                  <OptionalBadge />
                </div>
                <input
                  type="text"
                  value={formData.founderQuote || ''}
                  onChange={(e) => updateField('founderQuote', e.target.value)}
                  placeholder="e.g. Elegance is the intersection of discipline and desire."
                  className={styles.editTextInput}
                />
              </div>
            </div>

            {/* --- SECTION 4: NARRATIVE & CRAFTSMANSHIP --- */}
            <div className={styles.editSectionCard}>
              <div className={styles.editSectionHeader}>
                <FileText size={15} className={styles.editSectionIcon} />
                <div>
                  <h4 className={styles.editSectionTitle}>Narrative & Heritage</h4>
                  <p className={styles.editSectionSub}>The brand story displayed to verified clients</p>
                </div>
              </div>

              <div className={styles.editFieldGroup}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <label className={styles.editFieldLabel} style={{ marginBottom: 0 }}>About the Brand (Story &amp; Craft)</label>
                    <span style={{ color: '#e11d48', fontWeight: 800 }}>*</span>
                  </div>
                  <MandatoryBadge />
                </div>
                <textarea
                  rows={3}
                  value={formData.about || ''}
                  onChange={(e) => updateField('about', e.target.value)}
                  placeholder="Tell clients the origin story, craftsmanship methods, and materials (min. 20 characters)..."
                  className={styles.editTextarea}
                />
              </div>

              <div className={styles.editFieldGroup}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label className={styles.editFieldLabel} style={{ marginBottom: 0 }}>Mission &amp; Sustainability</label>
                  <OptionalBadge />
                </div>
                <textarea
                  rows={2}
                  value={formData.mission || ''}
                  onChange={(e) => updateField('mission', e.target.value)}
                  placeholder="Our commitment to ethical sourcing and timeless quality..."
                  className={styles.editTextarea}
                />
              </div>
            </div>

            {/* --- SECTION 5: TOUCHPOINTS & CHANNELS --- */}
            <div className={styles.editSectionCard}>
              <div className={styles.editSectionHeader}>
                <Compass size={15} className={styles.editSectionIcon} />
                <div>
                  <h4 className={styles.editSectionTitle}>Verified Channels</h4>
                  <p className={styles.editSectionSub}>Direct client inquiries and social touchpoints</p>
                </div>
              </div>

              {/* Website */}
              <div className={styles.editFieldGroup}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label className={styles.editFieldLabel} style={{ marginBottom: 0 }}>Official Website</label>
                  <OptionalBadge />
                </div>
                <div className={styles.editInputWithIcon}>
                  <Globe size={15} className={styles.editInputLeftIcon} />
                  <input
                    type="text"
                    value={formData.website || ''}
                    onChange={(e) => updateField('website', e.target.value)}
                    placeholder="https://yourbrand.com"
                    className={styles.editTextInputWithIcon}
                  />
                </div>
              </div>

              {/* Instagram */}
              <div className={styles.editFieldGroup}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <label className={styles.editFieldLabel} style={{ marginBottom: 0 }}>Instagram Handle</label>
                    <span style={{ color: '#e11d48', fontWeight: 800 }}>*</span>
                  </div>
                  <MandatoryBadge />
                </div>
                <div className={styles.editInputWithIcon}>
                  <div className={styles.editInputLeftIcon}>
                    <InstagramIcon size={15} color="#64748b" />
                  </div>
                  <input
                    type="text"
                    value={formData.instagram || ''}
                    onChange={(e) => updateField('instagram', e.target.value)}
                    placeholder="@yourbrand"
                    className={styles.editTextInputWithIcon}
                  />
                </div>
                <span className={styles.editFieldHint}>Required for social verification on DROBE.</span>
              </div>

              {/* Inquiries Email */}
              <div className={styles.editFieldGroup}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <label className={styles.editFieldLabel} style={{ marginBottom: 0 }}>Concierge &amp; Inquiries Email</label>
                    <span style={{ color: '#e11d48', fontWeight: 800 }}>*</span>
                  </div>
                  <MandatoryBadge />
                </div>
                <div className={styles.editInputWithIcon}>
                  <Mail size={15} className={styles.editInputLeftIcon} />
                  <input
                    type="email"
                    value={formData.inquiriesEmail || ''}
                    onChange={(e) => updateField('inquiriesEmail', e.target.value)}
                    placeholder="concierge@yourbrand.com"
                    className={styles.editTextInputWithIcon}
                  />
                </div>
              </div>

              {/* Brand Account Email */}
              <div className={styles.editFieldGroup}>
                <label className={styles.editFieldLabel}>Partner Account Email</label>
                <div className={styles.editInputWithIcon}>
                  <Mail size={15} className={styles.editInputLeftIcon} />
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="founder@yourbrand.com"
                    className={styles.editTextInputWithIcon}
                  />
                </div>
              </div>
            </div>

            {/* --- SECTION 6: INVENTORY WAREHOUSE HUB --- */}
            <div className={styles.editSectionCard}>
              <div className={styles.editSectionHeader}>
                <Warehouse size={15} className={styles.editSectionIcon} />
                <div>
                  <h4 className={styles.editSectionTitle}>Inventory Fulfillment Warehouses</h4>
                  <p className={styles.editSectionSub}>Darkstore hubs where your brand inventory is inwarded, tagged, and stored</p>
                </div>
              </div>

              {lockedWarehouseNotice && (
                <div style={{
                  backgroundColor: '#fffbeb',
                  border: '1px solid #fde68a',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <Lock size={15} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span style={{ fontSize: '11.5px', color: '#92400e', lineHeight: 1.4 }}>
                      {lockedWarehouseNotice}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLockedWarehouseNotice(null)}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#92400e', padding: 0 }}
                  >
                    <X size={13} />
                  </button>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <label className={styles.editFieldLabel} style={{ marginBottom: 0 }}>Primary Darkstore Warehouse</label>
                  <span style={{ color: '#e11d48', fontWeight: 800 }}>*</span>
                </div>
                <MandatoryBadge />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                {DROBE_WAREHOUSES.map((wh) => {
                  const isSelected = (formData.warehouse || 'ahmedabad') === wh.id;
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
                            `Coming out in next phases: ${wh.name} (${wh.city}) is scheduled for ${wh.phase}. Currently, all stock is inwarded through Ahmedabad Mega Darkstore #01. You can add more warehouses later from your profile settings.`
                          );
                        }
                      }}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '12px',
                        border: isSelected
                          ? '2px solid #2563eb'
                          : isAvailable
                          ? '1.5px solid #cbd5e1'
                          : '1.5px solid #e2e8f0',
                        backgroundColor: isSelected
                          ? '#eff6ff'
                          : isAvailable
                          ? '#ffffff'
                          : '#f8fafc',
                        cursor: isAvailable ? 'pointer' : 'not-allowed',
                        opacity: isAvailable ? 1 : 0.75,
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            backgroundColor: isSelected ? '#2563eb' : '#f1f5f9',
                            color: isSelected ? '#ffffff' : '#64748b',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            {isAvailable ? <Warehouse size={16} /> : <Lock size={14} />}
                          </div>

                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '13px', fontWeight: 700, color: isSelected ? '#1e3a8a' : '#0f172a' }}>
                                {wh.name}
                              </span>
                              <span style={{
                                fontSize: '9.5px',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                padding: '2px 6px',
                                borderRadius: '5px',
                                letterSpacing: '0.02em',
                                backgroundColor: isSelected ? '#dbeafe' : isAvailable ? '#dcfce7' : '#fef3c7',
                                color: isSelected ? '#1d4ed8' : isAvailable ? '#15803d' : '#b45309',
                                border: isSelected ? '1px solid #bfdbfe' : isAvailable ? '1px solid #bbf7d0' : '1px solid #fde68a'
                              }}>
                                {isAvailable ? (isSelected ? 'Selected · Active' : wh.badge) : 'Coming out in next phases'}
                              </span>
                            </div>
                            <p style={{ fontSize: '11.5px', color: '#64748b', margin: '2px 0 0' }}>
                              {wh.tagline}
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontSize: '10.5px', color: '#94a3b8' }}>
                              <MapPin size={11} />
                              <span>{wh.address}</span>
                            </div>
                          </div>
                        </div>

                        <div style={{ flexShrink: 0 }}>
                          {isAvailable ? (
                            <div style={{
                              width: '18px',
                              height: '18px',
                              borderRadius: '50%',
                              border: `2px solid ${isSelected ? '#2563eb' : '#cbd5e1'}`,
                              backgroundColor: isSelected ? '#2563eb' : '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              {isSelected && <Check size={11} strokeWidth={3} color="#ffffff" />}
                            </div>
                          ) : (
                            <span style={{
                              fontSize: '9.5px',
                              fontWeight: 700,
                              color: '#64748b',
                              backgroundColor: '#e2e8f0',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px'
                            }}>
                              <Lock size={9} /> Locked
                            </span>
                          )}
                        </div>
                      </div>

                      {!isAvailable && (
                        <div style={{
                          marginTop: '6px',
                          paddingTop: '6px',
                          borderTop: '1px dashed #e2e8f0',
                          fontSize: '10.5px',
                          color: '#b45309',
                          fontWeight: 500
                        }}>
                          🔒 Coming out in next phases · You can add more warehouses later from your profile settings
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '10px 12px',
                fontSize: '11.5px',
                color: '#475569',
                lineHeight: 1.45,
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px'
              }}>
                <span>💡</span>
                <div>
                  <strong>Warehouse Expansion:</strong> You can add more warehouses later from your profile settings as regional fulfillment nodes in Chandigarh, Gurgaon, and Lucknow activate in future phases.
                </div>
              </div>
            </div>

            {/* --- SECTION 7: CREDENTIALS --- */}
            <div className={styles.editSectionCard}>
              <div className={styles.editSectionHeader}>
                <Lock size={15} className={styles.editSectionIcon} />
                <div>
                  <h4 className={styles.editSectionTitle}>Account Security</h4>
                  <p className={styles.editSectionSub}>Password for partner portal sign-in</p>
                </div>
              </div>

              <div className={styles.editFieldGroup}>
                <label className={styles.editFieldLabel}>Portal Password</label>
                <div className={styles.editInputWithIcon}>
                  <Lock size={15} className={styles.editInputLeftIcon} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password || ''}
                    onChange={(e) => updateField('password', e.target.value)}
                    placeholder="••••••••••••"
                    className={styles.editTextInputWithIcon}
                    style={{ paddingRight: '42px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={styles.editPasswordToggle}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <span className={styles.editFieldHint}>Minimum 6 characters for partner access.</span>
              </div>
            </div>
          </div>

          {/* 3. Sticky Bottom Action Bar */}
          <div className={styles.editProfileBottomBar}>
            <button
              type="button"
              onClick={onClose}
              className={styles.editCancelPillBtn}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={isSubmitting}
              className={styles.editSubmitPillBtn}
            >
              {isSubmitting ? (
                <span>Submitting...</span>
              ) : (
                <>
                  <span>Submit Changes</span>
                  <Check size={16} strokeWidth={2.6} />
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>

      {/* BOTTOM DRAWER FOR IMAGE CROPPING & POSITIONING */}
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
    </AnimatePresence>
  );
}
