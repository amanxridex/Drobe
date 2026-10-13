'use client';

import React from 'react';

/**
 * Pure code-generated Apple-style geometric concentric gradient background.
 * Rendered using precision SVG vectors matching the luminous cyan/blue curved torus bands.
 * Zero external image dependencies.
 */
export default function AppleGeometricBg() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0
      }}
    >
      <svg
        viewBox="0 0 440 900"
        preserveAspectRatio="xMidYMid slice"
        style={{
          width: '100%',
          height: '100%',
          display: 'block'
        }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Main sky-blue vertical background gradient */}
          <linearGradient id="bgSkyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#9cc5ff" />
            <stop offset="32%" stopColor="#b4d7ff" />
            <stop offset="65%" stopColor="#96beff" />
            <stop offset="100%" stopColor="#75a5f8" />
          </linearGradient>

          {/* Radiant cyan/white glow highlight at upper center */}
          <radialGradient id="luminousGlow" cx="62%" cy="30%" r="55%" fx="62%" fy="30%">
            <stop offset="0%" stopColor="#f0fdff" stopOpacity="0.95" />
            <stop offset="35%" stopColor="#a5f3fc" stopOpacity="0.8" />
            <stop offset="70%" stopColor="#67e8f9" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#9cc5ff" stopOpacity="0" />
          </radialGradient>

          {/* Top-right torus arc gradient */}
          <linearGradient id="arcTopRight" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="45%" stopColor="#0284c7" />
            <stop offset="85%" stopColor="#1d4ed8" />
            <stop offset="100%" stopColor="#1e40af" />
          </linearGradient>

          {/* Center-left large torus arc gradient */}
          <linearGradient id="arcCenterLeft" x1="0%" y1="20%" x2="100%" y2="80%">
            <stop offset="0%" stopColor="#0077ff" />
            <stop offset="40%" stopColor="#2563eb" />
            <stop offset="80%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0ea5e9" />
          </linearGradient>

          {/* Lower-right torus arc gradient */}
          <linearGradient id="arcLowerRight" x1="100%" y1="15%" x2="0%" y2="85%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="35%" stopColor="#0284c7" />
            <stop offset="75%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>

          {/* Bottom-left torus arc gradient */}
          <linearGradient id="arcBottomLeft" x1="0%" y1="50%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="50%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
        </defs>

        {/* Base Gradient Canvas */}
        <rect width="100%" height="100%" fill="url(#bgSkyGradient)" />

        {/* Luminous upper-right cyan sunburst glow */}
        <rect width="100%" height="100%" fill="url(#luminousGlow)" />

        {/* Ring 1: Top-Right Torus */}
        <circle
          cx="290"
          cy="-30"
          r="260"
          stroke="url(#arcTopRight)"
          strokeWidth="86"
          fill="none"
          opacity="0.92"
        />

        {/* Ring 2: Center-Left Dominant Torus */}
        <circle
          cx="-55"
          cy="365"
          r="228"
          stroke="url(#arcCenterLeft)"
          strokeWidth="84"
          fill="none"
          opacity="0.9"
        />

        {/* Ring 3: Lower-Right Dynamic Torus */}
        <circle
          cx="450"
          cy="590"
          r="270"
          stroke="url(#arcLowerRight)"
          strokeWidth="92"
          fill="none"
          opacity="0.92"
        />

        {/* Ring 4: Bottom-Left Grounding Torus */}
        <circle
          cx="-45"
          cy="870"
          r="205"
          stroke="url(#arcBottomLeft)"
          strokeWidth="86"
          fill="none"
          opacity="0.95"
        />

        {/* Subtle delicate concentric accent stroke for Apple-level crisp precision */}
        <circle
          cx="-55"
          cy="365"
          r="270"
          stroke="#e0f2fe"
          strokeWidth="1.5"
          fill="none"
          opacity="0.35"
        />
        <circle
          cx="450"
          cy="590"
          r="316"
          stroke="#e0f2fe"
          strokeWidth="1.5"
          fill="none"
          opacity="0.3"
        />
      </svg>
    </div>
  );
}
