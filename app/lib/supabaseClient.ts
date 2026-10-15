// Drobe Ahmedabad Darkstore - Supabase Production Database Client & Connector
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { 
  DarkstoreBrand, 
  DarkstoreProduct, 
  InboundStockShipment, 
  TrialOrder, 
  DarkstoreRunner 
} from './darkstoreData';
import { Product } from '@/data/catalog';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl && 
    supabaseAnonKey && 
    !supabaseUrl.includes('your-project') &&
    supabaseUrl.startsWith('http')
  );
};

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ==============================================================================
// SUPABASE STORAGE (drobe-media Bucket · Direct Object Storage · 0 Vercel Bytes)
// ==============================================================================

export const DROBE_MEDIA_BUCKET = 'drobe-media';

// Direct browser-to-Supabase Storage upload via Signed URLs: Vercel serves 0 bytes!
export async function supabaseUploadMedia(
  file: File | Blob, 
  folder: 'brands/logos' | 'brands/banners' | 'products' | 'returns' | string,
  fileName?: string
): Promise<{ url: string; path: string } | null> {
  if (!supabase) return null;
  try {
    const ext = file.type ? file.type.split('/')[1] || 'jpg' : 'jpg';
    const cleanName = (fileName || `media_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`).replace(/[^a-zA-Z0-9_\-\.]/g, '_');
    const path = `${folder}/${cleanName}${cleanName.includes('.') ? '' : `.${ext}`}`;

    // 1. Primary path: Direct upload via signed upload URL directly to Supabase S3 object storage
    try {
      const signedRes = await supabase.storage.from(DROBE_MEDIA_BUCKET).createSignedUploadUrl(path);
      if (signedRes.data && signedRes.data.token) {
        const uploadRes = await supabase.storage.from(DROBE_MEDIA_BUCKET).uploadToSignedUrl(
          signedRes.data.path,
          signedRes.data.token,
          file,
          {
            contentType: file.type || 'image/jpeg',
            upsert: true
          }
        );
        if (!uploadRes.error && uploadRes.data) {
          const { data: pubData } = supabase.storage
            .from(DROBE_MEDIA_BUCKET)
            .getPublicUrl(uploadRes.data.path);
          return {
            url: pubData.publicUrl,
            path: uploadRes.data.path
          };
        }
      }
    } catch (signedErr) {
      console.warn('Signed URL upload attempt error, falling back to direct upload:', signedErr);
    }

    // 2. Direct upload fallback directly to bucket (also 0 Vercel bytes, browser direct to CDN)
    const { data, error } = await supabase.storage
      .from(DROBE_MEDIA_BUCKET)
      .upload(path, file, {
        cacheControl: '31536000',
        upsert: true,
        contentType: file.type || 'image/jpeg'
      });

    if (error) {
      console.warn('Supabase storage upload error:', error.message);
      return null;
    }

    const { data: pubData } = supabase.storage
      .from(DROBE_MEDIA_BUCKET)
      .getPublicUrl(data.path);

    return {
      url: pubData.publicUrl,
      path: data.path
    };
  } catch (err) {
    console.warn('supabaseUploadMedia exception:', err);
    return null;
  }
}

// Generate Signed Upload URL for direct S3-compatible client upload
export async function supabaseGetSignedUploadUrl(
  path: string
): Promise<{ signedUrl: string; path: string; token: string } | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.storage
      .from(DROBE_MEDIA_BUCKET)
      .createSignedUploadUrl(path);

    if (error || !data) return null;
    return {
      signedUrl: data.signedUrl,
      path: data.path,
      token: data.token
    };
  } catch {
    return null;
  }
}

