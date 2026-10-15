'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { PRODUCTS } from '@/data/catalog';
import confetti from 'canvas-confetti';
import {
  getTrialOrders,
  recordDoorstepDecision,
  adminMarkOrderReturnedAndRestocked,
  TrialOrder,
  TrialOrderItem
} from '@/app/lib/darkstoreData';

export default function OrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const { orders, updateDoorstepStatus, location } = useApp();

  const orderId = (params?.id as string) || '';

  // In-memory order from AppContext
  const contextOrder = orders.find((o) => o.id === orderId) || orders[0];

  // Persistent darkstore trial order
  const [activeDarkstoreOrder, setActiveDarkstoreOrder] = useState<TrialOrder | null>(null);
  const [isSimulatingHubArrival, setIsSimulatingHubArrival] = useState(false);
  const [localItemStatus, setLocalItemStatus] = useState<Record<number, 'kept' | 'returned'>>({});

  // 6-minute doorstep trial countdown window (360 seconds)
  const [secondsLeft, setSecondsLeft] = useState(360);

  const loadDarkstoreOrder = () => {
    try {
      const allOrders = getTrialOrders();
      if (!allOrders || allOrders.length === 0) return;

      const matched = allOrders.find(
        (o) =>
          o.id === orderId ||
          o.orderNumber === orderId ||
          o.orderNumber === `#${orderId}` ||
          o.id.includes(orderId) ||
          (orderId && o.id.endsWith(orderId))
      ) || allOrders[0];

      if (matched) {
        setActiveDarkstoreOrder(matched);
      }
    } catch (e) {
      console.warn('Error loading trial order:', e);
    }
  };

  useEffect(() => {
    loadDarkstoreOrder();

    // Live 1-second interval ticking down
    const timer = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    const handleSync = () => loadDarkstoreOrder();
    window.addEventListener('storage', handleSync);
    window.addEventListener('drobe_return_restocked', handleSync);
    window.addEventListener('drobe_order_decision', handleSync);

    return () => {
      clearInterval(timer);
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('drobe_return_restocked', handleSync);
      window.removeEventListener('drobe_order_decision', handleSync);
    };
  }, [orderId]);

  // Overtime calculations: 6-minute window (360 seconds). If exceeded, ₹2 per minute
  const isOvertime = secondsLeft < 0;
  const overtimeTotalSeconds = isOvertime ? Math.abs(secondsLeft) : 0;
  const overtimeMinutes = isOvertime ? Math.ceil(overtimeTotalSeconds / 60) : 0;
  const overtimeFee = overtimeMinutes * 2;

  const normalMinutes = Math.max(0, Math.floor(secondsLeft / 60));
  const normalSeconds = Math.max(0, secondsLeft % 60);

  const overtimeM = Math.floor(overtimeTotalSeconds / 60);
  const overtimeS = overtimeTotalSeconds % 60;

  // Normalized display items
  interface NormalizedItem {
    id: string;
    name: string;
    brand: string;
    size: string;
    price: number;
    priceFormatted: string;
    thumbnail: string;
    shelfLocation: string;
    status: 'pending' | 'in-trial' | 'kept' | 'returned';
    idx: number;
  }

  let itemsToDisplay: NormalizedItem[] = [];

  if (activeDarkstoreOrder?.items && activeDarkstoreOrder.items.length > 0) {
    itemsToDisplay = activeDarkstoreOrder.items.map((it, idx) => ({
      id: it.productId,
      name: it.productName,
      brand: it.brandName,
      size: it.size,
      price: it.priceNum || parseFloat(it.price.replace(/[^0-9.]/g, '')) || 629,
      priceFormatted: it.price,
      thumbnail: it.thumbnail || 'https://eswnhehlnzasiaybjikh.supabase.co/storage/v1/object/public/drobe-media/assets/real/products/37127/angle_1.jpg',
      shelfLocation: it.shelfLocation || 'AMD-RA01-S1-B01',
      status: localItemStatus[idx] || it.status,
      idx
    }));
  } else if (contextOrder?.items && contextOrder.items.length > 0) {
    itemsToDisplay = contextOrder.items.map((entry, idx) => ({
      id: entry.item.product.id,
      name: entry.item.product.title,
      brand: entry.item.product.brand,
      size: entry.item.size,
      price: entry.item.product.price,
      priceFormatted: `₹${entry.item.product.price}`,
      thumbnail: entry.item.product.thumbnail,
      shelfLocation: 'AMD-RA01-S1-B01',
      status: localItemStatus[idx] || entry.status,
      idx
    }));
  } else {
    // Standard 3-Item Trial Order with ₹600 + 5% Markup (₹629) from model
    itemsToDisplay = [
      {
        id: '37127',
        name: 'Deep Navy Cuban-Collar Jacquard Shirt Casual',
        brand: 'The Indian Garage Co',
        size: 'M',
        price: 629,
        priceFormatted: '₹629',
        thumbnail: 'https://eswnhehlnzasiaybjikh.supabase.co/storage/v1/object/public/drobe-media/assets/real/products/37127/angle_1.jpg',
        shelfLocation: 'AMD-RA01-S1-B01',
        status: localItemStatus[0] || 'pending',
        idx: 0
      },
      {
        id: '37162',
        name: 'Men Deep Chestnut Brown Jogger Cargo Pants',
        brand: 'The Indian Garage Co',
        size: 'L',
        price: 629,
        priceFormatted: '₹629',
        thumbnail: 'https://eswnhehlnzasiaybjikh.supabase.co/storage/v1/object/public/drobe-media/assets/real/products/37162/angle_1.jpg',
        shelfLocation: 'AMD-RA01-S2-B02',
        status: localItemStatus[1] || 'pending',
        idx: 1
      },
      {
        id: '2623',
        name: 'Men Black Cargo Jeans - Streetwear Casual',
        brand: 'The Souled Store',
        size: '32',
        price: 629,
        priceFormatted: '₹629',
        thumbnail: 'https://eswnhehlnzasiaybjikh.supabase.co/storage/v1/object/public/drobe-media/assets/real/products/2623/angle_1.jpg',
        shelfLocation: 'AMD-RA02-S1-B01',
        status: localItemStatus[2] || 'pending',
        idx: 2
      }
    ];
  }

  // Financial reconciliation
  const advancePaid = activeDarkstoreOrder?.advancePaidAmount ?? (contextOrder?.totalAmount || itemsToDisplay.reduce((s, i) => s + i.price, 0) || 1887);
  const keptAmount = itemsToDisplay.filter((i) => i.status === 'kept').reduce((s, i) => s + i.price, 0);
  const grossRefundAmount = itemsToDisplay.filter((i) => i.status === 'returned').reduce((s, i) => s + i.price, 0);
  
  const currentOvertimeFee = activeDarkstoreOrder?.overtimeFee !== undefined && activeDarkstoreOrder.overtimeFee > 0
    ? activeDarkstoreOrder.overtimeFee
    : overtimeFee;
  const currentOvertimeMinutes = activeDarkstoreOrder?.overtimeMinutes !== undefined && activeDarkstoreOrder.overtimeMinutes > 0
    ? activeDarkstoreOrder.overtimeMinutes
    : overtimeMinutes;

  const netRefundAmount = Math.max(0, grossRefundAmount - currentOvertimeFee);
  const refundStatus = activeDarkstoreOrder?.refundStatus || (grossRefundAmount > 0 ? 'Refund Pending Hub Arrival' : 'No Refund');
  const refundUpiRef = activeDarkstoreOrder?.refundUpiRef || '';
  const paymentUpiRef = activeDarkstoreOrder?.paymentUpiRef || 'UPI-ADV-98421098';

  const returnedCount = itemsToDisplay.filter((i) => i.status === 'returned').length;
  const keptCount = itemsToDisplay.filter((i) => i.status === 'kept').length;
  const hasReturnedItems = returnedCount > 0;
  const isRefundProcessed = refundStatus === 'Refund Processed Instantly' || activeDarkstoreOrder?.status === 'Restocked to Warehouse Shelf';

  // Interactive toggle handler
  const handleDecision = (idx: number, decision: 'kept' | 'returned') => {
    setLocalItemStatus((prev) => ({ ...prev, [idx]: decision }));

    if (contextOrder) {
      updateDoorstepStatus(contextOrder.id, idx, decision);
    }

    if (activeDarkstoreOrder) {
      const updated = recordDoorstepDecision(
        activeDarkstoreOrder.id, 
        idx, 
        decision, 
        overtimeMinutes, 
        overtimeFee
      );
      if (updated) {
        setActiveDarkstoreOrder(updated);
      }
    }

    if (decision === 'kept') {
      confetti({ particleCount: 45, spread: 60, origin: { y: 0.7 } });
    }
  };

  // Simulation handler for testing complete flow seamlessly in browser
  const handleSimulateRestock = () => {
    if (!activeDarkstoreOrder) return;
    setIsSimulatingHubArrival(true);
    setTimeout(() => {
      const res = adminMarkOrderReturnedAndRestocked(
        activeDarkstoreOrder.id,
        'Doorstep Fitting Return',
        `Runner arrived at Ahmedabad Darkstore Hub. Pieces inspected and restocked to shelf.${currentOvertimeFee > 0 ? ` (Overtime fee of ₹${currentOvertimeFee} deducted for exceeding 6-min window).` : ''}`
      );
      if (res.order) {
        setActiveDarkstoreOrder(res.order);
      }
      setIsSimulatingHubArrival(false);
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
    }, 1200);
  };

  // Helper buttons to easily test 6m timer & overtime surcharge
  const simulateAddOvertimeMinute = () => {
    setSecondsLeft((prev) => (prev <= 0 ? prev - 60 : -60));
  };

  const resetDoorstepTimer = () => {
    setSecondsLeft(360);
  };

  // Dynamic Headline formatting matching user requirement
  let liveBreakdownHeadline = '';
  if (keptCount === 0 && returnedCount === 0) {
    liveBreakdownHeadline = 'Choose which pieces to Keep and which to Return to the runner';
  } else if (keptCount > 0 && returnedCount === 0) {
    liveBreakdownHeadline = `Keeping ${keptCount} item${keptCount === 1 ? '' : 's'} (₹${keptAmount}) · Full deposit retained`;
  } else if (keptCount === 0 && returnedCount > 0) {
    liveBreakdownHeadline = currentOvertimeFee > 0
      ? `Returning all ${returnedCount} items · Instant refund upon return: ₹${netRefundAmount} to UPI (after -₹${currentOvertimeFee} overtime surcharge)`
      : `Returning all ${returnedCount} items · Instant refund upon return: ₹${netRefundAmount} to UPI`;
  } else {
    // e.g. "Keeping 1 item (₹629) · Instant refund upon return: ₹1,258 to UPI"
    liveBreakdownHeadline = currentOvertimeFee > 0
      ? `Keeping ${keptCount} item${keptCount === 1 ? '' : 's'} (₹${keptAmount}) · Overtime fee: -₹${currentOvertimeFee} (${currentOvertimeMinutes}m) · Instant refund upon return: ₹${netRefundAmount} to UPI`
      : `Keeping ${keptCount} item${keptCount === 1 ? '' : 's'} (₹${keptAmount}) · Instant refund upon return: ₹${netRefundAmount} to UPI`;
  }

  const displayOrderId = activeDarkstoreOrder?.orderNumber || (contextOrder ? `#${contextOrder.id}` : '#DRB-9852');

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', background: '#121217', overflow: 'hidden' }}>
      {/* Header */}
      <header
        style={{
          padding: '14px 16px',
          background: '#16161f',
          borderBottom: '1px solid #242432',
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
            <h1 style={{ fontSize: 16, fontWeight: 800, color: '#fff', margin: 0 }}>Order {displayOrderId}</h1>
            <p style={{ fontSize: 11, color: '#888', margin: '2px 0 0 0' }}>Live 6-Min Doorstep Fitting &amp; Instant Refund</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ background: '#0f382c', padding: '4px 10px', borderRadius: 12, border: '1px solid #1c5e48' }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#34d399' }}>⚡ ACTIVE</span>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 80px' }}>
        {/* 100% Advance Payment & Settlement Breakdown Card */}
        <div
          style={{
            background: 'linear-gradient(135deg, #182234 0%, #171b26 100%)',
            border: '1px solid #283a54',
            borderRadius: 20,
            padding: '16px',
            marginBottom: 16,
            boxShadow: '0 8px 25px rgba(0,0,0,0.45)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(56,189,248,0.15)', padding: '4px 10px', borderRadius: 20, color: '#38bdf8', fontSize: 10.5, fontWeight: 800 }}>
              <span>⚡ 100% ADVANCE PRE-PAID</span>
            </div>
            <span style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'monospace' }}>Ref: {paymentUpiRef}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, textAlign: 'center', background: '#0e1420', padding: '12px 8px', borderRadius: 14, border: '1px solid #1f2d42' }}>
            <div>
              <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Total Paid</div>
              <div style={{ fontSize: 17, fontWeight: 900, color: '#ffffff', marginTop: 2 }}>₹{advancePaid}</div>
              <div style={{ fontSize: 9.5, color: '#38bdf8' }}>100% Upfront</div>
            </div>

            <div style={{ borderLeft: '1px solid #1f2d42', borderRight: '1px solid #1f2d42' }}>
              <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Kept on Spot</div>
              <div style={{ fontSize: 17, fontWeight: 900, color: '#34d399', marginTop: 2 }}>₹{keptAmount}</div>
              <div style={{ fontSize: 9.5, color: '#34d399' }}>{keptCount} Fit(s) Kept</div>
            </div>

            <div>
              <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Net Refund</div>
              <div style={{ fontSize: 17, fontWeight: 900, color: netRefundAmount > 0 ? (isRefundProcessed ? '#34d399' : '#38bdf8') : '#94a3b8', marginTop: 2 }}>
                ₹{netRefundAmount}
              </div>
              <div style={{ fontSize: 9.5, color: netRefundAmount > 0 ? (isRefundProcessed ? '#34d399' : '#38bdf8') : '#94a3b8' }}>
                {isRefundProcessed ? 'Credited ✓' : (netRefundAmount > 0 ? 'Instant to UPI' : 'None')}
              </div>
            </div>
          </div>
        </div>

        {/* 6-MINUTE DOORSTEP TRIAL COUNTDOWN & OVERTIME BOX */}
        <div
          style={{
            background: isOvertime ? '#261418' : '#191923',
            border: isOvertime ? '1.5px solid #ef4444' : '1px solid #28283a',
            borderRadius: 18,
            padding: '16px',
            textAlign: 'center',
            marginBottom: 16,
            transition: 'all 0.3s ease'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            {isOvertime ? (
              <span style={{ background: '#7f1d1d', color: '#fca5a5', padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 900, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span>⚠️ OVERTIME ACTIVE</span>
                <span>·</span>
                <span>₹2 / MINUTE CHARGE</span>
              </span>
            ) : (
              <span style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <img src="/assets/icons/stopwatch.svg" alt="" style={{ width: 14, height: 14 }} />
                <span>DOORSTEP FITTING ROOM · 6 MIN WINDOW</span>
              </span>
            )}
          </div>

          <div
            style={{
              fontSize: 38,
              fontWeight: 900,
              color: isOvertime ? '#ef4444' : '#ffffff',
              letterSpacing: 1.5,
              fontFamily: 'monospace'
            }}
          >
            {isOvertime
              ? `+${String(overtimeM).padStart(2, '0')}:${String(overtimeS).padStart(2, '0')}`
              : `${String(normalMinutes).padStart(2, '0')}:${String(normalSeconds).padStart(2, '0')}`}
          </div>

          <p style={{ fontSize: 12, color: isOvertime ? '#fca5a5' : '#aaa', margin: '6px 0 0 0' }}>
            {isOvertime
              ? `6-minute trial window exceeded by ${overtimeMinutes} min. Surcharge of ₹${overtimeFee} applied (₹2/min).`
              : 'Try each piece in your mirror. Runner is waiting outside with signature bag!'}
          </p>

          {/* Interactive Timer Controls for Testing/Demo */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12 }}>
            <button
              onClick={simulateAddOvertimeMinute}
              style={{
                background: '#371c22',
                border: '1px solid #7f1d1d',
                color: '#fca5a5',
                fontSize: 10.5,
                fontWeight: 800,
                padding: '5px 10px',
                borderRadius: 8,
                cursor: 'pointer'
              }}
            >
              ⚡ Test: +1m Overtime (+₹2)
            </button>
            <button
              onClick={resetDoorstepTimer}
              style={{
                background: '#22222d',
                border: '1px solid #38384a',
                color: '#94a3b8',
                fontSize: 10.5,
                fontWeight: 800,
                padding: '5px 10px',
                borderRadius: 8,
                cursor: 'pointer'
              }}
            >
              Reset 6m Timer
            </button>
          </div>
        </div>

        {/* PROMINENT LIVE TRY & BUY REFUND BREAKDOWN BANNER */}
        <div
          style={{
            background: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)',
            border: '1.5px solid #10b981',
            borderRadius: 18,
            padding: '16px',
            marginBottom: 16,
            boxShadow: '0 8px 25px rgba(16, 185, 129, 0.25)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 18 }}>⚡</span>
            <span style={{ fontSize: 11, fontWeight: 900, color: '#6ee7b7', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Live Refund Breakdown
            </span>
          </div>

          <div style={{ fontSize: 14.5, fontWeight: 800, color: '#ffffff', lineHeight: '20px' }}>
            {liveBreakdownHeadline}
          </div>

          {currentOvertimeFee > 0 && (
            <div style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(239, 68, 68, 0.25)', border: '1px solid #ef4444', color: '#fca5a5', padding: '3px 10px', borderRadius: 8, fontSize: 11, fontWeight: 800 }}>
              <span>⚠️ Overtime Deducted:</span>
              <span>-₹{currentOvertimeFee} ({currentOvertimeMinutes} min × ₹2/min)</span>
            </div>
          )}
        </div>

        {/* Doorstep Delivery Verification PIN Card */}
        <div
          style={{
            background: 'rgba(56, 189, 248, 0.08)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: 14,
            padding: '12px 16px',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Doorstep Delivery PIN
            </div>
            <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>
              Share with runner to confirm trial bag receipt
            </div>
          </div>
          <div
            style={{
              background: '#0f172a',
              border: '1px solid #38bdf8',
              color: '#38bdf8',
              fontSize: 17,
              fontWeight: 900,
              fontFamily: 'monospace',
              letterSpacing: 3,
              padding: '6px 12px',
              borderRadius: 8
            }}
          >
            {activeDarkstoreOrder?.deliveryOtp || displayOrderId.replace(/[^0-9]/g, '').slice(-4) || '4829'}
          </div>
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
            marginBottom: 16
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#353548', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src="/assets/icons/lucide_bike.svg" alt="" style={{ width: 22, height: 22 }} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>
                {activeDarkstoreOrder?.riderName || 'Jay Suthar'} (Runner)
              </div>
              <div style={{ fontSize: 11, color: '#34d399', fontWeight: 600 }}>
                Waiting outside with Drobe Signature Bag
              </div>
            </div>
          </div>

          <a
            href={`tel:${activeDarkstoreOrder?.riderPhone || '+919712044912'}`}
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

        {/* LIVE INSTANT DOORSTEP REFUND TRACKER (when any item is returned) */}
        {hasReturnedItems && (
          <div
            style={{
              background: isRefundProcessed
                ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.14) 0%, rgba(5, 150, 105, 0.1) 100%)'
                : 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(180, 83, 9, 0.08) 100%)',
              border: isRefundProcessed
                ? '1.5px solid rgba(16, 185, 129, 0.4)'
                : '1.5px solid rgba(245, 158, 11, 0.35)',
              borderRadius: 20,
              padding: '16px',
              marginBottom: 20,
              boxShadow: '0 8px 30px rgba(0,0,0,0.5)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20 }}>{isRefundProcessed ? '🎉' : '⚡'}</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: isRefundProcessed ? '#34d399' : '#fbbf24' }}>
                    {isRefundProcessed
                      ? `₹${netRefundAmount} Refunded Instantly to Your Account!`
                      : `₹${netRefundAmount} Instant Refund Pending Hub Restock`}
                  </h3>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                    {isRefundProcessed
                      ? `Restocked to Ahmedabad Darkstore Hub · Ref: ${refundUpiRef || 'REF-UPI-8842'}`
                      : `Runner en route to Ahmedabad Darkstore Hub with ${returnedCount} piece(s)`}
                  </div>
                </div>
              </div>
            </div>

            {/* Step-by-Step Live Stepper */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, background: '#0e121a', padding: '12px 14px', borderRadius: 14, border: '1px solid #1c2333', marginBottom: 12 }}>
              {/* Step 1 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800 }}>
                  ✓
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>Handed to Runner at Doorstep</div>
                  <div style={{ fontSize: 10.5, color: '#888' }}>{returnedCount} item(s) placed into tamper-proof return bag</div>
                </div>
              </div>

              {/* Step 2 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: isRefundProcessed ? '#10b981' : '#f59e0b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800 }}>
                  {isRefundProcessed ? '✓' : '⚡'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: isRefundProcessed ? '#fff' : '#fbbf24' }}>
                    {isRefundProcessed ? 'Rider Reached Darkstore Hub' : 'Rider En Route to Darkstore Hub'}
                  </div>
                  <div style={{ fontSize: 10.5, color: '#888' }}>Heading to Shivam Hub, Ahmedabad</div>
                </div>
              </div>

              {/* Step 3 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: isRefundProcessed ? '#10b981' : '#222230', color: isRefundProcessed ? '#fff' : '#666', border: isRefundProcessed ? 'none' : '1px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800 }}>
                  {isRefundProcessed ? '✓' : '3'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: isRefundProcessed ? '#34d399' : '#888' }}>
                    {isRefundProcessed ? 'Restocked to Warehouse Shelf · Full Refund Credited' : `Hub Check-in & Restock · Instant ₹${netRefundAmount} Refund`}
                  </div>
                  <div style={{ fontSize: 10.5, color: isRefundProcessed ? '#34d399' : '#666' }}>
                    {isRefundProcessed
                      ? `Credited to UPI Account (${refundUpiRef || 'REF-INSTANT'})`
                      : 'Refund triggers automatically the moment runner drops items on the rack'}
                  </div>
                </div>
              </div>
            </div>

            {/* Test Simulation Button */}
            {!isRefundProcessed && (
              <button
                onClick={handleSimulateRestock}
                disabled={isSimulatingHubArrival}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  border: 'none',
                  borderRadius: 12,
                  padding: '10px 14px',
                  color: '#ffffff',
                  fontSize: 12,
                  fontWeight: 800,
                  cursor: isSimulatingHubArrival ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  opacity: isSimulatingHubArrival ? 0.7 : 1
                }}
              >
                {isSimulatingHubArrival ? (
                  <span>Restocking to Shelf &amp; Issuing Refund...</span>
                ) : (
                  <>
                    <span>⚡ Test Demo: Simulate Runner Reached Hub &amp; Shelf Restocked</span>
                  </>
                )}
              </button>
            )}

            {isRefundProcessed && (
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', borderRadius: 12, padding: '10px 12px', fontSize: 11.5, color: '#d1fae5', lineHeight: '16px' }}>
                <strong>✓ Instant UPI Credit Confirmed:</strong> ₹{netRefundAmount} was credited to your original payment source. Reference: <strong>{refundUpiRef || 'REF-UPI-8842'}</strong>.{currentOvertimeFee > 0 ? ` (Overtime fee of ₹${currentOvertimeFee} deducted).` : ''}
              </div>
            )}
          </div>
        )}

        {/* Order Items & Interactive Keep / Return Controls */}
        <h2 style={{ fontSize: 13, fontWeight: 800, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
          Items for Doorstep Fitting ({itemsToDisplay.length})
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
          {itemsToDisplay.map((entry) => {
            const isKept = entry.status === 'kept';
            const isReturned = entry.status === 'returned';

            return (
              <div
                key={entry.idx}
                style={{
                  background: '#1d1d26',
                  borderRadius: 18,
                  border: isKept ? '1.5px solid #10b981' : isReturned ? '1.5px solid #ef4444' : '1px solid #2e2e3c',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  transition: 'border-color 0.2s ease',
                  boxShadow: isKept ? '0 4px 18px rgba(16,185,129,0.15)' : isReturned ? '0 4px 18px rgba(239,68,68,0.15)' : 'none'
                }}
              >
                <div style={{ display: 'flex', gap: 12 }}>
                  <img
                    src={entry.thumbnail}
                    alt={entry.name}
                    style={{ width: 68, height: 80, borderRadius: 12, objectFit: 'cover' }}
                  />

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ fontSize: 10, fontWeight: 800, color: '#888', textTransform: 'uppercase' }}>
                        {entry.brand}
                      </div>
                      {isKept && (
                        <span style={{ fontSize: 10, fontWeight: 800, color: '#34d399', background: 'rgba(52,211,153,0.15)', padding: '2px 8px', borderRadius: 8 }}>
                          ✓ KEPT ON SPOT
                        </span>
                      )}
                      {isReturned && (
                        <span style={{ fontSize: 10, fontWeight: 800, color: '#ef4444', background: 'rgba(239,68,68,0.15)', padding: '2px 8px', borderRadius: 8 }}>
                          ↩ RETURN TO RIDER
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginTop: 2 }}>
                      {entry.name}
                    </div>
                    <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>
                      Size: <strong>{entry.size}</strong> · Shelf: <span style={{ color: '#38bdf8' }}>{entry.shelfLocation}</span>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 900, color: '#fff', marginTop: 4 }}>
                      {entry.priceFormatted}
                    </div>
                  </div>
                </div>

                {/* Keep / Return Toggle Controls */}
                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <button
                    onClick={() => handleDecision(entry.idx, 'kept')}
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
                    {isKept ? `Kept (${entry.priceFormatted})` : `Keep (${entry.priceFormatted})`}
                  </button>

                  <button
                    onClick={() => handleDecision(entry.idx, 'returned')}
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
                    {isReturned ? `Returning (${entry.priceFormatted})` : `Return (${entry.priceFormatted})`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Final Financial Settlement Reconciliation */}
        <div
          style={{
            background: '#191923',
            border: '1px solid #28283a',
            borderRadius: 18,
            padding: '16px',
            marginBottom: 20
          }}
        >
          <h3 style={{ fontSize: 12, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
            Financial Settlement Summary
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12.5 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#aaa' }}>
              <span>100% Pre-Paid Advance Amount ({itemsToDisplay.length} items)</span>
              <span style={{ color: '#fff', fontWeight: 700 }}>₹{advancePaid}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#34d399' }}>
              <span>Kept Outfits ({keptCount} item{keptCount === 1 ? '' : 's'})</span>
              <span style={{ fontWeight: 700 }}>-₹{keptAmount}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: grossRefundAmount > 0 ? '#38bdf8' : '#aaa' }}>
              <span>Gross Return Value ({returnedCount} item{returnedCount === 1 ? '' : 's'})</span>
              <span style={{ fontWeight: 700 }}>{grossRefundAmount > 0 ? `₹${grossRefundAmount}` : '₹0'}</span>
            </div>

            {currentOvertimeFee > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ef4444' }}>
                <span>Overtime Surcharge ({currentOvertimeMinutes} min @ ₹2/min)</span>
                <span style={{ fontWeight: 700 }}>-₹{currentOvertimeFee}</span>
              </div>
            )}

            <div style={{ height: 1, background: '#2c2c3c', margin: '4px 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 900, color: '#fff' }}>
              <span>Net Instant UPI Refund</span>
              <span style={{ color: '#34d399' }}>₹{netRefundAmount}</span>
            </div>

            <div style={{ fontSize: 11, color: '#34d399', background: 'rgba(52,211,153,0.1)', padding: '6px 10px', borderRadius: 8, textAlign: 'center', marginTop: 4 }}>
              {grossRefundAmount > 0 ? (
                isRefundProcessed ? (
                  <span>✓ ₹{netRefundAmount} Refunded Instantly to your UPI account!</span>
                ) : (
                  <span>⚡ ₹{netRefundAmount} will be refunded the second runner checks into the hub!</span>
                )
              ) : (
                <span>All fits kept · 100% Retained</span>
              )}
            </div>
          </div>
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
            <span style={{ fontWeight: 800, color: '#34d399' }}>6-Minute Doorstep Trial Guarantee:</span> Take 6 complimentary minutes in your mirror. For any items returned, your refund is credited instantly to your UPI account as the runner drops them back at our Ahmedabad hub. Overtime beyond 6 minutes is billed at ₹2/min.
          </div>
        </div>
      </main>
    </div>
  );
}
