// Drobe Ahmedabad Darkstore & Consignment Hub Shared Data Store
// Connects Brand Dashboard and Admin Inwarding Station
import {
  supabase,
  supabaseInsertOrder,
  supabaseUpdateOrderStatus,
  supabaseUpsertBrand,
  supabaseUpsertProduct,
  supabaseUpsertShipment,
  supabaseRecordOrderEvent,
  supabaseFetchOrders,
  supabaseFetchBrands,
  supabaseFetchProducts,
  supabaseFetchShipments,
  supabaseFetchRunners,
  supabaseDeductProductStock,
  supabaseRestockProductStock,
  supabaseConfirmSoldStock
} from './supabaseClient';

export const AHMEDABAD_WAREHOUSE = {
  id: 'AMD-DARKSTORE-01',
  name: 'Drobe Central Darkstore Hub #01',
  code: 'AMD-HUB-01',
  area: 'Koteshwar Road · Ahmedabad',
  address: 'Shivam Bungalows 1, Koteshwar Road, Ahmedabad',
  contactPerson: 'Harshil Mehta (Darkstore Inward Manager)',
  contactPhone: '+91 79 4892 1001',
  expressRadius: '30-Minute Express Trial Zone (Koteshwar, Motera, Sabarmati, Chandkheda, SG Highway)',
  totalShelves: 96,
  occupiedShelves: 34,
  activeRiders: 18
};

export type BrandApprovalStatus = 'Waiting for Approval' | 'Approved' | 'Rejected' | 'Draft';

export type ProductInwardStatus = 
  | 'Pending Stock Dispatch'
  | 'Stock In Transit to Ahmedabad'
  | 'Received & Verifying at Hub'
  | 'Inwarded & Live'
  | 'Rejected';

export interface WarehouseShelfLocation {
  zone: string; // e.g. "Zone A - Outerwear & Jackets"
  rack: string; // e.g. "Rack A-02"
  shelf: string; // e.g. "Shelf 3"
  bin: string; // e.g. "Bin 04"
  code: string; // e.g. "AMD-RA02-S3-B04"
  hubName: string;
}

export interface DarkstoreBrand {
  id: string;
  name: string;
  tagline: string;
  category: string;
  founderName: string;
  founderRole?: string;
  founderBio?: string;
  founderQuote?: string;
  about?: string;
  mission?: string;
  values?: Array<{ title: string; description: string }>;
  website?: string;
  instagram?: string;
  inquiriesEmail?: string;
  email: string;
  phone?: string;
  basedOutOf: string;
  establishedYear?: string;
  status: BrandApprovalStatus;
  profileImage?: string;
  coverImage?: string;
  appliedDate: string;
  approvedDate?: string;
  totalProductsCount: number;
  inwardedUnitsCount: number;
  bankAccount?: {
    accountHolderName?: string;
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
    accountType?: 'Current' | 'Savings';
    isVerified?: boolean;
  };
  products?: any[];
  dossierData?: any;
}

export interface DarkstoreProduct {
  id: string;
  sku?: string; // DR1, DR2, DR3...
  skuSerial?: number; // 1, 2, 3...
  name: string;
  brandId: string;
  brandName: string;
  category?: string;
  subCategory?: string;
  price: string;
  originalPrice?: number;
  brandBasePrice?: number; // Base wholesale / listing price set by brand (e.g. ₹600)
  markupAmount?: number; // Markup added in rupees (e.g. ₹29)
  markupPercentage?: number; // Actual markup percentage in decimals (e.g. 4.83)
  discountPercentage?: number;
  volume?: string; // sizing (e.g. M, L)
  sizes?: string[];
  thumbnail?: string;
  fabric?: string;
  primaryColor?: string;
  fit?: string;
  gender?: string;
  inventory: number; // units declared
  inwardUnits: number; // units received on shelf
  unitsInTrial: number; // units currently in 30-min trial
  unitsSold: number; // units purchased & kept
  tagline?: string;
  description?: string;
  images: string[];
  inwardStatus: ProductInwardStatus;
  warehouseLocation?: WarehouseShelfLocation;
  inwardDate?: string;
  isLive: boolean; // true only after Admin verification & shelf allocation
}

export interface DrobeMarkupPricing {
  brandBasePrice: number;
  rawWithMarkup: number;
  sellingPrice: number;
  markupAmount: number;
  markupPercentage: number;
  formattedPercentage: string; // e.g. "+4.83%"
}

/**
 * Drobe Markup & Charm Pricing Model:
 * 1. Takes the Brand Base Price B (e.g. ₹600).
 * 2. Adds 5% platform markup: raw = B * 1.05 (e.g. ₹630).
 * 3. Rounds to nearest figure ending in 9:
 *    - 630 -> 629
 *    - 621 -> 619
 *    - 626 -> 629
 *    Formula: Math.max(9, Math.round((raw + 1) / 10) * 10 - 1)
 * 4. Calculates actual markup value and percentage in decimals:
 *    - markupAmount = sellingPrice - B (e.g. ₹29)
 *    - markupPercentage = ((markupAmount / B) * 100).toFixed(2) (e.g. 4.83%)
 */
export function calculateDrobeMarkupPricing(brandBasePrice: number): DrobeMarkupPricing {
  const base = Math.max(0, Math.round(brandBasePrice));
  if (base <= 0) {
    return {
      brandBasePrice: 0,
      rawWithMarkup: 0,
      sellingPrice: 0,
      markupAmount: 0,
      markupPercentage: 0,
      formattedPercentage: '0.00%'
    };
  }

  // 1. Add 5% markup
  const rawWithMarkup = base * 1.05;

  // 2. Round to closest figure ending in 9 (e.g. 630 -> 629, 621 -> 619, 626 -> 629)
  const sellingPrice = Math.max(9, Math.round((rawWithMarkup + 1) / 10) * 10 - 1);

  // 3. Exact markup in rupees and decimal percentage
  const markupAmount = sellingPrice - base;
  const markupPercentage = Number(((markupAmount / base) * 100).toFixed(2));
  const formattedPercentage = `${markupPercentage >= 0 ? '+' : ''}${markupPercentage.toFixed(2)}%`;

  return {
    brandBasePrice: base,
    rawWithMarkup: Number(rawWithMarkup.toFixed(2)),
    sellingPrice,
    markupAmount,
    markupPercentage,
    formattedPercentage
  };
}

export function getProductPricingInfo(prod: {
  price?: string | number;
  brandBasePrice?: number;
  originalPrice?: number;
}): DrobeMarkupPricing {
  if (prod.brandBasePrice && prod.brandBasePrice > 0) {
    return calculateDrobeMarkupPricing(prod.brandBasePrice);
  }

  // Derive base from selling price if brandBasePrice not explicitly set
  const rawNum = typeof prod.price === 'number'
    ? prod.price
    : parseFloat(String(prod.price || '0').replace(/[^0-9.]/g, '')) || 0;

  if (rawNum <= 0) {
    return {
      brandBasePrice: 0,
      rawWithMarkup: 0,
      sellingPrice: 0,
      markupAmount: 0,
      markupPercentage: 0,
      formattedPercentage: '0.00%'
    };
  }

  const impliedBase = Math.round(rawNum / 1.05);
  const markupAmount = rawNum - impliedBase;
  const markupPct = Number(((markupAmount / (impliedBase || 1)) * 100).toFixed(2));

  return {
    brandBasePrice: impliedBase,
    rawWithMarkup: rawNum,
    sellingPrice: rawNum,
    markupAmount,
    markupPercentage: markupPct,
    formattedPercentage: `${markupPct >= 0 ? '+' : ''}${markupPct.toFixed(2)}%`
  };
}

export interface InboundStockShipment {
  id: string; // e.g. "INW-AMD-204"
  brandId: string;
  brandName: string;
  productId: string;
  productName: string;
  units: number;
  courierPartner: string; // e.g. "BlueDart Express", "Delhivery", "Hub Self-Drop"
  trackingNumber: string;
  dispatchDate: string;
  receivedDate?: string;
  status: 'In Transit' | 'Arrived at Hub' | 'Verified & Shelved' | 'Rejected';
  assignedSku?: string;
  assignedShelf?: string;
  verifiedBy?: string;
}

export type DoorstepFittingStatus = 
  | 'Order Received (Awaiting Picker)'
  | 'Picked & Packed in Trial Bag'
  | 'Runner Assigned (Ready for Handover)'
  | 'Out for 30-Min Delivery'
  | 'Doorstep Fitting (Runner Waiting Outside)'
  | 'Kept on Spot (Purchased)'
  | 'Returned on Spot (Runner Heading to Hub)'
  | 'Restocked to Warehouse Shelf';

export interface DarkstoreRunner {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  currentStatus: 'Available at Hub' | 'Out on 30-Min Delivery' | 'Waiting at Doorstep' | 'Riding Back to Hub';
  deliveriesToday: number;
  rating: number;
  batteryOrFuel: string;
}

export interface TrialOrderItem {
  productId: string;
  productName: string;
  productSku?: string;
  brandId: string;
  brandName: string;
  price: string;
  priceNum: number;
  size: string;
  shelfLocation?: string;
  thumbnail?: string;
  status: 'pending' | 'in-trial' | 'kept' | 'returned';
}

export interface TrialOrder {
  id: string;
  orderNumber: string; // e.g. "#DRB-9842"
  customerName: string;
  customerPhone: string; // e.g. "+91 98250 88123"
  customerAddress: string; // e.g. "Prahlad Nagar, Ahmedabad"
  landmark?: string;
  distanceKm: string; // e.g. "2.4 km"
  productId: string;
  productName: string;
  productSku: string;
  brandId: string;
  brandName: string;
  price: string;
  size: string;
  shelfLocation: string;
  riderName?: string;
  riderPhone?: string;
  riderVehicle?: string;
  receivedAt?: string;
  pickedAt?: string;
  handedOverAt?: string;
  dispatchedAt: string;
  status: DoorstepFittingStatus;
  doorstepTimerMinutesLeft?: number;
  runnerWaitElapsedMinutes?: number;
  returnReason?: string;
  instantRefundStatus?: string;
  notes?: string;
  deliveryOtp?: string; // 4-digit verification code e.g. "9842"
  returnSealTag?: string; // Tamper-evident return bag seal e.g. "SEAL-8821"
  paymentUpiRef?: string; // UPI transaction reference

  // 100% Advance Payment & Split Decision / Instant Refund Fields
  advancePaidAmount?: number; // Total amount paid upfront (e.g. ₹9497)
  paymentStatus?: 'Paid in Full' | 'Pending';
  paymentMethod?: string; // 'UPI (GPay/PhonePe)' | 'Card'
  items?: TrialOrderItem[]; // Itemized list for multi-item orders
  keptAmount?: number; // Amount kept on spot (e.g. ₹2999)
  refundAmount?: number; // Amount to be refunded instantly on hub check-in (e.g. ₹6498)
  netRefundAmount?: number; // Net refund after deducting overtime fees (e.g. ₹2 per minute beyond 6 min window)
  overtimeMinutes?: number; // Overtime minutes beyond 6-minute window
  overtimeFee?: number; // Surcharge of ₹2 per minute exceeded
  doorstepStartedAt?: string;
  doorstepCompletedAt?: string;
  refundStatus?: 'No Refund' | 'Refund Pending Hub Arrival' | 'Refund Processed Instantly';
  refundUpiRef?: string;
  refundTimestamp?: string;
}

// Storage Keys
const KEY_BRANDS = 'drobe_darkstore_brands_v2';
const KEY_PRODUCTS = 'drobe_darkstore_products_v2';
const KEY_INBOUNDS = 'drobe_darkstore_inbounds_v2';
const KEY_ORDERS = 'drobe_darkstore_orders_v2';
const KEY_RUNNERS = 'drobe_darkstore_runners_v2';
const KEY_LEGACY_BRAND = 'drobe_brand_profile_v1';

// Initial Brands (Populated live from Supabase & Brand Onboarding)
const INITIAL_BRANDS: DarkstoreBrand[] = [];

// Initial Products (Populated live from Supabase & Brand Onboarding)
const INITIAL_PRODUCTS: DarkstoreProduct[] = [];

// Initial Inbound Shipments (Populated live from Supabase & Brand Dispatches)
const INITIAL_INBOUNDS: InboundStockShipment[] = [];

// Ahmedabad Darkstore Express Runner Fleet (Active Runners)
export const AHMEDABAD_RUNNERS_POOL: DarkstoreRunner[] = [
  {
    id: 'run-01',
    name: 'Meet Dave',
    phone: '+91 98250 88123',
    vehicle: 'Ather 450X EV (GJ-01-MW-9021)',
    currentStatus: 'Waiting at Doorstep',
    deliveriesToday: 9,
    rating: 4.95,
    batteryOrFuel: '82%'
  },
  {
    id: 'run-02',
    name: 'Jay Suthar',
    phone: '+91 97120 44912',
    vehicle: 'Ola S1 Pro (GJ-01-ET-3304)',
    currentStatus: 'Out on 30-Min Delivery',
    deliveriesToday: 7,
    rating: 4.9,
    batteryOrFuel: '74%'
  },
  {
    id: 'run-03',
    name: 'Karan Shah',
    phone: '+91 98790 12049',
    vehicle: 'TVS iQube EV (GJ-01-KB-1122)',
    currentStatus: 'Available at Hub',
    deliveriesToday: 11,
    rating: 4.88,
    batteryOrFuel: '95%'
  },
  {
    id: 'run-04',
    name: 'Aarav Patel',
    phone: '+91 98240 55102',
    vehicle: 'Honda Activa 6G (GJ-01-PQ-5581)',
    currentStatus: 'Available at Hub',
    deliveriesToday: 6,
    rating: 4.92,
    batteryOrFuel: 'Full Tank'
  },
  {
    id: 'run-05',
    name: 'Hardik Vaghela',
    phone: '+91 99040 22319',
    vehicle: 'Bajaj Chetak EV (GJ-01-RZ-8742)',
    currentStatus: 'Available at Hub',
    deliveriesToday: 8,
    rating: 4.85,
    batteryOrFuel: '90%'
  }
];

