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
  Edit3
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
  const [activeTab, setActiveTab] = useState<'catalog' | 'atelier' | 'founder' | 'channels'>('catalog');
  const activeProducts = brand.products.filter(p => p.name.trim().length > 0);
  const totalProductsCount = activeProducts.length;

  return (
    <div className={styles.darkProfileContainer}>
      {/* 1. Sleek Header (Founder Avatar + Greeting + Edit Button) */}
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
              Live on Drobe · {brand.basedOutOf || 'Studio Atelier'}
            </div>
          </div>
        </div>

        {/* Circular Action Button */}
        <button
          type="button"
          onClick={onEditClick}
          className={styles.darkCircleBtn}
          title="Edit Brand Dossier"
        >
          <Edit3 size={16} />
        </button>
      </header>

      {/* 2. Scrollable Content Body */}
      <div className={styles.darkScrollContent}>
        {/* Hero Atelier Card */}
        <div className={styles.darkHeroCard}>
          <div style={{ flex: 1 }}>
            <span className={styles.darkHeroTag}>
              BRAND ATELIER
            </span>
            <h2 className={styles.darkHeroTitle}>
              {brand.name || 'Untitled Brand'}
            </h2>
            <p className={styles.darkHeroSub}>
              {brand.tagline || 'Conscious luxury and mindful botanical rituals.'}
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

        {/* Quick Filter Pills Row (Apple Day Pills Style) */}
        <div className={styles.darkPillsRow}>
          <div
            className={`${styles.darkDayPill} ${activeTab === 'catalog' ? styles.darkDayPillActive : ''}`}
            onClick={() => setActiveTab('catalog')}
          >
            <span>Offerings</span>
            <span style={{ fontSize: '14px', fontWeight: 900 }}>{totalProductsCount}</span>
          </div>

          <div
            className={`${styles.darkDayPill} ${activeTab === 'atelier' ? styles.darkDayPillActive : ''}`}
            onClick={() => setActiveTab('atelier')}
          >
            <span>Atelier</span>
            <span style={{ fontSize: '13px', fontWeight: 800 }}>
              {brand.basedOutOf ? brand.basedOutOf.split(',')[0].slice(0, 3).toUpperCase() : 'HQ'}
            </span>
          </div>

          <div
            className={`${styles.darkDayPill} ${activeTab === 'founder' ? styles.darkDayPillActive : ''}`}
            onClick={() => setActiveTab('founder')}
          >
            <span>Founder</span>
            <span style={{ fontSize: '13px', fontWeight: 800 }}>
              {brand.founderName ? brand.founderName.split(' ')[0].slice(0, 3).toUpperCase() : 'YOU'}
            </span>
          </div>

          <div
            className={`${styles.darkDayPill} ${activeTab === 'channels' ? styles.darkDayPillActive : ''}`}
            onClick={() => setActiveTab('channels')}
          >
            <span>Status</span>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#72ea24' }}>
              LIVE
            </span>
          </div>
        </div>

        {/* "Your Collection" Section */}
        <div className={styles.darkSectionHeaderRow}>
          <h3 className={styles.darkSectionTitle}>
            Your collection
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

        {/* 2-Column Product Grid */}
        <div className={styles.darkCardsGrid}>
          {/* Card 1: Primary Offering */}
          {activeProducts[0] ? (
            <div className={styles.darkCardBox}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span className={styles.darkCardTag}>
                  {activeProducts[0].volume || 'Featured'}
                </span>
                <span className={styles.darkCardPrice}>
                  $98
                </span>
              </div>
              <h4 className={styles.darkCardTitle}>
                {activeProducts[0].name}
              </h4>
              <div className={styles.darkCardSub}>
                {activeProducts[0].tagline}
              </div>
              <p className={styles.darkCardDesc}>
                {activeProducts[0].description}
              </p>

              {brand.founderName && (
                <div className={styles.darkCardAuthor}>
                  {brand.profileImage ? (
                    <img
                      src={brand.profileImage}
                      alt=""
                      style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                  ) : null}
                  <div style={{ fontSize: '10px', color: '#a1a1aa' }}>
                    <span style={{ fontWeight: 700, color: '#ffffff' }}>{brand.founderName.split(' ')[0]}</span>
                    {' · Formulator'}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.darkCardBox} onClick={onEditClick} style={{ cursor: 'pointer' }}>
              <span className={styles.darkCardTag}>Offering 01</span>
              <h4 className={styles.darkCardTitle}>First Product</h4>
              <p className={styles.darkCardDesc}>Tap to add your hero item formulation.</p>
            </div>
          )}

          {/* Right Column: Card 2 (Top) + Card 3 (Bottom) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Card 2: Secondary Offering */}
            {activeProducts[1] ? (
              <div className={styles.darkCardBox}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span className={styles.darkCardTag}>
                    {activeProducts[1].volume || 'Active'}
                  </span>
                  <span className={styles.darkCardPrice}>
                    $74
                  </span>
                </div>
                <h4 className={styles.darkCardTitle}>
                  {activeProducts[1].name}
                </h4>
                <div className={styles.darkCardSub}>
                  {activeProducts[1].tagline}
                </div>
                <p className={styles.darkCardDesc}>
                  {activeProducts[1].description}
                </p>
              </div>
            ) : (
              <div className={styles.darkCardBox} onClick={onEditClick} style={{ cursor: 'pointer' }}>
                <span className={styles.darkCardTag}>Offering 02</span>
                <h4 className={styles.darkCardTitle}>Second Product</h4>
                <p className={styles.darkCardDesc}>Tap to add another item.</p>
              </div>
            )}

            {/* Card 3: Direct Channels */}
            <div className={styles.darkCardBox}>
              <div style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#72ea24' }}>
                Direct Channels
              </div>
              <div className={styles.darkCardChannels}>
                {brand.instagram && (
                  <a
                    href={`https://instagram.com/${brand.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.darkChannelCircle}
                    title="Instagram"
                  >
                    <InstagramIcon size={14} color="#ffffff" />
                  </a>
                )}
                {brand.website && (
                  <a
                    href={brand.website}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.darkChannelCircle}
                    title="Website"
                  >
                    <Globe size={14} color="#ffffff" />
                  </a>
                )}
                {brand.inquiriesEmail && (
                  <a
                    href={`mailto:${brand.inquiriesEmail}`}
                    className={styles.darkChannelCircle}
                    title="Email"
                  >
                    <Mail size={14} color="#ffffff" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Third Offering (Full Width) */}
        {activeProducts[2] && (
          <div className={styles.darkCardBox} style={{ marginTop: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span className={styles.darkCardTag}>
                Offering 03 · {activeProducts[2].volume}
              </span>
              <span className={styles.darkCardPrice}>
                $86
              </span>
            </div>
            <h4 className={styles.darkCardTitle}>
              {activeProducts[2].name}
            </h4>
            <div className={styles.darkCardSub}>
              {activeProducts[2].tagline}
            </div>
            <p className={styles.darkCardDesc}>
              {activeProducts[2].description}
            </p>
          </div>
        )}

        {/* Founder Ethos Card */}
        {brand.founderQuote && (
          <div className={styles.darkEthosCard}>
            <div style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#72ea24', marginBottom: '6px' }}>
              FOUNDER ETHOS
            </div>
            <p style={{ fontSize: '12px', fontStyle: 'italic', color: '#d4d4d8', lineHeight: 1.5, margin: '0 0 6px 0' }}>
              &ldquo;{brand.founderQuote}&rdquo;
            </p>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#ffffff' }}>
              — {brand.founderName || 'Founder'}, {brand.founderRole || 'Formulator'}
            </div>
          </div>
        )}
      </div>

      {/* 3. Floating Sleek Bottom Navigation Pill */}
      <div className={styles.darkFloatingNav}>
        <button
          type="button"
          onClick={() => setActiveTab('catalog')}
          className={`${styles.darkNavTab} ${styles.darkNavTabActive}`}
        >
          <Home size={18} />
        </button>

        <button
          type="button"
          onClick={onEditClick}
          className={styles.darkNavTab}
        >
          <LayoutGrid size={18} />
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('channels')}
          className={styles.darkNavTab}
        >
          <BarChart2 size={18} />
        </button>

        <button
          type="button"
          onClick={onEditClick}
          className={styles.darkNavTab}
        >
          <User size={18} />
        </button>
      </div>
    </div>
  );
}
