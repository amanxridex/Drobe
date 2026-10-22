'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { BrandProfile } from './types';
import BrandProfilePage from './BrandProfilePage';

export interface BrandProfileViewProps {
  brand: BrandProfile;
  onBack?: () => void;
  onEditClick?: () => void;
  onShareClick?: () => void;
  onUpdateBrand?: (updated: BrandProfile) => void;
  initialOpenEdit?: boolean;
  onToast?: (msg: string) => void;
  onSignOut?: () => void;
}

export default function BrandProfileView({
  brand,
  onBack,
  onEditClick,
  onShareClick,
  onUpdateBrand,
  onToast,
  onSignOut
}: BrandProfileViewProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.push('/brand-dashboard');
    }
  };

  return (
    <BrandProfilePage
      brand={brand}
      onBack={handleBack}
      onEditClick={onEditClick}
      onUpdateBrand={onUpdateBrand}
      onToast={onToast}
      onSignOut={onSignOut}
    />
  );
}
