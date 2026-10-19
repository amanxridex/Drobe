'use client';

import React, { useState } from 'react';
import { 
  UserCheck, 
  Search, 
  Store, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileText, 
  Eye, 
  ShoppingBag, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Mail,
  Phone
} from 'lucide-react';
import Link from 'next/link';
import { DarkstoreBrand } from '../../lib/darkstoreData';
import InspectorDrawer from './InspectorDrawer';
import styles from '../admin.module.css';

interface BrandApprovalsTabProps {
  brands: DarkstoreBrand[];
  onSelectBrandForDossier: (brand: DarkstoreBrand) => void;
  onSelectBrandForProducts: (brand: DarkstoreBrand) => void;
  onApproveBrand: (brandId: string, brandName: string) => void;
  onRejectBrand: (brandId: string, brandName: string) => void;
}

export default function BrandApprovalsTab({
  brands,
  onSelectBrandForDossier,
  onSelectBrandForProducts,
  onApproveBrand,
  onRejectBrand
}: BrandApprovalsTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedBrand, setSelectedBrand] = useState<DarkstoreBrand | null>(null);

  const isStatusMatch = (status: string, filter: string) => {
    if (filter === 'all') return true;
    const s = (status || '').toLowerCase();
    if (filter === 'pending') return s.includes('waiting') || s.includes('pending') || s.includes('draft');
    if (filter === 'approved') return s === 'approved';
    if (filter === 'rejected') return s === 'rejected';
    return false;
  };

  const filteredBrands = brands.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (b.category && b.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (b.email && b.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = isStatusMatch(b.status, statusFilter);
    return matchesSearch && matchesStatus;
  });

  const pendingCount = brands.filter(b => isStatusMatch(b.status, 'pending')).length;
  const approvedCount = brands.filter(b => isStatusMatch(b.status, 'approved')).length;
  const rejectedCount = brands.filter(b => isStatusMatch(b.status, 'rejected')).length;

  return (
    <div className={styles.tabContent}>
      <div className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <div>
            <h3 className={styles.sectionTitle}>
              <UserCheck size={18} color="#0284c7" />
              Brand Partner Onboarding & Compliance Verification ({filteredBrands.length} Partners)
            </h3>
            <p className={styles.sectionDesc}>
              Click any brand partner card to review business dossiers, verify trademark compliance, inspect catalogs, and grant live access.
            </p>
          </div>
          <Link
            href="/brand-dashboard"
            target="_blank"
            className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
          >
            <Store size={13} /> Open Brand Portal <ExternalLink size={11} />
          </Link>
        </div>

        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.toolbarLeft}>
            <div className={styles.searchBox}>
              <Search size={14} className={styles.searchBoxIcon} />
              <input
                type="text"
                placeholder="Search brand name, category, email..."
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
                All Brands ({brands.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('pending')}
                className={`${styles.filterPill} ${statusFilter === 'pending' ? styles.filterPillActive : ''}`}
              >
                Awaiting Review ({pendingCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('approved')}
                className={`${styles.filterPill} ${statusFilter === 'approved' ? styles.filterPillActive : ''}`}
              >
                Approved ({approvedCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('rejected')}
                className={`${styles.filterPill} ${statusFilter === 'rejected' ? styles.filterPillActive : ''}`}
              >
                Rejected ({rejectedCount})
              </button>
            </div>
          </div>
        </div>

        {/* CLICKABLE BRAND CARDS (PROGRESSIVE DISCLOSURE) */}
        {filteredBrands.length === 0 ? (
          <div className={styles.emptyState}>
            <Store size={36} color="#94a3b8" />
            <div className={styles.emptyStateTitle}>No brands found</div>
            <div className={styles.emptyStateDesc}>Try adjusting your search query or status filter.</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
            {filteredBrands.map((brand) => (
              <div
                key={brand.id}
                onClick={() => setSelectedBrand(brand)}
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
                      ID: {brand.id}
                    </span>
                    {brand.status === 'Approved' || (brand.status as any) === 'approved' ? (
                      <span className={`${styles.statusChip} ${styles.statusLive}`}>
                        <CheckCircle2 size={11} /> Approved
                      </span>
                    ) : brand.status === 'Rejected' || (brand.status as any) === 'rejected' ? (
                      <span className={`${styles.statusChip} ${styles.statusDraft}`} style={{ background: '#fee2e2', color: '#dc2626' }}>
                        <XCircle size={11} /> Rejected
                      </span>
                    ) : (
                      <span className={`${styles.statusChip} ${styles.statusTransit}`} style={{ background: '#fef3c7', color: '#d97706' }}>
                        <Clock size={11} /> Awaiting Review
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '13px',
                      fontWeight: 800,
                      flexShrink: 0
                    }}>
                      {brand.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                        {brand.name}
                      </h4>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        {brand.category || 'Apparel'} · {((brand as any).productsCount || 0) || 0} styles
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                  <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                    Joined: {((brand as any).joinedDate || "Recently") || 'Recently'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', color: '#0284c7', fontWeight: 700 }}>
                    Review Dossier <ChevronRight size={14} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. SLIDE-OVER INSPECTOR DRAWER (PROGRESSIVE DISCLOSURE) */}
      <InspectorDrawer
        isOpen={!!selectedBrand}
        onClose={() => setSelectedBrand(null)}
        title={selectedBrand ? selectedBrand.name : ''}
        subtitle={selectedBrand ? `Brand Partner Verification Dossier · ${selectedBrand.category || 'Apparel'}` : ''}
        badge={selectedBrand && (
          <span style={{
            fontSize: '11px',
            fontWeight: 800,
            padding: '2px 8px',
            borderRadius: '6px',
            background: (selectedBrand.status === 'Approved' || (selectedBrand.status as any) === 'approved') ? '#dcfce7' : (selectedBrand.status === 'Rejected' || (selectedBrand.status as any) === 'rejected') ? '#fee2e2' : '#fef3c7',
            color: (selectedBrand.status === 'Approved' || (selectedBrand.status as any) === 'approved') ? '#15803d' : (selectedBrand.status === 'Rejected' || (selectedBrand.status as any) === 'rejected') ? '#dc2626' : '#d97706'
          }}>
            {(selectedBrand.status === 'Approved' || (selectedBrand.status as any) === 'approved') ? '✓ APPROVED & LIVE' : (selectedBrand.status === 'Rejected' || (selectedBrand.status as any) === 'rejected') ? '✕ REJECTED' : '⏳ AWAITING VERIFICATION'}
          </span>
        )}
        footerActions={selectedBrand && (
          <>
            <button
              type="button"
              onClick={() => {
                const b = selectedBrand;
                setSelectedBrand(null);
                onSelectBrandForProducts(b);
              }}
              className={`${styles.actionBtn} ${styles.actionBtnSecondary}`}
            >
              <Eye size={13} /> View Catalog ({((selectedBrand as any).productsCount || 0) || 0})
            </button>

            {selectedBrand.status !== 'Approved' && (selectedBrand.status as any) !== 'approved' && (
              <button
                type="button"
                onClick={() => {
                  onApproveBrand(selectedBrand.id, selectedBrand.name);
                  setSelectedBrand(prev => prev ? { ...prev, status: 'Approved' } : null);
                }}
                className={`${styles.actionBtn} ${styles.actionBtnSuccess}`}
              >
                <CheckCircle2 size={13} /> Approve Partner
              </button>
            )}

            {selectedBrand.status !== 'Rejected' && (selectedBrand.status as any) !== 'rejected' && (
              <button
                type="button"
                onClick={() => {
                  onRejectBrand(selectedBrand.id, selectedBrand.name);
                  setSelectedBrand(prev => prev ? { ...prev, status: 'Rejected' } : null);
                }}
                className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
              >
                <XCircle size={13} /> Reject Partner
              </button>
            )}
          </>
        )}
      >
        {selectedBrand && (
          <>
            {/* Business Contact Box */}
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>
                Business Registration & Contact
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ fontSize: '13px', color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Mail size={13} color="#64748b" /> {selectedBrand.email || 'partner@brand.com'}
                </div>
                {selectedBrand.phone && (
                  <div style={{ fontSize: '13px', color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Phone size={13} color="#64748b" /> {selectedBrand.phone}
                  </div>
                )}
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                  Entity ID: <strong style={{ color: '#0f172a' }}>{selectedBrand.id}</strong> · Category: <strong style={{ color: '#0284c7' }}>{selectedBrand.category}</strong>
                </div>
              </div>
            </div>

            {/* Compliance Checklist */}
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '10px' }}>
                Onboarding Compliance Checklist
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#16a34a' }}>
                  <CheckCircle2 size={14} /> GSTIN Business Registration Verified
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#16a34a' }}>
                  <CheckCircle2 size={14} /> Brand Trademark Certificate on File
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#16a34a' }}>
                  <CheckCircle2 size={14} /> Drobe 5% Margin Dual-Entry Agreement Signed
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0284c7' }}>
                  <ShieldCheck size={14} /> 30-Minute Darkstore Consignment SLA Accepted
                </div>
              </div>
            </div>
          </>
        )}
      </InspectorDrawer>
    </div>
  );
}
