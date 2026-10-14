export interface BrandValue {
  title: string;
  description: string;
}

export interface WarehouseLocationInfo {
  hub: string;
  rack: string;
  shelf: string;
  bin: string;
  code: string;
}

export interface BrandProductHighlight {
  id?: string;
  sku?: string; // DR1, DR2, DR3...
  name: string;
  tagline: string;
  description: string;
  volume?: string;
  image?: string;
  images?: string[];
  price?: string;
  inventory?: number | string;
  inwardStatus?: 'Pending Stock Dispatch' | 'Stock In Transit to Ahmedabad' | 'Received & Verifying at Hub' | 'Inwarded & Live' | 'Rejected';
  warehouseLocation?: WarehouseLocationInfo;
  isLive?: boolean;
  inwardDate?: string;
}

export interface BrandBankAccount {
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountType?: 'Current' | 'Savings';
  isVerified?: boolean;
}

export interface BrandProfile {
  id: string;
  name: string;
  tagline: string;
  category: string;
  basedOutOf: string;
  establishedYear: string;
  founderName: string;
  founderRole: string;
  founderBio: string;
  founderQuote: string;
  about: string;
  mission: string;
  coverImage: string;
  profileImage: string;
  values: BrandValue[];
  products: BrandProductHighlight[];
  website: string;
  instagram: string;
  inquiriesEmail: string;
  email?: string;
  password?: string;
  bankAccount?: BrandBankAccount;
  status: 'Published' | 'Under Review' | 'Draft' | 'Approved' | 'Waiting for Approval';
  updatedAt: string;
}
