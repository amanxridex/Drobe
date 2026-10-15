'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import LookbookCarousel, { LookbookItem } from '@/components/LookbookCarousel';
import INITIAL_LOOKBOOK_BANNERS from '@/data/lookbook_banners.json';
import DiscoverBrandsEditor from '@/components/admin/DiscoverBrandsEditor';

// Curated list of top in-app brands with direct deep-links
const CURATED_BRANDS = {
  men: [
    { name: 'Banana Club', deeplink: '/collections/home_discover_brand_Banana Club_men' },
    { name: 'Bonkers Corner', deeplink: '/collections/homepage-brand-banner-carousel-Bonkers-Corner-men' },
    { name: 'Snitch', deeplink: '/collections/home_discover_brand_Snitch_men' },
    { name: 'The Indian Garage Co', deeplink: '/collections/home_discover_brand_The Indian Garage Co_men' },
    { name: 'Bear House', deeplink: '/collections/home_discover_brand_The Bear House_men' },
    { name: 'Powerlook', deeplink: '/collections/home_discover_brand_Powerlook_men' },
    { name: 'F/KN Casanova', deeplink: '/collections/home_discover_brand_FKN Casanova_men' },
    { name: 'On3Mile', deeplink: '/collections/home_discover_brand_On3Mile_men' },
    { name: 'Bewakoof', deeplink: '/collections/homepage-bbc-Bewakoof-men' },
    { name: 'The Souled Store', deeplink: '/collections/homepage-bbc-TheSouledStore-men' },
    { name: 'Foul Child', deeplink: '/collections/home_banner_carousel_Foul_Child_men' },
    { name: 'Salty Alpha', deeplink: '/collections/home-banner-carousel-SaltyAlpha-men' }
  ],
  women: [
    { name: 'Pink Fort', deeplink: '/collections/brand_pink_fort_women' },
    { name: 'Chkokko', deeplink: '/collections/brand_chkokko_women' },
    { name: 'The Souled Store', deeplink: '/collections/brand_souled_store_women' },
    { name: 'Desi Baddie', deeplink: '/collections/brand_desi_baddie_women' },
    { name: 'Dandiya Drops', deeplink: '/collection/ethnic' },
    { name: 'Nee (नी)', deeplink: '/collections/brand_nee_women' },
    { name: 'Tequila', deeplink: '/collection/dresses' },
    { name: 'Tilt Bamboo', deeplink: '/collection/bottom' }
  ]
};

const CATEGORY_LINKS = [
  { label: 'Ethnic Wear', path: '/collection/ethnic' },
  { label: 'Dresses', path: '/collection/dresses' },
  { label: 'Bottom Wear', path: '/collection/bottom' },
  { label: 'Top Wear', path: '/collection/top' },
  { label: 'Footwear', path: '/collection/footwear' },
  { label: 'Accessories', path: '/collection/accessories' }
];

