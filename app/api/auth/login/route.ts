import { NextRequest, NextResponse } from 'next/server';
import { authenticateBrand } from '@/app/lib/authServer';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body?.email?.trim().toLowerCase();
    const password = body?.password?.trim();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'missing_fields', message: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const authResult = await authenticateBrand(email, password);

    if (!authResult.success) {
      return NextResponse.json(
        { error: 'auth_failed', message: authResult.error || 'Authentication failed.' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      brand: authResult.brand,
      message: 'Logged in successfully.'
    });
  } catch (err: any) {
    console.error('Error in /api/auth/login:', err);
    return NextResponse.json(
      { error: 'server_error', message: 'An internal error occurred during authentication.' },
      { status: 500 }
    );
  }
}
