'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';

export default function LocationModal() {
  const { isLocationOpen, setIsLocationOpen, location, setLocation } = useApp();
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState<string | null>(null);

  if (!isLocationOpen) return null;

  const popularLocations = [
    { name: 'Shreepal Complex, Suren Rd, Mumbai', area: 'Andheri East, Mumbai - 400093', eta: '60 mins' },
    { name: 'Bandra Linking Road, Mumbai', area: 'Bandra West, Mumbai - 400050', eta: '60 mins' },
    { name: 'Juhu Tara Road, Mumbai', area: 'Juhu, Mumbai - 400049', eta: '60 mins' },
    { name: 'Koramangala 4th Block, Bangalore', area: 'Koramangala, Bangalore - 560034', eta: '60 mins' },
    { name: 'Indiranagar 100ft Road, Bangalore', area: 'Indiranagar, Bangalore - 560038', eta: '60 mins' },
    { name: 'Vesu Main Road, Surat', area: 'Vesu, Surat - 395007', eta: '60 mins' }
  ];

  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincode === '400093' || pincode === '400050' || pincode === '560034' || pincode === '395007') {
      setPincodeStatus('⚡ Lightning 60-Min delivery available in this area!');
    } else if (pincode.length === 6) {
      setPincodeStatus('⚡ 60-Min Express delivery active for pincode ' + pincode);
    } else {
      setPincodeStatus('Please enter a valid 6-digit pincode');
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 100,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        overflow: 'hidden'
      }}
      onClick={() => setIsLocationOpen(false)}
    >
      <div
        className="animate-slide-up"
        style={{
          background: '#191920',
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          border: '1px solid #2e2e3a',
          maxHeight: '85vh',
          overflowY: 'auto',
          padding: '20px 20px 32px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>Select Delivery Location</h3>
            <p style={{ fontSize: 12, color: '#888', marginTop: 2 }}>We guarantee 60-minute delivery to serviceable areas</p>
          </div>
          <button
            onClick={() => setIsLocationOpen(false)}
            style={{
              background: '#252530',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <img src="/assets/icons/cross_close.svg" alt="Close" style={{ width: 14, height: 14 }} />
          </button>
        </div>

        {/* GPS Button */}
        <button
          onClick={() => {
            setLocation('Shreepal Complex, Suren Rd, Mumbai');
            setIsLocationOpen(false);
          }}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, rgba(102,120,255,0.15) 0%, rgba(139,92,246,0.15) 100%)',
            border: '1px solid rgba(102,120,255,0.3)',
            borderRadius: 16,
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            color: '#fff',
            cursor: 'pointer',
            marginBottom: 16
          }}
        >
          <div
            style={{
              background: '#6678ff',
              borderRadius: '50%',
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <img src="/assets/icons/current_location.svg" alt="" style={{ width: 18, height: 18, filter: 'brightness(0) invert(1)' }} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#6678ff' }}>Use Current GPS Location</div>
            <div style={{ fontSize: 11, color: '#aaa' }}>Auto-detect via device coordinates</div>
          </div>
        </button>

        {/* Pincode Input */}
        <form onSubmit={handleCheckPincode} style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <input
            type="text"
            placeholder="Enter 6-digit Pincode (e.g. 400093)"
            value={pincode}
            maxLength={6}
            onChange={(e) => {
              setPincode(e.target.value);
              setPincodeStatus(null);
            }}
            style={{
              flex: 1,
              background: '#22222c',
              border: '1px solid #363644',
              borderRadius: 12,
              padding: '10px 14px',
              color: '#fff',
              fontSize: 13,
              outline: 'none'
            }}
          />
          <button
            type="submit"
            style={{
              background: '#6678ff',
              border: 'none',
              borderRadius: 12,
              padding: '0 16px',
              color: '#fff',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Check
          </button>
        </form>

        {pincodeStatus && (
          <div
            style={{
              background: pincodeStatus.includes('⚡') ? '#0f382c' : '#3d1a1a',
              color: pincodeStatus.includes('⚡') ? '#34d399' : '#ff7777',
              borderRadius: 10,
              padding: '8px 12px',
              fontSize: 12,
              fontWeight: 700,
              marginBottom: 16
            }}
          >
            {pincodeStatus}
          </div>
        )}

        {/* Popular Locations */}
        <div style={{ fontSize: 11, fontWeight: 800, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
          Serviceable Delivery Hubs
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {popularLocations.map((loc) => {
            const isSelected = location.includes(loc.name.split(',')[0]);
            return (
              <div
                key={loc.name}
                onClick={() => {
                  setLocation(loc.name);
                  setIsLocationOpen(false);
                }}
                style={{
                  background: isSelected ? 'rgba(102,120,255,0.1)' : '#202029',
                  border: isSelected ? '1px solid #6678ff' : '1px solid #2d2d3a',
                  borderRadius: 14,
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <img src="/assets/icons/pin_marker_outline_v3.svg" alt="" style={{ width: 16, height: 16, opacity: 0.8 }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{loc.name}</div>
                    <div style={{ fontSize: 11, color: '#888', marginTop: 1 }}>{loc.area}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: '#38bdf8' }}>⚡ {loc.eta}</span>
                  {isSelected && <img src="/assets/icons/check.svg" alt="" style={{ width: 14, height: 14, filter: 'invert(54%) sepia(85%) saturate(2371%) hue-rotate(210deg)' }} />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
