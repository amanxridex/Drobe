'use client';

import React, { useState, useEffect } from 'react';
import { BrandProfile, mapDbBrandToBrandProfile } from './types';
import { EMPTY_BRAND_PROFILE } from './jihiData';
import { registerBrandApplication } from '../lib/darkstoreData';
import { 
  supabaseFetchBrandById, 
  supabaseFetchBrandProducts, 
  supabaseUpsertBrand, 
  supabaseUpsertProduct 
} from '../lib/supabaseClient';
import BrandStartScreen from './BrandStartScreen';
import OnboardingFlow from './OnboardingFlow';
import BrandDashboard from './BrandDashboard';
import ApprovalPendingScreen from './ApprovalPendingScreen';
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
  products: []
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
        supabaseFetchBrandById(brandParam, true).then(async (dbBrand) => {
          if (dbBrand) {
            const dbProducts = await supabaseFetchBrandProducts(brandParam, dbBrand.name, true, true);
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

          // Live Supabase DB sync & hydration (seamless background update from Postgres)
          const lookupKey = parsed.id || parsed.name;
          supabaseFetchBrandById(lookupKey, true).then(async (dbBrand) => {
            if (dbBrand) {
              const dbProducts = await supabaseFetchBrandProducts(lookupKey, dbBrand.name, true, true);
              const mapped = mapDbBrandToBrandProfile(dbBrand, dbProducts || []);
              setBrand((prev) => {
                const mergedProducts = (mapped.products && mapped.products.length > 0)
                  ? mapped.products
                  : prev.products;
                const merged: BrandProfile = {
                  ...prev,
                  ...mapped,
                  status: (dbBrand.status as any) || prev.status,
                  products: mergedProducts
                };
                try {
                  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
                } catch {}
                return merged;
              });
            }
          }).catch((err) => {
            console.warn('Live DB brand hydration error:', err);
          });
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

      // Live Supabase DB sync
      supabaseUpsertBrand(updated).catch((err) => {
        console.warn('supabaseUpsertBrand async error:', err);
      });

      // Also persist products to drobe_products in Supabase
      if (Array.isArray(updated.products) && updated.products.length > 0) {
        updated.products.forEach((prod) => {
          if (!prod.name?.trim()) return;
          supabaseUpsertProduct({
            id: prod.id,
            sku: prod.sku,
            name: prod.name,
            brandId: updated.id,
            brandName: updated.name,
            category: updated.category,
            price: prod.price || '₹0',
            volume: prod.volume || 'M',
            inventory: Number(prod.inventory) || 0,
            tagline: prod.tagline || '',
            description: prod.description || '',
            images: prod.images && prod.images.length > 0 ? prod.images : (prod.image ? [prod.image] : []),
            inwardStatus: prod.inwardStatus || 'Pending Stock Dispatch',
            isLive: prod.isLive ?? true
          }).catch(() => {});
        });
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
    await supabaseUpsertBrand(submittedBrand);

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

  const handleLoginSuccess = (email: string) => {
    if ((brand.status === 'Published' || brand.status === 'Approved' || brand.status === 'Waiting for Approval') && brand.name?.trim()) {
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
                ...DEFAULT_SHOWCASE_BRAND
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

      {/* 3. REAL LIVE BRAND PROFILE / APPROVAL PENDING SCREEN */}
      {activeView === 'profile' && (
        (brand.status === 'Waiting for Approval' || brand.status === 'Under Review') ? (
          <ApprovalPendingScreen
            brand={brand}
            onUpdateBrand={handleBrandChange}
            onApproveSuccess={() => {
              const approvedBrand: BrandProfile = { ...brand, status: 'Approved' };
              handleBrandChange(approvedBrand);
              supabaseUpsertBrand(approvedBrand);
              triggerToast('🎉 Brand Approved! Live Dashboard Unlocked.');
            }}
            onSignOut={() => setActiveView('start')}
            onToast={triggerToast}
          />
        ) : (
          <BrandDashboard
            brand={brand}
            onUpdateBrand={handleBrandChange}
            onEditClick={() => setOpenEditOnProfile(true)}
            onSignOut={() => setActiveView('start')}
            onToast={triggerToast}
          />
        )
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
