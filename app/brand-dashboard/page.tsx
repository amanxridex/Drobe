'use client';

import React, { useState, useEffect } from 'react';
import { BrandProfile } from './types';
import { JIHI_BRAND_PROFILE, BLANK_BRAND_PROFILE } from './jihiData';
import OnboardingFlow from './OnboardingFlow';
import BrandProfileView from './BrandProfileView';
import styles from './brand-dashboard.module.css';

const STORAGE_KEY = 'drobe_brand_profile_v1';

export default function BrandDashboardPage() {
  const [brand, setBrand] = useState<BrandProfile>(JIHI_BRAND_PROFILE);
  const [activeView, setActiveView] = useState<'onboarding' | 'profile'>('onboarding');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setBrand(JSON.parse(saved));
      } else {
        setBrand(JIHI_BRAND_PROFILE);
      }
    } catch {
      setBrand(JIHI_BRAND_PROFILE);
    }
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  };

  const handleBrandChange = (updated: BrandProfile) => {
    setBrand(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Local storage full or unavailable
    }
  };

  const handlePublish = () => {
    const published = {
      ...brand,
      status: 'Published' as const,
      updatedAt: 'October 2026'
    };
    handleBrandChange(published);
    setActiveView('profile');
    triggerToast('Profile published successfully');
  };

  const handleResetJihi = () => {
    handleBrandChange(JIHI_BRAND_PROFILE);
    triggerToast('Loaded Jihi brand profile');
  };

  const handleStartBlank = () => {
    handleBrandChange(BLANK_BRAND_PROFILE);
    setActiveView('onboarding');
    triggerToast('Started blank profile');
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {activeView === 'onboarding' ? (
        <OnboardingFlow
          brand={brand}
          onChange={handleBrandChange}
          onPublish={handlePublish}
          onResetJihi={handleResetJihi}
          onStartBlank={handleStartBlank}
          onViewProfileTab={() => setActiveView('profile')}
        />
      ) : (
        <BrandProfileView
          brand={brand}
          onEditClick={() => setActiveView('onboarding')}
          onResetJihi={handleResetJihi}
        />
      )}

      {toastMessage && (
        <div className={styles.mobileToast}>
          {toastMessage}
        </div>
      )}
    </div>
  );
}
