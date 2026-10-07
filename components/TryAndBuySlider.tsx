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
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="#38bdf8"
              xmlns="http://www.w3.org/2000/svg"
              style={{ pointerEvents: 'none' }}
            >
              <path d="M21.2341 8.0065L18.8272 4.84474C18.2661 4.30037 17.5073 4 16.69 4H14.8834C14.3817 4 13.9757 4.38535 13.9757 4.86157C13.9757 5.8544 13.1248 6.66212 12.0788 6.66212C11.0328 6.66212 10.1818 5.8544 10.1818 4.86157C10.1818 4.38535 9.77583 4 9.27411 4H7.4587C6.6423 4 5.88351 4.29953 5.32772 4.83801L2.76593 8.0065C2.41136 8.34305 2.41136 8.88827 2.76593 9.22482L5.67963 11.1126V19.1384C5.67963 19.6146 6.08562 20 6.58734 20H17.5613C18.0631 20 18.4691 19.6146 18.4691 19.1384L18.501 11.1126L21.2341 9.22482C21.5886 8.88827 21.5886 8.34305 21.2341 8.0065Z" />
            </svg>
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
