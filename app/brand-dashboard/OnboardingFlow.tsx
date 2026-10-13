'use client';

import React, { useState } from 'react';
import { BrandProfile } from './types';
import AppleGeometricBg from './AppleGeometricBg';
import styles from './brand-dashboard.module.css';

interface OnboardingFlowProps {
  brand: BrandProfile;
  onChange: (updated: BrandProfile) => void;
  onPublish: () => void;
  onResetJihi: () => void;
  onStartBlank: () => void;
  onViewProfileTab: () => void;
}

const STEPS = [
  { id: 'identity', title: 'Brand Identity', sub: 'Foundational name, category & year' },
  { id: 'origins', title: 'Studio Origins', sub: 'Location & founder leadership' },
  { id: 'narrative', title: 'Story & Ethos', sub: 'Brand narrative & guiding tenets' },
  { id: 'imagery', title: 'Visual Presence', sub: 'Editorial banner & emblem' },
  { id: 'reach', title: 'Touchpoints', sub: 'Channels & signature highlights' },
  { id: 'review', title: 'Review & Publish', sub: 'Final dossier verification' }
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
  onPublish,
  onResetJihi,
  onStartBlank,
  onViewProfileTab
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
              Back
            </button>
          ) : (
            <button
              type="button"
              onClick={onResetJihi}
              className={`${styles.textBtn} ${styles.textBtnDark}`}
            >
              Load Jihi
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
            Live View
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
          <span className={styles.stepBadge}>Section 0{currentStep + 1}</span>
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

        {/* STEP 4: Visual Presence */}
        {activeStepMeta.id === 'imagery' && (
          <div className={styles.formCard}>
            {/* Cover Panorama */}
            <div className={styles.formGroup}>
              <div className={styles.formLabelRow}>
                <label className={styles.formLabel}>Cover Panorama Banner</label>
                <span className={styles.formHint}>16:9 Landscape</span>
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
                    No cover image
                  </div>
                )}

                <div className={styles.mediaActionBar}>
                  <input
                    type="text"
                    value={brand.coverImage}
                    onChange={(e) => updateField('coverImage', e.target.value)}
                    placeholder="Image URL"
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
                <label className={styles.formLabel}>Profile Emblem / Portrait</label>
                <span className={styles.formHint}>1:1 Square</span>
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
                      No icon
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

        {/* STEP 5: Touchpoints & Signature Items */}
        {activeStepMeta.id === 'reach' && (
          <div className={styles.formCard}>
            <div className={styles.formGroup}>
              <div className={styles.formLabelRow}>
                <label className={styles.formLabel}>Official Website</label>
              </div>
              <input
                type="text"
                value={brand.website}
                onChange={(e) => updateField('website', e.target.value)}
                placeholder="https://jihi.com"
                className={styles.inputField}
              />
            </div>

            <div className={styles.formRowTwo}>
              <div className={styles.formGroup}>
                <div className={styles.formLabelRow}>
                  <label className={styles.formLabel}>Instagram</label>
                </div>
                <input
                  type="text"
                  value={brand.instagram}
                  onChange={(e) => updateField('instagram', e.target.value)}
                  placeholder="@jihi_rituals"
                  className={styles.inputField}
                />
              </div>

              <div className={styles.formGroup}>
                <div className={styles.formLabelRow}>
                  <label className={styles.formLabel}>Inquiries Email</label>
                </div>
                <input
                  type="text"
                  value={brand.inquiriesEmail}
                  onChange={(e) => updateField('inquiriesEmail', e.target.value)}
                  placeholder="concierge@jihi.com"
                  className={styles.inputField}
                />
              </div>
            </div>

            {/* Signature Products */}
            <div className={styles.formGroup}>
              <div className={styles.formLabelRow}>
                <label className={styles.formLabel}>Signature Hero Highlights</label>
              </div>

              <div className={styles.mobileStackList}>
                {brand.products.map((prod, idx) => (
                  <div key={idx} className={styles.mobileStackItem}>
                    <div className={styles.stackItemIndex}>Offering 0{idx + 1}</div>
                    <div className={styles.formRowTwo} style={{ marginBottom: '8px' }}>
                      <input
                        type="text"
                        value={prod.name}
                        onChange={(e) => handleProductChange(idx, 'name', e.target.value)}
                        placeholder="Product Name"
                        className={styles.inputField}
                      />
                      <input
                        type="text"
                        value={prod.tagline}
                        onChange={(e) => handleProductChange(idx, 'tagline', e.target.value)}
                        placeholder="Tagline"
                        className={styles.inputField}
                      />
                    </div>
                    <textarea
                      value={prod.description}
                      onChange={(e) => handleProductChange(idx, 'description', e.target.value)}
                      placeholder="Botanical active formulation"
                      className={styles.textAreaField}
                      style={{ minHeight: '55px', marginBottom: '8px' }}
                    />
                    <input
                      type="text"
                      value={prod.volume || ''}
                      onChange={(e) => handleProductChange(idx, 'volume', e.target.value)}
                      placeholder="Volume (e.g. 30 ml)"
                      className={styles.inputField}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: Review & Finalize */}
        {activeStepMeta.id === 'review' && (
          <div className={styles.formCard}>
            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '16px'
              }}
            >
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '14px' }}>
                {brand.profileImage ? (
                  <img
                    src={brand.profileImage}
                    alt={brand.name}
                    style={{ width: '48px', height: '48px', borderRadius: '6px', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ width: '48px', height: '48px', borderRadius: '6px', backgroundColor: '#e2e8f0' }} />
                )}
                <div>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#0284c7' }}>
                    {brand.category || 'Category Unset'}
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
                    {brand.name || 'Untitled Brand'}
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px',
                  paddingTop: '12px',
                  borderTop: '1px solid #e2e8f0'
                }}
              >
                <div>
                  <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>Atelier</div>
                  <div style={{ fontSize: '12px', fontWeight: 600 }}>{brand.basedOutOf || '—'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>Founder</div>
                  <div style={{ fontSize: '12px', fontWeight: 600 }}>{brand.founderName || '—'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>Established</div>
                  <div style={{ fontSize: '12px', fontWeight: 600 }}>{brand.establishedYear || '—'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>Offerings</div>
                  <div style={{ fontSize: '12px', fontWeight: 600 }}>{brand.products.filter(p => p.name).length} Items</div>
                </div>
              </div>
            </div>

            <div className={styles.formGroup}>
              <div className={styles.formLabelRow}>
                <label className={styles.formLabel}>Publish Status</label>
              </div>
              <select
                value={brand.status}
                onChange={(e) => updateField('status', e.target.value as any)}
                className={styles.selectField}
              >
                <option value="Published">Published (Active Partner)</option>
                <option value="Draft">Draft (Internal Only)</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
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
            Continue
          </button>
        ) : (
          <button
            type="button"
            onClick={onPublish}
            className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
          >
            Publish Brand Profile
          </button>
        )}
      </footer>
    </div>
  );
}
