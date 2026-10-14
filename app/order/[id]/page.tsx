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

  // 15-minute trial countdown
  const [secondsLeft, setSecondsLeft] = useState(840);

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

    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
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

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

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
      price: it.priceNum || parseFloat(it.price.replace(/[^0-9.]/g, '')) || 0,
      priceFormatted: it.price,
      thumbnail: it.thumbnail || '/assets/images/placeholder_garment.jpg',
      shelfLocation: it.shelfLocation || 'AMD-RA01-S1-B01',
      status: it.status,
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
      status: entry.status,
      idx
    }));
  } else {
    itemsToDisplay = [
      {
        id: PRODUCTS[0].id,
        name: PRODUCTS[0].title,
        brand: PRODUCTS[0].brand,
        size: 'L',
        price: PRODUCTS[0].price,
        priceFormatted: `₹${PRODUCTS[0].price}`,
        thumbnail: PRODUCTS[0].thumbnail,
        shelfLocation: 'AMD-RA01-S1-B01',
        status: 'pending',
        idx: 0
      }
    ];
  }

  // Financial reconciliation
  const advancePaid = activeDarkstoreOrder?.advancePaidAmount ?? (contextOrder?.totalAmount || itemsToDisplay.reduce((s, i) => s + i.price, 0));
  const keptAmount = activeDarkstoreOrder?.keptAmount ?? itemsToDisplay.filter((i) => i.status === 'kept').reduce((s, i) => s + i.price, 0);
  const refundAmount = activeDarkstoreOrder?.refundAmount ?? itemsToDisplay.filter((i) => i.status === 'returned').reduce((s, i) => s + i.price, 0);
  const refundStatus = activeDarkstoreOrder?.refundStatus || (refundAmount > 0 ? 'Refund Pending Hub Arrival' : 'No Refund');
  const refundUpiRef = activeDarkstoreOrder?.refundUpiRef || '';
  const paymentUpiRef = activeDarkstoreOrder?.paymentUpiRef || 'UPI-ADV-98421098';

  const returnedCount = itemsToDisplay.filter((i) => i.status === 'returned').length;
  const keptCount = itemsToDisplay.filter((i) => i.status === 'kept').length;
  const hasReturnedItems = returnedCount > 0;
  const isRefundProcessed = refundStatus === 'Refund Processed Instantly' || activeDarkstoreOrder?.status === 'Restocked to Warehouse Shelf';

  const handleDecision = (idx: number, decision: 'kept' | 'returned') => {
    if (contextOrder) {
      updateDoorstepStatus(contextOrder.id, idx, decision);
    }

    if (activeDarkstoreOrder) {
      const updated = recordDoorstepDecision(activeDarkstoreOrder.id, idx, decision);
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
        'Runner arrived at Ahmedabad Darkstore Hub. Pieces inspected and restocked to shelf.'
      );
      if (res.order) {
        setActiveDarkstoreOrder(res.order);
      }
      setIsSimulatingHubArrival(false);
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
    }, 1200);
  };

  const displayOrderId = activeDarkstoreOrder?.orderNumber || (contextOrder ? `#${contextOrder.id}` : '#DRB-9842');

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
            <h1 style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>Order {displayOrderId}</h1>
            <p style={{ fontSize: 11, color: '#888' }}>Live 15-Min Doorstep Fitting &amp; Instant Refund</p>
          </div>
        </div>

        <div style={{ background: '#0f382c', padding: '4px 10px', borderRadius: 12, border: '1px solid #1c5e48' }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: '#34d399' }}>⚡ ACTIVE</span>
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
              <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Refund</div>
              <div style={{ fontSize: 17, fontWeight: 900, color: refundAmount > 0 ? (isRefundProcessed ? '#34d399' : '#f59e0b') : '#94a3b8', marginTop: 2 }}>
                ₹{refundAmount}
              </div>
              <div style={{ fontSize: 9.5, color: refundAmount > 0 ? (isRefundProcessed ? '#34d399' : '#f59e0b') : '#94a3b8' }}>
                {isRefundProcessed ? 'Credited ✓' : (refundAmount > 0 ? 'Pending Hub' : 'None')}
              </div>
            </div>
          </div>
        </div>

        {/* 15-Minute Trial Countdown Box */}
        <div
          style={{
            background: '#191923',
            border: '1px solid #28283a',
            borderRadius: 18,
            padding: '16px',
            textAlign: 'center',
            marginBottom: 16
          }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(245, 158, 11, 0.15)', padding: '4px 12px', borderRadius: 20, color: '#fbbf24', fontSize: 11, fontWeight: 800, marginBottom: 8 }}>
            <img src="/assets/icons/stopwatch.svg" alt="" style={{ width: 14, height: 14 }} />
            <span>DOORSTEP FITTING ROOM · 15 MIN TIMER</span>
          </div>

          <div style={{ fontSize: 36, fontWeight: 900, color: '#ffffff', letterSpacing: 1, fontFamily: 'monospace' }}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>

          <p style={{ fontSize: 12, color: '#aaa', marginTop: 4 }}>
            Try each piece in your mirror. Choose below what to keep and what to hand back!
          </p>
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
            {activeDarkstoreOrder?.deliveryOtp || displayOrderId.replace(/[^0-9]/g, '').slice(-4) || '9842'}
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
                {activeDarkstoreOrder?.riderName || 'Meet Dave'} (Runner)
              </div>
              <div style={{ fontSize: 11, color: '#34d399', fontWeight: 600 }}>
                Waiting outside with Drobe Signature Bag
              </div>
            </div>
          </div>

          <a
            href={`tel:${activeDarkstoreOrder?.riderPhone || '+919876543210'}`}
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
              {activeDarkstoreOrder?.customerAddress || location}
            </div>
          </div>
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
              marginBottom: 24,
              boxShadow: '0 8px 30px rgba(0,0,0,0.5)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20 }}>{isRefundProcessed ? '🎉' : '⚡'}</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: isRefundProcessed ? '#34d399' : '#fbbf24' }}>
                    {isRefundProcessed
                      ? `₹${refundAmount} Refunded Instantly to Your Account!`
                      : `₹${refundAmount} Instant Refund Pending Hub Check-in`}
                  </h3>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                    {isRefundProcessed
                      ? `Restocked to Ahmedabad Darkstore Hub · Ref: ${refundUpiRef}`
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
                  <div style={{ fontSize: 10.5, color: '#888' }}>Heading to Shivam Bungalows 1, Koteshwar Road Hub</div>
                </div>
              </div>

              {/* Step 3 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: isRefundProcessed ? '#10b981' : '#222230', color: isRefundProcessed ? '#fff' : '#666', border: isRefundProcessed ? 'none' : '1px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800 }}>
                  {isRefundProcessed ? '✓' : '3'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: isRefundProcessed ? '#34d399' : '#888' }}>
                    {isRefundProcessed ? 'Restocked to Warehouse Shelf · Full Refund Credited' : `Hub Check-in & Restock · Instant ₹${refundAmount} Refund`}
                  </div>
                  <div style={{ fontSize: 10.5, color: isRefundProcessed ? '#34d399' : '#666' }}>
                    {isRefundProcessed
                      ? `Credited to UPI Account (${refundUpiRef || 'REF-INSTANT'})`
                      : 'Refund triggers automatically the moment runner drops items on the rack'}
                  </div>
                </div>
              </div>
            </div>

            {/* Test Simulation Button (Allows user/tester to simulate runner arriving at warehouse and restocking immediately) */}
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
                <strong>✓ Instant UPI Credit Confirmed:</strong> ₹{refundAmount} was credited to your original payment source. Reference: <strong>{refundUpiRef}</strong>. Items placed back on rack.
              </div>
            )}
          </div>
        )}

        {/* Order Items & Trial Decision Section */}
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

                {/* Keep / Return Controls */}
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
                    {isKept ? 'Kept & Retained' : 'Keep This Fit'}
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
                    {isReturned ? 'Handed to Rider' : 'Return to Rider'}
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
              <span>100% Pre-Paid Advance Amount</span>
              <span style={{ color: '#fff', fontWeight: 700 }}>₹{advancePaid}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#34d399' }}>
              <span>Kept Outfits ({keptCount} item{keptCount === 1 ? '' : 's'})</span>
              <span style={{ fontWeight: 700 }}>-₹{keptAmount}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: refundAmount > 0 ? '#38bdf8' : '#aaa' }}>
              <span>Hub Restock Refund ({returnedCount} item{returnedCount === 1 ? '' : 's'})</span>
              <span style={{ fontWeight: 700 }}>{refundAmount > 0 ? `₹${refundAmount}` : '₹0'}</span>
            </div>

            <div style={{ height: 1, background: '#2c2c3c', margin: '4px 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 900, color: '#fff' }}>
              <span>Net Client Bill</span>
              <span>₹{keptAmount}</span>
            </div>

            <div style={{ fontSize: 11, color: '#34d399', background: 'rgba(52,211,153,0.1)', padding: '6px 10px', borderRadius: 8, textAlign: 'center', marginTop: 4 }}>
              {refundAmount > 0 ? (
                isRefundProcessed ? (
                  <span>✓ ₹{refundAmount} Refunded Instantly to your UPI account!</span>
                ) : (
                  <span>⚡ ₹{refundAmount} will be refunded the second runner checks into the hub!</span>
                )
              ) : (
                <span>Zero pending balance · 100% Settled</span>
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
            <span style={{ fontWeight: 800, color: '#34d399' }}>Instant Hub Refund Guarantee:</span> For any garments handed back to the runner, the refund is credited instantly to your account the second the runner checks them into our Ahmedabad Darkstore Hub.
          </div>
        </div>
      </main>
    </div>
  );
}
