'use client';

import React, { useState, useEffect } from 'react';
import { 
  Home, 
  LayoutGrid, 
  BarChart2, 
  Wallet,
  User, 
  Globe, 
  Mail, 
  Plus, 
  Edit3, 
  Share2, 
  Trash2, 
  X, 
  Upload,
  TrendingUp,
  Award,
  ArrowUpRight,
  Building2,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Phone,
  MessageCircle,
  FileText,
  ChevronRight,
  LogOut,
  Check,
  AlertCircle,
  ArrowDownLeft,
  Download,
  Bell,
  Zap,
  Power,
  Package,
  Layers,
  Truck,
  MapPin,
  RotateCcw,
  Boxes,
  Barcode,
  ExternalLink,
  Image as ImageIcon,
  Lock,
  Loader2
} from 'lucide-react';
import { BrandProfile, BrandProductHighlight, BrandBankAccount } from './types';
import { 
  AHMEDABAD_WAREHOUSE,
  brandDispatchStock,
  getDarkstoreProducts,
  getInboundShipments,
  getTrialOrders,
  InboundStockShipment,
  TrialOrder,
  syncDarkstoreWithSupabase,
  saveDarkstoreProducts
} from '../lib/darkstoreData';
import { 
  subscribeToRealtimeOrders, 
  subscribeToRealtimeShipments,
  subscribeToRealtimeBrand,
  supabaseFetchOrders,
  supabaseFetchShipments,
  supabaseFetchBrandProducts,
  supabaseUploadMedia,
  supabaseUpsertBrand,
  supabaseUpsertProduct,
  supabaseUpsertShipment,
  supabaseDeleteProduct
} from '../lib/supabaseClient';
import EditBrandProfileSheet from './EditBrandProfileSheet';
import AddBankAccountModal from './AddBankAccountModal';
import styles from './brand-dashboard.module.css';

