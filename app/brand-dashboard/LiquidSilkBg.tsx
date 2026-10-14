'use client';

import React from 'react';

/**
 * Pure code-generated Liquid Silk Crimson Aurora Background.
 * Faithfully matches luxury red fluid silk wave ripples with tactile film grain.
 * Zero external image dependencies.
 */
export default function LiquidSilkBg() {
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
      {/* 1. Master Fluid Vector Aurora Canvas */}
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
          {/* Seamless Gaussian Blurs with boundless canvas margins */}
          <filter id="ultraSilkBlur" filterUnits="userSpaceOnUse" x="-300" y="-300" width="1040" height="1500">
            <feGaussianBlur stdDeviation="60" />
          </filter>
          <filter id="meshBlur" filterUnits="userSpaceOnUse" x="-300" y="-300" width="1040" height="1500">
            <feGaussianBlur stdDeviation="44" />
          </filter>
          <filter id="foldBlur" filterUnits="userSpaceOnUse" x="-300" y="-300" width="1040" height="1500">
            <feGaussianBlur stdDeviation="28" />
          </filter>
          <filter id="creaseBlur" filterUnits="userSpaceOnUse" x="-300" y="-300" width="1040" height="1500">
            <feGaussianBlur stdDeviation="16" />
          </filter>
          <filter id="highlightBlur" filterUnits="userSpaceOnUse" x="-300" y="-300" width="1040" height="1500">
            <feGaussianBlur stdDeviation="9" />
          </filter>

          {/* Master Vertical Canvas Gradient */}
          <linearGradient id="bgCanvas" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="9%" stopColor="#ffb8c6" />
            <stop offset="22%" stopColor="#ff2e4c" />
            <stop offset="48%" stopColor="#ff0a2e" />
            <stop offset="76%" stopColor="#ff2444" />
            <stop offset="100%" stopColor="#c9001f" />
          </linearGradient>

          {/* Deep Red Crease Gradient */}
          <linearGradient id="creaseGrad" x1="0%" y1="0%" x2="100%" y2="60%">
            <stop offset="0%" stopColor="#ad0017" />
            <stop offset="35%" stopColor="#db0020" />
            <stop offset="70%" stopColor="#ff0f33" />
            <stop offset="100%" stopColor="#ff3b56" />
          </linearGradient>

          {/* Central White Silk Light */}
          <radialGradient id="midWhiteSwell" cx="28%" cy="44%" r="55%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="35%" stopColor="#ffe6eb" stopOpacity="0.9" />
            <stop offset="70%" stopColor="#ff758f" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#ff0a2e" stopOpacity="0" />
          </radialGradient>

          {/* Lower Silk Highlight Gradient */}
          <linearGradient id="silkHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="40%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="75%" stopColor="#ffccd5" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ff1a3c" stopOpacity="0.15" />
          </linearGradient>
        </defs>

        {/* 1. Background Vertical Canvas */}
        <rect width="440" height="900" fill="url(#bgCanvas)" />

        {/* 2. Soft Top Light (White/Blush mist) */}
        <ellipse cx="220" cy="70" rx="300" ry="85" fill="#ffffff" filter="url(#ultraSilkBlur)" opacity="0.8" />
        <ellipse cx="140" cy="140" rx="240" ry="110" fill="#ffa8b8" filter="url(#meshBlur)" opacity="0.75" />

        {/* 3. Upper S-Curved Deep Crimson Silk Fold (y: 190 - 330) */}
        {/* Shadow valley behind crease */}
        <path
          d="M-60,210 C70,170 170,260 290,240 C380,225 440,270 500,310 L500,390 C430,350 350,310 250,320 C140,330 30,280 -60,300 Z"
          fill="#8a0012"
          filter="url(#foldBlur)"
          opacity="0.92"
        />

        {/* The sweeping deep red crest roll */}
        <path
          d="M-50,215 C75,175 185,248 295,235 C380,222 445,265 510,310"
          fill="none"
          stroke="url(#creaseGrad)"
          strokeWidth="85"
          filter="url(#meshBlur)"
          opacity="0.98"
        />

        {/* Sharp fold lip */}
        <path
          d="M10,205 C110,205 210,245 315,235 C380,230 440,260 495,305"
          fill="none"
          stroke="#e60021"
          strokeWidth="36"
          filter="url(#creaseBlur)"
          opacity="0.92"
        />

        {/* Deep shadow accent in dip */}
        <path
          d="M100,220 Q210,250 330,245"
          fill="none"
          stroke="#7a0010"
          strokeWidth="22"
          filter="url(#creaseBlur)"
          opacity="0.85"
        />

        {/* 4. Central Luminous Silk Expanse (y: 360 - 520) */}
        <ellipse cx="160" cy="450" rx="280" ry="150" fill="url(#midWhiteSwell)" filter="url(#ultraSilkBlur)" opacity="0.98" />
        <ellipse cx="110" cy="460" rx="170" ry="90" fill="#ffffff" filter="url(#foldBlur)" opacity="0.85" />

        {/* 5. Right Flank: Scarlet Fold Sweep (y: 420 - 620) */}
        <path
          d="M280,330 C370,370 470,450 470,560 C470,660 380,730 270,760 L510,760 L510,330 Z"
          fill="#cc001c"
          filter="url(#meshBlur)"
          opacity="0.9"
        />

        {/* 6. Lower Flowing Silk Wave: The Signature White Highlight (y: 560 - 740) */}
        {/* Ambient wide glow backing */}
        <path
          d="M-60,710 C45,665 145,555 255,565 C340,575 395,640 490,735"
          fill="none"
          stroke="url(#silkHighlight)"
          strokeWidth="145"
          filter="url(#ultraSilkBlur)"
          opacity="0.9"
        />

        {/* Main flowing white silk ribbon */}
        <path
          d="M-40,695 C55,655 150,560 252,568 C330,576 390,635 480,725"
          fill="none"
          stroke="#ffffff"
          strokeWidth="70"
          filter="url(#foldBlur)"
          opacity="0.98"
        />

        {/* Luminous crest edge */}
        <path
          d="M-30,688 C60,650 155,563 250,570 C325,576 385,630 470,718"
          fill="none"
          stroke="#ffffff"
          strokeWidth="28"
          filter="url(#creaseBlur)"
          opacity="1"
        />

        {/* Core specular hairline ribbon */}
        <path
          d="M-20,682 C65,645 157,565 248,572 C320,577 380,627 460,712"
          fill="none"
          stroke="#ffffff"
          strokeWidth="10"
          filter="url(#highlightBlur)"
          opacity="0.95"
        />

        {/* 7. Bottom Left Luminous Swell (y: 720 - 830) */}
        <ellipse cx="60" cy="745" rx="150" ry="80" fill="#ffffff" filter="url(#foldBlur)" opacity="0.75" />
        <ellipse cx="80" cy="755" rx="210" ry="110" fill="#ffa8b8" filter="url(#meshBlur)" opacity="0.7" />

        {/* 8. Bottom Ruby/Crimson Basin Pool (y: 790 - 900) */}
        <path
          d="M-60,810 Q160,780 320,820 T510,800 L510,920 L-60,920 Z"
          fill="#9e0015"
          filter="url(#foldBlur)"
          opacity="0.9"
        />
        <path
          d="M-40,850 Q180,825 340,855 T490,840 L490,920 L-40,920 Z"
          fill="#ff0026"
          filter="url(#meshBlur)"
          opacity="0.98"
        />
      </svg>

      {/* 2. Tactile Film Grain Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.22,
          mixBlendMode: 'overlay',
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
          pointerEvents: 'none'
        }}
      />
    </div>
  );
}