// Real 30-Minute Doorstep Trial & Instant Return Orders (Loaded live from Supabase)
const INITIAL_ORDERS: TrialOrder[] = [];


// Known mock identifiers to purge on sight
const MOCK_BRAND_IDS = new Set(['brand-chanel-01', 'brand-underrated-02', 'brand-nova-03']);
const MOCK_PRODUCT_IDS = new Set(['prod-dr-01', 'prod-dr-02', 'prod-dr-03', 'prod-dr-04', 'prod-dr-05']);
const MOCK_INBOUND_IDS = new Set(['inb-001', 'inb-002', 'inb-003']);
const MOCK_ORDER_IDS = new Set(['ord-30m-101', 'ord-30m-102', 'ord-30m-103', 'ord-30m-104', 'ord-30m-105', 'ord-30m-106']);

// Helper Functions
export function getDarkstoreBrands(): DarkstoreBrand[] {
  if (typeof window === 'undefined') return INITIAL_BRANDS;
  try {
    const raw = localStorage.getItem(KEY_BRANDS);
    if (raw) {
      const parsed: DarkstoreBrand[] = JSON.parse(raw);
      const filtered = parsed.filter(b => !MOCK_BRAND_IDS.has(b.id) && b.name !== 'CHANEL' && b.name !== 'Nova Studios');
      if (filtered.length !== parsed.length) {
        localStorage.setItem(KEY_BRANDS, JSON.stringify(filtered));
      }
      return filtered;
    }
    return INITIAL_BRANDS;
  } catch {
    return INITIAL_BRANDS;
  }
}

export function saveDarkstoreBrands(brands: DarkstoreBrand[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEY_BRANDS, JSON.stringify(brands));
  } catch {}
  try {
    brands.forEach(b => supabaseUpsertBrand(b));
  } catch {}
}

export function getDarkstoreProducts(): DarkstoreProduct[] {
  if (typeof window === 'undefined') return INITIAL_PRODUCTS;
  try {
    const raw = localStorage.getItem(KEY_PRODUCTS);
    if (raw) {
      const parsed: DarkstoreProduct[] = JSON.parse(raw);
      const filtered = parsed.filter(p => !MOCK_PRODUCT_IDS.has(p.id) && !MOCK_BRAND_IDS.has(p.brandId));
      if (filtered.length !== parsed.length) {
        localStorage.setItem(KEY_PRODUCTS, JSON.stringify(filtered));
      }
      return filtered;
    }
    return INITIAL_PRODUCTS;
  } catch {
    return INITIAL_PRODUCTS;
  }
}

export function saveDarkstoreProducts(products: DarkstoreProduct[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEY_PRODUCTS, JSON.stringify(products));
  } catch {}
  try {
    products.forEach(p => supabaseUpsertProduct(p));
  } catch {}
}

export function getInboundShipments(): InboundStockShipment[] {
  if (typeof window === 'undefined') return INITIAL_INBOUNDS;
  try {
    const raw = localStorage.getItem(KEY_INBOUNDS);
    if (raw) {
      const parsed: InboundStockShipment[] = JSON.parse(raw);
      const filtered = parsed.filter(s => !MOCK_INBOUND_IDS.has(s.id) && !MOCK_BRAND_IDS.has(s.brandId));
      if (filtered.length !== parsed.length) {
        localStorage.setItem(KEY_INBOUNDS, JSON.stringify(filtered));
      }
      return filtered;
    }
    return INITIAL_INBOUNDS;
  } catch {
    return INITIAL_INBOUNDS;
  }
}

export function saveInboundShipments(shipments: InboundStockShipment[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEY_INBOUNDS, JSON.stringify(shipments));
  } catch {}
  try {
    shipments.forEach(s => supabaseUpsertShipment(s));
  } catch {}
}

// End-to-End Supabase Live Data Sync
export async function syncDarkstoreWithSupabase(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  try {
    const [orders, products, brands, shipments, runners] = await Promise.all([
      supabaseFetchOrders(),
      supabaseFetchProducts(),
      supabaseFetchBrands(),
      supabaseFetchShipments(),
      supabaseFetchRunners()
    ]);

    let changed = false;
    if (orders !== null) {
      const filteredOrders = orders.filter(o => !MOCK_ORDER_IDS.has(o.id));
      localStorage.setItem(KEY_ORDERS, JSON.stringify(filteredOrders));
      changed = true;
    }
    if (products !== null) {
      const filteredProds = products.filter(p => !MOCK_PRODUCT_IDS.has(p.id) && !MOCK_BRAND_IDS.has(p.brandId));
      localStorage.setItem(KEY_PRODUCTS, JSON.stringify(filteredProds));
      changed = true;
    }
    if (brands !== null) {
      const filteredBrands = brands.filter(b => !MOCK_BRAND_IDS.has(b.id) && b.name !== 'CHANEL' && b.name !== 'Nova Studios');
      localStorage.setItem(KEY_BRANDS, JSON.stringify(filteredBrands));
      changed = true;
    }
    if (shipments !== null) {
      const filteredShipments = shipments.filter(s => !MOCK_INBOUND_IDS.has(s.id));
      localStorage.setItem(KEY_INBOUNDS, JSON.stringify(filteredShipments));
      changed = true;
    }
    if (runners !== null && runners.length > 0) {
      localStorage.setItem(KEY_RUNNERS, JSON.stringify(runners));
      changed = true;
    }

    if (changed) {
      window.dispatchEvent(new Event('storage'));
    }
    return true;
  } catch (err) {
    console.warn('Live sync with Supabase failed, using local offline storage:', err);
    return false;
  }
}

export function getTrialOrders(): TrialOrder[] {
  if (typeof window === 'undefined') return INITIAL_ORDERS;
  try {
    const raw = localStorage.getItem(KEY_ORDERS);
    if (raw) {
      const parsed: TrialOrder[] = JSON.parse(raw);
      const filtered = parsed.filter(o => !MOCK_ORDER_IDS.has(o.id) && !MOCK_BRAND_IDS.has(o.brandId));
      if (filtered.length !== parsed.length) {
        localStorage.setItem(KEY_ORDERS, JSON.stringify(filtered));
      }
      return filtered;
    }
    return INITIAL_ORDERS;
  } catch {
    return INITIAL_ORDERS;
  }
}

export function saveTrialOrders(orders: TrialOrder[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEY_ORDERS, JSON.stringify(orders));
  } catch {}
}

// Calculate the next sequential SKU: DR1, DR2, DR3, etc.
export function getNextSkuNumber(): { sku: string; serial: number } {
  const products = getDarkstoreProducts();
  let maxSerial = 0;
  products.forEach(p => {
    if (p.skuSerial && p.skuSerial > maxSerial) {
      maxSerial = p.skuSerial;
    } else if (p.sku && p.sku.startsWith('DR')) {
      const numPart = parseInt(p.sku.replace(/\D/g, ''), 10);
      if (!isNaN(numPart) && numPart > maxSerial) {
        maxSerial = numPart;
      }
    }
  });
  const nextSerial = maxSerial + 1;
  return {
    sku: `DR${nextSerial}`,
    serial: nextSerial
  };
}

// Calculate the next available unoccupied shelf in Ahmedabad Darkstore Hub
export function getNextAvailableShelfLocation(category?: string): WarehouseShelfLocation {
  const products = getDarkstoreProducts();
  const occupiedCodes = new Set(products.map(p => p.warehouseLocation?.code).filter(Boolean));

  // Determine preferred rack zone based on category
  const catLower = (category || '').toLowerCase();
  let preferredRacks = ['Rack A-01', 'Rack A-02', 'Rack A-03', 'Rack B-01', 'Rack B-02', 'Rack C-01'];
  let zoneName = 'Zone A - Outerwear & Heavy Silhouettes';

  if (catLower.includes('top') || catLower.includes('tee') || catLower.includes('shirt')) {
    preferredRacks = ['Rack B-01', 'Rack B-02', 'Rack A-01', 'Rack A-02', 'Rack C-01'];
    zoneName = 'Zone B - Tops, Tees & Shirts';
  } else if (catLower.includes('bottom') || catLower.includes('pant') || catLower.includes('trouser') || catLower.includes('denim') || catLower.includes('linen')) {
    preferredRacks = ['Rack C-01', 'Rack B-02', 'Rack A-03', 'Rack A-02', 'Rack B-01'];
    zoneName = 'Zone C - Bottoms & Denims';
  } else if (catLower.includes('access') || catLower.includes('footwear')) {
    preferredRacks = ['Rack C-01', 'Rack A-01', 'Rack B-01'];
    zoneName = 'Zone D - Accessories & Footwear';
  }

  const shelves = ['Shelf 1', 'Shelf 2', 'Shelf 3', 'Shelf 4'];

  for (const rack of preferredRacks) {
    for (const shelf of shelves) {
      for (let b = 1; b <= 16; b++) {
        const bin = b < 10 ? `Bin 0${b}` : `Bin ${b}`;
        const rackCode = rack.replace(/\s+/g, '').toUpperCase();
        const shelfCode = shelf.replace(/\s+/g, '').toUpperCase();
        const binCode = bin.replace(/\s+/g, '').toUpperCase();
        const fullCode = `AMD-${rackCode}-${shelfCode}-${binCode}`;

        if (!occupiedCodes.has(fullCode)) {
          return {
            zone: zoneName,
            rack,
            shelf,
            bin,
            code: fullCode,
            hubName: AHMEDABAD_WAREHOUSE.name
          };
        }
      }
    }
  }

  return {
    zone: 'Zone A - Outerwear & Heavy Silhouettes',
    rack: 'Rack A-01',
    shelf: 'Shelf 1',
    bin: 'Bin 01',
    code: 'AMD-RA01-S1-B01',
    hubName: AHMEDABAD_WAREHOUSE.name
  };
}

// Register brand submission from Brand Studio -> sets status to 'Waiting for Approval'
// Register brand submission from Brand Studio -> sets status to 'Waiting for Approval' and pushes to Supabase
export function registerBrandApplication(brand: any): DarkstoreBrand {
  const brands = getDarkstoreBrands();
  const brandName = (brand.name || '').trim();
  const existingIndex = brands.findIndex(b => (brand.id && b.id === brand.id) || (brandName && b.name.toLowerCase() === brandName.toLowerCase()));

  const brandId = brand.id || (existingIndex >= 0 ? brands[existingIndex].id : `brand-${brandName ? brandName.toLowerCase().replace(/[^a-z0-9]/g, '-') : 'active'}-${Date.now().toString().slice(-4)}`);
  const todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const bank = brand.bankAccount || brand.bankDetails || {};

  const darkstoreBrand: DarkstoreBrand = {
    id: brandId,
    name: brandName || 'Untitled Brand',
    tagline: brand.tagline || brand.about?.slice(0, 90) || 'Artisanal Modern Brand',
    category: brand.category || 'Male & Female',
    founderName: brand.founderName || brand.founder?.name || 'Founder',
    founderRole: brand.founderRole || brand.founder?.role || 'Founder & Creative Director',
    founderBio: brand.founderBio || brand.founder?.bio || '',
    founderQuote: brand.founderQuote || brand.founder?.quote || '',
    about: brand.about || '',
    mission: brand.mission || '',
    values: Array.isArray(brand.values) ? brand.values : [],
    website: brand.website || '',
    instagram: brand.instagram || '',
    inquiriesEmail: brand.inquiriesEmail || brand.email || '',
    email: brand.email || brand.inquiriesEmail || 'concierge@brand.com',
    phone: brand.phone || '',
    basedOutOf: brand.basedOutOf || brand.location || 'Ahmedabad Darkstore Hub',
    establishedYear: brand.establishedYear || brand.established || '',
    status: (brand.status === 'Approved' ? 'Approved' : 'Waiting for Approval') as BrandApprovalStatus,
    profileImage: brand.profileImage || brand.logo || '',
    coverImage: brand.coverImage || brand.bannerImage || '',
    appliedDate: brand.appliedDate || todayStr,
    totalProductsCount: brand.products?.length || 0,
    inwardedUnitsCount: brand.inwardedUnitsCount || 0,
    bankAccount: {
      accountHolderName: bank.accountHolderName || '',
      bankName: bank.bankName || '',
      accountNumber: bank.accountNumber || '',
      ifscCode: bank.ifscCode || '',
      accountType: bank.accountType || 'Current',
      isVerified: bank.isVerified ?? false
    },
    products: brand.products || [],
    dossierData: brand.dossierData || brand
  };

  let updatedBrands: DarkstoreBrand[];
  if (existingIndex >= 0) {
    updatedBrands = [...brands];
    updatedBrands[existingIndex] = {
      ...updatedBrands[existingIndex],
      ...darkstoreBrand,
      // Retain approval status if already approved, otherwise set Waiting for Approval
      status: updatedBrands[existingIndex].status === 'Approved' ? 'Approved' : 'Waiting for Approval'
    };
  } else {
    updatedBrands = [darkstoreBrand, ...brands];
  }
  saveDarkstoreBrands(updatedBrands);

  // Register brand's initial products into products catalog with inwardStatus: 'Pending Stock Dispatch'
  if (brand.products && Array.isArray(brand.products)) {
    const products = getDarkstoreProducts();
    const updatedProducts = [...products];

    brand.products.forEach((prod: any, idx: number) => {
      const prodName = prod.name?.trim();
      if (!prodName) return;

      const prodId = prod.id || `${brandId}-prod-${idx + 1}`;
      const existingPIdx = updatedProducts.findIndex(p => p.id === prodId || (p.brandId === brandId && p.name.toLowerCase() === prodName.toLowerCase()));

      const rawBase = prod.brandBasePrice !== undefined 
        ? Number(prod.brandBasePrice) 
        : (parseFloat(String(prod.price || '600').replace(/[^0-9.]/g, '')) || 600);
      const pricing = calculateDrobeMarkupPricing(rawBase);

      const newProd: DarkstoreProduct = {
        id: prodId,
        sku: prod.sku,
        skuSerial: prod.skuSerial,
        name: prodName,
        brandId: brandId,
        brandName: brandName || 'Your Brand',
        category: prod.category || brand.category || 'Apparel',
        brandBasePrice: pricing.brandBasePrice,
        price: `₹${pricing.sellingPrice}`,
        markupAmount: pricing.markupAmount,
        markupPercentage: pricing.markupPercentage,
        volume: prod.volume || 'M',
        inventory: Number(prod.inventory) || 20,
        inwardUnits: 0,
        unitsInTrial: 0,
        unitsSold: 0,
        tagline: prod.tagline || '',
        description: prod.description || '',
        images: prod.images && prod.images.length > 0 ? prod.images : (prod.image ? [prod.image] : []),
        inwardStatus: prod.inwardStatus || 'Pending Stock Dispatch',
        warehouseLocation: prod.warehouseLocation,
        isLive: Boolean(prod.isLive)
      };

      if (existingPIdx >= 0) {
        updatedProducts[existingPIdx] = {
          ...newProd,
          ...updatedProducts[existingPIdx],
          name: prodName,
          brandBasePrice: pricing.brandBasePrice,
          price: `₹${pricing.sellingPrice}`,
          markupAmount: pricing.markupAmount,
          markupPercentage: pricing.markupPercentage
        };
      } else {
        updatedProducts.push(newProd);
      }
    });

    saveDarkstoreProducts(updatedProducts);
  }

  // Also sync legacy brand
  if (typeof window !== 'undefined') {
    try {
      const activeRaw = localStorage.getItem(KEY_LEGACY_BRAND);
      if (activeRaw) {
        const parsed = JSON.parse(activeRaw);
        parsed.status = darkstoreBrand.status;
        parsed.id = brandId;
        localStorage.setItem(KEY_LEGACY_BRAND, JSON.stringify(parsed));
      }
      window.dispatchEvent(new Event('storage'));
    } catch {}
  }

  return darkstoreBrand;
}

