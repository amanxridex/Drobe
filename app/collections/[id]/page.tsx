'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { slugify } from '@/app/lib/supabaseClient';

export default function CollectionsRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const id = (params?.id as string) || '';

  useEffect(() => {
    if (!id) {
      router.replace('/');
      return;
    }

    if (id.startsWith('home_discover_brand_') || id.startsWith('home-discover-brand-')) {
      const cleanBrand = id
        .replace(/^home_discover_brand_|^home-discover-brand-/, '')
        .replace(/_men$|_women$|-men$|-women$/, '');
      router.replace(`/brand/${slugify(cleanBrand)}`);
    } else {
      router.replace(`/collection/${id}`);
    }
  }, [id, router]);

  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: '#121214' }}>
      <div style={{ color: '#8e8e93', fontSize: 13, fontWeight: 600 }}>Loading collection...</div>
    </div>
  );
}
