'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BrandProfile } from '../types';
import { JIHI_BRAND_PROFILE } from '../jihiData';
import BrandProfileView from '../BrandProfileView';

const STORAGE_KEY = 'drobe_brand_profile_v1';

export default function StandaloneProfilePage() {
  const router = useRouter();
  const [brand, setBrand] = useState<BrandProfile>(JIHI_BRAND_PROFILE);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setBrand(JSON.parse(saved));
      }
    } catch {
      // Default to Jihi
    }
  }, []);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <BrandProfileView
        brand={brand}
        onEditClick={() => router.push('/brand-dashboard')}
        onResetJihi={() => setBrand(JIHI_BRAND_PROFILE)}
      />
    </div>
  );
}
