'use client';

import React, { useState } from 'react';
import { 
  Receipt, 
  Search, 
  Download, 
  RotateCcw, 
  CheckCircle2, 
  Clock, 
  Wallet, 
  TrendingUp, 
  Building2,
  ChevronRight,
  ShieldCheck,
  DollarSign
} from 'lucide-react';
import NumberFlow from '@number-flow/react';
import { DarkstoreBrand } from '../../lib/darkstoreData';
import InspectorDrawer from './InspectorDrawer';
import styles from '../admin.module.css';

interface WholesaleSettlementTabProps {
  financialLedger: {
    totalAdvanceGMV: number;
    totalInstantRefunds: number;
    totalUnitsReturned: number;
    totalWholesalePayableToBrands: number;
    totalUnitsKept: number;
    totalDrobeCommissionRetained: number;
    brandLedgers: Array<{
      brandId: string;
      brandName: string;
      category?: string;
      keptUnits: number;
      wholesalePayoutDue: number;
      drobeMarkup: number;
      advanceCollected: number;
      refundedAmount: number;
      isSettled?: boolean;
    }>;
  };
  brands: DarkstoreBrand[];
  settledBrands: string[];
  settlementSearch: string;
  onSearchChange: (q: string) => void;
  settlementBrandFilter: string;
  onFilterChange: (f: string) => void;
  onOpenPayoutModal: (item: any) => void;
  onExportCsv: () => void;
  onSyncLedger: () => void;
}

