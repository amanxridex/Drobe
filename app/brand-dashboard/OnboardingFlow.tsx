'use client';

import React, { useState } from 'react';
import { BrandProfile } from './types';
import AppleGeometricBg from './AppleGeometricBg';
import styles from './brand-dashboard.module.css';

interface OnboardingFlowProps {
  brand: BrandProfile;
  onChange: (updated: BrandProfile) => void;
  onGoLive: () => void;
  onResetJihi: () => void;
  onStartBlank: () => void;
  onViewProfileTab: () => void;
  onBackToStart: () => void;
}

const STEPS = [
  { id: 'identity', title: 'Brand Identity', sub: 'Foundational name, category & year' },
  { id: 'origins', title: 'Studio Origins', sub: 'Location & founder leadership' },
  { id: 'narrative', title: 'Story & Ethos', sub: 'Brand narrative & guiding tenets' },
  { id: 'imagery', title: 'Visual Presence', sub: 'Editorial banner & emblem' },
  { id: 'reach', title: 'Products & Offerings', sub: 'Catalog offerings & signature formulations' },
  { id: 'review', title: 'Review & Go Live', sub: 'Final dossier verification before launch' }
];

const PRESET_COVERS = [
  { label: 'Jihi Alpine Stone', url: '/brands/jihi/cover.jpg' },
  { label: 'Studio Linen', url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80' },
  { label: 'Botanical Ceramic', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80' }
];

const PRESET_AVATARS = [
  { label: 'Jihi Dropper Mark', url: '/brands/jihi/profile.jpg' },
  { label: 'Ceramic Ivory', url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80' },
  { label: 'Botanical Leaf', url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=400&q=80' }
];

export default function OnboardingFlow({
  brand,
  onChange,
  onGoLive,
  onResetJihi,
  onStartBlank,
  onViewProfileTab,
  onBackToStart
}: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const updateField = <K extends keyof BrandProfile>(key: K, value: BrandProfile[K]) => {
    onChange({
      ...brand,
      [key]: value
    });
  };

  const handleValueChange = (index: number, field: 'title' | 'description', val: string) => {
    const nextValues = [...brand.values];
    if (!nextValues[index]) {
      nextValues[index] = { title: '', description: '' };
    }
    nextValues[index][field] = val;
    updateField('values', nextValues);
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
      {/* Code-driven Geometric Apple Wallpaper Background */}
      <AppleGeometricBg />

      {/* iOS-Style Sticky Top Navigation */}
      <header className={styles.mobileHeader}>
        <div className={styles.mobileHeaderLeft}>
          {currentStep > 0 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep - 1)}
              className={styles.textBtn}
            >
              ← Back
            </button>
          ) : (
            <button
              type="button"
              onClick={onBackToStart}
              className={styles.textBtn}
            >
              ← Start
            </button>
          )}
        </div>

        <div className={styles.mobileHeaderTitle}>
          Step 0{currentStep + 1} / 0{STEPS.length}
        </div>

        <div className={styles.mobileHeaderRight}>
          <button
            type="button"
            onClick={onViewProfileTab}
            className={styles.textBtn}
          >
            Dashboard
          </button>
        </div>

        {/* Thin Apple Progress Indicator */}
        <div className={styles.progressBarTrack}>
          <div
            className={styles.progressBarFill}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </header>

      {/* Scrollable Content Layer */}
      <div className={styles.mobileContent}>
        {/* Step Intro Card */}
        <div className={styles.screenIntroCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span className={styles.stepBadge}>Section 0{currentStep + 1}</span>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
              {currentStep + 1} of {STEPS.length}
            </span>
          </div>
          <h1 className={styles.screenTitle}>{activeStepMeta.title}</h1>
          <p className={styles.screenSubtitle}>{activeStepMeta.sub}</p>
        </div>

        {/* STEP 1: Brand Identity */}
        {activeStepMeta.id === 'identity' && (
          <div className={styles.formCard}>
            <div className={styles.formGroup}>
              <div className={styles.formLabelRow}>
                <label className={styles.formLabel}>Brand Name</label>
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
                <label className={styles.formLabel}>Tagline or Essence</label>
              </div>
              <input
                type="text"
                value={brand.tagline}
                onChange={(e) => updateField('tagline', e.target.value)}
                placeholder="e.g. Conscious luxury and botanical rituals"
                className={styles.inputField}
              />
            </div>

            <div className={styles.formGroup}>
              <div className={styles.formLabelRow}>
                <label className={styles.formLabel}>Industry & Category</label>
              </div>
              <input
                type="text"
                value={brand.category}
                onChange={(e) => updateField('category', e.target.value)}
                placeholder="e.g. Luxury Mindful Skincare & Wellness"
                className={styles.inputField}
              />
            </div>

            <div className={styles.formGroup}>
              <div className={styles.formLabelRow}>
                <label className={styles.formLabel}>Established Year</label>
              </div>
              <input
                type="text"
                value={brand.establishedYear}
                onChange={(e) => updateField('establishedYear', e.target.value)}
                placeholder="e.g. 2020"
                className={styles.inputField}
              />
            </div>
          </div>
        )}

        {/* STEP 2: Studio Origins & Leadership */}
        {activeStepMeta.id === 'origins' && (
          <div className={styles.formCard}>
            <div className={styles.formGroup}>
              <div className={styles.formLabelRow}>
                <label className={styles.formLabel}>Based Out Of</label>
                <span className={styles.formHint}>Studio Location</span>
              </div>
              <input
                type="text"
                value={brand.basedOutOf}
                onChange={(e) => updateField('basedOutOf', e.target.value)}
                placeholder="e.g. Telluride & Denver, Colorado"
                className={styles.inputField}
              />
            </div>

            <div className={styles.formRowTwo}>
              <div className={styles.formGroup}>
                <div className={styles.formLabelRow}>
                  <label className={styles.formLabel}>Founder Name</label>
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
                  <label className={styles.formLabel}>Title / Role</label>
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
                <label className={styles.formLabel}>Founder Quote</label>
              </div>
              <textarea
                value={brand.founderQuote}
                onChange={(e) => updateField('founderQuote', e.target.value)}
                placeholder="e.g. Jihi is the Japanese word for benevolence and compassion..."
                className={styles.textAreaField}
                style={{ minHeight: '75px' }}
              />
            </div>

            <div className={styles.formGroup}>
              <div className={styles.formLabelRow}>
                <label className={styles.formLabel}>Founder Bio</label>
              </div>
              <textarea
                value={brand.founderBio}
                onChange={(e) => updateField('founderBio', e.target.value)}
                placeholder="Background on personal motivation and founding journey."
                className={styles.textAreaField}
                style={{ minHeight: '85px' }}
              />
            </div>
          </div>
        )}

        {/* STEP 3: Story & Tenets */}
        {activeStepMeta.id === 'narrative' && (
          <div className={styles.formCard}>
            <div className={styles.formGroup}>
              <div className={styles.formLabelRow}>
                <label className={styles.formLabel}>About the Brand</label>
                <span className={styles.formHint}>Brand story</span>
              </div>
              <textarea
                value={brand.about}
                onChange={(e) => updateField('about', e.target.value)}
                placeholder="Formulation philosophy, ingredients, and discipline."
                className={styles.textAreaField}
                style={{ minHeight: '100px' }}
              />
            </div>

            <div className={styles.formGroup}>
              <div className={styles.formLabelRow}>
                <label className={styles.formLabel}>Brand Manifesto</label>
              </div>
              <input
                type="text"
                value={brand.mission}
                onChange={(e) => updateField('mission', e.target.value)}
                placeholder="One sentence defining statement"
                className={styles.inputField}
              />
            </div>

            <div className={styles.formGroup}>
              <div className={styles.formLabelRow}>
                <label className={styles.formLabel}>Three Brand Pillars</label>
              </div>

              <div className={styles.mobileStackList}>
                {brand.values.map((val, i) => (
                  <div key={i} className={styles.mobileStackItem}>
                    <div className={styles.stackItemIndex}>Pillar 0{i + 1}</div>
                    <input
                      type="text"
                      value={val.title}
                      onChange={(e) => handleValueChange(i, 'title', e.target.value)}
                      placeholder={`Pillar 0${i + 1} Title`}
                      className={styles.inputField}
                      style={{ marginBottom: '8px' }}
                    />
                    <textarea
                      value={val.description}
                      onChange={(e) => handleValueChange(i, 'description', e.target.value)}
                      placeholder="Description of standard"
                      className={styles.textAreaField}
                      style={{ minHeight: '60px' }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Visual Presence (Cover Image & Profile Image) */}
        {activeStepMeta.id === 'imagery' && (
          <div className={styles.formCard}>
            {/* Cover Panorama */}
            <div className={styles.formGroup}>
              <div className={styles.formLabelRow}>
                <label className={styles.formLabel}>Cover Panorama Banner</label>
                <span className={styles.formHint}>16:9 Landscape Banner</span>
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
                    No cover image selected
                  </div>
                )}

                <div className={styles.mediaActionBar}>
                  <input
                    type="text"
                    value={brand.coverImage}
                    onChange={(e) => updateField('coverImage', e.target.value)}
                    placeholder="Enter Image URL or upload below"
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

            {/* Profile Mark */}
            <div className={styles.formGroup}>
              <div className={styles.formLabelRow}>
                <label className={styles.formLabel}>Profile Emblem / Brand Logo</label>
                <span className={styles.formHint}>1:1 Square Mark</span>
              </div>

              <div className={styles.mobileMediaCard}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  {brand.profileImage ? (
                    <img
                      src={brand.profileImage}
                      alt="Avatar preview"
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
                      No logo
                    </div>
                  )}

                  <div style={{ flex: 1 }}>
                    <div className={styles.mediaActionBar} style={{ marginTop: 0 }}>
                      <input
                        type="text"
                        value={brand.profileImage}
                        onChange={(e) => updateField('profileImage', e.target.value)}
                        placeholder="Image URL"
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

        {/* STEP 5: Products & Formulations (Total Listed Products) */}
        {activeStepMeta.id === 'reach' && (
          <div className={styles.formCard}>
            <div className={styles.formGroup}>
              <div className={styles.formLabelRow}>
                <label className={styles.formLabel}>Listed Products & Formulations</label>
                <span className={styles.formHint}>{validProductsCount} Active</span>
              </div>
              <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>
                Add your signature botanical formulations and hero products to be displayed on your profile dashboard.
              </p>

              <div className={styles.mobileStackList}>
                {brand.products.map((prod, idx) => (
                  <div key={idx} className={styles.mobileStackItem}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div className={styles.stackItemIndex}>Product 0{idx + 1}</div>
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
                          ✕ Remove
                        </button>
                      )}
                    </div>

                    <div className={styles.formRowTwo} style={{ marginBottom: '8px' }}>
                      <input
                        type="text"
                        value={prod.name}
                        onChange={(e) => handleProductChange(idx, 'name', e.target.value)}
                        placeholder="Product Name (e.g. Petal Milk)"
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
                      placeholder="Active botanical ingredients & ritual benefits..."
                      className={styles.textAreaField}
                      style={{ minHeight: '55px', marginBottom: '8px' }}
                    />

                    <input
                      type="text"
                      value={prod.volume || ''}
                      onChange={(e) => handleProductChange(idx, 'volume', e.target.value)}
                      placeholder="Volume (e.g. 30 ml / 1.0 fl oz)"
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
                  marginTop: '12px',
                  padding: '10px 14px',
                  textAlign: 'center',
                  fontWeight: 700,
                  border: '1px dashed #cbd5e1',
                  backgroundColor: '#f8fafc'
                }}
              >
                + Add Another Product / Formulation
              </button>
            </div>

            {/* Official Touchpoints */}
            <div className={styles.formGroup} style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
              <div className={styles.formLabelRow}>
                <label className={styles.formLabel}>Official Touchpoints</label>
              </div>

              <div style={{ marginBottom: '10px' }}>
                <input
                  type="text"
                  value={brand.website}
                  onChange={(e) => updateField('website', e.target.value)}
                  placeholder="Website (e.g. https://jihi.com)"
                  className={styles.inputField}
                />
              </div>

              <div className={styles.formRowTwo}>
                <input
                  type="text"
                  value={brand.instagram}
                  onChange={(e) => updateField('instagram', e.target.value)}
                  placeholder="Instagram (e.g. @jihi_rituals)"
                  className={styles.inputField}
                />
                <input
                  type="text"
                  value={brand.inquiriesEmail}
                  onChange={(e) => updateField('inquiriesEmail', e.target.value)}
                  placeholder="Email (e.g. concierge@jihi.com)"
                  className={styles.inputField}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: Review & Go Live */}
        {activeStepMeta.id === 'review' && (
          <div className={styles.formCard}>
            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '16px',
                marginBottom: '16px'
              }}
            >
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '14px' }}>
                {brand.profileImage ? (
                  <img
                    src={brand.profileImage}
                    alt={brand.name}
                    style={{ width: '52px', height: '52px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #cbd5e1' }}
                  />
                ) : (
                  <div style={{ width: '52px', height: '52px', borderRadius: '8px', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                    {brand.name ? brand.name.slice(0, 1) : 'B'}
                  </div>
                )}
                <div>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#0284c7', fontWeight: 700 }}>
                    {brand.category || 'Category Unset'}
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                    {brand.name || 'Untitled Brand'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    {brand.tagline || 'Ready to go live'}
                  </div>
                </div>
              </div>

              {/* Cover Banner Thumbnail */}
              {brand.coverImage && (
                <div style={{ marginBottom: '12px', borderRadius: '6px', overflow: 'hidden', height: '90px' }}>
                  <img
                    src={brand.coverImage}
                    alt="Cover"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              )}

              {/* 4 Key Dossier Facts */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '10px',
                  paddingTop: '12px',
                  borderTop: '1px solid #e2e8f0'
                }}
              >
                <div>
                  <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Atelier</div>
                  <div style={{ fontSize: '12px', fontWeight: 600 }}>{brand.basedOutOf || '—'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Founder</div>
                  <div style={{ fontSize: '12px', fontWeight: 600 }}>{brand.founderName || '—'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Established</div>
                  <div style={{ fontSize: '12px', fontWeight: 600 }}>{brand.establishedYear || '—'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: '#0284c7', textTransform: 'uppercase', fontWeight: 700 }}>Total Listed Products</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                    {validProductsCount} {validProductsCount === 1 ? 'Product' : 'Products'}
                  </div>
                </div>
              </div>
            </div>

            {/* Go Live Confirmation Box */}
            <div
              style={{
                backgroundColor: '#ecfdf5',
                border: '1px solid #a7f3d0',
                borderRadius: '8px',
                padding: '14px',
                marginBottom: '16px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#065f46', fontWeight: 700, fontSize: '13px', marginBottom: '4px' }}>
                <span className={styles.livePulseDot} />
                Ready to Go Live on Drobe
              </div>
              <p style={{ fontSize: '12px', color: '#047857', lineHeight: 1.45, margin: 0 }}>
                Clicking <strong>&ldquo;Go Live&rdquo;</strong> will publish your profile dashboard immediately, displaying your cover image, profile logo, and {validProductsCount} listed products.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={onResetJihi}
                className={styles.chipBtn}
                style={{ flex: 1, padding: '8px 0', textAlign: 'center' }}
              >
                Reset to Jihi
              </button>
              <button
                type="button"
                onClick={onStartBlank}
                className={styles.chipBtn}
                style={{ flex: 1, padding: '8px 0', textAlign: 'center' }}
              >
                Start Blank
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Mobile Bottom Navigation Bar */}
      <footer className={styles.mobileBottomBar}>
        {currentStep > 0 && (
          <button
            type="button"
            onClick={() => setCurrentStep(currentStep - 1)}
            className={`${styles.actionBtn} ${styles.actionBtnSecondary}`}
          >
            Back
          </button>
        )}

        {currentStep < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={() => setCurrentStep(currentStep + 1)}
            className={`${styles.actionBtn} ${styles.actionBtnAccent}`}
          >
            Continue →
          </button>
        ) : (
          <button
            type="button"
            onClick={onGoLive}
            className={`${styles.actionBtn} ${styles.actionBtnGoLive}`}
          >
            <span className={styles.livePulseDot} style={{ marginRight: '8px' }} />
            Go Live
          </button>
        )}
      </footer>
    </div>
  );
}