const InstagramIcon = ({ size = 14, color = "#ffffff" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const ZERO_ANALYTICS_DATA = {
  gmv: '₹0',
  gmvTrend: '0%',
  ordersCount: '0 doorstep orders',
  doorstepTrials: '0 Trials',
  convRate: '0%',
  tryOnTime: '0 min avg fitting',
  hubStock: '0 Units',
  hubShelves: '0 / 96 Shelves Occupied',
  payout: '₹0',
  payoutSubtitle: 'No pending settlements',
  peakBadge: 'Awaiting first order',
  funnel: [
    { stage: 'Doorstep Express Dispatched', count: '0 trials', pct: '0%', fill: '0%', color: '#38bdf8' },
    { stage: '10-Min Delivery ETA Achieved', count: '0 (0%)', pct: '0%', fill: '0%', color: '#0284c7' },
    { stage: 'In-Home Customer Try-on', count: '0 tried', pct: '0%', fill: '0%', color: '#818cf8' },
    { stage: 'Kept & Instant UPI Paid', count: '0 kept', pct: '0%', fill: '0%', color: '#16a34a' },
    { stage: 'Instant Return to Hub (Zero RTO)', count: '0 returned', pct: '0%', fill: '0%', color: '#94a3b8' },
  ],
  hotspots: [
    { name: 'Prahlad Nagar', share: '0%', eta: '10 min', gmv: '₹0', fill: '0%' },
    { name: 'Bodakdev / Sindhu Bhavan', share: '0%', eta: '10 min', gmv: '₹0', fill: '0%' },
    { name: 'Satellite / Vastrapur', share: '0%', eta: '10 min', gmv: '₹0', fill: '0%' },
    { name: 'Ambawadi / CG Road', share: '0%', eta: '10 min', gmv: '₹0', fill: '0%' },
  ]
};

const ANALYTICS_DATA_MAP = {
  today: {
    ...ZERO_ANALYTICS_DATA,
    label: 'Today (Live)',
    chartTitle: "Today's Hourly Fitting Velocity",
    bars: [
      { day: '11 AM', val: '₹0', height: '4%' },
      { day: '1 PM', val: '₹0', height: '4%' },
      { day: '3 PM', val: '₹0', height: '4%' },
      { day: '5 PM', val: '₹0', height: '4%' },
      { day: '7 PM', val: '₹0', height: '4%', active: true },
      { day: '9 PM', val: '₹0', height: '4%' },
    ]
  },
  '7d': {
    ...ZERO_ANALYTICS_DATA,
    label: 'Past 7 Days',
    chartTitle: '7-Day Order & Fitting Velocity',
    bars: [
      { day: 'Mon', val: '₹0', height: '4%' },
      { day: 'Tue', val: '₹0', height: '4%' },
      { day: 'Wed', val: '₹0', height: '4%' },
      { day: 'Thu', val: '₹0', height: '4%' },
      { day: 'Fri', val: '₹0', height: '4%' },
      { day: 'Sat', val: '₹0', height: '4%' },
      { day: 'Sun', val: '₹0', height: '4%', active: true }
    ]
  },
  '30d': {
    ...ZERO_ANALYTICS_DATA,
    label: 'Past 30 Days',
    chartTitle: '4-Week Monthly Sales Trajectory',
    bars: [
      { day: 'W1', val: '₹0', height: '4%' },
      { day: 'W2', val: '₹0', height: '4%' },
      { day: 'W3', val: '₹0', height: '4%' },
      { day: 'W4', val: '₹0', height: '4%', active: true },
    ]
  },
  all: {
    ...ZERO_ANALYTICS_DATA,
    label: 'All Time',
    chartTitle: 'Quarterly Lifetime Trajectory',
    bars: [
      { day: 'Q1', val: '₹0', height: '4%' },
      { day: 'Q2', val: '₹0', height: '4%' },
      { day: 'Q3', val: '₹0', height: '4%' },
      { day: 'Q4', val: '₹0', height: '4%', active: true },
    ]
  }
};

interface BrandProfileViewProps {
  brand: BrandProfile;
  onEditClick?: () => void;
  onShareClick?: () => void;
  onUpdateBrand?: (updated: BrandProfile) => void;
  initialOpenEdit?: boolean;
  onToast?: (msg: string) => void;
  onSignOut?: () => void;
}

export default function BrandProfileView({
  brand,
  onEditClick,
  onShareClick,
  onUpdateBrand,
  initialOpenEdit = false,
  onToast,
  onSignOut
}: BrandProfileViewProps) {
  const [activeTab, setActiveTab] = useState<'home' | 'catalog' | 'warehouse' | 'trials' | 'analytics' | 'payouts' | 'profile'>('home');
  const [analyticsRange, setAnalyticsRange] = useState<'today' | '7d' | '30d' | 'all'>('today');
  const [isEditingProfile, setIsEditingProfile] = useState(Boolean(initialOpenEdit));
  const [showBankModal, setShowBankModal] = useState(false);
  const [isStoreLive, setIsStoreLive] = useState(true);
  const [smsAlertsEnabled, setSmsAlertsEnabled] = useState(true);
  const [payoutAlertsEnabled, setPayoutAlertsEnabled] = useState(true);

  // Darkstore consignment dispatch modal state
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [dispatchProductIndex, setDispatchProductIndex] = useState<number>(0);
  const [dispatchUnits, setDispatchUnits] = useState<number>(20);
  const [dispatchCourier, setDispatchCourier] = useState('BlueDart Express');
  const [dispatchTracking, setDispatchTracking] = useState('');

  // Darkstore live telemetry
  const [darkstoreProducts, setDarkstoreProducts] = useState(getDarkstoreProducts());
  const [inboundShipments, setInboundShipments] = useState(getInboundShipments());
  const [trialOrders, setTrialOrders] = useState(getTrialOrders());

  useEffect(() => {
    const refreshData = () => {
      setDarkstoreProducts(getDarkstoreProducts());
      setInboundShipments(getInboundShipments());
      setTrialOrders(getTrialOrders());
    };
    refreshData();

    // 1. Direct live fetch from Supabase
    Promise.all([
      supabaseFetchOrders(),
      supabaseFetchShipments(),
      (brand.id || brand.name) ? supabaseFetchBrandProducts(brand.id || brand.name, brand.name, true, true) : Promise.resolve(null)
    ]).then(([liveOrders, liveShipments, liveProds]) => {
      if (liveOrders) {
        setTrialOrders(liveOrders);
      }
      if (liveShipments) {
        setInboundShipments(liveShipments);
      }
      if (liveProds && liveProds.length > 0 && onUpdateBrand && (!brand.products || brand.products.length === 0)) {
        const mapped = liveProds.map((p: any) => ({
          id: String(p.id),
          sku: p.sku || `DR-${p.id}`,
          name: p.name || p.title || 'Piece',
          tagline: p.tagline || '',
          description: p.description || '',
          volume: p.volume || 'M',
          price: typeof p.price === 'string' ? p.price : `₹${p.price}`,
          inventory: p.inventory || 20,
          image: Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : (p.thumbnail || ''),
          images: Array.isArray(p.images) ? p.images : (p.thumbnail ? [p.thumbnail] : []),
          inwardStatus: (p.inwardStatus || 'Inwarded & Live') as any,
          isLive: p.isLive ?? true
        }));
        onUpdateBrand({
          ...brand,
          products: mapped
        });
      }
    }).catch(err => {
      console.warn('Direct Supabase telemetry fetch error:', err);
    });

    // 2. Local darkstore sync
    syncDarkstoreWithSupabase().then(() => {
      refreshData();
    });

    // 3. Supabase Realtime listeners for orders, shipments, and brand status
    const unsubOrders = subscribeToRealtimeOrders(() => {
      supabaseFetchOrders().then(orders => {
        if (orders) setTrialOrders(orders);
      });
    });

    const unsubShipments = subscribeToRealtimeShipments(() => {
      supabaseFetchShipments().then(ships => {
        if (ships) setInboundShipments(ships);
      });
    });

    const unsubBrand = (brand.id && subscribeToRealtimeBrand) ? subscribeToRealtimeBrand(brand.id, (updatedRow) => {
      if (updatedRow && onUpdateBrand) {
        onUpdateBrand({
          ...brand,
          status: updatedRow.status || brand.status,
          name: updatedRow.name || brand.name,
          tagline: updatedRow.tagline || brand.tagline
        });
      }
    }) : undefined;

    window.addEventListener('storage', refreshData);
    return () => {
      window.removeEventListener('storage', refreshData);
      if (unsubOrders) unsubOrders();
      if (unsubShipments) unsubShipments();
      if (unsubBrand) unsubBrand();
    };
  }, [brand.id, brand.name]);

  const handleConfirmDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = activeProducts[dispatchProductIndex];
    if (!prod) return;

    const ship = brandDispatchStock({
      brandId: brand.id || 'brand-active-01',
      brandName: brand.name || 'Your Brand',
      productId: prod.id || `prod-${dispatchProductIndex}`,
      productName: prod.name,
      units: Number(dispatchUnits) || 20,
      courierPartner: dispatchCourier,
      trackingNumber: dispatchTracking || `AMD-TRK-${Math.floor(100000 + Math.random() * 900000)}`
    });

    // Direct Supabase DB sync for inbound shipment
    supabaseUpsertShipment(ship).catch(err => {
      console.warn('supabaseUpsertShipment error:', err);
    });

    // Update product inward status in drobe_products
    supabaseUpsertProduct({
      id: prod.id || `prod-${dispatchProductIndex}`,
      name: prod.name,
      brandId: brand.id || 'brand-active-01',
      brandName: brand.name || 'Your Brand',
      inwardStatus: 'Stock In Transit to Ahmedabad',
      inventory: Number(dispatchUnits) || 20
    } as any).catch(err => {
      console.warn('supabaseUpsertProduct dispatch error:', err);
    });

    const updatedProducts = activeProducts.map((p, idx) => {
      if (idx === dispatchProductIndex) {
        return {
          ...p,
          inwardStatus: 'Stock In Transit to Ahmedabad' as const,
          inventory: dispatchUnits
        };
      }
      return p;
    });

    const updatedBrand: BrandProfile = {
      ...brand,
      products: updatedProducts
    };

    if (onUpdateBrand) {
      onUpdateBrand(updatedBrand);
    } else {
      try {
        localStorage.setItem('drobe_brand_profile_v1', JSON.stringify(updatedBrand));
      } catch {}
    }

    supabaseUpsertBrand(updatedBrand).catch(() => {});

    setDarkstoreProducts(getDarkstoreProducts());
    setInboundShipments(prev => [ship, ...prev.filter(s => s.id !== ship.id)]);
    setShowDispatchModal(false);

    if (onToast) {
      onToast(`📦 Dispatched ${dispatchUnits} units of "${prod.name}" to Ahmedabad Hub (SG Highway). Tracking: ${ship.trackingNumber}`);
    }
  };

  const currentBankAccount = brand.bankAccount || {
    accountHolderName: brand.founderName || brand.name || 'Brand Founder',
    bankName: 'HDFC Bank',
    accountNumber: '5010048921892',
    ifscCode: 'HDFC0001842',
    accountType: 'Current',
    isVerified: true
  };

  const handleSaveBankAccount = (account: BrandBankAccount) => {
    const updatedBrand: BrandProfile = {
      ...brand,
      bankAccount: account
    };
    if (onUpdateBrand) {
      onUpdateBrand(updatedBrand);
    } else {
      try {
        localStorage.setItem('drobe_brand_profile_v1', JSON.stringify(updatedBrand));
      } catch {}
    }

    // Direct Supabase sync
    try {
      supabaseUpsertBrand({
        ...updatedBrand,
        id: updatedBrand.id || 'brand-active-01',
        bankAccount: account
      });
    } catch (err) {
      console.warn('Failed to sync bank details to Supabase:', err);
    }

    if (onToast) {
      onToast(
        account.payoutMethod === 'upi'
          ? `Payout destination updated: Instant UPI (${account.upiId})`
          : `Bank account updated: ${account.bankName} (•••• ${account.accountNumber.slice(-4)})`
      );
    }
  };

  React.useEffect(() => {
    if (initialOpenEdit) {
      setIsEditingProfile(true);
    }
  }, [initialOpenEdit]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProductIndex, setEditingProductIndex] = useState<number | null>(null);
  const [newProduct, setNewProduct] = useState<BrandProductHighlight>({
    name: '',
    price: '',
    volume: '',
    inventory: '',
    tagline: '',
    description: '',
    primaryColor: '',
    fabric: '',
    image: '',
    images: []
  });

  const activeProducts = brand.products.filter(p => p.name?.trim().length > 0);
  const brandTrialOrders = trialOrders.filter(
    (o) =>
      (o.brandName && brand.name && o.brandName.trim().toLowerCase() === brand.name.trim().toLowerCase()) ||
      (o.brandId && brand.id && o.brandId === brand.id)
  );
  const brandInboundShipments = inboundShipments.filter(
    (s) =>
      (s.brandName && brand.name && s.brandName.trim().toLowerCase() === brand.name.trim().toLowerCase()) ||
      (s.brandId && brand.id && s.brandId === brand.id)
  );
  const isBrandApproved = brand.status === 'Approved' || brand.status === 'Published';

  // Dynamic KPIs derived strictly from live Supabase orders & shipments (clean 0 baseline if none)
  const keptOrders = brandTrialOrders.filter(
    (o) =>
      o.status === 'Kept on Spot (Purchased)' ||
      (o.status === 'Restocked to Warehouse Shelf' && (o.keptAmount || 0) > 0)
  );

  const totalGmvNum = keptOrders.reduce((sum, o) => {
    const rawPrice = o.keptAmount || (typeof o.price === 'string' ? parseFloat(o.price.replace(/[^0-9.]/g, '')) : Number(o.price)) || 0;
    return sum + rawPrice;
  }, 0);

  const verifiedStockUnits = brandInboundShipments
    .filter((s) => s.status === 'Verified & Shelved')
    .reduce((sum, s) => sum + (Number(s.units) || 0), 0);

  const totalDoorstepTrials = brandTrialOrders.length;
  const convRatePct = totalDoorstepTrials > 0 
    ? Math.round((keptOrders.length / totalDoorstepTrials) * 100) 
    : 0;

  const dynamicAnalytics = {
    gmv: totalGmvNum > 0 ? `₹${totalGmvNum.toLocaleString('en-IN')}` : '₹0',
    gmvTrend: totalGmvNum > 0 ? '+100%' : '0%',
    ordersCount: `${totalDoorstepTrials} doorstep orders`,
    doorstepTrials: `${totalDoorstepTrials} Trials`,
    convRate: `${convRatePct}%`,
    tryOnTime: totalDoorstepTrials > 0 ? '7.5 min avg fitting' : '0 min avg fitting',
    hubStock: `${verifiedStockUnits} Units`,
    hubShelves: `${verifiedStockUnits > 0 ? Math.ceil(verifiedStockUnits / 20) : 0} / 96 Shelves Occupied`,
    payout: totalGmvNum > 0 ? `₹${totalGmvNum.toLocaleString('en-IN')}` : '₹0',
    payoutSubtitle: totalGmvNum > 0 ? 'T+1 settlement scheduled' : 'No pending settlements'
  };

  const handleOpenAddModal = () => {
    setEditingProductIndex(null);
    setNewProduct({
      name: '',
      price: '',
      volume: '',
      inventory: '',
      tagline: '',
      description: '',
      primaryColor: '',
      fabric: '',
      image: '',
      images: []
    });
    setShowAddModal(true);
  };

  const handleStartEditProduct = (index: number) => {
    const prod = activeProducts[index];
    if (!prod) return;
    const existingImages = prod.images && prod.images.length > 0 
      ? prod.images 
      : (prod.image ? [prod.image] : []);

    setEditingProductIndex(index);
    setNewProduct({
      name: prod.name || '',
      price: prod.price || '',
      volume: prod.volume || '',
      inventory: prod.inventory !== undefined ? String(prod.inventory) : '',
      tagline: prod.tagline || '',
      description: prod.description || '',
      primaryColor: prod.primaryColor || '',
      fabric: prod.fabric || '',
      image: existingImages[0] || '',
      images: existingImages
    });
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingProductIndex(null);
    setNewProduct({
      name: '',
      price: '',
      volume: '',
      inventory: '',
      tagline: '',
      description: '',
      primaryColor: '',
      fabric: '',
      image: '',
      images: []
    });
  };
  const totalProductsCount = activeProducts.length;
  const normalizedCategory = 
    brand.category === 'Male' ? 'MALE' : 
    brand.category === 'Female' ? 'FEMALE' : 'MALE & FEMALE';

  const [isUploadingProductImages, setIsUploadingProductImages] = useState(false);

  const handleMultipleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    setIsUploadingProductImages(true);
    try {
      const brandSlug = (brand.name || 'brand').toLowerCase().replace(/[^a-z0-9]/g, '-');
      for (const file of fileList) {
        try {
          const uploadRes = await supabaseUploadMedia(
            file, 
            'products', 
            `${brandSlug}_prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
          );
          if (uploadRes && uploadRes.url) {
            setNewProduct(prev => {
              const currentList = prev.images && prev.images.length > 0 
                ? prev.images 
                : (prev.image ? [prev.image] : []);
              const updated = [...currentList, uploadRes.url];
              return {
                ...prev,
                image: updated[0] || '',
                images: updated
              };
            });
          } else {
            // Offline/Fallback to data URL only if storage is unreachable
            const reader = new FileReader();
            reader.onload = () => {
              if (typeof reader.result === 'string') {
                const dataUrl = reader.result as string;
                setNewProduct(prev => {
                  const currentList = prev.images && prev.images.length > 0 
                    ? prev.images 
                    : (prev.image ? [prev.image] : []);
                  const updated = [...currentList, dataUrl];
                  return {
                    ...prev,
                    image: updated[0] || '',
                    images: updated
                  };
                });
              }
            };
            reader.readAsDataURL(file);
          }
        } catch (uploadErr) {
          console.warn('Storage upload error for product file:', uploadErr);
        }
      }
    } finally {
      setIsUploadingProductImages(false);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setNewProduct(prev => {
      const currentList = prev.images && prev.images.length > 0 
        ? prev.images 
        : (prev.image ? [prev.image] : []);
      const remaining = currentList.filter((_, idx) => idx !== indexToRemove);
      return {
        ...prev,
        image: remaining[0] || '',
        images: remaining
      };
    });
  };

  const handleSaveNewProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name.trim()) return;

    const finalImages = newProduct.images && newProduct.images.length > 0 
      ? newProduct.images 
      : (newProduct.image ? [newProduct.image] : []);

    const productToSave: BrandProductHighlight = {
      ...newProduct,
      image: finalImages[0] || '',
      images: finalImages
    };

    const prodId = productToSave.id || `${brand.id || 'brand'}-prod-${Date.now()}`;
    const productWithId: BrandProductHighlight = {
      ...productToSave,
      id: prodId
    };

    let updatedProducts: BrandProductHighlight[];
    const isEditing = editingProductIndex !== null && editingProductIndex >= 0 && editingProductIndex < activeProducts.length;
    
    if (isEditing) {
      updatedProducts = activeProducts.map((p, idx) => idx === editingProductIndex ? productWithId : p);
    } else {
      updatedProducts = [
        ...brand.products.filter(p => p.name?.trim().length > 0),
        productWithId
      ];
    }

    const updatedBrand: BrandProfile = {
      ...brand,
      products: updatedProducts
    };

    if (onUpdateBrand) {
      onUpdateBrand(updatedBrand);
    } else {
      try {
        localStorage.setItem('drobe_brand_profile_v1', JSON.stringify(updatedBrand));
      } catch {}
    }

    try {
      const darkstoreProds = getDarkstoreProducts();
      const matchIndex = darkstoreProds.findIndex(dp => dp.name === productWithId.name || (productWithId.id && dp.id === productWithId.id));
      if (matchIndex >= 0) {
        darkstoreProds[matchIndex] = {
          ...darkstoreProds[matchIndex],
          primaryColor: productWithId.primaryColor,
          fabric: productWithId.fabric,
          description: productWithId.description,
          price: productWithId.price || darkstoreProds[matchIndex].price,
          images: finalImages.length > 0 ? finalImages : darkstoreProds[matchIndex].images
        };
        saveDarkstoreProducts(darkstoreProds);
      }

      // Direct Supabase drobe_products sync
      supabaseUpsertProduct({
        id: prodId,
        sku: productWithId.sku || `DR-${prodId.slice(-4)}`,
        name: productWithId.name,
        brandId: brand.id || 'brand-active-01',
        brandName: brand.name || 'Your Brand',
        category: brand.category || 'Apparel',
        price: productWithId.price?.startsWith('₹') ? productWithId.price : `₹${productWithId.price || '999'}`,
        volume: productWithId.volume || 'M',
        inventory: Number(productWithId.inventory) || 20,
        inwardUnits: 0,
        unitsInTrial: 0,
        unitsSold: 0,
        tagline: productWithId.tagline || '',
        description: productWithId.description || '',
        images: finalImages,
        inwardStatus: productWithId.inwardStatus || 'Pending Stock Dispatch',
        isLive: productWithId.isLive ?? true
      });

      // Update brand dossier in drobe_brands
      supabaseUpsertBrand(updatedBrand).catch(() => {});
    } catch (err) {
      console.warn('Failed to sync product to Supabase:', err);
    }

    if (onToast) {
      onToast(
        isEditing
          ? `"${newProduct.name}" updated successfully`
          : `"${newProduct.name}" added to collection · ${finalImages.length} images`
      );
    }

    handleCloseModal();
  };

  const handleDeleteProduct = (indexToRemove: number) => {
    const prodToDelete = activeProducts[indexToRemove];
    const remaining = activeProducts.filter((_, i) => i !== indexToRemove);
    const updatedBrand: BrandProfile = {
      ...brand,
      products: remaining
    };

    if (onUpdateBrand) {
      onUpdateBrand(updatedBrand);
    } else {
      try {
        localStorage.setItem('drobe_brand_profile_v1', JSON.stringify(updatedBrand));
      } catch {}
    }

    // Direct Supabase DB deletion
    if (prodToDelete?.id) {
      supabaseDeleteProduct(prodToDelete.id).catch((err) => {
        console.warn('Supabase delete product error:', err);
      });
    }

    // Update brand dossier in drobe_brands
    supabaseUpsertBrand(updatedBrand).catch((err) => {
      console.warn('Supabase upsert brand error on product delete:', err);
    });

    if (onToast && prodToDelete?.name) {
      onToast(`Deleted "${prodToDelete.name}" from catalog.`);
    }
  };

  return (
    <div className={styles.darkProfileContainer}>
      {/* 1. Header with Brand Emblem & Actions */}
      <header className={styles.darkProfileHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {brand.profileImage ? (
            <img
              src={brand.profileImage}
              alt={brand.name}
              className={styles.darkHeaderAvatar}
            />
          ) : (
            <div className={styles.darkHeaderAvatarFallback}>
              {brand.name ? brand.name.slice(0, 1).toUpperCase() : 'D'}
            </div>
          )}
          <div>
            <div className={styles.darkHeaderGreeting}>
              Hello, {brand.founderName ? brand.founderName.split(' ')[0] : (brand.name || 'Partner')}
            </div>
            <div className={styles.darkHeaderSub}>
              Live on Drobe · {brand.basedOutOf || 'India'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {onShareClick && (
            <button
              type="button"
              onClick={onShareClick}
              className={styles.darkCircleBtn}
              title="Share Live Store Link"
            >
              <Share2 size={15} />
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsEditingProfile(true)}
            className={styles.darkCircleBtn}
            title="Edit Brand Dossier"
          >
            <Edit3 size={15} />
          </button>
        </div>
      </header>

      {/* 2. Scrollable Body Content */}
      <div className={styles.darkScrollContent}>




        {/* TAB 0: Home Analytics & Operations Cockpit */}
        {activeTab === 'home' && (() => {
          const currentAnalytics = ANALYTICS_DATA_MAP[analyticsRange] || ANALYTICS_DATA_MAP['today'];
          const topPieces = (activeProducts && activeProducts.length > 0) ? activeProducts.slice(0, 3) : [];

          return (
            <div className={styles.homeAnalyticsWrapper}>
              {/* 1. Live Hub Telemetry Strip & Time Range Filters */}
              <div className={styles.telemetryStripCard}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className={styles.pulseLiveDot} />
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.01em' }}>
                        Ahmedabad Central Hub #01
                      </div>
                      <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 500 }}>
                        24 Express Riders Active · Avg 8.2m Dispatch
                      </div>
                    </div>
                  </div>

                  <div className={styles.timeRangePillTrack}>
                    {(['today', '7d', '30d', 'all'] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setAnalyticsRange(r)}
                        className={`${styles.timeRangeBtn} ${analyticsRange === r ? styles.timeRangeBtnActive : ''}`}
                      >
                        {r === 'today' ? 'Today' : r === '7d' ? '7D' : r === '30d' ? '30D' : 'All'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 2. 2x2 Core Performance KPIs */}
              <div className={styles.analyticsGrid}>
                {/* KPI 1: Net Sales / GMV */}
                <div className={styles.statCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span className={styles.statCardLabel}>Net Sales (GMV)</span>
                    <div className={styles.statCardTrend}>
                      <TrendingUp size={11} /> {dynamicAnalytics.gmvTrend}
                    </div>
                  </div>
                  <div className={styles.statCardValue}>
                    {dynamicAnalytics.gmv}
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 500 }}>
                    {dynamicAnalytics.ordersCount}
                  </div>
                </div>

                {/* KPI 2: Doorstep Try-to-Buy Conversion */}
                <div className={styles.statCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span className={styles.statCardLabel}>Doorstep Trials</span>
                    <span style={{ fontSize: '9.5px', fontWeight: 800, color: '#16a34a', backgroundColor: '#dcfce7', padding: '2px 6px', borderRadius: '6px' }}>
                      {dynamicAnalytics.convRate} Conv.
                    </span>
                  </div>
                  <div className={styles.statCardValue}>
                    {dynamicAnalytics.doorstepTrials}
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 500 }}>
                    {dynamicAnalytics.tryOnTime}
                  </div>
                </div>

                {/* KPI 3: Consignment Stock at Ahmedabad Hub */}
                <div className={styles.statCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span className={styles.statCardLabel}>Hub Inward Stock</span>
                    <span style={{ fontSize: '9.5px', fontWeight: 800, color: '#0284c7', backgroundColor: '#e0f2fe', padding: '2px 6px', borderRadius: '6px' }}>
                      Live SG Hub
                    </span>
                  </div>
                  <div className={styles.statCardValue}>
                    {dynamicAnalytics.hubStock}
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 500 }}>
                    {dynamicAnalytics.hubShelves}
                  </div>
                </div>

                {/* KPI 4: Automated Payout Settlement */}
                <div className={styles.statCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span className={styles.statCardLabel}>Daily Payout</span>
                    <span style={{ fontSize: '9.5px', fontWeight: 800, color: '#9333ea', backgroundColor: '#f3e8ff', padding: '2px 6px', borderRadius: '6px' }}>
                      T+0 Auto
                    </span>
                  </div>
                  <div className={styles.statCardValue}>
                    {dynamicAnalytics.payout}
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {dynamicAnalytics.payoutSubtitle}
                  </div>
                </div>
              </div>

              {/* 3. Dynamic Revenue & Fitting Velocity Chart */}
              <div className={styles.chartContainer}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.01em' }}>
                      {currentAnalytics.chartTitle}
                    </h4>
                    <p style={{ margin: '2px 0 0 0', fontSize: '10.5px', color: '#64748b' }}>
                      Gross Doorstep Sales &amp; In-Home Conversions
                    </p>
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#16a34a', backgroundColor: '#dcfce7', padding: '3px 8px', borderRadius: '9999px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Zap size={10} /> {currentAnalytics.peakBadge}
                  </span>
                </div>

                <div className={styles.chartBarsRow}>
                  {currentAnalytics.bars.map((b) => (
                    <div key={b.day} className={styles.chartBarCol}>
                      <span style={{ fontSize: '9px', fontWeight: 700, color: b.active ? '#2563eb' : '#94a3b8' }}>
                        {b.val}
                      </span>
                      <div
                        className={`${styles.chartBarFill} ${b.active ? styles.chartBarFillActive : ''}`}
                        style={{ height: b.height }}
                      />
                      <span className={styles.chartBarLabel} style={{ fontWeight: b.active ? 800 : 600, color: b.active ? '#0f172a' : '#64748b' }}>
                        {b.day}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Doorstep Try-to-Buy Conversion Funnel */}
              <div className={styles.funnelCard}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                      Doorstep Try-to-Buy Funnel
                    </h4>
                    <p style={{ margin: '2px 0 0 0', fontSize: '10.5px', color: '#64748b' }}>
                      How 10-minute in-home fittings eliminate return costs
                    </p>
                  </div>
                  <span style={{ fontSize: '9.5px', fontWeight: 800, color: '#16a34a', backgroundColor: '#dcfce7', padding: '3px 8px', borderRadius: '8px' }}>
                    3.9x E-comm Avg
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                  {currentAnalytics.funnel.map((fn, idx) => (
                    <div key={idx} className={styles.funnelStageRow}>
                      <div className={styles.funnelStageHeader}>
                        <span style={{ fontWeight: 600, color: '#334155' }}>{fn.stage}</span>
                        <span style={{ fontWeight: 700, color: '#0f172a' }}>{fn.count} ({fn.pct})</span>
                      </div>
                      <div className={styles.funnelStageTrack}>
                        <div
                          className={styles.funnelStageFill}
                          style={{ width: fn.fill, backgroundColor: fn.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: '10px', padding: '8px 10px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '10px', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={12} color="#16a34a" />
                  <span><strong>Zero RTO Loss:</strong> Garments returned by riders are shelved back in the Ahmedabad hub immediately.</span>
                </div>
              </div>

              {/* 5. Best Selling Creations Leaderboard */}
              <div className={styles.skuLeaderboardCard}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                      Best Selling Pieces
                    </h4>
                    <p style={{ margin: '2px 0 0 0', fontSize: '10.5px', color: '#64748b' }}>
                      Ranked by Doorstep Revenue &amp; Trial Conversion
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('catalog')}
                    style={{ background: 'none', border: 'none', color: '#0284c7', fontSize: '11px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
                  >
                    Catalog ({totalProductsCount}) <ArrowUpRight size={12} />
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {topPieces.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '18px 12px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                      <Package size={20} color="#94a3b8" style={{ margin: '0 auto 6px auto', display: 'block' }} />
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>No sales recorded yet</div>
                      <div style={{ fontSize: '10.5px', color: '#64748b', marginTop: '2px' }}>
                        Once doorstep orders start, top-performing pieces will rank here.
                      </div>
                    </div>
                  ) : (
                    topPieces.map((p, idx) => (
                      <div key={idx} className={styles.skuLeaderboardItem}>
                        <div className={`${styles.skuRankBadge} ${idx === 0 ? styles.skuRankGold : idx === 1 ? styles.skuRankSilver : styles.skuRankBronze}`}>
                          #{idx + 1}
                        </div>
                        {p.image ? (
                          <img src={p.image} alt={p.name} className={styles.skuThumb} />
                        ) : (
                          <div className={styles.skuThumb} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Package size={16} color="#94a3b8" />
                          </div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {p.name}
                          </div>
                          <div style={{ fontSize: '10px', color: '#64748b', display: 'flex', gap: '8px', marginTop: '2px' }}>
                            <span>{p.price || '₹0'}</span>
                            <span>·</span>
                            <span style={{ color: '#64748b', fontWeight: 600 }}>
                              0% keep rate
                            </span>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#0f172a' }}>
                            ₹0
                          </div>
                          <div style={{ fontSize: '9.5px', color: '#64748b' }}>
                            0 sold
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* 6. Ahmedabad Neighborhood Delivery Heatmap */}
              <div className={styles.heatmapCard}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                      Ahmedabad Demand Hotspots
                    </h4>
                    <p style={{ margin: '2px 0 0 0', fontSize: '10.5px', color: '#64748b' }}>
                      Fitting volume &amp; express dispatch ETA by neighborhood
                    </p>
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#0284c7', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <MapPin size={11} /> 10-Min Radius
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
                  {currentAnalytics.hotspots.map((hs, idx) => (
                    <div key={idx} className={styles.heatmapRow}>
                      <div className={styles.heatmapHeader}>
                        <span style={{ fontWeight: 600, color: '#0f172a' }}>{hs.name}</span>
                        <span style={{ color: '#64748b', fontSize: '10.5px' }}>
                          <strong>{hs.share}</strong> · ETA {hs.eta} · <span style={{ color: '#0f172a', fontWeight: 700 }}>{hs.gmv}</span>
                        </span>
                      </div>
                      <div className={styles.heatmapTrack}>
                        <div className={styles.heatmapFill} style={{ width: hs.fill }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 7. Live 10-Minute Doorstep Fittings Feed */}
              <div className={styles.darkCardBox} style={{ marginTop: '12px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div className={styles.pulseLiveDot} />
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
                      Live Doorstep Trials Feed
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('trials')}
                    style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '11px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                  >
                    View All ({brandTrialOrders.length}) <ArrowUpRight size={12} />
                  </button>
                </div>

                {brandTrialOrders.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 16px', backgroundColor: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '14px' }}>
                    <Truck size={22} color="#94a3b8" style={{ margin: '0 auto 8px auto', display: 'block' }} />
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                      No Doorstep Trials in Progress
                    </div>
                    <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#64748b', lineHeight: 1.45 }}>
                      When customers order your creations to try at home in Ahmedabad, real-time 10-minute delivery and fitting timers will appear here.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {brandTrialOrders.slice(0, 3).map((ord) => (
                      <div key={ord.id} style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '10px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontSize: '10px', fontWeight: 800, color: '#16a34a', backgroundColor: '#dcfce7', padding: '2px 8px', borderRadius: '9999px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <Clock size={10} /> {ord.status || 'Active Fitting'}
                          </span>
                          <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#0f172a' }}>{ord.price}</span>
                        </div>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
                          {ord.productName} · {ord.size}
                        </div>
                        <div style={{ fontSize: '10.5px', color: '#64748b', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={10} /> {ord.customerName} · Partner: {ord.riderName}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 8. Quick Operations Launchpad */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '12px' }}>
                <button
                  type="button"
                  onClick={handleOpenAddModal}
                  className={styles.quickLaunchBtn}
                >
                  <Plus size={14} color="#2563eb" />
                  <span>Add Product Drop</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowDispatchModal(true)}
                  className={styles.quickLaunchBtn}
                >
                  <Boxes size={14} color="#0284c7" />
                  <span>Dispatch to Hub</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('payouts')}
                  className={styles.quickLaunchBtn}
                >
                  <Wallet size={14} color="#16a34a" />
                  <span>Payout Settlements</span>
                </button>

                <button
                  type="button"
                  onClick={onShareClick}
                  className={styles.quickLaunchBtn}
                >
                  <Share2 size={14} color="#9333ea" />
                  <span>Share Storefront</span>
                </button>
              </div>

              {/* 9. Signature Spotlight */}
              <div className={styles.darkCardBox} style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span className={styles.darkCardTag}>Signature Spotlight</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {activeProducts.length > 0 && (
                      <button
                        type="button"
                        onClick={() => handleStartEditProduct(0)}
                        style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#0f172a', fontSize: '11px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '8px' }}
                        title="Edit signature piece"
                      >
                        <Edit3 size={11} /> Edit
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setActiveTab('catalog')}
                      style={{ background: 'none', border: 'none', color: '#0284c7', fontSize: '11px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                    >
                      View All ({totalProductsCount}) <ArrowUpRight size={12} />
                    </button>
                  </div>
                </div>

                {activeProducts.length > 0 ? (
                  <div 
                    onClick={() => handleStartEditProduct(0)}
                    style={{ display: 'flex', gap: '12px', alignItems: 'center', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '14px', border: '1px solid #e2e8f0', cursor: 'pointer' }}
                    title="Click to edit"
                  >
                    {activeProducts[0].image && (
                      <img
                        src={activeProducts[0].image}
                        alt={activeProducts[0].name}
                        style={{ width: '56px', height: '56px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0, border: '1px solid #cbd5e1' }}
                      />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h5 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {activeProducts[0].name}
                      </h5>
                      <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#64748b' }}>
                        {activeProducts[0].tagline || activeProducts[0].volume || 'Signature Creation'}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#0284c7' }}>
                          {activeProducts[0].price ? (activeProducts[0].price.startsWith('$') || activeProducts[0].price.startsWith('₹') ? activeProducts[0].price : `₹${activeProducts[0].price}`) : 'Price upon request'}
                        </span>
                        {activeProducts[0].inventory && (
                          <span style={{ fontSize: '10px', fontWeight: 700, color: '#16a34a', backgroundColor: '#dcfce7', padding: '2px 6px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <Package size={10} /> {String(activeProducts[0].inventory).toLowerCase().includes('stock') || String(activeProducts[0].inventory).toLowerCase().includes('unit') ? activeProducts[0].inventory : `${activeProducts[0].inventory} in stock`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div 
                    onClick={handleOpenAddModal}
                    style={{ cursor: 'pointer', textAlign: 'center', padding: '20px 14px', border: '1px dashed #cbd5e1', borderRadius: '14px', backgroundColor: '#f8fafc' }}
                  >
                    <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#64748b' }}>No pieces listed yet.</p>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>
                      <Plus size={13} /> Add First Creation
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* TAB 1: Product Catalog */}
        {activeTab === 'catalog' && (
          <div>
            <div className={styles.darkSectionHeaderRow}>
              <h3 className={styles.darkSectionTitle}>
                Your Collection ({totalProductsCount})
              </h3>
              <button
                type="button"
                onClick={handleOpenAddModal}
                className={styles.darkAddBtn}
              >
                <Plus size={13} />
                <span>Add Product</span>
              </button>
            </div>

            {totalProductsCount === 0 ? (
              <div 
                className={styles.darkCardBox} 
                onClick={handleOpenAddModal} 
                style={{ cursor: 'pointer', textAlign: 'center', padding: '32px 18px', border: '1px dashed #cbd5e1', backgroundColor: '#f8fafc' }}
              >
                <span className={styles.darkCardTag}>Empty Catalog</span>
                <h4 className={styles.darkCardTitle}>No products listed yet</h4>
                <p className={styles.darkCardDesc} style={{ margin: '6px 0 14px 0', color: '#64748b' }}>
                  Tap below to list your first signature creation on your Drobe profile.
                </p>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>
                  <Plus size={14} /> Add First Product
                </span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {activeProducts.map((prod, idx) => {
                  const displayPrice = prod.price 
                    ? (prod.price.trim().startsWith('$') || prod.price.trim().startsWith('₹') ? prod.price.trim() : `₹${prod.price.trim()}`)
                    : 'Price upon request';

                  const productImages = prod.images && prod.images.length > 0 
                    ? prod.images 
                    : (prod.image ? [prod.image] : []);
                  const mainImage = productImages[0];

                  const darkstoreProds = darkstoreProducts;
                  const matchingDarkstore = darkstoreProds.find(dp => dp.name?.toLowerCase().trim() === prod.name?.toLowerCase().trim() || dp.id === prod.id);

                  const assignedSku = prod.sku || matchingDarkstore?.sku;
                  const warehouseLocation = prod.warehouseLocation || matchingDarkstore?.warehouseLocation;
                  const inwardStatus = prod.inwardStatus || matchingDarkstore?.inwardStatus || (assignedSku ? 'Inwarded & Live' : 'Pending Stock Dispatch');
                  const isLive = inwardStatus === 'Inwarded & Live' || Boolean(assignedSku);

                  return (
                    <div key={idx} className={styles.darkCardBox} style={{ position: 'relative' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
                          <span className={styles.darkCardTag}>
                            {prod.volume || `Offering 0${idx + 1}`}
                          </span>
                          {assignedSku ? (
                            <span style={{ fontSize: '10px', fontWeight: 800, color: '#16a34a', backgroundColor: '#dcfce7', padding: '2px 7px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                              <Barcode size={10} /> {assignedSku}
                            </span>
                          ) : (
                            <span style={{ fontSize: '9.5px', fontWeight: 600, color: '#94a3b8', backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '6px' }}>
                              SKU Pending
                            </span>
                          )}
                          {isLive ? (
                            <span style={{ fontSize: '10px', fontWeight: 700, color: '#0284c7', backgroundColor: '#e0f2fe', padding: '2px 7px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                              <Zap size={10} /> 30-Min Live
                            </span>
                          ) : inwardStatus === 'Stock In Transit to Ahmedabad' ? (
                            <span style={{ fontSize: '10px', fontWeight: 700, color: '#b45309', backgroundColor: '#fef3c7', padding: '2px 7px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                              <Truck size={10} /> In Transit
                            </span>
                          ) : (
                            <span style={{ fontSize: '10px', fontWeight: 600, color: '#64748b', backgroundColor: '#f1f5f9', padding: '2px 7px', borderRadius: '8px' }}>
                              Awaiting Inward
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className={styles.darkCardPrice}>
                            {displayPrice}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleStartEditProduct(idx)}
                            style={{ 
                              background: '#f8fafc', 
                              border: '1px solid #e2e8f0', 
                              color: '#0f172a', 
                              cursor: 'pointer', 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: '4px',
                              padding: '4px 9px',
                              borderRadius: '10px',
                              fontSize: '11px',
                              fontWeight: 600,
                              boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                            }}
                            title="Edit product"
                          >
                            <Edit3 size={11} />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(idx)}
                            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px', borderRadius: '8px' }}
                            title="Delete product"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '12px' }}>
                        {mainImage && (
                          <div 
                            onClick={() => handleStartEditProduct(idx)}
                            style={{ position: 'relative', width: '64px', height: '64px', flexShrink: 0, cursor: 'pointer' }}
                            title="Click to edit product"
                          >
                            <img
                              src={mainImage}
                              alt={prod.name}
                              style={{ width: '100%', height: '100%', borderRadius: '12px', objectFit: 'cover', border: '1px solid #e2e8f0' }}
                            />
                            {productImages.length > 1 && (
                              <span style={{ position: 'absolute', bottom: '2px', right: '2px', backgroundColor: 'rgba(15, 23, 42, 0.85)', color: '#ffffff', fontSize: '8px', fontWeight: 800, padding: '1px 4px', borderRadius: '4px' }}>
                                +{productImages.length - 1}
                              </span>
                            )}
                          </div>
                        )}

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4 
                            onClick={() => handleStartEditProduct(idx)}
                            className={styles.darkCardTitle}
                            style={{ cursor: 'pointer' }}
                            title="Click to edit product"
                          >
                            {prod.name}
                          </h4>
                          {prod.tagline && (
                            <div className={styles.darkCardSub}>
                              {prod.tagline}
                            </div>
                          )}
                          {prod.description && (
                            <p className={styles.darkCardDesc}>
                              {prod.description}
                            </p>
                          )}
                          {(prod.primaryColor || prod.fabric) && (
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                              {prod.primaryColor && (
                                <span style={{ fontSize: '10px', fontWeight: 600, color: '#334155', backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '6px' }}>
                                  Color: {prod.primaryColor}
                                </span>
                              )}
                              {prod.fabric && (
                                <span style={{ fontSize: '10px', fontWeight: 600, color: '#334155', backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '6px' }}>
                                  Fabric: {prod.fabric}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Extra thumbnail strip if multiple images */}
                          {productImages.length > 1 && (
                            <div style={{ display: 'flex', gap: '5px', marginTop: '8px', overflowX: 'auto', paddingBottom: '2px' }}>
                              {productImages.map((img, i) => (
                                <img
                                  key={i}
                                  src={img}
                                  alt=""
                                  style={{ width: '28px', height: '28px', borderRadius: '6px', objectFit: 'cover', border: i === 0 ? '1.5px solid #0284c7' : '1px solid #e2e8f0', flexShrink: 0 }}
                                />
                              ))}
                            </div>
                          )}

                          {/* Darkstore Shelf or Dispatch Action */}
                          {warehouseLocation ? (
                            <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '6px 10px', marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: '11px', color: '#166534', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <MapPin size={12} color="#16a34a" /> Shelf: <strong>{warehouseLocation.code || `${warehouseLocation.rack} · ${warehouseLocation.shelf}`}</strong>
                              </span>
                              <span style={{ fontSize: '9.5px', color: '#15803d', fontWeight: 700, textTransform: 'uppercase' }}>Ahmedabad Hub</span>
                            </div>
                          ) : inwardStatus === 'Stock In Transit to Ahmedabad' ? (
                            <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '10px', padding: '6px 10px', marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: '11px', color: '#b45309', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <Truck size={12} color="#d97706" /> In transit to Ahmedabad SG Highway Darkstore
                              </span>
                              <span style={{ fontSize: '9.5px', color: '#b45309', fontWeight: 700 }}>Awaiting Inward</span>
                            </div>
                          ) : (
                            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '6px 10px', marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: '11px', color: '#64748b' }}>
                                Stock not yet sent to Ahmedabad Darkstore
                              </span>
                              {isBrandApproved ? (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDispatchProductIndex(idx);
                                    setDispatchUnits(Number(prod.inventory) || 20);
                                    setShowDispatchModal(true);
                                  }}
                                  style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                >
                                  <Truck size={11} /> Send Stock
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (onToast) onToast('🔒 Consignment dispatch unlocks once your brand profile is approved.');
                                  }}
                                  style={{ background: '#f1f5f9', color: '#94a3b8', border: '1px solid #cbd5e1', padding: '4px 8px', borderRadius: '8px', fontSize: '10.5px', fontWeight: 600, cursor: 'not-allowed', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                  title="Awaiting Approval"
                                >
                                  <Lock size={11} /> Locked (Awaiting Approval)
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* TAB 2: Store Analytics & Reach */}
        {activeTab === 'analytics' && (
          <div>
            <div className={styles.darkSectionHeaderRow}>
              <h3 className={styles.darkSectionTitle}>Analytics</h3>
              <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
                <TrendingUp size={12} /> Active Telemetry
              </span>
            </div>

            {/* 2x2 Stats Grid */}
            <div className={styles.analyticsGrid}>
              <div className={styles.statCard}>
                <span className={styles.statCardLabel}>Brand Page Views</span>
                <span className={styles.statCardValue}>0</span>
                <span className={styles.statCardTrend}><TrendingUp size={11} /> 0%</span>
              </div>

              <div className={styles.statCard}>
                <span className={styles.statCardLabel}>Overall Product Views</span>
                <span className={styles.statCardValue}>0</span>
                <span className={styles.statCardTrend}><TrendingUp size={11} /> 0%</span>
              </div>

              <div className={styles.statCard}>
                <span className={styles.statCardLabel}>Products Sold</span>
                <span className={styles.statCardValue}>0</span>
                <span className={styles.statCardTrend}><TrendingUp size={11} /> 0%</span>
              </div>

              <div className={styles.statCard}>
                <span className={styles.statCardLabel}>Total Value</span>
                <span className={styles.statCardValue}>₹0</span>
                <span className={styles.statCardTrend}><TrendingUp size={11} /> 0%</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB: Ahmedabad Darkstore Hub & Inward Stock Tracking */}
        {activeTab === 'warehouse' && (
          <div>
            {/* Hub Header Card */}
            <div className={styles.darkCardBox} style={{ marginBottom: '14px', border: '1px solid #bae6fd', backgroundColor: '#f0f9ff' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: '#0284c7', background: '#e0f2fe', padding: '3px 8px', borderRadius: '8px', letterSpacing: '0.05em' }}>
                  CENTRAL DARKSTORE CONSIGNMENT
                </span>
                <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={12} /> Hub Operational
                </span>
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>
                {AHMEDABAD_WAREHOUSE.name}
              </h3>
              <p style={{ fontSize: '11.5px', color: '#475569', margin: '0 0 10px 0', lineHeight: 1.45 }}>
                {AHMEDABAD_WAREHOUSE.address}
              </p>

              <div style={{ background: '#ffffff', borderRadius: '12px', padding: '10px 12px', border: '1px solid #e0f2fe', marginBottom: '12px', fontSize: '11px', color: '#334155' }}>
                <strong>Consignment Protocol:</strong> Your creations are stored securely on assigned racks at our Ahmedabad darkstore. When a client orders in Ahmedabad, our delivery partner delivers in 30 minutes and waits right outside the door while the customer tries the outfits on the spot. Customer keeps what they want, and hands unpurchased garments back instantly to the delivery partner, which return straight back to your warehouse shelf with an instant refund to the client.
              </div>

              {isBrandApproved ? (
                <button
                  type="button"
                  onClick={() => {
                    setDispatchProductIndex(0);
                    setDispatchUnits(20);
                    setShowDispatchModal(true);
                  }}
                  style={{ width: '100%', background: '#0284c7', color: '#ffffff', border: 'none', borderRadius: '12px', padding: '10px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <Truck size={14} /> Send Inward Stock to Ahmedabad Hub
                </button>
              ) : (
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '10px 12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <Clock size={14} /> Consignment Dispatch Locked
                  </div>
                  <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#92400e' }}>
                    Awaiting brand profile approval before stock can be sent to Shivam Bungalows 1, Koteshwar Road.
                  </p>
                </div>
              )}
            </div>

            {/* Inward Consignments Dispatched by Brand */}
            <div className={styles.darkCardBox} style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Inward Shipments to Ahmedabad
                </h4>
                <span style={{ fontSize: '11px', color: '#64748b' }}>
                  {brandInboundShipments.length} consignments
                </span>
              </div>

              {brandInboundShipments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 16px', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '12px' }}>
                  <Truck size={20} color="#94a3b8" style={{ margin: '0 auto 6px auto', display: 'block' }} />
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>0 Inward Shipments</div>
                  <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#64748b' }}>
                    Dispatch stock to Ahmedabad Darkstore Hub to enable 10-minute doorstep fittings for your pieces.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {brandInboundShipments.map((ship) => {
                    const isVerified = ship.status === 'Verified & Shelved';
                    return (
                      <div key={ship.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                              {ship.productName}
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>
                              {ship.id} · {ship.units} units via {ship.courierPartner}
                            </div>
                          </div>
                          {isVerified ? (
                            <span style={{ fontSize: '10px', fontWeight: 700, color: '#16a34a', backgroundColor: '#dcfce7', padding: '2px 8px', borderRadius: '8px' }}>
                              ✓ Inwarded ({ship.assignedSku})
                            </span>
                          ) : (
                            <span style={{ fontSize: '10px', fontWeight: 700, color: '#b45309', backgroundColor: '#fef3c7', padding: '2px 8px', borderRadius: '8px' }}>
                              🚚 {ship.status}
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10.5px', color: '#94a3b8', paddingTop: '6px', borderTop: '1px solid #e2e8f0' }}>
                          <span>Dispatched: {ship.dispatchDate}</span>
                          {isVerified ? (
                            <span style={{ color: '#0284c7', fontWeight: 700 }}>Stored at {ship.assignedShelf}</span>
                          ) : (
                            <span>Tracking: {ship.trackingNumber}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Warehouse Shelf & SKU Matrix */}
            <div className={styles.darkCardBox}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Your Warehouse Shelves & SKUs
                </h4>
                <span style={{ fontSize: '11px', color: '#0284c7', fontWeight: 600 }}>
                  Ahmedabad Central Hub
                </span>
              </div>

              {activeProducts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 16px', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '12px' }}>
                  <Package size={20} color="#94a3b8" style={{ margin: '0 auto 6px auto', display: 'block' }} />
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>No Products in Catalog</div>
                  <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#64748b' }}>
                    Add pieces to your catalog to assign warehouse shelves and SKU tags.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {activeProducts.map((prod, idx) => {
                    const darkstoreProds = darkstoreProducts;
                    const matchingDarkstore = darkstoreProds.find(dp => dp.name?.toLowerCase().trim() === prod.name?.toLowerCase().trim() || dp.id === prod.id);
                    const assignedSku = prod.sku || matchingDarkstore?.sku;
                    const warehouseLocation = prod.warehouseLocation || matchingDarkstore?.warehouseLocation;
                    const isLive = Boolean(assignedSku);

                    return (
                      <div key={idx} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '11px', fontWeight: 800, color: isLive ? '#16a34a' : '#94a3b8', background: isLive ? '#dcfce7' : '#f1f5f9', padding: '1px 6px', borderRadius: '4px' }}>
                              {assignedSku || 'NO SKU'}
                            </span>
                            <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#0f172a' }}>
                              {prod.name}
                            </span>
                          </div>
                          <div style={{ fontSize: '10.5px', color: '#64748b', marginTop: '2px' }}>
                            {warehouseLocation ? `📍 Stored at ${warehouseLocation.code}` : '📦 Awaiting darkstore placement'}
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: isLive ? '#0284c7' : '#64748b' }}>
                            {isLive ? 'Live (10-Min)' : 'Pending'}
                          </span>
                          <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                            {prod.inventory ?? 0} units
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: Doorstep Fitting & Instant Return Radar */}
        {activeTab === 'trials' && (
          <div>
            <div className={styles.darkCardBox} style={{ marginBottom: '14px', backgroundColor: '#faf5ff', border: '1px solid #e9d5ff' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: '#7e22ce', background: '#f3e8ff', padding: '3px 8px', borderRadius: '8px' }}>
                  DOORSTEP FITTING & INSTANT RETURN RADAR
                </span>
                <span style={{ fontSize: '11px', color: '#7e22ce', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Zap size={12} /> 30-Min Delivery Partner Fleet
                </span>
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>
                Live Doorstep Fittings &amp; Instant Returns
              </h3>
              <p style={{ fontSize: '11px', color: '#6b21a8', margin: 0, lineHeight: 1.45 }}>
                Delivery partners pick your creations directly from your assigned warehouse shelf and deliver within 30 minutes. The delivery partner waits right outside the customer&apos;s door for 6 minutes while they try on. Customer keeps what they want, and hands back the rest instantly to the delivery partner, who returns straight back to restock your shelf.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {brandTrialOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '36px 16px', background: '#ffffff', border: '1px dashed #cbd5e1', borderRadius: '16px' }}>
                  <RotateCcw size={26} color="#94a3b8" style={{ margin: '0 auto 8px auto', display: 'block' }} />
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                    0 Doorstep Trials Recorded
                  </div>
                  <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#64748b', maxWidth: '360px', marginInline: 'auto', lineHeight: 1.5 }}>
                    No doorstep fittings or returns yet for {brand.name || 'your brand'}. Once customers request 10-minute trials at home, orders will track here in real-time.
                  </p>
                </div>
              ) : (
                brandTrialOrders.map((ord) => {
                  const isDoorstepFitting = (ord.status || '').includes('Doorstep Fitting');
                  const isOut = ord.status === 'Out for 30-Min Delivery';
                  const isKept = ord.status === 'Kept on Spot (Purchased)';
                  const isRunnerReturning = (ord.status || '').includes('Returned on Spot');
                  const isRestocked = ord.status === 'Restocked to Warehouse Shelf';

                  return (
                    <div key={ord.id} className={styles.darkCardBox} style={{ padding: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 800, color: '#0284c7' }}>
                          {ord.orderNumber}
                        </span>
                        {isDoorstepFitting ? (
                          <span style={{ fontSize: '10px', fontWeight: 700, color: '#7e22ce', backgroundColor: '#f3e8ff', padding: '2px 8px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <Clock size={10} /> Delivery Partner Waiting Outside ({ord.doorstepTimerMinutesLeft || 6}m fitting window)
                          </span>
                        ) : isOut ? (
                          <span style={{ fontSize: '10px', fontWeight: 700, color: '#b45309', backgroundColor: '#fef3c7', padding: '2px 8px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <Truck size={10} /> Out for 30-Min Delivery
                          </span>
                        ) : isKept ? (
                          <span style={{ fontSize: '10px', fontWeight: 700, color: '#16a34a', backgroundColor: '#dcfce7', padding: '2px 8px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <CheckCircle2 size={10} /> Kept on Spot · Purchased
                          </span>
                        ) : isRunnerReturning ? (
                          <span style={{ fontSize: '10px', fontWeight: 700, color: '#b45309', backgroundColor: '#fef3c7', padding: '2px 8px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <RotateCcw size={10} /> Handed Back at Door · Heading to Hub
                          </span>
                        ) : (
                          <span style={{ fontSize: '10px', fontWeight: 700, color: '#059669', backgroundColor: '#ecfdf5', padding: '2px 8px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <CheckCircle2 size={10} /> Restocked to Shelf · Client Refunded
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                            {ord.productName} ({ord.size})
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>
                            SKU: <strong style={{ color: '#16a34a' }}>{ord.productSku}</strong> · Shelf: <strong style={{ color: '#0284c7' }}>{ord.shelfLocation}</strong>
                          </div>
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                          {ord.price}
                        </span>
                      </div>

                      {ord.notes && (
                        <div style={{ fontSize: '10.5px', color: '#475569', background: '#f8fafc', padding: '6px 8px', borderRadius: '6px', margin: '6px 0', borderLeft: '2px solid #0284c7' }}>
                          {ord.notes}
                        </div>
                      )}

                      <div style={{ fontSize: '10.5px', color: '#94a3b8', borderTop: '1px solid #f1f5f9', paddingTop: '6px', marginTop: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div><strong>Client:</strong> {ord.customerName} ({ord.distanceKm} from hub)</div>
                        <div style={{ color: '#0284c7', fontWeight: 600 }}>Delivery Partner: {ord.riderName}</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 4: Settlements & Money Tracking (Minimal & Cute) */}
        {activeTab === 'payouts' && (
          <div>
            {/* Minimal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Payouts
              </h3>
              <span style={{ fontSize: '11px', color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: '#ecfdf5', padding: '3px 10px', borderRadius: '20px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                T+1 Auto IMPS
              </span>
            </div>

            {/* Hero Card: Tomorrow's Payout (Minimal & Cute) */}
            <div className={styles.payoutHeroCard}>
              <div className={styles.payoutHeroTopRow}>
                <span className={styles.payoutHeroTag}>
                  ✨ Tomorrow&apos;s Payout
                </span>

                <button
                  type="button"
                  onClick={() => setShowBankModal(true)}
                  className={styles.payoutTomorrowBadge}
                  title="Update linked payout destination"
                >
                  {currentBankAccount.payoutMethod === 'upi' ? (
                    <Zap size={12} color="#7c3aed" />
                  ) : (
                    <Building2 size={12} color="#0284c7" />
                  )}
                  <span>
                    {currentBankAccount.payoutMethod === 'upi'
                      ? `UPI: ${currentBankAccount.upiId || 'Instant VPA'}`
                      : `${currentBankAccount.bankName} (•••• ${(currentBankAccount.accountNumber || '').slice(-4)})`}
                  </span>
                  <ChevronRight size={12} color="#94a3b8" />
                </button>
              </div>

              <div className={styles.payoutHeroAmountHuge}>
                {dynamicAnalytics.payout}
              </div>

              <div className={styles.payoutHeroSubtext}>
                {totalGmvNum > 0
                  ? `₹${totalGmvNum.toLocaleString('en-IN')} in verified sales ready for T+1 IMPS dispatch directly to ${currentBankAccount.bankName}.`
                  : 'No pending settlements. Earnings from doorstep kept orders credit automatically on T+1 directly into your bank.'}
              </div>
            </div>

            {/* 4 Cute Financial Bento Tiles */}
            <div className={styles.payoutGrid}>
              <div className={styles.payoutGridCard}>
                <span className={styles.payoutGridLabel}>Total Sales</span>
                <span className={styles.payoutGridValue}>{dynamicAnalytics.gmv}</span>
                <span className={styles.payoutGridNote} style={{ backgroundColor: '#f1f5f9', color: '#64748b' }}>
                  {dynamicAnalytics.gmvTrend}
                </span>
              </div>

              <div className={styles.payoutGridCard}>
                <span className={styles.payoutGridLabel}>Today&apos;s Total Sales</span>
                <span className={styles.payoutGridValue}>{dynamicAnalytics.gmv}</span>
                <span className={styles.payoutGridNote} style={{ backgroundColor: '#f0f9ff', color: '#0284c7' }}>
                  {dynamicAnalytics.ordersCount}
                </span>
              </div>

              <div className={styles.payoutGridCard}>
                <span className={styles.payoutGridLabel}>T+1 Payout Value</span>
                <span className={styles.payoutGridValue}>{dynamicAnalytics.payout}</span>
                <span className={styles.payoutGridNote} style={{ backgroundColor: '#f1f5f9', color: '#64748b' }}>
                  {totalGmvNum > 0 ? `${dynamicAnalytics.payout} scheduled` : '₹0 scheduled'}
                </span>
              </div>

              <div className={styles.payoutGridCard}>
                <span className={styles.payoutGridLabel}>Past Payouts</span>
                <span className={styles.payoutGridValue}>₹0</span>
                <span className={styles.payoutGridNote} style={{ backgroundColor: '#f8fafc', color: '#475569' }}>
                  0 payouts cleared
                </span>
              </div>
            </div>

            {/* Cute Settlement Cycle Progress Strip */}
            <div className={styles.settlementFlowCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
                  How Payouts Work
                </span>
                <span style={{ fontSize: '10px', color: '#94a3b8' }}>
                  Instant Doorstep Decisions
                </span>
              </div>

              <div className={styles.settlementFlowSteps}>
                <div className={styles.settlementStepItem}>
                  <div className={styles.settlementStepNum}>STEP 1</div>
                  <div className={styles.settlementStepTitle}>⚡ 10m Delivery</div>
                </div>

                <div className={styles.settlementStepArrow}>➔</div>

                <div className={styles.settlementStepItem}>
                  <div className={styles.settlementStepNum}>STEP 2</div>
                  <div className={styles.settlementStepTitle}>👗 Doorstep Try-On</div>
                </div>

                <div className={styles.settlementStepArrow}>➔</div>

                <div className={styles.settlementStepItem} style={{ borderColor: '#bae6fd', backgroundColor: '#f0f9ff' }}>
                  <div className={styles.settlementStepNum} style={{ color: '#0284c7' }}>STEP 3</div>
                  <div className={styles.settlementStepTitle} style={{ color: '#0369a1' }}>💳 Bank Credit</div>
                </div>
              </div>
            </div>

            {/* Past Payouts History Ledger (Clean & Cute) */}
            <div className={styles.pastPayoutsCard}>
              <div className={styles.pastPayoutsHeaderRow}>
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Past Payouts
                </h4>

                <button
                  type="button"
                  onClick={() => onToast ? onToast('Downloading Settlement Statement & GST Invoices...') : undefined}
                  style={{ padding: '5px 10px', borderRadius: '14px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', color: '#0f172a', fontSize: '11px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Download size={11} /> Statement
                </button>
              </div>

              <div className={styles.pastPayoutsList}>
                <div style={{ textAlign: 'center', padding: '28px 16px', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '14px' }}>
                  <Wallet size={22} color="#94a3b8" style={{ margin: '0 auto 6px auto', display: 'block' }} />
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>0 Past Settlements</div>
                  <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#64748b' }}>
                    No payout transfers recorded yet. Completed doorstep orders are automatically settled T+1 to your bank.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: Brand Profile, Settings & Support */}
        {activeTab === 'profile' && (
          <div>
            {/* Brand Identity & Founder Card */}
            <div className={styles.darkCardBox} style={{ marginBottom: '14px' }}>
              <span className={styles.darkCardTag}>Verified Brand</span>
              <h4 className={styles.darkCardTitle}>Founder Dossier</h4>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px', marginBottom: '14px' }}>
                {brand.profileImage ? (
                  <img
                    src={brand.profileImage}
                    alt={brand.name}
                    style={{ width: '56px', height: '56px', borderRadius: '14px', objectFit: 'cover', border: '1px solid #cbd5e1' }}
                  />
                ) : (
                  <div style={{ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: '#0f172a', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 700 }}>
                    {brand.name ? brand.name.slice(0, 1).toUpperCase() : 'D'}
                  </div>
                )}
                <div>
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#0f172a' }}>
                    {brand.founderName || brand.name || 'Founder'}
                  </h4>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    {brand.founderRole || 'Creative Director'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#0284c7', fontWeight: 600, marginTop: '2px' }}>
                    {brand.basedOutOf || 'Global'} · Est. {brand.establishedYear || '2024'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '9px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Audience</div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                    {normalizedCategory === 'MALE & FEMALE' ? 'Male & Female' : normalizedCategory}
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '9px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Store Status</div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: isStoreLive ? '#16a34a' : '#ea580c', marginTop: '2px' }}>
                    {isStoreLive ? 'Live on Drobe' : 'Vacation Paused'}
                  </div>
                </div>
              </div>

              {/* Edit Brand Actions */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(true)}
                  style={{ flex: 1, padding: '12px', borderRadius: '14px', backgroundColor: '#0f172a', color: '#ffffff', border: 'none', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <Edit3 size={14} /> Edit Brand Dossier
                </button>

                {onShareClick && (
                  <button
                    type="button"
                    onClick={onShareClick}
                    style={{ padding: '12px 16px', borderRadius: '14px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', color: '#0f172a', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Share2 size={14} /> Share
                  </button>
                )}
              </div>
            </div>

            {/* Settlement Bank Account Card */}
            <div className={styles.settingsCardBox}>
              <div className={styles.settingsCardHeader}>
                <div>
                  <span className={styles.settingsCardTag}>T+1 Payout Destination</span>
                  <h4 className={styles.settingsCardTitle}>Settlement Bank Account</h4>
                </div>
                <button
                  type="button"
                  onClick={() => setShowBankModal(true)}
                  style={{ padding: '6px 12px', borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                >
                  {brand.bankAccount ? 'Update Bank' : '+ Add Bank Account'}
                </button>
              </div>

              <div className={styles.profileBankCard}>
                <div className={styles.profileBankTop}>
                  <span className={styles.profileBankName}>
                    {currentBankAccount.payoutMethod === 'upi' ? (
                      <>
                        <Zap size={16} color="#7c3aed" />
                        UPI Instant Settlement
                      </>
                    ) : (
                      <>
                        <Building2 size={16} color="#0284c7" />
                        {currentBankAccount.bankName}
                      </>
                    )}
                  </span>
                  <span 
                    className={styles.profileBankBadge}
                    style={currentBankAccount.payoutMethod === 'upi' ? { backgroundColor: '#f5f3ff', color: '#6d28d9', borderColor: '#ddd6fe' } : undefined}
                  >
                    <ShieldCheck size={11} /> {currentBankAccount.payoutMethod === 'upi' ? 'Instant UPI' : 'Verified IMPS'}
                  </span>
                </div>

                <div className={styles.profileBankNumber}>
                  {currentBankAccount.payoutMethod === 'upi'
                    ? (currentBankAccount.upiId || 'VPA Configured')
                    : `•••• •••• ${(currentBankAccount.accountNumber || '').slice(-4)}`}
                </div>

                <div className={styles.profileBankMeta}>
                  <span>Beneficiary: <strong>{currentBankAccount.accountHolderName}</strong></span>
                  {currentBankAccount.payoutMethod !== 'upi' && (
                    <span>IFSC: <strong>{currentBankAccount.ifscCode}</strong> ({currentBankAccount.accountType})</span>
                  )}
                </div>
              </div>
            </div>

            {/* Store & Dispatch Settings */}
            <div className={styles.settingsCardBox}>
              <div className={styles.settingsCardHeader}>
                <div>
                  <span className={styles.settingsCardTag}>Store Controls</span>
                  <h4 className={styles.settingsCardTitle}>Store Settings & Dispatch</h4>
                </div>
              </div>

              <div className={styles.settingsRowsList}>
                {/* Store Status Toggle */}
                <div className={styles.settingsRowItem}>
                  <div className={styles.settingsRowLeft}>
                    <div className={styles.settingsRowIconWrap}>
                      <Power size={16} color={isStoreLive ? '#10b981' : '#f97316'} />
                    </div>
                    <div>
                      <div className={styles.settingsRowHeading}>Accepting Orders</div>
                      <div className={styles.settingsRowDesc}>
                        {isStoreLive ? 'Live on Drobe (30-min express active)' : 'Vacation Mode (store temporarily paused)'}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !isStoreLive;
                      setIsStoreLive(next);
                      if (onToast) onToast(next ? 'Store is now LIVE on Drobe' : 'Store paused · Vacation mode active');
                    }}
                    className={`${styles.switchToggle} ${isStoreLive ? styles.switchToggleActive : ''}`}
                  >
                    <span className={`${styles.switchThumb} ${isStoreLive ? styles.switchThumbActive : ''}`} />
                  </button>
                </div>

                {/* 30-min Express Radius */}
                <div className={styles.settingsRowItem}>
                  <div className={styles.settingsRowLeft}>
                    <div className={styles.settingsRowIconWrap}>
                      <Zap size={16} color="#0284c7" />
                    </div>
                    <div>
                      <div className={styles.settingsRowHeading}>30-Min Express Dispatch</div>
                      <div className={styles.settingsRowDesc}>Instant rider pickup within 12 km radius</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#0284c7', backgroundColor: '#e0f2fe', padding: '3px 8px', borderRadius: '8px' }}>
                    Active 12km
                  </span>
                </div>

                {/* Try-On Acceptance Window */}
                <div className={styles.settingsRowItem}>
                  <div className={styles.settingsRowLeft}>
                    <div className={styles.settingsRowIconWrap}>
                      <Clock size={16} color="#6366f1" />
                    </div>
                    <div>
                      <div className={styles.settingsRowHeading}>Try-On Acceptance Period</div>
                      <div className={styles.settingsRowDesc}>24 hours client try-on before T+1 settlement</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#4338ca', backgroundColor: '#e0e7ff', padding: '3px 8px', borderRadius: '8px' }}>
                    24 Hours
                  </span>
                </div>

                {/* SMS & WhatsApp Order Alerts */}
                <div className={styles.settingsRowItem}>
                  <div className={styles.settingsRowLeft}>
                    <div className={styles.settingsRowIconWrap}>
                      <Bell size={16} color="#0f172a" />
                    </div>
                    <div>
                      <div className={styles.settingsRowHeading}>Order Dispatch Notifications</div>
                      <div className={styles.settingsRowDesc}>Instant WhatsApp & SMS dispatch alerts</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !smsAlertsEnabled;
                      setSmsAlertsEnabled(next);
                      if (onToast) onToast(next ? 'Order dispatch alerts enabled' : 'Order dispatch alerts muted');
                    }}
                    className={`${styles.switchToggle} ${smsAlertsEnabled ? styles.switchToggleActive : ''}`}
                  >
                    <span className={`${styles.switchThumb} ${smsAlertsEnabled ? styles.switchThumbActive : ''}`} />
                  </button>
                </div>

                {/* Daily T+1 Settlement Digest */}
                <div className={styles.settingsRowItem}>
                  <div className={styles.settingsRowLeft}>
                    <div className={styles.settingsRowIconWrap}>
                      <CreditCard size={16} color="#0f172a" />
                    </div>
                    <div>
                      <div className={styles.settingsRowHeading}>Daily T+1 Settlement Digest</div>
                      <div className={styles.settingsRowDesc}>Morning notification for bank credit status</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !payoutAlertsEnabled;
                      setPayoutAlertsEnabled(next);
                      if (onToast) onToast(next ? 'Daily payout digest enabled' : 'Daily payout digest muted');
                    }}
                    className={`${styles.switchToggle} ${payoutAlertsEnabled ? styles.switchToggleActive : ''}`}
                  >
                    <span className={`${styles.switchThumb} ${payoutAlertsEnabled ? styles.switchThumbActive : ''}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Official Touchpoints */}
            <div className={styles.darkCardBox} style={{ marginBottom: '14px' }}>
              <span className={styles.darkCardTag}>Verified Channels</span>
              <h4 className={styles.darkCardTitle}>Official Touchpoints</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                {brand.website && (
                  <a
                    href={brand.website.startsWith('http') ? brand.website : `https://${brand.website}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#0f172a', textDecoration: 'none', padding: '10px 12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px' }}
                  >
                    <Globe size={15} color="#0284c7" />
                    <span style={{ fontSize: '12px', fontWeight: 500 }}>{brand.website}</span>
                  </a>
                )}

                {brand.instagram && (
                  <a
                    href={`https://instagram.com/${brand.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#0f172a', textDecoration: 'none', padding: '10px 12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px' }}
                  >
                    <InstagramIcon size={15} color="#ec4899" />
                    <span style={{ fontSize: '12px', fontWeight: 500 }}>{brand.instagram}</span>
                  </a>
                )}

                {brand.inquiriesEmail && (
                  <a
                    href={`mailto:${brand.inquiriesEmail}`}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#0f172a', textDecoration: 'none', padding: '10px 12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px' }}
                  >
                    <Mail size={15} color="#059669" />
                    <span style={{ fontSize: '12px', fontWeight: 500 }}>{brand.inquiriesEmail}</span>
                  </a>
                )}
              </div>
            </div>

            {/* Partner Support & Help Desk */}
            <div className={styles.settingsCardBox}>
              <div className={styles.settingsCardHeader}>
                <div>
                  <span className={styles.settingsCardTag}>Concierge Support</span>
                  <h4 className={styles.settingsCardTitle}>Partner Help & Support Desk</h4>
                </div>
              </div>

              <div className={styles.supportGrid}>
                {/* 1. Helpline */}
                <a
                  href="tel:+918003762300"
                  className={styles.supportItemCard}
                >
                  <div className={styles.supportItemIcon} style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>
                    <Phone size={15} />
                  </div>
                  <div className={styles.supportItemTitle}>Partner Helpline</div>
                  <div className={styles.supportItemSub}>+91 800-DROBE-HQ · 24/7 dedicated line</div>
                </a>

                {/* 2. WhatsApp Concierge */}
                <a
                  href="https://wa.me/918003762300?text=Hi%20Drobe%20Partner%20Desk,%20I%20need%20assistance%20with%20my%20brand"
                  target="_blank"
                  rel="noreferrer"
                  className={styles.supportItemCard}
                >
                  <div className={styles.supportItemIcon} style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
                    <MessageCircle size={15} />
                  </div>
                  <div className={styles.supportItemTitle}>WhatsApp Concierge</div>
                  <div className={styles.supportItemSub}>Direct chat with Partner Desk</div>
                </a>

                {/* 3. Partner Email */}
                <a
                  href="mailto:partners@drobe.luxury"
                  className={styles.supportItemCard}
                >
                  <div className={styles.supportItemIcon} style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
                    <Mail size={15} />
                  </div>
                  <div className={styles.supportItemTitle}>Priority Inquiries</div>
                  <div className={styles.supportItemSub}>partners@drobe.luxury</div>
                </a>

                {/* 4. Packaging & Protocol */}
                <div
                  onClick={() => onToast ? onToast('Opening Drobe Packaging & Protocol Guide') : undefined}
                  className={styles.supportItemCard}
                  style={{ cursor: 'pointer' }}
                >
                  <div className={styles.supportItemIcon} style={{ backgroundColor: '#f1f5f9', color: '#475569' }}>
                    <FileText size={15} />
                  </div>
                  <div className={styles.supportItemTitle}>Partner Guidelines</div>
                  <div className={styles.supportItemSub}>Packaging, dispatch & return protocol</div>
                </div>
              </div>
            </div>

            {/* Session Sign Out */}
            <div style={{ marginTop: '8px', marginBottom: '8px' }}>
              <button
                type="button"
                onClick={() => {
                  if (onSignOut) {
                    onSignOut();
                  } else if (onToast) {
                    onToast('Signed out of brand session');
                  }
                }}
                className={styles.signOutCardBtn}
              >
                <LogOut size={16} /> Sign Out
              </button>

              <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '11px', color: '#94a3b8' }}>
                DROBE Partner Portal v2.4.0 · 256-Bit SSL Encrypted
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Floating Bottom Navigation Bar (6 Interactive Buttons) */}
      <div className={styles.darkFloatingNav}>
        <button
          type="button"
          onClick={() => setActiveTab('home')}
          className={`${styles.darkNavTab} ${activeTab === 'home' ? styles.darkNavTabActive : ''}`}
          title="Home"
        >
          <Home size={18} />
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('catalog')}
          className={`${styles.darkNavTab} ${activeTab === 'catalog' ? styles.darkNavTabActive : ''}`}
          title="Collection"
        >
          <LayoutGrid size={18} />
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('warehouse')}
          className={`${styles.darkNavTab} ${activeTab === 'warehouse' ? styles.darkNavTabActive : ''}`}
          title="Ahmedabad Darkstore Hub & Inward"
        >
          <Boxes size={18} />
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('trials')}
          className={`${styles.darkNavTab} ${activeTab === 'trials' ? styles.darkNavTabActive : ''}`}
          title="Doorstep Fittings & Instant Returns"
        >
          <Truck size={18} />
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('payouts')}
          className={`${styles.darkNavTab} ${activeTab === 'payouts' ? styles.darkNavTabActive : ''}`}
          title="Payouts & Money"
        >
          <Wallet size={18} />
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`${styles.darkNavTab} ${activeTab === 'profile' ? styles.darkNavTabActive : ''}`}
          title="Profile & Settings"
        >
          <User size={18} />
        </button>
      </div>

      {/* 4. Add Product Modal (Clean White Theme) */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(3px)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: '440px', backgroundColor: '#ffffff', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', padding: '22px 20px 32px 20px', border: '1px solid #e2e8f0', boxShadow: '0 -10px 40px rgba(15, 23, 42, 0.12)', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#0284c7', fontWeight: 700 }}>
                  CATALOG MANAGER
                </span>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a', margin: '2px 0 0 0' }}>
                  {editingProductIndex !== null ? 'Edit Product' : 'Add Product'}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveNewProduct}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '11px', color: '#475569', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Product Name *
                </label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="e.g. Sculpted Wool Overcoat"
                  required
                  style={{ width: '100%', padding: '10px 12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#0f172a', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: '#475569', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    Price
                  </label>
                  <input
                    type="text"
                    value={newProduct.price || ''}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    placeholder="e.g. ₹4,200"
                    style={{ width: '100%', padding: '10px 12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#0f172a', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: '#475569', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    Sizing / Volume
                  </label>
                  <input
                    type="text"
                    value={newProduct.volume || ''}
                    onChange={(e) => setNewProduct({ ...newProduct, volume: e.target.value })}
                    placeholder="e.g. S / M / L or 50 ml"
                    style={{ width: '100%', padding: '10px 12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#0f172a', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* Inventory / Stock Units */}
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '11px', color: '#475569', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>
                    Available Inventory / Stock Units
                  </label>
                  <span style={{ fontSize: '10px', color: '#16a34a', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                    <Package size={10} /> 30-Min Express Ready
                  </span>
                </div>
                <input
                  type="text"
                  value={newProduct.inventory ?? ''}
                  onChange={(e) => setNewProduct({ ...newProduct, inventory: e.target.value })}
                  placeholder="e.g. 24 units in stock (or 'Made-to-Order')"
                  style={{ width: '100%', padding: '10px 12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#0f172a', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              {/* Product Specifications: Primary Color & Fabric */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: '#475569', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    Primary Color *
                  </label>
                  <input
                    type="text"
                    value={newProduct.primaryColor || ''}
                    onChange={(e) => setNewProduct({ ...newProduct, primaryColor: e.target.value })}
                    placeholder="e.g. Black, Olive Green, Beige"
                    style={{ width: '100%', padding: '10px 12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#0f172a', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: '#475569', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    Fabric *
                  </label>
                  <input
                    type="text"
                    value={newProduct.fabric || ''}
                    onChange={(e) => setNewProduct({ ...newProduct, fabric: e.target.value })}
                    placeholder="e.g. Cotton Blend, 100% Linen"
                    style={{ width: '100%', padding: '10px 12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#0f172a', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* Product Description */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '11px', color: '#475569', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Product Description *
                </label>
                <textarea
                  value={newProduct.description || ''}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  placeholder="Enter detailed description of the product, craftsmanship, styling notes..."
                  style={{ width: '100%', padding: '10px 12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#0f172a', fontSize: '13px', outline: 'none', minHeight: '74px', boxSizing: 'border-box' }}
                />
              </div>

              {/* Multiple Photo Upload */}
              <div style={{ marginBottom: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '11px', color: '#475569', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>
                    Product Photos (Multiple)
                  </label>
                  <span style={{ fontSize: '10px', color: '#0284c7', fontWeight: 600 }}>
                    {((newProduct.images && newProduct.images.length > 0) ? newProduct.images.length : (newProduct.image ? 1 : 0))} photos selected
                  </span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                  {((newProduct.images && newProduct.images.length > 0) ? newProduct.images : (newProduct.image ? [newProduct.image] : [])).map((imgUrl, imgIdx) => (
                    <div key={imgIdx} style={{ position: 'relative', width: '56px', height: '56px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9' }}>
                      <img
                        src={imgUrl}
                        alt={`Photo ${imgIdx + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      {imgIdx === 0 && (
                        <span style={{ position: 'absolute', bottom: '0', left: '0', right: '0', backgroundColor: 'rgba(15, 23, 42, 0.85)', color: '#ffffff', fontSize: '7px', fontWeight: 800, textAlign: 'center', padding: '1px 0', letterSpacing: '0.04em' }}>
                          MAIN
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(imgIdx)}
                        style={{ position: 'absolute', top: '2px', right: '2px', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#ef4444', color: '#ffffff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}
                        title="Remove photo"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}

                  <label style={{ minWidth: '56px', height: '56px', padding: '0 12px', backgroundColor: '#f8fafc', color: '#0f172a', border: '1px dashed #cbd5e1', borderRadius: '10px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxSizing: 'border-box' }}>
                    <Upload size={14} />
                    <span>{((newProduct.images && newProduct.images.length > 0) || newProduct.image) ? '+ Add More' : 'Upload Photos (Multi-Select)'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleMultipleFileUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
                <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '5px' }}>
                  Select one or multiple photos at once. The first photo serves as the primary catalog cover.
                </div>
                {isUploadingProductImages && (
                  <div style={{ fontSize: '11px', color: '#6366f1', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '6px', fontWeight: 500 }}>
                    <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> Uploading directly to Supabase drobe-media bucket (0 Vercel bytes)...
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  style={{ flex: 1, padding: '12px', borderRadius: '12px', backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', color: '#0f172a', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ flex: 1, padding: '12px', borderRadius: '12px', backgroundColor: '#0f172a', border: 'none', color: '#ffffff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                >
                  {editingProductIndex !== null ? 'Save Changes' : 'Save to Collection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Single-Page Seamless Scroll Edit Profile Sheet */}
      <EditBrandProfileSheet
        brand={brand}
        isOpen={isEditingProfile}
        onClose={() => setIsEditingProfile(false)}
        onSave={(updated) => {
          if (onUpdateBrand) {
            onUpdateBrand(updated);
          } else {
            try {
              localStorage.setItem('drobe_brand_profile_v1', JSON.stringify(updated));
            } catch {}
          }
          supabaseUpsertBrand(updated).catch((err) => {
            console.warn('Direct supabaseUpsertBrand error in profile sheet save:', err);
          });
          if (onToast) {
            onToast('Brand profile updated successfully · Live on Drobe');
          }
        }}
      />

      {/* 6. Bank Account Management Modal */}
      <AddBankAccountModal
        currentAccount={brand.bankAccount}
        isOpen={showBankModal}
        onClose={() => setShowBankModal(false)}
        onSave={handleSaveBankAccount}
      />

      {/* 7. Dispatch Stock to Ahmedabad Darkstore Modal */}
      {showDispatchModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(3px)', zIndex: 110, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: '440px', backgroundColor: '#ffffff', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', padding: '22px 20px 32px 20px', border: '1px solid #e2e8f0', boxShadow: '0 -10px 40px rgba(15, 23, 42, 0.15)', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#0284c7', fontWeight: 700 }}>
                  CONSIGNMENT DISPATCH
                </span>
                <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', margin: '2px 0 0 0' }}>
                  Send Stock to Ahmedabad Hub
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDispatchModal(false)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleConfirmDispatch}>
              {/* Destination Hub Notice */}
              <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', padding: '10px 12px', borderRadius: '12px', marginBottom: '14px', fontSize: '11px', color: '#0369a1' }}>
                <strong>Destination:</strong> {AHMEDABAD_WAREHOUSE.name}<br />
                {AHMEDABAD_WAREHOUSE.address}
              </div>

              {/* Select Product */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '11px', color: '#475569', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Select Product *
                </label>
                <select
                  value={dispatchProductIndex}
                  onChange={(e) => setDispatchProductIndex(Number(e.target.value))}
                  style={{ width: '100%', padding: '10px 12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#0f172a', fontSize: '13px', outline: 'none' }}
                >
                  {activeProducts.map((p, i) => (
                    <option key={i} value={i}>{p.name} ({p.volume || 'Standard'}) - {p.price || 'Price upon request'}</option>
                  ))}
                </select>
              </div>

              {/* Number of Units */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '11px', color: '#475569', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Units to Dispatch (Physical Stock) *
                </label>
                <input
                  type="number"
                  min="1"
                  value={dispatchUnits}
                  onChange={(e) => setDispatchUnits(Number(e.target.value))}
                  required
                  style={{ width: '100%', padding: '10px 12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#0f172a', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              {/* Courier Partner */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '11px', color: '#475569', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Logistics / Courier Partner
                </label>
                <select
                  value={dispatchCourier}
                  onChange={(e) => setDispatchCourier(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#0f172a', fontSize: '13px', outline: 'none' }}
                >
                  <option value="BlueDart Express">BlueDart Express</option>
                  <option value="Delhivery Surface">Delhivery Surface</option>
                  <option value="DTDC Air">DTDC Air</option>
                  <option value="Self-Drop at SG Highway Hub">Self-Drop at SG Highway Hub</option>
                </select>
              </div>

              {/* Courier Tracking */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ fontSize: '11px', color: '#475569', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  AWB / Tracking Number (Optional)
                </label>
                <input
                  type="text"
                  value={dispatchTracking}
                  onChange={(e) => setDispatchTracking(e.target.value)}
                  placeholder="e.g. BD-982109282-AMD"
                  style={{ width: '100%', padding: '10px 12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#0f172a', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowDispatchModal(false)}
                  style={{ flex: 1, padding: '12px', borderRadius: '12px', backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', color: '#0f172a', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ flex: 2, padding: '12px', borderRadius: '12px', backgroundColor: '#0284c7', border: 'none', color: '#ffffff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <Truck size={14} /> Dispatch Consignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
