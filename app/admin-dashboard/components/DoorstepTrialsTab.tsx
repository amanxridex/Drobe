'use client';

import React, { useState } from 'react';
import { 
  Truck, 
  Search, 
  Clock, 
  CheckCircle2, 
  RotateCcw, 
  Navigation, 
  User, 
  MapPin, 
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Activity,
  Phone
} from 'lucide-react';
import Link from 'next/link';
import { TrialOrder } from '../../lib/darkstoreData';
import InspectorDrawer from './InspectorDrawer';
import styles from '../admin.module.css';

interface DoorstepTrialsTabProps {
  trialOrders: TrialOrder[];
  ordersFilter: string;
  onFilterChange: (status: any) => void;
  ordersSearch: string;
  onSearchChange: (q: string) => void;
  onOrderAction: (orderId: string, newStatus: TrialOrder['status']) => void;
  onMarkDelivered: (orderId: string) => void;
  onOpenReturnModal: (order: TrialOrder) => void;
}

export default function DoorstepTrialsTab({
  trialOrders,
  ordersFilter,
  onFilterChange,
  ordersSearch,
  onSearchChange,
  onOrderAction,
  onMarkDelivered,
  onOpenReturnModal
}: DoorstepTrialsTabProps) {
  const [selectedOrder, setSelectedOrder] = useState<TrialOrder | null>(null);

  const isOut = (s: string) => (s as any) === 'out_for_trial' || s === 'Out for 30-Min Delivery' || (s || '').includes('Doorstep Fitting');
  const isDelivered = (s: string) => (s as any) === 'delivered' || (s || '').includes('Kept on Spot');
  const isReturned = (s: string) => (s as any) === 'returned' || (s || '').includes('Returned on Spot') || s === 'Restocked to Warehouse Shelf';
  const isScheduled = (s: string) => (s as any) === 'scheduled' || (s || '').includes('Awaiting') || (s || '').includes('Picked');

  const matchesStatus = (s: string, filter: string) => {
    if (filter === 'all') return true;
    if (filter === 'scheduled') return isScheduled(s);
    if (filter === 'out_for_trial') return isOut(s);
    if (filter === 'delivered') return isDelivered(s);
    if (filter === 'returned') return isReturned(s);
    return false;
  };

  const filteredOrders = trialOrders.filter(order => {
    const q = ordersSearch.toLowerCase();
    const addr = (order as any).deliveryAddress || order.customerAddress || '';
    const matchesSearch = order.id.toLowerCase().includes(q) ||
                          order.customerName.toLowerCase().includes(q) ||
                          addr.toLowerCase().includes(q) ||
                          (order.productName && order.productName.toLowerCase().includes(q));
    const matchesFilter = matchesStatus(order.status, ordersFilter);
    return matchesSearch && matchesFilter;
  });

  const scheduledCount = trialOrders.filter(o => isScheduled(o.status)).length;
  const outCount = trialOrders.filter(o => isOut(o.status)).length;
  const deliveredCount = trialOrders.filter(o => isDelivered(o.status)).length;
  const returnedCount = trialOrders.filter(o => isReturned(o.status)).length;

  return (
    <div className={styles.tabContent}>
      <div className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <div>
            <h3 className={styles.sectionTitle}>
              <Truck size={18} color="#0284c7" />
              Live Doorstep Trial Orders & Instant Return Station ({filteredOrders.length} Orders)
            </h3>
            <p className={styles.sectionDesc}>
              Click any order card to inspect customer address, dispatch delivery runners, record doorstep purchases, or trigger instant returns.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Link
              href="/order-portal"
              target="_blank"
              className={`${styles.actionBtn} ${styles.actionBtnSecondary}`}
            >
              <Activity size={13} color="#d97706" /> Hub Orders Screen <ExternalLink size={11} />
            </Link>
            <Link
              href="/delivery-partner"
              target="_blank"
              className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
            >
              <Navigation size={13} /> Delivery Runner App <ExternalLink size={11} />
            </Link>
          </div>
        </div>

        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.toolbarLeft}>
            <div className={styles.searchBox}>
              <Search size={14} className={styles.searchBoxIcon} />
              <input
                type="text"
                placeholder="Search order ID, customer, address, garment..."
                value={ordersSearch}
                onChange={(e) => onSearchChange(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            <div className={styles.filterGroup}>
              <button
                type="button"
                onClick={() => onFilterChange('all')}
                className={`${styles.filterPill} ${ordersFilter === 'all' ? styles.filterPillActive : ''}`}
              >
                All ({trialOrders.length})
              </button>
              <button
                type="button"
                onClick={() => onFilterChange('scheduled')}
                className={`${styles.filterPill} ${ordersFilter === 'scheduled' ? styles.filterPillActive : ''}`}
              >
                Scheduled ({scheduledCount})
              </button>
              <button
                type="button"
                onClick={() => onFilterChange('out_for_trial')}
                className={`${styles.filterPill} ${ordersFilter === 'out_for_trial' ? styles.filterPillActive : ''}`}
              >
                Runner at Door ({outCount})
              </button>
              <button
                type="button"
                onClick={() => onFilterChange('delivered')}
                className={`${styles.filterPill} ${ordersFilter === 'delivered' ? styles.filterPillActive : ''}`}
              >
                Kept & Paid ({deliveredCount})
              </button>
              <button
                type="button"
                onClick={() => onFilterChange('returned')}
                className={`${styles.filterPill} ${ordersFilter === 'returned' ? styles.filterPillActive : ''}`}
              >
                Restocked ({returnedCount})
              </button>
            </div>
          </div>
        </div>

        {/* CLICKABLE TRIAL ORDER CARDS (PROGRESSIVE DISCLOSURE) */}
        {filteredOrders.length === 0 ? (
          <div className={styles.emptyState}>
            <Truck size={36} color="#94a3b8" />
            <div className={styles.emptyStateTitle}>No trial orders match your filters</div>
            <div className={styles.emptyStateDesc}>Try selecting "All" or searching for a different customer name or order ID.</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '14px' }}>
            {filteredOrders.map((order) => {
              const isOut = (order.status as any) === 'out_for_trial' || order.status === 'Out for 30-Min Delivery' || order.status.includes('Doorstep Fitting');
              const isDelivered = (order.status as any) === 'delivered' || order.status.includes('Kept on Spot');
              const isReturned = (order.status as any) === 'returned' || order.status.includes('Returned on Spot') || order.status === 'Restocked to Warehouse Shelf';

              return (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  style={{
                    background: '#ffffff',
                    border: '1px solid rgba(226, 232, 240, 0.9)',
                    borderRadius: '16px',
                    padding: '18px 20px',
                    cursor: 'pointer',
                    transition: 'all 160ms cubic-bezier(0.23, 1, 0.32, 1)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '12px',
                    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(15, 23, 42, 0.08)';
                    e.currentTarget.style.borderColor = '#0284c7';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(15, 23, 42, 0.04)';
                    e.currentTarget.style.borderColor = 'rgba(226, 232, 240, 0.9)';
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontFamily: 'var(--font-apple-mono)', fontWeight: 800, fontSize: '12px', color: '#0284c7', background: 'rgba(2, 132, 199, 0.08)', padding: '2px 8px', borderRadius: '6px' }}>
                        {order.id}
                      </span>
                      {isOut ? (
                        <span className={`${styles.statusChip} ${styles.statusTransit}`} style={{ background: '#fef3c7', color: '#d97706' }}>
                          <Clock size={11} /> Runner at Door
                        </span>
                      ) : isDelivered ? (
                        <span className={`${styles.statusChip} ${styles.statusLive}`}>
                          <CheckCircle2 size={11} /> Kept & Paid
                        </span>
                      ) : isReturned ? (
                        <span className={`${styles.statusChip} ${styles.statusTransit}`} style={{ background: '#f1f5f9', color: '#475569' }}>
                          <RotateCcw size={11} /> Restocked
                        </span>
                      ) : (
                        <span className={`${styles.statusChip} ${styles.statusDraft}`}>
                          Scheduled
                        </span>
                      )}
                    </div>

                    <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                      {order.customerName}
                    </h4>
                    <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={12} color="#94a3b8" /> {(order as any).deliveryAddress || order.customerAddress || 'Ahmedabad, Gujarat'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
                        {order.productName}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        ₹{(order as any).totalAmount || order.price || 1499} · Size {order.size || 'M'}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', color: '#0284c7', fontWeight: 700 }}>
                      Manage Order <ChevronRight size={14} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. SLIDE-OVER INSPECTOR DRAWER (PROGRESSIVE DISCLOSURE) */}
      <InspectorDrawer
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={selectedOrder ? `Trial Order ${selectedOrder.id}` : ''}
        subtitle={selectedOrder ? `Customer: ${selectedOrder.customerName} · 6-Min Mirror Trial` : ''}
        badge={selectedOrder && (
          <span style={{
            fontSize: '11px',
            fontWeight: 800,
            padding: '2px 8px',
            borderRadius: '6px',
            background: isOut(selectedOrder.status) ? '#fef3c7' : isDelivered(selectedOrder.status) ? '#dcfce7' : '#f1f5f9',
            color: isOut(selectedOrder.status) ? '#d97706' : isDelivered(selectedOrder.status) ? '#15803d' : '#475569'
          }}>
            {isOut(selectedOrder.status) ? '🏃 RUNNER WAITING AT DOOR' : isDelivered(selectedOrder.status) ? '✓ CONVERTED PURCHASE' : isReturned(selectedOrder.status) ? '↩ RETURNED ON-SPOT' : '📅 SCHEDULED'}
          </span>
        )}
        footerActions={selectedOrder && (
          <>
            {!isOut(selectedOrder.status) && !isDelivered(selectedOrder.status) && !isReturned(selectedOrder.status) && (
              <button
                type="button"
                onClick={() => {
                  onOrderAction(selectedOrder.id, 'Out for 30-Min Delivery');
                  setSelectedOrder(prev => prev ? { ...prev, status: 'Out for 30-Min Delivery' } : null);
                }}
                className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
              >
                <Navigation size={13} /> Dispatch Runner
              </button>
            )}

            {isOut(selectedOrder.status) && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    const id = selectedOrder.id;
                    setSelectedOrder(null);
                    onMarkDelivered(id);
                  }}
                  className={`${styles.actionBtn} ${styles.actionBtnSuccess}`}
                >
                  <CheckCircle2 size={13} /> Customer Kept & Paid
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const ord = selectedOrder;
                    setSelectedOrder(null);
                    onOpenReturnModal(ord);
                  }}
                  className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                >
                  <RotateCcw size={13} /> Instant Return & Restock
                </button>
              </>
            )}
          </>
        )}
      >
        {selectedOrder && (
          <>
            {/* Customer & Address Details */}
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>
                Delivery Destination Details
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                  {selectedOrder.customerName}
                </div>
                <div style={{ fontSize: '12.5px', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={13} color="#0284c7" /> {((selectedOrder as any).deliveryAddress || selectedOrder.customerAddress) || 'Koteshwar / Motera, Ahmedabad'}
                </div>
                {((selectedOrder as any).phone || selectedOrder.customerPhone) && (
                  <div style={{ fontSize: '12.5px', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Phone size={13} color="#16a34a" /> {((selectedOrder as any).phone || selectedOrder.customerPhone)}
                  </div>
                )}
              </div>
            </div>

            {/* Garment Trial Specs */}
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>
                Trial Garment Specifications
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12.5px' }}>
                <div>Garment: <strong style={{ color: '#0f172a' }}>{selectedOrder.productName}</strong></div>
                <div>Size: <strong style={{ color: '#0284c7' }}>{selectedOrder.size || 'M'}</strong></div>
                <div>Order Value: <strong style={{ color: '#16a34a' }}>₹{((selectedOrder as any).totalAmount || selectedOrder.price) || 1499}</strong></div>
                <div>Shelf Location: <strong style={{ fontFamily: 'var(--font-apple-mono)' }}>{selectedOrder.shelfLocation || 'R1-S1-B1'}</strong></div>
              </div>
            </div>

            {/* 6-Minute Mirror Trial Protocol */}
            <div style={{ background: 'rgba(2, 132, 199, 0.04)', padding: '16px', borderRadius: '14px', border: '1px solid rgba(2, 132, 199, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 800, color: '#0284c7', marginBottom: '4px' }}>
                <Clock size={14} /> 6-Minute Mirror Trial Standard
              </div>
              <p style={{ fontSize: '12px', color: '#475569', margin: 0, lineHeight: 1.45 }}>
                Runner waits at customer doorstep for 6 minutes while the customer tries the garment in front of their mirror. If it fits, customer pays via UPI. If not, runner accepts on-spot return immediately and restocks to Ahmedabad darkstore.
              </p>
            </div>
          </>
        )}
      </InspectorDrawer>
    </div>
  );
}
