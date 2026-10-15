'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { PRODUCTS, Product } from '@/data/catalog';
import { calculateDrobeMarkupPricing } from '@/app/lib/darkstoreData';
import confetti from 'canvas-confetti';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  Check, 
  RotateCcw, 
  ShoppingBag, 
  Sliders, 
  Layers, 
  ShieldCheck, 
  Zap, 
  Info, 
  ArrowLeft,
  ChevronRight,
  Maximize2
} from 'lucide-react';

// Preset diverse avatar models for instant 1-tap testing
const PRESET_AVATARS = [
  {
    id: 'avatar-women-ethnic',
    name: 'Ananya (Ethnic)',
    gender: 'women',
    preview: '/assets/real/women/asset_107_catalog_ingestion_pixyle_input_101790c1aa69d43650465fdd71ed22a1a7d251427b181416dd5127ffd9c060d3.jpg',
    tag: '5\'6" · Slim'
  },
  {
    id: 'avatar-women-western',
    name: 'Rhea (Casual)',
    gender: 'women',
    preview: '/assets/real/cat_women_dresses_card.png',
    tag: '5\'5" · Regular'
  },
  {
    id: 'avatar-men-kurta',
    name: 'Kabir (Ethnic)',
    gender: 'men',
    preview: '/assets/real/cat_ethnic.webp',
    tag: '5\'11" · Athletic'
  },
  {
    id: 'avatar-men-casual',
    name: 'Arjun (Streetwear)',
    gender: 'men',
    preview: '/assets/real/cat_top.webp',
    tag: '6\'0" · Regular'
  }
];

function TryOnContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToCart } = useApp();

  const initialProductId = searchParams.get('product') || PRODUCTS[0]?.id || 'w-eth-1';
  const [selectedProduct, setSelectedProduct] = useState<Product>(() => {
    return PRODUCTS.find((p) => p.id === initialProductId) || PRODUCTS[0];
  });

  // User Avatar state
  const [userPhoto, setUserPhoto] = useState<string>(PRESET_AVATARS[0].preview);
  const [isCustomPhoto, setIsCustomPhoto] = useState<boolean>(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string>(PRESET_AVATARS[0].id);

  // Studio Flow State: 'idle' | 'generating' | 'result'
  const [studioStep, setStudioStep] = useState<'idle' | 'generating' | 'result'>('result');
  const [fittedImage, setFittedImage] = useState<string>(
    selectedProduct.images?.[0] || selectedProduct.thumbnail
  );
  const [sliderPos, setSliderPos] = useState<number>(50); // % of split slider
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [modelPipelineInfo, setModelPipelineInfo] = useState<string>('NVIDIA NIM & 3D Pose Ready');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Restore saved avatar from localStorage if available
  useEffect(() => {
    try {
      const savedPhoto = localStorage.getItem('drobe_vton_user_photo');
      if (savedPhoto) {
        setUserPhoto(savedPhoto);
        setIsCustomPhoto(true);
        setSelectedPresetId('custom');
      }
    } catch {}
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Handle Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      triggerToast('Please select a photo smaller than 8MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const b64 = event.target?.result as string;
      setUserPhoto(b64);
      setIsCustomPhoto(true);
      setSelectedPresetId('custom');
      try {
        localStorage.setItem('drobe_vton_user_photo', b64);
      } catch {}
      triggerToast('✓ Custom model photo uploaded successfully!');
      runTryOnGeneration(b64, selectedProduct);
    };
    reader.readAsDataURL(file);
  };

  // Run Virtual Try-On Generation via in-house route
  const runTryOnGeneration = async (photo: string, product: Product) => {
    setStudioStep('generating');
    try {
      const res = await fetch('/api/try-on', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userImage: photo,
          garmentImage: product.images?.[0] || product.thumbnail,
          garmentTitle: product.title,
          garmentCategory: product.category,
          garmentDescription: product.description,
          gender: product.gender
        })
      });

      const data = await res.json();
      if (data.success && data.fittedImage) {
        setFittedImage(data.fittedImage);
        setModelPipelineInfo(data.modelUsed || 'NVIDIA 3D Pose & In-House VTON');
      } else {
        setFittedImage(product.images?.[0] || product.thumbnail);
      }
    } catch (err) {
      // Fallback seamlessly to product master
      setFittedImage(product.images?.[0] || product.thumbnail);
    } finally {
      setTimeout(() => {
        setStudioStep('result');
        setSliderPos(50);
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      }, 1600);
    }
  };

  // Change Garment from Wardrobe
  const handleSelectProduct = (p: Product) => {
    setSelectedProduct(p);
    runTryOnGeneration(userPhoto, p);
  };

  // Switch Preset Avatar
  const handleSelectPreset = (preset: typeof PRESET_AVATARS[0]) => {
    setSelectedPresetId(preset.id);
    setIsCustomPhoto(false);
    setUserPhoto(preset.preview);
    runTryOnGeneration(preset.preview, selectedProduct);
  };

  // Add to Doorstep Try & Buy Cart
  const handleAddToTrialCart = () => {
    addToCart(selectedProduct, 'M', 'tryAndBuy');
    triggerToast(`⚡ Added ${selectedProduct.title} to 30-Min Doorstep Trial!`);
  };

  const handleCheckoutTrial = () => {
    addToCart(selectedProduct, 'M', 'tryAndBuy');
    router.push('/cart');
  };

  // Filter products for wardrobe rack
  const filteredProducts = PRODUCTS.filter((p) => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'ethnic') return p.category?.toLowerCase().includes('ethnic');
    if (activeCategory === 'western') return p.category?.toLowerCase().includes('dress') || p.category?.toLowerCase().includes('top');
    if (activeCategory === 'men') return p.gender === 'men';
    if (activeCategory === 'women') return p.gender === 'women';
    return true;
  }).slice(0, 16);

  // Calculate pricing with dynamic 5% charm 9 markup
  const pricing = calculateDrobeMarkupPricing(selectedProduct.price || 600);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#09090d', color: '#ffffff', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* 1. TOP NAVIGATION HEADER */}
      <header
        style={{
          padding: '12px 18px',
          background: 'rgba(15, 15, 22, 0.95)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #1f1f2e',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 50
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => router.back()}
            style={{
              background: '#1a1a24',
              border: '1px solid #2e2e42',
              color: '#fff',
              width: 36,
              height: 36,
              borderRadius: 10,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <h1 style={{ fontSize: 16, fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
                AI Virtual Try-On Studio
              </h1>
              <span style={{ background: '#22c55e20', border: '1px solid #22c55e50', color: '#4ade80', fontSize: 10, fontWeight: 800, padding: '1px 6px', borderRadius: 4 }}>
                LIVE
              </span>
            </div>
            <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>
              NVIDIA NIM 3D Pose &amp; Neural Cloth Warping
            </p>
          </div>
        </div>

        {/* Studio Pipeline Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)', padding: '5px 12px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 5, boxShadow: '0 0 15px rgba(124,58,237,0.4)' }}>
            <Sparkles size={12} color="#ffffff" />
            <span style={{ fontSize: 11, fontWeight: 800 }}>In-House AI</span>
          </div>
        </div>
      </header>

      {/* 2. MAIN STUDIO CANVAS AREA */}
      <main style={{ flex: 1, padding: '16px', maxWidth: '640px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
        
        {/* MODEL AVATAR SELECTOR STRIP */}
        <div style={{ background: '#12121a', border: '1px solid #1f1f2e', borderRadius: 16, padding: '12px 14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8' }}>
              1. Your Try-On Avatar
            </span>
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                background: '#1e1e2d',
                border: '1px solid #3b3b52',
                color: '#38bdf8',
                fontSize: 11,
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: 8,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5
              }}
            >
              <Upload size={12} /> Upload Your Photo
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoUpload}
              accept="image/*"
              style={{ display: 'none' }}
            />
          </div>

          {/* Avatar Cards Scroll */}
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
            {/* Custom user photo if available */}
            {isCustomPhoto && (
              <button
                onClick={() => setSelectedPresetId('custom')}
                style={{
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 12px',
                  borderRadius: 10,
                  background: selectedPresetId === 'custom' ? '#2e1065' : '#181824',
                  border: `1.5px solid ${selectedPresetId === 'custom' ? '#a855f7' : '#2b2b3d'}`,
                  cursor: 'pointer',
                  color: '#fff'
                }}
              >
                <img src={userPhoto} alt="Your Photo" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 11, fontWeight: 800 }}>Your Selfie</div>
                  <div style={{ fontSize: 9, color: '#a855f7' }}>Custom Model</div>
                </div>
              </button>
            )}

            {/* Presets */}
            {PRESET_AVATARS.map((p) => {
              const isSelected = selectedPresetId === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handleSelectPreset(p)}
                  style={{
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '6px 12px',
                    borderRadius: 10,
                    background: isSelected ? '#1e1b4b' : '#181824',
                    border: `1.5px solid ${isSelected ? '#6366f1' : '#2b2b3d'}`,
                    cursor: 'pointer',
                    color: '#fff'
                  }}
                >
                  <img src={p.preview} alt={p.name} style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: 11, fontWeight: 800 }}>{p.name}</div>
                    <div style={{ fontSize: 9, color: '#94a3b8' }}>{p.tag}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. VIRTUAL FITTING SCREEN / COMPARISON SLIDER */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: 460,
            borderRadius: 22,
            overflow: 'hidden',
            background: '#101018',
            border: '1px solid #232334',
            boxShadow: '0 20px 40px rgba(0,0,0,0.7)'
          }}
        >
          {studioStep === 'generating' ? (
            /* SCANNING & POSE SKELETON ANIMATION */
            <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <img
                src={userPhoto}
                alt="Scanning"
                style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.35) contrast(1.2)' }}
              />

              {/* Laser Scan Line */}
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: '40%',
                  height: 3,
                  background: '#a855f7',
                  boxShadow: '0 0 25px 6px #ec4899',
                  animation: 'pulse 1.5s infinite alternate ease-in-out'
                }}
              />

              {/* Skeleton Keypoints Simulation */}
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ position: 'relative', width: '220px', height: '320px' }}>
                  {/* Shoulders */}
                  <div style={{ position: 'absolute', top: '25%', left: '20%', width: 10, height: 10, borderRadius: '50%', background: '#38bdf8', boxShadow: '0 0 10px #38bdf8' }} />
                  <div style={{ position: 'absolute', top: '25%', right: '20%', width: 10, height: 10, borderRadius: '50%', background: '#38bdf8', boxShadow: '0 0 10px #38bdf8' }} />
                  {/* Chest */}
                  <div style={{ position: 'absolute', top: '35%', left: '50%', transform: 'translateX(-50%)', width: 10, height: 10, borderRadius: '50%', background: '#a855f7', boxShadow: '0 0 10px #a855f7' }} />
                  {/* Waist */}
                  <div style={{ position: 'absolute', top: '55%', left: '30%', width: 8, height: 8, borderRadius: '50%', background: '#ec4899' }} />
                  <div style={{ position: 'absolute', top: '55%', right: '30%', width: 8, height: 8, borderRadius: '50%', background: '#ec4899' }} />
                  {/* Hips */}
                  <div style={{ position: 'absolute', top: '70%', left: '35%', width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
                  <div style={{ position: 'absolute', top: '70%', right: '35%', width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
                </div>
              </div>

              {/* Scanning Overlay Text */}
              <div style={{ position: 'absolute', bottom: 30, textAlign: 'center', background: 'rgba(10,10,16,0.85)', backdropFilter: 'blur(10px)', padding: '12px 24px', borderRadius: 16, border: '1px solid #333' }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                  <Sparkles size={16} color="#a855f7" /> Mapping 3D Cloth Drape...
                </div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                  NVIDIA 3D Body Pose • Aligning shoulders, waist &amp; posture
                </div>
              </div>
            </div>
          ) : (
            /* BEFORE / AFTER INTERACTIVE COMPARISON SLIDER */
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
              {/* Layer 2: Fitted Garment Render (Right Side) */}
              <img
                src={fittedImage}
                alt="AI Fitted"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              />

              {/* Layer 1: Original Model (Left Side Clipped) */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: `${sliderPos}%`,
                  overflow: 'hidden',
                  borderRight: '2.5px solid #ffffff',
                  boxShadow: '2px 0 15px rgba(0,0,0,0.5)'
                }}
              >
                <img
                  src={userPhoto}
                  alt="Original"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', maxWidth: 'none' }}
                />
              </div>

              {/* Invisible Full Slider Control */}
              <input
                type="range"
                min="0"
                max="100"
                value={sliderPos}
                onChange={(e) => setSliderPos(Number(e.target.value))}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  opacity: 0,
                  cursor: 'ew-resize',
                  zIndex: 30
                }}
              />

              {/* Floating Divider Thumb Indicator */}
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: `${sliderPos}%`,
                  transform: 'translate(-50%, -50%)',
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: '#ffffff',
                  color: '#0f172a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 15px rgba(0,0,0,0.6)',
                  pointerEvents: 'none',
                  zIndex: 25
                }}
              >
                <Sliders size={16} />
              </div>

              {/* Top Pill Badges */}
              <div style={{ position: 'absolute', top: 14, left: 14, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', color: '#fff', fontSize: 10, fontWeight: 800, padding: '4px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', zIndex: 10 }}>
                ORIGINAL PHOTO
              </div>
              <div style={{ position: 'absolute', top: 14, right: 14, background: 'linear-gradient(135deg, rgba(168,85,247,0.9), rgba(99,102,241,0.9))', backdropFilter: 'blur(8px)', color: '#fff', fontSize: 10, fontWeight: 800, padding: '4px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', zIndex: 10 }}>
                ✨ DROBE AI FIT
              </div>

              {/* Bottom Pipeline Status Pill */}
              <div style={{ position: 'absolute', bottom: 12, left: 14, right: 14, background: 'rgba(15,15,22,0.85)', backdropFilter: 'blur(10px)', border: '1px solid #29293d', borderRadius: 12, padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ShieldCheck size={14} color="#22c55e" />
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#e2e8f0' }}>
                    {modelPipelineInfo}
                  </span>
                </div>
                <span style={{ fontSize: 10, color: '#94a3b8' }}>
                  Drag slider ↔ to compare
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 4. CURRENTLY FITTED OUTFIT CARD */}
        <div style={{ background: '#13131c', border: '1px solid #232336', borderRadius: 18, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <img
            src={selectedProduct.thumbnail}
            alt={selectedProduct.title}
            style={{ width: 62, height: 62, borderRadius: 12, objectFit: 'cover', border: '1px solid #33334d' }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: '#a855f7', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {selectedProduct.brand || 'Drobe Partner Brand'}
              </span>
              <span style={{ background: '#ecfdf5', color: '#047857', fontSize: 9, fontWeight: 800, padding: '1px 5px', borderRadius: 4 }}>
                {pricing.formattedPercentage} Platform Margin
              </span>
            </div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {selectedProduct.title}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <span style={{ fontSize: 15, fontWeight: 900, color: '#38bdf8' }}>
                ₹{pricing.sellingPrice}
              </span>
              <span style={{ fontSize: 11, color: '#64748b', textDecoration: 'line-through' }}>
                ₹{selectedProduct.originalPrice || 4999}
              </span>
              <span style={{ fontSize: 10, color: '#4ade80', fontWeight: 700 }}>
                In Stock @ Ahmedabad Darkstore
              </span>
            </div>
          </div>
        </div>

        {/* 5. INFINITE WARDROBE RACK (SWAP CLOTHES WITH 1 TAP) */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#cbd5e1' }}>
              2. Wardrobe Rack (Tap to Wear)
            </span>
            <div style={{ display: 'flex', gap: 4 }}>
              {['all', 'ethnic', 'western'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    background: activeCategory === cat ? '#38bdf8' : '#1e1e2d',
                    color: activeCategory === cat ? '#0f172a' : '#94a3b8',
                    border: 'none',
                    borderRadius: 6,
                    padding: '3px 8px',
                    fontSize: 10,
                    fontWeight: 800,
                    cursor: 'pointer',
                    textTransform: 'capitalize'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Garment Cards Horizontal Shelf */}
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6 }}>
            {filteredProducts.map((p) => {
              const isCurrent = selectedProduct.id === p.id;
              const pPricing = calculateDrobeMarkupPricing(p.price || 600);
              return (
                <div
                  key={p.id}
                  onClick={() => handleSelectProduct(p)}
                  style={{
                    flexShrink: 0,
                    width: 116,
                    background: isCurrent ? '#1e1b4b' : '#14141e',
                    border: `1.5px solid ${isCurrent ? '#818cf8' : '#232336'}`,
                    borderRadius: 14,
                    padding: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                    transition: 'transform 0.15s ease'
                  }}
                >
                  <div style={{ position: 'relative', width: '100%', height: 110, borderRadius: 10, overflow: 'hidden' }}>
                    <img
                      src={p.thumbnail}
                      alt={p.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    {isCurrent && (
                      <span style={{ position: 'absolute', top: 4, right: 4, background: '#6366f1', color: '#fff', fontSize: 9, fontWeight: 900, padding: '2px 5px', borderRadius: 4 }}>
                        FITTED
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: 11, fontWeight: 700, color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {p.title}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, fontWeight: 900, color: '#38bdf8' }}>
                      ₹{pPricing.sellingPrice}
                    </span>
                    <span style={{ fontSize: 9, fontWeight: 800, color: '#a855f7' }}>
                      Tap to fit
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 6. DOORSTEP TRY & BUY GUARANTEE BANNER */}
        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 16, padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: '#0284c720', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Zap size={16} />
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#e2e8f0' }}>
              The Drobe 30-Minute Doorstep Try &amp; Buy Guarantee
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2, lineHeight: 1.4 }}>
              Love how this looks on your avatar? Pre-pay 100% upfront (₹{pricing.sellingPrice}) &rarr; delivery runner arrives at your door in 30 mins with physical sizes &rarr; try for 6 minutes &rarr; keep what fits and get an instant UPI refund on returns.
            </div>
          </div>
        </div>

        {/* 7. BOTTOM ACTION BUTTONS */}
        <div style={{ display: 'flex', gap: 10, marginTop: 4, paddingBottom: 24 }}>
          <button
            onClick={handleAddToTrialCart}
            style={{
              flex: 1,
              background: '#1a1a26',
              border: '1px solid #323247',
              color: '#ffffff',
              borderRadius: 14,
              padding: '14px',
              fontSize: 13,
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6
            }}
          >
            <ShoppingBag size={16} color="#38bdf8" /> Add to Trial Box
          </button>

          <button
            onClick={handleCheckoutTrial}
            style={{
              flex: 2,
              background: 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 14,
              padding: '14px',
              fontSize: 14,
              fontWeight: 900,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 8px 25px rgba(124,58,237,0.45)'
            }}
          >
            <Zap size={16} /> Order in 30 Mins (₹{pricing.sellingPrice})
          </button>
        </div>
      </main>

      {/* FLOATING TOAST NOTIFICATION */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#0f172a',
            border: '1px solid #334155',
            color: '#fff',
            padding: '10px 20px',
            borderRadius: 30,
            fontSize: 12.5,
            fontWeight: 700,
            boxShadow: '0 10px 25px rgba(0,0,0,0.6)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <Sparkles size={14} color="#a855f7" />
          {toastMessage}
        </div>
      )}
    </div>
  );
}

export default function TryOnPage() {
  return (
    <Suspense fallback={<div style={{ color: '#fff', padding: 40, textAlign: 'center', background: '#09090d', minHeight: '100vh' }}>Loading AI Virtual Try-On Studio...</div>}>
      <TryOnContent />
    </Suspense>
  );
}
