'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import {
  Activity,
  Bell,
  ChevronDown,
  CreditCard,
  Home,
  LayoutGrid,
  LogOut,
  Package,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { BrandProfile } from './types';
import styles from './brand-dashboard.module.css';

const PREMIUM_BRANDS = [
  { id: 'brand-jihi-01', name: 'JIHI', logo: '/brands/jihi/profile.jpg', category: 'Resort & Evening Wear' },
  { id: 'brand-house-of-koala', name: 'House of Koala', logo: '/assets/captured/79_brand_2Fhouse_of_koala_2Fkp-wn-30_2F1.jpg', category: 'Knitwear' },
  { id: 'brand-chupps', name: 'Chupps', logo: '/assets/captured/78_brand_2Fchupps_2F10400-415-7_2F1.jpg', category: 'Footwear' },
];

const REAL_PRODUCT_IMAGES = [
  '/assets/real/products/10284/angle_1.jpg',
  '/assets/real/products/10285/angle_1.jpg',
  '/assets/real/products/10308/angle_1.jpg',
  '/assets/real/products/10284/angle_2.jpg',
  '/assets/real/products/10285/angle_2.jpg',
];

const spring = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
  mass: 1,
} as const;

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: spring },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: spring },
};

export default function BrandDashboard({
  brand,
  onSignOut,
  onToast,
}: {
  brand: BrandProfile;
  onSignOut?: () => void;
  onToast?: (msg: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<'overview' | 'catalog' | 'orders' | 'payouts' | 'analytics'>('overview');
  const [selectedBrand, setSelectedBrand] = useState(PREMIUM_BRANDS[0]);
  const [isDark, setIsDark] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('synced');
  const [pulseActive, setPulseActive] = useState(false);
  const [chartHover, setChartHover] = useState<{ x: number; y: number; label: string; value: number } | null>(null);

  const [revenueDisplay, setRevenueDisplay] = useState(0);
  const [ordersDisplay, setOrdersDisplay] = useState(0);

  const liveProducts = (brand.products || []).filter((p) => p.name?.trim().length > 0 && p.isLive !== false);
  const liveGmv = liveProducts.reduce((sum, p) => {
    const price = typeof p.price === 'string' ? parseFloat(p.price.replace(/[^0-9.]/g, '')) : Number(p.price) || 0;
    const inv = Number(p.inventory) || 0;
    return sum + price * inv;
  }, 0);
  const liveUnits = liveProducts.reduce((sum, p) => sum + (Number(p.inventory) || 0), 0);
  const liveOrders = Math.max(1, Math.round(liveGmv / 3500));

  useEffect(() => {
    setRevenueDisplay(0);
    setOrdersDisplay(0);
    const r = setInterval(() => {
      setRevenueDisplay((v) => (v >= liveGmv ? liveGmv : v + Math.ceil(liveGmv / 60)));
    }, 25);
    const o = setInterval(() => {
      setOrdersDisplay((v) => (v >= liveOrders ? liveOrders : v + Math.ceil(liveOrders / 60)));
    }, 35);
    return () => {
      clearInterval(r);
      clearInterval(o);
    };
  }, [liveGmv, liveOrders]);

  useEffect(() => {
    const t = setInterval(() => {
      setPulseActive(true);
      setTimeout(() => setPulseActive(false), 600);
    }, 4200);
    return () => clearInterval(t);
  }, []);

  const toggleTheme = () => {
    setIsDark((d) => {
      const next = !d;
      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('dark', next);
      }
      return next;
    });
  };

  const chartPoints = [
    { label: 'JAN', value: 185000 },
    { label: 'FEB', value: 240000 },
    { label: 'MAR', value: 210000 },
    { label: 'APR', value: 310000 },
    { label: 'MAY', value: 280000 },
    { label: 'JUN', value: 390000 },
    { label: 'JUL', value: 460000 },
  ];

  const chartWidth = 640;
  const chartHeight = 220;
  const padding = 40;

  const n = chartPoints.length;
  const step = (chartWidth - padding * 2) / Math.max(n - 1, 1);
  const maxVal = Math.max(...chartPoints.map((p) => p.value));

  const pathSegments: string[] = [];
  chartPoints.forEach((p, i) => {
    const x = padding + i * step;
    const y = chartHeight - padding - (p.value / maxVal) * (chartHeight - padding * 2);
    if (i === 0) {
      pathSegments.push(`M ${x} ${y}`);
    } else {
      const prev = chartPoints[i - 1];
      const px = padding + (i - 1) * step;
      const py = chartHeight - padding - (prev.value / maxVal) * (chartHeight - padding * 2);
      const cp1x = px + step * 0.35;
      const cp2x = x - step * 0.35;
      pathSegments.push(`C ${cp1x} ${py} ${cp2x} ${y} ${x} ${y}`);
    }
  });
  const path = pathSegments.join(' ');

  const handleBrandSelect = (b: typeof PREMIUM_BRANDS[number]) => {
    setSelectedBrand(b);
    if (onToast) onToast(`Brand switched to ${b.name}`);
  };

  return (
    <div className={styles.mobileContainer} data-theme={isDark ? 'dark' : 'light'}>
      <div className={styles.bdBgWash} />

      <nav className={styles.bdCommandBar}>
        <div className={styles.bdBrandSwitcher}>
          <button className={styles.bdBrandPill} aria-label="Switch brand">
            <img src={selectedBrand.logo} alt={`${selectedBrand.name} logo`} className={styles.bdBrandLogo} />
            <span className={styles.bdBrandName}>{selectedBrand.name}</span>
            <ChevronDown size={12} className={styles.bdChevron} />
          </button>
          <div className={styles.bdSyncRow}>
            <RefreshCw size={14} className={clsx(styles.bdSyncIcon, syncStatus === 'syncing' && styles.bdSpin)} />
            <span className={styles.bdSyncText}>
              {syncStatus === 'synced' ? 'Synced' : syncStatus === 'syncing' ? 'Syncing…' : 'Offline'}
            </span>
            <span className={styles.bdDot} />
          </div>
        </div>

        <div className={styles.bdCommandCenter}>
          <button className={styles.bdIconBtn} aria-label="Notify" title="Notifications">
            <Bell size={18} />
          </button>
          <button
            className={styles.bdIconBtn}
            aria-label="Theme"
            title={isDark ? 'Light mode' : 'Dark mode'}
            onClick={toggleTheme}
          >
            {isDark ? <SunIcon size={18} /> : <MoonIcon size={18} />}
          </button>
          <div className={styles.bdProfileWrap}>
            <button className={styles.bdProfileBtn} aria-label="Profile">
              <img src={brand.profileImage || '/drobe-emblem.png'} alt="Profile" className={styles.bdProfileImg} />
            </button>
            {onSignOut && (
              <button className={styles.bdSignOut} onClick={onSignOut} aria-label="Sign out">
                Sign out
                <LogOut size={12} />
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className={styles.bdMain}>
        <header className={styles.bdHeader}>
          <div className={styles.bdHeaderContent}>
            <div className={clsx(styles.bdKicker, 'bd-text-caption')}>{selectedBrand.category}</div>
            <h1 className={clsx(styles.bdTitle, 'bd-text-lg-title')}>
              {selectedBrand.name}
              <span className={styles.bdTitleAccent}>, at a glance.</span>
            </h1>
            <p className={clsx(styles.bdSubtitle, 'bd-text-body')}>
              Confident, minimalist, and deeply human. Your brand's live commerce command center.
            </p>
          </div>
        </header>

        <section className={styles.bdMetrics}>
          <div className={styles.bdMetricGrid}>
            <motion.div
              className={styles.bdMetricCard}
              whileHover={{ scale: 1.02, boxShadow: `0 16px 48px var(--bd-shadow-hover)` }}
              whileTap={{ scale: 0.97 }}
              layoutId="rev"
            >
              <div className={styles.bdMetricHeader}>
                <span className={clsx(styles.bdMetricLabel, 'bd-text-caption')}>Live Revenue</span>
                <div className={clsx(styles.bdMetricTrend, 'positive')}>
                  <TrendingUp size={12} className={styles.bdTrendIcon} />
                  <span>+12.4% vs last week</span>
                </div>
              </div>
              <div className={styles.bdMetricValue}>
                <span className={clsx(styles.bdCurrency, 'bd-text-caption')}>₹</span>
                <span className={clsx(styles.bdBigNumber, 'bd-number')}>{Math.floor(revenueDisplay).toLocaleString('en-IN')}</span>
              </div>
              <div className={clsx(styles.bdMetricCaption, 'bd-text-caption')}>
                Gross Merchandise Value · Live from darkstore hub
              </div>
              <div className={styles.bdMetricMiniChart}>
                <svg className={styles.bdSparkline} width="160" height="28" />
              </div>
            </motion.div>

            <motion.div
              className={styles.bdMetricCard}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              layoutId="ord"
            >
              <div className={styles.bdMetricHeader}>
                <span className={clsx(styles.bdMetricLabel, 'bd-text-caption')}>Live Order Pulse</span>
                <div className={styles.bdPulseBadge}>
                  <span
                    className={styles.bdPulseDot}
                    style={{ opacity: pulseActive ? 1 : 0.4 }}
                  />
                  Pulsing
                </div>
              </div>
              <div className={styles.bdMetricValue}>
                <span className={clsx(styles.bdBigNumber, 'bd-number')}>{Math.floor(ordersDisplay)}</span>
                <span className={clsx(styles.bdMetricUnit, 'bd-text-caption')}>orders today</span>
              </div>
              <div className={clsx(styles.bdMetricCaption, 'bd-text-caption')}>
                Doorstep express · 10-min ETA zone
              </div>
              <div className={styles.bdMetricMiniChart}>
                <div className={styles.bdPulseRing} />
              </div>
            </motion.div>

            <motion.div
              className={styles.bdMetricCard}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              layoutId="conv"
            >
              <div className={styles.bdMetricHeader}>
                <span className={clsx(styles.bdMetricLabel, 'bd-text-caption')}>Conversion Rate</span>
                <div className={clsx(styles.bdMetricTrend, 'positive')}>
                  <TrendingUp size={12} className={styles.bdTrendIcon} />
                  <span>+3.2% MoM</span>
                </div>
              </div>
              <div className={styles.bdMetricValue}>
                <span className={clsx(styles.bdBigNumber, 'bd-number')}>68.4</span>
                <span className={clsx(styles.bdMetricUnit, 'bd-text-caption')}>%</span>
              </div>
              <div className={clsx(styles.bdMetricCaption, 'bd-text-caption')}>
                Kept & instant UPI paid
              </div>
            </motion.div>

            <motion.div
              className={styles.bdMetricCard}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              layoutId="pay"
            >
              <div className={styles.bdMetricHeader}>
                <span className={clsx(styles.bdMetricLabel, 'bd-text-caption')}>Next Payout</span>
                <ShieldCheck size={14} className={styles.bdMetricIcon} />
              </div>
              <div className={styles.bdMetricValue}>
                <span className={clsx(styles.bdCurrency, 'bd-text-caption')}>₹</span>
                <span className={clsx(styles.bdBigNumber, 'bd-number')}>{Math.floor(liveGmv * 0.8).toLocaleString('en-IN')}</span>
              </div>
              <div className={clsx(styles.bdMetricCaption, 'bd-text-caption')}>
                T+1 settlement · UPI verified
              </div>
            </motion.div>
          </div>
        </section>

        <section className={styles.bdCharts}>
          <div className={clsx(styles.bdChartCard, styles.bdGlass, styles.bdCardHover)}>
            <div className={styles.bdChartHeader}>
              <h2 className={clsx(styles.bdChartTitle, 'bd-text-title-1')}>Revenue trajectory</h2>
              <div className={styles.bdChartControls}>
                {['7d', '30d', '90d'].map((r) => (
                  <button key={r} className={styles.bdRangeBtn}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.bdChartWrapper}>
              <svg
                className={styles.bdChartSvg}
                width={chartWidth}
                height={chartHeight}
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const mx = e.clientX - rect.left;
                  const idx = Math.min(
                    Math.max(
                      Math.round((mx - padding) / ((chartWidth - padding * 2) / (chartPoints.length - 1))),
                      0
                    ),
                    chartPoints.length - 1
                  );
                  const p = chartPoints[idx];
                  setChartHover({
                    x: padding + idx * ((chartWidth - padding * 2) / (chartPoints.length - 1)),
                    y: 0,
                    label: p.label,
                    value: p.value,
                  });
                }}
                onMouseLeave={() => setChartHover(null)}
              >
                <defs>
                  <linearGradient id="bdChartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--bd-accent)" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="var(--bd-accent)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d={path}
                  fill="none"
                  stroke="var(--bd-accent)"
                  strokeWidth="3"
                  className={styles.bdChartLine}
                />
                <path d={path} fill="url(#bdChartGrad)" stroke="none" className={styles.bdChartFill} />
                {chartHover && (
                  <>
                    <line
                      x1={chartHover.x}
                      y1={chartHeight - padding}
                      x2={chartHover.x}
                      y2={chartHover.y}
                      stroke="var(--bd-accent)"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                      className={styles.bdChartMagnetic}
                    />
                    <circle
                      cx={chartHover.x}
                      cy={chartHover.y}
                      r={6}
                      fill="#FFFFFF"
                      stroke="var(--bd-accent)"
                      strokeWidth="3"
                      className={styles.bdChartPoint}
                    />
                    <foreignObject
                      x={chartHover.x - 70}
                      y={chartHover.y - 40}
                      width={140}
                      height={32}
                    >
                      <div className={styles.bdTooltip}>
                        <span className={clsx(styles.bdTooltipLabel, 'bd-text-caption')}>{chartHover.label}</span>
                        <span className={clsx(styles.bdTooltipValue, 'bd-number')}>
                          ₹{chartHover.value.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </foreignObject>
                  </>
                )}
              </svg>
            </div>
          </div>

          <div className={styles.bdRail}>
            <div className={clsx(styles.bdQuickCard, styles.bdGlass)}>
              <div className={styles.bdQuickHeader}>
                <h3 className={clsx(styles.bdQuickTitle, 'bd-text-title-1')}>Quick actions</h3>
              </div>
              <div className={styles.bdQuickList}>
                <button className={styles.bdQuickItem}>
                  <Package size={16} />
                  <span>Dispatch stock</span>
                </button>
                <button className={styles.bdQuickItem}>
                  <CreditCard size={16} />
                  <span>Payout settings</span>
                </button>
                <button className={styles.bdQuickItem}>
                  <ShieldCheck size={16} />
                  <span>Verify bank</span>
                </button>
              </div>
            </div>
            <div className={clsx(styles.bdLiveFeed, styles.bdGlass)}>
              <div className={styles.bdQuickHeader}>
                <h3 className={clsx(styles.bdQuickTitle, 'bd-text-title-1')}>Live activity</h3>
              </div>
              <div className={styles.bdFeedList}>
                {[...Array(4)].map((_, i) => (
                  <div key={i} className={styles.bdFeedItem}>
                    <div className={styles.bdFeedAvatar} />
                    <div className={styles.bdFeedText}>
                      <span className={clsx(styles.bdFeedName, 'bd-text-body')}>Customer order</span>
                      <span className={clsx(styles.bdFeedMeta, 'bd-text-caption')}>
                        Ahmedabad · {10 + i} min ago
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className={styles.bdCatalog}>
          <div className={styles.bdCatalogHeader}>
            <h2 className={clsx(styles.bdCatalogTitle, 'bd-text-title-1')}>Live catalog</h2>
            <button className={styles.bdViewAll}>View all {liveProducts.length}</button>
          </div>
          <div className={styles.bdCatalogList}>
            {liveProducts.slice(0, 6).map((p, i) => (
              <motion.div
                key={p.id || i}
                className={styles.bdCatalogCard}
                whileHover={{ x: -6 }}
                whileTap={{ scale: 0.98 }}
                transition={spring}
              >
                <img src={p.image || REAL_PRODUCT_IMAGES[i % REAL_PRODUCT_IMAGES.length]} alt={p.name} className={styles.bdCatalogImg} />
                <div className={styles.bdCatalogInfo}>
                  <span className={clsx(styles.bdCatalogSku, 'bd-text-caption')}>{p.sku || `DR-${i + 1}`}</span>
                  <h3 className={clsx(styles.bdCatalogName, 'bd-text-body')}>{p.name}</h3>
                  <div className={styles.bdCatalogPriceRow}>
                    <span className={clsx(styles.bdCatalogPrice, 'bd-number')}>
                      ₹{typeof p.price === 'string' ? p.price.replace(/[^0-9.]/g, '') : p.price}
                    </span>
                    <span className={clsx(styles.bdCatalogStock, 'bd-text-caption')}>{p.inventory} units</span>
                  </div>
                  <span className={clsx(styles.bdCatalogStatus, 'bd-text-caption')}>{p.inwardStatus || 'Live'}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function SunIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79" />
    </svg>
  );
}
