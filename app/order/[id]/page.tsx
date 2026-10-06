'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { PRODUCTS } from '@/data/catalog';
import confetti from 'canvas-confetti';

export default function OrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const { orders, updateDoorstepStatus, location } = useApp();

  const orderId = params?.id as string;
  const currentOrder = orders.find((o) => o.id === orderId) || orders[0] || {
    id: 'KNOT-482910',
    totalAmount: PRODUCTS[0].price,
    deliveryMinutes: 60,
    status: 'arrived',
    createdAt: new Date().toISOString(),
    trialSecondsRemaining: 745,
    deliveryAddress: location,
    items: [
      {
        item: {
          product: PRODUCTS[0],
          size: 'L',
          quantity: 1,
          trialMode: 'tryAndBuy'
        },
        status: 'pending'
      }
    ]
  };

  // 15-minute trial countdown
  const [secondsLeft, setSecondsLeft] = useState(currentOrder.trialSecondsRemaining || 840);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  const handleDecision = (idx: number, decision: 'kept' | 'returned') => {
    updateDoorstepStatus(currentOrder.id, idx, decision);
    if (decision === 'kept') {
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', background: '#14141a', overflow: 'hidden' }}>
      {/* Header */}
      <header
        style={{
          padding: '14px 16px',
          background: '#14141a',
          borderBottom: '1px solid #22222c',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            onClick={() => router.push('/')}
            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', padding: 0 }}
          >
            <img src="/assets/icons/back_arrow.svg" alt="Back" style={{ width: 22, height: 22 }} />
          </button>
          <div>
            <h1 style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>Order #{currentOrder.id}</h1>
            <p style={{ fontSize: 11, color: '#888' }}>Live 60-Min Doorstep Trial</p>
          </div>
        </div>

        <div style={{ background: '#0f382c', padding: '4px 10px', borderRadius: 12, border: '1px solid #1c5e48' }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: '#34d399' }}>⚡ ACTIVE</span>
        </div>
      </header>

      {/* Main Body */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 80px' }}>
        {/* 15-Minute Trial Countdown Box */}
        <div
          style={{
            background: 'linear-gradient(135deg, #182234 0%, #171b26 100%)',
            border: '1px solid #283a54',
            borderRadius: 20,
            padding: '18px',
            textAlign: 'center',
            marginBottom: 20,
            boxShadow: '0 8px 25px rgba(0,0,0,0.5)'
          }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(56,189,248,0.15)', padding: '4px 12px', borderRadius: 20, color: '#38bdf8', fontSize: 11, fontWeight: 800, marginBottom: 8 }}>
            <img src="/assets/icons/stopwatch.svg" alt="" style={{ width: 14, height: 14 }} />
            <span>DOORSTEP TRIAL IN PROGRESS</span>
          </div>

          <div style={{ fontSize: 36, fontWeight: 900, color: '#ffffff', letterSpacing: 1, fontFamily: 'monospace' }}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>

          <p style={{ fontSize: 12, color: '#aaa', marginTop: 4 }}>
            Rider is waiting outside. Try your outfits and choose below!
          </p>
        </div>

        {/* Courier Rider Contact Card */}
        <div
          style={{
            background: '#1d1d28',
            border: '1px solid #2d2d3e',
            borderRadius: 18,
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#353548', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src="/assets/icons/lucide_bike.svg" alt="" style={{ width: 22, height: 22 }} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>Knot Delivery Partner</div>
              <div style={{ fontSize: 11, color: '#34d399', fontWeight: 600 }}>At your doorstep with Trial Bag</div>
            </div>
          </div>

          <a
            href="tel:+919876543210"
            style={{
              background: '#2c3e50',
              border: 'none',
              borderRadius: '50%',
              width: 38,
              height: 38,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none'
            }}
          >
            <img src="/assets/icons/call.svg" alt="Call" style={{ width: 18, height: 18 }} />
          </a>
        </div>

        {/* Delivery Address Card */}
        <div
          style={{
            background: '#1a1a24',
            border: '1px solid #262635',
            borderRadius: 14,
            padding: '12px 14px',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10
          }}
        >
          <img src="/assets/icons/pin_marker_outline_v3.svg" alt="" style={{ width: 18, height: 18, marginTop: 2 }} />
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#888', textTransform: 'uppercase' }}>Delivery Address</div>
            <div style={{ fontSize: 12, color: '#ddd', marginTop: 2, lineHeight: '16px' }}>
              {currentOrder.deliveryAddress || location}
            </div>
          </div>
        </div>

        {/* Order Items & Trial Decision */}
        <h2 style={{ fontSize: 13, fontWeight: 800, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
          Items for Trial ({currentOrder.items.length})
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
          {currentOrder.items.map((entry, idx) => {
            const isKept = entry.status === 'kept';
            const isReturned = entry.status === 'returned';

            return (
              <div
                key={idx}
                style={{
                  background: '#1d1d26',
                  borderRadius: 18,
                  border: isKept ? '1.5px solid #10b981' : isReturned ? '1.5px solid #ef4444' : '1px solid #2e2e3c',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  transition: 'border-color 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', gap: 12 }}>
                  <img
                    src={entry.item.product.thumbnail}
                    alt=""
                    style={{ width: 64, height: 76, borderRadius: 12, objectFit: 'cover' }}
                  />

                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: '#888', textTransform: 'uppercase' }}>
                      {entry.item.product.brand}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginTop: 2 }}>
                      {entry.item.product.title}
                    </div>
                    <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>
                      Size: {entry.item.size} • Qty: {entry.item.quantity}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 900, color: '#fff', marginTop: 4 }}>
                      ₹{entry.item.product.price}
                    </div>
                  </div>
                </div>

                {/* Keep / Return Controls */}
                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <button
                    onClick={() => handleDecision(idx, 'kept')}
                    style={{
                      flex: 1,
                      background: isKept ? '#10b981' : '#22222d',
                      color: '#ffffff',
                      border: isKept ? 'none' : '1px solid #38384a',
                      borderRadius: 12,
                      padding: '10px 0',
                      fontSize: 12,
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <img src="/assets/icons/check.svg" alt="" style={{ width: 14, height: 14, filter: 'brightness(0) invert(1)' }} />
                    {isKept ? 'Kept & Paid' : 'Keep This Fit'}
                  </button>

                  <button
                    onClick={() => handleDecision(idx, 'returned')}
                    style={{
                      flex: 1,
                      background: isReturned ? '#ef4444' : '#22222d',
                      color: isReturned ? '#ffffff' : '#ff7777',
                      border: isReturned ? 'none' : '1px solid #4a2828',
                      borderRadius: 12,
                      padding: '10px 0',
                      fontSize: 12,
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <img src="/assets/icons/return.svg" alt="" style={{ width: 14, height: 14, filter: isReturned ? 'brightness(0) invert(1)' : 'none' }} />
                    {isReturned ? 'Handed to Rider' : 'Return to Rider'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Instant Refund Note */}
        <div
          style={{
            background: '#0f382c',
            border: '1px solid #1b5944',
            borderRadius: 16,
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}
        >
          <img src="/assets/icons/easy_refund_icon_dark.svg" alt="" style={{ width: 24, height: 24 }} />
          <div style={{ fontSize: 11, color: '#ccc', lineHeight: '16px' }}>
            <span style={{ fontWeight: 800, color: '#34d399' }}>Instant Doorstep Refund:</span> For any items handed back to the rider, refund is credited to your bank account / UPI within 10 minutes.
          </div>
        </div>
      </main>
    </div>
  );
}
