'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';

export default function AuthModal() {
  const { isAuthOpen, setIsAuthOpen, loginUser } = useApp();
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [otp, setOtp] = useState(['', '', '', '']);

  if (!isAuthOpen) return null;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length === 10) {
      setStep('otp');
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    loginUser('+91 ' + phone);
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 100,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        overflow: 'hidden'
      }}
      onClick={() => setIsAuthOpen(false)}
    >
      <div
        className="animate-slide-up"
        style={{
          background: '#181820',
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          border: '1px solid #2e2e3a',
          padding: '24px 20px 36px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="/assets/images/knot-mono.png" alt="KNOT" style={{ height: 28, width: 'auto' }} />
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: '#fff' }}>
                {step === 'phone' ? 'Login or Sign Up' : 'Enter 4-Digit OTP'}
              </h3>
              <p style={{ fontSize: 11, color: '#888' }}>
                {step === 'phone' ? 'Get fashion delivered in 60 minutes' : `Sent to +91 ${phone}`}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAuthOpen(false)}
            style={{
              background: '#242430',
              border: 'none',
              borderRadius: '50%',
              width: 30,
              height: 30,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <img src="/assets/icons/cross_close.svg" alt="Close" style={{ width: 14, height: 14 }} />
          </button>
        </div>

        {step === 'phone' ? (
          <form onSubmit={handleSendOtp}>
            <div
              style={{
                background: '#22222d',
                border: '1px solid #363645',
                borderRadius: 14,
                display: 'flex',
                alignItems: 'center',
                padding: '12px 14px',
                marginBottom: 16,
                gap: 10
              }}
            >
              <img src="/assets/icons/cellphone_outline.svg" alt="" style={{ width: 18, height: 18, opacity: 0.7 }} />
              <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>+91</span>
              <input
                type="tel"
                placeholder="Enter 10-digit mobile number"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                autoFocus
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 600,
                  width: '100%'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={phone.length !== 10}
              style={{
                width: '100%',
                background: phone.length === 10 ? '#6678ff' : '#333342',
                color: phone.length === 10 ? '#ffffff' : '#777785',
                border: 'none',
                borderRadius: 14,
                padding: '14px',
                fontSize: 14,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                cursor: phone.length === 10 ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease'
              }}
            >
              Get OTP <img src="/assets/icons/right.svg" alt="" style={{ width: 14, height: 14, filter: 'brightness(0) invert(1)' }} />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 20 }}>
              {[0, 1, 2, 3].map((idx) => (
                <input
                  key={idx}
                  type="text"
                  maxLength={1}
                  value={otp[idx]}
                  onChange={(e) => {
                    const val = e.target.value;
                    const newOtp = [...otp];
                    newOtp[idx] = val;
                    setOtp(newOtp);
                    if (val && e.target.nextElementSibling) {
                      (e.target.nextElementSibling as HTMLInputElement).focus();
                    }
                  }}
                  style={{
                    width: 48,
                    height: 52,
                    background: '#22222d',
                    border: '1px solid #363648',
                    borderRadius: 12,
                    textAlign: 'center',
                    fontSize: 20,
                    fontWeight: 800,
                    color: '#fff',
                    outline: 'none'
                  }}
                />
              ))}
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                background: '#6678ff',
                color: '#fff',
                border: 'none',
                borderRadius: 14,
                padding: '14px',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Verify & Log In
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
