import { BrandProfile } from './types';

export const JIHI_BRAND_PROFILE: BrandProfile = {
  id: 'jihi-brand-official',
  name: 'Jihi',
  tagline: 'Conscious luxury and botanical rituals crafted to nourish body and mind.',
  category: 'Luxury Mindful Skincare & Ritual Wellness',
  basedOutOf: 'Telluride & Denver, Colorado',
  establishedYear: '2020',
  founderName: 'Jenn Bernstein',
  founderRole: 'Founder & Formulator',
  founderBio: 'Jenn founded Jihi out of a personal journey toward healing and intentional calm. Rooted in Colorado’s alpine wilderness, she created a brand that treats skincare as a ritual of radical self-compassion rather than another daily chore.',
  founderQuote: 'Jihi is the Japanese word for benevolence and compassion. We craft every formula to invite that compassion back into your daily rhythm.',
  about: 'Jihi was born from the philosophy that beauty and wellness are sacred daily pauses. Formulated in the high-altitude climate of Colorado, our botanical products marry nutrient-dense cold-pressed seed oils, adaptogenic plant extracts, and broad-spectrum botanicals with restorative aromatics. Each product is formulated without fillers, parabens, or synthetic fragrance—crafted to soothe both skin and spirit.',
  mission: 'To elevate daily personal care into an intentional ritual of presence, radiance, and restorative calm.',
  coverImage: '/brands/jihi/cover.jpg',
  profileImage: '/brands/jihi/profile.jpg',
  values: [
    {
      title: 'Botanical Integrity',
      description: 'Clean, cold-pressed active plant oils and adaptogenic botanicals harvested with uncompromising purity.'
    },
    {
      title: 'Mindful Rituals',
      description: 'Multisensory formulations crafted to ground the senses, ease stress, and transform daily routines into quiet sanctuaries.'
    },
    {
      title: 'Radical Transparency',
      description: 'Third-party tested, sustainable heavy-base glass vessels, cruelty-free, and crafted with full batch traceability.'
    }
  ],
  products: [
    {
      name: 'Petal Milk',
      tagline: 'Rejuvenating Face Serum',
      description: 'A silky emulsion of white lily, organic evening primrose, and restorative botanicals that delivers deep cellular hydration.',
      volume: '30 ml / 1.0 fl oz'
    },
    {
      name: 'Merra',
      tagline: 'Revitalizing Eye Cream',
      description: 'High-altitude botanical peptides, organic cucumber extract, and active caffeine to depuff, illuminate, and smooth fine lines.',
      volume: '15 ml / 0.5 fl oz'
    },
    {
      name: 'Reverie',
      tagline: 'Evening Herbal Body Balm',
      description: 'An indulgent, melt-on-contact night balm infused with lavender, chamomile, and soothing broad-spectrum hemp.',
      volume: '50 ml / 1.7 fl oz'
    }
  ],
  website: 'https://jihi.com',
  instagram: '@jihi_rituals',
  inquiriesEmail: 'concierge@jihi.com',
  status: 'Published',
  updatedAt: 'October 2026'
};

export const BLANK_BRAND_PROFILE: BrandProfile = {
  id: 'new-brand',
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
  values: [
    { title: 'Craftsmanship & Integrity', description: 'Uncompromising attention to raw materials and conscious production.' },
    { title: 'Design Purity', description: 'Form that follows function with timeless minimalism.' },
    { title: 'Conscious Footprint', description: 'Sustainable sourcing and transparent lifecycle accountability.' }
  ],
  products: [
    { name: '', tagline: '', description: '', volume: '' }
  ],
  website: '',
  instagram: '',
  inquiriesEmail: '',
  status: 'Draft',
  updatedAt: 'October 2026'
};
