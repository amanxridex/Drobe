'use client';

import React, { useState, useEffect } from 'react';
import { BrandProfile, mapDbBrandToBrandProfile } from './types';
import { EMPTY_BRAND_PROFILE } from './jihiData';
import { registerBrandApplication } from '../lib/darkstoreData';
import { supabaseFetchBrandById, supabaseFetchBrandProducts } from '../lib/supabaseClient';
import BrandStartScreen from './BrandStartScreen';
import OnboardingFlow from './OnboardingFlow';
import BrandProfileView from './BrandProfileView';
import styles from './brand-dashboard.module.css';

const STORAGE_KEY = 'drobe_brand_profile_v1';

const DEFAULT_SHOWCASE_BRAND: BrandProfile = {
  ...EMPTY_BRAND_PROFILE,
  id: 'brand-jihi-01',
  name: 'JIHI',
  tagline: 'Contemporary Resort & Evening Wear',
  category: 'Female',
  basedOutOf: 'Ahmedabad · Gujarat',
  founderName: 'Aman Patel',
  founderRole: 'Founder & Creative Director',
  status: 'Approved',
  products: [
    {
      name: 'Japanese Heavyweight Oversized Tee',
      tagline: '320 GSM French Terry Cotton',
      description: 'Custom milled 320 GSM French Terry Cotton with relaxed drop shoulders and durable ribbed collar.',
      price: '₹2,499',
      inventory: '48 in stock',
      image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80'
    },
    {
      name: 'Resort Cuban Collar Linen Shirt',
      tagline: '100% Breathable European Flax',
      description: 'Crafted from 100% natural European flax with a relaxed camp collar and pearl shell buttons.',
      price: '₹3,199',
      inventory: '34 in stock',
      image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80'
    },
    {
      name: 'Raw Indigo Relaxed Selvedge Denim',
      tagline: '14oz Japanese Kurabo Denim',
      description: 'Shuttle-loomed 14oz Japanese redline selvedge denim designed to age with unique wear patterns.',
      price: '₹3,899',
      inventory: '26 in stock',
      image: 'https://images.unsplash.com/photo-1542272604-780c96856592?w=800&auto=format&fit=crop&q=80'
    }
  ]
};

