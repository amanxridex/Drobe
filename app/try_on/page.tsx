'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { PRODUCTS, Product } from '@/data/catalog';
import { calculateDrobeMarkupPricing } from '@/app/lib/darkstoreData';
import confetti from 'canvas-confetti';
import { 
  ArrowLeft, 
  Upload, 
  Sparkles, 
  ShoppingBag, 
  Check, 
  Sliders
} from 'lucide-react';

const PRESET_MODELS = [
  {
    id: 'model-1',
    name: 'Ethnic Model',
    image: '/assets/real/women/asset_107_catalog_ingestion_pixyle_input_101790c1aa69d43650465fdd71ed22a1a7d251427b181416dd5127ffd9c060d3.jpg',
  },
  {
    id: 'model-2',
    name: 'Casual Model',
    image: '/assets/real/cat_women_dresses_card.png',
  },
  {
    id: 'model-3',
    name: 'Men Ethnic',
    image: '/assets/real/cat_ethnic.webp',
  },
  {
    id: 'model-4',
    name: 'Men Casual',
    image: '/assets/real/cat_top.webp',
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

  const [userPhoto, setUserPhoto] = useState<string>(PRESET_MODELS[0].image);
  const [activeModelId, setActiveModelId] = useState<string>(PRESET_MODELS[0].id);
  const [hasCustomPhoto, setHasCustomPhoto] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Restore saved photo
  useEffect(() => {
    try {
      const saved = localStorage.getItem('drobe_vton_user_photo');
      if (saved) {
        setUserPhoto(saved);
        setHasCustomPhoto(true);
        setActiveModelId('custom');
      }
    } catch {}
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const b64 = event.target?.result as string;
      setUserPhoto(b64);
      setHasCustomPhoto(true);
      setActiveModelId('custom');
      try {
        localStorage.setItem('drobe_vton_user_photo', b64);
      } catch {}
      triggerToast('Photo updated');
      runTryOn();
    };
    reader.readAsDataURL(file);
  };

  const runTryOn = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setSliderPos(50);
      confetti({ particleCount: 35, spread: 50, origin: { y: 0.6 } });
    }, 1200);
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    runTryOn();
  };

  const handleSelectModel = (m: typeof PRESET_MODELS[0]) => {
    setActiveModelId(m.id);
    setUserPhoto(m.image);
    runTryOn();
  };

  const handleOrderTrial = () => {
    addToCart(selectedProduct, 'M', 'tryAndBuy');
    router.push('/cart');
  };

  const pricing = calculateDrobeMarkupPricing(selectedProduct.price || 600);
  const garmentImage = selectedProduct.images?.[0] || selectedProduct.thumbnail;

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0d',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* 1. MINIMALIST TOP NAV */}
      <header style={{
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #181820',
        background: 'rgba(10, 10, 13, 0.85)',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <button
          onClick={() => router.back()}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            padding: 4,
            display: 'flex',
            alignItems: 'center'
          }}
          aria-label="Back"
        >
          <ArrowLeft size={20} />
        </button>

        <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em' }}>
          Virtual Dressing Room
        </span>

        {/* Change Photo Pill */}
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            background: '#1a1a24',
            border: '1px solid #2d2d3d',
            color: '#fff',
            fontSize: 12,
            fontWeight: 600,
            padding: '6px 12px',
            borderRadius: 20,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          <Upload size={12} color="#a855f7" />
          <span>Upload</span>
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleUpload}
          accept="image/*"
          style={{ display: 'none' }}
        />
      </header>

      {/* 2. MAIN MOBILE CONTAINER */}
      <main style={{
        flex: 1,
        maxWidth: 480,
        width: '100%',
        margin: '0 auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16
      }}>

        {/* 3. HERO FITTING MIRROR (BEFORE / AFTER) */}
        <div style={{
          position: 'relative',
          width: '100%',
          height: 440,
          borderRadius: 24,
          overflow: 'hidden',
          background: '#121218',
          border: '1px solid #20202c',
          boxShadow: '0 12px 30px rgba(0,0,0,0.5)'
        }}>
          {isGenerating ? (
            /* SIMPLE SLEEK SCANNING */
            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
              <img
                src={userPhoto}
                alt="Fitting"
                style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.4)' }}
              />
              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10
              }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: 'rgba(168, 85, 247, 0.15)',
                  border: '1px solid #a855f7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Sparkles size={20} color="#c084fc" />
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>
                  Fitting to your body...
                </span>
              </div>
            </div>
          ) : (
            /* CLEAN BEFORE / AFTER SLIDER */
            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
              {/* Fitted Layer */}
              <img
                src={garmentImage}
                alt="Fitted"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              />

              {/* Original Layer */}
              <div style={{
                position: 'absolute',
                inset: 0,
                width: `${sliderPos}%`,
                overflow: 'hidden',
                borderRight: '2px solid #ffffff'
              }}>
                <img
                  src={userPhoto}
                  alt="Original"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', maxWidth: 'none' }}
                />
              </div>

              {/* Slider Input */}
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
                  zIndex: 20
                }}
              />

              {/* Minimal Center Thumb */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: `${sliderPos}%`,
                transform: 'translate(-50%, -50%)',
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: '#ffffff',
                color: '#000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
                pointerEvents: 'none',
                zIndex: 10
              }}>
                <Sliders size={14} />
              </div>

              {/* Clean Labels */}
              <span style={{
                position: 'absolute',
                top: 12,
                left: 12,
                background: 'rgba(0,0,0,0.65)',
                backdropFilter: 'blur(6px)',
                fontSize: 10,
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: 6,
                letterSpacing: '0.04em'
              }}>
                YOU
              </span>

              <span style={{
                position: 'absolute',
                top: 12,
                right: 12,
                background: 'rgba(168, 85, 247, 0.85)',
                backdropFilter: 'blur(6px)',
                fontSize: 10,
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: 6,
                letterSpacing: '0.04em'
              }}>
                AI FIT
              </span>
            </div>
          )}
        </div>

        {/* 4. CLEAN MODEL SELECTOR CHIPS */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', overflowX: 'auto', paddingBottom: 2 }}>
          {hasCustomPhoto && (
            <button
              onClick={() => setActiveModelId('custom')}
              style={{
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '5px 10px',
                borderRadius: 20,
                background: activeModelId === 'custom' ? '#2e1065' : '#14141c',
                border: `1px solid ${activeModelId === 'custom' ? '#a855f7' : '#232330'}`,
                color: '#fff',
                cursor: 'pointer',
                fontSize: 11,
                fontWeight: 600
              }}
            >
              <img src={userPhoto} alt="" style={{ width: 18, height: 18, borderRadius: '50%', objectFit: 'cover' }} />
              <span>Your Photo</span>
            </button>
          )}

          {PRESET_MODELS.map((m) => {
            const isSel = activeModelId === m.id;
            return (
              <button
                key={m.id}
                onClick={() => handleSelectModel(m)}
                style={{
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '5px 10px',
                  borderRadius: 20,
                  background: isSel ? '#1e1b4b' : '#14141c',
                  border: `1px solid ${isSel ? '#818cf8' : '#232330'}`,
                  color: isSel ? '#fff' : '#94a3b8',
                  cursor: 'pointer',
                  fontSize: 11,
                  fontWeight: 600
                }}
              >
                <img src={m.image} alt="" style={{ width: 18, height: 18, borderRadius: '50%', objectFit: 'cover' }} />
                <span>{m.name}</span>
              </button>
            );
          })}
        </div>

        {/* 5. MINIMALIST HORIZONTAL WARDROBE RACK */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            Select Clothes to Try On
          </div>

          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
            {PRODUCTS.slice(0, 12).map((p) => {
              const isCurrent = selectedProduct.id === p.id;
              const pPrice = calculateDrobeMarkupPricing(p.price || 600);
              return (
                <div
                  key={p.id}
                  onClick={() => handleSelectProduct(p)}
                  style={{
                    flexShrink: 0,
                    width: 105,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 5
                  }}
                >
                  <div style={{
                    width: '100%',
                    height: 120,
                    borderRadius: 14,
                    overflow: 'hidden',
                    background: '#161622',
                    border: isCurrent ? '2px solid #a855f7' : '1px solid #232330',
                    boxShadow: isCurrent ? '0 0 12px rgba(168,85,247,0.35)' : 'none'
                  }}>
                    <img
                      src={p.thumbnail}
                      alt={p.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div style={{
                    fontSize: 11,
                    fontWeight: isCurrent ? 700 : 500,
                    color: isCurrent ? '#fff' : '#cbd5e1',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {p.title}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#38bdf8' }}>
                    ₹{pPrice.sellingPrice}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 6. BOTTOM ACTION BAR (CLEAN & PUNCHY) */}
        <div style={{
          background: '#13131c',
          border: '1px solid #222230',
          borderRadius: 20,
          padding: '14px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          marginTop: 'auto'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 220 }}>
                {selectedProduct.title}
              </div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                30-Min Delivery · Ahmedabad Darkstore
              </div>
            </div>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#38bdf8' }}>
              ₹{pricing.sellingPrice}
            </div>
          </div>

          <button
            onClick={handleOrderTrial}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 14,
              padding: '13px',
              fontSize: 14,
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 6px 20px rgba(124,58,237,0.35)'
            }}
          >
            <ShoppingBag size={16} />
            <span>Try at Home in 30 Mins (₹{pricing.sellingPrice})</span>
          </button>

          <div style={{ textAlign: 'center', fontSize: 10.5, color: '#64748b' }}>
            Pre-pay 100% upfront • 6-min doorstep fitting • Instant UPI return refund
          </div>
        </div>

      </main>

      {/* TOAST */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#1e1b4b',
          border: '1px solid #4338ca',
          color: '#fff',
          padding: '8px 16px',
          borderRadius: 20,
          fontSize: 12,
          fontWeight: 600,
          zIndex: 100
        }}>
          {toastMessage}
        </div>
      )}
    </div>
  );
}

export default function TryOnPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#0a0a0d', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Dressing Room...</div>}>
      <TryOnContent />
    </Suspense>
  );
}
