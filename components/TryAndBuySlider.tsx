'use client';

import React, { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

interface TryAndBuySliderProps {
  onBuyNow: () => void;
  onAddToBag: () => void;
}

export default function TryAndBuySlider({ onBuyNow, onAddToBag }: TryAndBuySliderProps) {
  const [dragState, setDragState] = useState<'idle' | 'buy' | 'add'>('idle');
  const x = useMotionValue(0);

  // Background gradient/opacity shift based on drag direction
  const leftColor = useTransform(x, [-80, 0], ['#ff2a85', '#ffffff']);
  const rightColor = useTransform(x, [0, 80], ['#ffffff', '#10b981']);

  const handleDragEnd = (_: any, info: any) => {
    const offset = info.offset.x;
    if (offset < -60) {
      setDragState('buy');
      onBuyNow();
    } else if (offset > 60) {
      setDragState('add');
      onAddToBag();
    }
    setDragState('idle');
  };

  return (
    <div
      style={{
        position: 'sticky',
        bottom: 12,
        padding: '0 12px',
        zIndex: 50,
        userSelect: 'none'
      }}
    >
      <div
        style={{
          background: '#1d1d23',
          border: '1px solid #32323c',
          borderRadius: 36,
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          boxShadow: '0 12px 35px rgba(0,0,0,0.85)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* BUY NOW Button on Left */}
        <motion.div
          onClick={onBuyNow}
          whileTap={{ scale: 0.95 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            cursor: 'pointer',
            zIndex: 2,
            padding: '8px 0'
          }}
        >
          <motion.span
            style={{
              fontSize: 13,
              fontWeight: 800,
              letterSpacing: '0.04em',
              color: leftColor
            }}
          >
            BUY NOW
          </motion.span>
          <span style={{ color: '#888898', fontWeight: 900, fontSize: 13 }}>&lt;&lt;&lt;</span>
        </motion.div>

        {/* Center Draggable Knob with Folded T-shirt */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            pointerEvents: 'none',
            zIndex: 3
          }}
        >
          <motion.div
            drag="x"
            dragConstraints={{ left: -100, right: 100 }}
            dragElastic={0.2}
            dragSnapToOrigin={true}
            onDragEnd={handleDragEnd}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            style={{
              x,
              width: 50,
              height: 50,
              borderRadius: '50%',
              background: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
              cursor: 'grab',
              pointerEvents: 'auto',
              border: '2px solid rgba(255,255,255,0.8)'
            }}
          >
            <img
              src="/assets/icons/t_shirt.svg"
              alt="Folded T-Shirt"
              style={{ width: 24, height: 24, pointerEvents: 'none' }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/assets/icons/bag_outline.svg';
              }}
            />
          </motion.div>
        </div>

        {/* ADD TO BAG Button on Right */}
        <motion.div
          onClick={onAddToBag}
          whileTap={{ scale: 0.95 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            cursor: 'pointer',
            zIndex: 2,
            padding: '8px 0'
          }}
        >
          <span style={{ color: '#888898', fontWeight: 900, fontSize: 13 }}>&gt;&gt;&gt;</span>
          <motion.span
            style={{
              fontSize: 13,
              fontWeight: 800,
              letterSpacing: '0.04em',
              color: rightColor
            }}
          >
            ADD TO BAG
          </motion.span>
        </motion.div>
      </div>
    </div>
  );
}
