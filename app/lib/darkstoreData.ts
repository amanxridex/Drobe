// Drobe Ahmedabad Darkstore & Consignment Hub Shared Data Store
// Connects Brand Dashboard and Admin Inwarding Station

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
  email: string;
  basedOutOf: string;
  status: BrandApprovalStatus;
  profileImage?: string;
  coverImage?: string;
  appliedDate: string;
  approvedDate?: string;
  totalProductsCount: number;
  inwardedUnitsCount: number;
}

export interface DarkstoreProduct {
  id: string;
  sku?: string; // DR1, DR2, DR3...
  skuSerial?: number; // 1, 2, 3...
  name: string;
  brandId: string;
  brandName: string;
  category?: string;
  price: string;
  volume?: string; // sizing (e.g. M, L)
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
}

// Storage Keys
const KEY_BRANDS = 'drobe_darkstore_brands_v2';
const KEY_PRODUCTS = 'drobe_darkstore_products_v2';
const KEY_INBOUNDS = 'drobe_darkstore_inbounds_v2';
const KEY_ORDERS = 'drobe_darkstore_orders_v2';
const KEY_LEGACY_BRAND = 'drobe_brand_profile_v1';

// Pre-seeded Brands
const INITIAL_BRANDS: DarkstoreBrand[] = [
  {
    id: 'brand-chanel-01',
    name: 'CHANEL',
    tagline: 'Timeless Haute Couture & Modern Luxury',
    category: 'Male & Female',
    founderName: 'Gabrielle Chanel',
    founderRole: 'Creative Director',
    email: 'contact@chanel.com',
    basedOutOf: 'Paris / Ahmedabad Consignment',
    status: 'Approved',
    profileImage: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
    appliedDate: '02 Oct 2026',
    approvedDate: '04 Oct 2026',
    totalProductsCount: 3,
    inwardedUnitsCount: 42
  },
  {
    id: 'brand-underrated-02',
    name: 'Underrated Club',
    tagline: 'High-octane Indian streetwear engineered for darkstore velocity',
    category: 'Male',
    founderName: 'Kabir Varma',
    founderRole: 'Founder',
    email: 'ops@underratedclub.com',
    basedOutOf: 'Mumbai / Ahmedabad Darkstore',
    status: 'Approved',
    profileImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1523381294911-8d3cead13475?auto=format&fit=crop&w=1200&q=80',
    appliedDate: '06 Oct 2026',
    approvedDate: '07 Oct 2026',
    totalProductsCount: 2,
    inwardedUnitsCount: 30
  },
  {
    id: 'brand-nova-studios-03',
    name: 'Nova Studios Ahmedabad',
    tagline: 'Handloom artisanal linen and structured minimal jackets',
    category: 'Female',
    founderName: 'Rhea Patel',
    founderRole: 'Founder & Designer',
    email: 'rhea@novastudios.in',
    basedOutOf: 'Ahmedabad (Ellisbridge)',
    status: 'Waiting for Approval',
    profileImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1200&q=80',
    appliedDate: '13 Oct 2026',
    totalProductsCount: 1,
    inwardedUnitsCount: 0
  }
];

