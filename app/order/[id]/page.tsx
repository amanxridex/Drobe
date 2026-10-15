'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getTrialOrders,
  recordDoorstepDecision,
  adminMarkOrderReturnedAndRestocked,
  TrialOrder,
  TrialOrderItem
} from '@/app/lib/darkstoreData';
import { supabase } from '@/app/lib/supabaseClient';
import { 
  ArrowLeft, 
  MoreVertical, 
  Phone, 
  MessageSquare, 
  Navigation, 
  Check, 
  Clock, 
  MapPin, 
  Box, 
  Package,
  ShieldCheck, 
  RotateCcw, 
  Crosshair, 
  Layers,
  Sparkles
} from 'lucide-react';

// Apple System Typography Stack
const FONT_FAMILY = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "SF Pro", -apple-system-subheadline, "Helvetica Neue", Helvetica, Arial, sans-serif';

// ==============================================================================
// 1. EXACT WAREHOUSE COORDINATES SPECIFIED BY USER
// ==============================================================================
const WAREHOUSE_COORDS = {
  lat: 23.1033664,
  lng: 72.6043396,
  name: 'Ahmedabad Darkstore Hub #01',
  sub: 'Shivam Bungalows 1, Koteshwar Road'
};

// Preset Ahmedabad Delivery Hub Locations
const AHMEDABAD_ZONES = [
  { id: 'sg-highway', name: 'SG Highway (Iskcon)', lat: 23.0280, lng: 72.5070, address: 'B-702, Shaligram Plus, SG Highway, Ahmedabad' },
  { id: 'prahlad-nagar', name: 'Prahlad Nagar', lat: 23.0120, lng: 72.5100, address: 'A-404, Dev Aurum, Anandnagar Rd, Prahlad Nagar' },
  { id: 'motera-koteshwar', name: 'Koteshwar / Motera', lat: 23.1100, lng: 72.5920, address: '42, Shivam Bungalows 1, Koteshwar Rd, Ahmedabad' },
  { id: 'bodakdev', name: 'Bodakdev (Sindhu Bhavan)', lat: 23.0450, lng: 72.5180, address: 'Villa 12, Sunrise Park, Bodakdev, Ahmedabad' },
  { id: 'cg-road', name: 'Navrangpura / CG Road', lat: 23.0360, lng: 72.5610, address: 'Flat 101, Shivalik Plaza, CG Road, Ahmedabad' }
];

/**
 * Real Haversine Distance & ETA Calculation from Warehouse to User
 */
