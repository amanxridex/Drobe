'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BrandProfile, mapDbBrandToBrandProfile } from '../types';
import { EMPTY_BRAND_PROFILE } from '../jihiData';
import { registerBrandApplication } from '../../lib/darkstoreData';
import { supabaseFetchBrandById, supabaseFetchBrandProducts, supabaseUpsertBrand } from '../../lib/supabaseClient';
import BrandProfileView from '../BrandProfileView';
import ApprovalPendingScreen from '../ApprovalPendingScreen';

const STORAGE_KEY = 'drobe_brand_profile_v1';

export default function StandaloneProfilePage() {
  const router = useRouter();
  const [brand, setBrand] = useState<BrandProfile | null>(null);

  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const brandParam = urlParams.get('brand') || urlParams.get('id');

      if (brandParam) {
        supabaseFetchBrandById(brandParam).then(async (dbBrand) => {
          if (dbBrand) {
            const dbProducts = await supabaseFetchBrandProducts(brandParam, dbBrand.name);
            const mapped = mapDbBrandToBrandProfile(dbBrand, dbProducts || []);
            setBrand(mapped);
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
            } catch {}
          } else {
            fallbackLocal();
          }
        }).catch(() => {
          fallbackLocal();
        });
        return;
      }

      fallbackLocal();
    } catch {
      fallbackLocal();
    }

    function fallbackLocal() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed: BrandProfile = JSON.parse(saved);
          if (parsed.name?.trim()) {
            setBrand(parsed);
            return;
          }
        }
      } catch {
        // Local storage read error
      }
      // If no brand exists, send to brand onboarding
      const isBrands = typeof window !== 'undefined' && window.location.hostname.startsWith('brands.');
      router.replace(isBrands ? '/?onboard=true' : '/brand-dashboard?onboard=true');
    }
  }, [router]);

  if (!brand) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff', color: '#64748b', fontSize: '13px' }}>
        Loading Brand Profile...
      </div>
    );
  }

  if (brand.status === 'Waiting for Approval' || brand.status === 'Under Review') {
    return (
      <ApprovalPendingScreen
        brand={brand}
        onUpdateBrand={(updated) => {
          setBrand(updated);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          } catch {}
          if (updated.name && updated.name.trim().length > 0) {
            registerBrandApplication(updated);
          }
        }}
        onApproveSuccess={() => {
          const approved: BrandProfile = { ...brand, status: 'Approved' };
          setBrand(approved);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(approved));
          } catch {}
          supabaseUpsertBrand(approved);
        }}
        onSignOut={() => {
          const isBrands = typeof window !== 'undefined' && window.location.hostname.startsWith('brands.');
          router.push(isBrands ? '/' : '/brand-dashboard');
        }}
      />
    );
  }

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <BrandProfileView
        brand={brand}
        onEditClick={() => {
          const isBrands = typeof window !== 'undefined' && window.location.hostname.startsWith('brands.');
          router.push(isBrands ? '/' : '/brand-dashboard');
        }}
        onShareClick={() => {
          if (typeof window !== 'undefined' && navigator.clipboard) {
            navigator.clipboard.writeText(window.location.href);
          }
        }}
        onUpdateBrand={(updated) => {
          setBrand(updated);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          } catch {}
          if (updated.name && updated.name.trim().length > 0) {
            registerBrandApplication(updated);
          }
        }}
      />
    </div>
  );
}
