'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import { useRouter } from 'next/navigation';

export interface LookbookItem {
  id: string;
  title: string;
  img: string;
  route: string;
}

interface LookbookCarouselProps {
  items: LookbookItem[];
  gender: 'men' | 'women';
}

const REPEAT_FACTOR = 15; // 15 repeats for seamless infinite scrolling

export default function LookbookCarousel({ items, gender }: LookbookCarouselProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const dragDistanceRef = useRef(0);
  const controls = useAnimationControls();

  const [containerWidth, setContainerWidth] = useState(390);

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

  // Geometry
  const cardWidth = Math.min(340, Math.max(280, containerWidth - 48));
  const cardHeight = 454;
  const cardGap = 12;
  const stride = cardWidth + cardGap;
  const centerOffset = (containerWidth - cardWidth) / 2;

  const N = items.length || 1;
  const middleStart = Math.floor(REPEAT_FACTOR / 2) * N;
  const [activeIndex, setActiveIndex] = useState(middleStart);

  // Build repeated items list
  const repeatedItems = useMemo(() => {
    if (!items.length) return [];
    const arr: { item: LookbookItem; origIndex: number; key: string }[] = [];
    for (let r = 0; r < REPEAT_FACTOR; r++) {
      items.forEach((item, idx) => {
        arr.push({
          item,
          origIndex: idx,
          key: `${item.id}-r${r}-i${idx}`
        });
      });
    }
    return arr;
  }, [items]);

  // Reset to middle copy when gender or items change
  useEffect(() => {
    const mid = Math.floor(REPEAT_FACTOR / 2) * (items.length || 1);
    setActiveIndex(mid);
    controls.set({ x: centerOffset - mid * stride });
  }, [gender, items.length, centerOffset, stride, controls]);

  // Smooth slide to a target index with spring physics
  const slideTo = useCallback(
    (targetIdx: number, releaseVelocity: number = 0) => {
      const targetX = centerOffset - targetIdx * stride;
      controls.start({
        x: targetX,
        transition: {
          type: 'spring',
          stiffness: 260,
          damping: 26,
          mass: 0.8,
          velocity: releaseVelocity
        }
      });
      setActiveIndex(targetIdx);
    },
    [centerOffset, stride, controls]
  );

  // Auto-advance every 3.8s (District / Swiggy banner behavior)
  useEffect(() => {
    const timer = setInterval(() => {
      if (isDraggingRef.current) return;
      setActiveIndex((prev) => {
        const next = prev + 1;
        slideTo(next, 0);
        return next;
      });
    }, 3800);

    return () => clearInterval(timer);
  }, [slideTo]);

  // Handle drag end with kinetic swipe detection
  const handleDragEnd = (_: any, info: { offset: { x: number }; velocity: { x: number } }) => {
    // Reset drag flag after micro-delay to prevent accidental clicks
    setTimeout(() => {
      isDraggingRef.current = false;
    }, 80);

    const { offset, velocity } = info;
    let nextIdx = activeIndex;

    // Responsive swipe thresholds tuned for native iOS/Android feel
    if (offset.x < -40 || velocity.x < -240) {
      nextIdx = activeIndex + 1;
    } else if (offset.x > 40 || velocity.x > 240) {
      nextIdx = activeIndex - 1;
    }

    slideTo(nextIdx, velocity.x);
  };

  // Seamless infinite loop wrap-around after animation settles
  const handleAnimationComplete = () => {
    if (!items.length) return;
    const mid = Math.floor(REPEAT_FACTOR / 2) * N;
    const currentMod = ((activeIndex % N) + N) % N;
    // If the index has drifted more than 2 full loops away from middle, wrap invisibly
    if (Math.abs(activeIndex - mid) > N * 2) {
      const wrapped = mid + currentMod;
      controls.set({ x: centerOffset - wrapped * stride });
      setActiveIndex(wrapped);
    }
  };

  // Tap on card: center opens product, peek card smoothly slides into center
  const handleCardClick = (idx: number, route: string) => {
    if (isDraggingRef.current || Math.abs(dragDistanceRef.current) > 6) return;
    if (idx === activeIndex) {
      router.push(route);
    } else {
      slideTo(idx, 0);
    }
  };

  // Tap on pagination dot
  const handleDotClick = (dotIdx: number) => {
    if (isDraggingRef.current) return;
    const currentMod = ((activeIndex % N) + N) % N;
    const diff = dotIdx - currentMod;
    slideTo(activeIndex + diff, 0);
  };

  const activeDotIndex = ((activeIndex % N) + N) % N;

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        background: '#171717',
        overflow: 'hidden',
        userSelect: 'none'
      }}
    >
      {/* Horizontal Carousel Track */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: cardHeight + 12,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          zIndex: 2
        }}
      >
        <motion.div
          animate={controls}
          initial={{ x: centerOffset - activeIndex * stride }}
          drag="x"
          dragMomentum={false}
          dragDirectionLock
          dragConstraints={{ left: -1000000, right: 1000000 }}
          dragElastic={0.08}
          onDragStart={() => {
            isDraggingRef.current = true;
            dragDistanceRef.current = 0;
          }}
          onDrag={(_, info) => {
            dragDistanceRef.current = info.offset.x;
          }}
          onDragEnd={handleDragEnd}
          onAnimationComplete={handleAnimationComplete}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: cardGap,
            cursor: 'grab',
            touchAction: 'pan-y', // Critical for native vertical page scrolling on mobile
            willChange: 'transform'
          }}
        >
          {repeatedItems.map((entry, i) => {
            const isCenter = i === activeIndex;
            const isAdjacent = Math.abs(i - activeIndex) <= 1;
            const isNear = Math.abs(i - activeIndex) <= 3;

            // Virtualize far away cards for optimal 60fps performance
            if (!isNear) {
              return (
                <div
                  key={entry.key}
                  style={{
                    width: cardWidth,
                    height: cardHeight,
                    flexShrink: 0
                  }}
                />
              );
            }

            return (
              <motion.div
                key={entry.key}
                animate={{
                  scale: isCenter ? 1 : 0.93,
                  opacity: isCenter ? 1 : 0.72,
                  y: isCenter ? 0 : 5
                }}
                transition={{
                  type: 'spring',
                  stiffness: 260,
                  damping: 26,
                  mass: 0.8
                }}
                onClick={() => handleCardClick(i, entry.item.route)}
                style={{
                  width: cardWidth,
                  height: cardHeight,
                  borderRadius: 20,
                  overflow: 'hidden',
                  flexShrink: 0,
                  boxShadow: isCenter
                    ? '0 12px 32px rgba(0, 0, 0, 0.58)'
                    : '0 6px 18px rgba(0, 0, 0, 0.38)',
                  cursor: 'pointer',
                  transformOrigin: 'center center',
                  backgroundColor: '#202020'
                }}
              >
                <img
                  src={entry.item.img}
                  alt={entry.item.title}
                  draggable={false}
                  loading={isAdjacent ? 'eager' : 'lazy'}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                    pointerEvents: 'none'
                  }}
                />
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Pagination Dots (District / Swiggy animated pill indicator) */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 6,
          marginTop: 8,
          marginBottom: 4,
          position: 'relative',
          zIndex: 10
        }}
      >
        {items.map((_, idx) => {
          const isActive = idx === activeDotIndex;
          return (
            <div
              key={idx}
              onClick={() => handleDotClick(idx)}
              style={{
                width: isActive ? 18 : 6,
                height: 6,
                borderRadius: 999,
                backgroundColor: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.32)',
                boxShadow: isActive ? '0 1px 4px rgba(255, 255, 255, 0.3)' : 'none',
                transition: 'all 0.32s cubic-bezier(0.25, 1, 0.5, 1)',
                cursor: 'pointer'
              }}
            />
          );
        })}
      </div>

      {/* Authentic Home Page End Curve from Drobe */}
      <div
        style={{
          width: '100%',
          position: 'relative',
          marginTop: -36,
          zIndex: 1,
          pointerEvents: 'none'
        }}
      >
        <img
          src="/assets/images/hp_end_curve_dark.webp"
          alt=""
          style={{
            width: '100%',
            display: 'block',
            objectFit: 'cover'
          }}
        />
      </div>
    </div>
  );
}
