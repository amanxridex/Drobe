'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BrandProfile } from './types';
import AppleGeometricBg from './AppleGeometricBg';
import styles from './brand-dashboard.module.css';

interface BrandStartScreenProps {
  brand: BrandProfile;
  onStartOnboarding: () => void;
  onViewLiveDashboard: () => void;
}

export default function BrandStartScreen({
  brand,
  onStartOnboarding,
  onViewLiveDashboard
}: BrandStartScreenProps) {
  const isAlreadyLive = brand.status === 'Published' && Boolean(brand.name.trim());
  const validProductsCount = brand.products.filter(p => p.name.trim().length > 0).length;

  return (
    <div className={styles.mobileContainer}>
      {/* Code-driven Geometric Apple Background */}
      <AppleGeometricBg />

      {/* Production Top Header */}
      <header className={styles.mobileHeader}>
        <div className={styles.mobileHeaderLeft}>
          <span style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '0.08em', color: '#0f172a' }}>
            DROBE
          </span>
        </div>

        <div className={styles.mobileHeaderTitle}>
          Partner Portal
        </div>

        <div className={styles.mobileHeaderRight}>
          {isAlreadyLive ? (
            <button
              type="button"
              onClick={onViewLiveDashboard}
              className={`${styles.textBtn} ${styles.textBtnDark}`}
              style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              <span className={styles.livePulseDot} />
              Live Dashboard
            </button>
          ) : (
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
              Partner Access
            </span>
          )}
        </div>
      </header>

      {/* Scrollable Animated Content */}
      <div className={styles.mobileContent} style={{ padding: '20px 16px 40px 16px' }}>
        {/* Main Hero Card with Cinematic Framer Motion Entrance */}
        <motion.div
          className={styles.startHeroCard}
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Animated Monogram / Logo Mark */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '12px',
              backgroundColor: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '22px',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              marginBottom: '16px',
              boxShadow: '0 8px 24px rgba(15, 23, 42, 0.18)'
            }}
          >
            D
          </motion.div>

          <motion.div
            className={styles.startBadgeRow}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.4 }}
          >
            <span className={styles.startCategoryBadge}>Official Partner Program</span>
            {isAlreadyLive ? (
              <span className={styles.startLiveBadge}>
                <span className={styles.livePulseDot} />
                Live on Drobe
              </span>
            ) : (
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                Invitation & Open Enrollment
              </span>
            )}
          </motion.div>

          <motion.h1
            className={styles.startHeroTitle}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            List Your Brand on Drobe
          </motion.h1>

          <motion.p
            className={styles.startHeroSubtitle}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38, duration: 0.5 }}
          >
            Join an exclusive community of luxury formulators, botanical wellness ateliers, and conscious fashion houses. Showcase your signature products directly to discerning clientele worldwide.
          </motion.p>

          {/* If Brand is already saved/live */}
          {isAlreadyLive && (
            <motion.div
              className={styles.startBrandPreviewBox}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.42, duration: 0.4 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {brand.profileImage ? (
                  <img
                    src={brand.profileImage}
                    alt={brand.name}
                    className={styles.startBrandAvatar}
                  />
                ) : (
                  <div className={styles.startBrandAvatarFallback}>
                    {brand.name ? brand.name.slice(0, 1).toUpperCase() : 'B'}
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                      {brand.name}
                    </div>
                    <span className={styles.catalogLiveBadge}>Active</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                    {validProductsCount} Listed {validProductsCount === 1 ? 'Product' : 'Products'} · {brand.basedOutOf || 'Global'}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Primary High-Impact "Start Onboarding" Action Button */}
          <motion.button
            type="button"
            onClick={onStartOnboarding}
            className={styles.startPrimaryBtn}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.4 }}
          >
            {isAlreadyLive ? 'Edit Brand & Catalog →' : 'Start Onboarding →'}
          </motion.button>
        </motion.div>

        {/* 3 Value Pillars */}
        <motion.div
          className={styles.startJourneyCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <div className={styles.journeyHeader}>
            <span className={styles.journeyEyebrow}>How Listing Works</span>
            <h2 className={styles.journeyTitle}>Three Steps to Go Live</h2>
          </div>

          <div className={styles.journeyStepsList}>
            <div className={styles.journeyStepItem}>
              <div className={styles.journeyStepNumber}>01</div>
              <div className={styles.journeyStepContent}>
                <div className={styles.journeyStepHeading}>Curate Your Brand Story</div>
                <div className={styles.journeyStepDesc}>
                  Enter your brand name, atelier origins, founder background, and formulation philosophy.
                </div>
              </div>
            </div>

            <div className={styles.journeyStepItem}>
              <div className={styles.journeyStepNumber}>02</div>
              <div className={styles.journeyStepContent}>
                <div className={styles.journeyStepHeading}>Upload Editorial Visuals</div>
                <div className={styles.journeyStepDesc}>
                  Feature your 16:9 panoramic cover banner and high-resolution profile mark.
                </div>
              </div>
            </div>

            <div className={styles.journeyStepItem}>
              <div className={styles.journeyStepNumber}>03</div>
              <div className={styles.journeyStepContent}>
                <div className={styles.journeyStepHeading}>List Offerings & Go Live</div>
                <div className={styles.journeyStepDesc}>
                  Add signature formulations with volumes, then tap &ldquo;Go Live&rdquo; for instant dashboard launch.
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enterprise Security & Payout Assurance */}
        <motion.div
          className={styles.startBenefitsCard}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#0284c7', marginBottom: '8px' }}>
            Production Standards
          </div>
          <div className={styles.startBenefitRow}>
            <div className={styles.startBenefitDot}>✓</div>
            <div className={styles.startBenefitText}>
              <strong>Direct Client Concierge:</strong> Customer orders and inquiries route directly to your team without third-party interference.
            </div>
          </div>
          <div className={styles.startBenefitRow}>
            <div className={styles.startBenefitDot}>✓</div>
            <div className={styles.startBenefitText}>
              <strong>Live Profile Dashboard:</strong> Access your real-time cover banner, active product count, and catalog metrics.
            </div>
          </div>
          <div className={styles.startBenefitRow}>
            <div className={styles.startBenefitDot}>✓</div>
            <div className={styles.startBenefitText}>
              <strong>Zero Listing Fees:</strong> Keep 100% brand sovereignty and manage products on your own terms.
            </div>
          </div>
        </motion.div>
      </div>

      {/* Sticky Bottom Bar */}
      <footer className={styles.mobileBottomBar}>
        {isAlreadyLive && (
          <button
            type="button"
            onClick={onViewLiveDashboard}
            className={`${styles.actionBtn} ${styles.actionBtnSecondary}`}
            style={{ flex: 1 }}
          >
            Live Dashboard
          </button>
        )}
        <button
          type="button"
          onClick={onStartOnboarding}
          className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
          style={{ flex: 1 }}
        >
          Start Onboarding
        </button>
      </footer>
    </div>
  );
}
