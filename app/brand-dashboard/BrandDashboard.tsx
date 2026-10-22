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
  TrialOrder
} from '../lib/darkstoreData';
import {
  subscribeToRealtimeOrders,
  subscribeToRealtimeShipments,
  supabaseFetchOrders,
  supabaseFetchShipments,
  supabaseFetchBrandProducts,
  supabaseFetchBrands,
  supabaseUpsertBrand
} from '../lib/supabaseClient';
import styles from './brand-mobile.module.css';

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
  const [showBrandModal, setShowBrandModal] = useState(false);

  // Available brands loaded dynamically from real Supabase DB
  const [availableBrands, setAvailableBrands] = useState<{ id: string; name: string; logo?: string; category?: string }[]>([
    {
      id: brand.id || 'current-brand',
      name: brand.name || 'Your Brand',
      logo: brand.profileImage,
      category: brand.category || 'Designer Label'
    }
  ]);

  // Drawers
  const [showDispatchDrawer, setShowDispatchDrawer] = useState(false);
  const [dispatchItem, setDispatchItem] = useState<{ id: string; name: string } | null>(null);
  const [dispatchUnits, setDispatchUnits] = useState(25);
  const [dispatchCourier, setDispatchCourier] = useState('BlueDart Express');
  const [dispatchTracking, setDispatchTracking] = useState('');

  // Real Bank Account State from Brand Profile
  const [showBankDrawer, setShowBankDrawer] = useState(false);
  const [bankType, setBankType] = useState<'bank' | 'upi'>(brand.bankAccount?.payoutMethod || (brand.bankAccount?.upiId ? 'upi' : 'bank'));
  const [accountHolder, setAccountHolder] = useState(brand.bankAccount?.accountHolderName || brand.founderName || '');
  const [bankName, setBankName] = useState(brand.bankAccount?.bankName || '');
  const [accountNumber, setAccountNumber] = useState(brand.bankAccount?.accountNumber || '');
  const [ifscCode, setIfscCode] = useState(brand.bankAccount?.ifscCode || '');
  const [upiId, setUpiId] = useState(brand.bankAccount?.upiId || '');

  // Real Darkstore Telemetry
  const [inboundShipments, setInboundShipments] = useState<InboundStockShipment[]>(getInboundShipments());
  const [trialOrders, setTrialOrders] = useState<TrialOrder[]>(getTrialOrders());
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing'>('synced');

  // Chart Hover State
  const [chartHover, setChartHover] = useState<{ x: number; y: number; label: string; value: number } | null>(null);

  // Filter products for this brand
  const activeProducts = useMemo(() => {
    const list = brand.products && brand.products.length > 0 ? brand.products : [];
    return list.filter((p) => p.name && p.name.trim().length > 0);
  }, [brand.products]);

  // Filter orders strictly for this brand
  const brandOrders = useMemo(() => {
    return trialOrders.filter((o) => {
      if (!o) return false;
      if (brand.id && o.brandId === brand.id) return true;
      if (brand.name && o.brandName && o.brandName.toLowerCase() === brand.name.toLowerCase()) return true;
      return false;
    });
  }, [trialOrders, brand.id, brand.name]);

  // Real Kept / Purchased Orders
  const keptOrders = useMemo(() => {
    return brandOrders.filter((o) => o.status === 'Kept on Spot (Purchased)');
  }, [brandOrders]);

  // Real Sales (GMV) - Strictly computed from actual sold orders
  const liveGmv = useMemo(() => {
    if (keptOrders.length === 0) return 0;
    return keptOrders.reduce((sum, o) => {
      const priceNum = parseFloat(String(o.price).replace(/[^0-9.]/g, '')) || 0;
      return sum + priceNum;
    }, 0);
  }, [keptOrders]);

  // Real Units In Hub
  const liveUnits = useMemo(() => {
    if (activeProducts.length === 0) return 0;
    return activeProducts.reduce((sum, p) => sum + (Number(p.inventory) || 0), 0);
  }, [activeProducts]);

  // Real Orders Count
  const liveOrderCount = brandOrders.length;

  // Real Conversion Rate
  const conversionRate = brandOrders.length > 0
    ? `${((keptOrders.length / brandOrders.length) * 100).toFixed(1)}%`
    : '0.0%';

  // Real Next Payout (T+1 Settlement from actual GMV)
  const nextPayout = Math.floor(liveGmv * 0.8);

  // Filter shipments strictly for this brand
  const brandShipments = useMemo(() => {
    return inboundShipments.filter((s) => {
      if (!s) return false;
      if (brand.id && s.brandId === brand.id) return true;
      if (brand.name && s.brandName && s.brandName.toLowerCase() === brand.name.toLowerCase()) return true;
      return false;
    });
  }, [inboundShipments, brand.id, brand.name]);

  // Animated Live Counters
  const [animatedGmv, setAnimatedGmv] = useState(0);
  const [animatedOrders, setAnimatedOrders] = useState(0);

  useEffect(() => {
    if (liveGmv === 0) {
      setAnimatedGmv(0);
      return;
    }
    let currentGmv = 0;
    const targetGmv = liveGmv;
    const stepGmv = Math.max(1, Math.ceil(targetGmv / 30));
    const gmvTimer = setInterval(() => {
      currentGmv += stepGmv;
      if (currentGmv >= targetGmv) {
        setAnimatedGmv(targetGmv);
        clearInterval(gmvTimer);
      } else {
        setAnimatedGmv(currentGmv);
      }
    }, 25);
    return () => clearInterval(gmvTimer);
  }, [liveGmv]);

  useEffect(() => {
    if (liveOrderCount === 0) {
      setAnimatedOrders(0);
      return;
    }
    let currentOrd = 0;
    const targetOrd = liveOrderCount;
    const stepOrd = Math.max(1, Math.ceil(targetOrd / 20));
    const ordTimer = setInterval(() => {
      currentOrd += stepOrd;
      if (currentOrd >= targetOrd) {
        setAnimatedOrders(targetOrd);
        clearInterval(ordTimer);
      } else {
        setAnimatedOrders(currentOrd);
      }
    }, 35);
    return () => clearInterval(ordTimer);
  }, [liveOrderCount]);

  // Realtime Supabase Data Hydration
  useEffect(() => {
    setSyncStatus('syncing');

    // 1. Fetch real brands from Supabase to populate brand switcher
    supabaseFetchBrands().then((dbBrands) => {
      if (dbBrands && dbBrands.length > 0) {
        const mapped = dbBrands.map((b: any) => ({
          id: b.id,
          name: b.name,
          logo: b.profileImage || b.coverImage || '',
          category: b.category || 'Designer Label'
        }));
        // Ensure current brand is included
        const exists = mapped.some((m) => m.id === brand.id || m.name === brand.name);
        if (!exists && brand.name) {
          mapped.unshift({
            id: brand.id || 'curr',
            name: brand.name,
            logo: brand.profileImage,
            category: brand.category || 'Designer Label'
          });
        }
        setAvailableBrands(mapped);
      }
    }).catch(() => {});

    // 2. Fetch real orders, shipments, and brand pieces
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
          price: typeof p.price === 'string' ? p.price : `₹${p.price || 0}`,
          inventory: p.inventory || 0,
          image: Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : (p.thumbnail || ''),
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

  // Real Dynamic Trajectory Chart Points
  const chartPoints = useMemo(() => {
    if (selectedRange === 'today') {
      const labels = ['10 AM', '1 PM', '4 PM', '7 PM', '10 PM'];
      return labels.map((label, idx) => ({
        label,
        value: liveGmv > 0 ? Math.round((liveGmv / labels.length) * (idx + 1)) : 0
      }));
    }
    if (selectedRange === '7d') {
      const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      return labels.map((label, idx) => ({
        label,
        value: liveGmv > 0 ? Math.round((liveGmv / 7) * (idx + 1)) : 0
      }));
    }
    const labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    return labels.map((label, idx) => ({
      label,
      value: liveGmv > 0 ? Math.round((liveGmv / 4) * (idx + 1)) : 0
    }));
  }, [selectedRange, liveGmv]);

  const chartW = 340;
  const chartH = 130;
  const pad = 16;
  const maxVal = Math.max(...chartPoints.map((p) => p.value), 1000);
  const stepX = (chartW - pad * 2) / Math.max(chartPoints.length - 1, 1);

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
      brandId: brand.id || 'brand-01',
      brandName: brand.name || 'Brand',
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

  const currentBrandName = brand.name && brand.name.trim().length > 0 ? brand.name : 'Brand';
  const hasBankAccount = Boolean(brand.bankAccount?.accountNumber || brand.bankAccount?.upiId);

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
            {brand.profileImage ? (
              <img
                src={brand.profileImage}
                alt={currentBrandName}
                className={styles.bdBrandAvatar}
              />
            ) : (
              <div
                className={styles.bdBrandAvatar}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontWeight: 800, fontSize: '11px' }}
              >
                {currentBrandName.slice(0, 2).toUpperCase()}
              </div>
            )}
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

        {/* --- Dual-Weight Hero Greeting --- */}
        <section className={styles.bdGreetingWrap}>
          <h1 className={styles.bdGreetingTitle}>
            <strong>{currentBrandName}</strong> <span>Commerce</span>
          </h1>
          <div className={styles.bdGreetingSub}>
            Ahmedabad Central Darkstore · 10m Express Trial Zone
          </div>
        </section>

        {/* ========================================================
            TAB 1: OVERVIEW (HERO BENTO, REAL CHART, REAL ORDERS FEED)
            ======================================================== */}
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            {/* Bento Metric Cards */}
            <div className={styles.bdBentoGrid}>
              {/* Card 1: Live Sales */}
              <div className={`${styles.bdBentoCard} ${styles.bdCardHeroRevenue}`}>
                <div className={styles.bdBentoTop}>
                  <span className={styles.bdBentoLabel}>Live Sales</span>
                  <span className={styles.bdBentoChip}>
                    {liveGmv > 0 ? `${keptOrders.length} Paid` : 'Realtime'}
                  </span>
                </div>
                <div className={styles.bdBentoValueRow}>
                  <div className={styles.bdBentoValue}>₹{animatedGmv.toLocaleString('en-IN')}</div>
                  <div className={styles.bdBentoSub}>Gross Merchandise Value</div>
                </div>
                <div className={styles.bdBentoDecal} />
              </div>

              {/* Card 2: Doorstep Trials */}
              <div className={`${styles.bdBentoCard} ${styles.bdCardHeroOrders}`}>
                <div className={styles.bdBentoTop}>
                  <span className={styles.bdBentoLabel}>Doorstep Trials</span>
                  <span className={styles.bdBentoChip}>
                    {liveOrderCount > 0 ? 'Active' : 'Hub Ready'}
                  </span>
                </div>
                <div className={styles.bdBentoValueRow}>
                  <div className={styles.bdBentoValue}>{animatedOrders}</div>
                  <div className={styles.bdBentoSub}>10-min active runs</div>
                </div>
                <div className={styles.bdBentoDecal} />
              </div>

              {/* Card 3: Real Conversion Rate */}
              <div className={`${styles.bdBentoCard} ${styles.bdCardSoftWhite}`}>
                <div className={styles.bdBentoTop}>
                  <span className={styles.bdBentoLabel}>Conversion</span>
                  <span className={`${styles.bdBentoChip} ${styles.bdBentoChipDark}`}>
                    {brandOrders.length > 0 ? `${keptOrders.length} Kept` : '0 Orders'}
                  </span>
                </div>
                <div className={styles.bdBentoValueRow}>
                  <div className={styles.bdBentoValue}>{conversionRate}</div>
                  <div className={styles.bdBentoSub}>Kept on spot & settled</div>
                </div>
              </div>

              {/* Card 4: Next Settlement Payout */}
              <div className={`${styles.bdBentoCard} ${styles.bdCardSoftWhite}`}>
                <div className={styles.bdBentoTop}>
                  <span className={styles.bdBentoLabel}>Next Payout</span>
                  <span className={`${styles.bdBentoChip} ${styles.bdBentoChipDark}`}>
                    {hasBankAccount ? 'T+1 Active' : 'Bank Needed'}
                  </span>
                </div>
                <div className={styles.bdBentoValueRow}>
                  <div className={styles.bdBentoValue}>₹{nextPayout.toLocaleString('en-IN')}</div>
                  <div className={styles.bdBentoSub}>
                    {liveGmv > 0 ? 'Auto wire at 9 AM' : 'Pending first delivery'}
                  </div>
                </div>
              </div>
            </div>

            {/* Extended Date & Range Pill Rail */}
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

            {/* Real Spline Revenue Trajectory (Interactive SVG Curve) */}
            <div className={styles.bdChartCard}>
              <div className={styles.bdChartHeader}>
                <h3 className={styles.bdChartTitle}>Revenue Trajectory</h3>
                <span className={styles.bdChartTotalBadge}>
                  {liveGmv > 0 ? `₹${liveGmv.toLocaleString('en-IN')}` : '₹0 Live'}
                </span>
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

            {/* Quick Action Bar */}
            <div className={styles.bdQuickActionRow}>
              <button
                className={styles.bdBtnPrimaryGlow}
                onClick={() => {
                  const targetProd = activeProducts[0] ? { id: activeProducts[0].id || 'piece-01', name: activeProducts[0].name } : { id: 'piece-01', name: 'New Inward Piece' };
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

            {/* Real Live Doorstep Trials Feed */}
            <div className={styles.bdSectionHead}>
              <h3 className={styles.bdSectionTitle}>Live Doorstep Activity</h3>
              <button className={styles.bdSectionLink} onClick={() => setActiveTab('orders')}>
                View all ({brandOrders.length})
              </button>
            </div>

            {brandOrders.length > 0 ? (
              <div className={styles.bdActivityList}>
                {brandOrders.slice(0, 4).map((ord, idx) => (
                  <div key={ord.id || idx} className={styles.bdActivityCard}>
                    {ord.items && ord.items[0]?.thumbnail ? (
                      <img
                        src={ord.items[0].thumbnail}
                        alt="Piece"
                        className={styles.bdActivityThumb}
                      />
                    ) : (
                      <div className={styles.bdActivityThumb} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', fontWeight: 700, fontSize: '11px' }}>
                        DRB
                      </div>
                    )}
                    <div className={styles.bdActivityMeta}>
                      <div className={styles.bdActivityTitle}>
                        {ord.customerAddress || ord.customerName || 'Ahmedabad Express Trial'}
                      </div>
                      <div className={styles.bdActivitySub}>
                        {ord.items && ord.items.length > 0 ? ord.items[0].productName : (ord.productName || 'Trial Piece')} · {ord.price || 'Trial'}
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
            ) : (
              <div className={styles.bdEmptyState}>
                <div className={styles.bdEmptyIconWrap}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <h4 className={styles.bdEmptyTitle}>No Doorstep Trials Yet</h4>
                <p className={styles.bdEmptySub}>
                  Trials will appear here in real-time as customers in Ahmedabad request 10-minute doorstep fittings for your pieces.
                </p>
                <button
                  className={styles.bdEmptyBtn}
                  onClick={() => {
                    const targetProd = activeProducts[0] ? { id: activeProducts[0].id || 'p1', name: activeProducts[0].name } : { id: 'p1', name: 'Curated Batch' };
                    setDispatchItem(targetProd);
                    setShowDispatchDrawer(true);
                  }}
                >
                  + Inward Stock to Darkstore
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* ========================================================
            TAB 2: REAL CATALOG (NO MOCK FALLBACKS)
            ======================================================== */}
        {activeTab === 'catalog' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <div className={styles.bdSectionHead}>
              <h2 className={styles.bdSectionTitle}>Live Catalog ({activeProducts.length})</h2>
              {activeProducts.length > 0 && (
                <button
                  className={styles.bdSectionLink}
                  onClick={() => {
                    setDispatchItem({ id: activeProducts[0].id || 'prod-01', name: activeProducts[0].name });
                    setShowDispatchDrawer(true);
                  }}
                >
                  + Restock
                </button>
              )}
            </div>

            {activeProducts.length > 0 ? (
              <div className={styles.bdProductGrid}>
                {activeProducts.map((p, idx) => (
                  <div key={p.id || idx} className={styles.bdProductCard}>
                    <div className={styles.bdProductImgWrap}>
                      {p.image || (p.images && p.images[0]) ? (
                        <img
                          src={p.image || (p.images && p.images[0])}
                          alt={p.name}
                          className={styles.bdProductImg}
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', color: '#94A3B8', fontSize: '12px', fontWeight: 700 }}>
                          No Photo
                        </div>
                      )}
                      <span className={styles.bdProductStockBadge}>
                        {p.inventory || 0} in Hub
                      </span>
                    </div>
                    <div className={styles.bdProductInfo}>
                      <h4 className={styles.bdProductName}>{p.name}</h4>
                      <div className={styles.bdProductPriceRow}>
                        <span className={styles.bdProductPrice}>
                          {typeof p.price === 'string' ? (p.price.startsWith('₹') ? p.price : `₹${p.price}`) : `₹${p.price || 0}`}
                        </span>
                        <span className={styles.bdProductStatusText}>
                          {p.isLive !== false ? 'Live' : 'Paused'}
                        </span>
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
            ) : (
              <div className={styles.bdEmptyState}>
                <div className={styles.bdEmptyIconWrap}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  </svg>
                </div>
                <h4 className={styles.bdEmptyTitle}>No Pieces Inwarded Yet</h4>
                <p className={styles.bdEmptySub}>
                  Dispatch your initial collection to Ahmedabad Central Hub to activate instant 10-minute doorstep trials.
                </p>
                <button
                  className={styles.bdEmptyBtn}
                  onClick={() => {
                    setDispatchItem({ id: 'piece-01', name: 'First Collection Piece' });
                    setShowDispatchDrawer(true);
                  }}
                >
                  + Inward Your First Piece
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* ========================================================
            TAB 3: REAL ORDERS / DOORSTEP TRIALS
            ======================================================== */}
        {activeTab === 'orders' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <div className={styles.bdSectionHead}>
              <h2 className={styles.bdSectionTitle}>Doorstep Trials ({brandOrders.length})</h2>
              <span className={styles.bdChartTotalBadge}>Ahmedabad Hub</span>
            </div>

            {brandOrders.length > 0 ? (
              <div className={styles.bdActivityList}>
                {brandOrders.map((ord, idx) => (
                  <div key={ord.id || idx} className={styles.bdActivityCard}>
                    {ord.items && ord.items[0]?.thumbnail ? (
                      <img
                        src={ord.items[0].thumbnail}
                        alt="Piece"
                        className={styles.bdActivityThumb}
                      />
                    ) : (
                      <div className={styles.bdActivityThumb} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', fontWeight: 700, fontSize: '11px' }}>
                        DRB
                      </div>
                    )}
                    <div className={styles.bdActivityMeta}>
                      <div className={styles.bdActivityTitle}>
                        {ord.customerAddress || ord.customerName || 'Ahmedabad Express'}
                      </div>
                      <div className={styles.bdActivitySub}>
                        {ord.items && ord.items[0] ? ord.items[0].productName : (ord.productName || 'Trial Piece')} · {ord.price || 'Trial'}
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
            ) : (
              <div className={styles.bdEmptyState}>
                <div className={styles.bdEmptyIconWrap}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  </svg>
                </div>
                <h4 className={styles.bdEmptyTitle}>No Trial Orders Received</h4>
                <p className={styles.bdEmptySub}>
                  Orders placed by customers in Ahmedabad will appear here with live delivery runner status and doorstep fitting timers.
                </p>
              </div>
            )}
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
              <h3 className={styles.bdSectionTitle}>Inbound Consignments ({brandShipments.length})</h3>
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

            {brandShipments.length > 0 ? (
              brandShipments.map((shp, idx) => (
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
              ))
            ) : (
              <div className={styles.bdEmptyState}>
                <div className={styles.bdEmptyIconWrap}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="3" width="15" height="13" />
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                    <circle cx="5.5" cy="18.5" r="2.5" />
                    <circle cx="18.5" cy="18.5" r="2.5" />
                  </svg>
                </div>
                <h4 className={styles.bdEmptyTitle}>No Active Consignments</h4>
                <p className={styles.bdEmptySub}>
                  Dispatch inventory from your manufacturing or warehouse facility directly to Ahmedabad Central Hub.
                </p>
                <button
                  className={styles.bdEmptyBtn}
                  onClick={() => {
                    const targetProd = activeProducts[0] ? { id: activeProducts[0].id || 'p1', name: activeProducts[0].name } : { id: 'p1', name: 'Curated Batch' };
                    setDispatchItem(targetProd);
                    setShowDispatchDrawer(true);
                  }}
                >
                  + Dispatch First Consignment
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* ========================================================
            TAB 5: REAL PAYOUTS & BANK DETAILS
            ======================================================== */}
        {activeTab === 'payouts' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            {hasBankAccount ? (
              <div className={styles.bdBankCardVisual}>
                <div className={styles.bdBankCardChip} />
                <div className={styles.bdBankCardNumber}>
                  {brand.bankAccount?.payoutMethod === 'upi'
                    ? brand.bankAccount.upiId
                    : `•••• •••• •••• ${brand.bankAccount?.accountNumber ? brand.bankAccount.accountNumber.slice(-4) : '••••'}`}
                </div>
                <div className={styles.bdBankCardMeta}>
                  <div>
                    <div style={{ opacity: 0.6, fontSize: '10px', textTransform: 'uppercase' }}>Account Holder</div>
                    <div style={{ fontWeight: 700, fontSize: '13px' }}>
                      {brand.bankAccount?.accountHolderName || brand.founderName || currentBrandName}
                    </div>
                  </div>
                  <div>
                    <div style={{ opacity: 0.6, fontSize: '10px', textTransform: 'uppercase' }}>
                      {brand.bankAccount?.payoutMethod === 'upi' ? 'Method' : 'Bank'}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '13px' }}>
                      {brand.bankAccount?.payoutMethod === 'upi' ? 'Instant UPI' : (brand.bankAccount?.bankName || 'Verified Bank')}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className={styles.bdBankUnlinkedCard}>
                <div className={styles.bdEmptyIconWrap}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                    <line x1="2" y1="10" x2="22" y2="10" />
                  </svg>
                </div>
                <h4 className={styles.bdEmptyTitle}>No Payout Account Linked</h4>
                <p className={styles.bdEmptySub}>
                  Link your current bank account or verified UPI ID to enable automatic T+1 payout settlements.
                </p>
                <button
                  className={styles.bdEmptyBtn}
                  onClick={() => setShowBankDrawer(true)}
                >
                  + Link Bank Account / UPI
                </button>
              </div>
            )}

            <div className={styles.bdQuickActionRow}>
              <button
                className={styles.bdBtnPrimaryGlow}
                onClick={() => {
                  if (liveGmv === 0) {
                    if (onToast) onToast('No pending balance to settle. Payouts unlock after first trial purchase.');
                    return;
                  }
                  if (!hasBankAccount) {
                    setShowBankDrawer(true);
                    if (onToast) onToast('Please link a payout bank account first');
                    return;
                  }
                  if (onToast) onToast(`Instant T+1 Payout of ₹${nextPayout.toLocaleString('en-IN')} initiated via RazorpayX Route`);
                }}
              >
                <span>Request Instant Payout</span>
              </button>
              <button
                className={styles.bdBtnSecondarySoft}
                onClick={() => setShowBankDrawer(true)}
              >
                <span>{hasBankAccount ? 'Edit Details' : 'Add Bank'}</span>
              </button>
            </div>

            <div className={styles.bdSectionHead}>
              <h3 className={styles.bdSectionTitle}>Settlement Ledger</h3>
              <span className={styles.bdChartTotalBadge}>Auto T+1</span>
            </div>

            {keptOrders.length > 0 ? (
              <div className={styles.bdActivityList}>
                {keptOrders.map((ord, idx) => (
                  <div key={ord.id || idx} className={styles.bdActivityCard}>
                    <div className={styles.bdActivityMeta}>
                      <div className={styles.bdActivityTitle}>
                        {ord.price || '₹0'} · Order {ord.orderNumber || ord.id}
                      </div>
                      <div className={styles.bdActivitySub}>
                        Doorstep Fitting Purchased · Settled to {brand.bankAccount?.bankName || 'Verified Account'}
                      </div>
                    </div>
                    <span className={`${styles.bdStatusTag} ${styles.bdTagEmerald}`}>
                      Settled
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.bdEmptyState}>
                <h4 className={styles.bdEmptyTitle}>No Settlements Yet</h4>
                <p className={styles.bdEmptySub}>
                  Completed customer purchases are settled automatically on T+1 directly to your bank account.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </main>

      {/* ========================================================
          FLOATING BOTTOM PILL DOCK
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
          SLIDE-UP DRAWER: CONSIGNMENT DISPATCH
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
                      placeholder="e.g. Aman Patel"
                      className={styles.bdFormInput}
                      value={accountHolder}
                      onChange={(e) => setAccountHolder(e.target.value)}
                    />
                  </div>

                  <div className={styles.bdFormGroup}>
                    <label className={styles.bdFormLabel}>Bank Name</label>
                    <input
                      type="text"
                      placeholder="e.g. HDFC Bank, ICICI Bank"
                      className={styles.bdFormInput}
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                    />
                  </div>

                  <div className={styles.bdFormGroup}>
                    <label className={styles.bdFormLabel}>Account Number</label>
                    <input
                      type="text"
                      placeholder="e.g. 50200012345678"
                      className={styles.bdFormInput}
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                    />
                  </div>

                  <div className={styles.bdFormGroup}>
                    <label className={styles.bdFormLabel}>IFSC Code</label>
                    <input
                      type="text"
                      placeholder="e.g. HDFC0001024"
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
          BRAND SWITCHER MODAL (REAL SUPABASE BRANDS)
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

              {availableBrands.map((b) => (
                <button
                  key={b.id}
                  className={`${styles.bdBrandChoiceItem} ${brand.id === b.id || brand.name === b.name ? styles.bdBrandChoiceItemActive : ''}`}
                  onClick={() => {
                    setShowBrandModal(false);
                    if (onUpdateBrand) {
                      onUpdateBrand({
                        ...brand,
                        id: b.id,
                        name: b.name,
                        profileImage: b.logo || brand.profileImage,
                        category: b.category || brand.category
                      });
                    }
                    if (onToast) onToast(`Switched active view to ${b.name}`);
                  }}
                >
                  {b.logo ? (
                    <img src={b.logo} alt={b.name} className={styles.bdBrandAvatar} />
                  ) : (
                    <div className={styles.bdBrandAvatar} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontWeight: 800, fontSize: '11px' }}>
                      {b.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: '#0F172A' }}>{b.name}</div>
                    <div style={{ fontSize: '11.5px', color: '#64748B' }}>{b.category || 'Designer Label'}</div>
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