// Admin: Approve a brand
export function adminApproveBrand(brandId: string): DarkstoreBrand | null {
  const brands = getDarkstoreBrands();
  let approvedBrand: DarkstoreBrand | null = null;
  const todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const updated = brands.map(b => {
    if (b.id === brandId) {
      const u: DarkstoreBrand = {
        ...b,
        status: 'Approved' as BrandApprovalStatus,
        approvedDate: todayStr
      };
      approvedBrand = u;
      return u;
    }
    return b;
  });
  saveDarkstoreBrands(updated);

  // Sync to current active brand session if it matches
  if (typeof window !== 'undefined') {
    try {
      const activeRaw = localStorage.getItem(KEY_LEGACY_BRAND);
      if (activeRaw) {
        const parsed = JSON.parse(activeRaw);
        if (parsed.id === brandId || !parsed.id || (approvedBrand && parsed.name?.toLowerCase() === (approvedBrand as DarkstoreBrand).name?.toLowerCase())) {
          parsed.status = 'Approved';
          localStorage.setItem(KEY_LEGACY_BRAND, JSON.stringify(parsed));
        }
      }
      window.dispatchEvent(new Event('storage'));
    } catch {}
  }

  return approvedBrand || updated.find(b => b.id === brandId) || null;
}

// Admin: Reject a brand
export function adminRejectBrand(brandId: string): DarkstoreBrand | null {
  const brands = getDarkstoreBrands();
  const updated = brands.map(b => {
    if (b.id === brandId) {
      return {
        ...b,
        status: 'Rejected' as BrandApprovalStatus
      };
    }
    return b;
  });
  saveDarkstoreBrands(updated);

  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new Event('storage'));
    } catch {}
  }

  return updated.find(b => b.id === brandId) || null;
}

// Admin: Mark shipment as arrived at darkstore hub
export function markShipmentArrived(shipmentId: string): InboundStockShipment | null {
  const shipments = getInboundShipments();
  let updatedShipment: InboundStockShipment | null = null;
  const todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const updated = shipments.map(s => {
    if (s.id === shipmentId) {
      const u: InboundStockShipment = {
        ...s,
        status: 'Arrived at Hub',
        receivedDate: todayStr
      };
      updatedShipment = u;
      return u;
    }
    return s;
  });

  saveInboundShipments(updated);

  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new Event('storage'));
    } catch {}
  }

  return updatedShipment;
}

// Admin: Inward & Verify Stock Received -> Assigns SKU and Shelf Location -> Product Goes LIVE!
export interface InwardParams {
  productId: string;
  sku?: string;
  unitsReceived: number;
  shelfLocation?: {
    zone: string;
    rack: string;
    shelf: string;
    bin: string;
  };
  brandBasePrice?: number;
  verifiedBy?: string;
  shipmentId?: string;
}

export function adminInwardProduct({
  productId,
  sku,
  unitsReceived,
  shelfLocation,
  brandBasePrice,
  verifiedBy = 'Admin (Ahmedabad Hub)',
  shipmentId
}: InwardParams): { product: DarkstoreProduct; skuAssigned: string; shelfCode: string } {
  const products = getDarkstoreProducts();
  const targetProduct = products.find(p => p.id === productId);

  const nextSkuInfo = getNextSkuNumber();
  const finalSku = sku || targetProduct?.sku || nextSkuInfo.sku;
  const finalSerial = targetProduct?.skuSerial || nextSkuInfo.serial;

  // Auto-allocate shelf if not provided
  const finalShelfLocation = shelfLocation || getNextAvailableShelfLocation(targetProduct?.category);

  const rackCodeClean = finalShelfLocation.rack.replace(/\s+/g, '').toUpperCase();
  const shelfCodeClean = finalShelfLocation.shelf.replace(/\s+/g, '').toUpperCase();
  const binCodeClean = finalShelfLocation.bin.replace(/\s+/g, '').toUpperCase();
  const fullCode = `AMD-${rackCodeClean}-${shelfCodeClean}-${binCodeClean}`;

  const locationObj: WarehouseShelfLocation = {
    zone: finalShelfLocation.zone,
    rack: finalShelfLocation.rack,
    shelf: finalShelfLocation.shelf,
    bin: finalShelfLocation.bin,
    code: fullCode,
    hubName: AHMEDABAD_WAREHOUSE.name
  };

  const todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  let updatedTargetProduct: DarkstoreProduct | null = null;

  const updatedProducts = products.map(p => {
    if (p.id === productId) {
      const baseNum = brandBasePrice !== undefined 
        ? brandBasePrice 
        : (p.brandBasePrice || parseFloat(String(p.price || '0').replace(/[^0-9.]/g, '')) || 0);
      const pricing = baseNum > 0 ? calculateDrobeMarkupPricing(baseNum) : null;

      const updated: DarkstoreProduct = {
        ...p,
        sku: finalSku,
        skuSerial: p.skuSerial || finalSerial,
        inwardUnits: unitsReceived,
        inventory: Math.max(unitsReceived, p.inventory || unitsReceived),
        inwardStatus: 'Inwarded & Live',
        warehouseLocation: locationObj,
        inwardDate: todayStr,
        isLive: true,
        ...(pricing ? {
          brandBasePrice: pricing.brandBasePrice,
          price: `₹${pricing.sellingPrice}`,
          markupAmount: pricing.markupAmount,
          markupPercentage: pricing.markupPercentage
        } : {})
      };
      updatedTargetProduct = updated;
      return updated;
    }
    return p;
  });

  saveDarkstoreProducts(updatedProducts);

  // If there's an associated inbound shipment, mark it verified
  const shipments = getInboundShipments();
  const updatedShipments = shipments.map(s => {
    if (s.productId === productId || (shipmentId && s.id === shipmentId)) {
      return {
        ...s,
        status: 'Verified & Shelved' as const,
        receivedDate: todayStr,
        assignedSku: finalSku,
        assignedShelf: fullCode,
        verifiedBy: verifiedBy
      };
    }
    return s;
  });
  saveInboundShipments(updatedShipments);

  // Update brand inwarded count in darkstore brands
  if (updatedTargetProduct) {
    const targetBrandId = (updatedTargetProduct as DarkstoreProduct).brandId;
    const brands = getDarkstoreBrands();
    const updatedBrands = brands.map(b => {
      if (b.id === targetBrandId || b.name === (updatedTargetProduct as DarkstoreProduct).brandName) {
        return {
          ...b,
          inwardedUnitsCount: (b.inwardedUnitsCount || 0) + unitsReceived,
          status: 'Approved' as const
        };
      }
      return b;
    });
    saveDarkstoreBrands(updatedBrands);
  }

  // Also sync to legacy brand session products
  if (typeof window !== 'undefined' && updatedTargetProduct) {
    try {
      const legacyRaw = localStorage.getItem(KEY_LEGACY_BRAND);
      if (legacyRaw) {
        const parsed = JSON.parse(legacyRaw);
        if (parsed.products && Array.isArray(parsed.products)) {
          const syncProd = updatedTargetProduct as DarkstoreProduct;
          parsed.products = parsed.products.map((item: any) => {
            if (item.name === syncProd.name || item.id === syncProd.id) {
              return {
                ...item,
                sku: syncProd.sku,
                warehouseLocation: syncProd.warehouseLocation,
                inwardStatus: syncProd.inwardStatus,
                isLive: true,
                inventory: syncProd.inwardUnits
              };
            }
            return item;
          });
          localStorage.setItem(KEY_LEGACY_BRAND, JSON.stringify(parsed));
        }
      }
      window.dispatchEvent(new Event('storage'));
    } catch {}
  }

  return {
    product: updatedTargetProduct || products[0],
    skuAssigned: finalSku,
    shelfCode: fullCode
  };
}

// Brand: Dispatch stock from Brand to Ahmedabad Warehouse
export function brandDispatchStock({
  brandId,
  brandName,
  productId,
  productName,
  units,
  courierPartner,
  trackingNumber
}: {
  brandId: string;
  brandName: string;
  productId: string;
  productName: string;
  units: number;
  courierPartner: string;
  trackingNumber: string;
}): InboundStockShipment {
  const shipments = getInboundShipments();
  const nextId = `INW-AMD-${shipments.length + 101}`;
  const todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const newShipment: InboundStockShipment = {
    id: nextId,
    brandId,
    brandName,
    productId,
    productName,
    units,
    courierPartner,
    trackingNumber: trackingNumber || `AMD-TRK-${Math.floor(100000 + Math.random() * 900000)}`,
    dispatchDate: todayStr,
    status: 'In Transit',
    assignedSku: 'Pending Verification',
    assignedShelf: 'Pending Inward'
  };

  const updatedShipments = [newShipment, ...shipments];
  saveInboundShipments(updatedShipments);

  // Update product inward status to 'Stock In Transit to Ahmedabad'
  const products = getDarkstoreProducts();
  const existingProduct = products.find(p => p.id === productId || p.name === productName);

  if (existingProduct) {
    const updatedProducts = products.map(p => {
      if (p.id === productId || p.name === productName) {
        return {
          ...p,
          inwardStatus: 'Stock In Transit to Ahmedabad' as const
        };
      }
      return p;
    });
    saveDarkstoreProducts(updatedProducts);
  } else {
    // Add product to darkstore products
    const newProd: DarkstoreProduct = {
      id: productId,
      name: productName,
      brandId,
      brandName,
      price: '₹1499',
      volume: 'M',
      inventory: units,
      inwardUnits: 0,
      unitsInTrial: 0,
      unitsSold: 0,
      images: [],
      inwardStatus: 'Stock In Transit to Ahmedabad',
      isLive: false
    };
    saveDarkstoreProducts([newProd, ...products]);
  }

  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new Event('storage'));
    } catch {}
  }

  return newShipment;
}