// Pre-seeded Products with SKUs and Ahmedabad Shelf Allocations
const INITIAL_PRODUCTS: DarkstoreProduct[] = [
  {
    id: 'prod-dr-01',
    sku: 'DR1',
    skuSerial: 1,
    name: 'Bomber Drop shoulder',
    brandId: 'brand-chanel-01',
    brandName: 'CHANEL',
    category: 'Outerwear',
    price: '₹1200',
    volume: 'M',
    inventory: 24,
    inwardUnits: 20,
    unitsInTrial: 2,
    unitsSold: 2,
    tagline: 'test test test test test test test test test',
    description: 'Heavyweight matte bomber silhouette with relaxed drop shoulder tailoring.',
    images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80'],
    inwardStatus: 'Inwarded & Live',
    warehouseLocation: {
      zone: 'Zone A - Outerwear & Heavy Silhouettes',
      rack: 'Rack A-02',
      shelf: 'Shelf 3',
      bin: 'Bin 04',
      code: 'AMD-RA02-S3-B04',
      hubName: 'Ahmedabad Central Darkstore #01'
    },
    inwardDate: '08 Oct 2026',
    isLive: true
  },
  {
    id: 'prod-dr-02',
    sku: 'DR2',
    skuSerial: 2,
    name: 'Sculpted Wool Overcoat',
    brandId: 'brand-chanel-01',
    brandName: 'CHANEL',
    category: 'Outerwear',
    price: '₹4200',
    volume: 'L',
    inventory: 18,
    inwardUnits: 16,
    unitsInTrial: 1,
    unitsSold: 1,
    tagline: 'Double-faced virgin wool with horn buttons',
    description: 'Mastercrafted virgin wool silhouette with brushed silk inner lining.',
    images: ['https://images.unsplash.com/photo-1539533018447-63fcce667823?auto=format&fit=crop&w=600&q=80'],
    inwardStatus: 'Inwarded & Live',
    warehouseLocation: {
      zone: 'Zone A - Outerwear & Heavy Silhouettes',
      rack: 'Rack A-03',
      shelf: 'Shelf 2',
      bin: 'Bin 08',
      code: 'AMD-RA03-S2-B08',
      hubName: 'Ahmedabad Central Darkstore #01'
    },
    inwardDate: '09 Oct 2026',
    isLive: true
  },
  {
    id: 'prod-dr-03',
    sku: 'DR3',
    skuSerial: 3,
    name: 'Acid Washed Boxy Tee',
    brandId: 'brand-underrated-02',
    brandName: 'Underrated Club',
    category: 'Tops',
    price: '₹1499',
    volume: 'Oversized L',
    inventory: 30,
    inwardUnits: 28,
    unitsInTrial: 1,
    unitsSold: 1,
    tagline: '280 GSM French Terry with distressed ribbed collar',
    description: 'Heavyweight loopback cotton treated with volcanic enzyme wash.',
    images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80'],
    inwardStatus: 'Inwarded & Live',
    warehouseLocation: {
      zone: 'Zone B - Tops, Tees & Shirts',
      rack: 'Rack B-01',
      shelf: 'Shelf 1',
      bin: 'Bin 02',
      code: 'AMD-RB01-S1-B02',
      hubName: 'Ahmedabad Central Darkstore #01'
    },
    inwardDate: '10 Oct 2026',
    isLive: true
  },
  {
    id: 'prod-pending-04',
    name: 'Pleated Linen Trouser',
    brandId: 'brand-nova-studios-03',
    brandName: 'Nova Studios Ahmedabad',
    category: 'Bottoms',
    price: '₹2200',
    volume: '32 (M)',
    inventory: 20,
    inwardUnits: 0,
    unitsInTrial: 0,
    unitsSold: 0,
    tagline: 'Pure organic flax linen with relaxed double pleats',
    description: 'Artisanal organic flax linen loomed in Gujarat.',
    images: ['https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=600&q=80'],
    inwardStatus: 'Stock In Transit to Ahmedabad',
    isLive: false
  }
];

// Pre-seeded Inbound Shipments
const INITIAL_INBOUNDS: InboundStockShipment[] = [
  {
    id: 'INW-AMD-101',
    brandId: 'brand-chanel-01',
    brandName: 'CHANEL',
    productId: 'prod-dr-01',
    productName: 'Bomber Drop shoulder',
    units: 24,
    courierPartner: 'BlueDart Express',
    trackingNumber: 'BD-889102482-AMD',
    dispatchDate: '06 Oct 2026',
    receivedDate: '08 Oct 2026',
    status: 'Verified & Shelved',
    assignedSku: 'DR1',
    assignedShelf: 'AMD-RA02-S3-B04',
    verifiedBy: 'Harshil M. (Hub Ops)'
  },
  {
    id: 'INW-AMD-102',
    brandId: 'brand-nova-studios-03',
    brandName: 'Nova Studios Ahmedabad',
    productId: 'prod-pending-04',
    productName: 'Pleated Linen Trouser',
    units: 20,
    courierPartner: 'Delhivery Surface',
    trackingNumber: 'DEL-449102919-IN',
    dispatchDate: '13 Oct 2026',
    status: 'Arrived at Hub', // Ready for admin inwarding
    assignedSku: 'Pending Verification',
    assignedShelf: 'Pending Allocation'
  }
];

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

