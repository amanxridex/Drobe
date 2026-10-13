'use client';

import React from 'react';
import { motion } from 'framer-motion';
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
    <div className={styles.screen1Container}>
      {/* 1. Minimal Top Header */}
      <header className={styles.screen1TopHeader}>
        <span className={styles.screen1LogoText}>drobe</span>
      </header>

      {/* 2. Top Visual: Avatars + Floating Gradient Product Pills */}
      <div className={styles.screen1VisualArea}>
        {/* Row of 3 Founder/Creative Avatars */}
        <div className={styles.screen1AvatarRow}>
          <div className={styles.screen1AvatarCircle}>
            <img
              src="/brands/jihi/profile.jpg"
              alt="Jenn Bernstein"
              className={styles.screen1AvatarImg}
            />
          </div>
          <div className={styles.screen1AvatarCircle} style={{ transform: 'scale(1.08)', zIndex: 2 }}>
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
              alt="Creative Lead"
              className={styles.screen1AvatarImg}
            />
          </div>
          <div className={styles.screen1AvatarCircle}>
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80"
              alt="Partner Formulator"
              className={styles.screen1AvatarImg}
            />
          </div>
        </div>

        {/* Floating Stacked Product Pills (Exact match to Satya / Jay / Rico in Image) */}
        <div className={styles.screen1PillsStack}>
          {/* Pill 1: Orange/Amber Gradient */}
          <motion.div
            className={styles.screen1PillOrange}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className={styles.screen1PillLeft}>
              <div className={styles.screen1PillAvatar}>
                <img src="/brands/jihi/profile.jpg" alt="" />
              </div>
              <div className={styles.screen1PillInfo}>
                <span className={styles.screen1PillName}>Petal Milk</span>
                <span className={styles.screen1PillPrice}>$98.00</span>
              </div>
            </div>
            <span className={styles.screen1PillActionOrange}>Live</span>
          </motion.div>

          {/* Pill 2: Silver/Platinum Gradient */}
          <motion.div
            className={styles.screen1PillSilver}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 }}
          >
            <div className={styles.screen1PillLeft}>
              <div className={styles.screen1PillAvatar}>
                <span style={{ fontSize: '11px', fontWeight: 800 }}>M</span>
              </div>
              <div className={styles.screen1PillInfo}>
                <span className={styles.screen1PillName}>Merra Cream</span>
                <span className={styles.screen1PillPrice}>$74.00</span>
              </div>
            </div>
            <span className={styles.screen1PillActionSilver}>Live</span>
          </motion.div>

          {/* Pill 3: Electric Cyan Gradient */}
          <motion.div
            className={styles.screen1PillCyan}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.16 }}
          >
            <div className={styles.screen1PillLeft}>
              <div className={styles.screen1PillAvatar}>
                <span style={{ fontSize: '11px', fontWeight: 800 }}>R</span>
              </div>
              <div className={styles.screen1PillInfo}>
                <span className={styles.screen1PillName}>Reverie Balm</span>
                <span className={styles.screen1PillPrice}>$86.00</span>
              </div>
            </div>
            <span className={styles.screen1PillActionCyan}>Live</span>
          </motion.div>
        </div>

        {/* Center Star Emblem Badge (Exact 1:1 match to center badge in Image) */}
        <div className={styles.screen1CenterBadge}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2L13.8 9.2L21 11L13.8 12.8L12 20L10.2 12.8L3 11L10.2 9.2L12 2Z"
              fill="#ffffff"
            />
          </svg>
        </div>
      </div>

      {/* 3. Middle Content: Apple SF Typography */}
      <div className={styles.screen1TextSection}>
        <h1 className={styles.screen1Title}>
          Start your new<br />Brand Jrny
        </h1>

        <p className={styles.screen1Subtext}>
          Post, showcase, and connect your conscious luxury atelier with discerning clients that bring good vibes only.
        </p>
      </div>

      {/* 4. Bottom Action Buttons */}
      <div className={styles.screen1BottomSection}>
        <button
          type="button"
          onClick={onStartOnboarding}
          className={styles.screen1BtnPrimary}
        >
          {isAlreadyLive ? 'Edit Brand Details' : 'Get Started'}
        </button>

        {isAlreadyLive ? (
          <button
            type="button"
            onClick={onViewLiveDashboard}
            className={styles.screen1BtnSecondary}
          >
            Open Live Dashboard ({validProductsCount} Products)
          </button>
        ) : (
          <button
            type="button"
            onClick={onViewLiveDashboard}
            className={styles.screen1BtnSecondary}
          >
            Preview Sample Atelier
          </button>
        )}

        <div className={styles.screen1Footnote}>
          Already listed with Drobe? <span onClick={onViewLiveDashboard} style={{ textDecoration: 'underline', cursor: 'pointer', fontWeight: 700 }}>View Live Profile</span>
        </div>
      </div>
    </div>
  );
}
