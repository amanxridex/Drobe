'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import styles from './order-portal.module.css';
import {
  getTrialOrders,
  getDarkstoreRunners,
  getDarkstoreProducts,
  pickerPackOrder,
  assignRunnerToOrder,
  handoverOrderToRunner,
  updateTrialOrderStatus,
  createCustomerOrder,
  getOrderDeliveryOtp,
  generateShiftReportCsv,
  AHMEDABAD_WAREHOUSE,
  TrialOrder,
  DarkstoreRunner
} from '../lib/darkstoreData';

export default function OrderPortalPage() {
  const [orders, setOrders] = useState<TrialOrder[]>([]);
  const [runners, setRunners] = useState<DarkstoreRunner[]>([]);
  const [selectedRunners, setSelectedRunners] = useState<Record<string, string>>({});
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [pickingSlipOrder, setPickingSlipOrder] = useState<TrialOrder | null>(null);
  const [incomingAlert, setIncomingAlert] = useState<{
    orderNumber: string;
    customer: string;
    product: string;
    shelf: string;
    time: string;
  } | null>(null);

  // Load sound preference
  useEffect(() => {
    try {
      const saved = localStorage.getItem('drobe_hub_sound');
      if (saved !== null) {
        setSoundEnabled(saved === 'true');
      }
    } catch {}
  }, []);

  const toggleSound = () => {
    setSoundEnabled(prev => {
      const next = !prev;
      try {
        localStorage.setItem('drobe_hub_sound', String(next));
      } catch {}
      return next;
    });
  };

  // Export shift report CSV
  const handleExportCsv = () => {
    try {
      const csvContent = generateShiftReportCsv();
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `DROBE_Ahmedabad_Hub_Shift_Report_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {}
  };

  // Play modern web audio chime when an order arrives
  const playAlertChime = () => {
    if (!soundEnabled) return;
    try {
      if (typeof window === 'undefined') return;
      const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc1.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.15);
      osc2.frequency.exponentialRampToValueAtTime(1174.66, ctx.currentTime + 0.35); // D6

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.2);
      osc2.start(ctx.currentTime + 0.15);
      osc2.stop(ctx.currentTime + 0.5);
    } catch {
      // Audio autoplay policy fallback
    }
  };

  const refreshOrders = () => {
    const list = getTrialOrders();
    setOrders(list);
    const rList = getDarkstoreRunners();
    setRunners(rList);
  };

  useEffect(() => {
    refreshOrders();

    const handleStorage = () => refreshOrders();
    const handleNewOrder = (e: CustomEvent<TrialOrder>) => {
      refreshOrders();
      playAlertChime();
      if (e.detail) {
        setIncomingAlert({
          orderNumber: e.detail.orderNumber,
          customer: e.detail.customerName,
          product: e.detail.productName,
          shelf: e.detail.shelfLocation,
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        });
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('drobe_new_order', handleNewOrder as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('drobe_new_order', handleNewOrder as EventListener);
    };
  }, []);

  // Quick order simulation to demonstrate instant inflow & diversion
  const handleSimulateIncomingOrder = () => {
    const prods = getDarkstoreProducts();
    const targetProd = prods.find(p => p.isLive) || prods[0] || {
      id: 'prod-dr-01',
      name: 'Bomber Drop shoulder',
      sku: 'DR1',
      brandId: 'brand-chanel-01',
      brandName: 'CHANEL',
      price: '₹1200',
      warehouseLocation: { code: 'AMD-RA02-S3-B04' }
    };

    const customers = [
      { name: 'Kavya Trivedi', phone: '+91 98251 77201', address: '402, Shivalik Highstreet, Keshavbaug, Vastrapur, Ahmedabad', landmark: 'Near Mansi Circle', dist: '2.8 km' },
      { name: 'Sameer Parikh', phone: '+91 97120 33419', address: 'B-12, Orchid Elegance, South Bopal, Ahmedabad', landmark: 'Opp. Bopal Lake', dist: '4.6 km' },
      { name: 'Meera Chokshi', phone: '+91 98790 99420', address: 'Penthouse 9, Dev Aurum, Prahlad Nagar, Ahmedabad', landmark: 'Near Anandnagar Road', dist: '1.9 km' },
      { name: 'Yashwardhan Shah', phone: '+91 99040 11244', address: 'Flat 801, Godrej Garden City, Jagatpur, Ahmedabad', landmark: 'Near Nirma University', dist: '3.4 km' }
    ];

    const pick = customers[Math.floor(Math.random() * customers.length)];
    const shelfCode = targetProd.warehouseLocation?.code || 'AMD-RA02-S3-B04';

    const newOrd = createCustomerOrder({
      productId: targetProd.id,
      productName: targetProd.name,
      productSku: targetProd.sku || 'DR1',
      brandId: targetProd.brandId,
      brandName: targetProd.brandName,
      price: targetProd.price,
      size: 'M',
      customerName: pick.name,
      customerPhone: pick.phone,
      customerAddress: pick.address,
      landmark: pick.landmark,
      shelfLocation: shelfCode
    });

    refreshOrders();
    playAlertChime();
    setIncomingAlert({
      orderNumber: newOrd.orderNumber,
      customer: newOrd.customerName,
      product: newOrd.productName,
      shelf: shelfCode,
      time: 'Just Now'
    });
  };

  // Actions
  const handlePickerPack = (orderId: string) => {
    pickerPackOrder(orderId);
    refreshOrders();
  };

  const handleSelectRunner = (orderId: string, runnerId: string) => {
    setSelectedRunners(prev => ({ ...prev, [orderId]: runnerId }));
  };

  const handleAssignRunner = (orderId: string) => {
    const runnerId = selectedRunners[orderId] || runners[0]?.id || 'run-01';
    assignRunnerToOrder(orderId, runnerId);
    refreshOrders();
  };

  const handleHandoverToRunner = (orderId: string) => {
    handoverOrderToRunner(orderId);
    refreshOrders();
  };

  const handleReachedDoorstep = (orderId: string) => {
    updateTrialOrderStatus(orderId, 'Doorstep Fitting (Runner Waiting Outside)');
    refreshOrders();
  };

  const handleCustomerPurchased = (orderId: string) => {
    updateTrialOrderStatus(orderId, 'Kept on Spot (Purchased)');
    refreshOrders();
  };

  const handleCustomerReturned = (orderId: string) => {
    updateTrialOrderStatus(orderId, 'Returned on Spot (Runner Heading to Hub)', 'Size / fit did not suit at doorstep');
    refreshOrders();
  };

  const handleRestockToShelf = (orderId: string) => {
    updateTrialOrderStatus(orderId, 'Restocked to Warehouse Shelf');
    refreshOrders();
  };

  // Counts
  const countAwaitingPicker = orders.filter(o => o.status === 'Order Received (Awaiting Picker)').length;
  const countPackedReady = orders.filter(o => o.status === 'Picked & Packed in Trial Bag' || o.status === 'Runner Assigned (Ready for Handover)').length;
  const countInTransit = orders.filter(o => o.status === 'Out for 30-Min Delivery').length;
  const countDoorstep = orders.filter(o => o.status === 'Doorstep Fitting (Runner Waiting Outside)').length;
  const countKept = orders.filter(o => o.status === 'Kept on Spot (Purchased)').length;
  const countReturned = orders.filter(o => o.status === 'Returned on Spot (Runner Heading to Hub)' || o.status === 'Restocked to Warehouse Shelf').length;

  // Filter
  const filteredOrders = orders.filter(ord => {
    if (activeFilter === 'awaiting_picker') return ord.status === 'Order Received (Awaiting Picker)';
    if (activeFilter === 'packed_ready') return ord.status === 'Picked & Packed in Trial Bag' || ord.status === 'Runner Assigned (Ready for Handover)';
    if (activeFilter === 'transit') return ord.status === 'Out for 30-Min Delivery';
    if (activeFilter === 'doorstep') return ord.status === 'Doorstep Fitting (Runner Waiting Outside)';
    if (activeFilter === 'completed') return ord.status === 'Kept on Spot (Purchased)' || ord.status === 'Returned on Spot (Runner Heading to Hub)' || ord.status === 'Restocked to Warehouse Shelf';
    return true;
  }).filter(ord => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      ord.orderNumber.toLowerCase().includes(q) ||
      ord.customerName.toLowerCase().includes(q) ||
      ord.customerPhone?.toLowerCase().includes(q) ||
      ord.productName.toLowerCase().includes(q) ||
      ord.productSku?.toLowerCase().includes(q) ||
      ord.shelfLocation.toLowerCase().includes(q)
    );
  });

  const getOrdersByCol = (statusFilter: (status: string) => boolean) => {
    return filteredOrders.filter(o => statusFilter(o.status));
  };

  return (
    <div className={styles.portalContainer}>
      {/* Top Header */}
      <header className={styles.portalHeader}>
        <div className={styles.brandHubBrand}>
          <div className={styles.logoBadge}>DROBE</div>
          <div className={styles.hubTitleGroup}>
            <h1>
              Hub Order Fulfillment Portal
              <span className={styles.liveTag}>
                <span className={styles.pulseDot}></span>
                Live Diverter Online
              </span>
            </h1>
            <div className={styles.hubAddressSub}>
              <span>📍 {AHMEDABAD_WAREHOUSE.name} · {AHMEDABAD_WAREHOUSE.address}</span>
              <span>•</span>
              <span style={{ color: '#38bdf8' }}>30-Min Instant Doorstep Zone</span>
            </div>
          </div>
        </div>

        <div className={styles.hubHeaderActions}>
          <button 
            className={styles.soundToggleBtn}
            onClick={toggleSound}
            title={soundEnabled ? "Mute notification chime" : "Enable notification chime"}
          >
            <span>{soundEnabled ? "🔔" : "🔕"}</span>
            <span>{soundEnabled ? "Sound ON" : "Muted"}</span>
          </button>

          <button 
            className={styles.exportBtn}
            onClick={handleExportCsv}
            title="Download full shift report in CSV format"
          >
            <span>📥</span>
            <span>Export Shift (CSV)</span>
          </button>

          <button 
            className={styles.simulateBtn}
            onClick={handleSimulateIncomingOrder}
            title="Simulate customer placing 30-min trial order"
          >
            <span>⚡</span>
            <span>Simulate Live Incoming Order</span>
          </button>

          <Link href="/delivery-partner" className={`${styles.navLinkBtn} ${styles.navLinkHighlight}`}>
            <span>🚴</span>
            <span>Delivery Partner App</span>
          </Link>

          <Link href="/admin-dashboard" className={styles.navLinkBtn}>
            <span>🏢</span>
            <span>Admin Inwarding</span>
          </Link>

          <Link href="/" className={styles.navLinkBtn}>
            <span>🛍️</span>
            <span>Storefront</span>
          </Link>
        </div>
      </header>

      {/* Diverter Active Alert Banner */}
      {incomingAlert && (
        <div className={styles.divertBanner}>
          <div className={styles.divertBannerContent}>
            <span style={{ fontSize: '18px' }}>🚨</span>
            <div>
              <strong>NEW ORDER DIVERTED TO FULFILLMENT:</strong> Order <strong>{incomingAlert.orderNumber}</strong> for {incomingAlert.customer} ({incomingAlert.product}). 
              Pick item from shelf: <span style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace', fontWeight: 800 }}>{incomingAlert.shelf}</span>
            </div>
          </div>
          <button 
            className={styles.dismissBannerBtn} 
            onClick={() => setIncomingAlert(null)}
            title="Dismiss Alert"
          >
            ✕
          </button>
        </div>
      )}

      {/* Metrics Bar */}
      <section className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricIconWrap} style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
            📥
          </div>
          <div className={styles.metricContent}>
            <span className={styles.metricLabel}>Awaiting Picker</span>
            <span className={styles.metricVal} style={{ color: countAwaitingPicker > 0 ? '#ef4444' : '#0f172a' }}>
              {countAwaitingPicker}
            </span>
            <span className={styles.metricSub}>Pick from shelf</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIconWrap} style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
            📦
          </div>
          <div className={styles.metricContent}>
            <span className={styles.metricLabel}>Ready for Handover</span>
            <span className={styles.metricVal}>{countPackedReady}</span>
            <span className={styles.metricSub}>Assign runner & dispatch</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIconWrap} style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
            🛵
          </div>
          <div className={styles.metricContent}>
            <span className={styles.metricLabel}>Out on 30-Min Run</span>
            <span className={styles.metricVal}>{countInTransit}</span>
            <span className={styles.metricSub}>Active SLA timers</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIconWrap} style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa' }}>
            ⏱️
          </div>
          <div className={styles.metricContent}>
            <span className={styles.metricLabel}>Doorstep Fitting</span>
            <span className={styles.metricVal}>{countDoorstep}</span>
            <span className={styles.metricSub}>Runner waiting outside</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIconWrap} style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
            🎉
          </div>
          <div className={styles.metricContent}>
            <span className={styles.metricLabel}>Kept / Purchased</span>
            <span className={styles.metricVal}>{countKept}</span>
            <span className={styles.metricSub}>Conversion finalized</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIconWrap} style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185' }}>
            ↩️
          </div>
          <div className={styles.metricContent}>
            <span className={styles.metricLabel}>Instant Returns</span>
            <span className={styles.metricVal}>{countReturned}</span>
            <span className={styles.metricSub}>Returned to hub & restocked</span>
          </div>
        </div>
      </section>

      {/* Filter and Search Toolbar */}
      <section className={styles.toolbarRow}>
        <div className={styles.filterTabs}>
          <button 
            className={`${styles.tabBtn} ${activeFilter === 'all' ? styles.activeTabBtn : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            All Orders <span className={styles.tabBadge}>{orders.length}</span>
          </button>
          <button 
            className={`${styles.tabBtn} ${activeFilter === 'awaiting_picker' ? styles.activeTabBtn : ''}`}
            onClick={() => setActiveFilter('awaiting_picker')}
          >
            Awaiting Picker <span className={styles.tabBadge}>{countAwaitingPicker}</span>
          </button>
          <button 
            className={`${styles.tabBtn} ${activeFilter === 'packed_ready' ? styles.activeTabBtn : ''}`}
            onClick={() => setActiveFilter('packed_ready')}
          >
            Ready for Handover <span className={styles.tabBadge}>{countPackedReady}</span>
          </button>
          <button 
            className={`${styles.tabBtn} ${activeFilter === 'transit' ? styles.activeTabBtn : ''}`}
            onClick={() => setActiveFilter('transit')}
          >
            Out for Delivery <span className={styles.tabBadge}>{countInTransit}</span>
          </button>
          <button 
            className={`${styles.tabBtn} ${activeFilter === 'doorstep' ? styles.activeTabBtn : ''}`}
            onClick={() => setActiveFilter('doorstep')}
          >
            Doorstep Fitting <span className={styles.tabBadge}>{countDoorstep}</span>
          </button>
          <button 
            className={`${styles.tabBtn} ${activeFilter === 'completed' ? styles.activeTabBtn : ''}`}
            onClick={() => setActiveFilter('completed')}
          >
            Completed & Restocked <span className={styles.tabBadge}>{countKept + countReturned}</span>
          </button>
        </div>

        <div className={styles.searchBox}>
          <span>🔍</span>
          <input 
            type="text" 
            placeholder="Search order #, customer, phone, SKU, shelf..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              ✕
            </button>
          )}
        </div>
      </section>

      {/* Kanban Board */}
      <main className={styles.boardContainer}>
        {/* Column 1: Order Received & Awaiting Picker */}
        <div className={styles.columnCard}>
          <div className={styles.columnHeader}>
            <div className={styles.columnTitleGroup}>
              <span className={styles.columnIndicator} style={{ background: '#ef4444', boxShadow: '0 0 8px #ef4444' }}></span>
              <h3 className={styles.colTitle}>1. Inflow: Awaiting Picker</h3>
            </div>
            <span className={styles.colCount}>{getOrdersByCol(s => s === 'Order Received (Awaiting Picker)').length}</span>
          </div>

          <div className={styles.columnList}>
            {getOrdersByCol(s => s === 'Order Received (Awaiting Picker)').length === 0 ? (
              <div className={styles.emptyState}>
                <span>✨</span>
                <span>No pending orders to pick from shelf</span>
              </div>
            ) : (
              getOrdersByCol(s => s === 'Order Received (Awaiting Picker)').map(order => (
                <div key={order.id} className={`${styles.orderItem} ${styles.orderItemNew}`}>
                  <div className={styles.orderCardTop}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className={styles.orderNumTag}>{order.orderNumber}</span>
                      <span className={styles.otpBadge} title="Customer Doorstep OTP">
                        OTP: {getOrderDeliveryOtp(order)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button 
                        className={styles.slipBtn}
                        onClick={() => setPickingSlipOrder(order)}
                        title="Print Picking Slip with Shelf Bin & Barcode"
                      >
                        <span>🖨️</span>
                        <span>Slip</span>
                      </button>
                      <span className={styles.orderTimeTag}>
                        <span>⏱️</span> {order.receivedAt || 'Just Now'}
                      </span>
                    </div>
                  </div>

                  {/* High Priority Shelf Box */}
                  <div className={styles.shelfHighlightBox}>
                    <div className={styles.shelfLabelText}>PICK FROM WAREHOUSE SHELF:</div>
                    <div className={styles.shelfCodeBadge}>📍 {order.shelfLocation}</div>
                  </div>

                  {/* Product Details */}
                  <div className={styles.productSnippet}>
                    <span className={styles.skuChip}>{order.productSku}</span>
                    <div className={styles.prodMeta}>
                      <div className={styles.prodTitle}>{order.productName}</div>
                      <div className={styles.prodSub}>
                        <span>{order.brandName}</span>
                        <span>•</span>
                        <span>Size: <strong>{order.size}</strong></span>
                        <span>•</span>
                        <span className={styles.prodPrice}>{order.price}</span>
                      </div>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className={styles.customerDropInfo}>
                    <div className={styles.customerNameLine}>
                      <span>👤 {order.customerName}</span>
                      <a href={`tel:${order.customerPhone}`} className={styles.customerPhoneLink}>
                        📞 {order.customerPhone}
                      </a>
                    </div>
                    <div className={styles.customerAddressLine}>
                      📍 {order.customerAddress}
                    </div>
                    {order.landmark && (
                      <div style={{ color: '#94a3b8', fontSize: '10px' }}>
                        🚩 Near: {order.landmark} • <span className={styles.distancePill}>{order.distanceKm} from hub</span>
                      </div>
                    )}
                  </div>

                  {/* Action */}
                  <button 
                    className={styles.actionBtnPrimary}
                    onClick={() => handlePickerPack(order.id)}
                  >
                    <span>✓</span>
                    <span>Pick from Shelf & Pack in Trial Bag</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 2: Picked & Packed -> Ready for Runner Assignment & Handover */}
        <div className={styles.columnCard}>
          <div className={styles.columnHeader}>
            <div className={styles.columnTitleGroup}>
              <span className={styles.columnIndicator} style={{ background: '#f59e0b', boxShadow: '0 0 8px #f59e0b' }}></span>
              <h3 className={styles.colTitle}>2. Packed: Executive Handover</h3>
            </div>
            <span className={styles.colCount}>{getOrdersByCol(s => s === 'Picked & Packed in Trial Bag' || s === 'Runner Assigned (Ready for Handover)').length}</span>
          </div>

          <div className={styles.columnList}>
            {getOrdersByCol(s => s === 'Picked & Packed in Trial Bag' || s === 'Runner Assigned (Ready for Handover)').length === 0 ? (
              <div className={styles.emptyState}>
                <span>🛵</span>
                <span>No bags waiting for handover</span>
              </div>
            ) : (
              getOrdersByCol(s => s === 'Picked & Packed in Trial Bag' || s === 'Runner Assigned (Ready for Handover)').map(order => (
                <div key={order.id} className={`${styles.orderItem} ${styles.orderItemPicked}`}>
                  <div className={styles.orderCardTop}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className={styles.orderNumTag}>{order.orderNumber}</span>
                      <span className={styles.otpBadge} title="Customer Doorstep OTP">
                        OTP: {getOrderDeliveryOtp(order)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button 
                        className={styles.slipBtn}
                        onClick={() => setPickingSlipOrder(order)}
                        title="Print Picking Slip with Shelf Bin & Barcode"
                      >
                        <span>🖨️</span>
                        <span>Slip</span>
                      </button>
                      <span style={{ fontSize: '10px', color: '#10b981', fontWeight: 700 }}>
                        ✓ PACKED
                      </span>
                    </div>
                  </div>

                  <div className={styles.productSnippet}>
                    <span className={styles.skuChip}>{order.productSku}</span>
                    <div className={styles.prodMeta}>
                      <div className={styles.prodTitle}>{order.productName}</div>
                      <div className={styles.prodSub}>
                        <span>{order.brandName} ({order.size})</span>
                        <span>•</span>
                        <span className={styles.prodPrice}>{order.price}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.customerDropInfo}>
                    <div className={styles.customerNameLine}>
                      <span>👤 {order.customerName}</span>
                      <span className={styles.distancePill}>📍 {order.distanceKm}</span>
                    </div>
                    <div className={styles.customerAddressLine}>{order.customerAddress}</div>
                  </div>

                  {/* Runner Assignment Flow */}
                  <div className={styles.runnerAssignBox}>
                    <div className={styles.assignTitle}>
                      {order.status === 'Runner Assigned (Ready for Handover)' ? 'ASSIGNED DELIVERY PARTNER:' : 'SELECT DELIVERY PARTNER FOR HANDOVER:'}
                    </div>

                    <select 
                      className={styles.runnerSelect}
                      value={selectedRunners[order.id] || (order.riderName ? runners.find(r => r.name === order.riderName)?.id : runners[0]?.id)}
                      onChange={e => handleSelectRunner(order.id, e.target.value)}
                    >
                      {runners.map(r => (
                        <option key={r.id} value={r.id}>
                          {r.name} · {r.vehicle} ({r.batteryOrFuel} • ⭐ {r.rating})
                        </option>
                      ))}
                    </select>

                    <div className={styles.actionBtnRow}>
                      {order.status === 'Picked & Packed in Trial Bag' ? (
                        <button 
                          className={styles.actionBtnWarning}
                          onClick={() => handleAssignRunner(order.id)}
                        >
                          <span>🤝</span>
                          <span>Assign Partner</span>
                        </button>
                      ) : (
                        <button 
                          className={styles.actionBtnSuccess}
                          onClick={() => handleHandoverToRunner(order.id)}
                        >
                          <span>🚀</span>
                          <span>Mark Handed Over & Start 30-Min Run</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 3: Out for 30-Min Delivery */}
        <div className={styles.columnCard}>
          <div className={styles.columnHeader}>
            <div className={styles.columnTitleGroup}>
              <span className={styles.columnIndicator} style={{ background: '#3b82f6', boxShadow: '0 0 8px #3b82f6' }}></span>
              <h3 className={styles.colTitle}>3. Out for 30-Min Delivery</h3>
            </div>
            <span className={styles.colCount}>{getOrdersByCol(s => s === 'Out for 30-Min Delivery').length}</span>
          </div>

          <div className={styles.columnList}>
            {getOrdersByCol(s => s === 'Out for 30-Min Delivery').length === 0 ? (
              <div className={styles.emptyState}>
                <span>⚡</span>
                <span>No runners currently on road</span>
              </div>
            ) : (
              getOrdersByCol(s => s === 'Out for 30-Min Delivery').map(order => (
                <div key={order.id} className={`${styles.orderItem} ${styles.orderItemTransit}`}>
                  <div className={styles.orderCardTop}>
                    <span className={styles.orderNumTag}>{order.orderNumber}</span>
                    <span className={styles.timerRow}>
                      <span>⚡ 30-Min SLA Active</span>
                    </span>
                  </div>

                  <div className={styles.assignedRunnerInfo}>
                    <div>
                      <div className={styles.runnerNameText}>
                        <span>🛵</span> {order.riderName || 'Express Runner'}
                      </div>
                      <div className={styles.runnerVehicleText}>{order.riderVehicle || 'Electric EV'}</div>
                    </div>
                    {order.riderPhone && (
                      <a href={`tel:${order.riderPhone}`} className={styles.customerPhoneLink}>
                        📞 Call Rider
                      </a>
                    )}
                  </div>

                  <div className={styles.productSnippet}>
                    <span className={styles.skuChip}>{order.productSku}</span>
                    <div className={styles.prodMeta}>
                      <div className={styles.prodTitle}>{order.productName}</div>
                      <div className={styles.prodSub}>
                        <span>{order.customerName}</span>
                        <span>•</span>
                        <span className={styles.distancePill}>{order.distanceKm}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.customerDropInfo}>
                    <div className={styles.customerAddressLine}>📍 {order.customerAddress}</div>
                  </div>

                  <button 
                    className={styles.actionBtnPrimary}
                    onClick={() => handleReachedDoorstep(order.id)}
                  >
                    <span>📍</span>
                    <span>Mark Reached Doorstep (Start 15-Min Fitting)</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 4: Doorstep Fitting & Instant Return / Keep */}
        <div className={styles.columnCard}>
          <div className={styles.columnHeader}>
            <div className={styles.columnTitleGroup}>
              <span className={styles.columnIndicator} style={{ background: '#8b5cf6', boxShadow: '0 0 8px #8b5cf6' }}></span>
              <h3 className={styles.colTitle}>4. Doorstep Fitting & Outcome</h3>
            </div>
            <span className={styles.colCount}>{getOrdersByCol(s => s === 'Doorstep Fitting (Runner Waiting Outside)' || s === 'Returned on Spot (Runner Heading to Hub)').length}</span>
          </div>

          <div className={styles.columnList}>
            {getOrdersByCol(s => s === 'Doorstep Fitting (Runner Waiting Outside)' || s === 'Returned on Spot (Runner Heading to Hub)').length === 0 ? (
              <div className={styles.emptyState}>
                <span>🚪</span>
                <span>No active doorstep trials in progress</span>
              </div>
            ) : (
              getOrdersByCol(s => s === 'Doorstep Fitting (Runner Waiting Outside)' || s === 'Returned on Spot (Runner Heading to Hub)').map(order => (
                <div key={order.id} className={`${styles.orderItem} ${order.status.includes('Returned') ? styles.orderItemPicked : styles.orderItemDoorstep}`}>
                  <div className={styles.orderCardTop}>
                    <span className={styles.orderNumTag}>{order.orderNumber}</span>
                    <span className={styles.timerRow}>
                      {order.status === 'Doorstep Fitting (Runner Waiting Outside)' ? (
                        <span>⏱️ 15-Min Fitting Underway</span>
                      ) : (
                        <span style={{ color: '#f87171' }}>↩️ Returning to Hub</span>
                      )}
                    </span>
                  </div>

                  <div className={styles.assignedRunnerInfo}>
                    <div>
                      <div className={styles.runnerNameText}>
                        <span>🛵</span> {order.riderName || 'Meet Dave'}
                      </div>
                      <div className={styles.runnerVehicleText}>Waiting outside customer apartment</div>
                    </div>
                    <span className={styles.distancePill}>📍 {order.distanceKm}</span>
                  </div>

                  <div className={styles.productSnippet}>
                    <span className={styles.skuChip}>{order.productSku}</span>
                    <div className={styles.prodMeta}>
                      <div className={styles.prodTitle}>{order.productName}</div>
                      <div className={styles.prodSub}>
                        <span>{order.customerName}</span>
                        <span>•</span>
                        <span className={styles.prodPrice}>{order.price}</span>
                      </div>
                    </div>
                  </div>

                  {order.status === 'Doorstep Fitting (Runner Waiting Outside)' ? (
                    <div className={styles.actionBtnRow}>
                      <button 
                        className={styles.actionBtnSuccess}
                        onClick={() => handleCustomerPurchased(order.id)}
                      >
                        <span>🎉</span>
                        <span>Kept & Paid</span>
                      </button>
                      <button 
                        className={styles.actionBtnDanger}
                        onClick={() => handleCustomerReturned(order.id)}
                      >
                        <span>↩️</span>
                        <span>Returned on Spot</span>
                      </button>
                    </div>
                  ) : (
                    <button 
                      className={styles.actionBtnWarning}
                      onClick={() => handleRestockToShelf(order.id)}
                    >
                      <span>📦</span>
                      <span>Restock to Shelf ({order.shelfLocation})</span>
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Printable Warehouse Picking Slip & Dispatch Label Modal */}
      {pickingSlipOrder && (
        <div className={styles.modalBackdrop} onClick={() => setPickingSlipOrder(null)}>
          <div className={styles.pickingSlipCard} onClick={e => e.stopPropagation()}>
            <div className={styles.pickingSlipHeader}>
              <div>
                <strong style={{ fontSize: '14px', letterSpacing: '0.5px' }}>DROBE QUICK COMMERCE HUB #01</strong>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>30-Minute Dispatch Picking Slip</div>
              </div>
              <button 
                onClick={() => setPickingSlipOrder(null)}
                style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', fontSize: '18px' }}
              >
                ✕
              </button>
            </div>

            <div className={styles.pickingSlipBody}>
              {/* Barcode Graphic */}
              <div className={styles.slipBarcodeRow}>
                <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '2px', color: '#64748b' }}>
                  {pickingSlipOrder.orderNumber}
                </div>
                <div className={styles.barcodeLines}>
                  {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 3, 1, 2, 4, 1, 3, 2, 1, 3, 2, 4, 1, 2, 3].map((w, idx) => (
                    <div 
                      key={idx} 
                      className={styles.barcodeBar} 
                      style={{ width: `${w * 2}px` }} 
                    />
                  ))}
                </div>
                <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                  HUB DISPATCH BAY · SHIVAM BUNGALOWS 1, KOTESHWAR ROAD
                </div>
              </div>

              {/* Huge Target Shelf Code */}
              <div className={styles.slipShelfBox}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#b45309', textTransform: 'uppercase' }}>
                  TARGET WAREHOUSE SHELF BIN
                </div>
                <div className={styles.slipShelfBig}>
                  📍 {pickingSlipOrder.shelfLocation}
                </div>
              </div>

              {/* Garment Details Grid */}
              <div className={styles.slipDetailsGrid}>
                <div className={styles.slipDetailRow}>
                  <span style={{ color: '#64748b' }}>Garment:</span>
                  <strong>{pickingSlipOrder.productName}</strong>
                </div>
                <div className={styles.slipDetailRow}>
                  <span style={{ color: '#64748b' }}>SKU & Brand:</span>
                  <span><strong>{pickingSlipOrder.productSku}</strong> · {pickingSlipOrder.brandName}</span>
                </div>
                <div className={styles.slipDetailRow}>
                  <span style={{ color: '#64748b' }}>Size / Price:</span>
                  <span>Size: <strong>{pickingSlipOrder.size}</strong> · {pickingSlipOrder.price}</span>
                </div>
                <div className={styles.slipDetailRow}>
                  <span style={{ color: '#64748b' }}>Customer:</span>
                  <strong>{pickingSlipOrder.customerName}</strong>
                </div>
                <div className={styles.slipDetailRow}>
                  <span style={{ color: '#64748b' }}>Address:</span>
                  <span style={{ textAlign: 'right', maxWidth: '65%' }}>{pickingSlipOrder.customerAddress}</span>
                </div>
                <div className={styles.slipDetailRow}>
                  <span style={{ color: '#64748b' }}>Doorstep OTP:</span>
                  <span className={styles.otpBadge} style={{ fontSize: '13px' }}>
                    {getOrderDeliveryOtp(pickingSlipOrder)}
                  </span>
                </div>
              </div>

              {/* Quality & Packing Checklist */}
              <div className={styles.slipChecklist}>
                <div style={{ fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', color: '#0f172a' }}>
                  Picker 4-Point Verification Checklist:
                </div>
                <div>☑ Size tag on collar matches order ({pickingSlipOrder.size})</div>
                <div>☑ Attached to signature Drobe Wooden Hanger</div>
                <div>☑ Security RFID tag verified on hem</div>
                <div>☑ Packed inside clean Drobe Signature Matte Bag</div>
              </div>
            </div>

            <div className={styles.pickingSlipActions}>
              <button 
                className={styles.actionBtnGhost}
                onClick={() => setPickingSlipOrder(null)}
              >
                Close
              </button>
              <button 
                className={styles.actionBtnPrimary}
                onClick={() => window.print()}
                style={{ padding: '8px 16px' }}
              >
                <span>🖨️</span>
                <span>Print Picking Slip (Thermal / A4)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Telemetry */}
      <footer className={styles.portalFooter}>
        <div className={styles.fleetOnlinePill}>
          <span className={styles.pulseDot}></span>
          <span>Ahmedabad Express Fleet: {runners.length} active runners stationed at Shivam Bungalows 1, Koteshwar Road</span>
        </div>
        <div>
          <span>Drobe Darkstore OS v2.4 · Instant 30-Min Fulfillment & Live Try-on System</span>
        </div>
      </footer>
    </div>
  );
}
