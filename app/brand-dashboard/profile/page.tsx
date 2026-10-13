'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BrandProfile } from '../types';
import { EMPTY_BRAND_PROFILE } from '../jihiData';
import BrandProfileView from '../BrandProfileView';

const STORAGE_KEY = 'drobe_brand_profile_v1';

export default function StandaloneProfilePage() {
  const router = useRouter();
  const [brand, setBrand] = useState<BrandProfile | null>(null);

  useEffect(() => {
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
    router.replace('/brand-dashboard');
  }, [router]);

  if (!brand) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff', color: '#64748b', fontSize: '13px' }}>
        Loading Brand Atelier...
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <BrandProfileView
        brand={brand}
        onEditClick={() => router.push('/brand-dashboard')}
        onShareClick={() => {
          if (typeof window !== 'undefined' && navigator.clipboard) {
            navigator.clipboard.writeText(window.location.href);
          }
        }}
      />
    </div>
  );
}
