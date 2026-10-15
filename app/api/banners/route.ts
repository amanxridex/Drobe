import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'lookbook_banners.json');

const DEFAULT_BANNERS = {
  men: [
    {
      id: 'banana-club',
      title: 'Banana Club',
      img: '/assets/real/lookbook_banner_2.webp',
      route: '/product/29393',
      brand: 'Banana Club'
    },
    {
      id: 'fkn-casanova',
      title: 'F/KN Casanova',
      img: '/assets/real/lookbook_banner_1.webp',
      route: '/product/36440',
      brand: 'F/KN Casanova'
    },
    {
      id: 'powerlook',
      title: 'Powerlook',
      img: '/assets/real/lookbook_banner_4.webp',
      route: '/product/37600',
      brand: 'Powerlook'
    },
    {
      id: 'on3mile',
      title: 'On3Mile',
      img: '/assets/real/lookbook_banner_9.webp',
      route: '/product/31561',
      brand: 'On3Mile'
    },
    {
      id: 'brand-spotlight',
      title: 'Brand Spotlight',
      img: '/assets/real/lookbook_banner_6.webp',
      route: '/product/12671',
      brand: 'Brand Spotlight'
    }
  ],
  women: [
    {
      id: 'dandiya-drops',
      title: 'Dandiya Drops',
      img: '/assets/real/lookbook_women_1_dandiya.webp',
      route: '/collection/ethnic',
      brand: 'Dandiya Drops'
    },
    {
      id: 'desi-baddie',
      title: 'Desi Baddie',
      img: '/assets/real/lookbook_women_2_desibaddie.webp',
      route: '/collection/ethnic',
      brand: 'Desi Baddie'
    },
    {
      id: 'chkokko',
      title: 'Chkokko',
      img: '/assets/real/lookbook_women_3_chkokko.webp',
      route: '/collection/top',
      brand: 'Chkokko'
    },
    {
      id: 'souled-store',
      title: 'The Souled Store',
      img: '/assets/real/lookbook_women_4_souledstore.webp',
      route: '/collection/dresses',
      brand: 'The Souled Store'
    },
    {
      id: 'pink-fort',
      title: 'Pink Fort',
      img: '/assets/real/lookbook_women_5_pinkfort.webp',
      route: '/collection/ethnic',
      brand: 'Pink Fort'
    },
    {
      id: 'nee',
      title: 'नी New Collection',
      img: '/assets/real/lookbook_women_6_nee.webp',
      route: '/collection/ethnic',
      brand: 'नी'
    },
    {
      id: 'tequila',
      title: 'Tequila',
      img: '/assets/real/lookbook_women_7_tequila.webp',
      route: '/collection/dresses',
      brand: 'Tequila'
    },
    {
      id: 'tilt',
      title: 'Tilt Bamboo',
      img: '/assets/real/lookbook_women_8_tilt.webp',
      route: '/collection/bottom',
      brand: 'Tilt Bamboo'
    }
  ]
};

async function readBanners() {
  try {
    const raw = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    return {
      men: Array.isArray(parsed.men) ? parsed.men : DEFAULT_BANNERS.men,
      women: Array.isArray(parsed.women) ? parsed.women : DEFAULT_BANNERS.women
    };
  } catch {
    return DEFAULT_BANNERS;
  }
}

export async function GET() {
  try {
    const banners = await readBanners();
    return NextResponse.json({
      success: true,
      banners
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to read lookbook banners' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const current = await readBanners();

    let updated = { ...current };

    if (body.men && Array.isArray(body.men)) {
      updated.men = body.men;
    }
    if (body.women && Array.isArray(body.women)) {
      updated.women = body.women;
    }

    // Support single gender updates: { gender: 'men', banners: [...] }
    if (body.gender && Array.isArray(body.banners)) {
      if (body.gender === 'men') updated.men = body.banners;
      if (body.gender === 'women') updated.women = body.banners;
    }

    // Ensure directory exists
    await fs.mkdir(path.dirname(DATA_FILE_PATH), { recursive: true });
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(updated, null, 2), 'utf-8');

    return NextResponse.json({
      success: true,
      message: 'Lookbook banners successfully saved and published!',
      banners: updated
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to update lookbook banners' },
      { status: 500 }
    );
  }
}
