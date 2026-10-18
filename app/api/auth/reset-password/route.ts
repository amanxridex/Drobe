import { NextRequest, NextResponse } from 'next/server';
import { verifyOtpFromDb, updateBrandPasswordInDb } from '@/app/lib/authServer';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body?.email?.trim().toLowerCase();
    const otp = body?.otp?.trim();
    const newPassword = body?.newPassword?.trim();

    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { error: 'missing_fields', message: 'Email, OTP, and new password are required.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'weak_password', message: 'New password must be at least 6 characters.' },
        { status: 400 }
      );
    }

    // 1. Verify OTP first
    const verification = await verifyOtpFromDb(email, otp, 'forgot_password');
    if (!verification.success) {
      return NextResponse.json(
        { error: 'verification_failed', message: verification.error || 'Invalid or expired OTP code.' },
        { status: 400 }
      );
    }

    // 2. Update password in Database
    const updated = await updateBrandPasswordInDb(email, newPassword);
    if (!updated) {
      return NextResponse.json(
        { error: 'update_failed', message: 'Failed to update password in database. Please check your email.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully. You can now log into your brand portal.'
    });
  } catch (err: any) {
    console.error('Error in /api/auth/reset-password:', err);
    return NextResponse.json(
      { error: 'server_error', message: 'An internal error occurred while resetting your password.' },
      { status: 500 }
    );
  }
}
