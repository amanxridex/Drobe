'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { getTrialOrders } from '@/app/lib/darkstoreData';
import { Package, ArrowLeft, ShoppingBag } from 'lucide-react';

export default function OrderIndexPage() {
  const router = useRouter();
  const { orders } = useApp();
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    try {
      const trialOrders = getTrialOrders();
      if (trialOrders && trialOrders.length > 0) {
        router.replace(`/order/${trialOrders[0].id}`);
        return;
      }
      if (orders && orders.length > 0) {
        router.replace(`/order/${orders[0].id}`);
        return;
      }
      setHasChecked(true);
    } catch {
      setHasChecked(true);
    }
  }, [orders, router]);

  if (!hasChecked) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0d0d12' }}>
        <div style={{ color: '#8e8e93', fontSize: 13, fontWeight: 600 }}>
          Checking live delivery status...
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#0a0a0c',
        color: '#ffffff',
        padding: '24px 20px',
        textAlign: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 24,
          background: '#141418',
          border: '1px solid #22222a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20
        }}
      >
        <Package size={36} color="#888899" />
      </div>

      <h1 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
        No Active Deliveries
      </h1>

      <p style={{ fontSize: 13.5, color: '#888899', maxWidth: 320, lineHeight: 1.55, margin: '0 0 28px' }}>
        You don't have any orders currently out for delivery. Try items at your doorstep in 30 minutes with a free 6-minute fitting trial!
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 300 }}>
        <button
          onClick={() => router.push('/')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            width: '100%',
            padding: '14px 0',
            borderRadius: 14,
            background: '#ffffff',
            color: '#000000',
            fontSize: 14,
            fontWeight: 800,
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <ShoppingBag size={18} />
          <span>Explore Catalog</span>
        </button>

        <button
          onClick={() => router.push('/profile')}
          style={{
            width: '100%',
            padding: '13px 0',
            borderRadius: 14,
            background: '#141418',
            border: '1px solid #22222a',
            color: '#ffffff',
            fontSize: 13.5,
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          View Profile &amp; History
        </button>
      </div>
    </div>
  );
}