// Hub Runner Fleet
export function getDarkstoreRunners(): DarkstoreRunner[] {
  if (typeof window === 'undefined') return AHMEDABAD_RUNNERS_POOL;
  try {
    const raw = localStorage.getItem(KEY_RUNNERS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return AHMEDABAD_RUNNERS_POOL;
}

// Create new 30-minute doorstep trial order from Customer App / Platform
export function createCustomerOrder(data: {
  id?: string;
  orderNumber?: string;
  productId?: string;
  productName?: string;
  productSku?: string;
  brandId?: string;
  brandName?: string;
  price?: string;
  size?: string;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  landmark?: string;
  shelfLocation?: string;
  // Multi-item / Advance payment support
  items?: Array<{
    productId: string;
    productName: string;
    productSku?: string;
    brandId: string;
    brandName: string;
    price: string;
    priceNum: number;
    size: string;
    shelfLocation?: string;
    thumbnail?: string;
  }>;
  advancePaidAmount?: number;
  paymentMethod?: string;
  paymentUpiRef?: string;
}): TrialOrder {
  const orders = getTrialOrders();
  const nextNumber = Math.floor(9851 + orders.length);
  const timeStr = 'Just Now (0 mins ago)';

  // Build items array
  let orderItems: TrialOrderItem[] = [];
  if (data.items && data.items.length > 0) {
    orderItems = data.items.map(it => ({
      productId: it.productId,
      productName: it.productName,
      productSku: it.productSku || 'DR1',
      brandId: it.brandId,
      brandName: it.brandName,
      price: it.price,
      priceNum: it.priceNum || parseFloat(it.price.replace(/[^0-9.]/g, '')) || 0,
      size: it.size || 'M',
      shelfLocation: it.shelfLocation || 'AMD-RA01-S1-B01',
      thumbnail: it.thumbnail,
      status: 'pending' as const
    }));
  } else if (data.productId) {
    const pNum = parseFloat((data.price || '0').replace(/[^0-9.]/g, '')) || 0;
    orderItems = [{
      productId: data.productId,
      productName: data.productName || 'Item for Trial',
      productSku: data.productSku || 'DR1',
      brandId: data.brandId || 'tilt',
      brandName: data.brandName || 'Drobe Partner',
      price: data.price || '₹1200',
      priceNum: pNum,
      size: data.size || 'M',
      shelfLocation: data.shelfLocation || 'AMD-RA01-S1-B01',
      status: 'pending' as const
    }];
  }

  const primaryItem = orderItems[0] || {
    productId: 'prod-01',
    productName: 'Trial Piece',
    productSku: 'DR1',
    brandId: 'tilt',
    brandName: 'Drobe Partner',
    price: '₹1200',
    priceNum: 1200,
    size: 'M',
    shelfLocation: 'AMD-RA01-S1-B01'
  };

  const totalAdvance = data.advancePaidAmount 
    ? data.advancePaidAmount 
    : orderItems.reduce((acc, it) => acc + it.priceNum, 0);

  const displayTitle = orderItems.length > 1 
    ? `${primaryItem.productName} + ${orderItems.length - 1} other item(s) (${orderItems.length} Fits)`
    : primaryItem.productName;

  const upiTxRef = data.paymentUpiRef || `UPI-ADV-${Math.floor(10000000 + Math.random() * 90000000)}`;

  const newOrder: TrialOrder = {
    id: data.id || `ord-30m-${Date.now()}`,
    orderNumber: data.orderNumber || `#DRB-${nextNumber}`,
    customerName: data.customerName || 'Aarav Parekh',
    customerPhone: data.customerPhone || '+91 98250 88123',
    customerAddress: data.customerAddress || 'B-702, Shaligram Plus, Opp. Iskcon Temple, SG Highway, Ahmedabad',
    landmark: data.landmark || 'Opp. Iskcon Temple',
    distanceKm: '2.4 km',
    productId: primaryItem.productId,
    productName: displayTitle,
    productSku: orderItems.map(it => it.productSku || it.productId).join(', '),
    brandId: primaryItem.brandId,
    brandName: primaryItem.brandName,
    price: `₹${totalAdvance}`,
    size: orderItems.map(it => it.size).join(', '),
    shelfLocation: orderItems.map(it => it.shelfLocation || 'AMD-RA01-S1-B01').join(' | '),
    deliveryOtp: nextNumber.toString().slice(-4),
    receivedAt: timeStr,
    dispatchedAt: '',
    status: 'Order Received (Awaiting Picker)',
    doorstepTimerMinutesLeft: 6,
    overtimeMinutes: 0,
    overtimeFee: 0,
    netRefundAmount: 0,
    notes: `100% Advance Pre-Paid Order (₹${totalAdvance} via UPI: ${upiTxRef}). ${orderItems.length} items dispatched for 6-min doorstep fitting. Handed-back items refund instantly on warehouse check-in.`,
    
    // Financial & Split Decision fields
    advancePaidAmount: totalAdvance,
    paymentStatus: 'Paid in Full',
    paymentMethod: data.paymentMethod || 'UPI (GPay/PhonePe)',
    paymentUpiRef: upiTxRef,
    items: orderItems,
    keptAmount: 0,
    refundAmount: 0,
    refundStatus: 'No Refund'
  };

  const updatedOrders = [newOrder, ...orders];
  saveTrialOrders(updatedOrders);

  // Sync order to Supabase
  try {
    supabaseInsertOrder(newOrder);
    supabaseRecordOrderEvent(newOrder.id, newOrder.orderNumber, newOrder.status, 'Customer App', newOrder.notes);
  } catch {}

  // Auto-deduct stock for each item from inwardUnits in local store and Supabase
  const products = getDarkstoreProducts();
  const updatedProds = products.map(p => {
    const matchCount = orderItems.filter(it => it.productId === p.id || it.productSku === p.sku).length;
    if (matchCount > 0) {
      return {
        ...p,
        inwardUnits: Math.max(0, (p.inwardUnits || 0) - matchCount),
        unitsInTrial: (p.unitsInTrial || 0) + matchCount
      };
    }
    return p;
  });
  saveDarkstoreProducts(updatedProds);

  // Sync auto stock deduction to Supabase drobe_products table
  try {
    orderItems.forEach(it => {
      supabaseDeductProductStock(it.productId || it.productSku || '', 1).catch(() => {});
    });
  } catch {}

  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('drobe_new_order', { detail: newOrder }));
    } catch {}
  }

  return newOrder;
}

// Record Customer Doorstep Decision: Kept vs Returned on Spot with 6-minute window & ₹2/min overtime calculation
export function recordDoorstepDecision(
  orderId: string, 
  itemIdx: number, 
  decision: 'kept' | 'returned',
  extraOvertimeMinutes?: number,
  extraOvertimeFee?: number
): TrialOrder | null {
  const orders = getTrialOrders();
  let updatedOrder: TrialOrder | null = null;

  const updatedOrders = orders.map(ord => {
    if (ord.id === orderId || ord.orderNumber === orderId) {
      const items = (ord.items && ord.items.length > 0)
        ? [...ord.items]
        : [{
            productId: ord.productId,
            productName: ord.productName,
            productSku: ord.productSku,
            brandId: ord.brandId,
            brandName: ord.brandName,
            price: ord.price,
            priceNum: parseFloat(ord.price.replace(/[^0-9.]/g, '')) || 0,
            size: ord.size,
            shelfLocation: ord.shelfLocation,
            status: 'pending' as const
          }];

      if (items[itemIdx]) {
        items[itemIdx] = {
          ...items[itemIdx],
          status: decision
        };
      }

      const keptItems = items.filter(i => i.status === 'kept');
      const returnedItems = items.filter(i => i.status === 'returned');
      const keptAmount = keptItems.reduce((sum, i) => sum + i.priceNum, 0);
      const grossRefundAmount = returnedItems.reduce((sum, i) => sum + i.priceNum, 0);

      // Overtime calculation: ₹2 per minute beyond 6-minute trial window
      const overtimeMinutes = extraOvertimeMinutes !== undefined 
        ? extraOvertimeMinutes 
        : (ord.overtimeMinutes || 0);
      const overtimeFee = extraOvertimeFee !== undefined 
        ? extraOvertimeFee 
        : (overtimeMinutes * 2);
      const netRefundAmount = Math.max(0, grossRefundAmount - overtimeFee);

      const hasReturned = returnedItems.length > 0;
      const allDecided = items.every(i => i.status === 'kept' || i.status === 'returned');

      let newStatus: DoorstepFittingStatus = ord.status;
      let refundStatus: 'No Refund' | 'Refund Pending Hub Arrival' | 'Refund Processed Instantly' = 'No Refund';
      let instantRefundStatus = '';

      if (hasReturned) {
        newStatus = 'Returned on Spot (Runner Heading to Hub)';
        refundStatus = 'Refund Pending Hub Arrival';
        instantRefundStatus = overtimeFee > 0
          ? `₹${netRefundAmount} Instant Refund (Gross ₹${grossRefundAmount} - ₹${overtimeFee} Overtime Surcharge) Pending Hub Check-in`
          : `₹${netRefundAmount} Instant Refund Pending Hub Check-in`;
      } else if (allDecided && keptItems.length === items.length) {
        newStatus = 'Kept on Spot (Purchased)';
        refundStatus = 'No Refund';
        instantRefundStatus = 'All Items Kept · Full Amount Retained';
      }

      const u: TrialOrder = {
        ...ord,
        items,
        status: newStatus,
        keptAmount,
        refundAmount: grossRefundAmount,
        netRefundAmount,
        overtimeMinutes,
        overtimeFee,
        doorstepCompletedAt: new Date().toISOString(),
        refundStatus,
        instantRefundStatus,
        notes: hasReturned 
          ? `Customer kept ${keptItems.length} item(s) (₹${keptAmount}) and handed back ${returnedItems.length} item(s) (₹${grossRefundAmount}) to runner.${overtimeFee > 0 ? ` 6-min window exceeded by ${overtimeMinutes} min (-₹${overtimeFee} surcharge applied).` : ''} Net instant refund of ₹${netRefundAmount} will credit on warehouse check-in.`
          : `All ${keptItems.length} item(s) kept on spot (₹${keptAmount}). Advance payment retained in full.`
      };

      updatedOrder = u;
      return u;
    }
    return ord;
  });

  saveTrialOrders(updatedOrders);

  if (updatedOrder) {
    const u = updatedOrder as TrialOrder;
    try {
      supabaseUpdateOrderStatus(u.id, u.status, {
        kept_amount: u.keptAmount,
        refund_amount: u.refundAmount,
        net_refund_amount: u.netRefundAmount,
        overtime_minutes: u.overtimeMinutes,
        overtime_fee: u.overtimeFee,
        doorstep_completed_at: u.doorstepCompletedAt,
        refund_status: u.refundStatus,
        instantRefundStatus: u.instantRefundStatus,
        items_data: u.items,
        notes: u.notes
      });
      supabaseRecordOrderEvent(u.id, u.orderNumber, u.status, 'Doorstep Fitting', u.notes);
    } catch {}

    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('drobe_order_decision', { detail: u }));
      } catch {}
    }
  }

  return updatedOrder;
}

// Hub Picker: Picks piece from shelf and packs into Drobe Signature Trial Bag
export function pickerPackOrder(orderId: string): TrialOrder | null {
  const orders = getTrialOrders();
  let updatedOrder: TrialOrder | null = null;

  const updated = orders.map(ord => {
    if (ord.id === orderId || ord.orderNumber === orderId) {
      const u: TrialOrder = {
        ...ord,
        status: 'Picked & Packed in Trial Bag',
        pickedAt: 'Just Now',
        notes: `Piece verified from shelf ${ord.shelfLocation}. Packed securely into Drobe Signature Trial Bag. Ready for delivery partner assignment.`
      };
      updatedOrder = u;
      return u;
    }
    return ord;
  });

  saveTrialOrders(updated);

  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new Event('storage'));
    } catch {}
  }

  return updatedOrder;
}

// Hub Executive: Assigns delivery runner to packed order
export function assignRunnerToOrder(
  orderId: string, 
  runnerId: string
): TrialOrder | null {
  const orders = getTrialOrders();
  const runner = AHMEDABAD_RUNNERS_POOL.find(r => r.id === runnerId) || AHMEDABAD_RUNNERS_POOL[0];
  let updatedOrder: TrialOrder | null = null;

  const updated = orders.map(ord => {
    if (ord.id === orderId || ord.orderNumber === orderId) {
      const u: TrialOrder = {
        ...ord,
        status: 'Runner Assigned (Ready for Handover)',
        riderName: runner.name,
        riderPhone: runner.phone,
        riderVehicle: runner.vehicle,
        handedOverAt: 'Awaiting Handover',
        notes: `Delivery partner ${runner.name} (${runner.vehicle}) assigned. Executive handover pending at Shivam Bungalows 1 dispatch bay.`
      };
      updatedOrder = u;
      return u;
    }
    return ord;
  });

  saveTrialOrders(updated);

  if (updatedOrder) {
    const u = updatedOrder as TrialOrder;
    try {
      supabaseUpdateOrderStatus(u.id, u.status, {
        riderName: u.riderName,
        riderPhone: u.riderPhone,
        riderVehicle: u.riderVehicle,
        notes: u.notes
      }).catch(() => {});
      supabaseRecordOrderEvent(u.id, u.orderNumber, u.status, 'Hub Dispatch Desk', u.notes).catch(() => {});
    } catch {}
  }

  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new Event('storage'));
    } catch {}
  }

  return updatedOrder;
}

// Hub Executive: Marks order physically handed over to delivery partner
export function handoverOrderToRunner(orderId: string): TrialOrder | null {
  const orders = getTrialOrders();
  let updatedOrder: TrialOrder | null = null;

  const updated = orders.map(ord => {
    if (ord.id === orderId || ord.orderNumber === orderId) {
      const u: TrialOrder = {
        ...ord,
        status: 'Out for 30-Min Delivery',
        handedOverAt: 'Just Now',
        dispatchedAt: 'Just Now (0 mins elapsed)',
        doorstepTimerMinutesLeft: 12,
        notes: `Handed over to ${ord.riderName || 'delivery partner'}. Runner has started bike en route to customer. 30-Min SLA timer active!`
      };
      updatedOrder = u;
      return u;
    }
    return ord;
  });

  saveTrialOrders(updated);

  if (updatedOrder) {
    const u = updatedOrder as TrialOrder;
    try {
      supabaseUpdateOrderStatus(u.id, u.status, {
        doorstepTimerMinutesLeft: 12,
        handedOverAt: u.handedOverAt,
        dispatchedAt: u.dispatchedAt,
        notes: u.notes
      }).catch(() => {});
      supabaseRecordOrderEvent(u.id, u.orderNumber, u.status, 'Hub Dispatcher', u.notes).catch(() => {});
    } catch {}
  }

  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new Event('storage'));
    } catch {}
  }

  return updatedOrder;
}

