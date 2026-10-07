'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import BottomNav from '@/components/BottomNav';
import { REELS_DATA, PRODUCTS } from '@/data/catalog';
import confetti from 'canvas-confetti';

export default function TrendsPage() {
  const router = useRouter();
  const { addToCart, gender, setGender } = useApp();

  const [activeReelIdx, setActiveReelIdx] = useState(0);
  const [likedReels, setLikedReels] = useState<Record<string, boolean>>({});
  const [isMuted, setIsMuted] = useState(true);

  // 100% Strict gender separation for Trends
  const genderReels = REELS_DATA.filter((r) => r.gender === gender);
  const currentReel = genderReels[activeReelIdx % (genderReels.length || 1)] || REELS_DATA[0];
  const linkedProduct = PRODUCTS.find((p) => p.id === currentReel.productId) || PRODUCTS.find((p) => p.gender === gender) || PRODUCTS[0];
  const isLiked = likedReels[currentReel.id];

  // Reset index when gender changes
  React.useEffect(() => {
    setActiveReelIdx(0);
  }, [gender]);

  const handleLike = () => {
    setLikedReels((prev) => ({ ...prev, [currentReel.id]: !prev[currentReel.id] }));
    if (!isLiked) {
      confetti({ particleCount: 30, spread: 50, origin: { x: 0.85, y: 0.6 } });
    }
  };

  const handleNextReel = () => {
    setActiveReelIdx((prev) => (prev + 1) % genderReels.length);
  };

  const handlePrevReel = () => {
    setActiveReelIdx((prev) => (prev - 1 + genderReels.length) % genderReels.length);
  };

  const handleQuickAdd = () => {
    addToCart(linkedProduct, 'L', 'tryAndBuy');
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', background: '#000000', overflow: 'hidden', position: 'relative' }}>
      {/* Video Player Area */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <video
          key={currentReel.id}
          src={currentReel.videoUrl}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />

        {/* Top Header Overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            padding: '14px 16px',
            background: 'linear-gradient(180deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 20
          }}
        >
          {/* Left: PICKS + Gender switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 17, fontWeight: 900, color: '#fff', letterSpacing: -0.5 }}>PICKS</span>
            <div
              style={{
                display: 'flex',
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(8px)',
                borderRadius: 9999,
                padding: 2,
                border: '1px solid rgba(255,255,255,0.2)'
              }}
            >
              <button
                onClick={() => setGender('men')}
                style={{
                  background: gender === 'men' ? '#2563eb' : 'transparent',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 9999,
                  padding: '3px 10px',
                  fontSize: 11,
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                Men
              </button>
              <button
                onClick={() => setGender('women')}
                style={{
                  background: gender === 'women' ? '#ec4899' : 'transparent',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 9999,
                  padding: '3px 10px',
                  fontSize: 11,
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                Women
              </button>
            </div>
          </div>

          {/* Right: Mute / Sound button */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            style={{
              background: 'rgba(0,0,0,0.5)',
              border: 'none',
              borderRadius: '50%',
              width: 34,
              height: 34,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            <span style={{ fontSize: 14 }}>{isMuted ? '🔇' : '🔊'}</span>
          </button>
        </div>

        {/* Vertical Swipe Navigation Arrows */}
        <div
          style={{
            position: 'absolute',
            right: 14,
            top: '40%',
            transform: 'translateY(-50%)',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            zIndex: 30
          }}
        >
          {/* Like */}
          <button
            onClick={handleLike}
            style={{
              background: 'none',
              border: 'none',
              color: isLiked ? '#ff2a85' : '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              cursor: 'pointer'
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <img
                src={isLiked ? '/assets/icons/like_filled.svg' : '/assets/icons/discover_like.svg'}
                alt="Like"
                style={{ width: 22, height: 22 }}
              />
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>
              {isLiked ? 'Liked' : currentReel.likes}
            </span>
          </button>

          {/* Try On */}
          <Link
            href={`/try_on?product=${linkedProduct.id}`}
            style={{
              textDecoration: 'none',
              color: '#fff',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <img src="/assets/icons/create_tryon_dark.svg" alt="Try On" style={{ width: 20, height: 20 }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 700 }}>Try-On</span>
          </Link>

          {/* Share */}
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: currentReel.caption, url: window.location.href }).catch(() => {});
              }
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#fff',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              cursor: 'pointer'
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <img src="/assets/icons/share.svg" alt="Share" style={{ width: 18, height: 18 }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 700 }}>Share</span>
          </button>
        </div>

        {/* Next / Prev Reel Steppers */}
        <div
          style={{
            position: 'absolute',
            right: 14,
            bottom: 120,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            zIndex: 30
          }}
        >
          <button
            onClick={handlePrevReel}
            style={{
              background: 'rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '50%',
              width: 32,
              height: 32,
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14
            }}
          >
            <img src="/assets/icons/up.svg" alt="Up" style={{ width: 12, height: 12, filter: 'brightness(0) invert(1)' }} />
          </button>

          <button
            onClick={handleNextReel}
            style={{
              background: 'rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '50%',
              width: 32,
              height: 32,
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14
            }}
          >
            <img src="/assets/icons/down.svg" alt="Down" style={{ width: 12, height: 12, filter: 'brightness(0) invert(1)' }} />
          </button>
        </div>

        {/* Bottom Overlay: Creator info & Product Card */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '16px 14px 18px',
            background: 'linear-gradient(0deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0) 100%)',
            zIndex: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 12
          }}
        >
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>{currentReel.creator}</span>
              <span style={{ fontSize: 10, background: '#38bdf8', color: '#000', padding: '1px 5px', borderRadius: 6, fontWeight: 900 }}>
                VERIFIED
              </span>
            </div>
            <p style={{ fontSize: 12, color: '#ddd', marginTop: 4, lineHeight: '16px' }}>
              {currentReel.caption}
            </p>
          </div>

          {/* Linked Product Card with Instant Try & Buy */}
          <div
            style={{
              background: 'rgba(25, 25, 35, 0.85)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 16,
              padding: '10px 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10
            }}
          >
            <div
              onClick={() => router.push(`/product/${linkedProduct.id}`)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', flex: 1 }}
            >
              <img
                src={linkedProduct.thumbnail}
                alt=""
                style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 160 }}>
                  {linkedProduct.title}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                  <span style={{ fontSize: 12, fontWeight: 900, color: '#38bdf8' }}>₹{linkedProduct.price}</span>
                  <span style={{ fontSize: 10, color: '#888', textDecoration: 'line-through' }}>₹{linkedProduct.originalPrice}</span>
                  <span style={{ fontSize: 9, fontWeight: 800, color: '#34d399', background: '#0f382c', padding: '1px 5px', borderRadius: 4 }}>
                    60-MIN TRY & BUY
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleQuickAdd}
              style={{
                background: '#6678ff',
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                padding: '8px 14px',
                fontSize: 12,
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              <img src="/assets/icons/bag_outline.svg" alt="" style={{ width: 14, height: 14, filter: 'brightness(0) invert(1)' }} />
              Try Fit
            </button>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
