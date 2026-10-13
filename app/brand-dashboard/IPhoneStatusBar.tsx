'use client';

import React from 'react';

export default function IPhoneStatusBar({ dark = false }: { dark?: boolean }) {
  const textColor = dark ? '#ffffff' : '#000000';

  return (
    <div
      style={{
        height: '44px',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'relative',
        zIndex: 50,
        flexShrink: 0,
        userSelect: 'none'
      }}
    >
      {/* Left Time */}
      <span
        style={{
          fontSize: '14px',
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color: textColor,
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif'
        }}
      >
        9:41
      </span>

      {/* Center Dynamic Island */}
      <div
        style={{
          width: '92px',
          height: '25px',
          backgroundColor: '#000000',
          borderRadius: '16px',
          position: 'absolute',
          left: '50%',
          top: '9px',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingRight: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
        }}
      >
        {/* Subtle camera lens dot */}
        <div
          style={{
            width: '9px',
            height: '9px',
            borderRadius: '50%',
            backgroundColor: '#111827',
            border: '1px solid #1f2937'
          }}
        />
      </div>

      {/* Right Icons: Signal, Wifi, Battery */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        {/* Signal Bars */}
        <svg width="15" height="11" viewBox="0 0 17 11" fill="none">
          <rect x="0.5" y="8" width="2.5" height="3" rx="0.75" fill={textColor} />
          <rect x="4.5" y="5.5" width="2.5" height="5.5" rx="0.75" fill={textColor} />
          <rect x="8.5" y="3" width="2.5" height="8" rx="0.75" fill={textColor} />
          <rect x="12.5" y="0.5" width="2.5" height="10.5" rx="0.75" fill={textColor} />
        </svg>

        {/* WiFi Icon */}
        <svg width="14" height="11" viewBox="0 0 15 11" fill="none">
          <path
            d="M7.5 10.5C8.05228 10.5 8.5 10.0523 8.5 9.5C8.5 8.94772 8.05228 8.5 7.5 8.5C6.94772 8.5 6.5 8.94772 6.5 9.5C6.5 10.0523 6.94772 10.5 7.5 10.5Z"
            fill={textColor}
          />
          <path
            d="M4.3 6.3C5.2 5.4 6.3 5 7.5 5C8.7 5 9.8 5.4 10.7 6.3"
            stroke={textColor}
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <path
            d="M1.5 3.5C3.1 1.9 5.2 1 7.5 1C9.8 1 11.9 1.9 13.5 3.5"
            stroke={textColor}
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>

        {/* Battery Icon */}
        <div
          style={{
            width: '22px',
            height: '11px',
            borderRadius: '3.5px',
            border: `1px solid ${textColor}`,
            padding: '1.5px',
            display: 'flex',
            alignItems: 'center',
            position: 'relative'
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: textColor,
              borderRadius: '1.5px'
            }}
          />
          <div
            style={{
              position: 'absolute',
              right: '-3px',
              top: '3px',
              width: '1.5px',
              height: '4px',
              borderRadius: '0 1px 1px 0',
              backgroundColor: textColor
            }}
          />
        </div>
      </div>
    </div>
  );
}