// Delivery Partner App: Auto-fetch order details by order number
export function getOrderByNumber(orderNumber: string): TrialOrder | null {
  const orders = getTrialOrders();
  const cleanInput = orderNumber.trim().toUpperCase().replace('#', '');
  return orders.find(o => {
    const cleanOrd = o.orderNumber.toUpperCase().replace('#', '');
    return cleanOrd === cleanInput || cleanOrd.includes(cleanInput) || o.id === orderNumber;
  }) || null;
}

// Admin / System: Update Doorstep Fitting & Instant Return Order status
export function updateTrialOrderStatus(
  orderId: string, 
  newStatus: DoorstepFittingStatus, 
  returnReason?: string
): TrialOrder | null {
  const orders = getTrialOrders();
  let targetOrder: TrialOrder | null = null;

  const updated = orders.map(ord => {
    if (ord.id === orderId) {
      let notes = ord.notes;
      let instantRefundStatus = ord.instantRefundStatus;
      let timerLeft = ord.doorstepTimerMinutesLeft;

      if (newStatus === 'Order Received (Awaiting Picker)') {
        notes = 'New 30-min trial order received! Darkstore picker alert triggered at Shivam Bungalows 1, Koteshwar Road.';
      } else if (newStatus === 'Picked & Packed in Trial Bag') {
        notes = `Item retrieved from shelf ${ord.shelfLocation} and packed into Drobe Signature Trial Bag.`;
      } else if (newStatus === 'Runner Assigned (Ready for Handover)') {
        notes = `Delivery runner ${ord.riderName || 'assigned'} is ready at hub dispatch bay for order handover.`;
      } else if (newStatus === 'Out for 30-Min Delivery') {
        notes = `Handed to runner ${ord.riderName || 'delivery partner'}. Runner riding en route to customer address in Ahmedabad (30-min SLA active).`;
        timerLeft = 12;
      } else if (newStatus === 'Kept on Spot (Purchased)') {
        notes = 'Client completed doorstep fitting. Loved the piece & kept it on the spot! Payment finalized & queued into brand settlement.';
        timerLeft = 0;
      } else if (newStatus === 'Returned on Spot (Runner Heading to Hub)') {
        notes = 'Client tried on at door, handed unchosen item back to runner instantly. Runner is riding straight back to Ahmedabad Darkstore Hub.';
        timerLeft = 0;
        instantRefundStatus = `Instant refund initiated for ${ord.price}`;
      } else if (newStatus === 'Restocked to Warehouse Shelf') {
        notes = `Runner reached Ahmedabad Darkstore Hub. Item inspected & restocked to shelf ${ord.shelfLocation}. Full refund credited to client UPI.`;
        timerLeft = 0;
        instantRefundStatus = `${ord.price} Refunded Instantly to Client UPI`;
      } else if (newStatus === 'Doorstep Fitting (Runner Waiting Outside)') {
        notes = 'Runner is waiting outside the doorstep while customer tries outfits (10-15 min window).';
        timerLeft = timerLeft || 12;
      }

      const u: TrialOrder = {
        ...ord,
        status: newStatus,
        doorstepTimerMinutesLeft: timerLeft,
        returnReason: returnReason || ord.returnReason,
        notes: notes,
        instantRefundStatus: instantRefundStatus
      };
      targetOrder = u;
      return u;
    }
    return ord;
  });

  saveTrialOrders(updated);

  if (targetOrder) {
    const t = targetOrder as TrialOrder;
    try {
      supabaseUpdateOrderStatus(t.id, newStatus, {
        doorstepTimerMinutesLeft: t.doorstepTimerMinutesLeft,
        returnReason: t.returnReason,
        notes: t.notes,
        instantRefundStatus: t.instantRefundStatus
      }).catch(() => {});
      supabaseRecordOrderEvent(t.id, t.orderNumber, newStatus, 'Hub System / Admin', t.notes).catch(() => {});
    } catch {}
  }

  // Stock inventory adjustments based on lifecycle transitions
  if (targetOrder && newStatus === 'Restocked to Warehouse Shelf') {
    // 1. Returned & Restocked: ADD STOCK BACK (+1) to inwardUnits and decrement unitsInTrial
    const products = getDarkstoreProducts();
    const updatedProds = products.map(p => {
      if (p.id === (targetOrder as TrialOrder).productId || p.sku === (targetOrder as TrialOrder).productSku) {
        return {
          ...p,
          inwardUnits: (p.inwardUnits || 0) + 1,
          unitsInTrial: Math.max(0, (p.unitsInTrial || 1) - 1)
        };
      }
      return p;
    });
    saveDarkstoreProducts(updatedProds);

    // Sync stock restoration to Supabase DB drobe_products table
    try {
      supabaseRestockProductStock(
        (targetOrder as TrialOrder).productId || (targetOrder as TrialOrder).productSku || '', 
        1, 
        false
      ).catch(() => {});
    } catch {}
  } else if (targetOrder && newStatus === 'Returned on Spot (Runner Heading to Hub)') {
    // Runner heading back with item: decrement unitsInTrial
    const products = getDarkstoreProducts();
    const updatedProds = products.map(p => {
      if (p.id === (targetOrder as TrialOrder).productId || p.sku === (targetOrder as TrialOrder).productSku) {
        return {
          ...p,
          unitsInTrial: Math.max(0, (p.unitsInTrial || 1) - 1)
        };
      }
      return p;
    });
    saveDarkstoreProducts(updatedProds);
  } else if (targetOrder && newStatus === 'Kept on Spot (Purchased)') {
    // 2. Delivered & Kept: Keep stock deducted from inwardUnits! Decrement unitsInTrial, increment unitsSold
    const products = getDarkstoreProducts();
    const updatedProds = products.map(p => {
      if (p.id === (targetOrder as TrialOrder).productId || p.sku === (targetOrder as TrialOrder).productSku) {
        return {
          ...p,
          unitsInTrial: Math.max(0, (p.unitsInTrial || 1) - 1),
          unitsSold: (p.unitsSold || 0) + 1
        };
      }
      return p;
    });
    saveDarkstoreProducts(updatedProds);

    // Sync sold status to Supabase DB drobe_products table
    try {
      supabaseConfirmSoldStock(
        (targetOrder as TrialOrder).productId || (targetOrder as TrialOrder).productSku || '', 
        1
      ).catch(() => {});
    } catch {}
  }

  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new Event('storage'));
    } catch {}
  }

  return targetOrder;
}

// Dedicated Admin Action: Mark order as Returned & Restock piece back to shelf (+1 stock to DB) & Issue Instant Refund
export function adminMarkOrderReturnedAndRestocked(
  orderId: string, 
  returnReason?: string, 
  notes?: string
): { order: TrialOrder | null; updatedStock: number | null; refundAmount: number; refundUpiRef: string } {
  const orders = getTrialOrders();
  let updatedOrder: TrialOrder | null = null;
  let newStockLevel: number | null = null;
  const refundUpiRef = `REF-UPI-${Date.now().toString().slice(-8)}`;

  const defaultReason = returnReason || 'Doorstep Fitting Return · Item handed back to runner';

  const updatedOrders = orders.map(ord => {
    if (ord.id === orderId || ord.orderNumber === orderId) {
      const returnedItems = (ord.items || []).filter(i => i.status === 'returned');
      const grossAmt = ord.refundAmount && ord.refundAmount > 0 
        ? ord.refundAmount 
        : (parseFloat(ord.price.replace(/[^0-9.]/g, '')) || 0);
      const overtimeFee = ord.overtimeFee || 0;
      const refundAmt = ord.netRefundAmount !== undefined && ord.netRefundAmount >= 0
        ? ord.netRefundAmount
        : Math.max(0, grossAmt - overtimeFee);

      const countStr = returnedItems.length > 0 ? `${returnedItems.length} returned item(s)` : '1 returned item';
      const defaultNotes = notes || `Runner arrived at Ahmedabad Darkstore Hub. ${countStr} inspected & restocked to shelf. Instant refund of ₹${refundAmt} credited to customer account (${refundUpiRef})${overtimeFee > 0 ? ` (after ₹${overtimeFee} overtime surcharge deduction)` : ''}.`;

      const u: TrialOrder = {
        ...ord,
        status: 'Restocked to Warehouse Shelf',
        doorstepTimerMinutesLeft: 0,
        returnReason: defaultReason,
        refundStatus: 'Refund Processed Instantly',
        refundAmount: grossAmt,
        netRefundAmount: refundAmt,
        overtimeFee,
        refundUpiRef,
        refundTimestamp: new Date().toISOString(),
        instantRefundStatus: `₹${refundAmt} Refunded Instantly to Source Account (${refundUpiRef})${overtimeFee > 0 ? ` [Gross ₹${grossAmt} - ₹${overtimeFee} Overtime]` : ''}`,
        notes: defaultNotes
      };
      updatedOrder = u;
      return u;
    }
    return ord;
  });

  saveTrialOrders(updatedOrders);

  if (updatedOrder) {
    const u = updatedOrder as TrialOrder;
    const returnedItems = (u.items || []).filter(i => i.status === 'returned');
    const itemsToRestock = returnedItems.length > 0 
      ? returnedItems 
      : [{ productId: u.productId, productSku: u.productSku, productName: u.productName }];

    // 1. Add units back to product inventory in darkstore store
    const products = getDarkstoreProducts();
    const updatedProds = products.map(p => {
      const matchCount = itemsToRestock.filter(it => it.productId === p.id || it.productSku === p.sku).length;
      if (matchCount > 0) {
        const nextInward = (p.inwardUnits || 0) + matchCount;
        newStockLevel = nextInward;
        return {
          ...p,
          inwardUnits: nextInward,
          unitsInTrial: Math.max(0, (p.unitsInTrial || 0) - matchCount)
        };
      }
      return p;
    });
    saveDarkstoreProducts(updatedProds);

    // 2. Sync order status in Supabase drobe_trial_orders
    try {
      supabaseUpdateOrderStatus(u.id, u.status, {
        doorstepTimerMinutesLeft: 0,
        returnReason: u.returnReason,
        instantRefundStatus: u.instantRefundStatus,
        refund_status: u.refundStatus,
        refund_amount: u.refundAmount,
        net_refund_amount: u.netRefundAmount,
        overtime_minutes: u.overtimeMinutes,
        overtime_fee: u.overtimeFee,
        paymentUpiRef: u.refundUpiRef,
        items_data: u.items,
        notes: u.notes
      }).catch(() => {});

      // 3. Sync stock restoration to Supabase drobe_products table for all returned items
      itemsToRestock.forEach(it => {
        supabaseRestockProductStock(it.productId || it.productSku || '', 1, false).catch(() => {});
      });

      // 4. Record audit event in drobe_order_events
      supabaseRecordOrderEvent(
        u.id, 
        u.orderNumber, 
        u.status, 
        'Admin Inwarding Desk', 
        `Runner arrived at hub. ${itemsToRestock.length} item(s) restocked to shelf. Instant refund of ₹${u.netRefundAmount ?? u.refundAmount} credited to customer via ${refundUpiRef}.`
      ).catch(() => {});
    } catch {}

    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('drobe_stock_updated', { detail: { productId: u.productId, newStock: newStockLevel } }));
        window.dispatchEvent(new CustomEvent('drobe_return_restocked', { detail: u }));
      } catch {}
    }

    return { 
      order: u, 
      updatedStock: newStockLevel, 
      refundAmount: u.refundAmount || 0,
      refundUpiRef 
    };
  }

  return { order: null, updatedStock: null, refundAmount: 0, refundUpiRef: '' };
}

// Dedicated Admin Action: Mark order as Delivered & Kept (Keeps stock deducted, converts trial -> sold)
export function adminMarkOrderDeliveredAndKept(
  orderId: string, 
  notes?: string
): { order: TrialOrder | null; unitsSold: number | null } {
  const orders = getTrialOrders();
  let updatedOrder: TrialOrder | null = null;
  let newUnitsSold: number | null = null;

  const defaultNotes = notes || 'Doorstep fitting successful! Customer loved the piece and kept it on spot. Stock remains deducted in live DB.';

  const updatedOrders = orders.map(ord => {
    if (ord.id === orderId || ord.orderNumber === orderId) {
      const u: TrialOrder = {
        ...ord,
        status: 'Kept on Spot (Purchased)',
        doorstepTimerMinutesLeft: 0,
        notes: defaultNotes,
        paymentUpiRef: ord.paymentUpiRef || `UPI-TXN-${Date.now().toString().slice(-6)}`
      };
      updatedOrder = u;
      return u;
    }
    return ord;
  });

  saveTrialOrders(updatedOrders);

  if (updatedOrder) {
    const u = updatedOrder as TrialOrder;

    // 1. Keep inwardUnits deducted; convert unitsInTrial -> unitsSold
    const products = getDarkstoreProducts();
    const updatedProds = products.map(p => {
      if (p.id === u.productId || p.sku === u.productSku) {
        const sold = (p.unitsSold || 0) + 1;
        newUnitsSold = sold;
        return {
          ...p,
          unitsInTrial: Math.max(0, (p.unitsInTrial || 1) - 1),
          unitsSold: sold
        };
      }
      return p;
    });
    saveDarkstoreProducts(updatedProds);

    // 2. Sync order status in Supabase drobe_trial_orders
    try {
      supabaseUpdateOrderStatus(u.id, u.status, {
        doorstepTimerMinutesLeft: 0,
        paymentUpiRef: u.paymentUpiRef,
        notes: u.notes
      }).catch(() => {});

      // 3. Sync confirmed sold status to Supabase drobe_products table
      supabaseConfirmSoldStock(u.productId || u.productSku || '', 1).catch(() => {});

      // 4. Record audit event in drobe_order_events
      supabaseRecordOrderEvent(
        u.id, 
        u.orderNumber, 
        u.status, 
        'Admin Inwarding Desk', 
        `Order marked delivered & kept on spot. Stock kept deducted in DB.`
      ).catch(() => {});
    } catch {}

    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(new Event('storage'));
      } catch {}
    }
  }

  return { order: updatedOrder, unitsSold: newUnitsSold };
}

