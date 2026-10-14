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
  Sparkles,
  Camera,
  User,
  Compass,
  FileText
} from 'lucide-react';
import { BrandProfile } from './types';
import styles from './brand-dashboard.module.css';

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'profileImage' | 'coverImage') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        setErrorMsg('Image size exceeds 8MB limit. Please upload a smaller image.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          updateField(field, reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);

    // Validation
    const trimmedName = formData.name?.trim();
    if (!trimmedName) {
      setErrorMsg('Brand Name cannot be empty.');
      return;
    }

    if (formData.email && (!formData.email.includes('@') || !formData.email.includes('.'))) {
      setErrorMsg('Please enter a valid account email address.');
      return;
    }

    setIsSubmitting(true);

    const updated: BrandProfile = {
      ...formData,
      name: trimmedName,
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
              <span className={styles.editProfileSubTitle}>Live Atelier Dossier</span>
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
                  <p className={styles.editSectionSub}>Atelier emblem & signature lookbook banner</p>
                </div>
              </div>

              {/* Logo / Profile Image */}
              <div className={styles.editFieldGroup}>
                <label className={styles.editFieldLabel}>Atelier Emblem / Logo</label>
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
                      onChange={(e) => handleImageUpload(e, 'profileImage')}
                    />
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className={styles.editUploadPillBtn}
                    >
                      <Upload size={13} />
                      {formData.profileImage ? 'Change Emblem' : 'Upload Emblem'}
                    </button>

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
                <span className={styles.editFieldHint}>Square PNG or JPG recommended (min. 400x400px).</span>
              </div>

              {/* Cover Banner */}
              <div className={styles.editFieldGroup} style={{ marginTop: '16px' }}>
                <label className={styles.editFieldLabel}>Atelier Cover Banner</label>
                <div className={styles.editBannerContainer}>
                  {formData.coverImage ? (
                    <img src={formData.coverImage} alt="Cover Banner" className={styles.editBannerImg} />
                  ) : (
                    <div className={styles.editBannerEmpty}>
                      <Camera size={22} color="#94a3b8" />
                      <span>No cover banner set</span>
                    </div>
                  )}

                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => handleImageUpload(e, 'coverImage')}
                  />
                  <div className={styles.editBannerOverlayActions}>
                    <button
                      type="button"
                      onClick={() => coverInputRef.current?.click()}
                      className={styles.editUploadPillBtn}
                    >
                      <Upload size={13} />
                      {formData.coverImage ? 'Replace Banner' : 'Upload Banner'}
                    </button>

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
                  <p className={styles.editSectionSub}>Name, target client audience & atelier provenance</p>
                </div>
              </div>

              {/* Brand Name */}
              <div className={styles.editFieldGroup}>
                <label className={styles.editFieldLabel}>Brand Name *</label>
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
                <label className={styles.editFieldLabel}>Tagline / Subtitle</label>
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
                <label className={styles.editFieldLabel}>Target Client Category</label>
                <div className={styles.editSegmentedGroup}>
                  {[
                    { value: 'Male', label: 'Male' },
                    { value: 'Female', label: 'Female' },
                    { value: 'Male & Female', label: 'Male & Female' }
                  ].map(cat => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => updateField('category', cat.value)}
                      className={`${styles.editSegmentBtn} ${formData.category === cat.value ? styles.editSegmentBtnActive : ''}`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Two columns: Location & Established Year */}
              <div className={styles.editTwoColRow}>
                <div className={styles.editFieldGroup}>
                  <label className={styles.editFieldLabel}>Based Out Of</label>
                  <input
                    type="text"
                    value={formData.basedOutOf || ''}
                    onChange={(e) => updateField('basedOutOf', e.target.value)}
                    placeholder="e.g. Milan / Mumbai"
                    className={styles.editTextInput}
                  />
                </div>

                <div className={styles.editFieldGroup}>
                  <label className={styles.editFieldLabel}>Established Year</label>
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
                  <label className={styles.editFieldLabel}>Founder Name</label>
                  <input
                    type="text"
                    value={formData.founderName || ''}
                    onChange={(e) => updateField('founderName', e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    className={styles.editTextInput}
                  />
                </div>

                <div className={styles.editFieldGroup}>
                  <label className={styles.editFieldLabel}>Founder Role</label>
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
                <label className={styles.editFieldLabel}>Signature Founder Quote</label>
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
                  <p className={styles.editSectionSub}>The atelier story displayed to verified clients</p>
                </div>
              </div>

              <div className={styles.editFieldGroup}>
                <label className={styles.editFieldLabel}>About the Atelier</label>
                <textarea
                  rows={3}
                  value={formData.about || ''}
                  onChange={(e) => updateField('about', e.target.value)}
                  placeholder="Tell clients the origin story, craftsmanship methods, and materials..."
                  className={styles.editTextarea}
                />
              </div>

              <div className={styles.editFieldGroup}>
                <label className={styles.editFieldLabel}>Mission & Sustainability</label>
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
                <label className={styles.editFieldLabel}>Official Website</label>
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
                <label className={styles.editFieldLabel}>Instagram Handle</label>
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
              </div>

              {/* Inquiries Email */}
              <div className={styles.editFieldGroup}>
                <label className={styles.editFieldLabel}>Concierge & Inquiries Email</label>
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

              {/* Atelier Account Email */}
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

            {/* --- SECTION 6: CREDENTIALS --- */}
            <div className={styles.editSectionCard}>
              <div className={styles.editSectionHeader}>
                <Lock size={15} className={styles.editSectionIcon} />
                <div>
                  <h4 className={styles.editSectionTitle}>Atelier Security</h4>
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
    </AnimatePresence>
  );
}
