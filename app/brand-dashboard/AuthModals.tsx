'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ShieldCheck, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  ArrowRight, 
  RefreshCw,
  KeyRound
} from 'lucide-react';
import styles from './brand-dashboard.module.css';

// ==============================================================================
// 1. EMAIL OTP VERIFICATION MODAL (Sign Up / Onboarding)
// ==============================================================================

interface EmailOtpModalProps {
  isOpen: boolean;
  email: string;
  password?: string;
  brandData?: any;
  onClose: () => void;
  onVerified: (savedBrand?: any) => void;
  initialDevOtp?: string;
}

export function EmailOtpModal({
  isOpen,
  email,
  password,
  brandData,
  onClose,
  onVerified,
  initialDevOtp
}: EmailOtpModalProps) {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(600); // 10 minutes
  const [resendCooldown, setResendCooldown] = useState(30);
  const [devOtpHint, setDevOtpHint] = useState<string | undefined>(initialDevOtp);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen) return;
    setSecondsLeft(600);
    setResendCooldown(30);
    setDigits(['', '', '', '', '', '']);
    setErrorMsg(null);
    if (initialDevOtp) setDevOtpHint(initialDevOtp);

    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, initialDevOtp]);

  // Focus first input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleDigitChange = (index: number, value: string) => {
    setErrorMsg(null);
    // Allow single digit
    const cleaned = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = cleaned;
    setDigits(newDigits);

    // Auto-advance
    if (cleaned && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit if all 6 digits entered
    if (cleaned && index === 5 && newDigits.every(d => d.length === 1)) {
      handleVerify(newDigits.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const newDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || '';
    }
    setDigits(newDigits);
    const nextEmptyIndex = newDigits.findIndex(d => !d);
    if (nextEmptyIndex >= 0) {
      inputRefs.current[nextEmptyIndex]?.focus();
    } else {
      inputRefs.current[5]?.focus();
      handleVerify(newDigits.join(''));
    }
  };

  const handleVerify = async (codeOverride?: string) => {
    const code = codeOverride || digits.join('');
    if (code.length !== 6) {
      setErrorMsg('Please enter all 6 digits of your verification code.');
      return;
    }

    setIsVerifying(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          otp: code,
          password,
          brandData,
          purpose: 'signup'
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.message || 'Incorrect or expired code. Please try again.');
        setIsVerifying(false);
        return;
      }

      // Success!
      setIsVerifying(false);
      onVerified(data.brand);
    } catch {
      setErrorMsg('Network error verifying code. Please check your connection.');
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || isResending) return;
    setIsResending(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          purpose: 'signup'
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.message || 'Failed to resend code.');
      } else {
        setResendCooldown(45);
        if (data.devOtp) setDevOtpHint(data.devOtp);
      }
    } catch {
      setErrorMsg('Failed to resend OTP. Please check your connection.');
    } finally {
      setIsResending(false);
    }
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timerFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 12 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          style={{
            width: '100%',
            maxWidth: '430px',
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            padding: '28px 24px',
            boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.3), 0 0 0 1px rgba(226, 232, 240, 0.8)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Top Red Gradient Accent */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '5px', background: 'linear-gradient(90deg, #dc2626 0%, #ef4444 50%, #b91c1c 100%)' }} />

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '18px',
              right: '18px',
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748b'
            }}
          >
            <X size={16} />
          </button>

          {/* Shield Emblem & From Badge */}
          <div style={{ textAlign: 'center', marginBottom: '14px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '10px',
              boxShadow: '0 8px 16px -4px rgba(220, 38, 38, 0.2)'
            }}>
              <ShieldCheck size={28} strokeWidth={2.2} />
            </div>

            <div>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '11px',
                fontWeight: 700,
                color: '#b91c1c',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                padding: '3px 10px',
                borderRadius: '20px'
              }}>
                <Mail size={11} /> Sent from verify@drobe.one
              </span>
            </div>
          </div>

          <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', textAlign: 'center', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
            Verify Brand Email
          </h3>
          <p style={{ fontSize: '13px', color: '#64748b', textAlign: 'center', margin: '0 0 20px 0', lineHeight: '19px' }}>
            Enter the 6-digit verification code sent to <strong style={{ color: '#0f172a' }}>{email}</strong>
          </p>

          {/* Dev Hint if active */}
          {devOtpHint && (
            <div style={{
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '10px',
              padding: '8px 12px',
              fontSize: '11.5px',
              color: '#15803d',
              textAlign: 'center',
              marginBottom: '14px',
              fontWeight: 600
            }}>
              🔑 Dev Verification Code: <strong>{devOtpHint}</strong>
            </div>
          )}

          {/* Error Notice */}
          {errorMsg && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fee2e2',
              borderRadius: '10px',
              padding: '10px 12px',
              fontSize: '12px',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px'
            }}>
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 6 Digit Inputs */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => { inputRefs.current[idx] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onPaste={idx === 0 ? handlePaste : undefined}
                style={{
                  width: '46px',
                  height: '54px',
                  fontSize: '24px',
                  fontWeight: 800,
                  textAlign: 'center',
                  borderRadius: '12px',
                  border: digit ? '2px solid #dc2626' : '1.5px solid #cbd5e1',
                  backgroundColor: digit ? '#fff5f5' : '#f8fafc',
                  color: digit ? '#b91c1c' : '#0f172a',
                  outline: 'none',
                  transition: 'all 0.15s ease',
                  boxShadow: digit ? '0 0 0 3px rgba(220, 38, 38, 0.1)' : 'none'
                }}
              />
            ))}
          </div>

          {/* Timer & Resend */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', marginBottom: '22px', padding: '0 4px' }}>
            <span style={{ color: secondsLeft > 0 ? '#64748b' : '#ef4444', fontWeight: 500 }}>
              {secondsLeft > 0 ? `Code expires in ${timerFormatted}` : 'Code has expired'}
            </span>

            <button
              type="button"
              onClick={handleResend}
              disabled={resendCooldown > 0 || isResending}
              style={{
                background: 'none',
                border: 'none',
                color: resendCooldown > 0 ? '#94a3b8' : '#dc2626',
                fontWeight: 700,
                fontSize: '12px',
                cursor: resendCooldown > 0 ? 'default' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {isResending ? (
                <>
                  <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Sending...</span>
                </>
              ) : resendCooldown > 0 ? (
                `Resend (${resendCooldown}s)`
              ) : (
                <>
                  <RefreshCw size={11} />
                  <span>Resend Code</span>
                </>
              )}
            </button>
          </div>

          {/* Verify Button */}
          <button
            type="button"
            onClick={() => handleVerify()}
            disabled={isVerifying || digits.join('').length !== 6}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '14px',
              backgroundColor: '#0f172a',
              border: 'none',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: 700,
              cursor: (isVerifying || digits.join('').length !== 6) ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              opacity: (isVerifying || digits.join('').length !== 6) ? 0.6 : 1,
              transition: 'all 0.15s ease'
            }}
          >
            {isVerifying ? (
              <>
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                <span>Verifying with server...</span>
              </>
            ) : (
              <>
                <span>Confirm & Proceed</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// ==============================================================================
// 2. FORGOT PASSWORD MODAL (Send OTP from verify@drobe.one & Reset Password)
// ==============================================================================

interface ForgotPasswordModalProps {
  isOpen: boolean;
  initialEmail?: string;
  onClose: () => void;
  onSuccess: (email: string) => void;
}

export function ForgotPasswordModal({
  isOpen,
  initialEmail = '',
  onClose,
  onSuccess
}: ForgotPasswordModalProps) {
  const [step, setStep] = useState<'email' | 'otp' | 'new_password' | 'done'>('email');
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setEmail(initialEmail || '');
      setStep(initialEmail ? 'otp' : 'email');
      setErrorMsg(null);
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
      // If email provided, trigger OTP dispatch
      if (initialEmail && initialEmail.includes('@')) {
        handleSendOtp(initialEmail);
      }
    }
  }, [isOpen, initialEmail]);

  const handleSendOtp = async (targetEmail: string) => {
    const clean = targetEmail.trim().toLowerCase();
    if (!clean || !clean.includes('@')) {
      setErrorMsg('Please enter a valid brand email address.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: clean,
          purpose: 'forgot_password'
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.message || 'Failed to dispatch password reset code.');
        setIsLoading(false);
        return;
      }

      if (data.devOtp) setDevOtpHint(data.devOtp);
      setEmail(clean);
      setStep('otp');
    } catch {
      setErrorMsg('Network error. Please check your internet connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.trim().length !== 6) {
      setErrorMsg('Please enter the 6-digit OTP code sent to your email.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          otp: otp.trim(),
          purpose: 'forgot_password'
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.message || 'Incorrect or expired code. Please try again.');
        setIsLoading(false);
        return;
      }

      setStep('new_password');
    } catch {
      setErrorMsg('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify your entries.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          otp: otp.trim(),
          newPassword
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.message || 'Failed to update password.');
        setIsLoading(false);
        return;
      }

      setStep('done');
      setTimeout(() => {
        onSuccess(email);
        onClose();
      }, 1600);
    } catch {
      setErrorMsg('Network error resetting password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 12 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          style={{
            width: '100%',
            maxWidth: '430px',
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            padding: '28px 24px',
            boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.3), 0 0 0 1px rgba(226, 232, 240, 0.8)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Top Red Bar */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '5px', background: 'linear-gradient(90deg, #dc2626 0%, #ef4444 50%, #b91c1c 100%)' }} />

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '18px',
              right: '18px',
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748b'
            }}
          >
            <X size={16} />
          </button>

          {/* Icon Badge */}
          <div style={{ textAlign: 'center', marginBottom: '14px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '10px',
              boxShadow: '0 8px 16px -4px rgba(220, 38, 38, 0.2)'
            }}>
              <KeyRound size={26} strokeWidth={2.2} />
            </div>

            <div>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '11px',
                fontWeight: 700,
                color: '#b91c1c',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                padding: '3px 10px',
                borderRadius: '20px'
              }}>
                <Mail size={11} /> Sent from verify@drobe.one
              </span>
            </div>
          </div>

          <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', textAlign: 'center', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
            Reset Password
          </h3>
          <p style={{ fontSize: '13px', color: '#64748b', textAlign: 'center', margin: '0 0 20px 0', lineHeight: '19px' }}>
            {step === 'email' && 'Enter your brand email address to receive a secure recovery code.'}
            {step === 'otp' && `Enter the 6-digit code sent to ${email} from verify@drobe.one`}
            {step === 'new_password' && 'Choose a secure new password for your brand space.'}
            {step === 'done' && 'Password updated successfully! Redirecting...'}
          </p>

          {devOtpHint && step === 'otp' && (
            <div style={{
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '10px',
              padding: '8px 12px',
              fontSize: '11.5px',
              color: '#15803d',
              textAlign: 'center',
              marginBottom: '14px',
              fontWeight: 600
            }}>
              🔑 Dev Reset Code: <strong>{devOtpHint}</strong>
            </div>
          )}

          {errorMsg && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fee2e2',
              borderRadius: '10px',
              padding: '10px 12px',
              fontSize: '12px',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px'
            }}>
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: Enter Email */}
          {step === 'email' && (
            <div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Brand Email
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="founder@yourbrand.com"
                    autoFocus
                    style={{
                      width: '100%',
                      padding: '12px 14px 12px 38px',
                      borderRadius: '12px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleSendOtp(email)}
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '13px',
                  borderRadius: '12px',
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                {isLoading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : 'Send Code to Email'}
              </button>
            </div>
          )}

          {/* STEP 2: Enter 6-digit OTP */}
          {step === 'otp' && (
            <div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  6-Digit Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 582910"
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '12px',
                    border: '2px solid #dc2626',
                    fontSize: '22px',
                    fontWeight: 800,
                    letterSpacing: '8px',
                    textAlign: 'center',
                    outline: 'none',
                    boxSizing: 'border-box',
                    backgroundColor: '#fff5f5',
                    color: '#b91c1c'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '12px',
                    backgroundColor: '#f1f5f9',
                    border: '1px solid #e2e8f0',
                    color: '#334155',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Change Email
                </button>
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={isLoading || otp.length !== 6}
                  style={{
                    flex: 1.5,
                    padding: '12px',
                    borderRadius: '12px',
                    backgroundColor: '#0f172a',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: (isLoading || otp.length !== 6) ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    opacity: (isLoading || otp.length !== 6) ? 0.6 : 1
                  }}
                >
                  {isLoading ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : 'Verify Code'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Enter New Password */}
          {step === 'new_password' && (
            <div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    autoFocus
                    style={{
                      width: '100%',
                      padding: '12px 40px 12px 38px',
                      borderRadius: '12px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Confirm New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    style={{
                      width: '100%',
                      padding: '12px 40px 12px 38px',
                      borderRadius: '12px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <button
                type="button"
                onClick={handleResetPassword}
                disabled={isLoading || newPassword.length < 6 || newPassword !== confirmPassword}
                style={{
                  width: '100%',
                  padding: '13px',
                  borderRadius: '12px',
                  backgroundColor: '#0f172a',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  cursor: (isLoading || newPassword.length < 6) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  opacity: (isLoading || newPassword.length < 6) ? 0.6 : 1
                }}
              >
                {isLoading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : 'Update Password & Access Brand Space'}
              </button>
            </div>
          )}

          {/* STEP 4: Success Message */}
          {step === 'done' && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: '#dcfce7',
                color: '#16a34a',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px'
              }}>
                <CheckCircle2 size={32} />
              </div>
              <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
                Password Updated!
              </h4>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                Your brand account is now secured with your new password.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
