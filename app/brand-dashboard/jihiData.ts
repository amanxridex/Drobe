import { BrandProfile } from './types';

export const EMPTY_BRAND_PROFILE: BrandProfile = {
  id: '',
  name: '',
  tagline: '',
  category: '',
  basedOutOf: '',
  establishedYear: new Date().getFullYear().toString(),
  founderName: '',
  founderRole: 'Founder & Creative Director',
  founderBio: '',
  founderQuote: '',
  about: '',
  mission: '',
  coverImage: '',
  profileImage: '',
  values: [],
  products: [
    { name: '', tagline: '', description: '', volume: '', price: '', image: '' }
  ],
  website: '',
  instagram: '',
  inquiriesEmail: '',
  email: '',
  password: '',
  status: 'Draft',
  updatedAt: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
};

// Aliased for backward compatibility
export const BLANK_BRAND_PROFILE = EMPTY_BRAND_PROFILE;
export const JIHI_BRAND_PROFILE = EMPTY_BRAND_PROFILE;
