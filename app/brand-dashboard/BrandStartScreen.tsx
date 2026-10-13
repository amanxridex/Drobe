'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import IPhoneStatusBar from './IPhoneStatusBar';
import { BrandProfile } from './types';
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
  const validProductsCount = brand.products.filter(p => p.name.trim().length > 0).length;

  return (
    <div className={styles.mobileContainer} style={{ backgroundColor: '#ffffff' }}>
      {/* 1. iOS Status Bar with Dynamic Island */}
      <IPhoneStatusBar />

      {/* 2. Top Brand Header */}
      <header className={styles.appTopHeader}>
        <span className={styles.appTopLogo}>DROBE</span>
        <span className={styles.appTopTag}>Brand Studio</span>
      </header>

      {/* 3. Screen Body (Image 2 RonasIT Aesthetic) */}
      <div className={styles.startScreenBody}>
        {/* Top Visual Showcase Card */}
        <div className={styles.startHeroVisualCard}>
          {/* Overlapping Product Pill 1 */}
          <motion.div
            className={styles.floatingProductCard1}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className={styles.floatingThumbBox}>
              <img
                src="/brands/jihi/profile.jpg"
                alt="Product thumb"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#0f172a' }}>Petal Milk Serum</div>
              <div style={{ fontSize: '9px', color: '#64748b' }}>Formulation · 30 ml</div>
            </div>
            <span className={styles.floatingBadgeTag}>$98</span>
          </motion.div>

          {/* Overlapping Product Pill 2 */}
          <motion.div
            className={styles.floatingProductCard2}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className={styles.floatingThumbBox} style={{ backgroundColor: '#fed7aa' }}>
              <span style={{ fontSize: '12px' }}>✦</span>
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#0f172a' }}>Merra Eye Cream</div>
              <div style={{ fontSize: '9px', color: '#64748b' }}>Botanical · 15 ml</div>
            </div>
            <span className={styles.floatingBadgeTag}>$74</span>
          </motion.div>

          {/* Center Brand Monogram Badge */}
          <div className={styles.startCenterEmblem}>
            <span style={{ fontSize: '20px', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em' }}>
              D
            </span>
          </div>
        </div>

        {/* Headline & Pitch Section */}
        <div className={styles.startTextSection}>
          <div className={styles.startPillEyebrow}>
            PARTNER PROGRAM
          </div>

          <h1 className={styles.startBigHeading}>
            Start your new<br />Brand Journey
          </h1>

          <p className={styles.startLeadText}>
            Showcase your conscious luxury formulas and atelier story directly to discerning clients.
          </p>

          {/* 3 Value Points */}
          <div className={styles.startFeatureRow}>
            <div className={styles.startFeatureItem}>
              <CheckCircle2 size={13} color="#059669" />
              <span>Instant Live</span>
            </div>
            <div className={styles.startFeatureItem}>
              <CheckCircle2 size={13} color="#059669" />
              <span>Cover Banner</span>
            </div>
            <div className={styles.startFeatureItem}>
              <CheckCircle2 size={13} color="#059669" />
              <span>Direct Inquiries</span>
            </div>
          </div>

          {/* If already active */}
          {isAlreadyLive && (
            <div className={styles.activeBrandBar} onClick={onViewLiveDashboard}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className={styles.livePulseDot} />
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>{brand.name}</span>
                <span style={{ fontSize: '11px', color: '#64748b' }}>({validProductsCount} products)</span>
              </div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#0284c7' }}>View Live →</span>
            </div>
          )}
        </div>

        {/* Action Button Section */}
        <div className={styles.startActionSection}>
          <button
            type="button"
            onClick={onStartOnboarding}
            className={styles.ronasBlackPillBtn}
          >
            {isAlreadyLive ? 'Edit Brand Details' : 'Get Started'}
            <ArrowRight size={16} />
          </button>

          {isAlreadyLive && (
            <button
              type="button"
              onClick={onViewLiveDashboard}
              className={styles.ronasOutlinePillBtn}
            >
              Open Live Dashboard
            </button>
          )}

          <div style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'center', marginTop: '10px' }}>
            Curated brand placement · Zero listing fees
          </div>
        </div>
      </div>
    </div>
  );
}
