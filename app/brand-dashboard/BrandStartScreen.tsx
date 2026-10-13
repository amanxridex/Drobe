'use client';

import React, { useState } from 'react';
import { X, Lock, Mail, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { BrandProfile } from './types';
import styles from './brand-dashboard.module.css';

interface BrandStartScreenProps {
  brand: BrandProfile;
  onStartOnboarding: () => void;
  onViewLiveDashboard: () => void;
  onResetBrand?: () => void;
  onLoginSuccess?: (email: string) => void;
}

export default function BrandStartScreen({
  brand,
  onStartOnboarding,
  onViewLiveDashboard,
  onResetBrand,
  onLoginSuccess
}: BrandStartScreenProps) {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const isAlreadyLive = brand.status === 'Published' && Boolean(brand.name?.trim());
  const hasDraft = Boolean(brand.name?.trim()) && !isAlreadyLive;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const emailTrimmed = loginEmail.trim();
    if (!emailTrimmed || !emailTrimmed.includes('@')) {
      setLoginError('Please enter a valid atelier email address.');
      return;
    }

    if (!loginPassword || loginPassword.length < 6) {
      setLoginError('Password must be at least 6 characters.');
      return;
    }

    if (onLoginSuccess) {
      onLoginSuccess(emailTrimmed);
    } else {
      onStartOnboarding();
    }
    setShowLoginModal(false);
  };

  return (
    <div className={styles.screen1Container}>
      {/* 1. Official DROBE Logo Showcase */}
      <div className={styles.screen1LogoArea}>
        <img
          src="/drobe-logo.png"
          alt="Drobe"
          className={styles.screen1MainLogo}
        />
      </div>

      {/* 2. Apple SF Thin Typography Pitch */}
      <div className={styles.screen1TextSection}>
        <h1 className={styles.screen1Title}>
          Start your new<br />Brand Journey
        </h1>

        <p className={styles.screen1Subtext}>
          List your luxury atelier, curate your signature collection, and connect directly with discerning clients on Drobe.
        </p>
      </div>

      {/* 3. Real Action Buttons */}
      <div className={styles.screen1BottomSection}>
        {isAlreadyLive ? (
          <>
            <button
              type="button"
              onClick={onViewLiveDashboard}
              className={styles.screen1BtnPrimary}
            >
              Open Brand Dashboard
            </button>

            <button
              type="button"
              onClick={onStartOnboarding}
              className={styles.screen1BtnSecondary}
            >
              Edit Brand Details
            </button>
          </>
        ) : hasDraft ? (
          <>
            <button
              type="button"
              onClick={onStartOnboarding}
              className={styles.screen1BtnPrimary}
            >
              Continue Onboarding ({brand.name})
            </button>

            <button
              type="button"
              onClick={() => setShowLoginModal(true)}
              className={styles.screen1BtnSecondary}
            >
              Log In
            </button>

            {onResetBrand && (
              <button
                type="button"
                onClick={onResetBrand}
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '12px', cursor: 'pointer', marginTop: '6px' }}
              >
                Start Fresh Application
              </button>
            )}
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={onStartOnboarding}
              className={styles.screen1BtnPrimary}
            >
              Get Started
            </button>

            <button
              type="button"
              onClick={() => setShowLoginModal(true)}
              className={styles.screen1BtnSecondary}
            >
              Log In
            </button>
          </>
        )}

        <div className={styles.screen1Footnote}>
          Drobe Partner Portal · Verified Luxury Ateliers
        </div>
      </div>

      {/* 4. Partner Log In Modal (Clean Apple White Theme) */}
      {showLoginModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(4px)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '440px',
            backgroundColor: '#ffffff',
            borderTopLeftRadius: '28px',
            borderTopRightRadius: '28px',
            padding: '26px 22px 34px 22px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 -12px 48px rgba(15, 23, 42, 0.14)',
            maxHeight: '85vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
              <div>
                <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#0284c7', fontWeight: 700 }}>
                  PARTNER PORTAL
                </span>
                <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#0f172a', margin: '3px 0 2px 0', letterSpacing: '-0.02em' }}>
                  Log In to Atelier
                </h3>
                <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                  Sign in with your email and password to access your brand store.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowLoginModal(false);
                  setLoginError(null);
                }}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {loginError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', color: '#b91c1c', fontSize: '12px', marginBottom: '14px' }}>
                <AlertCircle size={15} />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '11px', color: '#475569', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Atelier Email
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="founder@yourbrand.com"
                    required
                    style={{
                      width: '100%',
                      padding: '12px 14px 12px 38px',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '14px',
                      color: '#0f172a',
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '11px', color: '#475569', textTransform: 'uppercase', fontWeight: 600 }}>
                    Password
                  </label>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    style={{
                      width: '100%',
                      padding: '12px 40px 12px 38px',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '14px',
                      color: '#0f172a',
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      padding: '2px',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  height: '48px',
                  borderRadius: '9999px',
                  backgroundColor: '#0f172a',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  letterSpacing: '-0.01em',
                  transition: 'opacity 0.15s ease'
                }}
              >
                Log In
              </button>

              <div style={{ marginTop: '14px', textAlign: 'center' }}>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  New to Drobe?{' '}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setShowLoginModal(false);
                    onStartOnboarding();
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#0f172a',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    padding: 0
                  }}
                >
                  Get Started
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