// Generate direct CDN URL from stored path
export function supabaseGetPublicMediaUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (path.startsWith('/assets/real/') || path.startsWith('assets/real/')) {
    const clean = path.startsWith('/') ? path.slice(1) : path;
    return `https://eswnhehlnzasiaybjikh.supabase.co/storage/v1/object/public/${DROBE_MEDIA_BUCKET}/${clean}`;
  }
  if (!supabase) return path;
  const { data } = supabase.storage.from(DROBE_MEDIA_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

// ==============================================================================
// SUPABASE ASYNC ADAPTERS (Used when credentials are added at night)
// ==============================================================================

// Fetch all trial orders from Supabase
export async function supabaseFetchOrders(): Promise<TrialOrder[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('drobe_trial_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetch orders error:', error.message);
      return null;
    }

    return (data || []).map((row: any): TrialOrder => ({
      id: row.id,
      orderNumber: row.order_number,
      customerName: row.customer_name,
      customerPhone: row.customer_phone,
      customerAddress: row.customer_address,
      landmark: row.landmark,
      distanceKm: row.distance_km || '2.1 km',
      productId: row.product_id,
      productName: row.product_name,
      productSku: row.product_sku,
      brandId: row.brand_id,
      brandName: row.brand_name,
      price: row.price,
      size: row.size || 'M',
      shelfLocation: row.shelf_location,
      riderName: row.rider_name,
      riderPhone: row.rider_phone,
      riderVehicle: row.rider_vehicle,
      deliveryOtp: row.delivery_otp,
      paymentUpiRef: row.payment_upi_ref,
      returnSealTag: row.return_seal_tag,
      receivedAt: row.received_at ? new Date(row.received_at).toLocaleTimeString() : undefined,
      pickedAt: row.picked_at ? new Date(row.picked_at).toLocaleTimeString() : undefined,
      handedOverAt: row.handed_over_at ? new Date(row.handed_over_at).toLocaleTimeString() : undefined,
      dispatchedAt: row.dispatched_at ? new Date(row.dispatched_at).toLocaleTimeString() : '',
      status: row.status,
      doorstepTimerMinutesLeft: row.doorstep_timer_minutes_left,
      runnerWaitElapsedMinutes: row.runner_wait_elapsed_minutes,
      returnReason: row.return_reason,
      instantRefundStatus: row.instant_refund_status,
      notes: row.notes,
      advancePaidAmount: row.advance_paid_amount ? Number(row.advance_paid_amount) : undefined,
      keptAmount: row.kept_amount ? Number(row.kept_amount) : undefined,
      refundAmount: row.refund_amount ? Number(row.refund_amount) : undefined,
      netRefundAmount: row.net_refund_amount ? Number(row.net_refund_amount) : undefined,
      overtimeMinutes: Number(row.overtime_minutes) || 0,
      overtimeFee: Number(row.overtime_fee) || 0,
      doorstepStartedAt: row.doorstep_started_at || undefined,
      doorstepCompletedAt: row.doorstep_completed_at || undefined,
      refundStatus: row.refund_status,
      items: row.items_data || undefined
    }));
  } catch (err) {
    console.warn('Supabase fetchOrders exception:', err);
    return null;
  }
}