export default function PlatformChangesPage() {
  const [studioTab, setStudioTab] = useState<'discover-brands' | 'lookbook-banners'>('discover-brands');
  const [activeGender, setActiveGender] = useState<'men' | 'women'>('men');
  const [banners, setBanners] = useState<{ men: LookbookItem[]; women: LookbookItem[] }>(INITIAL_LOOKBOOK_BANNERS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Modal / Drawer state for adding or editing
  const [editingBanner, setEditingBanner] = useState<LookbookItem | null>(null);
  const [isNewBanner, setIsNewBanner] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch current live banners
  useEffect(() => {
    fetch('/api/banners')
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && data?.banners) {
          setBanners(data.banners);
        }
      })
      .catch((err) => console.error('Failed to load banners:', err))
      .finally(() => setLoading(false));
  }, []);

  const activeList = banners[activeGender] || [];

  // Re-order handlers
  const moveBanner = (idx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= activeList.length) return;

    const newList = [...activeList];
    const [moved] = newList.splice(idx, 1);
    newList.splice(targetIdx, 0, moved);

    setBanners((prev) => ({
      ...prev,
      [activeGender]: newList
    }));
  };

  // Delete banner
  const deleteBanner = (id: string) => {
    if (!confirm('Are you sure you want to remove this banner?')) return;
    setBanners((prev) => ({
      ...prev,
      [activeGender]: (prev[activeGender] || []).filter((b) => b.id !== id)
    }));
  };

  // Save current editing banner
  const saveBannerForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBanner) return;
    if (!editingBanner.title.trim() || !editingBanner.img.trim()) {
      alert('Please provide both a Title and an Image URL.');
      return;
    }

    setBanners((prev) => {
      const currentList = prev[activeGender] || [];
      let updatedList: LookbookItem[];

      if (isNewBanner) {
        updatedList = [editingBanner, ...currentList];
      } else {
        updatedList = currentList.map((b) => (b.id === editingBanner.id ? editingBanner : b));
      }

      return {
        ...prev,
        [activeGender]: updatedList
      };
    });

    setEditingBanner(null);
    setIsNewBanner(false);
  };

  // Handle direct file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingBanner) return;

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/banners/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if (data?.success && data?.url) {
        setEditingBanner((prev) => (prev ? { ...prev, img: data.url } : null));
      } else {
        alert(data?.error || 'Failed to upload image');
      }
    } catch (err: any) {
      alert(err?.message || 'Upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  // Save & publish all changes to backend
  const handlePublish = async () => {
    try {
      setSaving(true);
      setSaveStatus(null);
      const res = await fetch('/api/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(banners)
      });
      const data = await res.json();

      if (data?.success) {
        setSaveStatus('✅ Published successfully! Live app updated.');
        setTimeout(() => setSaveStatus(null), 4500);
      } else {
        setSaveStatus('❌ Error: ' + (data?.error || 'Failed to publish'));
      }
    } catch (err: any) {
      setSaveStatus('❌ Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Reset to default authentic banners
  const handleReset = () => {
    if (!confirm('Revert all top banners to default authentic Drobe catalog?')) return;
    setBanners(INITIAL_LOOKBOOK_BANNERS);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0c', color: '#f3f4f6', fontFamily: 'Satoshi, -apple-system, BlinkMacSystemFont, sans-serif' }}>
      {/* Top Navbar */}
      <header
        style={{
          borderBottom: '1px solid #1f2228',
          background: 'rgba(15, 17, 23, 0.95)',
          backdropFilter: 'blur(12px)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          padding: '14px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              background: 'linear-gradient(135deg, #6678FF, #ff5768)',
              padding: '6px 12px',
              borderRadius: 8,
              fontWeight: 900,
              fontSize: 13,
              letterSpacing: 0.5,
              color: '#fff'
            }}
          >
            DROBE OS
          </div>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: '#fff', letterSpacing: -0.3 }}>
              {studioTab === 'discover-brands' ? 'Discover Brands Studio (4x3 Grid)' : 'Top Card Lookbook Studio'}
            </h1>
            <p style={{ margin: 0, fontSize: 12, color: '#8b949e' }}>
              {studioTab === 'discover-brands'
                ? 'Manage brand tiles, ordering (Show First), categories & 1-click DB sync (/platform-changes)'
                : 'Hero lookbook banner management for Men & Women (/platform-changes)'}
            </p>
          </div>
        </div>

        {/* Studio Primary Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            background: '#12151e',
            padding: 4,
            borderRadius: 10,
            border: '1px solid #232838'
          }}
        >
          <button
            onClick={() => setStudioTab('discover-brands')}
            style={{
              padding: '7px 16px',
              borderRadius: 8,
              background: studioTab === 'discover-brands' ? 'linear-gradient(135deg, #10b981, #059669)' : 'transparent',
              color: studioTab === 'discover-brands' ? '#ffffff' : '#94a3b8',
              fontWeight: 800,
              fontSize: 13,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.15s ease'
            }}
          >
            <span>🏷️</span> Discover Brands (4x3 Grid)
          </button>
          <button
            onClick={() => setStudioTab('lookbook-banners')}
            style={{
              padding: '7px 16px',
              borderRadius: 8,
              background: studioTab === 'lookbook-banners' ? 'linear-gradient(135deg, #6678FF, #ff5768)' : 'transparent',
              color: studioTab === 'lookbook-banners' ? '#ffffff' : '#94a3b8',
              fontWeight: 800,
              fontSize: 13,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.15s ease'
            }}
          >
            <span>🖼️</span> Top Lookbook Banners
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {saveStatus && studioTab === 'lookbook-banners' && (
            <span style={{ fontSize: 13, fontWeight: 700, color: saveStatus.startsWith('✅') ? '#4ade80' : '#f87171' }}>
              {saveStatus}
            </span>
          )}

          <Link
            href="/"
            target="_blank"
            style={{
              textDecoration: 'none',
              padding: '8px 14px',
              borderRadius: 8,
              background: '#1a1d24',
              color: '#cbd5e1',
              fontSize: 13,
              fontWeight: 600,
              border: '1px solid #2a2e39',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <span>👁️</span> Live App
          </Link>

          {studioTab === 'lookbook-banners' && (
            <>
              <button
                onClick={handleReset}
                style={{
                  padding: '8px 14px',
                  borderRadius: 8,
                  background: '#1a1d24',
                  color: '#cbd5e1',
                  fontSize: 13,
                  fontWeight: 600,
                  border: '1px solid #2a2e39',
                  cursor: 'pointer'
                }}
              >
                Reset
              </button>

              <button
                onClick={handlePublish}
                disabled={saving}
                style={{
                  padding: '8px 20px',
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #6678FF, #00d2ff)',
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 800,
                  border: 'none',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 14px rgba(102, 120, 255, 0.4)',
                  transition: 'all 0.2s ease',
                  opacity: saving ? 0.7 : 1
                }}
              >
                {saving ? 'Publishing...' : '💾 Save & Publish'}
              </button>
            </>
          )}
        </div>
      </header>

      {/* Discover Brands Studio Tab */}
      {studioTab === 'discover-brands' ? (
        <DiscoverBrandsEditor />
      ) : (
        <>
          {/* Main Studio Body for Lookbook Banners */}
          <div style={{ display: 'flex', maxWidth: 1440, margin: '0 auto', padding: '24px', gap: 28, boxSizing: 'border-box' }}>
        {/* Left Column: Management & List */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Gender Selector Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#14171f',
              padding: 8,
              borderRadius: 12,
              border: '1px solid #222632',
              marginBottom: 20
            }}
          >
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setActiveGender('men')}
                style={{
                  padding: '10px 20px',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 800,
                  border: 'none',
                  cursor: 'pointer',
                  background: activeGender === 'men' ? '#38bdf8' : 'transparent',
                  color: activeGender === 'men' ? '#000' : '#94a3b8',
                  transition: 'all 0.2s'
                }}
              >
                👔 Men Lookbook ({banners.men?.length || 0})
              </button>

              <button
                onClick={() => setActiveGender('women')}
                style={{
                  padding: '10px 20px',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 800,
                  border: 'none',
                  cursor: 'pointer',
                  background: activeGender === 'women' ? '#ff5768' : 'transparent',
                  color: activeGender === 'women' ? '#fff' : '#94a3b8',
                  transition: 'all 0.2s'
                }}
              >
                👗 Women Lookbook ({banners.women?.length || 0})
              </button>
            </div>

            <button
              onClick={() => {
                setEditingBanner({
                  id: `banner-${Date.now()}`,
                  title: '',
                  img: '',
                  route: CURATED_BRANDS[activeGender][0]?.deeplink || '/categories'
                });
                setIsNewBanner(true);
              }}
              style={{
                padding: '10px 18px',
                borderRadius: 8,
                background: '#22c55e',
                color: '#fff',
                fontSize: 13,
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <span>+</span> Add New Banner
            </button>
          </div>

          {/* Cards List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {activeList.map((card, idx) => (
              <div
                key={card.id || idx}
                style={{
                  background: '#14171f',
                  border: '1px solid #222632',
                  borderRadius: 14,
                  padding: 14,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  transition: 'border 0.2s',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }}
              >
                {/* Order Index */}
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: '#1d222e',
                    color: '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: 13,
                    flexShrink: 0
                  }}
                >
                  #{idx + 1}
                </div>

                {/* Banner Thumbnail (3:4 ratio) */}
                <div
                  style={{
                    width: 64,
                    height: 86,
                    borderRadius: 10,
                    overflow: 'hidden',
                    background: '#202430',
                    flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
                  }}
                >
                  <img
                    src={card.img}
                    alt={card.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                {/* Info & Route */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#fff' }}>
                      {card.title || 'Untitled Banner'}
                    </h3>
                  </div>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      background: '#1a1f2c',
                      padding: '4px 10px',
                      borderRadius: 6,
                      border: '1px solid #2a3245',
                      fontSize: 12,
                      color: '#38bdf8',
                      fontFamily: 'monospace',
                      maxWidth: '100%',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <span>🔗</span> {card.route}
                  </div>
                </div>

                {/* Re-order & Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  <button
                    disabled={idx === 0}
                    onClick={() => moveBanner(idx, 'up')}
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 8,
                      border: '1px solid #282f40',
                      background: '#181d28',
                      color: idx === 0 ? '#475569' : '#e2e8f0',
                      cursor: idx === 0 ? 'not-allowed' : 'pointer',
                      fontSize: 14
                    }}
                    title="Move Up"
                  >
                    ▲
                  </button>

                  <button
                    disabled={idx === activeList.length - 1}
                    onClick={() => moveBanner(idx, 'down')}
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 8,
                      border: '1px solid #282f40',
                      background: '#181d28',
                      color: idx === activeList.length - 1 ? '#475569' : '#e2e8f0',
                      cursor: idx === activeList.length - 1 ? 'not-allowed' : 'pointer',
                      fontSize: 14
                    }}
                    title="Move Down"
                  >
                    ▼
                  </button>

                  <button
                    onClick={() => {
                      setEditingBanner({ ...card });
                      setIsNewBanner(false);
                    }}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 8,
                      border: '1px solid #38bdf8',
                      background: 'rgba(56, 189, 248, 0.12)',
                      color: '#38bdf8',
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: 12
                    }}
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => deleteBanner(card.id)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 8,
                      border: '1px solid #ef4444',
                      background: 'rgba(239, 68, 68, 0.12)',
                      color: '#ef4444',
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: 12
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}

            {activeList.length === 0 && (
              <div
                style={{
                  textAlign: 'center',
                  padding: '48px 20px',
                  background: '#14171f',
                  borderRadius: 14,
                  border: '1px dashed #282f40',
                  color: '#64748b'
                }}
              >
                No lookbook banners configured for {activeGender}. Click "+ Add New Banner" to add one!
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Mobile App Simulator */}
        <div style={{ width: 440, flexShrink: 0 }}>
          <div
            style={{
              position: 'sticky',
              top: 96,
              background: '#14171f',
              border: '1px solid #222632',
              borderRadius: 24,
              padding: 20,
              boxShadow: '0 20px 50px rgba(0,0,0,0.6)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>📱 Live Mobile Simulator</span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: 999,
                    background: activeGender === 'men' ? '#38bdf8' : '#ff5768',
                    color: activeGender === 'men' ? '#000' : '#fff'
                  }}
                >
                  {activeGender.toUpperCase()}
                </span>
              </div>
              <span style={{ fontSize: 11, color: '#64748b' }}>Interactive Gesture Preview</span>
            </div>

            {/* Simulated iPhone Frame */}
            <div
              style={{
                width: 390,
                margin: '0 auto',
                background: '#171717',
                borderRadius: 36,
                border: '6px solid #262b38',
                overflow: 'hidden',
                boxShadow: '0 16px 40px rgba(0,0,0,0.8)',
                position: 'relative'
              }}
            >
              {/* Fake Status Bar */}
              <div
                style={{
                  height: 32,
                  background: '#171717',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 20px',
                  fontSize: 11,
                  fontWeight: 800,
                  color: '#fff'
                }}
              >
                <span>9:41</span>
                <div style={{ width: 80, height: 16, background: '#000', borderRadius: 12 }} />
                <span>5G 100%</span>
              </div>

              {/* Header preview snippet */}
              <div style={{ padding: '8px 16px', borderBottom: '1px solid #242424', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: activeGender === 'men' ? '#38bdf8' : '#ff5768', fontWeight: 900, fontSize: 14 }}>
                  60 minutes
                </span>
                <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>Drobe Darkstore</span>
              </div>

              {/* The Real Interactive Lookbook Carousel */}
              <div style={{ padding: '12px 0 20px', background: '#171717' }}>
                <LookbookCarousel items={activeList} gender={activeGender} />
              </div>

              <div style={{ padding: '8px 16px 20px', textAlign: 'center' }}>
                <span style={{ fontSize: 11, color: '#64748b' }}>
                  👈 Swipe card left or right to test ultra-smooth slide 👉
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add / Edit Banner Drawer / Modal */}
      {editingBanner && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 580,
              background: '#14171f',
              border: '1px solid #282f40',
              borderRadius: 20,
              padding: 24,
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.7)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: '#fff' }}>
                {isNewBanner ? '➕ Add New Lookbook Banner' : '✏️ Edit Lookbook Banner'}
              </h2>
              <button
                onClick={() => setEditingBanner(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: 22,
                  cursor: 'pointer',
                  padding: 4
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={saveBannerForm}>
              {/* Title / Brand Name */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#cbd5e1', marginBottom: 6 }}>
                  Banner Title / Brand Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Banana Club, Powerlook, Bonkers Corner"
                  value={editingBanner.title}
                  onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 10,
                    border: '1px solid #2a3245',
                    background: '#1d222e',
                    color: '#fff',
                    fontSize: 14,
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Image Input & Upload */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#cbd5e1', marginBottom: 6 }}>
                  Banner Image (3:4 Ratio Ideal)
                </label>

                <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                  <input
                    type="text"
                    required
                    placeholder="https://... or /assets/real/..."
                    value={editingBanner.img}
                    onChange={(e) => setEditingBanner({ ...editingBanner, img: e.target.value })}
                    style={{
                      flex: 1,
                      padding: '12px 14px',
                      borderRadius: 10,
                      border: '1px solid #2a3245',
                      background: '#1d222e',
                      color: '#fff',
                      fontSize: 14
                    }}
                  />

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    style={{
                      padding: '12px 16px',
                      borderRadius: 10,
                      background: '#38bdf8',
                      color: '#000',
                      border: 'none',
                      fontWeight: 800,
                      fontSize: 13,
                      cursor: uploadingImage ? 'not-allowed' : 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {uploadingImage ? 'Uploading...' : '📁 Upload File'}
                  </button>
                </div>

                {/* Image Preview */}
                {editingBanner.img && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      background: '#1a1f2c',
                      padding: 10,
                      borderRadius: 12,
                      border: '1px solid #2a3245'
                    }}
                  >
                    <div
                      style={{
                        width: 54,
                        height: 72,
                        borderRadius: 8,
                        overflow: 'hidden',
                        background: '#000',
                        flexShrink: 0
                      }}
                    >
                      <img
                        src={editingBanner.img}
                        alt="Preview"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <div style={{ fontSize: 12, color: '#94a3b8', wordBreak: 'break-all' }}>
                      <strong style={{ color: '#fff', display: 'block' }}>Image Preview</strong>
                      {editingBanner.img}
                    </div>
                  </div>
                )}
              </div>

              {/* Direct In-App Link Picker */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#cbd5e1', marginBottom: 6 }}>
                  Destination Route / Brand Page
                </label>

                {/* Quick Brand Page Picker */}
                <div style={{ marginBottom: 8 }}>
                  <span style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                    Quick Select {activeGender.toUpperCase()} Brand Page:
                  </span>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        setEditingBanner({
                          ...editingBanner,
                          route: e.target.value,
                          title: editingBanner.title || e.target.options[e.target.selectedIndex].text
                        });
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: '1px solid #2a3245',
                      background: '#1d222e',
                      color: '#cbd5e1',
                      fontSize: 13,
                      marginBottom: 8
                    }}
                  >
                    <option value="">-- Choose Brand Page in App --</option>
                    {CURATED_BRANDS[activeGender].map((b) => (
                      <option key={b.name} value={b.deeplink}>
                        {b.name} ({b.deeplink})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quick Category Picker */}
                <div style={{ marginBottom: 8 }}>
                  <span style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                    Or Quick Select Category:
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {CATEGORY_LINKS.map((c) => (
                      <button
                        type="button"
                        key={c.path}
                        onClick={() => setEditingBanner({ ...editingBanner, route: c.path })}
                        style={{
                          padding: '4px 10px',
                          borderRadius: 6,
                          background: editingBanner.route === c.path ? '#6678FF' : '#1d222e',
                          color: '#fff',
                          border: '1px solid #2a3245',
                          fontSize: 11,
                          cursor: 'pointer'
                        }}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom input */}
                <input
                  type="text"
                  required
                  placeholder="/collections/... or /product/12345"
                  value={editingBanner.route}
                  onChange={(e) => setEditingBanner({ ...editingBanner, route: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 10,
                    border: '1px solid #2a3245',
                    background: '#1d222e',
                    color: '#38bdf8',
                    fontFamily: 'monospace',
                    fontSize: 13,
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Form Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
                <button
                  type="button"
                  onClick={() => setEditingBanner(null)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: 8,
                    background: '#1d222e',
                    color: '#94a3b8',
                    border: '1px solid #2a3245',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: 13
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 24px',
                    borderRadius: 8,
                    background: '#38bdf8',
                    color: '#000',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 800,
                    fontSize: 13
                  }}
                >
                  {isNewBanner ? 'Add to Lookbook' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}
