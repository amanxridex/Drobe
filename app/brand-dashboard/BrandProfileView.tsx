'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Home, 
  LayoutGrid, 
  BarChart2, 
  User, 
  Globe, 
  Mail, 
  Plus, 
  Edit3, 
  ExternalLink
} from 'lucide-react';
import IPhoneStatusBar from './IPhoneStatusBar';
import { BrandProfile } from './types';
import styles from './brand-dashboard.module.css';

const InstagramIcon = ({ size = 14, color = "#9d174d" }: { size?: number; color?: string }) => (
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
    <div className={styles.mobileContainer} style={{ backgroundColor: '#ffffff', position: 'relative' }}>
      {/* 1. iOS Status Bar with Dynamic Island */}
      <IPhoneStatusBar />

      {/* 2. Top Header (Image 1 Sandra Style) */}
      <header className={styles.ronasHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {brand.profileImage ? (
            <img
              src={brand.profileImage}
              alt={brand.name}
              className={styles.ronasHeaderAvatar}
            />
          ) : (
            <div className={styles.ronasHeaderAvatarFallback}>
              {brand.name ? brand.name.slice(0, 1).toUpperCase() : 'B'}
            </div>
          )}
          <div>
            <div className={styles.ronasHeaderGreeting}>
              Hello, {brand.founderName ? brand.founderName.split(' ')[0] : (brand.name || 'Partner')}
            </div>
            <div className={styles.ronasHeaderDate}>
              Live on Drobe · {brand.basedOutOf || 'Studio'}
            </div>
          </div>
        </div>

        {/* Circular Action Button */}
        <button
          type="button"
          onClick={onEditClick}
          className={styles.ronasCircleBtn}
          title="Edit Profile"
        >
          <Edit3 size={17} color="#0f172a" />
        </button>
      </header>

      {/* 3. Scrollable Screen Body */}
      <div className={styles.ronasScrollContent}>
        {/* Hero Banner Card (Image 1 "Daily challenge" Style) */}
        <div className={styles.ronasHeroChallengeCard}>
          <div style={{ flex: 1, zIndex: 2 }}>
            <span className={styles.ronasHeroCategoryTag}>
              BRAND ATELIER
            </span>
            <h2 className={styles.ronasHeroTitle}>
              {brand.name || 'Untitled Brand'}
            </h2>
            <p className={styles.ronasHeroSub}>
              {brand.tagline || 'Conscious luxury & mindful botanical rituals'}
            </p>

            {/* Avatar Group + Total Count */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
              <div className={styles.ronasAvatarGroup}>
                <span className={styles.livePulseDot} />
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#065f46' }}>
                  Live in Store
                </span>
              </div>
              <span className={styles.ronasProductCountBadge}>
                {totalProductsCount} {totalProductsCount === 1 ? 'Product' : 'Products'}
              </span>
            </div>
          </div>

          {/* 3D Visual Preview (Cover Banner Miniature / Graphic) */}
          <div className={styles.ronasHeroRightGraphic}>
            {brand.coverImage ? (
              <img
                src={brand.coverImage}
                alt="Banner thumb"
                className={styles.ronasHeroCoverImg}
              />
            ) : (
              <div className={styles.ronas3DShapeStack}>
                <div className={styles.shapeRing} />
                <div className={styles.shapeCube} />
              </div>
            )}
          </div>
        </div>

        {/* Horizontal Calendar-style Pill Bar (Image 1 Days Pill Bar) */}
        <div className={styles.ronasPillBar}>
          <button
            type="button"
            onClick={() => setActiveTab('catalog')}
            className={`${styles.ronasDayPill} ${activeTab === 'catalog' ? styles.ronasDayPillActive : ''}`}
          >
            <span className={styles.pillLabelSmall}>Offerings</span>
            <span className={styles.pillValueBig}>{totalProductsCount}</span>
            {activeTab === 'catalog' && <span className={styles.pillActiveDot} />}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('atelier')}
            className={`${styles.ronasDayPill} ${activeTab === 'atelier' ? styles.ronasDayPillActive : ''}`}
          >
            <span className={styles.pillLabelSmall}>Atelier</span>
            <span className={styles.pillValueBig}>{brand.basedOutOf ? brand.basedOutOf.slice(0, 3).toUpperCase() : 'HQ'}</span>
            {activeTab === 'atelier' && <span className={styles.pillActiveDot} />}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('founder')}
            className={`${styles.ronasDayPill} ${activeTab === 'founder' ? styles.ronasDayPillActive : ''}`}
          >
            <span className={styles.pillLabelSmall}>Founder</span>
            <span className={styles.pillValueBig}>{brand.founderName ? brand.founderName.slice(0, 3).toUpperCase() : 'DIR'}</span>
            {activeTab === 'founder' && <span className={styles.pillActiveDot} />}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('channels')}
            className={`${styles.ronasDayPill} ${activeTab === 'channels' ? styles.ronasDayPillActive : ''}`}
          >
            <span className={styles.pillLabelSmall}>Status</span>
            <span className={styles.pillValueBig}>LIVE</span>
            {activeTab === 'channels' && <span className={styles.pillActiveDot} />}
          </button>
        </div>

        {/* Section: "Your plan" / "Your Collection" (Image 1 Style) */}
        <div className={styles.ronasPlanSection}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 className={styles.ronasSectionHeading}>Your collection</h3>
            <button
              type="button"
              onClick={onEditClick}
              className={styles.ronasAddPillBtn}
            >
              <Plus size={13} />
              Add Product
            </button>
          </div>

          {/* Grid of Pastel Cards (Image 1 Yoga / Balance style!) */}
          <div className={styles.ronasCardsGrid}>
            {/* Card 1: Warm Amber / Yellow Card */}
            {activeProducts[0] ? (
              <div className={styles.ronasCardYellow}>
                <span className={styles.ronasCardTagYellow}>
                  {activeProducts[0].volume || 'Hero'}
                </span>
                <h4 className={styles.ronasCardTitle}>
                  {activeProducts[0].name}
                </h4>
                <div className={styles.ronasCardMeta}>
                  {activeProducts[0].tagline || 'Botanical formulation'}
                </div>
                <p className={styles.ronasCardDesc}>
                  {activeProducts[0].description}
                </p>

                {brand.founderName && (
                  <div className={styles.ronasCardAuthorRow}>
                    {brand.profileImage ? (
                      <img src={brand.profileImage} alt="Author" className={styles.ronasAuthorAvatar} />
                    ) : (
                      <div className={styles.ronasAuthorAvatarFallback}>F</div>
                    )}
                    <div>
                      <div style={{ fontSize: '9px', color: '#78350f', textTransform: 'uppercase', fontWeight: 700 }}>Formulator</div>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#451a03' }}>{brand.founderName}</div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.ronasCardYellow} onClick={onEditClick}>
                <span className={styles.ronasCardTagYellow}>Catalog</span>
                <h4 className={styles.ronasCardTitle}>Add First Product</h4>
                <p className={styles.ronasCardDesc}>List your signature formulation here.</p>
              </div>
            )}

            {/* Right Column Stack */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Card 2: Soft Sky Blue Card */}
              {activeProducts[1] ? (
                <div className={styles.ronasCardBlue}>
                  <span className={styles.ronasCardTagBlue}>
                    {activeProducts[1].volume || 'Active'}
                  </span>
                  <h4 className={styles.ronasCardTitle}>
                    {activeProducts[1].name}
                  </h4>
                  <div className={styles.ronasCardMeta}>
                    {activeProducts[1].tagline}
                  </div>
                  <p className={styles.ronasCardDesc}>
                    {activeProducts[1].description}
                  </p>
                </div>
              ) : (
                <div className={styles.ronasCardBlue} onClick={onEditClick}>
                  <span className={styles.ronasCardTagBlue}>Offering 02</span>
                  <h4 className={styles.ronasCardTitle}>Second Product</h4>
                  <p className={styles.ronasCardDesc}>Tap to add another item.</p>
                </div>
              )}

              {/* Card 3: Soft Pink Social Touchpoints Card (Exact match to Image 1's pink social card!) */}
              <div className={styles.ronasCardPink}>
                <div style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9d174d', marginBottom: '6px' }}>
                  Direct Channels
                </div>
                <div className={styles.ronasSocialRow}>
                  {brand.instagram && (
                    <a
                      href={`https://instagram.com/${brand.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.ronasSocialCircle}
                      title="Instagram"
                    >
                      <InstagramIcon size={14} color="#9d174d" />
                    </a>
                  )}
                  {brand.website && (
                    <a
                      href={brand.website}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.ronasSocialCircle}
                      title="Website"
                    >
                      <Globe size={14} color="#9d174d" />
                    </a>
                  )}
                  {brand.inquiriesEmail && (
                    <a
                      href={`mailto:${brand.inquiriesEmail}`}
                      className={styles.ronasSocialCircle}
                      title="Email Concierge"
                    >
                      <Mail size={14} color="#9d174d" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Third Product Card (If exists, soft lavender) */}
          {activeProducts[2] && (
            <div className={styles.ronasCardLavender} style={{ marginTop: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span className={styles.ronasCardTagLavender}>Offering 03 · {activeProducts[2].volume}</span>
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#6b21a8' }}>Live</span>
              </div>
              <h4 className={styles.ronasCardTitle} style={{ color: '#3b0764' }}>
                {activeProducts[2].name}
              </h4>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#7e22ce', marginBottom: '4px' }}>
                {activeProducts[2].tagline}
              </div>
              <p className={styles.ronasCardDesc} style={{ color: '#581c87', margin: 0 }}>
                {activeProducts[2].description}
              </p>
            </div>
          )}
        </div>

        {/* Founder Quote Card */}
        {brand.founderQuote && (
          <div className={styles.ronasQuoteCard}>
            <div style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#0284c7', marginBottom: '4px' }}>
              FOUNDER ETHOS
            </div>
            <p className={styles.ronasQuoteText}>
              &ldquo;{brand.founderQuote}&rdquo;
            </p>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#0f172a' }}>
              — {brand.founderName || 'Founder'}, {brand.founderRole || 'Formulator'}
            </div>
          </div>
        )}
      </div>

      {/* 4. Floating Dark Bottom Navigation Bar (Image 1 Style) */}
      <div className={styles.ronasFloatingBottomNav}>
        <button
          type="button"
          onClick={() => setActiveTab('catalog')}
          className={`${styles.ronasNavTab} ${styles.ronasNavTabActive}`}
        >
          <Home size={18} color="#0f172a" />
        </button>

        <button
          type="button"
          onClick={onEditClick}
          className={styles.ronasNavTab}
        >
          <LayoutGrid size={18} color="#94a3b8" />
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('channels')}
          className={styles.ronasNavTab}
        >
          <BarChart2 size={18} color="#94a3b8" />
        </button>

        <button
          type="button"
          onClick={onEditClick}
          className={styles.ronasNavTab}
        >
          <User size={18} color="#94a3b8" />
        </button>
      </div>
    </div>
  );
}