// Insert / Upsert order to Supabase
export async function supabaseInsertOrder(order: TrialOrder): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('drobe_trial_orders')
      .upsert({
        id: order.id,
        order_number: order.orderNumber,
        customer_name: order.customerName,
        customer_phone: order.customerPhone,
        customer_address: order.customerAddress,
        landmark: order.landmark,
        distance_km: order.distanceKm,
        product_id: order.productId,
        product_name: order.productName,
        product_sku: order.productSku,
        brand_id: order.brandId,
        brand_name: order.brandName,
        price: order.price,
        size: order.size,
        shelf_location: order.shelfLocation,
        rider_name: order.riderName,
        rider_phone: order.riderPhone,
        rider_vehicle: order.riderVehicle,
        delivery_otp: order.deliveryOtp,
        payment_upi_ref: order.paymentUpiRef,
        return_seal_tag: order.returnSealTag,
        return_reason: order.returnReason,
        instant_refund_status: order.instantRefundStatus,
        status: order.status,
        doorstep_timer_minutes_left: order.doorstepTimerMinutesLeft || 6,
        notes: order.notes,
        advance_paid_amount: order.advancePaidAmount,
        kept_amount: order.keptAmount,
        refund_amount: order.refundAmount,
        net_refund_amount: order.netRefundAmount,
        overtime_minutes: order.overtimeMinutes || 0,
        overtime_fee: order.overtimeFee || 0,
        doorstep_started_at: order.doorstepStartedAt || null,
        doorstep_completed_at: order.doorstepCompletedAt || null,
        refund_status: order.refundStatus,
        items_data: order.items || null
      });

    if (error) {
      console.warn('Supabase insert order error:', error.message);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

// Update order status and details in Supabase
export async function supabaseUpdateOrderStatus(
  orderId: string, 
  status: string, 
  extra?: {
    doorstepTimerMinutesLeft?: number;
    returnReason?: string;
    notes?: string;
    instantRefundStatus?: string;
    paymentUpiRef?: string;
    returnSealTag?: string;
    riderName?: string;
    riderPhone?: string;
    riderVehicle?: string;
    handedOverAt?: string;
    dispatchedAt?: string;
    deliveryOtp?: string;
    advance_paid_amount?: number;
    kept_amount?: number;
    refund_amount?: number;
    net_refund_amount?: number;
    overtime_minutes?: number;
    overtime_fee?: number;
    doorstep_started_at?: string;
    doorstep_completed_at?: string;
    refund_status?: string;
    items_data?: any;
  } | string
): Promise<boolean> {
  if (!supabase) return false;
  try {
    const updatePayload: Record<string, any> = {
      status,
      updated_at: new Date().toISOString()
    };

    if (typeof extra === 'string') {
      updatePayload.notes = extra;
    } else if (extra && typeof extra === 'object') {
      if (extra.notes !== undefined) updatePayload.notes = extra.notes;
      if (extra.doorstepTimerMinutesLeft !== undefined) updatePayload.doorstep_timer_minutes_left = extra.doorstepTimerMinutesLeft;
      if (extra.returnReason !== undefined) updatePayload.return_reason = extra.returnReason;
      if (extra.instantRefundStatus !== undefined) updatePayload.instant_refund_status = extra.instantRefundStatus;
      if (extra.paymentUpiRef !== undefined) updatePayload.payment_upi_ref = extra.paymentUpiRef;
      if (extra.returnSealTag !== undefined) updatePayload.return_seal_tag = extra.returnSealTag;
      if (extra.riderName !== undefined) updatePayload.rider_name = extra.riderName;
      if (extra.riderPhone !== undefined) updatePayload.rider_phone = extra.riderPhone;
      if (extra.riderVehicle !== undefined) updatePayload.rider_vehicle = extra.riderVehicle;
      if (extra.handedOverAt !== undefined) updatePayload.handed_over_at = new Date().toISOString();
      if (extra.dispatchedAt !== undefined) updatePayload.dispatched_at = new Date().toISOString();
      if (extra.deliveryOtp !== undefined) updatePayload.delivery_otp = extra.deliveryOtp;
      if (extra.advance_paid_amount !== undefined) updatePayload.advance_paid_amount = extra.advance_paid_amount;
      if (extra.kept_amount !== undefined) updatePayload.kept_amount = extra.kept_amount;
      if (extra.refund_amount !== undefined) updatePayload.refund_amount = extra.refund_amount;
      if (extra.net_refund_amount !== undefined) updatePayload.net_refund_amount = extra.net_refund_amount;
      if (extra.overtime_minutes !== undefined) updatePayload.overtime_minutes = extra.overtime_minutes;
      if (extra.overtime_fee !== undefined) updatePayload.overtime_fee = extra.overtime_fee;
      if (extra.doorstep_started_at !== undefined) updatePayload.doorstep_started_at = extra.doorstep_started_at;
      if (extra.doorstep_completed_at !== undefined) updatePayload.doorstep_completed_at = extra.doorstep_completed_at;
      if (extra.refund_status !== undefined) updatePayload.refund_status = extra.refund_status;
      if (extra.items_data !== undefined) updatePayload.items_data = extra.items_data;
    }

    const { error } = await supabase
      .from('drobe_trial_orders')
      .update(updatePayload)
      .or(`id.eq.${orderId},order_number.eq.${orderId}`);

    if (error) {
      console.warn('Supabase update status error:', error.message);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

// Auto-deduct stock when order is placed or dispatched (leaves darkstore shelf)
export async function supabaseDeductProductStock(
  productIdOrSku: string, 
  qty: number = 1
): Promise<{ inwardUnits: number; unitsInTrial: number; unitsSold: number } | null> {
  if (!supabase || !productIdOrSku) return null;
  try {
    // 1. Try atomic database RPC
    const { data, error } = await supabase.rpc('drobe_deduct_product_stock', {
      p_product_id: productIdOrSku,
      p_qty: qty
    });

    if (!error && Array.isArray(data) && data.length > 0) {
      return {
        inwardUnits: data[0].new_inward_units,
        unitsInTrial: data[0].new_units_in_trial,
        unitsSold: data[0].new_units_sold
      };
    }

    // 2. Fallback to direct row update
    const { data: rows } = await supabase
      .from('drobe_products')
      .select('id, inward_units, units_in_trial, units_sold')
      .or(`id.eq.${productIdOrSku},sku.eq.${productIdOrSku}`)
      .limit(1);

    if (rows && rows.length > 0) {
      const row = rows[0];
      const newInward = Math.max(0, (row.inward_units || 0) - qty);
      const newTrial = (row.units_in_trial || 0) + qty;
      const { data: updated } = await supabase
        .from('drobe_products')
        .update({
          inward_units: newInward,
          units_in_trial: newTrial,
          updated_at: new Date().toISOString()
        })
        .eq('id', row.id)
        .select('inward_units, units_in_trial, units_sold')
        .single();

      if (updated) {
        return {
          inwardUnits: updated.inward_units,
          unitsInTrial: updated.units_in_trial,
          unitsSold: updated.units_sold
        };
      }
    }
    return null;
  } catch (err) {
    console.warn('supabaseDeductProductStock exception:', err);
    return null;
  }
}

// Auto-add stock back when item is returned & restocked to darkstore shelf
export async function supabaseRestockProductStock(
  productIdOrSku: string, 
  qty: number = 1,
  fromSold: boolean = false
): Promise<{ inwardUnits: number; unitsInTrial: number; unitsSold: number } | null> {
  if (!supabase || !productIdOrSku) return null;
  try {
    // 1. Try atomic database RPC
    const { data, error } = await supabase.rpc('drobe_restock_product_stock', {
      p_product_id: productIdOrSku,
      p_qty: qty,
      p_from_sold: fromSold
    });

    if (!error && Array.isArray(data) && data.length > 0) {
      return {
        inwardUnits: data[0].new_inward_units,
        unitsInTrial: data[0].new_units_in_trial,
        unitsSold: data[0].new_units_sold
      };
    }

    // 2. Fallback to direct row update
    const { data: rows } = await supabase
      .from('drobe_products')
      .select('id, inward_units, units_in_trial, units_sold')
      .or(`id.eq.${productIdOrSku},sku.eq.${productIdOrSku}`)
      .limit(1);

    if (rows && rows.length > 0) {
      const row = rows[0];
      const newInward = (row.inward_units || 0) + qty;
      const newTrial = fromSold ? (row.units_in_trial || 0) : Math.max(0, (row.units_in_trial || 0) - qty);
      const newSold = fromSold ? Math.max(0, (row.units_sold || 0) - qty) : (row.units_sold || 0);

      const { data: updated } = await supabase
        .from('drobe_products')
        .update({
          inward_units: newInward,
          units_in_trial: newTrial,
          units_sold: newSold,
          updated_at: new Date().toISOString()
        })
        .eq('id', row.id)
        .select('inward_units, units_in_trial, units_sold')
        .single();

      if (updated) {
        return {
          inwardUnits: updated.inward_units,
          unitsInTrial: updated.units_in_trial,
          unitsSold: updated.units_sold
        };
      }
    }
    return null;
  } catch (err) {
    console.warn('supabaseRestockProductStock exception:', err);
    return null;
  }
}

// Finalize delivered & kept order: keeps stock deducted, converts units_in_trial -> units_sold
export async function supabaseConfirmSoldStock(
  productIdOrSku: string, 
  qty: number = 1
): Promise<{ inwardUnits: number; unitsInTrial: number; unitsSold: number } | null> {
  if (!supabase || !productIdOrSku) return null;
  try {
    // 1. Try atomic database RPC
    const { data, error } = await supabase.rpc('drobe_confirm_sold_stock', {
      p_product_id: productIdOrSku,
      p_qty: qty
    });

    if (!error && Array.isArray(data) && data.length > 0) {
      return {
        inwardUnits: data[0].new_inward_units,
        unitsInTrial: data[0].new_units_in_trial,
        unitsSold: data[0].new_units_sold
      };
    }

    // 2. Fallback to direct row update
    const { data: rows } = await supabase
      .from('drobe_products')
      .select('id, inward_units, units_in_trial, units_sold')
      .or(`id.eq.${productIdOrSku},sku.eq.${productIdOrSku}`)
      .limit(1);

    if (rows && rows.length > 0) {
      const row = rows[0];
      const newTrial = Math.max(0, (row.units_in_trial || 0) - qty);
      const newSold = (row.units_sold || 0) + qty;

      const { data: updated } = await supabase
        .from('drobe_products')
        .update({
          units_in_trial: newTrial,
          units_sold: newSold,
          updated_at: new Date().toISOString()
        })
        .eq('id', row.id)
        .select('inward_units, units_in_trial, units_sold')
        .single();

      if (updated) {
        return {
          inwardUnits: updated.inward_units,
          unitsInTrial: updated.units_in_trial,
          unitsSold: updated.units_sold
        };
      }
    }
    return null;
  } catch (err) {
    console.warn('supabaseConfirmSoldStock exception:', err);
    return null;
  }
}

// Fetch all live products from Supabase
export async function supabaseFetchProducts(): Promise<DarkstoreProduct[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('drobe_products')
      .select('*')
      .order('sku_serial', { ascending: true });

    if (error) return null;

    return (data || []).map((row: any): DarkstoreProduct => ({
      id: row.id,
      sku: row.sku,
      skuSerial: row.sku_serial,
      name: row.name || row.title,
      brandId: row.brand_id,
      brandName: row.brand_name,
      category: row.category,
      subCategory: row.sub_category,
      price: row.price,
      originalPrice: Number(row.original_price) || undefined,
      brandBasePrice: Number(row.brand_base_price) || undefined,
      markupAmount: Number(row.markup_amount) || undefined,
      markupPercentage: Number(row.markup_percentage) || undefined,
      discountPercentage: Number(row.discount_percentage) || undefined,
      volume: row.volume || (Array.isArray(row.sizes) ? row.sizes.join(', ') : 'M'),
      sizes: Array.isArray(row.sizes) ? row.sizes : [],
      thumbnail: row.thumbnail || (Array.isArray(row.images) ? row.images[0] : ''),
      fabric: row.fabric,
      fit: row.fit,
      gender: row.gender,
      inventory: row.declared_inventory || 40,
      inwardUnits: row.inward_units || 0,
      unitsInTrial: row.units_in_trial || 0,
      unitsSold: row.units_sold || 0,
      tagline: row.tagline,
      description: row.description,
      images: Array.isArray(row.images) ? row.images : (row.thumbnail ? [row.thumbnail] : []),
      inwardStatus: row.inward_status || 'Inwarded & Live',
      warehouseLocation: row.shelf_details || (row.shelf_code ? { code: row.shelf_code, zone: '', rack: '', shelf: '', bin: '', hubName: 'Ahmedabad Hub' } : undefined),
      isLive: Boolean(row.is_live)
    }));
  } catch {
    return null;
  }
}

// Fetch all brands from Supabase
export async function supabaseFetchBrands(): Promise<DarkstoreBrand[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('drobe_brands')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return null;

    return (data || []).map((row: any): DarkstoreBrand => ({
      id: row.id,
      name: row.name,
      tagline: row.tagline || '',
      category: row.category || 'Male & Female',
      founderName: row.founder_name || '',
      founderRole: row.founder_role || 'Founder',
      founderBio: row.founder_bio || '',
      founderQuote: row.founder_quote || '',
      about: row.about || '',
      mission: row.mission || '',
      values: Array.isArray(row.values) ? row.values : [],
      website: row.website || '',
      instagram: row.instagram || '',
      inquiriesEmail: row.inquiries_email || '',
      email: row.email || '',
      phone: row.phone || '',
      basedOutOf: row.based_out_of || 'Ahmedabad',
      establishedYear: row.established_year || '',
      status: row.status,
      profileImage: row.profile_image,
      coverImage: row.cover_image,
      appliedDate: row.applied_date ? new Date(row.applied_date).toLocaleDateString() : 'Just Now',
      approvedDate: row.approved_date ? new Date(row.approved_date).toLocaleDateString() : undefined,
      totalProductsCount: row.total_products_count || 0,
      inwardedUnitsCount: row.inwarded_units_count || 0,
      bankAccount: {
        accountHolderName: row.bank_account_holder || '',
        bankName: row.bank_name || '',
        accountNumber: row.bank_account_number || '',
        ifscCode: row.bank_ifsc || '',
        accountType: row.bank_account_type || 'Current',
        isVerified: Boolean(row.bank_is_verified)
      },
      products: row.dossier_data?.products || [],
      dossierData: row.dossier_data || null
    }));
  } catch {
    return null;
  }
}

// Fetch all brands with their exact live products from drobe_products for Admin Panel
export async function supabaseFetchAdminBrandsWithProducts(): Promise<{
  brands: DarkstoreBrand[];
  products: DarkstoreProduct[];
} | null> {
  if (!supabase) return null;
  try {
    const [brandsResult, productsResult] = await Promise.all([
      supabaseFetchBrands(),
      supabaseFetchProducts()
    ]);

    if (!brandsResult || !productsResult) return null;

    // Link every brand with its live products from drobe_products
    const enrichedBrands = brandsResult.map(brand => {
      const brandSlug = slugify(brand.id || brand.name);
      const brandNameLower = brand.name?.toLowerCase().trim();

      const brandProducts = productsResult.filter(p => {
        if (p.brandId && (p.brandId === brand.id || slugify(p.brandId) === brandSlug)) {
          return true;
        }
        if (p.brandName && (p.brandName.toLowerCase().trim() === brandNameLower || slugify(p.brandName) === brandSlug)) {
          return true;
        }
        return false;
      });

      const totalInwarded = brandProducts.reduce((sum, p) => sum + (p.inwardUnits || 0), 0);

      return {
        ...brand,
        totalProductsCount: brandProducts.length,
        inwardedUnitsCount: totalInwarded > 0 ? totalInwarded : brand.inwardedUnitsCount,
        products: brandProducts
      };
    });

    return {
      brands: enrichedBrands,
      products: productsResult
    };
  } catch (err) {
    console.warn('supabaseFetchAdminBrandsWithProducts error:', err);
    return null;
  }
}

// Fetch runners fleet from Supabase
export async function supabaseFetchRunners(): Promise<DarkstoreRunner[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('drobe_runners')
      .select('*')
      .order('id', { ascending: true });

    if (error) return null;

    return (data || []).map((row: any): DarkstoreRunner => ({
      id: row.id,
      name: row.name,
      phone: row.phone,
      vehicle: row.vehicle,
      currentStatus: row.current_status,
      deliveriesToday: row.deliveries_today || 0,
      rating: parseFloat(row.rating) || 4.9,
      batteryOrFuel: row.battery_or_fuel || '90%'
    }));
  } catch {
    return null;
  }
}

// Upsert brand to Supabase
export async function supabaseUpsertBrand(brand: DarkstoreBrand | any): Promise<boolean> {
  if (!supabase) return false;
  try {
    const bank = brand.bankAccount || {};
    const { error } = await supabase
      .from('drobe_brands')
      .upsert({
        id: brand.id,
        name: brand.name,
        tagline: brand.tagline || brand.about?.slice(0, 120) || '',
        category: brand.category || 'Male & Female',
        founder_name: brand.founderName || brand.founder_name || '',
        founder_role: brand.founderRole || brand.founder_role || 'Founder',
        founder_bio: brand.founderBio || brand.founder_bio || '',
        founder_quote: brand.founderQuote || brand.founder_quote || '',
        about: brand.about || '',
        mission: brand.mission || '',
        values: brand.values || [],
        website: brand.website || '',
        instagram: brand.instagram || '',
        inquiries_email: brand.inquiriesEmail || brand.inquiries_email || '',
        email: brand.email || brand.inquiriesEmail || '',
        phone: brand.phone || '',
        based_out_of: brand.basedOutOf || brand.based_out_of || 'Ahmedabad',
        established_year: brand.establishedYear || brand.established_year || '',
        status: brand.status,
        profile_image: brand.profileImage || brand.profile_image || '',
        cover_image: brand.coverImage || brand.cover_image || '',
        total_products_count: brand.totalProductsCount || (Array.isArray(brand.products) ? brand.products.length : 0),
        inwarded_units_count: brand.inwardedUnitsCount || 0,
        bank_account_holder: bank.accountHolderName || brand.bank_account_holder || '',
        bank_name: bank.bankName || brand.bank_name || '',
        bank_account_number: bank.accountNumber || brand.bank_account_number || '',
        bank_ifsc: bank.ifscCode || brand.bank_ifsc || '',
        bank_account_type: bank.accountType || brand.bank_account_type || 'Current',
        bank_is_verified: bank.isVerified ?? brand.bank_is_verified ?? false,
        dossier_data: brand,
        updated_at: new Date().toISOString()
      });
    return !error;
  } catch {
    return false;
  }
}

// Upsert product to Supabase
export async function supabaseUpsertProduct(product: DarkstoreProduct): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('drobe_products')
      .upsert({
        id: product.id,
        sku: product.sku,
        sku_serial: product.skuSerial,
        name: product.name,
        brand_id: product.brandId,
        brand_name: product.brandName,
        category: product.category,
        price: product.price,
        brand_base_price: product.brandBasePrice || null,
        markup_amount: product.markupAmount || null,
        markup_percentage: product.markupPercentage || null,
        volume: product.volume,
        declared_inventory: product.inventory || 20,
        inward_units: product.inwardUnits || 0,
        units_in_trial: product.unitsInTrial || 0,
        units_sold: product.unitsSold || 0,
        tagline: product.tagline,
        description: product.description,
        images: product.images || [],
        inward_status: product.inwardStatus,
        shelf_code: product.warehouseLocation?.code,
        shelf_details: product.warehouseLocation,
        is_live: Boolean(product.isLive),
        updated_at: new Date().toISOString()
      });
    return !error;
  } catch {
    return false;
  }
}

