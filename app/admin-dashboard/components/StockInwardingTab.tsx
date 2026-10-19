'use client';

import React, { useState } from 'react';
import { 
  Truck, 
  Boxes, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  Search, 
  Layers, 
  RefreshCw,
  Barcode,
  ChevronRight,
  Sparkles,
  Package,
  Store,
  DollarSign
} from 'lucide-react';
import { 
  DarkstoreProduct, 
  InboundStockShipment,
  DarkstoreBrand,
  calculateDrobeMarkupPricing
} from '../../lib/darkstoreData';
import InspectorDrawer from './InspectorDrawer';
import styles from '../admin.module.css';

interface StockInwardingTabProps {
  inbounds: InboundStockShipment[];
  products: DarkstoreProduct[];
  brands: DarkstoreBrand[];
  onOpenInwardModal: (prod: DarkstoreProduct, ship?: InboundStockShipment) => void;
  onMarkArrived: (shipmentId: string, prodName: string) => void;
  onDirectAutoInward: (ship: InboundStockShipment, prod?: DarkstoreProduct) => void;
  onSync: () => void;
}

export default function StockInwardingTab({
  inbounds,
  products,
  brands,
  onOpenInwardModal,
  onMarkArrived,
  onDirectAutoInward,
  onSync
}: StockInwardingTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_transit' | 'arrived' | 'allocated'>('all');

  const isShipmentAllocated = (s: string) => s === 'Verified & Shelved' || s === 'allocated';
  const isShipmentArrived = (s: string) => s === 'Arrived at Hub' || s === 'arrived';
  const isShipmentInTransit = (s: string) => s === 'In Transit' || s === 'in_transit';

  const matchesStatusFilter = (s: string, filter: string) => {
    if (filter === 'all') return true;
    if (filter === 'in_transit') return isShipmentInTransit(s);
    if (filter === 'arrived') return isShipmentArrived(s);
    if (filter === 'allocated') return isShipmentAllocated(s);
    return false;
  };
  const [selectedShipment, setSelectedShipment] = useState<InboundStockShipment | null>(null);

  const filteredInbounds = inbounds.filter(ship => {
    const matchesSearch = ship.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          ship.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          ship.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = matchesStatusFilter(ship.status, statusFilter);
    return matchesSearch && matchesStatus;
  });

  const selectedProduct = selectedShipment 
    ? products.find(p => p.id === selectedShipment.productId || p.name === selectedShipment.productName) || products[0]
    : null;

  const markupPreview = selectedProduct ? calculateDrobeMarkupPricing((selectedProduct as any).baseWholesalePrice || (selectedProduct as any).brandBasePrice || 600) : null;

  return (
    <div className={styles.tabContent}>
      {/* 1. INBOUND CONSIGNMENTS (CLEAN CLICKABLE CARD GRID) */}
      <div className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <div>
            <h3 className={styles.sectionTitle}>
              <Truck size={18} color="#0284c7" />
              Inbound Consignments Sent by Partner Brands
            </h3>
            <p className={styles.sectionDesc}>
              Click any consignment parcel to inspect details, verify pieces, and allocate darkstore shelf space.
            </p>
          </div>
          <button 
            type="button" 
            onClick={onSync} 
            className={`${styles.actionBtn} ${styles.actionBtnSecondary}`}
          >
            <RefreshCw size={13} /> Sync Inbound Feed
          </button>
        </div>

        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.toolbarLeft}>
            <div className={styles.searchBox}>
              <Search size={14} className={styles.searchBoxIcon} />
              <input
                type="text"
                placeholder="Search consignment ID, brand, garment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            <div className={styles.filterGroup}>
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`${styles.filterPill} ${statusFilter === 'all' ? styles.filterPillActive : ''}`}
              >
                All ({inbounds.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('in_transit')}
                className={`${styles.filterPill} ${statusFilter === 'in_transit' ? styles.filterPillActive : ''}`}
              >
                In Transit ({inbounds.filter(s => isShipmentInTransit(s.status)).length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('arrived')}
                className={`${styles.filterPill} ${statusFilter === 'arrived' ? styles.filterPillActive : ''}`}
              >
                Arrived at Hub ({inbounds.filter(s => isShipmentArrived(s.status)).length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('allocated')}
                className={`${styles.filterPill} ${statusFilter === 'allocated' ? styles.filterPillActive : ''}`}
              >
                Allocated ({inbounds.filter(s => isShipmentAllocated(s.status)).length})
              </button>
            </div>
          </div>
        </div>

        {/* CLICKABLE CONSIGNMENT CARDS LIST (PROGRESSIVE DISCLOSURE) */}
        {filteredInbounds.length === 0 ? (
          <div className={styles.emptyState}>
            <Truck size={36} color="#94a3b8" />
            <div className={styles.emptyStateTitle}>No consignments found</div>
            <div className={styles.emptyStateDesc}>Try clearing your search query or selecting a different status filter.</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '14px' }}>
            {filteredInbounds.map((ship) => {
              const isAllocated = isShipmentAllocated(ship.status);
              const isArrived = isShipmentArrived(ship.status);

              return (
                <div
                  key={ship.id}
                  onClick={() => setSelectedShipment(ship)}
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
                    gap: '14px',
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
                        {ship.id}
                      </span>
                      {isAllocated ? (
                        <span className={`${styles.statusChip} ${styles.statusLive}`}>
                          <CheckCircle2 size={11} /> Allocated
                        </span>
                      ) : isArrived ? (
                        <span className={`${styles.statusChip} ${styles.statusTransit}`} style={{ background: '#e0f2fe', color: '#0284c7' }}>
                          <Clock size={11} /> Arrived at Hub
                        </span>
                      ) : (
                        <span className={`${styles.statusChip} ${styles.statusDraft}`}>
                          In Transit
                        </span>
                      )}
                    </div>

                    <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                      {ship.productName}
                    </h4>
                    <div style={{ fontSize: '12.5px', color: '#64748b' }}>
                      Brand: <strong style={{ color: '#334155' }}>{ship.brandName}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '12px', marginTop: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', fontVariantNumeric: 'tabular-nums' }}>
                        {(ship as any).quantity || ship.units || 0} units
                      </span>
                      {((ship as any).shelfLocation || ship.assignedShelf) && (
                        <span style={{ fontFamily: 'var(--font-apple-mono)', fontSize: '11px', fontWeight: 700, color: '#0284c7', background: '#f8fafc', padding: '2px 6px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                          {(ship as any).shelfLocation || ship.assignedShelf}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', color: '#0284c7', fontWeight: 700 }}>
                      Inspect & Allocate <ChevronRight size={14} />
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
        isOpen={!!selectedShipment}
        onClose={() => setSelectedShipment(null)}
        title={selectedShipment ? selectedShipment.productName : ''}
        subtitle={selectedShipment ? `Consignment ${selectedShipment.id} · Dispatched by ${selectedShipment.brandName}` : ''}
        badge={selectedShipment && (
          <span style={{ 
            fontSize: '11px', 
            fontWeight: 800, 
            padding: '2px 8px', 
            borderRadius: '6px',
            background: isShipmentAllocated(selectedShipment.status) ? '#dcfce7' : isShipmentArrived(selectedShipment.status) ? '#e0f2fe' : '#f1f5f9',
            color: isShipmentAllocated(selectedShipment.status) ? '#15803d' : isShipmentArrived(selectedShipment.status) ? '#0369a1' : '#475569'
          }}>
            {isShipmentAllocated(selectedShipment.status) ? '✓ ALLOCATED & LIVE' : isShipmentArrived(selectedShipment.status) ? '📦 ARRIVED AT HUB' : '🚚 IN TRANSIT'}
          </span>
        )}
        footerActions={selectedShipment && (
          <>
            {isShipmentInTransit(selectedShipment.status) && (
              <button
                type="button"
                onClick={() => {
                  onMarkArrived(selectedShipment.id, selectedShipment.productName);
                  setSelectedShipment(prev => prev ? { ...prev, status: 'Arrived at Hub' } : null);
                }}
                className={`${styles.actionBtn} ${styles.actionBtnSecondary}`}
              >
                Mark Arrived at Ahmedabad Hub
              </button>
            )}

            {!isShipmentAllocated(selectedShipment.status) && selectedProduct && (
              <button
                type="button"
                onClick={() => {
                  const ship = selectedShipment;
                  setSelectedShipment(null);
                  onOpenInwardModal(selectedProduct, ship);
                }}
                className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
              >
                <Boxes size={14} /> Open Shelf Allocator
              </button>
            )}

            {!isShipmentAllocated(selectedShipment.status) && (
              <button
                type="button"
                onClick={() => {
                  const ship = selectedShipment;
                  setSelectedShipment(null);
                  onDirectAutoInward(ship, selectedProduct || undefined);
                }}
                className={`${styles.actionBtn} ${styles.actionBtnSuccess}`}
              >
                Auto-Inward Now
              </button>
            )}
          </>
        )}
      >
        {selectedShipment && (
          <>
            {/* Summary Box */}
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Consignment ID</div>
                  <div style={{ fontFamily: 'var(--font-apple-mono)', fontWeight: 800, color: '#0284c7', fontSize: '14px', marginTop: '2px' }}>{selectedShipment.id}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Physical Units</div>
                  <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '14px', marginTop: '2px' }}>{selectedShipment.units || (selectedShipment as any).quantity || 0} garments</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Partner Brand</div>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '13px', marginTop: '2px' }}>{selectedShipment.brandName}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Destination Shelf</div>
                  <div style={{ fontFamily: 'var(--font-apple-mono)', fontWeight: 800, color: '#16a34a', fontSize: '13px', marginTop: '2px' }}>
                    {selectedShipment.assignedShelf || (selectedShipment as any).shelfLocation || 'Pending Allocation'}
                  </div>
                </div>
              </div>
            </div>

            {/* Drobe 5% Pricing Model Breakdown */}
            {selectedProduct && markupPreview && (
              <div style={{ background: '#f0fdf4', padding: '16px', borderRadius: '14px', border: '1px solid #86efac' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    ⚡ Drobe 5% Markup & Charm 9 Pricing
                  </span>
                  <span style={{ fontSize: '10px', background: '#dcfce7', color: '#15803d', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>
                    Auto-Rounded
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '8px' }}>
                  <div style={{ background: '#ffffff', padding: '10px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Wholesale Cost (B)</div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>₹{(selectedProduct as any).baseWholesalePrice || (selectedProduct as any).brandBasePrice || 600}</div>
                  </div>
                  <div style={{ background: '#ffffff', padding: '10px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                    <div style={{ fontSize: '11px', color: '#166534' }}>Retail App Price</div>
                    <div style={{ fontSize: '16px', fontWeight: 900, color: '#15803d' }}>₹{markupPreview.sellingPrice}</div>
                  </div>
                </div>

                <div style={{ fontSize: '11.5px', color: '#15803d', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Platform Commission: <strong>+₹{markupPreview.markupAmount}</strong></span>
                  <span>Effective Margin: <strong>{markupPreview.formattedPercentage}</strong></span>
                </div>
              </div>
            )}

            {/* Physical Shelf Allocation Instructions */}
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                Ahmedabad Darkstore Shelf Protocol
              </div>
              <p style={{ fontSize: '12px', color: '#64748b', margin: 0, lineHeight: 1.45 }}>
                1. Verify tamper-evident barcode seal on arrival.<br/>
                2. Unpack garments and assign sequential SKU (DR1, DR2...).<br/>
                3. Place garment in allocated bin (e.g. Rack 1, Tier 2, Bin 3) to enable 30-minute runner retrieval.
              </p>
            </div>
          </>
        )}
      </InspectorDrawer>
    </div>
  );
}
