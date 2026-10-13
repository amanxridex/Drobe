'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Plus, Trash2, Check, Upload } from 'lucide-react';
import IPhoneStatusBar from './IPhoneStatusBar';
import { BrandProfile } from './types';
import styles from './brand-dashboard.module.css';

interface OnboardingFlowProps {
  brand: BrandProfile;
  onChange: (updated: BrandProfile) => void;
  onGoLive: () => void;
  onExit: () => void;
  onSaveDraft: () => void;
}

const STEPS = [
  { id: 'basics', num: '01', title: 'Brand basics', sub: 'Name, category & atelier' },
  { id: 'visuals', num: '02', title: 'Visual assets', sub: 'Cover banner & profile emblem' },
  { id: 'offerings', num: '03', title: 'Offerings', sub: 'Products & official channels' },
  { id: 'launch', num: '04', title: 'Ready to launch', sub: 'Review dossier & go live' }
];

const PRESET_COVERS = [
  { label: 'Studio Linen', url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80' },
  { label: 'Botanical Ceramic', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80' },
  { label: 'Alpine Stone', url: '/brands/jihi/cover.jpg' }
];

const PRESET_AVATARS = [
  { label: 'Ceramic Ivory', url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80' },
  { label: 'Botanical Leaf', url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=400&q=80' },
  { label: 'Dropper Mark', url: '/brands/jihi/profile.jpg' }
];

export default function OnboardingFlow({
  brand,
  onChange,
  onGoLive,
  onExit,
  onSaveDraft
}: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const updateField = <K extends keyof BrandProfile>(key: K, value: BrandProfile[K]) => {
    onChange({
      ...brand,
      [key]: value
    });
  };

  const handleProductChange = (index: number, field: keyof BrandProfile['products'][0], val: string) => {
    const nextProducts = [...brand.products];
    if (!nextProducts[index]) {
      nextProducts[index] = { name: '', tagline: '', description: '', volume: '' };
    }
    nextProducts[index][field] = val;
    updateField('products', nextProducts);
  };

  const handleAddProduct = () => {
    const nextProducts = [
      ...brand.products,
      { name: '', tagline: '', description: '', volume: '' }
    ];
    updateField('products', nextProducts);
  };

  const handleRemoveProduct = (index: number) => {
    if (brand.products.length <= 1) return;
    const nextProducts = brand.products.filter((_, i) => i !== index);
    updateField('products', nextProducts);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'coverImage' | 'profileImage') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          updateField(field, reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const activeStepMeta = STEPS[currentStep];
  const validProductsCount = brand.products.filter(p => p.name.trim().length > 0).length;

  return (
    <div className={styles.mobileContainer} style={{ backgroundColor: '#ffffff' }}>
      {/* 1. iOS Status Bar with Dynamic Island */}
      <IPhoneStatusBar />

      {/* 2. Top Header */}
      <header className={styles.appTopHeader}>
        <button
          type="button"
          onClick={currentStep > 0 ? () => setCurrentStep(currentStep - 1) : onExit}
          className={styles.ronasBackTextBtn}
        >
          {currentStep > 0 ? '← Back' : '✕ Exit'}
        </button>

        <span className={styles.appTopTag}>Partner Studio</span>

        <button
          type="button"
          onClick={onSaveDraft}
          className={styles.ronasSaveDraftBtn}
        >
          Save
        </button>
      </header>

      {/* 3. Horizontal Step Pills Bar (Image 1 Style) */}
      <div className={styles.onboardingPillsBar}>
        {STEPS.map((st, idx) => {
          const isActive = idx === currentStep;
          const isDone = idx < currentStep;

          return (
            <button
              key={st.id}
              type="button"
              onClick={() => setCurrentStep(idx)}
              className={`${styles.stepPillItem} ${isActive ? styles.stepPillItemActive : ''} ${isDone ? styles.stepPillItemDone : ''}`}
            >
              <span className={styles.stepPillNum}>{st.num}</span>
              <span className={styles.stepPillLabel}>{st.title}</span>
              {isActive && <span className={styles.stepActiveDot} />}
            </button>
          );
        })}
      </div>

      {/* 4. Scrollable Form Content */}
      <div className={styles.onboardingScrollContent}>
        {/* Step Intro */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStepMeta.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            style={{ marginBottom: '16px' }}
          >
            <div style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#0284c7' }}>
              STEP {activeStepMeta.num} OF 04
            </div>
            <h2 className={styles.onboardingStepTitle}>
              {activeStepMeta.title}
            </h2>
            <p className={styles.onboardingStepSub}>
              {activeStepMeta.sub}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* STEP 1: Brand Basics */}
        {activeStepMeta.id === 'basics' && (
          <div className={styles.ronasFormContainer}>
            <div className={styles.ronasInputGroup}>
              <label className={styles.ronasInputLabel}>Brand Name</label>
              <input
                type="text"
                value={brand.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="e.g. Jihi"
                className={styles.ronasInputField}
              />
            </div>

            <div className={styles.ronasInputGroup}>
              <label className={styles.ronasInputLabel}>Tagline or Essence</label>
              <input
                type="text"
                value={brand.tagline}
                onChange={(e) => updateField('tagline', e.target.value)}
                placeholder="e.g. Conscious luxury and botanical rituals"
                className={styles.ronasInputField}
              />
            </div>

            <div className={styles.ronasInputGroup}>
              <label className={styles.ronasInputLabel}>Luxury Category</label>
              <input
                type="text"
                value={brand.category}
                onChange={(e) => updateField('category', e.target.value)}
                placeholder="e.g. Mindful Skincare & Wellness"
                className={styles.ronasInputField}
              />
            </div>

            <div className={styles.ronasRowTwo}>
              <div className={styles.ronasInputGroup}>
                <label className={styles.ronasInputLabel}>Atelier Location</label>
                <input
                  type="text"
                  value={brand.basedOutOf}
                  onChange={(e) => updateField('basedOutOf', e.target.value)}
                  placeholder="e.g. Telluride, CO"
                  className={styles.ronasInputField}
                />
              </div>

              <div className={styles.ronasInputGroup}>
                <label className={styles.ronasInputLabel}>Established Year</label>
                <input
                  type="text"
                  value={brand.establishedYear}
                  onChange={(e) => updateField('establishedYear', e.target.value)}
                  placeholder="e.g. 2024"
                  className={styles.ronasInputField}
                />
              </div>
            </div>

            <div className={styles.ronasInputGroup}>
              <label className={styles.ronasInputLabel}>Founder Name</label>
              <input
                type="text"
                value={brand.founderName}
                onChange={(e) => updateField('founderName', e.target.value)}
                placeholder="e.g. Jenn Bernstein"
                className={styles.ronasInputField}
              />
            </div>
          </div>
        )}

        {/* STEP 2: Visual Assets */}
        {activeStepMeta.id === 'visuals' && (
          <div className={styles.ronasFormContainer}>
            {/* Cover Banner */}
            <div className={styles.ronasInputGroup}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label className={styles.ronasInputLabel}>Cover Panorama Banner</label>
                <span style={{ fontSize: '11px', color: '#64748b' }}>16:9 Landscape</span>
              </div>

              <div className={styles.ronasBannerPreviewBox}>
                {brand.coverImage ? (
                  <img
                    src={brand.coverImage}
                    alt="Cover preview"
                    className={styles.ronasBannerImg}
                  />
                ) : (
                  <div className={styles.ronasBannerEmpty}>
                    No cover banner selected
                  </div>
                )}

                <div className={styles.ronasMediaControlsRow}>
                  <input
                    type="text"
                    value={brand.coverImage}
                    onChange={(e) => updateField('coverImage', e.target.value)}
                    placeholder="Image URL or choose preset"
                    className={styles.ronasInputField}
                    style={{ flex: 1 }}
                  />
                  <label className={styles.ronasUploadBtn}>
                    Upload
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'coverImage')}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>

                <div className={styles.ronasPresetChipsRow}>
                  {PRESET_COVERS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => updateField('coverImage', preset.url)}
                      className={styles.ronasPresetChip}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Profile Logo Emblem */}
            <div className={styles.ronasInputGroup}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label className={styles.ronasInputLabel}>Profile Emblem / Mark</label>
                <span style={{ fontSize: '11px', color: '#64748b' }}>1:1 Square</span>
              </div>

              <div className={styles.ronasEmblemPreviewBox}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  {brand.profileImage ? (
                    <img
                      src={brand.profileImage}
                      alt="Logo preview"
                      className={styles.ronasEmblemThumb}
                    />
                  ) : (
                    <div className={styles.ronasEmblemFallback}>
                      Logo
                    </div>
                  )}

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        value={brand.profileImage}
                        onChange={(e) => updateField('profileImage', e.target.value)}
                        placeholder="Emblem URL"
                        className={styles.ronasInputField}
                        style={{ flex: 1 }}
                      />
                      <label className={styles.ronasUploadBtn}>
                        Upload
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, 'profileImage')}
                          style={{ display: 'none' }}
                        />
                      </label>
                    </div>

                    <div className={styles.ronasPresetChipsRow}>
                      {PRESET_AVATARS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => updateField('profileImage', preset.url)}
                          className={styles.ronasPresetChip}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Offerings & Channels */}
        {activeStepMeta.id === 'offerings' && (
          <div className={styles.ronasFormContainer}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <label className={styles.ronasInputLabel}>Signature Formulations ({validProductsCount})</label>
              <button
                type="button"
                onClick={handleAddProduct}
                className={styles.ronasAddOfferingBtn}
              >
                <Plus size={12} />
                Add Formulation
              </button>
            </div>

            {/* List of Products (Image 1 Style) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              {brand.products.map((prod, idx) => (
                <div key={idx} className={styles.ronasProductEditCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span className={styles.ronasOfferingTag}>Offering 0{idx + 1}</span>
                    {brand.products.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveProduct(idx)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                      >
                        <Trash2 size={12} /> Remove
                      </button>
                    )}
                  </div>

                  <div className={styles.ronasRowTwo} style={{ marginBottom: '8px' }}>
                    <input
                      type="text"
                      value={prod.name}
                      onChange={(e) => handleProductChange(idx, 'name', e.target.value)}
                      placeholder="Product Name (e.g. Petal Milk)"
                      className={styles.ronasInputField}
                    />
                    <input
                      type="text"
                      value={prod.volume || ''}
                      onChange={(e) => handleProductChange(idx, 'volume', e.target.value)}
                      placeholder="Volume (e.g. 30 ml)"
                      className={styles.ronasInputField}
                    />
                  </div>

                  <input
                    type="text"
                    value={prod.tagline}
                    onChange={(e) => handleProductChange(idx, 'tagline', e.target.value)}
                    placeholder="Tagline (e.g. Rejuvenating Face Serum)"
                    className={styles.ronasInputField}
                    style={{ marginBottom: '8px' }}
                  />

                  <textarea
                    value={prod.description}
                    onChange={(e) => handleProductChange(idx, 'description', e.target.value)}
                    placeholder="Active botanical ingredients and benefits..."
                    className={styles.ronasInputField}
                    style={{ minHeight: '52px' }}
                  />
                </div>
              ))}
            </div>

            {/* Channels & Touchpoints */}
            <div style={{ paddingTop: '14px', borderTop: '1px solid #f1f5f9' }}>
              <label className={styles.ronasInputLabel} style={{ marginBottom: '10px' }}>Direct Channels</label>
              
              <div style={{ marginBottom: '8px' }}>
                <input
                  type="text"
                  value={brand.website}
                  onChange={(e) => updateField('website', e.target.value)}
                  placeholder="Website (e.g. https://jihi.com)"
                  className={styles.ronasInputField}
                />
              </div>

              <div className={styles.ronasRowTwo}>
                <input
                  type="text"
                  value={brand.instagram}
                  onChange={(e) => updateField('instagram', e.target.value)}
                  placeholder="Instagram (e.g. @jihi_rituals)"
                  className={styles.ronasInputField}
                />
                <input
                  type="text"
                  value={brand.inquiriesEmail}
                  onChange={(e) => updateField('inquiriesEmail', e.target.value)}
                  placeholder="Concierge Email"
                  className={styles.ronasInputField}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Review & Go Live */}
        {activeStepMeta.id === 'launch' && (
          <div className={styles.ronasFormContainer}>
            {/* Dossier Preview Card */}
            <div className={styles.ronasDossierCard}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '14px' }}>
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
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#0284c7', fontWeight: 800 }}>
                    {brand.category || 'Luxury Brand'}
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                    {brand.name || 'Untitled Brand'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    {brand.basedOutOf || 'Global Atelier'}
                  </div>
                </div>
              </div>

              {/* Cover Banner Thumbnail */}
              {brand.coverImage && (
                <div style={{ borderRadius: '12px', overflow: 'hidden', height: '100px', marginBottom: '14px' }}>
                  <img
                    src={brand.coverImage}
                    alt="Cover"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              )}

              {/* Stats Bar */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                <div>
                  <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Total Offerings</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                    {validProductsCount} {validProductsCount === 1 ? 'Product' : 'Products'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Status</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#059669' }}>
                    ● Ready for Launch
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.ronasReadyNotice}>
              <Check size={16} color="#059669" />
              <span>Everything is verified. Tap &ldquo;Go Live&rdquo; to launch your live brand dashboard.</span>
            </div>
          </div>
        )}
      </div>

      {/* 5. Sticky Bottom Action Bar */}
      <footer className={styles.ronasBottomActionBar}>
        {currentStep > 0 && (
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
            onClick={() => setCurrentStep(currentStep + 1)}
            className={styles.ronasContinuePillBtn}
          >
            Continue
            <ArrowRight size={15} />
          </button>
        ) : (
          <button
            type="button"
            onClick={onGoLive}
            className={styles.ronasGoLivePillBtn}
          >
            Go Live →
          </button>
        )}
      </footer>
    </div>
  );
}