export default function WholesaleSettlementTab({
  financialLedger,
  brands,
  settledBrands,
  settlementSearch,
  onSearchChange,
  settlementBrandFilter,
  onFilterChange,
  onOpenPayoutModal,
  onExportCsv,
  onSyncLedger
}: WholesaleSettlementTabProps) {
  const [selectedLedgerItem, setSelectedLedgerItem] = useState<any | null>(null);

  const brandLedgers = financialLedger?.brandLedgers || [];

  const filteredLedgers = brandLedgers.filter(item => {
    const matchesSearch = item.brandName.toLowerCase().includes(settlementSearch.toLowerCase()) ||
                          (item.category && item.category.toLowerCase().includes(settlementSearch.toLowerCase()));
    const isSettled = settledBrands.includes(item.brandId);
    const matchesFilter = settlementBrandFilter === 'all' || 
                          (settlementBrandFilter === 'settled' && isSettled) ||
                          (settlementBrandFilter === 'pending' && !isSettled);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className={styles.tabContent}>
      {/* 1. EXECUTIVE LEDGER SUMMARY CARDS */}
      <div className={styles.domainKpiGrid}>
        <div className={styles.domainKpiCard} style={{ borderLeft: '4px solid #0284c7' }}>
          <div className={styles.domainKpiLabel}>
            <span>Advance GMV Collected</span>
            <Wallet size={15} color="#0284c7" />
          </div>
          <div className={styles.domainKpiVal} style={{ color: '#0284c7' }}>
            ₹<NumberFlow value={financialLedger.totalAdvanceGMV} />
          </div>
          <div className={styles.domainKpiSub}>100% pre-funded before dispatch</div>
        </div>

        <div className={styles.domainKpiCard} style={{ borderLeft: '4px solid #f59e0b' }}>
          <div className={styles.domainKpiLabel}>
            <span>Instant UPI Refunds</span>
            <RotateCcw size={15} color="#d97706" />
          </div>
          <div className={styles.domainKpiVal} style={{ color: '#d97706' }}>
            ₹<NumberFlow value={financialLedger.totalInstantRefunds} />
          </div>
          <div className={styles.domainKpiSub}>
            {financialLedger.totalUnitsReturned} returned pieces credited to customer UPI
          </div>
        </div>

        <div className={styles.domainKpiCard} style={{ borderLeft: '4px solid #6366f1' }}>
          <div className={styles.domainKpiLabel}>
            <span>Net Wholesale Payable</span>
            <Building2 size={15} color="#6366f1" />
          </div>
          <div className={styles.domainKpiVal} style={{ color: '#6366f1' }}>
            ₹<NumberFlow value={financialLedger.totalWholesalePayableToBrands} />
          </div>
          <div className={styles.domainKpiSub}>
            Payable to {brandLedgers.length} partner brands
          </div>
        </div>

        <div className={styles.domainKpiCard} style={{ borderLeft: '4px solid #10b981' }}>
          <div className={styles.domainKpiLabel}>
            <span>Drobe 5% Margin Retained</span>
            <TrendingUp size={15} color="#16a34a" />
          </div>
          <div className={styles.domainKpiVal} style={{ color: '#16a34a' }}>
            ₹<NumberFlow value={financialLedger.totalDrobeCommissionRetained} />
          </div>
          <div className={styles.domainKpiSub}>
            4.83% net platform margin
          </div>
        </div>
      </div>

      {/* 2. BRAND SETTLEMENT LEDGER */}
      <div className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <div>
            <h3 className={styles.sectionTitle}>
              <Receipt size={18} color="#0284c7" />
              Brand Partner Wholesale Settlement Matrix ({filteredLedgers.length} Brands)
            </h3>
            <p className={styles.sectionDesc}>
              Click any brand partner card to inspect dual-entry reconciliation, review customer refunds, and disburse bank payouts.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={onExportCsv}
              className={`${styles.actionBtn} ${styles.actionBtnSecondary}`}
            >
              <Download size={13} /> Export Settlement CSV
            </button>
            <button
              type="button"
              onClick={onSyncLedger}
              className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
            >
              <RotateCcw size={13} /> Sync DB Ledger
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.toolbarLeft}>
            <div className={styles.searchBox}>
              <Search size={14} className={styles.searchBoxIcon} />
              <input
                type="text"
                placeholder="Search brand name, category..."
                value={settlementSearch}
                onChange={(e) => onSearchChange(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            <div className={styles.filterGroup}>
              <button
                type="button"
                onClick={() => onFilterChange('all')}
                className={`${styles.filterPill} ${settlementBrandFilter === 'all' ? styles.filterPillActive : ''}`}
              >
                All Brands ({brandLedgers.length})
              </button>
              <button
                type="button"
                onClick={() => onFilterChange('pending')}
                className={`${styles.filterPill} ${settlementBrandFilter === 'pending' ? styles.filterPillActive : ''}`}
              >
                Pending Payout ({brandLedgers.filter(b => !settledBrands.includes(b.brandId)).length})
              </button>
              <button
                type="button"
                onClick={() => onFilterChange('settled')}
                className={`${styles.filterPill} ${settlementBrandFilter === 'settled' ? styles.filterPillActive : ''}`}
              >
                Settled ({settledBrands.length})
              </button>
            </div>
          </div>
        </div>

        {/* CLICKABLE BRAND SETTLEMENT CARDS (PROGRESSIVE DISCLOSURE) */}
        {filteredLedgers.length === 0 ? (
          <div className={styles.emptyState}>
            <Receipt size={36} color="#94a3b8" />
            <div className={styles.emptyStateTitle}>No settlement records found</div>
            <div className={styles.emptyStateDesc}>Try adjusting your search query or filter.</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
            {filteredLedgers.map((item) => {
              const isSettled = settledBrands.includes(item.brandId);

              return (
                <div
                  key={item.brandId}
                  onClick={() => setSelectedLedgerItem(item)}
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
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                        {item.category || 'Apparel'}
                      </span>
                      {isSettled ? (
                        <span className={`${styles.statusChip} ${styles.statusLive}`}>
                          <CheckCircle2 size={11} /> Settled
                        </span>
                      ) : (
                        <span className={`${styles.statusChip} ${styles.statusTransit}`} style={{ background: '#fef3c7', color: '#d97706' }}>
                          <Clock size={11} /> Payout Due
                        </span>
                      )}
                    </div>

                    <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                      {item.brandName}
                    </h4>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      {item.keptUnits} units kept by customers
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Wholesale Payable</div>
                      <div style={{ fontSize: '16px', fontWeight: 900, color: '#0284c7' }}>
                        ₹{item.wholesalePayoutDue.toLocaleString('en-IN')}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', color: '#0284c7', fontWeight: 700 }}>
                      Reconcile <ChevronRight size={14} />
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
        isOpen={!!selectedLedgerItem}
        onClose={() => setSelectedLedgerItem(null)}
        title={selectedLedgerItem ? `${selectedLedgerItem.brandName} Settlement` : ''}
        subtitle={selectedLedgerItem ? `Wholesale Payout & Margin Ledger · Brand ID: ${selectedLedgerItem.brandId}` : ''}
        badge={selectedLedgerItem && (
          <span style={{
            fontSize: '11px',
            fontWeight: 800,
            padding: '2px 8px',
            borderRadius: '6px',
            background: settledBrands.includes(selectedLedgerItem.brandId) ? '#dcfce7' : '#fef3c7',
            color: settledBrands.includes(selectedLedgerItem.brandId) ? '#15803d' : '#d97706'
          }}>
            {settledBrands.includes(selectedLedgerItem.brandId) ? '✓ SETTLED VIA NEFT' : '⏳ PENDING DISBURSEMENT'}
          </span>
        )}
        footerActions={selectedLedgerItem && (
          <>
            {!settledBrands.includes(selectedLedgerItem.brandId) && (
              <button
                type="button"
                onClick={() => {
                  const item = selectedLedgerItem;
                  setSelectedLedgerItem(null);
                  onOpenPayoutModal(item);
                }}
                className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
              >
                <CheckCircle2 size={13} /> Confirm Bank Payout (UTR)
              </button>
            )}
          </>
        )}
      >
        {selectedLedgerItem && (
          <>
            {/* Dual-Entry Accounting Breakdown */}
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '10px' }}>
                Dual-Entry Financial Reconciliation
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                  <span style={{ color: '#64748b' }}>Advance GMV Pre-funded:</span>
                  <strong style={{ color: '#0f172a' }}>₹{selectedLedgerItem.advanceCollected.toLocaleString('en-IN')}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                  <span style={{ color: '#64748b' }}>Instant UPI Return Refunds:</span>
                  <strong style={{ color: '#d97706' }}>-₹{selectedLedgerItem.refundedAmount.toLocaleString('en-IN')}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                  <span style={{ color: '#64748b' }}>Drobe 5% Platform Markup:</span>
                  <strong style={{ color: '#16a34a' }}>+₹{selectedLedgerItem.drobeMarkup.toLocaleString('en-IN')}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '4px', fontSize: '15px' }}>
                  <span style={{ fontWeight: 800, color: '#0f172a' }}>Net Brand Payout Due:</span>
                  <strong style={{ fontWeight: 900, color: '#0284c7' }}>₹{selectedLedgerItem.wholesalePayoutDue.toLocaleString('en-IN')}</strong>
                </div>
              </div>
            </div>

            {/* Payout Details */}
            <div style={{ background: '#f0fdf4', padding: '16px', borderRadius: '14px', border: '1px solid #86efac' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#166534', textTransform: 'uppercase', marginBottom: '6px' }}>
                Automated NEFT Settlement Status
              </div>
              <p style={{ fontSize: '12px', color: '#166534', margin: 0, lineHeight: 1.4 }}>
                Wholesale payouts are disbursed bi-weekly to the partner&apos;s registered current account. Enter the bank UTR reference once the NEFT/RTGS transaction completes.
              </p>
            </div>
          </>
        )}
      </InspectorDrawer>
    </div>
  );
}