export default function BrandDashboardPage() {
  const [brand, setBrand] = useState<BrandProfile>(EMPTY_BRAND_PROFILE);
  const [activeView, setActiveView] = useState<'start' | 'filing' | 'profile'>('start');
  const [openEditOnProfile, setOpenEditOnProfile] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const viewParam = urlParams.get('view');
      const onboardParam = urlParams.get('onboard') || urlParams.get('onboarding');
      const brandParam = urlParams.get('brand') || urlParams.get('id');
      const editParam = urlParams.get('edit');

      // 1. Explicit Landing / Start Pitch Screen Support
      if (viewParam === 'start' || viewParam === 'landing') {
        setActiveView('start');
        return;
      }

      // 2. Direct Onboarding Link Support (e.g. /brand-dashboard?onboard=true)
      if (onboardParam === 'true' || onboardParam === '1' || viewParam === 'filing' || viewParam === 'onboarding') {
        setActiveView('filing');
        return;
      }

      // 3. Direct Dashboard / Analytics View
      if (viewParam === 'profile' || viewParam === 'dashboard' || viewParam === 'analytics') {
        setActiveView('profile');
      }

      // 4. Direct Brand Link Support (e.g. /brand-dashboard?brand=underrated-club)
      if (brandParam) {
        supabaseFetchBrandById(brandParam).then(async (dbBrand) => {
          if (dbBrand) {
            const dbProducts = await supabaseFetchBrandProducts(brandParam, dbBrand.name);
            const mapped = mapDbBrandToBrandProfile(dbBrand, dbProducts || []);
            setBrand(mapped);
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
            } catch {}
            setActiveView('profile');
            if (editParam === 'true') {
              setOpenEditOnProfile(true);
            }
          }
        }).catch((err) => {
          console.warn('Failed to load brand from Supabase:', err);
        });
        return;
      }

      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.name && parsed.name.trim().length > 0) {
          setBrand(parsed);
          if (viewParam === 'profile' || viewParam === 'dashboard' || viewParam === 'analytics') {
            setActiveView('profile');
          }
        }
      }
    } catch {
      // Keep default start screen
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
    if (updated.name && updated.name.trim().length > 0) {
      try {
        registerBrandApplication(updated);
      } catch (e) {
        console.warn('Failed to register brand application:', e);
      }
    }
  };

  const handleGoLive = async () => {
    const submittedBrand: BrandProfile = {
      ...brand,
      status: 'Waiting for Approval',
      updatedAt: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    };
    handleBrandChange(submittedBrand);
    registerBrandApplication(submittedBrand);

    // Fire celebratory confetti for profile filing submission
    try {
      const confettiModule = (await import('canvas-confetti')).default;
      confettiModule({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.55 },
        colors: ['#0284c7', '#38bdf8', '#0f172a', '#f59e0b']
      });
    } catch {
      // Confetti fallback
    }

    setActiveView('profile');
    triggerToast('📋 Profile submitted! Awaiting verification before inventory dispatch.');
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
      const isBrandsSubdomain = window.location.hostname.startsWith('brands.');
      const shareUrl = isBrandsSubdomain
        ? `${window.location.origin}/profile`
        : `${window.location.origin}/brand-dashboard/profile`;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(shareUrl).then(() => {
          triggerToast('Profile link copied to clipboard');
        }).catch(() => {
          triggerToast(`Link: ${shareUrl}`);
        });
      } else {
        triggerToast(`Link: ${shareUrl}`);
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
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff' }}>
      {/* 1. START SCREEN: Clean Drobe Logo & Entry Actions */}
      {activeView === 'start' && (
        <BrandStartScreen
          brand={brand}
          onStartOnboarding={() => setActiveView('filing')}
          onViewLiveDashboard={() => {
            if (!brand.name || brand.name.trim().length === 0) {
              setBrand({
                ...EMPTY_BRAND_PROFILE,
                id: 'brand-jihi-01',
                name: 'JIHI',
                tagline: 'Contemporary Resort & Evening Wear',
                category: 'Female',
                basedOutOf: 'Ahmedabad · Gujarat',
                founderName: 'Aman Patel',
                founderRole: 'Founder & Creative Director',
                status: 'Approved',
                products: [
                  {
                    name: 'Japanese Heavyweight Oversized Tee',
                    tagline: '320 GSM French Terry Cotton',
                    description: 'Custom milled 320 GSM French Terry Cotton with relaxed drop shoulders and durable ribbed collar.',
                    price: '₹2,499',
                    inventory: '48 in stock',
                    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80'
                  },
                  {
                    name: 'Resort Cuban Collar Linen Shirt',
                    tagline: '100% Breathable European Flax',
                    description: 'Crafted from 100% natural European flax with a relaxed camp collar and pearl shell buttons.',
                    price: '₹3,199',
                    inventory: '34 in stock',
                    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80'
                  },
                  {
                    name: 'Raw Indigo Relaxed Selvedge Denim',
                    tagline: '14oz Japanese Kurabo Denim',
                    description: 'Shuttle-loomed 14oz Japanese redline selvedge denim designed to age with unique wear patterns.',
                    price: '₹3,899',
                    inventory: '26 in stock',
                    image: 'https://images.unsplash.com/photo-1542272604-780c96856592?w=800&auto=format&fit=crop&q=80'
                  }
                ]
              });
            }
            setOpenEditOnProfile(false);
            setActiveView('profile');
          }}
          onEditLiveBrand={() => {
            setOpenEditOnProfile(true);
            setActiveView('profile');
          }}
          onResetBrand={handleResetBrand}
          onLoginSuccess={handleLoginSuccess}
          onSelectBrand={(loadedBrand) => {
            setBrand(loadedBrand);
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(loadedBrand));
            } catch {}
            setActiveView('profile');
            triggerToast(`Welcome to ${loadedBrand.name} Partner Dashboard`);
          }}
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
          initialOpenEdit={openEditOnProfile}
          onShareClick={handleShareClick}
          onUpdateBrand={handleBrandChange}
          onToast={triggerToast}
          onSignOut={() => setActiveView('start')}
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