// Pre-seeded 30-Minute Doorstep Trial & Instant Return Orders
const INITIAL_ORDERS: TrialOrder[] = [
  {
    id: 'ord-30m-105',
    orderNumber: '#DRB-9850',
    customerName: 'Rohan Mehta',
    customerPhone: '+91 98251 44021',
    customerAddress: 'B-304, Goyal Park, Judges Bungalow Road, Bodakdev, Ahmedabad',
    landmark: 'Near Pakwan Cross Road',
    distanceKm: '1.8 km',
    productId: 'prod-dr-01',
    productName: 'Bomber Drop shoulder',
    productSku: 'DR1',
    brandId: 'brand-chanel-01',
    brandName: 'CHANEL',
    price: '₹1200',
    size: 'M',
    shelfLocation: 'AMD-RA02-S3-B04',
    receivedAt: 'Just Now (1 min ago)',
    dispatchedAt: '',
    status: 'Order Received (Awaiting Picker)',
    notes: 'New 30-minute trial order placed from app! Ready for picker at Shivam Bungalows 1, Koteshwar Road.'
  },
  {
    id: 'ord-30m-106',
    orderNumber: '#DRB-9849',
    customerName: 'Ananya Desai',
    customerPhone: '+91 97122 88319',
    customerAddress: 'Penthouse 12, Westgate, SG Highway, Ahmedabad',
    landmark: 'Opp. YMCA Club',
    distanceKm: '3.1 km',
    productId: 'prod-dr-02',
    productName: 'Sculpted Wool Overcoat',
    productSku: 'DR2',
    brandId: 'brand-chanel-01',
    brandName: 'CHANEL',
    price: '₹4200',
    size: 'L',
    shelfLocation: 'AMD-RA03-S2-B08',
    receivedAt: '8 mins ago',
    pickedAt: '3 mins ago',
    dispatchedAt: '',
    status: 'Picked & Packed in Trial Bag',
    notes: 'Item picked from Rack A-03, Shelf 2, Bin 08. Packed in trial bag. Ready for delivery partner assignment!'
  },
  {
    id: 'ord-30m-101',
    orderNumber: '#DRB-9842',
    customerName: 'Aarav Parekh',
    customerPhone: '+91 98250 88123',
    customerAddress: 'B-702, Shaligram Plus, Opp. Iskcon Temple, SG Highway, Ahmedabad',
    landmark: 'Opp. Iskcon Temple',
    distanceKm: '2.1 km',
    productId: 'prod-dr-01',
    productName: 'Bomber Drop shoulder',
    productSku: 'DR1',
    brandId: 'brand-chanel-01',
    brandName: 'CHANEL',
    price: '₹1200',
    size: 'M',
    shelfLocation: 'AMD-RA02-S3-B04',
    riderName: 'Meet Dave',
    riderPhone: '+91 98250 88123',
    riderVehicle: 'Ather 450X (GJ-01-MW-9021)',
    receivedAt: '24 mins ago',
    pickedAt: '20 mins ago',
    handedOverAt: '18 mins ago',
    dispatchedAt: '12 mins ago',
    status: 'Doorstep Fitting (Runner Waiting Outside)',
    doorstepTimerMinutesLeft: 7,
    runnerWaitElapsedMinutes: 8,
    notes: 'Runner waiting outside apartment with trial bag while client tries size M. Decision pending.'
  },
  {
    id: 'ord-30m-102',
    orderNumber: '#DRB-9843',
    customerName: 'Pooja Shah',
    customerPhone: '+91 98792 33410',
    customerAddress: 'Villa 14, Sun City, Bopal, Ahmedabad',
    landmark: 'Near Bopal Cross Road',
    distanceKm: '4.2 km',
    productId: 'prod-dr-02',
    productName: 'Sculpted Wool Overcoat',
    productSku: 'DR2',
    brandId: 'brand-chanel-01',
    brandName: 'CHANEL',
    price: '₹4200',
    size: 'L',
    shelfLocation: 'AMD-RA03-S2-B08',
    riderName: 'Jay Suthar',
    riderPhone: '+91 97120 44912',
    riderVehicle: 'Ola S1 Pro (GJ-01-ET-3304)',
    receivedAt: '18 mins ago',
    pickedAt: '14 mins ago',
    handedOverAt: '12 mins ago',
    dispatchedAt: '6 mins ago',
    status: 'Out for 30-Min Delivery',
    notes: 'Runner en route to Bopal. Will wait outside doorstep for instant 10-min fitting.'
  },
  {
    id: 'ord-30m-103',
    orderNumber: '#DRB-9839',
    customerName: 'Devang V.',
    customerPhone: '+91 98790 12049',
    customerAddress: 'A-101, Titanium Heights, Prahlad Nagar, Ahmedabad',
    landmark: 'Prahlad Nagar Garden',
    distanceKm: '1.4 km',
    productId: 'prod-dr-03',
    productName: 'Acid Washed Boxy Tee',
    productSku: 'DR3',
    brandId: 'brand-underrated-02',
    brandName: 'Underrated Club',
    price: '₹1499',
    size: 'Oversized L',
    shelfLocation: 'AMD-RB01-S1-B02',
    riderName: 'Karan Shah',
    riderPhone: '+91 98790 12049',
    riderVehicle: 'TVS iQube (GJ-01-KB-1122)',
    dispatchedAt: '25 mins ago',
    status: 'Kept on Spot (Purchased)',
    notes: 'Client tried on at door, loved the fit, and kept it instantly. Payment finalized & credited to brand payout.'
  },
  {
    id: 'ord-30m-104',
    orderNumber: '#DRB-9836',
    customerName: 'Meera Trivedi',
    customerPhone: '+91 98244 55109',
    customerAddress: 'C-404, Indraprasth, Satellite, Ahmedabad',
    landmark: 'Behind Star Bazaar',
    distanceKm: '2.8 km',
    productId: 'prod-dr-01',
    productName: 'Bomber Drop shoulder',
    productSku: 'DR1',
    brandId: 'brand-chanel-01',
    brandName: 'CHANEL',
    price: '₹1200',
    size: 'S',
    shelfLocation: 'AMD-RA02-S3-B04',
    riderName: 'Aarav Patel',
    riderPhone: '+91 98240 55102',
    riderVehicle: 'Honda Activa 6G (GJ-01-PQ-5581)',
    dispatchedAt: '40 mins ago',
    status: 'Restocked to Warehouse Shelf',
    instantRefundStatus: '₹1,200 Refunded Instantly to UPI',
    notes: 'Client tried on, preferred larger size, handed back to runner at door immediately. Runner rode straight back to Shivam Bungalows 1 hub and restocked to shelf in 18 minutes. Full refund processed.'
  }
];

