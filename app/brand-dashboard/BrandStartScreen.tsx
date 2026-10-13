'use client';

import React from 'react';
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

  return (
    <div className={styles.mobileContainer}>
      {/* Clean Solid Top Header */}
      <header className={styles.minimalHeader}>
        <span className={styles.minimalLogo}>DROBE</span>
        {isAlreadyLive ? (
          <button
            type="button"
            onClick={onViewLiveDashboard}
            className={styles.minimalLiveChip}
          >
            Live profile →
          </button>
        ) : (
          <span className={styles.minimalSubChip}>Brand Studio</span>
        )}
      </header>

      {/* Clean Minimal Body */}
      <div className={styles.cleanStartBody}>
        <div className={styles.cleanStartContent}>
          <span className={styles.cleanEyebrow}>
            PARTNER DIRECTORY
          </span>

          <h1 className={styles.cleanTitle}>
            List your brand
          </h1>

          <p className={styles.cleanSubtitle}>
            Create your brand profile, list your signature formulations, and publish directly to discerning clients.
          </p>

          {/* Clean 3-Step Simple Guide */}
          <div className={styles.cleanStepList}>
            <div className={styles.cleanStepRow}>
              <span className={styles.cleanStepNum}>01</span>
              <div>
                <div className={styles.cleanStepHeading}>Brand details</div>
                <div className={styles.cleanStepText}>Name, category, and atelier location</div>
              </div>
            </div>

            <div className={styles.cleanStepRow}>
              <span className={styles.cleanStepNum}>02</span>
              <div>
                <div className={styles.cleanStepHeading}>Visual assets</div>
                <div className={styles.cleanStepText}>Cover banner and profile emblem</div>
              </div>
            </div>

            <div className={styles.cleanStepRow}>
              <span className={styles.cleanStepNum}>03</span>
              <div>
                <div className={styles.cleanStepHeading}>Products & go live</div>
                <div className={styles.cleanStepText}>Offerings catalog and instant launch</div>
              </div>
            </div>
          </div>

          {/* Active Profile Status if Live */}
          {isAlreadyLive && (
            <div className={styles.cleanStatusBox}>
              <span className={styles.livePulseDot} />
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                {brand.name}
              </span>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                is currently active
              </span>
            </div>
          )}
        </div>

        {/* Clean Static Bottom Action */}
        <div className={styles.cleanBottomAction}>
          <button
            type="button"
            onClick={onStartOnboarding}
            className={styles.cleanPrimaryBtn}
          >
            {isAlreadyLive ? 'Edit brand profile →' : 'Start onboarding →'}
          </button>
          <div className={styles.cleanFootnote}>
            Direct customer inquiries · Verified partner placement
          </div>
        </div>
      </div>
    </div>
  );
}
