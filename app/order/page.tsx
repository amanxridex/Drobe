'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { getTrialOrders } from '@/app/lib/darkstoreData';

export default function OrderIndexPage() {
  const router = useRouter();
  const { orders } = useApp();

  useEffect(() => {
    try {
      const trialOrders = getTrialOrders();
      if (trialOrders && trialOrders.length > 0) {
        router.replace(`/order/${trialOrders[0].id}`);
        return;
      }
      if (orders && orders.length > 0) {
        router.replace(`/order/${orders[0].id}`);
        return;
      }
      router.replace('/order/DRB-9842');
    } catch {
      router.replace('/order/DRB-9842');
    }
  }, [orders, router]);

  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: '#0d0d12' }}>
      <div style={{ color: '#8e8e93', fontSize: 13, fontWeight: 600 }}>
        Loading Delivery Status...
      </div>
    </div>
  );
}
