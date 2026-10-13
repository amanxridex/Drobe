'use client';

import React, { useState, useEffect } from 'react';
import { BrandProfile } from './types';
import { EMPTY_BRAND_PROFILE } from './jihiData';
import BrandStartScreen from './BrandStartScreen';
import OnboardingFlow from './OnboardingFlow';
import BrandProfileView from './BrandProfileView';
import styles from './brand-dashboard.module.css';

const STORAGE_KEY = 'drobe_brand_profile_v1';

export default function BrandDashboardPage() {
  const [brand, setBrand] = useState<BrandProfile>(EMPTY_BRAND_PROFILE);
  const [activeView, setActiveView] = useState<'start' | 'filing' | 'profile'>('start');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setBrand(parsed);
      } else {
        setBrand(EMPTY_BRAND_PROFILE);
      }
    } catch {
      setBrand(EMPTY_BRAND_PROFILE);
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
      updatedAt: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    };
    handleBrandChange(published);

    // Fire celebratory confetti for the "Go Live" moment
    try {
      const confettiModule = (await import('canvas-confetti')).default;
      confettiModule({
        particleCount: 110,
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

  const handleSaveDraft = () => {
    handleBrandChange(brand);
    triggerToast('Draft saved successfully');
  };

  const handleResetBrand = () => {
    setBrand(EMPTY_BRAND_PROFILE);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
    setActiveView('filing');
  };

  const handleShareClick = () => {
    if (typeof window !== 'undefined') {
      const shareUrl = `${window.location.origin}/brand-dashboard/profile`;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(shareUrl).then(() => {
          triggerToast('Profile link copied to clipboard');
        }).catch(() => {
          triggerToast('Link: /brand-dashboard/profile');
        });
      } else {
        triggerToast('Link: /brand-dashboard/profile');
      }
    }
  };

  const handleLoginSuccess = (email: string) => {
    if (brand.status === 'Published' && brand.name?.trim()) {
      setActiveView('profile');
      triggerToast(`Welcome back to ${brand.name}`);
    } else {
      handleBrandChange({
        ...brand,
        email: email
      });
      setActiveView('filing');
      triggerToast(`Signed in as ${email}`);
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* 1. START SCREEN: Clean Drobe Logo & Entry Actions */}
      {activeView === 'start' && (
        <BrandStartScreen
          brand={brand}
          onStartOnboarding={() => setActiveView('filing')}
          onViewLiveDashboard={() => setActiveView('profile')}
          onResetBrand={handleResetBrand}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {/* 2. REAL ONBOARDING FLOW: Step-by-step Brand Studio to Go Live */}
      {activeView === 'filing' && (
        <OnboardingFlow
          brand={brand}
          onChange={handleBrandChange}
          onGoLive={handleGoLive}
          onExit={() => setActiveView('start')}
          onSaveDraft={handleSaveDraft}
        />
      )}

      {/* 3. REAL LIVE BRAND PROFILE: Displays actual entered products, prices & channels */}
      {activeView === 'profile' && (
        <BrandProfileView
          brand={brand}
          onEditClick={() => setActiveView('filing')}
          onShareClick={handleShareClick}
          onUpdateBrand={handleBrandChange}
        />
      )}

      {/* Floating Apple-Style Toast */}
      {toastMessage && (
        <div className={styles.mobileToast}>
          {toastMessage}
        </div>
      )}
    </div>
  );
}
