'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { slugify } from '@/app/lib/supabaseClient';

export interface StackingCardItem {
  name: string;
  img: string;
  deeplink?: string;
  tagline?: string;
}

interface StackingCardsHeroProps {
  cards: StackingCardItem[];
  autoPlayInterval?: number; // ms, default 3800
}

export default function StackingCardsHero({
  cards,
  autoPlayInterval = 3800
}: StackingCardsHeroProps) {
  const router = useRouter();
  const count = cards?.length || 0;

  // activeIndex is the current top card on the stack
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [isPaused, setIsPaused] = useState(false);

  // Drag tracking to prevent accidental click navigation while swiping
  const dragDistanceRef = useRef(0);
  const isDraggingRef = useRef(false);

  // Advance to next card (comes ON TOP of current card)
  const nextCard = useCallback(() => {
    if (count <= 1) return;
    setDirection('forward');
    setActiveIndex((prev) => (prev + 1) % count);
  }, [count]);

  // Go to previous card (top card slides off, revealing the one underneath)
  const prevCard = useCallback(() => {
    if (count <= 1) return;
    setDirection('backward');
    setActiveIndex((prev) => (prev - 1 + count) % count);
  }, [count]);

  // Jump to specific card
  const goToCard = (index: number) => {
    if (index === activeIndex) return;
    setDirection(index > activeIndex ? 'forward' : 'backward');
    setActiveIndex(index);
  };

  // Autoplay timer: automatically stacks the next card on top every autoPlayInterval
  useEffect(() => {
    if (isPaused || count <= 1) return;
    const timer = setInterval(() => {
      nextCard();
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [isPaused, count, autoPlayInterval, nextCard]);

  // Handle clicking on the top card to navigate
  const handleCardClick = (card: StackingCardItem) => {
    if (isDraggingRef.current || Math.abs(dragDistanceRef.current) > 8) return;
    const destination = card.name
      ? `/brand/${slugify(card.name)}`
      : card.deeplink || '/categories';
    router.push(destination);
  };

  if (!cards || count === 0) return null;

  // We determine which cards to render in the stacked deck:
  // - Top card: activeIndex (depth 0, highest z-index)
  // - 1st card underneath: (activeIndex - 1 + count) % count OR the prior history
  //   In a true "deck coming on top", the cards underneath are the ones that were previously stacked!
  //   Underneath card 1: (activeIndex - 1 + count) % count
  //   Underneath card 2: (activeIndex - 2 + count) % count
  // This visually displays the existing cards remaining stacked underneath!
  const depth1Index = (activeIndex - 1 + count) % count;
  const depth2Index = (activeIndex - 2 + count) % count;

  const currentCard = cards[activeIndex];
  const cardBelow1 = count > 1 ? cards[depth1Index] : null;
  const cardBelow2 = count > 2 ? cards[depth2Index] : null;

  return (
    <section
      style={{
        width: '100%',
        padding: '6px 0 22px',
        position: 'relative',
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        overflow: 'hidden'
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => {
        setTimeout(() => setIsPaused(false), 2500);
      }}
    >
      {/* Deck Viewport Container */}
      <div
        style={{
          width: '100%',
          maxWidth: 410,
          padding: '0 16px',
          boxSizing: 'border-box',
          position: 'relative',
          height: 184, // Gives room for the stacked cards peeking below
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start'
        }}
      >
        {/* ========================================================
            DEPTH 2 CARD (Bottom-most peek in stack)
            ======================================================== */}
        {cardBelow2 && (
          <div
            onClick={() => goToCard(depth2Index)}
            style={{
              position: 'absolute',
              top: 0,
              width: 'calc(100% - 32px)',
              maxWidth: 378,
              aspectRatio: '2.4 / 1',
              borderRadius: 18,
              overflow: 'hidden',
              transform: 'translateY(24px) scale(0.88)',
              transformOrigin: 'top center',
              zIndex: 10,
              filter: 'brightness(0.42)',
              boxShadow: '0 6px 18px rgba(0, 0, 0, 0.45)',
              transition: 'transform 0.4s cubic-bezier(0.2, 0.9, 0.3, 1), filter 0.4s ease',
              cursor: 'pointer'
            }}
          >
            <img
              src={cardBelow2.img}
              alt={cardBelow2.name}
              draggable={false}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block'
              }}
            />
          </div>
        )}

        {/* ========================================================
            DEPTH 1 CARD (Directly below active card, peeking out)
            Exact look from user's screenshot where the card below peeks out!
            ======================================================== */}
        {cardBelow1 && (
          <div
            onClick={() => goToCard(depth1Index)}
            style={{
              position: 'absolute',
              top: 0,
              width: 'calc(100% - 32px)',
              maxWidth: 378,
              aspectRatio: '2.4 / 1',
              borderRadius: 18,
              overflow: 'hidden',
              transform: 'translateY(13px) scale(0.94)',
              transformOrigin: 'top center',
              zIndex: 20,
              filter: 'brightness(0.68)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.55)',
              transition: 'transform 0.4s cubic-bezier(0.2, 0.9, 0.3, 1), filter 0.4s ease',
              cursor: 'pointer'
            }}
          >
            <img
              src={cardBelow1.img}
              alt={cardBelow1.name}
              draggable={false}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block'
              }}
            />
          </div>
        )}

        {/* ========================================================
            ACTIVE TOP CARD (Lands ON TOP with smooth stacking animation)
            ======================================================== */}
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={activeIndex}
            custom={direction}
            variants={{
              // When moving forward: card comes from the right and lands ON TOP
              enter: (dir: 'forward' | 'backward') => ({
                x: dir === 'forward' ? '108%' : '-108%',
                y: -6,
                scale: 1.03,
                rotate: dir === 'forward' ? 2.5 : -2.5,
                opacity: 0.85,
                zIndex: 35
              }),
              center: {
                x: 0,
                y: 0,
                scale: 1,
                rotate: 0,
                opacity: 1,
                zIndex: 30,
                transition: {
                  type: 'spring',
                  stiffness: 270,
                  damping: 26,
                  mass: 0.85
                }
              },
              // When leaving: card stays slightly behind or fades out smoothly
              exit: (dir: 'forward' | 'backward') => ({
                x: dir === 'forward' ? '-18%' : '18%',
                y: 13,
                scale: 0.94,
                opacity: 0.5,
                zIndex: 15,
                transition: {
                  duration: 0.35,
                  ease: [0.32, 0.72, 0, 1]
                }
              })
            }}
            initial="enter"
            animate="center"
            exit="exit"
            drag="x"
            dragDirectionLock
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.45}
            onDragStart={() => {
              isDraggingRef.current = true;
              dragDistanceRef.current = 0;
            }}
            onDrag={(_, info) => {
              dragDistanceRef.current = info.offset.x;
            }}
            onDragEnd={(_, info) => {
              setTimeout(() => {
                isDraggingRef.current = false;
              }, 80);

              const { offset, velocity } = info;
              if (offset.x < -40 || velocity.x < -300) {
                nextCard();
              } else if (offset.x > 40 || velocity.x > 300) {
                prevCard();
              }
            }}
            onClick={() => handleCardClick(currentCard)}
            style={{
              position: 'absolute',
              top: 0,
              width: 'calc(100% - 32px)',
              maxWidth: 378,
              aspectRatio: '2.4 / 1',
              borderRadius: 18,
              overflow: 'hidden',
              cursor: 'grab',
              touchAction: 'pan-y', // Native mobile page scroll remains smooth
              boxShadow: '0 14px 36px rgba(0, 0, 0, 0.75), 0 2px 8px rgba(0, 0, 0, 0.45)',
              backgroundColor: '#1c1c22',
              transformOrigin: 'top center'
            }}
            whileTap={{ cursor: 'grabbing', scale: 0.985 }}
          >
            <img
              src={currentCard.img}
              alt={currentCard.name}
              draggable={false}
              loading="eager"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
                pointerEvents: 'none'
              }}
            />

            {/* Subtle top edge specular highlight for ultra-premium depth */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 1,
                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
                pointerEvents: 'none'
              }}
            />
          </motion.div>
        </AnimatePresence>

        {/* Floating Subtle Left / Right Navigation Tap Targets (Desktop & Tablet) */}
        {count > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevCard();
              }}
              aria-label="Previous card"
              style={{
                position: 'absolute',
                left: 4,
                top: '40%',
                transform: 'translateY(-50%)',
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: 'rgba(20, 20, 26, 0.65)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 40,
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                transition: 'opacity 0.2s',
                opacity: 0.8
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                nextCard();
              }}
              aria-label="Next card"
              style={{
                position: 'absolute',
                right: 4,
                top: '40%',
                transform: 'translateY(-50%)',
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: 'rgba(20, 20, 26, 0.65)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 40,
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                transition: 'opacity 0.2s',
                opacity: 0.8
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Pagination Indicator Dots / Pills */}
      {count > 1 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 5,
            marginTop: 14,
            zIndex: 35
          }}
        >
          {cards.map((_, dotIdx) => {
            const isActive = dotIdx === activeIndex;
            return (
              <div
                key={dotIdx}
                onClick={() => goToCard(dotIdx)}
                style={{
                  width: isActive ? 16 : 5,
                  height: 5,
                  borderRadius: 999,
                  backgroundColor: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.25)',
                  boxShadow: isActive ? '0 1px 6px rgba(255, 255, 255, 0.4)' : 'none',
                  transition: 'all 0.3s cubic-bezier(0.2, 0.9, 0.3, 1)',
                  cursor: 'pointer'
                }}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
