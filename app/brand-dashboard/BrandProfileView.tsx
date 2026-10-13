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
  Share2
} from 'lucide-react';
import { BrandProfile } from './types';
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
}

export default function BrandProfileView({
  brand,
  onEditClick,
  onShareClick
}: BrandProfileViewProps) {
  const [activeTab, setActiveTab] = useState<'catalog' | 'atelier' | 'channels'>('catalog');
  const activeProducts = brand.products.filter(p => p.name?.trim().length > 0);
  const totalProductsCount = activeProducts.length;

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
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#72ea24' }} />
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
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#72ea24' }}>
              LIVE
            </span>
          </div>
        </div>

        {/* TAB 1: Real Product Catalog */}
        {activeTab === 'catalog' && (
          <div>
            <div className={styles.darkSectionHeaderRow}>
              <h3 className={styles.darkSectionTitle}>
                Your Collection ({totalProductsCount})
              </h3>
              <button
                type="button"
                onClick={onEditClick}
                className={styles.darkAddBtn}
              >
                <Plus size={13} />
                <span>Add Product</span>
              </button>
            </div>

            {totalProductsCount === 0 ? (
              <div className={styles.darkCardBox} onClick={onEditClick} style={{ cursor: 'pointer', textAlign: 'center', padding: '28px 16px' }}>
                <span className={styles.darkCardTag}>Empty Catalog</span>
                <h4 className={styles.darkCardTitle}>No products listed yet</h4>
                <p className={styles.darkCardDesc}>Tap to add your first signature creation.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {activeProducts.map((prod, idx) => {
                  const displayPrice = prod.price 
                    ? (prod.price.trim().startsWith('$') ? prod.price.trim() : `$${prod.price.trim()}`)
                    : 'Price upon request';

                  return (
                    <div key={idx} className={styles.darkCardBox}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span className={styles.darkCardTag}>
                          {prod.volume || `Offering 0${idx + 1}`}
                        </span>
                        <span className={styles.darkCardPrice}>
                          {displayPrice}
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '12px' }}>
                        {prod.image && (
                          <img
                            src={prod.image}
                            alt={prod.name}
                            style={{ width: '64px', height: '64px', borderRadius: '12px', objectFit: 'cover', flexShrink: 0, border: '1px solid #27272a' }}
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
                <div style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#72ea24', marginBottom: '6px' }}>
                  FOUNDER STATEMENT
                </div>
                <p style={{ fontSize: '13px', fontStyle: 'italic', color: '#e4e4e7', lineHeight: 1.5, margin: '0 0 8px 0' }}>
                  &ldquo;{brand.founderQuote}&rdquo;
                </p>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#ffffff' }}>
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
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ffffff', textDecoration: 'none', padding: '10px', backgroundColor: '#18181b', borderRadius: '12px' }}
                >
                  <Globe size={16} color="#0284c7" />
                  <span style={{ fontSize: '12px' }}>{brand.website}</span>
                </a>
              )}

              {brand.instagram && (
                <a
                  href={`https://instagram.com/${brand.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ffffff', textDecoration: 'none', padding: '10px', backgroundColor: '#18181b', borderRadius: '12px' }}
                >
                  <InstagramIcon size={16} color="#ec4899" />
                  <span style={{ fontSize: '12px' }}>{brand.instagram}</span>
                </a>
              )}

              {brand.inquiriesEmail && (
                <a
                  href={`mailto:${brand.inquiriesEmail}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ffffff', textDecoration: 'none', padding: '10px', backgroundColor: '#18181b', borderRadius: '12px' }}
                >
                  <Mail size={16} color="#10b981" />
                  <span style={{ fontSize: '12px' }}>{brand.inquiriesEmail}</span>
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
    </div>
  );
}