function calculateRealDistanceAndEta(destLat: number, destLng: number) {
  const R = 6371; // Earth radius in km
  const dLat = (destLat - WAREHOUSE_COORDS.lat) * (Math.PI / 180);
  const dLng = (destLng - WAREHOUSE_COORDS.lng) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(WAREHOUSE_COORDS.lat * (Math.PI / 180)) *
    Math.cos(destLat * (Math.PI / 180)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightLineKm = R * c;

  // Ahmedabad city street winding factor (~32% road distance overhead)
  const roadDistanceKm = Math.round((straightLineKm * 1.32) * 10) / 10;

  // Average rider scooter speed in Ahmedabad: 26 km/h + 3 min pack buffer
  const etaMinutes = Math.max(10, Math.min(30, Math.round((roadDistanceKm / 26) * 60 + 3)));

  // Target clock arrival time
  const arrivalDate = new Date(Date.now() + etaMinutes * 60 * 1000);
  const formattedArrival = arrivalDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return {
    roadDistanceKm,
    etaMinutes,
    formattedArrival
  };
}

export default function OrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const { orders, updateDoorstepStatus, location: appLocation, userCoords } = useApp();

  const orderId = (params?.id as string) || '';

  // Mode: 'tracking' (Live Map Dispatch View) | 'fitting' (6-Min Mirror Trial & Instant Refund)
  const [screenMode, setScreenMode] = useState<'tracking' | 'fitting'>('tracking');

  // Customer Destination Coordinates (Default to SG Highway or live detected GPS)
  const [userLocation, setUserLocation] = useState(AHMEDABAD_ZONES[0]);
  const [isUsingLiveGps, setIsUsingLiveGps] = useState(false);

  // Sync with AppContext userCoords if available
  useEffect(() => {
    if (userCoords) {
      setUserLocation({
        id: 'real-user-gps',
        name: 'Your Exact GPS Location',
        lat: userCoords.lat,
        lng: userCoords.lng,
        address: appLocation || `GPS: ${userCoords.lat.toFixed(4)}, ${userCoords.lng.toFixed(4)}`
      });
      setIsUsingLiveGps(true);
    }
  }, [userCoords, appLocation]);

  // Real OSRM Road Route Geometry & Metrics
  const [realRoutePoints, setRealRoutePoints] = useState<[number, number][]>([]);
  const [routeDistanceKm, setRouteDistanceKm] = useState<number>(0);
  const [routeDurationMin, setRouteDurationMin] = useState<number>(0);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const originLng = WAREHOUSE_COORDS.lng;
    const originLat = WAREHOUSE_COORDS.lat;
    const destLat = userLocation.lat;
    const destLng = userLocation.lng;

    setIsLoadingRoute(true);
    // Real live OSRM driving route request
    fetch(
      `https://router.project-osrm.org/route/v1/driving/${originLng},${originLat};${destLng},${destLat}?overview=full&geometries=geojson`
    )
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data?.code === 'Ok' && data.routes?.[0]) {
          const coords = data.routes[0].geometry.coordinates as [number, number][];
          setRealRoutePoints(coords);
          setRouteDistanceKm(Math.round((data.routes[0].distance / 1000) * 10) / 10);
          setRouteDurationMin(Math.round(data.routes[0].duration / 60) + 4);
          setIsLoadingRoute(false);
        }
      })
      .catch((err) => {
        console.warn('OSRM live routing fallback:', err);
        setIsLoadingRoute(false);
      });

    return () => {
      isMounted = false;
    };
  }, [userLocation]);

  // Active Darkstore Trial Order
  const [activeDarkstoreOrder, setActiveDarkstoreOrder] = useState<TrialOrder | null>(null);
  const [localItemStatus, setLocalItemStatus] = useState<Record<number, 'kept' | 'returned'>>({});

  // 6-minute Doorstep Trial Countdown (360 seconds)
  const [secondsLeft, setSecondsLeft] = useState(360);

  // Animated Rider Progress (0% to 100% along the path)
  const [riderProgress, setRiderProgress] = useState(0.42);

  // Toast Feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // In-memory order from AppContext
  const contextOrder = orders.find((o) => o.id === orderId);

  const loadDarkstoreOrder = async () => {
    try {
      const allOrders = getTrialOrders();
      if (allOrders && allOrders.length > 0) {
        const matched = allOrders.find(
          (o) =>
            o.id === orderId ||
            o.orderNumber === orderId ||
            o.orderNumber === `#${orderId}` ||
            o.id.includes(orderId) ||
            (orderId && o.id.endsWith(orderId))
        );

        if (matched) {
          setActiveDarkstoreOrder(matched);
          return;
        }
      }

      // Live fetch from Supabase drobe_trial_orders table
      if (supabase) {
        const cleanId = orderId.replace('#', '');
        const { data, error } = await supabase
          .from('drobe_trial_orders')
          .select('*')
          .or(`id.eq.${cleanId},order_number.eq.#${cleanId},order_number.eq.${cleanId}`)
          .maybeSingle();

        if (data && !error) {
          const remoteOrder: TrialOrder = {
            id: data.id,
            orderNumber: data.order_number,
            customerName: data.customer_name,
            customerPhone: data.customer_phone,
            customerAddress: data.customer_address,
            landmark: data.landmark,
            distanceKm: data.distance_km || '2.1 km',
            productId: data.product_id,
            productName: data.product_name,
            productSku: data.product_sku,
            brandId: data.brand_id,
            brandName: data.brand_name,
            price: data.price,
            size: data.size || 'M',
            shelfLocation: data.shelf_location,
            riderName: data.rider_name || 'Meet Dave',
            riderPhone: data.rider_phone || '+91 98250 88123',
            riderVehicle: data.rider_vehicle || 'Ather 450X EV (GJ-01-MW-9021)',
            receivedAt: data.received_at,
            pickedAt: data.picked_at,
            handedOverAt: data.handed_over_at,
            dispatchedAt: data.dispatched_at,
            status: data.status,
            doorstepTimerMinutesLeft: data.doorstep_timer_minutes_left ?? 6,
            notes: data.notes,
            deliveryOtp: data.delivery_otp,
            paymentUpiRef: data.payment_upi_ref,
            advancePaidAmount: data.advance_paid_amount,
            items: data.items_data || []
          };
          setActiveDarkstoreOrder(remoteOrder);
        }
      }
    } catch (e) {
      console.warn('Error loading trial order:', e);
    }
  };

  useEffect(() => {
    loadDarkstoreOrder();

    // Subtle rider transit progression
    const riderInterval = setInterval(() => {
      setRiderProgress(prev => (prev >= 0.95 ? 0.95 : prev + 0.005));
    }, 3000);

    // 1-second interval for 6-minute doorstep trial timer
    const trialTimer = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    const handleSync = () => loadDarkstoreOrder();
    window.addEventListener('storage', handleSync);

    return () => {
      clearInterval(riderInterval);
      clearInterval(trialTimer);
      window.removeEventListener('storage', handleSync);
    };
  }, [orderId]);

  // Real Calculated Metrics & Projected Road Geometry
  const metrics = useMemo(() => {
    return calculateRealDistanceAndEta(userLocation.lat, userLocation.lng);
  }, [userLocation]);

  const { pathString, originPoint, destPoint, riderPoint, riderHeading } = useMemo(() => {
    if (realRoutePoints.length < 2) {
      return {
        pathString: 'M 100 240 L 160 240 Q 220 240 220 180 L 220 120 Q 220 80 270 80 L 400 80',
        originPoint: { x: 100, y: 240 },
        destPoint: { x: 400, y: 80 },
        riderPoint: { x: 220, y: 150 },
        riderHeading: 35
      };
    }

    let minLng = Infinity, maxLng = -Infinity, minLat = Infinity, maxLat = -Infinity;
    realRoutePoints.forEach(([lng, lat]) => {
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    });

    const latSpan = (maxLat - minLat) || 0.01;
    const lngSpan = (maxLng - minLng) || 0.01;
    minLat -= latSpan * 0.15;
    maxLat += latSpan * 0.15;
    minLng -= lngSpan * 0.15;
    maxLng += lngSpan * 0.15;

    const width = 500;
    const height = 320;

    const project = (lng: number, lat: number) => {
      const x = Math.round(((lng - minLng) / (maxLng - minLng)) * width);
      const y = Math.round(height - ((lat - minLat) / (maxLat - minLat)) * height);
      return { x, y };
    };

    const points = realRoutePoints.map(([lng, lat]) => project(lng, lat));
    const pathString = points.reduce((acc, pt, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`, '');

    const originPoint = points[0];
    const destPoint = points[points.length - 1];

    const riderIdx = Math.min(
      points.length - 1,
      Math.floor(riderProgress * (points.length - 1))
    );
    const riderPoint = points[riderIdx] || points[0];

    const nextIdx = Math.min(points.length - 1, riderIdx + 1);
    const nextPt = points[nextIdx] || riderPoint;
    const dx = nextPt.x - riderPoint.x;
    const dy = nextPt.y - riderPoint.y;
    const riderHeading = Math.round((Math.atan2(dy, dx) * 180) / Math.PI);

    return {
      pathString,
      originPoint,
      destPoint,
      riderPoint,
      riderHeading
    };
  }, [realRoutePoints, riderProgress]);

  // Live GPS geolocation trigger
  const handleRequestGps = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation not supported by this browser');
      return;
    }
    showToast('Locating your GPS position in Ahmedabad...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({
          id: 'live-gps',
          name: 'Your Live GPS Location',
          lat: latitude,
          lng: longitude,
          address: `GPS Pin: ${latitude.toFixed(4)}, ${longitude.toFixed(4)} (Ahmedabad)`
        });
        setIsUsingLiveGps(true);
        showToast('📍 Updated to live GPS coordinates!');
      },
      (err) => {
        showToast('Unable to access GPS location, using Ahmedabad Hub default');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Normalized order items
  const items = useMemo(() => {
    if (activeDarkstoreOrder?.items && activeDarkstoreOrder.items.length > 0) {
      return activeDarkstoreOrder.items.map((it, idx) => ({
        id: it.productId,
        name: it.productName,
        brand: it.brandName,
        size: it.size,
        price: it.priceNum || parseFloat(it.price.replace(/[^0-9.]/g, '')) || 629,
        priceFormatted: it.price,
        thumbnail: it.thumbnail || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=400&q=80',
        shelfLocation: it.shelfLocation || 'AMD-RA01-S1-B01',
        status: localItemStatus[idx] || it.status,
        idx
      }));
    } else if (contextOrder?.items && contextOrder.items.length > 0) {
      return contextOrder.items.map((entry, idx) => ({
        id: entry.item.product.id,
        name: entry.item.product.title,
        brand: entry.item.product.brand,
        size: entry.item.size,
        price: entry.item.product.price,
        priceFormatted: `₹${entry.item.product.price}`,
        thumbnail: entry.item.product.thumbnail,
        shelfLocation: 'AMD-RA01-S1-B01',
        status: localItemStatus[idx] || entry.status,
        idx
      }));
    } else {
      return [];
    }
  }, [activeDarkstoreOrder, contextOrder, localItemStatus]);

  // Doorstep Fitting Settlement calculations
  const totalOrderAmount = items.reduce((sum, it) => sum + it.price, 0);
  const keptItems = items.filter(it => it.status === 'kept');
  const returnedItems = items.filter(it => it.status === 'returned');
  const keptAmount = keptItems.reduce((sum, it) => sum + it.price, 0);
  const returnedAmount = returnedItems.reduce((sum, it) => sum + it.price, 0);

  const isOvertime = secondsLeft < 0;
  const overtimeMinutes = isOvertime ? Math.ceil(Math.abs(secondsLeft) / 60) : 0;
  const overtimeFee = overtimeMinutes * 2;
  const netRefund = Math.max(0, returnedAmount - overtimeFee);

  const handleDecision = (idx: number, decision: 'kept' | 'returned') => {
    setLocalItemStatus(prev => ({ ...prev, [idx]: decision }));
    if (contextOrder) {
      updateDoorstepStatus(contextOrder.id, idx, decision);
    }
    if (activeDarkstoreOrder) {
      recordDoorstepDecision(activeDarkstoreOrder.id, idx, decision, overtimeMinutes, overtimeFee);
    }
    if (decision === 'kept') {
      confetti({ particleCount: 35, spread: 55, origin: { y: 0.7 } });
      showToast('Item Kept! ✓');
    } else {
      showToast('Item Added to Return Bag (Instant Refund Queued)');
    }
  };

  if (items.length === 0) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: '#0a0a0c',
          color: '#ffffff',
          padding: '24px 20px',
          textAlign: 'center',
          fontFamily: FONT_FAMILY
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 24,
            background: '#141418',
            border: '1px solid #22222a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20
          }}
        >
          <Package size={36} color="#888899" />
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
          Order Not Found
        </h1>

        <p style={{ fontSize: 13.5, color: '#888899', maxWidth: 320, lineHeight: 1.55, margin: '0 0 28px' }}>
          No active delivery found for this order. Check your live orders in your profile or explore our catalog!
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 300 }}>
          <button
            onClick={() => router.push('/')}
            style={{
              width: '100%',
              padding: '14px 0',
              borderRadius: 14,
              background: '#ffffff',
              color: '#000000',
              fontSize: 14,
              fontWeight: 800,
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Explore Catalog
          </button>

          <button
            onClick={() => router.push('/profile')}
            style={{
              width: '100%',
              padding: '13px 0',
              borderRadius: 14,
              background: '#141418',
              border: '1px solid #22222a',
              color: '#ffffff',
              fontSize: 13.5,
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            View Profile
          </button>
        </div>
      </div>
    );
  }

  const bookingId = activeDarkstoreOrder?.orderNumber || (contextOrder ? `#DRB-${contextOrder.id}` : (orderId ? `#DRB-${orderId}` : ''));
  const customerName = activeDarkstoreOrder?.customerName || 'Shopper';
  const customerAddress = activeDarkstoreOrder?.customerAddress || userLocation.address;
  const deliveryPartnerName = activeDarkstoreOrder?.riderName || 'Express Delivery Partner';

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#0d0d12',
        color: '#ffffff',
        fontFamily: FONT_FAMILY,
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* Toast Feedback */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            style={{
              position: 'absolute',
              top: 16,
              left: 20,
              right: 20,
              zIndex: 100,
              background: '#1c1c24',
              color: '#ffffff',
              border: '1px solid #2e2f3d',
              borderRadius: 12,
              padding: '10px 16px',
              fontSize: 13,
              fontWeight: 600,
              textAlign: 'center',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)'
            }}
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ====================================================================
          TOP BAR & DYNAMIC ISLAND
          ==================================================================== */}
      <div
        style={{
          padding: '8px 16px 10px',
          background: 'rgba(13, 13, 18, 0.95)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #1f1f26',
          zIndex: 40
        }}
      >
        {/* Dynamic Island Header Notch */}
        <div
          style={{
            width: 120,
            height: 28,
            background: '#000000',
            borderRadius: 18,
            margin: '0 auto 8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 10px'
          }}
        >
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', animation: 'pulse 1.5s infinite' }} />
          <span style={{ fontSize: 10.5, fontWeight: 700, color: '#fff', letterSpacing: '0.04em' }}>
            30-MIN DELIVERY
          </span>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#1c1c24' }} />
        </div>

        {/* Navigation Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <motion.button
            type="button"
            whileTap={{ scale: 0.88 }}
            onClick={() => router.push('/')}
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: '#1a1a22',
              border: '1px solid #272733',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer',
              outline: 'none'
            }}
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </motion.button>

          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: 16.5, fontWeight: 800, margin: 0, letterSpacing: '-0.01em' }}>
              {screenMode === 'tracking' ? 'Location Tracking' : 'Doorstep Mirror Fitting'}
            </h1>
            <div style={{ fontSize: 11, color: '#8e8e93', marginTop: 1 }}>
              {screenMode === 'tracking' ? `Out for 30-Min Delivery • ETA ${metrics.etaMinutes}m` : '6-Minute Free Mirror Trial'}
            </div>
          </div>

          <motion.button
            type="button"
            whileTap={{ scale: 0.88 }}
            onClick={() => setScreenMode(prev => prev === 'tracking' ? 'fitting' : 'tracking')}
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: '#1a1a22',
              border: '1px solid #272733',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer',
              outline: 'none'
            }}
            aria-label="Switch Mode"
          >
            <Layers size={17} />
          </motion.button>
        </div>
      </div>

      {/* ====================================================================
          MODE 1: LOCATION TRACKING VIEW (1:1 with Reference Image)
          ==================================================================== */}
      {screenMode === 'tracking' ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
          
          {/* ==================================================================
              TOP HALF: INTERACTIVE DARK CITY MAP
              ================================================================== */}
          <div
            style={{
              height: '42%',
              minHeight: 250,
              width: '100%',
              background: '#111116',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* SVG Dark Mode City Grid & Road Network */}
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 500 320"
              preserveAspectRatio="xMidYMid slice"
              style={{ position: 'absolute', inset: 0 }}
            >
              <defs>
                {/* City Blocks Background Grid Pattern */}
                <pattern id="streetGrid" width="60" height="60" patternUnits="userSpaceOnUse">
                  <rect width="56" height="56" fill="#14141a" rx="4" />
                </pattern>
                
                {/* Glow Filter for Destination Pin */}
                <filter id="destGlow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Urban Grid Blocks */}
              <rect width="100%" height="100%" fill="url(#streetGrid)" opacity="0.6" />

              {/* City Secondary Roads */}
              <path d="M 0 80 L 500 80" stroke="#1f1f28" strokeWidth="6" fill="none" />
              <path d="M 0 160 L 500 160" stroke="#1f1f28" strokeWidth="7" fill="none" />
              <path d="M 0 240 L 500 240" stroke="#1f1f28" strokeWidth="6" fill="none" />
              <path d="M 100 0 L 100 320" stroke="#1f1f28" strokeWidth="6" fill="none" />
              <path d="M 220 0 L 220 320" stroke="#1f1f28" strokeWidth="8" fill="none" />
              <path d="M 360 0 L 360 320" stroke="#1f1f28" strokeWidth="7" fill="none" />

              {/* Real Road Route from Darkstore Warehouse to User Destination */}
              <path
                id="deliveryRoute"
                d={pathString}
                stroke="#2b2b38"
                strokeWidth="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />

              {/* Active Route Colored Line with subtle progress */}
              <path
                d={pathString}
                stroke="#38bdf8"
                strokeWidth="4"
                strokeDasharray="6 4"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                opacity="0.9"
              />

              {/* 1. Origin: Ahmedabad Warehouse Marker (23.1033664, 72.6043396) */}
              <g transform={`translate(${originPoint.x}, ${originPoint.y})`}>
                <circle r="14" fill="#181822" stroke="#3b3b4d" strokeWidth="2.5" />
                <rect x="-6" y="-6" width="12" height="12" rx="2" fill="#d4f938" />
              </g>

              {/* 2. Destination: User Delivery Pin (Orange-Red with Glow) */}
              <g transform={`translate(${destPoint.x}, ${destPoint.y})`}>
                {/* Outer Glow Halo */}
                <circle r="22" fill="#ff6b4a" opacity="0.25" filter="url(#destGlow)" />
                {/* Main Destination Pin */}
                <circle r="12" fill="#ff6b4a" />
                {/* Center White Core */}
                <circle r="5" fill="#ffffff" />
              </g>
            </svg>

            {/* Dynamic Moving Rider Vehicle Marker along Real Road Route */}
            <motion.div
              style={{
                position: 'absolute',
                left: `${(riderPoint.x / 500) * 100}%`,
                top: `${(riderPoint.y / 320) * 100}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: 10
              }}
            >
              {/* Floating ETA Pill */}
              <div
                style={{
                  position: 'absolute',
                  top: -28,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: '#000000',
                  border: '1px solid #333342',
                  padding: '2px 8px',
                  borderRadius: 10,
                  fontSize: 10.5,
                  fontWeight: 800,
                  color: '#ffffff',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.5)'
                }}
              >
                ⚡ {routeDurationMin || metrics.etaMinutes}m Away
              </div>

              {/* Dark Vehicle / Navigation Arrow Button rotated to road heading */}
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  background: '#000000',
                  border: '2.5px solid #ffffff',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.7)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  transform: `rotate(${riderHeading + 45}deg)`,
                  transition: 'transform 0.4s ease'
                }}
              >
                <Navigation size={18} fill="#ffffff" />
              </div>
            </motion.div>

            {/* Floating Top Warehouse Label Badge */}
            <div
              style={{
                position: 'absolute',
                top: 12,
                left: 14,
                background: 'rgba(16, 16, 22, 0.9)',
                backdropFilter: 'blur(8px)',
                border: '1px solid #282836',
                borderRadius: 12,
                padding: '6px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#d4f938' }} />
              <div>
                <div style={{ fontSize: 10.5, fontWeight: 800, color: '#fff' }}>
                  {WAREHOUSE_COORDS.name}
                </div>
                <div style={{ fontSize: 9.5, color: '#8e8e93' }}>
                  Lat: 23.1033 • Lng: 72.6043
                </div>
              </div>
            </div>

            {/* Floating GPS Recenter Button */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.88 }}
              onClick={handleRequestGps}
              style={{
                position: 'absolute',
                top: 12,
                right: 14,
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'rgba(16, 16, 22, 0.9)',
                backdropFilter: 'blur(8px)',
                border: isUsingLiveGps ? '1.5px solid #d4f938' : '1px solid #282836',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isUsingLiveGps ? '#d4f938' : '#ffffff',
                cursor: 'pointer',
                outline: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
              }}
              title="Use Current GPS Location"
            >
              <Crosshair size={18} />
            </motion.button>
          </div>

          {/* ==================================================================
              BOTTOM HALF: DRAGGABLE BOTTOM CARD (1:1 with Reference Image)
              ================================================================== */}
          <div
            style={{
              flex: 1,
              background: '#16161c',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              border: '1px solid #242430',
              borderBottom: 'none',
              marginTop: -16,
              zIndex: 20,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 -10px 30px rgba(0,0,0,0.6)',
              overflowY: 'auto'
            }}
          >
            {/* Grab Handle */}
            <div
              style={{
                width: 40,
                height: 4,
                background: '#383844',
                borderRadius: 2,
                margin: '10px auto 12px',
                flexShrink: 0
              }}
            />

            <div style={{ padding: '0 18px 24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
              
              {/* Top Row: Booking ID + Transit Status Badge */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 11, color: '#8e8e93', fontWeight: 600 }}>
                    Booking Id:
                  </div>
                  <div style={{ fontSize: 19, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', marginTop: 1 }}>
                    {bookingId}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, color: '#8e8e93', fontWeight: 600 }}>
                    Status
                  </div>
                  <div
                    style={{
                      background: '#1c1c24',
                      border: '1px solid #2c2c3a',
                      padding: '4px 12px',
                      borderRadius: 16,
                      fontSize: 11.5,
                      fontWeight: 800,
                      color: '#d4f938',
                      marginTop: 2,
                      display: 'inline-block'
                    }}
                  >
                    Transit
                  </div>
                </div>
              </div>

              {/* 4-Step Progress Tracker with Dotted Line (Exact as Reference) */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 10px',
                  background: '#121217',
                  borderRadius: 14,
                  border: '1px solid #1f1f28',
                  marginBottom: 14
                }}
              >
                {/* Step 1: Confirmed */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={13} color="#000" strokeWidth={3} />
                  </div>
                  <span style={{ fontSize: 9.5, color: '#d4d4d8', fontWeight: 600 }}>Confirmed</span>
                </div>

                <div style={{ flex: 1, height: 1, borderTop: '2px dotted #383846', margin: '0 6px 12px' }} />

                {/* Step 2: Packed */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={13} color="#000" strokeWidth={3} />
                  </div>
                  <span style={{ fontSize: 9.5, color: '#d4d4d8', fontWeight: 600 }}>Packed</span>
                </div>

                <div style={{ flex: 1, height: 1, borderTop: '2px dotted #383846', margin: '0 6px 12px' }} />

                {/* Step 3: Transit (Active) */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#d4f938', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 10px rgba(212, 249, 56, 0.4)' }}>
                    <Navigation size={12} color="#000" strokeWidth={2.5} />
                  </div>
                  <span style={{ fontSize: 9.5, color: '#d4f938', fontWeight: 700 }}>In Transit</span>
                </div>

                <div style={{ flex: 1, height: 1, borderTop: '2px dotted #383846', margin: '0 6px 12px' }} />

                {/* Step 4: Doorstep Trial */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#272733', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Clock size={12} color="#71717a" strokeWidth={2} />
                  </div>
                  <span style={{ fontSize: 9.5, color: '#71717a', fontWeight: 600 }}>Fitting</span>
                </div>
              </div>

              {/* Dates & ETA Timestamp Row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ fontSize: 11.5, color: '#8e8e93' }}>
                  Created, Today
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#ffffff', marginTop: 1 }}>
                    Ahmedabad Hub #01
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11.5, color: '#8e8e93' }}>
                    Estimated, {metrics.formattedArrival}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#d4f938', marginTop: 1 }}>
                    30-Min Doorstep
                  </div>
                </div>
              </div>

              {/* Two-Column Details Grid with 3D Package Thumbnail */}
              <div
                style={{
                  background: '#121217',
                  border: '1px solid #1f1f28',
                  borderRadius: 16,
                  padding: 14,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 16
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                  {/* From & To */}
                  <div>
                    <span style={{ fontSize: 11, color: '#71717a', fontWeight: 600 }}>From: </span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#e4e4e7' }}>Ahmedabad Darkstore Hub #01</span>
                  </div>

                  <div>
                    <span style={{ fontSize: 11, color: '#71717a', fontWeight: 600 }}>To: </span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#e4e4e7' }}>{customerAddress}</span>
                  </div>

                  {/* Customer & Order Cost */}
                  <div style={{ display: 'flex', gap: 20 }}>
                    <div>
                      <div style={{ fontSize: 10.5, color: '#71717a', fontWeight: 600 }}>Customer</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#ffffff', marginTop: 1 }}>{customerName}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10.5, color: '#71717a', fontWeight: 600 }}>Order Cost</div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#22c55e', marginTop: 1 }}>₹{totalOrderAmount}</div>
                    </div>
                  </div>

                  {/* Distance & ETA Speed */}
                  <div style={{ display: 'flex', gap: 20 }}>
                    <div>
                      <div style={{ fontSize: 10.5, color: '#71717a', fontWeight: 600 }}>Real Distance</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#ffffff', marginTop: 1, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span>{routeDistanceKm || metrics.roadDistanceKm} Km</span>
                        <span style={{ fontSize: 9, background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '1px 5px', borderRadius: 4, fontWeight: 800 }}>LIVE ROUTE</span>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10.5, color: '#71717a', fontWeight: 600 }}>Est. Time</div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#d4f938', marginTop: 1 }}>
                        {routeDurationMin || metrics.etaMinutes} Mins
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3D Package Thumbnail graphic */}
                <div
                  style={{
                    width: 76,
                    height: 76,
                    borderRadius: 14,
                    background: '#1a1a24',
                    border: '1px solid #292938',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    marginLeft: 12,
                    flexShrink: 0
                  }}
                >
                  <Box size={38} color="#d4f938" strokeWidth={1.5} />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 4,
                      fontSize: 9,
                      fontWeight: 800,
                      color: '#ffffff',
                      background: '#000000',
                      padding: '1px 5px',
                      borderRadius: 4
                    }}
                  >
                    {items.length} Fits
                  </div>
                </div>
              </div>

              {/* Bottom Delivery Partner Courier Row with Call & Chat buttons */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  background: '#121217',
                  borderRadius: 16,
                  border: '1px solid #1f1f28',
                  marginBottom: 16
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
                    alt={deliveryPartnerName}
                    style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#ffffff' }}>
                      {deliveryPartnerName}
                    </div>
                    <div style={{ fontSize: 11, color: '#8e8e93', marginTop: 1 }}>
                      Ahmedabad Express Delivery Partner • 4.9 ★
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {/* Call Button (Orange as in reference screenshot) */}
                  <motion.a
                    href="tel:+919825088123"
                    whileTap={{ scale: 0.88 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: '50%',
                      background: '#f97316',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      textDecoration: 'none',
                      boxShadow: '0 4px 12px rgba(249, 115, 22, 0.4)'
                    }}
                    title="Call Delivery Partner"
                  >
                    <Phone size={18} fill="#ffffff" />
                  </motion.a>

                  {/* Chat Button (White as in reference screenshot) */}
                  <motion.a
                    href="https://wa.me/919825088123"
                    target="_blank"
                    rel="noopener noreferrer"
                    whileTap={{ scale: 0.88 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: '50%',
                      background: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#000000',
                      textDecoration: 'none',
                      boxShadow: '0 4px 12px rgba(255, 255, 255, 0.25)'
                    }}
                    title="WhatsApp Delivery Partner"
                  >
                    <MessageSquare size={18} fill="#000000" />
                  </motion.a>
                </div>
              </div>

              {/* Action: Open 6-Min Doorstep Mirror Fitting */}
              <motion.button
                type="button"
                whileTap={{ scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                onClick={() => setScreenMode('fitting')}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: 14,
                  background: '#d4f938',
                  color: '#000000',
                  fontSize: 13.5,
                  fontWeight: 800,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  outline: 'none'
                }}
              >
                <span>Delivery Partner Arrived? Start 6-Min Mirror Trial & Decision</span>
              </motion.button>
            </div>
          </div>
        </div>
      ) : (
        /* ====================================================================
            MODE 2: 6-MIN DOORSTEP FITTING & INSTANT REFUND DECISION VIEW
            ==================================================================== */
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 80px' }}>
          
          {/* Back to Live Map Button */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={() => setScreenMode('tracking')}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 12,
              background: '#1a1a24',
              border: '1px solid #282836',
              color: '#d4f938',
              fontSize: 12.5,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              cursor: 'pointer',
              marginBottom: 16
            }}
          >
            <Navigation size={15} />
            <span>View Live Location Tracking Map</span>
          </motion.button>

          {/* 100% Advance Payment & Settlement Breakdown */}
          <div
            style={{
              background: '#16161c',
              border: '1px solid #262632',
              borderRadius: 18,
              padding: 16,
              marginBottom: 16
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ background: 'rgba(34, 197, 94, 0.15)', padding: '4px 10px', borderRadius: 14, color: '#22c55e', fontSize: 11, fontWeight: 800 }}>
                ⚡ 100% ADVANCE PRE-PAID
              </div>
              <span style={{ fontSize: 11, color: '#8e8e93' }}>Order {bookingId}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, textAlign: 'center', background: '#0f0f14', padding: '12px 8px', borderRadius: 14, border: '1px solid #1f1f28' }}>
              <div>
                <div style={{ fontSize: 10, color: '#8e8e93', textTransform: 'uppercase', fontWeight: 700 }}>Total Paid</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#ffffff', marginTop: 2 }}>₹{totalOrderAmount}</div>
                <div style={{ fontSize: 9.5, color: '#d4f938' }}>Prepaid</div>
              </div>

              <div style={{ borderLeft: '1px solid #22222d', borderRight: '1px solid #22222d' }}>
                <div style={{ fontSize: 10, color: '#8e8e93', textTransform: 'uppercase', fontWeight: 700 }}>Kept on Spot</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#22c55e', marginTop: 2 }}>₹{keptAmount}</div>
                <div style={{ fontSize: 9.5, color: '#22c55e' }}>{keptItems.length} Fits Kept</div>
              </div>

              <div>
                <div style={{ fontSize: 10, color: '#8e8e93', textTransform: 'uppercase', fontWeight: 700 }}>Instant Refund</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: netRefund > 0 ? '#38bdf8' : '#8e8e93', marginTop: 2 }}>₹{netRefund}</div>
                <div style={{ fontSize: 9.5, color: netRefund > 0 ? '#38bdf8' : '#8e8e93' }}>
                  {returnedItems.length > 0 ? 'To UPI on Drop' : 'None'}
                </div>
              </div>
            </div>
          </div>

          {/* 6-Minute Live Mirror Trial Countdown Window */}
          <div
            style={{
              background: isOvertime ? '#261214' : '#16161c',
              border: isOvertime ? '1px solid #ef4444' : '1px solid #262632',
              borderRadius: 18,
              padding: 16,
              marginBottom: 16,
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, color: isOvertime ? '#ef4444' : '#d4f938', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
              {isOvertime ? '⚠️ TRIAL WINDOW EXCEEDED' : '⏱️ 6-MINUTE FREE DOORSTEP TRIAL'}
            </div>

            <div style={{ fontSize: 36, fontWeight: 900, letterSpacing: '-0.02em', color: isOvertime ? '#ef4444' : '#ffffff' }}>
              {isOvertime
                ? `+${Math.floor(Math.abs(secondsLeft) / 60)}:${String(Math.abs(secondsLeft) % 60).padStart(2, '0')}`
                : `${Math.max(0, Math.floor(secondsLeft / 60))}:${String(Math.max(0, secondsLeft % 60)).padStart(2, '0')}`}
            </div>

            <p style={{ fontSize: 12, color: '#8e8e93', margin: '4px 0 0 0' }}>
              {isOvertime
                ? `Overtime surcharge: ₹${overtimeFee} (billed at ₹2/min beyond 6 minutes)`
                : 'Take your time in your own mirror with your shoes. Delivery partner waits outside.'}
            </p>
          </div>

          {/* Items Keep / Return List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
            {items.map((it) => (
              <div
                key={it.id}
                style={{
                  background: '#16161c',
                  border: it.status === 'kept' ? '1.5px solid #22c55e' : (it.status === 'returned' ? '1.5px solid #ef4444' : '1px solid #262632'),
                  borderRadius: 16,
                  padding: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12
                }}
              >
                <img
                  src={it.thumbnail}
                  alt={it.name}
                  style={{ width: 60, height: 75, borderRadius: 10, objectFit: 'cover' }}
                />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, color: '#8e8e93', fontWeight: 600 }}>{it.brand}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {it.name}
                  </div>
                  <div style={{ fontSize: 12, color: '#d4f938', fontWeight: 800, marginTop: 2 }}>
                    {it.priceFormatted} • Size: {it.size}
                  </div>
                </div>

                {/* Keep / Return Action Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.92 }}
                    onClick={() => handleDecision(it.idx, 'kept')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 10,
                      background: it.status === 'kept' ? '#22c55e' : '#22222c',
                      color: it.status === 'kept' ? '#000000' : '#ffffff',
                      fontSize: 12,
                      fontWeight: 800,
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Keep ✓
                  </motion.button>

                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.92 }}
                    onClick={() => handleDecision(it.idx, 'returned')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 10,
                      background: it.status === 'returned' ? '#ef4444' : '#22222c',
                      color: '#ffffff',
                      fontSize: 12,
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Return ↺
                  </motion.button>
                </div>
              </div>
            ))}
          </div>

          {/* Refund Guarantee Callout */}
          <div
            style={{
              background: '#16161c',
              border: '1px solid #262632',
              borderRadius: 16,
              padding: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}
          >
            <ShieldCheck size={24} color="#22c55e" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: 11.5, color: '#a1a1aa', lineHeight: 1.45 }}>
              <strong style={{ color: '#ffffff' }}>Instant UPI Refund:</strong> When the delivery partner returns the sealed trial bag to Ahmedabad Darkstore Hub, unkept items are scanned and refunded instantly to your verified UPI VPA.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
