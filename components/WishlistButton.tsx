'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WishlistButtonProps {
  isWishlisted: boolean;
  onToggle: () => void;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export default function WishlistButton({
  isWishlisted,
  onToggle,
  size = 22,
  style
}: WishlistButtonProps) {
  const [popping, setPopping] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setPopping(true);
    onToggle();
    setTimeout(() => setPopping(false), 600);
  };

  return (
    <button
      onClick={handleClick}
      style={{
        background: 'none',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        ...style
      }}
      aria-label="Wishlist"
    >
      <motion.div
        animate={popping ? { scale: [1, 1.35, 0.9, 1.15, 1], rotate: [0, -12, 12, -4, 0] } : { scale: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <img
          src={isWishlisted ? '/assets/icons/heart_filled.svg' : '/assets/icons/heart_outline.svg'}
          alt="Wishlist"
          style={{
            width: size,
            height: size,
            filter: isWishlisted ? 'drop-shadow(0 2px 8px rgba(255, 42, 133, 0.5))' : 'none',
            transition: 'filter 0.2s ease'
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/assets/real/heart_outline.svg';
          }}
        />
      </motion.div>

      {/* Heart Burst Particle Effect on Wishlist Pop */}
      <AnimatePresence>
        {popping && isWishlisted && (
          <motion.div
            initial={{ opacity: 1, scale: 0.5 }}
            animate={{ opacity: 0, scale: 1.8 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
            style={{
              position: 'absolute',
              width: size * 1.5,
              height: size * 1.5,
              borderRadius: '50%',
              border: '2px solid #ff2a85',
              pointerEvents: 'none'
            }}
          />
        )}
      </AnimatePresence>
    </button>
  );
}
