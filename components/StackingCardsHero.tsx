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

  // Real-time finger swipe state
  const [dragOffset, setDragOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);
  const isHorizontalSwipeRef = useRef<boolean | null>(null);
  const hasMovedRef = useRef(false);

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
    if (isPaused || count <= 1 || isSwiping) return;
    const timer = setInterval(() => {
      nextCard();
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [isPaused, count, autoPlayInterval, isSwiping, nextCard]);

  // Handle clicking on the top card to navigate
  const handleCardClick = (card: StackingCardItem) => {
    if (hasMovedRef.current || Math.abs(dragOffset) > 8) return;
    const destination = card.name
      ? `/brand/${slugify(card.name)}`
      : card.deeplink || '/categories';
    router.push(destination);
  };

  // ========================================================
  // NATIVE TOUCH SWIPE HANDLERS (Fingers on mobile)
  // ========================================================
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
    isHorizontalSwipeRef.current = null;
    hasMovedRef.current = false;
    setIsSwiping(true);
    setDragOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - touchStartXRef.current;
    const dy = e.touches[0].clientY - touchStartYRef.current;

    // Detect horizontal vs vertical intent early (after 6px move)
    if (isHorizontalSwipeRef.current === null) {
      if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
        isHorizontalSwipeRef.current = Math.abs(dx) > Math.abs(dy);
      }
    }

    if (isHorizontalSwipeRef.current) {
      // Horizontal swipe active: cancel vertical scroll jitter
      if (e.cancelable) {
        e.preventDefault();
      }
      hasMovedRef.current = true;
      // Slight resistance damping when pulling beyond boundaries
      setDragOffset(dx);
    }
  };

  const handleTouchEnd = () => {
    setIsSwiping(false);
    if (isHorizontalSwipeRef.current && hasMovedRef.current) {
      if (dragOffset < -42) {
        // Swiped left -> next card
        nextCard();
      } else if (dragOffset > 42) {
        // Swiped right -> previous card
        prevCard();
      }
    }
    setDragOffset(0);
    isHorizontalSwipeRef.current = null;
    setTimeout(() => {
      hasMovedRef.current = false;
      setIsPaused(false);
    }, 2800);
  };

  // ========================================================
  // MOUSE DRAG HANDLERS (For desktop pair-programming testing)
  // ========================================================
  const mouseStartXRef = useRef(0);
  const isMouseDownRef = useRef(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    isMouseDownRef.current = true;
    mouseStartXRef.current = e.clientX;
    hasMovedRef.current = false;
    setIsSwiping(true);
    setDragOffset(0);
    setIsPaused(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDownRef.current) return;
    const dx = e.clientX - mouseStartXRef.current;
    if (Math.abs(dx) > 6) {
      hasMovedRef.current = true;
      setDragOffset(dx);
    }
  };

  const handleMouseUp = () => {
    if (!isMouseDownRef.current) return;
    isMouseDownRef.current = false;
    setIsSwiping(false);
    if (hasMovedRef.current) {
      if (dragOffset < -42) {
        nextCard();
      } else if (dragOffset > 42) {
        prevCard();
      }
    }
    setDragOffset(0);
    setTimeout(() => {
      hasMovedRef.current = false;
      setIsPaused(false);
    }, 2800);
  };

  if (!cards || count === 0) return null;

  // Stack Depth indices
  const depth1Index = (activeIndex - 1 + count) % count;
  const depth2Index = (activeIndex - 2 + count) % count;

  const currentCard = cards[activeIndex];
  const cardBelow1 = count > 1 ? cards[depth1Index] : null;
  const cardBelow2 = count > 2 ? cards[depth2Index] : null;

  return (
    <section
      style={{
        width: '100%',
        padding: '4px 0 2px',
        position: 'relative',
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        overflow: 'hidden'
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => {
        if (!isMouseDownRef.current) setIsPaused(false);
      }}
    >
      {/* Deck Viewport Container */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          width: '100%',
          maxWidth: 410,
          padding: '0 16px',
          boxSizing: 'border-box',
          position: 'relative',
          height: 168, // Gives room for the stacked cards peeking below with tight bottom space
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          cursor: isSwiping ? 'grabbing' : 'grab',
          touchAction: 'pan-y'
        }}
      >
        {/* ========================================================
            DEPTH 2 CARD (Bottom-most peek in stack)
            Smoothly scales & brightens with spring physics
            ======================================================== */}
        {cardBelow2 && (
          <motion.div
            key={`depth2-${depth2Index}`}
            animate={{
              y: 22,
              scale: 0.88,
              opacity: 0.85,
              filter: 'brightness(0.40)'
            }}
            transition={{
              type: 'spring',
              stiffness: 280,
              damping: 28,
              mass: 0.85
            }}
            style={{
              position: 'absolute',
              top: 0,
              width: 'calc(100% - 32px)',
              maxWidth: 378,
              aspectRatio: '2.4 / 1',
              borderRadius: 18,
              overflow: 'hidden',
              transformOrigin: 'top center',
              zIndex: 10,
              boxShadow: '0 6px 18px rgba(0, 0, 0, 0.45)',
              backgroundColor: '#16161c',
              pointerEvents: 'none'
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
          </motion.div>
        )}

        {/* ========================================================
            DEPTH 1 CARD (Directly below active card, peeking out)
            Responsive to top card drag offset!
            ======================================================== */}
        {cardBelow1 && (
          <motion.div
            key={`depth1-${depth1Index}`}
            animate={{
              y: isSwiping ? 12 - Math.min(Math.abs(dragOffset) * 0.08, 6) : 12,
              scale: isSwiping ? 0.94 + Math.min(Math.abs(dragOffset) * 0.0008, 0.03) : 0.94,
              opacity: 1,
              filter: isSwiping ? `brightness(${0.65 + Math.min(Math.abs(dragOffset) * 0.003, 0.25)})` : 'brightness(0.65)'
            }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 28,
              mass: 0.8
            }}
            style={{
              position: 'absolute',
              top: 0,
              width: 'calc(100% - 32px)',
              maxWidth: 378,
              aspectRatio: '2.4 / 1',
              borderRadius: 18,
              overflow: 'hidden',
              transformOrigin: 'top center',
              zIndex: 20,
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.55)',
              backgroundColor: '#1a1a22',
              pointerEvents: 'none'
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
          </motion.div>
        )}

        {/* ========================================================
            ACTIVE TOP CARD (Lands ON TOP with smooth stacking animation)
            Tracks finger in real time during swipe
            ======================================================== */}
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={activeIndex}
            custom={direction}
            variants={{
              // When moving forward: new card comes from the right and lands cleanly ON TOP
              enter: (dir: 'forward' | 'backward') => ({
                x: dir === 'forward' ? '102%' : '-102%',
                y: 0,
                scale: 1,
                rotate: 0,
                opacity: 1,
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
                  stiffness: 280,
                  damping: 28,
                  mass: 0.8
                }
              },
              // When leaving forward: top card remains completely centered (x: 0) and smoothly recedes to depth 1 with zero leftward slide
              exit: (dir: 'forward' | 'backward') => ({
                x: dir === 'forward' ? 0 : '102%',
                y: dir === 'forward' ? 12 : 0,
                scale: dir === 'forward' ? 0.94 : 1,
                rotate: 0,
                opacity: dir === 'forward' ? 1 : 0,
                zIndex: 22,
                transition: {
                  type: 'spring',
                  stiffness: 280,
                  damping: 28,
                  mass: 0.8
                }
              })
            }}
            initial="enter"
            animate="center"
            exit="exit"
            onClick={() => handleCardClick(currentCard)}
            style={{
              position: 'absolute',
              top: 0,
              width: 'calc(100% - 32px)',
              maxWidth: 378,
              aspectRatio: '2.4 / 1',
              borderRadius: 18,
              overflow: 'hidden',
              cursor: isSwiping ? 'grabbing' : 'grab',
              boxShadow: '0 12px 32px rgba(0, 0, 0, 0.72), 0 2px 8px rgba(0, 0, 0, 0.45)',
              backgroundColor: '#1c1c24',
              transformOrigin: 'top center',
              // Apply real-time finger drag offset smoothly
              transform: isSwiping && dragOffset !== 0
                ? `translate3d(${dragOffset}px, 0, 0) rotate(${dragOffset * 0.03}deg)`
                : undefined
            }}
            whileTap={{ scale: 0.985 }}
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
                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.35), transparent)',
                pointerEvents: 'none'
              }}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
