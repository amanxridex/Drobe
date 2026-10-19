'use client';

import React, { useState } from 'react';
import { 
  Barcode, 
  Search, 
  Package, 
  Plus, 
  Minus, 
  Boxes, 
  Download, 
  Layers, 
  ChevronRight,
  DollarSign,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { 
  DarkstoreProduct, 
  DarkstoreBrand,
  calculateDrobeMarkupPricing 
} from '../../lib/darkstoreData';
import InspectorDrawer from './InspectorDrawer';
import styles from '../admin.module.css';

interface SkuInventoryTabProps {
  products: DarkstoreProduct[];
  brands: DarkstoreBrand[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  inventoryFilter: string;
  onFilterChange: (cat: string) => void;
  brandFilter: string;
  onBrandFilterChange: (b: string) => void;
  onAdjustStock: (productId: string, delta: number, prodName: string) => void;
  onOpenBarcodeModal: (prod: DarkstoreProduct) => void;
  onOpenInwardModal: (prod: DarkstoreProduct) => void;
}

export default function SkuInventoryTab({
  products,
  brands,
  searchQuery,
  onSearchChange,
  inventoryFilter,
  onFilterChange,
  brandFilter,
  onBrandFilterChange,
  onAdjustStock,
  onOpenBarcodeModal,
  onOpenInwardModal
}: SkuInventoryTabProps) {
  const [selectedProduct, setSelectedProduct] = useState<DarkstoreProduct | null>(null);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (p.sku || p.id).toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ((p as any).brand || p.brandId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (((p as any).shelfLocation || p.warehouseLocation?.code) && ((p as any).shelfLocation || p.warehouseLocation?.code).toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = inventoryFilter === 'all' || ((p.category || 'Apparel').toLowerCase() === inventoryFilter.toLowerCase());
    const matchesBrand = brandFilter === 'all' || (((p as any).brand || p.brandId || '').toLowerCase() === brandFilter.toLowerCase());
    return matchesSearch && matchesCategory && matchesBrand;
  });

  const uniqueCategories = ['all', ...Array.from(new Set(products.map(p => p.category)))];
  const uniqueBrands = ['all', ...Array.from(new Set(products.map(p => (p as any).brand || p.brandId || 'Brand')))];

  const handleExportCsv = () => {
    const csv = 'SKU,Product,Brand,Category,Stock,Wholesale,Retail,Shelf\n' +
      filteredProducts.map(p => `"${p.sku || p.id}","${p.name}","${(p as any).brand || p.brandId || ''}","${p.category || 'Apparel'}",${(p as any).stock_count || p.inwardUnits || 0},${(p as any).baseWholesalePrice || (p as any).brandBasePrice || 0},${(p as any).customerPrice || (p as any).price || 0},"${(p as any).shelfLocation || p.warehouseLocation?.code || ''}"`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `drobe_sku_inventory_${Date.now()}.csv`;
    a.click();
  };

  const currentMarkup = selectedProduct ? calculateDrobeMarkupPricing((selectedProduct as any).baseWholesalePrice || (selectedProduct as any).brandBasePrice || 600) : null;

  return (
    <div className={styles.tabContent}>
      <div className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <div>
            <h3 className={styles.sectionTitle}>
              <Barcode size={18} color="#0284c7" />
              Live Darkstore SKU Inventory Matrix ({filteredProducts.length} SKUs)
            </h3>
            <p className={styles.sectionDesc}>
              Click any SKU card to view barcode labels, adjust inventory counts, inspect shelf coordinates, and review 5% markup calculations.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={handleExportCsv}
              className={`${styles.actionBtn} ${styles.actionBtnSecondary}`}
            >
              <Download size={13} /> Export CSV
            </button>
            <button
              type="button"
              onClick={() => {
                const pending = products.find(p => p.inwardStatus !== 'Inwarded & Live') || products[0];
                if (pending) onOpenInwardModal(pending);
              }}
              className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
            >
              <Boxes size={13} /> + Inward New SKU
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
                placeholder="Search SKU (e.g. DR1), garment, brand, shelf..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            <select
              value={inventoryFilter}
              onChange={(e) => onFilterChange(e.target.value)}
              className={styles.selectDropdown}
            >
              <option value="all">All Categories ({products.length})</option>
              {uniqueCategories.filter(c => c !== 'all').map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select
              value={brandFilter}
              onChange={(e) => onBrandFilterChange(e.target.value)}
              className={styles.selectDropdown}
            >
              <option value="all">All Brands ({uniqueBrands.length - 1})</option>
              {uniqueBrands.filter(b => b !== 'all').map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </div>
        </div>

        {/* CLEAN, VISUAL SKU CARDS GRID (PROGRESSIVE DISCLOSURE) */}
        {filteredProducts.length === 0 ? (
          <div className={styles.emptyState}>
            <Package size={36} color="#94a3b8" />
            <div className={styles.emptyStateTitle}>No SKUs found</div>
            <div className={styles.emptyStateDesc}>Try adjusting your search query, category, or brand filter.</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
            {filteredProducts.map((prod) => (
              <div
                key={prod.id}
                onClick={() => setSelectedProduct(prod)}
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
                      {prod.sku}
                    </span>
                    <span style={{ 
                      fontSize: '11px', 
                      fontWeight: 800, 
                      color: ((prod as any).stock_count || prod.inwardUnits || 0) <= 5 ? '#dc2626' : '#16a34a',
                      background: ((prod as any).stock_count || prod.inwardUnits || 0) <= 5 ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                      padding: '2px 8px',
                      borderRadius: '6px'
                    }}>
                      {((prod as any).stock_count || prod.inwardUnits || 0)} in stock
                    </span>
                  </div>

                  <h4 style={{ margin: '0 0 3px 0', fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                    {prod.name}
                  </h4>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    {(prod as any).brand || prod.brandId || ''} · <span style={{ color: '#0284c7' }}>{prod.category}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 900, color: '#0f172a' }}>
                      ₹{((prod as any).customerPrice || (prod as any).price || 0)}
                    </span>
                    <span style={{ fontSize: '10px', color: '#16a34a', fontWeight: 700, background: '#dcfce7', padding: '1px 5px', borderRadius: '4px' }}>
                      +5%
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', color: '#0284c7', fontWeight: 700 }}>
                    Inspect Details <ChevronRight size={14} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. SLIDE-OVER INSPECTOR DRAWER (PROGRESSIVE DISCLOSURE) */}
      <InspectorDrawer
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        title={selectedProduct ? selectedProduct.name : ''}
        subtitle={selectedProduct ? `SKU ${selectedProduct.sku || selectedProduct.id} · Brand: ${(selectedProduct as any).brand || selectedProduct.brandId || ''} (${selectedProduct.category || 'Apparel'})` : ''}
        badge={selectedProduct && (
          <span style={{
            fontSize: '11px',
            fontWeight: 800,
            padding: '2px 8px',
            borderRadius: '6px',
            background: 'rgba(2, 132, 199, 0.08)',
            color: '#0284c7',
            fontFamily: 'var(--font-apple-mono)'
          }}>
            {selectedProduct.sku}
          </span>
        )}
        footerActions={selectedProduct && (
          <>
            <button
              type="button"
              onClick={() => {
                const prod = selectedProduct;
                setSelectedProduct(null);
                onOpenBarcodeModal(prod);
              }}
              className={`${styles.actionBtn} ${styles.actionBtnSecondary}`}
            >
              <Barcode size={13} /> Print Barcode Label
            </button>
            <button
              type="button"
              onClick={() => {
                const prod = selectedProduct;
                setSelectedProduct(null);
                onOpenInwardModal(prod);
              }}
              className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
            >
              <Layers size={13} /> Reallocate Shelf
            </button>
          </>
        )}
      >
        {selectedProduct && (
          <>
            {/* Live Stock Adjustment Stepper */}
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginBottom: '8px' }}>
                Physical Darkstore Inventory
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', fontVariantNumeric: 'tabular-nums' }}>
                    {((selectedProduct as any).stock_count || selectedProduct.inwardUnits || 0)} units
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    Shelf: <strong style={{ color: '#0284c7' }}>{((selectedProduct as any).shelfLocation || selectedProduct.warehouseLocation?.code || 'Pending Allocation') || 'Unassigned'}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      onAdjustStock(selectedProduct.id, -1, selectedProduct.name);
                      setSelectedProduct(prev => prev ? { ...prev, inwardUnits: Math.max(0, (prev.inwardUnits || (prev as any).stock_count || 0) - 1) } : null);
                    }}
                    disabled={((selectedProduct as any).stock_count || selectedProduct.inwardUnits || 0) <= 0}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      cursor: ((selectedProduct as any).stock_count || selectedProduct.inwardUnits || 0) <= 0 ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: ((selectedProduct as any).stock_count || selectedProduct.inwardUnits || 0) <= 0 ? 0.4 : 1
                    }}
                    title="Deduct 1 piece"
                  >
                    <Minus size={16} color="#dc2626" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onAdjustStock(selectedProduct.id, 1, selectedProduct.name);
                      setSelectedProduct(prev => prev ? { ...prev, inwardUnits: ((prev.inwardUnits || (prev as any).stock_count || 0) + 1) } : null);
                    }}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="Add 1 piece"
                  >
                    <Plus size={16} color="#16a34a" />
                  </button>
                </div>
              </div>
            </div>

            {/* Drobe 5% Pricing Model Breakdown */}
            {currentMarkup && (
              <div style={{ background: '#f0fdf4', padding: '16px', borderRadius: '14px', border: '1px solid #86efac' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    ⚡ Drobe 5% Markup & Charm 9 Pricing
                  </span>
                  <span style={{ fontSize: '10px', background: '#dcfce7', color: '#15803d', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>
                    Ends in 9
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '8px' }}>
                  <div style={{ background: '#ffffff', padding: '10px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Brand Wholesale (B)</div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>₹{((selectedProduct as any).baseWholesalePrice || (selectedProduct as any).brandBasePrice || 600)}</div>
                  </div>
                  <div style={{ background: '#ffffff', padding: '10px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                    <div style={{ fontSize: '11px', color: '#166534' }}>Customer Price</div>
                    <div style={{ fontSize: '16px', fontWeight: 900, color: '#15803d' }}>₹{currentMarkup.sellingPrice}</div>
                  </div>
                </div>

                <div style={{ fontSize: '11.5px', color: '#15803d', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Platform Commission: <strong>+₹{currentMarkup.markupAmount}</strong></span>
                  <span>Effective Margin: <strong>{currentMarkup.formattedPercentage}</strong></span>
                </div>
              </div>
            )}

            {/* Shelf & Barcode Specs */}
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginBottom: '8px' }}>
                Warehouse Location Details
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                <div>Location: <strong style={{ color: '#0284c7' }}>{((selectedProduct as any).shelfLocation || selectedProduct.warehouseLocation?.code || 'Pending Allocation') || 'Unassigned'}</strong></div>
                <div>Status: <strong style={{ color: '#16a34a' }}>{selectedProduct.inwardStatus || 'Live'}</strong></div>
                <div>Category: <strong>{selectedProduct.category}</strong></div>
                <div>Barcode: <strong>Code128 Ready</strong></div>
              </div>
            </div>
          </>
        )}
      </InspectorDrawer>
    </div>
  );
}