// Upsert inbound shipment to Supabase
export async function supabaseUpsertShipment(shipment: InboundStockShipment): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('drobe_inbound_shipments')
      .upsert({
        id: shipment.id,
        brand_id: shipment.brandId,
        brand_name: shipment.brandName,
        product_id: shipment.productId,
        product_name: shipment.productName,
        units: shipment.units,
        courier_partner: shipment.courierPartner,
        tracking_number: shipment.trackingNumber,
        dispatch_date: shipment.dispatchDate ? new Date().toISOString() : undefined,
        status: shipment.status,
        assigned_sku: shipment.assignedSku,
        assigned_shelf: shipment.assignedShelf,
        verified_by: shipment.verifiedBy,
        updated_at: new Date().toISOString()
      });
    return !error;
  } catch {
    return false;
  }
}

// Fetch all inbound shipments from Supabase
export async function supabaseFetchShipments(): Promise<InboundStockShipment[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('drobe_inbound_shipments')
      .select('*')
      .order('dispatch_date', { ascending: false });

    if (error) return null;

    return (data || []).map((row: any): InboundStockShipment => ({
      id: row.id,
      brandId: row.brand_id,
      brandName: row.brand_name,
      productId: row.product_id,
      productName: row.product_name,
      units: row.units,
      courierPartner: row.courier_partner,
      trackingNumber: row.tracking_number,
      dispatchDate: row.dispatch_date ? new Date(row.dispatch_date).toLocaleDateString() : 'Today',
      receivedDate: row.received_date ? new Date(row.received_date).toLocaleDateString() : undefined,
      status: row.status,
      assignedSku: row.assigned_sku,
      assignedShelf: row.assigned_shelf,
      verifiedBy: row.verified_by
    }));
  } catch {
    return null;
  }
}

