import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { supabase, isSupabaseConfigured, slugify } from '@/app/lib/supabaseClient';

const MANIFEST_FILE_PATH = path.join(process.cwd(), 'data', 'discover_brands_manifest.json');

interface BrandTile {
  name: string;
  img: string;
  badge?: string | null;
  categories: string[];
  deeplink: string;
}

interface DiscoverBrandsData {
  heading: string;
  categories: Array<{ id: string; title: string; icon: string }>;
  slides: BrandTile[][];
}

async function readLocalManifest(): Promise<DiscoverBrandsData | null> {
  try {
    const raw = await fs.readFile(MANIFEST_FILE_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read local discover_brands_manifest.json:', err);
    return null;
  }
}

export async function GET() {
  try {
    // 1. Try fetching from Supabase DB first if configured
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('drobe_app_configs')
          .select('value')
          .eq('key', 'discover_brands')
          .maybeSingle();

        if (!error && data?.value && Array.isArray(data.value.slides) && data.value.slides.length > 0) {
          return NextResponse.json({
            success: true,
            source: 'supabase_db',
            data: data.value
          });
        }
      } catch (dbErr) {
        console.warn('Supabase drobe_app_configs fetch warning:', dbErr);
      }
    }

    // 2. Fallback to local JSON file
    const localData = await readLocalManifest();
    if (localData) {
      return NextResponse.json({
        success: true,
        source: 'local_manifest',
        data: localData
      });
    }

    return NextResponse.json(
      { success: false, error: 'Could not load discover brands data' },
      { status: 500 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Server error loading discover brands' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body || !Array.isArray(body.slides)) {
      return NextResponse.json(
        { success: false, error: 'Invalid payload: "slides" array is required' },
        { status: 400 }
      );
    }

    // Read current local manifest to preserve categories / heading if not provided
    const current = (await readLocalManifest()) || {
      heading: 'Discover Brands',
      categories: [],
      slides: []
    };

    const updatedData: DiscoverBrandsData = {
      heading: body.heading || current.heading || 'Discover Brands',
      categories: Array.isArray(body.categories) && body.categories.length > 0
        ? body.categories
        : current.categories,
      slides: body.slides
    };

    // 1. Persist to local JSON file
    await fs.mkdir(path.dirname(MANIFEST_FILE_PATH), { recursive: true });
    await fs.writeFile(MANIFEST_FILE_PATH, JSON.stringify(updatedData, null, 2), 'utf-8');

    // 2. Sync to Supabase drobe_app_configs table
    let dbSynced = false;
    if (isSupabaseConfigured() && supabase) {
      try {
        const { error: upsertErr } = await supabase
          .from('drobe_app_configs')
          .upsert({
            key: 'discover_brands',
            value: updatedData,
            updated_at: new Date().toISOString()
          });

        if (!upsertErr) {
          dbSynced = true;
        } else {
          console.warn('Supabase drobe_app_configs upsert error:', upsertErr.message);
        }

        // Also sync brands to drobe_brands table so inventory and brand profile link works
        const allTiles: BrandTile[] = updatedData.slides.flat().filter(Boolean);
        const brandUpserts = allTiles
          .filter(t => t.name && t.name.trim())
          .map(t => {
            const slug = slugify(t.name);
            return {
              id: slug,
              name: t.name.trim(),
              profile_image: t.img,
              category: t.categories?.[0] || 'Apparel',
              founder_name: 'Drobe Brand Partner',
              based_out_of: 'Ahmedabad / India',
              status: 'Approved',
              applied_date: new Date().toISOString(),
              approved_date: new Date().toISOString()
            };
          });

        if (brandUpserts.length > 0) {
          // Batch upsert in chunks of 50 to prevent payload limits
          for (let i = 0; i < brandUpserts.length; i += 50) {
            const chunk = brandUpserts.slice(i, i + 50);
            await supabase
              .from('drobe_brands')
              .upsert(chunk, { onConflict: 'id', ignoreDuplicates: true });
          }
        }
      } catch (dbSyncErr) {
        console.warn('Database sync exception:', dbSyncErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: dbSynced
        ? '✅ Discover Brands saved to local manifest and synced with Supabase DB!'
        : '✅ Discover Brands saved to local manifest!',
      dbSynced,
      data: updatedData
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to update discover brands' },
      { status: 500 }
    );
  }
}
