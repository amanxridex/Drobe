'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import confetti from 'canvas-confetti';

export default function CouponModal() {
  const { isCouponOpen, setIsCouponOpen, appliedCoupon, applyCoupon, removeCoupon } = useApp();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isCouponOpen) return null;

  const coupons = [
    {
      code: 'KNOTFESTIVE999',
      discount: '₹200 OFF',
      minOrder: '₹500',
      description: 'Festive special discount on all apparel orders',
      tag: 'BEST VALUE'
    },
    {
      code: 'KNOT150',
      discount: '₹150 OFF',
      minOrder: '₹399',
      description: 'Instant discount on 60-min express deliveries',
      tag: 'POPULAR'
    },
    {
      code: 'HEXAFUNXKNOT',
      discount: '₹250 OFF',
      minOrder: '₹999',
      description: 'Exclusive brand partner discount for door trial',
      tag: 'EXCLUSIVE'
    }
  ];

  const handleApply = (couponCode: string) => {
    const success = applyCoupon(couponCode);
    if (success) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.85 }
      });
      setIsCouponOpen(false);
      setError(null);
    } else {
      setError('Invalid coupon code');
    }
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
      onClick={() => setIsCouponOpen(false)}
    >
      <div
        className="animate-slide-up"
        style={{
          background: '#191922',
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          border: '1px solid #2e2e3e',
          padding: '24px 20px 36px',
          maxHeight: '80vh',
          overflowY: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 18 }}>
          <img
            src="/assets/real/coupon_bottom_sheet.webp"
            alt="Festive Offers"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="/assets/icons/coupon.svg" alt="" style={{ width: 22, height: 22 }} />
            <h3 style={{ fontSize: 17, fontWeight: 800, color: '#fff' }}>Apply Coupon</h3>
          </div>
          <button
            onClick={() => setIsCouponOpen(false)}
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

        {/* Input */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <input
            type="text"
            placeholder="Enter coupon code (e.g. KNOTFESTIVE999)"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setError(null);
            }}
            style={{
              flex: 1,
              background: '#22222d',
              border: '1px solid #363645',
              borderRadius: 14,
              padding: '12px 14px',
              color: '#fff',
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: 1,
              outline: 'none'
            }}
          />
          <button
            onClick={() => handleApply(code)}
            disabled={!code}
            style={{
              background: code ? '#ff2a85' : '#333342',
              color: '#fff',
              border: 'none',
              borderRadius: 14,
              padding: '0 20px',
              fontSize: 13,
              fontWeight: 700,
              cursor: code ? 'pointer' : 'not-allowed'
            }}
          >
            Apply
          </button>
        </div>

        {error && <div style={{ fontSize: 12, color: '#ff5555', marginBottom: 14 }}>{error}</div>}

        {/* Available Coupons */}
        <div style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
          Available Offers
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {coupons.map((c) => {
            const isApplied = appliedCoupon === c.code;

            return (
              <div
                key={c.code}
                style={{
                  background: isApplied ? 'rgba(255, 42, 133, 0.08)' : '#22222d',
                  border: isApplied ? '1.5px solid #ff2a85' : '1px solid #333344',
                  borderRadius: 16,
                  padding: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 900, color: '#fff', letterSpacing: 0.5 }}>
                      {c.code}
                    </span>
                    <span
                      style={{
                        background: isApplied ? '#ff2a85' : '#2e2e3d',
                        color: isApplied ? '#fff' : '#aaa',
                        fontSize: 9,
                        fontWeight: 800,
                        padding: '2px 6px',
                        borderRadius: 6
                      }}
                    >
                      {c.tag}
                    </span>
                  </div>

                  <div style={{ fontSize: 12, fontWeight: 700, color: '#34d399', marginTop: 4 }}>
                    {c.discount} • Min Order {c.minOrder}
                  </div>
                  <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{c.description}</div>
                </div>

                {isApplied ? (
                  <button
                    onClick={removeCoupon}
                    style={{
                      background: 'none',
                      border: '1px solid #ff2a85',
                      color: '#ff2a85',
                      borderRadius: 12,
                      padding: '8px 14px',
                      fontSize: 12,
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    onClick={() => handleApply(c.code)}
                    style={{
                      background: '#ff2a85',
                      border: 'none',
                      color: '#fff',
                      borderRadius: 12,
                      padding: '8px 16px',
                      fontSize: 12,
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    Apply
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
