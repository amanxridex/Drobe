'use client';

import React from 'react';
import { BrandProfile } from './types';
import AppleGeometricBg from './AppleGeometricBg';
import styles from './brand-dashboard.module.css';

interface BrandProfileViewProps {
  brand: BrandProfile;
  onEditClick: () => void;
  onResetJihi?: () => void;
}

export default function BrandProfileView({
  brand,
  onEditClick,
  onResetJihi
}: BrandProfileViewProps) {
  return (
    <div className={styles.mobileContainer}>
      {/* Code-driven Geometric Apple Background */}
      <AppleGeometricBg />

      {/* iOS-Style Sticky Mobile Top Header */}
      <header className={styles.mobileHeader}>
        <div className={styles.mobileHeaderLeft}>
          <button
            type="button"
            onClick={onEditClick}
            className={styles.textBtn}
          >
            Studio
          </button>
        </div>

        <div className={styles.mobileHeaderTitle}>
          {brand.name || 'Brand Profile'}
        </div>

        <div className={styles.mobileHeaderRight}>
          <button
            type="button"
            onClick={onEditClick}
            className={`${styles.textBtn} ${styles.textBtnDark}`}
          >
            Edit
          </button>
        </div>
      </header>

      {/* Scrollable Mobile App Body */}
      <div className={styles.mobileContent} style={{ padding: '16px 16px 36px 16px' }}>
        <div className={styles.mobileProfileWrap}>
          {/* Cover Banner Card */}
          <div className={styles.mobileProfileCoverCard}>
            {brand.coverImage ? (
              <img
                src={brand.coverImage}
                alt={`${brand.name} Cover`}
                className={styles.mobileProfileCover}
              />
            ) : (
              <div
                className={styles.mobileProfileCover}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  color: '#64748b'
                }}
              >
                No cover image provided
              </div>
            )}
          </div>

          {/* Brand Header Card */}
          <div className={styles.mobileProfileHeaderCard}>
            <div className={styles.mobileProfileAvatarRow}>
              {brand.profileImage ? (
                <img
                  src={brand.profileImage}
                  alt={`${brand.name} Mark`}
                  className={styles.mobileProfileAvatar}
                />
              ) : (
                <div
                  className={styles.mobileProfileAvatar}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '22px',
                    fontWeight: 700,
                    color: '#64748b'
                  }}
                >
                  {brand.name ? brand.name.slice(0, 1).toUpperCase() : 'B'}
                </div>
              )}

              <div>
                <div className={styles.mobileProfileCategory}>
                  {brand.category || 'Independent Brand'}
                </div>
                <h1 className={styles.mobileProfileName}>
                  {brand.name || 'Untitled Brand'}
                </h1>
              </div>
            </div>

            <p className={styles.mobileProfileTagline}>
              {brand.tagline || 'No defining tagline specified.'}
            </p>

            {/* Compact 2x2 Fact Grid */}
            <div className={styles.mobileFactGrid}>
              <div className={styles.mobileFactItem}>
                <span className={styles.mobileFactLabel}>Atelier</span>
                <span className={styles.mobileFactValue}>{brand.basedOutOf || 'Global'}</span>
              </div>
              <div className={styles.mobileFactItem}>
                <span className={styles.mobileFactLabel}>Founder</span>
                <span className={styles.mobileFactValue}>{brand.founderName || 'Undisclosed'}</span>
              </div>
              <div className={styles.mobileFactItem}>
                <span className={styles.mobileFactLabel}>Established</span>
                <span className={styles.mobileFactValue}>{brand.establishedYear || '—'}</span>
              </div>
              <div className={styles.mobileFactItem}>
                <span className={styles.mobileFactLabel}>Flagship</span>
                <span className={styles.mobileFactValue}>
                  {brand.website ? brand.website.replace(/^https?:\/\//, '') : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Philosophy & Narrative Card */}
          <section className={styles.mobileSectionCard}>
            <h2 className={styles.mobileSectionTitle}>Philosophy & Narrative</h2>
            <p className={styles.mobileBodyText}>
              {brand.about || 'No narrative story submitted.'}
            </p>
            {brand.mission && (
              <div className={styles.mobileManifestoCard}>
                <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#0284c7', marginBottom: '3px' }}>
                  Manifesto
                </div>
                {brand.mission}
              </div>
            )}
          </section>

          {/* Founder Spotlight Card */}
          {(brand.founderName || brand.founderBio || brand.founderQuote) && (
            <section className={styles.mobileSectionCard}>
              <h2 className={styles.mobileSectionTitle}>Founder Spotlight</h2>
              <div style={{ marginBottom: '6px' }}>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b' }}>
                  {brand.founderRole || 'Founder'}
                </div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                  {brand.founderName || 'Founder'}
                </div>
              </div>

              {brand.founderQuote && (
                <div className={styles.founderQuoteMobile}>
                  &ldquo;{brand.founderQuote}&rdquo;
                </div>
              )}

              {brand.founderBio && (
                <p style={{ fontSize: '13px', lineHeight: 1.5, color: '#475569' }}>
                  {brand.founderBio}
                </p>
              )}
            </section>
          )}

          {/* Core Tenets Card */}
          {brand.values && brand.values.length > 0 && (
            <section className={styles.mobileSectionCard}>
              <h2 className={styles.mobileSectionTitle}>Brand Tenets</h2>
              <div>
                {brand.values.map((val, idx) => (
                  <div key={idx} className={styles.mobileValueCard}>
                    <div className={styles.mobileValueIndex}>Pillar 0{idx + 1}</div>
                    <div className={styles.mobileValueTitle}>{val.title || `Pillar 0${idx + 1}`}</div>
                    <p className={styles.mobileValueDesc}>{val.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Signature Formulations Card */}
          {brand.products && brand.products.filter(p => p.name).length > 0 && (
            <section className={styles.mobileSectionCard}>
              <h2 className={styles.mobileSectionTitle}>Signature Formulations</h2>
              <div>
                {brand.products.filter(p => p.name).map((product, idx) => (
                  <div key={idx} className={styles.mobileProductCard}>
                    <div className={styles.mobileProductName}>{product.name}</div>
                    <div className={styles.mobileProductTagline}>{product.tagline}</div>
                    <p className={styles.mobileProductDesc}>{product.description}</p>
                    {product.volume && (
                      <div className={styles.mobileProductVolume}>{product.volume}</div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Touchpoints Card */}
          <section className={styles.mobileSectionCard}>
            <h2 className={styles.mobileSectionTitle}>Official Channels</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b' }}>
                  Direct Concierge
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                  {brand.inquiriesEmail || 'concierge@brand.com'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b' }}>
                  Social Handle
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                  {brand.instagram || '—'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b' }}>
                  Verification
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#0284c7' }}>
                  Verified Partner · {brand.status}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Sticky Mobile Bottom Bar */}
      <footer className={styles.mobileBottomBar}>
        {onResetJihi && (
          <button
            type="button"
            onClick={onResetJihi}
            className={`${styles.actionBtn} ${styles.actionBtnSecondary}`}
            style={{ flex: 'none' }}
          >
            Jihi
          </button>
        )}
        <button
          type="button"
          onClick={onEditClick}
          className={`${styles.actionBtn} ${styles.actionBtnAccent}`}
        >
          Edit Brand Profile
        </button>
      </footer>
    </div>
  );
}