// Fetch shelves from Supabase
export async function supabaseFetchShelves(): Promise<any[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('drobe_warehouse_shelves')
      .select('*')
      .order('code', { ascending: true });

    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

// Record an audit event
export async function supabaseRecordOrderEvent(
  orderId: string, 
  orderNumber: string, 
  toStatus: string, 
  performedBy: string, 
  notes?: string
): Promise<void> {
  if (!supabase) return;
  try {
    await supabase.from('drobe_order_events').insert({
      order_id: orderId,
      order_number: orderNumber,
      to_status: toStatus,
      performed_by: performedBy,
      notes: notes || null
    });
  } catch {}
}

// Real-time listener for incoming orders
export function subscribeToRealtimeOrders(onNewOrUpdatedOrder: (order: any) => void) {
  if (!supabase) return () => {};

  const channel = supabase
    .channel('drobe_orders_channel')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'drobe_trial_orders' },
      payload => {
        onNewOrUpdatedOrder(payload.new);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// ==============================================================================
// STOREFRONT DATABASE CONSUMPTION HELPERS (Live Supabase Catalog & Brands)
// ==============================================================================

export function slugify(text: string): string {
  return (text || '')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

export function mapDbProductToStorefrontProduct(row: any): Product {
  const cleanPrice = typeof row.price === 'number'
    ? row.price
    : parseInt(String(row.price || '').replace(/\D/g, ''), 10) || (row.price_cents ? Math.round(row.price_cents / 100) : 1499);

  const cleanOriginalPrice = Number(row.original_price) || Math.round(cleanPrice * 1.35);
  const cleanDiscount = Number(row.discount_percentage) || Math.round(((cleanOriginalPrice - cleanPrice) / cleanOriginalPrice) * 100) || 25;

  const imagesArr = Array.isArray(row.images) && row.images.length > 0
    ? row.images
    : (row.thumbnail ? [row.thumbnail] : ['/assets/real/test_dl/sample_product.webp']);

  const thumb = row.thumbnail || imagesArr[0] || '/assets/real/test_dl/sample_product.webp';

  return {
    id: String(row.id),
    brand: row.brand_name || row.brand_id || 'DROBE',
    title: row.title || row.name || 'Designer Silhouette',
    price: cleanPrice,
    originalPrice: cleanOriginalPrice,
    discountPercentage: cleanDiscount,
    gender: row.gender === 'women' ? 'women' : 'men',
    category: row.category || 'top',
    subCategory: row.sub_category || 'Apparel',
    images: imagesArr,
    thumbnail: thumb,
    description: row.description || `${row.title || row.name} crafted for premium comfort and 30-minute doorstep trial.`,
    fabric: row.fabric || 'Luxury Cotton Blend',
    fit: row.fit || 'Regular Fit',
    rating: Number(row.rating) || 4.8,
    reviewsCount: Number(row.reviews_count) || 28,
    sizes: Array.isArray(row.sizes) && row.sizes.length > 0 ? row.sizes : ['S', 'M', 'L', 'XL'],
    inStock: row.in_stock ?? true,
    tryAndBuyEligible: row.try_and_buy_eligible ?? true,
    deliveryMinutes: Number(row.delivery_minutes) || 30,
    deliveryLocation: row.delivery_location || 'Ahmedabad (30-Min Zone)',
    extraDiscountBadge: row.extra_discount_badge || undefined,
    promoTag: row.promo_tag || undefined,
    couponPromo: row.coupon_promo || undefined
  };
}

export async function supabaseFetchStorefrontProducts(filters?: {
  gender?: string;
  category?: string;
  brandId?: string;
  brandName?: string;
  limit?: number;
}): Promise<Product[] | null> {
  if (!supabase) return null;
  try {
    let query = supabase
      .from('drobe_products')
      .select('*')
      .eq('is_live', true);

    if (filters?.gender && filters.gender !== 'all') {
      query = query.eq('gender', filters.gender);
    }
    if (filters?.category && filters.category !== 'all') {
      query = query.ilike('category', `%${filters.category}%`);
    }
    if (filters?.brandId) {
      query = query.or(`brand_id.eq.${filters.brandId},brand_id.eq.${slugify(filters.brandId)}`);
    } else if (filters?.brandName) {
      query = query.ilike('brand_name', `%${filters.brandName}%`);
    }

    query = query.order('sku_serial', { ascending: true });

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;
    if (error || !data) {
      console.warn('Supabase fetch storefront products error:', error?.message);
      return null;
    }

    return data.map(mapDbProductToStorefrontProduct);
  } catch (err) {
    console.warn('Supabase fetch storefront products exception:', err);
    return null;
  }
}

export async function supabaseFetchProductById(id: string): Promise<Product | null> {
  if (!supabase || !id) return null;
  try {
    const { data, error } = await supabase
      .from('drobe_products')
      .select('*')
      .or(`id.eq.${id},sku.eq.${id},sku.eq.DR-${id}`)
      .limit(1);

    if (error || !data || data.length === 0) {
      return null;
    }

    return mapDbProductToStorefrontProduct(data[0]);
  } catch (err) {
    console.warn('Supabase fetch product by id exception:', err);
    return null;
  }
}

export async function supabaseFetchBrandById(brandIdOrSlug: string): Promise<any | null> {
  if (!supabase || !brandIdOrSlug) return null;
  try {
    const normalized = slugify(brandIdOrSlug);
    const stripped = normalized.replace(/^home-discover-brand-/, '').replace(/-men$|-women$/, '');

    const { data, error } = await supabase
      .from('drobe_brands')
      .select('*')
      .or(`id.eq.${normalized},id.eq.${brandIdOrSlug},id.eq.${stripped}`)
      .limit(1);

    if (!error && data && data.length > 0) {
      return data[0];
    }

    // Try fuzzy match on name
    const { data: nameData } = await supabase
      .from('drobe_brands')
      .select('*')
      .ilike('name', `%${stripped.replace(/-/g, ' ')}%`)
      .limit(1);

    if (nameData && nameData.length > 0) {
      return nameData[0];
    }

    return null;
  } catch (err) {
    console.warn('Supabase fetch brand exception:', err);
    return null;
  }
}

export async function supabaseFetchBrandProducts(brandIdOrSlug: string, brandName?: string): Promise<Product[] | null> {
  if (!supabase || !brandIdOrSlug) return null;
  try {
    const slug = slugify(brandIdOrSlug);
    const stripped = slug.replace(/^home-discover-brand-/, '').replace(/-men$|-women$/, '');
    const cleanBrandName = (brandName || stripped.replace(/-/g, ' ')).trim();

    let query = supabase
      .from('drobe_products')
      .select('*')
      .eq('is_live', true);

    query = query.or(`brand_id.eq.${slug},brand_id.eq.${stripped},brand_name.ilike.%${cleanBrandName}%`);
    query = query.order('sku_serial', { ascending: true });

    const { data, error } = await query;
    if (error || !data) {
      return null;
    }

    return data.map(mapDbProductToStorefrontProduct);
  } catch (err) {
    console.warn('Supabase fetch brand products exception:', err);
    return null;
  }
}

export async function supabaseFetchStorefrontCategories(gender?: string): Promise<any[] | null> {
  if (!supabase) return null;
  try {
    let query = supabase
      .from('drobe_categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (gender && gender !== 'all') {
      query = query.or(`gender.eq.${gender},gender.eq.all`);
    }

    const { data, error } = await query;
    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
}