// Admin: Adjust stock units directly on shelf (e.g. +5 units restocked, cycle count)
export function adjustProductStock(
  productId: string, 
  delta: number, 
  reason: string = 'Darkstore Stock Audit'
): DarkstoreProduct | null {
  const products = getDarkstoreProducts();
  let updatedProduct: DarkstoreProduct | null = null;

  const updated = products.map(p => {
    if (p.id === productId) {
      const newInward = Math.max(0, (p.inwardUnits || 0) + delta);
      const u: DarkstoreProduct = {
        ...p,
        inwardUnits: newInward,
        inventory: Math.max(newInward, p.inventory)
      };
      updatedProduct = u;
      return u;
    }
    return p;
  });

  saveDarkstoreProducts(updated);
  return updatedProduct;
}

// Get 4-digit Delivery Verification OTP (fallback to last 4 digits of order number)
export function getOrderDeliveryOtp(order: TrialOrder): string {
  if (order.deliveryOtp && order.deliveryOtp.trim().length === 4) {
    return order.deliveryOtp;
  }
  const digits = (order.orderNumber || '').replace(/[^0-9]/g, '');
  if (digits.length >= 4) {
    return digits.slice(-4);
  }
  return '4829';
}

// Verify Delivery OTP entered by runner at doorstep
export function verifyOrderOtp(orderId: string, inputOtp: string): boolean {
  const orders = getTrialOrders();
  const order = orders.find(o => o.id === orderId || o.orderNumber === orderId);
  if (!order) return false;
  const expected = getOrderDeliveryOtp(order);
  return (inputOtp || '').trim() === expected.trim();
}

// Confirm Customer Purchased on Spot with UPI reference
export function confirmCustomerPayment(
  orderId: string,
  upiRef?: string
): TrialOrder | null {
  const orders = getTrialOrders();
  let updatedOrder: TrialOrder | null = null;

  const updated = orders.map(ord => {
    if (ord.id === orderId || ord.orderNumber === orderId) {
      const u: TrialOrder = {
        ...ord,
        status: 'Kept on Spot (Purchased)',
        doorstepTimerMinutesLeft: 0,
        paymentUpiRef: upiRef || `UPI-TXN-${Date.now().toString().slice(-6)}`,
        notes: `Customer completed doorstep fitting & purchased on spot! Payment confirmed via UPI (${upiRef || 'Direct Doorstep Dynamic QR'}).`
      };
      updatedOrder = u;
      return u;
    }
    return ord;
  });

  saveTrialOrders(updated);

  if (updatedOrder) {
    const u = updatedOrder as TrialOrder;
    try {
      supabaseUpdateOrderStatus(u.id, u.status, {
        doorstepTimerMinutesLeft: 0,
        paymentUpiRef: u.paymentUpiRef,
        notes: u.notes
      }).catch(() => {});
      supabaseRecordOrderEvent(u.id, u.orderNumber, u.status, 'Runner Doorstep Dynamic UPI', u.notes).catch(() => {});
    } catch {}
  }

  // Update product sales stats
  if (updatedOrder) {
    const products = getDarkstoreProducts();
    const updatedProds = products.map(p => {
      if (p.id === (updatedOrder as TrialOrder).productId || p.sku === (updatedOrder as TrialOrder).productSku) {
        return {
          ...p,
          unitsInTrial: Math.max(0, (p.unitsInTrial || 1) - 1),
          unitsSold: (p.unitsSold || 0) + 1
        };
      }
      return p;
    });
    saveDarkstoreProducts(updatedProds);

    try {
      supabaseConfirmSoldStock((updatedOrder as TrialOrder).productId || (updatedOrder as TrialOrder).productSku || '', 1).catch(() => {});
    } catch {}
  }

  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new Event('storage'));
    } catch {}
  }

  return updatedOrder;
}

// Confirm Customer Return with Tamper-Proof Bag Seal ID
export function confirmCustomerReturnWithSeal(
  orderId: string,
  sealTag: string,
  returnReason?: string
): TrialOrder | null {
  const orders = getTrialOrders();
  let updatedOrder: TrialOrder | null = null;

  const updated = orders.map(ord => {
    if (ord.id === orderId || ord.orderNumber === orderId) {
      const u: TrialOrder = {
        ...ord,
        status: 'Returned on Spot (Runner Heading to Hub)',
        returnSealTag: sealTag || `SEAL-${Date.now().toString().slice(-4)}`,
        returnReason: returnReason || 'Instant Doorstep Return · Did not fit/suit',
        instantRefundStatus: `Instant refund initiated for ${ord.price}`,
        notes: `Garment sealed inside tamper-evident return bag #${sealTag || 'SEAL-01'}. Runner heading back to Ahmedabad Darkstore Hub.`
      };
      updatedOrder = u;
      return u;
    }
    return ord;
  });

  saveTrialOrders(updated);

  if (updatedOrder) {
    const u = updatedOrder as TrialOrder;
    try {
      supabaseUpdateOrderStatus(u.id, u.status, {
        doorstepTimerMinutesLeft: 0,
        returnSealTag: u.returnSealTag,
        returnReason: u.returnReason,
        instantRefundStatus: u.instantRefundStatus,
        notes: u.notes
      }).catch(() => {});
      supabaseRecordOrderEvent(u.id, u.orderNumber, u.status, 'Runner Doorstep Return Bag', u.notes).catch(() => {});
    } catch {}
  }

  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new Event('storage'));
    } catch {}
  }

  return updatedOrder;
}

