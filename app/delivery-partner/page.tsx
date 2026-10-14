'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './delivery.module.css';
import {
  getTrialOrders,
  getDarkstoreRunners,
  getOrderByNumber,
  updateTrialOrderStatus,
  handoverOrderToRunner,
  getOrderDeliveryOtp,
  verifyOrderOtp,
  confirmCustomerPayment,
  confirmCustomerReturnWithSeal,
  AHMEDABAD_WAREHOUSE,
  TrialOrder,
  DarkstoreRunner
} from '../lib/darkstoreData';

export default function DeliveryPartnerApp() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'fetch' | 'runs' | 'stats'>('fetch');
  const [runners, setRunners] = useState<DarkstoreRunner[]>([]);
  const [currentRunner, setCurrentRunner] = useState<DarkstoreRunner | null>(null);
  const [orderInput, setOrderInput] = useState<string>('DRB-9842');
  const [activeOrder, setActiveOrder] = useState<TrialOrder | null>(null);
  const [allOrders, setAllOrders] = useState<TrialOrder[]>([]);
  const [doorstepTimer, setDoorstepTimer] = useState<number>(14 * 60 + 22); // 14 mins 22 secs
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState<string | null>(null);

  // Doorstep OTP Verification State
  const [showOtpModal, setShowOtpModal] = useState<boolean>(false);
  const [otpInput, setOtpInput] = useState<string>('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isOtpVerified, setIsOtpVerified] = useState<boolean>(false);
  const [pendingDecision, setPendingDecision] = useState<'kept' | 'returned' | null>(null);
  const [showOtpHint, setShowOtpHint] = useState<boolean>(false);

  // Doorstep Dynamic UPI QR Modal State
  const [showUpiModal, setShowUpiModal] = useState<boolean>(false);
  const [upiTxnId, setUpiTxnId] = useState<string>('');

  // Tamper-Evident Return Bag Seal Modal State
  const [showReturnSealModal, setShowReturnSealModal] = useState<boolean>(false);
  const [returnSealInput, setReturnSealInput] = useState<string>('SEAL-8842');
  const [returnReasonInput, setReturnReasonInput] = useState<string>('Size / fit did not suit at doorstep');

  // Sync data safely
  const syncData = () => {
    try {
      const rList = getDarkstoreRunners() || [];
      setRunners(rList);
      if (!currentRunner && rList.length > 0) {
        setCurrentRunner(rList[0]);
      }
      const oList = getTrialOrders() || [];
      setAllOrders(oList);

      if (orderInput && orderInput.trim()) {
        const match = getOrderByNumber(orderInput);
        setActiveOrder(match);
      }
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    setMounted(true);
    syncData();

    const handleStorage = () => syncData();
    window.addEventListener('storage', handleStorage);
    window.addEventListener('drobe_new_order', handleStorage);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('drobe_new_order', handleStorage);
    };
  }, []);

  // Real-time auto-fetch on typing or clicking
  useEffect(() => {
    if (!mounted) return;
    if (!orderInput || !orderInput.trim()) {
      setActiveOrder(null);
      return;
    }
    try {
      const matched = getOrderByNumber(orderInput);
      setActiveOrder(matched);
      setIsOtpVerified(false);
      setOtpInput('');
      setOtpError(null);
    } catch {
      setActiveOrder(null);
    }
  }, [orderInput, allOrders, mounted]);

  // Doorstep 15-min countdown timer
  useEffect(() => {
    if (activeOrder?.status === 'Doorstep Fitting (Runner Waiting Outside)') {
      const timer = setInterval(() => {
        setDoorstepTimer(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [activeOrder?.status]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Actions
  const handleSelectOrderChip = (ordNum: string) => {
    setOrderInput(ordNum);
  };

  const handleConfirmHubHandover = () => {
    if (!activeOrder) return;
    handoverOrderToRunner(activeOrder.id);
    syncData();
  };

  const handleStartDeliveryRide = () => {
    if (!activeOrder) return;
    updateTrialOrderStatus(activeOrder.id, 'Out for 30-Min Delivery');
    syncData();
  };

  const handleArrivedDoorstep = () => {
    if (!activeOrder) return;
    updateTrialOrderStatus(activeOrder.id, 'Doorstep Fitting (Runner Waiting Outside)');
    setDoorstepTimer(15 * 60);
    syncData();
  };

  // Step 3a: Initiate Purchased (checks OTP first)
  const handleInitiateCustomerPurchased = () => {
    if (!activeOrder) return;
    if (!isOtpVerified) {
      setPendingDecision('kept');
      setOtpInput('');
      setOtpError(null);
      setShowOtpHint(false);
      setShowOtpModal(true);
    } else {
      setUpiTxnId(`UPI-TXN-${Math.floor(100000 + Math.random() * 900000)}`);
      setShowUpiModal(true);
    }
  };

  // Step 3b: Initiate Returned (checks OTP first)
  const handleInitiateCustomerReturned = () => {
    if (!activeOrder) return;
    if (!isOtpVerified) {
      setPendingDecision('returned');
      setOtpInput('');
      setOtpError(null);
      setShowOtpHint(false);
      setShowOtpModal(true);
    } else {
      setReturnSealInput(`SEAL-${Math.floor(1000 + Math.random() * 9000)}`);
      setShowReturnSealModal(true);
    }
  };

  // Verify OTP handler
  const handleVerifyOtpSubmit = () => {
    if (!activeOrder) return;
    const isValid = verifyOrderOtp(activeOrder.id, otpInput);
    if (!isValid) {
      setOtpError('Invalid OTP. Please check the 4-digit code provided by the customer.');
      return;
    }
    setOtpError(null);
    setIsOtpVerified(true);
    setShowOtpModal(false);

    if (pendingDecision === 'kept') {
      setUpiTxnId(`UPI-TXN-${Math.floor(100000 + Math.random() * 900000)}`);
      setShowUpiModal(true);
    } else if (pendingDecision === 'returned') {
      setReturnSealInput(`SEAL-${Math.floor(1000 + Math.random() * 9000)}`);
      setShowReturnSealModal(true);
    }
  };

  // Confirm UPI payment collected on spot
  const handleConfirmPayment = () => {
    if (!activeOrder) return;
    confirmCustomerPayment(activeOrder.id, upiTxnId);
    setShowUpiModal(false);
    setPaymentSuccessMsg(`✓ Payment of ${activeOrder.price} collected via Dynamic UPI QR (${upiTxnId})! Order finalized.`);
    setTimeout(() => setPaymentSuccessMsg(null), 5000);
    syncData();
  };

  // Confirm tamper seal tag on return
  const handleConfirmReturnSeal = () => {
    if (!activeOrder) return;
    confirmCustomerReturnWithSeal(activeOrder.id, returnSealInput, returnReasonInput);
    setShowReturnSealModal(false);
    setPaymentSuccessMsg(`✓ Tamper-proof bag #${returnSealInput} sealed. Heading back to Shivam Bungalows 1, Koteshwar Road.`);
    setTimeout(() => setPaymentSuccessMsg(null), 5000);
    syncData();
  };

  const handleRestockHub = () => {
    if (!activeOrder) return;
    updateTrialOrderStatus(activeOrder.id, 'Restocked to Warehouse Shelf');
    syncData();
  };

  const switchRunner = (runnerId: string) => {
    const r = runners.find(item => item.id === runnerId);
    if (r) setCurrentRunner(r);
  };

  // Hydration guard
  if (!mounted) {
    return (
      <div className={styles.riderAppRoot} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#ffffff' }}>
        <div style={{ color: '#64748b', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🛵</span>
          <span>Loading Ahmedabad Runner Portal...</span>
        </div>
      </div>
    );
  }

  // Filter orders for active runs tab safely
  const runnerRuns = (allOrders || []).filter(o => 
    o && 
    o.status !== 'Restocked to Warehouse Shelf' && 
    (o.riderName === currentRunner?.name || (o.status || '').includes('Picked') || (o.status || '').includes('Runner Assigned'))
  );

  // Safe variables for activeOrder
  const custName = activeOrder?.customerName || 'Aarav Parekh';
  const custPhone = activeOrder?.customerPhone || '+91 98250 88123';
  const cleanPhone = custPhone.replace(/[^0-9]/g, '') || '9825088123';
  const custAddress = activeOrder?.customerAddress || 'B-702, Shaligram Plus, Opp. Iskcon Temple, SG Highway, Ahmedabad';
  const prodName = activeOrder?.productName || 'Garment Piece';
  const prodSize = activeOrder?.size || 'M';
  const runnerName = currentRunner?.name || 'Drobe Runner';

  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hello ${custName}! I am ${runnerName} from Drobe arriving with your 30-minute trial bag for ${prodName} (${prodSize}).`)}`;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(custAddress)}`;

  return (
    <div className={styles.riderAppRoot}>
      {/* Rider Top Header */}
      <header className={styles.riderHeader}>
        <div className={styles.topBarRow}>
          <div className={styles.riderLogoRow}>
            <span className={styles.riderBadge}>DROBE RUNNER</span>
            <span className={styles.appTitle}>Ahmedabad Express</span>
          </div>

          <div className={styles.hubLinkGroup}>
            <Link href="/order-portal" className={styles.hubPortalBtn}>
              📦 Hub Portal
            </Link>
            <Link href="/admin-dashboard" className={styles.hubPortalBtn}>
              🏢 Inward Hub
            </Link>
          </div>
        </div>

        {/* Active Rider Profile Card */}
        {currentRunner && (
          <div className={styles.riderCard}>
            <div className={styles.riderIdentity}>
              <div className={styles.riderAvatar}>🛵</div>
              <div className={styles.riderInfo}>
                <h2>
                  {currentRunner.name}
                  <span className={styles.riderRating}>★ {currentRunner.rating}</span>
                </h2>
                <div className={styles.riderVehicleSub}>{currentRunner.vehicle}</div>
              </div>
            </div>

            <div className={styles.riderStatsQuick}>
              <span className={styles.batteryTag}>⚡ {currentRunner.batteryOrFuel}</span>
              <span className={styles.deliveriesTag}>{currentRunner.deliveriesToday} trials today</span>
            </div>
          </div>
        )}
      </header>

      {/* Hub Station Banner */}
      <div className={styles.hubStationBanner}>
        <div className={styles.hubStationText}>
          <span>📍</span>
          <span>Hub: {AHMEDABAD_WAREHOUSE.address}</span>
        </div>
        <span style={{ color: '#38bdf8', fontWeight: 600 }}>30-Min SLA</span>
      </div>

      {/* Screen Navigation Tabs */}
      <nav className={styles.screenNavTabs}>
        <button 
          className={`${styles.screenNavTab} ${activeTab === 'fetch' ? styles.screenNavTabActive : ''}`}
          onClick={() => setActiveTab('fetch')}
        >
          <span>🔍</span>
          <span>Order Auto-Fetch</span>
        </button>

        <button 
          className={`${styles.screenNavTab} ${activeTab === 'runs' ? styles.screenNavTabActive : ''}`}
          onClick={() => setActiveTab('runs')}
        >
          <span>📋</span>
          <span>Active Runs ({runnerRuns.length})</span>
        </button>

        <button 
          className={`${styles.screenNavTab} ${activeTab === 'stats' ? styles.screenNavTabActive : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          <span>📊</span>
          <span>Earnings & Fleet</span>
        </button>
      </nav>

      {/* Payment Success Toast */}
      {paymentSuccessMsg && (
        <div style={{
          background: 'linear-gradient(90deg, #10b981, #059669)',
          color: '#000',
          padding: '12px 16px',
          fontWeight: 800,
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          margin: '12px 16px 0 16px',
          borderRadius: '10px'
        }}>
          <span>🎉</span>
          <span>{paymentSuccessMsg}</span>
        </div>
      )}

      {/* Main Tab Views */}
      <main className={styles.mainContent}>
        {/* TAB 1: ORDER NUMBER AUTO-FETCH & EXECUTION (User's primary requirement!) */}
        {activeTab === 'fetch' && (
          <>
            {/* Auto-fetch Input Box */}
            <section className={styles.fetchInputSection}>
              <div className={styles.fetchLabel}>
                <span>ENTER ORDER NUMBER TO AUTO-FETCH DETAILS:</span>
                <span style={{ color: '#34d399', fontSize: '10px' }}>● LIVE DATABASE</span>
              </div>

              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>#</span>
                <input 
                  type="text"
                  className={styles.fetchInput}
                  placeholder="e.g. DRB-9850, 9849, 9842..."
                  value={orderInput}
                  onChange={e => setOrderInput(e.target.value)}
                  autoFocus
                />
              </div>

              {/* Quick Suggestion Chips */}
              <div className={styles.quickChipsRow}>
                {(allOrders || []).slice(0, 6).map(ord => (
                  <button 
                    key={ord.id}
                    className={`${styles.orderChip} ${activeOrder?.orderNumber === ord.orderNumber ? styles.orderChipActive : ''}`}
                    onClick={() => handleSelectOrderChip(ord.orderNumber)}
                  >
                    {ord.orderNumber}
                  </button>
                ))}
              </div>
            </section>

            {/* Auto-fetched Order Result Manifest */}
            {activeOrder ? (
              <section className={styles.manifestCard}>
                {/* Manifest Header */}
                <div className={styles.manifestHeader}>
                  <div className={styles.manifestOrderNumber}>{activeOrder.orderNumber}</div>
                  <div className={`
                    ${styles.statusPill}
                    ${(activeOrder.status || '').includes('Received') || (activeOrder.status || '').includes('Picked') ? styles.statusPillAssigned : ''}
                    ${(activeOrder.status || '').includes('Delivery') ? styles.statusPillTransit : ''}
                    ${(activeOrder.status || '').includes('Doorstep') ? styles.statusPillDoorstep : ''}
                    ${(activeOrder.status || '').includes('Kept') ? styles.statusPillDone : ''}
                  `}>
                    {activeOrder.status}
                  </div>
                </div>

                {/* Customer Details Box: Name & Phone Auto-fetched */}
                <div className={styles.customerHighlightBox}>
                  <div className={styles.customerHeaderRow}>
                    <div className={styles.customerNameWrap}>
                      <span className={styles.customerTag}>CUSTOMER FOR 30-MIN TRIAL:</span>
                      <h3>👤 {custName}</h3>
                    </div>
                    <span style={{ color: '#fbbf24', fontSize: '12px', fontWeight: 700 }}>
                      📍 {activeOrder.distanceKm || '2.1 km'}
                    </span>
                  </div>

                  {/* 1-Tap Customer Phone Actions */}
                  <div className={styles.phoneActionRow}>
                    <a 
                      href={`tel:${custPhone}`} 
                      className={styles.callCustomerBtn}
                    >
                      <span>📞</span>
                      <span>Call {custPhone}</span>
                    </a>

                    <a 
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.whatsappCustomerBtn}
                    >
                      <span>💬</span>
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>

                {/* Delivery Address & Navigation Auto-fetched */}
                <div className={styles.addressBlock}>
                  <div className={styles.addressHeader}>
                    <span>🗺️</span>
                    <span>WHERE TO DELIVER (DROP LOCATION):</span>
                  </div>

                  <div className={styles.fullAddressText}>
                    {custAddress}
                  </div>

                  {activeOrder.landmark && (
                    <div className={styles.landmarkSnippet}>
                      <span>🚩 Landmark: <strong>{activeOrder.landmark}</strong></span>
                      <span>ETA ~12 mins</span>
                    </div>
                  )}

                  <a 
                    href={mapsUrl}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.mapsNavBtn}
                  >
                    <span>🧭</span>
                    <span>Open in Google Maps Navigation</span>
                  </a>
                </div>

                {/* Bag & Shelf Info Auto-fetched */}
                <div className={styles.bagInfoSection}>
                  <div className={styles.bagItemMeta}>
                    <h4>{prodName} ({prodSize})</h4>
                    <span>{activeOrder.brandName || 'Atelier'} • SKU: {activeOrder.productSku || 'DR1'} • Collect: <strong>{activeOrder.price}</strong></span>
                  </div>

                  <div className={styles.shelfOriginBadge}>
                    <span>HUB SHELF:</span>
                    <div>{activeOrder.shelfLocation || 'AMD-RA02-S3-B04'}</div>
                  </div>
                </div>

                {/* Doorstep Fitting Live 15-Min Timer (Active when runner reaches customer) */}
                {activeOrder.status === 'Doorstep Fitting (Runner Waiting Outside)' && (
                  <div className={styles.doorstepTimerCard}>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#c4b5fd', fontWeight: 700 }}>
                      ⏱️ DOORSTEP FITTING TIMER ACTIVE
                    </div>
                    <div className={styles.timerClockVal}>{formatTimer(doorstepTimer)}</div>
                    <div className={styles.timerInstruction}>
                      Client is trying clothes inside apartment. Runner is waiting outside with trial bag.
                    </div>
                  </div>
                )}

                {/* Lifecycle Rider Action Buttons */}
                <div className={styles.actionControls}>
                  {/* Step 1: Handover Confirmation */}
                  {((activeOrder.status || '').includes('Received') || (activeOrder.status || '').includes('Picked') || (activeOrder.status || '').includes('Runner Assigned')) && (
                    <button 
                      className={`${styles.bigActionButton} ${styles.btnPrimary}`}
                      onClick={handleConfirmHubHandover}
                    >
                      <span>🤝</span>
                      <span>Confirm Handover from Koteshwar Hub</span>
                    </button>
                  )}

                  {/* Step 2: On The Road */}
                  {activeOrder.status === 'Out for 30-Min Delivery' && (
                    <button 
                      className={`${styles.bigActionButton} ${styles.btnPrimary}`}
                      onClick={handleArrivedDoorstep}
                    >
                      <span>📍</span>
                      <span>I Have Arrived at Doorstep (Hand Bag to Customer)</span>
                    </button>
                  )}

                  {/* Step 3: Doorstep Fitting Outcome */}
                  {activeOrder.status === 'Doorstep Fitting (Runner Waiting Outside)' && (
                    <div className={styles.actionButtonDualRow}>
                      <button 
                        className={`${styles.bigActionButton} ${styles.btnSuccess}`}
                        onClick={handleInitiateCustomerPurchased}
                      >
                        <span>🎉</span>
                        <span>Customer Kept & Paid</span>
                      </button>

                      <button 
                        className={`${styles.bigActionButton} ${styles.btnDanger}`}
                        onClick={handleInitiateCustomerReturned}
                      >
                        <span>↩️</span>
                        <span>Customer Returned</span>
                      </button>
                    </div>
                  )}

                  {/* Step 4: Restock on return */}
                  {activeOrder.status === 'Returned on Spot (Runner Heading to Hub)' && (
                    <button 
                      className={`${styles.bigActionButton} ${styles.btnPrimary}`}
                      style={{ background: '#d97706' }}
                      onClick={handleRestockHub}
                    >
                      <span>📦</span>
                      <span>Restock to Hub Shelf ({activeOrder.shelfLocation})</span>
                    </button>
                  )}

                  {/* Step 5: Completed */}
                  {activeOrder.status === 'Kept on Spot (Purchased)' && (
                    <div style={{ textAlign: 'center', padding: '10px', color: '#34d399', fontSize: '13px', fontWeight: 700 }}>
                      ✓ Order successfully delivered & kept by customer!
                    </div>
                  )}
                  {activeOrder.status === 'Restocked to Warehouse Shelf' && (
                    <div style={{ textAlign: 'center', padding: '10px', color: '#94a3b8', fontSize: '13px', fontWeight: 700 }}>
                      ✓ Garment returned & restocked to shelf {activeOrder.shelfLocation}
                    </div>
                  )}
                </div>
              </section>
            ) : (
              <div className={styles.notFoundState}>
                <span style={{ fontSize: '32px' }}>🔎</span>
                <div>
                  <strong>Order &ldquo;{orderInput}&rdquo; Not Found</strong>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px' }}>
                    Type a valid order number or tap one of the active chips above to auto-fetch customer and delivery details.
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {/* TAB 2: MY ACTIVE RUNS */}
        {activeTab === 'runs' && (
          <section className={styles.activeRunsContainer}>
            <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>
              ACTIVE DISPATCH RUNS ({runnerRuns.length})
            </div>

            {runnerRuns.length === 0 ? (
              <div className={styles.notFoundState}>
                <span>✨</span>
                <span>No active runs right now. All orders delivered or restocked!</span>
              </div>
            ) : (
              runnerRuns.map(run => (
                <div 
                  key={run.id}
                  className={styles.runMiniCard}
                  onClick={() => {
                    setOrderInput(run.orderNumber);
                    setActiveTab('fetch');
                  }}
                >
                  <div className={styles.runMiniTop}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#0f172a' }}>
                      {run.orderNumber}
                    </span>
                    <span style={{ fontSize: '11px', color: '#2563eb', fontWeight: 700 }}>
                      📍 {run.distanceKm || '2.1 km'}
                    </span>
                  </div>

                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                    {run.customerName}
                  </div>

                  <div style={{ fontSize: '11px', color: '#475569' }}>
                    {run.customerAddress}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>
                      {run.productName} ({run.size})
                    </span>
                    <span className={styles.statusPill} style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1' }}>
                      {run.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </section>
        )}

        {/* TAB 3: EARNINGS & FLEET SWITCHER */}
        {activeTab === 'stats' && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className={styles.earningsCard}>
              <div className={styles.earningsTotal}>
                <h3>Today&apos;s Earnings (Trial Deliveries)</h3>
                <div className={styles.amount}>₹1,240</div>
              </div>

              <div className={styles.statsGrid}>
                <div className={styles.statItem}>
                  <span className={styles.val}>{currentRunner?.deliveriesToday || 8}</span>
                  <span className={styles.lbl}>30-Min Trials Completed</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.val}>96%</span>
                  <span className={styles.lbl}>On-Time SLA Rate</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.val}>⭐ {currentRunner?.rating || 4.9}</span>
                  <span className={styles.lbl}>Customer Rating</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.val}>₹85</span>
                  <span className={styles.lbl}>Payout per Doorstep Trial</span>
                </div>
              </div>

              {/* Navigation Back to Ahmedabad Darkstore Hub */}
              <a 
                href="https://www.google.com/maps/search/?api=1&query=Shivam+Bungalows+1,+Koteshwar+Road,+Ahmedabad"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.returnHubBtn}
              >
                <span>🗺️</span>
                <span>Navigate Return to Koteshwar Hub</span>
              </a>
            </div>

            {/* Runner Profile Switcher for Testing */}
            <div style={{ background: '#ffffff', padding: '14px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(15,23,42,0.04)' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#b45309', textTransform: 'uppercase', marginBottom: '8px' }}>
                SWITCH RUNNER PROFILE (DEMO):
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {(runners || []).map(r => (
                  <button
                    key={r.id}
                    onClick={() => switchRunner(r.id)}
                    style={{
                      background: currentRunner?.id === r.id ? '#2563eb' : '#f8fafc',
                      border: currentRunner?.id === r.id ? '1px solid #2563eb' : '1px solid #e2e8f0',
                      color: currentRunner?.id === r.id ? '#ffffff' : '#0f172a',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '12px',
                      fontWeight: currentRunner?.id === r.id ? 700 : 500
                    }}
                  >
                    <div>
                      <strong>{r.name}</strong> • {r.vehicle}
                    </div>
                    <span>{r.batteryOrFuel}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* 1. DOORSTEP OTP VERIFICATION MODAL */}
      {showOtpModal && activeOrder && (
        <div className={styles.modalBackdrop} onClick={() => setShowOtpModal(false)}>
          <div className={styles.runnerModalCard} onClick={e => e.stopPropagation()}>
            <div className={styles.runnerModalHeader}>
              <div>
                <strong style={{ fontSize: '14px' }}>DOORSTEP OTP VERIFICATION</strong>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>Order {activeOrder.orderNumber}</div>
              </div>
              <button 
                onClick={() => setShowOtpModal(false)}
                style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', fontSize: '18px' }}
              >
                ✕
              </button>
            </div>

            <div className={styles.runnerModalBody}>
              <div style={{ fontSize: '13px', color: '#475569', lineHeight: 1.4 }}>
                Ask customer <strong>{activeOrder.customerName}</strong> for the 4-digit verification PIN displayed in their DROBE order confirmation.
              </div>

              <input 
                type="text"
                maxLength={4}
                placeholder="• • • •"
                className={styles.otpInputBox}
                value={otpInput}
                onChange={e => setOtpInput(e.target.value.replace(/[^0-9]/g, ''))}
                autoFocus
              />

              {otpError && (
                <div style={{ color: '#ef4444', fontSize: '12px', fontWeight: 600, textAlign: 'center' }}>
                  {otpError}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => setShowOtpHint(!showOtpHint)}
                  style={{ background: 'none', border: 'none', color: '#0284c7', fontSize: '12px', cursor: 'pointer', fontWeight: 600, padding: 0 }}
                >
                  {showOtpHint ? `Doorstep PIN: ${getOrderDeliveryOtp(activeOrder)}` : 'Customer Forgot OTP?'}
                </button>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>4 digits</span>
              </div>

              <button 
                className={`${styles.bigActionButton} ${styles.btnPrimary}`}
                onClick={handleVerifyOtpSubmit}
                style={{ marginTop: '6px' }}
              >
                <span>🔒</span>
                <span>Verify & Proceed to {pendingDecision === 'kept' ? 'Payment' : 'Return Bag Seal'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. DYNAMIC DOORSTEP UPI PAYMENT QR CODE MODAL */}
      {showUpiModal && activeOrder && (
        <div className={styles.modalBackdrop} onClick={() => setShowUpiModal(false)}>
          <div className={styles.runnerModalCard} onClick={e => e.stopPropagation()}>
            <div className={styles.runnerModalHeader} style={{ background: '#059669' }}>
              <div>
                <strong style={{ fontSize: '14px' }}>COLLECT UPI PAYMENT ON SPOT</strong>
                <div style={{ fontSize: '11px', color: '#d1fae5' }}>Customer Kept: {activeOrder.productName}</div>
              </div>
              <button 
                onClick={() => setShowUpiModal(false)}
                style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', fontSize: '18px' }}
              >
                ✕
              </button>
            </div>

            <div className={styles.runnerModalBody}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                  TOTAL AMOUNT TO COLLECT:
                </div>
                <div style={{ fontSize: '32px', fontWeight: 900, color: '#059669', margin: '4px 0' }}>
                  {activeOrder.price}
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                  Zero delivery charge · 30-min express trial
                </div>
              </div>

              {/* Dynamic QR Display */}
              <div className={styles.upiQrBox}>
                <svg className={styles.upiQrSvg} viewBox="0 0 100 100">
                  {/* Top-Left Finder */}
                  <rect x="5" y="5" width="28" height="28" rx="4" fill="#0f172a" />
                  <rect x="9" y="9" width="20" height="20" rx="2" fill="#ffffff" />
                  <rect x="13" y="13" width="12" height="12" rx="1" fill="#0f172a" />

                  {/* Top-Right Finder */}
                  <rect x="67" y="5" width="28" height="28" rx="4" fill="#0f172a" />
                  <rect x="71" y="9" width="20" height="20" rx="2" fill="#ffffff" />
                  <rect x="75" y="13" width="12" height="12" rx="1" fill="#0f172a" />

                  {/* Bottom-Left Finder */}
                  <rect x="5" y="67" width="28" height="28" rx="4" fill="#0f172a" />
                  <rect x="9" y="71" width="20" height="20" rx="2" fill="#ffffff" />
                  <rect x="13" y="75" width="12" height="12" rx="1" fill="#0f172a" />

                  {/* Matrix Pattern Dots */}
                  <rect x="40" y="8" width="6" height="6" fill="#059669" />
                  <rect x="52" y="8" width="6" height="6" fill="#0f172a" />
                  <rect x="40" y="20" width="6" height="6" fill="#0f172a" />
                  <rect x="48" y="24" width="8" height="8" fill="#059669" />

                  <rect x="8" y="40" width="6" height="6" fill="#0f172a" />
                  <rect x="20" y="40" width="8" height="6" fill="#059669" />
                  <rect x="12" y="52" width="6" height="6" fill="#0f172a" />

                  <rect x="40" y="40" width="18" height="18" rx="3" fill="#0f172a" />
                  <rect x="44" y="44" width="10" height="10" fill="#ffffff" />
                  <rect x="47" y="47" width="4" height="4" fill="#059669" />

                  <rect x="68" y="40" width="6" height="6" fill="#0f172a" />
                  <rect x="80" y="44" width="8" height="6" fill="#059669" />
                  <rect x="74" y="56" width="6" height="6" fill="#0f172a" />

                  <rect x="40" y="68" width="8" height="6" fill="#059669" />
                  <rect x="54" y="72" width="6" height="8" fill="#0f172a" />
                  <rect x="46" y="84" width="8" height="6" fill="#059669" />

                  <rect x="68" y="68" width="6" height="8" fill="#0f172a" />
                  <rect x="80" y="72" width="8" height="6" fill="#059669" />
                  <rect x="72" y="84" width="6" height="6" fill="#0f172a" />
                  <rect x="84" y="84" width="6" height="6" fill="#0f172a" />
                </svg>

                <div style={{ fontSize: '11px', color: '#334155', fontWeight: 700 }}>
                  Scan via GPay · PhonePe · Paytm · BHIM · CRED
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>
                  UPI: <strong>drobe.ahmedabad@icici</strong>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '4px' }}>
                  UPI TRANSACTION / UTR REFERENCE:
                </label>
                <input 
                  type="text"
                  className={styles.sealInputBox}
                  value={upiTxnId}
                  onChange={e => setUpiTxnId(e.target.value)}
                />
              </div>

              <button 
                className={`${styles.bigActionButton} ${styles.btnSuccess}`}
                onClick={handleConfirmPayment}
              >
                <span>✓</span>
                <span>Confirm Payment Received ({activeOrder.price})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. TAMPER-EVIDENT RETURN BAG SEAL MODAL */}
      {showReturnSealModal && activeOrder && (
        <div className={styles.modalBackdrop} onClick={() => setShowReturnSealModal(false)}>
          <div className={styles.runnerModalCard} onClick={e => e.stopPropagation()}>
            <div className={styles.runnerModalHeader} style={{ background: '#dc2626' }}>
              <div>
                <strong style={{ fontSize: '14px' }}>INSTANT DOORSTEP RETURN</strong>
                <div style={{ fontSize: '11px', color: '#fee2e2' }}>Seal Bag & Return to Ahmedabad Hub</div>
              </div>
              <button 
                onClick={() => setShowReturnSealModal(false)}
                style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', fontSize: '18px' }}
              >
                ✕
              </button>
            </div>

            <div className={styles.runnerModalBody}>
              <div style={{ fontSize: '13px', color: '#475569', lineHeight: 1.4 }}>
                Place <strong>{activeOrder.productName} ({activeOrder.size})</strong> back into the return pouch and lock with tamper-evident security seal.
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '4px' }}>
                  TAMPER-EVIDENT BAG SEAL NUMBER:
                </label>
                <input 
                  type="text"
                  className={styles.sealInputBox}
                  value={returnSealInput}
                  onChange={e => setReturnSealInput(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '4px' }}>
                  RETURN REASON:
                </label>
                <select 
                  className={styles.sealInputBox}
                  value={returnReasonInput}
                  onChange={e => setReturnReasonInput(e.target.value)}
                >
                  <option value="Size / fit did not suit at doorstep">Size / fit did not suit at doorstep</option>
                  <option value="Client preferred another color or silhouette">Client preferred another silhouette</option>
                  <option value="Fabric / material feel not as expected">Fabric / material feel not as expected</option>
                  <option value="Customer decided not to purchase">Customer decided not to purchase</option>
                </select>
              </div>

              <button 
                className={`${styles.bigActionButton} ${styles.btnDanger}`}
                onClick={handleConfirmReturnSeal}
              >
                <span>🔒</span>
                <span>Lock Bag Seal & Ride to Koteshwar Hub</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

