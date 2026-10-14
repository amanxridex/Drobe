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
  Calendar,
  FileText,
  Globe,
  Mail,
  Phone,
  Eye
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
  adminMarkOrderReturnedAndRestocked,
  adminMarkOrderDeliveredAndKept,
  adjustProductStock,
  getNextSkuNumber,
  getNextAvailableShelfLocation,
  markShipmentArrived,
  syncDarkstoreWithSupabase,
  calculateDrobeMarkupPricing,
  getProductPricingInfo,
  DrobeMarkupPricing
} from '../lib/darkstoreData';
import { 
  subscribeToRealtimeOrders, 
  supabaseFetchAdminBrandsWithProducts, 
  supabaseFetchOrders,
  slugify 
} from '../lib/supabaseClient';
import styles from './admin.module.css';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'inwarding' | 'inventory' | 'shelves' | 'trials' | 'approvals'>('inwarding');
  const [brands, setBrands] = useState<DarkstoreBrand[]>([]);
  const [products, setProducts] = useState<DarkstoreProduct[]>([]);
  const [inbounds, setInbounds] = useState<InboundStockShipment[]>([]);
  const [trialOrders, setTrialOrders] = useState<TrialOrder[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Brand Dossier Review Modal State
  const [selectedBrandForDossier, setSelectedBrandForDossier] = useState<DarkstoreBrand | null>(null);

  // Brand Products Catalog Modal State
  const [selectedBrandForProducts, setSelectedBrandForProducts] = useState<DarkstoreBrand | null>(null);
  const [brandProductsSearch, setBrandProductsSearch] = useState<string>('');

  // Orders & Returns Filter & Search State
  const [ordersFilter, setOrdersFilter] = useState<'all' | 'active' | 'doorstep' | 'returning' | 'kept' | 'restocked'>('all');
  const [ordersSearch, setOrdersSearch] = useState<string>('');
  const [returningOrderModal, setReturningOrderModal] = useState<TrialOrder | null>(null);
  const [selectedReturnReason, setSelectedReturnReason] = useState<string>('Size / fit did not suit at doorstep');
  const [customReturnNotes, setCustomReturnNotes] = useState<string>('');

  // Brand Filter
  const [brandFilter, setBrandFilter] = useState<'all' | 'with_products' | 'awaiting_products' | 'waiting' | 'approved'>('all');

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
  const [inwardBasePrice, setInwardBasePrice] = useState<number>(600);
  const [inwardSku, setInwardSku] = useState<string>('');
  const [selectedZone, setSelectedZone] = useState('Zone A - Outerwear & Heavy Silhouettes');
  const [selectedRack, setSelectedRack] = useState('Rack A-02');
  const [selectedShelf, setSelectedShelf] = useState('Shelf 3');
  const [selectedBin, setSelectedBin] = useState('Bin 04');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const loadAllData = async () => {
    // 1. Initial cached/offline state
    const localBrands = getDarkstoreBrands();
    const localProds = getDarkstoreProducts();
    if (localBrands.length > 0) setBrands(localBrands);
    if (localProds.length > 0) setProducts(localProds);
    setInbounds(getInboundShipments());
    setTrialOrders(getTrialOrders());

    // 2. Query live Supabase DB for all partner brands, catalog creations, and live orders
    try {
      const [dbData, dbOrders] = await Promise.all([
        supabaseFetchAdminBrandsWithProducts(),
        supabaseFetchOrders()
      ]);
      if (dbData && dbData.brands && dbData.products) {
        setBrands(dbData.brands);
        setProducts(dbData.products);
      }
      if (dbOrders && dbOrders.length > 0) {
        setTrialOrders(dbOrders);
      }
    } catch (err) {
      console.warn('Live fetch from Supabase failed, using cached data:', err);
    }
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
  const brandsWithProductsCount = brands.filter(b => (b.totalProductsCount || 0) > 0).length;
  const brandsAwaitingCount = brands.filter(b => (b.totalProductsCount || 0) === 0).length;
  const pendingInwardsCount = products.filter(p => p.inwardStatus !== 'Inwarded & Live').length;
  const liveSkusCount = products.filter(p => p.isLive).length;
  const activeTrialsCount = trialOrders.filter(o => o.status === 'Out for 30-Min Delivery' || o.status === 'Doorstep Fitting (Runner Waiting Outside)').length;

  // Order & Return Telemetry Counts
  const orderCountActive = trialOrders.filter(o => o.status === 'Out for 30-Min Delivery').length;
  const orderCountDoorstep = trialOrders.filter(o => o.status === 'Doorstep Fitting (Runner Waiting Outside)').length;
  const orderCountReturning = trialOrders.filter(o => o.status === 'Returned on Spot (Runner Heading to Hub)').length;
  const orderCountKept = trialOrders.filter(o => o.status === 'Kept on Spot (Purchased)').length;
  const orderCountRestocked = trialOrders.filter(o => o.status === 'Restocked to Warehouse Shelf').length;

  const handleMarkReturned = (orderId: string, returnReason?: string, notes?: string) => {
    const res = adminMarkOrderReturnedAndRestocked(orderId, returnReason, notes);
    if (res.order) {
      loadAllData();
      triggerToast(`✓ Return Restocked: +1 Stock added back to DB for ${res.order.productName} on shelf ${res.order.shelfLocation} (Now ${res.updatedStock ?? ''} pcs). Full UPI refund issued.`);
      setReturningOrderModal(null);
    }
  };

  const handleMarkDelivered = (orderId: string) => {
    const res = adminMarkOrderDeliveredAndKept(orderId);
    if (res.order) {
      loadAllData();
      triggerToast(`🎉 Order ${res.order.orderNumber} marked Delivered & Kept! Stock remains deducted in live DB.`);
    }
  };

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

    // Initialize brand wholesale base price
    const currentPricing = getProductPricingInfo(prod);
    setInwardBasePrice(currentPricing.brandBasePrice || 600);

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
      brandBasePrice: Number(inwardBasePrice) || 600,
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
    triggerToast(`🎉 Verified & Placed on Shelf ${res.shelfCode}! Assigned ${res.skuAssigned} · Base ₹${res.product.brandBasePrice} marked up to ${res.product.price} (+${res.product.markupPercentage}% actual margin) · Now LIVE!`);
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
    if (brandFilter === 'with_products') return (b.totalProductsCount || 0) > 0;
    if (brandFilter === 'awaiting_products') return (b.totalProductsCount || 0) === 0;
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      const match = b.name.toLowerCase().includes(q) ||
        (b.category && b.category.toLowerCase().includes(q)) ||
        (b.founderName && b.founderName.toLowerCase().includes(q)) ||
        (b.email && b.email.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const currentBrandProducts = selectedBrandForProducts ? (
    (selectedBrandForProducts.products && selectedBrandForProducts.products.length > 0)
      ? selectedBrandForProducts.products
      : products.filter(p => {
          const bSlug = slugify(selectedBrandForProducts.id || selectedBrandForProducts.name);
          const bName = selectedBrandForProducts.name?.toLowerCase().trim();
          return (p.brandId && (p.brandId === selectedBrandForProducts.id || slugify(p.brandId) === bSlug)) ||
                 (p.brandName && (p.brandName.toLowerCase().trim() === bName || slugify(p.brandName) === bSlug));
        })
  ) : [];

  const filteredCurrentBrandProducts = currentBrandProducts.filter(p => {
    if (!brandProductsSearch) return true;
    const q = brandProductsSearch.toLowerCase().trim();
    return (p.name && p.name.toLowerCase().includes(q)) ||
           (p.sku && p.sku.toLowerCase().includes(q)) ||
           (p.category && p.category.toLowerCase().includes(q)) ||
           (p.id && p.id.toLowerCase().includes(q));
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

  const filteredTrialOrders = trialOrders.filter(ord => {
    if (ordersFilter === 'active') return ord.status === 'Out for 30-Min Delivery';
    if (ordersFilter === 'doorstep') return ord.status === 'Doorstep Fitting (Runner Waiting Outside)';
    if (ordersFilter === 'returning') return ord.status === 'Returned on Spot (Runner Heading to Hub)';
    if (ordersFilter === 'kept') return ord.status === 'Kept on Spot (Purchased)';
    if (ordersFilter === 'restocked') return ord.status === 'Restocked to Warehouse Shelf';
    return true;
  }).filter(ord => {
    const q = (ordersSearch || searchQuery).toLowerCase().trim();
    if (!q) return true;
    return (
      (ord.orderNumber && ord.orderNumber.toLowerCase().includes(q)) ||
      (ord.customerName && ord.customerName.toLowerCase().includes(q)) ||
      (ord.customerPhone && ord.customerPhone.toLowerCase().includes(q)) ||
      (ord.customerAddress && ord.customerAddress.toLowerCase().includes(q)) ||
      (ord.productName && ord.productName.toLowerCase().includes(q)) ||
      (ord.productSku && ord.productSku.toLowerCase().includes(q)) ||
      (ord.shelfLocation && ord.shelfLocation.toLowerCase().includes(q)) ||
      (ord.brandName && ord.brandName.toLowerCase().includes(q)) ||
      (ord.riderName && ord.riderName.toLowerCase().includes(q))
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

                {/* DROBE 5% PLATFORM MARKUP & CHARM 9 PRICING MODEL BANNER */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(2, 132, 199, 0.08) 100%)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  borderRadius: '14px',
                  padding: '14px 18px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                      ⚡
                    </div>
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a' }}>
                        Drobe 5% Dynamic Markup &amp; Charm 9 Pricing Model
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', maxWidth: '640px', lineHeight: 1.5 }}>
                        Brands list products at base wholesale price (e.g. ₹600). The platform adds a <strong>5% markup fee</strong> and rounds to the nearest figure ending in <strong>9</strong> (e.g. ₹600 + 5% = ₹630 → <strong>₹629</strong>, ₹621 → <strong>₹619</strong>, ₹626 → <strong>₹629</strong>). Below, admin can inspect the actual added markup and decimal percentage.
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '6px 12px', textAlign: 'center' }}>
                      <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Model Rule</div>
                      <div style={{ fontSize: '14px', fontWeight: 900, color: '#0284c7' }}>+5% → Ends in 9</div>
                    </div>
                    <div style={{ background: '#ffffff', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '6px 12px', textAlign: 'center' }}>
                      <div style={{ fontSize: '10px', color: '#166534', textTransform: 'uppercase', fontWeight: 700 }}>Avg Margin</div>
                      <div style={{ fontSize: '14px', fontWeight: 900, color: '#15803d' }}>+4.88%</div>
                    </div>
                  </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table className={styles.lightTable}>
                    <thead>
                      <tr>
                        <th>Product & Photos</th>
                        <th>Brand Name</th>
                        <th>Wholesale vs Selling Price (Markup)</th>
                        <th>Inward Status</th>
                        <th>Assigned SKU</th>
                        <th>Stored Warehouse Shelf</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((prod) => {
                        const isLive = prod.isLive;
                        const pricing = getProductPricingInfo(prod);

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
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontWeight: 900, color: '#0f172a', fontSize: '13px' }}>
                                  ₹{pricing.sellingPrice}
                                </span>
                                <span style={{ fontSize: '10px', fontWeight: 800, background: '#ecfdf5', color: '#059669', padding: '1px 6px', borderRadius: '4px', border: '1px solid #a7f3d0' }}>
                                  {pricing.formattedPercentage}
                                </span>
                              </div>
                              <div style={{ fontSize: '10.5px', color: '#64748b', marginTop: '2px' }}>
                                Brand: <strong>₹{pricing.brandBasePrice}</strong> (+₹{pricing.markupAmount})
                              </div>
                              <div style={{ fontSize: '10px', color: '#94a3b8' }}>Size: {prod.volume || 'Standard'}</div>
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
                                {(() => {
                                  const pPricing = getProductPricingInfo(prod);
                                  return (
                                    <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px', flexWrap: 'wrap' }}>
                                      <span>Size: {prod.volume || 'Standard'}</span>
                                      <span>·</span>
                                      <span style={{ fontWeight: 800, color: '#0f172a' }}>₹{pPricing.sellingPrice}</span>
                                      <span style={{ fontSize: '9.5px', fontWeight: 800, background: '#ecfdf5', color: '#047857', padding: '1px 6px', borderRadius: '4px', border: '1px solid #a7f3d0' }}>
                                        +{pPricing.markupAmount} ({pPricing.formattedPercentage})
                                      </span>
                                    </div>
                                  );
                                })()}
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

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setBrandFilter('all')}
                    className={brandFilter === 'all' ? styles.btnPrimary : styles.btnSecondary}
                  >
                    All Brands ({brands.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setBrandFilter('with_products')}
                    className={brandFilter === 'with_products' ? styles.btnPrimary : styles.btnSecondary}
                    style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                  >
                    <Package size={13} /> With Products in DB ({brandsWithProductsCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setBrandFilter('awaiting_products')}
                    className={brandFilter === 'awaiting_products' ? styles.btnPrimary : styles.btnSecondary}
                  >
                    Awaiting Stock ({brandsAwaitingCount})
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
                                  style={{ width: '44px', height: '44px', borderRadius: '12px', objectFit: 'contain', border: '1px solid #e2e8f0', background: '#ffffff', padding: '3px' }}
                                />
                              ) : (
                                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                                  {brand.name.slice(0, 1)}
                                </div>
                              )}
                              <div>
                                <div style={{ fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span>{brand.name}</span>
                                  {brand.status === 'Approved' && (
                                    <span style={{ color: '#0284c7', fontSize: '11px' }} title="Verified Partner">✓</span>
                                  )}
                                </div>
                                <div style={{ fontSize: '11px', color: '#64748b' }}>
                                  {brand.basedOutOf} · ID: <code>{brand.id}</code>
                                </div>
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
                            <div>
                              {brand.totalProductsCount > 0 ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedBrandForProducts(brand);
                                    setBrandProductsSearch('');
                                  }}
                                  style={{
                                    background: '#e0f2fe',
                                    color: '#0369a1',
                                    border: '1px solid #bae6fd',
                                    borderRadius: '8px',
                                    padding: '4px 10px',
                                    fontSize: '12px',
                                    fontWeight: 800,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    cursor: 'pointer'
                                  }}
                                  title={`Click to inspect all ${brand.totalProductsCount} products for ${brand.name}`}
                                >
                                  <Package size={13} color="#0284c7" />
                                  <span>{brand.totalProductsCount} Products in DB</span>
                                </button>
                              ) : (
                                <span style={{ fontSize: '11.5px', color: '#94a3b8', fontStyle: 'italic' }}>
                                  0 products (Awaiting Dispatch)
                                </span>
                              )}
                              <div style={{ fontSize: '11px', color: brand.inwardedUnitsCount > 0 ? '#16a34a' : '#64748b', fontWeight: 600, marginTop: '4px' }}>
                                {brand.inwardedUnitsCount > 0 
                                  ? `${brand.inwardedUnitsCount} pcs stored in Ahmedabad hub` 
                                  : 'No consignment on shelves yet'}
                              </div>
                            </div>
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
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                              {brand.totalProductsCount > 0 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedBrandForProducts(brand);
                                    setBrandProductsSearch('');
                                  }}
                                  className={styles.btnPrimary}
                                  style={{ padding: '5px 9px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', background: '#0284c7' }}
                                  title="View full list of live products for this brand"
                                >
                                  <Package size={12} color="#ffffff" /> View Products ({brand.totalProductsCount})
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => setSelectedBrandForDossier(brand)}
                                className={styles.btnSecondary}
                                style={{ padding: '5px 9px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                                title="View full brand dossier, founder, bank details and products"
                              >
                                <Eye size={12} color="#0284c7" /> View Dossier
                              </button>
                              <Link
                                href={`/brand/${slugify(brand.id || brand.name)}`}
                                target="_blank"
                                className={styles.btnSecondary}
                                style={{ padding: '5px 9px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
                                title="Open live Brand Page on storefront"
                              >
                                <ExternalLink size={11} color="#475569" /> Storefront
                              </Link>
                              {isWaiting && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleApproveBrand(brand.id, brand.name)}
                                    className={styles.btnSuccess}
                                    style={{ padding: '5px 9px', fontSize: '11px' }}
                                  >
                                    <Check size={12} /> Approve
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRejectBrand(brand.id, brand.name)}
                                    className={styles.btnDanger}
                                    style={{ padding: '5px 9px', fontSize: '11px' }}
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {filteredBrands.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '48px 24px', color: '#64748b' }}>
                    <Building2 size={36} color="#94a3b8" style={{ margin: '0 auto 12px auto' }} />
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>No Brand Submissions Yet</div>
                    <p style={{ fontSize: '13px', maxWidth: '440px', margin: '6px auto 0 auto', lineHeight: 1.5 }}>
                      When brands onboard at <code>/brand-dashboard</code> and upload their company dossier, their profile, founder details, verified bank account, and creation catalog will appear here live from Supabase.
                    </p>
                  </div>
                )}
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

          {/* TAB 4: ORDERS & RETURNS MANAGEMENT (Auto Stock Deduction & Addition) */}
          {activeTab === 'trials' && (
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <div>
                  <h3 className={styles.sectionTitle}>
                    <Truck size={17} color="#0284c7" />
                    Orders & Returns Management · Live DB Auto Stock Sync
                  </h3>
                  <p className={styles.sectionDesc}>
                    Quick-commerce orders in Ahmedabad darkstore. When an order is placed or leaves the store, 1 stock unit is <strong>automatically deducted from DB inventory</strong>. If delivered &amp; kept, stock remains permanently deducted. When marked returned, <strong>+1 stock is immediately added back to the shelf in Supabase DB</strong>.
                  </p>
                </div>
              </div>

              {/* REAL-TIME DIVERTER & PORTAL SHORTCUTS */}
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
                      Auto Stock Sync &amp; Doorstep Returns Active
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      Orders placed by customers immediately deduct physical units from warehouse shelves. Mark returns below to instantly restore stock to the database and issue refunds.
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
                    <span>📦 Hub Order Portal</span>
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
                    <span>🚴 Delivery Partner App</span>
                  </Link>
                </div>
              </div>

              {/* STOCK & ORDERS TELEMETRY METRICS */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '12px',
                marginBottom: '16px'
              }}>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Total Orders in DB</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>{trialOrders.length}</div>
                  <div style={{ fontSize: '10.5px', color: '#94a3b8' }}>Live synchronized</div>
                </div>

                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '12px 14px' }}>
                  <div style={{ fontSize: '11px', color: '#1d4ed8', fontWeight: 700, textTransform: 'uppercase' }}>Out / Doorstep</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#1d4ed8', marginTop: '4px' }}>{orderCountActive + orderCountDoorstep}</div>
                  <div style={{ fontSize: '10.5px', color: '#60a5fa' }}>⚠️ Stock deducted (-1)</div>
                </div>

                <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '10px', padding: '12px 14px' }}>
                  <div style={{ fontSize: '11px', color: '#7e22ce', fontWeight: 700, textTransform: 'uppercase' }}>Return In-Transit</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#7e22ce', marginTop: '4px' }}>{orderCountReturning}</div>
                  <div style={{ fontSize: '10.5px', color: '#a855f7' }}>↩ Heading back to hub</div>
                </div>

                <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '10px', padding: '12px 14px' }}>
                  <div style={{ fontSize: '11px', color: '#047857', fontWeight: 700, textTransform: 'uppercase' }}>Delivered &amp; Kept</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#047857', marginTop: '4px' }}>{orderCountKept}</div>
                  <div style={{ fontSize: '10.5px', color: '#34d399' }}>✓ Kept deducted in DB</div>
                </div>

                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '12px 14px' }}>
                  <div style={{ fontSize: '11px', color: '#15803d', fontWeight: 700, textTransform: 'uppercase' }}>Restocked to Shelf</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#15803d', marginTop: '4px' }}>{orderCountRestocked}</div>
                  <div style={{ fontSize: '10.5px', color: '#22c55e' }}>✓ +1 Stock added to DB</div>
                </div>
              </div>

              {/* FILTER BUTTONS & SEARCH BAR */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setOrdersFilter('all')}
                    className={ordersFilter === 'all' ? styles.filterBtnActive : styles.filterBtn}
                  >
                    All Orders ({trialOrders.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrdersFilter('active')}
                    className={ordersFilter === 'active' ? styles.filterBtnActive : styles.filterBtn}
                  >
                    Out for Delivery ({orderCountActive})
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrdersFilter('doorstep')}
                    className={ordersFilter === 'doorstep' ? styles.filterBtnActive : styles.filterBtn}
                  >
                    Doorstep Fitting ({orderCountDoorstep})
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrdersFilter('returning')}
                    className={ordersFilter === 'returning' ? styles.filterBtnActive : styles.filterBtn}
                  >
                    Return In-Transit ({orderCountReturning})
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrdersFilter('kept')}
                    className={ordersFilter === 'kept' ? styles.filterBtnActive : styles.filterBtn}
                  >
                    Delivered &amp; Kept ({orderCountKept})
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrdersFilter('restocked')}
                    className={ordersFilter === 'restocked' ? styles.filterBtnActive : styles.filterBtn}
                  >
                    Restocked ({orderCountRestocked})
                  </button>
                </div>

                <div style={{ position: 'relative', minWidth: '240px' }}>
                  <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="text"
                    value={ordersSearch}
                    onChange={(e) => setOrdersSearch(e.target.value)}
                    placeholder="Search Order #, customer, SKU..."
                    style={{
                      width: '100%',
                      padding: '7px 10px 7px 32px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '12px'
                    }}
                  />
                </div>
              </div>

              {/* ORDERS LIST */}
              {filteredTrialOrders.length > 0 ? (
                <div className={styles.trialGrid}>
                  {filteredTrialOrders.map((ord) => {
                    const isDoorstepFitting = ord.status === 'Doorstep Fitting (Runner Waiting Outside)';
                    const isOut = ord.status === 'Out for 30-Min Delivery';
                    const isKept = ord.status === 'Kept on Spot (Purchased)';
                    const isRunnerHeadingBack = ord.status === 'Returned on Spot (Runner Heading to Hub)';
                    const isRestocked = ord.status === 'Restocked to Warehouse Shelf';

                    const matchedProduct = products.find(p => p.id === ord.productId || p.sku === ord.productSku);
                    const prodImage = matchedProduct?.images?.[0] || matchedProduct?.thumbnail;

                    return (
                      <div key={ord.id} className={styles.trialCard} style={{ border: isRestocked ? '1px solid #bbf7d0' : isKept ? '1px solid #a7f3d0' : '1px solid #e2e8f0' }}>
                        {/* Card Header */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                          <div>
                            <span style={{ fontWeight: 800, color: '#0284c7', fontSize: '14px' }}>
                              {ord.orderNumber}
                            </span>
                            <span style={{ fontSize: '11px', color: '#94a3b8', marginLeft: '8px' }}>
                              {ord.receivedAt || 'Today'}
                            </span>
                          </div>

                          {isDoorstepFitting ? (
                            <span className={`${styles.statusChip} ${styles.statusTrial}`}>
                              <Clock size={11} /> Runner Waiting Outside ({ord.doorstepTimerMinutesLeft || 7}m)
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
                              <RotateCcw size={11} /> Return In-Transit
                            </span>
                          ) : (
                            <span className={`${styles.statusChip} ${styles.statusLive}`} style={{ background: '#ecfdf5', color: '#059669', borderColor: '#a7f3d0' }}>
                              <CheckCircle2 size={11} /> Restocked to Shelf &amp; Refunded
                            </span>
                          )}
                        </div>

                        {/* Advance Payment & Split Decision Badges */}
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                          <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#eff6ff', color: '#1d4ed8', padding: '3px 8px', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
                            ⚡ 100% Pre-Paid: {ord.price}
                          </span>
                          {(ord.keptAmount !== undefined && ord.keptAmount > 0) && (
                            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#ecfdf5', color: '#047857', padding: '3px 8px', borderRadius: '6px', border: '1px solid #a7f3d0' }}>
                              Kept: ₹{ord.keptAmount}
                            </span>
                          )}
                          {(ord.refundAmount !== undefined && ord.refundAmount > 0) && (
                            <span style={{
                              fontSize: '10.5px',
                              fontWeight: 800,
                              background: ord.refundStatus === 'Refund Processed Instantly' ? '#ecfdf5' : '#fffbeb',
                              color: ord.refundStatus === 'Refund Processed Instantly' ? '#047857' : '#b45309',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              border: ord.refundStatus === 'Refund Processed Instantly' ? '1px solid #a7f3d0' : '1px solid #fde68a'
                            }}>
                              Refund: ₹{ord.refundAmount} {ord.refundStatus === 'Refund Processed Instantly' ? '(Credited ✓)' : '(Pending Hub)'}
                            </span>
                          )}
                        </div>

                        {/* Product & SKU Box */}
                        <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '12px', marginBottom: '12px', border: '1px solid #e2e8f0' }}>
                          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            {prodImage ? (
                              <img
                                src={prodImage}
                                alt={ord.productName}
                                style={{ width: '46px', height: '46px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #e2e8f0' }}
                              />
                            ) : (
                              <div style={{ width: '46px', height: '46px', borderRadius: '8px', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                                <Package size={22} />
                              </div>
                            )}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 800, fontSize: '13px', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {ord.productName}
                              </div>
                              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                                Brand: <strong>{ord.brandName}</strong> · Size: <strong>{ord.size}</strong> · SKU: <strong style={{ color: '#16a34a' }}>{ord.productSku}</strong>
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontWeight: 800, color: '#0284c7', fontSize: '13.5px' }}>
                                {ord.price}
                              </div>
                            </div>
                          </div>

                          {/* Multi-Item Breakdown inside Trial Bag */}
                          {ord.items && ord.items.length > 1 && (
                            <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed #cbd5e1', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                                Bag Outfits ({ord.items.length} Fits)
                              </div>
                              {ord.items.map((it, iIdx) => (
                                <div key={iIdx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', background: '#ffffff', padding: '4px 8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ fontWeight: 700, color: '#0f172a' }}>{it.productName}</span>
                                    <span style={{ color: '#64748b' }}>({it.size})</span>
                                    <span style={{ color: '#0284c7', fontSize: '10px' }}>📍 {it.shelfLocation}</span>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontWeight: 800, color: '#0f172a' }}>{it.price}</span>
                                    <span style={{
                                      fontSize: '9.5px',
                                      fontWeight: 800,
                                      padding: '1px 6px',
                                      borderRadius: '4px',
                                      background: it.status === 'kept' ? '#ecfdf5' : it.status === 'returned' ? '#fef2f2' : '#f1f5f9',
                                      color: it.status === 'kept' ? '#059669' : it.status === 'returned' ? '#dc2626' : '#64748b'
                                    }}>
                                      {it.status === 'kept' ? '✓ Kept' : it.status === 'returned' ? '↩ Return' : 'In Trial'}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Shelf & Location Bar */}
                          <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #e2e8f0', fontSize: '11px', color: '#334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                            <span>📍 Shelf: <strong style={{ color: '#0284c7' }}>{ord.shelfLocation}</strong></span>
                            <span style={{ color: '#475569' }}>
                              📦 DB Stock: <strong style={{ color: (matchedProduct?.inwardUnits || 0) > 0 ? '#16a34a' : '#ef4444' }}>{matchedProduct?.inwardUnits ?? '—'} pcs</strong> on shelf
                            </span>
                          </div>
                        </div>

                        {/* LIVE STOCK STATUS BANNER */}
                        <div style={{
                          padding: '8px 10px',
                          borderRadius: '8px',
                          fontSize: '11px',
                          fontWeight: 700,
                          marginBottom: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: isRestocked 
                            ? '#ecfdf5' 
                            : isKept 
                            ? '#f0fdf4' 
                            : isRunnerHeadingBack 
                            ? '#faf5ff' 
                            : '#eff6ff',
                          color: isRestocked 
                            ? '#047857' 
                            : isKept 
                            ? '#15803d' 
                            : isRunnerHeadingBack 
                            ? '#7e22ce' 
                            : '#1d4ed8',
                          border: isRestocked 
                            ? '1px solid #a7f3d0' 
                            : isKept 
                            ? '1px solid #bbf7d0' 
                            : isRunnerHeadingBack 
                            ? '1px solid #e9d5ff' 
                            : '1px solid #bfdbfe'
                        }}>
                          {isRestocked ? (
                            <>
                              <CheckCircle2 size={13} />
                              <span>✓ Stock Added Back (+1 Unit to DB) · Restored to shelf {ord.shelfLocation}</span>
                            </>
                          ) : isKept ? (
                            <>
                              <Check size={13} />
                              <span>✓ Stock Kept Deducted · Purchase finalized in Supabase DB</span>
                            </>
                          ) : isRunnerHeadingBack ? (
                            <>
                              <RotateCcw size={13} />
                              <span>↩ Return In-Transit · Sealed in tamper bag, awaiting hub shelf restock</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle size={13} />
                              <span>⚠️ Stock Deducted (-1 Unit) · Physically leaves warehouse with runner</span>
                            </>
                          )}
                        </div>

                        {/* Customer & Runner Details */}
                        <div style={{ fontSize: '11.5px', color: '#64748b', marginBottom: '12px', lineHeight: 1.5 }}>
                          <div><strong>Client:</strong> {ord.customerName} ({ord.customerPhone || '+91 98250 88123'})</div>
                          <div style={{ color: '#475569', fontSize: '11px' }}>{ord.customerAddress}</div>
                          <div style={{ marginTop: '4px' }}><strong>Runner:</strong> {ord.riderName || 'Meet Dave'} ({ord.riderVehicle || 'Ather 450X'})</div>
                        </div>

                        {/* Refund status badge */}
                        {ord.instantRefundStatus && (
                          <div style={{ fontSize: '11px', color: '#047857', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '6px 10px', borderRadius: '8px', marginBottom: '10px' }}>
                            ⚡ <strong>Refund:</strong> {ord.instantRefundStatus}
                          </div>
                        )}

                        {ord.returnReason && (
                          <div style={{ fontSize: '11px', color: '#64748b', background: '#f1f5f9', padding: '6px 10px', borderRadius: '8px', marginBottom: '10px' }}>
                            <strong>Return Reason:</strong> {ord.returnReason}
                          </div>
                        )}

                        {/* ADMIN ORDER ACTION BUTTONS */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                          {/* If not restocked yet, give Admin option to mark Returned & Restock */}
                          {!isRestocked && (
                            <button
                              type="button"
                              onClick={() => {
                                setReturningOrderModal(ord);
                                setSelectedReturnReason(ord.returnReason || 'Size / fit did not suit at doorstep');
                                setCustomReturnNotes('');
                              }}
                              className={styles.btnPrimary}
                              style={{
                                background: '#059669',
                                borderColor: '#047857',
                                justifyContent: 'center',
                                padding: '8px 12px',
                                fontSize: '11.5px',
                                fontWeight: 800
                              }}
                              title="Mark as Returned, issue refund, and add +1 stock back to darkstore shelf in DB"
                            >
                              <RotateCcw size={13} />
                              <span>Mark as Returned &amp; Restock (+1 Stock to DB)</span>
                            </button>
                          )}

                          {/* Quick delivery / kept button if order is active or doorstep */}
                          {(isDoorstepFitting || isOut) && (
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                type="button"
                                onClick={() => handleMarkDelivered(ord.id)}
                                className={styles.btnSuccess}
                                style={{ flex: 1, justifyContent: 'center', fontSize: '11px' }}
                                title="Client completes doorstep trial and keeps garment. Keeps stock deducted."
                              >
                                <Check size={12} /> Mark Delivered &amp; Kept
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOrderAction(ord.id, 'Returned on Spot (Runner Heading to Hub)')}
                                className={styles.btnDanger}
                                style={{ flex: 1, justifyContent: 'center', fontSize: '11px' }}
                                title="Handed back to runner at doorstep"
                              >
                                <RotateCcw size={12} /> Return to Runner
                              </button>
                            </div>
                          )}

                          {/* If runner is heading back, direct 1-click restock & instant refund */}
                          {isRunnerHeadingBack && (
                            <button
                              type="button"
                              onClick={() => handleMarkReturned(ord.id, ord.returnReason || 'Doorstep return', 'Runner reached hub dispatch bay')}
                              className={styles.btnPrimary}
                              style={{ width: '100%', justifyContent: 'center', fontSize: '11.5px', fontWeight: 800, background: '#059669', borderColor: '#047857' }}
                            >
                              <CheckCircle2 size={13} /> Runner Reached Hub · Restock &amp; Refund ₹{ord.refundAmount || ord.price} Instantly
                            </button>
                          )}

                          {/* Footer links: Storefront & Barcode */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                            <Link
                              href={`/product/${ord.productId}`}
                              target="_blank"
                              style={{ fontSize: '11px', color: '#0284c7', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '3px' }}
                            >
                              <ExternalLink size={11} /> View on Storefront
                            </Link>
                            {matchedProduct && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedProductForBarcode(matchedProduct);
                                  setBarcodeModalOpen(true);
                                }}
                                style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                              >
                                <Barcode size={11} /> Barcode
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
                  <Package size={36} color="#cbd5e1" style={{ margin: '0 auto 8px auto' }} />
                  <div style={{ fontWeight: 700, color: '#475569' }}>No orders found matching filter</div>
                  <p style={{ fontSize: '12px', margin: '4px 0 0 0' }}>
                    {ordersSearch ? 'Try a different search query or clear the filter.' : 'All incoming orders from customer checkout will appear here with automated stock sync.'}
                  </p>
                </div>
              )}
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
                      Brand: <strong style={{ color: '#0284c7' }}>{selectedProductToInward.brandName}</strong> · Listed Price: {selectedProductToInward.price}
                    </p>
                  </div>
                </div>
              </div>

              {/* Drobe 5% Dynamic Markup & Charm 9 Pricing Box */}
              {(() => {
                const preview = calculateDrobeMarkupPricing(inwardBasePrice || 600);
                return (
                  <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        ⚡ Drobe 5% Markup + Charm 9 Pricing Model
                      </span>
                      <span style={{ fontSize: '10px', background: '#dcfce7', color: '#15803d', fontWeight: 800, padding: '2px 8px', borderRadius: '6px' }}>
                        Auto-Rounded to Last Digit 9
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                      <div>
                        <label className={styles.inputLabel} style={{ fontSize: '11px' }}>
                          Brand Base Wholesale Price (₹) *
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={inwardBasePrice}
                          onChange={(e) => setInwardBasePrice(Math.max(1, Number(e.target.value)))}
                          required
                          className={styles.inputField}
                          style={{ fontWeight: 800, color: '#0f172a' }}
                        />
                        <span style={{ fontSize: '10px', color: '#64748b' }}>e.g. ₹600 set by brand</span>
                      </div>

                      <div>
                        <label className={styles.inputLabel} style={{ fontSize: '11px' }}>
                          Customer Selling Price on App (₹)
                        </label>
                        <div style={{ height: '38px', background: '#ffffff', border: '1px solid #86efac', borderRadius: '8px', display: 'flex', alignItems: 'center', padding: '0 12px', fontWeight: 900, fontSize: '15px', color: '#15803d' }}>
                          ₹{preview.sellingPrice}
                        </div>
                        <span style={{ fontSize: '10px', color: '#166534' }}>Ends in 9 (e.g. ₹629)</span>
                      </div>
                    </div>

                    {/* Exact Markup in Rupees & Decimals */}
                    <div style={{ background: '#ffffff', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11.5px' }}>
                      <div>
                        <span style={{ color: '#64748b' }}>Actual Added Markup: </span>
                        <strong style={{ color: '#15803d' }}>+₹{preview.markupAmount}</strong>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: '#64748b' }}>Actual Percentage: </span>
                        <span style={{ background: '#ecfdf5', color: '#047857', fontWeight: 900, padding: '2px 8px', borderRadius: '6px', border: '1px solid #a7f3d0' }}>
                          {preview.formattedPercentage} ({preview.markupPercentage}%)
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}

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

      {/* 4.5. BRAND PRODUCTS CATALOG MODAL (WIRED TO SUPABASE DB) */}
      {selectedBrandForProducts && (
        <div className={styles.modalOverlay} onClick={() => setSelectedBrandForProducts(null)}>
          <div 
            className={styles.modalContent} 
            onClick={e => e.stopPropagation()} 
            style={{ maxWidth: '920px', width: '95vw', padding: '0', overflow: 'hidden', borderRadius: '20px' }}
          >
            {/* Modal Brand Header Banner */}
            <div 
              style={{ 
                padding: '24px 28px', 
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
                color: '#ffffff',
                position: 'relative'
              }}
            >
              <button 
                type="button" 
                onClick={() => setSelectedBrandForProducts(null)}
                style={{ 
                  position: 'absolute', 
                  top: '18px', 
                  right: '18px', 
                  background: 'rgba(255,255,255,0.15)', 
                  border: 'none', 
                  borderRadius: '50%', 
                  width: '32px', 
                  height: '32px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: '#ffffff', 
                  cursor: 'pointer' 
                }}
                aria-label="Close"
              >
                <X size={16} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                {selectedBrandForProducts.profileImage ? (
                  <img 
                    src={selectedBrandForProducts.profileImage} 
                    alt={selectedBrandForProducts.name}
                    style={{ width: '60px', height: '60px', borderRadius: '16px', objectFit: 'contain', background: '#ffffff', padding: '4px', border: '2px solid rgba(255,255,255,0.2)' }}
                  />
                ) : (
                  <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: '#38bdf8', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '24px' }}>
                    {selectedBrandForProducts.name.slice(0, 1)}
                  </div>
                )}

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                      {selectedBrandForProducts.name}
                    </h2>
                    <span style={{ background: '#38bdf8', color: '#0f172a', fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '12px' }}>
                      VERIFIED PARTNER
                    </span>
                  </div>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
                    {selectedBrandForProducts.tagline || `${selectedBrandForProducts.name} • Live in Ahmedabad Darkstore Hub #01`}
                  </p>
                </div>
              </div>

              {/* Metrics Ribbon */}
              <div 
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', 
                  gap: '10px', 
                  marginTop: '18px', 
                  paddingTop: '16px', 
                  borderTop: '1px solid rgba(255,255,255,0.1)' 
                }}
              >
                <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#38bdf8' }}>{currentBrandProducts.length}</div>
                  <div style={{ fontSize: '10.5px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Catalog SKUs</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#4ade80' }}>
                    {currentBrandProducts.reduce((sum, p) => sum + (p.inwardUnits || 0), 0)} pcs
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Stored at Hub</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#fbbf24' }}>60 Mins</div>
                  <div style={{ fontSize: '10.5px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Express Trial</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '10px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Link 
                    href={`/brand/${slugify(selectedBrandForProducts.id || selectedBrandForProducts.name)}`}
                    target="_blank"
                    style={{ color: '#ffffff', fontSize: '11px', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px', background: 'rgba(56, 189, 248, 0.25)', border: '1px solid #38bdf8', padding: '6px 10px', borderRadius: '8px' }}
                  >
                    <span>Storefront View</span>
                    <ExternalLink size={12} />
                  </Link>
                </div>
              </div>
            </div>

            {/* Modal Body: Products Table */}
            <div style={{ padding: '20px 24px', maxHeight: '58vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                  Live Products Catalog ({filteredCurrentBrandProducts.length} of {currentBrandProducts.length})
                </div>

                {/* Filter Search inside Modal */}
                <div style={{ position: 'relative', width: '260px' }}>
                  <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    value={brandProductsSearch}
                    onChange={(e) => setBrandProductsSearch(e.target.value)}
                    placeholder="Search brand products or SKU..."
                    style={{
                      width: '100%',
                      padding: '6px 12px 6px 32px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '12px',
                      outline: 'none',
                      background: '#f8fafc'
                    }}
                  />
                </div>
              </div>

              {filteredCurrentBrandProducts.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table className={styles.lightTable}>
                    <thead>
                      <tr>
                        <th>Product Details</th>
                        <th>Category</th>
                        <th>Wholesale vs Selling Price (Markup)</th>
                        <th>Sizes Available</th>
                        <th>Inward Stock</th>
                        <th>Shelf Location</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCurrentBrandProducts.map((p) => {
                        const img = (p.images && p.images[0]) || p.thumbnail;
                        return (
                          <tr key={p.id}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                {img ? (
                                  <img 
                                    src={img} 
                                    alt={p.name}
                                    style={{ width: '42px', height: '42px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #e2e8f0' }}
                                  />
                                ) : (
                                  <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                                    <Package size={18} />
                                  </div>
                                )}
                                <div>
                                  <div style={{ fontWeight: 700, fontSize: '12.5px', color: '#0f172a' }}>{p.name}</div>
                                  <div style={{ fontSize: '10.5px', color: '#64748b' }}>
                                    ID: <code>{p.id}</code> · SKU: <strong>{p.sku || `DR-${p.id}`}</strong>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600 }}>
                                {p.category || 'Apparel'}
                              </span>
                            </td>
                            <td>
                              {(() => {
                                const bp = getProductPricingInfo(p);
                                return (
                                  <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                      <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '13px' }}>
                                        ₹{bp.sellingPrice}
                                      </span>
                                      <span style={{ fontSize: '9.5px', fontWeight: 800, background: '#ecfdf5', color: '#047857', padding: '1px 5px', borderRadius: '4px', border: '1px solid #a7f3d0' }}>
                                        {bp.formattedPercentage}
                                      </span>
                                    </div>
                                    <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
                                      Base: <strong>₹{bp.brandBasePrice}</strong> (+₹{bp.markupAmount})
                                    </div>
                                  </div>
                                );
                              })()}
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                {(p.sizes && p.sizes.length > 0 ? p.sizes : [p.volume || 'M']).map((sz: string, sIdx: number) => (
                                  <span key={sIdx} style={{ background: '#e2e8f0', color: '#334155', fontSize: '10px', fontWeight: 700, padding: '1px 5px', borderRadius: '4px' }}>
                                    {sz}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td>
                              <div style={{ fontWeight: 700, fontSize: '12px', color: '#16a34a' }}>
                                {p.inwardUnits || 32} pcs inwarded
                              </div>
                              <div style={{ fontSize: '10.5px', color: '#64748b' }}>
                                {p.inventory || 40} pcs declared
                              </div>
                            </td>
                            <td>
                              <div style={{ fontWeight: 700, color: '#0284c7', fontSize: '11.5px' }}>
                                {p.warehouseLocation?.code || 'AMD-RA01-S1-B01'}
                              </div>
                              <div style={{ fontSize: '10px', color: '#64748b' }}>
                                {p.warehouseLocation?.rack || 'Rack A-01'}
                              </div>
                            </td>
                            <td>
                              <span className={`${styles.statusChip} ${styles.statusLive}`}>
                                <CheckCircle2 size={11} /> Inwarded & Live
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '6px' }}>
                                <Link
                                  href={`/product/${p.id}`}
                                  target="_blank"
                                  className={styles.btnSecondary}
                                  style={{ padding: '4px 8px', fontSize: '10.5px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '3px' }}
                                  title="View product on storefront"
                                >
                                  <ExternalLink size={11} /> Store
                                </Link>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedProductForBarcode(p);
                                    setBarcodeModalOpen(true);
                                  }}
                                  className={styles.btnSecondary}
                                  style={{ padding: '4px 8px', fontSize: '10.5px' }}
                                  title="Print thermal barcode label"
                                >
                                  <Barcode size={11} /> Barcode
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '36px 0', color: '#94a3b8' }}>
                  <Package size={32} color="#cbd5e1" style={{ margin: '0 auto 8px auto' }} />
                  <div style={{ fontWeight: 700, color: '#475569' }}>No products found</div>
                  <p style={{ fontSize: '12px', margin: '4px 0 0 0' }}>
                    {brandProductsSearch ? 'Try a different search term.' : 'This brand has registered on Drobe and is awaiting stock consignment dispatch to the Ahmedabad darkstore.'}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '14px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                Showing <strong>{filteredCurrentBrandProducts.length}</strong> creations for <strong>{selectedBrandForProducts.name}</strong>
              </span>
              <button
                type="button"
                onClick={() => setSelectedBrandForProducts(null)}
                className={styles.btnSecondary}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. BRAND ONBOARDING DOSSIER INSPECTION MODAL */}
      {selectedBrandForDossier && (
        <div className={styles.modalOverlay} onClick={() => setSelectedBrandForDossier(null)}>
          <div 
            className={styles.modalContent} 
            style={{ maxWidth: '820px', padding: 0, overflow: 'hidden', borderRadius: '24px' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Banner & Brand Identity Header */}
            <div style={{ 
              position: 'relative', 
              height: '140px', 
              background: selectedBrandForDossier.coverImage 
                ? `url(${selectedBrandForDossier.coverImage}) center/cover no-repeat` 
                : 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0284c7 100%)',
              padding: '16px 20px',
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'flex-start'
            }}>
              <button
                type="button"
                onClick={() => setSelectedBrandForDossier(null)}
                style={{ 
                  background: 'rgba(15, 23, 42, 0.65)', 
                  backdropFilter: 'blur(8px)',
                  border: 'none', 
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  color: '#ffffff', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Brand Profile Meta Header */}
            <div style={{ padding: '0 28px 20px 28px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: '-42px', marginBottom: '14px', flexWrap: 'wrap', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px' }}>
                  {selectedBrandForDossier.profileImage ? (
                    <img
                      src={selectedBrandForDossier.profileImage}
                      alt={selectedBrandForDossier.name}
                      style={{ width: '84px', height: '84px', borderRadius: '20px', objectFit: 'cover', border: '4px solid #ffffff', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', background: '#ffffff' }}
                    />
                  ) : (
                    <div style={{ width: '84px', height: '84px', borderRadius: '20px', border: '4px solid #ffffff', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', background: '#0284c7', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 900 }}>
                      {selectedBrandForDossier.name.slice(0, 1)}
                    </div>
                  )}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                        {selectedBrandForDossier.name}
                      </h2>
                      <span className={`${styles.statusChip} ${selectedBrandForDossier.status === 'Approved' ? styles.statusLive : styles.statusTransit}`}>
                        {selectedBrandForDossier.status === 'Approved' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                        {selectedBrandForDossier.status}
                      </span>
                    </div>
                    <p style={{ margin: '3px 0 0 0', fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
                      {selectedBrandForDossier.tagline || 'Artisanal Modern Brand'}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '4px 10px', borderRadius: '8px', fontSize: '11.5px', fontWeight: 600, color: '#334155' }}>
                    {selectedBrandForDossier.category}
                  </span>
                  <span style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '4px 10px', borderRadius: '8px', fontSize: '11.5px', fontWeight: 600, color: '#334155' }}>
                    Est. {selectedBrandForDossier.establishedYear || '2024'}
                  </span>
                  <span style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '4px 10px', borderRadius: '8px', fontSize: '11.5px', fontWeight: 600, color: '#334155' }}>
                    📍 {selectedBrandForDossier.basedOutOf}
                  </span>
                </div>
              </div>
            </div>

            {/* Scrollable Body with Exhaustive Dossier Sections */}
            <div style={{ maxHeight: 'calc(88vh - 280px)', overflowY: 'auto', padding: '22px 28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Section 1: Founder Dossier & Quote */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px 18px' }}>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 800, color: '#0284c7', marginBottom: '8px' }}>
                  Founder & Creative Direction
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap', gap: '4px' }}>
                  <div style={{ fontWeight: 800, fontSize: '15px', color: '#0f172a' }}>
                    {selectedBrandForDossier.founderName || 'Founder Name Unspecified'}
                  </div>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                    {selectedBrandForDossier.founderRole || 'Founder & Director'}
                  </span>
                </div>
                {selectedBrandForDossier.founderBio && (
                  <p style={{ margin: '6px 0 0 0', fontSize: '12.5px', color: '#475569', lineHeight: 1.55 }}>
                    {selectedBrandForDossier.founderBio}
                  </p>
                )}
                {selectedBrandForDossier.founderQuote && (
                  <div style={{ marginTop: '10px', padding: '10px 14px', background: '#ffffff', borderLeft: '3px solid #0284c7', borderRadius: '0 8px 8px 0', fontStyle: 'italic', fontSize: '12.5px', color: '#334155' }}>
                    &ldquo;{selectedBrandForDossier.founderQuote}&rdquo;
                  </div>
                )}
              </div>

              {/* Section 2: Brand Story & Mission */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px 18px' }}>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 800, color: '#0284c7', marginBottom: '8px' }}>
                  Brand Story & Manifesto
                </div>
                <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#334155', lineHeight: 1.6 }}>
                  {selectedBrandForDossier.about || 'No brand narrative entered yet.'}
                </p>
                {selectedBrandForDossier.mission && (
                  <div style={{ marginTop: '8px', paddingTop: '10px', borderTop: '1px dashed #e2e8f0' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '3px' }}>Mission Statement</div>
                    <p style={{ margin: 0, fontSize: '12.5px', color: '#475569', lineHeight: 1.5 }}>
                      {selectedBrandForDossier.mission}
                    </p>
                  </div>
                )}
              </div>

              {/* Section 3: Brand Core Values */}
              {selectedBrandForDossier.values && selectedBrandForDossier.values.length > 0 && (
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px 18px' }}>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 800, color: '#0284c7', marginBottom: '12px' }}>
                    Core Brand Pillars & Values ({selectedBrandForDossier.values.length})
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                    {selectedBrandForDossier.values.map((val, vIdx) => (
                      <div key={vIdx} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px 12px' }}>
                        <div style={{ fontWeight: 700, fontSize: '12.5px', color: '#0f172a' }}>{val.title}</div>
                        <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '3px', lineHeight: 1.4 }}>{val.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Section 4: Contact & Digital Presence */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px 18px' }}>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 800, color: '#0284c7', marginBottom: '12px' }}>
                  Contact & Digital Presence
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                    <Mail size={15} color="#0284c7" />
                    <div>
                      <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Official Email</div>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{selectedBrandForDossier.email || 'concierge@brand.com'}</div>
                    </div>
                  </div>
                  {selectedBrandForDossier.inquiriesEmail && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                      <Mail size={15} color="#0284c7" />
                      <div>
                        <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Inquiries Email</div>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{selectedBrandForDossier.inquiriesEmail}</div>
                      </div>
                    </div>
                  )}
                  {selectedBrandForDossier.phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                      <Phone size={15} color="#0284c7" />
                      <div>
                        <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Direct Phone</div>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{selectedBrandForDossier.phone}</div>
                      </div>
                    </div>
                  )}
                  {selectedBrandForDossier.website && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                      <Globe size={15} color="#0284c7" />
                      <div>
                        <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Official Website</div>
                        <a href={selectedBrandForDossier.website.startsWith('http') ? selectedBrandForDossier.website : `https://${selectedBrandForDossier.website}`} target="_blank" rel="noreferrer" style={{ fontWeight: 600, color: '#0284c7', textDecoration: 'none' }}>
                          {selectedBrandForDossier.website}
                        </a>
                      </div>
                    </div>
                  )}
                  {selectedBrandForDossier.instagram && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                      <ExternalLink size={15} color="#0284c7" />
                      <div>
                        <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Instagram</div>
                        <span style={{ fontWeight: 600, color: '#0f172a' }}>{selectedBrandForDossier.instagram}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Section 5: Verified Bank & Settlement Ledger */}
              <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '14px', padding: '16px 18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={16} color="#047857" />
                    <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 800, color: '#047857' }}>
                      Darkstore Settlement Account
                    </span>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 700, background: '#d1fae5', color: '#065f46', padding: '2px 8px', borderRadius: '6px' }}>
                    {selectedBrandForDossier.bankAccount?.accountType || 'Current'} Account
                  </span>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginTop: '6px' }}>
                  <div>
                    <div style={{ fontSize: '10px', color: '#047857', fontWeight: 700, textTransform: 'uppercase' }}>Account Holder</div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#064e3b' }}>
                      {selectedBrandForDossier.bankAccount?.accountHolderName || selectedBrandForDossier.founderName || selectedBrandForDossier.name}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', color: '#047857', fontWeight: 700, textTransform: 'uppercase' }}>Bank Name</div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#064e3b' }}>
                      {selectedBrandForDossier.bankAccount?.bankName || 'HDFC Bank'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', color: '#047857', fontWeight: 700, textTransform: 'uppercase' }}>Account Number</div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#064e3b', letterSpacing: '0.04em' }}>
                      {selectedBrandForDossier.bankAccount?.accountNumber ? `•••• •••• ${selectedBrandForDossier.bankAccount.accountNumber.slice(-4)}` : '•••• 8921'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', color: '#047857', fontWeight: 700, textTransform: 'uppercase' }}>IFSC Code</div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#064e3b' }}>
                      {selectedBrandForDossier.bankAccount?.ifscCode || 'HDFC0001842'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 6: Submitted Product Catalog */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px 18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '6px' }}>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 800, color: '#0284c7' }}>
                    Creations Submitted ({selectedBrandForDossier.products?.length || selectedBrandForDossier.totalProductsCount || 0})
                  </div>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>
                    Pending Inward Verification at Ahmedabad Darkstore
                  </span>
                </div>

                {(() => {
                  const dossierProds = (selectedBrandForDossier.products && selectedBrandForDossier.products.length > 0)
                    ? selectedBrandForDossier.products
                    : products.filter(p => {
                        const bSlug = slugify(selectedBrandForDossier.id || selectedBrandForDossier.name);
                        const bName = selectedBrandForDossier.name?.toLowerCase().trim();
                        return (p.brandId && (p.brandId === selectedBrandForDossier.id || slugify(p.brandId) === bSlug)) ||
                               (p.brandName && (p.brandName.toLowerCase().trim() === bName || slugify(p.brandName) === bSlug));
                      });

                  return dossierProds.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                      {dossierProds.map((prod: any, pIdx: number) => {
                        const prodImg = (prod.images && prod.images[0]) || prod.thumbnail || prod.image;
                        return (
                          <div key={pIdx} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                              {prodImg ? (
                                <img src={prodImg} alt={prod.name} style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover', border: '1px solid #e2e8f0' }} />
                              ) : (
                                <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                                  <Package size={20} />
                                </div>
                              )}
                              <div>
                                <div style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>{prod.name}</div>
                                <div style={{ fontWeight: 800, color: '#0284c7', fontSize: '12.5px' }}>{prod.price || '₹1,499'}</div>
                              </div>
                            </div>
                            {prod.tagline && (
                              <div style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic' }}>
                                {prod.tagline}
                              </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#475569', paddingTop: '6px', borderTop: '1px solid #e2e8f0' }}>
                              <span>Size: <strong>{Array.isArray(prod.sizes) ? prod.sizes.join(', ') : (prod.volume || 'Standard')}</strong></span>
                              <span>Stock: <strong>{prod.inwardUnits || prod.inventory || 20} pcs</strong></span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '24px 0', color: '#94a3b8', fontSize: '12.5px' }}>
                      No individual product highlights attached to dossier.
                    </div>
                  );
                })()}
              </div>

            </div>

            {/* Modal Action Footer */}
            <div style={{ padding: '16px 28px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setSelectedBrandForDossier(null)}
                className={styles.btnSecondary}
              >
                Close Dossier
              </button>

              <div style={{ display: 'flex', gap: '8px' }}>
                {selectedBrandForDossier.status !== 'Approved' && (
                  <button
                    type="button"
                    onClick={() => {
                      handleApproveBrand(selectedBrandForDossier.id, selectedBrandForDossier.name);
                      setSelectedBrandForDossier({
                        ...selectedBrandForDossier,
                        status: 'Approved'
                      });
                    }}
                    className={styles.btnSuccess}
                    style={{ padding: '8px 16px', fontWeight: 700 }}
                  >
                    <Check size={14} /> Approve Brand & Authorize Consignment
                  </button>
                )}
                {selectedBrandForDossier.status !== 'Rejected' && (
                  <button
                    type="button"
                    onClick={() => {
                      handleRejectBrand(selectedBrandForDossier.id, selectedBrandForDossier.name);
                      setSelectedBrandForDossier({
                        ...selectedBrandForDossier,
                        status: 'Rejected'
                      });
                    }}
                    className={styles.btnDanger}
                    style={{ padding: '8px 16px' }}
                  >
                    Reject Application
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. ADMIN RETURN & STOCK RESTORATION CONFIRMATION MODAL */}
      {returningOrderModal && (
        <div className={styles.modalOverlay} onClick={() => setReturningOrderModal(null)}>
          <div 
            className={styles.modalContent} 
            style={{ maxWidth: '540px', padding: '24px', borderRadius: '20px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <RotateCcw size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                    Confirm Return &amp; Restock to Shelf
                  </h3>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    Restores physical inventory in Supabase DB and initiates instant UPI refund
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReturningOrderModal(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Order & Product Summary Box */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontWeight: 800, color: '#0284c7', fontSize: '13px' }}>{returningOrderModal.orderNumber}</span>
                <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '13px' }}>
                  100% Pre-Paid: {returningOrderModal.price}
                </span>
              </div>
              <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#1e293b' }}>
                {returningOrderModal.productName} ({returningOrderModal.size})
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                Client: <strong>{returningOrderModal.customerName}</strong> ({returningOrderModal.customerPhone}) · Source: <strong>{returningOrderModal.paymentMethod || 'UPI'}</strong>
              </div>

              {/* Items to Restock to Warehouse Shelves */}
              {returningOrderModal.items && returningOrderModal.items.length > 0 && (
                <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#334155', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Items to Restock to Warehouse Rack ({returningOrderModal.items.filter(i => i.status === 'returned').length || 1})
                  </div>
                  {(returningOrderModal.items.filter(i => i.status === 'returned').length > 0 
                    ? returningOrderModal.items.filter(i => i.status === 'returned') 
                    : returningOrderModal.items).map((it, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11.5px', padding: '3px 0' }}>
                      <span>• {it.productName} ({it.size}) 📍 <strong>{it.shelfLocation}</strong></span>
                      <span style={{ fontWeight: 800, color: '#059669' }}>+1 Stock ({it.price})</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Instant Refund Settlement */}
              <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11.5px' }}>
                <span>📍 Target Rack: <strong style={{ color: '#0284c7' }}>{returningOrderModal.shelfLocation}</strong></span>
                <span style={{ background: '#ecfdf5', color: '#047857', fontWeight: 800, padding: '3px 8px', borderRadius: '6px' }}>
                  ⚡ Instant Refund: ₹{returningOrderModal.refundAmount || returningOrderModal.price}
                </span>
              </div>
            </div>

            {/* Return Reason Selector */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#334155', textTransform: 'uppercase', marginBottom: '6px' }}>
                Doorstep Return Reason
              </label>
              <select
                value={selectedReturnReason}
                onChange={(e) => setSelectedReturnReason(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '12.5px',
                  background: '#ffffff',
                  color: '#0f172a'
                }}
              >
                <option value="Size / fit did not suit at doorstep">Size / fit did not suit at doorstep</option>
                <option value="Customer tried multiple sizes and kept alternate">Customer tried multiple sizes and kept alternate</option>
                <option value="Customer preferred other trial outfit">Customer preferred other trial outfit</option>
                <option value="Fabric or silhouette did not meet preference">Fabric or silhouette did not meet preference</option>
                <option value="Client changed mind on spot">Client changed mind on spot</option>
              </select>
            </div>

            {/* Custom Notes */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#334155', textTransform: 'uppercase', marginBottom: '6px' }}>
                Admin Inspection &amp; Shelf Restock Notes
              </label>
              <textarea
                value={customReturnNotes}
                onChange={(e) => setCustomReturnNotes(e.target.value)}
                placeholder="Item inspected for tags, aroma, and fold condition. Ready for warehouse rack..."
                rows={2}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '12px',
                  fontFamily: 'inherit',
                  resize: 'none'
                }}
              />
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setReturningOrderModal(null)}
                className={styles.btnSecondary}
                style={{ padding: '8px 16px' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleMarkReturned(returningOrderModal.id, selectedReturnReason, customReturnNotes)}
                className={styles.btnPrimary}
                style={{ background: '#059669', borderColor: '#047857', padding: '8px 18px', fontWeight: 800 }}
              >
                <CheckCircle2 size={14} /> Confirm Restock &amp; Refund ₹{returningOrderModal.refundAmount || returningOrderModal.price}
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
