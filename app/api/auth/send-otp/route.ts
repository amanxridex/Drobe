import { NextRequest, NextResponse } from 'next/server';
import { generateOtp, saveOtpToDb, checkEmailExistsInDb } from '@/app/lib/authServer';
import { sendDrobeOtpEmail } from '@/app/lib/emailService';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body?.email?.trim().toLowerCase();
    const purpose = (body?.purpose === 'forgot_password' ? 'forgot_password' : 'signup') as 'signup' | 'forgot_password';

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'invalid_email', message: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    // 1. Check if email already exists when signing up
    const { exists, brand } = await checkEmailExistsInDb(email);

    if (purpose === 'signup' && exists) {
      return NextResponse.json(
        {
          error: 'already_exists',
          message: `This email is already registered with brand "${brand?.name || 'Partner'}". Please log in or click "Forgot Password" to reset your password.`,
          brandName: brand?.name,
          brandId: brand?.id
        },
        { status: 409 }
      );
    }

    if (purpose === 'forgot_password' && !exists) {
      return NextResponse.json(
        {
          error: 'not_found',
          message: 'No registered brand account found with this email. Please verify your email or sign up.'
        },
        { status: 404 }
      );
    }

    // 2. Generate 6-digit OTP
    const otp = generateOtp();

    // 3. Save to database / config table with 10-minute expiry
    await saveOtpToDb(email, otp, purpose);

    // 4. Send email from verify@drobe.one via Nodemailer
    const emailRes = await sendDrobeOtpEmail({
      to: email,
      otp,
      purpose
    });

    if (!emailRes.success) {
      return NextResponse.json(
        { error: 'send_failed', message: 'Failed to dispatch verification email. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `A 6-digit verification code has been dispatched to ${email} from verify@drobe.one.`,
      // If dev fallback mode, provide preview for convenience
      ...(emailRes.devOtp ? { devOtp: emailRes.devOtp } : {})
    });
  } catch (err: any) {
    console.error('Error in /api/auth/send-otp:', err);
    return NextResponse.json(
      { error: 'server_error', message: 'An internal error occurred while generating your OTP.' },
      { status: 500 }
    );
  }
}
