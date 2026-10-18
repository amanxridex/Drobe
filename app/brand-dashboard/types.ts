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
  tagline?: string;
  description?: string;
  primaryColor?: string;
  fabric?: string;
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
  payoutMethod?: 'bank' | 'upi';
  upiId?: string;
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountType?: 'Current' | 'Savings';
  isVerified?: boolean;
}

export interface BrandOnboardingPayment {
  status: 'pending' | 'paid';
  amount: number;
  currency?: string;
  paymentId?: string;
  orderId?: string;
  paidAt?: string;
  agreedToTerms?: boolean;
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
  emailVerified?: boolean;
  bankAccount?: BrandBankAccount;
  warehouse?: string; // 'ahmedabad' | 'chandigarh' | 'gurgaon' | 'lucknow'
  warehouses?: string[]; // e.g. ['ahmedabad']
  onboardingPayment?: BrandOnboardingPayment;
  status: 'Published' | 'Under Review' | 'Draft' | 'Approved' | 'Waiting for Approval';
  updatedAt: string;
}

export function mapDbBrandToBrandProfile(row: any, prods: any[] = []): BrandProfile {
  const bank = row.bankAccount || {};
  return {
    id: row.id || '',
    name: row.name || 'Untitled Brand',
    emailVerified: Boolean(row.dossier_data?.emailVerified || row.email_verified),
    tagline: row.tagline || row.about?.slice(0, 90) || 'Artisanal Modern Brand',
    category: row.category || 'Male & Female',
    basedOutOf: row.based_out_of || row.basedOutOf || 'Ahmedabad Darkstore Hub',
    establishedYear: String(row.established_year || row.establishedYear || '2024'),
    founderName: row.founder_name || row.founderName || 'Founder',
    founderRole: row.founder_role || row.founderRole || 'Founder & Creative Director',
    founderBio: row.founder_bio || row.founderBio || '',
    founderQuote: row.founder_quote || row.founderQuote || '',
    about: row.about || '',
    mission: row.mission || '',
    coverImage: row.cover_image || row.coverImage || '',
    profileImage: row.profile_image || row.profileImage || '',
    values: Array.isArray(row.values) ? row.values : [],
    products: Array.isArray(prods) && prods.length > 0 
      ? prods.map(p => ({
          id: String(p.id),
          sku: p.sku || `DR-${p.id}`,
          name: p.name || p.title || 'Designer Piece',
          tagline: p.tagline || '',
          description: p.description || '',
          volume: p.volume || 'M',
          price: typeof p.price === 'string' ? p.price : `₹${p.price}`,
          inventory: p.inventory || p.declared_inventory || 20,
          image: Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : (p.thumbnail || ''),
          images: Array.isArray(p.images) ? p.images : (p.thumbnail ? [p.thumbnail] : []),
          inwardStatus: p.inward_status || p.inwardStatus || 'Inwarded & Live',
          warehouseLocation: p.shelf_details || (p.shelf_code ? { code: p.shelf_code, hub: 'Ahmedabad Darkstore Hub #01', rack: '', shelf: '', bin: '' } : undefined),
          isLive: p.is_live ?? p.isLive ?? true
        }))
      : (Array.isArray(row.products) ? row.products : []),
    website: row.website || '',
    instagram: row.instagram || '',
    inquiriesEmail: row.inquiries_email || row.inquiriesEmail || row.email || '',
    email: row.email || row.inquiries_email || row.inquiriesEmail || '',
    bankAccount: {
      payoutMethod: bank.payoutMethod || row.payout_method || (bank.upiId || row.upi_id ? 'upi' : 'bank'),
      upiId: bank.upiId || row.upi_id || row.dossier_data?.bankAccount?.upiId || '',
      accountHolderName: bank.accountHolderName || row.bank_account_holder || '',
      bankName: bank.bankName || row.bank_name || 'HDFC Bank',
      accountNumber: bank.accountNumber || row.bank_account_number || '',
      ifscCode: bank.ifscCode || row.bank_ifsc || '',
      accountType: bank.accountType || row.bank_account_type || 'Current',
      isVerified: Boolean(bank.isVerified ?? row.bank_is_verified)
    },
    warehouse: row.warehouse || row.dossier_data?.warehouse || 'ahmedabad',
    warehouses: Array.isArray(row.warehouses) ? row.warehouses : (row.dossier_data?.warehouses || ['ahmedabad']),
    onboardingPayment: row.onboarding_payment || row.dossier_data?.onboardingPayment || undefined,
    status: (row.status === 'Approved' ? 'Approved' : (row.status === 'Waiting for Approval' ? 'Waiting for Approval' : 'Published')) as any,
    updatedAt: row.updated_at ? new Date(row.updated_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recent'
  };
}
