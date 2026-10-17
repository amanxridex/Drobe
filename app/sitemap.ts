import { MetadataRoute } from 'next';
import realCatalog from '@/data/real_catalog.json';
import { slugify } from '@/app/lib/supabaseClient';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://drobe.one';
  const now = new Date();

  // 1. Core pages
  const corePages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: now,
      changeFrequency: 'always',
      priority: 1.0
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9
    },
    {
      url: `${baseUrl}/trends`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9
    },
    {
      url: `${baseUrl}/cart`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.6
    }
  ];

  // 2. Collection categories
  const collectionSlugs = [
    'top',
    'bottom',
    'ethnic',
    'footwear',
    'accessories',
    'dresses',
    'basics',
    'streetwear',
    'casualwear',
    'partywear',
    'loungewear',
    'workwear',
    'vacation',
    'watches',
    'jewellery'
  ];

  const collectionPages: MetadataRoute.Sitemap = collectionSlugs.map((slug) => ({
    url: `${baseUrl}/collection/${slug}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.85
  }));

  // 3. Featured Fashion Brands
  const brandNames = [
    'What The Flex',
    'Chapter 2',
    'Main Character',
    'The Souled Store',
    'GENRAGE',
    'Ikoho',
    'Powerlook',
    'Rawayi',
    'CALDRI',
    'House of Koala',
    'IWE STUDIOS',
    'Vastramay',
    'SNITCH',
    'The Indian Garage Co',
    'The Bear House',
    'TASVA',
    'Manyavar',
    'Thomas Scott',
    'CHUPPS',
    'Underrated Club',
    'Bewakoof',
    'Pink Fort',
    'CHKOKKO',
    'Vasavi',
    'trueBrowns',
    'KALKI Fashion',
    'Tequila',
    'Tilt',
    'GIVA',
    'Chumbak',
    'Sassafras',
    'Divena'
  ];

  const brandPages: MetadataRoute.Sitemap = brandNames.map((name) => ({
    url: `${baseUrl}/brand/${slugify(name)}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.85
  }));

  // 4. Products from Real Catalog
  const products = Array.isArray(realCatalog) ? realCatalog : Object.values(realCatalog);
  const seenIds = new Set<string>();

  const productPages: MetadataRoute.Sitemap = products
    .filter((p: any) => {
      const id = String(p.id || p.product_id || '').trim();
      if (!id || seenIds.has(id)) return false;
      seenIds.add(id);
      return true;
    })
    .map((p: any) => ({
      url: `${baseUrl}/product/${p.id || p.product_id}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8
    }));

  return [...corePages, ...collectionPages, ...brandPages, ...productPages];
}
