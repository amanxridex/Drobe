'use client';

import React from 'react';
import { BrandProfile } from './types';
import styles from './brand-dashboard.module.css';

interface BrandStartScreenProps {
  brand: BrandProfile;
  onStartOnboarding: () => void;
  onViewLiveDashboard: () => void;
  onResetBrand?: () => void;
}

export default function BrandStartScreen({
  brand,
  onStartOnboarding,
  onViewLiveDashboard,
  onResetBrand
}: BrandStartScreenProps) {
  const isAlreadyLive = brand.status === 'Published' && Boolean(brand.name?.trim());
  const hasDraft = Boolean(brand.name?.trim()) && !isAlreadyLive;
  const validProductsCount = brand.products.filter(p => p.name?.trim().length > 0).length;

  return (
    <div className={styles.screen1Container}>
      {/* 1. Official DROBE Logo Showcase */}
      <div className={styles.screen1LogoArea}>
        <img
          src="/drobe-logo.png"
          alt="Drobe"
          className={styles.screen1MainLogo}
        />
      </div>

      {/* 2. Apple SF Thin Typography Pitch */}
      <div className={styles.screen1TextSection}>
        <h1 className={styles.screen1Title}>
          Start your new<br />Brand Journey
        </h1>

        <p className={styles.screen1Subtext}>
          List your luxury atelier, curate your signature collection, and connect directly with discerning clients on Drobe.
        </p>
      </div>

      {/* 3. Real Action Buttons */}
      <div className={styles.screen1BottomSection}>
        {isAlreadyLive ? (
          <>
            <button
              type="button"
              onClick={onViewLiveDashboard}
              className={styles.screen1BtnPrimary}
            >
              Open Brand Dashboard ({validProductsCount} {validProductsCount === 1 ? 'Product' : 'Products'})
            </button>

            <button
              type="button"
              onClick={onStartOnboarding}
              className={styles.screen1BtnSecondary}
            >
              Edit Brand Details
            </button>
          </>
        ) : hasDraft ? (
          <>
            <button
              type="button"
              onClick={onStartOnboarding}
              className={styles.screen1BtnPrimary}
            >
              Continue Onboarding ({brand.name})
            </button>

            <button
              type="button"
              onClick={onResetBrand}
              className={styles.screen1BtnSecondary}
            >
              Start Fresh Application
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={onStartOnboarding}
            className={styles.screen1BtnPrimary}
          >
            Start Onboarding
          </button>
        )}

        <div className={styles.screen1Footnote}>
          Drobe Partner Portal · Verified Luxury Ateliers
        </div>
      </div>
    </div>
  );
}
