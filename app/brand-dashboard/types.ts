export interface BrandValue {
  title: string;
  description: string;
}

export interface BrandProductHighlight {
  name: string;
  tagline: string;
  description: string;
  volume?: string;
  image?: string;
  price?: string;
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
  status: 'Published' | 'Under Review' | 'Draft';
  updatedAt: string;
}
