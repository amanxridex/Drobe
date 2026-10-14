'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Package, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Search, 
  Layers, 
  ExternalLink, 
  ChevronRight, 
  Truck, 
  ArrowUpRight, 
  Sparkles, 
  X, 
  RotateCcw,
  Check,
  ShieldCheck,
  Navigation,
  Barcode,
  Boxes,
  Store,
  UserCheck,
  Activity,
  Calendar
} from 'lucide-react';
import { 
  AHMEDABAD_WAREHOUSE,
  DarkstoreBrand,
  DarkstoreProduct,
  InboundStockShipment,
  TrialOrder,
  getDarkstoreBrands,
  getDarkstoreProducts,
  getInboundShipments,
  getTrialOrders,
  adminApproveBrand,
  adminRejectBrand,
  adminInwardProduct,
  updateTrialOrderStatus,
  adjustProductStock,
  getNextSkuNumber,
  getNextAvailableShelfLocation,
  markShipmentArrived,
  syncDarkstoreWithSupabase
} from '../lib/darkstoreData';
import { subscribeToRealtimeOrders } from '../lib/supabaseClient';
import styles from './admin.module.css';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'inwarding' | 'inventory' | 'shelves' | 'trials' | 'approvals'>('inwarding');
  const [brands, setBrands] = useState<DarkstoreBrand[]>([]);
  const [products, setProducts] = useState<DarkstoreProduct[]>([]);
  const [inbounds, setInbounds] = useState<InboundStockShipment[]>([]);
  const [trialOrders, setTrialOrders] = useState<TrialOrder[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Brand Filter
  const [brandFilter, setBrandFilter] = useState<'all' | 'waiting' | 'approved'>('all');

  // Inventory Filter
  const [inventoryFilter, setInventoryFilter] = useState<'all' | 'in_stock' | 'low_stock'>('all');

  // Global Search Query
  const [searchQuery, setSearchQuery] = useState('');

  // Barcode Label Modal State
  const [barcodeModalOpen, setBarcodeModalOpen] = useState(false);
  const [selectedProductForBarcode, setSelectedProductForBarcode] = useState<DarkstoreProduct | null>(null);

  // Inwarding Modal State
  const [inwardModalOpen, setInwardModalOpen] = useState(false);
  const [selectedProductToInward, setSelectedProductToInward] = useState<DarkstoreProduct | null>(null);
  const [associatedShipment, setAssociatedShipment] = useState<InboundStockShipment | null>(null);

  // Inward Form State
  const [inwardUnits, setInwardUnits] = useState<number>(20);
  const [inwardSku, setInwardSku] = useState<string>('');
  const [selectedZone, setSelectedZone] = useState('Zone A - Outerwear & Heavy Silhouettes');
  const [selectedRack, setSelectedRack] = useState('Rack A-02');
  const [selectedShelf, setSelectedShelf] = useState('Shelf 3');
  const [selectedBin, setSelectedBin] = useState('Bin 04');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const loadAllData = () => {
    setBrands(getDarkstoreBrands());
    setProducts(getDarkstoreProducts());
    setInbounds(getInboundShipments());
    setTrialOrders(getTrialOrders());
  };

  useEffect(() => {
    loadAllData();
    syncDarkstoreWithSupabase().then(() => {
      loadAllData();
    });

    const unsubRealtime = subscribeToRealtimeOrders(() => {
      syncDarkstoreWithSupabase().then(() => loadAllData());
    });

    const handleStorageChange = () => {
      loadAllData();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      if (unsubRealtime) unsubRealtime();
    };
  }, []);

  // Telemetry counts
  const waitingBrandsCount = brands.filter(b => b.status === 'Waiting for Approval').length;
  const approvedBrandsCount = brands.filter(b => b.status === 'Approved').length;
  const pendingInwardsCount = products.filter(p => p.inwardStatus !== 'Inwarded & Live').length;
  const liveSkusCount = products.filter(p => p.isLive).length;
  const activeTrialsCount = trialOrders.filter(o => o.status === 'Out for 30-Min Delivery' || o.status === 'Doorstep Fitting (Runner Waiting Outside)').length;

  // Handlers
  const handleApproveBrand = (brandId: string, brandName: string) => {
    const res = adminApproveBrand(brandId);
    if (res) {
      loadAllData();
      triggerToast(`✓ Approved ${brandName} · Listed on Drobe directory & consignment stock dispatch unlocked!`);
    }
  };

  const handleRejectBrand = (brandId: string, brandName: string) => {
    const res = adminRejectBrand(brandId);
    if (res) {
      loadAllData();
      triggerToast(`Brand ${brandName} marked as Rejected`);
    }
  };

  const handleOpenInwardModal = (prod: DarkstoreProduct, ship?: InboundStockShipment) => {
    setSelectedProductToInward(prod);
    setAssociatedShipment(ship || null);
    setInwardUnits(ship ? ship.units : (prod.inventory || 20));
    const nextSku = getNextSkuNumber();
    setInwardSku(prod.sku || nextSku.sku);

    // Automatically assign next vacant shelf in Ahmedabad Darkstore Hub!
    const autoShelf = getNextAvailableShelfLocation(prod.category);
    setSelectedZone(autoShelf.zone);
    setSelectedRack(autoShelf.rack);
    setSelectedShelf(autoShelf.shelf);
    setSelectedBin(autoShelf.bin);

    setInwardModalOpen(true);
  };

  const handleMarkArrived = (shipmentId: string, prodName: string) => {
    const res = markShipmentArrived(shipmentId);
    if (res) {
      loadAllData();
      triggerToast(`📦 Consignment arrived at Shivam Bungalows 1, Koteshwar Road hub! Ready for shelf allocation.`);
    }
  };

  const handleDirectAutoInward = (ship: InboundStockShipment, prod?: DarkstoreProduct) => {
    const targetProdId = prod?.id || ship.productId;
    const autoShelf = getNextAvailableShelfLocation(prod?.category);
    const nextSku = getNextSkuNumber();

    const res = adminInwardProduct({
      productId: targetProdId,
      sku: prod?.sku || nextSku.sku,
      unitsReceived: ship.units || 20,
      shelfLocation: {
        zone: autoShelf.zone,
        rack: autoShelf.rack,
        shelf: autoShelf.shelf,
        bin: autoShelf.bin
      },
      verifiedBy: 'Harshil M. (Ahmedabad Hub Ops)',
      shipmentId: ship.id
    });

    loadAllData();
    triggerToast(`🎉 Auto-Assigned Shelf ${res.shelfCode}! Assigned ${res.skuAssigned} · Shelved at Shivam Bungalows 1, Koteshwar Road · Now LIVE on Platform & App!`);
  };

  const handleConfirmInward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductToInward) return;

    const res = adminInwardProduct({
      productId: selectedProductToInward.id,
      sku: inwardSku.trim().toUpperCase(),
      unitsReceived: Number(inwardUnits) || 20,
      shelfLocation: {
        zone: selectedZone,
        rack: selectedRack,
        shelf: selectedShelf,
        bin: selectedBin
      },
      verifiedBy: 'Harshil M. (Ahmedabad Hub Ops)',
      shipmentId: associatedShipment?.id
    });

    setInwardModalOpen(false);
    loadAllData();
    triggerToast(`🎉 Verified & Placed on Shelf ${res.shelfCode}! Assigned ${res.skuAssigned} · Stored at Shivam Bungalows 1, Koteshwar Road · Now LIVE on Platform & App!`);
  };

  const handleOrderAction = (orderId: string, newStatus: TrialOrder['status']) => {
    const res = updateTrialOrderStatus(orderId, newStatus);
    if (res) {
      loadAllData();
      if (newStatus === 'Kept on Spot (Purchased)') {
        triggerToast(`🎉 Order ${res.orderNumber} kept on spot! Payment confirmed & credited to ${res.brandName} payout.`);
      } else if (newStatus === 'Returned on Spot (Runner Heading to Hub)') {
        triggerToast(`↩ Customer returned items to runner at door. Runner riding straight back to Ahmedabad Hub!`);
      } else if (newStatus === 'Restocked to Warehouse Shelf') {
        triggerToast(`✓ Restocked to shelf ${res.shelfLocation}! Client refunded instantly via UPI.`);
      } else {
        triggerToast(`Order status updated to: ${newStatus}`);
      }
    }
  };

  const handleAdjustStock = (productId: string, delta: number, prodName: string) => {
    const updated = adjustProductStock(productId, delta);
    if (updated) {
      loadAllData();
      triggerToast(`${delta > 0 ? '+1' : '-1'} Stock for ${prodName} (Now ${updated.inwardUnits} pcs on shelf)`);
    }
  };

  const handleOpenBarcodeModal = (prod: DarkstoreProduct) => {
    setSelectedProductForBarcode(prod);
    setBarcodeModalOpen(true);
  };

  const filteredBrands = brands.filter(b => {
    if (brandFilter === 'waiting') return b.status === 'Waiting for Approval';
    if (brandFilter === 'approved') return b.status === 'Approved';
    return true;
  });

  const filteredProducts = products.filter(p => {
    if (inventoryFilter === 'in_stock') {
      if ((p.inwardUnits || 0) <= 0) return false;
    } else if (inventoryFilter === 'low_stock') {
      if ((p.inwardUnits || 0) >= 5 || (p.inwardUnits || 0) === 0) return false;
    }

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.brandName.toLowerCase().includes(q) ||
      (p.sku && p.sku.toLowerCase().includes(q)) ||
      (p.warehouseLocation && p.warehouseLocation.code.toLowerCase().includes(q))
    );
  });

  return (
    <div className={styles.adminLayout}>
      {/* 1. DESKTOP LEFT SIDEBAR NAVIGATION */}
      <aside className={styles.desktopSidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.brandLogoRow}>
            <img src="/drobe-logo.png" alt="Drobe" className={styles.brandLogoImg} />
            <span className={styles.brandLogoText}>DROBE</span>
            <span className={styles.opsTag}>DARKSTORE</span>
          </div>

          <div className={styles.hubLocationCard}>
            <div className={styles.hubLocationName}>
              <Building2 size={13} color="#0284c7" />
              <span>{AHMEDABAD_WAREHOUSE.code}</span>
            </div>
            <div className={styles.hubLocationAddr}>
              Shivam Bungalows 1, Koteshwar Road, Ahmedabad
            </div>
          </div>
        </div>

        <nav className={styles.sidebarNav}>
          <div className={styles.sidebarSectionTitle}>
            Warehouse Operations
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('inwarding')}
            className={`${styles.sidebarNavItem} ${activeTab === 'inwarding' ? styles.sidebarNavItemActive : ''}`}
          >
            <div className={styles.navItemLeft}>
              <Boxes size={16} />
              <span>Stock Inwarding</span>
            </div>
            {pendingInwardsCount > 0 && (
              <span className={`${styles.badgePill} ${styles.badgeOrange}`}>{pendingInwardsCount}</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('inventory')}
            className={`${styles.sidebarNavItem} ${activeTab === 'inventory' ? styles.sidebarNavItemActive : ''}`}
          >
            <div className={styles.navItemLeft}>
              <Barcode size={16} />
              <span>SKU Inventory & Labels</span>
            </div>
            <span className={`${styles.badgePill} ${styles.badgeGreen}`}>{liveSkusCount} Live</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('shelves')}
            className={`${styles.sidebarNavItem} ${activeTab === 'shelves' ? styles.sidebarNavItemActive : ''}`}
          >
            <div className={styles.navItemLeft}>
              <Layers size={16} />
              <span>Darkstore Floor Plan</span>
            </div>
            <span className={`${styles.badgePill} ${styles.badgeBlue}`}>6 Racks</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('approvals')}
            className={`${styles.sidebarNavItem} ${activeTab === 'approvals' ? styles.sidebarNavItemActive : ''}`}
          >
            <div className={styles.navItemLeft}>
              <UserCheck size={16} />
              <span>Brand Approvals</span>
            </div>
            {waitingBrandsCount > 0 && (
              <span className={`${styles.badgePill} ${styles.badgeOrange}`}>{waitingBrandsCount}</span>
            )}
          </button>

          <div className={styles.sidebarSectionTitle} style={{ marginTop: '12px' }}>
            Quick-Commerce Dispatch
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('trials')}
            className={`${styles.sidebarNavItem} ${activeTab === 'trials' ? styles.sidebarNavItemActive : ''}`}
          >
            <div className={styles.navItemLeft}>
              <Truck size={16} />
              <span>Doorstep Trials & Returns</span>
            </div>
            {activeTrialsCount > 0 && (
              <span className={`${styles.badgePill} ${styles.badgeGreen}`}>{activeTrialsCount} live</span>
            )}
          </button>

          <Link
            href="/order-portal"
            target="_blank"
            className={styles.sidebarNavItem}
            style={{ textDecoration: 'none', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)' }}
          >
            <div className={styles.navItemLeft}>
              <Activity size={16} color="#d97706" />
              <span style={{ color: '#d97706', fontWeight: 700 }}>Hub Order Portal</span>
            </div>
            <ExternalLink size={12} color="#d97706" />
          </Link>

          <Link
            href="/delivery-partner"
            target="_blank"
            className={styles.sidebarNavItem}
            style={{ textDecoration: 'none', background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.25)' }}
          >
            <div className={styles.navItemLeft}>
              <Navigation size={16} color="#2563eb" />
              <span style={{ color: '#2563eb', fontWeight: 700 }}>Delivery Partner App</span>
            </div>
            <ExternalLink size={12} color="#2563eb" />
          </Link>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.hubStatusPill}>
            <span className={styles.livePulseDot} />
            <span>30-Min Network Live</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <Link href="/order-portal" target="_blank" className={styles.switchBrandLink} style={{ background: '#fef3c7', borderColor: '#fde68a' }}>
              <Package size={13} color="#d97706" />
              <span style={{ color: '#92400e', fontWeight: 700 }}>Open Hub Order Portal</span>
              <ExternalLink size={11} color="#d97706" />
            </Link>

            <Link href="/delivery-partner" target="_blank" className={styles.switchBrandLink} style={{ background: '#eff6ff', borderColor: '#bfdbfe' }}>
              <Truck size={13} color="#2563eb" />
              <span style={{ color: '#1e40af', fontWeight: 700 }}>Open Delivery App</span>
              <ExternalLink size={11} color="#2563eb" />
            </Link>

            <Link href="/brand-dashboard" target="_blank" className={styles.switchBrandLink}>
              <Store size={13} />
              <span>Open Brand Portal</span>
              <ExternalLink size={11} color="#64748b" />
            </Link>
          </div>
        </div>
      </aside>

      {/* 2. DESKTOP MAIN CONTENT WRAPPER */}
      <div className={styles.mainWrapper}>
        {/* DESKTOP STICKY TOPBAR */}
        <header className={styles.desktopTopbar}>
          <div className={styles.topbarLeft}>
            <div>
              <h2 className={styles.topbarTitle}>
                {activeTab === 'inwarding' && 'Stock Inwarding & Physical Shelf Allocation'}
                {activeTab === 'inventory' && 'Darkstore SKU Matrix & Barcode Label Station'}
                {activeTab === 'approvals' && 'Brand Partner Approvals & Verification'}
                {activeTab === 'shelves' && 'Ahmedabad Warehouse Floor Plan & Rack Matrix'}
                {activeTab === 'trials' && 'Doorstep Fitting & Instant Return Room'}
              </h2>
              <div className={styles.topbarBreadcrumb}>
                <span>Ahmedabad Darkstore Hub #01</span>
                <span>/</span>
                <span style={{ color: '#0f172a', fontWeight: 600 }}>
                  {activeTab === 'trials' ? 'Doorstep Fittings & Returns' : (activeTab.charAt(0).toUpperCase() + activeTab.slice(1))}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.topbarRight}>
            <div className={styles.topbarSearchWrap}>
              <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search SKU (DR1), Brand, Rack..."
                className={styles.topbarSearchInput}
              />
            </div>

            <Link
              href="/order-portal"
              target="_blank"
              style={{
                textDecoration: 'none',
                background: '#fef3c7',
                border: '1px solid #fde68a',
                color: '#92400e',
                fontWeight: 700,
                fontSize: '12px',
                padding: '7px 11px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <span>⚡</span>
              <span>Hub Order Portal</span>
            </Link>

            <Link
              href="/delivery-partner"
              target="_blank"
              style={{
                textDecoration: 'none',
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                color: '#1e40af',
                fontWeight: 700,
                fontSize: '12px',
                padding: '7px 11px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <span>🛵</span>
              <span>Delivery App</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                const pending = products.find(p => p.inwardStatus !== 'Inwarded & Live') || products[0];
                handleOpenInwardModal(pending);
              }}
              className={styles.btnPrimary}
              style={{ padding: '8px 14px', fontSize: '12px', gap: '6px' }}
            >
              <Boxes size={14} /> + Inward Stock
            </button>

            <div className={styles.telemetryTag} style={{ background: '#ecfdf5', borderColor: '#a7f3d0', color: '#047857' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
              <span>Supabase Cloud Synced</span>
            </div>

            <div className={styles.telemetryTag}>
              <Activity size={13} color="#16a34a" />
              <span>18 Runners Active · Koteshwar</span>
            </div>
          </div>
        </header>

        {/* DESKTOP MAIN CANVAS */}
        <main className={styles.desktopContent}>
          {/* KPI STATS TILES (LIGHT THEME) */}
          <div className={styles.kpiGrid}>
            <div className={styles.kpiCard}>
              <div>
                <div className={styles.kpiLabel}>Brands Awaiting Approval</div>
                <div className={styles.kpiVal} style={{ color: waitingBrandsCount > 0 ? '#d97706' : '#0f172a' }}>
                  {waitingBrandsCount}
                </div>
                <div className={styles.kpiSub}>{approvedBrandsCount} approved & listed</div>
              </div>
              <div className={styles.kpiIconWrap} style={{ background: '#fef3c7', color: '#d97706' }}>
                <UserCheck size={22} />
              </div>
            </div>

            <div className={styles.kpiCard}>
              <div>
                <div className={styles.kpiLabel}>Parcels to Inward</div>
                <div className={styles.kpiVal} style={{ color: pendingInwardsCount > 0 ? '#0284c7' : '#0f172a' }}>
                  {pendingInwardsCount}
                </div>
                <div className={styles.kpiSub}>Inspect & assign shelf</div>
              </div>
              <div className={styles.kpiIconWrap} style={{ background: '#e0f2fe', color: '#0284c7' }}>
                <Boxes size={22} />
              </div>
            </div>

            <div className={styles.kpiCard}>
              <div>
                <div className={styles.kpiLabel}>Live SKUs on Shelves</div>
                <div className={styles.kpiVal} style={{ color: '#16a34a' }}>
                  {liveSkusCount}
                </div>
                <div className={styles.kpiSub}>Assigned DR1, DR2... on racks</div>
              </div>
              <div className={styles.kpiIconWrap} style={{ background: '#dcfce7', color: '#16a34a' }}>
                <Barcode size={22} />
              </div>
            </div>

            <div className={styles.kpiCard}>
              <div>
                <div className={styles.kpiLabel}>Active Doorstep Trials</div>
                <div className={styles.kpiVal} style={{ color: '#7e22ce' }}>
                  {activeTrialsCount}
                </div>
                <div className={styles.kpiSub}>Runner waiting at door · On-spot return</div>
              </div>
              <div className={styles.kpiIconWrap} style={{ background: '#f3e8ff', color: '#7e22ce' }}>
                <Truck size={22} />
              </div>
            </div>
          </div>

          {/* HUB TELEMETRY RIBBON */}
          <div className={styles.hubRibbon}>
            <div className={styles.hubRibbonLeft}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className={styles.hubStatusLiveDot} />
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a' }}>
                  Koteshwar Hub #01 Online
                </span>
                <span style={{ fontSize: '11px', color: '#64748b' }}>· Express 30-Min Radius Active</span>
              </div>

              <div style={{ width: '1px', height: '20px', background: '#e2e8f0' }} />

              <div className={styles.hubMetricItem}>
                <span className={styles.hubMetricLabel}>Shelf Capacity</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className={styles.hubMetricVal}>34 / 96 Shelves</span>
                  <div className={styles.capacityProgressBar}>
                    <div className={styles.capacityProgressFill} style={{ width: '35%' }} />
                  </div>
                  <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 700 }}>35%</span>
                </div>
              </div>

              <div style={{ width: '1px', height: '20px', background: '#e2e8f0' }} />

              <div className={styles.hubMetricItem}>
                <span className={styles.hubMetricLabel}>Live Consignment Value</span>
                <span className={styles.hubMetricVal} style={{ color: '#0284c7' }}>₹12,48,500</span>
              </div>

              <div style={{ width: '1px', height: '20px', background: '#e2e8f0' }} />

              <div className={styles.hubMetricItem}>
                <span className={styles.hubMetricLabel}>30-Min SLA Rate</span>
                <span className={styles.hubMetricVal} style={{ color: '#16a34a' }}>98.6%</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setActiveTab('inventory')}
                className={styles.btnSecondary}
                style={{ padding: '6px 12px', fontSize: '11.5px', gap: '5px' }}
              >
                <Barcode size={13} /> View Barcode Matrix
              </button>
            </div>
          </div>

          {/* TAB 1: STOCK INWARDING & PHYSICAL SHELF ALLOCATION */}
          {activeTab === 'inwarding' && (
            <div>
              {/* Inbound Parcels from Brands */}
              <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <div>
                    <h3 className={styles.sectionTitle}>
                      <Truck size={17} color="#0284c7" />
                      Inbound Consignments Sent by Brands
                    </h3>
                    <p className={styles.sectionDesc}>
                      Physical parcels arriving at Ahmedabad Darkstore Hub #01 (Shivam Bungalows 1, Koteshwar Road). Verify parcel count and allocate shelf to publish live.
                    </p>
                  </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table className={styles.lightTable}>
                    <thead>
                      <tr>
                        <th>Consignment ID</th>
                        <th>Brand Name</th>
                        <th>Creation</th>
                        <th>Units</th>
                        <th>Logistics / Courier</th>
                        <th>Dispatched</th>
                        <th>Hub Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inbounds.map((ship) => {
                        const relatedProduct = products.find(p => p.id === ship.productId || p.name === ship.productName);
                        const isVerified = ship.status === 'Verified & Shelved';

                        return (
                          <tr key={ship.id}>
                            <td style={{ fontWeight: 800, color: '#0284c7' }}>{ship.id}</td>
                            <td style={{ fontWeight: 700 }}>{ship.brandName}</td>
                            <td style={{ fontWeight: 600 }}>{ship.productName}</td>
                            <td>
                              <span style={{ fontWeight: 800, color: '#0f172a' }}>{ship.units} pcs</span>
                            </td>
                            <td>
                              <div style={{ fontWeight: 600 }}>{ship.courierPartner}</div>
                              <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#64748b' }}>{ship.trackingNumber}</div>
                            </td>
                            <td>{ship.dispatchDate}</td>
                            <td>
                              {isVerified ? (
                                <span className={`${styles.statusChip} ${styles.statusLive}`}>
                                  <CheckCircle2 size={11} /> Shelved ({ship.assignedSku})
                                </span>
                              ) : (
                                <span className={`${styles.statusChip} ${styles.statusTransit}`}>
                                  <Clock size={11} /> {ship.status}
                                </span>
                              )}
                            </td>
                            <td>
                              {isVerified ? (
                                <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <Check size={13} /> {ship.assignedShelf}
                                </span>
                              ) : (
                                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                                  {ship.status === 'In Transit' && (
                                    <button
                                      type="button"
                                      onClick={() => handleMarkArrived(ship.id, ship.productName)}
                                      className={styles.btnSecondary}
                                      style={{ padding: '5px 8px', fontSize: '11px', gap: '4px' }}
                                      title="Mark arrived at Shivam Bungalows 1, Koteshwar Road"
                                    >
                                      <Building2 size={12} color="#0284c7" /> Mark Arrived
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleDirectAutoInward(ship, relatedProduct)}
                                    className={styles.btnSuccess}
                                    style={{ padding: '5px 9px', fontSize: '11px', gap: '4px', fontWeight: 700 }}
                                    title="Automatically assign next available shelf and publish live"
                                  >
                                    <Sparkles size={12} /> Auto-Assign Shelf & Live
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenInwardModal(relatedProduct || {
                                      id: ship.productId,
                                      name: ship.productName,
                                      brandId: ship.brandId,
                                      brandName: ship.brandName,
                                      price: '₹1200',
                                      inventory: ship.units,
                                      inwardUnits: 0,
                                      unitsInTrial: 0,
                                      unitsSold: 0,
                                      images: [],
                                      inwardStatus: 'Received & Verifying at Hub',
                                      isLive: false
                                    }, ship)}
                                    className={styles.btnSecondary}
                                    style={{ padding: '5px 8px', fontSize: '11px', gap: '4px' }}
                                    title="Open shelf allocation details"
                                  >
                                    <CheckCircle2 size={12} /> Inspect
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Unverified Creations Awaiting Stock Arrival */}
              <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <div>
                    <h3 className={styles.sectionTitle}>
                      <Boxes size={17} color="#0284c7" />
                      Products Awaiting Stock Inwarding
                    </h3>
                    <p className={styles.sectionDesc}>
                      Creations added by listed brands. Once physical pieces are verified at Ahmedabad Darkstore, assign sequential SKU (DR1, DR2...) and shelf location.
                    </p>
                  </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table className={styles.lightTable}>
                    <thead>
                      <tr>
                        <th>Product & Photos</th>
                        <th>Brand Name</th>
                        <th>Price & Sizing</th>
                        <th>Inward Status</th>
                        <th>Assigned SKU</th>
                        <th>Stored Warehouse Shelf</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((prod) => {
                        const isLive = prod.isLive;

                        return (
                          <tr key={prod.id}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                {prod.images && prod.images[0] ? (
                                  <img
                                    src={prod.images[0]}
                                    alt={prod.name}
                                    style={{ width: '44px', height: '44px', borderRadius: '10px', objectFit: 'cover', border: '1px solid #e2e8f0' }}
                                  />
                                ) : (
                                  <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                                    <Package size={20} />
                                  </div>
                                )}
                                <div>
                                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{prod.name}</div>
                                  <div style={{ fontSize: '11px', color: '#64748b' }}>{prod.tagline || 'Signature Brand Item'}</div>
                                </div>
                              </div>
                            </td>
                            <td style={{ fontWeight: 600 }}>{prod.brandName}</td>
                            <td>
                              <div style={{ fontWeight: 800, color: '#0284c7' }}>{prod.price}</div>
                              <div style={{ fontSize: '11px', color: '#64748b' }}>Size: {prod.volume || 'Standard'}</div>
                            </td>
                            <td>
                              {isLive ? (
                                <span className={`${styles.statusChip} ${styles.statusLive}`}>
                                  <CheckCircle2 size={11} /> Live ({prod.inwardUnits} units)
                                </span>
                              ) : (
                                <span className={`${styles.statusChip} ${styles.statusTransit}`}>
                                  <Clock size={11} /> {prod.inwardStatus}
                                </span>
                              )}
                            </td>
                            <td>
                              {prod.sku ? (
                                <span style={{ fontWeight: 800, color: '#16a34a', background: '#dcfce7', padding: '3px 8px', borderRadius: '6px', fontSize: '12px' }}>
                                  {prod.sku}
                                </span>
                              ) : (
                                <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>Pending Inward</span>
                              )}
                            </td>
                            <td>
                              {prod.warehouseLocation ? (
                                <div>
                                  <span style={{ fontWeight: 700, color: '#0284c7', fontSize: '12px' }}>
                                    {prod.warehouseLocation.code}
                                  </span>
                                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                                    {prod.warehouseLocation.rack} · {prod.warehouseLocation.shelf}
                                  </div>
                                </div>
                              ) : (
                                <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>Not on shelf yet</span>
                              )}
                            </td>
                            <td>
                              {isLive ? (
                                <button
                                  type="button"
                                  onClick={() => handleOpenInwardModal(prod)}
                                  className={styles.btnSecondary}
                                >
                                  Edit Shelf
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleOpenInwardModal(prod)}
                                  className={styles.btnSuccess}
                                >
                                  <CheckCircle2 size={13} /> Verify & Assign Shelf
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LIVE DARKSTORE SKU INVENTORY MATRIX & BARCODE STATION */}
          {activeTab === 'inventory' && (
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <div>
                  <h3 className={styles.sectionTitle}>
                    <Barcode size={17} color="#0284c7" />
                    Ahmedabad Darkstore SKU Inventory & Barcode Station
                  </h3>
                  <p className={styles.sectionDesc}>
                    Live physical stock stationed on SG Highway darkstore racks. Manage sequential SKUs (DR1, DR2...), print thermal barcodes for runner bags, and adjust shelf stock in real-time.
                  </p>
                </div>

                <div className={styles.filterPillGroup}>
                  <button
                    type="button"
                    onClick={() => setInventoryFilter('all')}
                    className={`${styles.filterPill} ${inventoryFilter === 'all' ? styles.filterPillActive : ''}`}
                  >
                    All SKUs ({products.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setInventoryFilter('in_stock')}
                    className={`${styles.filterPill} ${inventoryFilter === 'in_stock' ? styles.filterPillActive : ''}`}
                  >
                    In Stock ({products.filter(p => (p.inwardUnits || 0) > 0).length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setInventoryFilter('low_stock')}
                    className={`${styles.filterPill} ${inventoryFilter === 'low_stock' ? styles.filterPillActive : ''}`}
                  >
                    Low Stock &lt; 5 pcs ({products.filter(p => (p.inwardUnits || 0) < 5 && (p.inwardUnits || 0) > 0).length})
                  </button>
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table className={styles.lightTable}>
                  <thead>
                    <tr>
                      <th>Sequential SKU</th>
                      <th>Product Creation</th>
                      <th>Brand Partner</th>
                      <th>Warehouse Location</th>
                      <th>Stock on Shelf</th>
                      <th>Doorstep Trials</th>
                      <th>Units Sold</th>
                      <th>Barcode & Label</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((prod) => {
                      const isLive = prod.inwardStatus === 'Inwarded & Live' || Boolean(prod.sku);
                      const isLowStock = (prod.inwardUnits || 0) < 5 && (prod.inwardUnits || 0) > 0;

                      return (
                        <tr key={prod.id}>
                          <td>
                            {prod.sku ? (
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                                <span style={{ fontWeight: 900, color: '#16a34a', background: '#dcfce7', padding: '4px 10px', borderRadius: '8px', fontSize: '13px', letterSpacing: '0.04em' }}>
                                  {prod.sku}
                                </span>
                              </div>
                            ) : (
                              <span style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic' }}>Pending SKU</span>
                            )}
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              {prod.images && prod.images[0] ? (
                                <img
                                  src={prod.images[0]}
                                  alt={prod.name}
                                  style={{ width: '42px', height: '42px', borderRadius: '10px', objectFit: 'cover', border: '1px solid #e2e8f0' }}
                                />
                              ) : (
                                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <Package size={18} color="#94a3b8" />
                                </div>
                              )}
                              <div>
                                <div style={{ fontWeight: 800, color: '#0f172a' }}>{prod.name}</div>
                                <div style={{ fontSize: '11px', color: '#64748b' }}>
                                  Size: {prod.volume || 'Standard'} · {prod.price}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td style={{ fontWeight: 700, color: '#334155' }}>
                            {prod.brandName}
                          </td>
                          <td>
                            {prod.warehouseLocation ? (
                              <div>
                                <div style={{ fontWeight: 800, color: '#0284c7', fontSize: '12px', letterSpacing: '0.03em' }}>
                                  {prod.warehouseLocation.code}
                                </div>
                                <div style={{ fontSize: '11px', color: '#64748b' }}>
                                  {prod.warehouseLocation.rack} · {prod.warehouseLocation.shelf} · {prod.warehouseLocation.bin}
                                </div>
                              </div>
                            ) : (
                              <span style={{ fontSize: '11px', color: '#94a3b8' }}>Unallocated</span>
                            )}
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div className={styles.stockAdjustWrap}>
                                <button
                                  type="button"
                                  onClick={() => handleAdjustStock(prod.id, -1, prod.name)}
                                  className={styles.stockAdjustBtn}
                                  title="Reduce 1 unit (shelf audit)"
                                >
                                  -
                                </button>
                                <span className={styles.stockAdjustCount}>
                                  {prod.inwardUnits || 0}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleAdjustStock(prod.id, 1, prod.name)}
                                  className={styles.stockAdjustBtn}
                                  title="Add 1 unit to shelf"
                                >
                                  +
                                </button>
                              </div>
                              {isLowStock && (
                                <span style={{ fontSize: '10px', color: '#b45309', background: '#fef3c7', padding: '2px 6px', borderRadius: '6px', fontWeight: 700 }}>
                                  Low
                                </span>
                              )}
                            </div>
                          </td>
                          <td>
                            <span style={{ fontWeight: 700, color: prod.unitsInTrial ? '#7e22ce' : '#64748b', background: prod.unitsInTrial ? '#f3e8ff' : '#f8fafc', padding: '3px 8px', borderRadius: '6px', fontSize: '11.5px' }}>
                              {prod.unitsInTrial || 0} in trial
                            </span>
                          </td>
                          <td>
                            <span style={{ fontWeight: 800, color: '#16a34a', fontSize: '12px' }}>
                              {prod.unitsSold || 0} sold
                            </span>
                          </td>
                          <td>
                            <button
                              type="button"
                              onClick={() => handleOpenBarcodeModal(prod)}
                              className={styles.btnSecondary}
                              style={{ padding: '6px 10px', fontSize: '11.5px', gap: '5px' }}
                              title="Generate and print thermal barcode sticker"
                            >
                              <Barcode size={13} color="#0284c7" /> Print Label
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: BRAND APPROVALS */}
          {activeTab === 'approvals' && (
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <div>
                  <h3 className={styles.sectionTitle}>
                    <UserCheck size={17} color="#0284c7" />
                    Brand Applications & Verification
                  </h3>
                  <p className={styles.sectionDesc}>
                    Review newly submitted brand registrations. Once approved, the brand is listed on Drobe and authorized to dispatch physical inventory to the Ahmedabad hub.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setBrandFilter('all')}
                    className={brandFilter === 'all' ? styles.btnPrimary : styles.btnSecondary}
                  >
                    All Brands ({brands.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setBrandFilter('waiting')}
                    className={brandFilter === 'waiting' ? styles.btnPrimary : styles.btnSecondary}
                  >
                    Waiting Approval ({waitingBrandsCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setBrandFilter('approved')}
                    className={brandFilter === 'approved' ? styles.btnPrimary : styles.btnSecondary}
                  >
                    Approved & Listed ({approvedBrandsCount})
                  </button>
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table className={styles.lightTable}>
                  <thead>
                    <tr>
                      <th>Brand Name</th>
                      <th>Category</th>
                      <th>Founder & Contact</th>
                      <th>Application Date</th>
                      <th>Inventory Overview</th>
                      <th>Approval Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBrands.map((brand) => {
                      const isApproved = brand.status === 'Approved';
                      const isWaiting = brand.status === 'Waiting for Approval';

                      return (
                        <tr key={brand.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              {brand.profileImage ? (
                                <img
                                  src={brand.profileImage}
                                  alt={brand.name}
                                  style={{ width: '44px', height: '44px', borderRadius: '12px', objectFit: 'cover', border: '1px solid #e2e8f0' }}
                                />
                              ) : (
                                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                                  {brand.name.slice(0, 1)}
                                </div>
                              )}
                              <div>
                                <div style={{ fontWeight: 800, color: '#0f172a' }}>{brand.name}</div>
                                <div style={{ fontSize: '11px', color: '#64748b' }}>{brand.basedOutOf}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '3px 9px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 600 }}>
                              {brand.category}
                            </span>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{brand.founderName}</div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>{brand.email}</div>
                          </td>
                          <td>{brand.appliedDate}</td>
                          <td>
                            <div style={{ fontSize: '12px', fontWeight: 700 }}>{brand.totalProductsCount} creations listed</div>
                            <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: 600 }}>{brand.inwardedUnitsCount} pcs stored in Ahmedabad hub</div>
                          </td>
                          <td>
                            {isApproved ? (
                              <span className={`${styles.statusChip} ${styles.statusLive}`}>
                                <CheckCircle2 size={11} /> Approved & Listed
                              </span>
                            ) : isWaiting ? (
                              <span className={`${styles.statusChip} ${styles.statusTransit}`}>
                                <Clock size={11} /> Waiting for Approval
                              </span>
                            ) : (
                              <span className={`${styles.statusChip} ${styles.statusPending}`}>
                                <AlertCircle size={11} /> {brand.status}
                              </span>
                            )}
                          </td>
                          <td>
                            {isWaiting ? (
                              <div style={{ display: 'flex', gap: '6px' }}>
                                <button
                                  type="button"
                                  onClick={() => handleApproveBrand(brand.id, brand.name)}
                                  className={styles.btnSuccess}
                                >
                                  <Check size={12} /> Approve Brand
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRejectBrand(brand.id, brand.name)}
                                  className={styles.btnDanger}
                                >
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                                Approved on {brand.approvedDate || 'Active'}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: WAREHOUSE FLOOR PLAN & SHELF MATRIX */}
          {activeTab === 'shelves' && (
            <div>
              <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <div>
                    <h3 className={styles.sectionTitle}>
                      <Layers size={17} color="#0284c7" />
                      Ahmedabad Central Darkstore Floor Plan & Shelf Matrix
                    </h3>
                    <p className={styles.sectionDesc}>
                      Visual matrix of designated racks at SG Highway Hub. Darkstore runners can pinpoint exact shelves for 30-minute rapid pick-and-pack.
                    </p>
                  </div>
                </div>

                <div className={styles.floorGrid}>
                  {['Rack A-01', 'Rack A-02', 'Rack A-03', 'Rack B-01', 'Rack B-02', 'Rack C-01'].map((rackId, rIdx) => {
                    const rackProducts = filteredProducts.filter(p => p.warehouseLocation?.rack === rackId);

                    return (
                      <div key={rIdx} className={styles.rackCard}>
                        <div className={styles.rackHeader}>
                          <div>
                            <span className={styles.rackBadge}>{rackId}</span>
                            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                              {rackId.startsWith('Rack A') ? 'Zone A · Outerwear & Jackets' : rackId.startsWith('Rack B') ? 'Zone B · Tops & Tees' : 'Zone C · Bottoms & Denims'}
                            </div>
                          </div>
                          <span style={{ fontSize: '11.5px', fontWeight: 700, color: rackProducts.length > 0 ? '#16a34a' : '#94a3b8' }}>
                            {rackProducts.length} Assigned
                          </span>
                        </div>

                        {rackProducts.length > 0 ? (
                          <div>
                            {rackProducts.map((p) => (
                              <div key={p.id} className={styles.shelfRow}>
                                <div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ fontWeight: 800, color: '#16a34a', fontSize: '11.5px' }}>{p.sku}</span>
                                    <span style={{ fontWeight: 700, fontSize: '12.5px', color: '#0f172a' }}>{p.name}</span>
                                  </div>
                                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                                    {p.brandName} · {p.warehouseLocation?.shelf} · {p.warehouseLocation?.bin}
                                  </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#0284c7' }}>
                                    {p.inwardUnits} pcs
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenBarcodeModal(p)}
                                    style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '3px 6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                    title="View Barcode"
                                  >
                                    <Barcode size={12} color="#0284c7" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div style={{ textAlign: 'center', padding: '24px 0', color: '#94a3b8', fontSize: '12px', border: '1px dashed #cbd5e1', borderRadius: '10px' }}>
                            Empty Rack Tier Available
                          </div>
                        )}

                        {/* Interactive Bin Slots (Visual Darkstore Matrix) */}
                        <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, letterSpacing: '0.05em' }}>
                              Physical Shelf Slots
                            </span>
                            <span style={{ fontSize: '10.5px', color: '#0284c7', fontWeight: 600 }}>
                              {rackProducts.length} occupied · {8 - rackProducts.length} free
                            </span>
                          </div>

                          <div className={styles.binGrid}>
                            {Array.from({ length: 8 }).map((_, bIdx) => {
                              const binName = bIdx < 9 ? `Bin 0${bIdx + 1}` : `Bin ${bIdx + 1}`;
                              const occupant = rackProducts.find(p => p.warehouseLocation?.bin === binName);
                              return (
                                <div
                                  key={bIdx}
                                  onClick={() => {
                                    if (occupant) {
                                      handleOpenBarcodeModal(occupant);
                                    } else {
                                      const unassigned = products.find(p => !p.warehouseLocation) || products[0];
                                      setSelectedRack(rackId);
                                      setSelectedBin(binName);
                                      handleOpenInwardModal(unassigned);
                                    }
                                  }}
                                  className={`${styles.binSlot} ${occupant ? styles.binSlotOccupied : ''}`}
                                  title={occupant ? `${occupant.sku}: ${occupant.name} (${occupant.inwardUnits} pcs) · Click for Barcode` : `Empty slot ${binName} · Click to allocate`}
                                >
                                  <div>{binName}</div>
                                  {occupant ? (
                                    <div style={{ fontWeight: 800, fontSize: '9.5px', color: '#047857', marginTop: '2px' }}>
                                      {occupant.sku}
                                    </div>
                                  ) : (
                                    <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: '2px' }}>
                                      Free
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DOORSTEP FITTING & INSTANT RETURN ROOM */}
          {activeTab === 'trials' && (
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <div>
                  <h3 className={styles.sectionTitle}>
                    <Truck size={17} color="#0284c7" />
                    Doorstep Fitting & Instant Return Room
                  </h3>
                  <p className={styles.sectionDesc}>
                    Quick-commerce consignment flow in Ahmedabad (Satellite, Prahlad Nagar, SG Highway, Bodakdev). Delivery runner arrives in 30 minutes and waits right outside the customer door. Customer tries on outfits, keeps what they love on the spot, and hands unpurchased garments back instantly to the runner. The runner returns straight to the darkstore shelf and customer is refunded immediately.
                  </p>
                </div>
              </div>

              {/* REAL-TIME DIVERTER & DISPATCH BAY CALLOUT */}
              <div style={{
                background: 'linear-gradient(90deg, rgba(245, 158, 11, 0.12), rgba(59, 130, 246, 0.12))',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '12px',
                padding: '12px 16px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '20px' }}>⚡</span>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                      Real-Time Order Inflow & Handover Active
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      Every customer order placed from the app diverts instantly to the dedicated Hub Fulfillment bay where shift executives mark shelf picking, assign delivery partners, and confirm physical handover.
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <Link
                    href="/order-portal"
                    target="_blank"
                    style={{
                      background: '#d97706',
                      color: '#fff',
                      padding: '7px 12px',
                      borderRadius: '8px',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <span>📦 Open Hub Order Portal</span>
                  </Link>

                  <Link
                    href="/delivery-partner"
                    target="_blank"
                    style={{
                      background: '#2563eb',
                      color: '#fff',
                      padding: '7px 12px',
                      borderRadius: '8px',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <span>🚴 Open Delivery Partner App</span>
                  </Link>
                </div>
              </div>

              <div className={styles.trialGrid}>
                {trialOrders.map((ord) => {
                  const isDoorstepFitting = ord.status === 'Doorstep Fitting (Runner Waiting Outside)';
                  const isOut = ord.status === 'Out for 30-Min Delivery';
                  const isKept = ord.status === 'Kept on Spot (Purchased)';
                  const isRunnerHeadingBack = ord.status === 'Returned on Spot (Runner Heading to Hub)';
                  const isRestocked = ord.status === 'Restocked to Warehouse Shelf';

                  return (
                    <div key={ord.id} className={styles.trialCard}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ fontWeight: 800, color: '#0284c7', fontSize: '13.5px' }}>
                          {ord.orderNumber}
                        </span>
                        {isDoorstepFitting ? (
                          <span className={`${styles.statusChip} ${styles.statusTrial}`}>
                            <Clock size={11} /> Runner Waiting Outside ({ord.doorstepTimerMinutesLeft || 7}m fitting window)
                          </span>
                        ) : isOut ? (
                          <span className={`${styles.statusChip} ${styles.statusTransit}`}>
                            <Truck size={11} /> Out for 30-Min Delivery
                          </span>
                        ) : isKept ? (
                          <span className={`${styles.statusChip} ${styles.statusLive}`}>
                            <CheckCircle2 size={11} /> Kept on Spot (Purchased)
                          </span>
                        ) : isRunnerHeadingBack ? (
                          <span className={`${styles.statusChip} ${styles.statusPending}`}>
                            <RotateCcw size={11} /> Returned at Door · Runner Heading to Hub
                          </span>
                        ) : (
                          <span className={`${styles.statusChip} ${styles.statusLive}`} style={{ background: '#ecfdf5', color: '#059669', borderColor: '#a7f3d0' }}>
                            <CheckCircle2 size={11} /> Restocked to Shelf & Refunded
                          </span>
                        )}
                      </div>

                      <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '12px', marginBottom: '14px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: '13.5px', color: '#0f172a' }}>
                              {ord.productName} ({ord.size})
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>
                              Brand: <strong>{ord.brandName}</strong> · SKU: <strong style={{ color: '#16a34a' }}>{ord.productSku}</strong>
                            </div>
                          </div>
                          <div style={{ fontWeight: 800, color: '#0284c7', fontSize: '13.5px' }}>
                            {ord.price}
                          </div>
                        </div>

                        <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e2e8f0', fontSize: '11.5px', color: '#334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>📍 Darkstore Shelf: <strong style={{ color: '#0284c7' }}>{ord.shelfLocation}</strong></span>
                          {ord.instantRefundStatus && (
                            <span style={{ color: '#059669', fontWeight: 700, fontSize: '10.5px', background: '#ecfdf5', padding: '2px 8px', borderRadius: '6px' }}>
                              ⚡ {ord.instantRefundStatus}
                            </span>
                          )}
                        </div>
                      </div>

                      <div style={{ fontSize: '11.5px', color: '#64748b', marginBottom: '12px', lineHeight: 1.5 }}>
                        <div><strong>Client:</strong> {ord.customerName} ({ord.distanceKm} from hub)</div>
                        <div style={{ color: '#475569' }}>{ord.customerAddress}</div>
                        <div style={{ marginTop: '4px' }}><strong>Runner:</strong> {ord.riderName} ({ord.riderPhone})</div>
                      </div>

                      {ord.notes && (
                        <div style={{ fontSize: '11px', color: '#475569', background: '#f1f5f9', padding: '8px 10px', borderRadius: '8px', marginBottom: '12px', borderLeft: '3px solid #0284c7' }}>
                          {ord.notes}
                        </div>
                      )}

                      {/* SIMULATION ACTION BUTTONS */}
                      {(isDoorstepFitting || isOut) && (
                        <div style={{ display: 'flex', gap: '8px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                          <button
                            type="button"
                            onClick={() => handleOrderAction(ord.id, 'Kept on Spot (Purchased)')}
                            className={styles.btnSuccess}
                            style={{ flex: 1, justifyContent: 'center' }}
                            title="Client tries on and keeps garment on the spot"
                          >
                            <Check size={12} /> Kept on Spot
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOrderAction(ord.id, 'Returned on Spot (Runner Heading to Hub)')}
                            className={styles.btnDanger}
                            style={{ flex: 1, justifyContent: 'center' }}
                            title="Client hands back instantly to runner waiting outside"
                          >
                            <RotateCcw size={12} /> Return to Runner
                          </button>
                        </div>
                      )}

                      {isRunnerHeadingBack && (
                        <div style={{ paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                          <button
                            type="button"
                            onClick={() => handleOrderAction(ord.id, 'Restocked to Warehouse Shelf')}
                            className={styles.btnPrimary}
                            style={{ width: '100%', justifyContent: 'center' }}
                          >
                            <CheckCircle2 size={13} /> Runner Reached Hub · Restock to {ord.shelfLocation}
                          </button>
                        </div>
                      )}

                      {isKept && (
                        <div style={{ fontSize: '11.5px', color: '#16a34a', fontWeight: 700 }}>
                          ✓ Doorstep fit approved · Kept on spot by client · Credited to {ord.brandName}
                        </div>
                      )}

                      {isRestocked && (
                        <div style={{ fontSize: '11.5px', color: '#059669', fontWeight: 700 }}>
                          ✓ Restocked to {ord.shelfLocation} · Client refunded instantly
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* 3. LIGHT THEME INWARDING & SHELF ALLOCATION MODAL */}
      {inwardModalOpen && selectedProductToInward && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <div>
                <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#0284c7', fontWeight: 800 }}>
                  AHMEDABAD DARKSTORE INWARDING
                </span>
                <h3 className={styles.modalTitle} style={{ marginTop: '4px' }}>
                  <Boxes size={18} color="#0284c7" /> Verify Stock & Allocate Warehouse Shelf
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInwardModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleConfirmInward}>
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {selectedProductToInward.images && selectedProductToInward.images[0] && (
                    <img
                      src={selectedProductToInward.images[0]}
                      alt=""
                      style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover', border: '1px solid #e2e8f0' }}
                    />
                  )}
                  <div>
                    <h4 style={{ margin: 0, fontSize: '14px', color: '#0f172a', fontWeight: 700 }}>
                      {selectedProductToInward.name}
                    </h4>
                    <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#64748b' }}>
                      Brand: <strong style={{ color: '#0284c7' }}>{selectedProductToInward.brandName}</strong> · Price: {selectedProductToInward.price}
                    </p>
                  </div>
                </div>
              </div>

              {/* SEQUENTIAL SKU GENERATOR */}
              <div className={styles.inputGroup}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label className={styles.inputLabel}>
                    Sequential Darkstore SKU * (DR1, DR2, DR3...)
                  </label>
                  <span style={{ fontSize: '10.5px', color: '#16a34a', fontWeight: 700 }}>
                    Auto-Calculated Next Serial
                  </span>
                </div>
                <input
                  type="text"
                  value={inwardSku}
                  onChange={(e) => setInwardSku(e.target.value)}
                  placeholder="e.g. DR1, DR2, DR3"
                  required
                  className={styles.inputField}
                  style={{ fontWeight: 800, color: '#16a34a', letterSpacing: '0.04em' }}
                />
                <div style={{ fontSize: '10.5px', color: '#64748b', marginTop: '4px' }}>
                  This unique SKU is printed on barcode labels for rapid 30-minute order scanning.
                </div>
              </div>

              {/* PHYSICAL UNITS RECEIVED */}
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>
                  Physical Pieces Received & Inspected *
                </label>
                <input
                  type="number"
                  min="1"
                  value={inwardUnits}
                  onChange={(e) => setInwardUnits(Number(e.target.value))}
                  required
                  className={styles.inputField}
                />
              </div>

              {/* WAREHOUSE SHELF MATRIX ALLOCATION */}
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', marginBottom: '16px' }}>
                {/* Auto-Assigned Shelf Banner */}
                <div style={{ background: '#f0fdf4', border: '1px solid #86efac', padding: '12px 14px', borderRadius: '12px', marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#166534', fontWeight: 800, letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Sparkles size={13} color="#16a34a" /> AUTOMATICALLY ALLOCATED NEXT SHELF
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: 900, color: '#15803d', letterSpacing: '0.04em', marginTop: '2px' }}>
                      AMD-{selectedRack.replace(/\s+/g, '').toUpperCase()}-{selectedShelf.replace(/\s+/g, '').toUpperCase()}-{selectedBin.replace(/\s+/g, '').toUpperCase()}
                    </div>
                    <div style={{ fontSize: '11px', color: '#166534', marginTop: '2px' }}>
                      Place parcel in: <strong>{selectedRack}</strong> · <strong>{selectedShelf}</strong> · <strong>{selectedBin}</strong> (Shivam Bungalows 1, Koteshwar Road)
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', background: '#ffffff', padding: '6px 10px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                    <span style={{ fontSize: '9.5px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Sequential SKU</span>
                    <div style={{ fontSize: '16px', fontWeight: 900, color: '#0284c7' }}>{inwardSku || 'DR1'}</div>
                  </div>
                </div>

                <div style={{ fontSize: '12px', fontWeight: 700, color: '#0284c7', marginBottom: '10px', textTransform: 'uppercase' }}>
                  📍 Physical Warehouse Placement (Shivam Bungalows 1, Koteshwar Road)
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Warehouse Zone</label>
                  <select
                    value={selectedZone}
                    onChange={(e) => setSelectedZone(e.target.value)}
                    className={styles.selectField}
                  >
                    <option value="Zone A - Outerwear & Heavy Silhouettes">Zone A - Outerwear & Heavy Silhouettes</option>
                    <option value="Zone B - Tops, Tees & Shirts">Zone B - Tops, Tees & Shirts</option>
                    <option value="Zone C - Bottoms & Denims">Zone C - Bottoms & Denims</option>
                    <option value="Zone D - Accessories & Footwear">Zone D - Accessories & Footwear</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <div>
                    <label className={styles.inputLabel}>Rack Number</label>
                    <select
                      value={selectedRack}
                      onChange={(e) => setSelectedRack(e.target.value)}
                      className={styles.selectField}
                    >
                      <option value="Rack A-01">Rack A-01</option>
                      <option value="Rack A-02">Rack A-02</option>
                      <option value="Rack A-03">Rack A-03</option>
                      <option value="Rack A-04">Rack A-04</option>
                      <option value="Rack B-01">Rack B-01</option>
                      <option value="Rack B-02">Rack B-02</option>
                      <option value="Rack C-01">Rack C-01</option>
                    </select>
                  </div>

                  <div>
                    <label className={styles.inputLabel}>Shelf Tier</label>
                    <select
                      value={selectedShelf}
                      onChange={(e) => setSelectedShelf(e.target.value)}
                      className={styles.selectField}
                    >
                      <option value="Shelf 1">Shelf 1 (Bottom)</option>
                      <option value="Shelf 2">Shelf 2 (Mid Level)</option>
                      <option value="Shelf 3">Shelf 3 (Eye Level)</option>
                      <option value="Shelf 4">Shelf 4 (Top Reach)</option>
                    </select>
                  </div>

                  <div>
                    <label className={styles.inputLabel}>Bin / Slot</label>
                    <select
                      value={selectedBin}
                      onChange={(e) => setSelectedBin(e.target.value)}
                      className={styles.selectField}
                    >
                      {Array.from({ length: 16 }).map((_, i) => {
                        const binNum = i < 9 ? `Bin 0${i + 1}` : `Bin ${i + 1}`;
                        return <option key={i} value={binNum}>{binNum}</option>;
                      })}
                    </select>
                  </div>
                </div>

                <div style={{ background: '#e0f2fe', border: '1px solid #bae6fd', padding: '10px 14px', borderRadius: '10px', marginTop: '12px' }}>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#0369a1', fontWeight: 700 }}>
                    Assigned Warehouse Shelf Code:
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#0284c7', letterSpacing: '0.04em' }}>
                    AMD-{selectedRack.replace(/\s+/g, '').toUpperCase()}-{selectedShelf.replace(/\s+/g, '').toUpperCase()}-{selectedBin.replace(/\s+/g, '').toUpperCase()}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => setInwardModalOpen(false)}
                  className={styles.btnSecondary}
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.btnSuccess}
                  style={{ flex: 2, justifyContent: 'center', padding: '12px', fontSize: '13px', fontWeight: 700 }}
                >
                  <CheckCircle2 size={16} /> Put in Shelf & Publish Live on Platform & App
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. BARCODE & THERMAL LOGISTICS LABEL MODAL */}
      {barcodeModalOpen && selectedProductForBarcode && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent} style={{ maxWidth: '460px' }}>
            <div className={styles.modalHeader}>
              <div>
                <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#0284c7', fontWeight: 800 }}>
                  DARKSTORE THERMAL PRINTING
                </span>
                <h3 className={styles.modalTitle} style={{ marginTop: '4px' }}>
                  <Barcode size={18} color="#0284c7" /> Packaging Barcode Label
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setBarcodeModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Realistic 4" x 2" Logistics Sticker Mockup */}
            <div className={styles.barcodeCard}>
              <div className={styles.barcodeHeaderRow}>
                <span className={styles.barcodeDrobeLogo}>DROBE</span>
                <span className={styles.barcodeHubCode}>AHMEDABAD HUB #01</span>
              </div>

              <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.06em' }}>
                DARKSTORE SEQUENTIAL SKU
              </div>
              <div className={styles.barcodeSkuHuge}>
                {selectedProductForBarcode.sku || 'DR1'}
              </div>

              <div className={styles.barcodeShelfBadge}>
                SHELF: {selectedProductForBarcode.warehouseLocation ? selectedProductForBarcode.warehouseLocation.code : 'AMD-RA02-S3-B04'}
              </div>

              {/* Vector Barcode Lines */}
              <div className={styles.barcodeGraphicLines}>
                {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 1, 2, 4, 1, 3, 2, 1, 4, 2].map((w, i) => (
                  <div key={i} className={styles.barcodeLine} style={{ width: `${w * 1.8}px` }} />
                ))}
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#475569', letterSpacing: '0.15em', fontWeight: 700 }}>
                *{selectedProductForBarcode.sku || 'DR1'}*AMD*
              </div>

              <div style={{ borderTop: '1px solid #e2e8f0', marginTop: '12px', paddingTop: '10px', textAlign: 'left', fontSize: '11.5px', color: '#334155', lineHeight: 1.5 }}>
                <div style={{ fontWeight: 800, color: '#0f172a' }}>{selectedProductForBarcode.name}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px' }}>
                  <span>Brand: <strong>{selectedProductForBarcode.brandName}</strong></span>
                  <span style={{ fontWeight: 800, color: '#0284c7' }}>{selectedProductForBarcode.price}</span>
                </div>
                <div style={{ fontSize: '10.5px', color: '#64748b' }}>
                  Size: {selectedProductForBarcode.volume || 'M'} · 30-Min Rapid Pick Ready
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setBarcodeModalOpen(false)}
                className={styles.btnSecondary}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print();
                  triggerToast(`🖨️ Label sent to Zebra Thermal Printer for ${selectedProductForBarcode.sku}!`);
                }}
                className={styles.btnPrimary}
                style={{ flex: 2, justifyContent: 'center', padding: '12px' }}
              >
                <Barcode size={16} /> Print to Thermal Printer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING TOAST NOTIFICATION */}
      {toastMessage && (
        <div className={styles.adminToast}>
          {toastMessage}
        </div>
      )}
    </div>
  );
}
