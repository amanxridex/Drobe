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
  const isAlreadyLive = brand.status === 'Published' && Boolean(brand.name?.trim());

  return (
    <div className={styles.mobileContainer}>
      {/* Code-driven Geometric Apple Background */}
      <AppleGeometricBg />

      {/* Minimal Top Header */}
      <header className={styles.minimalHeader}>
        <span className={styles.minimalLogo}>DROBE</span>
        {isAlreadyLive ? (
          <button
            type="button"
            onClick={onViewLiveDashboard}
            className={styles.minimalLiveChip}
          >
            <span className={styles.livePulseDot} />
            live dashboard
          </button>
        ) : (
          <span className={styles.minimalSubChip}>brand studio</span>
        )}
      </header>

      {/* Cute & Minimal Centered Hero */}
      <div className={styles.cuteCenterContainer}>
        <motion.div
          className={styles.cuteCard}
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Cute Floating Brand Icon */}
          <motion.div
            className={styles.cuteIconWrapper}
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className={styles.cuteIconBox}>
              ✨
            </div>
          </motion.div>

          <span className={styles.cuteTag}>
            PARTNER ONBOARDING
          </span>

          <h1 className={styles.cuteTitle}>
            List your brand.
          </h1>

          <p className={styles.cuteSubtitle}>
            Create your aesthetic profile, add your signature formulations, and go live on Drobe.
          </p>

          {/* 3 Cute Mini Badges */}
          <div className={styles.cutePillRow}>
            <span className={styles.cutePill}>⚡ 2 min setup</span>
            <span className={styles.cutePill}>🖼️ cover banner</span>
            <span className={styles.cutePill}>✨ instant live</span>
          </div>

          {/* If already live: show cute mini preview */}
          {isAlreadyLive && (
            <div className={styles.cutePreviewPill}>
              <span className={styles.livePulseDot} />
              <span style={{ fontWeight: 600, color: '#0f172a' }}>{brand.name}</span>
              <span style={{ color: '#64748b' }}>is currently live</span>
            </div>
          )}

          {/* Big Cute CTA Button */}
          <motion.button
            type="button"
            onClick={onStartOnboarding}
            className={styles.cutePrimaryBtn}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            {isAlreadyLive ? 'Edit your profile →' : 'Start onboarding ✨'}
          </motion.button>

          <p className={styles.cuteFooterNote}>
            join 100+ curated luxury brands on Drobe
          </p>
        </motion.div>
      </div>
    </div>
  );
}