// Generate Shift Handover CSV Report for Ahmedabad Darkstore Hub
export function generateShiftReportCsv(): string {
  const orders = getTrialOrders();
  const headers = [
    'Order Number',
    'Status',
    'Shelf Location',
    'Product Name',
    'SKU',
    'Size',
    'Brand',
    'Price',
    'Customer Name',
    'Customer Phone',
    'Delivery Address',
    'Runner Name',
    'Received At',
    'Dispatched At',
    'Doorstep OTP',
    'UPI Ref / Seal Tag',
    'Hub Location'
  ];

  const rows = orders.map(o => [
    `"${o.orderNumber}"`,
    `"${o.status}"`,
    `"${o.shelfLocation}"`,
    `"${o.productName.replace(/"/g, '""')}"`,
    `"${o.productSku || ''}"`,
    `"${o.size || ''}"`,
    `"${o.brandName || ''}"`,
    `"${o.price}"`,
    `"${o.customerName.replace(/"/g, '""')}"`,
    `"${o.customerPhone || ''}"`,
    `"${(o.customerAddress || '').replace(/"/g, '""')}"`,
    `"${o.riderName || 'Unassigned'}"`,
    `"${o.receivedAt || ''}"`,
    `"${o.dispatchedAt || ''}"`,
    `"${getOrderDeliveryOtp(o)}"`,
    `"${o.paymentUpiRef || o.returnSealTag || ''}"`,
    `"Shivam Bungalows 1, Koteshwar Road, Ahmedabad"`
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

// ==============================================================================
// CUSTOMER USER PROFILES & REAL-TIME ACTIVITY TELEMETRY
// ==============================================================================

export interface DrobeUserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  city: string;
  hubZone: string;
  topSize: string;
  bottomSize: string;
  footwearSize: string;
  preferredFit: string;
  preferredStyles: string[];
  favouriteBrands: string[];
  savedAddresses: Array<{
    id: string;
    tag: string;
    recipient: string;
    line1: string;
    line2: string;
    pincode: string;
    isDefault?: boolean;
  }>;
  upiId: string;
  totalOrdersCount: number;
  totalSpentInr: number;
  doorstepTrialsCount: number;
  keptRatioPercentage: number;
  currentStatus: 'Active Browsing' | 'In Doorstep Trial' | 'Trial Bag Out' | 'Offline';
  currentScreen: string;
  deviceInfo: string;
  ipAddress?: string;
  lastActiveAt: string;
  createdAt: string;

  // ADVANCED DROP-OFF & HESITATION TELEMETRY
  dropoffRisk?: 'Low' | 'Medium' | 'High' | 'Immediate Dropoff';
  funnelDropoffStage?: 'Product View' | 'Cart Review' | 'Payment Gateway' | 'Doorstep Window';
  lastHesitationReason?: string;
  cartItemCount?: number;
  cartTotalInr?: number;
  dwellSeconds?: number;
}

export interface DrobeUserActivity {
  id: string;
  userId: string;
  userName: string;
  activityType: 
    | 'PAGE_VIEW' 
    | 'PRODUCT_CLICK' 
    | 'WISHLIST_ADD' 
    | 'TRIAL_ORDER_PLACED' 
    | 'DOORSTEP_TRIAL_START' 
    | 'ITEM_KEPT' 
    | 'ITEM_RETURNED' 
    | 'PROFILE_EDIT'
    | 'CART_ABANDON'
    | 'CHECKOUT_BACKOUT'
    | 'PRICE_HESITATION'
    | 'SIZE_UNAVAILABLE'
    | 'DOORSTEP_TIMER_ANXIETY'
    | 'DWELL_TIME_EXCEEDED';
  title: string;
  details?: Record<string, any>;
  screen?: string;
  device?: string;
  timestamp: string;

  // Advanced Hesitation & Drop-Off Signals
  isDropoffSignal?: boolean;
  hesitationReason?: string;
  dropoffStage?: 'Catalog' | 'Product Detail' | 'Cart' | 'Checkout / UPI' | 'Doorstep Fitting' | 'Return Initiated';
  dwellSeconds?: number;
  aiRiskScore?: number;
}

export interface DrobeAIShopperReport {
  id: string;
  timestamp: string;
  executiveSummary: string;
  dropoffRootCauses: Array<{
    user: string;
    stage: string;
    trigger: string;
    riskLevel: 'High' | 'Medium' | 'Critical';
  }>;
  recommendedActions: Array<{
    target: string;
    action: string;
    impact: string;
  }>;
  shopperIntentBreakdown: {
    highIntentCount: number;
    atRiskDropoffCount: number;
    windowShoppersCount: number;
    highIntentPct: number;
    atRiskPct: number;
  };
  liveTrafficCount: number;
  activeDoorstepTrials: number;
  modelUsed: string;
}

export const INITIAL_USER_PROFILES: DrobeUserProfile[] = [
  {
    id: 'usr_aman_01',
    name: 'Aman Mishra',
    email: 'aman@example.com',
    phone: '+91 98250 88123',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    city: 'Ahmedabad',
    hubZone: 'Ahmedabad Darkstore Hub #01 (SG Highway)',
    topSize: 'L',
    bottomSize: '32',
    footwearSize: 'UK 9',
    preferredFit: 'Relaxed',
    preferredStyles: ['Streetwear', 'Casual', 'Minimal', 'Oversized'],
    favouriteBrands: ['SNITCH', 'The Souled Store', 'Tilt', 'Mark Leute'],
    savedAddresses: [
      {
        id: 'addr-1',
        tag: 'Home',
        recipient: 'Aman Mishra',
        line1: 'B-702, Shaligram Plus, Opp. Iskcon Temple',
        line2: 'SG Highway, Ahmedabad, Gujarat',
        pincode: '380015',
        isDefault: true
      }
    ],
    upiId: 'aman@okhdfcbank',
    totalOrdersCount: 4,
    totalSpentInr: 12890,
    doorstepTrialsCount: 4,
    keptRatioPercentage: 100,
    currentStatus: 'Active Browsing',
    currentScreen: 'Viewing Mark Leute Hoodie',
    deviceInfo: 'iPhone 16 Pro · iOS 18.2',
    lastActiveAt: 'Just now',
    createdAt: 'Oct 01, 2026',
    dropoffRisk: 'Low',
    funnelDropoffStage: 'Cart Review',
    lastHesitationReason: 'Checking shoulder drop sizing on Heavy Oversized Hoodie',
    cartItemCount: 2,
    cartTotalInr: 4398,
    dwellSeconds: 94
  },
  {
    id: 'usr_pooja_02',
    name: 'Pooja Shah',
    email: 'pooja.shah@gmail.com',
    phone: '+91 98792 33410',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    city: 'Ahmedabad',
    hubZone: 'Bopal Darkstore Express Zone',
    topSize: 'M',
    bottomSize: '28',
    footwearSize: 'UK 6',
    preferredFit: 'Regular',
    preferredStyles: ['Minimal', 'Casual', 'Athleisure'],
    favouriteBrands: ['Tilt', 'Mark Leute', 'Bluorng'],
    savedAddresses: [
      {
        id: 'addr-2',
        tag: 'Home',
        recipient: 'Pooja Shah',
        line1: 'Villa 14, Sun City, Bopal',
        line2: 'Ahmedabad, Gujarat',
        pincode: '380058',
        isDefault: true
      }
    ],
    upiId: 'pooja@axisbank',
    totalOrdersCount: 3,
    totalSpentInr: 8400,
    doorstepTrialsCount: 3,
    keptRatioPercentage: 100,
    currentStatus: 'In Doorstep Trial',
    currentScreen: '6-Minute Doorstep Fitting Window',
    deviceInfo: 'OnePlus 12 · Android 14',
    lastActiveAt: '2 mins ago',
    createdAt: 'Oct 04, 2026',
    dropoffRisk: 'Low',
    funnelDropoffStage: 'Doorstep Window',
    lastHesitationReason: 'Active 6-minute fitting trial in Bopal · Runner waiting outside',
    cartItemCount: 1,
    cartTotalInr: 4200,
    dwellSeconds: 210
  },
  {
    id: 'usr_harshil_03',
    name: 'Harshil Patel',
    email: 'harshil.p@outlook.com',
    phone: '+91 97120 44912',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    city: 'Ahmedabad',
    hubZone: 'Motera & Koteshwar Express Hub',
    topSize: 'XL',
    bottomSize: '34',
    footwearSize: 'UK 10',
    preferredFit: 'Oversized',
    preferredStyles: ['Streetwear', 'Oversized', 'Drop Shoulder'],
    favouriteBrands: ['SNITCH', 'Huemn', 'VegNonVeg'],
    savedAddresses: [
      {
        id: 'addr-3',
        tag: 'Work',
        recipient: 'Harshil Patel',
        line1: 'Floor 3, Westgate Business Bay, SG Highway',
        line2: 'Ahmedabad, Gujarat',
        pincode: '380054',
        isDefault: true
      }
    ],
    upiId: 'harshil@okaxis',
    totalOrdersCount: 5,
    totalSpentInr: 15200,
    doorstepTrialsCount: 6,
    keptRatioPercentage: 83,
    currentStatus: 'Active Browsing',
    currentScreen: 'Catalog Category Filter: Outerwear',
    deviceInfo: 'Samsung Galaxy S24 Ultra',
    lastActiveAt: '12 mins ago',
    createdAt: 'Sep 28, 2026',
    dropoffRisk: 'High',
    funnelDropoffStage: 'Payment Gateway',
    lastHesitationReason: 'Checkout Back-Out: Paused at UPI confirmation screen for ₹3,498 cart for 180s without OTP',
    cartItemCount: 2,
    cartTotalInr: 3498,
    dwellSeconds: 180
  },
  {
    id: 'usr_tanya_04',
    name: 'Tanya Joshi',
    email: 'tanya.j@icloud.com',
    phone: '+91 99041 55201',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
    city: 'Ahmedabad',
    hubZone: 'Satellite & Vastrapur Hub #02',
    topSize: 'S',
    bottomSize: '26',
    footwearSize: 'UK 5',
    preferredFit: 'Slim',
    preferredStyles: ['Minimal', 'Contemporary', 'Streetwear'],
    favouriteBrands: ['The Souled Store', 'Tilt'],
    savedAddresses: [],
    upiId: 'tanyaj@paytm',
    totalOrdersCount: 2,
    totalSpentInr: 6500,
    doorstepTrialsCount: 2,
    keptRatioPercentage: 100,
    currentStatus: 'Offline',
    currentScreen: 'Home Feed',
    deviceInfo: 'iPhone 15 · iOS 18.1',
    lastActiveAt: '2 hours ago',
    createdAt: 'Oct 08, 2026',
    dropoffRisk: 'Medium',
    funnelDropoffStage: 'Product View',
    lastHesitationReason: 'Doorstep Timer Anxiety: Spent 90s reading 6-minute fitting rules and overtime fee structure',
    cartItemCount: 1,
    cartTotalInr: 1999,
    dwellSeconds: 95
  },
  {
    id: 'usr_dhruv_05',
    name: 'Dhruv Mehta',
    email: 'dhruv99@yahoo.com',
    phone: '+91 98980 77144',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    city: 'Ahmedabad',
    hubZone: 'Prahlad Nagar Express Zone',
    topSize: 'M',
    bottomSize: '30',
    footwearSize: 'UK 8',
    preferredFit: 'Relaxed',
    preferredStyles: ['Casual', 'Streetwear'],
    favouriteBrands: ['Mark Leute', 'SNITCH'],
    savedAddresses: [],
    upiId: 'dhruv@icici',
    totalOrdersCount: 1,
    totalSpentInr: 4200,
    doorstepTrialsCount: 2,
    keptRatioPercentage: 50,
    currentStatus: 'Offline',
    currentScreen: 'Past Orders Screen',
    deviceInfo: 'Google Pixel 9 Pro',
    lastActiveAt: '5 hours ago',
    createdAt: 'Oct 10, 2026',
    dropoffRisk: 'Immediate Dropoff',
    funnelDropoffStage: 'Product View',
    lastHesitationReason: 'Size Out of Stock: Looked for UK 8 in footwear at Ahmedabad Hub, found 0 units, exited app',
    cartItemCount: 0,
    cartTotalInr: 0,
    dwellSeconds: 40
  }
];

export const INITIAL_USER_ACTIVITIES: DrobeUserActivity[] = [
  {
    id: 'act-001',
    userId: 'usr_harshil_03',
    userName: 'Harshil Patel',
    activityType: 'CHECKOUT_BACKOUT',
    title: '⚠️ Abandoned Cart at UPI Payment Gateway (₹3,498)',
    details: { cartTotal: '₹3,498', items: '2 Fits', dwellTime: '180s', step: 'UPI Intent' },
    screen: 'UPI Payment Gateway',
    device: 'Samsung Galaxy S24 Ultra',
    timestamp: 'Just now',
    isDropoffSignal: true,
    hesitationReason: 'User paused on GPay/PhonePe screen for 3 minutes without confirming UPI PIN.',
    dropoffStage: 'Checkout / UPI',
    dwellSeconds: 180,
    aiRiskScore: 92
  },
  {
    id: 'act-002',
    userId: 'usr_dhruv_05',
    userName: 'Dhruv Mehta',
    activityType: 'SIZE_UNAVAILABLE',
    title: '⚠️ Out of Stock Bounce: Attempted to Select UK 8 Sneaker',
    details: { brand: 'VegNonVeg', sizeRequested: 'UK 8', stockStatus: '0 pcs in Hub' },
    screen: 'Product Detail Sizing Selector',
    device: 'Google Pixel 9 Pro',
    timestamp: '3 mins ago',
    isDropoffSignal: true,
    hesitationReason: 'Size UK 8 has 0 inward units in Ahmedabad Hub. User tapped out-of-stock size and exited app.',
    dropoffStage: 'Product Detail',
    dwellSeconds: 40,
    aiRiskScore: 85
  },
  {
    id: 'act-003',
    userId: 'usr_tanya_04',
    userName: 'Tanya Joshi',
    activityType: 'DOORSTEP_TIMER_ANXIETY',
    title: '⚡ Hesitation on 6-Min Doorstep Window Terms & Overtime Surcharge',
    details: { section: '6-Min Doorstep Fitting Terms', overtimeFee: '₹2/min', dwell: '95s' },
    screen: 'Checkout Doorstep Agreement',
    device: 'iPhone 15',
    timestamp: '7 mins ago',
    isDropoffSignal: true,
    hesitationReason: 'Customer read through doorstep trial overtime fees 3 times without proceeding to address confirmation.',
    dropoffStage: 'Cart',
    dwellSeconds: 95,
    aiRiskScore: 68
  },
  {
    id: 'act-004',
    userId: 'usr_aman_01',
    userName: 'Aman Mishra',
    activityType: 'PRODUCT_CLICK',
    title: 'Viewing Mark Leute Heavy Oversized Hoodie (Size L)',
    details: { brand: 'Mark Leute', sku: 'DR1', price: '₹2,899', size: 'L' },
    screen: 'Product Detail',
    device: 'iPhone 16 Pro',
    timestamp: '10 mins ago',
    isDropoffSignal: false,
    dropoffStage: 'Product Detail',
    dwellSeconds: 94,
    aiRiskScore: 20
  },
  {
    id: 'act-005',
    userId: 'usr_pooja_02',
    userName: 'Pooja Shah',
    activityType: 'DOORSTEP_TRIAL_START',
    title: '6-Minute Doorstep Fitting Window Started in Bopal',
    details: { orderNumber: '#DRB-9843', runner: 'Jay Suthar', item: 'Sculpted Wool Overcoat' },
    screen: 'Live Doorstep Trial',
    device: 'OnePlus 12',
    timestamp: '14 mins ago',
    isDropoffSignal: false,
    dropoffStage: 'Doorstep Fitting',
    dwellSeconds: 210,
    aiRiskScore: 10
  },
  {
    id: 'act-006',
    userId: 'usr_harshil_03',
    userName: 'Harshil Patel',
    activityType: 'PRICE_HESITATION',
    title: '⚡ Inspected Drobe 5% Platform Markup & Wholesale Pricing Breakdown',
    details: { basePrice: '₹1,900', customerPrice: '₹1,999', markup: '+₹99 (4.83%)' },
    screen: 'Price Transparency Drawer',
    device: 'Samsung Galaxy S24 Ultra',
    timestamp: '18 mins ago',
    isDropoffSignal: true,
    hesitationReason: 'Expanded wholesale markup pill and spent 120s reading fee structure before adding to bag.',
    dropoffStage: 'Product Detail',
    dwellSeconds: 120,
    aiRiskScore: 75
  }
];

export const INITIAL_AI_REPORT: DrobeAIShopperReport = {
  id: 'rep-init-01',
  timestamp: 'Just now',
  executiveSummary: 'Live analysis of Ahmedabad Darkstore traffic shows strong purchase interest, but distinct drop-off friction at the final payment gateway and specific out-of-stock shoe sizes. Harshil Patel represents an immediate drop-off risk at the UPI gateway (₹3,498 cart abandoned), while Dhruv Mehta exited after encountering an out-of-stock UK 8 sneaker size. Doorstep trial fitting retention in Bopal & SG Highway remains stellar at 87% with zero friction.',
  dropoffRootCauses: [
    {
      user: 'Harshil Patel',
      stage: 'Payment Gateway (UPI)',
      trigger: 'Abandoned ₹3,498 cart after 180s dwell time on UPI intent screen without submitting PIN.',
      riskLevel: 'Critical'
    },
    {
      user: 'Dhruv Mehta',
      stage: 'Product Detail',
      trigger: 'Zero inward units available for Footwear Size UK 8 in darkstore rack AMD-RC01. User immediately bounced.',
      riskLevel: 'High'
    },
    {
      user: 'Tanya Joshi',
      stage: 'Cart & Doorstep Terms',
      trigger: 'Dwell time exceeded 95s reviewing 6-minute fitting rules and ₹2/min overtime surcharge.',
      riskLevel: 'Medium'
    }
  ],
  recommendedActions: [
    {
      target: 'Harshil Patel',
      action: 'Send instant WhatsApp nudge with 1-click ₹150 trial credit to clear UPI hesitation and dispatch order.',
      impact: 'Immediate recovery of ₹3,498 high-intent outerwear cart.'
    },
    {
      target: 'Darkstore Inwarding Ops (Koteshwar Hub)',
      action: 'Fast-track consignment inwarding for Size UK 8 / EU 42 on Rack C-01 to capture repeat sneaker demand.',
      impact: 'Prevents estimated ₹8,400 weekly revenue loss from out-of-stock bounces.'
    },
    {
      target: 'Doorstep Fitting Agreement UI',
      action: 'Highlight reassurance: "Runner waits comfortably outside. Return unchosen items instantly with zero return fee."',
      impact: 'Reduces doorstep timer anxiety by ~35%.'
    }
  ],
  shopperIntentBreakdown: {
    highIntentCount: 2,
    atRiskDropoffCount: 2,
    windowShoppersCount: 1,
    highIntentPct: 40,
    atRiskPct: 40
  },
  liveTrafficCount: 5,
  activeDoorstepTrials: 1,
  modelUsed: 'Gemini 1.5 Flash (Ahmedabad Shopper Behavioral Engine)'
};

export function getUserProfiles(): DrobeUserProfile[] {
  if (typeof window === 'undefined') return INITIAL_USER_PROFILES;
  try {
    const raw = localStorage.getItem('drobe_user_profiles');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return INITIAL_USER_PROFILES;
}

export function saveUserProfiles(users: DrobeUserProfile[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('drobe_user_profiles', JSON.stringify(users));
    window.dispatchEvent(new Event('storage'));
  } catch {}
}

export function getUserActivities(): DrobeUserActivity[] {
  if (typeof window === 'undefined') return INITIAL_USER_ACTIVITIES;
  try {
    const raw = localStorage.getItem('drobe_user_activities');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return INITIAL_USER_ACTIVITIES;
}

export function saveUserActivities(acts: DrobeUserActivity[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('drobe_user_activities', JSON.stringify(acts));
    window.dispatchEvent(new Event('storage'));
  } catch {}
}

export function logUserActivity(activity: Omit<DrobeUserActivity, 'id' | 'timestamp'>): DrobeUserActivity {
  const current = getUserActivities();
  const newActivity: DrobeUserActivity = {
    ...activity,
    id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: 'Just now'
  };
  const updated = [newActivity, ...current].slice(0, 60);
  saveUserActivities(updated);
  return newActivity;
}

export function updateUserProfile(profile: Partial<DrobeUserProfile> & { id: string }): DrobeUserProfile | null {
  const users = getUserProfiles();
  const idx = users.findIndex(u => u.id === profile.id);
  if (idx === -1) return null;
  const updatedUser = {
    ...users[idx],
    ...profile,
    lastActiveAt: 'Just now'
  };
  users[idx] = updatedUser;
  saveUserProfiles(users);
  return updatedUser;
}

// AI Shopper Telemetry Reports Storage & Synthesis
export function getLatestAIReport(): DrobeAIShopperReport {
  if (typeof window === 'undefined') return INITIAL_AI_REPORT;
  try {
    const raw = localStorage.getItem('drobe_latest_ai_report');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.executiveSummary) return parsed;
    }
  } catch {}
  return INITIAL_AI_REPORT;
}

export function saveAIReport(report: DrobeAIShopperReport): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('drobe_latest_ai_report', JSON.stringify(report));
    window.dispatchEvent(new CustomEvent('drobe_ai_report_updated', { detail: report }));
  } catch {}
}

