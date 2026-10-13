'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Plus, Trash2, Check, Upload, X, AlertCircle } from 'lucide-react';
import { BrandProfile, BrandProductHighlight } from './types';
import styles from './brand-dashboard.module.css';

interface OnboardingFlowProps {
  brand: BrandProfile;
  onChange: (updated: BrandProfile) => void;
  onGoLive: () => void;
  onExit: () => void;
  onSaveDraft: () => void;
}

const STEPS = [
  { id: 'basics', num: '01', title: 'Brand basics', sub: 'Name, category & atelier location' },
  { id: 'visuals', num: '02', title: 'Visual assets', sub: 'Logo emblem, cover banner & story' },
  { id: 'offerings', num: '03', title: 'Offerings', sub: 'Signature products & pricing' },
  { id: 'channels', num: '04', title: 'Channels', sub: 'Website, Instagram & concierge email' },
  { id: 'launch', num: '05', title: 'Review & launch', sub: 'Verify brand dossier & go live' }
];

const LUXURY_CATEGORIES = [
  'Mindful Skincare & Wellness',
  'Luxury Ready-to-Wear',
  'Artisanal Footwear',
  'High Jewelry & Timepieces',
  'Leather Goods & Accessories',
  'Botanical Perfumery & Fragrance',
  'Artisanal Home & Objects',
  'Conscious Couture & Atelier'
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

  const updateField = <K extends keyof BrandProfile>(key: K, value: BrandProfile[K]) => {
    setErrorNotice(null);
    onChange({
      ...brand,
      [key]: value
    });
  };

  const handleProductChange = (index: number, field: keyof BrandProductHighlight, val: string) => {
    const nextProducts = [...brand.products];
    if (!nextProducts[index]) {
      nextProducts[index] = { name: '', tagline: '', description: '', volume: '', price: '', image: '' };
    }
    nextProducts[index] = {
      ...nextProducts[index],
      [field]: val
    };
    updateField('products', nextProducts);
  };

  const handleAddProduct = () => {
    const nextProducts = [
      ...brand.products,
      { name: '', tagline: '', description: '', volume: '', price: '', image: '' }
    ];
    updateField('products', nextProducts);
  };

  const handleRemoveProduct = (index: number) => {
    if (brand.products.length <= 1) {
      updateField('products', [{ name: '', tagline: '', description: '', volume: '', price: '', image: '' }]);
      return;
    }
    const nextProducts = brand.products.filter((_, i) => i !== index);
    updateField('products', nextProducts);
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
    if (stepIdx === 0) {
      if (!brand.name?.trim()) {
        setErrorNotice('Please enter your Brand Name to continue.');
        return false;
      }
    }
    if (stepIdx === 2) {
      const hasValidProduct = brand.products.some(p => p.name?.trim().length > 0);
      if (!hasValidProduct) {
        setErrorNotice('Please add at least one product name to continue.');
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
  const validProducts = brand.products.filter(p => p.name?.trim().length > 0);
  const validProductsCount = validProducts.length;

  return (
    <div className={styles.mobileContainer} style={{ backgroundColor: '#ffffff' }}>
      {/* 1. Sticky Apple Header */}
      <header className={styles.appTopHeader}>
        <button
          type="button"
          onClick={currentStep > 0 ? () => setCurrentStep(currentStep - 1) : onExit}
          className={styles.ronasBackTextBtn}
        >
          {currentStep > 0 ? '← Back' : '✕ Exit'}
        </button>

        <span className={styles.appTopTag}>Drobe Brand Studio</span>

        <button
          type="button"
          onClick={onSaveDraft}
          className={styles.ronasSaveDraftBtn}
        >
          Save Draft
        </button>
      </header>

      {/* 2. Horizontal Step Indicator */}
      <div className={styles.onboardingPillsBar}>
        {STEPS.map((st, idx) => {
          const isActive = idx === currentStep;
          const isDone = idx < currentStep;

          return (
            <button
              key={st.id}
              type="button"
              onClick={() => handleStepClick(idx)}
              className={`${styles.stepPillItem} ${isActive ? styles.stepPillItemActive : ''} ${isDone ? styles.stepPillItemDone : ''}`}
            >
              <span className={styles.stepPillNum}>{st.num}</span>
              <span className={styles.stepPillLabel}>{st.title}</span>
              {isActive && <span className={styles.stepActiveDot} />}
            </button>
          );
        })}
      </div>

      {/* 3. Scrollable Form Content */}
      <div className={styles.onboardingScrollContent}>
        {/* Step Header */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStepMeta.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            style={{ marginBottom: '14px' }}
          >
            <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#0f172a' }}>
              STEP {activeStepMeta.num} OF 05
            </div>
            <h2 className={styles.onboardingStepTitle}>
              {activeStepMeta.title}
            </h2>
            <p className={styles.onboardingStepSub}>
              {activeStepMeta.sub}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Validation Error Banner */}
        {errorNotice && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', color: '#b91c1c', fontSize: '12px', marginBottom: '12px' }}>
            <AlertCircle size={15} />
            <span>{errorNotice}</span>
          </div>
        )}

        {/* STEP 1: Brand Basics */}
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

            <div className={styles.ronasInputGroup}>
              <label className={styles.ronasInputLabel}>Luxury Category</label>
              <input
                type="text"
                list="category-suggestions"
                value={brand.category}
                onChange={(e) => updateField('category', e.target.value)}
                placeholder="Select or enter category..."
                className={styles.ronasInputField}
              />
              <datalist id="category-suggestions">
                {LUXURY_CATEGORIES.map((cat, idx) => (
                  <option key={idx} value={cat} />
                ))}
              </datalist>
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

        {/* STEP 3: Curated Offerings */}
        {activeStepMeta.id === 'offerings' && (
          <div className={styles.ronasFormContainer}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <label className={styles.ronasInputLabel} style={{ marginBottom: 0 }}>
                  Signature Offerings ({validProductsCount})
                </label>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  List the products you want featured on your Drobe profile
                </div>
              </div>
              <button
                type="button"
                onClick={handleAddProduct}
                className={styles.ronasAddOfferingBtn}
              >
                <Plus size={13} />
                Add Product
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {brand.products.map((prod, idx) => (
                <div key={idx} className={styles.ronasProductEditCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span className={styles.ronasOfferingTag}>
                      Product 0{idx + 1}
                    </span>
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

                  {/* Product Title & Price */}
                  <div className={styles.ronasRowTwo} style={{ marginBottom: '8px' }}>
                    <input
                      type="text"
                      value={prod.name}
                      onChange={(e) => handleProductChange(idx, 'name', e.target.value)}
                      placeholder="Product Name (e.g. Cashmere Knit)"
                      className={styles.ronasInputField}
                    />
                    <input
                      type="text"
                      value={prod.price || ''}
                      onChange={(e) => handleProductChange(idx, 'price', e.target.value)}
                      placeholder="Price (e.g. $180)"
                      className={styles.ronasInputField}
                    />
                  </div>

                  {/* Volume / Sizing & Tagline */}
                  <div className={styles.ronasRowTwo} style={{ marginBottom: '8px' }}>
                    <input
                      type="text"
                      value={prod.volume || ''}
                      onChange={(e) => handleProductChange(idx, 'volume', e.target.value)}
                      placeholder="Size / Volume (e.g. 50 ml, S/M/L)"
                      className={styles.ronasInputField}
                    />
                    <input
                      type="text"
                      value={prod.tagline}
                      onChange={(e) => handleProductChange(idx, 'tagline', e.target.value)}
                      placeholder="Tagline / Short Note"
                      className={styles.ronasInputField}
                    />
                  </div>

                  {/* Description */}
                  <textarea
                    value={prod.description}
                    onChange={(e) => handleProductChange(idx, 'description', e.target.value)}
                    placeholder="Materials, craftsmanship, benefits & notes..."
                    className={styles.ronasInputField}
                    style={{ minHeight: '52px', marginBottom: '8px' }}
                  />

                  {/* Product Image Upload */}
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {prod.image ? (
                      <div style={{ position: 'relative' }}>
                        <img
                          src={prod.image}
                          alt="Product preview"
                          style={{ width: '44px', height: '44px', borderRadius: '10px', objectFit: 'cover', border: '1px solid #cbd5e1' }}
                        />
                        <button
                          type="button"
                          onClick={() => handleProductChange(idx, 'image', '')}
                          style={{ position: 'absolute', top: '-4px', right: '-4px', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#ef4444', color: '#ffffff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ) : null}

                    <label className={styles.ronasUploadBtn} style={{ height: '36px', fontSize: '11px', cursor: 'pointer', padding: '0 10px' }}>
                      <Upload size={12} style={{ marginRight: '4px' }} />
                      {prod.image ? 'Change Photo' : 'Upload Photo'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, (data) => handleProductChange(idx, 'image', data))}
                        style={{ display: 'none' }}
                      />
                    </label>

                    <input
                      type="text"
                      value={prod.image && !prod.image.startsWith('data:') ? prod.image : ''}
                      onChange={(e) => handleProductChange(idx, 'image', e.target.value)}
                      placeholder="Or photo URL"
                      className={styles.ronasInputField}
                      style={{ flex: 1, padding: '8px 10px', fontSize: '11px' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: Direct Channels */}
        {activeStepMeta.id === 'channels' && (
          <div className={styles.ronasFormContainer}>
            <div className={styles.ronasInputGroup}>
              <label className={styles.ronasInputLabel}>Official Website URL</label>
              <input
                type="text"
                value={brand.website}
                onChange={(e) => updateField('website', e.target.value)}
                placeholder="https://yourbrand.com"
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
                value={brand.inquiriesEmail}
                onChange={(e) => updateField('inquiriesEmail', e.target.value)}
                placeholder="concierge@yourbrand.com"
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
                    {brand.category || 'Luxury Partner'}
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
                  <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Total Offerings</div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a' }}>
                    {validProductsCount} {validProductsCount === 1 ? 'Product' : 'Products'} Listed
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Portal Status</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#059669' }}>
                    ● Ready for Live Store
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.ronasReadyNotice}>
              <Check size={16} color="#059669" />
              <span>Everything is verified. Tap &ldquo;Go Live on Drobe&rdquo; to launch your live store.</span>
            </div>
          </div>
        )}
      </div>

      {/* 4. Sticky Bottom Action Bar */}
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
            onClick={handleNext}
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
            Go Live on Drobe →
          </button>
        )}
      </footer>
    </div>
  );
}
