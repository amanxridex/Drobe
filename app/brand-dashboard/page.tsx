'use client';

import React, { useState, useEffect } from 'react';
import { BrandProfile } from './types';
import { JIHI_BRAND_PROFILE, BLANK_BRAND_PROFILE } from './jihiData';
import BrandStartScreen from './BrandStartScreen';
import OnboardingFlow from './OnboardingFlow';
import BrandProfileView from './BrandProfileView';
import styles from './brand-dashboard.module.css';

const STORAGE_KEY = 'drobe_brand_profile_v1';

export default function BrandDashboardPage() {
  const [brand, setBrand] = useState<BrandProfile>(JIHI_BRAND_PROFILE);
  const [activeView, setActiveView] = useState<'start' | 'filing' | 'profile'>('start');
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
    }, 2800);
  };

  const handleBrandChange = (updated: BrandProfile) => {
    setBrand(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Local storage unavailable
    }
  };

  const handleGoLive = async () => {
    const published: BrandProfile = {
      ...brand,
      status: 'Published',
      updatedAt: 'October 2026'
    };
    handleBrandChange(published);

    // Fire celebratory confetti for the "Go Live" moment
    try {
      const confettiModule = (await import('canvas-confetti')).default;
      confettiModule({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.55 },
        colors: ['#0284c7', '#10b981', '#38bdf8', '#0f172a', '#f59e0b']
      });
    } catch {
      // Confetti fallback
    }

    setActiveView('profile');
    triggerToast('🚀 Congratulations! Your brand is now LIVE on Drobe.');
  };

  const handleResetJihi = () => {
    handleBrandChange(JIHI_BRAND_PROFILE);
    triggerToast('Loaded Jihi brand profile');
  };

  const handleStartBlank = () => {
    handleBrandChange(BLANK_BRAND_PROFILE);
    setActiveView('filing');
    triggerToast('Started fresh blank brand profile');
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* 1. INITIAL START VIEW: "List Your Brand" with "Start" Button */}
      {activeView === 'start' && (
        <BrandStartScreen
          brand={brand}
          onStart={() => setActiveView('filing')}
          onLoadJihi={() => {
            handleBrandChange(JIHI_BRAND_PROFILE);
            setActiveView('filing');
            triggerToast('Loaded Jihi demo — start filing details');
          }}
          onStartBlank={handleStartBlank}
          onViewLiveProfile={() => setActiveView('profile')}
        />
      )}

      {/* 2. FILING DETAILS VIEW: Progressive onboarding ending in "Go Live" */}
      {activeView === 'filing' && (
        <OnboardingFlow
          brand={brand}
          onChange={handleBrandChange}
          onGoLive={handleGoLive}
          onResetJihi={handleResetJihi}
          onStartBlank={() => {
            handleBrandChange(BLANK_BRAND_PROFILE);
            triggerToast('Cleared fields for fresh brand');
          }}
          onViewProfileTab={() => setActiveView('profile')}
          onBackToStart={() => setActiveView('start')}
        />
      )}

      {/* 3. PROFILE DASHBOARD VIEW: Showing Cover Image, Profile Image, Total Listed Products */}
      {activeView === 'profile' && (
        <BrandProfileView
          brand={brand}
          onEditClick={() => setActiveView('filing')}
          onResetJihi={handleResetJihi}
          onStartNew={() => setActiveView('start')}
        />
      )}

      {/* Sleek Apple-style Floating Toast */}
      {toastMessage && (
        <div className={styles.mobileToast}>
          {toastMessage}
        </div>
      )}
    </div>
  );
}
