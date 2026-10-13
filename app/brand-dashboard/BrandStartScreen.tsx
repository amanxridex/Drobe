'use client';

import React from 'react';
import { BrandProfile } from './types';
import AppleGeometricBg from './AppleGeometricBg';
import styles from './brand-dashboard.module.css';

interface BrandStartScreenProps {
  brand: BrandProfile;
  onStart: () => void;
  onLoadJihi: () => void;
  onStartBlank: () => void;
  onViewLiveProfile: () => void;
}

export default function BrandStartScreen({
  brand,
  onStart,
  onLoadJihi,
  onStartBlank,
  onViewLiveProfile
}: BrandStartScreenProps) {
  const isLive = brand.status === 'Published';
  const totalProducts = brand.products.filter(p => p.name.trim().length > 0).length;

  return (
    <div className={styles.mobileContainer}>
      {/* Code-driven Geometric Apple Background */}
      <AppleGeometricBg />

      {/* iOS-Style Sticky Top Navigation */}
      <header className={styles.mobileHeader}>
        <div className={styles.mobileHeaderLeft}>
          <span style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '0.06em', color: '#0f172a' }}>
            DROBE
          </span>
        </div>

        <div className={styles.mobileHeaderTitle}>
          Brand Studio
        </div>

        <div className={styles.mobileHeaderRight}>
          {isLive ? (
            <button
              type="button"
              onClick={onViewLiveProfile}
              className={`${styles.textBtn} ${styles.textBtnDark}`}
              style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
              Live Profile
            </button>
          ) : (
            <button
              type="button"
              onClick={onLoadJihi}
              className={styles.textBtn}
            >
              Load Demo
            </button>
          )}
        </div>
      </header>

      {/* Scrollable Mobile Content */}
      <div className={styles.mobileContent}>
        {/* Main Hero Card */}
        <div className={styles.startHeroCard}>
          <div className={styles.startBadgeRow}>
            <span className={styles.startCategoryBadge}>Partner Onboarding</span>
            {isLive && (
              <span className={styles.startLiveBadge}>
                <span className={styles.livePulseDot} />
                Live on Drobe
              </span>
            )}
          </div>

          <h1 className={styles.startHeroTitle}>
            List Your Brand
          </h1>
          <p className={styles.startHeroSubtitle}>
            Partner with Drobe to introduce your conscious formulations, luxury craftsmanship, and brand story directly to discerning clients.
          </p>

          {/* Quick Metrics if live or previewing */}
          {brand.name && (
            <div className={styles.startBrandPreviewBox}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {brand.profileImage ? (
                  <img
                    src={brand.profileImage}
                    alt={brand.name}
                    className={styles.startBrandAvatar}
                  />
                ) : (
                  <div className={styles.startBrandAvatarFallback}>
                    {brand.name.slice(0, 1)}
                  </div>
                )}
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                    {brand.name}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    {totalProducts} Listed {totalProducts === 1 ? 'Product' : 'Products'} · {brand.category || 'Independent Brand'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Big Start Button */}
          <button
            type="button"
            onClick={onStart}
            className={styles.startPrimaryBtn}
          >
            {brand.name ? 'Start / Edit Brand Details →' : 'Start Listing Your Brand →'}
          </button>

          {/* Secondary Quick Action Options */}
          <div className={styles.startPresetRow}>
            <button
              type="button"
              onClick={onLoadJihi}
              className={styles.startSecondaryBtn}
            >
              Try with Jihi Demo
            </button>
            <button
              type="button"
              onClick={onStartBlank}
              className={styles.startSecondaryBtn}
            >
              Start Blank
            </button>
          </div>
        </div>

        {/* 4 Steps Journey Overview Card */}
        <div className={styles.startJourneyCard}>
          <div className={styles.journeyHeader}>
            <span className={styles.journeyEyebrow}>Simple 5-Step Process</span>
            <h2 className={styles.journeyTitle}>What You Will Set Up</h2>
          </div>

          <div className={styles.journeyStepsList}>
            <div className={styles.journeyStepItem}>
              <div className={styles.journeyStepNumber}>01</div>
              <div className={styles.journeyStepContent}>
                <div className={styles.journeyStepHeading}>Brand Identity & Heritage</div>
                <div className={styles.journeyStepDesc}>
                  Brand name, luxury category, studio origins, and founding year.
                </div>
              </div>
            </div>

            <div className={styles.journeyStepItem}>
              <div className={styles.journeyStepNumber}>02</div>
              <div className={styles.journeyStepContent}>
                <div className={styles.journeyStepHeading}>Founder Story & Philosophy</div>
                <div className={styles.journeyStepDesc}>
                  Narrative bio, founder ethos, manifesto, and 3 core brand pillars.
                </div>
              </div>
            </div>

            <div className={styles.journeyStepItem}>
              <div className={styles.journeyStepNumber}>03</div>
              <div className={styles.journeyStepContent}>
                <div className={styles.journeyStepHeading}>Visual Presence & Media</div>
                <div className={styles.journeyStepDesc}>
                  Editorial 16:9 cover panorama banner and square profile emblem.
                </div>
              </div>
            </div>

            <div className={styles.journeyStepItem}>
              <div className={styles.journeyStepNumber}>04</div>
              <div className={styles.journeyStepContent}>
                <div className={styles.journeyStepHeading}>Curated Products & Offerings</div>
                <div className={styles.journeyStepDesc}>
                  Signature formulations, volumes, and active ingredient highlights.
                </div>
              </div>
            </div>

            <div className={styles.journeyStepItem}>
              <div className={styles.journeyStepNumber}>05</div>
              <div className={styles.journeyStepContent}>
                <div className={styles.journeyStepHeading}>Go Live Instantly</div>
                <div className={styles.journeyStepDesc}>
                  Review your dossier and click &ldquo;Go Live&rdquo; to launch your live profile dashboard.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Partner Placement Guarantee Card */}
        <div className={styles.startBenefitsCard}>
          <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#0284c7', marginBottom: '8px' }}>
            Why Brands List on Drobe
          </div>
          <div className={styles.startBenefitRow}>
            <div className={styles.startBenefitDot}>✦</div>
            <div className={styles.startBenefitText}>
              <strong>Direct Concierge Inquiries:</strong> Discerning clients reach your team directly without intermediaries.
            </div>
          </div>
          <div className={styles.startBenefitRow}>
            <div className={styles.startBenefitDot}>✦</div>
            <div className={styles.startBenefitText}>
              <strong>Complete Profile Dashboard:</strong> Live view with cover banner, profile mark, and total listed products count.
            </div>
          </div>
          <div className={styles.startBenefitRow}>
            <div className={styles.startBenefitDot}>✦</div>
            <div className={styles.startBenefitText}>
              <strong>Immediate Verification:</strong> No waiting period; publish directly with active partner status.
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <footer className={styles.mobileBottomBar}>
        {isLive && (
          <button
            type="button"
            onClick={onViewLiveProfile}
            className={`${styles.actionBtn} ${styles.actionBtnSecondary}`}
            style={{ flex: 1 }}
          >
            View Live Dashboard
          </button>
        )}
        <button
          type="button"
          onClick={onStart}
          className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
          style={{ flex: 1 }}
        >
          Start
        </button>
      </footer>
    </div>
  );
}
