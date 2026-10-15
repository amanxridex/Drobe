'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { slugify } from '@/app/lib/supabaseClient';

export interface WideBanner {
  name: string;
  img: string;
  deeplink?: string;
}

interface WideBannerCarouselProps {
  banners: WideBanner[];
}

export default function WideBannerCarousel({ banners }: WideBannerCarouselProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const controls = useAnimationControls();
  const isDraggingRef = useRef(false);
  const dragDistanceRef = useRef(0);

  const [containerWidth, setContainerWidth] = useState(390);
  const [activeIndex, setActiveIndex] = useState(0);

  // Measure container width responsively
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const w = containerRef.current.offsetWidth;
        if (w > 0) setContainerWidth(w);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const count = banners.length || 1;
  const cardWidth = Math.min(346, Math.max(280, containerWidth - 44));
  const cardGap = 12;
  const stride = cardWidth + cardGap;
  const leftPadding = 14;

  // Calculate target X position so current banner sits at leftPadding
  const getTargetX = useCallback(
    (index: number) => {
      return -(index * stride);
    },
    [stride]
  );

  // Slide with spring physics
  const slideTo = useCallback(
    (targetIdx: number, releaseVelocity: number = 0) => {
      // Clamp between 0 and count - 1
      const clamped = Math.max(0, Math.min(count - 1, targetIdx));
      const targetX = getTargetX(clamped);

      controls.start({
        x: targetX,
        transition: {
          type: 'spring',
          stiffness: 280,
          damping: 28,
          mass: 0.8,
          velocity: releaseVelocity
        }
      });
      setActiveIndex(clamped);
    },
    [count, getTargetX, controls]
  );

  // Auto-advance every 4s, looping back to 0
  useEffect(() => {
    if (count <= 1) return;
    const timer = setInterval(() => {
      if (isDraggingRef.current) return;
      setActiveIndex((prev) => {
        const next = (prev + 1) % count;
        slideTo(next, 0);
        return next;
      });
    }, 4200);

    return () => clearInterval(timer);
  }, [count, slideTo]);

  // Handle drag end
  const handleDragEnd = (_: any, info: { offset: { x: number }; velocity: { x: number } }) => {
    setTimeout(() => {
      isDraggingRef.current = false;
    }, 80);

    const { offset, velocity } = info;
    let nextIdx = activeIndex;

    if (offset.x < -35 || velocity.x < -220) {
      nextIdx = activeIndex + 1;
    } else if (offset.x > 35 || velocity.x > 220) {
      nextIdx = activeIndex - 1;
    }

    slideTo(nextIdx, velocity.x);
  };

  const handleBannerClick = (banner: WideBanner) => {
    if (isDraggingRef.current || Math.abs(dragDistanceRef.current) > 6) return;
    const destination = banner.name
      ? `/brand/${slugify(banner.name)}`
      : banner.deeplink || '/categories';
    router.push(destination);
  };

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        padding: '2px 0 16px',
        userSelect: 'none'
      }}
    >
      {/* Sliding Track */}
      <div
        style={{
          width: '100%',
          overflow: 'hidden',
          padding: `0 ${leftPadding}px`,
          boxSizing: 'border-box'
        }}
      >
        <motion.div
          animate={controls}
          initial={{ x: 0 }}
          drag="x"
          dragMomentum={false}
          dragDirectionLock
          dragConstraints={{
            left: -(count - 1) * stride - 20,
            right: 20
          }}
          dragElastic={0.12}
          onDragStart={() => {
            isDraggingRef.current = true;
            dragDistanceRef.current = 0;
          }}
          onDrag={(_, info) => {
            dragDistanceRef.current = info.offset.x;
          }}
          onDragEnd={handleDragEnd}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: cardGap,
            cursor: 'grab',
            touchAction: 'pan-y', // Critical for native mobile page scrolling
            willChange: 'transform'
          }}
        >
          {banners.map((banner, idx) => {
            const isCurrent = idx === activeIndex;
            return (
              <motion.div
                key={idx}
                animate={{
                  scale: isCurrent ? 1 : 0.98,
                  opacity: isCurrent ? 1 : 0.88
                }}
                transition={{
                  type: 'spring',
                  stiffness: 280,
                  damping: 28
                }}
                onClick={() => handleBannerClick(banner)}
                style={{
                  flexShrink: 0,
                  width: cardWidth,
                  borderRadius: 16,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  boxShadow: isCurrent
                    ? '0 6px 22px rgba(0, 0, 0, 0.55)'
                    : '0 4px 14px rgba(0, 0, 0, 0.35)',
                  backgroundColor: '#1f1f23',
                  position: 'relative',
                  transformOrigin: 'left center'
                }}
              >
                <img
                  src={banner.img}
                  alt={banner.name}
                  draggable={false}
                  loading={idx <= 2 ? 'eager' : 'lazy'}
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    pointerEvents: 'none'
                  }}
                />
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Pagination Dots (Swiggy / District App active pill indicator) */}
      {count > 1 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 5,
            marginTop: 10
          }}
        >
          {banners.map((_, dotIdx) => {
            const isActive = dotIdx === activeIndex;
            return (
              <div
                key={dotIdx}
                onClick={() => slideTo(dotIdx, 0)}
                style={{
                  width: isActive ? 16 : 5,
                  height: 5,
                  borderRadius: 999,
                  backgroundColor: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.28)',
                  boxShadow: isActive ? '0 1px 4px rgba(255, 255, 255, 0.3)' : 'none',
                  transition: 'all 0.3s cubic-bezier(0.25, 1, 0.5, 1)',
                  cursor: 'pointer'
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
