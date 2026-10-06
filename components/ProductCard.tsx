'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Product } from '@/data/catalog';

interface ProductCardProps {
  product: Product;
  isWishlisted: boolean;
  onToggleWishlist: () => void;
  onClick: () => void;
  style?: React.CSSProperties;
  className?: string;
  imageAspectRatio?: string;
}

export default function ProductCard({
  product,
  isWishlisted,
  onToggleWishlist,
  onClick,
  style,
  className,
  imageAspectRatio = '1 / 1.25'
}: ProductCardProps) {
  const [popping, setPopping] = useState(false);

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setPopping(true);
    onToggleWishlist();
    setTimeout(() => setPopping(false), 500);
  };

  return (
    <div
      onClick={onClick}
      className={className}
      style={{
        background: '#232323',
        borderRadius: 16,
        overflow: 'hidden',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
        ...style
      }}
    >
      {/* Product Image Area */}
      <div
        style={{
          width: '100%',
          aspectRatio: imageAspectRatio,
          position: 'relative',
          background: '#1a1a1a',
          overflow: 'hidden',
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16
        }}
      >
        <img
          src={product.thumbnail || product.images?.[0] || '/assets/real/test_dl/sample_product.webp'}
          alt={product.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block'
          }}
          loading="lazy"
        />

        {/* Top-Left: TRY 'n BUY Pill Badge */}
        {product.tryAndBuyEligible !== false && (
          <div
            style={{
              position: 'absolute',
              top: 10,
              left: 10,
              background: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              padding: '3px 8px',
              borderRadius: 9999,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 2,
              zIndex: 2,
              userSelect: 'none',
              boxShadow: '0 1px 4px rgba(0,0,0,0.3)'
            }}
          >
            <span
              style={{
                color: '#5D71F9',
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: '0.02em',
                lineHeight: 1
              }}
            >
              TRY
            </span>
            <span
              style={{
                color: '#ffffff',
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: '0.02em',
                lineHeight: 1
              }}
            >
              &apos;n BUY
            </span>
          </div>
        )}

        {/* Top-Right: Pure Clean Outline Heart */}
        <motion.button
          onClick={handleHeartClick}
          whileTap={{ scale: 0.8 }}
          animate={popping ? { scale: [1, 1.35, 1] } : { scale: 1 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            zIndex: 3,
            background: 'none',
            border: 'none',
            padding: 4,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          aria-label="Wishlist"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill={isWishlisted ? '#ff2a85' : 'none'}
            stroke={isWishlisted ? '#ff2a85' : '#ffffff'}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              filter: 'drop-shadow(0 1px 3px rgba(0, 0, 0, 0.65))',
              transition: 'all 0.2s ease'
            }}
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </motion.button>

        {/* Bottom Carousel Indicator Dots */}
        <div
          style={{
            position: 'absolute',
            bottom: 8,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 5,
            zIndex: 2,
            pointerEvents: 'none'
          }}
        >
          {/* Active pill dot */}
          <div
            style={{
              width: 18,
              height: 4,
              borderRadius: 2,
              background: '#ffffff',
              boxShadow: '0 1px 2px rgba(0,0,0,0.3)'
            }}
          />
          {/* Inactive circular dots */}
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                width: 4,
                height: 4,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.45)',
                boxShadow: '0 1px 2px rgba(0,0,0,0.3)'
              }}
            />
          ))}
        </div>
      </div>

      {/* Product Details Section */}
      <div
        style={{
          padding: '12px 12px 14px 12px',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Brand Name */}
        <h3
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: '#ffffff',
            margin: 0,
            lineHeight: 1.25,
            letterSpacing: '-0.01em'
          }}
        >
          {product.brand}
        </h3>

        {/* Product Title / Description - 1 line truncated */}
        <p
          style={{
            fontSize: 13,
            fontWeight: 400,
            color: '#9e9e9e',
            margin: 0,
            marginTop: 3,
            lineHeight: 1.3,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
          title={product.title}
        >
          {product.title}
        </p>

        {/* Clean Bold Price */}
        <div
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: '#ffffff',
            marginTop: 6,
            lineHeight: 1.2
          }}
        >
          ₹{product.price.toLocaleString('en-IN')}
        </div>

        {/* 60 mins delivery row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            marginTop: 9
          }}
        >
          <svg
            width="12"
            height="13"
            viewBox="0 0 16 16"
            fill="#00d26a"
            style={{ flexShrink: 0 }}
          >
            <path d="M9.5 0L2 9.5H8L6.5 16L14 6.5H8L9.5 0Z" />
          </svg>
          <span
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: '#ffffff',
              lineHeight: 1
            }}
          >
            {product.deliveryMinutes || 60} mins delivery
          </span>
        </div>
      </div>
    </div>
  );
}
