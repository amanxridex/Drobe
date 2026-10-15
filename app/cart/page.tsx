'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import BottomNav from '@/components/BottomNav';
import confetti from 'canvas-confetti';
import { createCustomerOrder, getDarkstoreProducts } from '@/app/lib/darkstoreData';

export default function CartPage() {
  const router = useRouter();
  const {
    cart,
    removeFromCart,
    updateQuantity,
    appliedCoupon,
    setIsCouponOpen,
    removeCoupon,
    discountAmount,
    cartTotal,
    createOrder,
    location,
    user,
    setIsAuthOpen,
    deliveryMinutes
  } = useApp();

  // If visitor is unauthenticated, prompt them with the Auth modal to sign in or create an account
  useEffect(() => {
    if (!user) {
      setIsAuthOpen(true);
    }
  }, [user, setIsAuthOpen]);

  const rawSubtotal = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const rawMrp = cart.reduce((sum, i) => sum + i.product.originalPrice * i.quantity, 0);
  const totalSavings = rawMrp - rawSubtotal + discountAmount;

  const handleCheckout = () => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    if (cart.length === 0) return;
    confetti({ particleCount: 70, spread: 70, origin: { y: 0.8 } });
    
    // Divert customer order to Ahmedabad Darkstore Hub Order Fulfillment Bay & auto-deduct stock from DB
    try {
      const darkstoreProds = getDarkstoreProducts();
      const orderItems = cart.map(item => {
        const matched = darkstoreProds.find(dp => dp.id === item.product.id || dp.name === item.product.title);
        const shelfCode = matched?.warehouseLocation?.code || 'AMD-RA01-S1-B01';
        const prodSku = matched?.sku || (item.product.extraDiscountBadge?.startsWith('SKU:') ? item.product.extraDiscountBadge.replace('SKU: ', '') : `DR-${item.product.id}`);
        const brandId = matched?.brandId || 'tilt';
        const brandName = matched?.brandName || item.product.brand || 'Drobe Partner';

        return {
          productId: item.product.id,
          productName: item.product.title,
          productSku: prodSku,
          brandId: brandId,
          brandName: brandName,
          price: `₹${item.product.price}`,
          priceNum: item.product.price,
          size: item.size || 'M',
          shelfLocation: shelfCode,
          thumbnail: item.product.thumbnail
        };
      });

      const upiTxRef = `UPI-ADV-${Math.floor(10000000 + Math.random() * 90000000)}`;
      const order = createOrder('UPI');

      createCustomerOrder({
        id: order.id,
        orderNumber: `#${order.id}`,
        items: orderItems,
        advancePaidAmount: cartTotal,
        customerName: user?.name || (user ? 'Verified Shopper' : 'Shopper'),
        customerPhone: user?.phone || '',
        customerAddress: location ? `${location}, Ahmedabad` : 'Ahmedabad',
        landmark: 'Near Doorstep Location',
        paymentMethod: 'UPI (GPay / PhonePe)',
        paymentUpiRef: upiTxRef
      });

      router.push(`/order/${order.id}`);
    } catch (err) {
      console.warn('Darkstore order dispatch error:', err);
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', background: '#171717', overflow: 'hidden' }}>
      {/* Header */}
      <header
        style={{
          padding: '14px 16px',
          background: '#171717',
          borderBottom: '1px solid #242424',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            onClick={() => router.back()}
            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', padding: 0 }}
          >
            <img src="/assets/icons/back_arrow.svg" alt="Back" style={{ width: 22, height: 22 }} />
          </button>
          <div>
            <h1 style={{ fontSize: 17, fontWeight: 800, color: '#fff' }}>Shopping Bag</h1>
            <p style={{ fontSize: 11, color: '#888' }}>{cart.length} {cart.length === 1 ? 'item' : 'items'} • Delivering to {location.split(',')[0]}</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(56,189,248,0.1)', padding: '4px 10px', borderRadius: 20 }}>
          <span style={{ fontSize: 12 }}>⚡</span>
          <span style={{ fontSize: 11, fontWeight: 800, color: '#38bdf8' }}>{deliveryMinutes} Mins</span>
        </div>
      </header>

      {/* Main Body */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 80px' }}>
        {!user ? (
          /* Locked Auth State: Real JWT Email, Password & Phone required */
          <div style={{ textAlign: 'center', padding: '50px 20px', maxWidth: 360, margin: '0 auto' }}>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: 24,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
                border: '1px solid rgba(255,255,255,0.12)',
                margin: '0 auto 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 16px 36px rgba(0,0,0,0.5)'
              }}
            >
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.3)', padding: '4px 12px', borderRadius: 20, marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#38bdf8', letterSpacing: '0.04em' }}>AUTHENTICATION REQUIRED</span>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: '#fff', marginBottom: 8, letterSpacing: '-0.3px' }}>
              Sign In to Access Your Bag
            </h2>
            <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 28, lineHeight: '20px' }}>
              Create an account or log in with your email, password &amp; phone number to add fits, claim doorstep trials, and checkout.
            </p>
            <button
              onClick={() => setIsAuthOpen(true)}
              style={{
                width: '100%',
                background: '#ffffff',
                color: '#000000',
                border: 'none',
                borderRadius: 16,
                padding: '14px',
                fontSize: 13,
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 8px 24px rgba(255,255,255,0.2)'
              }}
            >
              <span>Sign In / Create Account</span>
              <span style={{ fontSize: 15 }}>→</span>
            </button>
          </div>
        ) : cart.length === 0 ? (
          /* Empty Cart State */
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div
              style={{
                width: 120,
                height: 120,
                margin: '0 auto 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <img
                src="/assets/images/dark_empty_cart.svg"
                alt="Empty Bag"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 8 }}>Your bag is empty</h2>
            <p style={{ fontSize: 13, color: '#888', marginBottom: 24, maxWidth: 280, margin: '0 auto 24px' }}>
              Explore fresh fits and get them delivered to your doorstep in 30 minutes!
            </p>
            <Link
              href="/"
              style={{
                display: 'inline-block',
                background: '#6678ff',
                color: '#fff',
                textDecoration: 'none',
                padding: '12px 28px',
                borderRadius: 24,
                fontSize: 13,
                fontWeight: 800
              }}
            >
              Explore Trending Fits
            </Link>
          </div>
        ) : (
          <>
            {/* Delivery Guarantee Notice */}
            <div
              style={{
                background: '#0f382c',
                border: '1px solid #195c47',
                borderRadius: 14,
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 16
              }}
            >
              <img src="/assets/icons/easy_refund_icon_dark.svg" alt="" style={{ width: 20, height: 20 }} />
              <div style={{ fontSize: 12, color: '#ddd' }}>
                <span style={{ fontWeight: 800, color: '#34d399' }}>Doorstep Trial Enabled:</span> Try fits for 15 mins. Keep what fits, return the rest on the spot!
              </div>
            </div>

            {/* Cart Items List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
              {cart.map((item) => (
                <div
                  key={`${item.product.id}-${item.size}`}
                  style={{
                    background: '#202029',
                    borderRadius: 18,
                    border: '1px solid #2e2e3c',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12
                  }}
                >
                  <div style={{ display: 'flex', gap: 12 }}>
                    {/* Thumbnail */}
                    <div
                      style={{
                        width: 76,
                        height: 90,
                        borderRadius: 12,
                        overflow: 'hidden',
                        background: '#252532',
                        flexShrink: 0
                      }}
                    >
                      <img
                        src={item.product.thumbnail}
                        alt={item.product.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>

                    {/* Details */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <span style={{ fontSize: 11, fontWeight: 800, color: '#888', textTransform: 'uppercase' }}>
                            {item.product.brand}
                          </span>
                          <button
                            onClick={() => removeFromCart(item.product.id, item.size)}
                            style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', padding: 2 }}
                          >
                            <img src="/assets/icons/delete.svg" alt="Delete" style={{ width: 16, height: 16, opacity: 0.7 }} />
                          </button>
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginTop: 2 }}>
                          {item.product.title}
                        </div>
                        <div style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>
                          Size: <span style={{ color: '#fff', fontWeight: 700 }}>{item.size}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                          <span style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>
                            ₹{item.product.price}
                          </span>
                          <span style={{ fontSize: 11, color: '#666', textDecoration: 'line-through' }}>
                            ₹{item.product.originalPrice}
                          </span>
                        </div>

                        {/* Quantity Stepper */}
                        <div
                          style={{
                            background: '#2a2a38',
                            borderRadius: 10,
                            display: 'flex',
                            alignItems: 'center',
                            border: '1px solid #38384a'
                          }}
                        >
                          <button
                            onClick={() => updateQuantity(item.product.id, item.size, -1)}
                            style={{ background: 'none', border: 'none', color: '#fff', padding: '4px 10px', cursor: 'pointer', fontSize: 14, fontWeight: 700 }}
                          >
                            -
                          </button>
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#fff', minWidth: 16, textAlign: 'center' }}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.size, 1)}
                            style={{ background: 'none', border: 'none', color: '#fff', padding: '4px 10px', cursor: 'pointer', fontSize: 14, fontWeight: 700 }}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Doorstep Trial Tag */}
                  <div
                    style={{
                      background: '#191922',
                      borderRadius: 10,
                      padding: '8px 10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      border: '1px solid #282835'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 10, fontWeight: 900, color: '#38bdf8' }}>TRY 'n BUY</span>
                      <span style={{ fontSize: 11, color: '#888' }}>Rider waits for trial</span>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#34d399' }}>INCLUDED</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Coupons Card */}
            <div
              onClick={() => setIsCouponOpen(true)}
              style={{
                background: '#20202a',
                border: '1px dashed #444458',
                borderRadius: 16,
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                marginBottom: 20
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <img src="/assets/icons/coupon.svg" alt="" style={{ width: 18, height: 18 }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>
                    {appliedCoupon ? `Coupon '${appliedCoupon}' Applied!` : 'Apply Coupon Code'}
                  </div>
                  <div style={{ fontSize: 11, color: '#888' }}>
                    {appliedCoupon ? `Saving ₹${discountAmount} on this order` : 'Unlock extra discounts'}
                  </div>
                </div>
              </div>

              {appliedCoupon ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeCoupon();
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ff2a85',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Remove
                </button>
              ) : (
                <img src="/assets/icons/right.svg" alt="" style={{ width: 14, height: 14, opacity: 0.6 }} />
              )}
            </div>

            {/* Bill Details */}
            <div
              style={{
                background: '#20202a',
                borderRadius: 18,
                border: '1px solid #2e2e3c',
                padding: '16px',
                marginBottom: 20
              }}
            >
              <h3 style={{ fontSize: 13, fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14 }}>
                Bill Details
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#aaa' }}>
                  <span>Bag Total (MRP)</span>
                  <span>₹{rawMrp}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#34d399' }}>
                  <span>Bag Discount</span>
                  <span>-₹{rawMrp - rawSubtotal}</span>
                </div>
                {appliedCoupon && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ff2a85' }}>
                    <span>Coupon Discount</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#aaa' }}>
                  <span>⚡ 30-Min Instant Delivery</span>
                  <span style={{ color: '#34d399', fontWeight: 700 }}>FREE</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#aaa' }}>
                  <span>Doorstep Trial Fee</span>
                  <span style={{ color: '#34d399', fontWeight: 700 }}>FREE</span>
                </div>

                <div style={{ height: 1, background: '#2f2f3d', margin: '4px 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 900, color: '#fff' }}>
                  <span>Total Amount</span>
                  <span>₹{cartTotal}</span>
                </div>

                <div style={{ fontSize: 11, fontWeight: 700, color: '#34d399', background: 'rgba(52,211,153,0.1)', padding: '6px 10px', borderRadius: 8, textAlign: 'center' }}>
                  You are saving ₹{totalSavings} on this order!
                </div>
              </div>

              {/* 100% Advance Payment & Instant Hub Refund Guarantee */}
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(99, 102, 241, 0.08) 100%)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: 14,
                  padding: '12px 14px',
                  marginTop: 14,
                  display: 'flex',
                  gap: 12,
                  alignItems: 'center'
                }}
              >
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 18 }}>⚡</span>
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#34d399' }}>
                    100% Advance Payment · Instant Hub Refund Guarantee
                  </div>
                  <div style={{ fontSize: 11, color: '#aaa', marginTop: 3, lineHeight: '15px' }}>
                    Pay total in advance. Try all fits in your mirror for 15 mins. Keep what you love; any returned items are refunded <strong>instantly to your account</strong> the moment the runner checks them into our hub!
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Sticky Bottom Checkout Bar */}
      {user && cart.length > 0 && (
        <div
          style={{
            position: 'sticky',
            bottom: 0,
            background: '#15151c',
            borderTop: '1px solid #282835',
            padding: '12px 16px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 40
          }}
        >
          <div>
            <div style={{ fontSize: 10, color: '#34d399', fontWeight: 700, textTransform: 'uppercase' }}>100% Advance Payment</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#fff' }}>
              ₹{cartTotal}
            </div>
          </div>

          <button
            onClick={handleCheckout}
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 16,
              padding: '12px 22px',
              fontSize: 13,
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 18px rgba(16, 185, 129, 0.4)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>Pay ₹{cartTotal} &amp; Dispatch</span>
              <img src="/assets/icons/right.svg" alt="" style={{ width: 14, height: 14, filter: 'brightness(0) invert(1)' }} />
            </div>
            <span style={{ fontSize: '10px', opacity: 0.85, fontWeight: 600 }}>Instant refund on hub return</span>
          </button>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