// Smart Heuristic AI Fallback Generator (used if external LLM API is unavailable)
export function generateHeuristicAIShopperReport(
  activities: DrobeUserActivity[],
  users: DrobeUserProfile[]
): DrobeAIShopperReport {
  const dropoffs = activities.filter(a => a.isDropoffSignal || a.activityType === 'CHECKOUT_BACKOUT' || a.activityType === 'SIZE_UNAVAILABLE' || a.activityType === 'PRICE_HESITATION');
  const atRiskUsers = users.filter(u => u.dropoffRisk === 'High' || u.dropoffRisk === 'Immediate Dropoff');
  const highIntentUsers = users.filter(u => u.dropoffRisk === 'Low');

  const rootCauses = dropoffs.slice(0, 4).map(d => ({
    user: d.userName,
    stage: d.dropoffStage || 'Product Detail',
    trigger: d.hesitationReason || d.title,
    riskLevel: (d.aiRiskScore && d.aiRiskScore >= 80 ? 'Critical' : 'High') as 'Critical' | 'High' | 'Medium'
  }));

  const recommendedActions = atRiskUsers.slice(0, 3).map(u => ({
    target: u.name,
    action: u.funnelDropoffStage === 'Payment Gateway' 
      ? `Send automated recovery WhatsApp message with 1-click UPI link and ₹100 trial discount.`
      : u.funnelDropoffStage === 'Doorstep Window'
      ? `Reassure customer: 6-minute fitting trial includes instant doorstep handover with zero return penalty.`
      : `Restock size ${u.topSize || u.footwearSize} at darkstore shelf to eliminate bounce friction.`,
    impact: `Direct recovery of shopper with ₹${(u.totalSpentInr || 2400).toLocaleString('en-IN')} average LTV.`
  }));

  if (recommendedActions.length === 0) {
    recommendedActions.push({
      target: 'General Darkstore Traffic',
      action: 'Maintain instant 30-minute delivery SLA in SG Highway & Bopal zones.',
      impact: 'Sustains current 87% doorstep fitting retention.'
    });
  }

  return {
    id: `rep-${Date.now()}`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    executiveSummary: dropoffs.length > 0
      ? `Live monitoring detected ${dropoffs.length} hesitation / drop-off signal(s) in the last 10 minutes. ${atRiskUsers.map(u => u.name).join(', ') || 'Shoppers'} backed out due to ${dropoffs[0]?.hesitationReason?.slice(0, 80) || 'checkout payment friction'}. ${highIntentUsers.length} shopper(s) maintain strong conversion intent.`
      : `Platform operating smoothly across Ahmedabad Darkstore. ${users.length} shoppers active, with healthy browsing velocity and zero checkout drop-offs detected in this window.`,
    dropoffRootCauses: rootCauses.length > 0 ? rootCauses : INITIAL_AI_REPORT.dropoffRootCauses,
    recommendedActions,
    shopperIntentBreakdown: {
      highIntentCount: highIntentUsers.length,
      atRiskDropoffCount: atRiskUsers.length,
      windowShoppersCount: Math.max(0, users.length - highIntentUsers.length - atRiskUsers.length),
      highIntentPct: Math.round((highIntentUsers.length / (users.length || 1)) * 100),
      atRiskPct: Math.round((atRiskUsers.length / (users.length || 1)) * 100)
    },
    liveTrafficCount: users.length,
    activeDoorstepTrials: users.filter(u => u.currentStatus === 'In Doorstep Trial').length,
    modelUsed: 'Gemini Behavioral Analytics Engine (Adaptive Local Fallback)'
  };
}

// ==============================================================================
// EXTENDED SYSTEM REPORTING & TELEMETRY DOMAIN MODELS (FULL DB SUITE)
// ==============================================================================

export interface DrobeWholesaleSettlement {
  id: string;
  settlementReference: string;
  brandId: string;
  brandName: string;
  category: string;
  keptUnitsCount: number;
  baseWholesalePayoutDue: number;
  drobeRetainedMarkupInr: number;
  grossGmvInr: number;
  bankUtrRef: string;
  status: 'Pending' | 'Processing' | 'Disbursed' | 'On Hold';
  notes: string;
  createdAt: string;
}

export interface DrobeMarginLedgerEntry {
  id: string;
  orderId: string;
  productId: string;
  sku: string;
  brandId: string;
  customerPaidMrp: number;
  baseWholesaleCostB: number;
  drobeMarkupEarned: number;
  runnerDeliveryFee: number;
  paymentGatewayFee: number;
  netProfitInr: number;
  createdAt: string;
}

export interface DrobeHesitationLog {
  id: string;
  userId: string;
  userName: string;
  frictionType: string;
  funnelStage: string;
  hesitationNarrative: string;
  cartTotalInr: number;
  cartItemsCount: number;
  dwellSeconds: number;
  aiRiskScore: number;
  createdAt: string;
}

export interface DrobeRecoveryIntervention {
  id: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  triggerReason: string;
  channel: 'WhatsApp' | 'SMS' | 'Push Notification' | 'Call';
  trialCreditInr: number;
  couponCode: string;
  status: 'Pending' | 'Sent' | 'Delivered' | 'Claimed' | 'Expired';
  revenueRecoveredInr: number;
  createdAt: string;
}

export interface DrobeDarkstoreMetrics {
  id: string;
  warehouseId: string;
  dateBucket: string;
  totalOrdersReceived: number;
  slaCompliancePercentage: number;
  avgPickerSeconds: number;
  avgDeliveryMinutes: number;
  totalUnitsInwarded: number;
  totalUnitsKept: number;
  totalUnitsReturned: number;
  keptRatioPercentage: number;
}

export interface DrobeRefundRecord {
  id: string;
  orderId: string;
  customerPhone: string;
  upiId: string;
  refundAmountInr: number;
  refundUtr: string;
  gatewayProvider: string;
  processingTimeSeconds: number;
  status: 'Initiated' | 'Processing' | 'Success' | 'Failed';
  createdAt: string;
}

export const INITIAL_WHOLESALE_SETTLEMENTS: DrobeWholesaleSettlement[] = [
  {
    id: 'settl-01',
    settlementReference: 'SETTL-DRB-2026-0041',
    brandId: 'br_mark_leute',
    brandName: 'Mark Leute',
    category: 'Outerwear',
    keptUnitsCount: 12,
    baseWholesalePayoutDue: 22200,
    drobeRetainedMarkupInr: 10788,
    grossGmvInr: 32988,
    bankUtrRef: 'NEFT-HDFC-9912038412',
    status: 'Disbursed',
    notes: 'Weekly batch settlement #41 · Consignment kept units',
    createdAt: 'Today, 11:30 AM'
  },
  {
    id: 'settl-02',
    settlementReference: 'SETTL-DRB-2026-0042',
    brandId: 'br_underrated_club',
    brandName: 'Underrated Club',
    category: 'Tops & Tees',
    keptUnitsCount: 18,
    baseWholesalePayoutDue: 15300,
    drobeRetainedMarkupInr: 8982,
    grossGmvInr: 24282,
    bankUtrRef: 'IMPS-AXIS-8812903120',
    status: 'Disbursed',
    notes: 'Weekly batch settlement #42 · High kept ratio (91%)',
    createdAt: 'Today, 02:15 PM'
  }
];

export const INITIAL_MARGIN_LEDGER: DrobeMarginLedgerEntry[] = [
  {
    id: 'ledg-01',
    orderId: 'ord-30m-102',
    productId: 'prod_uc_tee_02',
    sku: 'DR2',
    brandId: 'br_underrated_club',
    customerPaidMrp: 1499,
    baseWholesaleCostB: 850,
    drobeMarkupEarned: 649,
    runnerDeliveryFee: 45,
    paymentGatewayFee: 22,
    netProfitInr: 582,
    createdAt: 'Today, 01:20 PM'
  },
  {
    id: 'ledg-02',
    orderId: 'ord-30m-101',
    productId: 'prod_ml_hoodie_01',
    sku: 'DR1',
    brandId: 'br_mark_leute',
    customerPaidMrp: 2899,
    baseWholesaleCostB: 1850,
    drobeMarkupEarned: 1049,
    runnerDeliveryFee: 45,
    paymentGatewayFee: 43,
    netProfitInr: 961,
    createdAt: 'Today, 12:45 PM'
  }
];

export const INITIAL_HESITATION_LOGS: DrobeHesitationLog[] = [
  {
    id: 'hes-01',
    userId: 'usr_harshil_03',
    userName: 'Harshil Patel',
    frictionType: 'CHECKOUT_BACKOUT',
    funnelStage: 'Payment Gateway (UPI)',
    hesitationNarrative: 'Abandoned ₹3,498 cart after 180s dwell time on UPI intent screen without submitting PIN.',
    cartTotalInr: 3498,
    cartItemsCount: 2,
    dwellSeconds: 180,
    aiRiskScore: 92,
    createdAt: 'Just now'
  },
  {
    id: 'hes-02',
    userId: 'usr_dhruv_05',
    userName: 'Dhruv Mehta',
    frictionType: 'SIZE_UNAVAILABLE',
    funnelStage: 'Product Detail Sizing',
    hesitationNarrative: 'Zero inward units available for Footwear Size UK 8 in darkstore rack AMD-RC01. User immediately bounced.',
    cartTotalInr: 4499,
    cartItemsCount: 1,
    dwellSeconds: 40,
    aiRiskScore: 84,
    createdAt: '3 mins ago'
  },
  {
    id: 'hes-03',
    userId: 'usr_tanya_04',
    userName: 'Tanya Joshi',
    frictionType: 'DOORSTEP_TIMER_ANXIETY',
    funnelStage: 'Cart & Doorstep Terms',
    hesitationNarrative: 'Dwell time exceeded 95s reviewing 6-minute fitting rules and ₹2/min overtime surcharge.',
    cartTotalInr: 2199,
    cartItemsCount: 1,
    dwellSeconds: 95,
    aiRiskScore: 68,
    createdAt: '7 mins ago'
  }
];

export const INITIAL_RECOVERY_INTERVENTIONS: DrobeRecoveryIntervention[] = [
  {
    id: 'rec-01',
    userId: 'usr_harshil_03',
    customerName: 'Harshil Patel',
    customerPhone: '+91 97120 44912',
    triggerReason: 'UPI PIN Prompt Abandonment (₹3,498 cart)',
    channel: 'WhatsApp',
    trialCreditInr: 150,
    couponCode: 'DROBE150',
    status: 'Sent',
    revenueRecoveredInr: 0,
    createdAt: 'Just now'
  }
];

export const INITIAL_DARKSTORE_METRICS: DrobeDarkstoreMetrics = {
  id: 'met-01',
  warehouseId: 'AMD-DARKSTORE-01',
  dateBucket: new Date().toISOString().split('T')[0],
  totalOrdersReceived: 48,
  slaCompliancePercentage: 98,
  avgPickerSeconds: 165,
  avgDeliveryMinutes: 22,
  totalUnitsInwarded: 120,
  totalUnitsKept: 42,
  totalUnitsReturned: 6,
  keptRatioPercentage: 87
};

export function getWholesaleSettlements(): DrobeWholesaleSettlement[] {
  if (typeof window === 'undefined') return INITIAL_WHOLESALE_SETTLEMENTS;
  try {
    const raw = localStorage.getItem('drobe_wholesale_settlements');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return INITIAL_WHOLESALE_SETTLEMENTS;
}

export function saveWholesaleSettlements(settlements: DrobeWholesaleSettlement[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('drobe_wholesale_settlements', JSON.stringify(settlements));
    window.dispatchEvent(new Event('storage'));
  } catch {}
}

export function getMarginLedger(): DrobeMarginLedgerEntry[] {
  if (typeof window === 'undefined') return INITIAL_MARGIN_LEDGER;
  try {
    const raw = localStorage.getItem('drobe_margin_ledger');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return INITIAL_MARGIN_LEDGER;
}

export function saveMarginLedger(ledger: DrobeMarginLedgerEntry[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('drobe_margin_ledger', JSON.stringify(ledger));
    window.dispatchEvent(new Event('storage'));
  } catch {}
}

export function getHesitationLogs(): DrobeHesitationLog[] {
  if (typeof window === 'undefined') return INITIAL_HESITATION_LOGS;
  try {
    const raw = localStorage.getItem('drobe_hesitation_logs');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return INITIAL_HESITATION_LOGS;
}

export function saveHesitationLogs(logs: DrobeHesitationLog[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('drobe_hesitation_logs', JSON.stringify(logs));
    window.dispatchEvent(new Event('storage'));
  } catch {}
}

export function getRecoveryInterventions(): DrobeRecoveryIntervention[] {
  if (typeof window === 'undefined') return INITIAL_RECOVERY_INTERVENTIONS;
  try {
    const raw = localStorage.getItem('drobe_recovery_interventions');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return INITIAL_RECOVERY_INTERVENTIONS;
}

export function saveRecoveryInterventions(interventions: DrobeRecoveryIntervention[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('drobe_recovery_interventions', JSON.stringify(interventions));
    window.dispatchEvent(new Event('storage'));
  } catch {}
}

export function getDarkstoreMetrics(): DrobeDarkstoreMetrics {
  if (typeof window === 'undefined') return INITIAL_DARKSTORE_METRICS;
  try {
    const raw = localStorage.getItem('drobe_darkstore_metrics');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.warehouseId) return parsed;
    }
  } catch {}
  return INITIAL_DARKSTORE_METRICS;
}

export function saveDarkstoreMetrics(metrics: DrobeDarkstoreMetrics): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('drobe_darkstore_metrics', JSON.stringify(metrics));
    window.dispatchEvent(new Event('storage'));
  } catch {}
}
