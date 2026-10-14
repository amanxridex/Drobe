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

  const handleCustomerPurchased = () => {
    if (!activeOrder) return;
    updateTrialOrderStatus(activeOrder.id, 'Kept on Spot (Purchased)');
    setPaymentSuccessMsg(`Payment of ${activeOrder.price} collected via UPI QR code! Trial completed.`);
    setTimeout(() => setPaymentSuccessMsg(null), 5000);
    syncData();
  };

  const handleCustomerReturned = () => {
    if (!activeOrder) return;
    updateTrialOrderStatus(activeOrder.id, 'Returned on Spot (Runner Heading to Hub)', 'Instant Doorstep Return · Heading back to Ahmedabad Hub');
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
                        onClick={handleCustomerPurchased}
                      >
                        <span>🎉</span>
                        <span>Customer Kept & Paid</span>
                      </button>

                      <button 
                        className={`${styles.bigActionButton} ${styles.btnDanger}`}
                        onClick={handleCustomerReturned}
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
    </div>
  );
}
