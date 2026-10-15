'use client';

import React, { useState, useEffect, useRef } from 'react';
import { slugify } from '@/app/lib/supabaseClient';

export interface BrandTile {
  name: string;
  img: string;
  badge?: string | null;
  categories: string[];
  deeplink: string;
  customBadgeColor?: string;
}

export interface DiscoverBrandsData {
  heading: string;
  categories: Array<{ id: string; title: string; icon: string }>;
  slides: BrandTile[][];
}

const CATEGORY_ICONS: Record<string, string> = {
  '1': '👔 Casualwear',
  '2': '🥻 Ethnicwear',
  '3': '🛹 Streetwear',
  '4': '👖 Denims',
  '5': '👕 Basics',
  '6': '⚡ Athleisure',
  '7': '🍸 Partywear',
  '8': '👟 Footwear',
  '9': '💍 Accessories',
  '10': '🛋️ Loungewear',
  '11': '🪡 Indo-Western',
  '13': '💼 Workwear',
  '14': '💎 Jewellery',
  '15': '🌴 Vacation',
  '16': '🏖️ Resortwear',
  '17': '🌿 Sustainable',
  '18': '🩲 Innerwear',
  '19': '🌸 Fragrances'
};

export default function DiscoverBrandsEditor() {
  const [data, setData] = useState<DiscoverBrandsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Edit / Add Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<{
    slideIndex: number;
    brandIndex: number;
    isNew: boolean;
    brand: BrandTile;
    targetPosition?: 'show_first' | 'current_slide' | 'new_slide';
  } | null>(null);

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load live discover brands
  const loadData = () => {
    setLoading(true);
    fetch('/api/discover-brands')
      .then((res) => res.json())
      .then((res) => {
        if (res?.success && res?.data) {
          setData(res.data);
        }
      })
      .catch((err) => console.error('Failed to load discover brands:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  // Save to backend & Supabase DB
  const handleSaveAndSync = async () => {
    if (!data) return;
    try {
      setSaving(true);
      setSaveStatus(null);
      const res = await fetch('/api/discover-brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const resJson = await res.json();
      if (resJson?.success) {
        setSaveStatus(resJson.message || '✅ Saved & Synced successfully!');
        setTimeout(() => setSaveStatus(null), 4500);
      } else {
        setSaveStatus('❌ Error: ' + (resJson?.error || 'Save failed'));
      }
    } catch (err: any) {
      setSaveStatus('❌ Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Move brand to Slide 1, position 1 (Show First)
  const pinBrandToShowFirst = (fromSlide: number, fromIdx: number) => {
    if (!data) return;
    const slides = data.slides.map((s) => [...s]);
    const [targetBrand] = slides[fromSlide].splice(fromIdx, 1);
    if (!targetBrand) return;

    if (!slides[0]) slides[0] = [];
    slides[0].unshift(targetBrand);

    setData({ ...data, slides });
    setActiveSlide(0);
    setSaveStatus('⭐ "' + targetBrand.name + '" pinned to Show First on Slide 1! Remember to click Save.');
    setTimeout(() => setSaveStatus(null), 4000);
  };

  // Move Up within slide
  const moveBrandUp = (slideIdx: number, idx: number) => {
    if (!data || idx === 0) return;
    const slides = data.slides.map((s) => [...s]);
    const currentList = slides[slideIdx];
    const [item] = currentList.splice(idx, 1);
    currentList.splice(idx - 1, 0, item);
    setData({ ...data, slides });
  };

  // Move Down within slide
  const moveBrandDown = (slideIdx: number, idx: number) => {
    if (!data) return;
    const slides = data.slides.map((s) => [...s]);
    const currentList = slides[slideIdx];
    if (idx >= currentList.length - 1) return;
    const [item] = currentList.splice(idx, 1);
    currentList.splice(idx + 1, 0, item);
    setData({ ...data, slides });
  };

  // Delete brand
  const deleteBrand = (slideIdx: number, idx: number) => {
    if (!data) return;
    const brand = data.slides[slideIdx]?.[idx];
    if (!confirm(`Are you sure you want to remove "${brand?.name || 'this brand'}" from the grid?`)) return;

    const slides = data.slides.map((s) => [...s]);
    slides[slideIdx].splice(idx, 1);
    setData({ ...data, slides });
  };

  // Move brand to another slide
  const moveBrandToSlide = (fromSlide: number, fromIdx: number, targetSlide: number) => {
    if (!data || fromSlide === targetSlide) return;
    const slides = data.slides.map((s) => [...s]);
    const [brand] = slides[fromSlide].splice(fromIdx, 1);
    if (!brand) return;

    if (!slides[targetSlide]) slides[targetSlide] = [];
    slides[targetSlide].push(brand);
    setData({ ...data, slides });
  };

  // Open modal for editing
  const openEditModal = (slideIdx: number, brandIdx: number) => {
    if (!data) return;
    const b = data.slides[slideIdx][brandIdx];
    setEditingBrand({
      slideIndex: slideIdx,
      brandIndex: brandIdx,
      isNew: false,
      brand: { ...b, categories: [...(b.categories || [])] },
      targetPosition: 'current_slide'
    });
    setIsModalOpen(true);
  };

  // Open modal for adding new brand
  const openAddModal = (targetPos: 'show_first' | 'current_slide' = 'show_first') => {
    setEditingBrand({
      slideIndex: activeSlide,
      brandIndex: -1,
      isNew: true,
      brand: {
        name: '',
        img: '',
        badge: targetPos === 'show_first' ? 'NEW' : null,
        categories: ['1'],
        deeplink: ''
      },
      targetPosition: targetPos
    });
    setIsModalOpen(true);
  };

  // Handle image file upload for brand logo
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingBrand) return;

    try {
      setUploadingLogo(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/discover-brands/upload', {
        method: 'POST',
        body: formData
      });
      const resJson = await res.json();

      if (resJson?.success && resJson?.url) {
        setEditingBrand((prev) =>
          prev
            ? {
                ...prev,
                brand: { ...prev.brand, img: resJson.url }
              }
            : null
        );
      } else {
        alert(resJson?.error || 'Failed to upload logo image');
      }
    } catch (err: any) {
      alert(err?.message || 'Upload error');
    } finally {
      setUploadingLogo(false);
    }
  };

  // Save modal brand form
  const handleModalSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data || !editingBrand) return;

    const brandName = editingBrand.brand.name.trim();
    if (!brandName) {
      alert('Please enter a Brand Name');
      return;
    }

    if (!editingBrand.brand.img.trim()) {
      alert('Please upload or provide an image/logo URL for the brand');
      return;
    }

    const defaultDeeplink = editingBrand.brand.deeplink.trim() || `/brand/${slugify(brandName)}`;
    const finalBrand: BrandTile = {
      ...editingBrand.brand,
      name: brandName,
      deeplink: defaultDeeplink
    };

    const slides = data.slides.map((s) => [...s]);

    if (editingBrand.isNew) {
      if (editingBrand.targetPosition === 'show_first') {
        if (!slides[0]) slides[0] = [];
        slides[0].unshift(finalBrand);
        setActiveSlide(0);
      } else if (editingBrand.targetPosition === 'new_slide') {
        slides.push([finalBrand]);
        setActiveSlide(slides.length - 1);
      } else {
        if (!slides[editingBrand.slideIndex]) slides[editingBrand.slideIndex] = [];
        slides[editingBrand.slideIndex].push(finalBrand);
      }
    } else {
      slides[editingBrand.slideIndex][editingBrand.brandIndex] = finalBrand;
    }

    setData({ ...data, slides });
    setIsModalOpen(false);
    setEditingBrand(null);
  };

  // Automatically rebalance all brands into clean 12-item slides (4x3)
  const rebalanceSlides = () => {
    if (!data) return;
    if (!confirm('Rebalance all brands into neat 12-tile slides (4 columns x 3 rows)? Existing order will be preserved.')) return;

    const allBrands = data.slides.flat().filter(Boolean);
    const newSlides: BrandTile[][] = [];
    for (let i = 0; i < allBrands.length; i += 12) {
      newSlides.push(allBrands.slice(i, i + 12));
    }

    setData({ ...data, slides: newSlides });
    setActiveSlide(0);
    setSaveStatus('✅ All brands rebalanced into ' + newSlides.length + ' clean 12-tile slides!');
    setTimeout(() => setSaveStatus(null), 4000);
  };

  // Add a brand-new slide
  const addNewSlide = () => {
    if (!data) return;
    const slides = [...data.slides.map((s) => [...s]), []];
    setData({ ...data, slides });
    setActiveSlide(slides.length - 1);
  };

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
        <div style={{ fontSize: 24, marginBottom: 12 }}>⚡</div>
        Loading Discover Brands manifest & database sync...
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#ef4444' }}>
        Failed to load Discover Brands data.{' '}
        <button onClick={loadData} style={{ marginLeft: 12, padding: '6px 12px', background: '#222', color: '#fff', borderRadius: 6 }}>
          Retry
        </button>
      </div>
    );
  }

  const slides = data.slides || [];
  const currentSlideTiles = slides[activeSlide] || [];

  // Filtered list for search view
  const allBrandsWithPos = slides.flatMap((s, sIdx) =>
    s.map((b, bIdx) => ({
      brand: b,
      slideIdx: sIdx,
      brandIdx: bIdx
    }))
  );

  const searchResults = searchQuery.trim()
    ? allBrandsWithPos.filter((item) =>
        item.brand.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
      )
    : null;

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px 28px 80px' }}>
      {/* Action Header Banner */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          background: 'linear-gradient(135deg, #13151b 0%, #1e222d 100%)',
          border: '1px solid #2a2e3d',
          borderRadius: 16,
          padding: '20px 24px',
          marginBottom: 28,
          boxShadow: '0 8px 30px rgba(0,0,0,0.3)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <span style={{ fontSize: 22 }}>🏷️</span>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: '#ffffff', letterSpacing: -0.3 }}>
              Discover Brands (4x3 Grid Studio)
            </h2>
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: 999,
                background: '#10b981',
                color: '#042f1a'
              }}
            >
              DB SYNCED
            </span>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: '#94a3b8' }}>
            Control which brands show first, upload logos, customize badges (NEW/ETHNIC), edit deeplinks, and reorder grid tiles.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {saveStatus && (
            <span style={{ fontSize: 13, fontWeight: 700, color: saveStatus.startsWith('✅') || saveStatus.startsWith('⭐') ? '#4ade80' : '#f87171' }}>
              {saveStatus}
            </span>
          )}

          <button
            onClick={() => openAddModal('show_first')}
            style={{
              padding: '10px 16px',
              borderRadius: 10,
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#ffffff',
              fontSize: 13,
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)'
            }}
          >
            <span>⭐</span> Add Brand (Show First)
          </button>

          <button
            onClick={() => openAddModal('current_slide')}
            style={{
              padding: '10px 16px',
              borderRadius: 10,
              background: '#252936',
              color: '#f1f5f9',
              fontSize: 13,
              fontWeight: 700,
              border: '1px solid #3b4255',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <span>+</span> Add to Slide {activeSlide + 1}
          </button>

          <button
            onClick={rebalanceSlides}
            title="Auto-organize into neat 12-item slides"
            style={{
              padding: '10px 14px',
              borderRadius: 10,
              background: '#1e222e',
              color: '#94a3b8',
              fontSize: 13,
              fontWeight: 600,
              border: '1px solid #2e3547',
              cursor: 'pointer'
            }}
          >
            ⚡ Rebalance (12/Slide)
          </button>

          <button
            onClick={handleSaveAndSync}
            disabled={saving}
            style={{
              padding: '10px 20px',
              borderRadius: 10,
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              color: '#ffffff',
              fontSize: 13,
              fontWeight: 800,
              border: 'none',
              cursor: saving ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 4px 16px rgba(99, 102, 241, 0.4)',
              opacity: saving ? 0.7 : 1
            }}
          >
            <span>{saving ? '⏳' : '💾'}</span>
            {saving ? 'Syncing to DB...' : 'Save & Publish to DB'}
          </button>
        </div>
      </div>

      {/* Main Grid: Left Column (Live Mobile Mockup) & Right Column (Slide Controls & Brand Tiles) */}
      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 28, alignItems: 'start' }}>
        {/* LEFT COLUMN: LIVE MOBILE PHONE PREVIEW */}
        <div
          style={{
            position: 'sticky',
            top: 86,
            background: '#14161f',
            border: '1px solid #232838',
            borderRadius: 20,
            padding: 20,
            boxShadow: '0 12px 36px rgba(0,0,0,0.4)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#f3f4f6' }}>
              📱 Live App Preview · Slide {activeSlide + 1}
            </span>
            <span style={{ fontSize: 11, color: '#94a3b8', background: '#1e2230', padding: '2px 8px', borderRadius: 6 }}>
              {currentSlideTiles.length} / 12 tiles
            </span>
          </div>

          {/* Phone Frame */}
          <div
            style={{
              background: '#171717',
              borderRadius: 24,
              border: '3px solid #2b2e3a',
              padding: '16px 10px',
              boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, padding: '0 4px' }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: '#ffffff' }}>Discover Brands</span>
              <span style={{ fontSize: 11, color: '#818cf8', fontWeight: 600 }}>See all &gt;</span>
            </div>

            {/* 4x3 Grid Mockup */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 6
              }}
            >
              {currentSlideTiles.slice(0, 12).map((tile, idx) => (
                <div
                  key={idx}
                  onClick={() => openEditModal(activeSlide, idx)}
                  title={`${tile.name} (Click to edit)`}
                  style={{
                    background: '#ffffff',
                    borderRadius: 10,
                    width: '100%',
                    aspectRatio: '1 / 1.08',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                    cursor: 'pointer',
                    border: idx === 0 && activeSlide === 0 ? '2px solid #10b981' : 'none'
                  }}
                >
                  {/* Badge Ribbon */}
                  {tile.badge === 'NEW' && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 12,
                        background: '#581c87',
                        color: '#ffffff',
                        fontSize: 7.5,
                        fontWeight: 900,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderTopLeftRadius: 10,
                        borderTopRightRadius: 10
                      }}
                    >
                      NEW
                    </div>
                  )}
                  {tile.badge === 'ETHNIC' && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 12,
                        background: '#991b1c',
                        color: '#ffffff',
                        fontSize: 7.5,
                        fontWeight: 900,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderTopLeftRadius: 10,
                        borderTopRightRadius: 10
                      }}
                    >
                      ETHNIC
                    </div>
                  )}
                  {tile.badge && tile.badge !== 'NEW' && tile.badge !== 'ETHNIC' && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 12,
                        background: tile.customBadgeColor || '#2563eb',
                        color: '#ffffff',
                        fontSize: 7.5,
                        fontWeight: 900,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderTopLeftRadius: 10,
                        borderTopRightRadius: 10
                      }}
                    >
                      {tile.badge}
                    </div>
                  )}

                  <img
                    src={tile.img}
                    alt={tile.name}
                    style={{
                      maxWidth: '78%',
                      maxHeight: '66%',
                      objectFit: 'contain',
                      marginTop: tile.badge ? 6 : 0
                    }}
                  />

                  {/* Position number overlay */}
                  <span
                    style={{
                      position: 'absolute',
                      bottom: 2,
                      right: 3,
                      fontSize: 8,
                      fontWeight: 800,
                      color: '#94a3b8'
                    }}
                  >
                    #{idx + 1}
                  </span>
                </div>
              ))}

              {/* Fillers if slide has less than 12 */}
              {Array.from({ length: Math.max(0, 12 - currentSlideTiles.length) }).map((_, fIdx) => (
                <div
                  key={`empty_${fIdx}`}
                  onClick={() => openAddModal('current_slide')}
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px dashed #3a3f52',
                    borderRadius: 10,
                    aspectRatio: '1 / 1.08',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#64748b',
                    fontSize: 16,
                    cursor: 'pointer'
                  }}
                  title="Click to add brand in this slot"
                >
                  +
                </div>
              ))}
            </div>

            {/* Pagination dots mockup */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginTop: 12 }}>
              {slides.map((_, dotIdx) => (
                <div
                  key={dotIdx}
                  onClick={() => setActiveSlide(dotIdx)}
                  style={{
                    width: dotIdx === activeSlide ? 14 : 4,
                    height: 4,
                    borderRadius: 2,
                    background: dotIdx === activeSlide ? '#ffffff' : '#475569',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                />
              ))}
            </div>
          </div>

          <div style={{ marginTop: 14, fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>
            💡 <strong style={{ color: '#f1f5f9' }}>Tip:</strong> Position #1 of Slide 1 is the first brand every user sees when opening the app. Use the green <strong style={{ color: '#10b981' }}>"⭐ Show First"</strong> button on any brand to move it straight to #1!
          </div>
        </div>

        {/* RIGHT COLUMN: SLIDE SELECTOR & TILES CONTROLLER */}
        <div>
          {/* Quick Search & Filter Bar */}
          <div
            style={{
              display: 'flex',
              gap: 12,
              marginBottom: 20,
              background: '#13151f',
              padding: '12px 16px',
              borderRadius: 12,
              border: '1px solid #232738'
            }}
          >
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                type="text"
                placeholder="🔍 Search all 180+ brands by name to jump or prioritize..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  background: '#1a1d29',
                  border: '1px solid #2f3548',
                  borderRadius: 8,
                  padding: '9px 14px',
                  color: '#ffffff',
                  fontSize: 13,
                  outline: 'none'
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    fontSize: 12
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            <button
              onClick={addNewSlide}
              style={{
                padding: '9px 16px',
                borderRadius: 8,
                background: '#232838',
                color: '#e2e8f0',
                fontSize: 13,
                fontWeight: 600,
                border: '1px solid #333a50',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              + Add New Slide
            </button>
          </div>

          {/* Search Results Mode if user is searching */}
          {searchResults ? (
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>
                  Search Results for "{searchQuery}" ({searchResults.length} found)
                </span>
                <button
                  onClick={() => setSearchQuery('')}
                  style={{ fontSize: 12, color: '#818cf8', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Clear Search
                </button>
              </div>

              {searchResults.length === 0 ? (
                <div style={{ padding: 30, textAlign: 'center', color: '#64748b', background: '#13151f', borderRadius: 12 }}>
                  No brands found matching "{searchQuery}". Click "Add Brand" above to create it!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {searchResults.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 18px',
                        background: '#161924',
                        border: '1px solid #262c3e',
                        borderRadius: 12
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div
                          style={{
                            width: 44,
                            height: 44,
                            background: '#ffffff',
                            borderRadius: 8,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden'
                          }}
                        >
                          <img src={item.brand.img} alt={item.brand.name} style={{ maxWidth: '85%', maxHeight: '85%', objectFit: 'contain' }} />
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <strong style={{ fontSize: 14, color: '#ffffff' }}>{item.brand.name}</strong>
                            {item.brand.badge && (
                              <span
                                style={{
                                  fontSize: 10,
                                  fontWeight: 800,
                                  padding: '2px 6px',
                                  borderRadius: 4,
                                  background: item.brand.badge === 'NEW' ? '#581c87' : item.brand.badge === 'ETHNIC' ? '#991b1c' : '#2563eb',
                                  color: '#fff'
                                }}
                              >
                                {item.brand.badge}
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                            Located on Slide {item.slideIdx + 1}, Slot #{item.brandIdx + 1} · {item.brand.deeplink}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button
                          onClick={() => {
                            pinBrandToShowFirst(item.slideIdx, item.brandIdx);
                            setSearchQuery('');
                          }}
                          style={{
                            padding: '6px 12px',
                            borderRadius: 6,
                            background: 'rgba(16, 185, 129, 0.15)',
                            color: '#34d399',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          ⭐ Make #1 (Show First)
                        </button>
                        <button
                          onClick={() => {
                            setActiveSlide(item.slideIdx);
                            setSearchQuery('');
                          }}
                          style={{
                            padding: '6px 12px',
                            borderRadius: 6,
                            background: '#202434',
                            color: '#e2e8f0',
                            border: '1px solid #32394e',
                            fontSize: 12,
                            cursor: 'pointer'
                          }}
                        >
                          Jump to Slide {item.slideIdx + 1}
                        </button>
                        <button
                          onClick={() => openEditModal(item.slideIdx, item.brandIdx)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: 6,
                            background: '#202434',
                            color: '#cbd5e1',
                            border: '1px solid #32394e',
                            fontSize: 12,
                            cursor: 'pointer'
                          }}
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Slide Selection Tabs */}
              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  overflowX: 'auto',
                  paddingBottom: 12,
                  marginBottom: 18,
                  borderBottom: '1px solid #232738'
                }}
              >
                {slides.map((slide, sIdx) => {
                  const isActive = sIdx === activeSlide;
                  const isFirst = sIdx === 0;
                  return (
                    <button
                      key={sIdx}
                      onClick={() => setActiveSlide(sIdx)}
                      style={{
                        flexShrink: 0,
                        padding: '8px 14px',
                        borderRadius: 10,
                        background: isActive ? '#3b4255' : '#141620',
                        color: isActive ? '#ffffff' : '#94a3b8',
                        border: isFirst ? (isActive ? '2px solid #10b981' : '1px solid rgba(16, 185, 129, 0.5)') : (isActive ? '1px solid #6366f1' : '1px solid #262a3a'),
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {isFirst && <span>★</span>}
                      <span>Slide {sIdx + 1}</span>
                      <span
                        style={{
                          fontSize: 10,
                          padding: '1px 5px',
                          borderRadius: 999,
                          background: isActive ? '#1e2230' : '#1e222d',
                          color: '#cbd5e1'
                        }}
                      >
                        {slide.length}
                      </span>
                      {isFirst && (
                        <span style={{ fontSize: 9, color: '#34d399', fontWeight: 800 }}>
                          SHOWS FIRST
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Slide Header Info */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#f8fafc' }}>
                    Slide {activeSlide + 1} Brands ({currentSlideTiles.length} Tiles)
                  </h3>
                  {activeSlide === 0 && (
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: 6,
                        background: 'rgba(16, 185, 129, 0.2)',
                        color: '#34d399',
                        border: '1px solid rgba(16, 185, 129, 0.4)'
                      }}
                    >
                      ★ HERO SLIDE (App Home View)
                    </span>
                  )}
                </div>

                <div style={{ fontSize: 12, color: '#94a3b8' }}>
                  Ordered from #1 (Top-Left) to #12 (Bottom-Right)
                </div>
              </div>

              {/* Brand Tiles List for Active Slide */}
              {currentSlideTiles.length === 0 ? (
                <div
                  style={{
                    padding: 40,
                    textAlign: 'center',
                    background: '#13151f',
                    border: '1px dashed #2f3548',
                    borderRadius: 14,
                    color: '#94a3b8'
                  }}
                >
                  <p style={{ margin: '0 0 12px', fontSize: 14 }}>This slide is currently empty.</p>
                  <button
                    onClick={() => openAddModal('current_slide')}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 8,
                      background: '#6366f1',
                      color: '#fff',
                      border: 'none',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    + Add Brand to this Slide
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {currentSlideTiles.map((tile, idx) => {
                    const isFirstOverall = activeSlide === 0 && idx === 0;
                    return (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 18px',
                          background: isFirstOverall ? 'linear-gradient(135deg, #131c1a 0%, #152220 100%)' : '#141722',
                          border: isFirstOverall ? '1px solid #10b981' : '1px solid #232838',
                          borderRadius: 12,
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {/* Left: Thumbnail & Details */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                          {/* Position Badge */}
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 8,
                              background: isFirstOverall ? '#10b981' : '#232838',
                              color: isFirstOverall ? '#042f1a' : '#94a3b8',
                              fontWeight: 900,
                              fontSize: 13,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            {idx + 1}
                          </div>

                          {/* Logo Preview Tile */}
                          <div
                            style={{
                              width: 48,
                              height: 48,
                              background: '#ffffff',
                              borderRadius: 8,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              overflow: 'hidden',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                              position: 'relative'
                            }}
                          >
                            <img
                              src={tile.img}
                              alt={tile.name}
                              style={{ maxWidth: '85%', maxHeight: '85%', objectFit: 'contain' }}
                            />
                          </div>

                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <strong style={{ fontSize: 15, color: '#f8fafc' }}>{tile.name}</strong>

                              {isFirstOverall && (
                                <span
                                  style={{
                                    fontSize: 10,
                                    fontWeight: 900,
                                    padding: '2px 6px',
                                    borderRadius: 4,
                                    background: '#10b981',
                                    color: '#042f1a'
                                  }}
                                >
                                  SHOWS FIRST
                                </span>
                              )}

                              {tile.badge === 'NEW' && (
                                <span
                                  style={{
                                    fontSize: 10,
                                    fontWeight: 800,
                                    padding: '2px 6px',
                                    borderRadius: 4,
                                    background: '#581c87',
                                    color: '#ffffff'
                                  }}
                                >
                                  NEW
                                </span>
                              )}
                              {tile.badge === 'ETHNIC' && (
                                <span
                                  style={{
                                    fontSize: 10,
                                    fontWeight: 800,
                                    padding: '2px 6px',
                                    borderRadius: 4,
                                    background: '#991b1c',
                                    color: '#ffffff'
                                  }}
                                >
                                  ETHNIC
                                </span>
                              )}
                              {tile.badge && tile.badge !== 'NEW' && tile.badge !== 'ETHNIC' && (
                                <span
                                  style={{
                                    fontSize: 10,
                                    fontWeight: 800,
                                    padding: '2px 6px',
                                    borderRadius: 4,
                                    background: tile.customBadgeColor || '#2563eb',
                                    color: '#ffffff'
                                  }}
                                >
                                  {tile.badge}
                                </span>
                              )}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                              <span style={{ fontSize: 12, color: '#818cf8' }}>{tile.deeplink || '/brand/' + slugify(tile.name)}</span>
                              <span style={{ fontSize: 11, color: '#64748b' }}>•</span>
                              <div style={{ display: 'flex', gap: 4 }}>
                                {(tile.categories || []).map((catId) => (
                                  <span
                                    key={catId}
                                    style={{
                                      fontSize: 10,
                                      padding: '1px 6px',
                                      borderRadius: 4,
                                      background: '#1e2230',
                                      color: '#94a3b8'
                                    }}
                                  >
                                    {CATEGORY_ICONS[catId] || `Cat ${catId}`}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Right: Controls & Ordering Buttons */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {/* "Show First" Quick Action */}
                          {!isFirstOverall && (
                            <button
                              onClick={() => pinBrandToShowFirst(activeSlide, idx)}
                              title="Pin this brand to Slide 1, Position 1 (Shows First to users)"
                              style={{
                                padding: '6px 12px',
                                borderRadius: 8,
                                background: 'rgba(16, 185, 129, 0.12)',
                                color: '#34d399',
                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                fontSize: 12,
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4
                              }}
                            >
                              <span>⭐</span> Show First
                            </button>
                          )}

                          {/* Up & Down arrows */}
                          <button
                            onClick={() => moveBrandUp(activeSlide, idx)}
                            disabled={idx === 0}
                            title="Move Up"
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 8,
                              background: '#1f2434',
                              color: idx === 0 ? '#475569' : '#cbd5e1',
                              border: '1px solid #2f364e',
                              fontSize: 13,
                              cursor: idx === 0 ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            ▲
                          </button>

                          <button
                            onClick={() => moveBrandDown(activeSlide, idx)}
                            disabled={idx >= currentSlideTiles.length - 1}
                            title="Move Down"
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 8,
                              background: '#1f2434',
                              color: idx >= currentSlideTiles.length - 1 ? '#475569' : '#cbd5e1',
                              border: '1px solid #2f364e',
                              fontSize: 13,
                              cursor: idx >= currentSlideTiles.length - 1 ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            ▼
                          </button>

                          {/* Move to another slide dropdown */}
                          <select
                            value={activeSlide}
                            onChange={(e) => moveBrandToSlide(activeSlide, idx, Number(e.target.value))}
                            style={{
                              padding: '6px 10px',
                              borderRadius: 8,
                              background: '#1f2434',
                              color: '#94a3b8',
                              border: '1px solid #2f364e',
                              fontSize: 12,
                              cursor: 'pointer',
                              outline: 'none'
                            }}
                            title="Move this brand to a different slide"
                          >
                            {slides.map((_, sIdx) => (
                              <option key={sIdx} value={sIdx}>
                                Move to Slide {sIdx + 1}
                              </option>
                            ))}
                          </select>

                          {/* Edit button */}
                          <button
                            onClick={() => openEditModal(activeSlide, idx)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: 8,
                              background: '#232838',
                              color: '#cbd5e1',
                              border: '1px solid #333a50',
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            Edit
                          </button>

                          {/* Delete button */}
                          <button
                            onClick={() => deleteBrand(activeSlide, idx)}
                            title="Delete brand from grid"
                            style={{
                              padding: '6px 10px',
                              borderRadius: 8,
                              background: 'rgba(239, 68, 68, 0.12)',
                              color: '#f87171',
                              border: '1px solid rgba(239, 68, 68, 0.25)',
                              fontSize: 12,
                              cursor: 'pointer'
                            }}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ADD / EDIT BRAND MODAL */}
      {isModalOpen && editingBrand && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            style={{
              background: '#161924',
              border: '1px solid #2d3448',
              borderRadius: 20,
              width: '100%',
              maxWidth: 580,
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: 28,
              boxShadow: '0 20px 50px rgba(0,0,0,0.6)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: '#ffffff' }}>
                  {editingBrand.isNew ? '⭐ Add New Brand Tile' : `✏️ Edit Brand: ${editingBrand.brand.name}`}
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: '#94a3b8' }}>
                  {editingBrand.isNew
                    ? 'Add a brand to Discover Brands and set its display position'
                    : 'Update brand logo, badge ribbon, category tags, and route'}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: 20,
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleModalSave}>
              {/* Brand Name */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#cbd5e1', marginBottom: 6 }}>
                  Brand Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. WHAT THE FLEX, Snitch, Bewakoof"
                  value={editingBrand.brand.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setEditingBrand((prev) =>
                      prev
                        ? {
                            ...prev,
                            brand: {
                              ...prev.brand,
                              name,
                              deeplink: prev.brand.deeplink ? prev.brand.deeplink : `/brand/${slugify(name)}`
                            }
                          }
                        : null
                    );
                  }}
                  style={{
                    width: '100%',
                    background: '#1f2434',
                    border: '1px solid #333a50',
                    borderRadius: 10,
                    padding: '10px 14px',
                    color: '#ffffff',
                    fontSize: 14,
                    outline: 'none'
                  }}
                />
              </div>

              {/* Brand Logo Upload / URL */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#cbd5e1', marginBottom: 6 }}>
                  Brand Logo Image *
                </label>

                <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                  {/* Thumbnail Preview */}
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      background: '#ffffff',
                      borderRadius: 12,
                      border: '1px solid #3b4255',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      flexShrink: 0
                    }}
                  >
                    {editingBrand.brand.img ? (
                      <img
                        src={editingBrand.brand.img}
                        alt="Logo preview"
                        style={{ maxWidth: '85%', maxHeight: '85%', objectFit: 'contain' }}
                      />
                    ) : (
                      <span style={{ fontSize: 10, color: '#94a3b8' }}>No logo</span>
                    )}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleLogoUpload}
                        style={{ display: 'none' }}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingLogo}
                        style={{
                          padding: '8px 14px',
                          borderRadius: 8,
                          background: '#252936',
                          color: '#e2e8f0',
                          border: '1px solid #3b4255',
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6
                        }}
                      >
                        <span>{uploadingLogo ? '⏳' : '📁'}</span>
                        {uploadingLogo ? 'Uploading...' : 'Upload Image File'}
                      </button>

                      <span style={{ fontSize: 11, color: '#64748b', alignSelf: 'center' }}>
                        PNG / WEBP recommended
                      </span>
                    </div>

                    <input
                      type="text"
                      placeholder="Or paste direct image URL (/assets/... or https://...)"
                      value={editingBrand.brand.img}
                      onChange={(e) =>
                        setEditingBrand((prev) =>
                          prev
                            ? {
                                ...prev,
                                brand: { ...prev.brand, img: e.target.value }
                              }
                            : null
                        )
                      }
                      style={{
                        width: '100%',
                        background: '#1f2434',
                        border: '1px solid #333a50',
                        borderRadius: 8,
                        padding: '8px 12px',
                        color: '#cbd5e1',
                        fontSize: 12,
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Deeplink Route */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: '#cbd5e1' }}>Deeplink Route / Path</label>
                  <button
                    type="button"
                    onClick={() => {
                      if (editingBrand.brand.name) {
                        setEditingBrand((prev) =>
                          prev
                            ? {
                                ...prev,
                                brand: {
                                  ...prev.brand,
                                  deeplink: `/brand/${slugify(prev.brand.name)}`
                                }
                              }
                            : null
                        );
                      }
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: 11,
                      color: '#818cf8',
                      cursor: 'pointer'
                    }}
                  >
                    Auto-generate /brand/[slug]
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="e.g. /brand/snitch or /collections/home_discover_brand_Snitch_men"
                  value={editingBrand.brand.deeplink}
                  onChange={(e) =>
                    setEditingBrand((prev) =>
                      prev
                        ? {
                            ...prev,
                            brand: { ...prev.brand, deeplink: e.target.value }
                          }
                        : null
                    )
                  }
                  style={{
                    width: '100%',
                    background: '#1f2434',
                    border: '1px solid #333a50',
                    borderRadius: 10,
                    padding: '10px 14px',
                    color: '#ffffff',
                    fontSize: 13,
                    outline: 'none'
                  }}
                />
              </div>

              {/* Badge Ribbon Picker */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#cbd5e1', marginBottom: 8 }}>
                  Top Ribbon Badge
                </label>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {[
                    { label: 'None', val: null },
                    { label: '🟣 NEW', val: 'NEW' },
                    { label: '🔴 ETHNIC', val: 'ETHNIC' },
                    { label: '🔵 HOT', val: 'HOT' },
                    { label: '🟠 EXCLUSIVE', val: 'EXCLUSIVE' }
                  ].map((bOption) => {
                    const isSelected = editingBrand.brand.badge === bOption.val;
                    return (
                      <button
                        type="button"
                        key={bOption.label}
                        onClick={() =>
                          setEditingBrand((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  brand: { ...prev.brand, badge: bOption.val }
                                }
                              : null
                          )
                        }
                        style={{
                          padding: '6px 14px',
                          borderRadius: 8,
                          background: isSelected ? '#3b4255' : '#1f2434',
                          color: isSelected ? '#ffffff' : '#94a3b8',
                          border: isSelected ? '1px solid #818cf8' : '1px solid #2f3548',
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {bOption.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Category Tags Multi-select */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#cbd5e1', marginBottom: 8 }}>
                  Category Tags (Filter Tabs on App)
                </label>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 8,
                    maxHeight: 180,
                    overflowY: 'auto',
                    background: '#13151f',
                    padding: 12,
                    borderRadius: 10,
                    border: '1px solid #252a3a'
                  }}
                >
                  {Object.entries(CATEGORY_ICONS).map(([catId, label]) => {
                    const checked = (editingBrand.brand.categories || []).includes(catId);
                    return (
                      <label
                        key={catId}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          fontSize: 12,
                          color: checked ? '#ffffff' : '#94a3b8',
                          cursor: 'pointer'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            const newCats = e.target.checked
                              ? [...(editingBrand.brand.categories || []), catId]
                              : (editingBrand.brand.categories || []).filter((id) => id !== catId);
                            setEditingBrand((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    brand: { ...prev.brand, categories: newCats }
                                  }
                                : null
                            );
                          }}
                        />
                        <span>{label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Position Choice if Adding New Brand */}
              {editingBrand.isNew && (
                <div style={{ marginBottom: 22, background: '#1c2230', padding: 14, borderRadius: 10, border: '1px solid #2e374c' }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>
                    Where should this brand appear?
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#34d399', fontWeight: 700, cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="targetPos"
                        checked={editingBrand.targetPosition === 'show_first'}
                        onChange={() => setEditingBrand((prev) => (prev ? { ...prev, targetPosition: 'show_first' } : null))}
                      />
                      <span>⭐ Place at Top (Slide 1, Position #1 - Shows First!)</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#e2e8f0', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="targetPos"
                        checked={editingBrand.targetPosition === 'current_slide'}
                        onChange={() => setEditingBrand((prev) => (prev ? { ...prev, targetPosition: 'current_slide' } : null))}
                      />
                      <span>Add to end of current slide (Slide {activeSlide + 1})</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#e2e8f0', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="targetPos"
                        checked={editingBrand.targetPosition === 'new_slide'}
                        onChange={() => setEditingBrand((prev) => (prev ? { ...prev, targetPosition: 'new_slide' } : null))}
                      />
                      <span>Create a new slide and place it there</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Modal Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: 10,
                    background: '#1f2434',
                    color: '#94a3b8',
                    border: '1px solid #2f364e',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  style={{
                    padding: '10px 22px',
                    borderRadius: 10,
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
                  }}
                >
                  {editingBrand.isNew ? '⭐ Add Brand' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
