import { NextRequest, NextResponse } from 'next/server';
import { checkEmailExistsInDb } from '@/app/lib/authServer';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email')?.trim().toLowerCase();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'invalid_email', message: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    const { exists, brand } = await checkEmailExistsInDb(email);

    return NextResponse.json({
      exists,
      brandName: brand?.name || undefined,
      brandId: brand?.id || undefined
    });
  } catch (err: any) {
    console.error('Error in GET /api/auth/check-email:', err);
    return NextResponse.json(
      { error: 'server_error', message: 'Failed to check email status.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body?.email?.trim().toLowerCase();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'invalid_email', message: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    const { exists, brand } = await checkEmailExistsInDb(email);

    return NextResponse.json({
      exists,
      brandName: brand?.name || undefined,
      brandId: brand?.id || undefined
    });
  } catch (err: any) {
    console.error('Error in POST /api/auth/check-email:', err);
    return NextResponse.json(
      { error: 'server_error', message: 'Failed to check email status.' },
      { status: 500 }
    );
  }
}
