'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  { id: 'identity', title: 'Brand basics', sub: 'name, category & atelier origin' },
  { id: 'story', title: 'Story & founder', sub: 'your philosophy and vision' },
  { id: 'imagery', title: 'Cover & logo', sub: 'editorial visuals for your page' },
  { id: 'catalog', title: 'Your products', sub: 'signature offerings & touchpoints' },
  { id: 'review', title: 'Ready to launch', sub: 'review & publish live' }
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

  const progressPercent = Math.round(((currentStep + 1) / STEPS.length) * 100);
  const activeStepMeta = STEPS[currentStep];
  const validProductsCount = brand.products.filter(p => p.name.trim().length > 0).length;

  return (
    <div className={styles.mobileContainer}>
      {/* Top Header */}

      {/* Cute Minimal Header */}
      <header className={styles.mobileHeader}>
        <div className={styles.mobileHeaderLeft}>
          {currentStep > 0 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep - 1)}
              className={styles.textBtn}
            >
              ← back
            </button>
          ) : (
            <button
              type="button"
              onClick={onExit}
              className={styles.textBtn}
            >
              ✕ exit
            </button>
          )}
        </div>

        <div className={styles.mobileHeaderTitle}>
          0{currentStep + 1} / 0{STEPS.length}
        </div>

        <div className={styles.mobileHeaderRight}>
          <button
            type="button"
            onClick={onSaveDraft}
            className={`${styles.textBtn} ${styles.textBtnDark}`}
          >
            save draft
          </button>
        </div>

        {/* Apple Progress Bar */}
        <div className={styles.progressBarTrack}>
          <div
            className={styles.progressBarFill}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </header>

      {/* Scrollable Content Layer */}
      <div className={styles.mobileContent} style={{ padding: '16px 16px 40px 16px' }}>
        {/* Step Intro Header */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`step-${activeStepMeta.id}`}
            className={styles.screenIntroCard}
            style={{ marginBottom: '14px', padding: '16px 18px', borderRadius: '16px' }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span className={styles.stepBadge}>
                ✦ step 0{currentStep + 1}
              </span>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                {currentStep + 1} of {STEPS.length}
              </span>
            </div>
            <h1 className={styles.screenTitle} style={{ fontSize: '20px', margin: '2px 0 2px 0' }}>
              {activeStepMeta.title}
            </h1>
            <p className={styles.screenSubtitle} style={{ margin: 0, fontSize: '12px' }}>
              {activeStepMeta.sub}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* STEP 1: Brand Identity */}
        {activeStepMeta.id === 'identity' && (
          <div className={styles.formCard}>
            <div className={styles.formGroup}>
              <div className={styles.formLabelRow}>
                <label className={styles.formLabel}>Brand name</label>
                <span className={styles.formHint}>Required</span>
              </div>
              <input
                type="text"
                value={brand.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="e.g. Jihi"
                className={styles.inputField}
              />
            </div>

            <div className={styles.formGroup}>
              <div className={styles.formLabelRow}>
                <label className={styles.formLabel}>Tagline or essence</label>
              </div>
              <input
                type="text"
                value={brand.tagline}
                onChange={(e) => updateField('tagline', e.target.value)}
                placeholder="e.g. Botanical rituals crafted for mindful calm"
                className={styles.inputField}
              />
            </div>

            <div className={styles.formGroup}>
              <div className={styles.formLabelRow}>
                <label className={styles.formLabel}>Category</label>
              </div>
              <input
                type="text"
                value={brand.category}
                onChange={(e) => updateField('category', e.target.value)}
                placeholder="e.g. Mindful Skincare & Rituals"
                className={styles.inputField}
              />
            </div>

            <div className={styles.formRowTwo}>
              <div className={styles.formGroup}>
                <div className={styles.formLabelRow}>
                  <label className={styles.formLabel}>Atelier location</label>
                </div>
                <input
                  type="text"
                  value={brand.basedOutOf}
                  onChange={(e) => updateField('basedOutOf', e.target.value)}
                  placeholder="e.g. Telluride, CO"
                  className={styles.inputField}
                />
              </div>

              <div className={styles.formGroup}>
                <div className={styles.formLabelRow}>
                  <label className={styles.formLabel}>Established</label>
                </div>
                <input
                  type="text"
                  value={brand.establishedYear}
                  onChange={(e) => updateField('establishedYear', e.target.value)}
                  placeholder="e.g. 2024"
                  className={styles.inputField}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Story & Founder */}
        {activeStepMeta.id === 'story' && (
          <div className={styles.formCard}>
            <div className={styles.formRowTwo}>
              <div className={styles.formGroup}>
                <div className={styles.formLabelRow}>
                  <label className={styles.formLabel}>Founder name</label>
                </div>
                <input
                  type="text"
                  value={brand.founderName}
                  onChange={(e) => updateField('founderName', e.target.value)}
                  placeholder="e.g. Jenn Bernstein"
                  className={styles.inputField}
                />
              </div>

              <div className={styles.formGroup}>
                <div className={styles.formLabelRow}>
                  <label className={styles.formLabel}>Role / title</label>
                </div>
                <input
                  type="text"
                  value={brand.founderRole}
                  onChange={(e) => updateField('founderRole', e.target.value)}
                  placeholder="e.g. Founder & Formulator"
                  className={styles.inputField}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <div className={styles.formLabelRow}>
                <label className={styles.formLabel}>Founder quote or mantra</label>
              </div>
              <textarea
                value={brand.founderQuote}
                onChange={(e) => updateField('founderQuote', e.target.value)}
                placeholder="A short quote about your brand mission..."
                className={styles.textAreaField}
                style={{ minHeight: '65px' }}
              />
            </div>

            <div className={styles.formGroup}>
              <div className={styles.formLabelRow}>
                <label className={styles.formLabel}>About your brand</label>
              </div>
              <textarea
                value={brand.about}
                onChange={(e) => updateField('about', e.target.value)}
                placeholder="Briefly describe your formulations, ethos, and craftsmanship..."
                className={styles.textAreaField}
                style={{ minHeight: '85px' }}
              />
            </div>
          </div>
        )}

        {/* STEP 3: Visuals (Cover & Logo) */}
        {activeStepMeta.id === 'imagery' && (
          <div className={styles.formCard}>
            {/* Cover Banner */}
            <div className={styles.formGroup}>
              <div className={styles.formLabelRow}>
                <label className={styles.formLabel}>Cover banner</label>
                <span className={styles.formHint}>16:9 landscape</span>
              </div>

              <div className={styles.mobileMediaCard}>
                {brand.coverImage ? (
                  <img
                    src={brand.coverImage}
                    alt="Cover preview"
                    className={styles.coverMobilePreview}
                  />
                ) : (
                  <div
                    className={styles.coverMobilePreview}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      color: '#64748b'
                    }}
                  >
                    no cover image selected
                  </div>
                )}

                <div className={styles.mediaActionBar}>
                  <input
                    type="text"
                    value={brand.coverImage}
                    onChange={(e) => updateField('coverImage', e.target.value)}
                    placeholder="Image URL or pick below"
                    className={styles.inputField}
                    style={{ flex: 1 }}
                  />
                  <label className={styles.chipBtn} style={{ display: 'inline-flex', alignItems: 'center' }}>
                    Upload
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'coverImage')}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>

                <div className={styles.presetChips}>
                  {PRESET_COVERS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => updateField('coverImage', preset.url)}
                      className={styles.chipBtn}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Profile Logo */}
            <div className={styles.formGroup}>
              <div className={styles.formLabelRow}>
                <label className={styles.formLabel}>Profile emblem</label>
                <span className={styles.formHint}>1:1 square</span>
              </div>

              <div className={styles.mobileMediaCard}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  {brand.profileImage ? (
                    <img
                      src={brand.profileImage}
                      alt="Logo preview"
                      className={styles.avatarMobilePreview}
                    />
                  ) : (
                    <div
                      className={styles.avatarMobilePreview}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        color: '#64748b'
                      }}
                    >
                      no logo
                    </div>
                  )}

                  <div style={{ flex: 1 }}>
                    <div className={styles.mediaActionBar} style={{ marginTop: 0 }}>
                      <input
                        type="text"
                        value={brand.profileImage}
                        onChange={(e) => updateField('profileImage', e.target.value)}
                        placeholder="Logo URL"
                        className={styles.inputField}
                        style={{ flex: 1 }}
                      />
                      <label className={styles.chipBtn} style={{ display: 'inline-flex', alignItems: 'center' }}>
                        Upload
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, 'profileImage')}
                          style={{ display: 'none' }}
                        />
                      </label>
                    </div>

                    <div className={styles.presetChips}>
                      {PRESET_AVATARS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => updateField('profileImage', preset.url)}
                          className={styles.chipBtn}
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

        {/* STEP 4: Products & Catalog */}
        {activeStepMeta.id === 'catalog' && (
          <div className={styles.formCard}>
            <div className={styles.formGroup}>
              <div className={styles.formLabelRow}>
                <label className={styles.formLabel}>Signature offerings</label>
                <span className={styles.formHint}>{validProductsCount} active</span>
              </div>

              <div className={styles.mobileStackList}>
                {brand.products.map((prod, idx) => (
                  <div key={idx} className={styles.mobileStackItem}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span className={styles.stackItemIndex}>Product 0{idx + 1}</span>
                      {brand.products.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveProduct(idx)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#ef4444',
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          ✕ remove
                        </button>
                      )}
                    </div>

                    <div className={styles.formRowTwo} style={{ marginBottom: '8px' }}>
                      <input
                        type="text"
                        value={prod.name}
                        onChange={(e) => handleProductChange(idx, 'name', e.target.value)}
                        placeholder="Product name (e.g. Petal Milk)"
                        className={styles.inputField}
                      />
                      <input
                        type="text"
                        value={prod.tagline}
                        onChange={(e) => handleProductChange(idx, 'tagline', e.target.value)}
                        placeholder="Tagline (e.g. Face Serum)"
                        className={styles.inputField}
                      />
                    </div>

                    <textarea
                      value={prod.description}
                      onChange={(e) => handleProductChange(idx, 'description', e.target.value)}
                      placeholder="Active ingredients & ritual benefits..."
                      className={styles.textAreaField}
                      style={{ minHeight: '50px', marginBottom: '8px' }}
                    />

                    <input
                      type="text"
                      value={prod.volume || ''}
                      onChange={(e) => handleProductChange(idx, 'volume', e.target.value)}
                      placeholder="Volume / Size (e.g. 30 ml)"
                      className={styles.inputField}
                    />
                  </div>
                ))}
              </div>

              {/* Add Product Button */}
              <button
                type="button"
                onClick={handleAddProduct}
                className={styles.chipBtn}
                style={{
                  width: '100%',
                  marginTop: '10px',
                  padding: '10px 14px',
                  textAlign: 'center',
                  fontWeight: 700,
                  border: '1px dashed #cbd5e1',
                  backgroundColor: '#f8fafc'
                }}
              >
                + add another product
              </button>
            </div>

            {/* Direct Touchpoints */}
            <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #f1f5f9' }}>
              <div className={styles.formLabelRow}>
                <label className={styles.formLabel}>Website & Instagram</label>
              </div>

              <div className={styles.formRowTwo}>
                <input
                  type="text"
                  value={brand.website}
                  onChange={(e) => updateField('website', e.target.value)}
                  placeholder="https://brand.com"
                  className={styles.inputField}
                />
                <input
                  type="text"
                  value={brand.instagram}
                  onChange={(e) => updateField('instagram', e.target.value)}
                  placeholder="@handle"
                  className={styles.inputField}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Review & Go Live */}
        {activeStepMeta.id === 'review' && (
          <div className={styles.formCard}>
            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
                padding: '16px',
                marginBottom: '14px'
              }}
            >
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
                {brand.profileImage ? (
                  <img
                    src={brand.profileImage}
                    alt={brand.name}
                    style={{ width: '48px', height: '48px', borderRadius: '12px', objectFit: 'cover', border: '1px solid #cbd5e1' }}
                  />
                ) : (
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                    {brand.name ? brand.name.slice(0, 1).toUpperCase() : 'B'}
                  </div>
                )}
                <div>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#0284c7', fontWeight: 700 }}>
                    {brand.category || 'Luxury Brand'}
                  </div>
                  <div style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>
                    {brand.name || 'Untitled Brand'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    {brand.basedOutOf || 'Global'}
                  </div>
                </div>
              </div>

              {/* Cover Banner Thumbnail */}
              {brand.coverImage && (
                <div style={{ marginBottom: '12px', borderRadius: '8px', overflow: 'hidden', height: '85px' }}>
                  <img
                    src={brand.coverImage}
                    alt="Cover"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              )}

              {/* 2 Mini Facts */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Total listed products</span>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                  {validProductsCount} {validProductsCount === 1 ? 'item' : 'items'}
                </span>
              </div>
            </div>

            <div
              style={{
                backgroundColor: '#ecfdf5',
                border: '1px solid #a7f3d0',
                borderRadius: '12px',
                padding: '12px 14px',
                textAlign: 'center'
              }}
            >
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#065f46' }}>
                Ready to publish. Tap &ldquo;Go Live&rdquo; below.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Bar */}
      <footer className={styles.mobileBottomBar}>
        {currentStep > 0 && (
          <button
            type="button"
            onClick={() => setCurrentStep(currentStep - 1)}
            className={`${styles.actionBtn} ${styles.actionBtnSecondary}`}
          >
            back
          </button>
        )}

        {currentStep < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={() => setCurrentStep(currentStep + 1)}
            className={`${styles.actionBtn} ${styles.actionBtnAccent}`}
          >
            continue →
          </button>
        ) : (
          <button
            type="button"
            onClick={onGoLive}
            className={`${styles.actionBtn} ${styles.actionBtnGoLive}`}
          >
            Go Live →
          </button>
        )}
      </footer>
    </div>
  );
}
