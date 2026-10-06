'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { PRODUCTS } from '@/data/catalog';
import confetti from 'canvas-confetti';

function TryOnContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToCart } = useApp();

  const productId = searchParams.get('product') || PRODUCTS[0].id;
  const selectedProduct = PRODUCTS.find((p) => p.id === productId) || PRODUCTS[0];

  const [step, setStep] = useState<'upload' | 'generating' | 'result'>('upload');
  const [userPhoto] = useState<string>('/assets/images/vton_intro_dark.webp');
  const [sliderPos, setSliderPos] = useState(50); // comparison slider %

  const handleStartGeneration = () => {
    setStep('generating');
    setTimeout(() => {
      setStep('result');
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
    }, 2800);
  };

  const handleAddAndOrder = () => {
    addToCart(selectedProduct, 'L', 'tryAndBuy');
    router.push('/cart');
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', background: '#121217', overflow: 'hidden' }}>
      {/* Header */}
      <header
        style={{
          padding: '14px 16px',
          background: '#121217',
          borderBottom: '1px solid #22222d',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            onClick={() => router.back()}
            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', padding: 0 }}
          >
            <img src="/assets/icons/back_arrow.svg" alt="Back" style={{ width: 22, height: 22 }} />
          </button>
          <div>
            <h1 style={{ fontSize: 17, fontWeight: 800, color: '#fff' }}>AI Virtual Try-On</h1>
            <p style={{ fontSize: 11, color: '#888' }}>VTON Studio • See fits on yourself</p>
          </div>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)', padding: '4px 10px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 4 }}>
          <img src="/assets/icons/create_tryon_dark.svg" alt="" style={{ width: 14, height: 14, filter: 'brightness(0) invert(1)' }} />
          <span style={{ fontSize: 11, fontWeight: 800, color: '#fff' }}>AI Mode</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 80px' }}>
        {step === 'upload' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Target Outfit Pill */}
            <div
              style={{
                background: '#1c1c26',
                border: '1px solid #2d2d3e',
                borderRadius: 16,
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 12
              }}
            >
              <img
                src={selectedProduct.thumbnail}
                alt=""
                style={{ width: 50, height: 50, borderRadius: 12, objectFit: 'cover' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: '#a855f7', textTransform: 'uppercase' }}>Selected Outfit</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{selectedProduct.title}</div>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#34d399' }}>₹{selectedProduct.price}</div>
              </div>
            </div>

            {/* Photo Preview Container */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: 380,
                borderRadius: 24,
                overflow: 'hidden',
                background: '#191922',
                border: '2px dashed #38384d',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <img
                src={userPhoto}
                alt="User Selfie"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />

              {/* Upload Controls Overlay */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 16,
                  display: 'flex',
                  gap: 12,
                  zIndex: 10
                }}
              >
                <div
                  style={{
                    background: 'rgba(20,20,30,0.85)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid #444',
                    borderRadius: 20,
                    padding: '8px 16px',
                    color: '#fff',
                    fontSize: 12,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <img src="/assets/icons/camera.svg" alt="" style={{ width: 16, height: 16 }} />
                  Knot Pose Model Ready
                </div>
              </div>
            </div>

            {/* 3 Step Instruction Guide */}
            <div style={{ background: '#191924', borderRadius: 18, padding: '16px', border: '1px solid #282838' }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', marginBottom: 10 }}>How AI Try-On Works:</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12, color: '#aaa' }}>
                <div>1. 📸 Ensure your photo has good front lighting</div>
                <div>2. ✨ AI automatically maps cloth drapery to your posture</div>
                <div>3. ⚡ Try before you buy: order and receive in 60 minutes</div>
              </div>
            </div>

            {/* Generate CTA Button */}
            <button
              onClick={handleStartGeneration}
              style={{
                background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: 16,
                padding: '16px',
                fontSize: 15,
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 4px 20px rgba(168,85,247,0.4)'
              }}
            >
              <img src="/assets/icons/create_tryon_dark.svg" alt="" style={{ width: 18, height: 18, filter: 'brightness(0) invert(1)' }} />
              Generate AI Fit Now
            </button>
          </div>
        )}

        {step === 'generating' && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '70vh',
              textAlign: 'center'
            }}
          >
            {/* Scanning Laser Box */}
            <div
              style={{
                position: 'relative',
                width: 260,
                height: 360,
                borderRadius: 20,
                overflow: 'hidden',
                background: '#222',
                marginBottom: 24,
                boxShadow: '0 0 30px rgba(168,85,247,0.5)'
              }}
            >
              <img src={userPhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

              {/* Animated Laser Bar */}
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: 0,
                  height: 3,
                  background: '#a855f7',
                  boxShadow: '0 0 15px 4px #ec4899',
                  animation: 'cyanPulse 1.2s infinite alternate ease-in-out'
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <img src="/assets/icons/refresh.svg" alt="" style={{ width: 18, height: 18 }} />
              <h3 style={{ fontSize: 17, fontWeight: 800, color: '#fff' }}>Generating Virtual Fit...</h3>
            </div>
            <p style={{ fontSize: 12, color: '#888' }}>Applying fabric physics and contours to your posture</p>
          </div>
        )}

        {step === 'result' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Interactive Before & After Slider */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: 440,
                borderRadius: 24,
                overflow: 'hidden',
                background: '#000',
                boxShadow: '0 10px 30px rgba(0,0,0,0.6)'
              }}
            >
              {/* After (Fitted Outfit) */}
              <img
                src={selectedProduct.images[0] || selectedProduct.thumbnail}
                alt="After"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              />

              {/* Before Overlay with Clip */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: `${sliderPos}%`,
                  overflow: 'hidden',
                  borderRight: '2px solid #ffffff'
                }}
              >
                <img
                  src={userPhoto}
                  alt="Before"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              {/* Slider Controller */}
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

              {/* Tags */}
              <span style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 8 }}>
                ORIGINAL
              </span>
              <span style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(168,85,247,0.85)', color: '#fff', fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 8 }}>
                AI FITTED
              </span>
            </div>

            {/* Slider Guidance */}
            <div style={{ textAlign: 'center', fontSize: 12, color: '#888' }}>
              Drag horizontally across image to compare fits ↔
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setStep('upload')}
                style={{
                  flex: 1,
                  background: '#22222d',
                  border: '1px solid #363646',
                  color: '#fff',
                  borderRadius: 14,
                  padding: '14px',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Try Another
              </button>

              <button
                onClick={handleAddAndOrder}
                style={{
                  flex: 2,
                  background: 'linear-gradient(135deg, #6678ff 0%, #8b5cf6 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 14,
                  padding: '14px',
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 4px 15px rgba(102,120,255,0.4)'
                }}
              >
                <img src="/assets/icons/bag_outline.svg" alt="" style={{ width: 16, height: 16, filter: 'brightness(0) invert(1)' }} />
                Order in 60 Mins
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function TryOnPage() {
  return (
    <Suspense fallback={<div style={{ color: '#fff', padding: 20, textAlign: 'center' }}>Loading AI Try-On Studio...</div>}>
      <TryOnContent />
    </Suspense>
  );
}
