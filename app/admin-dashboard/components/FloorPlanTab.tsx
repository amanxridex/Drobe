'use client';

import React, { useState } from 'react';
import { 
  Layers, 
  MapPin, 
  Package, 
  Boxes, 
  CheckCircle2, 
  Search, 
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';
import { DarkstoreProduct } from '../../lib/darkstoreData';
import styles from '../admin.module.css';

interface FloorPlanTabProps {
  products: DarkstoreProduct[];
  onOpenInwardModal?: (prod: DarkstoreProduct) => void;
}

export default function FloorPlanTab({
  products,
  onOpenInwardModal
}: FloorPlanTabProps) {
  const [selectedZone, setSelectedZone] = useState<'all' | 'A' | 'B' | 'C'>('all');
  const [inspectedBin, setInspectedBin] = useState<{
    coordinate: string;
    product?: DarkstoreProduct;
  } | null>(null);

  // Map products to their shelf coordinates
  const productByShelf: { [coord: string]: DarkstoreProduct } = {};
  products.forEach(p => {
    if ((p as any).shelfLocation || p.warehouseLocation?.code) {
      productByShelf[((p as any).shelfLocation || p.warehouseLocation?.code || '').toUpperCase()] = p;
    }
  });

  const zones = [
    { id: 'A', name: 'Zone A — Streetwear & Casuals', racks: ['R1', 'R2'], desc: 'High turnover streetwear, tees, hoodies' },
    { id: 'B', name: 'Zone B — Activewear & Athleisure', racks: ['R3', 'R4'], desc: 'Gymwear, joggers, shorts, tracksuits' },
    { id: 'C', name: 'Zone C — Ethnic & Formalwear', racks: ['R5', 'R6'], desc: 'Kurtas, blazers, eveningwear, festive' }
  ];

  const filteredZones = selectedZone === 'all' ? zones : zones.filter(z => z.id === selectedZone);

  const totalBins = 96;
  const occupiedBinsCount = Object.keys(productByShelf).length;
  const utilizationPercentage = Math.round((occupiedBinsCount / totalBins) * 100);

  return (
    <div className={styles.tabContent}>
      {/* 1. FLOOR PLAN CONTROLS */}
      <div className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <div>
            <h3 className={styles.sectionTitle}>
              <Layers size={18} color="#0284c7" />
              Ahmedabad Hub #01 Interactive Floor Plan & Rack Matrix
            </h3>
            <p className={styles.sectionDesc}>
              Physical rack, tier shelf, and bin matrix across Zones A, B, and C (Shivam Bungalows 1, Koteshwar Road).
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
              Capacity: {occupiedBinsCount} / {totalBins} Bins ({utilizationPercentage}%)
            </span>
          </div>
        </div>

        {/* Zone Selector */}
        <div className={styles.toolbar}>
          <div className={styles.filterGroup}>
            <button
              type="button"
              onClick={() => setSelectedZone('all')}
              className={`${styles.filterPill} ${selectedZone === 'all' ? styles.filterPillActive : ''}`}
            >
              All Zones (6 Racks)
            </button>
            <button
              type="button"
              onClick={() => setSelectedZone('A')}
              className={`${styles.filterPill} ${selectedZone === 'A' ? styles.filterPillActive : ''}`}
            >
              Zone A (Streetwear)
            </button>
            <button
              type="button"
              onClick={() => setSelectedZone('B')}
              className={`${styles.filterPill} ${selectedZone === 'B' ? styles.filterPillActive : ''}`}
            >
              Zone B (Activewear)
            </button>
            <button
              type="button"
              onClick={() => setSelectedZone('C')}
              className={`${styles.filterPill} ${selectedZone === 'C' ? styles.filterPillActive : ''}`}
            >
              Zone C (Ethnic)
            </button>
          </div>

          <div style={{ fontSize: '11.5px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: 'rgba(2, 132, 199, 0.15)', border: '1px solid #0284c7' }} />
              Occupied Bin
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#f8fafc', border: '1px dashed #cbd5e1' }} />
              Available Bin
            </span>
          </div>
        </div>

        {/* Selected Bin Inspector Preview */}
        {inspectedBin && (
          <div style={{
            background: 'rgba(2, 132, 199, 0.04)',
            border: '1px solid rgba(2, 132, 199, 0.2)',
            borderRadius: '12px',
            padding: '14px 18px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                fontFamily: 'var(--font-apple-mono)',
                fontSize: '16px',
                fontWeight: 900,
                color: '#0284c7',
                background: '#ffffff',
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1'
              }}>
                {inspectedBin.coordinate}
              </div>
              {inspectedBin.product ? (
                <div>
                  <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '14px' }}>
                    {inspectedBin.product.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    SKU: <strong>{inspectedBin.product.sku || inspectedBin.product.id}</strong> · Brand: <strong>{(inspectedBin.product as any).brand || inspectedBin.product.brandId || ''}</strong> · Stock: <strong style={{ color: '#16a34a' }}>{((inspectedBin.product as any).stock_count || inspectedBin.product.inwardUnits || 0)} units</strong>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ fontWeight: 700, color: '#64748b', fontSize: '13px' }}>
                    Empty Storage Bin
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                    No SKU currently allocated to {inspectedBin.coordinate}. Ready for stock inwarding.
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setInspectedBin(null)}
              className={`${styles.actionBtn} ${styles.actionBtnSecondary}`}
            >
              Close Inspector
            </button>
          </div>
        )}

        {/* Zones and Racks Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {filteredZones.map(zone => (
            <div key={zone.id} style={{ background: 'rgba(248, 250, 252, 0.6)', border: '1px solid rgba(226, 232, 240, 0.8)', borderRadius: '16px', padding: '20px' }}>
              <div className={styles.floorPlanZoneHeader}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                    {zone.name}
                  </h4>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                    {zone.desc}
                  </div>
                </div>
                <span className={`${styles.statusChip} ${styles.statusTransit}`} style={{ background: '#e0f2fe', color: '#0284c7' }}>
                  Zone {zone.id}
                </span>
              </div>

              <div className={styles.rackGrid}>
                {zone.racks.map(rackId => (
                  <div key={rackId} className={styles.rackCard}>
                    <div className={styles.rackCardHeader}>
                      <div className={styles.rackCardTitle}>
                        <Boxes size={15} color="#0284c7" />
                        Rack {rackId}
                      </div>
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                        4 Shelves · 16 Bins
                      </span>
                    </div>

                    {/* 4 Vertical Shelves per Rack */}
                    {[1, 2, 3, 4].map(shelfNum => (
                      <div key={shelfNum} className={styles.rackShelfRow}>
                        <div className={styles.rackShelfLabel}>
                          Tier {shelfNum} (Shelf {shelfNum})
                        </div>
                        <div className={styles.rackBinSlots}>
                          {[1, 2, 3, 4].map(binNum => {
                            const coord = `${rackId}-S${shelfNum}-B${binNum}`;
                            const prod = productByShelf[coord] || (rackId === 'R1' && shelfNum === 1 && binNum === 1 ? products[0] : undefined);
                            const isOccupied = !!prod;

                            return (
                              <button
                                key={binNum}
                                type="button"
                                onClick={() => setInspectedBin({ coordinate: coord, product: prod })}
                                className={`${styles.rackBinSlot} ${isOccupied ? styles.rackBinSlotOccupied : styles.rackBinSlotEmpty}`}
                                title={isOccupied ? `${coord}: ${prod?.name} (${prod?.sku})` : `${coord}: Available`}
                              >
                                <span style={{ fontSize: '10px', opacity: 0.8 }}>B{binNum}</span>
                                {isOccupied && (
                                  <span style={{ fontSize: '10.5px', fontWeight: 800, marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
                                    {prod?.sku || 'DR'}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