// Helper Functions
export function getDarkstoreBrands(): DarkstoreBrand[] {
  if (typeof window === 'undefined') return INITIAL_BRANDS;
  try {
    const raw = localStorage.getItem(KEY_BRANDS);
    if (raw) return JSON.parse(raw);
    localStorage.setItem(KEY_BRANDS, JSON.stringify(INITIAL_BRANDS));
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
}

export function getDarkstoreProducts(): DarkstoreProduct[] {
  if (typeof window === 'undefined') return INITIAL_PRODUCTS;
  try {
    const raw = localStorage.getItem(KEY_PRODUCTS);
    if (raw) return JSON.parse(raw);
    localStorage.setItem(KEY_PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
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
}

export function getInboundShipments(): InboundStockShipment[] {
  if (typeof window === 'undefined') return INITIAL_INBOUNDS;
  try {
    const raw = localStorage.getItem(KEY_INBOUNDS);
    if (raw) return JSON.parse(raw);
    localStorage.setItem(KEY_INBOUNDS, JSON.stringify(INITIAL_INBOUNDS));
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
}

export function getTrialOrders(): TrialOrder[] {
  if (typeof window === 'undefined') return INITIAL_ORDERS;
  try {
    const raw = localStorage.getItem(KEY_ORDERS);
    if (raw) {
      const parsed: any[] = JSON.parse(raw);
      let needsSave = false;
      const migrated: TrialOrder[] = parsed.map(ord => {
        let status = ord.status;
        if (status === 'Trial in Progress (Waiting Confirmation)' || status === 'Trial in Progress') {
          status = 'Doorstep Fitting (Runner Waiting Outside)';
          needsSave = true;
        } else if (status === 'Purchased & Kept') {
          status = 'Kept on Spot (Purchased)';
          needsSave = true;
        } else if (status === 'Returned to Warehouse') {
          status = 'Restocked to Warehouse Shelf';
          needsSave = true;
        }
        if (ord.minutesRemaining !== undefined) {
          delete ord.minutesRemaining;
          needsSave = true;
        }

        const customerPhone = ord.customerPhone || (ord.orderNumber === '#DRB-9850' ? '+91 98251 44021' : ord.orderNumber === '#DRB-9849' ? '+91 97122 88319' : '+91 98250 88123');
        const customerAddress = ord.customerAddress || 'B-702, Shaligram Plus, Opp. Iskcon Temple, SG Highway, Ahmedabad';
        const landmark = ord.landmark || 'Opp. Iskcon Temple';
        const distanceKm = ord.distanceKm || '2.1 km';
        const shelfLocation = ord.shelfLocation || 'AMD-RA02-S3-B04';
        const riderName = ord.riderName || (status.includes('Delivery') || status.includes('Fitting') ? 'Meet Dave' : undefined);
        const riderPhone = ord.riderPhone || (status.includes('Delivery') || status.includes('Fitting') ? '+91 98250 88123' : undefined);
        const riderVehicle = ord.riderVehicle || (status.includes('Delivery') || status.includes('Fitting') ? 'Ather 450X EV (GJ-01-MW-9021)' : undefined);

        if (!ord.customerPhone) needsSave = true;

        return {
          ...ord,
          status,
          customerPhone,
          customerAddress,
          landmark,
          distanceKm,
          shelfLocation,
          riderName,
          riderPhone,
          riderVehicle,
          doorstepTimerMinutesLeft: ord.doorstepTimerMinutesLeft ?? (status === 'Doorstep Fitting (Runner Waiting Outside)' ? 7 : undefined)
        };
      });

      // Merge newly seeded orders if missing in user's localStorage
      for (const initOrd of INITIAL_ORDERS) {
        if (!migrated.some(p => p.orderNumber === initOrd.orderNumber || p.id === initOrd.id)) {
          migrated.unshift(initOrd);
          needsSave = true;
        }
      }

      if (needsSave) {
        localStorage.setItem(KEY_ORDERS, JSON.stringify(migrated));
      }
      return migrated;
    }
    localStorage.setItem(KEY_ORDERS, JSON.stringify(INITIAL_ORDERS));
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
export function registerBrandApplication(brand: any): DarkstoreBrand {
  const brands = getDarkstoreBrands();
  const brandName = (brand.name || '').trim();
  const existingIndex = brands.findIndex(b => (brand.id && b.id === brand.id) || (brandName && b.name.toLowerCase() === brandName.toLowerCase()));

  const brandId = brand.id || (existingIndex >= 0 ? brands[existingIndex].id : `brand-${brandName ? brandName.toLowerCase().replace(/[^a-z0-9]/g, '-') : 'active'}-${Date.now().toString().slice(-4)}`);
  const todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const darkstoreBrand: DarkstoreBrand = {
    id: brandId,
    name: brandName || 'Untitled Brand',
    tagline: brand.tagline || brand.about?.slice(0, 90) || 'Artisanal Modern Brand',
    category: brand.category || 'Male & Female',
    founderName: brand.founderName || 'Founder',
    founderRole: brand.founderRole || 'Creative Director',
    email: brand.email || brand.inquiriesEmail || 'concierge@brand.com',
    basedOutOf: brand.basedOutOf || 'Ahmedabad Darkstore Hub',
    status: 'Waiting for Approval',
    profileImage: brand.profileImage || '',
    coverImage: brand.coverImage || '',
    appliedDate: todayStr,
    totalProductsCount: brand.products?.length || 0,
    inwardedUnitsCount: 0
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

      const newProd: DarkstoreProduct = {
        id: prodId,
        name: prodName,
        brandId: brandId,
        brandName: brandName || 'Your Brand',
        category: prod.category || brand.category || 'Apparel',
        price: prod.price || '₹1499',
        volume: prod.volume || 'M',
        inventory: Number(prod.inventory) || 20,
        inwardUnits: 0,
        unitsInTrial: 0,
        unitsSold: 0,
        tagline: prod.tagline || '',
        description: prod.description || '',
        images: prod.images && prod.images.length > 0 ? prod.images : (prod.image ? [prod.image] : []),
        inwardStatus: 'Pending Stock Dispatch',
        isLive: false
      };

      if (existingPIdx >= 0) {
        updatedProducts[existingPIdx] = {
          ...newProd,
          ...updatedProducts[existingPIdx],
          name: prodName,
          price: prod.price || updatedProducts[existingPIdx].price
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
        parsed.status = 'Waiting for Approval';
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
  verifiedBy?: string;
  shipmentId?: string;
}

export function adminInwardProduct({
  productId,
  sku,
  unitsReceived,
  shelfLocation,
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
      const updated: DarkstoreProduct = {
        ...p,
        sku: finalSku,
        skuSerial: p.skuSerial || finalSerial,
        inwardUnits: unitsReceived,
        inventory: Math.max(unitsReceived, p.inventory || unitsReceived),
        inwardStatus: 'Inwarded & Live',
        warehouseLocation: locationObj,
        inwardDate: todayStr,
        isLive: true
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
  return AHMEDABAD_RUNNERS_POOL;
}

// Create new 30-minute doorstep trial order from Customer App / Platform
export function createCustomerOrder(data: {
  productId: string;
  productName: string;
  productSku?: string;
  brandId: string;
  brandName: string;
  price: string;
  size: string;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  landmark?: string;
  shelfLocation?: string;
}): TrialOrder {
  const orders = getTrialOrders();
  const nextNumber = Math.floor(9851 + orders.length);
  const timeStr = 'Just Now (0 mins ago)';

  const newOrder: TrialOrder = {
    id: `ord-30m-${Date.now()}`,
    orderNumber: `#DRB-${nextNumber}`,
    customerName: data.customerName || 'Aarav Parekh',
    customerPhone: data.customerPhone || '+91 98250 88123',
    customerAddress: data.customerAddress || 'B-702, Shaligram Plus, Opp. Iskcon Temple, SG Highway, Ahmedabad',
    landmark: data.landmark || 'Opp. Iskcon Temple',
    distanceKm: '2.4 km',
    productId: data.productId,
    productName: data.productName,
    productSku: data.productSku || 'DR1',
    brandId: data.brandId,
    brandName: data.brandName,
    price: data.price || '₹1200',
    size: data.size || 'M',
    shelfLocation: data.shelfLocation || 'AMD-RA02-S3-B04',
    deliveryOtp: nextNumber.toString().slice(-4),
    receivedAt: timeStr,
    dispatchedAt: '',
    status: 'Order Received (Awaiting Picker)',
    notes: 'New 30-min doorstep trial order received! Ready for darkstore picker at Shivam Bungalows 1, Koteshwar Road.'
  };

  const updatedOrders = [newOrder, ...orders];
  saveTrialOrders(updatedOrders);

  // Increment unitsInTrial on product
  const products = getDarkstoreProducts();
  const updatedProds = products.map(p => {
    if (p.id === data.productId || p.sku === data.productSku) {
      return {
        ...p,
        unitsInTrial: (p.unitsInTrial || 0) + 1
      };
    }
    return p;
  });
  saveDarkstoreProducts(updatedProds);

  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('drobe_new_order', { detail: newOrder }));
    } catch {}
  }

  return newOrder;
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

  // If restocked back to shelf or handed to runner
  if (targetOrder && (newStatus === 'Restocked to Warehouse Shelf' || newStatus === 'Returned on Spot (Runner Heading to Hub)')) {
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
  }

  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new Event('storage'));
    } catch {}
  }

  return targetOrder;
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
