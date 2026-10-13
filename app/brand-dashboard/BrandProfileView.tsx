'use client';

import React from 'react';
import { BrandProfile } from './types';
import AppleGeometricBg from './AppleGeometricBg';
import styles from './brand-dashboard.module.css';

interface BrandProfileViewProps {
  brand: BrandProfile;
  onEditClick: () => void;
  onResetJihi?: () => void;
  onStartNew?: () => void;
}

export default function BrandProfileView({
  brand,
  onEditClick,
  onResetJihi,
  onStartNew
}: BrandProfileViewProps) {
  const activeProducts = brand.products.filter(p => p.name.trim().length > 0);
  const totalProductsCount = activeProducts.length;

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
            ← Studio
          </button>
        </div>

        <div className={styles.mobileHeaderTitle}>
          {brand.name || 'Brand Profile'}
        </div>

        <div className={styles.mobileHeaderRight}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className={styles.livePulseDot} />
            <button
              type="button"
              onClick={onEditClick}
              className={`${styles.textBtn} ${styles.textBtnDark}`}
            >
              Edit
            </button>
          </div>
        </div>
      </header>

      {/* Scrollable Mobile App Body */}
      <div className={styles.mobileContent} style={{ padding: '16px 16px 48px 16px' }}>
        <div className={styles.mobileProfileWrap}>
          {/* Live Status Pill Notification */}
          <div className={styles.dashboardStatusBanner}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className={styles.livePulseDot} />
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#065f46', letterSpacing: '0.02em' }}>
                LIVE ON DROBE
              </span>
            </div>
            <span style={{ fontSize: '11px', color: '#047857', fontWeight: 600 }}>
              Verified Partner Dashboard
            </span>
          </div>

          {/* 1. Cover Banner Card */}
          <div className={styles.mobileProfileCoverCard}>
            {brand.coverImage ? (
              <img
                src={brand.coverImage}
                alt={`${brand.name} Cover Banner`}
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
            <div className={styles.coverBadgeOverlay}>
              Cover Banner
            </div>
          </div>

          {/* 2. Brand Header Card with Profile Image / Avatar */}
          <div className={styles.mobileProfileHeaderCard}>
            <div className={styles.mobileProfileAvatarRow}>
              {brand.profileImage ? (
                <img
                  src={brand.profileImage}
                  alt={`${brand.name} Profile Logo`}
                  className={styles.mobileProfileAvatar}
                />
              ) : (
                <div
                  className={styles.mobileProfileAvatar}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    fontWeight: 800,
                    color: '#0284c7'
                  }}
                >
                  {brand.name ? brand.name.slice(0, 1).toUpperCase() : 'B'}
                </div>
              )}

              <div style={{ flex: 1 }}>
                <div className={styles.mobileProfileCategory}>
                  {brand.category || 'Independent Brand'}
                </div>
                <h1 className={styles.mobileProfileName}>
                  {brand.name || 'Untitled Brand'}
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                  <span style={{ fontSize: '11px', color: '#0284c7', fontWeight: 700 }}>
                    ✓ Verified Partner
                  </span>
                </div>
              </div>
            </div>

            <p className={styles.mobileProfileTagline}>
              {brand.tagline || 'Conscious luxury and botanical formulations crafted with purpose.'}
            </p>

            {/* 3. Primary Metrics Dashboard - Highlighted TOTAL LISTED PRODUCTS */}
            <div className={styles.dashboardMetricsGrid}>
              {/* TOTAL LISTED PRODUCTS METRIC CARD */}
              <div className={styles.metricCardHighlight}>
                <span className={styles.metricCardLabel}>Total Listed Products</span>
                <span className={styles.metricCardValueLarge}>
                  {totalProductsCount}
                </span>
                <span className={styles.metricCardSub}>
                  {totalProductsCount === 1 ? 'Product active' : 'Products active in catalog'}
                </span>
              </div>

              <div className={styles.metricCardStandard}>
                <span className={styles.metricCardLabel}>Store Status</span>
                <span className={styles.metricCardValueGreen}>
                  ● Live
                </span>
                <span className={styles.metricCardSub}>Direct concierge</span>
              </div>

              <div className={styles.metricCardStandard}>
                <span className={styles.metricCardLabel}>Studio Atelier</span>
                <span className={styles.metricCardValueText}>
                  {brand.basedOutOf || 'Global'}
                </span>
                <span className={styles.metricCardSub}>Origin</span>
              </div>

              <div className={styles.metricCardStandard}>
                <span className={styles.metricCardLabel}>Established</span>
                <span className={styles.metricCardValueText}>
                  {brand.establishedYear || '—'}
                </span>
                <span className={styles.metricCardSub}>Heritage</span>
              </div>
            </div>
          </div>

          {/* 4. TOTAL LISTED PRODUCTS SHOWCASE */}
          <section className={styles.mobileSectionCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9' }}>
              <div>
                <h2 className={styles.mobileSectionTitle} style={{ margin: 0, border: 'none', padding: 0 }}>
                  Total Listed Products ({totalProductsCount})
                </h2>
                <span style={{ fontSize: '11px', color: '#64748b' }}>
                  Active catalog formulations visible to customers
                </span>
              </div>
              <button
                type="button"
                onClick={onEditClick}
                className={styles.chipBtn}
                style={{ fontSize: '11px', padding: '4px 10px' }}
              >
                + Add Product
              </button>
            </div>

            {activeProducts.length > 0 ? (
              <div className={styles.mobileProductCatalogList}>
                {activeProducts.map((product, idx) => (
                  <div key={idx} className={styles.catalogProductItem}>
                    <div className={styles.catalogProductHeader}>
                      <div>
                        <span className={styles.catalogProductBadge}>Offering 0{idx + 1}</span>
                        <div className={styles.mobileProductName}>{product.name}</div>
                      </div>
                      <span className={styles.catalogLiveBadge}>Live</span>
                    </div>

                    <div className={styles.mobileProductTagline}>{product.tagline}</div>
                    
                    <p className={styles.mobileProductDesc}>{product.description}</p>
                    
                    {product.volume && (
                      <div className={styles.mobileProductVolumeRow}>
                        <span style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Volume</span>
                        <span className={styles.mobileProductVolume}>{product.volume}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '24px 16px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                No active products listed yet. Click &ldquo;Add Product&rdquo; to showcase your formulations.
              </div>
            )}
          </section>

          {/* 5. Philosophy & Narrative Card */}
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

          {/* 6. Founder Spotlight Card */}
          {(brand.founderName || brand.founderBio || brand.founderQuote) && (
            <section className={styles.mobileSectionCard}>
              <h2 className={styles.mobileSectionTitle}>Founder Spotlight</h2>
              <div style={{ marginBottom: '8px' }}>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b' }}>
                  {brand.founderRole || 'Founder'}
                </div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                  {brand.founderName || 'Founder'}
                </div>
              </div>

              {brand.founderQuote && (
                <div className={styles.founderQuoteMobile}>
                  &ldquo;{brand.founderQuote}&rdquo;
                </div>
              )}

              {brand.founderBio && (
                <p style={{ fontSize: '13px', lineHeight: 1.5, color: '#475569', margin: 0 }}>
                  {brand.founderBio}
                </p>
              )}
            </section>
          )}

          {/* 7. Core Tenets Card */}
          {brand.values && brand.values.length > 0 && (
            <section className={styles.mobileSectionCard}>
              <h2 className={styles.mobileSectionTitle}>Brand Tenets & Pillars</h2>
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

          {/* 8. Touchpoints & Channels Card */}
          <section className={styles.mobileSectionCard}>
            <h2 className={styles.mobileSectionTitle}>Official Touchpoints</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
                  Official Instagram
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#0284c7' }}>
                  {brand.instagram || '—'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b' }}>
                  Flagship Website
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                  {brand.website || '—'}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Sticky Mobile Bottom Bar */}
      <footer className={styles.mobileBottomBar}>
        {onStartNew && (
          <button
            type="button"
            onClick={onStartNew}
            className={`${styles.actionBtn} ${styles.actionBtnSecondary}`}
            style={{ flex: 1 }}
          >
            Start Screen
          </button>
        )}
        <button
          type="button"
          onClick={onEditClick}
          className={`${styles.actionBtn} ${styles.actionBtnAccent}`}
          style={{ flex: 1 }}
        >
          Edit Brand Details
        </button>
      </footer>
    </div>
  );
}
