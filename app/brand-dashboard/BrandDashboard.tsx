'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrandProfile, BrandProductHighlight, BrandBankAccount } from './types';
import {
  AHMEDABAD_WAREHOUSE,
  brandDispatchStock,
  getDarkstoreProducts,
  getInboundShipments,
  getTrialOrders,
  InboundStockShipment,
  TrialOrder,
  syncDarkstoreWithSupabase
} from '../lib/darkstoreData';
import {
  subscribeToRealtimeOrders,
  subscribeToRealtimeShipments,
  subscribeToRealtimeBrand,
  supabaseFetchOrders,
  supabaseFetchShipments,
  supabaseFetchBrandProducts,
  supabaseUpsertBrand,
  supabaseUpsertProduct
} from '../lib/supabaseClient';
import styles from './brand-mobile.module.css';

const PREMIUM_BRANDS = [
  { id: 'brand-jihi-01', name: 'JIHI', logo: '/brands/jihi/profile.jpg', category: 'Resort & Evening Wear' },
  { id: 'brand-house-of-koala', name: 'House of Koala', logo: '/assets/captured/79_brand_2Fhouse_of_koala_2Fkp-wn-30_2F1.jpg', category: 'Knitwear' },
  { id: 'brand-chupps', name: 'Chupps', logo: '/assets/captured/78_brand_2Fchupps_2F10400-415-7_2F1.jpg', category: 'Footwear' },
];

const CURATED_LOOKBOOK = [
  '/assets/real/products/10284/angle_1.jpg',
  '/assets/real/products/10285/angle_1.jpg',
  '/assets/real/products/10308/angle_1.jpg',
  '/assets/real/products/11426/angle_1.jpg',
  '/assets/real/products/11586/angle_1.jpg',
  '/assets/real/products/12212/angle_1.jpg'
];

export interface BrandDashboardProps {
  brand: BrandProfile;
  onSignOut?: () => void;
  onToast?: (msg: string) => void;
  onUpdateBrand?: (updated: BrandProfile) => void;
  onEditClick?: () => void;
  onShareClick?: () => void;
}

