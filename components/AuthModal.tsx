'use client';

import React, { useState, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  Camera, 
  X, 
  Check, 
  AlertCircle, 
  Sparkles,
  ShoppingBag,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { supabaseUploadMedia } from '@/app/lib/supabaseClient';

const PRESET_AVATARS = [
  { id: 'av-flash', label: '⚡ Energy', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80' },
  { id: 'av-shades', label: '🕶️ Street', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80' },
  { id: 'av-cap', label: '🧢 Minimal', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80' },
  { id: 'av-sneaker', label: '👟 Kicks', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80' }
];

export default function AuthModal() {
  const { isAuthOpen, setIsAuthOpen, signUpWithEmail, signInWithEmail } = useApp();

  const [mode, setMode] = useState<'signin' | 'signup'>('signup');
  const [showPassword, setShowPassword] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isAuthOpen) return null;

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image size should be under 5MB');
      return;
    }

    try {
      setIsUploadingAvatar(true);
      setErrorMsg(null);

      // Local preview immediately
      const previewUrl = URL.createObjectURL(file);
      setAvatarUrl(previewUrl);

      // Attempt upload to Supabase storage drobe-media bucket
      const uploaded = await supabaseUploadMedia(file, 'profiles/avatars');
      if (uploaded?.url) {
        setAvatarUrl(uploaded.url);
      }
    } catch (err) {
      console.warn('Avatar upload fallback to local preview:', err);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanPhone = phone.replace(/\D/g, '');

    if (!cleanName) {
      setErrorMsg('Please enter your full name');
      return;
    }
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMsg('Please enter a valid email address');
      return;
    }
    if (cleanPhone.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    const formattedPhone = `+91 ${cleanPhone}`;

    const res = await signUpWithEmail({
      name: cleanName,
      email: cleanEmail,
      phone: formattedPhone,
      password,
      avatarUrl: avatarUrl || undefined
    });

    setIsLoading(false);

    if (res.success) {
      setSuccessMsg('Account created successfully!');
      confetti({ particleCount: 70, spread: 65, origin: { y: 0.7 } });
      setTimeout(() => {
        setIsAuthOpen(false);
      }, 700);
    } else {
      setErrorMsg(res.error || 'Failed to create account. Please try again.');
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('Please enter your registered email address');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your password');
      return;
    }

    setIsLoading(true);

    const res = await signInWithEmail({
      email: cleanEmail,
      password
    });

    setIsLoading(false);

    if (res.success) {
      setSuccessMsg('Welcome back!');
      confetti({ particleCount: 50, spread: 55, origin: { y: 0.7 } });
      setTimeout(() => {
        setIsAuthOpen(false);
      }, 600);
    } else {
      setErrorMsg(res.error || 'Invalid email or password');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.82)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        padding: '0 0 max(env(safe-area-inset-bottom), 0px)'
      }}
      onClick={() => setIsAuthOpen(false)}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 440,
          background: '#121217',
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          border: '1px solid #272733',
          borderBottom: 'none',
          padding: '24px 22px 32px',
          maxHeight: '92vh',
          overflowY: 'auto',
          boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.8)',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Handle / Close Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                background: '#ffffff',
                color: '#000000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: 16
              }}
            >
              D
            </div>
            <div>
              <span style={{ fontSize: 13, fontWeight: 900, letterSpacing: '0.08em', color: '#ffffff', textTransform: 'uppercase' }}>
                DROBE ID
              </span>
              <div style={{ fontSize: 11, color: '#888899' }}>
                Ahmedabad 30-Min Fast-Fashion Auth
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsAuthOpen(false)}
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: '#1f1f2a',
              border: '1px solid #2d2d3d',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display: 'flex',
            background: '#1a1a24',
            borderRadius: 14,
            padding: 4,
            marginBottom: 20,
            border: '1px solid #282838'
          }}
        >
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMsg(null);
            }}
            style={{
              flex: 1,
              padding: '10px 0',
              borderRadius: 10,
              background: mode === 'signup' ? '#ffffff' : 'transparent',
              color: mode === 'signup' ? '#000000' : '#888899',
              fontSize: 13,
              fontWeight: 800,
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMsg(null);
            }}
            style={{
              flex: 1,
              padding: '10px 0',
              borderRadius: 10,
              background: mode === 'signin' ? '#ffffff' : 'transparent',
              color: mode === 'signin' ? '#000000' : '#888899',
              fontSize: 13,
              fontWeight: 800,
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Sign In
          </button>
        </div>

        {/* Headline */}
        <div style={{ marginBottom: 18 }}>
          <h2 style={{ fontSize: 19, fontWeight: 800, margin: '0 0 4px', color: '#ffffff', letterSpacing: '-0.02em' }}>
            {mode === 'signup' ? 'Join Drobe to Shop & Try Fits' : 'Welcome Back'}
          </h2>
          <p style={{ fontSize: 12.5, color: '#888899', margin: 0, lineHeight: 1.45 }}>
            {mode === 'signup'
              ? 'Enter your name, email, phone number & password to unlock your cart and 30-min doorstep trial.'
              : 'Sign in with your email and password to access your bag, saved addresses, and active orders.'}
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 12,
              padding: '10px 14px',
              marginBottom: 16,
              color: '#f87171',
              fontSize: 12.5,
              fontWeight: 600
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(34, 197, 94, 0.12)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: 12,
              padding: '10px 14px',
              marginBottom: 16,
              color: '#4ade80',
              fontSize: 12.5,
              fontWeight: 700
            }}
          >
            <Check size={16} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ====================================================================
            MODE 1: SIGN UP FORM
            ==================================================================== */}
        {mode === 'signup' ? (
          <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Optional Profile Picture Upload & Presets */}
            <div
              style={{
                background: '#191922',
                border: '1px dashed #2d2d3e',
                borderRadius: 16,
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 14
              }}
            >
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: avatarUrl ? `url(${avatarUrl}) center/cover no-repeat` : '#252535',
                  border: '2px solid #ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                  flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                }}
                title="Click to upload profile photo"
              >
                {!avatarUrl && <Camera size={22} color="#ffffff" />}
                <div
                  style={{
                    position: 'absolute',
                    bottom: -2,
                    right: -2,
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: '#ffffff',
                    color: '#000000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 900
                  }}
                >
                  +
                </div>
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: '#ffffff' }}>
                    Profile Photo <span style={{ fontSize: 11, color: '#888899', fontWeight: 500 }}>(Optional)</span>
                  </span>
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setAvatarUrl('')}
                      style={{ background: 'none', border: 'none', color: '#f87171', fontSize: 11, cursor: 'pointer', padding: 0 }}
                    >
                      Remove
                    </button>
                  )}
                </div>
                <p style={{ fontSize: 11, color: '#888899', margin: '2px 0 8px' }}>
                  {isUploadingAvatar ? 'Uploading image...' : 'Tap circle to upload your photo, or pick an avatar:'}
                </p>

                {/* Quick Avatar Presets */}
                <div style={{ display: 'flex', gap: 6 }}>
                  {PRESET_AVATARS.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => setAvatarUrl(av.url)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: 12,
                        background: avatarUrl === av.url ? '#ffffff' : '#222230',
                        color: avatarUrl === av.url ? '#000000' : '#cccccc',
                        fontSize: 10.5,
                        fontWeight: 700,
                        border: avatarUrl === av.url ? 'none' : '1px solid #333344',
                        cursor: 'pointer'
                      }}
                    >
                      {av.label}
                    </button>
                  ))}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFileChange}
                  style={{ display: 'none' }}
                />
              </div>
            </div>

            {/* Full Name */}
            <div style={{ background: '#191922', border: '1px solid #2a2a3a', borderRadius: 14, padding: '10px 14px' }}>
              <label style={{ fontSize: 10.5, fontWeight: 800, color: '#888899', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 4 }}>
                Full Name *
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <User size={16} color="#888899" />
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={{
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: '#ffffff',
                    fontSize: 14,
                    fontWeight: 600,
                    width: '100%'
                  }}
                />
              </div>
            </div>

            {/* Email Address */}
            <div style={{ background: '#191922', border: '1px solid #2a2a3a', borderRadius: 14, padding: '10px 14px' }}>
              <label style={{ fontSize: 10.5, fontWeight: 800, color: '#888899', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 4 }}>
                Email Address *
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Mail size={16} color="#888899" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: '#ffffff',
                    fontSize: 14,
                    fontWeight: 600,
                    width: '100%'
                  }}
                />
              </div>
            </div>

            {/* Phone Number */}
            <div style={{ background: '#191922', border: '1px solid #2a2a3a', borderRadius: 14, padding: '10px 14px' }}>
              <label style={{ fontSize: 10.5, fontWeight: 800, color: '#888899', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 4 }}>
                Phone Number (For 30-Min Delivery Alerts) *
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Phone size={16} color="#888899" />
                <span style={{ fontSize: 13.5, fontWeight: 800, color: '#ffffff' }}>+91</span>
                <input
                  type="tel"
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  required
                  style={{
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: '#ffffff',
                    fontSize: 14,
                    fontWeight: 600,
                    width: '100%'
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ background: '#191922', border: '1px solid #2a2a3a', borderRadius: 14, padding: '10px 14px' }}>
              <label style={{ fontSize: 10.5, fontWeight: 800, color: '#888899', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 4 }}>
                Password (Min 6 Characters) *
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Lock size={16} color="#888899" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: '#ffffff',
                    fontSize: 14,
                    fontWeight: 600,
                    width: '100%'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ background: 'none', border: 'none', color: '#888899', cursor: 'pointer', padding: 0 }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '14px 0',
                borderRadius: 14,
                background: '#ffffff',
                color: '#000000',
                fontSize: 14,
                fontWeight: 800,
                border: 'none',
                cursor: isLoading ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                marginTop: 6,
                boxShadow: '0 4px 20px rgba(255, 255, 255, 0.2)'
              }}
            >
              {isLoading ? 'Creating Account & Generating Token...' : 'Create Account & Unlock Bag'}
              {!isLoading && <ArrowRight size={16} />}
            </button>

            <div style={{ textAlign: 'center', marginTop: 4 }}>
              <span style={{ fontSize: 12, color: '#888899' }}>Already have an account? </span>
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErrorMsg(null);
                }}
                style={{ background: 'none', border: 'none', color: '#ffffff', fontSize: 12, fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
              >
                Sign In
              </button>
            </div>
          </form>
        ) : (
          /* ====================================================================
             MODE 2: SIGN IN FORM
             ==================================================================== */
          <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Email Address */}
            <div style={{ background: '#191922', border: '1px solid #2a2a3a', borderRadius: 14, padding: '10px 14px' }}>
              <label style={{ fontSize: 10.5, fontWeight: 800, color: '#888899', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 4 }}>
                Registered Email Address *
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Mail size={16} color="#888899" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  style={{
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: '#ffffff',
                    fontSize: 14,
                    fontWeight: 600,
                    width: '100%'
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ background: '#191922', border: '1px solid #2a2a3a', borderRadius: 14, padding: '10px 14px' }}>
              <label style={{ fontSize: 10.5, fontWeight: 800, color: '#888899', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 4 }}>
                Password *
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Lock size={16} color="#888899" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: '#ffffff',
                    fontSize: 14,
                    fontWeight: 600,
                    width: '100%'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ background: 'none', border: 'none', color: '#888899', cursor: 'pointer', padding: 0 }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '14px 0',
                borderRadius: 14,
                background: '#ffffff',
                color: '#000000',
                fontSize: 14,
                fontWeight: 800,
                border: 'none',
                cursor: isLoading ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                marginTop: 6,
                boxShadow: '0 4px 20px rgba(255, 255, 255, 0.2)'
              }}
            >
              {isLoading ? 'Verifying Credentials...' : 'Sign In to Drobe'}
              {!isLoading && <ArrowRight size={16} />}
            </button>

            <div style={{ textAlign: 'center', marginTop: 4 }}>
              <span style={{ fontSize: 12, color: '#888899' }}>Don't have an account? </span>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMsg(null);
                }}
                style={{ background: 'none', border: 'none', color: '#ffffff', fontSize: 12, fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
              >
                Create Account
              </button>
            </div>
          </form>
        )}

        {/* Security Footer */}
        <div style={{ marginTop: 22, paddingTop: 14, borderTop: '1px solid #1f1f2d', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <Lock size={12} color="#666677" />
          <span style={{ fontSize: 11, color: '#666677', fontWeight: 600 }}>
            Protected by Supabase JWT Auth &amp; 256-bit AES encryption
          </span>
        </div>
      </div>
    </div>
  );
}
