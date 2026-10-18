import { NextRequest, NextResponse } from 'next/server';
import { verifyOtpFromDb, saveVerifiedBrandAccount } from '@/app/lib/authServer';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body?.email?.trim().toLowerCase();
    const otp = body?.otp?.trim();
    const password = body?.password?.trim();
    const brandData = body?.brandData;
    const purpose = (body?.purpose === 'forgot_password' ? 'forgot_password' : 'signup') as 'signup' | 'forgot_password';

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'missing_fields', message: 'Email and 6-digit OTP code are required.' },
        { status: 400 }
      );
    }

    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { error: 'invalid_format', message: 'Please enter a valid 6-digit numeric OTP code.' },
        { status: 400 }
      );
    }

    const verification = await verifyOtpFromDb(email, otp, purpose);

    if (!verification.success) {
      return NextResponse.json(
        { error: 'verification_failed', message: verification.error || 'Invalid or expired OTP code.' },
        { status: 400 }
      );
    }

    // If signup, save verified email and password into drobe_brands DB
    let savedBrand = null;
    if (purpose === 'signup') {
      const saveRes = await saveVerifiedBrandAccount(email, password, brandData);
      if (saveRes.success) {
        savedBrand = saveRes.brand;
      }
    }

    return NextResponse.json({
      success: true,
      verified: true,
      brand: savedBrand,
      message: 'Email verified successfully and recorded in database.'
    });
  } catch (err: any) {
    console.error('Error in /api/auth/verify-otp:', err);
    return NextResponse.json(
      { error: 'server_error', message: 'An internal error occurred while verifying your OTP.' },
      { status: 500 }
    );
  }
}