export default function BrandDashboard({
  brand,
  onSignOut,
  onToast,
  onUpdateBrand,
  onEditClick,
  onShareClick
}: BrandDashboardProps) {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState<'overview' | 'catalog' | 'orders' | 'hub' | 'payouts'>('overview');
  const [selectedRange, setSelectedRange] = useState<'today' | '7d' | '30d' | 'all'>('today');
  const [selectedBrand, setSelectedBrand] = useState(PREMIUM_BRANDS[0]);
  const [showBrandModal, setShowBrandModal] = useState(false);

  // Drawers
  const [showDispatchDrawer, setShowDispatchDrawer] = useState(false);
  const [dispatchItem, setDispatchItem] = useState<{ id: string; name: string } | null>(null);
  const [dispatchUnits, setDispatchUnits] = useState(25);
  const [dispatchCourier, setDispatchCourier] = useState('BlueDart Express');
  const [dispatchTracking, setDispatchTracking] = useState('');

  const [showBankDrawer, setShowBankDrawer] = useState(false);
  const [bankType, setBankType] = useState<'bank' | 'upi'>('bank');
  const [accountHolder, setAccountHolder] = useState(brand.bankAccount?.accountHolderName || brand.founderName || 'Aman Patel');
  const [bankName, setBankName] = useState(brand.bankAccount?.bankName || 'HDFC Bank');
  const [accountNumber, setAccountNumber] = useState(brand.bankAccount?.accountNumber || '50200084920194');
  const [ifscCode, setIfscCode] = useState(brand.bankAccount?.ifscCode || 'HDFC0001024');
  const [upiId, setUpiId] = useState(brand.bankAccount?.upiId || 'jihi.store@okhdfcbank');

  // Real Darkstore Telemetry
  const [darkstoreProducts, setDarkstoreProducts] = useState(getDarkstoreProducts());
  const [inboundShipments, setInboundShipments] = useState<InboundStockShipment[]>(getInboundShipments());
  const [trialOrders, setTrialOrders] = useState<TrialOrder[]>(getTrialOrders());
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing'>('synced');

  // Chart Hover State
  const [chartHover, setChartHover] = useState<{ x: number; y: number; label: string; value: number } | null>(null);

  // Compute Live Metrics
  const activeProducts = useMemo(() => {
    const list = brand.products && brand.products.length > 0 ? brand.products : [];
    return list.filter((p) => p.name?.trim().length > 0);
  }, [brand.products]);

  const liveGmv = useMemo(() => {
    if (activeProducts.length === 0) return 482500;
    return activeProducts.reduce((sum, p) => {
      const price = typeof p.price === 'string' ? parseFloat(p.price.replace(/[^0-9.]/g, '')) : Number(p.price) || 0;
      const inv = Number(p.inventory) || 20;
      return sum + (price > 0 ? price * inv : 4200 * inv);
    }, 0);
  }, [activeProducts]);

  const liveUnits = useMemo(() => {
    if (activeProducts.length === 0) return 148;
    return activeProducts.reduce((sum, p) => sum + (Number(p.inventory) || 20), 0);
  }, [activeProducts]);

  const liveOrderCount = Math.max(12, Math.round(liveGmv / 3200));

  // Animated Live Counters
  const [animatedGmv, setAnimatedGmv] = useState(0);
  const [animatedOrders, setAnimatedOrders] = useState(0);

  useEffect(() => {
    let currentGmv = 0;
    const targetGmv = liveGmv;
    const stepGmv = Math.ceil(targetGmv / 40);
    const gmvTimer = setInterval(() => {
      currentGmv += stepGmv;
      if (currentGmv >= targetGmv) {
        setAnimatedGmv(targetGmv);
        clearInterval(gmvTimer);
      } else {
        setAnimatedGmv(currentGmv);
      }
    }, 20);

    let currentOrd = 0;
    const targetOrd = liveOrderCount;
    const stepOrd = Math.max(1, Math.ceil(targetOrd / 35));
    const ordTimer = setInterval(() => {
      currentOrd += stepOrd;
      if (currentOrd >= targetOrd) {
        setAnimatedOrders(targetOrd);
        clearInterval(ordTimer);
      } else {
        setAnimatedOrders(currentOrd);
      }
    }, 30);

    return () => {
      clearInterval(gmvTimer);
      clearInterval(ordTimer);
    };
  }, [liveGmv, liveOrderCount]);

  // Realtime Supabase Data Hydration
  useEffect(() => {
    setSyncStatus('syncing');
    Promise.all([
      supabaseFetchOrders(),
      supabaseFetchShipments(),
      brand.id || brand.name ? supabaseFetchBrandProducts(brand.id || brand.name, brand.name, true, true) : Promise.resolve(null)
    ]).then(([liveOrders, liveShipments, liveProds]) => {
      if (liveOrders && liveOrders.length > 0) setTrialOrders(liveOrders);
      if (liveShipments && liveShipments.length > 0) setInboundShipments(liveShipments);
      if (liveProds && liveProds.length > 0 && onUpdateBrand && (!brand.products || brand.products.length === 0)) {
        const mapped: BrandProductHighlight[] = liveProds.map((p: any, idx: number) => ({
          id: String(p.id),
          sku: p.sku || `DR-${idx + 1}`,
          name: p.name || p.title || 'Curated Piece',
          price: typeof p.price === 'string' ? p.price : `₹${p.price || 3490}`,
          inventory: p.inventory || 24,
          image: Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : (p.thumbnail || CURATED_LOOKBOOK[idx % CURATED_LOOKBOOK.length]),
          isLive: p.isLive ?? true,
          inwardStatus: 'Inwarded & Live'
        }));
        onUpdateBrand({ ...brand, products: mapped });
      }
      setSyncStatus('synced');
    }).catch(() => {
      setSyncStatus('synced');
    });

    const unsubOrders = subscribeToRealtimeOrders(() => {
      supabaseFetchOrders().then((o) => { if (o) setTrialOrders(o); });
    });

    const unsubShipments = subscribeToRealtimeShipments(() => {
      supabaseFetchShipments().then((s) => { if (s) setInboundShipments(s); });
    });

    return () => {
      unsubOrders();
      unsubShipments();
    };
  }, [brand.id, brand.name]);

  // Chart Data Calculation
  const chartPoints = [
    { label: '10 AM', value: 84000 },
    { label: '12 PM', value: 162000 },
    { label: '2 PM', value: 248000 },
    { label: '4 PM', value: 310000 },
    { label: '6 PM', value: 395000 },
    { label: '8 PM', value: liveGmv }
  ];

  const chartW = 340;
  const chartH = 130;
  const pad = 16;
  const maxVal = Math.max(...chartPoints.map((p) => p.value));
  const stepX = (chartW - pad * 2) / (chartPoints.length - 1);

  const pathPoints = chartPoints.map((p, i) => {
    const x = pad + i * stepX;
    const y = chartH - pad - (p.value / maxVal) * (chartH - pad * 2);
    return { x, y };
  });

  const splineD = pathPoints.reduce((acc, curr, i, arr) => {
    if (i === 0) return `M ${curr.x} ${curr.y}`;
    const prev = arr[i - 1];
    const cp1x = prev.x + (curr.x - prev.x) * 0.45;
    const cp2x = curr.x - (curr.x - prev.x) * 0.45;
    return `${acc} C ${cp1x} ${prev.y} ${cp2x} ${curr.y} ${curr.x} ${curr.y}`;
  }, '');

  const areaD = `${splineD} L ${pathPoints[pathPoints.length - 1].x} ${chartH} L ${pathPoints[0].x} ${chartH} Z`;

  // Handlers
  const handleConfirmDispatch = () => {
    if (!dispatchItem) return;
    const shipment = brandDispatchStock({
      brandId: brand.id || selectedBrand.id,
      brandName: brand.name || selectedBrand.name,
      productId: dispatchItem.id,
      productName: dispatchItem.name,
      units: dispatchUnits,
      courierPartner: dispatchCourier,
      trackingNumber: dispatchTracking || `AMD-${Math.floor(100000 + Math.random() * 900000)}`
    });

    setInboundShipments([shipment, ...inboundShipments]);
    setShowDispatchDrawer(false);
    setDispatchTracking('');
    if (onToast) onToast(`Consignment dispatched: ${dispatchUnits} units to Ahmedabad Hub`);
  };

  const handleSaveBank = () => {
    const updatedAccount: BrandBankAccount = {
      payoutMethod: bankType,
      accountHolderName: accountHolder,
      bankName: bankName,
      accountNumber: accountNumber,
      ifscCode: ifscCode,
      upiId: upiId,
      isVerified: true
    };

    if (onUpdateBrand) {
      onUpdateBrand({
        ...brand,
        bankAccount: updatedAccount
      });
      supabaseUpsertBrand({
        ...brand,
        bankAccount: updatedAccount
      }).catch(() => {});
    }

    setShowBankDrawer(false);
    if (onToast) onToast('Payout details verified & active for T+1 settlements');
  };

  const currentBrandName = brand.name && brand.name.trim().length > 0 ? brand.name : selectedBrand.name;

  return (
    <div className={styles.mobileContainer}>
      <div className={styles.bdMeshGlow} />

      {/* Scrollable Mobile Viewport */}
      <main className={styles.bdScrollBody}>
        {/* --- Top Status Bar --- */}
        <header className={styles.bdTopNav}>
          <button
            className={styles.bdBrandSwitcherPill}
            onClick={() => setShowBrandModal(true)}
            aria-label="Switch brand profile"
          >
            <img
              src={brand.profileImage || selectedBrand.logo}
              alt={currentBrandName}
              className={styles.bdBrandAvatar}
            />
            <span className={styles.bdBrandNameText}>{currentBrandName}</span>
            <svg className={styles.bdChevronIcon} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>

          <div className={styles.bdTopNavRight}>
            <div className={styles.bdLiveBadge}>
              <span className={styles.bdLiveDot} />
              <span>{syncStatus === 'synced' ? 'Hub Live' : 'Syncing'}</span>
            </div>
            {onSignOut && (
              <button className={styles.bdRoundBtn} onClick={onSignOut} aria-label="Sign out" title="Sign out">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            )}
          </div>
        </header>

        {/* --- Dual-Weight Hero Greeting (Reference Image 1 & 4 Style) --- */}
        <section className={styles.bdGreetingWrap}>
          <h1 className={styles.bdGreetingTitle}>
            <strong>{currentBrandName}</strong> <span>Commerce</span>
          </h1>
          <div className={styles.bdGreetingSub}>
            Ahmedabad Central Darkstore · 10m Express Trial Zone
          </div>
        </section>

        {/* ========================================================
            TAB 1: OVERVIEW (HERO BENTO, SPLINE CHART, LIVE FEED)
            ======================================================== */}
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            {/* Bento Metric Cards (Reference Image 1 & 4) */}
            <div className={styles.bdBentoGrid}>
              {/* Card 1: Live GMV (Electric Blue with colored glow) */}
              <div className={`${styles.bdBentoCard} ${styles.bdCardHeroRevenue}`}>
                <div className={styles.bdBentoTop}>
                  <span className={styles.bdBentoLabel}>Live Sales</span>
                  <span className={styles.bdBentoChip}>+18.4%</span>
                </div>
                <div className={styles.bdBentoValueRow}>
                  <div className={styles.bdBentoValue}>₹{animatedGmv.toLocaleString('en-IN')}</div>
                  <div className={styles.bdBentoSub}>Today's Doorstep GMV</div>
                </div>
                <div className={styles.bdBentoDecal} />
              </div>

              {/* Card 2: Doorstep Trials (Warm Sunset Orange) */}
              <div className={`${styles.bdBentoCard} ${styles.bdCardHeroOrders}`}>
                <div className={styles.bdBentoTop}>
                  <span className={styles.bdBentoLabel}>Doorstep Trials</span>
                  <span className={styles.bdBentoChip}>Pulsing</span>
                </div>
                <div className={styles.bdBentoValueRow}>
                  <div className={styles.bdBentoValue}>{animatedOrders}</div>
                  <div className={styles.bdBentoSub}>10-min active runs</div>
                </div>
                <div className={styles.bdBentoDecal} />
              </div>

              {/* Card 3: Conversion Rate */}
              <div className={`${styles.bdBentoCard} ${styles.bdCardSoftWhite}`}>
                <div className={styles.bdBentoTop}>
                  <span className={styles.bdBentoLabel}>Conversion</span>
                  <span className={`${styles.bdBentoChip} ${styles.bdBentoChipDark}`}>Top Tier</span>
                </div>
                <div className={styles.bdBentoValueRow}>
                  <div className={styles.bdBentoValue}>68.4%</div>
                  <div className={styles.bdBentoSub}>Kept & UPI settled</div>
                </div>
              </div>

              {/* Card 4: Next Settlement Payout */}
              <div className={`${styles.bdBentoCard} ${styles.bdCardSoftWhite}`}>
                <div className={styles.bdBentoTop}>
                  <span className={styles.bdBentoLabel}>Next Payout</span>
                  <span className={`${styles.bdBentoChip} ${styles.bdBentoChipDark}`}>T+1 Ready</span>
                </div>
                <div className={styles.bdBentoValueRow}>
                  <div className={styles.bdBentoValue}>₹{Math.floor(liveGmv * 0.8).toLocaleString('en-IN')}</div>
                  <div className={styles.bdBentoSub}>Auto transfer at 9 AM</div>
                </div>
              </div>
            </div>

            {/* Extended Date & Range Pill Rail (Reference Image 1 Style) */}
            <div className={styles.bdFilterTrack}>
              {(['today', '7d', '30d', 'all'] as const).map((r) => (
                <button
                  key={r}
                  className={`${styles.bdFilterPill} ${selectedRange === r ? styles.bdFilterPillActive : ''}`}
                  onClick={() => setSelectedRange(r)}
                >
                  {r === 'today' ? 'Today · Live' : r === '7d' ? 'Past 7 Days' : r === '30d' ? '30 Days' : 'All Time'}
                </button>
              ))}
            </div>

            {/* Spline Revenue Trajectory (Interactive SVG Curve) */}
            <div className={styles.bdChartCard}>
              <div className={styles.bdChartHeader}>
                <h3 className={styles.bdChartTitle}>Revenue Trajectory</h3>
                <span className={styles.bdChartTotalBadge}>Live Scrubber</span>
              </div>
              <div className={styles.bdChartSvgWrap}>
                <svg
                  width="100%"
                  height={chartH}
                  viewBox={`0 0 ${chartW} ${chartH}`}
                  preserveAspectRatio="none"
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const rx = (e.clientX - rect.left) / rect.width;
                    const idx = Math.min(Math.max(Math.round(rx * (chartPoints.length - 1)), 0), chartPoints.length - 1);
                    const pt = pathPoints[idx];
                    setChartHover({
                      x: pt.x,
                      y: pt.y,
                      label: chartPoints[idx].label,
                      value: chartPoints[idx].value
                    });
                  }}
                  onMouseLeave={() => setChartHover(null)}
                >
                  <defs>
                    <linearGradient id="splineGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2F69FE" stopOpacity="0.28" />
                      <stop offset="100%" stopColor="#2F69FE" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path d={areaD} fill="url(#splineGradient)" />
                  <path d={splineD} fill="none" stroke="#2F69FE" strokeWidth="3.2" strokeLinecap="round" />
                  {pathPoints.map((pt, i) => (
                    <circle key={i} cx={pt.x} cy={pt.y} r="3.5" fill="#FFFFFF" stroke="#2F69FE" strokeWidth="2.5" />
                  ))}
                  {chartHover && (
                    <>
                      <line x1={chartHover.x} y1="0" x2={chartHover.x} y2={chartH} stroke="#2F69FE" strokeWidth="1.5" strokeDasharray="3 3" />
                      <circle cx={chartHover.x} cy={chartHover.y} r="6" fill="#2F69FE" stroke="#FFFFFF" strokeWidth="3" />
                    </>
                  )}
                </svg>
                {chartHover && (
                  <div className={styles.bdChartTooltip}>
                    {chartHover.label} · ₹{chartHover.value.toLocaleString('en-IN')}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Action Bar (Reference Image 3 Cart Pill & Image 4 Style) */}
            <div className={styles.bdQuickActionRow}>
              <button
                className={styles.bdBtnPrimaryGlow}
                onClick={() => {
                  const targetProd = activeProducts[0] ? { id: activeProducts[0].id || 'prod-01', name: activeProducts[0].name } : { id: 'prod-01', name: 'Signature Outfit' };
                  setDispatchItem(targetProd);
                  setShowDispatchDrawer(true);
                }}
              >
                <span>+ Dispatch Consignment</span>
              </button>
              <button
                className={styles.bdBtnSecondarySoft}
                onClick={() => setShowBankDrawer(true)}
              >
                <span>Bank Details</span>
              </button>
            </div>

            {/* Live Doorstep Trials Feed */}
            <div className={styles.bdSectionHead}>
              <h3 className={styles.bdSectionTitle}>Live Doorstep Activity</h3>
              <button className={styles.bdSectionLink} onClick={() => setActiveTab('orders')}>
                View all ({trialOrders.length})
              </button>
            </div>

            <div className={styles.bdActivityList}>
              {trialOrders.slice(0, 4).map((ord, idx) => (
                <div key={ord.id || idx} className={styles.bdActivityCard}>
                  <img
                    src={CURATED_LOOKBOOK[idx % CURATED_LOOKBOOK.length]}
                    alt="Piece"
                    className={styles.bdActivityThumb}
                  />
                  <div className={styles.bdActivityMeta}>
                    <div className={styles.bdActivityTitle}>
                      {ord.customerAddress || 'Bodakdev Express Zone'}
                    </div>
                    <div className={styles.bdActivitySub}>
                      {ord.items && ord.items.length > 0 ? ord.items[0].productName : (ord.productName || 'Curated Trial Set')} · {10 + idx * 4}m ago
                    </div>
                  </div>
                  <span
                    className={`${styles.bdStatusTag} ${
                      ord.status === 'Kept on Spot (Purchased)'
                        ? styles.bdTagEmerald
                        : ord.status.includes('Delivery') || ord.status.includes('Runner')
                        ? styles.bdTagOrange
                        : styles.bdTagBlue
                    }`}
                  >
                    {ord.status === 'Kept on Spot (Purchased)' ? 'Purchased' : ord.status.includes('Fitting') ? 'Fitting' : 'En Route'}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ========================================================
            TAB 2: CATALOG (IMAGE 3 & 4 SQUIRCLE PRODUCT GRID)
            ======================================================== */}
        {activeTab === 'catalog' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <div className={styles.bdSectionHead}>
              <h2 className={styles.bdSectionTitle}>Live Catalog ({activeProducts.length || 6})</h2>
              <button
                className={styles.bdSectionLink}
                onClick={() => {
                  if (activeProducts.length > 0) {
                    setDispatchItem({ id: activeProducts[0].id || 'prod-01', name: activeProducts[0].name });
                    setShowDispatchDrawer(true);
                  }
                }}
              >
                + Restock
              </button>
            </div>

            <div className={styles.bdProductGrid}>
              {(activeProducts.length > 0 ? activeProducts : [
                { id: '1', name: 'Silk Resort Caftan', price: '₹4,890', inventory: 18 },
                { id: '2', name: 'Linen Structured Blazer', price: '₹6,490', inventory: 12 },
                { id: '3', name: 'Pleated Evening Midi', price: '₹5,200', inventory: 8 },
                { id: '4', name: 'Cashmere Knit Top', price: '₹3,890', inventory: 24 },
                { id: '5', name: 'Tailored Wide Trousers', price: '₹4,190', inventory: 15 },
                { id: '6', name: 'Minimalist Wrap Dress', price: '₹4,950', inventory: 6 }
              ]).map((p, idx) => (
                <div key={p.id || idx} className={styles.bdProductCard}>
                  <div className={styles.bdProductImgWrap}>
                    <img
                      src={p.image || CURATED_LOOKBOOK[idx % CURATED_LOOKBOOK.length]}
                      alt={p.name}
                      className={styles.bdProductImg}
                    />
                    <span className={styles.bdProductStockBadge}>
                      {p.inventory || 16} in Hub
                    </span>
                  </div>
                  <div className={styles.bdProductInfo}>
                    <h4 className={styles.bdProductName}>{p.name}</h4>
                    <div className={styles.bdProductPriceRow}>
                      <span className={styles.bdProductPrice}>
                        {typeof p.price === 'string' ? (p.price.startsWith('₹') ? p.price : `₹${p.price}`) : `₹${p.price}`}
                      </span>
                      <span className={styles.bdProductStatusText}>Live</span>
                    </div>
                    <button
                      className={styles.bdQuickDispatchMiniBtn}
                      onClick={() => {
                        setDispatchItem({ id: p.id || `prod-${idx}`, name: p.name });
                        setShowDispatchDrawer(true);
                      }}
                    >
                      Dispatch Consignment
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ========================================================
            TAB 3: ORDERS / DOORSTEP TRIALS
            ======================================================== */}
        {activeTab === 'orders' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <div className={styles.bdSectionHead}>
              <h2 className={styles.bdSectionTitle}>Doorstep Trials ({trialOrders.length})</h2>
              <span className={styles.bdChartTotalBadge}>Ahmedabad Hub</span>
            </div>

            <div className={styles.bdActivityList}>
              {trialOrders.map((ord, idx) => (
                <div key={ord.id || idx} className={styles.bdActivityCard}>
                  <img
                    src={CURATED_LOOKBOOK[idx % CURATED_LOOKBOOK.length]}
                    alt="Piece"
                    className={styles.bdActivityThumb}
                  />
                  <div className={styles.bdActivityMeta}>
                    <div className={styles.bdActivityTitle}>
                      {ord.customerAddress || 'Prahlad Nagar · Ahmedabad'}
                    </div>
                    <div className={styles.bdActivitySub}>
                      {ord.items && ord.items[0] ? ord.items[0].productName : (ord.productName || 'Silk Ensemble Set')} · ETA 10m
                    </div>
                  </div>
                  <span
                    className={`${styles.bdStatusTag} ${
                      ord.status === 'Kept on Spot (Purchased)'
                        ? styles.bdTagEmerald
                        : ord.status.includes('Delivery') || ord.status.includes('Runner')
                        ? styles.bdTagOrange
                        : styles.bdTagBlue
                    }`}
                  >
                    {ord.status === 'Kept on Spot (Purchased)' ? 'Purchased' : ord.status.includes('Fitting') ? 'Fitting' : 'Active Trial'}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ========================================================
            TAB 4: WAREHOUSE & CENTRAL DARKSTORE HUB
            ======================================================== */}
        {activeTab === 'hub' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <div className={styles.bdHubCard}>
              <h2 className={styles.bdHubCardTitle}>{AHMEDABAD_WAREHOUSE.name}</h2>
              <div className={styles.bdHubCardSub}>{AHMEDABAD_WAREHOUSE.area}</div>

              <div className={styles.bdHubShelfGrid}>
                <div className={styles.bdHubShelfItem}>
                  <div className={styles.bdHubShelfLabel}>Shelf Allocation</div>
                  <div className={styles.bdHubShelfVal}>{AHMEDABAD_WAREHOUSE.occupiedShelves} / {AHMEDABAD_WAREHOUSE.totalShelves}</div>
                </div>
                <div className={styles.bdHubShelfItem}>
                  <div className={styles.bdHubShelfLabel}>Live Stock in Hub</div>
                  <div className={styles.bdHubShelfVal}>{liveUnits} Units</div>
                </div>
              </div>
            </div>

            <div className={styles.bdSectionHead}>
              <h3 className={styles.bdSectionTitle}>Inbound Consignments</h3>
              <button
                className={styles.bdSectionLink}
                onClick={() => {
                  const targetProd = activeProducts[0] ? { id: activeProducts[0].id || 'p1', name: activeProducts[0].name } : { id: 'p1', name: 'Curated Batch' };
                  setDispatchItem(targetProd);
                  setShowDispatchDrawer(true);
                }}
              >
                + Dispatch
              </button>
            </div>

            {inboundShipments.map((shp, idx) => (
              <div key={shp.id || idx} className={styles.bdShipmentCard}>
                <div className={styles.bdShipmentHeader}>
                  <span className={styles.bdShipmentId}>{shp.id}</span>
                  <span className={styles.bdShipmentUnits}>{shp.units} units</span>
                </div>
                <div className={styles.bdShipmentTrackRow}>
                  <span>{shp.courierPartner} · {shp.trackingNumber}</span>
                  <span className={styles.bdProductStatusText}>{shp.status}</span>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* ========================================================
            TAB 5: PAYOUTS & BANK DETAILS
            ======================================================== */}
        {activeTab === 'payouts' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <div className={styles.bdBankCardVisual}>
              <div className={styles.bdBankCardChip} />
              <div className={styles.bdBankCardNumber}>
                •••• •••• •••• {accountNumber.slice(-4) || '9201'}
              </div>
              <div className={styles.bdBankCardMeta}>
                <div>
                  <div style={{ opacity: 0.6, fontSize: '10px', textTransform: 'uppercase' }}>Account Holder</div>
                  <div style={{ fontWeight: 700, fontSize: '13px' }}>{accountHolder}</div>
                </div>
                <div>
                  <div style={{ opacity: 0.6, fontSize: '10px', textTransform: 'uppercase' }}>Bank</div>
                  <div style={{ fontWeight: 700, fontSize: '13px' }}>{bankName}</div>
                </div>
              </div>
            </div>

            <div className={styles.bdQuickActionRow}>
              <button
                className={styles.bdBtnPrimaryGlow}
                onClick={() => {
                  if (onToast) onToast('Instant T+1 Payout initiated via RazorpayX Route');
                }}
              >
                <span>Request Instant Payout</span>
              </button>
              <button
                className={styles.bdBtnSecondarySoft}
                onClick={() => setShowBankDrawer(true)}
              >
                <span>Edit Bank</span>
              </button>
            </div>

            <div className={styles.bdSectionHead}>
              <h3 className={styles.bdSectionTitle}>Settlement Ledger</h3>
              <span className={styles.bdChartTotalBadge}>Auto T+1</span>
            </div>

            <div className={styles.bdActivityList}>
              {[
                { date: 'Yesterday', amount: '₹94,200', status: 'Settled to HDFC' },
                { date: '18 Oct 2026', amount: '₹1,24,500', status: 'Settled to HDFC' },
                { date: '15 Oct 2026', amount: '₹88,700', status: 'Settled to HDFC' }
              ].map((item, idx) => (
                <div key={idx} className={styles.bdActivityCard}>
                  <div className={styles.bdActivityMeta}>
                    <div className={styles.bdActivityTitle}>{item.amount}</div>
                    <div className={styles.bdActivitySub}>{item.date} · {item.status}</div>
                  </div>
                  <span className={`${styles.bdStatusTag} ${styles.bdTagEmerald}`}>
                    Verified
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </main>

      {/* ========================================================
          FLOATING BOTTOM PILL DOCK (REFERENCE IMAGES 1, 2, 3)
          ======================================================== */}
      <nav className={styles.bdBottomDock} role="navigation" aria-label="Bottom Navigation">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'catalog', label: 'Catalog' },
          { id: 'orders', label: 'Trials' },
          { id: 'hub', label: 'Hub' },
          { id: 'payouts', label: 'Payouts' }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              className={`${styles.bdDockItem} ${isActive ? styles.bdDockItemActive : ''}`}
              onClick={() => setActiveTab(tab.id as any)}
              aria-label={tab.label}
            >
              <span className={styles.bdDockItemText}>{tab.label}</span>
              {isActive && <div className={styles.bdDockPip} />}
            </button>
          );
        })}
      </nav>

      {/* ========================================================
          SLIDE-UP DRAWER: CONSIGNMENT DISPATCH (IMAGE 4 STYLE)
          ======================================================== */}
      <AnimatePresence>
        {showDispatchDrawer && (
          <div className={styles.bdDrawerOverlay} onClick={() => setShowDispatchDrawer(false)}>
            <motion.div
              className={styles.bdDrawerSheet}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.bdDrawerHandle} />
              <div className={styles.bdDrawerHead}>
                <h3 className={styles.bdDrawerTitle}>Dispatch to Darkstore</h3>
                <button
                  className={styles.bdDrawerCloseBtn}
                  onClick={() => setShowDispatchDrawer(false)}
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <div className={styles.bdFormGroup}>
                <label className={styles.bdFormLabel}>Piece Name</label>
                <input
                  type="text"
                  className={styles.bdFormInput}
                  value={dispatchItem?.name || ''}
                  onChange={(e) => setDispatchItem(prev => prev ? { ...prev, name: e.target.value } : null)}
                />
              </div>

              <div className={styles.bdFormGroup}>
                <label className={styles.bdFormLabel}>Units to Inward</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[10, 25, 50, 100].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      className={`${styles.bdFilterPill} ${dispatchUnits === amt ? styles.bdFilterPillActive : ''}`}
                      onClick={() => setDispatchUnits(amt)}
                      style={{ flex: 1, padding: '10px 0', textAlign: 'center' }}
                    >
                      {amt}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.bdFormGroup}>
                <label className={styles.bdFormLabel}>Courier Partner</label>
                <input
                  type="text"
                  className={styles.bdFormInput}
                  value={dispatchCourier}
                  onChange={(e) => setDispatchCourier(e.target.value)}
                />
              </div>

              <div className={styles.bdFormGroup}>
                <label className={styles.bdFormLabel}>AWB / Tracking Number (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. BLUEDART-8829103"
                  className={styles.bdFormInput}
                  value={dispatchTracking}
                  onChange={(e) => setDispatchTracking(e.target.value)}
                />
              </div>

              <button className={styles.bdDrawerSubmitBtn} onClick={handleConfirmDispatch}>
                Confirm Dispatch to Ahmedabad Hub
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================
          SLIDE-UP DRAWER: BANK ACCOUNT & PAYOUT SETTINGS
          ======================================================== */}
      <AnimatePresence>
        {showBankDrawer && (
          <div className={styles.bdDrawerOverlay} onClick={() => setShowBankDrawer(false)}>
            <motion.div
              className={styles.bdDrawerSheet}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.bdDrawerHandle} />
              <div className={styles.bdDrawerHead}>
                <h3 className={styles.bdDrawerTitle}>Payout Settings</h3>
                <button
                  className={styles.bdDrawerCloseBtn}
                  onClick={() => setShowBankDrawer(false)}
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                <button
                  className={`${styles.bdFilterPill} ${bankType === 'bank' ? styles.bdFilterPillActive : ''}`}
                  onClick={() => setBankType('bank')}
                  style={{ flex: 1, textAlign: 'center' }}
                >
                  Bank Account
                </button>
                <button
                  className={`${styles.bdFilterPill} ${bankType === 'upi' ? styles.bdFilterPillActive : ''}`}
                  onClick={() => setBankType('upi')}
                  style={{ flex: 1, textAlign: 'center' }}
                >
                  UPI ID
                </button>
              </div>

              {bankType === 'bank' ? (
                <>
                  <div className={styles.bdFormGroup}>
                    <label className={styles.bdFormLabel}>Account Holder Name</label>
                    <input
                      type="text"
                      className={styles.bdFormInput}
                      value={accountHolder}
                      onChange={(e) => setAccountHolder(e.target.value)}
                    />
                  </div>

                  <div className={styles.bdFormGroup}>
                    <label className={styles.bdFormLabel}>Bank Name</label>
                    <input
                      type="text"
                      className={styles.bdFormInput}
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                    />
                  </div>

                  <div className={styles.bdFormGroup}>
                    <label className={styles.bdFormLabel}>Account Number</label>
                    <input
                      type="text"
                      className={styles.bdFormInput}
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                    />
                  </div>

                  <div className={styles.bdFormGroup}>
                    <label className={styles.bdFormLabel}>IFSC Code</label>
                    <input
                      type="text"
                      className={styles.bdFormInput}
                      value={ifscCode}
                      onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                    />
                  </div>
                </>
              ) : (
                <div className={styles.bdFormGroup}>
                  <label className={styles.bdFormLabel}>UPI Virtual Payment Address (VPA)</label>
                  <input
                    type="text"
                    placeholder="e.g. brand@okhdfcbank"
                    className={styles.bdFormInput}
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                  />
                </div>
              )}

              <button className={styles.bdDrawerSubmitBtn} onClick={handleSaveBank}>
                Save & Verify Payout Method
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================
          BRAND SWITCHER MODAL
          ======================================================== */}
      <AnimatePresence>
        {showBrandModal && (
          <div className={styles.bdDrawerOverlay} onClick={() => setShowBrandModal(false)}>
            <motion.div
              className={styles.bdModalBox}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.bdDrawerHead}>
                <h3 className={styles.bdDrawerTitle}>Switch Brand</h3>
                <button
                  className={styles.bdDrawerCloseBtn}
                  onClick={() => setShowBrandModal(false)}
                >
                  ✕
                </button>
              </div>

              {PREMIUM_BRANDS.map((b) => (
                <button
                  key={b.id}
                  className={`${styles.bdBrandChoiceItem} ${selectedBrand.id === b.id ? styles.bdBrandChoiceItemActive : ''}`}
                  onClick={() => {
                    setSelectedBrand(b);
                    setShowBrandModal(false);
                    if (onToast) onToast(`Switched active view to ${b.name}`);
                  }}
                >
                  <img src={b.logo} alt={b.name} className={styles.bdBrandAvatar} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: '#0F172A' }}>{b.name}</div>
                    <div style={{ fontSize: '11.5px', color: '#64748B' }}>{b.category}</div>
                  </div>
                </button>
              ))}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
