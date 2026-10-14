// Drobe Ahmedabad Darkstore - Supabase Production Database Client & Connector
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { 
  DarkstoreBrand, 
  DarkstoreProduct, 
  InboundStockShipment, 
  TrialOrder, 
  DarkstoreRunner 
} from './darkstoreData';

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
      receivedAt: row.received_at ? new Date(row.received_at).toLocaleTimeString() : undefined,
      pickedAt: row.picked_at ? new Date(row.picked_at).toLocaleTimeString() : undefined,
      handedOverAt: row.handed_over_at ? new Date(row.handed_over_at).toLocaleTimeString() : undefined,
      dispatchedAt: row.dispatched_at ? new Date(row.dispatched_at).toLocaleTimeString() : '',
      status: row.status,
      doorstepTimerMinutesLeft: row.doorstep_timer_minutes_left,
      runnerWaitElapsedMinutes: row.runner_wait_elapsed_minutes,
      returnReason: row.return_reason,
      instantRefundStatus: row.instant_refund_status,
      notes: row.notes
    }));
  } catch (err) {
    console.warn('Supabase fetchOrders exception:', err);
    return null;
  }
}

// Insert new order to Supabase
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
        status: order.status,
        doorstep_timer_minutes_left: order.doorstepTimerMinutesLeft || 15,
        notes: order.notes
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

// Update order status in Supabase
export async function supabaseUpdateOrderStatus(
  orderId: string, 
  status: string, 
  notes?: string
): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('drobe_trial_orders')
      .update({
        status,
        ...(notes ? { notes } : {}),
        updated_at: new Date().toISOString()
      })
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
      name: row.name,
      brandId: row.brand_id,
      brandName: row.brand_name,
      category: row.category,
      price: row.price,
      volume: row.volume,
      inventory: row.declared_inventory || 20,
      inwardUnits: row.inward_units || 0,
      unitsInTrial: row.units_in_trial || 0,
      unitsSold: row.units_sold || 0,
      tagline: row.tagline,
      description: row.description,
      images: Array.isArray(row.images) ? row.images : [],
      inwardStatus: row.inward_status,
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
      founderName: row.founder_name,
      founderRole: row.founder_role,
      email: row.email,
      basedOutOf: row.based_out_of,
      status: row.status,
      profileImage: row.profile_image,
      coverImage: row.cover_image,
      appliedDate: row.applied_date ? new Date(row.applied_date).toLocaleDateString() : 'Just Now',
      totalProductsCount: row.total_products_count || 0,
      inwardedUnitsCount: row.inwarded_units_count || 0
    }));
  } catch {
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
