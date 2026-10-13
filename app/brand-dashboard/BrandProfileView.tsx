'use client';

import React, { useState } from 'react';
import { 
  Home, 
  LayoutGrid, 
  BarChart2, 
  User, 
  Globe, 
  Mail, 
  Plus, 
  Edit3,
  Share2,
  Trash2,
  X,
  Upload
} from 'lucide-react';
import { BrandProfile, BrandProductHighlight } from './types';
import styles from './brand-dashboard.module.css';

const InstagramIcon = ({ size = 14, color = "#ffffff" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

interface BrandProfileViewProps {
  brand: BrandProfile;
  onEditClick: () => void;
  onShareClick?: () => void;
  onUpdateBrand?: (updated: BrandProfile) => void;
}

export default function BrandProfileView({
  brand,
  onEditClick,
  onShareClick,
  onUpdateBrand
}: BrandProfileViewProps) {
  const [activeTab, setActiveTab] = useState<'catalog' | 'atelier' | 'channels'>('catalog');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState<BrandProductHighlight>({
    name: '',
    price: '',
    volume: '',
    tagline: '',
    description: '',
    image: ''
  });

  const activeProducts = brand.products.filter(p => p.name?.trim().length > 0);
  const totalProductsCount = activeProducts.length;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setNewProduct(prev => ({ ...prev, image: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveNewProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name.trim()) return;

    const updatedProducts = [
      ...brand.products.filter(p => p.name?.trim().length > 0),
      newProduct
    ];
    const updatedBrand: BrandProfile = {
      ...brand,
      products: updatedProducts
    };

    if (onUpdateBrand) {
      onUpdateBrand(updatedBrand);
    } else {
      try {
        localStorage.setItem('drobe_brand_profile_v1', JSON.stringify(updatedBrand));
      } catch {}
    }

    setNewProduct({
      name: '',
      price: '',
      volume: '',
      tagline: '',
      description: '',
      image: ''
    });
    setShowAddModal(false);
  };

  const handleDeleteProduct = (indexToRemove: number) => {
    const remaining = activeProducts.filter((_, i) => i !== indexToRemove);
    const updatedBrand: BrandProfile = {
      ...brand,
      products: remaining.length > 0 ? remaining : [{ name: '', tagline: '', description: '', volume: '', price: '', image: '' }]
    };

    if (onUpdateBrand) {
      onUpdateBrand(updatedBrand);
    } else {
      try {
        localStorage.setItem('drobe_brand_profile_v1', JSON.stringify(updatedBrand));
      } catch {}
    }
  };

  return (
    <div className={styles.darkProfileContainer}>
      {/* 1. Header with Brand Emblem & Actions */}
      <header className={styles.darkProfileHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {brand.profileImage ? (
            <img
              src={brand.profileImage}
              alt={brand.name}
              className={styles.darkHeaderAvatar}
            />
          ) : (
            <div className={styles.darkHeaderAvatarFallback}>
              {brand.name ? brand.name.slice(0, 1).toUpperCase() : 'D'}
            </div>
          )}
          <div>
            <div className={styles.darkHeaderGreeting}>
              Hello, {brand.founderName ? brand.founderName.split(' ')[0] : (brand.name || 'Partner')}
            </div>
            <div className={styles.darkHeaderSub}>
              Live on Drobe · {brand.basedOutOf || 'Global Atelier'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {onShareClick && (
            <button
              type="button"
              onClick={onShareClick}
              className={styles.darkCircleBtn}
              title="Share Live Store Link"
            >
              <Share2 size={15} />
            </button>
          )}

          <button
            type="button"
            onClick={onEditClick}
            className={styles.darkCircleBtn}
            title="Edit Brand Dossier"
          >
            <Edit3 size={15} />
          </button>
        </div>
      </header>

      {/* 2. Scrollable Body Content */}
      <div className={styles.darkScrollContent}>
        {/* Hero Atelier Card */}
        <div className={styles.darkHeroCard}>
          <div style={{ flex: 1 }}>
            <span className={styles.darkHeroTag}>
              {brand.category || 'BRAND ATELIER'}
            </span>
            <h2 className={styles.darkHeroTitle}>
              {brand.name || 'Untitled Brand'}
            </h2>
            <p className={styles.darkHeroSub}>
              {brand.tagline || 'Conscious luxury and artisanal craftsmanship.'}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
              <div className={styles.darkLiveBadge}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#059669' }} />
                <span>Live in Store</span>
              </div>
              <span className={styles.darkProductCountBadge}>
                {totalProductsCount} {totalProductsCount === 1 ? 'Product' : 'Products'}
              </span>
            </div>
          </div>

          {brand.coverImage && (
            <img
              src={brand.coverImage}
              alt={brand.name}
              className={styles.darkHeroThumb}
            />
          )}
        </div>

        {/* View Switcher Pills */}
        <div className={styles.darkPillsRow}>
          <div
            className={`${styles.darkDayPill} ${activeTab === 'catalog' ? styles.darkDayPillActive : ''}`}
            onClick={() => setActiveTab('catalog')}
          >
            <span>Offerings</span>
            <span style={{ fontSize: '14px', fontWeight: 700 }}>{totalProductsCount}</span>
          </div>

          <div
            className={`${styles.darkDayPill} ${activeTab === 'atelier' ? styles.darkDayPillActive : ''}`}
            onClick={() => setActiveTab('atelier')}
          >
            <span>Atelier</span>
            <span style={{ fontSize: '13px', fontWeight: 600 }}>
              {brand.establishedYear || 'EST'}
            </span>
          </div>

          <div
            className={`${styles.darkDayPill} ${activeTab === 'channels' ? styles.darkDayPillActive : ''}`}
            onClick={() => setActiveTab('channels')}
          >
            <span>Channels</span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#059669' }}>
              LIVE
            </span>
          </div>
        </div>

        {/* TAB 1: Product Catalog */}
        {activeTab === 'catalog' && (
          <div>
            <div className={styles.darkSectionHeaderRow}>
              <h3 className={styles.darkSectionTitle}>
                Your Collection ({totalProductsCount})
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className={styles.darkAddBtn}
              >
                <Plus size={13} />
                <span>Add Product</span>
              </button>
            </div>

            {totalProductsCount === 0 ? (
              <div 
                className={styles.darkCardBox} 
                onClick={() => setShowAddModal(true)} 
                style={{ cursor: 'pointer', textAlign: 'center', padding: '32px 18px', border: '1px dashed #cbd5e1', backgroundColor: '#f8fafc' }}
              >
                <span className={styles.darkCardTag}>Empty Catalog</span>
                <h4 className={styles.darkCardTitle}>No products listed yet</h4>
                <p className={styles.darkCardDesc} style={{ margin: '6px 0 14px 0', color: '#64748b' }}>
                  Tap below to list your first signature creation on your Drobe profile.
                </p>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>
                  <Plus size={14} /> Add First Product
                </span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {activeProducts.map((prod, idx) => {
                  const displayPrice = prod.price 
                    ? (prod.price.trim().startsWith('$') ? prod.price.trim() : `$${prod.price.trim()}`)
                    : 'Price upon request';

                  return (
                    <div key={idx} className={styles.darkCardBox} style={{ position: 'relative' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span className={styles.darkCardTag}>
                          {prod.volume || `Offering 0${idx + 1}`}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span className={styles.darkCardPrice}>
                            {displayPrice}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(idx)}
                            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2px' }}
                            title="Delete product"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '12px' }}>
                        {prod.image && (
                          <img
                            src={prod.image}
                            alt={prod.name}
                            style={{ width: '64px', height: '64px', borderRadius: '12px', objectFit: 'cover', flexShrink: 0, border: '1px solid #e2e8f0' }}
                          />
                        )}

                        <div style={{ flex: 1 }}>
                          <h4 className={styles.darkCardTitle}>
                            {prod.name}
                          </h4>
                          {prod.tagline && (
                            <div className={styles.darkCardSub}>
                              {prod.tagline}
                            </div>
                          )}
                          {prod.description && (
                            <p className={styles.darkCardDesc}>
                              {prod.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Atelier Story & Ethos */}
        {activeTab === 'atelier' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className={styles.darkCardBox}>
              <span className={styles.darkCardTag}>Atelier Philosophy</span>
              <h4 className={styles.darkCardTitle}>Heritage & Craftsmanship</h4>
              <p className={styles.darkCardDesc} style={{ display: 'block', WebkitLineClamp: 'unset' }}>
                {brand.about || 'Crafted with uncompromising dedication to intentional luxury, ethical sourcing, and timeless beauty.'}
              </p>
            </div>

            {brand.founderQuote && (
              <div className={styles.darkEthosCard}>
                <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#0284c7', marginBottom: '6px' }}>
                  FOUNDER STATEMENT
                </div>
                <p style={{ fontSize: '13px', fontStyle: 'italic', color: '#334155', lineHeight: 1.5, margin: '0 0 8px 0' }}>
                  &ldquo;{brand.founderQuote}&rdquo;
                </p>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#0f172a' }}>
                  — {brand.founderName || 'Founder'}, {brand.founderRole || 'Creative Director'}
                </div>
              </div>
            )}

            <div className={styles.darkCardBox}>
              <span className={styles.darkCardTag}>Origin</span>
              <h4 className={styles.darkCardTitle}>{brand.basedOutOf || 'Global Atelier'}</h4>
              <p className={styles.darkCardDesc}>
                Established {brand.establishedYear || '2024'} · Verified Drobe Luxury Atelier
              </p>
            </div>
          </div>
        )}

        {/* TAB 3: Channels */}
        {activeTab === 'channels' && (
          <div className={styles.darkCardBox}>
            <span className={styles.darkCardTag}>Verified Channels</span>
            <h4 className={styles.darkCardTitle}>Official Touchpoints</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
              {brand.website && (
                <a
                  href={brand.website.startsWith('http') ? brand.website : `https://${brand.website}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#0f172a', textDecoration: 'none', padding: '12px 14px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px' }}
                >
                  <Globe size={16} color="#0284c7" />
                  <span style={{ fontSize: '12px', fontWeight: 500 }}>{brand.website}</span>
                </a>
              )}

              {brand.instagram && (
                <a
                  href={`https://instagram.com/${brand.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#0f172a', textDecoration: 'none', padding: '12px 14px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px' }}
                >
                  <InstagramIcon size={16} color="#ec4899" />
                  <span style={{ fontSize: '12px', fontWeight: 500 }}>{brand.instagram}</span>
                </a>
              )}

              {brand.inquiriesEmail && (
                <a
                  href={`mailto:${brand.inquiriesEmail}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#0f172a', textDecoration: 'none', padding: '12px 14px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px' }}
                >
                  <Mail size={16} color="#059669" />
                  <span style={{ fontSize: '12px', fontWeight: 500 }}>{brand.inquiriesEmail}</span>
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 3. Floating Bottom Navigation Bar */}
      <div className={styles.darkFloatingNav}>
        <button
          type="button"
          onClick={() => setActiveTab('catalog')}
          className={`${styles.darkNavTab} ${activeTab === 'catalog' ? styles.darkNavTabActive : ''}`}
          title="Collection"
        >
          <Home size={18} />
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('atelier')}
          className={`${styles.darkNavTab} ${activeTab === 'atelier' ? styles.darkNavTabActive : ''}`}
          title="Atelier Story"
        >
          <LayoutGrid size={18} />
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('channels')}
          className={`${styles.darkNavTab} ${activeTab === 'channels' ? styles.darkNavTabActive : ''}`}
          title="Channels"
        >
          <BarChart2 size={18} />
        </button>

        <button
          type="button"
          onClick={onEditClick}
          className={styles.darkNavTab}
          title="Edit Brand"
        >
          <User size={18} />
        </button>
      </div>

      {/* 4. Add Product Modal (Clean White Theme) */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(3px)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: '440px', backgroundColor: '#ffffff', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', padding: '22px 20px 32px 20px', border: '1px solid #e2e8f0', boxShadow: '0 -10px 40px rgba(15, 23, 42, 0.12)', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#0284c7', fontWeight: 700 }}>
                  CATALOG MANAGER
                </span>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a', margin: '2px 0 0 0' }}>
                  Add Product
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveNewProduct}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '11px', color: '#475569', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Product Name *
                </label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="e.g. Sculpted Wool Overcoat"
                  required
                  style={{ width: '100%', padding: '10px 12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#0f172a', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: '#475569', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    Price
                  </label>
                  <input
                    type="text"
                    value={newProduct.price || ''}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    placeholder="e.g. $420"
                    style={{ width: '100%', padding: '10px 12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#0f172a', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: '#475569', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    Sizing / Volume
                  </label>
                  <input
                    type="text"
                    value={newProduct.volume || ''}
                    onChange={(e) => setNewProduct({ ...newProduct, volume: e.target.value })}
                    placeholder="e.g. S / M / L or 50 ml"
                    style={{ width: '100%', padding: '10px 12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#0f172a', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '11px', color: '#475569', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Tagline / Brief Summary
                </label>
                <input
                  type="text"
                  value={newProduct.tagline}
                  onChange={(e) => setNewProduct({ ...newProduct, tagline: e.target.value })}
                  placeholder="e.g. Double-faced virgin wool with horn buttons"
                  style={{ width: '100%', padding: '10px 12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#0f172a', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '11px', color: '#475569', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Description & Materials
                </label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  placeholder="Craftsmanship, composition, and care details..."
                  style={{ width: '100%', padding: '10px 12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#0f172a', fontSize: '13px', outline: 'none', minHeight: '64px', boxSizing: 'border-box' }}
                />
              </div>

              {/* Photo Upload */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ fontSize: '11px', color: '#475569', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Product Photo
                </label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  {newProduct.image ? (
                    <div style={{ position: 'relative' }}>
                      <img
                        src={newProduct.image}
                        alt="Preview"
                        style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover', border: '1px solid #e2e8f0' }}
                      />
                      <button
                        type="button"
                        onClick={() => setNewProduct({ ...newProduct, image: '' })}
                        style={{ position: 'absolute', top: '-4px', right: '-4px', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#ef4444', color: '#ffffff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ) : null}

                  <label style={{ padding: '8px 14px', backgroundColor: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Upload size={13} />
                    {newProduct.image ? 'Change Photo' : 'Upload Photo'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ flex: 1, padding: '12px', borderRadius: '12px', backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', color: '#0f172a', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ flex: 1, padding: '12px', borderRadius: '12px', backgroundColor: '#0f172a', border: 'none', color: '#ffffff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Save to Collection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
