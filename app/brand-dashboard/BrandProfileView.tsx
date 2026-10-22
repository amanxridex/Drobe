'use client';

import React from 'react';
import { BrandProfile } from './types';
import BrandDashboard from './BrandDashboard';

export interface BrandProfileViewProps {
  brand: BrandProfile;
  onEditClick?: () => void;
  onShareClick?: () => void;
  onUpdateBrand?: (updated: BrandProfile) => void;
  initialOpenEdit?: boolean;
  onToast?: (msg: string) => void;
  onSignOut?: () => void;
}

export default function BrandProfileView({
  brand,
  onEditClick,
  onShareClick,
  onUpdateBrand,
  onToast,
  onSignOut
}: BrandProfileViewProps) {
  return (
    <BrandDashboard
      brand={brand}
      onEditClick={onEditClick}
      onShareClick={onShareClick}
      onUpdateBrand={onUpdateBrand}
      onToast={onToast}
      onSignOut={onSignOut}
    />
  );
}
